import { renderPortfolio, renderVoices } from './evidence.js';
import { business, services, serviceAudiences } from './content.js';
import { evidencePortfolio, evidenceReviews } from './evidence-data.js';
import { renderIndexPreview, renderServiceScene, renderServiceFeature, initServiceMedia } from './service-media.js';

const escape = (value = '') => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const heading = value => escape(value).replace(/&lt;br\s*\/?&gt;/gi, '<br>');

// These are authored typographic explanations of our work, never client work or results.
const compositions = {
  blog: { words: ['듣고', '고르고', '씁니다.'], note: '제품과 전문성에 관한 설명을, 고객이 읽는 한 편의 글로.', label: '브랜드의 전문성을 읽는 시간', tone: 'ink', scope: ['제품', '기획', '편집', '운영'] },
  hpblog: { words: ['첫', '인상', '부터.'], note: '브랜드 소개와 콘텐츠가 만나는 첫 화면.', label: '읽기 전에 먼저 보이는 것', tone: 'sand', scope: ['문장', '동선', '화면', '연결'] },
  instagram: { words: ['한 장', '그다음', '이야기.'], note: '이미지와 짧은 글로 이어가는 브랜드의 이야기.', label: '작은 화면 안에 담는 이야기', tone: 'rose', scope: ['기획', '제작', '게시', '운영'] },
  place: { words: ['찾고', '살피고', '방문.'], note: '검색한 고객이 방문 전에 확인하는 정보.', label: '검색 다음에 필요한 안내', tone: 'olive', scope: ['정보', '사진', '소식', '응대'] },
  daangn: { words: ['우리', '동네', '안경원.'], note: '가까이 사는 고객에게 전하는 매장 소식.', label: '동네 안에서 시작하는 연결', tone: 'rust', scope: ['소개', '소식', '광고', '관리'] },
  cafe: { words: ['맥락', '안에서', '전하기.'], note: '커뮤니티의 주제와 규칙을 먼저 살핍니다.', label: '정보가 놓일 자리를 생각하는 일', tone: 'ink', scope: ['지역', '주제', '작성', '관리'] },
  website: { words: ['우리의', '이야기', '한곳에.'], note: '소개부터 문의까지, 브랜드와 기업을 이해하는 공간.', label: '브랜드의 정보를 담는 집', tone: 'sand', scope: ['기획', '디자인', '개발', '지원'] },
};

function typeObject(key, { id = '', active = true, index = false } = {}) {
  const item = services.find(service => service.key === key);
  const composition = compositions[key] || compositions.blog;
  return `<div ${id ? `id="${id}"` : ''} class="sv-type-object sv-object-${key} sv-tone-${composition.tone}${index ? ' sv-index-object' : ''}${active ? ' is-active' : ''}" ${index ? `data-sv-object="${key}"` : ''} aria-hidden="true">
    <div class="sv-object-heading"><span>${escape(item?.name || '')}</span><span>고또마케팅</span></div>
    <div class="sv-object-pages">${composition.words.map((word, position) => `<div class="sv-type-leaf sv-leaf-${position}"><span>${escape(word)}</span></div>`).join('')}</div>
    <p class="sv-object-note">${escape(composition.note)}</p>
    <span class="sv-object-rule"></span>
  </div>`;
}

function serviceRow(item, { directory = false } = {}) {
  const local = ['place', 'daangn'].includes(item.key);
  const audience = local ? '안경원 · 지역 채널' : item.key === 'model-images' ? '아이웨어 브랜드 · 제조·수입·유통사 · 안경원' : '안경 산업 브랜드·기업 · 안경원';
  return `<a class="sv-directory-row" href="${escape(item.slug)}" data-sv-preview="${escape(item.key)}"${directory ? ` data-sv-audiences="${escape(item.audienceKeys.join(' '))}"` : ''}>
    ${directory ? `<span class="sv-directory-number" aria-hidden="true">${String(services.indexOf(item) + 1).padStart(2, '0')}</span><span class="sv-directory-eyebrow">${audience}</span>` : ''}
    <span class="sv-directory-name">${escape(item.name)}</span>
    <span class="sv-directory-short">${escape(item.short)}</span>
    <span class="sv-directory-arrow" aria-hidden="true">↗</span>
  </a>`;
}

