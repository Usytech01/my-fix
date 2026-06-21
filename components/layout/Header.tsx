"use client";

import { Logo } from "@/components/ui/Logo";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import type { TabId } from "@/lib/types";
import {
  Database,
  MapPin,
  Moon,
  Sun,
  UserCheck,
  Wallet,
  LogOut,
} from "lucide-react";
import { useTheme } from "next-themes";

const TABS: { id: TabId; label: string; icon: typeof MapPin }[] = [
  { id: "discovery", label: "Discovery", icon: MapPin },
  { id: "bookings", label: "Bookings", icon: Wallet },
  { id: "portfolio", label: "Portfolio", icon: Database },
  { id: "onboarding", label: "Onboarding", icon: UserCheck },
  { id: "escrow", label: "Escrow", icon: Wallet },
  { id: "supabase", label: "Supabase", icon: Database },
];

export function Header() {
  const { activeTab, setActiveTab } = useApp();
  const { theme, setTheme } = useTheme();
  const { profile, signOut } = useAuth();

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "U";

  return (
    <header className="glass flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between lg:p-5">
      <div className="flex items-center gap-3">
        <Logo />
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            My<span className="text-forest dark:text-forest-light">_Fix</span>
          </h1>
          <p className="text-xs font-medium uppercase tracking-widest text-gold">
            Your Trusted Home Fix
          </p>
        </div>
      </div>

      <nav className="flex flex-wrap gap-2">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
              activeTab === id
                ? "bg-forest text-white shadow-lg shadow-forest/25"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </nav>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-forest/30 bg-forest/10 px-3 py-1.5 text-xs font-semibold text-forest dark:text-forest-light">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-forest opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-forest" />
          </span>
          Lagos Region (Active)
        </div>
        
        <button
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Toggle theme"
        >
          <Sun className="h-5 w-5 dark:hidden" />
          <Moon className="hidden h-5 w-5 dark:block" />
        </button>

        {profile && (
          <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200 dark:border-white/10">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest/15 font-display text-sm font-bold text-forest dark:bg-forest/25 dark:text-forest-light">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="font-display text-sm font-bold leading-none">{profile.full_name}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gold mt-1 leading-none capitalize">
                {profile.role}
              </p>
            </div>
            <button
              type="button"
              onClick={signOut}
              className="rounded-xl p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition ml-1"
              title="Sign Out"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
