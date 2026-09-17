"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { scene } from "@/lib/animation/sceneState";

/** Faint low-poly geometry: a wireframe icosa shell and a faceted terrain drifting below. */
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
      color: new THREE.Color("#8B5CF6"),
      transparent: true,
      opacity: 0.07,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { shellGeo, terrainGeo, material };
  }, []);

  const target = useMemo(() => new THREE.Color(), []);

  useFrame((_, delta) => {
    const g = scene.guide;
    material.color.lerp(target.setRGB(g.r, g.g, g.b), 1 - Math.exp(-2 * delta));
    material.opacity = 0.07 * (0.3 + 0.7 * g.particles) * (1 - scene.portal * 0.8);
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
