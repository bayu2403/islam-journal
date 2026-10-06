"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type AuthState = {
  session: Session | null;
  isGuest: boolean;
  loading: boolean;
};

const AuthContext = createContext<AuthState>({ session: null, isGuest: true, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ session: null, isGuest: true, loading: true });

  useEffect(() => {
    let cancelled = false;

    async function ensureSession() {
      const { data } = await supabase.auth.getSession();
      let session = data.session;
      if (!session) {
        const { data: anon, error } = await supabase.auth.signInAnonymously();
        if (error) {
          console.error("Anonymous sign-in failed:", error.message);
          if (!cancelled) setState({ session: null, isGuest: true, loading: false });
          return;
        }
        session = anon.session;
      }
      if (!cancelled) {
        setState({ session, isGuest: session?.user.is_anonymous ?? true, loading: false });
      }
    }

    ensureSession();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ session, isGuest: session?.user.is_anonymous ?? true, loading: false });
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
