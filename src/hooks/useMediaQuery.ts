"use client";

import { useSyncExternalStore } from "react";

/** SSR-safe media query subscription (returns `fallback` on the server). */
export function useMediaQuery(query: string, fallback = false) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => fallback,
  );
}
