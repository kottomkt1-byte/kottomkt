import { evidencePortfolio, evidenceReviews } from './evidence-data.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const picture = (src, alt, cls = '') => {
  const original = evidencePortfolio.find(item => item.src === src);
  const [width, height] = original ? [original.width, original.height] : src.includes('optical-editorial') ? [1448, 1086] : [1536, 1024];
  return `<img class="${cls}" src="${src}" width="${width}" height="${height}" alt="${esc(alt)}" loading="lazy" decoding="async">`;
};
const material = {
  blog: ['art/content-atelier.webp', '안경 콘텐츠를 기획하고 편집하는 작업대'],
  hpblog: ['evidence/portfolio-03.png', '쓰리팩토리 안경원의 실제 홈페이지형 블로그 제작 화면'],
  instagram: ['art/social-studio.webp', '안경 콘텐츠의 사진 구성을 표현한 촬영 스틸라이프'],
  place: ['art/neighborhood-atlas.webp', '지역과 방문 안내를 표현한 가상의 동네 일러스트'],
  daangn: ['art/neighborhood-atlas.webp', '지역 소식을 표현한 가상의 동네 일러스트'],
  cafe: ['art/conversation-atelier.webp', '글과 소통을 표현한 편집 작업 일러스트'],
  website: ['art/editing-desk.webp', '웹사이트의 글과 화면을 기획하는 편집 작업대'],
};
const choices = {
  instagram: [
    ['피드', '한 장 안에, 하나의 이야기.', '사진과 설명이 같은 주제를 전하도록 구성합니다.'],
    ['스토리', '짧은 화면에, 필요한 소식.', '지금 전할 내용을 세로 화면에 맞춰 정리합니다.'],
    ['릴스', '장면을 잇고, 흐름을 만듭니다.', '영상의 순서와 자막을 함께 편집합니다.'],
  ],
  place: [
    ['기본 정보', '매장의 정보를 먼저.', '주소와 영업시간, 연락처를 확인합니다.'],
    ['사진', '방문 전에 살펴볼 모습.', '매장과 취급 품목을 이해할 사진을 정리합니다.'],
    ['방문 안내', '찾아오는 길까지.', '위치와 주차 등 방문에 필요한 내용을 안내합니다.'],
  ],
  daangn: [
    ['매장 소개', '우리 동네에 전할 이야기.', '안경원의 위치와 다루는 품목을 소개합니다.'],
    ['새 소식', '가까운 고객에게 필요한 소식.', '실제로 안내할 내용을 지역의 맥락에 맞춰 정리합니다.'],
    ['문의 응대', '관심 다음의 대화까지.', '지역 고객의 문의에 필요한 안내를 갖춥니다.'],
  ],
  cafe: [
    ['주제', '어떤 이야기가 필요한지.', '커뮤니티의 지역과 관심 주제를 살핍니다.'],
    ['규정', '그곳의 규칙을 먼저.', '게시 가능한 내용과 광고 표기 기준을 확인합니다.'],
    ['게시', '맥락에 맞춰 전합니다.', '실제 정보와 자료를 바탕으로 콘텐츠를 구성합니다.'],
  ],
};

function controls(key) {
  return `<div class="sm-controls" hidden aria-label="${key === 'instagram' ? '콘텐츠 형식' : '업무 내용'} 살펴보기">${choices[key].map((item, i) => `<button type="button" data-sm-select="${i}" aria-pressed="${i === 0}">${item[0]}</button>`).join('')}</div>`;
}
function caption(key) {
  const item = choices[key][0];
  return `<div class="sm-live-copy" aria-live="polite"><h3 data-sm-title>${item[1]}</h3><p data-sm-body>${item[2]}</p></div>`;
}

export function renderIndexPreview(key, active = false) {
  const [src, alt] = material[key];
  return `<div class="sv-type-object sv-image-object sv-image-${key}${active ? ' is-active' : ''}" data-sv-object="${key}" aria-hidden="true">${picture(src, alt)}<div class="sv-image-object-caption"><span>안경원의 이야기를 전하는 일</span><p>${({ blog: '읽을 수 있도록.', hpblog: '한눈에 알도록.', instagram: '눈길이 머물도록.', place: '찾아올 수 있도록.', daangn: '가까이 전하도록.', cafe: '맥락에 닿도록.', website: '한곳에 모이도록.' })[key]}</p></div></div>`;
}

