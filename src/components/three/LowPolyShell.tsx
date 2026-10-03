"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { PALETTE } from "@/lib/animation/tokens";
import { scene } from "@/lib/animation/sceneState";
import { blendSwitchVisibility, LIGHT_SCENE } from "@/lib/theme/scene";

/**
 * Faint low-poly geometry: a wireframe icosa shell and a faceted terrain drifting below.
 * Dark: additive lines in the guide tint. Light: faint grey lines (--graphic-line) with normal blending.
 */
export function LowPolyShell() {
  const shell = useRef<THREE.LineSegments>(null);
  const terrain = useRef<THREE.LineSegments>(null);

  const { shellGeo, terrainGeo, material } = useMemo(() => {
    const shellGeo = new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(11, 1));
    const plane = new THREE.PlaneGeometry(46, 30, 26, 16);
    const pos = plane.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      pos.setZ(i, Math.sin(x * 0.35) * Math.cos(y * 0.4) * 1.1 + (Math.random() - 0.5) * 0.8);
    }
    const terrainGeo = new THREE.WireframeGeometry(plane);
    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color(PALETTE.brandYellow),
      transparent: true,
      opacity: 0.07,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { shellGeo, terrainGeo, material };
  }, []);

  const target = useMemo(() => new THREE.Color(), []);
  const themed = useMemo(() => new THREE.Color(), []);

  useFrame((_, delta) => {
    const g = scene.guide;
    const t = scene.theme;
    target.setRGB(g.r, g.g, g.b);
    if (t.light > 0) target.lerp(themed.setRGB(t.line.r, t.line.g, t.line.b, THREE.SRGBColorSpace), t.light);
    material.color.lerp(target, 1 - Math.exp(-2 * delta));
    material.blending = t.light < 0.5 ? THREE.AdditiveBlending : THREE.NormalBlending;
    const base = THREE.MathUtils.lerp(0.07, LIGHT_SCENE.lineOpacity, t.light);
    material.opacity =
      base * (0.3 + 0.7 * g.particles) * (1 - scene.portal * 0.8) * (t.light > 0 ? blendSwitchVisibility(t.light) : 1);
    shell.current!.rotation.y += delta * 0.02;
    shell.current!.rotation.x = g.ry * 0.02;
    terrain.current!.position.z = -6 + Math.sin(g.ry * 0.05) * 1.5;
  });

  return (
    <group>
      <lineSegments ref={shell} geometry={shellGeo} material={material} position={[0, 0, -8]} />
      <lineSegments
        ref={terrain}
        geometry={terrainGeo}
        material={material}
        position={[0, -5.2, -6]}
        rotation={[-Math.PI / 2.25, 0, 0]}
      />
    </group>
  );
}
