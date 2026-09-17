"use client";

import { AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import * as THREE from "three";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { scene } from "@/lib/animation/sceneState";
import { Scene } from "./Scene";

const DevTuning =
  process.env.NODE_ENV === "development" ? dynamic(() => import("./DevTuning"), { ssr: false }) : () => null;

/** In reduced-motion mode we render on demand; keep a few frames flowing after changes so damping settles. */
function DemandDriver({ active }: { active: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (!active) return;
    let frames = 0;
    let raf = 0;
    const loop = () => {
      invalidate();
      if (++frames < 240) raf = requestAnimationFrame(loop);
    };
    const kick = () => {
      frames = 0;
      cancelAnimationFrame(raf);
      loop();
    };
    kick();
    window.addEventListener("resize", kick);
    window.addEventListener("ed:invalidate", kick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", kick);
      window.removeEventListener("ed:invalidate", kick);
    };
  }, [active, invalidate]);
  return null;
}

/** The single, persistent, fixed full-viewport WebGL canvas behind every page. */
export default function Experience() {
  const isMobile = useIsMobile();
  const reduced = useReducedMotion();
  const [lowPerf, setLowPerf] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    scene.isMobile = isMobile;
    scene.reduced = reduced;
  }, [isMobile, reduced]);

  // Pointer → normalised store (the canvas itself never receives pointer events)
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      scene.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      scene.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onVisibility = () => setHidden(document.hidden);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const lite = isMobile || lowPerf;
  const frameloop = hidden ? "never" : reduced ? "demand" : "always";

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <Canvas
        dpr={[1, isMobile ? 1.5 : 2]}
        frameloop={frameloop}
        camera={{ position: [0, 0, 7], fov: 35, near: 0.1, far: 80 }}
        gl={{ antialias: false, powerPreference: "high-performance", alpha: false, stencil: false }}
        onCreated={(state) => {
          const { gl } = state;
          if (process.env.NODE_ENV === "development") (window as unknown as { __r3f: unknown }).__r3f = state;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          scene.canvasReady = true;
          window.dispatchEvent(new Event("ed:canvas"));
        }}
      >
        <PerformanceMonitor onDecline={() => setLowPerf(true)} flipflops={3} onFallback={() => setLowPerf(true)}>
          <AdaptiveDpr pixelated={false} />
          <Scene lite={lite} reduced={reduced} />
        </PerformanceMonitor>
        <DemandDriver active={reduced && !hidden} />
      </Canvas>
      <DevTuning />
    </div>
  );
}
