import { NextResponse } from "next/server";
import { LAGOS_ARTISANS } from "@/lib/constants";

/**
 * Guards the seed endpoint. This route inserts artisans with the service-role
 * key (bypassing RLS), so it must not be reachable by arbitrary callers. Set
 * ADMIN_SEED_TOKEN in .env.local; requests must echo it back via either:
 *   - header `x-admin-token: <token>`   (preferred)
 *   - header `Authorization: Bearer <token>`
 */
function requireAdminToken(req: Request): boolean {
  const expected = process.env.ADMIN_SEED_TOKEN;
  if (!expected) return false; // refuse unless a token is configured
  const headerVal =
    req.headers.get("x-admin-token") ??
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return !!headerVal && headerVal === expected;
}

export async function POST(req: Request) {
  if (!requireAdminToken(req)) {
    return NextResponse.json(
      {
        error:
          "Unauthorized. Set ADMIN_SEED_TOKEN and send it via the x-admin-token header.",
      },
      { status: 403 }
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.json(
      { error: "Supabase credentials not configured in .env.local" },
      { status: 500 }
    );
  }

  let successCount = 0;

  for (const artisan of LAGOS_ARTISANS) {
    const profilePayload = {
      id: artisan.id,
      full_name: artisan.full_name,
      avatar_url: artisan.avatar_url,
      phone_number: `+234${Math.floor(8000000000 + Math.random() * 999999999)}`,
      role: "artisan",
      email: `${artisan.full_name.toLowerCase().replace(/\s/g, "")}@myfix.ng`,
    };

    const profileRes = await fetch(`${url}/rest/v1/profiles?id=eq.${artisan.id}`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify(profilePayload),
    });

    if (!profileRes.ok) {
      const errText = await profileRes.text();
      return NextResponse.json(
        { error: `Profile insert failed: ${errText}` },
        { status: 500 }
      );
    }

    const artisanPayload = {
      id: artisan.id,
      trade_category: artisan.trade_category,
      badge: artisan.badge,
      nin_verified: artisan.nin_verified,
      bvn_verified: artisan.bvn_verified,
      background_checked: artisan.background_checked,
      base_callout_fee: artisan.base_callout_fee,
      service_areas: artisan.service_areas,
      location_coords: `POINT(${artisan.lng} ${artisan.lat})`,
      about_text: artisan.about_text,
      portfolio_urls: artisan.portfolio_urls ?? [],
      rating_avg: artisan.rating_avg,
      jobs_completed: artisan.jobs_completed,
    };

    const artisanRes = await fetch(`${url}/rest/v1/artisans?id=eq.${artisan.id}`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify(artisanPayload),
    });

    if (!artisanRes.ok) {
      const errText = await artisanRes.text();
      return NextResponse.json(
        { error: `Artisan insert failed: ${errText}` },
        { status: 500 }
      );
    }

    successCount++;
  }

  return NextResponse.json({ count: successCount });
}
