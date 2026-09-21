/**
 * Single source of truth for motion. Import these everywhere — never inline easings or durations.
 * CSS mirrors live in globals.css (--ease-out, --ease-in-out, --dur-micro, --dur-ui).
 */

export const EASE = {
  /** GSAP default for reveals and UI */
  out: "power3.out",
  /** GSAP for scene transitions and wipes */
  inOut: "expo.inOut",
  /** Linear mapping for scrubbed choreography (scrub adds its own smoothing) */
  none: "none",
} as const;

/** Cubic-bezier equivalents for CSS / Framer Motion */
export const BEZIER = {
  out: [0.215, 0.61, 0.355, 1] as [number, number, number, number],
  inOut: [0.87, 0, 0.13, 1] as [number, number, number, number],
} as const;

export const DURATION = {
  micro: 0.3,
  ui: 0.6,
  scene: 1.2,
  /** About stat counters: one play-through, not scrubbed */
  counter: 1.9,
} as const;

export const STAGGER = {
  chars: 0.02,
  words: 0.06,
  lines: 0.1,
  items: 0.12,
  counters: 0.08,
} as const;

/** Scrub smoothing (seconds) used by every scroll timeline */
export const SCRUB = 1;

/** Smoothing applied by the master guide timeline when following scroll */
export const GUIDE_FOLLOW = 0.7;

/** 3D damping factor (higher = snappier) used in useFrame */
export const DAMP = {
  guide: 3.2,
  camera: 2.4,
  pointer: 2,
} as const;

export const MEDIA = {
  desktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
  mobile: "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
  reduced: "(prefers-reduced-motion: reduce)",
} as const;

/** Pin lengths per section */
export const PIN = {
  hero: { desktop: "+=100%", mobile: "+=50%" },
  about: { desktop: "+=150%", mobile: "+=60%" },
  services: { desktop: "+=500%", mobile: "+=300%" },
  process: { desktop: "+=300%", mobile: "+=120%" },
  finale: { desktop: "+=200%", mobile: "+=100%" },
} as const;

export const SPRING = {
  magnetic: { stiffness: 180, damping: 14, mass: 0.2 },
  cursor: { stiffness: 520, damping: 40, mass: 0.4 },
  ring: { stiffness: 160, damping: 20, mass: 0.6 },
  tilt: { stiffness: 220, damping: 22 },
} as const;

/**
 * Brand palette, extracted from the Event Dynamics logo (yellow "e", white "d").
 * Mirrors the CSS tokens in globals.css (@theme) — used by the 3D layer, shaders and canvas-drawn UI.
 * Verify against the logo file with: node scripts/extract-brand-colors.mjs public/brand/logo.png
 */
export const PALETTE = {
  brandYellow: "#EBB92E",
  brandWhite: "#FFFFFF",
  yellowLight: "#F5D268",
  yellowSoft: "#FBE6A2",
  yellowDark: "#C8961C",
  yellowDeep: "#8A6614",
  yellowMuted: "#4A3C18",
  warmWhite: "#FFF6E0",
  offWhite: "#F5F1E8",
  error: "#FF5A52",
  bg: "#07070A",
  bg2: "#0E0E14",
} as const;
