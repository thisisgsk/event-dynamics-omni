import { noiseGLSL } from "./noise";

/** Fullscreen quad: clip-space positions, ignores the camera. */
export const fullscreenVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

/**
 * Four-room portal.
 * - uPortal: circular reveal from the logo's centre with a glowing ring edge
 * - uRoom:   float 0…3; fractional part drives a noise-displaced liquid wipe between textures
 * - uMouse:  depth-weighted parallax (lower image = closer = moves more)
 */
export const roomFragment = /* glsl */ `
uniform sampler2D uT0;
uniform sampler2D uT1;
uniform sampler2D uT2;
uniform sampler2D uT3;
uniform float uRoom;
uniform float uPortal;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uImgRes;
uniform vec2 uMouse;
uniform vec3 uTint;
varying vec2 vUv;

${noiseGLSL}

vec4 roomTex(float i, vec2 uv) {
  if (i < 0.5) return texture2D(uT0, uv);
  else if (i < 1.5) return texture2D(uT1, uv);
  else if (i < 2.5) return texture2D(uT2, uv);
  else return texture2D(uT3, uv);
}

vec2 coverUv(vec2 uv) {
  float sa = uRes.x / uRes.y;
  float ia = uImgRes.x / uImgRes.y;
  vec2 s = sa > ia ? vec2(1.0, ia / sa) : vec2(sa / ia, 1.0);
  return (uv - 0.5) * s * 0.92 + 0.5;
}

vec3 sampleRoom(float i, vec2 uv, vec2 disp) {
  float depth = mix(1.0, 0.35, smoothstep(0.0, 0.9, vUv.y));
  vec2 par = uMouse * 0.018 * depth;
  vec2 drift = vec2(sin(uTime * 0.07 + i), cos(uTime * 0.05 + i)) * 0.004;
  return roomTex(i, coverUv(uv) + par + drift + disp).rgb;
}

void main() {
  float aspect = uRes.x / uRes.y;
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);
  float d = length(p);

  // Portal mask
  float wobble = (ed_noise(vec3(p * 3.0, uTime * 0.3)) - 0.5) * 0.06;
  float radius = pow(uPortal, 1.6) * (length(vec2(aspect, 1.0)) * 0.56 + 0.1);
  float mask = 1.0 - smoothstep(radius - 0.012, radius + 0.004, d + wobble * uPortal);
  float ring = exp(-abs(d + wobble * uPortal - radius) * 38.0) * smoothstep(0.0, 0.08, uPortal) * (1.0 - smoothstep(0.75, 1.0, uPortal));

  // Liquid wipe between rooms
  float fi = min(floor(uRoom), 3.0);
  float f = clamp(uRoom - fi, 0.0, 1.0);
  float ni = min(fi + 1.0, 3.0);
  float n = ed_fbm(vec3(vUv * vec2(aspect, 1.0) * 2.2, uTime * 0.04));
  float field = n * 0.55 + (1.0 - vUv.x) * 0.25 + vUv.y * 0.2;
  float x = f * 1.25 - 0.12;
  float wipe = smoothstep(field - 0.06, field + 0.06, x);
  float band = (1.0 - abs(wipe - 0.5) * 2.0);
  vec2 disp = vec2(n - 0.5, 0.5 - n) * 0.12;

  vec3 a = sampleRoom(fi, vUv, disp * f);
  vec3 b = sampleRoom(ni, vUv, -disp * (1.0 - f));
  vec3 col = mix(a, b, wipe);
  col += uTint * band * 0.35 * step(0.001, f) * step(f, 0.999);

  // Grade: slight tint, darkened for text contrast, vignette
  col = mix(col, col * (0.6 + uTint * 0.8), 0.22);
  col *= 0.8;
  col *= mix(1.0, smoothstep(1.25, 0.25, d), 0.55);

  vec3 outCol = col * mask + uTint * ring * 2.4;
  float alpha = clamp(mask + ring, 0.0, 1.0);
  gl_FragColor = vec4(outCol, alpha);
  #include <colorspace_fragment>
}
`;

export const backdropFragment = /* glsl */ `
uniform vec3 uTop;
uniform vec3 uBottom;
uniform vec3 uTint;
uniform vec2 uMouse;
uniform float uTime;
uniform vec2 uRes;
varying vec2 vUv;

${noiseGLSL}

void main() {
  float aspect = uRes.x / uRes.y;
  vec3 col = mix(uBottom, uTop, smoothstep(0.0, 1.0, vUv.y));
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);
  vec2 c = vec2(uMouse.x * 0.15, 0.05 + uMouse.y * 0.1);
  float glow = exp(-length(p - c) * 2.4);
  float haze = ed_fbm(vec3(p * 1.6, uTime * 0.03));
  col += uTint * glow * 0.075 * (0.6 + haze * 0.8);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`;
