import { evidencePortfolio, evidenceReviews, evidenceInquiries } from './evidence-data.js';

const escape = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const pad = value => String(value).padStart(2, '0');
const image = (item, extra = '') => `<img src="${escape(item.src)}" width="${item.width}" height="${item.height}" alt="${escape(item.alt)}" loading="lazy" decoding="async" ${extra}>`;
const groups = { portfolio: evidencePortfolio, review: evidenceReviews, inquiry: evidenceInquiries };

export function renderPortfolio({ compact = false } = {}) {
  return `<section class="ev-portfolio ${compact ? 'ev-compact' : ''}" id="selected-work" aria-labelledby="ev-work-heading" data-ev-portfolio>
    <div class="ev-portfolio-stage">
      <header class="ev-heading"><div><p class="ev-kicker">홈페이지형 블로그 제작 사례</p><h2 id="ev-work-heading">안경원마다, <br>다른 첫인상.</h2></div><p class="ev-heading-note">실제로 만든 화면을 살펴보세요.<br>이미지를 누르면 크게 볼 수 있습니다.</p></header>
      <div class="ev-exhibition">
        <div class="ev-projects" aria-label="제작 사례" tabindex="0">
          ${evidencePortfolio.map((item, i) => `<figure class="ev-project ${i === 0 ? 'is-active' : ''}" data-ev-project="${i}">
            <a class="ev-project-image" href="${escape(item.src)}" data-evidence-open="portfolio" data-evidence-index="${i}" aria-label="${escape(item.title)} 원본 이미지 크게 보기">${image(item)}<span class="ev-enlarge" aria-hidden="true">크게 보기 <span>＋</span></span></a>
            <figcaption><span class="ev-project-name">${escape(item.name || item.title)}</span><span>홈페이지형 블로그</span><span>${pad(i + 1)} / ${pad(evidencePortfolio.length)}</span></figcaption>
          </figure>`).join('')}
        </div>
        <div class="ev-work-controls"><div class="ev-work-rail" aria-label="제작 사례 선택">${evidencePortfolio.map((item, i) => `<button type="button" class="ev-work-thumb" data-ev-select="${i}" aria-label="${escape(item.name || item.title)} 보기" aria-pressed="${i === 0}">${image({ ...item, alt: '' })}<span>${pad(i + 1)}</span></button>`).join('')}</div><div class="ev-work-arrows"><button type="button" data-ev-prev aria-label="이전 제작 사례">←</button><button type="button" data-ev-next aria-label="다음 제작 사례">→</button></div></div>
      </div>
      <div class="ev-work-bottom"><p>각 안경원의 소개와 콘텐츠를 한곳에.</p><a href="service-hpblog.html">홈페이지형 블로그 알아보기 <span aria-hidden="true">↗</span></a></div>
      <div class="ev-work-progress" aria-hidden="true"><span></span></div>
    </div>
  </section>`;
}

export function renderVoices({ compact = false } = {}) {
  const cards = (items, kind) => items.map((item, i) => `<figure class="ev-voice" data-ev-voice="${kind}" data-ev-order="${i}">
    <a href="${escape(item.src)}" data-evidence-open="${kind}" data-evidence-index="${i}" aria-label="${escape(item.title)} 원본 이미지 크게 보기">${image(item)}<span class="ev-voice-expand" aria-hidden="true">＋</span></a>
    <figcaption><span>${escape(item.title)}</span><span>원문 보기 ↗</span></figcaption>
  </figure>`).join('');
  return `<section class="ev-voices ${compact ? 'ev-compact' : ''}" id="client-voices" aria-labelledby="ev-voices-heading" data-ev-voices>
    <header class="ev-heading"><div><p class="ev-kicker">고객과 나눈 대화</p><h2 id="ev-voices-heading">함께 일한 뒤,<br>남겨주신 말들.</h2></div><div class="ev-voices-intro"><p>함께 만든 콘텐츠에 대해<br>고객이 직접 남겨주신 반응입니다.</p><span>보내주신 대화 원문을 그대로 전합니다.</span></div></header>
    <div class="ev-voices-bar"><div class="ev-voice-tabs" aria-label="대화 자료 분류"><button type="button" data-ev-filter="review" aria-pressed="true">고객 반응 <span>${evidenceReviews.length}</span></button><button type="button" data-ev-filter="inquiry" aria-pressed="false">상담 문의 <span>${evidenceInquiries.length}</span></button></div><p>이미지를 누르면 원문을 읽을 수 있습니다.</p></div>
    <div class="ev-voice-wall">${cards(evidenceReviews, 'review')}${cards(evidenceInquiries, 'inquiry')}</div>
    <div class="ev-voices-bottom"><p>개별 고객의 경험이며,<br>모든 안경원에 같은 결과를 약속하지 않습니다.</p><button class="ev-show-more" type="button" data-ev-more aria-expanded="false">고객 반응 ${evidenceReviews.length}개 모두 보기 <span aria-hidden="true">＋</span></button></div>
    <p class="ev-sr-only" data-ev-status aria-live="polite"></p>
  </section>`;
}

