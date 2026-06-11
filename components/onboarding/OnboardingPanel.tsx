"use client";

import { useApp } from "@/context/AppContext";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  IdCard,
  Medal,
  Phone,
  RotateCcw,
  User,
} from "lucide-react";
import { useState } from "react";

const STEPS = ["Phone & OTP", "NIN Submission", "BVN Verification", "Badge Issued"];

export function OnboardingPanel() {
  const {
    onboardingStep,
    setOnboardingStep,
    otpSent,
    setOtpSent,
    nimcOffline,
    setNimcOffline,
    resetOnboarding,
  } = useApp();

  const [ninProcessing, setNinProcessing] = useState(false);
  const [selfieDone, setSelfieDone] = useState(false);
  const [bvnProcessing, setBvnProcessing] = useState(false);

  const goTo = (step: number) => setOnboardingStep(step);

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold">
          Artisan Onboarding & ID Verification
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Simulate Emeka&apos;s NIN & BVN journey to tiered verification badges.
        </p>
      </div>

      <div className="glass p-6 md:p-8">
        <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {STEPS.map((title, i) => {
            const step = i + 1;
            const done = onboardingStep > step;
            const active = onboardingStep === step;
            return (
              <div
                key={title}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold md:text-sm ${
                  done
                    ? "bg-forest/15 text-forest"
                    : active
                      ? "bg-gold/20 text-gold ring-2 ring-gold/40"
                      : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm ${
                    done || active ? "bg-forest text-white" : "bg-slate-300 dark:bg-slate-600"
                  }`}
                >
                  {done ? "✓" : step}
                </span>
                <span className="hidden sm:inline">{title}</span>
              </div>
            );
          })}
        </div>

        {onboardingStep === 1 && (
          <div className="max-w-lg space-y-4">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold">
              <Phone className="h-5 w-5 text-forest" />
              Telephone OTP Authentication
            </h3>
            <p className="text-sm text-slate-500">
              Every artisan registration starts with a verified Nigerian mobile number.
            </p>
            <div className="flex rounded-xl border border-slate-200 dark:border-white/10">
              <span className="flex items-center rounded-l-xl bg-slate-100 px-3 text-sm font-medium dark:bg-slate-800">
                +234
              </span>
              <input
                type="tel"
                defaultValue="8145558839"
                className="flex-1 rounded-r-xl bg-transparent px-3 py-3 text-sm outline-none"
                readOnly
              />
            </div>
            {!otpSent ? (
              <button
                type="button"
                onClick={() => setOtpSent(true)}
                className="rounded-xl bg-forest px-5 py-3 text-sm font-semibold text-white hover:bg-forest-light"
              >
                Send Verification OTP Code
              </button>
            ) : (
              <div className="space-y-4 rounded-xl border border-gold/30 bg-gold/5 p-4">
                <p className="text-sm">
                  OTP SMS sent via Termii API to +234 814 555 8839
                </p>
                <div className="flex gap-2">
                  {["7", "4", "1", "0"].map((d, i) => (
                    <input
                      key={i}
                      maxLength={1}
                      defaultValue={d}
                      className="h-12 w-12 rounded-xl border border-slate-200 text-center text-lg font-bold dark:border-white/10 dark:bg-slate-800"
                      readOnly
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => goTo(2)}
                  className="rounded-xl bg-forest px-5 py-3 text-sm font-semibold text-white"
                >
                  Verify Code
                </button>
              </div>
            )}
          </div>
        )}

        {onboardingStep === 2 && (
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold">
              <IdCard className="h-5 w-5 text-forest" />
              NIN (NIMC API)
            </h3>
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
                <div>
                  <h4 className="font-semibold">NIMC API Downtime Fallback</h4>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Toggle to test manual admin verification queue.
                  </p>
                  <label className="mt-3 flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={nimcOffline}
                      onChange={(e) => setNimcOffline(e.target.checked)}
                      className="h-4 w-4 rounded accent-forest"
                    />
                    <span className="text-sm font-medium">Simulate NIMC API Offline</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <input
                  placeholder="NIN (11 digits)"
                  defaultValue="48293021948"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-800"
                  readOnly
                />
                <input
                  placeholder="Full name"
                  defaultValue="Emeka Anthony Nwosu"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-800"
                  readOnly
                />
                <button
                  type="button"
                  disabled={ninProcessing}
                  onClick={() => {
                    setNinProcessing(true);
                    setTimeout(() => {
                      setNinProcessing(false);
                      if (nimcOffline) {
                        goTo(3);
                      } else {
                        setSelfieDone(true);
                        setTimeout(() => goTo(3), 1200);
                      }
                    }, 2000);
                  }}
                  className="rounded-xl bg-forest px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {ninProcessing ? "Connecting to NIMC..." : "Process NIN & Live Selfie"}
                </button>
              </div>
              <div
                className={`flex min-h-[200px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center ${
                  ninProcessing
                    ? "border-gold bg-gold/5"
                    : selfieDone
                      ? "border-forest bg-cover bg-center"
                      : "border-slate-200 dark:border-white/10"
                }`}
                style={
                  selfieDone && !nimcOffline
                    ? {
                        backgroundImage:
                          "url(https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200)",
                      }
                    : undefined
                }
              >
                {ninProcessing ? (
                  <p className="text-sm text-gold">Scanning facial biometrics...</p>
                ) : nimcOffline ? (
                  <>
                    <User className="h-10 w-10 text-gold" />
                    <p className="mt-2 text-sm text-gold">
                      Pending admin review queue
                    </p>
                  </>
                ) : selfieDone ? (
                  <span className="flex items-center gap-2 rounded-full bg-forest px-3 py-1 text-sm font-semibold text-white">
                    <CheckCircle2 className="h-4 w-4" /> 98.4% Match
                  </span>
                ) : (
                  <>
                    <User className="h-12 w-12 text-slate-400" />
                    <p className="mt-2 text-sm text-slate-500">
                      Click Process NIN to run face match
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {onboardingStep === 3 && (
          <div className="max-w-md space-y-4">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold">
              <Building2 className="h-5 w-5 text-forest" />
              BVN Financial Identity
            </h3>
            <input
              defaultValue="22240958302"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-800"
              readOnly
            />
            <select className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-800">
              <option>GTBank (Guaranty Trust)</option>
              <option>First Bank of Nigeria</option>
              <option>Access Bank</option>
            </select>
            <input
              defaultValue="3049583029"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-800"
              readOnly
            />
            <button
              type="button"
              disabled={bvnProcessing}
              onClick={() => {
                setBvnProcessing(true);
                setTimeout(() => {
                  setBvnProcessing(false);
                  goTo(4);
                }, 1500);
              }}
              className="rounded-xl bg-forest px-5 py-3 text-sm font-semibold text-white"
            >
              {bvnProcessing ? "Cross-referencing BVN..." : "Verify Payout Credentials"}
            </button>
          </div>
        )}

        {onboardingStep === 4 && (
          <div className="mx-auto max-w-md text-center">
            <Medal className="mx-auto h-16 w-16 text-gold" />
            <h2 className="mt-4 font-display text-2xl font-bold text-gold">
              Artisan Verified Successfully!
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Emeka&apos;s identity and BVN are locked in Supabase records.
            </p>
            <div className="glass mt-6 space-y-3 p-4 text-left text-sm">
              <div className="flex justify-between">
                <span>Status</span>
                <span className="rounded-full bg-forest/15 px-2 py-0.5 font-semibold text-forest">
                  ACTIVE_VERIFIED
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tier</span>
                <span className="font-semibold text-gold">Gold Professional</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                resetOnboarding();
                setSelfieDone(false);
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-forest px-5 py-3 text-sm font-semibold text-white"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Onboarding Wizard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
