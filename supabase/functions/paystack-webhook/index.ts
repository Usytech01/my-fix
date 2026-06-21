// =====================================================================
// My_Fix Edge Function — Paystack Webhook Handler
// Environment: Deno Serverless (TypeScript)
// =====================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

// Decode a hex string into a byte array. Returns an empty array on malformed input.
function hexToBytes(hex: string): Uint8Array {
    if (hex.length % 2 !== 0) return new Uint8Array();
    const out = new Uint8Array(hex.length / 2);
    for (let i = 0; i < out.length; i++) {
        const byte = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
        if (Number.isNaN(byte)) return new Uint8Array();
        out[i] = byte;
    }
    return out;
}

// Constant-time equality for two byte arrays (lengths must also match).
function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length || a.length === 0) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) {
        diff |= a[i] ^ b[i];
    }
    return diff === 0;
}

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

        // Decode the incoming hex signature into bytes for a timing-safe comparison.
        // A naive string !== leaks signature bytes via response timing.
        const expectedBytes = new Uint8Array(signatureBuf);
        const receivedBytes = hexToBytes(signature);

        if (!constantTimeEqual(receivedBytes, expectedBytes)) {
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

            // 7. Retrieve the booking price (and current status) from the database to prevent price exploitation
            const { data: booking, error: fetchError } = await supabaseAdmin
                .from("bookings")
                .select("price, status")
                .eq("id", bookingId)
                .single();

            if (fetchError || !booking) {
                console.error(`❌ Webhook failed to retrieve booking ${bookingId} for validation:`, fetchError);
                return new Response("Booking Not Found", { status: 404 });
            }

            // Idempotency guard: Paystack may retry this webhook. If the booking is already
            // past 'pending', the payment was already processed — acknowledge and exit.
            if (booking.status && booking.status !== "pending") {
                console.log(`↪️ Booking ${bookingId} already in '${booking.status}' state. Treating webhook as duplicate.`);
                return new Response(JSON.stringify({ received: true, duplicate: true }), {
                    headers: { "Content-Type": "application/json" },
                    status: 200,
                });
            }

            // Compare in integer kobo to avoid floating-point inequality surprises.
            // Paystack's `amount` is already kobo; convert the DB price (naira, numeric) to kobo.
            const expectedKobo = Math.round(Number(booking.price) * 100);
            if (amountKobo !== expectedKobo) {
                console.error(`⚠️ SECURITY ALERT: Price exploitation attempt! Booking: ${bookingId}. Paid: ₦${amountNaira} (${amountKobo} kobo), Expected: ${expectedKobo} kobo`);
                return new Response("Security Validation Failed: Price Mismatch", { status: 400 });
            }

            // 8. Update booking escrow state in database since payment matches exactly.
            //    The `status = 'pending'` filter also protects against concurrent webhooks.
            const { error: updateError } = await supabaseAdmin
                .from("bookings")
                .update({ 
                    status: "paid",
                    escrow_status: "held"
                })
                .eq("id", bookingId)
                .eq("status", "pending");

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
        const message = err instanceof Error ? err.message : String(err);
        console.error("❌ Webhook processing crashed:", message);
        return new Response(`Server Error: ${message}`, { status: 500 });
    }
});
