"""Check the homepage background film and its loading policy without overlays."""
import asyncio
import json
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output' / 'brand-film' / 'browser'
REPORT = ROOT / 'reports' / 'kotto-seen-film-qa.json'
BASE = 'http://127.0.0.1:4186/'


async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    results = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
        for width, mode in [(1440, 'normal'), (390, 'normal'), (320, 'normal'), (390, 'reduced'), (1440, 'save-data'), (390, 'no-js')]:
            height = 900 if width == 1440 else 844
            ctx = await browser.new_context(viewport={'width': width, 'height': height},
                reduced_motion='reduce' if mode == 'reduced' else 'no-preference',
                java_script_enabled=mode != 'no-js')
            if mode == 'save-data':
                await ctx.add_init_script("Object.defineProperty(navigator.connection, 'saveData', {get:()=>true})")
            page = await ctx.new_page()
            errors, full_requests = [], []
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.on('request', lambda req: full_requests.append(req.url) if 'kotto-seen-brand-film.mp4' in req.url else None)
            await page.goto(BASE, wait_until='networkidle')
            hero = page.locator('#home-brand-video')
            film = page.locator('.brand-video-full-player')
            for selector in ['.brand-video-actions', '.brand-video-control', '[data-brand-video-open]', '.brand-video-caption']:
                assert await page.locator('.home-hero-media ' + selector).is_hidden(), selector
            assert len(full_requests) == 0
            assert await film.get_attribute('src') is None
            assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'horizontal overflow'
            item = {'viewport': [width, height], 'mode': mode, 'overlaysHidden': True}
            if mode != 'normal':
                assert await hero.get_attribute('src') is None
                assert await hero.evaluate('v=>v.paused && v.currentTime === 0')
                item['heroPosterOnly'] = True
            else:
                await page.wait_for_function("document.querySelector('#home-brand-video').readyState >= 2 && !document.querySelector('#home-brand-video').paused")
                item['hero'] = await hero.evaluate('(v)=>({source:v.currentSrc.split("/").pop(),width:v.videoWidth,height:v.videoHeight,duration:v.duration,muted:v.muted,loop:v.loop})')
                assert item['hero']['source'] == ('kotto-seen-hero-mobile.mp4' if width <= 700 else 'kotto-seen-hero-desktop.mp4')
                assert item['hero']['muted'] and item['hero']['loop'] and item['hero']['duration'] == 22
                before = await hero.evaluate('v=>v.currentTime')
                await page.wait_for_timeout(450)
                after = await hero.evaluate('v=>v.currentTime')
                assert after > before
                item['heroTimeAdvanced'] = [before, after]
            await page.screenshot(path=str(OUT / f'{width}-{mode}-home.png'))
            assert len(full_requests) == 0
            item['fullFilmRequests'] = len(full_requests)
            item['javascriptErrors'] = errors
            assert not errors, errors
            results.append(item)
            await ctx.close()
        await browser.close()
    REPORT.write_text(json.dumps({'scope': 'Integrated production homepage and actual encoded media, Chromium desktop/mobile viewport emulation', 'date': '2026-11-06', 'results': results, 'failures': []}, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'cases': len(results), 'failures': [], 'report': str(REPORT)}))


asyncio.run(main())
