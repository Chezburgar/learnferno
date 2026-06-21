import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client for LearnFerno.
 *
 * The URL and publishable (anon) key are safe to ship in a static client —
 * all access is gated by row-level security, which restricts every row to its
 * owner (auth.uid() = user_id). Override via env at build time if desired.
 */
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pvabeehplcwnyovkatey.supabase.co";
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_6QTx8zXyib7UE69-GgzElw_tVazwosZ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
