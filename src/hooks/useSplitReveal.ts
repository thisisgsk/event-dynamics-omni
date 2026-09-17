"use client";

import type { RefObject } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/animation/gsap";
import { EASE, MEDIA, SCRUB, STAGGER } from "@/lib/animation/tokens";

type Options = {
  /** Element that drives the ScrollTrigger (defaults to the text element) */
  trigger?: RefObject<HTMLElement | null>;
  start?: string;
  end?: string;
  /** Extra elements (eyebrow, sub-copy) faded in on the same trigger */
  companions?: Array<RefObject<HTMLElement | null>>;
  /** Horizontal container tween when used inside a horizontal track */
  containerAnimation?: gsap.core.Animation;
};

/**
 * The one headline reveal used across the site: masked lines, chars rise with a stagger, scrubbed to scroll.
 * Re-splits automatically on resize / font load.
 */
export function useSplitReveal(ref: RefObject<HTMLElement | null>, opts: Options = {}) {
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      mm.add(`${MEDIA.desktop}, ${MEDIA.mobile}`, () => {
        const trigger = opts.trigger?.current ?? el;
        const companions = (opts.companions ?? []).map((r) => r.current).filter(Boolean) as HTMLElement[];
        const scrollTrigger = {
          trigger,
          start: opts.start ?? "top 88%",
          end: opts.end ?? "top 45%",
          scrub: SCRUB,
          containerAnimation: opts.containerAnimation,
        };

        if (companions.length) {
          gsap.from(companions, { autoAlpha: 0, y: 24, ease: EASE.out, stagger: STAGGER.items, scrollTrigger });
        }

        const split = SplitText.create(el, {
          type: "lines,words,chars",
          mask: "lines",
          linesClass: "split-line",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.chars, {
              yPercent: 115,
              rotate: 6,
              ease: EASE.out,
              stagger: STAGGER.chars,
              scrollTrigger,
            }),
        });

        return () => split.revert();
      });

      return () => mm.revert();
    },
    { dependencies: [opts.containerAnimation] },
  );
}