export function renderIndexCover() {
  return `<div class="sv-index-cover"><div class="sv-index-cover-photo">${picture('art/content-atelier.webp', '콘텐츠 기획과 편집을 표현한 브랜드 작업대')}</div><div class="sv-index-cover-inset">${picture('art/social-studio.webp', '사진 콘텐츠 구성을 표현한 브랜드 이미지')}</div><p>글과 사진, 화면과 소식.<br>안경원을 전하는 여러 가지 방법.</p></div>`;
}

export function renderServiceScene(key) {
  if (key === 'blog') {
    return `<div class="sm-scene sm-blog" data-sm-scene="blog"><div class="sm-photo">${picture(...material.blog)}</div><div class="sm-manuscript"><span>글을 만드는 기준</span><p>무엇을 다루는지.<br>왜 권하는지.<br>어떻게 살피는지.</p><i aria-hidden="true"></i></div><div class="sm-scene-caption">안경원의 설명에서, 고객이 읽는 글로.</div></div>`;
  }
  if (key === 'instagram') {
    return `<div class="sm-scene sm-instagram" data-sm-scene="instagram" data-sm-state="0"><div class="sm-social-composition"><div class="sm-social-side sm-social-left">${picture('art/optical-editorial.webp', '안경 부품의 질감을 보여주는 콘텐츠 이미지')}</div><div class="sm-social-main">${picture(...material.instagram)}<span>콘텐츠 구성 예시</span></div><div class="sm-social-side sm-social-right">${picture('art/content-atelier.webp', '콘텐츠 편집 작업을 보여주는 브랜드 이미지')}</div></div>${controls(key)}${caption(key)}</div>`;
  }
  if (key === 'place') {
    return `<div class="sm-scene sm-place" data-sm-scene="place" data-sm-state="0"><div class="sm-atlas">${picture(...material.place)}</div><div class="sm-map-tag">방문 전, 확인할 정보</div><div class="sm-place-card"><p class="sm-small-label">플레이스에서 정리하는 내용</p>${controls(key)}${caption(key)}<div class="sm-map-fields"><span>주소</span><span>영업시간</span><span>연락처</span></div></div><p class="sm-art-disclosure">업무 설명을 위한 가상 동네 일러스트</p></div>`;
  }
  if (key === 'daangn') {
    return `<div class="sm-scene sm-daangn" data-sm-scene="daangn" data-sm-state="0"><div class="sm-atlas">${picture(...material.daangn)}</div><div class="sm-local-paper"><p class="sm-local-head">가까운 곳의<br>새로운 소식.</p><div class="sm-local-rule"></div>${controls(key)}${caption(key)}</div><p class="sm-art-disclosure">업무 설명을 위한 가상 동네 일러스트</p></div>`;
  }
  if (key === 'cafe') {
    return `<div class="sm-scene sm-cafe" data-sm-scene="cafe" data-sm-state="0"><div class="sm-photo">${picture(...material.cafe)}</div><div class="sm-conversation"><span class="sm-small-label">커뮤니티 콘텐츠의 순서</span>${controls(key)}${caption(key)}</div><span class="sm-cafe-rule" aria-hidden="true"></span></div>`;
  }
  if (key === 'website') {
    return `<div class="sm-scene sm-website" data-sm-scene="website" data-sm-state="0"><div class="sm-website-worktop">${picture(...material.website)}</div><div class="sm-device-controls" hidden aria-label="화면 크기 구성 살펴보기"><button type="button" data-sm-device="desktop" aria-pressed="true">PC</button><button type="button" data-sm-device="mobile" aria-pressed="false">모바일</button><span>설계 원리 예시</span></div><div class="sm-web-layout"><div class="sm-web-nav"><strong>안경원 소개</strong><span>소개　안내　문의</span></div><div class="sm-web-body"><div class="sm-web-copy"><p>어떤 곳인지.<br>무엇을 하는지.</p><span>필요한 정보를 알맞은 순서로.</span></div>${picture('art/optical-editorial.webp', '화면 구성을 설명하기 위한 안경 부품 이미지')}</div><div class="sm-web-bottom"><span>소개를 읽고</span><span>안내를 살피고</span><span>문의로 연결</span></div></div><p class="sm-scene-caption">화면이 달라도, 읽는 순서는 자연스럽게.</p></div>`;
  }
  return '';
}

