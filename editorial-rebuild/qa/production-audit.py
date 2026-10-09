"""Validate the actual root deployment, search metadata, and existing contact contract."""
import argparse
import asyncio
import hashlib
import json
import posixpath
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
from urllib.request import urlopen

from playwright.async_api import async_playwright
import audit

ROOT = Path(__file__).resolve().parents[1]
audit.OUT = ROOT / 'output/playwright/production'


def validate_interactions(report):
    for case in report['cases']:
        if 'menu' in case:
            menu = case['menu']
            assert all(menu[key] for key in ['open', 'closedOnEscape', 'focusRestored', 'closeVisibleAtMenuBottom', 'closeButtonWorks']), menu
            assert all(menu['focusInside']) and menu['expanded'] == 'true' and menu['expandedAfter'] == 'false', menu
        if 'contact' in case:
            form = case['contact']
            assert form['emptyBlocked'] and form['emptySendCalls'] == 0 and form['consentBlocked'] and form['badPhoneBlocked'], form
            assert form['pending']['disabled'] and form['pending']['busy'] == 'true' and form['duplicateCalls'] == 1, form
            assert form['success']['reset'] and not form['success']['disabled'] and form['success']['statusVisible'], form
            assert form['failure']['preserved'] and not form['failure']['disabled'] and form['failure']['statusVisible'], form
            call = form['pending']['calls'][0]
            assert call['service'] == 'service_peqoeen' and call['template'] == 'template_v9eprz5', call
            assert set(call['payload']) == {'company', 'store_name', 'phone', 'region', 'budget', 'message'}, call


class Head(HTMLParser):
    def __init__(self):
        super().__init__(); self.meta = {}; self.canonical = []; self.local = []

    def handle_starttag(self, tag, attributes):
        a = dict(attributes)
        if tag == 'meta': self.meta[a.get('name') or a.get('property')] = a.get('content')
        if tag == 'link' and a.get('rel') == 'canonical': self.canonical.append(a['href'])
        for key in ['src', 'href', 'poster', 'data-video-desktop', 'data-video-mobile', 'data-video-poster-mobile']:
            value = a.get(key, '')
            parsed = urlsplit(value)
            if parsed.path and not parsed.scheme and not parsed.netloc:
                self.local.append(posixpath.normpath(unquote(parsed.path).lstrip('/')))


async def run(base):
    manifest = json.loads((ROOT/'reports/production-manifest.json').read_text())
    config = json.loads((ROOT/'production.config.json').read_text())
    report = {'base': base, 'origin': config['origin'], 'files': [], 'cases': []}
    for name, expected in manifest['files'].items():
        with urlopen(f'{base}/{name}') as response:
            data = response.read()
            assert response.status == 200 and hashlib.sha256(data).hexdigest() == expected, name
        report['files'].append(name)
        if name.endswith('.html'):
            head = Head(); head.feed(data.decode())
            canonical = config['origin'] + ('/' if name == 'index.html' else '/'+name)
            assert head.canonical == [canonical], (name, head.canonical)
            assert head.meta['robots'] == 'index,follow,max-image-preview:large'
            assert head.meta['google-site-verification'] == config['googleVerification']
            assert head.meta['naver-site-verification'] == config['naverVerification']
            assert head.meta['og:url'] == canonical
            assert head.meta['og:image'] == config['origin'] + config['shareImage']
            assert all(target in manifest['files'] for target in head.local), (name, head.local)
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
        for width, height in [(1440, 900), (390, 844)]:
            context = await browser.new_context(viewport={'width':width,'height':height}, is_mobile=width==390, has_touch=width==390)
            await audit.block_mail(context)
            for name in manifest['pages']:
                page = await context.new_page(); errors = []; bad = []
                page.on('pageerror', lambda e: errors.append(str(e)))
                page.on('response', lambda r: bad.append([r.url, r.status]) if r.status >= 400 else None)
                response = await page.goto(f'{base}/{name}', wait_until='networkidle')
                await audit.settle(page, 1200)
                await page.evaluate('''async()=>{await Promise.all([...document.images].filter(e=>e.getAttribute('src')).map(async e=>{e.loading='eager';await e.decode()}))}''')
                layout = await page.evaluate(audit.LAYOUT)
                assert response.status == 200 and not errors and not bad, (name, errors, bad)
                assert layout['width'] == layout['scrollWidth'] and len(layout['h1']) == 1, (name, layout)
                assert not layout['brokenAnchors'], (name, layout['brokenAnchors'])
                case = {'page': name, 'width': width, 'overflow':0, 'errors':errors, 'httpErrors':bad, 'h1':layout['h1']}
                if name == 'index.html':
                    case['screenshot'] = await audit.capture(page, f'home-{width}')
                    video = page.locator('#home-brand-video')
                    await page.wait_for_function('document.querySelector("video").currentTime > 0.1')
                    case['video'] = await video.evaluate('e=>({time:e.currentTime,width:e.videoWidth,height:e.videoHeight})')
                    await page.locator('.brand-video-control').click()
                    assert await video.evaluate('e=>e.paused')
                    case['menu'] = await audit.menu_check(page)
                if name == 'contact.html':
                    case['contact'] = await audit.contact_check(page)
                report['cases'].append(case)
                print(f'{width} {name}: passed', flush=True)
                await page.close()
            await context.close()
        await browser.close()
    validate_interactions(report)
    report['passed'] = True
    (ROOT/'reports/production-qa.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n')
    print('Production metadata, 67 files, 24 page cases, video/menu/contact checks passed.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(); parser.add_argument('--base', default='http://127.0.0.1:4190')
    asyncio.run(run(parser.parse_args().base.rstrip('/')))
