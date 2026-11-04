"""Validate the actual root deployment, search metadata, and existing contact contract."""
import argparse
import asyncio
import hashlib
import json
import posixpath
from datetime import datetime, timezone
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


async def model_image_flow(context, base, width):
    """Follow the published service journey without contacting the mail API."""
    page = await context.new_page()
    result = {'width': width, 'errors': [], 'httpErrors': [], 'mailApiRequests': []}
    page.on('pageerror', lambda error: result['errors'].append(str(error)))
    page.on('response', lambda response: result['httpErrors'].append([response.url, response.status]) if response.status >= 400 else None)
    page.on('request', lambda request: result['mailApiRequests'].append(request.url) if 'api.emailjs.com' in request.url else None)
    try:
        await page.goto(f'{base}/index.html', wait_until='networkidle')
        await audit.settle(page, 1600)
        result['homeListing'] = await page.locator('.home-service-list a[href="service-model-images.html"]').count() == 1
        assert result['homeListing']
        await page.locator('.hero-cta[href="services.html"]').click()
        await page.wait_for_url('**/services.html')
        await audit.settle(page, 800)
        result['homeToServices'] = True
        link = page.locator('.sv-directory-links a[href="service-model-images.html"]')
        await link.focus()
        await page.wait_for_timeout(850)
        result['keyboardPreview'] = await page.locator('.sv-object-stack .is-active').get_attribute('data-sv-object')
        assert result['keyboardPreview'] == 'model-images'
        result['directoryScreenshot'] = await audit.capture(page, f'model-service-directory-{width}')
        await page.keyboard.press('Enter')
        await page.wait_for_url('**/service-model-images.html')
        await audit.settle(page, 1600)
        result['servicesToModelImages'] = await page.locator('#mi-title').is_visible()
        assert result['servicesToModelImages']
        result['detailScreenshot'] = await audit.capture(page, f'model-service-detail-{width}')
        await page.locator('.mi-hero-copy a[href="contact.html?service=model-images"]').click()
        await page.wait_for_url('**/contact.html?service=model-images')
        await audit.settle(page, 800)
        result['contactPrefill'] = await page.locator('[name="message"]').input_value()
        assert result['contactPrefill'] == '안경테·선글라스 모델 이미지 제작에 대해 상담받고 싶습니다.'
        result['mockSendCalls'] = await page.evaluate('()=>window.__mailCalls?.length||0')
        assert result['mockSendCalls'] == 0 and not result['mailApiRequests']
        assert not result['errors'] and not result['httpErrors'], result
        result['passed'] = True
        return result
    finally:
        await page.close()


async def run(base):
    manifest = json.loads((ROOT/'reports/production-manifest.json').read_text())
    config = json.loads((ROOT/'production.config.json').read_text())
    report = {'checkedAt': datetime.now(timezone.utc).isoformat(), 'base': base, 'origin': config['origin'],
              'note': 'Local production build QA. EmailJS SDK mocked and mail API blocked; no live messages sent.',
              'files': [], 'cases': [], 'serviceFlows': [], 'passed': False}
    report_path = ROOT/'reports/production-qa.json'
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n')
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
                page = await context.new_page(); errors = []; bad = []; mail_requests = []
                page.on('pageerror', lambda e: errors.append(str(e)))
                page.on('response', lambda r: bad.append([r.url, r.status]) if r.status >= 400 else None)
                page.on('request', lambda r: mail_requests.append(r.url) if 'api.emailjs.com' in r.url else None)
                response = await page.goto(f'{base}/{name}', wait_until='networkidle')
                await audit.settle(page, 1200)
                await page.evaluate('''async()=>{await Promise.all([...document.images].filter(e=>e.getAttribute('src')).map(async e=>{e.loading='eager';await e.decode()}))}''')
                layout = await page.evaluate(audit.LAYOUT)
                assert response.status == 200 and not errors and not bad, (name, errors, bad)
                assert layout['width'] == layout['scrollWidth'] and len(layout['h1']) == 1, (name, layout)
                assert not layout['brokenAnchors'], (name, layout['brokenAnchors'])
                case = {'page': name, 'width': width, 'overflow':0, 'errors':errors, 'httpErrors':bad,
                        'mailApiRequests': mail_requests, 'h1':layout['h1'],
                        'screenshot': await audit.capture(page, f'{Path(name).stem}-{width}')}
                if name == 'index.html':
                    video = page.locator('#home-brand-video')
                    await page.wait_for_function('document.querySelector("video").currentTime > 0.1')
                    case['video'] = await video.evaluate('e=>({time:e.currentTime,width:e.videoWidth,height:e.videoHeight})')
                    await page.locator('.brand-video-control').click()
                    assert await video.evaluate('e=>e.paused')
                    case['menu'] = await audit.menu_check(page)
                    assert 'service-model-images.html' in case['menu']['links'], case['menu']
                if name == 'contact.html':
                    case['contact'] = await audit.contact_check(page)
                assert not errors and not bad and not mail_requests, (name, errors, bad, mail_requests)
                report['cases'].append(case)
                report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n')
                print(f'{width} {name}: passed', flush=True)
                await page.close()
            report['serviceFlows'].append(await model_image_flow(context, base, width))
            await context.close()
        await browser.close()
    validate_interactions(report)
    report['passed'] = True
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n')
    print(f"Production metadata, {len(report['files'])} files, {len(report['cases'])} page cases, "
          f"video/menu/contact checks and {len(report['serviceFlows'])} model-image service flows passed.")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(); parser.add_argument('--base', default='http://127.0.0.1:4190')
    asyncio.run(run(parser.parse_args().base.rstrip('/')))
