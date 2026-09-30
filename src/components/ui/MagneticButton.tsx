"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { useMagnetic } from "@/hooks/useMagnetic";
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
  /** Solid brand yellow, near-black text (10:1+ in both themes). Soft yellow glow (dark) / shadow (light) on hover. */
  primary:
    "bg-brand-yellow text-on-accent transition-[box-shadow,border-color,color] hover:shadow-(--glow-soft) active:bg-accent-pressed",
  /** Secondary: white-outlined glass with a yellow hover (dark) · black outline that fills black on hover (light). */
  ghost:
    "border border-(--btn-ghost-border) bg-(--btn-ghost-bg) text-(--btn-ghost-text) backdrop-blur-md transition-[box-shadow,border-color,color,background-color] hover:border-(--btn-ghost-hover-border) hover:bg-(--btn-ghost-hover-bg) hover:text-(--btn-ghost-hover-text) hover:shadow-(--btn-ghost-hover-shadow)",
  /** Hero CTA: brand yellow with a warm glow halo (dark) / a soft yellow-tinted shadow (light). */
  glow: "bg-brand-yellow text-on-accent shadow-(--glow) transition-[box-shadow,border-color,color] hover:shadow-(--glow-strong) active:bg-accent-pressed",
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
  const magnetic = useMagnetic<HTMLElement>(strength);
  const { navigate } = usePageTransition();
  const { tick } = useSound();

  const classes = cn(
    "group relative inline-flex select-none items-center whitespace-nowrap justify-center gap-3 overflow-hidden rounded-full font-medium tracking-tight",
    "duration-(--duration-micro) ease-(--ease-out) disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );

  const inner = (
    <>
      {variant !== "ghost" && (
        <span
          aria-hidden
          className="absolute inset-0 translate-y-full rounded-full bg-accent-hover transition-transform duration-(--duration-ui) ease-(--ease-out) group-hover:translate-y-0 group-active:bg-accent-pressed"
        />
      )}
      {variant === "glow" && (
        // Pulsing halo is a dark-theme effect; on white, glows are replaced by the soft shadow above
        <span
          aria-hidden
          className="absolute -inset-3 -z-10 hidden [animation:glow-pulse_3s_ease-in-out_infinite] rounded-full bg-brand-yellow opacity-60 blur-2xl dark:block"
        />
      )}
      <motion.span style={{ x: magnetic.x, y: magnetic.y }} className="relative z-10 inline-flex items-center gap-3">
        {children}
      </motion.span>
    </>
  );

  const common = {
    className: classes,
    style: { x: magnetic.x, y: magnetic.y },
    onMouseMove: magnetic.onMouseMove,
    onMouseEnter: tick,
    onMouseLeave: magnetic.onMouseLeave,
    "data-cursor": cursorLabel,
    "aria-label": ariaLabel,
  };

  if (href) {
    return (
      <motion.a
        {...common}
        ref={magnetic.ref as React.Ref<HTMLAnchorElement>}
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
      ref={magnetic.ref as React.Ref<HTMLButtonElement>}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {inner}
    </motion.button>
  );
}
