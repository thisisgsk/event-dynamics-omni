/** Tiny one-shot signal: fired when the preloader has finished and scrolling is unlocked. */
let ready = false;
const listeners = new Set<() => void>();

export function markReady() {
  if (ready) return;
  ready = true;
  listeners.forEach((fn) => fn());
  listeners.clear();
}

export function onReady(fn: () => void) {
  if (ready) {
    fn();
    return () => {};
  }
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export const isReady = () => ready;
