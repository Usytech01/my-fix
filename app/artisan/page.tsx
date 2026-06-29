"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { AppProvider } from "@/context/AppContext";
import { Dashboard } from "@/components/dashboard/Dashboard";

export default function ArtisanPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/");
      } else if (profile && profile.role !== "artisan") {
        router.replace(`/${profile.role}`);
      }
    }
  }, [user, profile, loading, router]);

  if (loading || !user || !profile || profile.role !== "artisan") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3">
        <Loader2 className="h-12 w-12 animate-spin text-gold" />
        <p className="text-sm font-semibold text-slate-500 font-display">Verifying access...</p>
      </div>
    );
  }

  return (
    <AppProvider>
      <Dashboard />
    </AppProvider>
  );
}
