import { arrow } from './shell.js';
import { renderPortfolio, renderVoices } from './evidence.js';
import { renderBrandFilm } from './brand-film.js';
import { renderAchievements } from './achievements.js';
export function renderHome() {
return `<section class="home-opening" aria-labelledby="hero-heading"><div class="hero-stage"><div class="hero-heading"><p class="hero-sector">안경원 전문 광고·콘텐츠 마케팅</p><h1 id="hero-heading" data-split>좋은 안경원을<br>제대로 알리는 일.</h1></div><div class="hero-intro"><p>안경을 고르는 기준과<br>한 사람의 안경을 만드는 과정.<br>고또마케팅은 안경원의 일을<br>읽기 쉬운 콘텐츠로 정리합니다.</p><a class="text-link" href="services.html">고또마케팅이 하는 일 ${arrow}</a><a class="hero-proof-link" href="#selected-work"><span class="hero-proof-pictures"><img src="evidence/portfolio-01.png" width="1024" height="813" alt=""><img src="evidence/portfolio-02.png" width="1024" height="648" alt=""><img src="evidence/portfolio-03.png" width="1024" height="693" alt=""></span><span class="hero-proof-caption">직접 만든 안경원의 첫 화면 ${arrow}</span></a></div><figure class="hero-art"><div class="paper-object" data-paper-scene><img src="art/editorial.webp" width="1086" height="1448" alt="고또마케팅의 붉은 활자가 인쇄된 종이 아트워크" fetchpriority="high"></div><div class="hero-art-shade"></div><figcaption>말을 고르고, 이야기를 엮는 일.</figcaption></figure><div class="hero-end"><p>안경원 안의 전문성을</p><h2>고객이 읽는<br>이야기로.</h2><span>한 사람의 안경이 완성되기까지,<br>전할 이야기를 찾습니다.</span></div><div class="hero-track" aria-hidden="true"><span></span></div></div></section>

<div class="home-proof-intro wrap"><p>안경을 아는 기획, 읽히는 글, 매장마다 다른 디자인.</p><a href="#client-voices">함께 일한 고객의 반응 ${arrow}</a></div>
${renderAchievements()}
${renderBrandFilm()}
${renderPortfolio()}
${renderVoices()}

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

`;
}