function serviceEvidenceArt(key) {
  const original = (item, index, kind, className) => `<a class="sv-proof-sheet ${className}" href="${escape(item.src)}" data-evidence-open="${kind}" data-evidence-index="${index}" aria-label="${escape(item.title)} 원본 크게 보기"><span class="sv-proof-image"><img src="${escape(item.src)}" width="${item.width}" height="${item.height}" alt="${escape(item.alt)}" decoding="async"></span><span class="sv-proof-label"><span>${escape(kind === 'portfolio' ? item.name : item.caption)}</span><span aria-hidden="true">원본 보기 ↗</span></span></a>`;
  if (key === 'hpblog') {
    return `<div class="sv-evidence-art sv-evidence-hpblog"><div class="sv-proof-masthead"><span>실제 제작 화면</span><span>홈페이지형 블로그</span></div><p class="sv-proof-heading">각자의 이야기에,<br>각자의 첫 화면.</p>${original(evidencePortfolio[0], 0, 'portfolio', 'sv-proof-first')}${original(evidencePortfolio[2], 2, 'portfolio', 'sv-proof-second')}<p class="sv-proof-footnote">유럽안경 · 쓰리팩토리 안경원 제작 사례</p></div>`;
  }
  const review = evidenceReviews[0];
  return `<div class="sv-evidence-art sv-evidence-blog"><div class="sv-proof-masthead"><span>고객이 보내주신 말</span><span>기존 공개 후기</span></div><blockquote class="sv-proof-quote"><p>${escape(review.quote)}</p><cite>고객 후기 01 · 원문에서 발췌</cite></blockquote>${original(review, 0, 'review', 'sv-proof-first')}${original(evidenceReviews[8], 8, 'review', 'sv-proof-second')}<p class="sv-proof-footnote">개별 고객의 경험이며, 같은 결과를 약속하지 않습니다.</p></div>`;
}

export function renderServices() {
  return `<div class="sv-page sv-index">
    <section class="sv-index-intro" aria-labelledby="sv-index-title"><div class="sv-container sv-index-masthead">
      <div class="sv-index-heading"><p class="sv-kicker">${escape(business.category)}</p><h1 id="sv-index-title" class="sv-display" data-split-title>무엇을<br>전하고 싶나요.</h1><p class="sv-index-lead">제품을 설명하는 글부터<br>브랜드를 소개하는 화면까지.</p><p class="sv-index-description">안경원부터 아이웨어 브랜드, 안경렌즈·콘택트렌즈 기업과 제조·수입·유통사까지. 전할 내용과 고객에 맞춰 필요한 채널을 함께 정합니다.</p><a class="sv-text-link" href="#service-audience">서비스 살펴보기 <span aria-hidden="true">↘</span></a></div>
      <figure class="sv-index-portrait"><img src="portfolio/model-images/thumbnails/tf1289-01a-women-03.webp" width="1122" height="1402" alt="고또마케팅이 제작한 TF1289 01A 선글라스 여성 모델 이미지" fetchpriority="high" decoding="async"><figcaption><span>모델 이미지 제작 포트폴리오</span><span>TF1289 01A</span></figcaption></figure>
    </div>
    </section>
    <section class="sv-audience sv-container" id="service-audience" aria-labelledby="sv-audience-title">
      <header><p class="sv-kicker">함께하는 분야</p><h2 id="sv-audience-title">우리에게 맞는 <br>서비스부터.</h2></header>
      <div class="sv-audience-selection"><div class="sv-audience-controls" role="group" aria-label="업종에 맞는 서비스 선택"><button type="button" data-sv-audience="all" aria-pressed="true" aria-controls="service-directory-list">전체</button>${serviceAudiences.map(audience => `<button type="button" data-sv-audience="${escape(audience.key)}" aria-pressed="false" aria-controls="service-directory-list">${escape(audience.name)}</button>`).join('')}</div><p class="sv-audience-context"><strong data-sv-audience-name>안경 산업을 위한 콘텐츠와 채널 운영</strong><span data-sv-audience-summary>브랜드와 제품을 알리는 일부터 지역 고객에게 매장을 소개하는 일까지, 필요한 업무를 살펴보세요.</span></p></div>
    </section>
    <section class="sv-directory sv-container" id="service-directory" aria-labelledby="sv-directory-title">
      <div class="sv-directory-art"><div class="sv-art-sticky"><h2 id="sv-directory-title" class="sv-art-caption">전할 내용에 맞는 방법을 고릅니다.</h2><div class="sv-object-stack">${services.map((service, index) => renderIndexPreview(service.key, index === 0)).join('')}</div><p class="sv-directory-footnote">${escape(business.category)}</p></div></div>
      <div class="sv-directory-links" id="service-directory-list"><p class="sv-directory-count" data-sv-count role="status" aria-live="polite" aria-atomic="true">전체 ${services.length}개 서비스</p>${services.map(item => serviceRow(item, { directory: true })).join('')}<div class="sv-directory-advice"><p>전하고 싶은 제품과 이야기를 알려주세요.</p><a class="sv-text-link" href="contact.html">필요한 업무 상담하기 <span aria-hidden="true">↗</span></a></div></div>
    </section>
    <section class="sv-working"><div class="sv-container sv-working-inner"><div><p class="sv-kicker">채널보다 먼저 살피는 것</p><h2 class="sv-section-title">전할 내용이<br>먼저입니다.</h2></div><div class="sv-working-copy"><p class="sv-working-lead">만드는 제품과 전하려는 가치를<br>먼저 듣습니다.</p><p>어떤 안경과 렌즈를 다루는지, 고객에게 어떤 설명이 필요한지 살펴봅니다. 제공해 주신 제품 자료와 실제 업무에서 콘텐츠의 주제를 찾습니다.</p><p>브랜드의 소개와 제품 정보가 필요한 채널에서 읽힐 수 있도록 글과 이미지를 함께 구성합니다.</p><a class="sv-text-link" href="about.html">고또마케팅 알아보기 <span aria-hidden="true">↗</span></a></div></div></section>
  </div>`;
}

