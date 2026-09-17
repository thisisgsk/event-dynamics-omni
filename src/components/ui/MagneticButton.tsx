"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useRef, type MouseEvent, type ReactNode } from "react";
import { SPRING } from "@/lib/animation/tokens";
import { cn } from "@/lib/utils/cn";
import { usePageTransition } from "@/components/providers/TransitionProvider";
import { useSound } from "@/components/providers/SoundProvider";

type Variant = "primary" | "ghost" | "glow";

type Props = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  className?: string;
  cursorLabel?: string;
  disabled?: boolean;
  strength?: number;
  ariaLabel?: string;
};

const variants: Record<Variant, string> = {
  primary: "bg-fg text-bg hover:text-bg",
  ghost: "border border-line bg-white/[0.03] text-fg backdrop-blur-md hover:border-white/30",
  glow: "bg-accent text-white shadow-[0_0_40px_-6px_rgba(139,92,246,0.8)]",
};

const sizes = {
  sm: "h-10 px-5 text-sm",
  md: "h-12 px-7 text-[0.95rem]",
  lg: "h-16 px-10 text-lg md:h-20 md:px-14 md:text-xl",
};

/** Magnetic pill button. Pass `href` for links (anchors scroll via Lenis, routes use the curtain transition). */
export function MagneticButton({
  children,
  href,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  className,
  cursorLabel = "View",
  disabled,
  strength = 0.35,
  ariaLabel,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, SPRING.magnetic);
  const sy = useSpring(y, SPRING.magnetic);
  const { navigate } = usePageTransition();
  const { tick } = useSound();

  const onMove = (e: MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left - rect.width / 2) * strength);
    y.set((e.clientY - rect.top - rect.height / 2) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const classes = cn(
    "group relative inline-flex select-none items-center whitespace-nowrap justify-center gap-3 overflow-hidden rounded-full font-medium tracking-tight",
    "transition-[box-shadow,border-color,color] duration-(--duration-micro) ease-(--ease-out) disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );

  const inner = (
    <>
      {variant === "primary" && (
        <span
          aria-hidden
          className="absolute inset-0 translate-y-full rounded-full transition-transform duration-(--duration-ui) ease-(--ease-out) bg-accent group-hover:translate-y-0"
        />
      )}
      {variant === "glow" && (
        <span
          aria-hidden
          className="absolute -inset-3 -z-10 [animation:glow-pulse_3s_ease-in-out_infinite] rounded-full opacity-60 blur-2xl bg-accent"
        />
      )}
      <motion.span
        style={{ x: sx, y: sy }}
        className="relative z-10 inline-flex items-center gap-3 group-hover:text-white"
      >
        {children}
      </motion.span>
    </>
  );

  const common = {
    className: classes,
    style: { x: sx, y: sy },
    onMouseMove: onMove,
    onMouseEnter: tick,
    onMouseLeave: reset,
    "data-cursor": cursorLabel,
    "aria-label": ariaLabel,
  };

  if (href) {
    return (
      <motion.a
        {...common}
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        onClick={(e) => {
          if (href.startsWith("http")) return;
          e.preventDefault();
          onClick?.();
          navigate(href);
        }}
      >
        {inner}
      </motion.a>
    );
  }

  return (
    <motion.button
      {...common}
      ref={ref as React.Ref<HTMLButtonElement>}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {inner}
    </motion.button>
  );
}
