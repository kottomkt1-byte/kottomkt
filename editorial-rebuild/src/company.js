import { renderVoices } from './evidence.js';
import { renderAchievements } from './achievements.js';
const EMAIL = 'communication@kotto.kr';
const KAKAO = 'https://open.kakao.com/o/sBj11zAf';
const BLOG = 'https://m.blog.naver.com/kottorai';
const NAVER_MAP = 'https://map.naver.com/v5/search/%EA%B2%BD%EA%B8%B0%EB%8F%84%20%EB%82%A8%EC%96%91%EC%A3%BC%EC%8B%9C%20%EC%88%9C%ED%99%94%EA%B6%81%EB%A1%9C%20249';
const MAP_EMBED = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3160.8!2d127.12!3d37.64!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z6rK96riw64-EIOuCqOyWkeyjiOyLnCDsiJztmZTqtoHroZwgMjQ5!5e0!3m2!1sko!2skr!4v1';
const arrow = '<span aria-hidden="true">↗</span>';
const external = 'target="_blank" rel="noopener noreferrer"';

function companyFacts() {
  return `<dl class="co-facts">
    <div><dt>상호</dt><dd>세모기획</dd></div>
    <div><dt>대표</dt><dd>고강일</dd></div>
    <div><dt>사업자등록번호</dt><dd>791-07-02592</dd></div>
    <div><dt>주소</dt><dd>경기도 남양주시 순화궁로 249<br>파라곤스퀘어 M동 1528호</dd></div>
    <div><dt>이메일</dt><dd><a href="mailto:${EMAIL}">${EMAIL}</a></dd></div>
  </dl>`;
}

export function renderAbout() {
  return `<div class="co-page co-about">
    <section class="co-about-hero co-wrap" aria-labelledby="co-about-title">
      <p class="co-label">회사 소개</p>
      <div class="co-about-opening">
        <div class="co-about-heading">
          <h1 id="co-about-title" data-reveal>안경원을<br>이해하고,<br><em>고객의 언어로.</em></h1>
          <div class="co-about-note"><span class="co-rule" aria-hidden="true"></span><p>안경원 전문 광고·마케팅 대행<br>고또마케팅</p></div>
        </div>
        <figure class="co-about-figure">
          <div class="co-about-image"><img src="art/optical-editorial.webp" alt="붉은 안경테 소재와 정밀 도구로 표현한 고또마케팅의 업종 전문성 브랜드 이미지" width="1448" height="1086" fetchpriority="high"></div>
          <figcaption><span>안경원의 일을 이해하는 시선.</span><span>브랜드 이미지</span></figcaption>
        </figure>
      </div>
      <div class="co-about-introduction"><span>우리가 하는 일</span><p>안경원에는 설명할 이야기가 많습니다. 안경을 만드는 과정, 렌즈를 고르는 이유, 고객에게 전하고 싶은 안내까지. 고또마케팅은 그 이야기를 정리하고, 각 채널에 맞는 콘텐츠로 만듭니다.</p><a class="co-text-link" href="services.html">서비스 살펴보기 ${arrow}</a></div>
    </section>
    ${renderAchievements()}
    <section class="co-making" aria-labelledby="co-making-title">
      <header class="co-making-heading co-wrap"><div><p class="co-label">함께 일하는 방식</p><h2 id="co-making-title">듣고, 고르고.<br>하나의 이야기로.</h2></div><p>안경원의 말에서 시작해<br>고객이 읽는 화면까지.</p></header>
      <div class="co-making-spread co-wrap">
        <article class="co-making-scene co-making-listen"><figure><div class="co-scene-image"><img src="art/conversation-atelier.webp" width="1536" height="1024" loading="lazy" decoding="async" alt="말과 생각을 나누며 편집하는 과정을 그린 브랜드 일러스트"></div><figcaption>소통을 표현한 브랜드 일러스트</figcaption></figure><div class="co-scene-copy"><span>기획의 시작</span><h3>먼저, 듣습니다.</h3><p>주로 다루는 안경과 렌즈.<br>원장님이 고객에게 꼭 전하고 싶은 말.</p></div></article>
        <article class="co-making-scene co-making-edit"><figure><div class="co-scene-image"><img src="art/content-atelier.webp" width="1536" height="1024" loading="lazy" decoding="async" alt="문장과 사진을 펼쳐 놓은 편집 작업대를 표현한 브랜드 이미지"></div><figcaption>콘텐츠 기획을 표현한 브랜드 이미지</figcaption></figure><div class="co-scene-copy"><span>내용을 정리하는 일</span><h3>읽을 순서를 찾습니다.</h3><p>안경원의 전문성을 확인하고,<br>고객이 이해할 문장으로 정리합니다.</p></div></article>
        <article class="co-making-scene co-making-design"><figure><div class="co-scene-image"><img src="art/social-studio.webp" width="1536" height="1024" loading="lazy" decoding="async" alt="빛과 이미지의 구성을 살피는 콘텐츠 제작을 표현한 브랜드 이미지"></div><figcaption>이미지 제작을 표현한 브랜드 이미지</figcaption></figure><div class="co-scene-copy"><span>채널에 맞는 제작</span><h3>어울리는 화면을 만듭니다.</h3><p>블로그의 한 편, 피드의 한 장.<br>전할 내용에 맞게 글과 이미지를 엮습니다.</p></div></article>
      </div>
      <div class="co-making-end co-wrap"><p>맡기는 일과 함께 준비할 일을<br>명확하게 이야기하겠습니다.</p><a class="co-text-link" href="contact.html">우리 안경원 이야기하기 ${arrow}</a></div>
    </section>
    ${renderVoices({compact:true})}
    <section class="co-company-info co-wrap" aria-labelledby="co-info-title"><div><p class="co-label">고또마케팅</p><h2 id="co-info-title">회사를<br>소개합니다.</h2><a class="co-text-link" href="location.html">오시는 길 ${arrow}</a></div>${companyFacts()}</section>

  </div>`;
}

