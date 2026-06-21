import { supabase } from "./supabase";
import { track } from "@/store/sync";
import type { Deck, Quiz } from "./types";

/* ------------------------------------------------------------------ */
/*  Cloud persistence — decks, quizzes and progress live in Supabase   */
/*  as one JSONB row each, scoped to the signed-in user by RLS.        */
/* ------------------------------------------------------------------ */

export async function pullLibrary(userId: string): Promise<{ decks: Deck[]; quizzes: Quiz[] }> {
  const [decksRes, quizzesRes] = await Promise.all([
    supabase.from("decks").select("data").eq("user_id", userId),
    supabase.from("quizzes").select("data").eq("user_id", userId),
  ]);
  if (decksRes.error) throw decksRes.error;
  if (quizzesRes.error) throw quizzesRes.error;
  const decks = (decksRes.data ?? [])
    .map((r) => r.data as Deck)
    .sort((a, b) => b.updatedAt - a.updatedAt);
  const quizzes = (quizzesRes.data ?? [])
    .map((r) => r.data as Quiz)
    .sort((a, b) => b.updatedAt - a.updatedAt);
  return { decks, quizzes };
}

export function upsertDeck(userId: string, deck: Deck) {
  return track(
    Promise.resolve(
      supabase
        .from("decks")
        .upsert({ id: deck.id, user_id: userId, name: deck.name, data: deck, updated_at: new Date().toISOString() })
        .then(({ error }) => {
          if (error) throw error;
        }),
    ),
  );
}

export function upsertQuiz(userId: string, quiz: Quiz) {
  return track(
    Promise.resolve(
      supabase
        .from("quizzes")
        .upsert({ id: quiz.id, user_id: userId, name: quiz.name, data: quiz, updated_at: new Date().toISOString() })
        .then(({ error }) => {
          if (error) throw error;
        }),
    ),
  );
}

export function deleteRow(table: "decks" | "quizzes", id: string) {
  return track(
    Promise.resolve(
      supabase
        .from(table)
        .delete()
        .eq("id", id)
        .then(({ error }) => {
          if (error) throw error;
        }),
    ),
  );
}

export function deleteAllRows(userId: string, table: "decks" | "quizzes") {
  return track(
    Promise.resolve(
      supabase
        .from(table)
        .delete()
        .eq("user_id", userId)
        .then(({ error }) => {
          if (error) throw error;
        }),
    ),
  );
}

export async function pullProgress(userId: string): Promise<unknown | null> {
  const { data, error } = await supabase
    .from("progress")
    .select("data")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data?.data ?? null;
}

export function pushProgress(userId: string, data: unknown) {
  return track(
    Promise.resolve(
      supabase
        .from("progress")
        .upsert({ user_id: userId, data, updated_at: new Date().toISOString() })
        .then(({ error }) => {
          if (error) throw error;
        }),
    ),
  );
}
