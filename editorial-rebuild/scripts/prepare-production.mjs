import { readFile, writeFile, mkdir, cp, readdir } from 'node:fs/promises';
import { resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

// Prepare a separate, reviewable release. Never overwrite the checkout here.
const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repo = resolve(project, '..');
const output = resolve(project, 'production');
const config = JSON.parse(await readFile(resolve(project, 'production.config.json'), 'utf8'));
const origin = new URL(config.origin);
if (origin.protocol !== 'https:' || origin.pathname !== '/') throw new Error('Expected an HTTPS site origin');
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
const pages = (await readdir(resolve(project, 'dist'))).filter(name => name.endsWith('.html')).sort();
if (pages.length !== 12) throw new Error('Build all 12 approved pages before preparing production');

await mkdir(output, { recursive: true });
// Copy only the current build manifest; unrelated source and review material stay out.
const files = [];
async function copyBuild(directory) {
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const source = resolve(directory, item.name);
    if (item.isDirectory()) await copyBuild(source);
    else if (item.isFile()) {
      const name = relative(resolve(project, 'dist'), source);
      await mkdir(dirname(resolve(output, name)), { recursive: true });
      await cp(source, resolve(output, name));
      files.push(name);
    } else throw new Error(`Unexpected build entry: ${source}`);
  }
}
await copyBuild(resolve(project, 'dist'));
for (const name of pages) {
  const path = resolve(output, name);
  let html = await readFile(path, 'utf8');
  const canonical = new URL(name === 'index.html' ? '/' : `/${name}`, origin).href;
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const description = html.match(/<meta name="description" content="([^"]+)"/i)?.[1];
  if (!title || !description || !html.includes('content="noindex,nofollow"')) throw new Error(`Unexpected preview head: ${name}`);
  html = html.replace('content="noindex,nofollow"', 'content="index,follow,max-image-preview:large"');
  const social = `<link rel="canonical" href="${canonical}"><meta name="google-site-verification" content="${escape(config.googleVerification)}"><meta name="naver-site-verification" content="${escape(config.naverVerification)}"><meta property="og:type" content="website"><meta property="og:locale" content="ko_KR"><meta property="og:site_name" content="고또마케팅"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${new URL(config.shareImage, origin).href}"><meta property="og:image:width" content="${config.shareImageWidth}"><meta property="og:image:height" content="${config.shareImageHeight}"><meta name="twitter:card" content="summary_large_image">`;
  await writeFile(path, html.replace('</head>', `${social}</head>`));
}
const extra = {
  CNAME: `${origin.hostname}\n`,
  'robots.txt': `User-agent: *\nAllow: /\nDisallow: /editorial-rebuild/\nDisallow: /creative-rebuild/\nDisallow: /.agents/\nDisallow: /docs/\nDisallow: /tests/\nDisallow: /output/\nSitemap: ${origin.origin}/sitemap.xml\n`,
  'sitemap.xml': `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(name => `  <url><loc>${new URL(name === 'index.html' ? '/' : `/${name}`, origin).href}</loc><lastmod>${new Date().toISOString().slice(0,10)}</lastmod></url>`).join('\n')}\n</urlset>\n`,
  '_config.yml': '# GitHub Pages serves the reviewed root files; authoring and QA stay in Git.\nexclude:\n  - editorial-rebuild\n  - creative-rebuild\n  - .agents\n  - docs\n  - tests\n  - output\n  - node_modules\n  - README.md\n  - package.json\n  - package-lock.json\n',
};
for (const [name, content] of Object.entries(extra)) { await writeFile(resolve(output, name), content); files.push(name); }
const sharePath = config.shareImage.replace(/^\//, '');
await mkdir(dirname(resolve(output, sharePath)), { recursive: true });
await cp(resolve(repo, sharePath), resolve(output, sharePath));
files.push(sharePath);
const manifest = {};
for (const name of files.sort()) manifest[name] = createHash('sha256').update(await readFile(resolve(output, name))).digest('hex');
await writeFile(resolve(project, 'reports/production-manifest.json'), JSON.stringify({ origin: origin.origin, pages, files: manifest }, null, 2) + '\n');
console.log(`Prepared ${pages.length} production pages and ${files.length} reviewed files in ${output}`);
