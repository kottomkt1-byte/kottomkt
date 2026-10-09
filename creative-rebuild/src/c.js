import './base.css';
import './c.css';
import { initCommon, reducedMotion } from './shared.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';

gsap.registerPlugin(ScrollTrigger, Flip);
initCommon();

window.__kottoMotion = { concept: 'c', progress: 0, channel: 'blog' };

const board = document.querySelector('#typesetter');
const pieces = [...board.querySelectorAll('.c-flip')];
const channelButtons = [...document.querySelectorAll('[data-channel][aria-pressed]')];
const channelNames = { blog: '블로그', place: '플레이스', instagram: '인스타그램' };
const channelCopy = {
  blog: { label: '원장님의 설명', title: ['렌즈를', '고른 이유.'], copy: ['고객에게 설명했던 내용을', '읽기 쉬운 글로 정리합니다.'] },
  place: { label: '매장의 정보', title: ['찾아오는', '길까지.'], copy: ['안경원을 찾는 고객에게', '필요한 정보를 정리합니다.'] },
  instagram: { label: '매장의 소식', title: ['새 소식을', '한눈에.'], copy: ['매장의 소식과 분위기를', '사진과 글로 전합니다.'] }
};
let layoutAnimation;

function setLines(element, lines) {
  element.replaceChildren(document.createTextNode(`${lines[0]} `), document.createElement('br'), document.createTextNode(lines[1]));
}

function setChannel(channel) {
  if (channel === board.dataset.channel) return;
  // Finish an interrupted layout before measuring the next composition.
  layoutAnimation?.progress(1);
  const state = Flip.getState(pieces);
  board.dataset.channel = channel;
  const nextCopy = channelCopy[channel];
  board.querySelector('.c-sample-label').textContent = nextCopy.label;
  setLines(board.querySelector('.c-sample-title'), nextCopy.title);
  setLines(board.querySelector('.c-sample-copy'), nextCopy.copy);
  channelButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.channel === channel)));
  if (!reducedMotion.matches) {
    layoutAnimation = Flip.from(state, {
      targets: pieces,
      duration: 0.72,
      ease: 'power3.inOut',
      absolute: true,
      nested: true,
      scale: true,
      prune: true,
      onComplete: () => { layoutAnimation = null; }
    });
  }
  document.querySelector('#channel-status').textContent = `${channelNames[channel]} 편집 예시를 보고 있습니다.`;
  window.__kottoMotion.channel = channel;
}

channelButtons.forEach(button => button.addEventListener('click', () => setChannel(button.dataset.channel)));
channelButtons.forEach((button, index) => button.addEventListener('keydown', event => {
  if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
  event.preventDefault();
  const next = (index + (event.key === 'ArrowRight' ? 1 : -1) + channelButtons.length) % channelButtons.length;
  channelButtons[next].focus();
  setChannel(channelButtons[next].dataset.channel);
}));

const media = gsap.matchMedia();

media.add({ desktop: '(min-width: 701px)', mobile: '(max-width: 700px)', reduce: '(prefers-reduced-motion: reduce)' }, context => {
  const { desktop, reduce } = context.conditions;
  const strips = gsap.utils.toArray('.c-story-strip');
  const back = document.querySelector('.c-story-back');
  if (reduce) {
    window.__kottoMotion.progress = 1;
    return;
  }

  if (desktop) {
    gsap.set(back, { clipPath: 'inset(0% 0% 0% 0%)' });
    const story = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '.c-story',
        start: 'top top',
        end: () => `+=${Math.max(1, document.querySelector('.c-story').offsetHeight - document.querySelector('.c-story-stage').offsetHeight)}`,
        scrub: 0.65,
        invalidateOnRefresh: true,
        onUpdate: self => { window.__kottoMotion.progress = Number(self.progress.toFixed(4)); }
      }
    });
    story.to('.c-story-strip span', { scaleY: 1, duration: 0.25 }, 0)
      .to('.c-scroll-instruction', { autoAlpha: 0, duration: 0.12 }, 0)
      .to(strips, {
        clipPath: index => index % 2 === 0 ? 'inset(0% 0% 100% 0%)' : 'inset(100% 0% 0% 0%)',
        duration: 0.55,
        stagger: 0.1,
        ease: 'power2.inOut'
      }, 0.18)
      // Each reading column appears only after its text area is clear.
      // This prevents half-visible Korean words during the scene change.
      .from('.c-work-intro', { opacity: 0, duration: 0.2, ease: 'power1.out' }, 0.68)
      .from('.c-work-list', { opacity: 0, duration: 0.22, ease: 'power1.out' }, 1.04)
      .to('.c-story-progress span', { scaleX: 1, duration: 1.18 }, 0)
      .to({}, { duration: 0.15 });
  } else {
    // Touch gets a short native-scroll typesetting gesture and an unpinned,
    // readable service section. No scroll trap, no hidden content.
    gsap.timeline({
      scrollTrigger: {
        trigger: '.c-story-front', start: 'top 88%', end: 'bottom 12%', scrub: 0.3,
        onUpdate: self => { window.__kottoMotion.progress = Number(self.progress.toFixed(4)); }
      }
    }).fromTo('.c-story-strip span', { scaleY: 1.6 }, { scaleY: 1, duration: 1 }, 0)
      .to('.c-story-progress span', { scaleX: 1, duration: 1 }, 0);
  }
});

const fontReady = document.fonts?.ready ?? Promise.resolve();
fontReady.then(() => ScrollTrigger.refresh());
reducedMotion.addEventListener('change', () => layoutAnimation?.progress(1));

window.addEventListener('pagehide', event => {
  if (event.persisted) return;
  layoutAnimation?.kill();
  media.revert();
});
