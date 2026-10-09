import { services } from './content.js';

const escape = (value = '') => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const heading = value => escape(value).replace(/&lt;br\s*\/?&gt;/gi, '<br>');

// These are authored typographic explanations of our work, never client work or results.
const compositions = {
  blog: { words: ['듣고', '고르고', '씁니다.'], note: '원장님의 설명에서, 고객이 읽는 한 편의 글로.', label: '안경원의 전문성을 읽는 시간', tone: 'ink', scope: ['사례', '기획', '편집', '운영'] },
  hpblog: { words: ['첫', '인상', '부터.'], note: '안경원의 소개와 콘텐츠가 만나는 첫 화면.', label: '읽기 전에 먼저 보이는 것', tone: 'sand', scope: ['문장', '동선', '화면', '연결'] },
  instagram: { words: ['한 장', '그다음', '이야기.'], note: '이미지와 짧은 글로 이어가는 안경원의 일상.', label: '작은 화면 안에 담는 이야기', tone: 'rose', scope: ['기획', '제작', '게시', '운영'] },
  place: { words: ['찾고', '살피고', '방문.'], note: '검색한 고객이 방문 전에 확인하는 정보.', label: '검색 다음에 필요한 안내', tone: 'olive', scope: ['정보', '사진', '소식', '응대'] },
  daangn: { words: ['우리', '동네', '안경원.'], note: '가까이 사는 고객에게 전하는 매장 소식.', label: '동네 안에서 시작하는 연결', tone: 'rust', scope: ['소개', '소식', '광고', '관리'] },
  cafe: { words: ['맥락', '안에서', '전하기.'], note: '커뮤니티의 주제와 규칙을 먼저 살핍니다.', label: '정보가 놓일 자리를 생각하는 일', tone: 'ink', scope: ['지역', '주제', '작성', '관리'] },
  website: { words: ['우리의', '이야기', '한곳에.'], note: '소개부터 문의까지, 안경원을 이해하는 공간.', label: '안경원의 정보를 담는 집', tone: 'sand', scope: ['기획', '디자인', '개발', '지원'] },
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

function serviceRow(item) {
  return `<a class="sv-directory-row" href="${escape(item.slug)}" data-sv-preview="${escape(item.key)}">
    <span class="sv-directory-name">${escape(item.name)}</span>
    <span class="sv-directory-short">${escape(item.short)}</span>
    <span class="sv-directory-arrow" aria-hidden="true">↗</span>
  </a>`;
}

export function renderServices() {
  return `<div class="sv-page sv-index">
    <section class="sv-container sv-index-intro" aria-labelledby="sv-index-title">
      <p class="sv-kicker">고또마케팅이 하는 일</p>
      <h1 id="sv-index-title" class="sv-display" data-split-title>필요한 만큼,<br><span>정확한 곳에.</span></h1>
      <div class="sv-index-intro-bottom"><p>안경원마다 전할 이야기도,<br>먼저 살펴야 할 채널도 다릅니다.</p><p>블로그의 한 문장부터 홈페이지의 전체 흐름까지.<br>안경원의 상황에 맞춰 필요한 일을 정리합니다.</p><a class="sv-text-link" href="#service-directory">서비스 살펴보기 <span aria-hidden="true">↓</span></a></div>
    </section>
    <section class="sv-directory sv-container" id="service-directory" aria-labelledby="sv-directory-title">
      <div class="sv-directory-art"><div class="sv-art-sticky"><p id="sv-directory-title" class="sv-art-caption">전할 내용에 맞는 방법을 고릅니다.</p><div class="sv-object-stack">${services.map((service, index) => typeObject(service.key, { index: true, active: index === 0 })).join('')}</div><p class="sv-directory-footnote">안경원 전문 광고·콘텐츠 마케팅</p></div></div>
      <div class="sv-directory-links">${services.map(serviceRow).join('')}<div class="sv-directory-advice"><p>어디서부터 시작할지 고민이라면.</p><a class="sv-text-link" href="contact.html">현재 상황부터 이야기하기 <span aria-hidden="true">↗</span></a></div></div>
    </section>
    <section class="sv-working"><div class="sv-container sv-working-inner"><div><p class="sv-kicker">채널보다 먼저 살피는 것</p><h2 class="sv-section-title">전할 내용이<br>먼저입니다.</h2></div><div class="sv-working-copy"><p class="sv-working-lead">안경원의 일을 이해한 뒤,<br>그 이야기가 놓일 자리를 고릅니다.</p><p>어떤 상담을 하는지, 어떤 제품을 다루는지, 고객이 방문 전에 무엇을 궁금해하는지. 실제로 확인할 수 있는 자료에서 콘텐츠의 출발점을 찾습니다.</p><p>채널을 늘리는 일보다 지금 필요한 설명을 제대로 갖추는 일부터 함께합니다.</p><a class="sv-text-link" href="about.html">고또마케팅 알아보기 <span aria-hidden="true">↗</span></a></div></div></section>
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
      <div class="sv-detail-masthead"><div class="sv-detail-heading"><p class="sv-kicker">${escape(service.name)}</p><h1 id="sv-detail-title" class="sv-display" data-split-title>${heading(service.heading)}</h1><p class="sv-detail-description">${escape(service.description)}</p><a class="sv-text-link" href="contact.html?service=${escape(key)}">${escape(service.name)} 상담하기 <span aria-hidden="true">↗</span></a></div><figure class="sv-detail-art">${typeObject(key)}<figcaption>${escape(composition.label)}</figcaption></figure></div>
      <a href="#service-scope" class="sv-reading-link"><span>업무 내용 읽기</span><span aria-hidden="true">↓</span></a>
    </section>
    <section id="service-scope" class="sv-scope sv-container" aria-labelledby="sv-scope-title">
      <div class="sv-scope-intro"><div class="sv-scope-sticky"><p class="sv-kicker">함께 살펴볼 업무</p><h2 class="sv-section-title" id="sv-scope-title">어떤 일을<br>하나요.</h2><div class="sv-scope-words" aria-hidden="true">${service.scope.map((scope, index) => `<span class="sv-scope-word${index === 0 ? ' is-current' : ''}" data-sv-word="${index}">${escape(composition.scope[index] || scope.title)}</span>`).join('')}</div><p class="sv-scope-caption">진행할 범위와 일정은<br>안경원의 상황에 맞춰 협의합니다.</p></div></div>
      <div class="sv-scope-content">${service.scope.map((scope, index) => `<section class="sv-scope-item" data-sv-scope="${index}" aria-labelledby="sv-scope-${index}"><span class="sv-scope-dash" aria-hidden="true"></span><h3 id="sv-scope-${index}">${escape(scope.title)}</h3><p>${escape(scope.body)}</p></section>`).join('')}</div>
    </section>
    <section class="sv-process" aria-labelledby="sv-process-title"><div class="sv-container"><div class="sv-process-heading"><p class="sv-kicker">${['place', 'cafe'].includes(key) ? '함께 진행하는 일' : '진행 과정'}</p><h2 id="sv-process-title" class="sv-section-title">이렇게<br>함께 만듭니다.</h2><p>필요한 자료를 확인하고,<br>검토할 내용을 함께 공유합니다.</p></div><ol class="sv-process-list">${service.process.map((step, index) => `<li class="sv-process-step"><span class="sv-step-count" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span><div><h3>${escape(step.title)}</h3><p>${escape(step.body)}</p></div></li>`).join('')}</ol></div></section>
    <section class="sv-faq sv-container" aria-labelledby="sv-faq-title"><div><p class="sv-kicker">자주 묻는 내용</p><h2 id="sv-faq-title" class="sv-section-title">시작하기<br>전에.</h2></div><div class="sv-faq-list">${service.faq.map(faq => `<details class="sv-faq-item"><summary><span>${escape(faq.q)}</span><span class="sv-faq-symbol" aria-hidden="true"></span></summary><div class="sv-faq-answer"><p>${escape(faq.a)}</p></div></details>`).join('')}</div></section>
    <section class="sv-related sv-container" aria-labelledby="sv-related-title"><div class="sv-related-heading"><h2 id="sv-related-title">함께 살펴볼 서비스</h2><a class="sv-text-link" href="services.html">전체 서비스 <span aria-hidden="true">↗</span></a></div>${related.map(serviceRow).join('')}</section>
    <div class="sv-inline-service-cta sv-container"><p>${escape(service.name)}에 관해 더 궁금한 내용이 있나요?</p><a class="sv-text-link" href="contact.html?service=${escape(key)}">이 서비스 문의하기 <span aria-hidden="true">↗</span></a></div>
  </article>`;
}

/** Client-only choreography. GSAP and ScrollTrigger are supplied by the shared entry. */
export function initServices({ gsap, ScrollTrigger } = {}) {
  const page = document.querySelector('.sv-page');
  if (!page) return () => {};
  const cleanups = [];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const previewLinks = page.querySelectorAll('[data-sv-preview]');
  const stack = page.querySelector('.sv-object-stack');
  let selected = 'blog';
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
      gsap.fromTo(nextObject.querySelectorAll('.sv-type-leaf span'), { yPercent: 32, rotation: -2 }, { yPercent: 0, rotation: 0, duration: .64, stagger: .055, ease: 'power3.out', overwrite: true });
    }
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
