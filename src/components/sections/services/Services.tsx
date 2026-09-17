"use client";

import { useLenis } from "lenis/react";
import { useCallback, useRef, useState } from "react";
import { services } from "@/content/site";
import { gsap, useGSAP } from "@/lib/animation/gsap";
import { scene } from "@/lib/animation/sceneState";
import { EASE, MEDIA, PIN, SCRUB, STAGGER } from "@/lib/animation/tokens";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RoomOverlay } from "./RoomOverlay";
import { RoomRail } from "./RoomRail";
import { ServicesStatic } from "./ServicesStatic";

/**
 * Timeline units (total 12):
 *  0.0–1.2  heading out, logo flies into camera, portal opens
 *  per room i (base = 1.2 + i·2.6): overlay in → hold (label roomN) → overlay out → liquid wipe to next
 * 11.0–12.0 portal closes, logo returns to guide form (master timeline)
 */
const OPEN = 1.2;
const SEG = 2.6;
const TOTAL = 12;

export function Services() {
  const reduced = useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const [active, setActive] = useState(0);
  const lenis = useLenis();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add({ desktop: MEDIA.desktop, mobile: MEDIA.mobile }, (ctx) => {
        const { desktop } = ctx.conditions as { desktop: boolean };
        const overlays = gsap.utils.toArray<HTMLElement>(".room-overlay");
        let current = 0;

        const tl = gsap.timeline({
          defaults: { ease: EASE.none },
          scrollTrigger: {
            id: "services",
            trigger: section.current,
            start: "top top",
            end: desktop ? PIN.services.desktop : PIN.services.mobile,
            pin: true,
            scrub: SCRUB,
            onUpdate: () => {
              const r = Math.round(scene.room);
              if (r !== current) {
                current = r;
                setActive(r);
              }
            },
            onLeave: () => gsap.set(scene, { portal: 0 }),
            onLeaveBack: () => gsap.set(scene, { portal: 0, room: 0 }),
          },
        });
        tlRef.current = tl;

        tl.set(scene, { portal: 0, room: 0 }, 0)
          .to(".services-heading", { autoAlpha: 0, y: -60, filter: "blur(10px)", duration: 0.6 }, 0)
          .to(scene, { portal: 1, duration: 1, ease: "power2.in" }, 0.2)
          .fromTo(".room-scrim", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, OPEN - 0.3)
          .fromTo(".room-rail", { autoAlpha: 0, x: 20 }, { autoAlpha: 1, x: 0, duration: 0.4 }, OPEN - 0.2);

        overlays.forEach((overlay, i) => {
          const base = OPEN + i * SEG;
          const items = overlay.querySelectorAll(".room-reveal");
          tl.set(overlay, { autoAlpha: 1 }, base)
            .fromTo(
              items,
              { autoAlpha: 0, y: 48 },
              { autoAlpha: 1, y: 0, stagger: STAGGER.items * 0.5, duration: 0.5 },
              base,
            )
            .addLabel(`room${i}`, base + 0.9);

          const outAt = i < overlays.length - 1 ? base + 1.7 : TOTAL - 1;
          tl.to(items, { autoAlpha: 0, y: -36, stagger: STAGGER.items * 0.3, duration: 0.3 }, outAt).set(
            overlay,
            { autoAlpha: 0 },
            outAt + 0.35,
          );

          if (i < overlays.length - 1) tl.to(scene, { room: i + 1, duration: 0.8, ease: "sine.inOut" }, base + 1.8);
        });

        tl.to(".room-rail", { autoAlpha: 0, x: 20, duration: 0.3 }, TOTAL - 1)
          .to(".room-scrim", { autoAlpha: 0, duration: 0.4 }, TOTAL - 0.9)
          .to(scene, { portal: 0, duration: 0.9, ease: "power2.out" }, TOTAL - 0.9)
          .set({}, {}, TOTAL);

        return () => {
          tlRef.current = null;
          gsap.set(scene, { portal: 0, room: 0 });
        };
      });

      return () => mm.revert();
    },
    { scope: section, dependencies: [reduced], revertOnUpdate: true },
  );

  const goTo = useCallback(
    (i: number) => {
      const tl = tlRef.current;
      if (!tl?.scrollTrigger) return;
      lenis?.scrollTo(tl.scrollTrigger.labelToScroll(`room${i}`), { duration: 1.6 });
    },
    [lenis],
  );

  if (reduced) return <ServicesStatic />;

  return (
    <section id="services" ref={section} aria-labelledby="services-title" className="relative h-svh overflow-hidden">
      <div className="services-heading container-site flex h-full flex-col items-center justify-center text-center">
        <SectionHeading
          id="services-title"
          eyebrow={services.eyebrow}
          title={services.title}
          sub={services.sub}
          align="center"
          size="xl"
        />
      </div>

      <div aria-hidden className="room-scrim pointer-events-none invisible absolute inset-0">
        <div className="absolute inset-0 scrim-bottom" />
        <div className="absolute inset-0 opacity-70 scrim-left" />
      </div>

      {services.rooms.map((room, i) => (
        <RoomOverlay key={room.slug} room={room} i={i} />
      ))}
      <RoomRail active={active} onSelect={goTo} />
    </section>
  );
}
