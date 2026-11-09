# KOTTO studio design — November 2026

## Positioning

고또마케팅 provides advertising and content marketing for the optical industry: optical stores, eyewear brands, spectacle lens/contact lens companies, manufacturers, importers and distributors. The statement is **안경을 아는 시선. 브랜드를 위한 콘텐츠.** Services remain grounded in actual capabilities; model imagery covers frames and sunglasses.

## Visual system

A contemporary photographic studio: very large sans-serif typography, near-black structural sections, off-white reading surfaces, and the supplied photographs as the principal color source. This replaces the previous cream/rust, serif-heading, left-copy/right-portrait layout.

- Night `#111315`; paper `#f5f5f2`; ink `#141618`; muted `#6a6e70`; rule `#d6d7d4`.
- Kotto Text, a renamed Pretendard variable subset. Headlines generally 550–700; body 400–450. The existing “Optical.” image label keeps its distinct italic type at the user's request.
- 32px desktop gutters; 20px mobile. Shared black navigation is 76px / 64px high.
- The large KOTTO wordmark and compact Korean positioning form the home masthead. A full-width 1440×600 film follows; text is not overlaid on the images.
- Selected work uses a native horizontally scrollable photographic reel with unequal widths, heights and generous spacing. Arrows supplement touch and keyboard scrolling.
- Four numbered industry rows occupy one dark section. Services use three open columns, with no decorative card containers.
- A large invitation and oversized lowercase wordmark form the dark footer.

## References actually inspected

The user supplied inspiration galleries, including Supahero, Landing.love, Bentogrids, Navbar.gallery, Footer.design and 60fps. Two linked sites were opened and their rendered screenshots visually inspected during this revision:

- [Cuuut](https://www.cuuut.com/), found through [Landing.love](https://www.landing.love/sites/cuuut/): a white canvas, small edge navigation, widely spaced portrait work and a partly visible next image. Applied as generous negative space and a horizontal work reel, not as a claim that Cuuut uses a full-bleed hero.
- [Treizegrammes](https://www.13g.fr/), found through [Supahero](https://supahero.io/hero/treize-grammes): a dark divided opening, strong object/type scale and a vertical divider. Applied as dark structural panels and the masthead's division. Its original headline is serif; KOTTO's sans-serif direction is our own choice.

The references inform composition rather than supplying copied components. No claim is made about their source code or exact animation timing. The wide photographic film and typography were designed specifically for KOTTO.

## Page structure

Home: masthead → silent film → selected image reel → studio point of view → four industries → three service groups → existing scoped achievements → actual customer feedback → shared contact footer.

Services: dark typographic masthead and original portrait; audience filters; numbered service rows with photographic previews. Seven detail pages use bold sans-serif headings and neutral demonstration interfaces while retaining real case evidence.

About: full-width dark manifesto with two original portraits, followed by industry knowledge, work and existing scoped records. Contact: large sans-serif introduction and a clear inquiry form. Location: dark address panel and explicitly loaded map, without generated office illustrations.

## Content and behavior constraints

- Preserve the original 32 model photographs and their appearance, Optical portfolio #23 (`tf5922-020-women-02.webp`), original Kakao feedback capture and ZIN 01 viewer.
- Keep the user's hidden homepage film link, pause control and film caption hidden. The 22-second ambient film contains no embedded overlay text. Desktop uses the new three-panel film, mobile the existing portrait edit. The separate full brand film is unchanged.
- Store-specific services remain store-specific. No invented clients, reviews, outcomes, medical claims or contact-lens simulations.
- Industry links select `services.html?audience=store|eyewear|lenses|distribution`. Without JavaScript all eight services remain readable.
- Preserve EmailJS's six-key payload, form validation and service prefill. Industry/company/project details are assembled into the message; store address is optional. Never send test mail to the real service.
- Preserve registered business, contact and legal information.

## Motion, accessibility and verification

Existing GSAP handles short headline entrances and a restrained film reveal. Native scrolling remains available throughout, with no long pinned home sequence. Reduced-motion and data-saving users receive a poster. Menu, filters, gallery arrows and form remain keyboard-operable; no-JS content is available.

Inspect actual 1440px and mobile screenshots, test 320px layout, all 13 routes, gallery boundaries, service filters and mocked form outcomes. Verify original evidence hashes, movie decoding and homepage overlay policy before deployment.
