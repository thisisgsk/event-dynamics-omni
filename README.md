# Event Dynamics — Immersive Marketing Site

A scroll-driven, cinematic 3D website for **Event Dynamics**, built with Next.js 15, React Three Fiber, GSAP ScrollTrigger and Lenis.
One persistent WebGL canvas holds a chrome, extruded version of the Event Dynamics “ed” monogram. That logo guides the visitor through every section, from the preloader to the footer.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm run start
```

| Script                            | Purpose                                                               |
| --------------------------------- | --------------------------------------------------------------------- |
| `npm run dev` / `build` / `start` | Next.js                                                               |
| `npm run lint` / `typecheck`      | ESLint (Next + Prettier config) / strict TypeScript                   |
| `npm run format` / `format:check` | Prettier (+ Tailwind class sorting)                                   |
| `npm run generate:placeholders`   | Regenerates the stylised room + gallery artwork in `/public`          |
| `npm run generate:icons`          | Regenerates `src/app/icon.svg` + `apple-icon.png` from the logo paths |

Requires Node 20+.

---

## Folder structure

```
src/
├─ app/
│  ├─ layout.tsx              fonts (Syne + Inter via next/font), SEO metadata, <AppShell>
│  ├─ page.tsx                home: the section order *is* the film
│  ├─ services/[slug]/        statically generated service pages
│  ├─ contact/                standalone contact page
│  ├─ api/contact/route.ts    server-side zod validation for enquiries
│  ├─ opengraph-image.tsx     OG image rendered from the logo paths
│  ├─ icon.svg, apple-icon.png
│  └─ globals.css             Tailwind v4 @theme design tokens, glass surface, utilities
├─ content/site.ts            ALL copy, stats, rooms, events, testimonials, links
├─ components/
│  ├─ providers/              AppShell, SmoothScroll (Lenis ⇄ GSAP), TransitionProvider (curtain), SoundProvider
│  ├─ three/                  the single <Canvas>: Scene, GuideLogo, RoomsPortal, particles, beams, confetti, Effects
│  │  └─ shaders/             GLSL for logo dissolve, contour lines, room portal/wipe, noise
│  ├─ sections/               Hero, About, services/*, Experiences, Process, Testimonials, Finale, contact/*, Footer,
│  │                          GuideTimeline (master timeline), GuidePose (sub-page poses)
│  └─ ui/                     GlassCard, MagneticButton, Cursor, Navbar, MobileMenu, SectionHeading, TiltCard, Preloader…
├─ hooks/                     useSplitReveal, useMediaQuery, useReducedMotion, useIsMobile
└─ lib/
   ├─ animation/              tokens.ts, gsap.ts, sceneState.ts, poses.ts, processCurve.ts, ready.ts
   ├─ brand/logo.ts           the traced monogram paths (single source for DOM, 3D, icons, OG)
   ├─ validation/contact.ts   zod schema shared by form + API
   └─ utils/
```

`PLAN.md` contains the section list, the full scroll-timeline map and the 3D scene graph.

---

## How the motion system works

- **One scene store.** `lib/animation/sceneState.ts` is a plain mutable object. GSAP tweens it and `useFrame` reads and damps it. No per-frame React state.
- **One master timeline.** `components/sections/GuideTimeline.tsx` builds a paused GSAP timeline whose time axis is _scroll pixels_. Every guide pose from `lib/animation/poses.ts` is anchored to a section trigger (`"about.end"`, `"services@0.1"`, …), so the logo moves continuously and is rebuilt on every `ScrollTrigger.refresh()`.
- **Section timelines** (pinned + scrubbed) own their DOM choreography and the Services portal values (`scene.portal`, `scene.room`).
- **Framer Motion (`motion/react`)** is used only for micro-interactions: buttons, cursor, menu, curtain, form states.
- **Lenis** drives smooth scrolling on the GSAP ticker (`lagSmoothing(0)`, `lenis.on('scroll', ScrollTrigger.update)`).

### Brand palette

Extracted from the logo (yellow "e", white "d"). CSS tokens live in `globals.css` `@theme`, and their TypeScript mirror `PALETTE` lives in `src/lib/animation/tokens.ts` and feeds the 3D scene, shaders, OG image and room tints.

| Token          | Hex     | Use                                                  |
| -------------- | ------- | ---------------------------------------------------- |
| `brand-yellow` | #EBB92E | primary accent, buttons, eyebrows, rail, focus rings |
| `brand-white`  | #FFFFFF | logo "d", secondary button outline                   |
| `yellow-light` | #F5D268 | hover                                                |
| `yellow-soft`  | #FBE6A2 | gradient mid-stop, highlights                        |
| `yellow-dark`  | #C8961C | pressed                                              |
| `yellow-deep`  | #8A6614 | borders on dark                                      |
| `yellow-muted` | #4A3C18 | subtle fills / borders                               |
| `warm-white`   | #FFF6E0 | 3D light, warm white tints                           |
| `fg`           | #F5F1E8 | body text (warm off-white)                           |
| `error`        | #FF5A52 | validation                                           |

The accent gradient runs brand yellow → yellow-soft → brand white. Dark text on brand yellow is 11:1 and brand yellow on #07070A is 11:1, so both pass WCAG AA.
To re-verify the brand hexes against the real logo file, save it as `public/brand/logo.png` and run `node scripts/extract-brand-colors.mjs`.

### Tuning animation

| What                                                                             | Where                                                                                                                        |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Easings, durations, staggers, scrub smoothing, damping, pin lengths, breakpoints | `src/lib/animation/tokens.ts` (CSS mirrors in `globals.css` `@theme`)                                                        |
| Logo position/rotation/scale/tint per section                                    | `src/lib/animation/poses.ts` (`nx`/`ny` are viewport-normalised −1…1)                                                        |
| Where each pose is anchored in the scroll                                        | `KEYFRAMES` in `components/sections/GuideTimeline.tsx`                                                                       |
| Services room timing (open, holds, wipes, close)                                 | constants at the top of `components/sections/services/Services.tsx`                                                          |
| Process path shape (shared by the SVG and the 3D curve)                          | `PROCESS_POINTS` in `lib/animation/processCurve.ts`                                                                          |
| Bloom, env intensity, chrome roughness, aberration                               | `scene.tuning` in `sceneState.ts`. In dev, open **`/?tune`** for a live Leva panel (Leva is excluded from production builds) |

---

## Swapping content & imagery

- **Copy:** edit `src/content/site.ts`. Stats, client names, events and testimonials are **sample content**, so replace them before launch.
- **Room images:** replace the files in `public/rooms/`, keeping the filenames (or update `services.rooms[].image`):
  `room-01-corporate.webp`, `room-02-weddings.webp`, `room-03-concerts.webp`, `room-04-gala.webp`.
  Use 16:9 WebP around 1920×1080 and under ~300 KB each. They feed both the WebGL portal and the finale bento.
- **Gallery images:** `public/experiences/exp-0X-*.webp`, portrait 4:5 (960×1200).
- The bundled artwork is procedurally generated by `scripts/generate-placeholders.mjs`. It's a stand-in for real event photography.
- **Room tints:** `services.rooms[].tint` sets each room's 3D logo glow and post-processing grade. Keep it to `PALETTE` yellow/white values. The DOM overlay (eyebrow, tags, rail) always uses brand yellow.
- **Logo:** the monogram paths live in `src/lib/brand/logo.ts`. After changing them, run `npm run generate:icons`.
- **Client logos:** `components/sections/ClientMarquee.tsx` renders typographic marks. Swap in SVG logos there.

## Contact form

`/api/contact` validates with the same zod schema as the client. It does **not** send email yet. Add your provider (Resend, Postmark, a CRM or a webhook) at the `TODO(integration)` in `src/app/api/contact/route.ts`.

---

## Performance & accessibility

- A single WebGL context for the whole site, persisted across routes. `dpr={[1, 2]}`, `PerformanceMonitor` switches to _lite_ mode (fewer particles, Bloom only) and `AdaptiveDpr`.
- Rendering pauses when the tab is hidden (`frameloop="never"`). Reduced-motion mode renders on demand.
- Particles are single-draw-call `Points` shaders. Confetti uses `InstancedMesh`.
- Room textures preload at startup and count toward the preloader's `useProgress`.
- DOM images use `next/image` (AVIF/WebP). There are no GLB models; if you add any, compress them with Draco and use KTX2 textures (`useGLTF` + `useKTX2` from drei).
- **Mobile (<768px):** shorter pins, a native swipe row for Experiences, a vertical Process timeline, lite 3D.
- **`prefers-reduced-motion`:** no pinning or scrubbed 3D. The logo rests in a static pose and Services becomes stacked panels.
- Semantic landmarks, a skip link, a keyboard-operable room rail and menu (Esc closes), visible focus rings, labelled form fields with announced errors.
- Every GSAP animation is created inside `useGSAP` / `gsap.matchMedia`, so it reverts on unmount. `ScrollTrigger.sort()` + `refresh()` run after fonts, load and the preloader.