function field(id, label, options = {}) {
  const { type = 'text', autocomplete = '', placeholder = '', optional = false } = options;
  return `<div class="co-field"><label for="${id}">${label}${optional ? '<span>선택</span>' : '<span aria-hidden="true">*</span>'}</label><input id="${id}" name="${id}" type="${type}" ${autocomplete ? `autocomplete="${autocomplete}"` : ''} ${type === 'tel' ? 'inputmode="tel"' : ''} placeholder="${placeholder}" ${optional ? '' : 'required'} aria-describedby="${id}-error"><p class="co-field-error" id="${id}-error"></p></div>`;
}

export function renderContact() {
  return `<div class="co-page co-contact co-wrap">
    <section class="co-contact-intro" aria-labelledby="co-contact-title">
      <div class="co-contact-opening"><div class="co-contact-heading"><p class="co-label">상담 문의</p><h1 id="co-contact-title" data-reveal>안경원<br>이야기를<br>들려주세요.</h1><p class="co-contact-copy">지금 운영 중인 채널과 맡기고 싶은 일.<br>문의 내용을 살펴보고 상담을 이어가겠습니다.</p><a class="co-text-link" href="#co-form-heading">상담 신청서 작성 ${arrow}</a></div><figure class="co-contact-illustration"><div class="co-contact-art-window"><img src="art/conversation-atelier.webp" width="1536" height="1024" fetchpriority="high" alt="글과 이미지를 사이에 두고 이야기를 나누는 과정을 그린 브랜드 일러스트"></div><figcaption>한 통의 이야기에서 시작합니다.<span>브랜드 일러스트</span></figcaption></figure></div>
    </section>
    <div class="co-contact-desk"><aside class="co-contact-aside" aria-label="문의 안내"><p class="co-desk-note">편한 방식으로<br>말을 건네주세요.</p><nav class="co-contact-channels" aria-label="다른 문의 방법">
        <a href="${KAKAO}" ${external}><span>카카오톡 문의</span>${arrow}</a>
        <a href="mailto:${EMAIL}"><span>이메일 문의<small>${EMAIL}</small></span>${arrow}</a>
        <a href="${BLOG}" ${external}><span>고또마케팅 블로그</span>${arrow}</a>
      </nav><figure class="co-letter-art"><div><img src="art/editing-desk.webp" width="1536" height="1024" loading="lazy" decoding="async" alt="종이와 붉은 편집물을 펼친 브랜드 이미지"></div><figcaption>보내주신 내용은<br>상담의 첫 페이지가 됩니다.</figcaption><span class="co-art-label">브랜드 이미지</span></figure></aside>
    <section class="co-form-area" aria-labelledby="co-form-heading">
      <div class="co-form-heading"><h2 id="co-form-heading">상담 신청서</h2><p><span aria-hidden="true">*</span> 필수 입력</p></div>
      <form id="contactForm" class="co-form" aria-describedby="form-status">
        <div class="co-error-summary" id="co-errors" tabindex="-1" role="alert" hidden><h3>입력 내용을 확인해 주세요.</h3><ul></ul></div>
        <fieldset class="co-form-fields" data-co-interactive disabled><legend class="co-sr-only">상담에 필요한 정보</legend>
          <div class="co-form-section"><h3><span>01</span> 안경원 정보</h3><div class="co-field-grid">
            ${field('company', '회사명', { autocomplete: 'organization', placeholder: '회사명' })}
            ${field('storeName', '상호', { placeholder: '안경원 이름' })}
            ${field('phone', '연락처', { type: 'tel', autocomplete: 'tel', placeholder: '010-0000-0000' })}
            ${field('region', '지역', { placeholder: '예: 서울 강남구' })}
          </div></div>
          <div class="co-form-section"><h3><span>02</span> 문의하실 내용</h3>
            <div class="co-field"><label for="budget">월 마케팅 예산 <span>선택</span></label><select id="budget" name="budget"><option value="">아직 정하지 않았습니다</option><option value="50~100만원">50~100만원</option><option value="100~200만원">100~200만원</option><option value="200~300만원">200~300만원</option><option value="300만원 이상">300만원 이상</option><option value="미정">미정 (상담 후 결정)</option></select><p class="co-field-hint">예산이 정해지지 않았다면 선택하지 않으셔도 됩니다.</p></div>
            <div class="co-field co-message-field"><label for="message">문의 내용 <span aria-hidden="true">*</span></label><textarea id="message" name="message" rows="5" required aria-describedby="message-error" placeholder="현재 운영 중인 채널이나 궁금한 서비스를 알려주세요."></textarea><p class="co-field-error" id="message-error"></p></div>
          </div>
          <div class="co-form-final"><label class="co-consent" for="privacy"><input id="privacy" type="checkbox" required aria-describedby="privacy-error"><span>개인정보 수집 및 이용에 동의합니다 <span aria-hidden="true">*</span></span></label><p class="co-field-error" id="privacy-error"></p><button type="submit" class="co-submit"><span>문의 보내기</span>${arrow}</button></div>
        </fieldset>
        <p class="co-form-status" id="form-status" aria-live="polite" role="status"></p>
        <noscript><p>문의 양식을 사용하려면 자바스크립트를 켜 주세요. 카카오톡 또는 이메일로도 문의하실 수 있습니다.</p></noscript>
      </form>
    </section></div>
  </div>`;
}

