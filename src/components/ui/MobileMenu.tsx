"use client";

import { AnimatePresence, motion } from "motion/react";
import { useLenis } from "lenis/react";
import { useEffect } from "react";
import { brand, nav } from "@/content/site";
import { BEZIER, DURATION, STAGGER } from "@/lib/animation/tokens";
import { BrandTagline } from "./BrandLogo";
import { MagneticButton } from "./MagneticButton";
import { TransitionLink } from "./TransitionLink";

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const lenis = useLenis();

  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [open, lenis, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-0 z-[65] flex flex-col bg-bg/90 backdrop-blur-2xl lg:hidden"
          initial={{ clipPath: "circle(0% at 90% 5%)" }}
          animate={{ clipPath: "circle(150% at 90% 5%)" }}
          exit={{ clipPath: "circle(0% at 90% 5%)" }}
          transition={{ duration: DURATION.ui * 1.3, ease: BEZIER.inOut }}
        >
          <div
            aria-hidden
            className="absolute -top-40 -right-40 h-96 w-96 rounded-full opacity-25 blur-3xl bg-accent-diag"
          />
          <nav aria-label="Mobile" className="container-site flex flex-1 flex-col justify-center pt-24">
            <ul className="space-y-1">
              {nav.links.map((link, i) => (
                <li key={link.href} className="overflow-hidden">
                  <motion.div
                    initial={{ y: "110%" }}
                    animate={{ y: "0%" }}
                    exit={{ y: "110%" }}
                    transition={{ duration: DURATION.ui, ease: BEZIER.out, delay: 0.25 + i * STAGGER.words }}
                  >
                    <TransitionLink
                      href={link.href}
                      onNavigate={onClose}
                      className="flex items-baseline gap-4 py-1 font-display text-[2.6rem] font-bold tracking-tight text-fg sm:text-6xl"
                    >
                      <span className="eyebrow text-[0.65rem]">0{i + 1}</span>
                      {link.label}
                    </TransitionLink>
                  </motion.div>
                </li>
              ))}
            </ul>
          </nav>
          <motion.div
            className="container-site flex flex-col gap-6 pb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.ui, ease: BEZIER.out, delay: 0.6 }}
          >
            <MagneticButton href={nav.cta.href} variant="glow" onClick={onClose} className="w-full">
              {nav.cta.label}
            </MagneticButton>
            <div className="flex flex-col gap-3 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
              <BrandTagline className="text-[0.6rem]" />
              <a href={`mailto:${brand.email}`} className="underline-offset-4 hover:underline">
                {brand.email}
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
