/**
 * Light-theme targets for the 3D layer. The dark theme keeps the original values (scene.tuning and each
 * component's constants); every value here is blended in by `scene.theme.light` (0 → 1), so nothing is
 * rebuilt or remounted when the theme changes — only uniforms, material colours and light intensities move.
 * Colours come from CSS tokens (see useThemeColors); these are the numbers.
 */
export const LIGHT_SCENE = {
  /** GSAP crossfade between themes (s). Skipped when a View Transition reveal already covers the switch. */
  fade: 0.6,

  /** Logo metal: gold "e" + polished graphite "d", lit by a bright studio */
  envIntensity: 2.7,
  roughness: 0.34,
  /** Emissive rim glow multiplier (glow reads as a warm reflection on graphite, not neon) */
  glow: 0.55,
  keyLight: 1.6,
  ambient: 0.5,

  /** Post-processing on white: bloom only on real HDR highlights, no vignette, barely any aberration */
  bloom: 0.3,
  bloomThreshold: 1.05,
  aberration: 0.25,
  grain: 0.35,

  /** Graphics: dark, smaller, fainter */
  particleSize: 3.6,
  particleAlpha: 0.5,
  lineOpacity: 0.55,

  /** Contact shadow under the logo */
  shadowOpacity: 0.5,
} as const;

/**
 * Additive blending (dark) can't draw dark marks on white, so graphics switch to normal blending halfway
 * through the theme crossfade. This visibility factor dips to 0 at that point so the switch never pops.
 */
export const blendSwitchVisibility = (light: number) => Math.abs(1 - 2 * light);
