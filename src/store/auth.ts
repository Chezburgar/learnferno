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
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    // New accounts are auto-confirmed by a DB trigger, so there's no email step.
    // If signUp didn't already return a session, sign in immediately.
    if (data.session) return {};
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      // Fallback: confirmation really was required and the auto-confirm didn't apply.
      return { needsConfirm: true };
    }
    return {};
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, status: "anon" });
  },
}));
