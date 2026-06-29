"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getSupabaseClient, supabaseConfigured } from "@/lib/supabase";
import type { Profile } from "@/lib/types";
import type { User } from "@supabase/supabase-js";

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  supabaseConfigured: boolean;
  bypassMode: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: "client" | "artisan"
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  enableBypassMode: (demoRole?: "client" | "artisan" | "admin") => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [bypassMode, setBypassMode] = useState(false);

  // Client is a cached singleton; memoize the reference so it's stable across renders.
  const supabase = useMemo(() => getSupabaseClient(), []);

  // Helper to fetch profile from DB with retries (for signup trigger latency)
  const fetchProfile = async (userId: string, retries = 5): Promise<Profile | null> => {
    if (!supabase) return null;
    
    for (let i = 0; i < retries; i++) {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (data) return data as Profile;
      
      if (error) {
        console.error("Error fetching profile, retrying...", error);
      }
      
      // Wait 500ms before retrying
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    return null;
  };

  useEffect(() => {
    if (!supabaseConfigured || !supabase) {
      // Check if bypass mode session exists in localStorage
      const cached = localStorage.getItem("myfix_demo_session");
      if (cached) {
        try {
          const { user: cachedUser, profile: cachedProfile } = JSON.parse(cached);
          setUser(cachedUser);
          setProfile(cachedProfile);
          setBypassMode(true);
        } catch (e) {
          console.error("Failed to parse cached demo session", e);
        }
      }
      setLoading(false);
      return;
    }

    // Initialize Supabase Auth session listener
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          const userProfile = await fetchProfile(session.user.id);
          setProfile(userProfile);
        }
      } catch (err) {
        console.error("Failed to get initial session", err);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          const userProfile = await fetchProfile(session.user.id);
          setProfile(userProfile);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!supabaseConfigured || !supabase) {
      // Simulated sign in
      const mockUserId = "demo-user-id-12345";
      const isAdminEmail = email.toLowerCase().includes("admin") || email.toLowerCase() === "usmandio2@gmail.com";
      const isArtisanEmail = email.toLowerCase().includes("artisan") || email.toLowerCase().includes("emeka");
      const role = isAdminEmail ? "admin" : isArtisanEmail ? "artisan" : "client";
      const fullName = isAdminEmail 
        ? "Admin User (Demo)" 
        : isArtisanEmail 
          ? "Emeka Anthony Nwosu (Demo)" 
          : "Chidinma Lekki (Demo)";

      const mockUser = {
        id: mockUserId,
        email,
        phone: "+2348145558839",
      } as User;

      const mockProfile: Profile = {
        id: mockUserId,
        full_name: fullName,
        email,
        role,
        phone_number: "+2348145558839",
      };

      setUser(mockUser);
      setProfile(mockProfile);
      setBypassMode(true);
      localStorage.setItem(
        "myfix_demo_session",
        JSON.stringify({ user: mockUser, profile: mockProfile })
      );
      return { error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error: error.message };

      if (data.user) {
        const userProfile = await fetchProfile(data.user.id);
        setProfile(userProfile);
      }
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : "An unexpected error occurred" };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: "client" | "artisan"
  ) => {
    if (!supabaseConfigured || !supabase) {
      // Simulated sign up
      const mockUserId = `demo-user-${Math.random().toString(36).substr(2, 9)}`;
      const mockUser = {
        id: mockUserId,
        email,
        phone: "+2348145558839",
      } as User;

      const mockProfile: Profile = {
        id: mockUserId,
        full_name: fullName,
        email,
        role,
        phone_number: "+2348145558839",
      };

      setUser(mockUser);
      setProfile(mockProfile);
      setBypassMode(true);
      localStorage.setItem(
        "myfix_demo_session",
        JSON.stringify({ user: mockUser, profile: mockProfile })
      );
      return { error: null };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
          },
        },
      });

      if (error) return { error: error.message };

      if (data.user) {
        const userProfile = await fetchProfile(data.user.id);
        setProfile(userProfile);
      }
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : "An unexpected signup error occurred" };
    }
  };

  const signOut = async () => {
    if (supabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    setBypassMode(false);
    localStorage.removeItem("myfix_demo_session");
  };

  const enableBypassMode = (demoRole: "client" | "artisan" | "admin" = "client") => {
    const mockUserId = "demo-bypass-id-67890";
    const mockUser = {
      id: mockUserId,
      email: demoRole === "admin" ? "admin@myfix.ng" : demoRole === "artisan" ? "emeka@myfix.ng" : "chidinma@myfix.ng",
      phone: "+2348145558839",
    } as User;

    const mockProfile: Profile = {
      id: mockUserId,
      full_name: demoRole === "admin" ? "Admin User (Demo)" : demoRole === "artisan" ? "Emeka Anthony Nwosu (Demo)" : "Chidinma Lekki (Demo)",
      email: mockUser.email,
      role: demoRole,
      phone_number: "+2348145558839",
    };

    setUser(mockUser);
    setProfile(mockProfile);
    setBypassMode(true);
    localStorage.setItem(
      "myfix_demo_session",
      JSON.stringify({ user: mockUser, profile: mockProfile })
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        supabaseConfigured,
        bypassMode,
        signIn,
        signUp,
        signOut,
        enableBypassMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
