import { renderEvidenceDialog } from '../src/evidence.js';
import { writeFile } from 'node:fs/promises';
import { renderHome } from '../src/home.js';
import { renderHeader, renderFooter } from '../src/shell.js';
import { renderServices, renderService } from '../src/services.js';
import { renderModelImages } from '../src/model-images.js';
import { renderAbout, renderContact, renderLocation } from '../src/company.js';
import { services, pageMetadata } from '../src/content.js';
const pages = [
  ['index.html',renderHome(),'home'],
  ['about.html',renderAbout(),'about'],
  ['services.html',renderServices(),'services'],
  ...services.map(service=>[service.slug,service.key === 'model-images' ? renderModelImages() : renderService(service.key),service.key === 'model-images' ? 'model-images' : 'service']),
  ['contact.html',renderContact(),'contact'],
  ['location.html',renderLocation(),'location'],
];
const escape = s => s.replaceAll('&','&amp;').replaceAll('"','&quot;');
for (const [name,content,kind] of pages) {
  const { title, description } = pageMetadata[name];
  const html = `<!doctype html>
<html lang="ko" class="no-js"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#f3f0e8"><meta name="robots" content="noindex,nofollow"><meta name="description" content="${escape(description)}"><title>${title} — 고또마케팅</title><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="preload" href="/fonts/KottoDisplay.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/fonts/KottoText.woff2" as="font" type="font/woff2" crossorigin><script>document.documentElement.classList.remove('no-js')</script><script type="module" src="/src/main.js"></script></head><body data-page="${kind}">${renderHeader(name)}<main id="main" tabindex="-1">${content}</main>${renderFooter()}${renderEvidenceDialog()}</body></html>`;
  await writeFile(name, html.replace(/[\t ]+$/gm, ''));
}
console.log(`Generated ${pages.length} complete HTML pages.`);
