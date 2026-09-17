"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useRef, type MouseEvent, type ReactNode } from "react";
import { SPRING } from "@/lib/animation/tokens";
import { cn } from "@/lib/utils/cn";

/** 3D tilt on hover with a moving specular highlight. */
export function TiltCard({ children, className, max = 10 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), SPRING.tilt);
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), SPRING.tilt);
  const glareX = useTransform(px, (v) => `${v * 100}%`);
  const glareY = useTransform(py, (v) => `${v * 100}%`);
  const glare = useTransform(
    [glareX, glareY],
    ([x, y]) => `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,0.22), transparent 55%)`,
  );

  const onMove = (e: MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  };
  const reset = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <div className={cn("[perspective:1100px]", className)}>
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={reset}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative h-full w-full"
      >
        {children}
        <motion.div
          aria-hidden
          style={{ background: glare }}
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 mix-blend-overlay transition-opacity duration-(--duration-ui) group-hover:opacity-100"
        />
      </motion.div>
    </div>
  );
}
