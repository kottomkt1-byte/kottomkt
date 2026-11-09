/** Silent ambient film, plus an explicitly opened brand film with native controls. */
const asset = value => typeof window === 'undefined' ? value : (window.__KOTTO_ASSETS__?.[value] || value);
const safe = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function renderBrandVideo({ id = 'kotto-brand-video', variant = 'feature' } = {}) {
  const name = safe(id);
  const mode = variant === 'hero' ? 'hero' : 'feature';
  return `<figure class="brand-video brand-video--${mode}" data-brand-video>
    <video id="${name}" class="brand-video-player" muted loop playsinline preload="none" aria-hidden="true" tabindex="-1"
      poster="${asset('films/kotto-studio-wide-poster.webp')}"
      data-video-desktop="films/kotto-studio-wide.mp4" data-video-mobile="films/kotto-seen-hero-mobile.mp4" data-video-poster-mobile="films/kotto-seen-poster-mobile.webp"></video>
    <div class="brand-video-actions">
      <button class="brand-video-control" type="button" aria-controls="${name}" aria-label="브랜드 영상 재생" aria-pressed="false" hidden>
        <span class="brand-video-control-icon" aria-hidden="true"><i></i><i></i></span><span data-video-label>영상 재생</span>
      </button>
      <a class="brand-video-open" data-brand-video-open href="${asset('films/kotto-industry-brand-film.mp4')}" target="_blank" rel="noopener" aria-controls="${name}-dialog">
        <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><circle cx="10" cy="10" r="8.5" fill="none" stroke="currentColor"/><path d="m8 6 6 4-6 4Z" fill="currentColor"/></svg>브랜드 필름 보기
      </a>
    </div>
    <figcaption class="brand-video-caption">고또마케팅 브랜드 필름</figcaption>
    <dialog class="brand-video-dialog" id="${name}-dialog" aria-labelledby="${name}-film-title">
      <div class="brand-video-dialog-panel">
        <header class="brand-video-dialog-header"><h2 id="${name}-film-title">고또마케팅 브랜드 필름</h2><button class="brand-video-dialog-close" data-brand-video-close type="button" aria-label="브랜드 필름 닫기">닫기 <span aria-hidden="true">×</span></button></header>
        <video class="brand-video-full-player" controls playsinline preload="none" poster="${asset('films/kotto-seen-poster.webp')}" data-video-full="films/kotto-industry-brand-film.mp4" aria-label="고또마케팅 브랜드 필름, 음악 포함"></video>
        <footer class="brand-video-dialog-footer"><p data-brand-video-error role="status" hidden>영상을 불러오지 못했습니다. 새 창에서 다시 열어 주세요.</p><a data-brand-video-fallback href="${asset('films/kotto-industry-brand-film.mp4')}" target="_blank" rel="noopener">새 창에서 영상 보기 <span aria-hidden="true">↗</span></a></footer>
      </div>
    </dialog>
  </figure>`;
}

