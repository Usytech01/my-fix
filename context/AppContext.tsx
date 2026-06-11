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
import { fetchNearbyArtisans } from "@/lib/supabase";
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
  seeding: boolean;
  runSeed: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

function buildEscrowFromArtisan(artisan: Artisan): EscrowBooking {
  const calloutFee = artisan.base_callout_fee;
  const serviceFee = SERVICE_FEE_ESTIMATE;
  const total = calloutFee + serviceFee;
  return {
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
    (artisan: Artisan) => {
      setEscrow(buildEscrowFromArtisan(artisan));
      setActiveTab("escrow");
      appendAuditLog(
        "blue",
        `[SYSTEM] Prepared booking with ${artisan.full_name}. Price agreed: ₦${artisan.base_callout_fee + SERVICE_FEE_ESTIMATE}`
      );
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
      }
    }, 1500);
  }, [appendAuditLog, advanceEscrowStatus, escrow.paymentAmount, escrow.total]);

  const resetOnboarding = useCallback(() => {
    setOnboardingStep(1);
    setOtpSent(false);
    setNimcOffline(false);
  }, []);

  const runSeed = useCallback(async () => {
    setSeeding(true);
    appendAuditLog("blue", "[SUPABASE] Connecting to REST API endpoint...");
    try {
      const res = await fetch("/api/seed", { method: "POST" });
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
    seeding,
    runSeed,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
