"use client";

import { create } from "zustand";
import { todayKey } from "@/lib/utils";
import { useAuth } from "@/store/auth";
import { pushProgress } from "@/lib/cloud";

export interface PlayResult {
  game: string;
  source: string;
  score: number;
  xp: number;
  at: number;
}

export interface ProgressData {
  xp: number;
  plays: number;
  streak: number;
  lastDay: string | null;
  bestBlitz: number;
  history: PlayResult[];
}

interface ProgressState extends ProgressData {
  loaded: boolean;
  hydrate: (data: Partial<ProgressData>) => void;
  clear: () => void;
  recordPlay: (r: Omit<PlayResult, "at">) => void;
  reset: () => void;
}

const EMPTY: ProgressData = {
  xp: 0,
  plays: 0,
  streak: 0,
  lastDay: null,
  bestBlitz: 0,
  history: [],
};

const uidOf = () => useAuth.getState().user?.id;

function snapshot(s: ProgressData): ProgressData {
  return {
    xp: s.xp,
    plays: s.plays,
    streak: s.streak,
    lastDay: s.lastDay,
    bestBlitz: s.bestBlitz,
    history: s.history,
  };
}

export const useProgress = create<ProgressState>()((set, get) => ({
  ...EMPTY,
  loaded: false,

  hydrate: (data) => set({ ...EMPTY, ...data, loaded: true }),
  clear: () => set({ ...EMPTY, loaded: false }),

  recordPlay: (r) => {
    const today = todayKey();
    const { lastDay, streak } = get();
    let nextStreak = streak;
    if (lastDay !== today) {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const yKey = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, "0")}-${String(y.getDate()).padStart(2, "0")}`;
      nextStreak = lastDay === yKey ? streak + 1 : 1;
    }
    const entry: PlayResult = { ...r, at: Date.now() };
    set({
      xp: get().xp + Math.max(0, Math.round(r.xp)),
      plays: get().plays + 1,
      streak: nextStreak,
      lastDay: today,
      bestBlitz:
        r.game === "Inferno Blitz" ? Math.max(get().bestBlitz, Math.round(r.score)) : get().bestBlitz,
      history: [entry, ...get().history].slice(0, 50),
    });
    const u = uidOf();
    if (u) pushProgress(u, snapshot(get()));
  },

  reset: () => {
    set({ ...EMPTY, loaded: true });
    const u = uidOf();
    if (u) pushProgress(u, EMPTY);
  },
}));

/** XP level curve: each level needs a bit more than the last. */
export function levelFromXp(xp: number): { level: number; into: number; need: number } {
  let level = 1;
  let need = 100;
  let remaining = xp;
  while (remaining >= need) {
    remaining -= need;
    level += 1;
    need = Math.round(need * 1.35);
  }
  return { level, into: remaining, need };
}
