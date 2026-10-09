import { build } from 'esbuild';
import { readFile, writeFile, mkdir, cp, rm, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

// Only the reviewed static output is copied, never the repository or environment.
const output = resolve('share');
await mkdir(output, { recursive: true });
await rm(resolve(output, 'site'), { recursive: true, force: true });
await cp(resolve('dist'), resolve(output, 'site'), { recursive: true });
const assets = {};
for (const [path, mime] of [
  ['fonts/KottoText.woff2','font/woff2'], ['fonts/KottoDisplay.woff2','font/woff2'],
  ['favicon.svg','image/svg+xml'], ['assets/vendor/email.min.js','application/javascript'],
]) assets[path] = `data:${mime};base64,${(await readFile(resolve('public',path))).toString('base64')}`;
for (const directory of ['art','films']) {
  for (const name of (await readdir(`public/${directory}`)).filter(name => /\.(webp|mp4)$/.test(name)).sort()) {
    const mime=name.endsWith('.mp4')?'video/mp4':'image/webp';
    assets[`${directory}/${name}`] = `data:${mime};base64,${(await readFile(resolve('public',directory,name))).toString('base64')}`;
  }
}
for (const name of (await readdir('public/evidence')).filter(name => /^\w+-\d+\.png$/.test(name)).sort()) {
  assets[`evidence/${name}`] = `data:image/png;base64,${(await readFile(resolve('public/evidence',name))).toString('base64')}`;
}

const result = await build({ entryPoints: ['src/main.js'], bundle: true, write: false, outdir: '/virtual',
  format: 'iife', minify: true, target: 'es2020', external: ['/fonts/*'], legalComments: 'inline' });
const js = result.outputFiles.find(file=>file.path.endsWith('.js')).text;
const css = result.outputFiles.find(file=>file.path.endsWith('.css')).text;
const pages = {};
for (const name of ['index','about','services','contact','location','service-blog','service-hpblog','service-instagram','service-place','service-daangn','service-cafe','service-website']) {
  pages[`${name}.html`] = (await readFile(`${name}.html`,'utf8'))
    .replace(/<script\b[^>]*type="module"[^>]*>[\s\S]*?<\/script>/g,'');
}
const payload = JSON.stringify({pages,assets,js,css}).replace(/</g,'\\u003c');
const shell = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>고또마케팅 — 홈페이지 전체 보기</title><link rel="icon" href="${assets['favicon.svg']}"><style>html,body{margin:0;width:100%;height:100%;background:#f3f0e8}iframe{display:block;width:100%;height:100dvh;border:0}</style></head><body><iframe id="site" title="고또마케팅 홈페이지"></iframe><noscript>이 간편 보기 파일은 자바스크립트를 사용합니다. 함께 제공하는 site 폴더는 일반 정적 웹사이트입니다.</noscript>
<script>const data=${payload};const frame=document.getElementById('site');
function render(){
 const route=(location.hash.slice(1)||'index.html');const [name,query='']=route.split('?');if(!data.pages[name]){location.replace('#index.html');return;}
 let html=data.pages[name];let css=data.css;
 for(const [path,value]of Object.entries(data.assets)){html=html.split('"/'+path+'"').join('"'+value+'"').split('"'+path+'"').join('"'+value+'"');css=css.split('/'+path).join(value);}
 html=html.replace('</head>',()=>'<style>'+css+'</style></head>');
 const globals='window.__KOTTO_STANDALONE__=true;window.__KOTTO_ASSETS__='+JSON.stringify(data.assets)+';window.__KOTTO_ROUTE_QUERY__='+JSON.stringify('?'+query)+';window.__KOTTO_EMAILJS_ASSET__='+JSON.stringify(data.assets['assets/vendor/email.min.js'])+';';
 const navigation='document.addEventListener("click",function(event){const a=event.target.closest("a[href]");if(!a)return;const href=a.getAttribute("href");const allowed='+JSON.stringify(Object.keys(data.pages))+';if(!allowed.includes(href.split("?")[0]))return;event.preventDefault();parent.postMessage({type:"kotto-page",route:href,newTab:event.ctrlKey||event.metaKey},"*");});';
 const code=globals+data.js+';'+navigation;
 html=html.replace('</body>',()=>'<scr'+'ipt>'+code.replace(/<\\/script/gi,'<\\\\/script')+'</scr'+'ipt></body>');
 frame.srcdoc=html;const title=html.match(/<title>([^<]*)<\\/title>/);if(title)document.title=title[1];
}
window.addEventListener('message',e=>{if(e.source!==frame.contentWindow||e.data?.type!=='kotto-page')return;const route=e.data.route;if(typeof route!=='string'||!data.pages[route.split('?')[0]])return;if(e.data.newTab){const url=new URL(location.href);url.hash=route;window.open(url.href,'_blank','noopener');}else if(location.hash.slice(1)===route){render();}else{location.hash=route;}});
window.addEventListener('hashchange',render);render();</script></body></html>`;
await writeFile(resolve(output,'kotto-full-site.html'),shell);
console.log(`Standalone 12-page viewer: ${Buffer.byteLength(shell).toLocaleString()} bytes`);
