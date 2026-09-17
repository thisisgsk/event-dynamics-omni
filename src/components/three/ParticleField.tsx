"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { scene } from "@/lib/animation/sceneState";

const vertex = /* glsl */ `
attribute float aSeed;
uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;
varying float vTwinkle;
varying float vDepth;

void main() {
  vec3 p = position;
  p.x += sin(uTime * 0.08 + aSeed * 6.28) * 0.35;
  p.y += cos(uTime * 0.06 + aSeed * 12.1) * 0.3;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vTwinkle = 0.55 + 0.45 * sin(uTime * (0.6 + aSeed * 1.8) + aSeed * 40.0);
  vDepth = clamp(-mv.z / 22.0, 0.0, 1.0);
  gl_PointSize = uSize * uPixelRatio * (0.4 + aSeed) * (14.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}
`;

const fragment = /* glsl */ `
uniform vec3 uTint;
uniform float uOpacity;
varying float vTwinkle;
varying float vDepth;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  a *= a;
  vec3 col = mix(vec3(1.0), uTint, 0.55 + vDepth * 0.4);
  gl_FragColor = vec4(col, a * vTwinkle * uOpacity * (1.0 - vDepth * 0.6));
}
`;

/** Ambient star/dust field — one draw call. */
export function ParticleField({ count }: { count: number }) {
  const points = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 26;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 2] = -Math.random() * 16 + 3;
      seed[i] = Math.random();
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    return g;
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 5 },
      uPixelRatio: { value: 1 },
      uTint: { value: new THREE.Color("#8B5CF6") },
      uOpacity: { value: 1 },
    }),
    [],
  );

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [uniforms],
  );
  const tmp = useMemo(() => new THREE.Color(), []);

  useFrame((state, delta) => {
    const g = scene.guide;
    uniforms.uTime.value += delta;
    uniforms.uPixelRatio.value = state.gl.getPixelRatio();
    uniforms.uTint.value.lerp(tmp.setRGB(g.r, g.g, g.b), 1 - Math.exp(-2 * delta));
    uniforms.uOpacity.value = THREE.MathUtils.damp(uniforms.uOpacity.value, g.particles, 3, delta);
    const p = points.current!;
    p.rotation.y = THREE.MathUtils.damp(p.rotation.y, scene.pointer.x * 0.06 + g.ry * 0.015, 2, delta);
    p.rotation.x = THREE.MathUtils.damp(p.rotation.x, -scene.pointer.y * 0.04, 2, delta);
  });

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <primitive object={material} attach="material" />
    </points>
  );
}