export function renderLocation() {
  return `<div class="co-page co-location">
    <section class="co-location-hero co-wrap" aria-labelledby="co-location-title"><div class="co-location-opening"><div><p class="co-label">오시는 길</p><h1 id="co-location-title" data-reveal>다음 이야기는,<br>만나서.</h1><p>경기도 남양주시, 고또마케팅.<br>방문 상담은 사전 예약 후 찾아주세요.</p><a class="co-text-link" href="#co-visit-title">방문 안내 확인 ${arrow}</a></div><figure class="co-neighborhood"><div><img src="art/neighborhood-atlas.webp" width="1536" height="1024" fetchpriority="high" alt="동네 상점과 사람들의 길을 그린 브랜드 일러스트. 실제 위치를 표시한 지도는 아닙니다."></div><figcaption><span>동네의 이야기를 가까이에서.</span><span>브랜드 일러스트 · 실제 지도 아님</span></figcaption></figure></div></section>
    <section class="co-address-sheet co-wrap" aria-label="방문 주소">
      <div class="co-address-top"><p>경기도 남양주시</p><span>파라곤스퀘어</span></div>
      <div class="co-street"><span>순화궁로</span><strong>249</strong></div>
      <div class="co-address-bottom"><span>M동 <b>1528호</b></span><button class="co-copy-address" type="button" data-copy-address>주소 복사 <span aria-hidden="true">↗</span></button></div>
      <p id="co-copy-status" class="co-copy-status" role="status" aria-live="polite"></p>
    </section>
    <section class="co-visit co-wrap" aria-labelledby="co-visit-title"><div class="co-visit-details"><figure class="co-visit-art"><div><img src="art/conversation-atelier.webp" width="1536" height="1024" loading="lazy" decoding="async" alt="상담과 소통을 표현한 브랜드 일러스트"></div><figcaption>이야기를 나눌 준비 · 브랜드 일러스트</figcaption></figure><p class="co-label">방문 안내</p><h2 id="co-visit-title">오시기 전에<br>연락 주세요.</h2><p>상담 일정을 정한 뒤 방문해 주세요.<br>카카오톡이나 문의 양식으로 연락하실 수 있습니다.</p><a class="co-text-link" href="${KAKAO}" ${external}>카카오톡 문의 ${arrow}</a><a class="co-text-link" href="contact.html">상담 신청서 작성 ${arrow}</a><a class="co-visit-email" href="mailto:${EMAIL}">${EMAIL}</a></div>
      <div class="co-map-area"><div class="co-map-header"><h3>지도에서 찾기</h3><a href="${NAVER_MAP}" ${external}>네이버 지도 ${arrow}</a></div><div class="co-map-window" id="co-map-window"><div class="co-map-placeholder"><p>경기도 남양주시 순화궁로 249<br>파라곤스퀘어 M동 1528호</p><button class="co-map-button" type="button" data-load-map>지도 펼치기 <span aria-hidden="true">↗</span></button></div></div><p class="co-map-note">지도가 표시되지 않으면 <a href="${NAVER_MAP}" ${external}>네이버 지도에서 주소를 확인</a>해 주세요.</p></div>
    </section>
  </div>`;
}

