"use client";

import { useRef } from "react";
import { work } from "@/content/site";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/animation/gsap";
import { EASE, MEDIA } from "@/lib/animation/tokens";

/** Simple typographic marks for the sample clients — replace with real SVG logos. */
const GLYPHS = ["◆", "✦", "◐", "▲", "✺", "⬡", "◈", "●"];

function Row() {
  return (
    <>
      {work.clients.map((name, i) => (
        <li key={name} className="flex shrink-0 items-center gap-3 px-8 md:px-12">
          <span aria-hidden className="text-gradient text-2xl">
            {GLYPHS[i % GLYPHS.length]}
          </span>
          <span className="font-display text-2xl font-semibold tracking-tight whitespace-nowrap text-fg/70 md:text-4xl">
            {name}
          </span>
        </li>
      ))}
    </>
  );
}

/** Infinite marquee whose speed and direction react to scroll velocity. */
export function ClientMarquee() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`${MEDIA.desktop}, ${MEDIA.mobile}`, () => {
        const loop = gsap.to(".marquee-track", { xPercent: -50, duration: 38, ease: EASE.none, repeat: -1 });
        // Start deep into the repeat cycle so a negative timeScale (scrolling up) can run backwards indefinitely
        loop.totalTime(loop.duration() * 500);
        const st = ScrollTrigger.create({
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            const v = self.getVelocity();
            const boost = gsap.utils.clamp(1, 7, 1 + Math.abs(v) / 350);
            gsap.to(loop, { timeScale: boost * (v < 0 ? -1 : 1), duration: 0.2, overwrite: true });
            gsap.to(loop, { timeScale: v < 0 ? -1 : 1, duration: 1.2, delay: 0.2, ease: EASE.out });
          },
        });
        return () => st.kill();
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      className="relative overflow-hidden border-y border-line [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)] py-8"
    >
      <p className="sr-only">Clients: {work.clients.join(", ")}</p>
      <ul aria-hidden className="marquee-track flex w-max">
        <Row />
        <Row />
      </ul>
    </div>
  );
}
