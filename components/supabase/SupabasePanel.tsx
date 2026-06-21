"use client";

import { useApp } from "@/context/AppContext";
import { supabaseConfigured } from "@/lib/supabase";
import {
  Database,
  Loader2,
  Network,
  Sprout,
  Shield,
  ShieldAlert,
  Table2,
} from "lucide-react";

const TABLES = [
  "public.profiles",
  "public.artisans",
  "public.bookings",
  "public.reviews",
];

export function SupabasePanel() {
  const { seeding, runSeed } = useApp();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "Not configured";
  const adminTokenSet = Boolean(process.env.NEXT_PUBLIC_ADMIN_SEED_TOKEN);

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold">
          Supabase Database Sync
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Connection status and artisan seeding operations.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass space-y-4 p-6">
          <h3 className="flex items-center gap-2 font-display font-bold">
            <Network className="h-5 w-5 text-forest" />
            Connection Status
          </h3>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-slate-500">Supabase URL</dt>
              <dd className="break-all font-mono text-xs text-sky-600 dark:text-sky-400">
                {url}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Client configured</dt>
              <dd
                className={
                  supabaseConfigured
                    ? "font-semibold text-forest"
                    : "font-semibold text-amber-500"
                }
              >
                {supabaseConfigured ? "Yes" : "Add .env.local"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Schema</dt>
              <dd className="font-semibold text-forest">v1.1 Migrations</dd>
            </div>
          </dl>
          <div className="rounded-xl border border-forest/30 bg-forest/5 p-4">
            <div className="flex gap-3">
              <Shield className="h-5 w-5 shrink-0 text-forest" />
              <div>
                <h4 className="text-sm font-bold">Row Level Security</h4>
                <p className="mt-1 text-xs text-slate-500">
                  Profiles, artisans, bookings, and reviews have RLS enabled.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass space-y-4 p-6">
          <h3 className="flex items-center gap-2 font-display font-bold">
            <Database className="h-5 w-5 text-gold" />
            DB Seeding
          </h3>
          <p className="text-sm text-slate-500">
            Populate remote tables with Lagos artisan seed data and PostGIS
            coordinates.
          </p>
          {!adminTokenSet && (
            <div className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
              <ShieldAlert className="h-4 w-4 shrink-0 text-amber-500" />
              <p className="text-xs text-slate-500 leading-relaxed">
                Seeding is admin-gated. Set{" "}
                <code className="rounded bg-amber-500/10 px-1 py-0.5 font-mono text-amber-600 dark:text-amber-500">
                  ADMIN_SEED_TOKEN
                </code>{" "}
                (server) and{" "}
                <code className="rounded bg-amber-500/10 px-1 py-0.5 font-mono text-amber-600 dark:text-amber-500">
                  NEXT_PUBLIC_ADMIN_SEED_TOKEN
                </code>{" "}
                in <code>.env.local</code> to enable.
              </p>
            </div>
          )}
          <button
            type="button"
            disabled={seeding}
            onClick={runSeed}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-forest py-3 font-semibold text-white disabled:opacity-60"
          >
            {seeding ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Sprout className="h-5 w-5" />
            )}
            {seeding ? "Seeding..." : "Run Database Artisan Seed"}
          </button>
          <div>
            <h4 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              <Table2 className="h-4 w-4" />
              Schema Tables
            </h4>
            <div className="flex flex-wrap gap-2">
              {TABLES.map((t) => (
                <span
                  key={t}
                  className="rounded-lg bg-forest/10 px-2 py-1 font-mono text-xs text-forest"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
