"use client";

import { Check, Flame, Palette, RotateCcw, Type } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button, Card, CardHeader, Segmented, Toggle } from "@/components/ui";
import { useSettings } from "@/store/settings";
import { useHydrated } from "@/lib/use-hydrated";
import { ACCENTS, DENSITIES, FONTS, RADII, THEMES } from "@/lib/theme-options";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const hydrated = useHydrated();
  const s = useSettings();

  if (!hydrated) return <div className="skeleton h-64" />;

  return (
    <div>
      <PageHeader title="Settings" subtitle="Make LearnFerno look the way you like. Saved to this browser." />

      <div className="space-y-6">
        {/* theme */}
        <Card>
          <CardHeader title="Theme" icon={<Flame size={16} />} />
          <div className="p-5 pt-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => s.setTheme(t.id)}
                  className={cn(
                    "relative overflow-hidden rounded-[var(--radius-soft)] border-2 p-3 text-left transition",
                    s.theme === t.id ? "border-accent" : "border-line hover:border-muted",
                  )}
                >
                  <div className="flex gap-1.5">
                    <span className="h-8 w-8 rounded-lg" style={{ background: t.swatch[0] }} />
                    <span className="h-8 w-8 rounded-lg" style={{ background: t.swatch[1] }} />
                  </div>
                  <p className="mt-2 text-sm font-medium">{t.label}</p>
                  {s.theme === t.id && (
                    <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-accent text-accent-fg">
                      <Check size={12} />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* accent */}
        <Card>
          <CardHeader title="Accent color" icon={<Palette size={16} />} />
          <div className="p-5 pt-3">
            <div className="flex flex-wrap gap-3">
              {ACCENTS.map((a) => (
                <button
                  key={a.value}
                  onClick={() => s.setAccent(a.value)}
                  className="grid h-11 w-11 place-items-center rounded-full transition hover:scale-110"
                  style={{ background: a.value, boxShadow: s.accent === a.value ? `0 0 0 3px var(--surface), 0 0 0 5px ${a.value}` : "none" }}
                  title={a.name}
                >
                  {s.accent === a.value && <Check size={18} className="text-white drop-shadow" />}
                </button>
              ))}
              <label
                className="relative grid h-11 w-11 cursor-pointer place-items-center overflow-hidden rounded-full border border-line"
                title="Custom color"
                style={{ background: s.accent }}
              >
                <input
                  type="color"
                  value={s.accent}
                  onChange={(e) => s.setAccent(e.target.value)}
                  className="h-12 w-12 cursor-pointer opacity-0"
                />
                <span className="pointer-events-none absolute text-[0.6rem] font-bold text-white mix-blend-difference">＋</span>
              </label>
            </div>
          </div>
        </Card>

        {/* typography / shape */}
        <Card>
          <CardHeader title="Typography & shape" icon={<Type size={16} />} />
          <div className="space-y-5 p-5 pt-3">
            <Row label="Font">
              <Segmented value={s.font} onChange={s.setFont} options={FONTS.map((f) => ({ value: f.id, label: f.label }))} />
            </Row>
            <Row label="Corners">
              <Segmented value={s.radius} onChange={s.setRadius} options={RADII.map((r) => ({ value: r.id, label: r.label }))} />
            </Row>
            <Row label="Density">
              <Segmented value={s.density} onChange={s.setDensity} options={DENSITIES.map((d) => ({ value: d.id, label: d.label }))} />
            </Row>
          </div>
        </Card>

        {/* toggles */}
        <Card>
          <CardHeader title="Effects" />
          <div className="space-y-4 p-5 pt-3">
            <Row label="Glass / blur surfaces">
              <Toggle checked={s.glass} onChange={s.setGlass} />
            </Row>
            <Row label="Animations">
              <Toggle checked={s.animations} onChange={s.setAnimations} />
            </Row>
            <Row label="Sound effects">
              <Toggle checked={s.sound} onChange={s.setSound} />
            </Row>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button variant="outline" onClick={s.resetAll}>
            <RotateCcw size={16} /> Reset appearance to defaults
          </Button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </div>
  );
}
