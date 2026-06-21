import { pullLibrary, pullProgress, pushProgress, upsertDeck, upsertQuiz } from "./cloud";
import { useLibrary } from "@/store/library";
import { useProgress, type ProgressData } from "@/store/progress";
import { SEED_DECKS, SEED_QUIZZES } from "./seed";

const EMPTY_PROGRESS: ProgressData = {
  xp: 0,
  plays: 0,
  streak: 0,
  lastDay: null,
  bestBlitz: 0,
  history: [],
};

/**
 * Load a user's decks, quizzes and progress from Supabase into the stores.
 * Brand-new accounts (no progress row yet) get seeded with sample content.
 */
export async function bootstrapUser(userId: string): Promise<void> {
  const progressRaw = await pullProgress(userId);
  let { decks, quizzes } = await pullLibrary(userId);

  if (progressRaw === null) {
    // First sign-in for this account: seed example content so it isn't empty.
    if (decks.length === 0 && quizzes.length === 0) {
      decks = SEED_DECKS();
      quizzes = SEED_QUIZZES();
      await Promise.all([
        ...decks.map((d) => upsertDeck(userId, d)),
        ...quizzes.map((q) => upsertQuiz(userId, q)),
      ]);
    }
    await pushProgress(userId, EMPTY_PROGRESS);
    useProgress.getState().hydrate(EMPTY_PROGRESS);
  } else {
    useProgress.getState().hydrate((progressRaw as Partial<ProgressData>) ?? {});
  }

  useLibrary.getState().hydrate(decks, quizzes);
}
