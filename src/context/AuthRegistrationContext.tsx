"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";

export type AuthRegistrationContextValue = {
  user: User | null;
  registrationExists: boolean;
  loading: boolean; // loading during auth state transitions (not initial layout fetch)
};

const AuthRegistrationContext = createContext<
  AuthRegistrationContextValue | undefined
>(undefined);

type InitialSnapshot = { user: User | null; registrationExists: boolean };

type ProviderProps = {
  initial: InitialSnapshot;
  children: ReactNode;
};

export function AuthRegistrationProvider({ initial, children }: ProviderProps) {
  const supabase = createClient();
  const initializedRef = useRef(false);
  const [state, setState] = useState<AuthRegistrationContextValue>({
    user: initial.user,
    registrationExists: initial.registrationExists,
    loading: false,
  });

  // Internal initialize() function (runs only once) to satisfy design contract
  const initialize = useCallback((snapshot: InitialSnapshot) => {
    if (initializedRef.current) return;
    setState({
      user: snapshot.user,
      registrationExists: snapshot.registrationExists,
      loading: false,
    });
    initializedRef.current = true;
  }, []);

  useEffect(() => {
    initialize(initial);
  }, [initial, initialize]);

  // Central auth subscription (single source of truth for user changes)
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState((prev) => ({
        ...prev,
        user: session?.user ?? null,
        // mark transient loading false once event processed
        loading: false,
      }));
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <AuthRegistrationContext.Provider value={state}>
      {children}
    </AuthRegistrationContext.Provider>
  );
}

export function useAuthRegistration(): AuthRegistrationContextValue {
  const ctx = useContext(AuthRegistrationContext);
  if (!ctx) {
    throw new Error(
      "useAuthRegistration must be used within an AuthRegistrationProvider",
    );
  }
  return ctx;
}
