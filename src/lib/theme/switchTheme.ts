import { flushSync } from "react-dom";
import { scene } from "@/lib/animation/sceneState";
import { MEDIA } from "@/lib/animation/tokens";

export type ThemeName = "light" | "dark";

const REVEAL_MS = 700;
const FADE_MS = 280;

/** Put the class on <html> ourselves (next-themes does the same right after) so the change is synchronous. */
function applyClass(next: ThemeName) {
  const root = document.documentElement;
  root.classList.toggle("dark", next === "dark");
  root.classList.toggle("light", next === "light");
  root.style.colorScheme = next;
}

/** Kill CSS transitions for one frame so nothing animates between the two themes on its own. */
function withoutTransitions(run: () => void) {
  const style = document.createElement("style");
  style.textContent = "*,*::before,*::after{transition:none!important}";
  document.head.appendChild(style);
  run();
  void getComputedStyle(document.body).opacity; // force a style flush
  requestAnimationFrame(() => style.remove());
}

/**
 * Switch theme without touching scroll position, ScrollTrigger or any running timeline — only colours change.
 *  - View Transitions API: circular reveal expanding from `origin` (the toggle's centre); the 3D scene switches
 *    instantly underneath because the reveal *is* the transition.
 *  - No View Transitions: quick crossfade (CSS colour transitions + the 3D scene's GSAP tween).
 *  - prefers-reduced-motion: instant.
 */
export function switchTheme(next: ThemeName, setTheme: (t: ThemeName) => void, origin?: { x: number; y: number }) {
  const reduced = window.matchMedia(MEDIA.reduced).matches;
  const commit = () => {
    applyClass(next);
    flushSync(() => setTheme(next));
  };

  if (reduced) {
    scene.theme.instant = true;
    withoutTransitions(commit);
    return;
  }

  if (typeof document.startViewTransition === "function") {
    const x = origin?.x ?? window.innerWidth / 2;
    const y = origin?.y ?? 0;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    scene.theme.instant = true;
    const transition = document.startViewTransition(() => withoutTransitions(commit));
    transition.ready
      .then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          {
            duration: REVEAL_MS,
            easing: "cubic-bezier(0.65, 0, 0.35, 1)",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      })
      .catch(() => {});
    return;
  }

  // Fallback crossfade
  const root = document.documentElement;
  root.classList.add("theme-fade");
  commit();
  window.setTimeout(() => root.classList.remove("theme-fade"), FADE_MS + 40);
}
