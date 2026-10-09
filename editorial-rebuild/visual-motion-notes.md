# Brand-film editorial worktable

## Applied skill instructions

Read `.agents/skills/astra-frontend-design/SKILL.md`, its `references/motion-and-interaction.md`, and `.agents/skills/gsap-scrolltrigger/SKILL.md` during this task. They inform a single material-led composition, native scrolling, finished content without JavaScript, responsive teardown and inspection of real browser frames. The SplitText skill was also read earlier; this section does not need another split-text effect. Flip, Three.js and Rive are not imported merely to claim additional technologies.

## Visual composition

One broad industry image, one editorial manuscript and one actual existing client screen form a composed worktable. The three surfaces have different sizes and functions; this is not a row of equivalent cards. The sheets settle into one registration grid as the user scrolls, while a controlled clipping reveal opens the content lines. There is no random rotation or autonomous floating.

- Planning: `art/optical-editorial.webp`, a brand visual of optical work. Its caption identifies it as a brand image, not documentary evidence of a named client's workplace.
- Content: original explanatory Korean copy about questions customers may ask. No quotations, testimonials or results are invented.
- Design: `evidence/portfolio-03.png`, the actual existing Three Factory Optical portfolio screenshot supplied by the repository. It is identified as an existing production example. This single reference does not replace or duplicate the full restored portfolio gallery.

## Integration

`renderBrandFilm()` is Node-safe and returns HTML. Call it where the section belongs in the homepage. Import `brand-film.css` in the parent application. Call `initBrandFilm({ gsap, ScrollTrigger })` after mounting the document and save the returned cleanup for route teardown. Plugins remain registered by the parent. Primary root selector: `[data-brand-film]`; diagnostic state is available on `element.brandFilmMotion`.

## Motion contract

| Scene | Start / end | Input and timing | Adaptation |
| --- | --- | --- | --- |
| Worktable assembly | Section top reaches 72% of viewport → section bottom reaches 85% | Native scroll, 0.65 s scrub smoothing; synchronized photograph scale, sheet alignment, matched four-value clipping and registration line | Fully reversible, no snap or scroll lock |
| Reading lines | Middle portion of the same timeline | Horizontal clipping reveals complete Korean lines with short stagger | Native semantic text remains present |
| Sticky stage | Desktop wider than 960 px and at least 650 px high | CSS sticky only; scene range is 130svh, capped at 1400 px | Mobile, short viewports and reduced motion show a static composed layout |

No canvas, per-frame DOM measurement, mouse-follow effect or extra video is introduced. Images are dimensioned, lazy-loaded and asynchronously decoded. Reduced motion and narrow layouts do not register this ScrollTrigger.

## Verification

Executed an isolated real-browser composition review using the actual finished `optical-editorial.webp` (1448 × 1086) and copied `evidence/portfolio-03.png` assets. Chromium / Playwright cases: 1440 × 900 desktop, 1280 × 720 shorter desktop, 390 × 844 mobile touch, and 1440 × 900 reduced motion. Captured and inspected the worktable at beginning, intermediate and settled scroll positions. Both assets loaded in all four cases; page errors and horizontal overflow were zero.

The first pixel review found insufficient contrast over the bright industry image and a missing space where a responsive line break disappeared. A restrained photographic shading mask now supports the white caption, the provenance caption has a dark backing, and the design headline retains its proper Korean spacing. The provenance caption also wraps inside its own 110 px area so the overlapping manuscript cannot cover it.

Mobile and reduced-motion cases reported `mode: static`; desktop reported scroll progress through its intermediate and settled positions. Calling the returned cleanup restored static mode and marked diagnostics inactive. `node --check` and Node-side HTML rendering also passed. The isolated browser used a temporary test page; no fake production placeholder image was added to the repository. The controller and CSS include full static fallbacks; a working transition is not a claim of award-level visual quality. Final homepage integration and performance are verified separately by the main QA agent.
