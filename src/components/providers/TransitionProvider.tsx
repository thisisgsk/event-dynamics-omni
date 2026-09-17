"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { useLenis } from "lenis/react";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { BEZIER, DURATION } from "@/lib/animation/tokens";
import { ScrollTrigger } from "@/lib/animation/gsap";
import { brand } from "@/content/site";

type Ctx = { navigate: (href: string) => void };

const TransitionContext = createContext<Ctx>({ navigate: () => {} });

export const usePageTransition = () => useContext(TransitionContext);

type Phase = "idle" | "cover" | "reveal";

export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const lenis = useLenis();
  const [phase, setPhase] = useState<Phase>("idle");
  const pending = useRef<string | null>(null);
  const lastPath = useRef(pathname);

  const navigate = useCallback(
    (href: string) => {
      const [path, hash] = href.split("#");
      const targetPath = path || pathname;

      // Same page anchor → smooth scroll through Lenis
      if (targetPath === pathname) {
        if (hash) lenis?.scrollTo(`#${hash}`, { duration: 1.8 });
        else lenis?.scrollTo(0, { duration: 1.8 });
        return;
      }
      if (phase !== "idle") return;
      pending.current = href.startsWith("#") ? `/${href}` : href;
      setPhase("cover");
    },
    [lenis, pathname, phase],
  );

  // Route committed → reset scroll, refresh triggers, lift the curtain
  useEffect(() => {
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;
    lenis?.scrollTo(0, { immediate: true, force: true });
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      const hash = window.location.hash;
      if (hash) setTimeout(() => lenis?.scrollTo(hash, { immediate: true, force: true }), 120);
      setPhase((p) => (p === "cover" ? "reveal" : p));
    });
  }, [pathname, lenis]);

  return (
    <TransitionContext.Provider value={{ navigate }}>
      {children}
      <AnimatePresence>
        {phase !== "idle" && (
          <motion.div
            key="curtain"
            aria-hidden
            className="fixed inset-0 z-[95] flex items-center justify-center bg-accent-diag"
            initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
            animate={phase === "cover" ? { clipPath: "inset(0% 0% 0% 0%)" } : { clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: DURATION.ui * 1.4, ease: BEZIER.inOut }}
            onAnimationComplete={() => {
              if (phase === "cover" && pending.current) {
                const href = pending.current;
                pending.current = null;
                router.push(href, { scroll: false });
              } else if (phase === "reveal") {
                setPhase("idle");
              }
            }}
          >
            <span className="font-display text-2xl font-bold tracking-[0.3em] text-bg/80">{brand.wordmark}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </TransitionContext.Provider>
  );
}
