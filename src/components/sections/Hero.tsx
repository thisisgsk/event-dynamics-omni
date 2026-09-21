"use client";

import { useRef } from "react";
import { hero } from "@/content/site";
import { gsap, SplitText, useGSAP } from "@/lib/animation/gsap";
import { onReady } from "@/lib/animation/ready";
import { EASE, MEDIA, PIN, SCRUB, STAGGER } from "@/lib/animation/tokens";

/** Split the headline into two halves that drift apart. */
function splitHeadline(text: string) {
  const words = text.split(" ");
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

export function Hero() {
  const section = useRef<HTMLElement>(null);
  const [lineA, lineB] = splitHeadline(hero.headline);
  // Brand name in the sub-line is the yellow accent
  const [subHead, subTail] = hero.subline.split(" — ");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const splits = gsap.utils
        .toArray<HTMLElement>(".hero-line")
        .map((el) => SplitText.create(el, { type: "words,chars", mask: "chars" }));
      const chars = splits.flatMap((s) => s.chars);

      // Intro reveal plays once the preloader lifts (part of the preloader sequence)
      gsap.set(chars, { yPercent: 115 });
      // Resolve inside the scoped context: onReady may fire after this callback returns
      const supporting = gsap.utils.toArray<HTMLElement>(".hero-sub, .hero-hint");
      gsap.set(supporting, { autoAlpha: 0, y: 24 });
      const off = onReady(() => {
        gsap
          .timeline()
          .to(chars, { yPercent: 0, duration: 1.1, ease: EASE.out, stagger: STAGGER.chars })
          .to(supporting, { autoAlpha: 1, y: 0, duration: 0.8, ease: EASE.out, stagger: STAGGER.items }, "-=0.6");
      });

      mm.add({ desktop: MEDIA.desktop, mobile: MEDIA.mobile }, (ctx) => {
        const { desktop } = ctx.conditions as { desktop: boolean };
        const tl = gsap.timeline({
          scrollTrigger: {
            id: "hero",
            trigger: section.current,
            start: "top top",
            end: desktop ? PIN.hero.desktop : PIN.hero.mobile,
            pin: true,
            scrub: SCRUB,
          },
        });
        const wordsA = splits[0].words;
        const wordsB = splits[1].words;
        // Scroll animates the wrapper so it never fights the intro reveal on the inner elements
        tl.to(".hero-bottom", { autoAlpha: 0, y: -40, filter: "blur(8px)", duration: 0.45, ease: EASE.none }, 0)
          .to(
            wordsA,
            {
              xPercent: (i) => -60 - i * 45,
              z: 200,
              scale: 1.25,
              filter: "blur(14px)",
              autoAlpha: 0,
              stagger: 0.04,
              ease: EASE.none,
            },
            0,
          )
          .to(
            wordsB,
            {
              xPercent: (i) => 60 + (wordsB.length - i) * 45,
              z: 200,
              scale: 1.25,
              filter: "blur(14px)",
              autoAlpha: 0,
              stagger: { each: 0.04, from: "end" },
              ease: EASE.none,
            },
            0,
          );
      });

      // Mouse parallax on text layers (separate wrappers so it never fights the scroll timeline)
      mm.add(MEDIA.desktop, () => {
        const layers = gsap.utils.toArray<HTMLElement>("[data-depth]").map((el) => ({
          depth: parseFloat(el.dataset.depth ?? "0"),
          x: gsap.quickTo(el, "x", { duration: 1.2, ease: EASE.out }),
          y: gsap.quickTo(el, "y", { duration: 1.2, ease: EASE.out }),
        }));
        const move = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          layers.forEach((l) => {
            l.x(nx * l.depth * 60);
            l.y(ny * l.depth * 40);
          });
        };
        window.addEventListener("pointermove", move);
        return () => window.removeEventListener("pointermove", move);
      });

      return () => {
        off();
        mm.revert();
        splits.forEach((s) => s.revert());
      };
    },
    { scope: section },
  );

  return (
    <section id="top" ref={section} aria-label="Introduction" className="relative h-svh overflow-hidden">
      <div className="relative container-site flex h-full flex-col justify-between pt-28 pb-10 [perspective:900px] md:pt-32 md:pb-12">
        <h1 className="pointer-events-none relative mt-[6vh] display-xl uppercase [transform-style:preserve-3d]">
          <span data-depth="0.5" className="block">
            <span className="hero-line block text-brand-white">{lineA}</span>
          </span>
          <span data-depth="1" className="mt-[26vh] block text-right md:mt-[30vh]">
            <span className="hero-line block text-brand-yellow [text-shadow:0_0_40px_rgb(235_185_46/0.35)]">
              {lineB}
            </span>
          </span>
        </h1>

        <div className="hero-bottom flex items-end justify-between gap-6">
          <p className="hero-sub max-w-sm text-base text-fg/85 md:text-lg">
            <span className="font-medium text-brand-yellow">{subHead}</span>
            {subTail && <> — {subTail}</>}
          </p>
          <div className="hero-hint flex flex-col items-center gap-3" aria-hidden>
            <span className="eyebrow text-[0.65rem]">{hero.scrollHint}</span>
            <span className="relative block h-12 w-px overflow-hidden bg-line">
              <span className="absolute inset-x-0 top-0 h-1/2 animate-[scroll-hint_1.8s_var(--ease-in-out)_infinite] bg-brand-yellow" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
