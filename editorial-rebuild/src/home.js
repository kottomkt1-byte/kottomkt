import { arrow } from './shell.js';
import { renderVoices } from './evidence.js';
import { renderAchievements } from './achievements.js';
import { renderBrandVideo } from './brand-video.js';

const chapters = [
  { title:'먼저, 안경원의 일을 봅니다.', label:'일을 이해하고', image:'optical-editorial', alt:'안경테 소재와 정밀 도구를 담은 브랜드 이미지', copy:'어떤 안경을 다루는지, 무엇을 꼼꼼하게 살피는지. 콘텐츠의 출발점은 안경원의 실제 업무입니다.', tag:'안경 업종에 대한 이해' },
  { title:'설명할 내용을, 읽히는 장면으로.', label:'콘텐츠로 만들고', image:'content-atelier', alt:'사진과 인쇄물, 글의 구성을 표현한 콘텐츠 편집 브랜드 이미지', copy:'안경 제작 사례를 한 편의 글로, 전하고 싶은 소식을 사진과 영상으로. 내용에 맞는 표현을 찾습니다.', tag:'글 · 이미지 · 영상' },
  { title:'고객이 살펴볼 곳에 놓습니다.', label:'필요한 곳에 전합니다', image:'neighborhood-atlas', alt:'동네의 상점과 안경원을 그린 브랜드 일러스트', copy:'블로그에서 읽고, SNS에서 만나고, 지도에서 찾아볼 수 있도록. 채널마다 필요한 정보를 정리합니다.', tag:'콘텐츠와 지역의 연결' },
];
const methods = [
  ['blog','브랜드 블로그','안경원의 전문성을 한 편의 글로','content-atelier'],
  ['instagram','인스타그램','사진과 영상에 담는 매장 소식','social-studio'],
  ['place','플레이스','방문 전에 확인하는 매장 정보','neighborhood-atlas'],
  ['daangn','당근마켓','가까이 사는 고객에게 전하는 소식','neighborhood-atlas'],
  ['cafe','카페 바이럴','지역 커뮤니티에 맞는 이야기','conversation-atelier'],
  ['website','홈페이지 제작','소개부터 문의까지 이어지는 공간','editing-desk'],
  ['hpblog','홈페이지형 블로그','소개와 콘텐츠를 연결하는 첫 화면','editorial'],
];

export function renderHome() {
  return `<section class="home-opening" aria-labelledby="hero-heading"><div class="hero-stage">
    <div class="home-hero-media">${renderBrandVideo({id:'home-brand-video',variant:'hero'})}</div>
    <div class="home-hero-shade" aria-hidden="true"></div>
    <div class="hero-heading"><p class="hero-sector">안경원 전문 광고·콘텐츠 마케팅</p><h1 id="hero-heading" data-split>좋은 안경원을<br>제대로 알리는 일.</h1><p class="hero-description">안경원의 설명을 글로, 사진으로, 영상으로.<br>고객이 이해하고 찾아볼 수 있게 만듭니다.</p><a class="hero-cta" href="services.html">고또마케팅이 하는 일 ${arrow}</a></div>
    <div class="hero-end"><p>안경원 안의 전문성을</p><h2>보이는 이야기로.<br>기억되는 장면으로.</h2><a href="#home-stories">콘텐츠가 만들어지는 과정 ${arrow}</a></div>
    <div class="hero-bottom"><span>안경원의 일에서, 고객의 일상까지.</span><a href="#home-stories" aria-label="아래에서 콘텐츠 제작 과정 보기">스크롤하여 살펴보기 <span aria-hidden="true">↓</span></a></div>
    <div class="hero-track" aria-hidden="true"><span></span></div>
  </div></section>

  <section class="home-stories" id="home-stories" aria-labelledby="stories-title"><div class="home-stories-stage wrap">
    <header class="home-stories-heading"><h2 id="stories-title">이야기에는,<br>어울리는 장면이 있습니다.</h2><p>매장을 이해하는 일부터<br>고객에게 전하는 방식까지.</p></header>
    <div class="story-worktable"><div class="story-main">
      ${chapters.map((item,i)=>`<figure class="story-scene${i===0?' is-active':''}" data-story-scene="${i}" ${i?'hidden':''}><img src="art/${item.image}.webp" width="${i===0?1448:1536}" height="${i===0?1086:1024}" alt="${item.alt}" loading="lazy"><figcaption>${item.tag}<span>브랜드 이미지</span></figcaption></figure>`).join('')}
      <span class="story-registration" aria-hidden="true">＋</span>
    </div><div class="story-companion"><img src="art/conversation-atelier.webp" width="1536" height="1024" alt="기획과 소통을 잇는 손과 종이의 브랜드 일러스트" loading="lazy"><div class="story-note">${chapters.map((item,i)=>`<div data-story-copy="${i}" ${i?'hidden':''}><h3>${item.title}</h3><p>${item.copy}</p></div>`).join('')}<a href="about.html">고또마케팅 알아보기 ${arrow}</a></div></div></div>
    <div class="story-chapters" aria-label="콘텐츠 제작 장면 선택">${chapters.map((item,i)=>`<button type="button" data-story-select="${i}" aria-pressed="${i===0}"><span aria-hidden="true">${String(i+1).padStart(2,'0')}</span>${item.label}<i aria-hidden="true"></i></button>`).join('')}</div>
  </div></section>

  ${renderAchievements()}

  <section class="home-services wrap" aria-labelledby="home-services-title"><div class="home-services-heading"><div><p>고또마케팅이 하는 일</p><h2 id="home-services-title" data-split>읽고, 보고,<br>찾아올 수 있도록.</h2></div><p>안경원에 필요한 콘텐츠와 채널을<br>하나씩 살펴보세요.</p></div>
    <div class="home-channel-covers"><a href="service-blog.html" class="channel-cover cover-writing"><img src="art/content-atelier.webp" width="1536" height="1024" loading="lazy" alt="콘텐츠 편집을 표현한 브랜드 이미지"><span><small>글과 이미지로</small><strong>전문성을 읽다.</strong>${arrow}</span></a><a href="service-instagram.html" class="channel-cover cover-social"><img src="art/social-studio.webp" width="1536" height="1024" loading="lazy" alt="사진과 영상 편집을 표현한 브랜드 이미지"><span><small>사진과 영상으로</small><strong>매장을 기억하다.</strong>${arrow}</span></a><a href="service-place.html" class="channel-cover cover-local"><img src="art/neighborhood-atlas.webp" width="1536" height="1024" loading="lazy" alt="지역과 매장의 연결을 표현한 브랜드 일러스트"><span><small>방문에 필요한 정보로</small><strong>동네에서 만나다.</strong>${arrow}</span></a></div>
    <nav class="home-service-list" aria-label="서비스 상세 보기">${methods.map(([key,name,copy,asset])=>`<a href="service-${key}.html"><img src="art/${asset}.webp" width="160" height="120" alt="" loading="lazy"><span><strong>${name}</strong><small>${copy}</small></span>${arrow}</a>`).join('')}</nav>
  </section>

  ${renderVoices()}
  `;
}

