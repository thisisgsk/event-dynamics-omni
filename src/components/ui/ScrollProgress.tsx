"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/animation/gsap";

/** Thin gradient bar showing overall page progress. */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const setScale = gsap.quickSetter(bar.current, "scaleX");
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => setScale(self.progress),
    });
    return () => st.kill();
  });

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-[2px]">
      <div ref={bar} className="h-full origin-left scale-x-0 shadow-[0_0_12px_rgb(235_185_46/0.9)] bg-accent" />
    </div>
  );
}
