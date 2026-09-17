"use client";

import { useRef } from "react";
import { useSplitReveal } from "@/hooks/useSplitReveal";
import { cn } from "@/lib/utils/cn";

type Props = {
  id?: string;
  eyebrow: string;
  title: string;
  sub?: string;
  as?: "h1" | "h2" | "h3";
  align?: "left" | "center";
  size?: "lg" | "xl";
  className?: string;
  titleClassName?: string;
  start?: string;
  end?: string;
  containerAnimation?: gsap.core.Animation;
};

/** Eyebrow + headline + optional sub-copy, always revealed with the shared SplitText stagger. */
export function SectionHeading({
  id,
  eyebrow,
  title,
  sub,
  as: Tag = "h2",
  align = "left",
  size = "lg",
  className,
  titleClassName,
  start,
  end,
  containerAnimation,
}: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);

  useSplitReveal(titleRef, { trigger: wrap, companions: [eyebrowRef, subRef], start, end, containerAnimation });

  return (
    <div ref={wrap} className={cn(align === "center" && "mx-auto text-center", className)}>
      <p
        ref={eyebrowRef}
        className={cn("mb-5 flex items-center gap-3 eyebrow", align === "center" && "justify-center")}
      >
        <span aria-hidden className={cn("h-px w-8 bg-accent", align === "center" && "hidden")} />
        {eyebrow}
      </p>
      <Tag
        id={id}
        ref={titleRef}
        className={cn(size === "xl" ? "display-xl" : "display-lg", "text-balance", titleClassName)}
      >
        {title}
      </Tag>
      {sub && (
        <p
          ref={subRef}
          className={cn("mt-6 max-w-xl text-base text-muted md:text-lg", align === "center" && "mx-auto")}
        >
          {sub}
        </p>
      )}
    </div>
  );
}
