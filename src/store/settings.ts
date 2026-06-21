"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Density,
  FontId,
  RadiusId,
  ThemeId,
} from "@/lib/theme-options";

interface SettingsState {
  theme: ThemeId;
  accent: string;
  font: FontId;
  density: Density;
  radius: RadiusId;
  glass: boolean;
  animations: boolean;
  sound: boolean;
  hydrated: boolean;

  setTheme: (t: ThemeId) => void;
  setAccent: (c: string) => void;
  setFont: (f: FontId) => void;
  setDensity: (d: Density) => void;
  setRadius: (r: RadiusId) => void;
  setGlass: (v: boolean) => void;
  setAnimations: (v: boolean) => void;
  setSound: (v: boolean) => void;
  resetAll: () => void;
}

const DEFAULTS = {
  theme: "inferno" as ThemeId,
  accent: "#ff5a1f",
  font: "sans" as FontId,
  density: "cozy" as Density,
  radius: "soft" as RadiusId,
  glass: true,
  animations: true,
  sound: true,
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      hydrated: false,

      setTheme: (theme) => set({ theme }),
      setAccent: (accent) => set({ accent }),
      setFont: (font) => set({ font }),
      setDensity: (density) => set({ density }),
      setRadius: (radius) => set({ radius }),
      setGlass: (glass) => set({ glass }),
      setAnimations: (animations) => set({ animations }),
      setSound: (sound) => set({ sound }),
      resetAll: () => set({ ...DEFAULTS }),
    }),
    {
      name: "lf-settings",
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
