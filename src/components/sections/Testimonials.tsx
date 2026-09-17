"use client";

import { useRef } from "react";
import { work } from "@/content/site";
import { gsap, useGSAP } from "@/lib/animation/gsap";
import { EASE, MEDIA, SCRUB } from "@/lib/animation/tokens";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ClientMarquee } from "./ClientMarquee";

const STACK_TOP = 18; // vh
const STACK_STEP = 1.6; // rem offset per card

export function Testimonials() {
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(`${MEDIA.desktop}, ${MEDIA.mobile}`, () => {
        gsap.timeline({
          scrollTrigger: { id: "work", trigger: ".work-stack", start: "top center", end: "bottom center" },
        });

        const cards = gsap.utils.toArray<HTMLElement>(".testimonial-card");
        cards.forEach((card, i) => {
          const next = cards[i + 1];
          if (!next) return;
          // Each card peels back as the next one slides over it
          gsap.to(card.querySelector(".testimonial-inner"), {
            scale: 0.9,
            rotateX: -10,
            yPercent: -6,
            filter: "brightness(0.45) blur(2px)",
            ease: EASE.none,
            scrollTrigger: {
              trigger: next,
              start: "top bottom",
              end: `top ${STACK_TOP}%`,
              scrub: SCRUB,
            },
          });
        });
      });

      return () => mm.revert();
    },
    { scope: section },
  );

  return (
    <section id="work" ref={section} aria-labelledby="work-title" className="relative pt-28 pb-12 md:pt-40">
      <div className="container-site">
        <SectionHeading id="work-title" eyebrow={work.eyebrow} title={work.title} titleClassName="max-w-4xl" />
      </div>

      <div className="mt-14 md:mt-20">
        <ClientMarquee />
      </div>

      <div className="work-stack container-site mt-20 grid-12 md:mt-32">
        <div className="col-span-12 md:col-span-5">
          <div className="md:sticky md:top-[18vh]">
            <p className="text-gradient font-display text-[7rem] leading-none md:text-[10rem]" aria-hidden>
              “
            </p>
            <p className="max-w-xs text-muted">
              {work.testimonials.length} voices from clients who trusted Event Dynamics with their most important
              moments.
            </p>
          </div>
        </div>

        <ol className="col-span-12 mt-10 md:col-span-7 md:mt-0">
          {work.testimonials.map((t, i) => (
            <li
              key={t.name}
              className="testimonial-card sticky mb-[14vh] [perspective:1200px] last:mb-0"
              style={{ top: `calc(${STACK_TOP}vh + ${i * STACK_STEP}rem)` }}
            >
              <GlassCard
                as="figure"
                className="testimonial-inner flex min-h-[46svh] origin-top flex-col justify-between bg-bg/70 p-8 md:p-12"
              >
                <div className="flex items-center justify-between">
                  <span className="eyebrow">
                    {String(i + 1).padStart(2, "0")} / {String(work.testimonials.length).padStart(2, "0")}
                  </span>
                  <span aria-hidden className="h-px w-16 bg-accent" />
                </div>
                <blockquote className="mt-8 font-display text-2xl leading-snug font-medium text-balance md:text-[2.1rem]">
                  {t.quote}
                </blockquote>
                <figcaption className="mt-10">
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-sm text-muted">{t.role}</p>
                </figcaption>
              </GlassCard>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
