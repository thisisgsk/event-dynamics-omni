"use client";

import { useLenis } from "lenis/react";
import { useRef } from "react";
import { brand, footer } from "@/content/site";
import { gsap, SplitText, useGSAP } from "@/lib/animation/gsap";
import { EASE, MEDIA, SCRUB, STAGGER } from "@/lib/animation/tokens";
import { BrandTagline, Monogram } from "@/components/ui/BrandLogo";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { applyGradientToChars } from "@/lib/utils/gradientChars";

export function Footer() {
  const root = useRef<HTMLElement>(null);
  const wordmark = useRef<HTMLParagraphElement>(null);
  const lenis = useLenis();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`${MEDIA.desktop}, ${MEDIA.mobile}`, () => {
        const split = SplitText.create(wordmark.current, { type: "chars", mask: "chars" });
        applyGradientToChars(split.chars, wordmark.current!);
        gsap.from(split.chars, {
          yPercent: 110,
          stagger: STAGGER.chars * 2,
          ease: EASE.out,
          scrollTrigger: { trigger: root.current, start: "top 85%", end: "bottom bottom", scrub: SCRUB },
        });
        gsap.from(".footer-col", {
          y: 30,
          autoAlpha: 0,
          stagger: 0.1,
          ease: EASE.none,
          scrollTrigger: { trigger: root.current, start: "top 95%", end: "top 55%", scrub: SCRUB },
        });
        return () => split.revert();
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const year = new Date().getFullYear();

  return (
    <footer ref={root} className="relative overflow-hidden border-t border-line pt-20 pb-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 left-1/2 h-80 w-[70vw] -translate-x-1/2 rounded-full opacity-20 blur-3xl bg-accent-diag"
      />
      <div className="relative container-site">
        <div className="grid-12 gap-y-10">
          <div className="footer-col col-span-12 md:col-span-5">
            <Monogram className="h-12 w-auto text-fg" title={brand.name} />
            <BrandTagline className="mt-6 text-muted" />
            <p className="mt-6 max-w-xs text-sm text-muted">{brand.address}</p>
          </div>

          <nav aria-label="Footer" className="footer-col col-span-6 md:col-span-3">
            <p className="mb-4 eyebrow text-[0.65rem]">Explore</p>
            <ul className="space-y-2">
              {footer.quickLinks.map((l) => (
                <li key={l.href}>
                  <TransitionLink href={l.href} className="text-fg/80 transition-colors hover:text-fg">
                    {l.label}
                  </TransitionLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="footer-col col-span-6 md:col-span-2">
            <p className="mb-4 eyebrow text-[0.65rem]">Follow</p>
            <ul className="space-y-2">
              {footer.socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-fg/80 transition-colors hover:text-fg"
                    data-cursor="Visit"
                  >
                    {s.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col col-span-12 flex md:col-span-2 md:justify-end">
            <MagneticButton
              variant="ghost"
              size="sm"
              cursorLabel="Top"
              onClick={() => lenis?.scrollTo(0, { duration: 2.6 })}
            >
              <span aria-hidden>↑</span> {footer.backToTop}
            </MagneticButton>
          </div>
        </div>

        <p
          ref={wordmark}
          aria-hidden
          className="mt-20 text-center font-display text-[min(6.5vw,6.1rem)] leading-[0.9] font-extrabold tracking-[-0.03em] whitespace-nowrap select-none md:mt-28"
        >
          {brand.wordmark}
        </p>

        <div className="mt-10 flex flex-col justify-between gap-2 border-t border-line pt-6 text-xs text-dim md:flex-row">
          <p>
            © {year} {brand.name}. {footer.legal}
          </p>
          <p>{brand.tagline.join(" · ")}</p>
        </div>
      </div>
    </footer>
  );
}
