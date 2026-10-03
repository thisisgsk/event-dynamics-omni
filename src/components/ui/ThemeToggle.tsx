"use client";

import { motion } from "motion/react";
import { useTheme } from "next-themes";
import { useEffect, useId, useState } from "react";
import { ui } from "@/content/site";
import { BEZIER, DURATION } from "@/lib/animation/tokens";
import { switchTheme, type ThemeName } from "@/lib/theme/switchTheme";
import { cn } from "@/lib/utils/cn";
import { useMagnetic } from "@/hooks/useMagnetic";
import { useSound } from "@/components/providers/SoundProvider";

const RAYS = Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 4);
const transition = { duration: DURATION.ui, ease: BEZIER.out };

/**
 * Sun ⇄ moon toggle. The icon shows the current theme: the moon's bite slides out and the rays grow in as it
 * becomes the sun, and the whole glyph turns half a revolution.
 */
export function ThemeToggle({
  className,
  tooltip = "below",
}: {
  className?: string;
  /** "below": centred under the button (navbar) · "above-end": above, right-aligned (mobile menu, at the screen edge) */
  tooltip?: "below" | "above-end";
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const magnetic = useMagnetic<HTMLButtonElement>(0.4);
  const { tick } = useSound();
  const maskId = `moon-bite-${useId().replace(/:/g, "")}`;

  useEffect(() => setMounted(true), []);

  // Before hydration the theme is unknown: render the dark state (the original look), labelled neutrally
  const dark = !mounted || resolvedTheme !== "light";
  const next: ThemeName = dark ? "light" : "dark";
  const label = mounted ? (dark ? ui.theme.toLight : ui.theme.toDark) : ui.theme.toggle;

  return (
    <motion.button
      ref={magnetic.ref}
      type="button"
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        switchTheme(next, setTheme, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      }}
      onMouseMove={magnetic.onMouseMove}
      onMouseEnter={tick}
      onMouseLeave={magnetic.onMouseLeave}
      style={{ x: magnetic.x, y: magnetic.y }}
      aria-label={label}
      data-cursor={dark ? "Light" : "Dark"}
      className={cn(
        "group relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-ink/[0.03] text-fg backdrop-blur-md transition-colors duration-(--duration-micro) hover:border-ink/30",
        className,
      )}
    >
      <motion.svg
        viewBox="0 0 24 24"
        aria-hidden
        className="h-[1.15rem] w-[1.15rem]"
        style={{ x: magnetic.x, y: magnetic.y }}
        initial={false}
        animate={{ rotate: dark ? 0 : 180 }}
        transition={transition}
      >
        <mask id={maskId}>
          <rect width="24" height="24" fill="white" />
          <motion.circle
            r="7"
            fill="black"
            initial={false}
            animate={dark ? { cx: 17, cy: 7 } : { cx: 32, cy: -8 }}
            transition={transition}
          />
        </mask>
        <motion.circle
          cx="12"
          cy="12"
          fill="currentColor"
          mask={`url(#${maskId})`}
          initial={false}
          animate={{ r: dark ? 8 : 4.6 }}
          transition={transition}
        />
        <motion.g
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          initial={false}
          animate={{ opacity: dark ? 0 : 1, scale: dark ? 0.4 : 1 }}
          transition={transition}
          style={{ transformOrigin: "12px 12px" }}
        >
          {RAYS.map((a) => (
            <line
              key={a}
              x1={12 + Math.cos(a) * 7.6}
              y1={12 + Math.sin(a) * 7.6}
              x2={12 + Math.cos(a) * 9.8}
              y2={12 + Math.sin(a) * 9.8}
            />
          ))}
        </motion.g>
      </motion.svg>

      {/* Tooltip: visual only — the accessible name comes from aria-label */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute rounded-full bg-fg px-3 py-1.5 text-[0.7rem] font-medium tracking-wide whitespace-nowrap text-bg opacity-0 shadow-(--shadow) transition-[opacity,transform] duration-(--duration-micro) ease-(--ease-out) group-hover:opacity-100 group-focus-visible:opacity-100",
          tooltip === "below"
            ? "top-full left-1/2 mt-3 -translate-x-1/2 -translate-y-1 group-hover:translate-y-0 group-focus-visible:translate-y-0"
            : "right-0 bottom-full mb-3 translate-y-1 group-hover:translate-y-0 group-focus-visible:translate-y-0",
        )}
      >
        {label}
      </span>
    </motion.button>
  );
}
