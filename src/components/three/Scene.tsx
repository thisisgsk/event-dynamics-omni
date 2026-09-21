"use client";

import { Float } from "@react-three/drei";
import { Suspense } from "react";
import { PALETTE } from "@/lib/animation/tokens";
import { Confetti } from "./Confetti";
import { Effects } from "./Effects";
import { GuideLogo } from "./GuideLogo";
import { CameraRig, Lighting } from "./Lighting";
import { LowPolyShell } from "./LowPolyShell";
import { ParticleField } from "./ParticleField";
import { RoomAtmospherics } from "./RoomAtmospherics";
import { Backdrop, RoomsPortal } from "./RoomsPortal";

type Props = { lite: boolean; reduced: boolean };

/** The whole 3D story lives in this one scene graph (see PLAN.md §3). */
export function Scene({ lite, reduced }: Props) {
  return (
    <>
      <color attach="background" args={[PALETTE.bg]} />
      <Backdrop />
      <Suspense fallback={null}>
        <RoomsPortal />
      </Suspense>
      <LowPolyShell />
      <ParticleField count={lite ? 600 : 1800} />
      <RoomAtmospherics lite={lite} />
      <Lighting />
      <CameraRig />
      <Float
        speed={reduced ? 0 : 1.1}
        rotationIntensity={reduced ? 0 : 0.18}
        floatIntensity={reduced ? 0 : 0.35}
        floatingRange={[-0.08, 0.08]}
      >
        <GuideLogo />
      </Float>
      <Confetti count={lite ? 140 : 260} />
      <Effects lite={lite} />
    </>
  );
}