const features = {
  blog: ['art/optical-editorial.webp', '사진 속의 일을,<br>읽을 수 있는 이야기로.', '안경과 렌즈를 다루는 실제 업무에서 글의 주제를 찾습니다. 설명과 사진이 한 이야기를 따라가도록 편집합니다.', ['사례를 듣고', '주제를 고르고', '글과 사진을 엮습니다']],
  hpblog: ['evidence/portfolio-01.png', '보이는 첫인상과,<br>읽어가는 순서를 함께.', '소개와 메뉴, 콘텐츠와 문의. 화면의 각 요소가 다음 정보를 자연스럽게 안내하도록 구성합니다.', ['소개 문장', '메뉴와 콘텐츠', '문의 연결']],
  instagram: ['art/social-studio.webp', '한 장을 만들고,<br>전체의 흐름을 봅니다.', '사진의 구도와 설명, 게시물의 순서를 함께 살핍니다. 피드와 릴스, 스토리의 형식에 맞춰 내용을 편집합니다.', ['사진의 구도', '설명의 분량', '게시물의 흐름']],
  place: ['art/neighborhood-atlas.webp', '검색한 뒤에,<br>궁금할 내용을 먼저.', '주소와 영업시간만으로 설명되지 않는 매장의 모습까지. 방문 전에 필요한 정보를 빠짐없이 정리합니다.', ['기본 정보', '사진과 소식', '방문 안내']],
  daangn: ['art/conversation-atelier.webp', '지역에 맞는 소식은,<br>구체적인 정보에서.', '가까이 사는 고객에게 어떤 이야기를 전할지 살핍니다. 매장 소개와 소식, 문의 안내가 이어지도록 구성합니다.', ['매장 소개', '지역 소식', '문의와 응대']],
  cafe: ['art/content-atelier.webp', '쓰는 내용만큼,<br>놓이는 자리도 중요합니다.', '커뮤니티의 관심사와 게시 규정을 먼저 확인합니다. 실제 자료를 바탕으로 그곳에 필요한 내용을 정리합니다.', ['관심 주제', '게시 규정', '정보와 자료']],
  website: ['art/editing-desk.webp', '여러 화면을,<br>하나의 흐름으로.', '소개와 서비스, 위치와 문의를 연결합니다. 문장과 사진을 배치한 뒤 PC와 모바일에서 읽는 흐름을 점검합니다.', ['정보의 구조', '화면의 구성', '문의의 연결']],
};

export function renderServiceFeature(key) {
  const [src, title, body, steps] = features[key];
  const real = key === 'hpblog';
  const detail = key === 'blog' ? `<blockquote class="sv-feature-quote"><p>${esc(evidenceReviews[0].quote)}</p><a href="${evidenceReviews[0].src}" data-evidence-open="review" data-evidence-index="0">기존 공개 고객 후기 · 원문 보기 ↗</a></blockquote>` : `<ol>${steps.map((step, i) => `<li><span aria-hidden="true">${i + 1}</span>${step}</li>`).join('')}</ol>`;
  return `<section class="sv-visual-feature sv-feature-${key}" data-sv-feature aria-labelledby="sv-feature-title"><div class="sv-feature-photo">${real ? `<a href="${src}" data-evidence-open="portfolio" data-evidence-index="0" aria-label="유럽안경 제작 화면 크게 보기">` : ''}${picture(src, real ? '유럽안경 실제 홈페이지형 블로그 제작 화면' : '서비스 업무를 표현한 브랜드 이미지')}${real ? '</a><span>유럽안경 · 실제 제작 화면</span>' : `<span>${key === 'place' ? '업무 설명을 위한 가상 동네 일러스트' : '고또마케팅 브랜드 이미지'}</span>`}</div><div class="sv-feature-copy"><h2 id="sv-feature-title">${title}</h2><p>${body}</p>${detail}<a class="sv-text-link" href="#sv-process-title">진행 과정 살펴보기 <span aria-hidden="true">↓</span></a></div></section>`;
}

