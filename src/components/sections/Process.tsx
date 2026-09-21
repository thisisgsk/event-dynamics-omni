"use client";

import { useEffect, useRef, useState } from "react";
import { process as processContent } from "@/content/site";
import { gsap, useGSAP } from "@/lib/animation/gsap";
import { getAnchorFractions, getProcessPathD, PROCESS_ANCHORS, PROCESS_POINTS } from "@/lib/animation/processCurve";
import { EASE, MEDIA, PIN, SCRUB } from "@/lib/animation/tokens";
import { cn } from "@/lib/utils/cn";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** The drawing finishes slightly before the pin ends so the last card can breathe (matches GuideTimeline "process@0.92"). */
const DRAW_END = 0.92;

function useViewportSize() {
  const [size, setSize] = useState({ w: 1440, h: 900 });
  useEffect(() => {
    const update = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return size;
}

export function Process() {
  const section = useRef<HTMLElement>(null);
  const path = useRef<SVGPathElement>(null);
  const { w, h } = useViewportSize();
  const [reached, setReached] = useState(0);
  const d = getProcessPathD(w, h);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MEDIA.desktop, () => {
        const p = path.current!;
        const length = () => p.getTotalLength();
        let last = -1;

        gsap
          .timeline({
            defaults: { ease: EASE.none },
            scrollTrigger: {
              id: "process",
              trigger: section.current,
              start: "top top",
              end: PIN.process.desktop,
              pin: true,
              scrub: SCRUB,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                const drawn = Math.min(1, self.progress / DRAW_END);
                const count = getAnchorFractions(window.innerWidth, window.innerHeight).filter(
                  (f) => drawn >= f - 0.005,
                ).length;
                if (count !== last) {
                  last = count;
                  setReached(count);
                }
              },
            },
          })
          .fromTo(
            p,
            { strokeDasharray: length, strokeDashoffset: length },
            { strokeDasharray: length, strokeDashoffset: 0, duration: DRAW_END },
          )
          .to({}, { duration: 1 - DRAW_END });
      });

      mm.add(MEDIA.mobile, () => {
        let last = -1;
        gsap.fromTo(
          ".process-rail-fill",
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: EASE.none,
            scrollTrigger: {
              id: "process",
              trigger: ".process-list",
              start: "top center",
              end: "bottom center",
              scrub: SCRUB,
              onUpdate: (self) => {
                const count = Math.min(4, Math.floor(self.progress * 4.2));
                if (count !== last) {
                  last = count;
                  setReached(count);
                }
              },
            },
          },
        );
      });

      mm.add(MEDIA.reduced, () => setReached(processContent.steps.length));

      return () => mm.revert();
    },
    // Built once; path length and anchor fractions are re-read on every refresh (resize) so pin order stays stable
    { scope: section },
  );

  return (
    <section
      id="process"
      ref={section}
      aria-labelledby="process-title"
      className="relative py-24 md:h-svh md:overflow-hidden md:py-0"
    >
      <div className="relative z-10 container-site md:pt-28">
        <SectionHeading
          id="process-title"
          eyebrow={processContent.eyebrow}
          title={processContent.title}
          titleClassName="max-w-3xl"
        />
      </div>

      {/* Desktop: the path the 3D logo travels along */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden h-full w-full md:block"
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="process-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="var(--color-brand-yellow)" />
            <stop offset="0.55" stopColor="var(--color-yellow-soft)" />
            <stop offset="1" stopColor="var(--color-brand-white)" />
          </linearGradient>
        </defs>
        <path d={d} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeDasharray="4 8" />
        <path ref={path} d={d} fill="none" stroke="url(#process-gradient)" strokeWidth="2.5" strokeLinecap="round" />
      </svg>

      <ol className="process-list relative mt-14 space-y-5 pl-8 md:static md:mt-0 md:space-y-0 md:pl-0">
        <span aria-hidden className="absolute top-0 bottom-0 left-2 w-px bg-line md:hidden">
          <span className="process-rail-fill absolute inset-0 origin-top bg-accent" />
        </span>
        {processContent.steps.map((step, i) => {
          const [nx, ny] = PROCESS_POINTS[PROCESS_ANCHORS[i]];
          const active = i < reached;
          const yPct = ((1 - ny) / 2) * 100;
          return (
            <li
              key={step.title}
              className="relative md:absolute md:top-[62%] md:left-(--x) md:w-[min(21vw,300px)] md:-translate-x-1/2"
              style={{ ["--x" as string]: `${((nx + 1) / 2) * 100}%` }}
            >
              <span
                aria-hidden
                className={cn(
                  "absolute top-7 -left-[1.9rem] h-3 w-3 rounded-full border transition-all duration-(--duration-ui) md:hidden",
                  active ? "border-transparent bg-accent" : "border-white/30 bg-bg",
                )}
              />
              {/* Desktop: a thin tick connecting the card to its anchor on the path */}
              <span
                aria-hidden
                className={cn(
                  "absolute bottom-full left-1/2 hidden w-px origin-bottom transition-colors duration-(--duration-ui) md:block",
                  active ? "bg-white/40" : "bg-white/10",
                )}
                style={{ height: `calc(${62 - yPct}svh - 0.6rem)` }}
              />
              <GlassCard
                className={cn(
                  "p-6 transition-[opacity,transform,filter] duration-(--duration-ui) ease-out",
                  active ? "opacity-100" : "opacity-40 saturate-0 md:translate-y-4",
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn("font-display text-sm tracking-[0.2em]", active ? "text-gradient" : "text-muted")}
                  >
                    {step.index}
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      "h-2 w-2 rounded-full transition-colors duration-(--duration-ui)",
                      active ? "bg-brand-yellow shadow-[0_0_14px_var(--color-brand-yellow)]" : "bg-white/20",
                    )}
                  />
                </div>
                <h3 className="mt-4 font-display text-2xl font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
              </GlassCard>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
