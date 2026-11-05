import { arrow } from './shell.js';
import { renderModelGallery } from './model-gallery.js';
import { modelPortfolio } from './model-portfolio-data.js';

const inquiry = 'contact.html?service=model-images';
const points = [
  { title: '프레임의 형태', label: '형태와 비율', body: '렌즈를 감싸는 곡선, 프레임의 두께, 얼굴 위에 놓이는 비율. 제품의 인상을 만드는 형태를 살핍니다.' },
  { title: '브리지와 템플', label: '구조와 연결', body: '두 렌즈를 잇는 브리지부터 옆면으로 이어지는 템플까지. 안경의 구조가 자연스럽게 이어지는지 확인합니다.' },
  { title: '색상과 소재', label: '색과 질감', body: '프레임의 색감, 금속의 반사, 렌즈의 투명도. 실제 제품 사진과 비교하며 재질의 표현을 살핍니다.' },
];

function eyewearStudio() {
  return `<div class="mi-product-viewer" data-eyewear-viewer data-mode="studio">
    <div class="mi-product-heading"><span>FRAME, IN DETAIL.</span><button type="button" data-eyewear-enter aria-pressed="false" aria-controls="mi-product-stage" hidden>직접 돌려보기 <span aria-hidden="true">↗</span></button></div>
    <div class="mi-product-stage" id="mi-product-stage" data-eyewear-stage data-state="idle" data-view="0">
      <img class="mi-product-poster" src="art/zin-01-studio.webp?v=e3fe2aa194682" width="1200" height="1000" loading="lazy" alt="젠틀몬스터 진 ZIN 01의 블랙 스퀘어 앞판과 실버 템플, 투명 렌즈를 재현한 스튜디오 렌더">
      <span class="mi-product-view-label" aria-hidden="true"><span data-eyewear-view-label>ZIN 01 / BLACK</span><i></i></span>
    </div>
    <div class="mi-product-tools" data-eyewear-tools hidden>
      <p id="mi-product-instruction">드래그 또는 방향키로 돌려보세요.</p>
      <div class="mi-product-toolbar"><span class="mi-product-model-name">ZIN 01 <span>BLACK / SILVER</span></span><div class="mi-product-playback"><button type="button" data-eyewear-play aria-pressed="true" aria-label="안경 자동 모션 멈추기"><i aria-hidden="true"></i><span>모션 멈춤</span></button><button type="button" data-eyewear-reset aria-label="현재 디테일의 처음 각도로 돌아가기"><b aria-hidden="true">↺</b><span>처음 각도</span></button></div></div>
    </div>
  </div>`;
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

    <section class="mi-inspection" id="frame-details" aria-labelledby="mi-inspection-title">
      <div class="mi-inspection-inner wrap">
        <div class="mi-section-index"><span>02 / THE DETAILS</span><span>안경사가 살피는 디테일</span></div>
        <div class="mi-inspection-layout"><div class="mi-inspection-copy"><h2 id="mi-inspection-title" data-mi-reveal>안경을 아는 눈은,<br><em>다르게 봅니다.</em></h2><p>프레임의 곡선부터 브리지의 연결까지.<br>실제 제품과 비교하며 작은 차이를 살핍니다.</p><div class="mi-check-controls" aria-label="안경 검수 포인트">${points.map((p,i)=>`<button type="button" data-mi-point="${i}" aria-pressed="${i===0}" aria-controls="mi-check-description"><span>0${i+1}</span><strong>${p.title}</strong><span class="mi-point-arrow" aria-hidden="true">↗</span></button>`).join('')}</div></div>
        <div class="mi-inspection-display" data-mi-active="0">${eyewearStudio()}<div class="mi-check-description" id="mi-check-description" aria-live="polite" aria-atomic="true"><span data-mi-check-label>${points[0].label}</span><p data-mi-check-copy>${points[0].body}</p></div><noscript><div class="mi-noscript-details">${points.slice(1).map(p=>`<p><strong>${p.label}</strong> ${p.body}</p>`).join('')}</div></noscript><p class="mi-drawing-caption">젠틀몬스터 진 ZIN 01<br><span class="mi-model-credit"><a href="https://www.gentlemonster.com/int/ko/item/ZYYE799SURVC/zin01" target="_blank" rel="noopener noreferrer">공식 제품 사진과 공개 치수</a>를 바탕으로 재현한 3D 모델입니다.</span></p></div></div>
      </div>
    </section>

    <section class="mi-editorials wrap" aria-labelledby="mi-editorials-title">
      <div class="mi-section-index"><span>03 / VISUAL DIRECTION</span><span>제품마다, 어울리는 장면</span></div>
      <div class="mi-editorials-heading"><h2 id="mi-editorials-title" data-mi-reveal>안경의 개성에서<br><em>화보의 분위기로.</em></h2><p>선글라스의 선명한 존재감부터<br>안경테의 섬세한 인상까지.<br>제품을 중심으로 장면을 구성합니다.</p></div>
      <div class="mi-editorial-grid"><figure class="mi-editorial mi-editorial-sun"><div class="mi-editorial-photo"><img src="portfolio/model-images/thumbnails/tf1381-01a-men-03.webp" width="1122" height="1402" loading="lazy" alt="버건디 재킷과 블랙 TF1381 01A 선글라스를 착용한 남성 모델 포트폴리오"><span class="mi-photo-type" aria-hidden="true">Sun.</span></div><figcaption><div><h3>선명한 존재감.</h3><span>SUNGLASSES</span></div><p>프레임의 볼륨과 렌즈의 색감이<br>장면의 분위기를 이끌도록.</p></figcaption></figure><figure class="mi-editorial mi-editorial-optical"><div class="mi-editorial-photo"><img src="portfolio/model-images/thumbnails/tf5922-020-women-03.webp" width="1122" height="1402" loading="lazy" alt="민트색 의상과 투명한 회색 TF5922 020 안경테를 착용한 여성 모델 포트폴리오"><span class="mi-photo-type" aria-hidden="true">Optical.</span></div><figcaption><div><h3>섬세한 인상.</h3><span>OPTICAL FRAMES</span></div><p>프레임의 선과 소재의 질감이<br>자연스럽게 드러나도록.</p></figcaption></figure></div>
    </section>

    ${renderModelGallery(modelPortfolio)}

    <section class="mi-feedback wrap" id="client-feedback" aria-labelledby="mi-feedback-title">
      <div class="mi-section-index"><span>CLIENT FEEDBACK</span><span>이미지를 전달한 뒤</span></div>
      <div class="mi-feedback-layout">
        <h2 id="mi-feedback-title" data-mi-reveal>이미지를 전한 뒤,<br><em>돌아온 답장.</em></h2>
        <figure class="mi-feedback-capture" data-mi-reveal>
          <a class="mi-feedback-original" href="portfolio/model-images/client-feedback-kakao.png" target="_blank" rel="noopener noreferrer" aria-label="카카오톡 대화 캡처 원본 크게 보기 (새 탭)">
            <img src="portfolio/model-images/client-feedback-kakao.png" width="842" height="425" loading="lazy" decoding="async" alt="안경 디테일 검수에 대한 설명과 제작 이미지 전달 후, 고객이 ‘감탄입니다’, ‘수정할데가 없이 완벽하세요!’라고 답한 실제 카카오톡 대화. 이름과 프로필은 가려져 있습니다.">
            <span class="mi-feedback-enlarge">대화 캡처 크게 보기 <span aria-hidden="true">↗</span></span>
          </a>
          <figcaption>모델 이미지 전달 후 받은 카카오톡 피드백</figcaption>
        </figure>
      </div>
    </section>

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
  let detailTween, viewer, disposed = false, loadingViewer = false;
  const viewerAbort = new AbortController();
  const viewerHost = root.querySelector('[data-eyewear-viewer]');
  const stage = root.querySelector('[data-eyewear-stage]');
  const viewLabel = root.querySelector('[data-eyewear-view-label]');
  const viewLabels = ['01 / FORM', '02 / CONSTRUCTION', '03 / MATERIAL'];
  const enter = root.querySelector('[data-eyewear-enter]');
  enter.hidden = false;
  function setMode(interactive) {
    viewerHost.dataset.mode = interactive ? 'interactive' : 'studio';
    enter.setAttribute('aria-pressed', String(interactive));
    enter.innerHTML = interactive ? '스튜디오 컷 보기 <span aria-hidden="true">↙</span>' : '직접 돌려보기 <span aria-hidden="true">↗</span>';
    viewLabel.textContent = interactive ? viewLabels[Number(display.dataset.miActive)] : 'ZIN 01 / BLACK';
    viewer?.setActive(interactive);
    if (interactive) loadViewer();
    ScrollTrigger.refresh();
  }
  function loadViewer() {
    if (loadingViewer || disposed || viewer) return;
    loadingViewer = true;
    stage.dataset.state = 'loading';
    import('./eyewear-viewer.js').then(async ({ createEyewearViewer }) => {
      if (disposed) return;
      const loadedViewer = await createEyewearViewer(viewerHost, { gsap, initialView: Number(display.dataset.miActive), signal: viewerAbort.signal });
      if (disposed) { loadedViewer.dispose(); return; }
      viewer = loadedViewer;
      viewer.selectView(Number(display.dataset.miActive), true);
      viewer.setActive(viewerHost.dataset.mode === 'interactive');
      ScrollTrigger.refresh();
    }).catch(showStudioFallback);
  }
  function showStudioFallback() {
    if (disposed) return;
    stage.dataset.state = 'fallback';
    setMode(false);
    enter.hidden = true;
  }
  const toggleMode = () => setMode(viewerHost.dataset.mode !== 'interactive');
  enter.addEventListener('click', toggleMode);
  viewerHost.addEventListener('eyewearunavailable', showStudioFallback);
  function selectPoint(index) {
    const changed = display.dataset.miActive !== String(index);
    display.dataset.miActive = String(index);
    if (stage.dataset.state !== 'fallback') setMode(true);
    if (!changed) return;
    viewer?.selectView(index);
    viewLabel.textContent = viewerHost.dataset.mode === 'interactive' ? viewLabels[index] : 'ZIN 01 / BLACK';
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
  return () => { disposed = true; viewerAbort.abort(); enter.removeEventListener('click', toggleMode); viewerHost.removeEventListener('eyewearunavailable', showStudioFallback); viewer?.dispose(); detailTween?.kill(); handlers.forEach(fn => fn()); mm.revert(); };
}
