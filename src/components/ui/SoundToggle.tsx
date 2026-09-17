"use client";

import { motion } from "motion/react";
import { useSound } from "@/components/providers/SoundProvider";
import { ui } from "@/content/site";
import { BEZIER, DURATION } from "@/lib/animation/tokens";

const BARS = [0.45, 1, 0.65, 0.85];

/** Equaliser-style toggle. Audio stays off until the visitor opts in. */
export function SoundToggle() {
  const { enabled, toggle } = useSound();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={enabled ? ui.sound.on : ui.sound.off}
      data-cursor={enabled ? "Mute" : "Sound"}
      className="flex h-11 w-11 items-center justify-center gap-[3px] rounded-full border border-line bg-white/[0.03] backdrop-blur-md transition-colors duration-(--duration-micro) hover:border-white/30"
    >
      {BARS.map((h, i) => (
        <motion.span
          key={i}
          className="block w-[2px] origin-bottom rounded-full bg-accent"
          style={{ height: 14 }}
          animate={enabled ? { scaleY: [h, 0.25, 1, h] } : { scaleY: 0.18 }}
          transition={
            enabled
              ? { duration: 1.1 + i * 0.15, repeat: Infinity, ease: "easeInOut" }
              : { duration: DURATION.micro, ease: BEZIER.out }
          }
        />
      ))}
    </button>
  );
}
