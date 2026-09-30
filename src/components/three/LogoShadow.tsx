"use client";

import { ContactShadows } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { MONOGRAM_VIEWBOX } from "@/lib/brand/logo";
import { scene } from "@/lib/animation/sceneState";
import { LIGHT_SCENE } from "@/lib/theme/scene";
import { useThemeColors } from "@/hooks/useThemeColors";
import { GUIDE_LOGO_NAME } from "./GuideLogo";
import { LOGO_UNIT } from "./logoGeometry";

/** Half the monogram's height in world units at scale 1 */
const HALF_HEIGHT = (MONOGRAM_VIEWBOX.height / 2) * LOGO_UNIT;
/** Shadow catcher size / depth range at logo scale 1 (the group scales with the logo) */
const SIZE = 4;
const FAR = 1.1;

/** Renderer / scene state swapped around the shadow pass */
const pass = { active: false, autoClear: false, hidden: [] as THREE.Object3D[] };

/**
 * Runs just before <ContactShadows> renders its depth pass (useFrame runs in mount order); LogoShadow undoes it
 * just after. Two things need fixing up for that pass only:
 *  - It renders into its targets without clearing them, relying on renderer.autoClear — which the post-processing
 *    composer turns off — and the opaque canvas clears with alpha 1. Left alone it accumulates a solid grey floor.
 *  - It renders the whole scene. Only the monogram should cast a shadow (ambient particles would smear into blobs).
 */
function PrepareShadowPass() {
  useFrame(({ gl, scene: root }) => {
    pass.active = scene.theme.light > 0;
    if (!pass.active) return;
    pass.autoClear = gl.autoClear;
    gl.autoClear = true;
    gl.setClearAlpha(0);

    const logo = root.getObjectByName(GUIDE_LOGO_NAME);
    if (!logo) return;
    // Hide every visible branch that isn't on the path to the logo, plus the logo's own contour lines
    for (let o: THREE.Object3D = logo; o.parent; o = o.parent) {
      for (const sibling of o.parent.children) {
        if (sibling !== o && sibling.visible) {
          sibling.visible = false;
          pass.hidden.push(sibling);
        }
      }
    }
    logo.traverse((o) => {
      if ((o as THREE.LineSegments).isLineSegments && o.visible) {
        o.visible = false;
        pass.hidden.push(o);
      }
    });
  });
  return null;
}

/**
 * Light theme: a soft contact shadow under the guide logo so it sits on the page instead of floating.
 * It follows the logo's damped position every frame and fades out with the dissolve and the Services portal.
 * The shadow pass only renders while the light theme is active (frames = 0 in dark → zero cost).
 */
export function LogoShadow() {
  const { theme } = useThemeColors();
  const group = useRef<THREE.Group>(null);

  useFrame(({ gl }) => {
    if (pass.active) {
      gl.autoClear = pass.autoClear;
      gl.setClearAlpha(1);
      pass.hidden.forEach((o) => (o.visible = true));
      pass.hidden.length = 0;
    }
    const grp = group.current;
    if (!grp) return;
    const logo = scene.logo;
    const strength = scene.theme.light * THREE.MathUtils.clamp(logo.dissolve, 0, 1) * (1 - scene.portal);
    grp.visible = strength > 0.01;
    if (!grp.visible) return;
    grp.position.set(logo.x, logo.y - HALF_HEIGHT * logo.scale * 1.06, logo.z);
    grp.scale.setScalar(Math.max(logo.scale, 0.01));
    const plane = grp.children.find((c): c is THREE.Mesh => (c as THREE.Mesh).isMesh);
    if (plane) (plane.material as THREE.MeshBasicMaterial).opacity = LIGHT_SCENE.shadowOpacity * strength;
  });

  return (
    <>
      <PrepareShadowPass />
      <ContactShadows
        ref={group}
        frames={theme === "light" ? Infinity : 0}
        scale={SIZE}
        far={FAR}
        blur={2.6}
        resolution={256}
        color="#000000"
      />
    </>
  );
}
