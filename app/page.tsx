"use client";

import { Dashboard } from "@/components/dashboard/Dashboard";
import { AppProvider } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { Loader2 } from "lucide-react";

function MainContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3">
        <Loader2 className="h-12 w-12 animate-spin text-gold" />
        <p className="text-sm font-semibold text-slate-500 font-display">Initializing My_Fix Portal...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <AppProvider>
      <Dashboard />
    </AppProvider>
  );
}

export default function Home() {
  return <MainContent />;
}
