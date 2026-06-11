// =====================================================================
// My_Fix Database Seeder Script
// Running environment: Node.js (uses local 'pg' driver)
// =====================================================================

const { Client } = require('pg');

// Connect directly as 'postgres' superuser using credentials from .env
const client = new Client({
    connectionString: 'postgresql://postgres:Ohunene%401234@db.tarvtukfkytouhyuiamb.supabase.co:5432/postgres'
});

const SEED_ARTISANS = [
    {
        id: "a1a1a1a1-bbbb-cccc-dddd-111122223333",
        full_name: "Emeka Anthony Nwosu",
        email: "emeka@myfix.ng",
        phone: "+2348145558839",
        trade_category: ["Electrician", "Generator Repair"],
        badge: "gold",
        nin_verified: true,
        bvn_verified: true,
        background_checked: true,
        base_callout_fee: 5000.00,
        service_areas: ["Surulere", "Yaba", "Ikeja"],
        lat: 6.5058, // Surulere
        lng: 3.3614,
        about_text: "Certified commercial and residential electrician. Specializes in conduit wiring, fault detection, and large diesel generator servicing. 5+ years experience.",
        rating_avg: 4.9,
        jobs_completed: 142,
        avatar_url: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80"
    },
    {
        id: "b2b2b2b2-cccc-dddd-eeee-222233334444",
        full_name: "Chinedu Okafor",
        email: "chinedu@myfix.ng",
        phone: "+2348023456789",
        trade_category: ["Plumber"],
        badge: "silver",
        nin_verified: true,
        bvn_verified: true,
        background_checked: false,
        base_callout_fee: 4000.00,
        service_areas: ["Lekki", "VI", "Victoria Island"],
        lat: 6.4281, // Lekki Phase 1
        lng: 3.4219,
        about_text: "Professional residential plumber. Expertise in water mains repair, sewage drainage unblocking, pipe threading, and water heater installations.",
        rating_avg: 4.6,
        jobs_completed: 89,
        avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    },
    {
        id: "c3c3c3c3-dddd-eeee-ffff-333344445555",
        full_name: "Babajide Cole",
        email: "babajide@myfix.ng",
        phone: "+2348034567890",
        trade_category: ["AC Repair", "Electrician"],
        badge: "gold",
        nin_verified: true,
        bvn_verified: true,
        background_checked: true,
        base_callout_fee: 6000.00,
        service_areas: ["Ikeja", "Maryland", "Surulere"],
        lat: 6.5920, // Ikeja GRA
        lng: 3.3422,
        about_text: "HVAC cooling systems specialist. Expert in invertor AC installation, gas refilling, duct cleaning, and deep diagnostic repairs. 8 years active service.",
        rating_avg: 4.85,
        jobs_completed: 215,
        avatar_url: "https://images.unsplash.com/photo-1620122303020-43ec4b6cf7f8?w=150&auto=format&fit=crop&q=80"
    },
    {
        id: "d4d4d4d4-eeee-ffff-aaaa-444455556666",
        full_name: "Tolani Alao",
        email: "tolani@myfix.ng",
        phone: "+2348045678901",
        trade_category: ["Tailor"],
        badge: "bronze",
        nin_verified: true,
        bvn_verified: false,
        background_checked: false,
        base_callout_fee: 3000.00,
        service_areas: ["Yaba", "Surulere"],
        lat: 6.5095, // Yaba
        lng: 3.3711,
        about_text: "Expert tailor and designer for traditional male and female garments (Agbada, Ankara fits). Available for home measurements and express delivery.",
        rating_avg: 4.2,
        jobs_completed: 31,
        avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    },
    {
        id: "e5e5e5e5-ffff-aaaa-bbbb-555566667777",
        full_name: "Funke Bello",
        email: "funke@myfix.ng",
        phone: "+2348056789012",
        trade_category: ["Laundry"],
        badge: "silver",
        nin_verified: true,
        bvn_verified: true,
        background_checked: false,
        base_callout_fee: 3500.00,
        service_areas: ["Victoria Island", "Ikoyi", "Lekki"],
        lat: 6.4278, // Victoria Island
        lng: 3.4248,
        about_text: "Deep-cleaning home services and premium laundry adjustments. Highly trusted housekeeper with verified ratings across premium Lekki/VI estates.",
        rating_avg: 4.7,
        jobs_completed: 65,
        avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
    },
    {
        id: "f6f6f6f6-aaaa-bbbb-cccc-666677778888",
        full_name: "Segun Bakare",
        email: "segun@myfix.ng",
        phone: "+2348067890123",
        trade_category: ["Generator Repair", "Plumber"],
        badge: "gold",
        nin_verified: true,
        bvn_verified: true,
        background_checked: true,
        base_callout_fee: 5500.00,
        service_areas: ["Surulere", "Yaba", "Apapa"],
        lat: 6.5020, // Surulere
        lng: 3.3580,
        about_text: "Specialized generator technician with 10+ years experience. Expert in servicing Mikano, Lister, and Tigmax generators. Emergency callouts accepted.",
        rating_avg: 4.95,
        jobs_completed: 320,
        avatar_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80"
    }
];

