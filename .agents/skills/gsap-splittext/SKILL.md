---
name: gsap-splittext
description: Implement accessible GSAP SplitText line, word and character animation, responsive resplitting, Korean typography and lifecycle cleanup.
---

# GSAP SplitText

Locally authored supporting skill, based on official documentation. This is not an official GSAP-distributed skill.

## Scope and preparation

Read the installed GSAP/SplitText version and register the plugin. Check that the version supports the API you use. Preserve real headings and meaningful reading order. Use typography to communicate the brand; splitting text is not itself a design concept.

Record the entrance trigger, unit (line/word/character), stagger, total duration, ease, replay policy and static fallback before implementation. Split only the text that benefits from it, not the entire page.

## Implementation

- Use SplitText.create with explicit type. Prefer line or word reveals for long Korean text; check actual wrapping, punctuation and grapheme behavior rather than assuming Latin word boundaries.
- Wait for the intended font when necessary. For responsive line splitting use autoSplit and create AND RETURN the animation inside onSplit. This lets resplitting dispose obsolete targets and preserve animation continuity.
- Select one appropriate mask type when a clipped reveal is intended; do not assume multiple mask types can be combined.
- Keep headings readable at all widths. Reserve the intended layout and avoid hiding content globally before scripts initialize.
- Review accessibility explicitly. aria:auto places a label on the parent and hides generated children from assistive technology. This may conceal nested link semantics: keep functional links outside the split target or provide a carefully designed accessible structure with no duplicate focus stops.
- In reduced-motion mode show the original text without splitting or staggered movement. Never delay access to a primary call to action until an intro completes.
- Revert SplitText and its animation on teardown. Reinitialize only when required; avoid accumulating wrappers, ScrollTriggers or listeners.

## Verification when implementation is requested

Test fonts loading late, Korean and mixed-script copy, resize across line breaks, keyboard links, screen-reader naming, reduced motion and repeated navigation. Inspect the actual reveal at its start, middle and end rather than only its finished state.

## Source

- https://gsap.com/docs/v3/Plugins/SplitText/
