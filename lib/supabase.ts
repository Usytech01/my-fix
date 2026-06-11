import { createClient } from "@supabase/supabase-js";
import type { Artisan } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabaseConfigured =
  Boolean(supabaseUrl) && Boolean(supabaseAnonKey);

export function getSupabaseClient() {
  if (!supabaseConfigured) return null;
  return createClient(supabaseUrl, supabaseAnonKey);
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