export function initHome({gsap,ScrollTrigger}) {
  const home=document.querySelector('.home-opening');
  if(!home)return()=>{};
  const mm=gsap.matchMedia();
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const listeners=[];let transition;
  const scenes=[...document.querySelectorAll('[data-story-scene]')];
  const copies=[...document.querySelectorAll('[data-story-copy]')];
  const buttons=[...document.querySelectorAll('[data-story-select]')];
  let selected=0,manualUntil=0;
  function select(next,manual=false){
    if(manual)manualUntil=performance.now()+3500;
    if(next===selected)return;
    const before=scenes[selected],after=scenes[next];
    transition?.kill();
    scenes.forEach(scene=>{scene.hidden=true;scene.classList.remove('is-active');gsap.set(scene,{clearProps:'clipPath,zIndex'});});
    after.hidden=false;after.classList.add('is-active');
    copies.forEach((copy,i)=>{copy.hidden=i!==next;});
    buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===next)));
    selected=next;
    if(!reduced.matches){
      before.hidden=false;gsap.set(after,{zIndex:2});
      transition=gsap.fromTo(after,{clipPath:'inset(0% 100% 0% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:.85,ease:'power3.inOut',onComplete:()=>{scenes.forEach((scene,i)=>{scene.hidden=i!==selected;});gsap.set(after,{clearProps:'clipPath,zIndex'});}});
    }
    window.__kottoMotion.story=next;
  }
  buttons.forEach((button,i)=>{const handler=()=>select(i,true);button.addEventListener('click',handler);listeners.push(()=>button.removeEventListener('click',handler));});
  mm.add('(min-width: 901px) and (min-height: 680px) and (prefers-reduced-motion: no-preference)',()=>{
    const stage=home.querySelector('.hero-stage');
    const end=home.querySelector('.hero-end');
    const heading=home.querySelector('.hero-heading');
    const timeline=gsap.timeline({scrollTrigger:{trigger:home,start:'top top+=88',end:()=>`+=${home.offsetHeight-stage.offsetHeight}`,scrub:.65,invalidateOnRefresh:true,onUpdate:self=>{window.__kottoMotion.heroProgress=+self.progress.toFixed(3);end.inert=self.progress<.55;heading.inert=self.progress>.35;}}});
    end.inert=true;
    timeline.to('.hero-heading',{opacity:0,y:-60,duration:.35,ease:'none'},0)
      .to('.home-hero-media .brand-video-player',{scale:1.09,xPercent:3,duration:1,ease:'none'},0)
      .to('.home-hero-shade',{opacity:.9,duration:.8,ease:'none'},.15)
      .fromTo(end,{autoAlpha:0,clipPath:'inset(0% 0% 100% 0%)'},{autoAlpha:1,clipPath:'inset(0% 0% 0% 0%)',duration:.42,ease:'power2.out'},.58)
      .to('.hero-track span',{scaleX:1,duration:1,ease:'none'},0);
    const story=document.querySelector('.home-stories');
    story.classList.add('has-story-motion');
    let step=-1;
    ScrollTrigger.create({trigger:story,start:'top top+=88',end:'bottom bottom',onUpdate:self=>{const next=Math.min(2,Math.floor(self.progress*3));if(next!==step){step=next;if(performance.now()>manualUntil)select(next);}}});
    return()=>{story.classList.remove('has-story-motion');end.inert=false;heading.inert=false;};
  });
  mm.add('(min-width: 701px) and (prefers-reduced-motion: no-preference)',()=>{
    gsap.fromTo('.home-channel-covers .cover-social',{y:70},{y:0,ease:'none',scrollTrigger:{trigger:'.home-channel-covers',start:'top 95%',end:'top 30%',scrub:.6}});
    gsap.fromTo('.home-channel-covers .cover-local',{y:120},{y:0,ease:'none',scrollTrigger:{trigger:'.home-channel-covers',start:'top 95%',end:'top 30%',scrub:.6}});
  });
  return()=>{transition?.kill();listeners.forEach(dispose=>dispose());mm.revert();};
}
