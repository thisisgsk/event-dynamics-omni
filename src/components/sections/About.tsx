"use client";

import { useRef } from "react";
import { about } from "@/content/site";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/animation/gsap";
import { DURATION, EASE, MEDIA, PIN, SCRUB, STAGGER } from "@/lib/animation/tokens";
import { GlassCard } from "@/components/ui/GlassCard";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** Stats row counts as "entered" when its top crosses 80% of the viewport height */
const ENTER_AT = 0.8;

const formatCount = (v: number) => Math.round(v).toLocaleString("en-US");

export function About() {
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add({ desktop: MEDIA.desktop, mobile: MEDIA.mobile }, (ctx) => {
        const { desktop } = ctx.conditions as { desktop: boolean };
        const split = SplitText.create(".about-body p", { type: "lines", linesClass: "about-line" });
        const counters = gsap.utils.toArray<HTMLElement>("[data-count]");

        // Card rises into place while the section scrolls in (before the pin)
        gsap.from(".about-card", {
          y: "28vh",
          rotateX: 8,
          ease: EASE.none,
          scrollTrigger: { trigger: section.current, start: "top bottom", end: "top top", scrub: SCRUB },
        });

        const tl = gsap.timeline({
          defaults: { ease: EASE.none },
          scrollTrigger: {
            id: "about",
            trigger: section.current,
            start: "top top",
            end: desktop ? PIN.about.desktop : PIN.about.mobile,
            pin: true,
            scrub: SCRUB,
          },
        });

        tl.fromTo(
          split.lines,
          { autoAlpha: 0.12, y: 14 },
          { autoAlpha: 1, y: 0, stagger: STAGGER.lines, duration: 0.5 },
          0,
        );

        // Stat counters are NOT scrubbed: once the row enters the viewport they play through together, once.
        const values = counters.map(() => ({ v: 0 }));
        gsap.set(".about-stat", { autoAlpha: 0, y: 24 });
        const stats = section.current!.querySelector<HTMLElement>(".about-stats")!;
        ScrollTrigger.create({
          trigger: stats,
          // "top 80%", resolved against the About pin. Layout offsets (not getBoundingClientRect) so the
          // card's rise transform can't shift it; while pinned the row sits at a fixed viewport position.
          start: () => {
            const pin = ScrollTrigger.getById("about");
            const threshold = window.innerHeight * ENTER_AT;
            let offset = 0;
            for (
              let el: HTMLElement | null = stats;
              el && el !== section.current;
              el = el.offsetParent as HTMLElement
            ) {
              offset += el.offsetTop;
            }
            if (!pin) return offset - threshold;
            // Row already above the line when the pin begins → it entered during the approach
            return offset <= threshold ? pin.start + offset - threshold : pin.end + offset - threshold;
          },
          refreshPriority: -1, // after the About pin so its start/end are final
          once: true,
          onEnter: () => {
            gsap.to(".about-stat", {
              autoAlpha: 1,
              y: 0,
              duration: DURATION.ui,
              ease: EASE.out,
              stagger: STAGGER.counters,
            });
            counters.forEach((el, i) => {
              gsap.to(values[i], {
                v: Number(el.dataset.count),
                duration: DURATION.counter,
                ease: EASE.out,
                delay: i * STAGGER.counters,
                onUpdate: () => (el.textContent = formatCount(values[i].v)),
              });
            });
          },
        });

        tl.from(".about-cta", { autoAlpha: 0, y: 20, duration: 0.2 }, 0.8).to({}, { duration: 0.15 });

        return () => split.revert();
      });

      mm.add(MEDIA.reduced, () => {
        gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
          el.textContent = formatCount(Number(el.dataset.count));
        });
      });

      return () => mm.revert();
    },
    { scope: section },
  );

  return (
    <section
      id="about"
      ref={section}
      aria-labelledby="about-title"
      className="relative flex min-h-svh items-center py-24"
    >
      <div className="container-site grid-12 w-full [perspective:1200px]">
        <GlassCard className="about-card col-span-12 p-7 md:col-span-10 md:p-9 lg:col-span-7 lg:p-11 xl:col-span-6">
          <SectionHeading
            id="about-title"
            eyebrow={about.eyebrow}
            title={about.title}
            titleClassName="!text-[clamp(2rem,3.3vw,3.4rem)]"
          />
          <div className="about-body mt-6 space-y-3 text-[0.98rem] leading-relaxed text-fg/85 md:text-base">
            {about.body.map((p) => (
              <p key={p.slice(0, 16)}>{p}</p>
            ))}
          </div>

          <dl className="about-stats mt-8 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-line pt-7 lg:grid-cols-4">
            {about.stats.map((s) => (
              <div key={s.label} className="about-stat flex flex-col-reverse">
                <dt className="mt-2 eyebrow text-[0.65rem]">{s.label}</dt>
                <dd className="font-display text-4xl leading-none font-bold tabular-nums lg:text-[2.5rem]">
                  <span data-count={s.value} className="tabular-nums">
                    0
                  </span>
                  <span className="text-gradient">{s.suffix}</span>
                </dd>
              </div>
            ))}
          </dl>

          <div className="about-cta mt-8">
            <MagneticButton href={about.cta.href} variant="glow" cursorLabel="Plan">
              {about.cta.label}
              <span aria-hidden>→</span>
            </MagneticButton>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
