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
  const industries = [
    ['01', '안경원', '안경 제작 사례와 매장의 전문성이 방문 전부터 전해지도록.'],
    ['02', '아이웨어 브랜드·제조·수입·유통사', '프레임의 디테일과 컬렉션의 개성을 콘텐츠에 담도록.'],
    ['03', '안경렌즈 기업', '렌즈의 설계와 소재, 제품별 차이를 이해하기 쉽게 전하도록.'],
    ['04', '콘택트렌즈 기업', '제품 자료를 바탕으로 특징과 착용·관리 정보를 명료하게 안내하도록.'],
  ];
  return `<div class="co-page co-about">
    <section class="co-about-hero co-wrap" aria-labelledby="co-about-title">
      <p class="co-label">고또마케팅 소개 <span class="co-label-en" lang="en">OUR PERSPECTIVE</span></p>
      <div class="co-about-opening">
        <div class="co-about-heading">
          <h1 id="co-about-title" data-reveal>안경을 아는 시선으로,<br><em>브랜드의 가치를<br>전합니다.</em></h1>
          <div class="co-about-note"><span class="co-rule" aria-hidden="true"></span><p>안경 산업 전문 광고·콘텐츠 마케팅<br>고또마케팅</p></div>
        </div>
        <figure class="co-about-figure">
          <div class="co-about-image"><img src="portfolio/model-images/thumbnails/tf5922-020-women-02.webp" alt="민트색 드레이프 상의와 반투명 그레이 안경테를 표현한 모델 이미지 제작 포트폴리오" width="1122" height="1402" fetchpriority="high"></div>
          <figcaption><span>제품의 선을 살피는 시선.</span><span>모델 이미지 제작 포트폴리오</span></figcaption>
        </figure>
      </div>
      <div class="co-about-introduction"><span>우리가 하는 일</span><p>안경을 만드는 이유, 렌즈를 고르는 기준, 브랜드가 지켜온 취향. 고또마케팅은 안경원의 제작 사례를 정리하고 제품의 디테일을 살펴온 경험으로, 안경 산업의 이야기를 글과 이미지로 전합니다.</p><a class="co-text-link" href="services.html">서비스 살펴보기 ${arrow}</a></div>
    </section>
    <section class="co-industry" aria-labelledby="co-industry-title"><div class="co-industry-inner co-wrap"><header><p class="co-label">함께할 분야</p><h2 id="co-industry-title">같은 안경 산업,<br>서로 다른 과제.</h2><p>매장과 브랜드, 제품과 채널.<br>알리고 싶은 대상과 필요한 일부터 살핍니다.</p></header><ol class="co-industry-list">${industries.map(([number, title, copy]) => `<li><span aria-hidden="true">${number}</span><div><h3>${title}</h3><p>${copy}</p></div></li>`).join('')}</ol></div></section>
    ${renderAchievements()}
    <section class="co-about-work co-wrap" aria-labelledby="co-work-title">
      <header class="co-work-heading"><div><p class="co-label">작업으로 전하는 전문성</p><h2 id="co-work-title">안경을 이해하는 일이<br>콘텐츠의 바탕이 됩니다.</h2></div><p>안경 제작 사례의 문장부터<br>프레임을 보여주는 이미지까지.</p></header>
      <div class="co-work-spread">
        <article class="co-work-model"><a class="co-work-image" href="service-model-images.html" aria-label="안경테·선글라스 모델 이미지 제작 포트폴리오 보기"><img src="portfolio/model-images/thumbnails/tf1381-01a-men-03.webp" width="1122" height="1402" loading="lazy" decoding="async" alt="버건디 재킷과 블랙 선글라스를 표현한 남성 모델 이미지 제작 포트폴리오"><span aria-hidden="true">포트폴리오 보기 ↗</span></a><div class="co-work-caption"><span>01 / MODEL IMAGE</span><h3>제품을 아는 눈으로,<br>한 장을 완성합니다.</h3><p>안경사가 제품 사진과 제작 이미지를 비교합니다. 프레임의 형태와 연결부, 색상과 소재의 표현을 살핍니다.</p></div></article>
        <article class="co-work-content"><div class="co-work-intro"><span class="co-work-rule" aria-hidden="true"></span><p>전문적인 내용도<br>읽는 사람에게 닿도록.</p></div><a class="co-work-image" href="service-hpblog.html" aria-label="유럽안경 홈페이지형 블로그 제작 사례 보기"><img src="evidence/portfolio-01.png" width="1024" height="813" loading="lazy" decoding="async" alt="실제로 제작한 유럽안경 홈페이지형 블로그 화면"><span aria-hidden="true">제작 사례 보기 ↗</span></a><div class="co-work-caption"><span>02 / BRAND CONTENT</span><h3>쌓아온 이야기를<br>읽기 좋은 화면으로.</h3><p>매장의 소개와 콘텐츠가 한 흐름으로 읽히도록 구성합니다. 실제 홈페이지형 블로그 제작 화면을 살펴보세요.</p></div></article>
      </div>
      <div class="co-work-end"><p>필요한 콘텐츠와 사용할 채널을 함께 정리하고,<br>작업 범위와 일정을 맞춥니다.</p><a class="co-text-link" href="contact.html">브랜드의 다음 일 이야기하기 ${arrow}</a></div>
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
      <div class="co-contact-opening"><div class="co-contact-heading"><p class="co-label">광고·콘텐츠 제작 문의 <span class="co-label-en" lang="en">START A CONVERSATION</span></p><h1 id="co-contact-title" data-reveal>브랜드의 다음 일을<br><em>들려주세요.</em></h1><p class="co-contact-copy">안경원부터 아이웨어 브랜드·제조·수입·유통사,<br>안경렌즈·콘택트렌즈 기업까지.<br>한 번의 제작과 지속적인 채널 운영을 함께 상담합니다.</p><a class="co-text-link" href="#co-form-heading">프로젝트·운영 문의하기 ${arrow}</a></div><figure class="co-contact-illustration"><div class="co-contact-art-window"><img src="art/editing-desk.webp" width="1536" height="1024" fetchpriority="high" alt="종이와 붉은 편집물을 펼친 콘텐츠 기획 작업대 브랜드 이미지"></div><figcaption>전하고 싶은 이야기부터 시작합니다.<span>브랜드 이미지</span></figcaption></figure></div>
    </section>
    <div class="co-contact-desk"><aside class="co-contact-aside" aria-label="문의 안내"><p class="co-desk-note">준비된 이야기부터<br>보내주세요.</p><p class="co-desk-copy">제품이나 브랜드 소개, 필요한 콘텐츠,<br>사용할 채널과 희망 일정을 알려주시면<br>작업 범위를 함께 정리하겠습니다.</p><nav class="co-contact-channels" aria-label="다른 문의 방법">
        <a href="${KAKAO}" ${external}><span>카카오톡 문의</span>${arrow}</a>
        <a href="mailto:${EMAIL}"><span>이메일 문의<small>${EMAIL}</small></span>${arrow}</a>
        <a href="${BLOG}" ${external}><span>고또마케팅 블로그</span>${arrow}</a>
      </nav><div class="co-inquiry-guide"><p>문의 이후에는</p><ol><li><span>01</span> 필요한 작업과 자료 확인</li><li><span>02</span> 제작·운영 범위 협의</li><li><span>03</span> 일정과 진행 방식 안내</li></ol></div></aside>
    <section class="co-form-area" aria-labelledby="co-form-heading">
      <div class="co-form-heading"><h2 id="co-form-heading">프로젝트·운영 문의</h2><p><span aria-hidden="true">*</span> 필수 입력</p></div>
      <p class="co-service-selection" data-co-service-selection hidden></p>
      <form id="contactForm" class="co-form" aria-describedby="form-status">
        <div class="co-error-summary" id="co-errors" tabindex="-1" role="alert" hidden><h3>입력 내용을 확인해 주세요.</h3><ul></ul></div>
        <fieldset class="co-form-fields" data-co-interactive disabled><legend class="co-sr-only">문의에 필요한 정보</legend>
          <div class="co-form-section"><h3><span>01</span> 회사·브랜드 정보</h3><div class="co-field-grid">
            ${field('company', '회사·브랜드명', { autocomplete: 'organization', placeholder: '안경원은 상호를 입력해 주세요' })}
            ${field('storeName', '브랜드·지점명', { placeholder: '회사명과 다른 경우', optional: true })}
            ${field('contactName', '담당자', { autocomplete: 'name', placeholder: '성함 또는 부서명', optional: true })}
            ${field('phone', '연락처', { type: 'tel', autocomplete: 'tel', placeholder: '휴대전화 또는 대표번호' })}
            ${field('email', '이메일', { type: 'email', autocomplete: 'email', placeholder: '회신받을 이메일', optional: true })}
            ${field('region', '지역', { placeholder: '매장·사업장 지역', optional: true })}
          </div><div class="co-field co-industry-field"><label for="industry">업종 <span>선택</span></label><select id="industry" name="industry"><option value="">해당 분야를 선택해 주세요</option><option value="store">안경원</option><option value="brand-distributor">아이웨어 브랜드·제조·수입·유통사</option><option value="spectacle-lens">안경렌즈 기업</option><option value="contact-lens">콘택트렌즈 기업</option><option value="other">기타</option></select></div></div>
          <div class="co-form-section"><h3><span>02</span> 필요한 작업</h3>
            <fieldset class="co-inquiry-types"><legend>문의 유형</legend><div><label><input type="radio" name="inquiryType" value="project"><span><b>프로젝트 제작</b><small>이미지·콘텐츠·홈페이지 등</small></span></label><label><input type="radio" name="inquiryType" value="retainer"><span><b>지속적인 운영</b><small>블로그·SNS·광고 채널 등</small></span></label><label><input type="radio" name="inquiryType" value="consult" checked><span><b>상담 후 결정</b><small>필요한 범위를 함께 정하고 싶어요</small></span></label></div></fieldset>
            <div class="co-field co-budget-field"><label for="budget"><span data-co-budget-label>예상 예산</span> <span>선택</span></label><select id="budget" name="budget" aria-describedby="budget-hint"><option value="">아직 정하지 않았습니다</option><option value="100만원 미만">100만원 미만</option><option value="100~300만원">100~300만원</option><option value="300~500만원">300~500만원</option><option value="500~1,000만원">500~1,000만원</option><option value="1,000만원 이상">1,000만원 이상</option><option value="상담 후 협의">상담 후 협의</option></select><p class="co-field-hint" id="budget-hint">제작 또는 운영에 생각하고 계신 예산을 알려주세요.</p></div>
            <div class="co-field co-message-field"><label for="message">문의 내용 <span aria-hidden="true">*</span></label><textarea id="message" name="message" rows="6" required aria-describedby="message-error" placeholder="브랜드와 제품, 필요한 콘텐츠나 궁금한 서비스를 알려주세요."></textarea><p class="co-field-error" id="message-error"></p></div>
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
  const serviceNames = { blog: '브랜드 블로그 대행', 'model-images': '안경테·선글라스 모델 이미지 제작', hpblog: '홈페이지형 블로그', instagram: '인스타그램 마케팅', place: '플레이스 관리', daangn: '당근마켓 마케팅', cafe: '카페 바이럴', website: '홈페이지 제작' };
  const service = serviceNames[new URLSearchParams(window.__KOTTO_ROUTE_QUERY__ || location.search).get('service')];
  if (service && !form.elements.message.value) form.elements.message.value = `${service}에 대해 상담받고 싶습니다.`;
  const serviceSelection = document.querySelector('[data-co-service-selection]');
  if (service && serviceSelection) {
    serviceSelection.textContent = `관심 서비스 · ${service}`;
    serviceSelection.hidden = false;
  }
  const industryNames = { store: '안경원', 'brand-distributor': '아이웨어 브랜드·제조·수입·유통사', 'spectacle-lens': '안경렌즈 기업', 'contact-lens': '콘택트렌즈 기업', other: '기타' };
  const inquiryNames = { project: '프로젝트 제작', retainer: '지속적인 운영', consult: '상담 후 결정' };
  const budgetLabels = { project: '프로젝트 총 예산', retainer: '월 운영 예산', consult: '예상 예산' };
  const budgetHints = { project: '이번 제작 프로젝트 전체에 생각하고 계신 예산입니다.', retainer: '한 달 운영에 생각하고 계신 예산입니다.', consult: '제작 또는 운영에 생각하고 계신 예산을 알려주세요.' };
  function updateInquiryType() {
    const type = form.elements.inquiryType.value;
    form.querySelector('[data-co-budget-label]').textContent = budgetLabels[type] || budgetLabels.consult;
    form.querySelector('#budget-hint').textContent = budgetHints[type] || budgetHints.consult;
  }
  form.querySelectorAll('[name="inquiryType"]').forEach(input => input.addEventListener('change', updateInquiryType));
  updateInquiryType();
  const status = form.querySelector('#form-status');
  const summary = form.querySelector('#co-errors');
  const submit = form.querySelector('.co-submit');
  let sending = false;
  let validated = false;
  const labels = { company: '회사·브랜드명을', phone: '연락처를', email: '이메일을', message: '문의 내용을' };

  function validate(focusSummary = false) {
    const errors = [];
    for (const [id, label] of Object.entries(labels)) {
      const input = document.getElementById(id);
      const value = input.value.trim();
      let message = input.required && !value ? `${label} 입력해 주세요.` : '';
      if (id === 'phone' && value && (!/^\+?[0-9\-() ]+$/.test(value) || !/^\d{8,15}$/.test(value.replace(/\D/g, '')))) message = '연락처를 숫자 8~15자리로 입력해 주세요.';
      if (id === 'email' && value && input.validity.typeMismatch) message = '올바른 이메일 주소를 입력해 주세요.';
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

  form.addEventListener('input', () => { if (validated) validate(); });
  form.addEventListener('change', () => { if (validated) validate(); });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending) return;
    validated = true;
    status.textContent = '';
    if (!validate(true)) return;
    const fd = new FormData(form);
    const company = fd.get('company').trim();
    const storeName = fd.get('storeName').trim() || company;
    const region = fd.get('region').trim() || '미정';
    const budget = fd.get('budget') || '미정';
    const inquiryType = fd.get('inquiryType');
    const messageDetails = [
      '[문의 정보]',
      `업종: ${industryNames[fd.get('industry')] || '미선택'}`,
      `문의 유형: ${inquiryNames[inquiryType] || inquiryNames.consult}`,
      `회사·브랜드명: ${company}`,
      `브랜드·지점명: ${storeName}`,
      `담당자: ${fd.get('contactName').trim() || '미입력'}`,
      `연락처: ${fd.get('phone').trim()}`,
      `이메일: ${fd.get('email').trim() || '미입력'}`,
      `지역: ${region}`,
      `${budgetLabels[inquiryType] || budgetLabels.consult}: ${budget}`,
      ...(service ? [`관심 서비스: ${service}`] : []),
      '', '[문의 내용]', fd.get('message').trim(),
    ];
    const payload = { company, store_name: storeName, phone: fd.get('phone').trim(), region, budget, message: messageDetails.join('\n') };
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
      updateInquiryType();
      if (service) form.elements.message.value = `${service}에 대해 상담받고 싶습니다.`;
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
