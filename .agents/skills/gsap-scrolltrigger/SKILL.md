---
name: gsap-scrolltrigger
description: Build and review GSAP timelines and ScrollTrigger cinematic scroll scenes, pinning, scrubbing, responsive cleanup and accessible motion fallbacks.
---

# GSAP + ScrollTrigger

Locally authored supporting skill, based on official documentation. This is not an official GSAP-distributed skill.

## Before implementation

- Read the project structure, current GSAP version and existing animation ownership. Register ScrollTrigger once. Do not migrate frameworks or install other animation libraries merely to use this skill.
- Establish the visual concept and actual content first. A library does not supply art direction. Specify real image, video or 3D asset requirements; do not present primitive placeholders as finished artwork.
- For every scene record: trigger, start, end, scroll distance or duration, easing, user action, reverse behavior, mobile adaptation and reduced-motion state.
- Keep business logic, APIs, forms and links intact. Work only within the user's authorized scope.

## Implementation

1. Use a timeline with meaningful labels for related shots, rather than unrelated tweens on every section. Transform and opacity are preferred, but measure compositing cost for large layers.
2. Express ScrollTrigger start/end against actual layout. Use function-based distances with invalidateOnRefresh when values depend on viewport size.
3. For scrubbed timelines, tween durations determine relative portions of the scroll sequence; they are not fixed wall-clock durations. Numeric scrub adds catch-up time.
4. Pin a stable wrapper and animate its child. Consider ancestor transforms, pin spacing and downstream document flow. Create dependent pinned scenes in document order.
5. Refresh measurements after fonts and dimension-changing assets settle, not on every animation frame. Reserve media dimensions to prevent layout shifts.
6. Use gsap.matchMedia for desktop, touch/mobile and prefers-reduced-motion. Scope animations to a component with contexts; revert contexts/media handlers on teardown, including React Strict Mode remounts.
7. Keep native scrolling unless a deliberate interaction requires otherwise. Never trap keyboard focus in a pinned scene. Make optional snapping easy to interrupt.
8. Give mobile a shorter, simpler sequence. Reduced motion shows the final readable content without pinning or scroll-linked zooms. Content must remain available if JavaScript fails.

## Verification when implementation is requested

Check the scene before entry, while pinned, at exit, after reverse scrolling and after viewport changes. Inspect desktop and touch layouts, keyboard access, reduced motion, font/image loading and navigation away/back. Measure long frames on representative hardware; do not infer smoothness from a screenshot or headless execution alone.

## Sources

- https://gsap.com/docs/v3/GSAP/
- https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- https://gsap.com/docs/v3/GSAP/gsap.matchMedia()
