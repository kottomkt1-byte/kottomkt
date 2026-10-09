"""Exercise all portable routes, original evidence and video with networking off."""
import asyncio
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]
NAMES = ['index', 'about', 'services', 'service-blog', 'service-hpblog',
         'service-instagram', 'service-place', 'service-daangn', 'service-cafe',
         'service-website', 'contact', 'location']
VIEWER = 'http://127.0.0.1:4180/share/kotto-full-site.html'


async def current_frame(page):
    handle = await page.locator('#site').element_handle()
    frame = await handle.content_frame()
    await frame.wait_for_function('document.documentElement.dataset.ready === "true"')
    await frame.evaluate('document.fonts.ready')
    return frame


async def navigate(page, route):
    if await page.evaluate('location.hash.slice(1)') != route:
        async with page.expect_event('framenavigated', predicate=lambda frame: frame.parent_frame is not None):
            await page.evaluate('route => location.hash = route', route)
    frame = await current_frame(page)
    await page.wait_for_timeout(1350)
    return frame


async def check_originals(frame, prefix, total):
    """Check each exact data URI against its embedded source, not just a decoded image."""
    for index in range(total):
        expected = f'evidence/{prefix}-{index + 1:02}.png'
        image = frame.locator('.ev-dialog-image')
        await image.evaluate('image => image.decode()')
        actual = await image.evaluate('''(image, expected) => ({
          exactSource: image.src === window.__KOTTO_ASSETS__[expected],
          embedded: image.src.startsWith('data:image/png;base64,'),
          decoded: image.complete && image.naturalWidth > 0
        })''', expected)
        assert all(actual.values()), (expected, actual)
        print(f'  exact original: {expected}', flush=True)
        if index < total - 1:
            await frame.locator('[data-ev-dialog-next]').click()
    await frame.locator('[data-ev-close]').click()


async def check_video(frame, width):
    """Use the real playback control and decoded frames; no mocked media API."""
    await frame.evaluate('scrollTo(0, 0)')
    video = frame.locator('#home-brand-video')
    button = frame.locator('[data-brand-video] .brand-video-control')
    await button.wait_for(state='visible')
    if await video.evaluate('video => video.paused'):
        await button.click()
    await frame.wait_for_function('''() => {
      const video = document.querySelector('#home-brand-video');
      return video.readyState >= 2 && !video.paused && video.videoWidth > 0;
    }''')
    source = await video.evaluate('''(video, width) => {
      const key = width === 390 ? 'films/kotto-studio-mobile.mp4' : 'films/kotto-studio-desktop.mp4';
      return { embedded: video.currentSrc.startsWith('data:video/mp4;base64,'),
        exactSource: video.currentSrc === window.__KOTTO_ASSETS__[key],
        muted: video.muted, videoWidth: video.videoWidth, videoHeight: video.videoHeight,
        duration: video.duration, source: key };
    }''', width)
    assert source['embedded'] and source['exactSource'] and source['muted'], source
    before = await video.evaluate('video => video.currentTime')
    await frame.wait_for_timeout(500)
    after = await video.evaluate('video => video.currentTime')
    advanced = (after - before + source['duration']) % source['duration']
    assert advanced > .1, ('embedded video did not advance', before, after)
    await button.click()
    await frame.wait_for_function('document.querySelector("#home-brand-video").paused')
    paused_at = await video.evaluate('video => video.currentTime')
    await frame.wait_for_timeout(350)
    assert abs(await video.evaluate('video => video.currentTime') - paused_at) < .05
    assert await button.get_attribute('aria-pressed') == 'false'
    await button.click()
    await frame.wait_for_function('!document.querySelector("#home-brand-video").paused')
    await frame.wait_for_timeout(250)
    assert await button.get_attribute('aria-pressed') == 'true'
    await button.click()
    return {**source, 'playbackAdvancedSeconds': round(advanced, 3),
            'pauseHeldTime': True, 'resumedByControl': True}


