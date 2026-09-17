"use client";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/animation/gsap";
import { POSES, type PoseName } from "@/lib/animation/poses";
import { scene } from "@/lib/animation/sceneState";
import { EASE } from "@/lib/animation/tokens";

/** Sub-pages: ease the persistent guide logo into a calm resting pose (no master timeline here). */
export function GuidePose({ pose = "SUBPAGE" }: { pose?: PoseName }) {
  useGSAP(() => {
    gsap.to(scene, { portal: 0, room: 0, duration: 0.6, ease: EASE.out });
    gsap.to(scene.guide, { ...POSES[pose], duration: 1.6, ease: EASE.inOut, overwrite: true });
    window.dispatchEvent(new Event("ed:invalidate"));
    ScrollTrigger.refresh();
  }, [pose]);

  return null;
}