export function renderService(key) {
  const service = services.find(item => item.key === key);
  if (!service) throw new Error(`Unknown service: ${key}`);
  const composition = compositions[key] || compositions.blog;
  const related = service.related.map(relatedKey => services.find(item => item.key === relatedKey)).filter(Boolean);
  return `<article class="sv-page sv-detail sv-detail-${key}">
    <section class="sv-container sv-detail-hero" aria-labelledby="sv-detail-title">
      <nav class="sv-breadcrumb" aria-label="현재 위치"><a href="services.html">하는 일</a><span aria-hidden="true">/</span><span>${escape(service.name)}</span></nav>
      <div class="sv-detail-masthead"><div class="sv-detail-heading"><p class="sv-kicker">${escape(service.name)}</p><h1 id="sv-detail-title" class="sv-display" data-split-title>${heading(service.heading)}</h1><p class="sv-detail-description">${escape(service.description)}</p><a class="sv-text-link" href="contact.html?service=${escape(key)}">${escape(service.name)} 상담하기 <span aria-hidden="true">↗</span></a></div><figure class="sv-detail-art">${key === 'hpblog' ? serviceEvidenceArt(key) : renderServiceScene(key)}<figcaption>${escape(key === 'hpblog' ? '기존 제작 화면입니다. 누르면 원본을 크게 볼 수 있습니다.' : ['place','daangn'].includes(key) ? '실제 지도나 고객 사례가 아닌, 업무 설명을 위한 구성입니다.' : key === 'website' ? '화면 크기를 바꿔 정보의 배치를 살펴보세요. 설계 원리 예시입니다.' : '서비스의 기획과 제작 방식을 표현한 브랜드 이미지입니다.')}</figcaption></figure></div>
      <a href="#service-scope" class="sv-reading-link"><span>업무 내용 읽기</span><span aria-hidden="true">↓</span></a>
    </section>
    ${key === 'hpblog' ? renderPortfolio({compact:true}) : ''}
    <section id="service-scope" class="sv-scope sv-container" aria-labelledby="sv-scope-title">
      <div class="sv-scope-intro"><div class="sv-scope-sticky"><p class="sv-kicker">함께 살펴볼 업무</p><h2 class="sv-section-title" id="sv-scope-title">어떤 일을<br>하나요.</h2><div class="sv-scope-words" aria-hidden="true">${service.scope.map((scope, index) => `<span class="sv-scope-word${index === 0 ? ' is-current' : ''}" data-sv-word="${index}">${escape(composition.scope[index] || scope.title)}</span>`).join('')}</div><p class="sv-scope-caption">진행할 범위와 일정은<br>${['place', 'daangn'].includes(key) ? '안경원의 운영 상황' : '브랜드의 자료와 운영 계획'}에 맞춰 협의합니다.</p></div></div>
      <div class="sv-scope-content">${service.scope.map((scope, index) => `<section class="sv-scope-item" data-sv-scope="${index}" aria-labelledby="sv-scope-${index}"><span class="sv-scope-dash" aria-hidden="true"></span><h3 id="sv-scope-${index}">${escape(scope.title)}</h3><p>${escape(scope.body)}</p></section>`).join('')}</div>
    </section>
    ${renderServiceFeature(key)}
    <section class="sv-process" aria-labelledby="sv-process-title"><div class="sv-container"><div class="sv-process-heading"><p class="sv-kicker">${['place', 'cafe'].includes(key) ? '함께 진행하는 일' : '진행 과정'}</p><h2 id="sv-process-title" class="sv-section-title">이렇게<br>함께 만듭니다.</h2><p>필요한 자료를 확인하고,<br>검토할 내용을 함께 공유합니다.</p></div><ol class="sv-process-list">${service.process.map((step, index) => `<li class="sv-process-step"><span class="sv-step-count" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span><div><h3>${escape(step.title)}</h3><p>${escape(step.body)}</p></div></li>`).join('')}</ol></div></section>
    <section class="sv-faq sv-container" aria-labelledby="sv-faq-title"><div><p class="sv-kicker">자주 묻는 내용</p><h2 id="sv-faq-title" class="sv-section-title">시작하기<br>전에.</h2></div><div class="sv-faq-list">${service.faq.map(faq => `<details class="sv-faq-item"><summary><span>${escape(faq.q)}</span><span class="sv-faq-symbol" aria-hidden="true"></span></summary><div class="sv-faq-answer"><p>${escape(faq.a)}</p></div></details>`).join('')}</div></section>
    ${key === 'blog' ? renderVoices({compact:true}) : ''}
    <section class="sv-related sv-container" aria-labelledby="sv-related-title"><div class="sv-related-heading"><h2 id="sv-related-title">함께 살펴볼 서비스</h2><a class="sv-text-link" href="services.html">전체 서비스 <span aria-hidden="true">↗</span></a></div>${related.map(item => serviceRow(item)).join('')}</section>
    <div class="sv-inline-service-cta sv-container"><p>${escape(service.name)}에 관해 더 궁금한 내용이 있나요?</p><a class="sv-text-link" href="contact.html?service=${escape(key)}">이 서비스 문의하기 <span aria-hidden="true">↗</span></a></div>
  </article>`;
}

