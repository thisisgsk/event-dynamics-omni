import { hexToRgb, POSES, type Pose } from "./poses";
import { PALETTE } from "./tokens";

/**
 * The bridge between GSAP (DOM / scroll) and React Three Fiber.
 * GSAP tweens these plain numbers; useFrame reads and damps them. Never put this in React state.
 */
export const scene = {
  guide: { ...POSES.HERO } as Pose,
  /** Preloader choreography: wire lines draw-in, then chrome dissolve-in */
  intro: { lines: 0, dissolve: 0 },
  /** Services: 0 = closed, 1 = fully open portal */
  portal: 0,
  /** Services: 0 … 3 float, fractional part = liquid transition progress */
  room: 0,
  /** Normalised pointer (-1 … 1), fed from window events */
  pointer: { x: 0, y: 0 },
  /** performance.now() timestamp of the latest confetti burst */
  confettiAt: -1,
  canvasReady: false,
  isMobile: false,
  reduced: false,
  /**
   * Theme blend for the 3D layer, written by <ThemeSync> from the CSS tokens (see useThemeColors).
   * `light` goes 0 (dark) → 1 (light); every theme-dependent number in the scene lerps with it, so dark mode
   * is exactly the original values. Colours are sRGB 0…1.
   */
  theme: {
    light: 0,
    /** Set by the theme toggle when a View Transition reveal covers the switch: jump instead of tweening */
    instant: false,
    bgTop: hexToRgb(PALETTE.bg),
    bgBottom: hexToRgb(PALETTE.bg2),
    logoE: hexToRgb(PALETTE.brandYellow),
    logoD: hexToRgb(PALETTE.brandWhite),
    line: hexToRgb(PALETTE.brandWhite),
    particle: hexToRgb(PALETTE.brandWhite),
    strong: hexToRgb(PALETTE.brandWhite),
  },
  /** Where the guide logo actually is this frame (after damping) — the light theme's contact shadow follows it */
  logo: { x: 0, y: 0, z: 0, scale: 1, dissolve: 0 },
  /** Dev tuning (Leva) — safe defaults for production */
  tuning: {
    bloom: 0.9,
    envIntensity: 2.4,
    roughness: 0.26,
    aberration: 0.0007,
    grain: 0.05,
  },
};

export type SceneState = typeof scene;

if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  (window as unknown as { __ed: SceneState }).__ed = scene;
}
