"use client";

import { DiscoveryPanel } from "@/components/discovery/DiscoveryPanel";
import { EscrowPanel } from "@/components/escrow/EscrowPanel";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { OnboardingPanel } from "@/components/onboarding/OnboardingPanel";
import { SupabasePanel } from "@/components/supabase/SupabasePanel";
import { BookingsPanel } from "@/components/bookings/BookingsPanel";
import { PortfolioPanel } from "@/components/portfolio/PortfolioPanel";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

export function Dashboard() {
  const { activeTab, setActiveTab, loadOnboardingStateForArtisan } = useApp();
  const { profile, bypassMode } = useAuth();

  // Restore the artisan's onboarding progress from DB or localStorage on login
  useEffect(() => {
    if (profile?.role === "artisan") {
      loadOnboardingStateForArtisan(profile.id, bypassMode);
    }
  }, [profile, bypassMode, loadOnboardingStateForArtisan]);
  useEffect(() => {
    if (profile) {
      if (profile.role === "client" && !["discovery", "bookings", "escrow"].includes(activeTab)) {
        setActiveTab("discovery");
      } else if (profile.role === "artisan" && !["onboarding", "bookings", "portfolio"].includes(activeTab)) {
        setActiveTab("onboarding");
      } else if (profile.role === "admin" && !["supabase", "bookings", "escrow"].includes(activeTab)) {
        setActiveTab("supabase");
      }
    }
  }, [profile, activeTab, setActiveTab]);

  return (
    <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col gap-5 p-4 md:p-6">
      <Header />
      <div className="grid flex-1 gap-5 lg:grid-cols-[280px_1fr]">
        <Sidebar />
        <section className="min-w-0">
          {activeTab === "discovery" && profile?.role === "client" && <DiscoveryPanel />}
          {activeTab === "onboarding" && profile?.role === "artisan" && <OnboardingPanel />}
          {activeTab === "escrow" && (profile?.role === "client" || profile?.role === "admin") && <EscrowPanel />}
          {activeTab === "supabase" && profile?.role === "admin" && <SupabasePanel />}
          {activeTab === "bookings" && <BookingsPanel />}
          {activeTab === "portfolio" && profile?.role === "artisan" && <PortfolioPanel />}
        </section>
      </div>
    </div>
  );
}
