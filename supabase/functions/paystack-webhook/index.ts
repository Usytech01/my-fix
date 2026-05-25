// =====================================================================
// My_Fix Edge Function — Paystack Webhook Handler
// Environment: Deno Serverless (TypeScript)
// =====================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Import Node-equivalent crypto libraries in Deno for HMAC hashing
import { HMAC } from "https://deno.land/x/hmac@v2.0.1/mod.ts";

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

        // 4. Verify HMAC-SHA512 Signature to guarantee this request is genuine
        const expectedSignature = new HMAC("sha512", PAYSTACK_SECRET_KEY)
            .update(bodyText)
            .digest("hex");

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

            // 7. Update booking escrow state in database
            const { error } = await supabaseAdmin
                .from("bookings")
                .update({ 
                    status: "paid",
                    escrow_status: "held"
                })
                .eq("id", bookingId);

            if (error) {
                console.error("❌ Failed to update booking status in database:", error);
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