export function initServiceMedia({ gsap, ScrollTrigger }) {
  const disposers = [];
  const animations = [];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const media = gsap.matchMedia();
  document.querySelectorAll('[data-sm-scene]').forEach(scene => {
    const key = scene.dataset.smScene;
    scene.querySelectorAll('.sm-controls, .sm-device-controls').forEach(controls => { controls.hidden = false; });
    const copy = scene.querySelector('.sm-live-copy');
    scene.querySelectorAll('[data-sm-select]').forEach(button => {
      const select = () => {
        const index = Number(button.dataset.smSelect);
        if (scene.dataset.smState === String(index)) return;
        scene.dataset.smState = String(index);
        scene.querySelectorAll('[data-sm-select]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
        const [label, title, body] = choices[key][index];
        copy.querySelector('[data-sm-title]').textContent = title;
        copy.querySelector('[data-sm-body]').textContent = body;
        const fields = scene.querySelector('.sm-map-fields');
        if (fields) fields.innerHTML = (index === 0 ? ['주소', '영업시간', '연락처'] : index === 1 ? ['매장 모습', '취급 품목', '안내 사진'] : ['매장 위치', '주차 안내', '방문 동선']).map(text => `<span>${text}</span>`).join('');
        if (!reduced.matches) {
          gsap.killTweensOf(copy);
          animations.push(gsap.fromTo(copy, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .45, ease: 'power3.out', clearProps: 'clipPath' }));
          const atlas = scene.querySelector('.sm-atlas img');
          if (atlas) animations.push(gsap.to(atlas, { xPercent: [-3, 2, -1][index], yPercent: [0, 2, -2][index], duration: .8, ease: 'power2.out', overwrite: true }));
        }
      };
      button.addEventListener('click', select); disposers.push(() => button.removeEventListener('click', select));
    });
    scene.querySelectorAll('[data-sm-device]').forEach(button => {
      const select = () => {
        const mobile = button.dataset.smDevice === 'mobile';
        scene.dataset.smState = mobile ? '1' : '0';
        scene.querySelectorAll('[data-sm-device]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
        if (!reduced.matches) animations.push(gsap.fromTo(scene.querySelector('.sm-web-copy'), { opacity: .4 }, { opacity: 1, duration: .45, clearProps: 'opacity' }));
      };
      button.addEventListener('click', select); disposers.push(() => button.removeEventListener('click', select));
    });
  });
  media.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
    document.querySelectorAll('[data-sm-scene]').forEach(scene => {
      const key = scene.dataset.smScene;
      const target = scene.querySelector('.sm-photo img, .sm-atlas img, .sm-website-worktop img');
      if (target) gsap.fromTo(target, { scale: 1.08 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: scene, start: 'top 85%', end: 'bottom 20%', scrub: .7 } });
      if (key === 'instagram') gsap.timeline({ scrollTrigger: { trigger: scene, start: 'top 85%', end: 'bottom 25%', scrub: .7 } })
        .fromTo(scene.querySelector('.sm-social-left'), { y: 55 }, { y: -25, duration: 1, ease: 'none' }, 0)
        .fromTo(scene.querySelector('.sm-social-right'), { y: -35 }, { y: 30, duration: 1, ease: 'none' }, 0);
      if (key === 'blog') gsap.fromTo(scene.querySelector('.sm-manuscript'), { clipPath: 'inset(0% 0% 16% 0%)', y: 24 }, { clipPath: 'inset(0% 0% 0% 0%)', y: 0, ease: 'none', scrollTrigger: { trigger: scene, start: 'top 70%', end: 'bottom 30%', scrub: .6 } });
    });
    document.querySelectorAll('[data-sv-feature]').forEach(feature => {
      const image = feature.querySelector('.sv-feature-photo img');
      gsap.fromTo(image, { scale: 1.1, yPercent: -3 }, { scale: 1, yPercent: 3, ease: 'none', scrollTrigger: { trigger: feature, start: 'top bottom', end: 'bottom top', scrub: .7 } });
    });
  });
  return () => { media.revert(); animations.forEach(animation => animation.kill()); disposers.forEach(dispose => dispose()); };
}
