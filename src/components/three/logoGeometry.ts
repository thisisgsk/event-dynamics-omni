import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { MONOGRAM_VIEWBOX, monogramSvg } from "@/lib/brand/logo";

/** Monogram in SVG units → world units */
export const LOGO_UNIT = 0.0042;

const EXTRUDE: THREE.ExtrudeGeometryOptions = {
  depth: 70,
  bevelEnabled: true,
  bevelThickness: 14,
  bevelSize: 7,
  bevelSegments: 8,
  curveSegments: 36,
};

export type LogoGeometries = {
  e: THREE.ExtrudeGeometry;
  d: THREE.ExtrudeGeometry;
  lines: THREE.BufferGeometry;
};

/** Contour line segments (front + back caps) with per-vertex draw progress and scatter offsets. */
function buildContourLines(shapes: THREE.Shape[], cx: number, cy: number): THREE.BufferGeometry {
  const positions: number[] = [];
  const progress: number[] = [];
  const scatter: number[] = [];
  const zFront = EXTRUDE.depth! / 2 + EXTRUDE.bevelThickness!;
  const contours: THREE.Vector2[][] = [];

  shapes.forEach((shape) => {
    const { shape: outer, holes } = shape.extractPoints(24);
    contours.push(outer, ...holes);
  });

  contours.forEach((pts, ci) => {
    const dir = new THREE.Vector3(Math.sin(ci * 2.3), Math.cos(ci * 1.7), Math.sin(ci * 0.9 + 1)).multiplyScalar(420);
    [zFront, -zFront].forEach((z, side) => {
      const lengths = [0];
      for (let i = 1; i <= pts.length; i++) {
        const a = pts[i - 1];
        const b = pts[i % pts.length];
        lengths.push(lengths[i - 1] + a.distanceTo(b));
      }
      const total = lengths[lengths.length - 1] || 1;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        const b = pts[(i + 1) % pts.length];
        positions.push(a.x - cx, a.y - cy, z, b.x - cx, b.y - cy, z);
        // back contour trails the front slightly
        const lag = side * 0.12;
        progress.push((lengths[i] / total) * 0.88 + lag, (lengths[i + 1] / total) * 0.88 + lag);
        scatter.push(dir.x, dir.y, dir.z + side * 200, dir.x, dir.y, dir.z + side * 200);
      }
    });
  });

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("aProgress", new THREE.Float32BufferAttribute(progress, 1));
  geo.setAttribute("aScatter", new THREE.Float32BufferAttribute(scatter, 3));
  return geo;
}

let cache: LogoGeometries | null = null;

export function getLogoGeometries(): LogoGeometries {
  if (cache) return cache;
  const data = new SVGLoader().parse(monogramSvg());
  const cx = MONOGRAM_VIEWBOX.width / 2;
  const cy = MONOGRAM_VIEWBOX.height / 2;
  const allShapes: THREE.Shape[] = [];

  const [e, d] = data.paths.map((path) => {
    const shapes = path.toShapes();
    allShapes.push(...shapes);
    const geo = new THREE.ExtrudeGeometry(shapes, EXTRUDE);
    geo.translate(-cx, -cy, -EXTRUDE.depth! / 2);
    return geo;
  });

  cache = { e, d, lines: buildContourLines(allShapes, cx, cy) };
  return cache;
}
