import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type GlassCardProps<T extends ElementType> = {
  as?: T;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

/** The one glass surface used across the site: backdrop blur, 1px gradient border, soft inner glow. */
export function GlassCard<T extends ElementType = "div">({ as, className, children, ...rest }: GlassCardProps<T>) {
  const Tag = (as ?? "div") as "div";
  return (
    <Tag className={cn("glass-card", className)} {...rest}>
      {children}
    </Tag>
  );
}
