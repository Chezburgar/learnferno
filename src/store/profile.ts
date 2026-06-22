"use client";

import { create } from "zustand";
import type { Avatar } from "@/lib/avatar";
import { DEFAULT_AVATAR, sanitizeAvatar } from "@/lib/avatar";
import { useAuth } from "@/store/auth";
import { upsertProfileIdentity } from "@/lib/cloud";

interface ProfileState {
  displayName: string;
  avatar: Avatar;
  loaded: boolean;

  hydrate: (data: { displayName: string; avatar: unknown }) => void;
  clear: () => void;
  setDisplayName: (name: string) => void;
  setAvatar: (patch: Partial<Avatar>) => void;
}

const uidOf = () => useAuth.getState().user?.id;

export const useProfile = create<ProfileState>()((set, get) => ({
  displayName: "Student",
  avatar: DEFAULT_AVATAR,
  loaded: false,

  hydrate: (data) =>
    set({
      displayName: data.displayName || "Student",
      avatar: sanitizeAvatar(data.avatar),
      loaded: true,
    }),

  clear: () => set({ displayName: "Student", avatar: DEFAULT_AVATAR, loaded: false }),

  setDisplayName: (name) => {
    const displayName = name.slice(0, 24);
    set({ displayName });
    const u = uidOf();
    if (u) upsertProfileIdentity(u, { display_name: displayName || "Student" });
  },

  setAvatar: (patch) => {
    const avatar = { ...get().avatar, ...patch };
    set({ avatar });
    const u = uidOf();
    if (u) upsertProfileIdentity(u, { avatar });
  },
}));
