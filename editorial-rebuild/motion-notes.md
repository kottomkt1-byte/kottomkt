# KOTTO editorial paper scene

## Actual skill instructions applied

- `gsap-scrolltrigger` — `.agents/skills/gsap-scrolltrigger/SKILL.md`: scroll ownership remains with the main timeline; scene exposes a bounded progress setter, with responsive teardown and a readable static state.
- `gsap-splittext` — `.agents/skills/gsap-splittext/SKILL.md`: read for integration with the parent headline sequence; this module deliberately does not split or animate any text.
- `astra-frontend-design` — `.agents/skills/astra-frontend-design/SKILL.md` and `references/motion-and-interaction.md`: one meaningful paper/print interaction, no unrelated motion library, image-first fallback, no perpetual decorative rendering.

## Visual idea and integration

The existing commissioned/generated editorial paper photograph remains the finished image. A desktop-only WebGL surface projects that image onto a restrained curved sheet, then calculates directional grazing light from its surface normals. The movement references paper settling flat on an art director’s desk. It is not an eyewear/lens graphic and does not present a fabricated client project.

```js
import { createPaperScene } from './paper-scene.js';
import './paper-scene.css';

const paper = createPaperScene(document.querySelector('[data-paper-scene]'));
// In the existing hero ScrollTrigger:
// onUpdate: (self) => paper.setProgress(self.progress)
// On parent teardown: paper.destroy()
```

Use the accessible, dimensioned native image inside `[data-paper-scene]`. The wrapper owns its size; canvas and image fill that established rectangle. The canvas is hidden from assistive technology. Pointer movement is local to the artwork and never affects the page’s controls or text.

| Motion | Start and end | Timing / input | Reverse and fallback |
| --- | --- | --- | --- |
| Surface appearance | Loaded image and successful first GL frame | 420 ms crossfade over the unchanged native image | Failed WebGL leaves the native image visible |
| Curvature settling | Parent hero progress 0 → 1 | Parent scroll timeline; 125 ms exponential smoothing | Fully reversible; 0 is lightly curved, 1 nearly flat |
| Paper light response | Pointer enters / moves in artwork | Bounded pointer coordinates; 125 ms smoothing | Pointer exit settles to central light; no idle loop |
| Mobile / reduced motion | Under 841 px, coarse pointer or reduced-motion enabled | Immediate finished photograph | No WebGL draw or animation loop; preference changes tear down active GL |

## Performance and lifecycle

One texture, one draw call, 3,456 triangles. No Three.js, React Three Fiber or Rive dependency is needed. Canvas pixel ratio is capped at 1.5 and backing resolution at 1.2 million pixels. Mesh and texture upload happen once per eligible initialization. ResizeObserver updates resolution only when dimensions change. IntersectionObserver and document visibility suspend rendering outside the scene. Rendering also stops after interaction settles; there is no time-driven shader animation. A conservative sustained slow-frame guard reverts to the photograph.

`paper.diagnostics` reports selected mode, draw count, backing width/height and maximum JavaScript draw submission duration. Submission duration is not a GPU frame-time measurement. Actual browser and reference-device frame delivery must be evaluated separately by integrated QA.

## Scope

The module modifies only its own generated canvas. It does not change site routes, business data, forms, analytics or existing API behavior.

## Isolated browser verification

Executed with Playwright and installed Chromium, not inferred from source. Desktop: 1440 × 900; mobile: 390 × 900 with touch emulation. Inspected actual rendered initial, pointer-response and flat-sheet captures. All three retained the photographic texture, the complete burgundy letter composition and clean rectangular framing.

- WebGL compiled, linked and drew successfully. At a 600 × 750 CSS-pixel surface and device pixel ratio 2, backing dimensions were 900 × 1125, respecting the 1.5 cap.
- Idle check: draw count stayed 1 → 1. Offscreen progress update: draw count stayed 2 → 2. Returning onscreen resumed rendering and settled at 62 frames.
- Live reduced-motion change removed the canvas and left the native image visible; disabling reduced motion reinitialized the enhancement.
- Mobile, reduced-motion from first load and unavailable WebGL each used the native image with zero shader draws.
- Simulated WebGL context loss removed the canvas and used `image-context-fallback`.
- `destroy()` removed the generated canvas. All scenarios had zero page errors and no horizontal overflow.
- Observed JavaScript draw submission peak was 2.3 ms in the pointer/scroll test and 0.1 ms in the second lifecycle run. These values do not assert hardware GPU timing or production-device 60 fps. Integrated page QA remains the parent task’s responsibility.

## Integrated homepage verification

Tested the actual assembled homepage at `http://127.0.0.1:4180/` in Chromium at 1440 × 900 and 390 × 844, plus desktop reduced motion. This is an internal test address, not a public preview URL. Fonts were allowed to finish loading before the headline and scroll tests.

Verified the beginning, pointer response, native-wheel scroll positions 160 / 320 / 480 / 640 / 800 / 1000 px, reverse to the beginning and mobile static image state. The full-stage canvas measured 1344 × 812 backing pixels. Desktop WebGL rendered and tracked the parent scene progress. Mobile and reduced motion stayed in image mode with zero shader draws. No page errors or horizontal overflow occurred.

Two visible integration defects were reported to the main agent and corrected there: the original image clipping boundary crossed the last headline word; and the second heading began appearing on the cream background before the expanding photograph covered it. The corrected initial 45% top clipping and later second-heading entrance were visually rechecked. The initial headline is now clear, and the next heading appears against the photograph. Matching four-value `inset(...)` start/end strings were additionally recommended to ensure GSAP performs the intended clipping interpolation instead of reducing the entrance to opacity alone.

The main agent applied the matching four-value clipping fix as well. A fresh browser check at scroll 540 px / scene progress 0.6667 reported opacity 0.3148 and computed clipping `inset(0% 0% 68.5184%)`, confirming that the reveal boundary now interpolates through its intermediate state.

### Frame-delivery comparison

Method: fresh Chromium contexts, 1440 × 900, device pixel ratio 1, wait for fonts and entrance completion. For six seconds, a requestAnimationFrame driver moves native `scrollTo` through two smooth 0–810–0 px cycles using `810 × (1 − cos(progress × 4π)) / 2`. Record intervals between animation callbacks. Run once with the real WebGL enhancement and once with only `canvas.getContext('webgl')` disabled, leaving the remaining page, GSAP and scroll behavior unchanged. No screenshots or video capture run during this measurement.

| Scene | Measured intervals | Median | 95th percentile | Maximum | Intervals over 34 ms |
| --- | ---: | ---: | ---: | ---: | ---: |
| WebGL paper | 356 | 16.7 ms | 16.8 ms | 33.4 ms | 0 |
| Native image | 361 | 16.7 ms | 16.7 ms | 16.8 ms | 0 |

The WebGL run reported a maximum 0.2 ms JavaScript draw-submission time. An earlier run that included screenshot capture had a 33.3 ms 95th percentile; it is not used for the clean comparison above. These are measurements from the available headless cloud environment, not a guarantee of 60 fps on users’ devices or a direct measurement of GPU execution time. The bounds, idle/offscreen gating and photographic fallback remain necessary.
