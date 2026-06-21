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

export async function createBooking(
  clientId: string,
  artisanId: string,
  jobDescription: string,
  price: number,
  scheduledAt: string
) {
  const client = getSupabaseClient();
  if (!client) return { data: null, error: "Supabase not configured" };

  return await client.from("bookings").insert({
    client_id: clientId,
    artisan_id: artisanId,
    job_description: jobDescription,
    price,
    scheduled_at: scheduledAt,
    status: "pending",
    escrow_status: "held",
  }).select().single();
}

export async function fetchUserBookings(userId: string, role: "client" | "artisan") {
  const client = getSupabaseClient();
  if (!client) return { data: null, error: "Supabase not configured" };

  const column = role === "client" ? "client_id" : "artisan_id";
  
  // We fetch bookings and also join the profiles/artisans so we can display who we booked
  return await client
    .from("bookings")
    .select(`
      *,
      client:profiles!client_id(full_name, avatar_url, phone_number),
      artisan:profiles!artisan_id(full_name, avatar_url, phone_number)
    `)
    .eq(column, userId)
    .order("created_at", { ascending: false });
}

export async function updateBookingStatus(
  bookingId: string,
  status: string,
  escrowStatus?: string
) {
  const client = getSupabaseClient();
  if (!client) return { error: "Supabase not configured" };

  const updates: any = { status };
  if (escrowStatus) updates.escrow_status = escrowStatus;

  return await client
    .from("bookings")
    .update(updates)
    .eq("id", bookingId)
    .select().single();
}

export async function submitReview(
  bookingId: string,
  quality: number,
  punctuality: number,
  professionalism: number,
  value: number,
  cleanliness: number,
  comment: string
) {
  const client = getSupabaseClient();
  if (!client) return { error: "Supabase not configured" };

  return await client.from("reviews").insert({
    booking_id: bookingId,
    client_rating_quality: quality,
    client_rating_punctuality: punctuality,
    client_rating_professionalism: professionalism,
    client_rating_value: value,
    client_rating_cleanliness: cleanliness,
    client_comment: comment,
  }).select().single();
}

export async function uploadPortfolioImage(artisanId: string, file: File) {
  const client = getSupabaseClient();
  if (!client) return { data: null, error: "Supabase not configured" };

  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${artisanId}/${fileName}`;

  const { error: uploadError } = await client.storage
    .from("portfolios")
    .upload(filePath, file);

  if (uploadError) return { data: null, error: uploadError };

  const { data: publicUrlData } = client.storage
    .from("portfolios")
    .getPublicUrl(filePath);

  return { data: publicUrlData.publicUrl, error: null };
}

export async function updateArtisanPortfolio(artisanId: string, urls: string[]) {
  const client = getSupabaseClient();
  if (!client) return { error: "Supabase not configured" };

  return await client
    .from("artisans")
    .update({ portfolio_urls: urls })
    .eq("id", artisanId);
}
