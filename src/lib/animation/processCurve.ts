import { CatmullRomCurve3, Vector3 } from "three";

/**
 * The Process path, in normalised viewport space (-1 … 1, y up).
 * The DOM SVG path (pixels) and the 3D CatmullRomCurve3 (world units) are both built from these points
 * with a uniform scale, so arc-length progress matches exactly between them.
 */
export const PROCESS_POINTS: Array<[number, number]> = [
  [-1.08, 0.02],
  [-0.75, -0.1],
  [-0.25, 0.16],
  [0.25, -0.1],
  [0.75, 0.16],
  [1.08, 0.04],
];

/** Indices in PROCESS_POINTS that correspond to the 4 step anchors */
export const PROCESS_ANCHORS = [1, 2, 3, 4];

const cache = new Map<string, CatmullRomCurve3>();

/** width/height = viewport size in the target unit system; `pixels` flips y for SVG space. */
export function getProcessCurve(width: number, height: number, pixels = false) {
  const key = `${width.toFixed(3)}:${height.toFixed(3)}:${pixels}`;
  const hit = cache.get(key);
  if (hit) return hit;
  if (cache.size > 12) cache.clear();

  const pts = PROCESS_POINTS.map(([nx, ny]) =>
    pixels
      ? new Vector3(((nx + 1) / 2) * width, ((1 - ny) / 2) * height, 0)
      : new Vector3((nx * width) / 2, (ny * height) / 2, 0),
  );
  const curve = new CatmullRomCurve3(pts, false, "catmullrom", 0.5);
  curve.arcLengthDivisions = 400;
  cache.set(key, curve);
  return curve;
}

/** Arc-length fraction (0…1) at which each step anchor is reached. */
export function getAnchorFractions(width: number, height: number) {
  const curve = getProcessCurve(width, height, true);
  const lengths = curve.getLengths(400);
  const total = lengths[lengths.length - 1];
  const segments = PROCESS_POINTS.length - 1;
  return PROCESS_ANCHORS.map((i) => lengths[Math.round((i / segments) * 400)] / total);
}

/** Cubic-bezier SVG path equivalent of the Catmull-Rom curve (tension 0.5). */
export function getProcessPathD(width: number, height: number) {
  const p = PROCESS_POINTS.map(([nx, ny]) => [((nx + 1) / 2) * width, ((1 - ny) / 2) * height]);
  let d = `M ${p[0][0]} ${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? [2 * p[0][0] - p[1][0], 2 * p[0][1] - p[1][1]];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] ?? [2 * p2[0] - p1[0], 2 * p2[1] - p1[1]];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}
