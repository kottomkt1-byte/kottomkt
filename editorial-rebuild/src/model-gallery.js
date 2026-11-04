const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const pad = value => String(value).padStart(2, '0');
const categoryName = value => value === 'optical' ? '안경테' : '선글라스';
const safeSource = value => {
  const source = String(value ?? '').trim();
  return source && !/[\u0000-\u001f]/.test(source) && (!/^[a-z][a-z0-9+.-]*:/i.test(source) || /^https?:\/\//i.test(source)) ? source : '';
};

/** Render supplied portfolio assets only; no placeholder images or invented cases. */
export function renderModelGallery(items = []) {
  const entries = items.filter(item => safeSource(item.src));
  if (!entries.length) return '';
  return `<section class="mg-gallery wrap" id="model-portfolio" aria-labelledby="mg-heading" data-mg-gallery>
    <div class="mg-section-line"><span>SELECTED PORTFOLIO</span><span>고또마케팅 모델 이미지 제작</span></div>
    <header class="mg-heading"><div><p>안경테·선글라스 모델 이미지 포트폴리오</p><h2 id="mg-heading">제품마다<br> <em>다른 표정.</em></h2></div><p class="mg-intro">제품의 디테일과 장면의 분위기를 함께.<br>이미지를 누르면 크게 살펴볼 수 있습니다.</p></header>
    <div class="mg-toolbar" data-mg-toolbar hidden><div class="mg-filters" role="group" aria-label="포트폴리오 종류"><button type="button" data-mg-filter="all" aria-pressed="true" aria-controls="mg-grid">전체</button><button type="button" data-mg-filter="sunglasses" aria-pressed="false" aria-controls="mg-grid">선글라스</button><button type="button" data-mg-filter="optical" aria-pressed="false" aria-controls="mg-grid">안경테</button></div><p class="mg-visible-count" data-mg-count></p></div>
    <div class="mg-grid" id="mg-grid">${entries.map((item, index) => {
      const source = safeSource(item.src);
      const original = safeSource(item.fullSrc) || source;
      const title = String(item.title || `${categoryName(item.category)} 모델 이미지 ${pad(index + 1)}`);
      const width = Math.max(1, Number.parseInt(item.width, 10) || 1122);
      const height = Math.max(1, Number.parseInt(item.height, 10) || 1402);
      return `<figure class="mg-item" data-mg-card data-mg-category="${item.category === 'optical' ? 'optical' : 'sunglasses'}" data-mg-position="${index % 8}">
        <a class="mg-image-link" href="${escape(original)}" data-mg-item="${index}" data-mg-id="${escape(item.id ?? index)}" data-mg-title="${escape(title)}" data-mg-detail="${escape(item.detail || '')}" aria-label="${escape(title)} 크게 보기" aria-haspopup="dialog" aria-controls="mg-dialog"><img src="${escape(source)}" width="${width}" height="${height}" alt="${escape(item.alt || title)}" loading="lazy" decoding="async"><span class="mg-enlarge" aria-hidden="true">크게 보기 <span>↗</span></span></a>
        <figcaption><span class="mg-item-number">${pad(index + 1)}</span><h3>${escape(title)}</h3><span class="mg-item-category">${categoryName(item.category)}</span></figcaption>
      </figure>`;
    }).join('')}</div>
    <div class="mg-more-wrap" data-mg-more-wrap hidden><button class="mg-more" type="button" data-mg-more aria-controls="mg-grid" aria-expanded="false"><span data-mg-more-label>포트폴리오 더 보기</span><span aria-hidden="true">＋</span></button></div>
    <p class="mg-empty" data-mg-empty hidden>이 분류의 포트폴리오는 준비 중입니다.</p>
    <p class="mg-sr-only" data-mg-status role="status" aria-live="polite" aria-atomic="true"></p>
    <dialog class="mg-dialog" id="mg-dialog" aria-labelledby="mg-dialog-title" aria-describedby="mg-dialog-detail"><div class="mg-dialog-shell"><header class="mg-dialog-header"><div><p data-mg-dialog-category></p><h2 id="mg-dialog-title"></h2></div><button class="mg-dialog-close" type="button" data-mg-close aria-label="포트폴리오 이미지 닫기" autofocus><span>닫기</span><span aria-hidden="true">×</span></button></header><div class="mg-dialog-image-wrap"><img class="mg-dialog-image" data-mg-dialog-image alt=""><p class="mg-image-error" data-mg-image-error hidden>이미지를 불러오지 못했습니다. 아래 원본 보기로 다시 확인해 주세요.</p></div><footer class="mg-dialog-footer"><div class="mg-dialog-caption"><p id="mg-dialog-detail"></p><p class="mg-dialog-count" data-mg-dialog-count aria-live="polite" aria-atomic="true"></p></div><div class="mg-dialog-actions"><a data-mg-original target="_blank" rel="noopener noreferrer">원본 보기 <span aria-hidden="true">↗</span></a><button type="button" data-mg-previous aria-label="이전 포트폴리오 이미지">←</button><button type="button" data-mg-next aria-label="다음 포트폴리오 이미지">→</button></div></footer></div></dialog>
  </section>`;
}

export function initModelGallery({ gsap, ScrollTrigger } = {}) {
  const gallery = document.querySelector('[data-mg-gallery]');
  if (!gallery) return;
  const cards = [...gallery.querySelectorAll('[data-mg-card]')];
  const links = cards.map(card => card.querySelector('[data-mg-item]'));
  const filters = [...gallery.querySelectorAll('[data-mg-filter]')];
  const toolbar = gallery.querySelector('[data-mg-toolbar]');
  const more = gallery.querySelector('[data-mg-more]');
  const moreWrap = gallery.querySelector('[data-mg-more-wrap]');
  const status = gallery.querySelector('[data-mg-status]');
  const dialog = gallery.querySelector('.mg-dialog');
  const dialogImage = gallery.querySelector('[data-mg-dialog-image]');
  const previous = gallery.querySelector('[data-mg-previous]');
  const next = gallery.querySelector('[data-mg-next]');
  const close = gallery.querySelector('[data-mg-close]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const disposers = [];
  let filter = 'all', limit = 8, active = 0, opener = null, revealTween = null, refreshFrame;
  const listen = (element, event, handler) => {
    element.addEventListener(event, handler);
    disposers.push(() => element.removeEventListener(event, handler));
  };
  const selectedCards = () => cards.filter(card => filter === 'all' || card.dataset.mgCategory === filter);
  const refresh = () => {
    cancelAnimationFrame(refreshFrame);
    refreshFrame = requestAnimationFrame(() => ScrollTrigger?.refresh());
  };
  function updateGrid({ animate = false, announce = true } = {}) {
    revealTween?.kill();
    if (gsap) gsap.set(cards, { clearProps: 'transform,opacity' });
    const selected = selectedCards();
    const visible = selected.slice(0, limit);
    cards.forEach(card => { card.hidden = !visible.includes(card); });
    visible.forEach((card, index) => { card.dataset.mgPosition = String(index % 8); });
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mgFilter === filter)));
    const remaining = selected.length - visible.length;
    moreWrap.hidden = remaining <= 0;
    more.setAttribute('aria-expanded', String(remaining <= 0));
    gallery.querySelector('[data-mg-more-label]').textContent = `포트폴리오 ${remaining}장 더 보기`;
    gallery.querySelector('[data-mg-count]').textContent = `${pad(visible.length)} / ${pad(selected.length)}`;
    gallery.querySelector('[data-mg-empty]').hidden = selected.length > 0;
    if (announce) status.textContent = `${filter === 'all' ? '전체' : categoryName(filter)} 포트폴리오 ${selected.length}장 중 ${visible.length}장을 표시합니다.`;
    if (animate && gsap && !reduced.matches && visible.length) {
      revealTween = gsap.fromTo(visible, { opacity: .3, y: 14 }, { opacity: 1, y: 0, duration: .4, stagger: .025, ease: 'power2.out', clearProps: 'transform,opacity' });
    }
    refresh();
    return visible;
  }
  function showImage(index) {
    const selected = selectedCards();
    if (!selected.length) return;
    active = (index + selected.length) % selected.length;
    const card = selected[active], link = card.querySelector('[data-mg-item]'), thumb = link.querySelector('img');
    dialogImage.alt = thumb.alt;
    dialogImage.width = thumb.width || Number(thumb.getAttribute('width'));
    dialogImage.height = thumb.height || Number(thumb.getAttribute('height'));
    gallery.querySelector('[data-mg-image-error]').hidden = true;
    dialogImage.src = link.href;
    gallery.querySelector('#mg-dialog-title').textContent = link.dataset.mgTitle;
    gallery.querySelector('[data-mg-dialog-category]').textContent = `${categoryName(card.dataset.mgCategory)} 모델 이미지`;
    gallery.querySelector('#mg-dialog-detail').textContent = link.dataset.mgDetail || '고또마케팅 이미지 포트폴리오';
    gallery.querySelector('[data-mg-dialog-count]').textContent = `${pad(active + 1)} / ${pad(selected.length)}`;
    gallery.querySelector('[data-mg-original]').href = link.href;
    previous.disabled = selected.length < 2;
    next.disabled = selected.length < 2;
  }
  filters.forEach(button => listen(button, 'click', () => {
    if (filter === button.dataset.mgFilter) return;
    filter = button.dataset.mgFilter; limit = 8;
    updateGrid({ animate: true });
  }));
  listen(more, 'click', () => {
    const firstNew = selectedCards()[limit];
    limit = Infinity;
    updateGrid();
    if (firstNew) firstNew.querySelector('[data-mg-item]').focus({ preventScroll: true });
  });
  links.forEach(link => listen(link, 'click', event => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0 || typeof dialog.showModal !== 'function') return;
    event.preventDefault();
    opener = link;
    showImage(selectedCards().indexOf(link.closest('[data-mg-card]')));
    dialog.showModal();
    close.focus({ preventScroll: true });
  }));
  listen(close, 'click', () => dialog.close());
  listen(previous, 'click', () => showImage(active - 1));
  listen(next, 'click', () => showImage(active + 1));
  listen(dialogImage, 'error', () => { gallery.querySelector('[data-mg-image-error]').hidden = false; });
  listen(dialog, 'close', () => {
    if (opener?.isConnected && !opener.closest('[hidden]')) opener.focus({ preventScroll: true });
    dialogImage.removeAttribute('src');
    opener = null;
  });
  listen(dialog, 'click', event => { if (event.target === dialog) dialog.close(); });
  listen(dialog, 'keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); showImage(active + (event.key === 'ArrowRight' ? 1 : -1));
    }
    if (event.key !== 'Tab') return;
    const controls = [...dialog.querySelectorAll('button:not(:disabled),a[href]')].filter(element => element.getClientRects().length);
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  toolbar.hidden = false;
  gallery.classList.add('mg-enhanced');
  updateGrid({ announce: false });
  cards.forEach(card => {
    const image = card.querySelector('img');
    if (!image.complete) listen(image, 'load', refresh);
  });
  return () => {
    revealTween?.kill(); cancelAnimationFrame(refreshFrame);
    disposers.forEach(dispose => dispose());
    if (dialog.open) dialog.close();
    cards.forEach(card => { card.hidden = false; });
    if (gsap) gsap.set(cards, { clearProps: 'transform,opacity' });
    toolbar.hidden = true; moreWrap.hidden = true;
    gallery.classList.remove('mg-enhanced');
  };
}