async function seed() {
    try {
        await client.connect();
        console.log("⚡ Successfully connected to cloud PostgreSQL database.");

        // Begin transaction
        await client.query("BEGIN;");

        for (const artisan of SEED_ARTISANS) {
            console.log(`⏳ Seeding: ${artisan.full_name}...`);

            // 1. Insert into auth.users (satisfies foreign key constraint)
            const insertUserQuery = `
                INSERT INTO auth.users (id, email, phone, raw_user_meta_data, role, aud, email_confirmed_at)
                VALUES ($1, $2, $3, $4, 'authenticated', 'authenticated', NOW())
                ON CONFLICT (id) DO UPDATE SET email = $2, phone = $3, raw_user_meta_data = $4;
            `;
            await client.query(insertUserQuery, [
                artisan.id,
                artisan.email,
                artisan.phone,
                JSON.stringify({ full_name: artisan.full_name, role: "artisan" })
            ]);

            // Note: Triggers automatically handle public.profiles and public.artisans insertion.
            // Let's explicitly update them to make sure all profile metadata is synced.
            const updateProfileQuery = `
                UPDATE public.profiles
                SET full_name = $2, phone_number = $3, email = $4, avatar_url = $5
                WHERE id = $1;
            `;
            await client.query(updateProfileQuery, [
                artisan.id,
                artisan.full_name,
                artisan.phone,
                artisan.email,
                artisan.avatar_url
            ]);

            // 2. Update the public.artisans table with PostGIS geometries and specific details
            const updateArtisanQuery = `
                UPDATE public.artisans
                SET 
                    trade_category = $2,
                    badge = $3,
                    nin_verified = $4,
                    bvn_verified = $5,
                    background_checked = $6,
                    base_callout_fee = $7,
                    service_areas = $8,
                    location_coords = ST_SetSRID(ST_MakePoint($9, $10), 4326)::geography,
                    about_text = $11,
                    rating_avg = $12,
                    jobs_completed = $13
                WHERE id = $1;
            `;
            await client.query(updateArtisanQuery, [
                artisan.id,
                artisan.trade_category,
                artisan.badge,
                artisan.nin_verified,
                artisan.bvn_verified,
                artisan.background_checked,
                artisan.base_callout_fee,
                artisan.service_areas,
                artisan.lng,
                artisan.lat,
                artisan.about_text,
                artisan.rating_avg,
                artisan.jobs_completed
            ]);
        }

        await client.query("COMMIT;");
        console.log("🎉 Seeding complete! All profiles, auth entries, and PostGIS location rows written.");

    } catch (err) {
        await client.query("ROLLBACK;");
        console.error("❌ Seeding failed, database changes rolled back:", err);
    } finally {
        await client.end();
    }
}

seed();
