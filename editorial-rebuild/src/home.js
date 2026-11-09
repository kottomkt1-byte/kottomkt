import { arrow } from './shell.js';
import { renderVoices } from './evidence.js';
import { renderAchievements } from './achievements.js';
import { renderBrandVideo } from './brand-video.js';

const sectors = [
  ['store', '안경원', '매장의 전문성과 안경 제작 이야기를 지역 고객에게 전합니다.', '블로그 · 지역 채널 · 홈페이지'],
  ['eyewear', '아이웨어 브랜드', '안경테와 선글라스의 디테일을 브랜드에 어울리는 이미지와 콘텐츠로 만듭니다.', '모델 이미지 · SNS · 브랜드 웹사이트'],
  ['lenses', '안경렌즈·콘택트렌즈', '제품 자료를 바탕으로 특성과 사용 정보를 이해하기 쉽게 풀어냅니다.', '제품 설명 콘텐츠 · SNS · 웹사이트'],
  ['distribution', '제조·유통 및 관련 기업', '취급 제품과 기업의 이야기를 전달할 채널과 콘텐츠를 함께 구성합니다.', '브랜드 콘텐츠 · 제품 이미지 · 웹사이트'],
];
const capabilities = [
  { title:'브랜드를 보여주는 이미지', copy:'프레임의 형태와 착용 표현을 살피고, 제품에 어울리는 모델 이미지를 만듭니다.', links:[['model-images','모델 이미지 제작'],['instagram','인스타그램']] },
  { title:'설명을 읽히게 하는 콘텐츠', copy:'제품의 특성과 전문적인 설명을 고객이 이해할 수 있는 글과 사진으로 정리합니다.', links:[['blog','브랜드 블로그'],['hpblog','홈페이지형 블로그'],['cafe','카페 바이럴']] },
  { title:'고객과 만나는 접점', copy:'기업과 브랜드를 소개하는 웹사이트부터 지역 고객이 매장을 찾는 채널까지 연결합니다.', links:[['website','홈페이지 제작'],['place','플레이스'],['daangn','당근마켓']] },
];
const portrait = (id, alt) => `<img src="portfolio/model-images/thumbnails/${id}.webp" width="900" height="1125" alt="${alt}" loading="lazy" decoding="async">`;

