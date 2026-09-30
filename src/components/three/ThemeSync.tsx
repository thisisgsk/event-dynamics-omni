"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/animation/gsap";
import { scene } from "@/lib/animation/sceneState";
import { LIGHT_SCENE } from "@/lib/theme/scene";
import { useThemeColors, type ThemeColors } from "@/hooks/useThemeColors";

const COLOR_KEYS = [
  "bgTop",
  "bgBottom",
  "logoE",
  "logoD",
  "line",
  "particle",
  "strong",
] as const satisfies ReadonlyArray<keyof ThemeColors>;

/**
 * Bridges the CSS theme into the scene store: tweens `scene.theme` toward the current tokens.
 * The first sync (page load) and switches covered by a View Transition reveal jump instead of tweening.
 */
export function ThemeSync() {
  const colors = useThemeColors();
  const first = useRef(true);

  useEffect(() => {
    const t = scene.theme;
    const instant = first.current || t.instant || scene.reduced;
    first.current = false;
    t.instant = false;
    const vars = { duration: instant ? 0 : LIGHT_SCENE.fade, ease: "power2.inOut", overwrite: true };

    gsap.to(t, { light: colors.theme === "light" ? 1 : 0, ...vars });
    COLOR_KEYS.forEach((key) => gsap.to(t[key], { ...colors[key], ...vars }));
    // Reduced motion renders on demand: keep frames flowing while the values settle
    window.dispatchEvent(new Event("ed:invalidate"));
  }, [colors]);

  return null;
}
