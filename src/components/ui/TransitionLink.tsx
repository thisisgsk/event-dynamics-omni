"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { usePageTransition } from "@/components/providers/TransitionProvider";
import { useSound } from "@/components/providers/SoundProvider";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
  cursorLabel?: string;
  onNavigate?: () => void;
};

/** Internal link: anchors smooth-scroll through Lenis, routes play the curtain wipe. */
export function TransitionLink({ href, children, cursorLabel, onNavigate, onMouseEnter, ...rest }: Props) {
  const { navigate } = usePageTransition();
  const { tick } = useSound();

  return (
    <a
      href={href}
      data-cursor={cursorLabel}
      onMouseEnter={(e) => {
        tick();
        onMouseEnter?.(e);
      }}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || href.startsWith("http") || href.startsWith("mailto") || href.startsWith("tel"))
          return;
        e.preventDefault();
        onNavigate?.();
        navigate(href);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
