import {
  ensureProfile,
  pullLibrary,
  pullProfile,
  pullProgress,
  pushProgress,
  upsertDeck,
  upsertQuiz,
} from "./cloud";
import { useLibrary } from "@/store/library";
import { useProgress, levelFromXp, type ProgressData } from "@/store/progress";
import { useProfile } from "@/store/profile";
import { useAuth } from "@/store/auth";
import { DEFAULT_AVATAR } from "./avatar";
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
 * Load a user's decks, quizzes, progress and profile from Supabase into the
 * stores. Brand-new accounts get seeded with sample content and a profile.
 */
export async function bootstrapUser(userId: string): Promise<void> {
  const email = useAuth.getState().user?.email ?? "";
  const defaultName = (email.split("@")[0] || "Student").slice(0, 24);

  const progressRaw = await pullProgress(userId);
  let { decks, quizzes } = await pullLibrary(userId);

  let progress: ProgressData = EMPTY_PROGRESS;
  if (progressRaw === null) {
    if (decks.length === 0 && quizzes.length === 0) {
      decks = SEED_DECKS();
      quizzes = SEED_QUIZZES();
      await Promise.all([
        ...decks.map((d) => upsertDeck(userId, d)),
        ...quizzes.map((q) => upsertQuiz(userId, q)),
      ]);
    }
    await pushProgress(userId, EMPTY_PROGRESS);
  } else {
    progress = { ...EMPTY_PROGRESS, ...(progressRaw as Partial<ProgressData>) };
  }
  useProgress.getState().hydrate(progress);
  useLibrary.getState().hydrate(decks, quizzes);

  // Profile (display name + avatar). Create one if this account doesn't have it.
  let profile = await pullProfile(userId);
  if (!profile) {
    profile = await ensureProfile(userId, {
      display_name: defaultName,
      avatar: DEFAULT_AVATAR,
      xp: progress.xp,
      level: levelFromXp(progress.xp).level,
      best_blitz: progress.bestBlitz,
    });
  }
  useProfile.getState().hydrate({ displayName: profile.display_name, avatar: profile.avatar });
}
