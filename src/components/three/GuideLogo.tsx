"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import CustomShaderMaterial from "three-custom-shader-material";
import { scene } from "@/lib/animation/sceneState";
import { DAMP } from "@/lib/animation/tokens";
import { getProcessCurve } from "@/lib/animation/processCurve";
import { getLogoGeometries, LOGO_UNIT } from "./logoGeometry";
import { lineFragment, lineVertex, logoFragment, logoVertex } from "./shaders/logo";
import { roomTint } from "./rooms";

const { damp, lerp } = THREE.MathUtils;
const tmpPoint = new THREE.Vector3();
const roomColor = new THREE.Color();
const guideColor = new THREE.Color();

/** The persistent chrome "ed" monogram that travels through the whole story. */
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
      uTint: { value: new THREE.Color("#8B5CF6") },
    }),
    [],
  );
  const lineUniforms = useMemo(
    () => ({
      uDraw: { value: 0 },
      uConverge: { value: 0 },
      uOpacity: { value: 0 },
      uColor: { value: new THREE.Color("#22E4FF") },
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

    // Live tuning (Leva in dev, constants in production)
    [meshE.current, meshD.current].forEach((m) => {
      const mat = m?.material as THREE.MeshPhysicalMaterial | undefined;
      if (!mat) return;
      mat.roughness = scene.tuning.roughness;
      mat.envMapIntensity = scene.tuning.envIntensity;
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
    uniforms.uGlow.value = c.glow;
    uniforms.uTime.value += dt;

    lineUniforms.uDraw.value = scene.intro.lines;
    lineUniforms.uConverge.value = Math.min(1, scene.intro.lines * 1.35);
    lineUniforms.uOpacity.value = Math.min(1, scene.intro.lines * 2) * (1 - scene.intro.dissolve * 0.92);
    lineUniforms.uColor.value.copy(uniforms.uTint.value);
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
    <group ref={group}>
      <group ref={tilt}>
        {/* Negative Y flips SVG space; three.js corrects face winding for negative-determinant matrices */}
        <group scale={[1, -1, 1]}>
          <mesh ref={meshE} geometry={geo.e}>
            <CustomShaderMaterial {...shared} color="#F2C14E" iridescence={0.2} />
          </mesh>
          <mesh ref={meshD} geometry={geo.d}>
            <CustomShaderMaterial {...shared} color="#D9DCE6" iridescence={0.35} />
          </mesh>
          <lineSegments ref={lines} geometry={geo.lines} frustumCulled={false}>
            <primitive object={lineMaterial} attach="material" />
          </lineSegments>
        </group>
      </group>
    </group>
  );
}
