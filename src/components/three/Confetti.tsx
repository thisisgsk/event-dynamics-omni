"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { scene } from "@/lib/animation/sceneState";

const COLORS = ["#22E4FF", "#8B5CF6", "#FF2BD6", "#EBB92E", "#F4F3EF"];
const LIFETIME = 4.5;

/** Instanced confetti burst, fired by setting `scene.confettiAt` (contact form success). */
export function Confetti({ count = 260 }: { count?: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const lastBurst = useRef(-1);
  const startTime = useRef(0);

  const data = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        rot: new THREE.Euler(),
        spin: new THREE.Vector3(),
        scale: 0.6 + Math.random() * 0.8,
      })),
    [count],
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const colorsSet = useRef(false);

  useFrame((state, delta) => {
    const m = mesh.current!;
    if (!colorsSet.current) {
      const c = new THREE.Color();
      for (let i = 0; i < count; i++) m.setColorAt(i, c.set(COLORS[i % COLORS.length]));
      m.instanceColor!.needsUpdate = true;
      colorsSet.current = true;
    }

    if (scene.confettiAt !== lastBurst.current && scene.confettiAt > 0) {
      lastBurst.current = scene.confettiAt;
      startTime.current = state.clock.elapsedTime;
      const vp = state.viewport.getCurrentViewport(state.camera, [0, 0, 0]);
      const origin = new THREE.Vector3(scene.isMobile ? 0 : vp.width * 0.22, -vp.height * 0.1, 1);
      data.forEach((p) => {
        p.pos.copy(origin);
        const a = Math.random() * Math.PI * 2;
        const speed = 3 + Math.random() * 6;
        p.vel.set(Math.cos(a) * speed * 0.8, Math.abs(Math.sin(a)) * speed + 3, (Math.random() - 0.5) * 4);
        p.rot.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
        p.spin.set(Math.random() * 8 - 4, Math.random() * 8 - 4, Math.random() * 8 - 4);
      });
    }

    const age = state.clock.elapsedTime - startTime.current;
    const active = lastBurst.current > 0 && age < LIFETIME;
    m.visible = active;
    if (!active) return;

    const dt = Math.min(delta, 1 / 30);
    const fade = 1 - THREE.MathUtils.smoothstep(age, LIFETIME * 0.6, LIFETIME);
    data.forEach((p, i) => {
      p.vel.y -= 9 * dt;
      p.vel.multiplyScalar(1 - 1.4 * dt);
      p.pos.addScaledVector(p.vel, dt);
      p.rot.x += p.spin.x * dt;
      p.rot.y += p.spin.y * dt;
      p.rot.z += p.spin.z * dt;
      dummy.position.copy(p.pos);
      dummy.rotation.copy(p.rot);
      dummy.scale.setScalar(p.scale * fade);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false} visible={false}>
      <planeGeometry args={[0.09, 0.16]} />
      <meshBasicMaterial side={THREE.DoubleSide} />
    </instancedMesh>
  );
}
