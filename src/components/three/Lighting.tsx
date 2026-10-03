"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useRef } from "react";
import { DAMP, PALETTE } from "@/lib/animation/tokens";
import { scene } from "@/lib/animation/sceneState";
import { LIGHT_SCENE } from "@/lib/theme/scene";

/**
 * Studio environment built from Lightformers (no HDRI download): soft white key strips
 * plus warm brand-yellow / white panels so the metal picks up golden reflections.
 * The light theme adds a soft key light and lifts the ambient (the key is at intensity 0 in dark, so dark is unchanged).
 */
export function Lighting() {
  const key = useRef<THREE.DirectionalLight>(null);
  const ambient = useRef<THREE.AmbientLight>(null);

  useFrame(() => {
    const L = scene.theme.light;
    key.current!.intensity = LIGHT_SCENE.keyLight * L;
    ambient.current!.intensity = THREE.MathUtils.lerp(0.15, LIGHT_SCENE.ambient, L);
  });

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
            color={PALETTE.yellowLight}
            intensity={5}
            rotation-y={Math.PI / 2}
            position={[-5, -1, -1]}
            scale={[20, 2, 1]}
          />
          <Lightformer
            form="rect"
            color={PALETTE.brandYellow}
            intensity={4}
            rotation-y={-Math.PI / 2}
            position={[10, -1, 0]}
            scale={[20, 3, 1]}
          />
          <Lightformer
            form="rect"
            color={PALETTE.warmWhite}
            intensity={3}
            position={[0, -6, 3]}
            scale={[12, 1.5, 1]}
            rotation-x={-Math.PI / 2}
          />
          <Lightformer form="ring" color={PALETTE.brandYellow} intensity={2} position={[4, 4, 6]} scale={3} />
        </group>
        {/* Front softboxes behind the camera: the flat faces of the monogram reflect these */}
        <Lightformer form="rect" intensity={1.6} position={[0, 2.5, 9]} scale={[14, 3, 1]} />
        <Lightformer form="rect" color={PALETTE.yellowSoft} intensity={1.2} position={[-6, -2, 8]} scale={[6, 6, 1]} />
        <Lightformer form="rect" color={PALETTE.warmWhite} intensity={1} position={[7, -1, 8]} scale={[5, 8, 1]} />
      </Environment>
      <ambientLight ref={ambient} intensity={0.15} />
      <directionalLight ref={key} intensity={0} position={[3, 6, 7]} color={PALETTE.warmWhite} />
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
