"use client";

import { useSettings } from "@/store/settings";

/* ------------------------------------------------------------------ */
/*  Tiny synthesized sound-effects engine (Web Audio API).            */
/*  No audio files — every sound is generated from oscillators, so it  */
/*  stays light and works offline. Respects the user's sound setting.  */
/* ------------------------------------------------------------------ */

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function enabled(): boolean {
  try {
    return useSettings.getState().sound;
  } catch {
    return true;
  }
}

interface ToneOpts {
  freq: number;
  dur: number;
  type?: OscillatorType;
  when?: number;
  gain?: number;
  slideTo?: number;
}

function tone({ freq, dur, type = "sine", when = 0, gain = 0.18, slideTo }: ToneOpts) {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + when;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

const play = (fn: () => void) => {
  if (!enabled()) return;
  try {
    fn();
  } catch {
    /* ignore audio errors */
  }
};

export const sfx = {
  click: () => play(() => tone({ freq: 320, dur: 0.06, type: "triangle", gain: 0.08 })),

  flip: () => play(() => tone({ freq: 380, dur: 0.16, type: "sine", gain: 0.1, slideTo: 620 })),

  correct: () =>
    play(() => {
      tone({ freq: 660, dur: 0.12, type: "sine", gain: 0.16 });
      tone({ freq: 990, dur: 0.16, type: "sine", when: 0.1, gain: 0.16 });
    }),

  wrong: () =>
    play(() => {
      tone({ freq: 200, dur: 0.28, type: "sawtooth", gain: 0.14, slideTo: 120 });
    }),

  match: () =>
    play(() => {
      tone({ freq: 720, dur: 0.1, type: "triangle", gain: 0.14 });
      tone({ freq: 1080, dur: 0.14, type: "triangle", when: 0.08, gain: 0.12 });
    }),

  /** Rising chirp whose pitch climbs with the current streak. */
  streak: (n: number) =>
    play(() => {
      const base = 520 + Math.min(n, 12) * 55;
      tone({ freq: base, dur: 0.12, type: "square", gain: 0.1 });
    }),

  start: () =>
    play(() => {
      [392, 523, 659].forEach((f, i) =>
        tone({ freq: f, dur: 0.14, type: "triangle", when: i * 0.07, gain: 0.12 }),
      );
    }),

  finish: () =>
    play(() => {
      [523, 659, 784, 1046].forEach((f, i) =>
        tone({ freq: f, dur: 0.18, type: "sine", when: i * 0.1, gain: 0.14 }),
      );
    }),

  levelUp: () =>
    play(() => {
      [523, 659, 784, 1046, 1318].forEach((f, i) =>
        tone({ freq: f, dur: 0.22, type: "triangle", when: i * 0.1, gain: 0.16 }),
      );
    }),

  tick: () => play(() => tone({ freq: 880, dur: 0.04, type: "square", gain: 0.05 })),

  gameOver: () =>
    play(() => {
      [440, 330, 247].forEach((f, i) =>
        tone({ freq: f, dur: 0.22, type: "sawtooth", when: i * 0.12, gain: 0.12 }),
      );
    }),
};
