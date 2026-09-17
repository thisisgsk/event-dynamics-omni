# Event Dynamics — Build Plan

## 1. Sections (home `/`)

| #   | Section                | DOM id        | Pin (desktop / mobile)       | Notes                                                                              |
| --- | ---------------------- | ------------- | ---------------------------- | ---------------------------------------------------------------------------------- |
| 0   | Preloader              | –             | locks Lenis                  | `useProgress` counter, 3D wire draw-in → shader dissolve → wordmark → curtain wipe |
| 1   | Hero                   | `top`         | +=100% / +=50%               | headline splits apart w/ blur, logo glides to right third, rotates 180°            |
| 2   | About                  | `about`       | +=150% / none                | GlassCard slides up, line reveal, 4 stat counters, magnetic CTA                    |
| 3   | Services — Four Rooms  | `services`    | +=500% / +=300%              | portal open → 4 rooms (liquid wipe shader) → portal close, side rail 01–04         |
| 4   | Experiences            | `experiences` | horizontal track / swipe row | tilt cards, velocity skew                                                          |
| 5   | Process                | `process`     | +=300% / none (vertical)     | SVG path draws, logo rides matching `CatmullRomCurve3`                             |
| 6   | Testimonials & Clients | `work`        | sticky stack                 | velocity marquee, peeling stacked cards                                            |
| 7   | Finale bento           | `finale`      | +=200% / +=100%              | 4 room tiles fly in from depth around centred logo                                 |
| 8   | Contact + Footer       | `contact`     | –                            | RHF + zod glass form, confetti in canvas, oversized wordmark                       |

Sub-routes: `/services/[slug]`, `/contact` (curtain page transitions, guide logo eases to a static pose).

## 2. Scroll-timeline map

All values the 3D layer consumes live in one mutable store: `lib/animation/sceneState.ts`.
GSAP writes, R3F `useFrame` reads + damps. Nothing in React state → no re-renders per frame.

| ScrollTrigger (id)   | Trigger / start → end                               | Controls                                                                                                                                                                                                             |
| -------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`guide-master`**   | document `0 → max` (smoothed)                       | ONE paused timeline, keyframes placed at pixel positions of the section triggers below. Tweens `scene.guide` = logo x/y/z, rotation, scale, dissolve, tint rgb, glow, camera z, curveMix, processT, particle opacity |
| `hero`               | `#top` top top → +=100% (pin, scrub)                | headline word drift/blur, sub-line + scroll-hint fade, hero text parallax layers                                                                                                                                     |
| `about`              | `#about` top top → +=150% (pin, scrub)              | card slide-up, line reveal, stat counters                                                                                                                                                                            |
| `services`           | `#services` top top → +=500% (pin, scrub)           | `scene.portal` 0→1→0, `scene.room` 0→3 w/ holds, room overlay staggers, rail state; labels `room0..3` for rail clicks                                                                                                |
| `experiences`        | `#experiences` top top → +=track width (pin, scrub) | track `x`, velocity → `skewX` quickTo                                                                                                                                                                                |
| `process`            | `#process` top top → +=300% (pin, scrub)            | SVG `strokeDashoffset`, step activation at arc-length fractions                                                                                                                                                      |
| `work`               | `#work` top bottom → bottom top                     | marquee `timeScale` from velocity; per-card peel triggers                                                                                                                                                            |
| `finale`             | `#finale` top top → +=200% (pin, scrub)             | tile fly-in sequence, headline, CTA                                                                                                                                                                                  |
| `contact` / `footer` | enter viewport (scrub)                              | heading reveals, wordmark char rise                                                                                                                                                                                  |
| `progress`           | document                                            | top gradient progress bar                                                                                                                                                                                            |
| Section headings     | heading top 85% → top 45% (scrub)                   | shared SplitText char stagger (`useSplitReveal`)                                                                                                                                                                     |

Guide keyframes (anchor → pose, see `lib/animation/poses.ts`):
`hero.start HERO → hero.end HERO_END → about.start/end ABOUT → services.start SERVICES_PRE → services@0.12 PORTAL → services@0.9 PORTAL → services.end SERVICES_OUT → experiences.* → process.start PROCESS_A → process.end PROCESS_B → work.* → finale.* → contact.* → max FOOTER`.

Room accent tint: `mix(guide tint, roomTint(scene.room), scene.portal)` — computed in the scene so the master timeline stays the single owner of the guide.

## 3. Scene graph (single `<Canvas>`, fixed, z-0, pointer-events none)

```
Canvas (dpr [1,2], PerformanceMonitor → quality store)
├─ color background #07070A
├─ BackdropGradient     fullscreen quad, #07070A→#0E0E14 + tint glow (renderOrder -20)
├─ RoomsPortal          fullscreen quad: 4 textures, portal ring mask, liquid wipe, parallax (renderOrder -10)
├─ LowPolyShell         wireframe icosahedron + faceted plane, slow drift
├─ ParticleField        Points shader (1800 desktop / 600 mobile)
├─ RoomAtmospherics
│  ├─ LightBeams        additive volumetric cones (room 3 — concerts)
│  └─ RoomParticles ×3  cyan data motes / candle bokeh / champagne sparkles
├─ Environment          custom Lightformers (neon cyan/violet/magenta + white) → chrome reflections
├─ CameraRig            damped dolly (guide.camZ) + pointer parallax
├─ Float
│  └─ GuideLogo (group ← scene.guide, damped + mouse rotation)
│     ├─ mesh "e"  ExtrudeGeometry(SVG) + CSM(MeshPhysical gold chrome, dissolve shader)
│     ├─ mesh "d"  ExtrudeGeometry(SVG) + CSM(MeshPhysical silver chrome)
│     └─ lineSegments  EdgesGeometry, drawRange for preloader wire draw-in
├─ Confetti             InstancedMesh burst on form success
└─ Effects              Bloom · ChromaticAberration · TintGrade(custom) · Vignette · Noise  (mobile/low: Bloom only)
```

## 4. Build order

scaffold → tokens/state/content → providers (Lenis, transitions, sound) → UI kit → canvas + logo + preloader → Hero → About → Services → Experiences → Process → Testimonials → Finale → Contact/Footer → sub-routes → SEO/OG → reduced-motion + mobile pass → lint/build.
