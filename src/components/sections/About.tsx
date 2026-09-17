"use client";

import { useRef } from "react";
import { about } from "@/content/site";
import { gsap, SplitText, useGSAP } from "@/lib/animation/gsap";
import { EASE, MEDIA, PIN, SCRUB, STAGGER } from "@/lib/animation/tokens";
import { GlassCard } from "@/components/ui/GlassCard";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { SectionHeading } from "@/components/ui/SectionHeading";

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
        ).from(".about-stat", { autoAlpha: 0, y: 30, stagger: STAGGER.items, duration: 0.3 }, 0.35);

        counters.forEach((el, i) => {
          const target = Number(el.dataset.count);
          const obj = { v: 0 };
          tl.to(
            obj,
            {
              v: target,
              duration: 0.45,
              onUpdate: () => (el.textContent = Math.round(obj.v).toLocaleString("en-US")),
            },
            0.4 + i * 0.06,
          );
        });

        tl.from(".about-cta", { autoAlpha: 0, y: 20, duration: 0.2 }, 0.8).to({}, { duration: 0.15 });

        return () => split.revert();
      });

      mm.add(MEDIA.reduced, () => {
        gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
          el.textContent = Number(el.dataset.count).toLocaleString("en-US");
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

          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-line pt-7 lg:grid-cols-4">
            {about.stats.map((s) => (
              <div key={s.label} className="about-stat flex flex-col-reverse">
                <dt className="mt-2 eyebrow text-[0.65rem]">{s.label}</dt>
                <dd className="font-display text-4xl leading-none font-bold lg:text-[2.5rem]">
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
