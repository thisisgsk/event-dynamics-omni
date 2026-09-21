"use client";

import Image from "next/image";
import { useRef } from "react";
import { finale, services } from "@/content/site";
import { gsap, useGSAP } from "@/lib/animation/gsap";
import { EASE, MEDIA, PIN, SCRUB } from "@/lib/animation/tokens";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * Bento placement: 4 columns × 2 rows on desktop; the centre 2×2 stays empty for the 3D logo.
 * On mobile the tiles form two rows around a logo band.
 */
const PLACEMENT = [
  "col-start-1 row-start-1 md:col-start-1 md:row-start-1",
  "col-start-2 row-start-1 md:col-start-1 md:row-start-2",
  "col-start-1 row-start-3 md:col-start-4 md:row-start-1",
  "col-start-2 row-start-3 md:col-start-4 md:row-start-2",
];

/** Fly-in origins (x, y in vw/vh, rotation) — each tile arrives from its own side, never crossing another. */
const ORIGINS = [
  { x: -30, y: -20, rotateY: 35, rotateX: -15 },
  { x: -30, y: 20, rotateY: 35, rotateX: 15 },
  { x: 30, y: -20, rotateY: -35, rotateX: -15 },
  { x: 30, y: 20, rotateY: -35, rotateX: 15 },
];

export function Finale() {
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add({ desktop: MEDIA.desktop, mobile: MEDIA.mobile }, (ctx) => {
        const { desktop } = ctx.conditions as { desktop: boolean };
        const tiles = gsap.utils.toArray<HTMLElement>(".bento-tile");
        const tl = gsap.timeline({
          defaults: { ease: EASE.none },
          scrollTrigger: {
            id: "finale",
            trigger: section.current,
            start: "top top",
            end: desktop ? PIN.finale.desktop : PIN.finale.mobile,
            pin: true,
            scrub: SCRUB,
          },
        });

        // Sequential arrival: each tile lands fully before the next begins its final approach
        tiles.forEach((tile, i) => {
          const o = ORIGINS[i];
          tl.fromTo(
            tile,
            {
              xPercent: 0,
              x: `${o.x}vw`,
              y: `${o.y}vh`,
              z: -1800,
              rotateX: o.rotateX,
              rotateY: o.rotateY,
              autoAlpha: 0,
              filter: "blur(18px)",
            },
            {
              x: 0,
              y: 0,
              z: 0,
              rotateX: 0,
              rotateY: 0,
              autoAlpha: 1,
              filter: "blur(0px)",
              duration: 1,
              ease: "power2.out",
            },
            i * 0.55,
          );
        });

        tl.fromTo(
          ".finale-cta",
          { autoAlpha: 0, scale: 0.8, y: 30 },
          { autoAlpha: 1, scale: 1, y: 0, duration: 0.6, ease: EASE.out },
          2.4,
        ).to({}, { duration: 0.8 });
      });

      return () => mm.revert();
    },
    { scope: section },
  );

  return (
    <section
      id="finale"
      ref={section}
      aria-labelledby="finale-title"
      className="relative flex min-h-svh flex-col overflow-hidden py-24 md:h-svh md:py-0"
    >
      <div className="relative z-10 container-site md:absolute md:inset-x-0 md:top-[9vh]">
        <SectionHeading
          id="finale-title"
          eyebrow={finale.eyebrow}
          title={finale.title}
          align="center"
          titleClassName="mx-auto max-w-5xl !text-[clamp(2.2rem,4.6vw,4.6rem)]"
        />
      </div>

      <div className="container-site mt-12 flex flex-1 items-center md:mt-0">
        <ul
          aria-label="Our four rooms"
          className="grid w-full grid-cols-2 grid-rows-[repeat(3,auto)] gap-3 [perspective:1400px] md:mx-auto md:h-[48svh] md:max-w-[1200px] md:grid-cols-4 md:grid-rows-2 md:gap-4"
        >
          {services.rooms.map((room, i) => (
            <li key={room.slug} className={`bento-tile relative aspect-[4/3] md:aspect-auto ${PLACEMENT[i]}`}>
              <article className="group relative isolate h-full overflow-hidden rounded-card border border-line">
                <Image
                  src={room.image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="-z-10 object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
                />
                <div aria-hidden className="absolute inset-0 -z-10 scrim-bottom" />
                <div className="flex h-full flex-col justify-end p-4 md:p-5">
                  <p className="eyebrow !text-[0.6rem] !text-brand-yellow">Room {room.index}</p>
                  <h3 className="mt-1 font-display text-base leading-tight font-bold md:text-xl">{room.title}</h3>
                </div>
              </article>
            </li>
          ))}
          <li aria-hidden className="col-span-2 col-start-1 row-start-2 h-40 md:hidden" />
        </ul>
      </div>

      <div className="finale-cta relative z-10 mt-10 flex justify-center md:absolute md:inset-x-0 md:bottom-[8vh] md:mt-0">
        <MagneticButton href={finale.cta.href} variant="glow" size="lg" cursorLabel="Plan" strength={0.45}>
          {finale.cta.label}
          <span aria-hidden>→</span>
        </MagneticButton>
      </div>
    </section>
  );
}
