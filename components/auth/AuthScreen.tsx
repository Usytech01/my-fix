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
    signInWithGoogle,
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

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await signInWithGoogle(role);
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      }
    } catch (err) {
      setError("An unexpected error occurred during Google Sign In. Please try again.");
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

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="h-[1px] flex-1 bg-slate-200 dark:bg-white/10"></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 shrink-0">
                  Or continue with
                </span>
                <div className="h-[1px] flex-1 bg-slate-200 dark:bg-white/10"></div>
              </div>

              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-800/30 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-100/50 dark:hover:bg-slate-800/50 hover:border-slate-300 dark:hover:border-white/20 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
              >
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                  <g transform="matrix(1, 0, 0, 1, 0, 0)">
                    <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.58h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.48c0,-0.61 -0.06,-1.2 -0.17,-1.76z" fill="#4285F4" />
                    <path d="M12,20.7c2.35,0 4.32,-0.78 5.76,-2.12l-3.3,-2.58c-0.91,0.61 -2.08,0.98 -3.3,0.98c-2.28,0 -4.21,-1.54 -4.9,-3.61H2.88v2.66c1.44,2.87 4.41,4.67 7.74,4.67z" fill="#34A853" />
                    <path d="M7.1,13.37c-0.17,-0.52 -0.27,-1.08 -0.27,-1.65c0,-0.57 0.1,-1.13 0.27,-1.65V7.41H2.88c-0.58,1.16 -0.91,2.47 -0.91,3.87c0,1.4 0.33,2.71 0.91,3.87l4.22,-3.28z" fill="#FBBC05" />
                    <path d="M12,6.72c1.28,0 2.43,0.44 3.34,1.3l2.5,-2.5C16.31,4.12 14.34,3.3 12,3.3c-3.33,0 -6.3,1.8 -7.74,4.67l4.22,3.28c0.69,-2.07 2.62,-3.61 4.9,-3.61z" fill="#EA4335" />
                  </g>
                </svg>
                {isLogin ? "Sign in with Google" : "Sign up with Google"}
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
