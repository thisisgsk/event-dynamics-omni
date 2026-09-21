"use client";

import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { PALETTE } from "@/lib/animation/tokens";
import { scene } from "@/lib/animation/sceneState";
import { backdropFragment, fullscreenVertex, roomFragment } from "./shaders/room";
import { ROOM_TEXTURES, roomTint } from "./rooms";

// Preload room textures up front so they are ready (and counted by the preloader) before Services.
ROOM_TEXTURES.forEach((src) => useTexture.preload(src));

const tint = new THREE.Color();
const guideTint = new THREE.Color();

/** Deep background: #07070A → #0E0E14 gradient with a soft tinted glow that follows the pointer. */
export function Backdrop() {
  const uniforms = useMemo(
    () => ({
      uTop: { value: new THREE.Color(PALETTE.bg) },
      uBottom: { value: new THREE.Color(PALETTE.bg2) },
      uTint: { value: new THREE.Color(PALETTE.brandYellow) },
      uMouse: { value: new THREE.Vector2() },
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
    }),
    [],
  );
  // Material built once: passing uniforms as a JSX prop would clone them and frame updates would be lost
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: fullscreenVertex,
        fragmentShader: backdropFragment,
        uniforms,
        depthWrite: false,
        depthTest: false,
      }),
    [uniforms],
  );

  useFrame((state, delta) => {
    const g = scene.guide;
    uniforms.uRes.value.set(state.size.width, state.size.height);
    uniforms.uTime.value += delta;
    uniforms.uTint.value.lerp(guideTint.setRGB(g.r, g.g, g.b), 1 - Math.exp(-3 * delta));
    uniforms.uMouse.value.lerp(scene.pointer as unknown as THREE.Vector2, 1 - Math.exp(-2 * delta));
  });

  return (
    <mesh renderOrder={-20} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

/** The Services portal: four fullscreen rooms with a liquid wipe between them. */
export function RoomsPortal() {
  const textures = useTexture(ROOM_TEXTURES);
  const mesh = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(() => {
    textures.forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.minFilter = THREE.LinearFilter;
      t.generateMipmaps = false;
    });
    const img = textures[0].image as { width: number; height: number };
    return {
      uT0: { value: textures[0] },
      uT1: { value: textures[1] },
      uT2: { value: textures[2] },
      uT3: { value: textures[3] },
      uRoom: { value: 0 },
      uPortal: { value: 0 },
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uImgRes: { value: new THREE.Vector2(img.width, img.height) },
      uMouse: { value: new THREE.Vector2() },
      uTint: { value: new THREE.Color() },
    };
  }, [textures]);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: fullscreenVertex,
        fragmentShader: roomFragment,
        uniforms,
        transparent: true,
        depthWrite: false,
        depthTest: false,
      }),
    [uniforms],
  );

  useFrame((state, delta) => {
    const visible = scene.portal > 0.0005;
    mesh.current!.visible = visible;
    if (!visible) return;
    uniforms.uRes.value.set(state.size.width, state.size.height);
    uniforms.uTime.value += delta;
    uniforms.uRoom.value = scene.room;
    uniforms.uPortal.value = scene.portal;
    uniforms.uTint.value.copy(roomTint(scene.room, tint));
    uniforms.uMouse.value.lerp(scene.pointer as unknown as THREE.Vector2, 1 - Math.exp(-2.5 * delta));
  });

  return (
    <mesh ref={mesh} renderOrder={-10} frustumCulled={false} visible={false}>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
