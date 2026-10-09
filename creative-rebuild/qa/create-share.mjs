import { build } from 'esbuild';
import { readFile, writeFile, mkdir, cp } from 'node:fs/promises';
import { resolve } from 'node:path';

// Distribute only the reviewed static build, separate from the operating site.
const root = resolve('.');
const output = resolve('share');
await mkdir(output, { recursive: true });
await cp(resolve('dist'), resolve(output, 'site'), { recursive: true });
const assets = {};
for (const [path, type] of [
  ['fonts/PretendardVariable.woff2', 'font/woff2'],
  ['fonts/NotoSerifKR.woff2', 'font/woff2'],
  ['art/editorial.webp', 'image/webp'],
  ['art/ribbon-poster.png', 'image/png'],
  ['favicon.svg', 'image/svg+xml'],
]) {
  assets[`/${path}`] = `data:${type};base64,${(await readFile(resolve('public', path))).toString('base64')}`;
}
const pages = {};
for (const concept of ['a', 'b', 'c']) {
  const result = await build({ entryPoints: [`src/${concept}.js`], bundle: true, write: false,
    outdir: '/virtual', format: 'iife', minify: true, target: 'es2020',
    external: ['/fonts/*'], define: { 'import.meta.env.BASE_URL': '"__KOTTO_LOCAL__/"' },
  });
  const js = result.outputFiles.find(file => file.path.endsWith('.js')).text;
  const css = result.outputFiles.find(file => file.path.endsWith('.css')).text;
  let html = await readFile(`${concept}.html`, 'utf8');
  html = html.replace(/<script\b[^>]*type="module"[^>]*>[\s\S]*?<\/script>/g, '')
    .replace(/<link\b[^>]*rel="stylesheet"[^>]*>/g, '')
    .replace('</head>', () => `<style>${css}</style></head>`)
    // The parent owns the A/B/C URL. Inner anchor scrolling still runs normally,
    // but srcdoc cannot replace its URL with the parent's resolved hash URL.
    .replace('</body>', () => `<script>const replace=history.replaceState.bind(history);history.replaceState=function(state,title,url){if(typeof url==='string'&&url.charAt(0)==='#')return;return replace(state,title,url);};</script><script>${js.replace(/<\/script/gi, '<\\/script')}</script>
<script>document.addEventListener('click',function(event){var a=event.target.closest('a');if(!a)return;var href=a.getAttribute('href');if(['a.html','b.html','c.html','index.html','./a.html','./b.html','./c.html','./index.html'].includes(href)){event.preventDefault();var name=href.split('/').pop().split('.')[0];parent.postMessage({type:'kotto-concept',concept:name==='index'?'a':name},'*');}});</script></body>`);
  pages[concept] = html;
}
const payload = JSON.stringify({ pages, assets }).replace(/</g, '\\u003c');
const shell = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="${assets['/favicon.svg']}"><title>고또마케팅 — 세 가지 시안 직접 보기</title>
<style>*{box-sizing:border-box}body{margin:0;background:#efeee9;color:#222;font-family:Arial,sans-serif}.bar{height:58px;display:flex;align-items:center;justify-content:space-between;padding:0 20px;gap:16px;border-bottom:1px solid #bbb}.bar strong{font-size:13px}.bar nav{display:flex;gap:8px}.bar button{border:0;background:transparent;color:inherit;min-height:44px;padding:0 16px;font-size:14px;cursor:pointer}.bar button[aria-pressed=true]{background:#252622;color:#fff}.bar button:focus-visible{outline:3px solid #ef5034;outline-offset:2px}iframe{display:block;width:100%;height:calc(100dvh - 58px);border:0;background:#151613}@media(max-width:600px){.bar{height:94px;flex-direction:column;gap:0;align-items:stretch;padding:10px 12px 0}.bar strong{font-size:12px}.bar nav{justify-content:space-between}.bar button{padding:0 13px;font-size:13px}iframe{height:calc(100dvh - 94px)}}</style></head><body>
<header class="bar"><strong>고또마케팅 · 시안 비교</strong><nav aria-label="디자인 시안"><button data-concept="a" aria-pressed="true">A 몰입형</button><button data-concept="b" aria-pressed="false">B 에디토리얼</button><button data-concept="c" aria-pressed="false">C 실험형</button></nav></header>
<iframe id="site" title="고또마케팅 디자인 시안"></iframe>
<script>const data=${payload};const frame=document.getElementById('site');function show(concept){if(!data.pages[concept])return;let html=data.pages[concept];for(const [path,value] of Object.entries(data.assets)){html=html.split('__KOTTO_LOCAL__'+path).join(value);html=html.split('.'+path).join(value);html=html.split(path).join(value);}frame.srcdoc=html;document.querySelectorAll('[data-concept]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.concept===concept)));frame.title='고또마케팅 시안 '+concept.toUpperCase();history.replaceState(null,'','#'+concept);}document.querySelectorAll('[data-concept]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.concept)));window.addEventListener('message',e=>{if(e.source===frame.contentWindow&&e.data?.type==='kotto-concept')show(e.data.concept)});show(location.hash.slice(1)||'a');</script>
</body></html>`;
await writeFile(resolve(output, 'kotto-preview.html'), shell);
console.log(`Created ${resolve(output, 'kotto-preview.html')} (${Buffer.byteLength(shell)} bytes). No server or CDN required.`);
