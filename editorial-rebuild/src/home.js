import { arrow } from './shell.js';
import { renderVoices } from './evidence.js';
import { renderAchievements } from './achievements.js';
import { renderBrandVideo } from './brand-video.js';

const sectors = [
  ['store','안경원','매장의 전문성과 안경 제작 이야기를 지역 고객에게 전합니다.','블로그 · 지역 채널 · 홈페이지'],
  ['eyewear','아이웨어 브랜드','프레임의 디테일과 브랜드의 개성을 이미지와 콘텐츠로 만듭니다.','모델 이미지 · SNS · 브랜드 웹사이트'],
  ['lenses','안경렌즈·콘택트렌즈','제품 자료에서 확인한 특성과 사용 정보를 이해하기 쉽게 풀어냅니다.','제품 콘텐츠 · SNS · 웹사이트'],
  ['distribution','제조·수입·유통사','취급 브랜드와 제품, 기업의 이야기가 필요한 곳에 닿도록 합니다.','기업 소개 · 제품 콘텐츠 · 웹사이트'],
];
const work = [
  ['tf1381-01a-men-03','선글라스 · 패션 컷','버건디 재킷과 블랙 선글라스를 착용한 모델'],
  ['tf5922-020-women-02','안경테 · 근접 컷','민트색 드레이프 상의와 반투명 안경을 착용한 모델'],
  ['tf1387-52f-women-03','선글라스 · 패션 컷','브라운 선글라스와 초콜릿색 상의를 착용한 모델'],
  ['tf1289-01a-women-03','선글라스 · 디테일 컷','밝은 재킷과 블랙 선글라스의 착용 장면'],
  ['tf1291-28a-women-03','선글라스 · 근접 컷','로즈색 상의와 골드 프레임 선글라스를 착용한 모델'],
  ['tf6032-001-women-02','안경테 · 근접 컷','파란색 상의와 블랙 안경을 착용한 단발 모델'],
];
const capabilities = [
  {type:'이미지',title:'브랜드를<br>보여주는 이미지',copy:'프레임의 형태와 착용 표현을 살피고, 제품에 어울리는 장면을 만듭니다.',links:[['model-images','모델 이미지 제작'],['instagram','인스타그램']]},
  {type:'콘텐츠',title:'전문성을<br>읽히게 하는 콘텐츠',copy:'제품 정보와 브랜드의 이야기를 고객이 이해하는 글과 사진으로 정리합니다.',links:[['blog','브랜드 블로그'],['hpblog','홈페이지형 블로그'],['cafe','카페 바이럴']]},
  {type:'웹·채널',title:'고객과<br>연결되는 접점',copy:'브랜드를 소개하는 웹사이트부터 지역 고객이 매장을 찾는 채널까지 함께 구성합니다.',links:[['website','홈페이지 제작'],['place','플레이스'],['daangn','당근마켓']]},
];
const pad = n => String(n).padStart(2,'0');

export function renderHome() {
  return `<section class="home-opening" aria-labelledby="hero-heading"><div class="hero-stage">
    <div class="studio-masthead wrap"><div class="masthead-brand" aria-hidden="true">KOTTO</div><div class="hero-heading"><p class="hero-sector">안경 산업 전문<br>광고·콘텐츠 마케팅</p><h1 id="hero-heading">안경을 아는 시선.<br>브랜드를 위한 콘텐츠.</h1><a class="hero-cta" href="#home-world">함께할 분야 살펴보기 ${arrow}</a></div></div>
    <div class="home-hero-media">${renderBrandVideo({id:'home-brand-video',variant:'hero'})}</div>
    <div class="hero-bottom wrap"><p>안경원에서 아이웨어 브랜드, 렌즈 기업까지.</p><a href="#home-selected">고또의 작업 살펴보기 <span aria-hidden="true">↓</span></a></div>
  </div></section>
  <section class="home-selected" id="home-selected" aria-labelledby="selected-title">
    <header class="selected-heading wrap"><div><p class="section-index">01 / 우리가 만든 장면</p><h2 id="selected-title" data-split>안경을,<br>브랜드의 장면으로.</h2></div><div class="selected-intro"><p>형태와 비율, 작은 디테일까지.<br>안경을 아는 사람들이 만드는 이미지입니다.</p><a class="text-link" href="service-model-images.html#model-portfolio">포트폴리오 전체 보기 ${arrow}</a></div></header>
    <div class="work-reel" id="home-work-reel" aria-label="모델 이미지 제작 포트폴리오" tabindex="0">${work.map(([id,label,alt],i)=>`<a class="work-item work-item-${i%3}" href="service-model-images.html#model-portfolio"><figure><div class="work-image"><img src="portfolio/model-images/thumbnails/${id}.webp" alt="${alt}, 고또 모델 이미지 제작 포트폴리오" width="900" height="1125" loading="lazy" decoding="async"></div><figcaption><span>${pad(i+1)} / ${label}</span>${arrow}</figcaption></figure></a>`).join('')}</div>
    <div class="work-reel-bottom wrap"><p>안경테·선글라스 모델 이미지 제작 포트폴리오</p><div class="work-reel-controls" hidden><span data-work-count aria-live="polite">01 / 06</span><button type="button" data-work-prev aria-label="이전 작업 이미지" aria-controls="home-work-reel">←</button><button type="button" data-work-next aria-label="다음 작업 이미지" aria-controls="home-work-reel">→</button></div></div>
  </section>
  <section class="home-perspective wrap" aria-labelledby="perspective-title"><p class="section-index">우리가 보는 것</p><div><h2 id="perspective-title" data-split>제품의 디테일에서,<br>브랜드의 이야기까지.</h2><div class="perspective-bottom"><p>안경을 만드는 사람, 고르는 사람, 전하는 사람.<br>각자의 일과 고객을 이해하는 데서 시작합니다.</p><a class="text-link" href="about.html">고또마케팅 알아보기 ${arrow}</a></div></div></section>
  <section class="home-world" id="home-world" aria-labelledby="world-title"><div class="wrap"><header class="world-heading"><p class="section-index">02 / 함께하는 분야</p><h2 id="world-title" data-split>하나의 산업.<br>서로 다른 가능성.</h2><p>브랜드와 제품, 그리고 고객.<br>각자의 이야기에 맞는 방법을 함께 찾습니다.</p></header><div class="world-sectors">${sectors.map(([key,name,copy,scope],i)=>`<a class="world-sector" href="services.html?audience=${key}"><span class="world-number" aria-hidden="true">${pad(i+1)}</span><h3>${name}</h3><div class="world-sector-copy"><p>${copy}</p><span>${scope}</span></div>${arrow}</a>`).join('')}</div></div></section>
  <section class="home-services wrap" aria-labelledby="home-services-title"><header class="home-services-heading"><div><p class="section-index">03 / 하는 일</p><h2 id="home-services-title" data-split>보여주고.<br>설명하고. 연결합니다.</h2></div><a class="text-link" href="services.html">전체 서비스 ${arrow}</a></header><div class="home-capabilities">${capabilities.map((item,i)=>`<article class="home-capability"><p class="capability-type">${pad(i+1)} / ${item.type}</p><h3>${item.title}</h3><p class="capability-copy">${item.copy}</p><nav aria-label="${item.type} 관련 서비스">${item.links.map(([key,label])=>`<a href="service-${key}.html">${label} ${arrow}</a>`).join('')}</nav></article>`).join('')}</div></section>
  ${renderAchievements()}
  ${renderVoices()}`;
}

