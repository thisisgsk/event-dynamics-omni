"use client";

import { ReactLenis, useLenis, type LenisRef } from "lenis/react";
import { useEffect, useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/animation/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/** Keeps ScrollTrigger in lockstep with Lenis. */
function LenisBridge() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;
    lenis.on("scroll", ScrollTrigger.update);
    return () => lenis.off("scroll", ScrollTrigger.update);
  }, [lenis]);

  return null;
}

/** Refresh triggers once fonts and late images settle so pin positions are exact. */
function RefreshOnAssets() {
  useEffect(() => {
    let cancelled = false;
    const refresh = () => {
      if (cancelled) return;
      // Sections that mount late must still refresh in page order, or pin spacing is miscounted
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    };
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);
    return () => {
      cancelled = true;
      window.removeEventListener("load", refresh);
    };
  }, []);
  return null;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const update = (time: number) => lenisRef.current?.lenis?.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => gsap.ticker.remove(update);
  }, []);

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        autoRaf: false,
        lerp: reduced ? 1 : 0.09,
        smoothWheel: !reduced,
        wheelMultiplier: 0.9,
        anchors: false,
      }}
    >
      <LenisBridge />
      <RefreshOnAssets />
      {children}
    </ReactLenis>
  );
}
