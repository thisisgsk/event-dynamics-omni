"use client";

import { MEDIA } from "@/lib/animation/tokens";
import { useMediaQuery } from "./useMediaQuery";

export function useReducedMotion() {
  return useMediaQuery(MEDIA.reduced);
}
