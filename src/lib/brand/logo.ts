import { PALETTE } from "@/lib/animation/tokens";

/**
 * Event Dynamics "ed" monogram, traced from the official logo as clean vector paths.
 * viewBox: 0 0 620 500. The "e" is brand yellow, the "d" is brand white (see PALETTE).
 * Both the DOM logo and the 3D extrusion use these exact paths.
 */

export const MONOGRAM_VIEWBOX = { width: 620, height: 500 } as const;

/** Yellow "e" — outer contour + eye (counter) as a hole (even-odd) */
export const PATH_E =
  "M92 8 H300 Q392 8 392 100 V196 L72 334 V352 Q72 398 118 398 H392 V470 H96 Q8 470 8 382 V96 Q8 8 92 8 Z " +
  "M112 74 H292 Q326 74 326 108 V150 L72 255 V114 Q72 74 112 74 Z";

/** White "d" — stem, diagonal bar and foot */
export const PATH_D =
  "M540 8 H612 V492 H418 V410 H540 V246 L306 350 Q284 362 290 386 L296 404 H236 L226 322 L540 168 Z";

export function monogramSvg({ yellow = PALETTE.brandYellow, white = PALETTE.brandWhite } = {}) {
  const { width, height } = MONOGRAM_VIEWBOX;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><path fill-rule="evenodd" fill="${yellow}" d="${PATH_E}"/><path fill="${white}" d="${PATH_D}"/></svg>`;
}
