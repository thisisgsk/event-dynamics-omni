"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

type SoundCtx = { enabled: boolean; toggle: () => void; tick: () => void };

const SoundContext = createContext<SoundCtx>({ enabled: false, toggle: () => {}, tick: () => {} });

export const useSound = () => useContext(SoundContext);

type Engine = { ctx: AudioContext; master: GainNode };

/**
 * Procedural audio (no files to download): a soft ambient pad and a subtle UI tick.
 * Off by default; the AudioContext is only created after the user opts in.
 */
function createEngine(): Engine {
  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 900;
  filter.Q.value = 0.6;
  filter.connect(master);

  // A-major-ish pad: A2, E3, C#4, E4 with slight detune
  [110, 164.81, 277.18, 329.63].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = i % 2 === 0 ? "sine" : "triangle";
    osc.frequency.value = freq;
    osc.detune.value = (i - 1.5) * 4;
    const voice = ctx.createGain();
    voice.gain.value = 0.05 / (i + 1);

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.05 + i * 0.03;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.02 / (i + 1);
    lfo.connect(lfoGain).connect(voice.gain);

    osc.connect(voice).connect(filter);
    osc.start();
    lfo.start();
  });

  return { ctx, master };
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const engine = useRef<Engine | null>(null);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      if (next && !engine.current) engine.current = createEngine();
      const e = engine.current;
      if (e) {
        const now = e.ctx.currentTime;
        if (next) e.ctx.resume();
        e.master.gain.cancelScheduledValues(now);
        e.master.gain.setTargetAtTime(next ? 0.55 : 0, now, 0.6);
      }
      return next;
    });
  }, []);

  const tick = useCallback(() => {
    const e = engine.current;
    if (!e || !enabled) return;
    const now = e.ctx.currentTime;
    const osc = e.ctx.createOscillator();
    const gain = e.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(2200, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.05);
    gain.gain.setValueAtTime(0.025, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
    osc.connect(gain).connect(e.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }, [enabled]);

  useEffect(() => () => void engine.current?.ctx.close(), []);

  return <SoundContext.Provider value={{ enabled, toggle, tick }}>{children}</SoundContext.Provider>;
}
