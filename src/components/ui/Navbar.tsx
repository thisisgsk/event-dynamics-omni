"use client";

import { motion } from "motion/react";
import { useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav, ui } from "@/content/site";
import { BEZIER, DURATION } from "@/lib/animation/tokens";
import { cn } from "@/lib/utils/cn";
import { BrandLockup } from "./BrandLogo";
import { MagneticButton } from "./MagneticButton";
import { MobileMenu } from "./MobileMenu";
import { SoundToggle } from "./SoundToggle";
import { TransitionLink } from "./TransitionLink";

/** The single site navbar: transparent at top, glass after 80px, hides on scroll down, returns on scroll up. */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Route change resets scroll without a Lenis scroll event — resync the bar
  useEffect(() => {
    setScrolled(window.scrollY > 80);
    setHidden(false);
  }, [pathname]);

  useLenis(({ scroll, direction }) => {
    setScrolled(scroll > 80);
    if (scroll < 160) setHidden(false);
    else if (direction === 1) setHidden(true);
    else if (direction === -1) setHidden(false);
  });

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-[70]"
        initial={false}
        animate={{ y: hidden && !menuOpen ? "-110%" : "0%" }}
        transition={{ duration: DURATION.ui, ease: BEZIER.out }}
      >
        <nav
          aria-label="Primary"
          className={cn(
            "container-site mt-3 flex h-16 items-center justify-between rounded-full transition-[background-color,box-shadow,backdrop-filter] duration-(--duration-ui) ease-out md:mt-4 md:h-[4.5rem]",
            scrolled && !menuOpen
              ? "bg-bg/55 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] backdrop-blur-xl"
              : "bg-transparent",
          )}
          style={{ maxWidth: "min(1440px, calc(100% - 1.5rem))" }}
        >
          <TransitionLink
            href="/#top"
            cursorLabel="Home"
            aria-label="Event Dynamics — home"
            onNavigate={() => setMenuOpen(false)}
          >
            <BrandLockup compact />
          </TransitionLink>

          <ul className="hidden items-center gap-1 lg:flex">
            {nav.links.map((link) => (
              <li key={link.href}>
                <TransitionLink
                  href={link.href}
                  className="group relative rounded-full px-4 py-2 text-sm text-fg/75 transition-colors duration-(--duration-micro) hover:text-fg"
                >
                  {link.label}
                  <span
                    aria-hidden
                    className="absolute inset-x-4 bottom-1 h-px origin-left scale-x-0 transition-transform duration-(--duration-ui) ease-out bg-accent group-hover:scale-x-100"
                  />
                </TransitionLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 md:gap-3">
            <SoundToggle />
            {/* Wrapper controls visibility: the button's own inline-flex would override `hidden` */}
            <div className="hidden md:block">
              <MagneticButton href={nav.cta.href} size="sm" variant="primary" cursorLabel="Plan">
                {nav.cta.label}
              </MagneticButton>
            </div>
            <button
              type="button"
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-line lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? ui.menu.close : ui.menu.open}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <motion.span
                className="absolute h-px w-5 bg-fg"
                animate={menuOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -4 }}
                transition={{ duration: DURATION.micro, ease: BEZIER.out }}
              />
              <motion.span
                className="absolute h-px w-5 bg-fg"
                animate={menuOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 4 }}
                transition={{ duration: DURATION.micro, ease: BEZIER.out }}
              />
            </button>
          </div>
        </nav>
      </motion.header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
