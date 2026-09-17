"use client";

import { useProgress } from "@react-three/drei";
import { useLenis } from "lenis/react";
import { useEffect, useRef, useState } from "react";
import { brand, preloader } from "@/content/site";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/animation/gsap";
import { markReady } from "@/lib/animation/ready";
import { scene } from "@/lib/animation/sceneState";
import { EASE, STAGGER } from "@/lib/animation/tokens";
import { BrandTagline } from "./BrandLogo";

const MIN_TIME = 1.2;

/**
 * 0 → 100% counter (real loader progress), wireframe contour draw-in, chrome shader dissolve,
 * letter-by-letter wordmark, then a gradient wipe unlocks scrolling.
 */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const wordmark = useRef<HTMLParagraphElement>(null);
  const { progress, active, loaded: loaded_, total } = useProgress();
  const [canvasReady, setCanvasReady] = useState(false);
  const lenis = useLenis();
  const [done, setDone] = useState(false);
  const shown = useRef({ value: 0 });
  const started = useRef(false);
  const t0 = useRef(0);
  const split = useRef<SplitText | null>(null);

  // Split + hide the wordmark immediately so it can reveal letter by letter later
  useGSAP(() => {
    split.current = SplitText.create(wordmark.current, { type: "chars", mask: "chars" });
    gsap.set(split.current.chars, { yPercent: 110 });
    return () => split.current?.revert();
  });

  useEffect(() => {
    t0.current = performance.now();
    document.documentElement.classList.add("is-loading");
    window.scrollTo(0, 0);
    if (scene.canvasReady) setCanvasReady(true);
    const onCanvas = () => setCanvasReady(true);
    window.addEventListener("ed:canvas", onCanvas);
    return () => window.removeEventListener("ed:canvas", onCanvas);
  }, []);

  useEffect(() => {
    if (!done) lenis?.stop();
  }, [lenis, done]);

  // Smoothly chase real progress (never runs backwards)
  useGSAP(
    () => {
      gsap.to(shown.current, {
        value: Math.max(shown.current.value, progress),
        duration: 0.6,
        ease: EASE.out,
        overwrite: true,
        onUpdate: () => {
          const v = Math.round(shown.current.value);
          if (counter.current) counter.current.textContent = String(v).padStart(3, "0");
          if (bar.current) bar.current.style.transform = `scaleX(${v / 100})`;
        },
      });
    },
    { dependencies: [progress], scope: root },
  );

  // Assets done → play the reveal
  useGSAP(
    () => {
      const loaded = canvasReady && !active && (total === 0 || loaded_ === total);
      if (!loaded || started.current) return;
      started.current = true;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const wait = Math.max(0, MIN_TIME - (performance.now() - t0.current) / 1000);
      const chars = split.current?.chars ?? [];

      const tl = gsap.timeline({
        delay: wait,
        onComplete: () => {
          document.documentElement.classList.remove("is-loading");
          setDone(true);
          lenis?.start();
          ScrollTrigger.sort();
          ScrollTrigger.refresh();
          markReady();
        },
      });

      tl.to(shown.current, {
        value: 100,
        duration: 0.4,
        onUpdate: () => {
          const v = Math.round(shown.current.value);
          if (counter.current) counter.current.textContent = String(v).padStart(3, "0");
          if (bar.current) bar.current.style.transform = `scaleX(${v / 100})`;
        },
      });

      if (reduced) {
        tl.set(scene.intro, { lines: 0, dissolve: 1 })
          .set(chars, { yPercent: 0 })
          .to(root.current, { autoAlpha: 0, duration: 0.4 });
        return;
      }

      tl.to(scene.intro, { lines: 1, duration: 1.6, ease: "power2.inOut" }, "<")
        .to(chars, { yPercent: 0, stagger: STAGGER.chars * 2, duration: 0.8, ease: EASE.out }, "<0.3")
        .to(scene.intro, { dissolve: 1, duration: 1.5, ease: "power2.inOut" }, "-=0.35")
        .to(".preloader-meta", { autoAlpha: 0, y: -12, duration: 0.5, ease: EASE.out }, "-=0.5")
        .to(root.current, { clipPath: "inset(0% 0% 100% 0%)", duration: 1.1, ease: EASE.inOut }, "-=0.2")
        .to(".preloader-edge", { bottom: "100%", duration: 1.1, ease: EASE.inOut }, "<");
    },
    { dependencies: [active, progress, lenis, canvasReady], scope: root },
  );

  if (done) return null;

  return (
    <div
      ref={root}
      role="status"
      aria-live="polite"
      aria-label={`${preloader.status}…`}
      className="fixed inset-0 z-[90] [clip-path:inset(0%_0%_0%_0%)]"
      style={{
        background:
          "radial-gradient(60% 60% at 50% 45%, rgba(7,7,10,0) 0%, rgba(7,7,10,0.55) 70%, rgba(7,7,10,0.9) 100%)",
      }}
    >
      <div className="preloader-edge absolute inset-x-0 bottom-0 h-px bg-accent" />
      <div className="absolute inset-x-0 bottom-0 container-site pb-8 md:pb-12">
        <p
          ref={wordmark}
          className="mb-6 text-center font-display text-[clamp(1.6rem,4.5vw,3.4rem)] font-bold tracking-[0.18em]"
        >
          {brand.wordmark}
        </p>
        <div className="preloader-meta flex items-end justify-between gap-6">
          <div>
            <p className="mb-2 eyebrow">{preloader.status}</p>
            <BrandTagline className="hidden text-[0.65rem] text-muted sm:inline-flex" />
          </div>
          <span className="font-display text-5xl leading-none font-bold tabular-nums md:text-7xl">
            <span ref={counter}>000</span>
            <span className="text-gradient">%</span>
          </span>
        </div>
        <div className="preloader-meta mt-5 h-px w-full bg-line">
          <div ref={bar} className="h-full origin-left scale-x-0 bg-accent" />
        </div>
      </div>
    </div>
  );
}
