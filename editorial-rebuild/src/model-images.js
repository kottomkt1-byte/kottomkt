import { arrow } from './shell.js';
import { renderModelGallery } from './model-gallery.js';
import { modelPortfolio } from './model-portfolio-data.js';

const inquiry = 'contact.html?service=model-images';
const points = [
  { title: '프레임의 형태', label: '형태와 비율', body: '렌즈를 감싸는 곡선, 프레임의 두께, 얼굴 위에 놓이는 비율. 제품의 인상을 만드는 형태를 살핍니다.' },
  { title: '브리지와 템플', label: '구조와 연결', body: '두 렌즈를 잇는 브리지부터 옆면으로 이어지는 템플까지. 안경의 구조가 자연스럽게 이어지는지 확인합니다.' },
  { title: '색상과 소재', label: '색과 질감', body: '프레임의 색감, 금속의 반사, 아세테이트의 결. 실제 제품 사진과 비교하며 재질의 표현을 살핍니다.' },
];

function eyewearDrawing() {
  return `<svg class="mi-eyewear" viewBox="0 0 800 460" fill="none" role="img" aria-labelledby="mi-drawing-title mi-drawing-desc">
    <title id="mi-drawing-title">안경사의 검수 포인트를 설명하는 안경 구조 도해</title>
    <desc id="mi-drawing-desc">프레임의 형태, 브리지와 템플의 연결, 색상과 소재를 순서대로 살핍니다. 특정 제품의 설계 도면은 아닙니다.</desc>
    <defs><linearGradient id="mi-metal" x1="140" y1="170" x2="610" y2="350" gradientUnits="userSpaceOnUse"><stop stop-color="#dfc9a2"/><stop offset=".38" stop-color="#8d806b"/><stop offset=".7" stop-color="#efdfbb"/><stop offset="1" stop-color="#a99778"/></linearGradient><linearGradient id="mi-lens" x1="250" y1="170" x2="310" y2="340" gradientUnits="userSpaceOnUse"><stop stop-color="#fff" stop-opacity=".09"/><stop offset="1" stop-color="#fff" stop-opacity=".01"/></linearGradient></defs>
    <g class="mi-drawing-guides" stroke="#e6ded0" stroke-opacity=".16" stroke-width="1"><path d="M60 230H740M400 60V410" stroke-dasharray="4 7"/><path d="M130 120V360M670 120V360M130 130H670M130 360H670"/><path d="M124 130h12m-6-6v12M664 130h12m-6-6v12M124 360h12m-6-6v12M664 360h12m-6-6v12" stroke-opacity=".6"/></g>
    <g class="mi-part mi-part-1" stroke="url(#mi-metal)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><path d="m150 207 55-91q7-12 25-14l114-9q22-2 28 15"/><path d="m650 207-55-91q-7-12-25-14l-114-9q-22-2-28 15"/><path d="M355 211c20-25 70-25 90 0"/><path d="M355 226c20-18 70-18 90 0"/><path d="m150 209-15-3v24l17 2m496-23 17-3v24l-17 2"/></g>
    <g class="mi-part mi-part-0" stroke="url(#mi-metal)" stroke-width="8"><path d="M158 194c26-21 162-25 185 5 26 35 7 106-19 125-27 20-109 23-139-4-25-23-47-96-27-126Z" fill="url(#mi-lens)"/><path d="M642 194c-26-21-162-25-185 5-26 35-7 106 19 125 27 20 109 23 139-4 25-23 47-96 27-126Z" fill="url(#mi-lens)"/></g>
    <g class="mi-part mi-part-2" stroke="#f0e1c2" stroke-width="2" opacity=".6"><path d="M176 205c25-16 80-17 108-14M471 204c28-16 75-17 108-14"/><path d="m222 230 34-18m-22 40 45-24m241 2 34-18m-22 40 45-24" stroke-opacity=".35"/></g>
    <g class="mi-focus-point mi-focus-point-0" transform="translate(162 268)"><circle r="22"/><circle r="4" fill="currentColor" stroke="none"/><path d="M-28 0h-65v95h45"/><text x="-83" y="113">01</text></g>
    <g class="mi-focus-point mi-focus-point-1" transform="translate(401 211)"><circle r="22"/><circle r="4" fill="currentColor" stroke="none"/><path d="M0-28v-68h55"/><text x="65" y="-90">02</text></g>
    <g class="mi-focus-point mi-focus-point-2" transform="translate(604 201)"><circle r="22"/><circle r="4" fill="currentColor" stroke="none"/><path d="M28 0h72v-67h-33"/><text x="33" y="-81">03</text></g>
  </svg>`;
}