async def run():
    report = {'mode': 'HTTP load once, then browser offline; file:// is blocked by managed Chromium and is not claimed as tested', 'results': []}
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
        for width, height in [(1440, 900), (390, 844)]:
            context = await browser.new_context(viewport={'width': width, 'height': height}, has_touch=width == 390, is_mobile=width == 390)
            await context.route('**/api.emailjs.com/**', lambda route: route.abort())
            page = await context.new_page()
            errors, requests = [], []
            page.on('pageerror', lambda error: errors.append(str(error)))
            response = await page.goto(VIEWER, wait_until='networkidle')
            source = await response.body()
            report['results'].append({'width': width, 'viewerBytes': len(source),
                                      'viewerSha256': hashlib.sha256(source).hexdigest(),
                                      'loadedAt': datetime.now(timezone.utc).isoformat()})
            await context.set_offline(True)
            page.on('request', lambda request: requests.append(request.url) if request.url.startswith('http') else None)
            for name in NAMES:
                frame = await navigate(page, name + '.html')
                # The empty dialog image is intentionally excluded until it opens.
                await frame.evaluate('''async () => {
                  await Promise.all([...document.images].filter(i => i.getAttribute('src')).map(async i => {
                    i.loading = 'eager'; await i.decode();
                  }));
                }''')
                await frame.evaluate('scrollTo(0, 0)')
                metrics = await frame.evaluate('''({width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
                  h1: document.querySelector('h1').textContent,
                  images: [...document.images].filter(i => i.getAttribute('src')).map(i => i.complete && i.naturalWidth > 0)})''')
                assert metrics['width'] == metrics['scrollWidth'], (name, metrics)
                assert all(metrics['images']), (name, metrics)
                if name == 'index':
                    assert await frame.locator('[data-ev-portfolio]').count() == 0, 'Homepage must not contain the portfolio gallery'
                report['results'].append({'width': width, 'page': name, **metrics})
                print(f'{width}: {name} route and image decode passed', flush=True)

            frame = await navigate(page, 'index.html')
            assert await frame.locator('[data-ev-portfolio]').count() == 0
            video = await check_video(frame, width)
            print(f'{width}: embedded video play/pause/resume passed', flush=True)
            report['results'].append({'width': width, 'homeHasNoPortfolioGallery': True, 'offlineBrandVideo': video})

            # The seven actual projects live on their relevant service page.
            frame = await navigate(page, 'service-hpblog.html')
            assert await frame.locator('.ev-portfolio [data-ev-project]').count() == 7
            await frame.locator('.ev-portfolio [data-ev-select="0"]').click()
            await frame.locator('.ev-portfolio .ev-project.is-active [data-evidence-open]').click()
            await check_originals(frame, 'portfolio', 7)

            # Home retains 15 reviews and eight inquiries, all original captures.
            frame = await navigate(page, 'index.html')
            for kind, prefix, total in [('review', 'review', 15), ('inquiry', 'chat', 8)]:
                assert await frame.locator(f'[data-ev-voice="{kind}"]').count() == total
                await frame.locator(f'[data-ev-filter="{kind}"]').click()
                await frame.locator(f'.ev-voice:not([hidden]) [data-evidence-open="{kind}"]').first.click()
                await frame.locator('[data-ev-zoom]').click()
                assert await frame.locator('.ev-dialog').evaluate('e => e.classList.contains("is-zoomed")')
                await frame.locator('[data-ev-zoom]').click()
                await check_originals(frame, prefix, total)
            report['results'].append({'width': width, 'offlineOriginalImages': 30,
                                      'portfolioOnHpblog': 7, 'reviewsOnHome': 15,
                                      'inquiriesOnHome': 8, 'dialogZoom': True})

            await frame.evaluate('scrollTo(0, 0)')
            await frame.wait_for_timeout(1300)
            await frame.locator('.hero-cta[href="services.html"]').click()
            await page.wait_for_function('location.hash === "#services.html"')
            frame = await current_frame(page)
            await frame.locator('.sv-directory-links a').first.click()
            await page.wait_for_function('location.hash === "#service-blog.html"')
            frame = await current_frame(page)
            await frame.locator('.sv-detail-heading .sv-text-link').click()
            await page.wait_for_function('location.hash === "#contact.html?service=blog"')
            frame = await current_frame(page)
            assert '브랜드 블로그' in await frame.locator('#message').input_value()
            await page.go_back()
            await page.wait_for_function('location.hash === "#service-blog.html"')
            await current_frame(page)
            report['results'].append({'width': width, 'errors': errors,
                                      'additionalHttpRequests': requests,
                                      'navigationAndBack': True, 'queryPrefill': True})
            assert not errors, errors
            assert not requests, requests
            print(f'{width}: originals, navigation and zero additional HTTP passed', flush=True)
            await context.close()
        await browser.close()
    report['passed'] = True
    (ROOT / 'reports/standalone-qa.json').write_text(json.dumps(report, ensure_ascii=False, indent=2))
    print('Portable viewer passed 12 routes × 2 widths, 30 exact embedded originals, real offline video play/pause, navigation, history, query prefill and zero additional HTTP requests.')


if __name__ == '__main__':
    asyncio.run(run())
