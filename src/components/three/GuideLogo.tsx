"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { DAMP, PALETTE } from "@/lib/animation/tokens";
import { blendSwitchVisibility, LIGHT_SCENE } from "@/lib/theme/scene";
import CustomShaderMaterial from "three-custom-shader-material";
import { scene } from "@/lib/animation/sceneState";
import { getProcessCurve } from "@/lib/animation/processCurve";
import { getLogoGeometries, LOGO_UNIT } from "./logoGeometry";
import { lineFragment, lineVertex, logoFragment, logoVertex } from "./shaders/logo";
import { roomTint } from "./rooms";

const { damp, lerp } = THREE.MathUtils;
const tmpPoint = new THREE.Vector3();
const roomColor = new THREE.Color();
const guideColor = new THREE.Color();
const themeColor = new THREE.Color();
const WHITE = new THREE.Color(1, 1, 1);
/** Scene-graph name of the logo's root group (the light theme's contact shadow looks it up) */
export const GUIDE_LOGO_NAME = "guide-logo";
const HEAD_LIGHT = new THREE.Color(PALETTE.brandYellow);

/**
 * The persistent chrome "ed" monogram that travels through the whole story.
 * Dark: gold "e" + bright white metal "d". Light: deeper gold "e" + polished graphite "d" with warm yellow
 * reflections, so it holds strong contrast on white (materials only — the geometry never changes).
 */
