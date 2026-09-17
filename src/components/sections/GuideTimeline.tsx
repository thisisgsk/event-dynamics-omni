"use client";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/animation/gsap";
import { POSES, type PoseName } from "@/lib/animation/poses";
import { scene } from "@/lib/animation/sceneState";
import { EASE, GUIDE_FOLLOW, MEDIA } from "@/lib/animation/tokens";

/**
 * Keyframes for the guide logo, anchored to section ScrollTriggers.
 * Anchor syntax: "<triggerId>.start" | "<triggerId>.end" | "<triggerId>@<0…1>" | "max".
 */
const KEYFRAMES: Array<[anchor: string, pose: PoseName]> = [
  ["hero.start", "HERO"],
  ["hero.end", "HERO_END"],
  ["about.start", "ABOUT_IN"],
  ["about.end", "ABOUT"],
  ["services.start", "SERVICES_PRE"],
  ["services@0.1", "PORTAL"],
  ["services@0.92", "PORTAL"],
  ["services.end", "SERVICES_OUT"],
  ["experiences.start", "EXPERIENCES"],
  ["experiences.end", "EXPERIENCES_END"],
  ["process.start", "PROCESS_A"],
  ["process@0.92", "PROCESS_B"],
  ["work.start", "WORK"],
  ["work.end", "WORK_END"],
  ["finale.start", "FINALE"],
  ["finale.end", "FINALE"],
  ["contact.start", "CONTACT"],
  ["contact.end", "CONTACT"],
  ["max", "FOOTER"],
];

function resolveAnchor(anchor: string): number | null {
  if (anchor === "max") return ScrollTrigger.maxScroll(window);
  const at = anchor.indexOf("@");
  const id = at >= 0 ? anchor.slice(0, at) : anchor.split(".")[0];
  const st = ScrollTrigger.getById(id);
  if (!st) return null;
  if (at >= 0) return st.start + (st.end - st.start) * parseFloat(anchor.slice(at + 1));
  return anchor.endsWith(".end") ? st.end : st.start;
}

/**
 * THE master timeline. One paused GSAP timeline whose time axis is scroll pixels; every guide pose
 * is placed at the pixel position of its section trigger. Rebuilt on every ScrollTrigger refresh.
 * Must render after all sections so their triggers exist (and refresh) first.
 */
export function GuideTimeline() {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add(MEDIA.reduced, () => {
      gsap.to(scene.guide, { ...POSES.STATIC, duration: 0.01 });
      window.dispatchEvent(new Event("ed:invalidate"));
    });

    mm.add(`${MEDIA.desktop}, ${MEDIA.mobile}`, () => {
      let tl: gsap.core.Timeline | null = null;
      const proxy = { t: window.scrollY };

      const build = () => {
        tl?.kill();
        const frames = KEYFRAMES.map(([anchor, pose]) => ({ at: resolveAnchor(anchor), pose: POSES[pose] }))
          .filter((f): f is { at: number; pose: (typeof POSES)[PoseName] } => f.at !== null)
          .sort((a, b) => a.at - b.at);
        if (!frames.length) return;

        tl = gsap.timeline({ paused: true });
        tl.set(scene.guide, { ...frames[0].pose }, 0);
        for (let i = 0; i < frames.length - 1; i++) {
          const a = frames[i];
          const b = frames[i + 1];
          // Riding the Process curve must stay linear so the logo stays in sync with the SVG path
          const onCurve = a.pose.curveMix === 1 && b.pose.curveMix === 1;
          tl.fromTo(
            scene.guide,
            { ...a.pose },
            {
              ...b.pose,
              duration: Math.max(b.at - a.at, 0.001),
              ease: onCurve ? EASE.none : "sine.inOut",
              immediateRender: false,
            },
            a.at,
          );
        }
        tl.time(proxy.t);
      };

      const st = ScrollTrigger.create({
        id: "guide-master",
        // Refresh after every section trigger so the keyframe anchors are final
        refreshPriority: -100,
        start: 0,
        end: "max",
        onRefresh: build,
        onUpdate: (self) => {
          gsap.to(proxy, {
            t: self.scroll(),
            duration: GUIDE_FOLLOW,
            ease: EASE.out,
            overwrite: true,
            onUpdate: () => tl?.time(proxy.t),
          });
        },
      });
      build();

      return () => {
        st.kill();
        tl?.kill();
      };
    });

    return () => mm.revert();
  });

  return null;
}
