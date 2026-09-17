/** Shared GLSL value-noise helpers (cheap, no textures). */
export const noiseGLSL = /* glsl */ `
float ed_hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float ed_noise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(ed_hash(i + vec3(0,0,0)), ed_hash(i + vec3(1,0,0)), f.x),
                 mix(ed_hash(i + vec3(0,1,0)), ed_hash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(ed_hash(i + vec3(0,0,1)), ed_hash(i + vec3(1,0,1)), f.x),
                 mix(ed_hash(i + vec3(0,1,1)), ed_hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float ed_fbm(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * ed_noise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}
`;