/** Client-only choreography. GSAP and ScrollTrigger are supplied by the shared entry. */
export function initServices({ gsap, ScrollTrigger } = {}) {
  const page = document.querySelector('.sv-page');
  if (!page) return () => {};
  const cleanups = [];
  if (gsap && ScrollTrigger) cleanups.push(initServiceMedia({ gsap, ScrollTrigger }));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const previewLinks = page.querySelectorAll('[data-sv-preview]');
  const stack = page.querySelector('.sv-object-stack');
  let selected = services[0]?.key || 'blog';
  let previewAnimation;
  function preview(key) {
    if (!stack || key === selected) return;
    const oldObject = stack.querySelector(`[data-sv-object="${selected}"]`);
    const nextObject = stack.querySelector(`[data-sv-object="${key}"]`);
    if (!nextObject) return;
    previewAnimation?.kill();
    stack.querySelectorAll('.sv-type-object').forEach(object => object.classList.remove('is-active', 'is-leaving'));
    nextObject.classList.add('is-active');
    selected = key;
    if (gsap && !reduced.matches) {
      oldObject?.classList.add('is-leaving');
      gsap.set(nextObject, { zIndex: 2 });
      if (oldObject) gsap.set(oldObject, { zIndex: 1 });
      previewAnimation = gsap.fromTo(nextObject, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: .52, ease: 'power3.inOut', clearProps: 'clipPath,zIndex', onComplete: () => oldObject?.classList.remove('is-leaving') });
      const picture = nextObject.querySelector('img');
      if (picture) gsap.fromTo(picture, { scale: 1.05 }, { scale: 1, duration: .8, ease: 'power3.out', overwrite: true });
    }
  }
  const audienceButtons = [...page.querySelectorAll('[data-sv-audience]')];
  const directoryRows = [...page.querySelectorAll('[data-sv-audiences]')];
  function selectAudience(key, updateUrl = false) {
    const audience = serviceAudiences.find(item => item.key === key);
    const selection = audience ? key : 'all';
    page.dataset.svAudienceSelection = selection;
    audienceButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.svAudience === selection)));
    directoryRows.forEach(row => { row.hidden = selection !== 'all' && !row.dataset.svAudiences.split(' ').includes(selection); });
    const visibleRows = directoryRows.filter(row => !row.hidden);
    page.querySelector('[data-sv-audience-name]').textContent = audience?.name || '안경 산업을 위한 콘텐츠와 채널 운영';
    page.querySelector('[data-sv-audience-summary]').textContent = audience?.summary || '브랜드와 제품을 알리는 일부터 지역 고객에게 매장을 소개하는 일까지, 필요한 업무를 살펴보세요.';
    page.querySelector('[data-sv-count]').textContent = `${audience?.name || '전체'} · ${visibleRows.length}개 서비스`;
    if (!visibleRows.some(row => row.dataset.svPreview === selected) && visibleRows[0]) preview(visibleRows[0].dataset.svPreview);
    if (updateUrl && !window.__KOTTO_STANDALONE__) {
      const url = new URL(location.href);
      if (selection === 'all') url.searchParams.delete('audience');
      else url.searchParams.set('audience', selection);
      history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    }
    ScrollTrigger?.refresh();
  }
  audienceButtons.forEach(button => {
    const onSelect = () => selectAudience(button.dataset.svAudience, true);
    button.addEventListener('click', onSelect);
    cleanups.push(() => button.removeEventListener('click', onSelect));
  });
  if (audienceButtons.length) {
    const query = new URLSearchParams(window.__KOTTO_ROUTE_QUERY__ || location.search);
    selectAudience(query.get('audience') || 'all');
  }
  previewLinks.forEach(link => {
    const onEnter = () => preview(link.dataset.svPreview);
    link.addEventListener('pointerenter', onEnter);
    link.addEventListener('focus', onEnter);
    cleanups.push(() => { link.removeEventListener('pointerenter', onEnter); link.removeEventListener('focus', onEnter); });
  });

  if (gsap && ScrollTrigger) {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
      const art = page.querySelector('.sv-detail-art .sv-type-object');
      if (art) {
        // A printed fold opens as the reader moves from the masthead into the work.
        // Native scroll drives 0–1; returning upward closes it. All copy is separate.
        const leaves = art.querySelectorAll('.sv-type-leaf');
        gsap.timeline({ scrollTrigger: { trigger: '.sv-detail-masthead', start: 'top 15%', end: 'bottom 10%', scrub: .65, invalidateOnRefresh: true } })
          .to(leaves[0], { xPercent: -9, rotation: -4, transformOrigin: '0% 100%', duration: 1, ease: 'none' }, 0)
          .to(leaves[1], { xPercent: 7, rotation: 3, transformOrigin: '100% 0%', duration: 1, ease: 'none' }, 0)
          .to(leaves[2], { xPercent: -3, rotation: -2, duration: 1, ease: 'none' }, 0)
          .to(art.querySelector('.sv-object-rule'), { scaleX: .3, transformOrigin: '0 50%', duration: 1, ease: 'none' }, 0);
      }
      const evidenceArt = page.querySelector('.sv-evidence-art');
      if (evidenceArt) {
        gsap.timeline({ scrollTrigger: { trigger: evidenceArt, start: 'top 65%', end: 'bottom 20%', scrub: .6 } })
          .fromTo(evidenceArt.querySelector('.sv-proof-first'), { y: 16 }, { y: 0, duration: 1, ease: 'none' }, 0)
          .fromTo(evidenceArt.querySelector('.sv-proof-second'), { y: 32, x: 12 }, { y: 0, x: 0, duration: 1, ease: 'none' }, 0);
      }
      const scopeItems = page.querySelectorAll('[data-sv-scope]');
      const scopeWords = page.querySelectorAll('[data-sv-word]');
      let currentWord = 0;
      function selectWord(index) {
        if (index === currentWord) return;
        const previous = scopeWords[currentWord];
        const next = scopeWords[index];
        currentWord = index;
        previous?.classList.remove('is-current');
        next?.classList.add('is-current');
        if (next) gsap.fromTo(next, { yPercent: 65, rotateX: -32 }, { yPercent: 0, rotateX: 0, duration: .65, ease: 'power3.out', overwrite: true });
      }
      scopeItems.forEach((item, index) => ScrollTrigger.create({ trigger: item, start: 'top 58%', end: 'bottom 42%', onEnter: () => selectWord(index), onEnterBack: () => selectWord(index) }));
    });
    cleanups.push(() => mm.revert());
  }
  return () => { previewAnimation?.kill(); if (gsap && stack) gsap.killTweensOf(stack.querySelectorAll('.sv-type-object,.sv-type-leaf span')); cleanups.forEach(cleanup => cleanup()); };
}
