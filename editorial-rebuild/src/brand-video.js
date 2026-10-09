/** A silent, authored brand film. Sources load only when motion is permitted. */
const asset = value => typeof window === 'undefined' ? value : (window.__KOTTO_ASSETS__?.[value] || value);
const safe = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function renderBrandVideo({ id = 'kotto-brand-video', variant = 'feature' } = {}) {
  const name = safe(id);
  const mode = variant === 'hero' ? 'hero' : 'feature';
  return `<figure class="brand-video brand-video--${mode}" data-brand-video>
    <video id="${name}" class="brand-video-player" muted loop playsinline preload="none" aria-hidden="true" tabindex="-1"
      poster="${asset('films/kotto-studio-poster.webp')}"
      data-video-desktop="films/kotto-studio-desktop.mp4" data-video-mobile="films/kotto-studio-mobile.mp4" data-video-poster-mobile="films/kotto-studio-poster-mobile.webp"></video>
    <button class="brand-video-control" type="button" aria-controls="${name}" aria-label="브랜드 영상 재생" aria-pressed="false" hidden>
      <span class="brand-video-control-icon" aria-hidden="true"><i></i><i></i></span><span data-video-label>영상 재생</span>
    </button>
    <figcaption class="brand-video-caption">고또마케팅 브랜드 필름</figcaption>
  </figure>`;
}

export function initBrandVideo() {
  const cleanups = [...document.querySelectorAll('[data-brand-video]')].map(figure => {
    const video = figure.querySelector('video');
    const button = figure.querySelector('button');
    const label = figure.querySelector('[data-video-label]');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const narrow = matchMedia('(max-width: 700px)');
    const connection = navigator.connection;
    if (narrow.matches) video.poster = asset(video.dataset.videoPosterMobile);
    let visible = false;
    let manual = false;
    let userPaused = false;
    let disposed = false;
    let pending = false;
    let failed = false;
    const allowed = () => !reduced.matches && !connection?.saveData;
    const state = { source: 'poster', mode: allowed() ? 'ambient' : 'poster', playing: false };
    figure.brandVideo = state;
    button.hidden = false;

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
      if (pending || disposed || document.hidden || !visible || userPaused) return;
      if (!manual && !allowed()) return;
      ensureSource();
      pending = true;
      video.play()?.catch(() => {
        // Autoplay restrictions are a normal state: the explicit play control remains.
        update();
      }).finally(() => {
        pending = false;
        if (disposed || !visible || document.hidden || userPaused || (!manual && !allowed())) video.pause();
        update();
      });
    }
    function sync() {
      if (visible && !document.hidden && !userPaused && (manual || allowed())) play();
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
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting && entries[0].intersectionRatio > 0.15;
      sync();
    }, { threshold: [0, 0.15, 0.4] });
    observer.observe(figure);
    button.addEventListener('click', toggle);
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
      button.removeEventListener('click', toggle);
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
