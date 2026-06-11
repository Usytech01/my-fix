"use client";

import { useApp } from "@/context/AppContext";
import { formatNaira } from "@/lib/geo";
import type { Artisan } from "@/lib/types";
import {
  Award,
  CalendarCheck,
  Loader2,
  MapPin,
  Star,
} from "lucide-react";
import Image from "next/image";

function badgeColor(badge: string) {
  if (badge === "gold") return "text-gold";
  if (badge === "silver") return "text-slate-400";
  return "text-amber-700";
}

function ArtisanCard({
  artisan,
  onBook,
}: {
  artisan: Artisan;
  onBook: () => void;
}) {
  return (
    <article className="glass group flex flex-col gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-2xl">
      <div className="flex gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl ring-2 ring-forest/20">
          <Image
            src={
              artisan.avatar_url ??
              "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150"
            }
            alt={artisan.full_name}
            fill
            className="object-cover"
            sizes="64px"
          />
          <span
            className={`absolute -bottom-1 -right-1 rounded-full bg-white p-1 shadow dark:bg-slate-900 ${badgeColor(artisan.badge)}`}
          >
            <Award className="h-4 w-4" />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="truncate font-display font-bold">{artisan.full_name}</h4>
          <div className="mt-1 flex flex-wrap gap-1">
            {artisan.trade_category.map((t) => (
              <span
                key={t}
                className="rounded-md bg-forest/10 px-2 py-0.5 text-xs font-medium text-forest dark:text-forest-light"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl bg-gold/10 px-3 py-2 text-sm">
        <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
          <MapPin className="h-4 w-4 text-gold" />
          Proximity
        </span>
        <span className="font-semibold">
          {(artisan.distance ?? 0).toFixed(1)} km away
        </span>
      </div>

      <p className="line-clamp-3 text-sm text-slate-600 dark:text-slate-400">
        {artisan.about_text ?? "No bio available."}
      </p>

      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1 font-medium text-gold">
          <Star className="h-4 w-4 fill-gold" />
          {Number(artisan.rating_avg).toFixed(2)} ({artisan.jobs_completed} jobs)
        </span>
        <span>
          Callout:{" "}
          <strong className="text-forest">
            {formatNaira(artisan.base_callout_fee)}
          </strong>
        </span>
      </div>

      <button
        type="button"
        onClick={onBook}
        className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-forest py-3 text-sm font-semibold text-white transition hover:bg-forest-light"
      >
        <CalendarCheck className="h-4 w-4" />
        Book Artisan
      </button>
    </article>
  );
}

export function DiscoveryPanel() {
  const {
    artisans,
    artisansLoading,
    artisansSource,
    selectArtisanForBooking,
  } = useApp();

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold">
          Lagos Proximity Discovery Portal
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Real-time distance matching via Supabase PostGIS
          {artisansSource === "live" ? (
            <span className="ml-2 inline-flex rounded-full bg-forest/15 px-2 py-0.5 text-xs font-semibold text-forest">
              Live database
            </span>
          ) : (
            <span className="ml-2 inline-flex rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-600">
              Local fallback
            </span>
          )}
        </p>
      </div>

      {artisansLoading ? (
        <div className="glass flex flex-col items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-gold" />
          <h4 className="mt-4 font-display font-semibold">
            Loading from Supabase...
          </h4>
          <p className="text-sm text-slate-500">
            Fetching artisans with PostGIS proximity filters.
          </p>
        </div>
      ) : artisans.length === 0 ? (
        <div className="glass py-20 text-center">
          <h4 className="font-display text-lg font-semibold">No Artisans Found</h4>
          <p className="mt-2 text-sm text-slate-500">
            Try easing your filters or changing neighborhood.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {artisans.map((a) => (
            <ArtisanCard
              key={a.id}
              artisan={a}
              onBook={() => selectArtisanForBooking(a)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
