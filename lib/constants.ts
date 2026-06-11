import type { Artisan, Neighborhood } from "./types";

export const NEIGHBORHOODS: Neighborhood[] = [
  { id: "lekki", label: "Lekki Phase 1", lat: 6.4281, lng: 3.4219 },
  { id: "surulere", label: "Surulere", lat: 6.5058, lng: 3.3614 },
  { id: "ikeja", label: "Ikeja GRA", lat: 6.592, lng: 3.3422 },
  { id: "yaba", label: "Yaba", lat: 6.5095, lng: 3.3711 },
  { id: "vi", label: "Victoria Island", lat: 6.4278, lng: 3.4248 },
];

export const TRADE_OPTIONS = [
  { value: "all", label: "All Trades" },
  { value: "Plumber", label: "Plumbing" },
  { value: "Electrician", label: "Electrical" },
  { value: "AC Repair", label: "AC Installation & Repair" },
  { value: "Generator Repair", label: "Generator Services" },
  { value: "Tailor", label: "Tailoring" },
  { value: "Laundry", label: "Laundry" },
];

export const BADGE_RANK: Record<string, number> = {
  bronze: 1,
  silver: 2,
  gold: 3,
};

export const MOCK_BOOKING_ID = "b92a30f1-432e-9df2-bbcc-d30a84f3e9a1";

export const SERVICE_FEE_ESTIMATE = 10000;

export const LAGOS_ARTISANS: Artisan[] = [
  {
    id: "a1a1a1a1-bbbb-cccc-dddd-111122223333",
    full_name: "Emeka Anthony Nwosu",
    trade_category: ["Electrician", "Generator Repair"],
    badge: "gold",
    nin_verified: true,
    bvn_verified: true,
    background_checked: true,
    base_callout_fee: 5000,
    service_areas: ["Surulere", "Yaba", "Ikeja"],
    lat: 6.5058,
    lng: 3.3614,
    about_text:
      "Certified commercial and residential electrician. Specializes in conduit wiring, fault detection, and large diesel generator servicing.",
    rating_avg: 4.9,
    jobs_completed: 142,
    avatar_url:
      "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "b2b2b2b2-cccc-dddd-eeee-222233334444",
    full_name: "Chinedu Okafor",
    trade_category: ["Plumber"],
    badge: "silver",
    nin_verified: true,
    bvn_verified: true,
    background_checked: false,
    base_callout_fee: 4000,
    service_areas: ["Lekki", "VI", "Victoria Island"],
    lat: 6.4281,
    lng: 3.4219,
    about_text:
      "Professional residential plumber. Expertise in water mains repair, sewage drainage unblocking, and water heater installations.",
    rating_avg: 4.6,
    jobs_completed: 89,
    avatar_url:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "c3c3c3c3-dddd-eeee-ffff-333344445555",
    full_name: "Babajide Cole",
    trade_category: ["AC Repair", "Electrician"],
    badge: "gold",
    nin_verified: true,
    bvn_verified: true,
    background_checked: true,
    base_callout_fee: 6000,
    service_areas: ["Ikeja", "Maryland", "Surulere"],
    lat: 6.592,
    lng: 3.3422,
    about_text:
      "HVAC cooling systems specialist. Expert in invertor AC installation, gas refilling, and deep diagnostic repairs.",
    rating_avg: 4.85,
    jobs_completed: 215,
    avatar_url:
      "https://images.unsplash.com/photo-1620122303020-43ec4b6cf7f8?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "d4d4d4d4-eeee-ffff-aaaa-444455556666",
    full_name: "Tolani Alao",
    trade_category: ["Tailor"],
    badge: "bronze",
    nin_verified: true,
    bvn_verified: false,
    background_checked: false,
    base_callout_fee: 3000,
    service_areas: ["Yaba", "Surulere"],
    lat: 6.5095,
    lng: 3.3711,
    about_text:
      "Expert tailor for traditional garments (Agbada, Ankara). Home measurements and express delivery.",
    rating_avg: 4.2,
    jobs_completed: 31,
    avatar_url:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "e5e5e5e5-ffff-aaaa-bbbb-555566667777",
    full_name: "Funke Bello",
    trade_category: ["Laundry"],
    badge: "silver",
    nin_verified: true,
    bvn_verified: true,
    background_checked: false,
    base_callout_fee: 3500,
    service_areas: ["Victoria Island", "Ikoyi", "Lekki"],
    lat: 6.4278,
    lng: 3.4248,
    about_text:
      "Deep-cleaning home services and premium laundry. Highly trusted across premium Lekki/VI estates.",
    rating_avg: 4.7,
    jobs_completed: 65,
    avatar_url:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "f6f6f6f6-aaaa-bbbb-cccc-666677778888",
    full_name: "Segun Bakare",
    trade_category: ["Generator Repair", "Plumber"],
    badge: "gold",
    nin_verified: true,
    bvn_verified: true,
    background_checked: true,
    base_callout_fee: 5500,
    service_areas: ["Surulere", "Yaba", "Apapa"],
    lat: 6.502,
    lng: 3.358,
    about_text:
      "Specialized generator technician with 10+ years experience. Emergency callouts accepted.",
    rating_avg: 4.95,
    jobs_completed: 320,
    avatar_url:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
  },
];
