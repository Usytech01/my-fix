"use client";

import { useApp } from "@/context/AppContext";
import { NEIGHBORHOODS, TRADE_OPTIONS } from "@/lib/constants";
import { formatNaira } from "@/lib/geo";
import type { VerificationBadge } from "@/lib/types";
import { Award, BarChart3, Compass, Sliders } from "lucide-react";
import { useEffect } from "react";

const BADGES: VerificationBadge[] = ["bronze", "silver", "gold"];

export function Sidebar() {
  const {
    neighborhoodId,
    setNeighborhoodId,
    clientLat,
    clientLng,
    filterTrade,
    setFilterTrade,
    filterBadge,
    setFilterBadge,
    statArtisanCount,
    statEscrowHeld,
    refreshArtisans,
  } = useApp();

  useEffect(() => {
    refreshArtisans();
  }, [neighborhoodId, filterTrade, filterBadge, refreshArtisans]);

  return (
    <aside className="glass flex flex-col gap-6 p-5 lg:sticky lg:top-6 lg:h-fit">
      <section>
        <h3 className="mb-1 flex items-center gap-2 font-display text-sm font-bold">
          <Compass className="h-4 w-4 text-gold" />
          Client Context
        </h3>
        <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
          Simulate a Lagos client requesting home services.
        </p>
        <label className="mb-2 block text-xs font-medium text-slate-600 dark:text-slate-400">
          Client Location
        </label>
        <select
          value={neighborhoodId}
          onChange={(e) => setNeighborhoodId(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none ring-forest/30 focus:ring-2 dark:border-white/10 dark:bg-slate-800"
        >
          {NEIGHBORHOODS.map((n) => (
            <option key={n.id} value={n.id}>
              {n.label}
            </option>
          ))}
        </select>
        <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-slate-100/80 p-3 text-xs dark:bg-slate-800/50">
          <div>
            <span className="text-slate-500">Latitude</span>
            <p className="font-mono font-semibold">{clientLat}</p>
          </div>
          <div>
            <span className="text-slate-500">Longitude</span>
            <p className="font-mono font-semibold">{clientLng}</p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-bold">
          <Sliders className="h-4 w-4 text-gold" />
          Active Filters
        </h3>
        <label className="mb-2 block text-xs font-medium">Artisan Trade</label>
        <select
          value={filterTrade}
          onChange={(e) => setFilterTrade(e.target.value)}
          className="mb-4 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-forest/30 dark:border-white/10 dark:bg-slate-800"
        >
          {TRADE_OPTIONS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <label className="mb-2 block text-xs font-medium">
          Min Verification Badge
        </label>
        <div className="flex flex-wrap gap-2">
          {BADGES.map((badge) => (
            <button
              key={badge}
              type="button"
              onClick={() => setFilterBadge(badge)}
              className={`flex flex-1 items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs font-semibold capitalize transition ${
                filterBadge === badge
                  ? "bg-forest text-white"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              <Award
                className={`h-3.5 w-3.5 ${
                  badge === "gold"
                    ? "text-gold"
                    : badge === "silver"
                      ? "text-slate-400"
                      : "text-amber-700"
                }`}
              />
              {badge}
            </button>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 pt-4 dark:border-white/10">
        <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-bold">
          <BarChart3 className="h-4 w-4 text-gold" />
          Platform Activity
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Verified Artisans</span>
            <span className="font-bold text-forest">{statArtisanCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Active Escrow</span>
            <span className="font-bold text-gold">
              {statEscrowHeld > 0 ? formatNaira(statEscrowHeld) : "₦0.00"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Disputed</span>
            <span className="font-bold text-red-500">0</span>
          </div>
        </div>
      </section>
    </aside>
  );
}
