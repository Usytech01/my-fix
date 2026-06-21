import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Artisan } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabaseConfigured =
  Boolean(supabaseUrl) && Boolean(supabaseAnonKey);

// Cache a single client instance. Supabase maintains an auth state socket and
// internal state, so creating a new client per call leaks listeners and breaks
// `onAuthStateChange` subscription continuity.
let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseConfigured) return null;
  if (!cachedClient) {
    cachedClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return cachedClient;
}

export async function fetchNearbyArtisans(
  lat: number,
  lng: number,
  tradeFilter: string | null
): Promise<Artisan[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  const { data, error } = await client.rpc("get_nearby_artisans", {
    lat,
    lng,
    max_distance_meters: 100000,
    trade_filter: tradeFilter,
  });

  if (error || !data?.length) return null;
  return data as Artisan[];
}
