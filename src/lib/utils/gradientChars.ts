/**
 * background-clip:text breaks when children are transformed, so paint the accent gradient onto each
 * split char individually, offset so the gradient reads as one continuous sweep across the line.
 */
export function applyGradientToChars(chars: Element[], line: HTMLElement, gradient = "var(--gradient-accent)") {
  const lineRect = line.getBoundingClientRect();
  chars.forEach((c) => {
    const el = c as HTMLElement;
    const r = el.getBoundingClientRect();
    Object.assign(el.style, {
      backgroundImage: gradient,
      backgroundSize: `${lineRect.width}px 100%`,
      backgroundPosition: `${lineRect.left - r.left}px 0`,
      backgroundRepeat: "no-repeat",
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
    });
  });
}
