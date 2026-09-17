"use client";

import Image from "next/image";
import { useRef } from "react";
import { experiences } from "@/content/site";
import { gsap, useGSAP } from "@/lib/animation/gsap";
import { EASE, MEDIA, SCRUB } from "@/lib/animation/tokens";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TiltCard } from "@/components/ui/TiltCard";

type Item = (typeof experiences.items)[number];

function ExperienceCard({ item, index }: { item: Item; index: number }) {
  return (
    <li className="exp-card w-[78vw] shrink-0 snap-center sm:w-[56vw] md:w-[34vw] lg:w-[26vw]">
      <TiltCard className="h-full">
        <article
          data-cursor="View"
          className="group relative isolate h-[62svh] max-h-[640px] min-h-[420px] overflow-hidden rounded-card border border-line bg-surface"
        >
          <Image
            src={item.image}
            alt={`${item.title}, ${item.place}`}
            fill
            sizes="(min-width: 1024px) 26vw, (min-width: 768px) 34vw, 78vw"
            className="-z-10 scale-105 object-cover saturate-[0.55] transition-[transform,filter] duration-[1.2s] ease-out group-hover:scale-[1.14] group-hover:hue-rotate-[-12deg] group-hover:saturate-[1.2]"
          />
          <div aria-hidden className="absolute inset-0 -z-10 scrim-bottom" />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 opacity-0 mix-blend-soft-light transition-opacity duration-(--duration-ui) bg-accent-diag group-hover:opacity-60"
          />
          <div className="flex h-full flex-col justify-between p-6 md:p-7">
            <div className="flex items-center justify-between text-xs tracking-[0.2em] text-fg/80 uppercase">
              <span className="rounded-full border border-white/20 bg-black/30 px-3 py-1.5 backdrop-blur-md">
                {item.category}
              </span>
              <span className="tabular-nums">{String(index + 1).padStart(2, "0")}</span>
            </div>
            <div>
              <p className="mb-2 eyebrow !text-fg/70">
                {item.place} · {item.year}
              </p>
              <h3 className="font-display text-2xl leading-tight font-bold md:text-[1.7rem]">{item.title}</h3>
            </div>
          </div>
        </article>
      </TiltCard>
    </li>
  );
}

export function Experiences() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MEDIA.desktop, () => {
        const el = track.current!;
        const distance = () => el.scrollWidth - window.innerWidth;
        const cards = gsap.utils.toArray<HTMLElement>(".exp-card");
        const skewTo = cards.map((c) => gsap.quickTo(c, "skewX", { duration: 0.5, ease: EASE.out }));

        gsap.to(el, {
          x: () => -distance(),
          ease: EASE.none,
          scrollTrigger: {
            id: "experiences",
            trigger: section.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: SCRUB,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const skew = gsap.utils.clamp(-8, 8, self.getVelocity() / -260);
              skewTo.forEach((fn) => fn(skew));
            },
            onScrubComplete: () => skewTo.forEach((fn) => fn(0)),
          },
        });
      });

      // Mobile / reduced motion: native horizontal swipe; the trigger only anchors the guide logo
      mm.add(`${MEDIA.mobile}`, () => {
        gsap.timeline({
          scrollTrigger: { id: "experiences", trigger: section.current, start: "top center", end: "bottom center" },
        });
      });

      return () => mm.revert();
    },
    { scope: section },
  );

  return (
    <section
      id="experiences"
      ref={section}
      aria-labelledby="experiences-title"
      className="relative overflow-hidden py-24 md:flex md:h-svh md:items-center md:py-0"
    >
      <ul
        ref={track}
        className="flex snap-x snap-mandatory [scrollbar-width:none] items-center gap-5 overflow-x-auto px-[var(--gutter)] pb-4 md:snap-none md:gap-8 md:overflow-visible md:pr-[12vw] md:pb-0"
      >
        <li className="w-[86vw] shrink-0 md:w-[36vw] md:pr-10 lg:w-[30vw]">
          <SectionHeading
            id="experiences-title"
            eyebrow={experiences.eyebrow}
            title={experiences.title}
            sub={experiences.sub}
          />
        </li>
        {experiences.items.map((item, i) => (
          <ExperienceCard key={item.title} item={item} index={i} />
        ))}
      </ul>
    </section>
  );
}
