"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { scene } from "@/lib/animation/sceneState";
import { DAMP } from "@/lib/animation/tokens";

/**
 * Studio environment built from Lightformers (no HDRI download): soft white key strips
 * plus cyan / violet / magenta panels so the chrome picks up neon reflections.
 */
export function Lighting() {
  return (
    <>
      <Environment resolution={256} frames={1}>
        <group rotation={[-Math.PI / 3, 0, 1]}>
          <Lightformer form="circle" intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={2} />
          <Lightformer
            form="rect"
            intensity={2.2}
            rotation-y={Math.PI / 2}
            position={[-5, 1, -1]}
            scale={[20, 0.3, 1]}
          />
          <Lightformer
            form="rect"
            intensity={2.2}
            rotation-y={-Math.PI / 2}
            position={[10, 1, 0]}
            scale={[20, 0.5, 1]}
          />
          <Lightformer
            form="rect"
            color="#22E4FF"
            intensity={5}
            rotation-y={Math.PI / 2}
            position={[-5, -1, -1]}
            scale={[20, 2, 1]}
          />
          <Lightformer
            form="rect"
            color="#8B5CF6"
            intensity={4}
            rotation-y={-Math.PI / 2}
            position={[10, -1, 0]}
            scale={[20, 3, 1]}
          />
          <Lightformer
            form="rect"
            color="#FF2BD6"
            intensity={3}
            position={[0, -6, 3]}
            scale={[12, 1.5, 1]}
            rotation-x={-Math.PI / 2}
          />
          <Lightformer form="ring" color="#EBB92E" intensity={2} position={[4, 4, 6]} scale={3} />
        </group>
        {/* Front softboxes behind the camera: the flat faces of the monogram reflect these */}
        <Lightformer form="rect" intensity={1.6} position={[0, 2.5, 9]} scale={[14, 3, 1]} />
        <Lightformer form="rect" color="#FFE7A8" intensity={1.2} position={[-6, -2, 8]} scale={[6, 6, 1]} />
        <Lightformer form="rect" color="#9BE8FF" intensity={1} position={[7, -1, 8]} scale={[5, 8, 1]} />
      </Environment>
      <ambientLight intensity={0.15} />
    </>
  );
}

/** Damped dolly driven by the master timeline + gentle pointer parallax. */
export function CameraRig() {
  const camera = useThree((s) => s.camera);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const g = scene.guide;
    const k = scene.reduced ? 0 : 1;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, scene.pointer.x * 0.25 * k, DAMP.camera, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, scene.pointer.y * 0.18 * k, DAMP.camera, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, g.camZ, DAMP.camera, dt);
    camera.lookAt(0, 0, 0);
  });

  return null;
}
