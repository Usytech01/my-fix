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

export function Dashboard() {
  const { activeTab } = useApp();

  return (
    <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col gap-5 p-4 md:p-6">
      <Header />
      <div className="grid flex-1 gap-5 lg:grid-cols-[280px_1fr]">
        <Sidebar />
        <section className="min-w-0">
          {activeTab === "discovery" && <DiscoveryPanel />}
          {activeTab === "onboarding" && <OnboardingPanel />}
          {activeTab === "escrow" && <EscrowPanel />}
          {activeTab === "supabase" && <SupabasePanel />}
          {activeTab === "bookings" && <BookingsPanel />}
          {activeTab === "portfolio" && <PortfolioPanel />}
        </section>
      </div>
    </div>
  );
}
