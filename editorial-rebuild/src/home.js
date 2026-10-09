import { arrow } from './shell.js';
export function renderHome() {
return `<section class="home-opening" aria-labelledby="hero-heading"><div class="hero-stage"><div class="hero-heading"><p class="hero-sector">안경원 전문 광고·콘텐츠 마케팅</p><h1 id="hero-heading" data-split>좋은 안경원을<br>제대로 알리는 일.</h1></div><div class="hero-intro"><p>안경을 고르는 기준과<br>한 사람의 안경을 만드는 과정.<br>고또마케팅은 안경원의 일을<br>읽기 쉬운 콘텐츠로 정리합니다.</p><a class="text-link" href="services.html">고또마케팅이 하는 일 ${arrow}</a><div class="hero-scroll" aria-hidden="true"><span></span>스크롤하며 살펴보세요</div></div><figure class="hero-art"><div class="paper-object" data-paper-scene><img src="art/editorial.webp" width="1086" height="1448" alt="고또마케팅의 붉은 활자가 인쇄된 종이 아트워크" fetchpriority="high"></div><div class="hero-art-shade"></div><figcaption>말을 고르고, 이야기를 엮는 일.</figcaption></figure><div class="hero-end"><p>안경원 안의 전문성을</p><h2>고객이 읽는<br>이야기로.</h2><span>한 사람의 안경이 완성되기까지,<br>전할 이야기를 찾습니다.</span></div><div class="hero-track" aria-hidden="true"><span></span></div></div></section>

<section class="home-statement wrap" aria-labelledby="statement-title"><div class="section-note">고또마케팅의 시선</div><div class="statement-body"><h2 id="statement-title" data-reading>좋은 설명은,<br>안경원을 고르는<br>이유가 됩니다.</h2><div class="statement-copy"><p>어떤 렌즈를 권했는지, 왜 그 안경테를 골랐는지. <br class="desktop-only">안경원에서 오가는 설명에는 각자의 전문성이 담겨 있습니다.</p><p>우리는 그 이야기를 듣고 글과 이미지로 정리합니다. <br class="desktop-only">고객이 이해하고, 필요할 때 다시 찾아볼 수 있도록.</p><a class="text-link" href="about.html">고또마케팅 알아보기 ${arrow}</a></div></div></section>

<section class="home-chapter" aria-labelledby="chapter-title"><div class="chapter-art"><img src="art/editing-desk.webp" alt="펼친 인쇄물과 붉은 속지로 구성한 고또마케팅 브랜드 아트워크" width="1536" height="1024" loading="lazy"><span class="chapter-art-caption">고또마케팅 브랜드 아트워크</span></div><div class="chapter-copy"><p>전문적인 이야기를 쉽게 전하는 방법</p><h2 id="chapter-title" data-split>내용을 이해하고,<br>읽는 사람을<br>생각합니다.</h2><p class="chapter-description">안경 제작 사례를 한 편의 글로.<br>찾아오는 데 필요한 정보를 지도 위에.<br>짧은 소식은 한 장의 이미지로.</p><a class="text-link" href="services.html">서비스 전체 보기 ${arrow}</a></div></section>

<section class="home-services wrap" aria-labelledby="home-services-title"><div class="home-services-heading"><div><p>안경원을 알리는 일곱 가지 방법</p><h2 id="home-services-title" data-split>내용에 맞게.<br>채널에 맞게.</h2></div><p>꾸준히 전할 이야기와<br>고객이 찾아볼 정보를 나눠,<br>안경원에 필요한 업무부터 살펴봅니다.</p></div><div class="service-index"><div class="service-index-art" aria-hidden="true"><div class="index-art-sheet"><span class="index-art-small">고또마케팅이 하는 일</span><div class="index-art-type">읽히는<br>이야기.</div><span class="index-art-rule"></span><p class="index-art-copy">브랜드 블로그 대행</p></div></div><nav class="home-service-list" aria-label="서비스 상세 보기">
${[
['blog','브랜드 블로그','안경원의 설명을 한 편의 글로','읽히는<br>이야기.'],
['hpblog','홈페이지형 블로그','소개와 콘텐츠를 한곳에','정돈된<br>첫인상.'],
['instagram','인스타그램','짧은 순간에도 전해지는 소식','기억할<br>한 장면.'],
['place','플레이스','검색한 다음, 찾아올 수 있도록','찾아올<br>수 있게.'],
['daangn','당근마켓','가까운 동네에 전하는 이야기','가까운<br>우리 동네.'],
['cafe','카페 바이럴','지역 커뮤니티에 맞는 콘텐츠','동네의<br>이야기.'],
['website','홈페이지 제작','궁금한 내용을 한곳에서','한곳에<br>담은 소개.']
].map(([key,title,desc,type])=>`<a href="service-${key}.html" data-index-title="${title}" data-index-art="${type.replaceAll('"','&quot;')}"><span><strong>${title}</strong><small>${desc}</small></span>${arrow}</a>`).join('')}</nav></div></section>

<section class="home-process wrap" aria-labelledby="process-title"><div class="process-heading"><p>함께 정리할 내용</p><h2 id="process-title">시작은,<br>안경원을<br>이해하는 일.</h2><a class="text-link" href="contact.html">상담 문의 ${arrow}</a></div><div class="process-notes"><article><span>01</span><div><h3>어떤 안경원인가요?</h3><p>안경원을 소개해 주세요. 주로 다루는 제품, 설명하고 싶은 강점, 지금 운영하는 채널을 함께 살펴봅니다.</p></div></article><article><span>02</span><div><h3>어떤 이야기를 전할까요?</h3><p>안경 제작 사례와 제품 설명, 매장 소식 등 전할 내용을 정리합니다. 공개할 자료와 표현도 확인합니다.</p></div></article><article><span>03</span><div><h3>어디에서 만나게 할까요?</h3><p>고객이 정보를 찾는 채널과 현재 운영 상황을 바탕으로 필요한 업무와 범위를 상담합니다.</p></div></article></div></section>`;
}
