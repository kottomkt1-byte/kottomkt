import './evidence.css';
import './brand-video.css';
import { initBrandVideo } from './brand-video.js';
import { initHome } from './home.js';
import './achievements.css';
import { initAchievements } from './achievements.js';
import { initEvidence } from './evidence.js';
import { Flip } from 'gsap/Flip';
import './global.css';
import './home.css';
import './services.css';
import './company.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { initServices } from './services.js';
import { initCompany } from './company.js';

gsap.registerPlugin(ScrollTrigger, SplitText, Flip);
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const cleanups = [];
window.__kottoMotion = { page: document.body.dataset.page, heroProgress: 0, reduced: reduced.matches };

const header = document.querySelector('.site-header');
let scrollPending = false;
function updateHeader() { header.classList.toggle('is-scrolled', scrollY > 12); scrollPending = false; }
function onScroll() { if (!scrollPending) { scrollPending = true; requestAnimationFrame(updateHeader); } }
window.addEventListener('scroll', onScroll, { passive: true }); updateHeader();
cleanups.push(() => window.removeEventListener('scroll', onScroll));

const menu = document.querySelector('#site-menu');
const openMenu = document.querySelector('[data-menu-open]');
const closeMenu = document.querySelector('[data-menu-close]');
let menuAnimation;
openMenu.addEventListener('click', () => {
  menuAnimation?.kill(); menu.showModal(); openMenu.setAttribute("aria-expanded", "true");
  if (!reduced.matches) menuAnimation = gsap.timeline()
    .fromTo(menu.querySelectorAll('.menu-chapters a'), { clipPath: 'inset(0% 0% 100% 0%)', y: 16 }, { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: .65, stagger: .055, ease: 'power3.out', clearProps: 'clipPath,transform' })
    .fromTo(menu.querySelector('.menu-services'), { opacity: .2 }, { opacity: 1, duration: .4, clearProps: 'opacity' }, .15);
});
closeMenu.addEventListener('click', () => menu.close());
menu.addEventListener('close', () => {
  menuAnimation?.kill();
  gsap.set(menu.querySelectorAll('.menu-chapters a,.menu-services'), { clearProps: 'transform,clipPath,opacity' });
  openMenu.setAttribute('aria-expanded', 'false');
  openMenu.focus({ preventScroll: true });
});
menu.addEventListener('keydown', event => {
  if (event.key !== 'Tab') return;
  const controls = [...menu.querySelectorAll('a[href],button:not([disabled])')].filter(el => el.getClientRects().length);
  const first = controls[0], last = controls.at(-1);
  if (event.shiftKey && (document.activeElement === first || !menu.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && (document.activeElement === last || !menu.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
});
document.querySelector('[data-top]').addEventListener('click', () => { window.scrollTo({ top: 0, behavior: reduced.matches ? 'instant' : 'smooth' }); header.querySelector('a').focus({ preventScroll: true }); });

// Keep true anchors and browser history, including keyboard navigation and new tabs.
document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
  const target = document.getElementById(link.hash.slice(1));
  if (!target) return;
  event.preventDefault();
  target.scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth', block: 'start' });
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex','-1');
  target.focus({ preventScroll: true });
  if (!window.__KOTTO_STANDALONE__) history.replaceState(null, '', link.hash);
}));

cleanups.push(initServices({ gsap, ScrollTrigger }));
cleanups.push(initCompany({ gsap, ScrollTrigger }));
cleanups.push(initEvidence({ gsap, ScrollTrigger, Flip }));
cleanups.push(initBrandVideo());
cleanups.push(initHome({ gsap, ScrollTrigger }));
cleanups.push(initAchievements({ gsap, ScrollTrigger }));

const mm = gsap.matchMedia();
cleanups.push(() => mm.revert());
document.fonts.ready.then(() => {
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const splitInstances = [];
    // Only substantial headings are split. Korean phrases keep their natural line breaks.
    document.querySelectorAll('[data-split], [data-split-title], h1[data-reveal]').forEach(element => {
      const isHero = element.tagName === 'H1';
      const instance = SplitText.create(element, {
        type: 'lines', mask: 'lines', autoSplit: true, aria: 'auto',
        onSplit(self) {
          return gsap.from(self.lines, {
            yPercent: 108, rotation: .8, transformOrigin: '0% 100%', duration: isHero ? 1.15 : .95,
            stagger: .12, ease: 'power3.out',
            ...(isHero ? { delay: .06 } : { scrollTrigger: { trigger: element, start: 'top 88%', once: true } }),
          });
        },
      });
      splitInstances.push(instance);
    });
    return () => splitInstances.forEach(instance => instance.revert());
  });
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const statement = document.querySelector('[data-reading]');
    if (!statement) return;
    const split = SplitText.create(statement, { type: 'words', aria: 'auto' });
    gsap.fromTo(split.words, { opacity: .55 }, { opacity: 1, stagger: .2, ease: 'none', scrollTrigger: { trigger: statement, start: 'top 85%', end: 'bottom 40%', scrub: .3 } });
    return () => split.revert();
  });
  ScrollTrigger.refresh();
  document.documentElement.dataset.ready = 'true';
});

document.querySelectorAll('img').forEach(img => { if (!img.complete) img.addEventListener('load', () => ScrollTrigger.refresh(), { once: true }); });
window.addEventListener('pageshow', event => { if (event.persisted) { menu.close(); ScrollTrigger.refresh(); updateHeader(); } });
window.addEventListener('pagehide', event => { if (!event.persisted) { menuAnimation?.kill(); cleanups.forEach(cleanup => cleanup?.()); } });
