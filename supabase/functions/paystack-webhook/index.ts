// =====================================================================
// My_Fix Edge Function — Paystack Webhook Handler
// Environment: Deno Serverless (TypeScript)
// =====================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

serve(async (req) => {
    // 1. Only allow POST requests
    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    try {
        // 2. Read the request body as text (needed for signature verification)
        const bodyText = await req.text();
        
        // 3. Extract the signature header sent by Paystack
        const signature = req.headers.get("x-paystack-signature");
        if (!signature) {
            return new Response("Missing Signature Header", { status: 400 });
        }

        // 4. Verify HMAC-SHA512 Signature natively using Web Crypto API
        const keyBuf = new TextEncoder().encode(PAYSTACK_SECRET_KEY);
        const bodyBuf = new TextEncoder().encode(bodyText);

        const cryptoKey = await crypto.subtle.importKey(
            "raw",
            keyBuf,
            { name: "HMAC", hash: "SHA-512" },
            false,
            ["sign"]
        );

        const signatureBuf = await crypto.subtle.sign(
            "HMAC",
            cryptoKey,
            bodyBuf
        );

        const expectedSignature = Array.from(new Uint8Array(signatureBuf))
            .map(b => b.toString(16).padStart(2, "0"))
            .join("");

        if (signature !== expectedSignature) {
            console.error("⚠️ HMAC Signature verification failed!");
            return new Response("Unauthorized", { status: 401 });
        }

        // 5. Parse the webhook payload
        const payload = JSON.parse(bodyText);
        const event = payload.event;
        const data = payload.data;

        console.log(`📩 Received Paystack Webhook Event: ${event}`);

        // 6. Handle successful charge event
        if (event === "charge.success") {
            const amountKobo = data.amount; // Paystack works in Kobo/cents
            const amountNaira = amountKobo / 100;
            const reference = data.reference;
            
            // Extract custom metadata passed during Paystack checkout initialization
            const bookingId = data.metadata?.booking_id;

            if (!bookingId) {
                console.error("❌ Webhook missing booking_id in custom metadata");
                return new Response("Missing Booking Metadata", { status: 400 });
            }

            console.log(`💸 Charge success! Booking: ${bookingId}, Amount: ₦${amountNaira}, Ref: ${reference}`);

            // Initialize high-privilege Supabase client (bypasses RLS to update escrow records)
            const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

            // 7. Retrieve the booking price from the database to prevent price exploitation
            const { data: booking, error: fetchError } = await supabaseAdmin
                .from("bookings")
                .select("price")
                .eq("id", bookingId)
                .single();

            if (fetchError || !booking) {
                console.error(`❌ Webhook failed to retrieve booking ${bookingId} for validation:`, fetchError);
                return new Response("Booking Not Found", { status: 404 });
            }

            const expectedAmountNaira = Number(booking.price);
            if (amountNaira !== expectedAmountNaira) {
                console.error(`⚠️ SECURITY ALERT: Price exploitation attempt! Booking: ${bookingId}. Paid: ₦${amountNaira}, Expected: ₦${expectedAmountNaira}`);
                return new Response("Security Validation Failed: Price Mismatch", { status: 400 });
            }

            // 8. Update booking escrow state in database since payment matches exactly
            const { error: updateError } = await supabaseAdmin
                .from("bookings")
                .update({ 
                    status: "paid",
                    escrow_status: "held"
                })
                .eq("id", bookingId);

            if (updateError) {
                console.error("❌ Failed to update booking status in database:", updateError);
                return new Response("Database Update Error", { status: 500 });
            }

            console.log(`✅ Escrow payment successfully verified and locked for booking ${bookingId}`);
        }

        // 8. Respond to Paystack with a 200 OK within their 2-second timeout window
        return new Response(JSON.stringify({ received: true }), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        });

    } catch (err) {
        console.error("❌ Webhook processing crashed:", err);
        return new Response(`Server Error: ${err.message}`, { status: 500 });
    }
});
