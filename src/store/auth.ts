"use client";

import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type Status = "loading" | "authed" | "anon";

interface AuthState {
  user: User | null;
  status: Status;
  init: () => void;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string; needsConfirm?: boolean }>;
  signOut: () => Promise<void>;
}

let initialized = false;

export const useAuth = create<AuthState>((set) => ({
  user: null,
  status: "loading",

  init: () => {
    if (initialized) return;
    initialized = true;
    supabase.auth.getSession().then(({ data }) => {
      set({
        user: data.session?.user ?? null,
        status: data.session?.user ? "authed" : "anon",
      });
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      set({
        user: session?.user ?? null,
        status: session?.user ? "authed" : "anon",
      });
    });
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message };
  },

  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });
    if (error) return { error: error.message };
    // If no session is returned, the project requires email confirmation.
    return { needsConfirm: !data.session };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, status: "anon" });
  },
}));
