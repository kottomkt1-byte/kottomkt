# Studio visual redesign — 2026-11-09

The user expected the supplied inspiration sites to inform a visible design change. The earlier industry expansion retained too much of the previous cream/serif composition. This revision replaces the visual system and page structure, while retaining the broadened optical-industry positioning.

## Delivered

- Large sans-serif KOTTO masthead, black navigation and a new full-width three-panel photographic film.
- Original-image horizontal portfolio reel with staggered dimensions, native scroll and previous/next buttons.
- Four large numbered industry links, three open service columns, oversized black contact footer.
- Service index and seven service details redesigned with bold typography and neutral layouts.
- About's dark manifesto and paired original photographs; minimal contact form; address-led location page.
- Model-image detail typography aligned with the site. Original Optical label/image, Kakao capture and ZIN 01 viewer retained.
- Matching 1200×630 social preview. Font subsets rebuilt for the current Korean copy.

## References and evidence

Actual rendered Cuuut and Treizegrammes pages were inspected, through the user's Landing.love and Supahero references. Their relevant composition observations and KOTTO-specific adaptations are documented in DESIGN.md. The earlier and current homepage captures are in ignored `output/studio-redesign/`; additional screenshots are in `output/industry-redesign/` and `output/playwright/company-industry/`.

The new desktop background is 1440×600, 22 seconds, 24fps, 528 frames, silent, 2,833,054 bytes. It uses nine existing original portraits, with restrained zoom and dissolves. Source first/last frames match. The MP4 was fully decoded and an encoded contact sheet inspected. SHA-256: `16969196fd6a7ab571735271452d4edb667a7f35453bdab9bafb69d9fca01cd4`.

The existing mobile film and separate full brand film were preserved. The mobile source breakpoint now matches the 760px page layout. Homepage film controls, opening link and caption remain hidden as requested.

## Verification

- Production build: 13 pages / 152 manifest files; static build audit passed, including 30 existing evidence image hashes.
- Industry audit: all 13 routes at 1440px and 390px, plus two cross-page filter/inquiry journeys. No overflow, broken images, failed HTTP responses or JavaScript errors.
- Company form audit: 1440px, 390px and 320px. Six-key EmailJS contract, optional company/industry fields, service prefill, validation, pending/double-submit, success and failure behavior passed against mocks. No real mail sent.
- Gallery audit: 12 cases across 1440/768/390/320px and normal/reduced/no-JS. End-to-start navigation, keyboard scrolling and focus, all six images and page overflow passed. Previous-from-end now selects the preceding reachable scroll stop.
- Film audit: normal desktop/tablet/mobile, 760/768px source boundary, reduced motion, save-data and no-JS. Hidden overlays, no full-film preload, 22-second muted playback and poster policy verified.
- Rendered home hero, gallery, industry section and footer were independently inspected at 1440/768/390px; 320px screenshots also checked. Service, About, Contact and model-image screens inspected.

The original 32 portfolio images, customer feedback, business/contact information and existing scoped achievement claims were not replaced or broadened. No new dependencies were added. The existing on-demand Three.js viewer retains Vite's bundle-size notice; it is not loaded as part of the initial homepage.