export function GuideLogo() {
  const group = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  const lines = useRef<THREE.LineSegments>(null);
  const meshE = useRef<THREE.Mesh>(null);
  const meshD = useRef<THREE.Mesh>(null);
  const geo = useMemo(getLogoGeometries, []);

  const uniforms = useMemo(
    () => ({
      uDissolve: { value: 0 },
      uGlow: { value: 0.6 },
      uTime: { value: 0 },
      uTint: { value: new THREE.Color(PALETTE.brandYellow) },
    }),
    [],
  );
  const lineUniforms = useMemo(
    () => ({
      uDraw: { value: 0 },
      uConverge: { value: 0 },
      uOpacity: { value: 0 },
      uColor: { value: new THREE.Color(PALETTE.yellowLight) },
      uHead: { value: new THREE.Color(1, 1, 1) },
    }),
    [],
  );

  const lineMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: lineVertex,
        fragmentShader: lineFragment,
        uniforms: lineUniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [lineUniforms],
  );

  const cur = useRef({ x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, s: 1, dissolve: 0, glow: 0.6, px: 0, py: 0 });

  useFrame((state, delta) => {
    const g = scene.guide;
    const c = cur.current;
    const dt = Math.min(delta, 1 / 20);
    const k = scene.reduced ? 20 : DAMP.guide;
    const vp = state.viewport.getCurrentViewport(state.camera, tmpPoint.set(0, 0, 0));
    const mobile = scene.isMobile;

    let tx = g.nx * (vp.width / 2) * (mobile ? 0.25 : 1);
    let ty = g.ny * (vp.height / 2) * (mobile ? 0.8 : 1);
    if (g.curveMix > 0.001 && !mobile) {
      const p = getProcessCurve(vp.width, vp.height).getPointAt(THREE.MathUtils.clamp(g.processT, 0, 1), tmpPoint);
      tx = lerp(tx, p.x, g.curveMix);
      ty = lerp(ty, p.y, g.curveMix);
    }

    c.x = damp(c.x, tx, k, dt);
    c.y = damp(c.y, ty, k, dt);
    c.z = damp(c.z, g.z, k, dt);
    c.rx = damp(c.rx, g.rx, k, dt);
    c.ry = damp(c.ry, g.ry, k, dt);
    c.rz = damp(c.rz, g.rz, k, dt);
    // Scale with the visible world width so the monogram never overflows narrow/portrait screens
    const fit = Math.min(1, vp.width / 6.2);
    c.s = damp(c.s, g.scale * fit, k, dt);
    c.glow = damp(c.glow, g.glow, k, dt);
    c.dissolve = damp(c.dissolve, g.dissolve * scene.intro.dissolve, scene.intro.dissolve < 1 ? 30 : k, dt);
    c.px = damp(c.px, scene.pointer.x, DAMP.pointer, dt);
    c.py = damp(c.py, scene.pointer.y, DAMP.pointer, dt);

    // Live tuning (Leva in dev, constants in production), blended toward the light-theme metal
    const theme = scene.theme;
    const L = theme.light;
    [meshE.current, meshD.current].forEach((m, i) => {
      const mat = m?.material as THREE.MeshPhysicalMaterial | undefined;
      if (!mat) return;
      mat.roughness = lerp(scene.tuning.roughness, LIGHT_SCENE.roughness, L);
      mat.envMapIntensity = lerp(scene.tuning.envIntensity, LIGHT_SCENE.envIntensity, L);
      const col = i === 0 ? theme.logoE : theme.logoD;
      mat.color.setRGB(col.r, col.g, col.b, THREE.SRGBColorSpace);
    });

    const grp = group.current!;
    grp.position.set(c.x, c.y, c.z);
    grp.rotation.set(c.rx, c.ry, c.rz);
    grp.scale.setScalar(c.s * LOGO_UNIT);
    grp.visible = c.dissolve > 0.002 || scene.intro.lines > 0.001;

    // Damped mouse parallax on an inner group so it never fights the timeline
    const t = tilt.current!;
    t.rotation.x = -c.py * 0.28;
    t.rotation.y = c.px * 0.4;

    // Tint: guide colour blended toward the active room accent while the portal is open
    guideColor.setRGB(g.r, g.g, g.b);
    if (scene.portal > 0.001) guideColor.lerp(roomTint(scene.room, roomColor), scene.portal);
    uniforms.uTint.value.lerp(guideColor, 1 - Math.exp(-4 * dt));
    uniforms.uDissolve.value = c.dissolve;
    uniforms.uGlow.value = c.glow * lerp(1, LIGHT_SCENE.glow, L);
    uniforms.uTime.value += dt;

    // Where the logo is this frame — the light theme's contact shadow follows it
    const out = scene.logo;
    out.x = c.x;
    out.y = c.y;
    out.z = c.z;
    out.scale = c.s;
    out.dissolve = c.dissolve;

    lineUniforms.uDraw.value = scene.intro.lines;
    lineUniforms.uConverge.value = Math.min(1, scene.intro.lines * 1.35);
    lineUniforms.uOpacity.value = Math.min(1, scene.intro.lines * 2) * (1 - scene.intro.dissolve * 0.92);
    lineUniforms.uColor.value.copy(uniforms.uTint.value);
    lineUniforms.uHead.value.copy(WHITE);
    if (L > 0) {
      // Light: dark contour lines with a gold draw-head, normal blending (additive can't darken white)
      lineUniforms.uOpacity.value *= blendSwitchVisibility(L);
      lineUniforms.uColor.value.lerp(
        themeColor.setRGB(theme.strong.r, theme.strong.g, theme.strong.b, THREE.SRGBColorSpace),
        L,
      );
      lineUniforms.uHead.value.lerp(HEAD_LIGHT, L);
    }
    lineMaterial.blending = L < 0.5 ? THREE.AdditiveBlending : THREE.NormalBlending;
    if (lines.current) lines.current.visible = lineUniforms.uOpacity.value > 0.01;
  });

  const shared = {
    baseMaterial: THREE.MeshPhysicalMaterial,
    vertexShader: logoVertex,
    fragmentShader: logoFragment,
    uniforms,
    metalness: 1,
    roughness: scene.tuning.roughness,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    envMapIntensity: scene.tuning.envIntensity,
    side: THREE.DoubleSide,
  } as const;

  return (
    <group ref={group} name={GUIDE_LOGO_NAME}>
      <group ref={tilt}>
        {/* Negative Y flips SVG space; three.js corrects face winding for negative-determinant matrices */}
        <group scale={[1, -1, 1]}>
          <mesh ref={meshE} geometry={geo.e}>
            {/* Gold metal matched to the brand yellow "e" */}
            <CustomShaderMaterial {...shared} color={PALETTE.brandYellow} />
          </mesh>
          <mesh ref={meshD} geometry={geo.d}>
            {/* Bright white metal for the "d", as in the logo */}
            <CustomShaderMaterial {...shared} color={PALETTE.brandWhite} />
          </mesh>
          <lineSegments ref={lines} geometry={geo.lines} frustumCulled={false}>
            <primitive object={lineMaterial} attach="material" />
          </lineSegments>
        </group>
      </group>
    </group>
  );
}
