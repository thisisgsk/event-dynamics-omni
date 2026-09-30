"use client";

import { useFrame } from "@react-three/fiber";
import { Bloom, ChromaticAberration, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import {
  BlendFunction,
  Effect,
  type BloomEffect,
  type ChromaticAberrationEffect,
  type NoiseEffect,
  type VignetteEffect,
} from "postprocessing";
import { forwardRef, useMemo, useRef } from "react";
import * as THREE from "three";
import { PALETTE } from "@/lib/animation/tokens";
import { scene } from "@/lib/animation/sceneState";
import { LIGHT_SCENE } from "@/lib/theme/scene";
import { roomTint } from "./rooms";

const tintFragment = /* glsl */ `
uniform vec3 uTint;
uniform float uAmount;
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  float l = dot(inputColor.rgb, vec3(0.2126, 0.7152, 0.0722));
  vec3 shadows = uTint * 0.05 * (1.0 - l);
  vec3 graded = inputColor.rgb * mix(vec3(1.0), 0.75 + uTint * 0.4, 0.35) + shadows;
  outputColor = vec4(mix(inputColor.rgb, graded, uAmount), inputColor.a);
}
`;

/** Custom grade that pushes the frame toward the active room / section accent. */
class TintGradeEffect extends Effect {
  constructor() {
    super("TintGrade", tintFragment, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, THREE.Uniform>([
        ["uTint", new THREE.Uniform(new THREE.Color(PALETTE.brandYellow))],
        ["uAmount", new THREE.Uniform(0.3)],
      ]),
    });
  }
}

const TintGrade = forwardRef<TintGradeEffect>(function TintGrade(_, ref) {
  const effect = useMemo(() => new TintGradeEffect(), []);
  return <primitive ref={ref} object={effect} dispose={null} />;
});

const guide = new THREE.Color();
const room = new THREE.Color();
const { lerp } = THREE.MathUtils;

const THRESHOLD = { full: 0.58, lite: 0.62 };
const VIGNETTE = 0.72;

/**
 * Full stack: Bloom · ChromaticAberration · TintGrade · Vignette · Noise.
 * `lite` (mobile / low perf) keeps Bloom only.
 * Light theme: bloom only on HDR highlights (bloom on white washes everything out), no vignette, softer
 * aberration and grain. The open Services portal shows the room photos, which keep the dark grade in both themes.
 */
export function Effects({ lite }: { lite: boolean }) {
  const bloom = useRef<BloomEffect>(null);
  const ca = useRef<ChromaticAberrationEffect>(null);
  const tint = useRef<TintGradeEffect>(null);
  const vignette = useRef<VignetteEffect>(null);
  const noise = useRef<NoiseEffect>(null);
  const caOffset = useMemo(() => new THREE.Vector2(0.0007, 0.0007), []);

  useFrame((_, delta) => {
    const g = scene.guide;
    const portalBoost = scene.portal * 0.35;
    // How much of the frame is the light page (the open portal covers it with photos)
    const lp = scene.theme.light * (1 - scene.portal);
    if (bloom.current) {
      const target = scene.tuning.bloom * (0.55 + g.glow * 0.45 + portalBoost) * lerp(1, LIGHT_SCENE.bloom, lp);
      bloom.current.intensity = THREE.MathUtils.damp(bloom.current.intensity, target, 3, delta);
      bloom.current.luminanceMaterial.threshold = lerp(
        lite ? THRESHOLD.lite : THRESHOLD.full,
        LIGHT_SCENE.bloomThreshold,
        lp,
      );
    }
    if (ca.current) {
      // Aberration swells mid-transition between rooms
      const transition = scene.portal * Math.sin((scene.room % 1) * Math.PI);
      const off =
        scene.tuning.aberration * (1 + scene.portal * 0.8 + transition * 3) * lerp(1, LIGHT_SCENE.aberration, lp);
      ca.current.offset.set(off, off);
    }
    if (tint.current) {
      guide.setRGB(g.r, g.g, g.b);
      if (scene.portal > 0.001) guide.lerp(roomTint(scene.room, room), scene.portal);
      const u = tint.current.uniforms;
      (u.get("uTint")!.value as THREE.Color).lerp(guide, 1 - Math.exp(-3 * delta));
      u.get("uAmount")!.value = 0.25 * (1 - lp) + scene.portal * 0.35;
    }
    if (vignette.current) vignette.current.darkness = VIGNETTE * (1 - lp);
    if (noise.current) {
      noise.current.blendMode.opacity.value = scene.tuning.grain * 6 * lerp(1, LIGHT_SCENE.grain, scene.theme.light);
    }
  });

  if (lite) {
    return (
      <EffectComposer multisampling={0} enableNormalPass={false}>
        <Bloom
          ref={bloom}
          mipmapBlur
          luminanceThreshold={THRESHOLD.lite}
          luminanceSmoothing={0.2}
          intensity={0.8}
          radius={0.7}
        />
      </EffectComposer>
    );
  }

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        ref={bloom}
        mipmapBlur
        luminanceThreshold={THRESHOLD.full}
        luminanceSmoothing={0.2}
        intensity={0.9}
        radius={0.75}
      />
      <ChromaticAberration ref={ca} offset={caOffset} radialModulation modulationOffset={0.35} />
      <TintGrade ref={tint} />
      <Vignette ref={vignette} eskil={false} offset={0.22} darkness={VIGNETTE} />
      <Noise ref={noise} premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={scene.tuning.grain * 6} />
    </EffectComposer>
  );
}