export function renderEvidenceDialog() {
  return `<dialog class="ev-dialog" id="kotto-evidence-dialog" aria-labelledby="ev-dialog-title"><div class="ev-dialog-header"><div><span class="ev-dialog-category"></span><h2 id="ev-dialog-title"></h2></div><button type="button" data-ev-close aria-label="이미지 닫기">닫기 <span aria-hidden="true">×</span></button></div><div class="ev-dialog-view" tabindex="0" aria-label="원본 이미지, 확대 시 스크롤하여 읽기"><img class="ev-dialog-image" alt=""></div><div class="ev-dialog-footer"><div class="ev-dialog-origin"><p data-ev-caption></p><span data-ev-counter></span></div><div class="ev-dialog-actions"><button type="button" data-ev-zoom aria-pressed="false">확대해서 읽기</button><button type="button" data-ev-dialog-prev aria-label="이전 이미지">←</button><button type="button" data-ev-dialog-next aria-label="다음 이미지">→</button></div></div></dialog>`;
}

export function initEvidence({ gsap, ScrollTrigger, Flip }) {
  const disposers = [];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 800px)');
  const listen = (target, type, handler, options) => { target.addEventListener(type, handler, options); disposers.push(() => target.removeEventListener(type, handler, options)); };
  const animations = new Set();
  const mm = gsap.matchMedia();
  disposers.push(() => mm.revert());

  document.querySelectorAll('[data-ev-portfolio]').forEach(section => {
    const viewport = section.querySelector('.ev-projects');
    const projects = [...section.querySelectorAll('[data-ev-project]')];
    const thumbs = [...section.querySelectorAll('[data-ev-select]')];
    const projectOffset = project => project.offsetLeft - parseFloat(getComputedStyle(viewport).paddingLeft || 0);
    let active = 0, timeline, lastScrollStep = -1, manualUntil = 0;
    section.classList.add('ev-ready');
    function updateAccess() {
      projects.forEach((project, i) => {
        project.classList.toggle('is-active', i === active);
        project.inert = !mobile.matches && i !== active;
      });
      thumbs.forEach((thumb, i) => thumb.setAttribute('aria-pressed', String(i === active)));
      if (window.__kottoMotion) window.__kottoMotion.evidenceProject = active;
    }
    function select(next, { native = false, user = false } = {}) {
      next = (next + projects.length) % projects.length;
      if (next === active) return;
      if (user) manualUntil = performance.now() + 1800;
      const previous = projects[active], incoming = projects[next];
      const direction = next > active ? 1 : -1;
      timeline?.kill();
      gsap.set(projects, { clearProps: 'clipPath,transform,zIndex,visibility' });
      gsap.set(projects.map(project => project.querySelector('img')), { clearProps: 'transform' });
      active = next;
      updateAccess();
      if (mobile.matches) {
        if (!native) viewport.scrollTo({ left: projectOffset(incoming), behavior: reduced.matches ? 'instant' : 'smooth' });
      } else if (!reduced.matches) {
        gsap.set(previous, { visibility: 'visible', zIndex: 1 });
        gsap.set(incoming, { zIndex: 2 });
        timeline = gsap.timeline({ onComplete: () => gsap.set(projects, { clearProps: 'clipPath,transform,zIndex,visibility' }) })
          .fromTo(incoming, { clipPath: direction > 0 ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .7, ease: 'power3.inOut' })
          .fromTo(incoming.querySelector('img'), { xPercent: direction * 3 }, { xPercent: 0, duration: .8, ease: 'power3.out', clearProps: 'transform' }, 0);
      }
    }
    thumbs.forEach((thumb, i) => listen(thumb, 'click', () => select(i, { user: true })));
    listen(section.querySelector('[data-ev-prev]'), 'click', () => select(active - 1, { user: true }));
    listen(section.querySelector('[data-ev-next]'), 'click', () => select(active + 1, { user: true }));
    listen(viewport, 'keydown', event => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault(); select(active + (event.key === 'ArrowRight' ? 1 : -1), { user: true });
    });
    let raf;
    listen(viewport, 'scroll', () => {
      if (!mobile.matches || raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const nearest = projects.reduce((best, project, i) => Math.abs(projectOffset(project) - viewport.scrollLeft) < Math.abs(projectOffset(projects[best]) - viewport.scrollLeft) ? i : best, 0);
        select(nearest, { native: true });
      });
    }, { passive: true });
    listen(mobile, 'change', () => { timeline?.kill(); gsap.set(projects, { clearProps: 'all' }); gsap.set(projects.map(project => project.querySelector('img')), { clearProps: 'transform' }); updateAccess(); if (mobile.matches) viewport.scrollLeft = projectOffset(projects[active]); });
    mm.add('(min-width: 801px) and (prefers-reduced-motion: no-preference)', () => {
      if (section.classList.contains('ev-compact')) return;
      const trigger = ScrollTrigger.create({ trigger: section, start: 'top top+=88', end: 'bottom bottom', invalidateOnRefresh: true,
        onUpdate(self) {
          section.style.setProperty('--ev-progress', self.progress);
          const step = Math.min(2, Math.floor(self.progress * 3));
          if (step !== lastScrollStep) { lastScrollStep = step; if (performance.now() > manualUntil) select(step); }
        },
      });
      return () => { trigger.kill(); timeline?.kill(); gsap.set(projects, { clearProps: 'clipPath,transform,zIndex,visibility' }); gsap.set(projects.map(project => project.querySelector('img')), { clearProps: 'transform' }); };
    });
    updateAccess();
    disposers.push(() => { timeline?.kill(); cancelAnimationFrame(raf); section.classList.remove('ev-ready'); projects.forEach(project => { project.inert = false; }); });
  });

  document.querySelectorAll('[data-ev-voices]').forEach(section => {
    const cards = [...section.querySelectorAll('[data-ev-voice]')];
    const tabs = [...section.querySelectorAll('[data-ev-filter]')];
    const more = section.querySelector('[data-ev-more]');
    const status = section.querySelector('[data-ev-status]');
    let category = 'review', expanded = false, animation;
    function arrange(animate = true) {
      animation?.kill();
      const state = animate && !reduced.matches && !mobile.matches && Flip ? Flip.getState(cards.filter(card => !card.hidden)) : null;
      cards.forEach(card => { card.hidden = card.dataset.evVoice !== category || (!expanded && Number(card.dataset.evOrder) >= 6); });
      tabs.forEach(tab => tab.setAttribute('aria-pressed', String(tab.dataset.evFilter === category)));
      const name = category === 'review' ? '고객 반응' : '상담 문의';
      more.innerHTML = expanded ? '접어 두기 <span aria-hidden="true">−</span>' : `${name} ${groups[category].length}개 모두 보기 <span aria-hidden="true">＋</span>`;
      more.setAttribute('aria-expanded', String(expanded));
      status.textContent = `${name} ${expanded ? groups[category].length : Math.min(6, groups[category].length)}개 표시`;
      if (state) animation = Flip.from(state, { duration: .65, ease: 'power3.inOut', absolute: false, onComplete: () => ScrollTrigger.refresh() });
      else ScrollTrigger.refresh();
      if (window.__kottoMotion) window.__kottoMotion.evidenceCategory = category;
    }
    tabs.forEach(tab => listen(tab, 'click', () => { if (category === tab.dataset.evFilter) return; category = tab.dataset.evFilter; expanded = false; arrange(); }));
    listen(more, 'click', () => {
      expanded = !expanded;
      if (!expanded) section.querySelector('.ev-voices-bar').scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth', block: 'start' });
      arrange();
    });
    arrange(false);
    section.classList.add('ev-ready');
    disposers.push(() => { animation?.kill(); cards.forEach(card => { card.hidden = false; }); });
  });

  const dialog = document.getElementById('kotto-evidence-dialog');
  if (dialog) {
    const fullImage = dialog.querySelector('.ev-dialog-image');
    const view = dialog.querySelector('.ev-dialog-view');
    const zoom = dialog.querySelector('[data-ev-zoom]');
    let category = 'portfolio', index = 0, opener, zoomed = false;
    function paint() {
      const items = groups[category], item = items[index];
      zoomed = false;
      dialog.classList.remove('is-zoomed');
      zoom.setAttribute('aria-pressed', 'false');
      zoom.textContent = '확대해서 읽기';
      dialog.querySelector('.ev-dialog-category').textContent = category === 'portfolio' ? '홈페이지형 블로그 제작 사례' : category === 'review' ? '고객 반응' : '상담 문의';
      dialog.querySelector('#ev-dialog-title').textContent = item.name || item.title;
      fullImage.src = window.__KOTTO_ASSETS__?.[item.src] || item.src;
      fullImage.alt = item.alt;
      fullImage.width = item.width;
      fullImage.height = item.height;
      dialog.querySelector('[data-ev-caption]').textContent = item.caption || '기존 고또마케팅 홈페이지에 공개된 이미지';
      dialog.querySelector('[data-ev-counter]').textContent = `${pad(index + 1)} / ${pad(items.length)}`;
      view.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    function move(offset) { index = (index + offset + groups[category].length) % groups[category].length; paint(); }
    listen(document, 'click', event => {
      const link = event.target.closest('[data-evidence-open]');
      if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); category = link.dataset.evidenceOpen; index = Number(link.dataset.evidenceIndex); opener = link;
      paint(); dialog.showModal(); dialog.querySelector('[data-ev-close]').focus({ preventScroll: true });
      if (!reduced.matches) {
        const entry = gsap.fromTo(dialog, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .25, ease: 'power2.out', clearProps: 'opacity,transform', onComplete: () => animations.delete(entry) });
        animations.add(entry);
      }
    });
    listen(dialog.querySelector('[data-ev-close]'), 'click', () => dialog.close());
    listen(dialog.querySelector('[data-ev-dialog-prev]'), 'click', () => move(-1));
    listen(dialog.querySelector('[data-ev-dialog-next]'), 'click', () => move(1));
    listen(zoom, 'click', () => {
      zoomed = !zoomed; dialog.classList.toggle('is-zoomed', zoomed); zoom.setAttribute('aria-pressed', String(zoomed)); zoom.textContent = zoomed ? '전체 이미지 보기' : '확대해서 읽기';
      view.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    });
    listen(dialog, 'close', () => { opener?.focus({ preventScroll: true }); });
    listen(dialog, 'click', event => { if (event.target === dialog) dialog.close(); });
    listen(dialog, 'keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { if (zoomed && event.target === view) return; event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1); }
      if (event.key !== 'Tab') return;
      const controls = [...dialog.querySelectorAll('button:not([disabled]),[tabindex="0"]')].filter(control => control.getClientRects().length);
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
  }
  return () => { disposers.reverse().forEach(dispose => dispose()); animations.forEach(animation => animation.kill()); };
}