export function renderHome() {
  return `<section class="home-opening" aria-labelledby="hero-heading"><div class="hero-stage">
    <div class="home-hero-media">${renderBrandVideo({id:'home-brand-video',variant:'hero'})}</div>
    <div class="home-hero-shade" aria-hidden="true"></div>
    <div class="hero-heading"><p class="hero-sector">안경 산업 전문 광고·콘텐츠 마케팅</p><h1 id="hero-heading" data-split>안경을 아는 시선.<br>브랜드를 위한 콘텐츠.</h1><p class="hero-description">안경원에서 아이웨어 브랜드, 렌즈 기업까지.<br>제품과 브랜드의 가치를 고객의 언어로 전합니다.</p><a class="hero-cta" href="#home-world">함께할 분야 살펴보기 ${arrow}</a></div>
    <div class="hero-bottom"><span>제품의 디테일에서, 브랜드의 이야기까지.</span><a href="#home-world" aria-label="아래에서 고또의 전문 분야 살펴보기">스크롤하여 살펴보기 <span aria-hidden="true">↓</span></a></div>
  </div></section>
  <section class="home-world wrap" id="home-world" aria-labelledby="world-title">
    <header class="world-heading"><h2 id="world-title" data-split>하나의 산업,<br>서로 다른 이야기.</h2><p>안경을 만드는 사람, 고르는 사람, 전하는 사람.<br class="desktop-only"> 각자의 일과 고객을 이해하는 데서 시작합니다.</p></header>
    <div class="world-layout"><figure class="world-portrait"><div>${portrait('tf5922-020-women-02','민트색 드레이프 상의와 반투명 안경을 착용한 모델, 고또 모델 이미지 제작 포트폴리오')}</div><figcaption><span>안경테 모델 이미지</span><a href="service-model-images.html">제작 포트폴리오 ${arrow}</a></figcaption></figure>
      <div class="world-sectors"><p class="world-sector-intro">함께할 분야</p>${sectors.map(([key,name,copy,scope])=>`<a class="world-sector" href="services.html?audience=${key}"><div><h3>${name}</h3><p>${copy}</p><span>${scope}</span></div>${arrow}</a>`).join('')}</div>
    </div>
  </section>
  <section class="home-selected" id="home-selected" aria-labelledby="selected-title"><div class="wrap">
    <header class="selected-heading"><p>고또의 작업</p><h2 id="selected-title" data-split>디테일에서,<br>브랜드의 인상까지.</h2><a class="text-link" href="service-model-images.html#model-portfolio">모델 이미지 포트폴리오 ${arrow}</a></header>
    <div class="selected-spread">
      <a class="selected-main" href="service-model-images.html" aria-label="선글라스 모델 이미지 제작 살펴보기"><figure><div class="selected-image">${portrait('tf1387-52f-women-03','브라운 선글라스와 초콜릿색 상의를 착용한 모델의 패션 컷')}</div><figcaption><span>제품이 놓이는 장면</span><span>모델 이미지 제작</span></figcaption></figure></a>
      <div class="selected-side"><p class="selected-statement">형태는 섬세하게.<br>인상은 선명하게.</p><a href="service-model-images.html" aria-label="안경테 디테일과 검수 과정 살펴보기"><figure><div class="selected-image">${portrait('tf1289-01a-women-01','블랙 선글라스의 프레임과 템플 디테일을 보여주는 모델 근접 컷')}</div><figcaption>프레임의 형태와 착용 표현까지</figcaption></figure></a><p class="selected-description">자체 개발 프로그램으로 제작하고,<br>안경사가 제품 디테일을 직접 검수합니다.</p></div>
    </div>
    <div class="selected-note"><span>안경테·선글라스 모델 이미지 제작 사례</span><a href="service-hpblog.html#selected-work">안경원 홈페이지형 블로그 사례도 보기 ${arrow}</a></div>
  </div></section>
  <section class="home-services wrap" aria-labelledby="home-services-title"><header class="home-services-heading"><h2 id="home-services-title" data-split>전할 내용에 맞춰,<br>표현과 채널을 고릅니다.</h2><a class="text-link" href="services.html">전체 서비스 ${arrow}</a></header><div class="home-capabilities">${capabilities.map(item=>`<article class="home-capability"><h3>${item.title}</h3><div><p>${item.copy}</p><nav aria-label="${item.title} 관련 서비스">${item.links.map(([key,label])=>`<a href="service-${key}.html">${label} ${arrow}</a>`).join('')}</nav></div></article>`).join('')}</div></section>
  ${renderAchievements()}
  ${renderVoices()}`;
}

export function initHome({gsap,ScrollTrigger}) {
  const home = document.querySelector('.home-opening');
  if (!home) return () => {};
  const mm = gsap.matchMedia();
  gsap.registerPlugin(ScrollTrigger);
  mm.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
    gsap.to(home.querySelector('.brand-video-player'), {scale:1.055,yPercent:2,ease:'none',scrollTrigger:{trigger:home,start:'top top',end:'bottom top',scrub:.7}});
    const portrait = document.querySelector('.world-portrait img');
    gsap.fromTo(portrait,{scale:1.045,yPercent:1.5},{scale:1,yPercent:-1.5,ease:'none',scrollTrigger:{trigger:'.world-portrait',start:'top bottom',end:'bottom top',scrub:.7}});
    const spread = document.querySelector('.selected-spread');
    const sequence = gsap.timeline({scrollTrigger:{trigger:spread,start:'top 85%',end:'top 15%',scrub:.8}});
    sequence.fromTo('.selected-main .selected-image',{clipPath:'inset(8% 6% 8% 6%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:1,ease:'none'},0)
      .fromTo('.selected-main img',{scale:1.06},{scale:1,duration:1,ease:'none'},0)
      .fromTo('.selected-side',{y:50},{y:0,duration:1,ease:'none'},0);
  });
  return () => mm.revert();
}
