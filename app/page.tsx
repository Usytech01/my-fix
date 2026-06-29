"use client";

import { useAuth } from "@/context/AuthContext";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function MainContent() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && profile) {
      router.replace(`/${profile.role}`);
    }
  }, [user, profile, loading, router]);

  if (loading || (user && profile)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3">
        <Loader2 className="h-12 w-12 animate-spin text-gold" />
        <p className="text-sm font-semibold text-slate-500 font-display">Redirecting to dashboard...</p>
      </div>
    );
  }

  return <AuthScreen />;
}

export default function Home() {
  return <MainContent />;
}
