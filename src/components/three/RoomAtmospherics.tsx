"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { PALETTE } from "@/lib/animation/tokens";
import { scene } from "@/lib/animation/sceneState";
import { roomWeight } from "./rooms";

/* ─────────── Volumetric light beams (Room 03 — Concerts) ─────────── */

const beamVertex = /* glsl */ `
varying vec2 vUv;
varying float vFres;
void main() {
  vUv = uv;
  vec3 n = normalize(normalMatrix * normal);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vFres = abs(dot(n, normalize(-mv.xyz)));
  gl_Position = projectionMatrix * mv;
}
`;

const beamFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
uniform float uTime;
varying vec2 vUv;
varying float vFres;
void main() {
  float along = pow(vUv.y, 1.4);
  float flicker = 0.85 + 0.15 * sin(uTime * 9.0 + vUv.x * 30.0);
  float a = along * pow(vFres, 2.0) * uOpacity * flicker;
  gl_FragColor = vec4(uColor * 1.6, a * 0.55);
}
`;

// Warm brand stage light: alternating brand yellow and warm white beams
const BEAM_COLORS = [
  PALETTE.brandYellow,
  PALETTE.warmWhite,
  PALETTE.brandYellow,
  PALETTE.warmWhite,
  PALETTE.brandYellow,
  PALETTE.warmWhite,
];

export function LightBeams() {
  const group = useRef<THREE.Group>(null);
  const geometry = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.04, 1.5, 13, 32, 1, true);
    g.translate(0, -6.5, 0);
    return g;
  }, []);
  const materials = useMemo(
    () =>
      BEAM_COLORS.map(
        (c) =>
          new THREE.ShaderMaterial({
            vertexShader: beamVertex,
            fragmentShader: beamFragment,
            uniforms: { uColor: { value: new THREE.Color(c) }, uOpacity: { value: 0 }, uTime: { value: 0 } },
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
          }),
      ),
    [],
  );

  useFrame((state, delta) => {
    const w = roomWeight(scene.room, 2) * scene.portal;
    const grp = group.current!;
    grp.visible = w > 0.01;
    if (!grp.visible) return;
    const vp = state.viewport.getCurrentViewport(state.camera, [0, 0, -2]);
    const t = state.clock.elapsedTime;
    grp.children.forEach((beam, i) => {
      const x = (i / (BEAM_COLORS.length - 1) - 0.5) * vp.width * 0.9;
      beam.position.set(x, vp.height / 2 + 0.4, -2);
      beam.rotation.z = Math.sin(t * (0.5 + i * 0.07) + i * 1.3) * 0.55;
      beam.rotation.x = Math.cos(t * 0.4 + i) * 0.25;
      const m = materials[i];
      m.uniforms.uOpacity.value = THREE.MathUtils.damp(m.uniforms.uOpacity.value, w, 6, delta);
      m.uniforms.uTime.value = t;
    });
  });

  return (
    <group ref={group} visible={false}>
      {materials.map((m, i) => (
        <mesh key={i} geometry={geometry} material={m} frustumCulled={false} />
      ))}
    </group>
  );
}

/* ─────────── Per-room particles ─────────── */

const moteVertex = /* glsl */ `
attribute float aSeed;
uniform float uTime;
uniform float uSpeed;
uniform float uSize;
uniform float uPixelRatio;
varying float vSeed;
void main() {
  vSeed = aSeed;
  vec3 p = position;
  p.y = mod(p.y + uTime * uSpeed * (0.4 + aSeed) + 5.0, 10.0) - 5.0;
  p.x += sin(uTime * 0.5 + aSeed * 20.0) * 0.15;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = uSize * uPixelRatio * (0.5 + aSeed) * (8.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}
`;

const moteFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
uniform float uTime;
uniform float uSparkle;
varying float vSeed;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float core = smoothstep(0.5, 0.0, d);
  float flare = uSparkle * (smoothstep(0.06, 0.0, abs(c.x)) + smoothstep(0.06, 0.0, abs(c.y))) * smoothstep(0.5, 0.1, d);
  float tw = 0.5 + 0.5 * sin(uTime * (2.0 + vSeed * 4.0) + vSeed * 50.0);
  float a = (core * core + flare) * uOpacity * mix(1.0, tw, uSparkle);
  gl_FragColor = vec4(uColor * (1.0 + flare), a);
}
`;

type MoteProps = { room: number; color: string; count: number; speed: number; size: number; sparkle?: number };

export function RoomMotes({ room, color, count, speed, size, sparkle = 0 }: MoteProps) {
  const points = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = Math.random() * 4 - 1;
      seed[i] = Math.random();
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    return g;
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSpeed: { value: speed },
      uSize: { value: size },
      uPixelRatio: { value: 1 },
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: 0 },
      uSparkle: { value: sparkle },
    }),
    [color, size, speed, sparkle],
  );
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: moteVertex,
        fragmentShader: moteFragment,
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [uniforms],
  );

  useFrame((state, delta) => {
    const w = roomWeight(scene.room, room) * scene.portal;
    points.current!.visible = w > 0.01;
    uniforms.uOpacity.value = w;
    uniforms.uTime.value += delta;
    uniforms.uPixelRatio.value = state.gl.getPixelRatio();
  });

  return (
    <points ref={points} geometry={geometry} frustumCulled={false} visible={false}>
      <primitive object={material} attach="material" />
    </points>
  );
}

export function RoomAtmospherics({ lite }: { lite: boolean }) {
  const k = lite ? 0.4 : 1;
  return (
    <group>
      <RoomMotes room={0} color={PALETTE.warmWhite} count={Math.round(160 * k)} speed={0.35} size={3} />
      <RoomMotes room={1} color={PALETTE.yellowSoft} count={Math.round(140 * k)} speed={0.15} size={9} />
      <LightBeams />
      <RoomMotes room={2} color={PALETTE.yellowLight} count={Math.round(120 * k)} speed={0.6} size={3} />
      <RoomMotes room={3} color={PALETTE.yellowSoft} count={Math.round(220 * k)} speed={-0.25} size={7} sparkle={1} />
    </group>
  );
}