export function initBrandVideo() {
  const cleanups = [...document.querySelectorAll('[data-brand-video]')].map(figure => {
    const video = figure.querySelector('.brand-video-player');
    const button = figure.querySelector('.brand-video-control');
    const label = figure.querySelector('[data-video-label]');
    const openButton = figure.querySelector('[data-brand-video-open]');
    const dialog = figure.querySelector('.brand-video-dialog');
    const closeButton = figure.querySelector('[data-brand-video-close]');
    const film = figure.querySelector('.brand-video-full-player');
    const filmError = figure.querySelector('[data-brand-video-error]');
    const fallback = figure.querySelector('[data-brand-video-fallback]');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const narrow = matchMedia('(max-width: 760px)');
    const connection = navigator.connection;
    if (narrow.matches) video.poster = asset(video.dataset.videoPosterMobile);
    let visible = false;
    let manual = false;
    let userPaused = false;
    let disposed = false;
    let pending = false;
    let failed = false;
    let resumeAfterFilm = false;
    let resumeWhenSettled = false;
    let backdropPointerDown = false;
    let opener;
    const allowed = () => !reduced.matches && !connection?.saveData;
    const state = { source: 'poster', mode: allowed() ? 'ambient' : 'poster', playing: false, filmOpen: false };
    figure.brandVideo = state;
    button.hidden = false;
    openButton.href = fallback.href = asset(film.dataset.videoFull);
    if (typeof dialog.showModal === 'function') openButton.setAttribute('aria-haspopup', 'dialog');

    function update() {
      const playing = !video.paused && !video.ended;
      state.playing = playing;
      figure.classList.toggle('is-playing', playing);
      button.setAttribute('aria-pressed', String(playing));
      button.setAttribute('aria-label', playing ? '브랜드 영상 일시 정지' : failed ? '브랜드 영상 다시 재생' : '브랜드 영상 재생');
      label.textContent = playing ? '일시 정지' : failed ? '영상 다시 재생' : '영상 재생';
    }
    function ensureSource() {
      if (video.hasAttribute('src')) return;
      failed = false;
      const key = narrow.matches ? video.dataset.videoMobile : video.dataset.videoDesktop;
      video.src = asset(key);
      video.muted = true;
      state.source = narrow.matches ? 'mobile' : 'desktop';
      video.load();
    }
    function play() {
      if (pending || disposed || state.filmOpen || document.hidden || !visible || userPaused) return;
      if (!manual && !allowed()) return;
      ensureSource();
      pending = true;
      video.play()?.catch(() => {
        // Autoplay restrictions are a normal state: the explicit play control remains.
        update();
      }).finally(() => {
        pending = false;
        if (disposed || state.filmOpen || !visible || document.hidden || userPaused || (!manual && !allowed())) video.pause();
        update();
        if (resumeWhenSettled) {
          resumeWhenSettled = false;
          sync();
        }
      });
    }
    function sync() {
      if (!state.filmOpen && visible && !document.hidden && !userPaused && (manual || allowed())) play();
      else video.pause();
      update();
    }
    function toggle() {
      if (!video.paused) {
        userPaused = true;
        video.pause();
      } else {
        manual = true;
        userPaused = false;
        visible = true;
        state.mode = 'manual';
        // Keep the initial play call within the user gesture on Safari.
        play();
      }
      update();
    }
    function preferenceChanged() {
      manual = false;
      state.mode = allowed() ? 'ambient' : 'poster';
      sync();
    }
    function error() {
      video.pause();
      video.removeAttribute('src');
      video.load();
      userPaused = true;
      failed = true;
      state.source = 'poster';
      update();
    }
    function stopFilm() {
      film.pause();
      film.removeAttribute('src');
      film.load();
      if (document.fullscreenElement && dialog.contains(document.fullscreenElement)) {
        document.exitFullscreen?.().catch(() => {});
      }
      if (film.webkitDisplayingFullscreen) film.webkitExitFullscreen?.();
    }
    function openFilm(event) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || typeof dialog.showModal !== 'function') return;
      if (dialog.open) { event.preventDefault(); return; }
      dialog.showModal();
      event.preventDefault();
      opener = event.currentTarget;
      if (!state.filmOpen) resumeAfterFilm = !video.paused || pending;
      state.filmOpen = true;
      sync();
      filmError.hidden = true;
      film.src = asset(film.dataset.videoFull);
      film.load();
      // Audible playback starts only from this explicit user gesture.
      film.play()?.catch(() => {});
      closeButton.focus({ preventScroll: true });
    }
    function closeFilm() {
      film.pause();
      if (dialog.open) dialog.close();
    }
    function filmClosed() {
      // A queued close event must not tear down a film opened again meanwhile.
      if (dialog.open) return;
      const shouldResume = resumeAfterFilm;
      resumeAfterFilm = false;
      state.filmOpen = false;
      stopFilm();
      if (disposed) return;
      if (opener?.isConnected) opener.focus({ preventScroll: true });
      if (shouldResume) {
        // A pending autoplay promise can settle after a quick open/close.
        resumeWhenSettled = pending;
        sync();
      } else update();
    }
    function cancelFilm(event) {
      event.preventDefault();
      closeFilm();
    }
    function outsideDialog(event) {
      const rect = dialog.getBoundingClientRect();
      return event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom);
    }
    function backdropDown(event) { backdropPointerDown = outsideDialog(event); }
    function backdropClick(event) {
      if (backdropPointerDown && outsideDialog(event)) closeFilm();
      backdropPointerDown = false;
    }
    function filmFailed() { filmError.hidden = false; }
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting && entries[0].intersectionRatio > 0.15;
      sync();
    }, { threshold: [0, 0.15, 0.4] });
    observer.observe(figure);
    button.addEventListener('click', toggle);
    openButton.addEventListener('click', openFilm);
    closeButton.addEventListener('click', closeFilm);
    dialog.addEventListener('cancel', cancelFilm);
    dialog.addEventListener('close', filmClosed);
    dialog.addEventListener('pointerdown', backdropDown);
    dialog.addEventListener('click', backdropClick);
    film.addEventListener('error', filmFailed);
    video.addEventListener('playing', update);
    video.addEventListener('pause', update);
    video.addEventListener('error', error);
    reduced.addEventListener('change', preferenceChanged);
    connection?.addEventListener?.('change', preferenceChanged);
    document.addEventListener('visibilitychange', sync);
    return () => {
      disposed = true;
      observer.disconnect();
      video.pause();
      stopFilm();
      if (dialog.open) dialog.close();
      state.filmOpen = false;
      state.playing = false;
      button.removeEventListener('click', toggle);
      openButton.removeEventListener('click', openFilm);
      closeButton.removeEventListener('click', closeFilm);
      dialog.removeEventListener('cancel', cancelFilm);
      dialog.removeEventListener('close', filmClosed);
      dialog.removeEventListener('pointerdown', backdropDown);
      dialog.removeEventListener('click', backdropClick);
      film.removeEventListener('error', filmFailed);
      video.removeEventListener('playing', update);
      video.removeEventListener('pause', update);
      video.removeEventListener('error', error);
      reduced.removeEventListener('change', preferenceChanged);
      connection?.removeEventListener?.('change', preferenceChanged);
      document.removeEventListener('visibilitychange', sync);
    };
  });
  return () => cleanups.forEach(cleanup => cleanup());
}