let sdkPromise;
function loadEmailJS() {
  if (window.emailjs) return Promise.resolve(window.emailjs);
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = window.__KOTTO_EMAILJS_ASSET__ || new URL('assets/vendor/email.min.js', document.baseURI).href;
    script.onload = () => {
      if (window.emailjs) resolve(window.emailjs);
      else { script.remove(); sdkPromise = undefined; reject(new Error('EmailJS unavailable')); }
    };
    script.onerror = () => { script.remove(); sdkPromise = undefined; reject(new Error('EmailJS failed to load')); };
    document.head.append(script);
  });
  return sdkPromise;
}

function initForm() {
  const form = document.querySelector('#contactForm');
  if (!form || form.dataset.initialized) return;
  form.dataset.initialized = 'true';
  form.noValidate = true;
  form.querySelector('[data-co-interactive]').disabled = false;
  const serviceNames = { blog: '브랜드 블로그 대행', hpblog: '홈페이지형 블로그', instagram: '인스타그램 마케팅', place: '플레이스 관리', daangn: '당근마켓 마케팅', cafe: '카페 바이럴', website: '홈페이지 제작' };
  const service = serviceNames[new URLSearchParams(window.__KOTTO_ROUTE_QUERY__ || location.search).get('service')];
  if (service && !form.elements.message.value) form.elements.message.value = `${service}에 대해 상담받고 싶습니다.`;
  const status = form.querySelector('#form-status');
  const summary = form.querySelector('#co-errors');
  const submit = form.querySelector('.co-submit');
  let sending = false;
  let validated = false;
  const labels = { company: '회사명을', storeName: '상호를', phone: '연락처를', region: '지역을', message: '문의 내용을' };

  function validate(focusSummary = false) {
    const errors = [];
    for (const [id, label] of Object.entries(labels)) {
      const input = document.getElementById(id);
      let message = input.value.trim() ? '' : `${label} 입력해 주세요.`;
      if (id === 'phone' && input.value.trim() && !/^[0-9\-+() ]{8,15}$/.test(input.value.trim())) message = '올바른 연락처를 입력해 주세요.';
      document.getElementById(`${id}-error`).textContent = message;
      input.setAttribute('aria-invalid', message ? 'true' : 'false');
      if (message) errors.push({ id, message });
    }
    const privacy = form.querySelector('#privacy');
    const privacyMessage = privacy.checked ? '' : '개인정보 수집 및 이용에 동의해 주세요.';
    document.getElementById('privacy-error').textContent = privacyMessage;
    privacy.setAttribute('aria-invalid', privacyMessage ? 'true' : 'false');
    if (privacyMessage) errors.push({ id: 'privacy', message: privacyMessage });
    summary.querySelector('ul').replaceChildren(...errors.map(({ id, message }) => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = `#${id}`;
      link.textContent = message;
      link.addEventListener('click', () => document.getElementById(id).focus());
      item.append(link);
      return item;
    }));
    summary.hidden = !errors.length;
    if (errors.length && focusSummary) summary.focus();
    return !errors.length;
  }

  form.querySelector('#phone').addEventListener('input', function () {
    let value = this.value.replace(/\D/g, '').slice(0, 11);
    if (value.length > 7) value = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7)}`;
    else if (value.length > 3) value = `${value.slice(0, 3)}-${value.slice(3)}`;
    this.value = value;
  });
  form.addEventListener('input', () => { if (validated) validate(); });
  form.addEventListener('change', () => { if (validated) validate(); });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending) return;
    validated = true;
    status.textContent = '';
    if (!validate(true)) return;
    const fd = new FormData(form);
    const payload = { company: fd.get('company').trim(), store_name: fd.get('storeName').trim(), phone: fd.get('phone').trim(), region: fd.get('region').trim(), budget: fd.get('budget') || '미정', message: fd.get('message').trim() };
    sending = true;
    submit.disabled = true;
    submit.querySelector('span').textContent = '문의 보내는 중…';
    form.setAttribute('aria-busy', 'true');
    status.dataset.state = 'sending';
    status.textContent = '문의 내용을 전송하고 있습니다.';
    try {
      const emailjs = await loadEmailJS();
      emailjs.init('wRB7RcKgCZ0rb8bqx');
      await emailjs.send('service_peqoeen', 'template_v9eprz5', payload);
      form.reset();
      validated = false;
      form.querySelectorAll('[aria-invalid]').forEach((input) => input.removeAttribute('aria-invalid'));
      status.dataset.state = 'success';
      status.textContent = '문의가 전송되었습니다. 남겨주신 연락처로 상담을 이어가겠습니다.';
    } catch {
      status.dataset.state = 'error';
      status.textContent = '전송하지 못했습니다. 입력 내용은 유지됩니다. 다시 시도하거나 카카오톡 또는 이메일로 문의해 주세요.';
    } finally {
      sending = false;
      submit.disabled = false;
      submit.querySelector('span').textContent = '문의 보내기';
      form.removeAttribute('aria-busy');
      requestAnimationFrame(() => {
        const bounds = status.getBoundingClientRect();
        if (bounds.bottom > window.innerHeight - 24 || bounds.top < 100) {
          status.scrollIntoView({ block: 'nearest', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
        }
      });
    }
  });
}

export function initCompany({ gsap, ScrollTrigger } = {}) {
  initForm();
  document.querySelector('[data-copy-address]')?.addEventListener('click', async () => {
    const status = document.querySelector('#co-copy-status');
    try {
      await navigator.clipboard.writeText('경기도 남양주시 순화궁로 249 파라곤스퀘어 M동 1528호');
      status.textContent = '주소를 복사했습니다.';
    } catch {
      status.textContent = '주소를 길게 누르거나 선택해 복사해 주세요: 경기도 남양주시 순화궁로 249 파라곤스퀘어 M동 1528호';
    }
  });
  document.querySelector('[data-load-map]')?.addEventListener('click', () => {
    const frame = document.createElement('iframe');
    frame.src = MAP_EMBED;
    frame.title = '고또마케팅 위치 — 경기도 남양주시 순화궁로 249';
    frame.loading = 'lazy';
    frame.referrerPolicy = 'no-referrer-when-downgrade';
    frame.allowFullscreen = true;
    document.querySelector('#co-map-window').replaceChildren(frame);
  }, { once: true });
  if (!gsap || !ScrollTrigger || !document.querySelector('.co-page')) return;
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();
  mm.add('(min-width: 761px) and (prefers-reduced-motion: no-preference)', () => {
    const aboutImage = document.querySelector('.co-about-image img');
    if (aboutImage) gsap.fromTo(aboutImage, { scale: 1.09, yPercent: 2 }, { scale: 1, yPercent: -2, ease: 'none', scrollTrigger: { trigger: '.co-about-hero', start: 'top top', end: 'bottom top', scrub: 0.6 } });
    const spread = document.querySelector('.co-making-spread');
    if (spread) {
      const scenes = [...spread.querySelectorAll('.co-making-scene')];
      const timeline = gsap.timeline({defaults: {ease:'none'}, scrollTrigger:{trigger:spread, start:'top 85%', end:'bottom 75%', scrub:0.65}});
      scenes.forEach((scene, index) => {
        const image = scene.querySelector('img');
        timeline.fromTo(scene.querySelector('.co-scene-image'), {clipPath:'inset(0% 0% 14% 0%)'}, {clipPath:'inset(0% 0% 0% 0%)',duration:0.7}, index*0.14)
          .fromTo(image, {scale:1.07, yPercent:2}, {scale:1,yPercent:0,duration:0.9}, index*0.14);
      });
    }
    document.querySelectorAll('.co-contact-art-window,.co-neighborhood>div').forEach((window) => {
      gsap.fromTo(window.querySelector('img'), {scale:1.06,yPercent:2}, {scale:1,yPercent:-2,ease:'none',scrollTrigger:{trigger:window,start:'top bottom',end:'bottom top',scrub:0.8}});
    });
    document.querySelectorAll('.co-letter-art>div,.co-visit-art>div').forEach((window) => {
      gsap.fromTo(window.querySelector('img'), {scale:1.06}, {scale:1,ease:'none',scrollTrigger:{trigger:window,start:'top 90%',end:'bottom 65%',scrub:0.5}});
    });
  });
  return () => mm.revert();
}
