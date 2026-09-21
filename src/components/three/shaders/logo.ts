import { noiseGLSL } from "./noise";

/**
 * Chrome logo material (CSM on MeshPhysicalMaterial).
 * uDissolve pours the chrome in from the top with a glowing noise edge; uTint + uGlow add a warm brand-yellow rim light.
 * Object space is SVG units: x ≈ -310…310, y ≈ -250…250 (y down before the mesh's negative Y scale).
 */
export const logoVertex = /* glsl */ `
varying vec3 vObjPos;
varying float vFresnel;

void main() {
  vObjPos = position;
  vec3 n = normalize(normalMatrix * normal);
  vec3 v = normalize(-(modelViewMatrix * vec4(position, 1.0)).xyz);
  vFresnel = pow(1.0 - abs(dot(n, v)), 2.5);
}
`;

export const logoFragment = /* glsl */ `
uniform float uDissolve;
uniform float uGlow;
uniform float uTime;
uniform vec3 uTint;
varying vec3 vObjPos;
varying float vFresnel;

${noiseGLSL}

void main() {
  float n = ed_fbm(vObjPos * 0.012 + vec3(0.0, 0.0, uTime * 0.08));
  float pour = (vObjPos.y + 260.0) / 520.0;
  float t = n * 0.35 + pour * 0.65;
  float edge = uDissolve * 1.12 - 0.06;
  if (t > edge) discard;

  float rim = (1.0 - smoothstep(0.0, 0.05, edge - t)) * smoothstep(1.0, 0.85, uDissolve);
  csm_Emissive = uTint * (vFresnel * uGlow * 0.9 + uGlow * 0.04) + uTint * rim * 4.0;
}
`;

/** Wireframe contour lines for the preloader: draw along each contour and converge from a scattered start. */
export const lineVertex = /* glsl */ `
attribute float aProgress;
attribute vec3 aScatter;
uniform float uConverge;
varying float vProgress;

void main() {
  vProgress = aProgress;
  vec3 p = position + aScatter * (1.0 - uConverge) * (1.0 - uConverge);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

export const lineFragment = /* glsl */ `
uniform float uDraw;
uniform float uOpacity;
uniform vec3 uColor;
varying float vProgress;

void main() {
  if (vProgress > uDraw) discard;
  float head = smoothstep(uDraw - 0.08, uDraw, vProgress);
  gl_FragColor = vec4(mix(uColor, vec3(1.0), head), uOpacity * (0.55 + head));
}
`;
