"use client";

import { Leva, useControls } from "leva";
import { scene } from "@/lib/animation/sceneState";

/** Development-only Leva panel (never bundled in production — see Experience.tsx). */
export default function DevTuning() {
  const t = scene.tuning;
  useControls("Event Dynamics · 3D", {
    bloom: { value: t.bloom, min: 0, max: 3, step: 0.05, onChange: (v: number) => (t.bloom = v) },
    envIntensity: { value: t.envIntensity, min: 0, max: 4, step: 0.05, onChange: (v: number) => (t.envIntensity = v) },
    roughness: { value: t.roughness, min: 0, max: 1, step: 0.01, onChange: (v: number) => (t.roughness = v) },
    aberration: { value: t.aberration, min: 0, max: 0.005, step: 0.0001, onChange: (v: number) => (t.aberration = v) },
  });

  // Hidden unless the URL contains ?tune so it never covers the navbar while reviewing
  const visible = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("tune");

  return (
    <div className="pointer-events-auto">
      <Leva collapsed hidden={!visible} titleBar={{ title: "3D tuning" }} />
    </div>
  );
}
