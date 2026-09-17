"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { BEZIER, DURATION, SPRING } from "@/lib/animation/tokens";
import { useFinePointer } from "@/hooks/useIsMobile";

/** Dot + lagging ring. Elements opt into a label with `data-cursor="Explore"`. */
export function Cursor() {
  const fine = useFinePointer();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const dotX = useSpring(x, SPRING.cursor);
  const dotY = useSpring(y, SPRING.cursor);
  const ringX = useSpring(x, SPRING.ring);
  const ringY = useSpring(y, SPRING.ring);
  const [label, setLabel] = useState<string | null>(null);
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    if (!fine) return;
    const root = document.documentElement;
    root.classList.add("has-cursor");

    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
    };
    const over = (e: Event) => {
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>(
        "[data-cursor], a, button, input, textarea, select, label",
      );
      setActive(Boolean(target));
      const l = target?.dataset.cursor;
      setLabel(l && l.length > 0 ? l : null);
    };
    const leave = () => setVisible(false);
    const down = () => setPressed(true);
    const up = () => setPressed(false);

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", over, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      root.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      document.documentElement.removeEventListener("pointerleave", leave);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, [fine, x, y]);

  if (!fine) return null;

  const ringSize = label ? 96 : active ? 56 : 36;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]" style={{ opacity: visible ? 1 : 0 }}>
      <motion.div
        className="absolute top-0 left-0 flex items-center justify-center rounded-full border border-white/40 mix-blend-difference"
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: ringSize,
          height: ringSize,
          backgroundColor: label ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0)",
          scale: pressed ? 0.85 : 1,
        }}
        transition={{ duration: DURATION.micro, ease: BEZIER.out }}
      >
        <AnimatePresence>
          {label && (
            <motion.span
              key={label}
              className="text-[0.7rem] font-semibold tracking-[0.18em] text-black uppercase"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: DURATION.micro, ease: BEZIER.out }}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
      <motion.div
        className="absolute top-0 left-0 h-1.5 w-1.5 rounded-full bg-white mix-blend-difference"
        style={{ x: dotX, y: dotY, translateX: "-50%", translateY: "-50%" }}
        animate={{ opacity: label ? 0 : 1 }}
      />
    </div>
  );
}
