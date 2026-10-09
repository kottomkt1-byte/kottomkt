import './base.css';
import './b.css';
import { initCommon, reducedMotion } from './shared.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

initCommon();
gsap.registerPlugin(ScrollTrigger);
window.__kottoMotion = { concept: 'b', progress: 0, service: 'blog' };

const services = {
  blog: { label: '브랜드 블로그', kicker: '읽고 이해하는 콘텐츠', title: '안경원의 설명이<br />한 편의 글이 되도록.', copy: '안경 제작 사례와 제품을 고르는 기준을 정리합니다. 안경원의 전문성이 글 안에서 자연스럽게 드러나도록 브랜드 블로그를 운영합니다.', detail: '브랜드 블로그 대행 · 홈페이지형 블로그 제작' },
  place: { label: '플레이스', kicker: '찾아오는 데 필요한 정보', title: '검색한 다음,<br />찾아올 수 있도록.', copy: '네이버·카카오·구글 지도에서 안경원을 소개합니다. 지역 고객이 안경원을 찾을 때 확인하는 정보를 정리하고 플레이스를 관리합니다.', detail: '네이버 플레이스 · 카카오맵 · 구글 지도 관리·세팅' },
  social: { label: '인스타그램', kicker: '화면에 맞게 전하는 이야기', title: '사진 한 장에도<br />안경원의 시선이.', copy: '안경원에서 전하고 싶은 내용을 인스타그램 콘텐츠로 정리합니다. 사진과 글이 함께 안경원을 설명하도록 채널에 맞게 기획합니다.', detail: '인스타그램 마케팅' },
  web: { label: '홈페이지', kicker: '한곳에 담은 안경원 소개', title: '궁금한 내용을<br />한곳에서 읽도록.', copy: '안경원의 소개와 서비스, 이용에 필요한 정보를 홈페이지에 담습니다. 처음 방문하는 고객도 필요한 내용을 찾을 수 있도록 구성합니다.', detail: '홈페이지 제작' },
};
const tabs = [...document.querySelectorAll('[data-service]')];
const panel = document.getElementById('service-panel');
let panelAnimation;
function selectService(tab, moveFocus = false) {
  const service = services[tab.dataset.service];
  tabs.forEach(item => { const selected = item === tab; item.setAttribute('aria-selected', String(selected)); item.tabIndex = selected ? 0 : -1; });
  panel.setAttribute('aria-labelledby', tab.id);
  panelAnimation?.kill();
  panel.querySelector('.b-panel-kicker').textContent = service.kicker;
  panel.querySelector('h3').innerHTML = service.title;
  panel.querySelector('.b-panel-copy').textContent = service.copy;
  panel.querySelector('.b-panel-detail').textContent = service.detail;
  panel.querySelector('a').href = `mailto:communication@kotto.kr?subject=${encodeURIComponent(`고또마케팅 ${service.label} 문의`)}`;
  window.__kottoMotion.service = tab.dataset.service;
  if (!reducedMotion.matches) panelAnimation = gsap.fromTo(panel.children, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .42, stagger: .045, ease: 'power2.out', clearProps: 'transform,opacity' });
  if (moveFocus) tab.focus();
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectService(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next === undefined) return;
    event.preventDefault(); selectService(tabs[next], true);
  });
});

const mm = gsap.matchMedia();
mm.add({ noMotion: '(prefers-reduced-motion: reduce)', mobile: '(max-width: 600px)', desktop: '(min-width: 601px)' }, context => {
  const { noMotion, mobile } = context.conditions;
  if (noMotion) { gsap.set('.b-story-end', { clearProps: 'opacity,visibility,clipPath,transform' }); window.__kottoMotion.progress = 1; return; }

  // A single opening gesture: type is set first; the image then opens like a printed sheet.
  const opening = gsap.timeline({ defaults: { ease: 'power3.out' } });
  opening.from('.b-title-line > span', { yPercent: 115, duration: 1.18, stagger: .14 }, .08)
    .from('.b-art-window', { clipPath: 'inset(0 0 100% 0)', duration: 1.5, ease: 'power3.inOut' }, .25)
    .from('.b-art-window img', { scale: 1.13, yPercent: -5, duration: 1.6 }, .25)
    .from('.b-intro', { opacity: 0, duration: .7 }, .7);

  const timeline = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: '.b-story', start: 'top top',
      end: () => `+=${document.querySelector('.b-story').offsetHeight - document.querySelector('.b-story-stage').offsetHeight}`,
      scrub: mobile ? .4 : .75, invalidateOnRefresh: true,
      onUpdate: self => { window.__kottoMotion.progress = Number(self.progress.toFixed(4)); },
    },
  });
  timeline.to('.b-spread', { rotation: 0, duration: .3 }, 0)
    .to('.b-story-heading', { yPercent: -45, opacity: 0, duration: .22 }, .08)
    .to('.b-spread-left', { xPercent: -105, rotationY: mobile ? 0 : -20, duration: .46 }, .25)
    .to('.b-spine', { opacity: 0, duration: .15 }, .25)
    .to('.b-spread', { scale: mobile ? 2.8 : 2.75, xPercent: mobile ? -8 : -7, yPercent: mobile ? -12 : -10, duration: .57 }, .24)
    .to('.b-spread-image img', { scale: 1.075, duration: .57 }, .24)
    .to('.b-image-shade', { opacity: .79, duration: .27 }, .28)
    .set('.b-story-end', { autoAlpha: 1 }, .38)
    .fromTo('.b-story-end', { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: .17 }, .38)
    .to('.b-story-progress span', { scaleX: 1, duration: 1 }, 0)
    .to({}, { duration: .09 });

  return () => { panelAnimation?.kill(); gsap.set(panel.children, { clearProps: 'transform,opacity' }); };
});

document.fonts.ready.then(() => ScrollTrigger.refresh());
document.querySelectorAll('img').forEach(img => { if (!img.complete) img.addEventListener('load', () => ScrollTrigger.refresh(), { once: true }); });
window.addEventListener('pagehide', event => { if (!event.persisted) mm.revert(); });
