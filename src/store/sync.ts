"use client";

import { create } from "zustand";

interface SyncState {
  inflight: number;
  error: string | null;
  begin: () => void;
  end: (error?: string | null) => void;
}

export const useSync = create<SyncState>((set, get) => ({
  inflight: 0,
  error: null,
  begin: () => set({ inflight: get().inflight + 1 }),
  end: (error = null) =>
    set({ inflight: Math.max(0, get().inflight - 1), error: error ?? get().error }),
}));

/** Wrap a cloud write so the UI can show a "saving…" indicator and surface errors. */
export async function track<T>(p: Promise<T>): Promise<T | undefined> {
  const { begin, end } = useSync.getState();
  begin();
  try {
    const r = await p;
    end(null);
    return r;
  } catch (e) {
    console.error("[learnferno sync]", e);
    end(e instanceof Error ? e.message : "Sync failed");
    return undefined;
  }
}
