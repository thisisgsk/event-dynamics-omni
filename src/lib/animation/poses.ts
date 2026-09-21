import { PALETTE } from "./tokens";

/**
 * Guide-logo keyframe poses. The master timeline tweens `scene.guide` between these.
 * nx / ny are normalised viewport coordinates (-1 … 1, y up) converted to world units every frame,
 * so poses stay correct at any screen size.
 */

export type Pose = {
  nx: number;
  ny: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
  scale: number;
  /** 1 = solid chrome, 0 = fully dissolved */
  dissolve: number;
  r: number;
  g: number;
  b: number;
  glow: number;
  camZ: number;
  /** 1 = follow the Process curve instead of nx/ny */
  curveMix: number;
  processT: number;
  particles: number;
};

export function hexToRgb(hex: string) {
  const v = parseInt(hex.replace("#", ""), 16);
  return { r: ((v >> 16) & 255) / 255, g: ((v >> 8) & 255) / 255, b: (v & 255) / 255 };
}

/** Guide tints — brand yellow/white only (from PALETTE in tokens.ts) */
export const TINT = {
  yellow: hexToRgb(PALETTE.brandYellow),
  light: hexToRgb(PALETTE.yellowLight),
  soft: hexToRgb(PALETTE.yellowSoft),
  white: hexToRgb(PALETTE.warmWhite),
} as const;

const PI = Math.PI;

const base: Pose = {
  nx: 0,
  ny: 0,
  z: 0,
  rx: 0,
  ry: 0,
  rz: 0,
  scale: 1,
  dissolve: 1,
  ...TINT.yellow,
  glow: 0.6,
  camZ: 7,
  curveMix: 0,
  processT: 0,
  particles: 1,
};

const pose = (p: Partial<Pose>): Pose => ({ ...base, ...p });

export const POSES = {
  HERO: pose({ ny: 0.04, scale: 1.25, rx: 0.08 }),
  HERO_END: pose({ nx: 0.46, ny: 0, ry: PI, scale: 0.95, camZ: 6.3, ...TINT.light, glow: 0.55 }),
  ABOUT_IN: pose({ nx: 0.46, ry: PI + 0.25, scale: 0.95, camZ: 6.3, ...TINT.light, glow: 0.55 }),
  ABOUT: pose({ nx: 0.46, ny: -0.04, rx: 0.12, ry: PI + 0.7, scale: 1, camZ: 6.3, ...TINT.yellow, glow: 0.5 }),
  SERVICES_PRE: pose({ z: 1.4, ry: 2 * PI, scale: 1.15, camZ: 6.3, ...TINT.yellow, glow: 0.7 }),
  PORTAL: pose({
    z: 6.05,
    ry: 2 * PI + 0.35,
    scale: 3.2,
    dissolve: 0,
    camZ: 6.3,
    ...TINT.yellow,
    glow: 0.4,
    particles: 0.35,
  }),
  SERVICES_OUT: pose({ z: 0, ry: 3 * PI, scale: 0.8, ...TINT.yellow, glow: 0.6, particles: 0.8 }),
  EXPERIENCES: pose({ nx: 0.8, ny: 0.6, ry: 3 * PI + 0.4, scale: 0.34, ...TINT.yellow, glow: 0.45 }),
  EXPERIENCES_END: pose({ nx: 0.8, ny: 0.6, ry: 4 * PI, scale: 0.34, ...TINT.white, glow: 0.45 }),
  PROCESS_A: pose({ curveMix: 1, processT: 0, ry: 4 * PI, rx: 0.2, scale: 0.4, ...TINT.light, glow: 0.8 }),
  PROCESS_B: pose({ curveMix: 1, processT: 1, ry: 6 * PI, rx: 0.2, scale: 0.4, ...TINT.white, glow: 0.8 }),
  WORK: pose({ nx: -0.52, ny: -0.3, ry: 6 * PI + 0.5, scale: 0.72, ...TINT.yellow, glow: 0.5 }),
  WORK_END: pose({ nx: -0.52, ny: -0.3, ry: 7 * PI, scale: 0.72, ...TINT.light, glow: 0.5 }),
  FINALE: pose({ nx: 0, ny: -0.02, ry: 8 * PI, scale: 0.64, ...TINT.yellow, glow: 1 }),
  // Sits behind the glass form so it reads as a soft, blurred glow and never covers text
  CONTACT: pose({ nx: 0.36, ny: -0.08, ry: 9 * PI, rx: 0.15, scale: 0.95, ...TINT.light, glow: 0.6 }),
  FOOTER: pose({ nx: 0, ny: 0.42, ry: 10 * PI, scale: 0.42, ...TINT.yellow, glow: 0.7 }),
  /** Sub-pages (/services/[slug], /contact) */
  SUBPAGE: pose({ nx: 0.55, ny: 0.1, ry: PI * 1.2, rx: 0.1, scale: 0.8, ...TINT.yellow, glow: 0.6 }),
  /** prefers-reduced-motion: calm, static composition */
  STATIC: pose({ nx: 0.5, ny: 0.05, ry: 0.5, rx: 0.1, scale: 0.9, ...TINT.yellow, glow: 0.5 }),
} satisfies Record<string, Pose>;

export type PoseName = keyof typeof POSES;
