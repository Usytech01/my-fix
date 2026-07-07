"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  BADGE_RANK,
  LAGOS_ARTISANS,
  NEIGHBORHOODS,
  SERVICE_FEE_ESTIMATE,
} from "@/lib/constants";
import { haversineKm } from "@/lib/geo";
import { fetchNearbyArtisans, createBooking, updateBookingStatus, fetchArtisanDetails, updateArtisanVerification, updateProfilePhone } from "@/lib/supabase";
import type {
  Artisan,
  AuditLogEntry,
  AuditLogType,
  BookingStatus,
  EscrowBooking,
  TabId,
  VerificationBadge,
} from "@/lib/types";

interface AppContextValue {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  neighborhoodId: string;
  setNeighborhoodId: (id: string) => void;
  clientLat: number;
  clientLng: number;
  filterTrade: string;
  setFilterTrade: (trade: string) => void;
  filterBadge: VerificationBadge;
  setFilterBadge: (badge: VerificationBadge) => void;
  artisans: Artisan[];
  artisansLoading: boolean;
  artisansSource: "live" | "local";
  refreshArtisans: () => Promise<void>;
  statArtisanCount: number;
  statEscrowHeld: number;
  setStatEscrowHeld: (n: number) => void;
  selectArtisanForBooking: (artisan: Artisan) => void;
  escrow: EscrowBooking;
  setPaymentAmount: (amount: number) => void;
  forceExploitPrice: () => void;
  resetEscrow: () => void;
  advanceEscrowStatus: (status: BookingStatus) => void;
  paystackModalOpen: boolean;
  setPaystackModalOpen: (open: boolean) => void;
  processMockPayment: () => void;
  auditLogs: AuditLogEntry[];
  appendAuditLog: (type: AuditLogType, text: string) => void;
  clearAuditLogs: () => void;
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;
  otpSent: boolean;
  setOtpSent: (v: boolean) => void;
  nimcOffline: boolean;
  setNimcOffline: (v: boolean) => void;
  resetOnboarding: () => void;
  savingStep: boolean;
  savePhoneNumber: (phone: string) => Promise<void>;
  saveNINVerified: () => Promise<void>;
  saveBVNVerified: () => Promise<void>;
  seeding: boolean;
  runSeed: () => Promise<void>;
  loadOnboardingStateForArtisan: (userId: string, isBypass: boolean) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

function buildEscrowFromArtisan(artisan: Artisan): EscrowBooking {
  const calloutFee = artisan.base_callout_fee;
  const serviceFee = SERVICE_FEE_ESTIMATE;
  const total = calloutFee + serviceFee;
  return {
    bookingId: undefined,
    artisan,
    calloutFee,
    serviceFee,
    total,
    paymentAmount: total,
    status: "pending",
    isExploitAttempted: false,
  };
}

const defaultArtisan = LAGOS_ARTISANS[0];

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabId>("discovery");
  const [neighborhoodId, setNeighborhoodId] = useState("lekki");
  const [filterTrade, setFilterTrade] = useState("all");
  const [filterBadge, setFilterBadge] = useState<VerificationBadge>("bronze");
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [artisansLoading, setArtisansLoading] = useState(true);
  const [artisansSource, setArtisansSource] = useState<"live" | "local">(
    "local"
  );
  const [statEscrowHeld, setStatEscrowHeld] = useState(0);
  const [escrow, setEscrow] = useState<EscrowBooking>(() =>
    buildEscrowFromArtisan(defaultArtisan)
  );
  const [paystackModalOpen, setPaystackModalOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: "init",
      type: "blue",
      text: "[SYSTEM] Escrow Webhook Simulator Initialized. Awaiting checkout actions.",
      time: new Date().toTimeString().split(" ")[0],
    },
  ]);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [otpSent, setOtpSent] = useState(false);
  const [nimcOffline, setNimcOffline] = useState(false);
  const [savingStep, setSavingStep] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const neighborhood = useMemo(
    () => NEIGHBORHOODS.find((n) => n.id === neighborhoodId) ?? NEIGHBORHOODS[0],
    [neighborhoodId]
  );

  const appendAuditLog = useCallback((type: AuditLogType, text: string) => {
    setAuditLogs((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        type,
        text,
        time: new Date().toTimeString().split(" ")[0],
      },
    ]);
  }, []);

  const clearAuditLogs = useCallback(() => setAuditLogs([]), []);

  const refreshArtisans = useCallback(async () => {
    setArtisansLoading(true);
    const tradeFilter = filterTrade === "all" ? null : filterTrade;
    let source: Artisan[] = LAGOS_ARTISANS;
    let isLive = false;

    const live = await fetchNearbyArtisans(
      neighborhood.lat,
      neighborhood.lng,
      tradeFilter
    );
    if (live?.length) {
      source = live;
      isLive = true;
    }

    const targetRank = BADGE_RANK[filterBadge] ?? 1;
    const filtered = source
      .filter((a) => {
        if (!isLive && filterTrade !== "all" && !a.trade_category.includes(filterTrade)) {
          return false;
        }
        return (BADGE_RANK[a.badge] ?? 1) >= targetRank;
      })
      .map((a) => {
        const distance = isLive
          ? (a.distance_meters ?? 0) / 1000
          : haversineKm(
              neighborhood.lat,
              neighborhood.lng,
              a.lat ?? 0,
              a.lng ?? 0
            );
        return { ...a, distance };
      })
      .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));

    setArtisans(filtered);
    setArtisansSource(isLive ? "live" : "local");
    setArtisansLoading(false);
  }, [filterBadge, filterTrade, neighborhood.lat, neighborhood.lng]);

  const selectArtisanForBooking = useCallback(
    async (artisan: Artisan) => {
      let bookingId: string | undefined;
      
      // If user is logged in, create a real booking in Supabase
      const sessionStr = localStorage.getItem("myfix_demo_session");
      if (sessionStr) {
        try {
          const { user } = JSON.parse(sessionStr);
          if (user && user.id) {
            const res = await createBooking(
              user.id,
              artisan.id,
              `Booking for ${artisan.trade_category.join(", ")} services.`,
              artisan.base_callout_fee + SERVICE_FEE_ESTIMATE,
              new Date(Date.now() + 86400000).toISOString() // schedule for tomorrow
            );
            if ('data' in res && res.data) {
              bookingId = res.data.id;
            }
          }
        } catch(e) {
          console.error("Failed to parse user for booking", e);
        }
      }

      setEscrow({ ...buildEscrowFromArtisan(artisan), bookingId });
      setActiveTab("escrow");
      appendAuditLog(
        "blue",
        `[SYSTEM] Prepared booking with ${artisan.full_name}. Price agreed: ₦${artisan.base_callout_fee + SERVICE_FEE_ESTIMATE}`
      );
      if (bookingId) {
        appendAuditLog("green-success", `[SUPABASE] Created Booking ID: ${bookingId.split('-')[0]}...`);
      }
    },
    [appendAuditLog]
  );

  const setPaymentAmount = useCallback((amount: number) => {
    setEscrow((e) => ({
      ...e,
      paymentAmount: amount,
      isExploitAttempted: amount !== e.total,
    }));
  }, []);

  const forceExploitPrice = useCallback(() => {
    setEscrow((e) => ({
      ...e,
      paymentAmount: 1,
      isExploitAttempted: true,
    }));
    appendAuditLog(
      "red-alert",
      "⚠️ SECURITY ALERT: Local payment parameters manually modified to ₦1.00!"
    );
  }, [appendAuditLog]);

  const resetEscrow = useCallback(() => {
    setEscrow((e) => ({
      ...e,
      status: "pending",
      paymentAmount: e.total,
      isExploitAttempted: false,
    }));
  }, []);

  const advanceEscrowStatus = useCallback(
    (status: BookingStatus) => {
      setEscrow((e) => ({ ...e, status }));
      if (status === "paid") setStatEscrowHeld(escrow.total);
      if (status === "released") setStatEscrowHeld(0);
    },
    [escrow.total]
  );

  const processMockPayment = useCallback(() => {
    setPaystackModalOpen(false);
    appendAuditLog(
      "blue",
      "[PAYSTACK] Payment authorized. Dispatching HMAC-signed charge.success event..."
    );
    setTimeout(() => {
      appendAuditLog(
        "blue",
        "📩 Edge function paystack-webhook/index.ts received POST. Signature validated."
      );
      if (escrow.paymentAmount !== escrow.total) {
        appendAuditLog(
          "red-alert",
          `⚠️ SECURITY REJECTION: Paid ₦${escrow.paymentAmount}, Expected ₦${escrow.total}.`
        );
        if (typeof window !== "undefined") {
          window.alert(
            "SECURITY BLOCKED: Paid amount does not match database booking price."
          );
        }
      } else {
        appendAuditLog("green-success", "✅ Price verification successful.");
        appendAuditLog(
          "green-success",
          "💾 booking status = 'paid', escrow_status = 'held'"
        );
        advanceEscrowStatus("paid");
        
        // Update real booking if exists
        if (escrow.bookingId) {
          updateBookingStatus(escrow.bookingId, "paid", "held").catch(console.error);
        }
      }
    }, 1500);
  }, [appendAuditLog, advanceEscrowStatus, escrow.paymentAmount, escrow.total]);

  const resetOnboarding = useCallback(() => {
    setOnboardingStep(1);
    setOtpSent(false);
    setNimcOffline(false);
  }, []);

  // ---------------------------------------------------------------------------
  // Onboarding Persistence
  // ---------------------------------------------------------------------------

  // Helper to read/write bypass-mode state for artisan onboarding
  const BYPASS_KEY = "myfix_demo_artisan_onboarding";

  const savePhoneNumber = useCallback(async (phone: string) => {
    setSavingStep(true);
    try {
      const cached = localStorage.getItem("myfix_demo_session");
      if (cached) {
        // Bypass / demo mode — persist to localStorage only
        const { user } = JSON.parse(cached);
        if (user?.id) {
          const prev = JSON.parse(localStorage.getItem(BYPASS_KEY) ?? "{}");
          localStorage.setItem(BYPASS_KEY, JSON.stringify({ ...prev, phone, step: 2 }));
          setOnboardingStep(2);
          setOtpSent(true);
        }
      } else {
        // Live Supabase mode
        const sessionStr = typeof window !== "undefined" ? localStorage.getItem("myfix_demo_session") : null;
        const supabaseSession = sessionStr ? null : true; // live path when no demo session
        // Get user from supabase client
        const { getSupabaseClient } = await import("@/lib/supabase");
        const client = getSupabaseClient();
        if (client) {
          const { data: { session } } = await client.auth.getSession();
          if (session?.user) {
            await updateProfilePhone(session.user.id, phone);
            setOnboardingStep(2);
            setOtpSent(true);
          }
        }
      }
    } catch (e) {
      console.error("savePhoneNumber error:", e);
    } finally {
      setSavingStep(false);
    }
  }, []);

  const saveNINVerified = useCallback(async () => {
    setSavingStep(true);
    try {
      const cached = localStorage.getItem("myfix_demo_session");
      if (cached) {
        const { user } = JSON.parse(cached);
        if (user?.id) {
          const prev = JSON.parse(localStorage.getItem(BYPASS_KEY) ?? "{}");
          localStorage.setItem(BYPASS_KEY, JSON.stringify({ ...prev, nin_verified: true, step: 3 }));
        }
      } else {
        const { getSupabaseClient } = await import("@/lib/supabase");
        const client = getSupabaseClient();
        if (client) {
          const { data: { session } } = await client.auth.getSession();
          if (session?.user) {
            await updateArtisanVerification(session.user.id, { nin_verified: true });
          }
        }
      }
    } catch (e) {
      console.error("saveNINVerified error:", e);
    } finally {
      setSavingStep(false);
    }
  }, []);

  const saveBVNVerified = useCallback(async () => {
    setSavingStep(true);
    try {
      const cached = localStorage.getItem("myfix_demo_session");
      if (cached) {
        const { user } = JSON.parse(cached);
        if (user?.id) {
          const prev = JSON.parse(localStorage.getItem(BYPASS_KEY) ?? "{}");
          localStorage.setItem(BYPASS_KEY, JSON.stringify({ ...prev, bvn_verified: true, badge: "gold", step: 4 }));
        }
      } else {
        const { getSupabaseClient } = await import("@/lib/supabase");
        const client = getSupabaseClient();
        if (client) {
          const { data: { session } } = await client.auth.getSession();
          if (session?.user) {
            await updateArtisanVerification(session.user.id, {
              bvn_verified: true,
              background_checked: true,
              badge: "gold",
            });
          }
        }
      }
      await refreshArtisans();
    } catch (e) {
      console.error("saveBVNVerified error:", e);
    } finally {
      setSavingStep(false);
    }
  }, [refreshArtisans]);

  const runSeed = useCallback(async () => {
    setSeeding(true);
    appendAuditLog("blue", "[SUPABASE] Connecting to REST API endpoint...");
    try {
      // The seed route is admin-gated. The token is exposed to the browser via
      // NEXT_PUBLIC_ADMIN_SEED_TOKEN — its purpose is to keep the endpoint from
      // being an open mass-insert backdoor in deployed environments, not to be
      // a high-security secret.
      const adminToken = process.env.NEXT_PUBLIC_ADMIN_SEED_TOKEN;
      const res = await fetch("/api/seed", {
        method: "POST",
        headers: adminToken ? { "x-admin-token": adminToken } : undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Seed failed");
      appendAuditLog(
        "green-success",
        `🎉 Database seeding complete! ${data.count} artisans synced.`
      );
      await refreshArtisans();
    } catch (err) {
      appendAuditLog(
        "red-alert",
        `❌ Seeding failed: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setSeeding(false);
    }
  }, [appendAuditLog, refreshArtisans]);

  // ---------------------------------------------------------------------------
  // Load onboarding state from DB or localStorage when profile changes
  // ---------------------------------------------------------------------------
  // Expose a loadOnboardingState function that Dashboard or OnboardingPanel can call.
  const loadOnboardingStateForArtisan = useCallback(async (userId: string, isBypass: boolean) => {
    if (isBypass) {
      const saved = localStorage.getItem("myfix_demo_artisan_onboarding");
      if (saved) {
        try {
          const { step } = JSON.parse(saved);
          if (typeof step === "number" && step >= 1 && step <= 4) {
            setOnboardingStep(step);
            if (step >= 2) setOtpSent(true);
          }
        } catch (e) {
          // invalid data, ignore
        }
      }
      return;
    }

    // Live mode: fetch from DB
    try {
      const { data } = await fetchArtisanDetails(userId);
      if (data) {
        const { nin_verified, bvn_verified } = data;
        if (bvn_verified) {
          setOnboardingStep(4);
          setOtpSent(true);
        } else if (nin_verified) {
          setOnboardingStep(3);
          setOtpSent(true);
        } else {
          // Check profile phone via supabase client
          const { getSupabaseClient } = await import("@/lib/supabase");
          const client = getSupabaseClient();
          if (client) {
            const { data: profileData } = await client
              .from("profiles")
              .select("phone_number")
              .eq("id", userId)
              .maybeSingle();
            if (profileData?.phone_number) {
              setOnboardingStep(2);
              setOtpSent(true);
            } else {
              setOnboardingStep(1);
            }
          }
        }
      }
    } catch (e) {
      console.error("loadOnboardingStateForArtisan error:", e);
    }
  }, []);

  const value: AppContextValue = {
    activeTab,
    setActiveTab,
    neighborhoodId,
    setNeighborhoodId,
    clientLat: neighborhood.lat,
    clientLng: neighborhood.lng,
    filterTrade,
    setFilterTrade,
    filterBadge,
    setFilterBadge,
    artisans,
    artisansLoading,
    artisansSource,
    refreshArtisans,
    statArtisanCount: artisans.length,
    statEscrowHeld,
    setStatEscrowHeld,
    selectArtisanForBooking,
    escrow,
    setPaymentAmount,
    forceExploitPrice,
    resetEscrow,
    advanceEscrowStatus,
    paystackModalOpen,
    setPaystackModalOpen,
    processMockPayment,
    auditLogs,
    appendAuditLog,
    clearAuditLogs,
    onboardingStep,
    setOnboardingStep,
    otpSent,
    setOtpSent,
    nimcOffline,
    setNimcOffline,
    resetOnboarding,
    savingStep,
    savePhoneNumber,
    saveNINVerified,
    saveBVNVerified,
    seeding,
    runSeed,
    loadOnboardingStateForArtisan,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
