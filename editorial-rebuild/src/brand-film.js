/** Editorial worktable. Rendering is Node-safe; no browser globals at module scope. */
export function renderBrandFilm() {
  return `<section class="brand-film" data-brand-film aria-labelledby="brand-film-title">
    <div class="film-scroll-range">
      <div class="film-stage">
        <header class="film-heading">
          <h2 id="brand-film-title">안경원의 일을, 콘텐츠로 옮깁니다.</h2>
          <p>현장의 이야기를 듣고.<br>내용을 정리하고. 어울리는 화면을 만듭니다.</p>
        </header>
        <div class="film-worktable">
          <figure class="film-craft">
            <div class="film-photo-window"><img src="art/optical-editorial.webp" width="1448" height="1086" loading="lazy" decoding="async" alt="안경 부품과 측정 도구를 소재로 만든 브랜드 이미지"></div>
            <figcaption><span class="film-chapter-number" aria-hidden="true">01</span><h3>안경을 아는 기획.</h3><p>안경원의 일이 무엇인지,<br>무슨 이야기를 전할지부터.</p></figcaption>
            <span class="film-image-note">안경 업종을 표현한<br>브랜드 이미지</span>
          </figure>
          <article class="film-copy-sheet">
            <span class="film-chapter-number" aria-hidden="true">02</span>
            <h3>읽히는 콘텐츠.</h3>
            <p class="film-copy-lines"><span>어떤 안경을 다루는지.</span><span>왜 그 안경을 권하는지.</span><span>매장에서는 어떻게 살피는지.</span></p>
            <p class="film-copy-caption">고객이 궁금해할 질문에서<br>한 편의 이야기를 시작합니다.</p>
            <span class="film-copy-rule" aria-hidden="true"></span>
          </article>
          <figure class="film-design-sheet">
            <figcaption><span class="film-chapter-number" aria-hidden="true">03</span><h3>매장마다 <br>다른 디자인.</h3></figcaption>
            <div class="film-proof-window"><img src="evidence/portfolio-03.png" width="1024" height="693" loading="lazy" decoding="async" alt="쓰리팩토리 안경원 대구 본점의 기존 제작 화면"></div>
            <div class="film-proof-credit"><span>기존 제작 사례 · 쓰리팩토리 안경원</span><a href="service-hpblog.html" aria-label="홈페이지형 블로그 서비스 살펴보기">어떤 작업인가요 <span aria-hidden="true">↗</span></a></div>
          </figure>
          <div class="film-binding-line" aria-hidden="true"></div>
        </div>
      </div>
    </div>
  </section>`;
}

/** The main page registers GSAP plugins and owns route lifecycle. */
export function initBrandFilm({ gsap, ScrollTrigger } = {}) {
  const section = document.querySelector('[data-brand-film]');
  if (!section || !gsap || !ScrollTrigger) return () => {};
  const media = gsap.matchMedia();
  const diagnostics = { progress: 0, mode: 'static', active: true };
  section.brandFilmMotion = diagnostics;
  media.add('(min-width: 961px) and (min-height: 650px) and (prefers-reduced-motion: no-preference)', () => {
    diagnostics.mode = 'scroll';
    section.classList.add('film-motion-active');
    const photo = section.querySelector('.film-photo-window img');
    const proof = section.querySelector('.film-design-sheet');
    const copy = section.querySelector('.film-copy-sheet');
    const lines = section.querySelectorAll('.film-copy-lines > span');
    const binding = section.querySelector('.film-binding-line');
    const timeline = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: section.querySelector('.film-scroll-range'),
        start: 'top 72%',
        end: 'bottom 85%',
        scrub: 0.65,
        invalidateOnRefresh: true,
        onUpdate: self => { diagnostics.progress = +self.progress.toFixed(4); },
      },
    });
    // Material comes together along one registration grid, like a finished spread.
    // No floating rotations, elastic cards or separate entrance on every sentence.
    timeline.addLabel('materials', 0)
      .fromTo(photo, { scale: 1.12, xPercent: -2 }, { scale: 1, xPercent: 0, duration: 0.8 }, 0)
      .fromTo(proof, { xPercent: 13, yPercent: 6, clipPath: 'inset(0% 0% 14% 0%)' },
        { xPercent: 0, yPercent: 0, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7 }, 0.08)
      .fromTo(copy, { xPercent: -5, yPercent: 22 }, { xPercent: 0, yPercent: 0, duration: 0.65 }, 0.18)
      .fromTo(lines, { clipPath: 'inset(0% 100% 0% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', stagger: 0.065, duration: 0.35 }, 0.35)
      .fromTo(binding, { scaleX: 0 }, { scaleX: 1, duration: 0.35 }, 0.63)
      .addLabel('assembled', 1);
    return () => { section.classList.remove('film-motion-active'); diagnostics.mode = 'static'; };
  });
  return () => {
    media.revert();
    diagnostics.active = false;
    section.classList.remove('film-motion-active');
  };
}
