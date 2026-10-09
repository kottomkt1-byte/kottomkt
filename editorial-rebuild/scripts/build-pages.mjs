import { writeFile } from 'node:fs/promises';
import { renderHome } from '../src/home.js';
import { renderHeader, renderFooter } from '../src/shell.js';
import { renderServices, renderService } from '../src/services.js';
import { renderAbout, renderContact, renderLocation } from '../src/company.js';
import { services } from '../src/content.js';
const pages = [
  ['index.html','좋은 안경원을 제대로 알리는 일',renderHome(),'home','안경원의 설명을 고객이 읽는 콘텐츠로. 고또마케팅은 안경원 전문 광고·콘텐츠 마케팅 서비스를 제공합니다.'],
  ['about.html','고또마케팅 소개',renderAbout(),'about','안경원의 일을 이해하고, 고객이 읽는 이야기로 정리합니다. 안경원 전문 광고·콘텐츠 마케팅 회사 고또마케팅입니다.'],
  ['services.html','고또마케팅이 하는 일',renderServices(),'services','브랜드 블로그, 홈페이지형 블로그, 인스타그램, 플레이스, 당근마켓, 카페 바이럴, 홈페이지 제작 서비스를 살펴보세요.'],
  ...services.map(service=>[service.slug,service.name,renderService(service.key),'service',service.description]),
  ['contact.html','상담 문의',renderContact(),'contact','안경원의 콘텐츠와 마케팅에 관해 문의해 주세요. 상담 신청서, 카카오톡, 이메일로 연락하실 수 있습니다.'],
  ['location.html','오시는 길',renderLocation(),'location','경기도 남양주시 순화궁로 249 파라곤스퀘어 M동 1528호. 고또마케팅 오시는 길을 안내합니다.'],
];
const escape = s => s.replaceAll('&','&amp;').replaceAll('"','&quot;');
for (const [name,title,content,kind,description] of pages) {
  const html = `<!doctype html>
<html lang="ko" class="no-js"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#f3f0e8"><meta name="robots" content="noindex,nofollow"><meta name="description" content="${escape(description)}"><title>${title} — 고또마케팅</title><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="preload" href="/fonts/KottoDisplay.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/fonts/KottoText.woff2" as="font" type="font/woff2" crossorigin><script>document.documentElement.classList.remove('no-js')</script><script type="module" src="/src/main.js"></script></head><body data-page="${kind}">${renderHeader(name)}<main id="main" tabindex="-1">${content}</main>${renderFooter()}</body></html>`;
  await writeFile(name, html);
}
console.log(`Generated ${pages.length} complete HTML pages.`);
