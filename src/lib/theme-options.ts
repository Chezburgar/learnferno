export type ThemeId =
  | "system"
  | "inferno"
  | "ember"
  | "magma"
  | "charcoal"
  | "smoke"
  | "ash"
  | "solar";

export type FontId = "sans" | "serif" | "rounded" | "mono";
export type Density = "compact" | "cozy" | "spacious";
export type RadiusId = "sharp" | "soft" | "round";

export const THEMES: { id: ThemeId; label: string; swatch: [string, string]; dark: boolean }[] = [
  { id: "system", label: "System", swatch: ["#140805", "#faf4ee"], dark: true },
  { id: "inferno", label: "Inferno", swatch: ["#140805", "#2a130b"], dark: true },
  { id: "ember", label: "Ember", swatch: ["#170406", "#2d0c0f"], dark: true },
  { id: "magma", label: "Magma", swatch: ["#0f0a06", "#241a0f"], dark: true },
  { id: "charcoal", label: "Charcoal", swatch: ["#000000", "#15100b"], dark: true },
  { id: "smoke", label: "Smoke", swatch: ["#0d0f12", "#1d2128"], dark: true },
  { id: "ash", label: "Ash", swatch: ["#faf4ee", "#fffdfa"], dark: false },
  { id: "solar", label: "Solar", swatch: ["#fff7ed", "#ffffff"], dark: false },
];

export const ACCENTS: { name: string; value: string }[] = [
  { name: "Flame", value: "#ff5a1f" },
  { name: "Lava", value: "#ff3d00" },
  { name: "Ember", value: "#f97316" },
  { name: "Inferno", value: "#ef4444" },
  { name: "Crimson", value: "#dc2626" },
  { name: "Gold", value: "#f5b301" },
  { name: "Amber", value: "#fbbf24" },
  { name: "Coral", value: "#fb7185" },
  { name: "Plasma", value: "#a855f7" },
  { name: "Cyan", value: "#22d3ee" },
];

export const FONTS: { id: FontId; label: string; stack: string }[] = [
  { id: "sans", label: "Sans", stack: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' },
  { id: "rounded", label: "Rounded", stack: 'ui-rounded, "SF Pro Rounded", "Segoe UI", "Nunito", system-ui, sans-serif' },
  { id: "serif", label: "Serif", stack: 'Georgia, "Iowan Old Style", "Times New Roman", serif' },
  { id: "mono", label: "Mono", stack: 'ui-monospace, "Cascadia Code", "Fira Code", monospace' },
];

export const RADII: { id: RadiusId; label: string; px: number }[] = [
  { id: "sharp", label: "Sharp", px: 6 },
  { id: "soft", label: "Soft", px: 18 },
  { id: "round", label: "Round", px: 28 },
];

export const DENSITIES: { id: Density; label: string }[] = [
  { id: "compact", label: "Compact" },
  { id: "cozy", label: "Cozy" },
  { id: "spacious", label: "Spacious" },
];