export function renderModelImages() {
  return `<article class="mi-page">
    <section class="mi-hero wrap" aria-labelledby="mi-title">
      <div class="mi-hero-top"><a href="services.html">하는 일 <span aria-hidden="true">/</span> 이미지 제작</a><span class="mi-new"><i aria-hidden="true"></i> 새롭게 선보이는 서비스</span></div>
      <div class="mi-hero-layout">
        <div class="mi-hero-copy">
          <p class="mi-service-name">안경테·선글라스 모델 이미지 제작</p>
          <h1 id="mi-title"><span>좋은 안경은,</span><span>디테일로</span><span class="mi-title-last">기억됩니다<span class="mi-period">.</span></span></h1>
          <p class="mi-hero-description">자체 개발 프로그램으로 정교하게 제작하고,<br class="mi-desktop-break"> 안경사가 직접 살피는 아이웨어 모델 이미지.</p>
          <a class="mi-button" href="${inquiry}"><span>모델 이미지 제작 문의</span>${arrow}</a>
          <a class="mi-quiet-link" href="#model-portfolio">포트폴리오 살펴보기 <span aria-hidden="true">↓</span></a>
          <div class="mi-hero-signature"><span class="mi-signature-line"></span><p>만드는 기술에,<br><strong>안경을 아는 시선을 더합니다.</strong></p></div>
        </div>
        <figure class="mi-hero-visual">
          <div class="mi-hero-image"><img src="portfolio/model-images/thumbnails/tf1289-01a-women-01.webp" width="1122" height="1402" fetchpriority="high" alt="주황빛 벽 앞에서 흰 의상과 TF1289 01A 선글라스를 착용한 여성 모델 포트폴리오"><span class="mi-image-edition" aria-hidden="true">KOTTO<br>IMAGE STUDIO</span><span class="mi-image-mark" aria-hidden="true">+</span><span class="mi-image-side" aria-hidden="true">EYEWEAR, IN A DIFFERENT LIGHT.</span></div>
          <figcaption><span>01 — SUNGLASSES</span><span>고또마케팅 제작 포트폴리오</span></figcaption>
        </figure>
      </div>
      <div class="mi-editorial-line" aria-hidden="true"><span>Frame</span><em>in focus.</em><span class="mi-editorial-asterisk">✳</span></div>
    </section>

    <section class="mi-approach wrap" id="mi-approach" aria-labelledby="mi-approach-title">
      <div class="mi-section-index"><span>01 / OUR APPROACH</span><span>안경을 이해하는 제작</span></div>
      <div class="mi-approach-layout"><h2 id="mi-approach-title" data-mi-reveal>분위기를 만들고.<br>제품을 살피고.<br><em>한 장을 완성합니다.</em></h2><div class="mi-approach-copy" data-mi-reveal><p class="mi-large-copy">화보의 중심에는<br>언제나 안경이 있어야 하니까.</p><p>눈길을 끄는 모델과 빛, 그 안에서 또렷하게 드러나는 제품의 개성. 고또마케팅은 안경테와 선글라스를 위한 모델 이미지를 제작합니다.</p><p>자체 개발 프로그램을 활용한 디테일한 제작에 안경사의 직접 검수를 더합니다. 이미지의 분위기와 제품 표현을 함께 살피는 것이 우리의 방식입니다.</p><div class="mi-method-note"><span>자체 개발 프로그램</span><span aria-hidden="true">×</span><span>안경사 직접 검수</span></div></div></div>
    </section>

    <section class="mi-inspection" aria-labelledby="mi-inspection-title">
      <div class="mi-inspection-inner wrap">
        <div class="mi-section-index"><span>02 / THE DETAILS</span><span>안경사가 살피는 디테일</span></div>
        <div class="mi-inspection-layout"><div class="mi-inspection-copy"><h2 id="mi-inspection-title" data-mi-reveal>안경을 아는 눈은,<br><em>다르게 봅니다.</em></h2><p>프레임의 곡선부터 브리지의 연결까지.<br>실제 제품과 비교하며 작은 차이를 살핍니다.</p><div class="mi-check-controls" aria-label="안경 검수 포인트">${points.map((p,i)=>`<button type="button" data-mi-point="${i}" aria-pressed="${i===0}" aria-controls="mi-check-description"><span>0${i+1}</span><strong>${p.title}</strong><span class="mi-point-arrow" aria-hidden="true">↗</span></button>`).join('')}</div></div>
        <div class="mi-inspection-display" data-mi-active="0"><div class="mi-drawing-label"><span>DETAIL STUDY</span><span>프레임 구조 도해</span></div><div class="mi-drawing-stage">${eyewearDrawing()}</div><div class="mi-check-description" id="mi-check-description" aria-live="polite" aria-atomic="true"><span data-mi-check-label>${points[0].label}</span><p data-mi-check-copy>${points[0].body}</p></div><noscript><div class="mi-noscript-details">${points.slice(1).map(p=>`<p><strong>${p.label}</strong> ${p.body}</p>`).join('')}</div></noscript><p class="mi-drawing-caption">검수 항목을 설명하는 도해이며, 특정 제품의 실측 도면이 아닙니다.</p></div></div>
      </div>
    </section>

    <section class="mi-editorials wrap" aria-labelledby="mi-editorials-title">
      <div class="mi-section-index"><span>03 / VISUAL DIRECTION</span><span>제품마다, 어울리는 장면</span></div>
      <div class="mi-editorials-heading"><h2 id="mi-editorials-title" data-mi-reveal>안경의 개성에서<br><em>화보의 분위기로.</em></h2><p>선글라스의 선명한 존재감부터<br>안경테의 섬세한 인상까지.<br>제품을 중심으로 장면을 구성합니다.</p></div>
      <div class="mi-editorial-grid"><figure class="mi-editorial mi-editorial-sun"><div class="mi-editorial-photo"><img src="portfolio/model-images/thumbnails/tf1381-01a-men-03.webp" width="1122" height="1402" loading="lazy" alt="버건디 재킷과 블랙 TF1381 01A 선글라스를 착용한 남성 모델 포트폴리오"><span class="mi-photo-type" aria-hidden="true">Sun.</span></div><figcaption><div><h3>선명한 존재감.</h3><span>SUNGLASSES</span></div><p>프레임의 볼륨과 렌즈의 색감이<br>장면의 분위기를 이끌도록.</p></figcaption></figure><figure class="mi-editorial mi-editorial-optical"><div class="mi-editorial-photo"><img src="portfolio/model-images/thumbnails/tf5922-020-women-03.webp" width="1122" height="1402" loading="lazy" alt="민트색 의상과 투명한 회색 TF5922 020 안경테를 착용한 여성 모델 포트폴리오"><span class="mi-photo-type" aria-hidden="true">Optical.</span></div><figcaption><div><h3>섬세한 인상.</h3><span>OPTICAL FRAMES</span></div><p>프레임의 선과 소재의 질감이<br>자연스럽게 드러나도록.</p></figcaption></figure></div>
    </section>

    ${renderModelGallery(modelPortfolio)}

    <section class="mi-process wrap" aria-labelledby="mi-process-title"><div class="mi-section-index"><span>04 / HOW WE WORK</span><span>제작부터 검수까지</span></div><div class="mi-process-layout"><div class="mi-process-intro"><h2 id="mi-process-title" data-mi-reveal>한 장이 나오기까지,<br><em>꼼꼼하게.</em></h2><p>제품 자료와 필요한 이미지부터 이야기합니다.<br>제작 범위와 일정은 상담에서 함께 정합니다.</p><a href="${inquiry}" class="text-link">우리 제품으로 상담하기 ${arrow}</a></div><ol class="mi-process-list"><li data-mi-reveal><span class="mi-process-no">01</span><div><h3>제품을 먼저 이해합니다.</h3><p>안경테·선글라스의 사진과 특징, 이미지를 사용할 곳을 확인합니다. 보여주고 싶은 디테일을 함께 정리합니다.</p></div></li><li data-mi-reveal><span class="mi-process-no">02</span><div><h3>제품에 맞는 장면을 만듭니다.</h3><p>자체 개발 프로그램을 활용해 모델 이미지를 제작합니다. 제품의 성격에 맞춰 스타일과 배경, 빛의 방향을 구성합니다.</p></div></li><li data-mi-reveal><span class="mi-process-no">03</span><div><h3>안경사의 시선으로 살핍니다.</h3><p>안경사가 검수에 직접 참여합니다. 제품 사진과 결과물을 비교하며 형태와 연결부, 색상·소재의 표현을 확인합니다.</p></div></li></ol></div></section>

    <section class="mi-faq wrap" aria-labelledby="mi-faq-title"><div><span class="mi-small-label">BEFORE WE BEGIN</span><h2 id="mi-faq-title">궁금하실 이야기.</h2></div><div class="mi-faq-list"><details><summary>어떤 제품을 맡길 수 있나요?<span aria-hidden="true">+</span></summary><p>안경테와 선글라스의 모델 이미지를 제작합니다. 제품 사진과 브랜드, 모델명을 알려주시면 제품의 특징과 필요한 작업 범위를 확인할 수 있습니다.</p></details><details><summary>상담할 때 어떤 자료가 필요한가요?<span aria-hidden="true">+</span></summary><p>제품의 정면·측면과 디테일을 확인할 수 있는 사진이 있으면 좋습니다. 이미지를 사용할 채널, 필요한 컷 수, 희망 일정을 함께 알려주세요. 준비된 자료를 바탕으로 제작 조건을 안내합니다.</p></details><details><summary>안경사가 어떤 부분을 확인하나요?<span aria-hidden="true">+</span></summary><p>프레임의 형태와 비율, 브리지와 템플의 연결, 색상과 소재 등 실제 제품의 특징을 살핍니다. 제공된 제품 사진과 제작 이미지를 비교하며 검수합니다.</p></details><details><summary>제작 비용과 기간은 어떻게 되나요?<span aria-hidden="true">+</span></summary><p>제품 종류, 이미지 수량과 활용 범위, 필요한 작업에 따라 상담 후 안내합니다. 수정 범위와 납품 형식도 제작 전에 함께 확인합니다.</p></details></div></section>

    <section class="mi-closing" aria-labelledby="mi-closing-title"><div class="wrap mi-closing-inner"><p>안경을 아는 사람들과 만드는 이미지</p><h2 id="mi-closing-title" data-mi-reveal>다음 화보의 주인공은,<br><em>매장의 안경입니다.</em></h2><a class="mi-button" href="${inquiry}"><span>모델 이미지 제작 상담하기</span>${arrow}</a><a class="mi-closing-back" href="services.html">다른 서비스도 살펴보기 <span aria-hidden="true">↗</span></a><span class="mi-closing-word" aria-hidden="true">kotto.</span></div></section>
  </article>`;
}

