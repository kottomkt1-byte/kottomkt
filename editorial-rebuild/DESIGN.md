# KOTTO design direction — November 2026

## Brand and audience

KOTTO provides advertising and content marketing for the optical industry: optical stores, eyewear brands, spectacle lens/contact lens companies, manufacturers and distributors. The user authorized this expansion on 2026-11-09. The central statement is **안경을 아는 시선. 브랜드를 위한 콘텐츠.**

## Visual direction

A photographic editorial website, with generous margins, restrained serif headlines and concise sans-serif explanations. Original model portraits carry the visual identity. Large images alternate with clear service information and documented customer evidence. The dark selected-work section adds a deliberate change of pace between the light industry introduction and service index.

- Paper `#f3f0e8`; ink `#292720`; muted `#716c62`; rule `#ccc7bc`.
- Brick `#77362e` for the existing footer and brand accent; charcoal `#23282c` for selected work.
- Display: Kotto Display (Noto Serif KR subset); text: Kotto Text (Pretendard subset), with system fallbacks.
- Desktop gutter 48px, mobile 24px; full-width atmospheric hero, then asymmetric two-column editorial sections; mobile becomes a deliberate single-column sequence.
- Images use the supplied portfolio's actual color, face, glasses and clothing. Preview thumbnails are used at display sizes; full-resolution originals remain in the portfolio viewer.

## Composition and references

Reference galleries supplied by the user were reviewed as research, not copied as templates:

- [Cuuut](https://www.cuuut.com/) via [Landing.love](https://www.landing.love/sites/cuuut/): large work images with compact medium/case captions, generous space, work leading into the studio's point of view.
- [Treize grammes](https://www.13g.fr/) via [Supahero](https://supahero.io/hero/treize-grammes): short sequential brand statements and a clear progression to expertise/services/contact.
- [Red Antler](https://www.redantler.com/) via [Supahero](https://supahero.io/hero/red-antler): concise positioning followed by actual work and explicit service classification.
- [35mm](https://35mm-one.vercel.app/) via [Supahero](https://supahero.io/hero/35mm): optical details explained in relation to the object; relevant to the existing glasses detail section.

Reference content was retrieved; reference browser transitions/timings could not be independently verified. KOTTO motion is our implementation, not a claim about their code.

## Homepage and shared navigation

1. Silent 22-second photographic film; headline, industry category and one industry-introduction CTA. Homepage playback controls, film-viewing link and film caption remain hidden at the user's request.
2. Mint original model portrait with four linked audience rows.
3. Selected original eyewear images with asymmetric sizing, short captions and links to actual portfolio/cases.
4. Three service groups: images, explanatory content, customer contact channels.
5. Existing scoped achievement records and actual optical-store customer reactions.
6. Shared brand invitation, public contact channels and unchanged legal information.

## Service and inquiry behavior

`services.html?audience=store|eyewear|lenses|distribution` selects a native-button audience filter; without JS all services are readable. Place and Daangn remain store-specific. Model imagery is only for frames/sunglasses. Contact captures company/brand, industry and project type; optional store/location fields do not block a brand or lens company.

EmailJS's existing six-key payload is preserved; new inquiry context is assembled into the message. No invented clients, case outcomes or medical claims are introduced.

## Motion and accessibility

Use existing GSAP timelines/ScrollTrigger only. Desktop images get slow restrained scale/position movement; selected images reveal with a short scroll-linked crop. No long pinned homepage sequence. Mobile is readable in normal document flow. Reduced-motion and data-saving users receive the hero poster; no-JS content remains available. Clear focus styles, semantic headings, responsive images and keyboard-operable menus/filters are required.

## Review contract

Review rendered desktop and mobile screenshots, 320px overflow, all 13 routes and cross-page anchors; inspect service filters and mock form success/failure without sending mail. Preserve the 32 original portfolio images, portfolio #23 Optical image, actual Kakao feedback image, ZIN 01 viewer, legal/contact details and the scope of existing evidence.