export function initHome({gsap,ScrollTrigger}) {
  const home=document.querySelector('.home-opening');
  if(!home)return()=>{};
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const reel=document.querySelector('.work-reel');
  const items=[...reel.querySelectorAll('.work-item')];
  const controls=document.querySelector('.work-reel-controls');
  const prev=controls.querySelector('[data-work-prev]');
  const next=controls.querySelector('[data-work-next]');
  const count=controls.querySelector('[data-work-count]');
  controls.hidden=false;
  let active=0,frame;
  const positions=()=>items.map(item=>item.offsetLeft-items[0].offsetLeft);
  const update=()=>{
    const offsets=positions();
    active=offsets.reduce((closest,x,i)=>Math.abs(x-reel.scrollLeft)<Math.abs(offsets[closest]-reel.scrollLeft)?i:closest,0);
    const atEnd=reel.scrollLeft>=reel.scrollWidth-reel.clientWidth-3;
    if(atEnd)active=items.length-1;
    count.textContent=`${pad(active+1)} / ${pad(items.length)}`;
    prev.disabled=reel.scrollLeft<=3;next.disabled=atEnd;
  };
  const onScroll=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(update);};
  const move=direction=>{
    const max=reel.scrollWidth-reel.clientWidth;
    const stops=[...new Set([...positions().map(x=>Math.min(x,max)),max])];
    const target=direction>0?stops.find(x=>x>reel.scrollLeft+3):stops.findLast(x=>x<reel.scrollLeft-3);
    reel.scrollTo({left:target??(direction>0?max:0),behavior:reduced.matches?'instant':'smooth'});
  };
  const back=()=>move(-1),forward=()=>move(1);
  prev.addEventListener('click',back);next.addEventListener('click',forward);
  reel.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onScroll);update();
  const mm=gsap.matchMedia();gsap.registerPlugin(ScrollTrigger);
  mm.add('(prefers-reduced-motion: no-preference)',()=>{
    gsap.from('.masthead-brand',{yPercent:35,opacity:0,duration:1.1,ease:'power3.out',clearProps:'transform,opacity'});
    gsap.from('.hero-heading',{y:24,opacity:0,duration:.9,delay:.12,ease:'power3.out',clearProps:'transform,opacity'});
  });
  mm.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)',()=>{
    gsap.fromTo('.home-hero-media',{clipPath:'inset(0 2.3% 0 2.3%)'},{clipPath:'inset(0 0% 0 0%)',ease:'none',scrollTrigger:{trigger:'.home-hero-media',start:'top 70%',end:'top 10%',scrub:.7}});
    gsap.from('.world-sector',{y:26,opacity:.35,duration:.7,stagger:.09,ease:'power2.out',clearProps:'transform,opacity',scrollTrigger:{trigger:'.world-sectors',start:'top 85%',once:true}});
  });
  return()=>{mm.revert();cancelAnimationFrame(frame);reel.removeEventListener('scroll',onScroll);window.removeEventListener('resize',onScroll);prev.removeEventListener('click',back);next.removeEventListener('click',forward);};
}
