import { MONOGRAM_VIEWBOX, PATH_D, PATH_E } from "@/lib/brand/logo";
import { brand } from "@/content/site";
import { cn } from "@/lib/utils/cn";

/** Monogram only. The "d" uses currentColor so it reads on dark backgrounds. */
export function Monogram({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox={`0 0 ${MONOGRAM_VIEWBOX.width} ${MONOGRAM_VIEWBOX.height}`}
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      <path fillRule="evenodd" fill="var(--color-gold)" d={PATH_E} />
      <path fill="currentColor" d={PATH_D} />
    </svg>
  );
}

/** Horizontal lockup: monogram · gold divider · wordmark (mirrors the official logo). */
export function BrandLockup({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-3 text-fg", className)}>
      <Monogram className={compact ? "h-7 w-auto" : "h-9 w-auto"} />
      <span aria-hidden className="h-7 w-px bg-gold" />
      <span aria-hidden className="font-display leading-[0.95] font-semibold tracking-[0.16em] uppercase">
        <span className="block text-[0.8rem]">Event</span>
        <span className="block text-[0.8rem]">Dynamics</span>
      </span>
      <span className="sr-only">{brand.name}</span>
    </span>
  );
}

/** "eNGAGE eNTERTAIN eNRICH" tagline with gold e's, as in the logo. */
export function BrandTagline({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex gap-4 font-display text-xs tracking-[0.3em] uppercase", className)}>
      {brand.tagline.map((word) => (
        <span key={word}>
          <span className="text-[1.25em] leading-none text-gold lowercase">{word[0]}</span>
          {word.slice(1)}
        </span>
      ))}
    </span>
  );
}
