"use client";

import { useMotionValue, useSpring } from "motion/react";
import { useRef, type MouseEvent } from "react";
import { SPRING } from "@/lib/animation/tokens";

/** Magnetic hover: the element (and its content) drift toward the pointer, springing back on leave. */
export function useMagnetic<T extends HTMLElement>(strength = 0.35) {
  const ref = useRef<T>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, SPRING.magnetic);
  const sy = useSpring(y, SPRING.magnetic);

  const onMouseMove = (e: MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left - rect.width / 2) * strength);
    y.set((e.clientY - rect.top - rect.height / 2) * strength);
  };
  const onMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return { ref, x: sx, y: sy, onMouseMove, onMouseLeave };
}
