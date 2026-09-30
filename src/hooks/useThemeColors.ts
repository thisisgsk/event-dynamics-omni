"use client";

import { useMemo, useSyncExternalStore } from "react";

/** sRGB 0…1 */
export type RGB = { r: number; g: number; b: number };

type ThemeName = "light" | "dark";

export type ThemeColors = {
  theme: ThemeName;
  bgTop: RGB;
  bgBottom: RGB;
  logoE: RGB;
  logoD: RGB;
  line: RGB;
  particle: RGB;
  strong: RGB;
};

/** CSS token (globals.css, "3D scene" group) behind each colour */
const TOKENS: Record<Exclude<keyof ThemeColors, "theme">, string> = {
  bgTop: "--scene-bg-top",
  bgBottom: "--scene-bg-bottom",
  logoE: "--scene-logo-e",
  logoD: "--scene-logo-d",
  line: "--scene-line",
  particle: "--scene-particle",
  strong: "--scene-strong",
};

function parseHex(value: string): RGB | null {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim());
  if (!m) return null;
  const hex = m[1].length === 3 ? [...m[1]].map((c) => c + c).join("") : m[1];
  const v = parseInt(hex, 16);
  return { r: ((v >> 16) & 255) / 255, g: ((v >> 8) & 255) / 255, b: (v & 255) / 255 };
}

// The theme lives in <html>'s class list (next-themes / switchTheme), so watch that directly: it updates
// before any React work, whichever way the theme changed (toggle, OS setting, another tab).
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}
const getSnapshot = (): ThemeName => (document.documentElement.classList.contains("dark") ? "dark" : "light");
const getServerSnapshot = (): ThemeName => "dark";

/**
 * The resolved theme plus the current values of the 3D scene's colour tokens, re-read whenever the theme
 * changes. Client-only (the canvas is never server-rendered).
 */
export function useThemeColors(): ThemeColors {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return useMemo(() => {
    const styles = getComputedStyle(document.documentElement);
    const colors = { theme } as ThemeColors;
    for (const [key, token] of Object.entries(TOKENS) as Array<[keyof typeof TOKENS, string]>) {
      const rgb = parseHex(styles.getPropertyValue(token));
      if (!rgb && process.env.NODE_ENV === "development") console.warn(`[theme] ${token} must be a hex colour`);
      colors[key] = rgb ?? { r: 1, g: 0, b: 1 };
    }
    return colors;
  }, [theme]);
}
