"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/ui/Logo";
import {
  Lock,
  Mail,
  User,
  ShieldAlert,
  Loader2,
  Info,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export function AuthScreen() {
  const {
    signIn,
    signUp,
    supabaseConfigured,
    enableBypassMode,
  } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"client" | "artisan">("client");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const res = await signIn(email, password);
        if (res.error) {
          setError(res.error);
        }
      } else {
        const res = await signUp(email, password, fullName, role);
        if (res.error) {
          setError(res.error);
        } else {
          setSuccess(true);
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-[480px] space-y-6">
        
        {/* Branding header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-3">
            <Logo />
            <div>
              <h1 className="font-display text-3xl font-extrabold tracking-tight">
                My<span className="text-forest dark:text-forest-light">_Fix</span>
              </h1>
              <p className="text-xs font-bold uppercase tracking-widest text-gold">
                Your Trusted Home Fix
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Lagos’ Premium Home Services Stakeholder Portal
          </p>
        </div>

        {/* Configuration Notice for Sandbox Fallback */}
        {!supabaseConfigured && (
          <div className="glass border-amber-500/20 bg-amber-500/5 p-4 md:p-5">
            <div className="flex gap-3">
              <ShieldAlert className="h-5 w-5 shrink-0 text-amber-500" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-amber-600 dark:text-amber-500 font-display">
                  Local Sandbox Fallback Enabled
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  No Supabase URL or Anon key found in environment variables. You can sign in with mock info or click below to bypass auth.
                </p>
                <div className="mt-3 flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => enableBypassMode("client")}
                    className="flex items-center gap-1 rounded-lg bg-forest/10 px-3 py-1.5 text-xs font-semibold text-forest hover:bg-forest/20 dark:text-forest-light dark:bg-forest/20"
                  >
                    Demo Client
                    <ArrowRight className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => enableBypassMode("artisan")}
                    className="flex items-center gap-1 rounded-lg bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold hover:bg-gold/20 dark:text-gold-light dark:bg-gold/20"
                  >
                    Demo Artisan
                    <ArrowRight className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => enableBypassMode("admin")}
                    className="flex items-center gap-1 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500/20 dark:text-red-400 dark:bg-red-500/20"
                  >
                    Demo Admin
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Auth Form Container */}
        <div className="glass p-6 md:p-8 space-y-6">
          
          {/* Tab switches */}
          <div className="flex border-b border-slate-200 dark:border-white/10">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError(null);
              }}
              className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors font-display ${
                isLogin
                  ? "border-forest text-forest dark:border-forest-light dark:text-forest-light"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError(null);
              }}
              className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors font-display ${
                !isLogin
                  ? "border-forest text-forest dark:border-forest-light dark:text-forest-light"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Register
            </button>
          </div>

          {success ? (
            <div className="py-6 text-center space-y-3">
              <CheckCircle2 className="mx-auto h-12 w-12 text-forest" />
              <h3 className="font-display text-lg font-bold">Verification Pending</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Please check your email to verify your account. Once verified, you can sign in to access the portal.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSuccess(false);
                  setIsLogin(true);
                }}
                className="mt-2 text-sm font-semibold text-forest dark:text-forest-light hover:underline"
              >
                Go to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-500 font-semibold leading-relaxed">
                  {error}
                </div>
              )}

              {/* Register fields */}
              {!isLogin && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Full Name
                    </label>
                    <div className="relative flex items-center rounded-xl border border-slate-200 dark:border-white/10 dark:bg-slate-800">
                      <User className="absolute left-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="Emeka Okafor"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-transparent py-3 pl-10 pr-4 text-sm outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      I am signing up as a:
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRole("client")}
                        className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold border transition ${
                          role === "client"
                            ? "bg-forest/10 border-forest text-forest dark:bg-forest/20 dark:text-forest-light dark:border-forest-light"
                            : "border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        Client (Hire)
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole("artisan")}
                        className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold border transition ${
                          role === "artisan"
                            ? "bg-forest/10 border-forest text-forest dark:bg-forest/20 dark:text-forest-light dark:border-forest-light"
                            : "border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        Artisan (Offer Service)
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Common fields */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Email Address
                </label>
                <div className="relative flex items-center rounded-xl border border-slate-200 dark:border-white/10 dark:bg-slate-800">
                  <Mail className="absolute left-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent py-3 pl-10 pr-4 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Password
                </label>
                <div className="relative flex items-center rounded-xl border border-slate-200 dark:border-white/10 dark:bg-slate-800">
                  <Lock className="absolute left-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent py-3 pl-10 pr-4 text-sm outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-forest py-3.5 font-semibold text-white transition hover:bg-forest-light disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : isLogin ? (
                  "Sign In to My_Fix"
                ) : (
                  "Create Account"
                )}
              </button>

            </form>
          )}

        </div>

        {/* Footer legal notes */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 leading-relaxed px-4">
          By continuing, you agree to the My_Fix terms of service and consent to identity authentication. Security handles conform strictly to NDPR compliance.
        </p>

      </div>
    </div>
  );
}