export function initModelImages({ gsap, ScrollTrigger }) {
  const root = document.querySelector('.mi-page');
  if (!root) return;
  const buttons = [...root.querySelectorAll('[data-mi-point]')];
  const display = root.querySelector('.mi-inspection-display');
  const label = root.querySelector('[data-mi-check-label]');
  const copy = root.querySelector('[data-mi-check-copy]');
  let detailTween;
  function selectPoint(index) {
    if (display.dataset.miActive === String(index)) return;
    display.dataset.miActive = String(index);
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    label.textContent = points[index].label;
    copy.textContent = points[index].body;
    detailTween?.kill();
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      detailTween = gsap.fromTo(root.querySelector('.mi-check-description'), { y: 7, opacity: .4 }, { y: 0, opacity: 1, duration: .35, clearProps: 'transform,opacity' });
    }
  }
  const handlers = buttons.map((button, i) => {
    const handler = () => selectPoint(i);
    button.addEventListener('click', handler);
    return () => button.removeEventListener('click', handler);
  });
  const mm = gsap.matchMedia();
  let disposed = false;
  document.fonts.ready.then(() => {
    if (disposed) return;
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        gsap.timeline({ defaults: { ease: 'power3.out' } })
          .from('.mi-hero-image', { clipPath: 'inset(0 0 100% 0)', duration: 1.15 }, 0)
          .from('.mi-hero-image img', { scale: 1.07, duration: 1.4 }, 0)
          .from('.mi-hero-copy h1 > span', { yPercent: 35, opacity: 0, duration: .85, stagger: .1, clearProps: 'transform,opacity' }, .15)
          .from('.mi-hero-description, .mi-hero-copy > a', { y: 12, opacity: 0, duration: .65, stagger: .08, clearProps: 'transform,opacity' }, .5);
        root.querySelectorAll('[data-mi-reveal]').forEach(element => {
          gsap.from(element, { y: 28, opacity: 0, duration: .8, ease: 'power2.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: element, start: 'top 92%', once: true } });
        });
        gsap.fromTo('.mi-editorial-line em', { xPercent: 4 }, { xPercent: -3, ease: 'none', scrollTrigger: { trigger: '.mi-editorial-line', start: 'top bottom', end: 'bottom top', scrub: .7 } });
        gsap.fromTo('.mi-eyewear', { y: 18, rotate: -3 }, { y: -12, rotate: 2, ease: 'none', scrollTrigger: { trigger: '.mi-inspection', start: 'top bottom', end: 'bottom top', scrub: .8 } });
      }, root);
      return () => context.revert();
    });
    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        gsap.fromTo('.mi-editorial-optical', { y: 80 }, { y: -35, ease: 'none', scrollTrigger: { trigger: '.mi-editorial-grid', start: 'top bottom', end: 'bottom top', scrub: .8 } });
        gsap.fromTo('.mi-hero-image img', { yPercent: 0 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: '.mi-hero-visual', start: 'top top', end: 'bottom top', scrub: .5 } });
      }, root);
      return () => context.revert();
    });
    ScrollTrigger.refresh();
  });
  return () => { disposed = true; detailTween?.kill(); handlers.forEach(fn => fn()); mm.revert(); };
}
