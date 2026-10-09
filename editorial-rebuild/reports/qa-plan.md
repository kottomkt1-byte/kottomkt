# Editorial rebuild — browser verification scope

The implementation preserves twelve distinct routes. Functional checks and visual review are separate outcomes; passing automation does not certify the design.

## Skills actually read

- `/workspace/kottomkt/.agents/skills/playwright/SKILL.md`
- `/workspace/kottomkt/.agents/skills/playwright/references/workflows.md`
- `/workspace/kottomkt/.agents/skills/playwright/references/cli.md`
- `/workspace/kottomkt/.agents/skills/astra-frontend-design/SKILL.md`
- `/workspace/kottomkt/.agents/skills/astra-frontend-design/references/quality-gates.md`

## Browser matrix

- Chromium desktop: 1440 × 900, normal motion.
- Chromium touch emulation: 390 × 844, normal motion.
- Both widths: reduced motion on the home, services and contact flows.
- JavaScript disabled: representative home, service and contact pages, checking readable content and reachable ordinary links.
- Twelve routes: `index`, `about`, `services`, `service-place`, `service-blog`, `service-instagram`, `service-cafe`, `service-daangn`, `service-hpblog`, `service-website`, `location`, `contact`.

## Interaction and content checks

- Navigation destination, current-page indication, internal anchors, logo link and CTA destination.
- Mobile menu opening/closing, Escape behavior, focus restoration and containment.
- Keyboard access, visible focus and skip-link behavior.
- Every image loaded, no horizontal overflow, headings and Korean line breaks readable.
- Intro start/middle/end, native-wheel scroll scene progression and touch swipe behavior.
- Reduced-motion scene readability, navigation and form access.
- Contact: required fields, privacy consent, phone validation, busy/duplicate suppression, success reset, failure preservation and SDK-unavailable fallback.
- EmailJS is intercepted or replaced before submission. No actual customer inquiry is sent.
- JavaScript exceptions, console errors, HTTP failures, layout-shift sources and sampled frame intervals.

## Visual review

Inspect actual screenshots of all twelve routes at both widths, plus scroll-state and menu/form screenshots. Rank missing content, broken flows, clipping and overlaps above typographic or animation polish. Send defects to implementation owners and rerun affected checks after each fix.

## Evidence and limits

Screenshots and recordings belong under `output/playwright/`. Structured observations and the final QA narrative are written after the application can run. Software-rendered cloud Chromium cannot establish performance on a physical phone or an Awwwards quality rating. No external preview URL is described as verified unless it has actually loaded.
