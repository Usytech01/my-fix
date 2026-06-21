export type TabId = "discovery" | "onboarding" | "escrow" | "supabase";

export interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  phone_number?: string;
  email?: string;
  role: "client" | "artisan" | "admin";
}


export type VerificationBadge = "bronze" | "silver" | "gold";

/**
 * Frontend lifecycle of an escrow booking as presented in the portal UI.
 *
 * NOTE: this is intentionally a UI-oriented superset and does NOT match the
 * `booking_status` Postgres enum 1:1. The database stores `released` on the
 * separate `escrow_status` column, not on `booking_status`. When persisting a
 * booking, map `released`/`disputed` to the correct column + enum value:
 *
 *   DB bookings.status       -> ('pending','accepted','rejected','paid',
 *                                'in_progress','completed','disputed','cancelled')
 *   DB bookings.escrow_status -> ('held','released','disputed','refunded')
 *
 *   UI "released"  => bookings.status = 'completed', escrow_status = 'released'
 *   UI "disputed"  => bookings.status = 'disputed',  escrow_status = 'disputed'
 */
export type BookingStatus =
  | "pending"
  | "paid"
  | "completed"
  | "released"
  | "disputed";

export type AuditLogType = "blue" | "green-success" | "red-alert";

export interface AuditLogEntry {
  id: string;
  type: AuditLogType;
  text: string;
  time: string;
}

export interface Artisan {
  id: string;
  full_name: string;
  trade_category: string[];
  badge: VerificationBadge;
  nin_verified: boolean;
  bvn_verified: boolean;
  background_checked: boolean;
  base_callout_fee: number;
  service_areas: string[];
  lat?: number;
  lng?: number;
  about_text?: string;
  rating_avg: number;
  jobs_completed: number;
  avatar_url?: string;
  portfolio_urls?: string[];
  distance_meters?: number;
  distance?: number;
}

export interface Neighborhood {
  id: string;
  label: string;
  lat: number;
  lng: number;
}

export interface EscrowBooking {
  artisan: Artisan;
  calloutFee: number;
  serviceFee: number;
  total: number;
  paymentAmount: number;
  status: BookingStatus;
  isExploitAttempted: boolean;
}
