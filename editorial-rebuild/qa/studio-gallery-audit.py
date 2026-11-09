"""Exercise the production homepage reel, including native/no-JS navigation."""
import asyncio
import json
import os
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / 'reports' / 'studio-gallery-qa.json'
BASE = os.environ.get('STUDIO_GALLERY_BASE', 'http://127.0.0.1:4186/')
EXPECTED = [
    'tf1381-01a-men-03', 'tf5922-020-women-02', 'tf1387-52f-women-03',
    'tf1289-01a-women-03', 'tf1291-28a-women-03', 'tf6032-001-women-02',
]


async def position(reel):
    return await reel.evaluate('(r)=>({left:r.scrollLeft,max:r.scrollWidth-r.clientWidth})')


async def settle(page):
    # Native smooth scrolling and CSS scroll snapping both need to finish.
    await page.wait_for_timeout(700)


async def run_case(browser, width, mode):
    ctx = await browser.new_context(viewport={'width': width, 'height': 900},
        reduced_motion='reduce' if mode == 'reduced' else 'no-preference',
        java_script_enabled=mode != 'no-js')
    page = await ctx.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    result = {'width': width, 'mode': mode, 'passed': False}
    try:
        response = await page.goto(BASE, wait_until='networkidle')
        assert response.status == 200
        reel = page.locator('#home-work-reel')
        links = reel.locator('.work-item')
        await reel.scroll_into_view_if_needed()
        await settle(page)
        assert await links.count() == 6
        assert await reel.get_attribute('tabindex') == '0'
        assert await reel.get_attribute('aria-label')
        assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'page overflow'
        dimensions = await position(reel)
        assert dimensions['max'] > 0, 'reel must scroll horizontally'
        result['maxScroll'] = dimensions['max']
        sources = await links.locator('img').evaluate_all('(images)=>images.map(i=>i.getAttribute("src"))')
        assert sources == [f'portfolio/model-images/thumbnails/{name}.webp' for name in EXPECTED], sources
        result['imageSources'] = sources

        controls = page.locator('.work-reel-controls')
        if mode == 'no-js':
            assert await controls.is_hidden(), 'inert JS-only controls should be hidden'
            result['controlsHidden'] = True
        else:
            assert await controls.is_visible()
            previous = controls.locator('[data-work-prev]')
            next_button = controls.locator('[data-work-next]')
            assert await previous.is_disabled()
            forward = [dimensions['left']]
            for _ in range(8):
                if await next_button.is_disabled():
                    break
                await next_button.click()
                await settle(page)
                new = (await position(reel))['left']
                assert new > forward[-1] + 3, f'next did not advance: {forward[-1]} -> {new}'
                forward.append(new)
            assert await next_button.is_disabled(), 'next must reach end'
            end = await position(reel)
            assert abs(end['left'] - end['max']) <= 3, end
            assert await controls.locator('[data-work-count]').inner_text() == '06 / 06'
            backward = [end['left']]
            for _ in range(8):
                if await previous.is_disabled():
                    break
                await previous.click()
                await settle(page)
                new = (await position(reel))['left']
                assert new < backward[-1] - 3, f'previous did not retreat: {backward[-1]} -> {new}'
                backward.append(new)
            assert await previous.is_disabled(), 'previous must reach start'
            assert (await position(reel))['left'] <= 3
            assert await controls.locator('[data-work-count]').inner_text() == '01 / 06'
            result['nextPositions'] = forward
            result['previousPositions'] = backward
            if mode == 'reduced':
                assert await page.evaluate('matchMedia("(prefers-reduced-motion: reduce)").matches')
                await next_button.click()
                immediate = (await position(reel))['left']
                await settle(page)
                final = (await position(reel))['left']
                assert immediate > 3 and abs(immediate - final) <= 3, [immediate, final]
                result['reducedMotionImmediateScroll'] = [immediate, final]
                await previous.click()
                await settle(page)

        # Exercise the browser's keyboard scrolling, without custom event handlers.
        await reel.focus()
        for _ in range(20):
            await page.keyboard.press('ArrowRight')
            await page.wait_for_timeout(20)
        await settle(page)
        keyboard_right = (await position(reel))['left']
        assert keyboard_right > 3, 'focused reel must respond to native ArrowRight'
        for _ in range(20):
            await page.keyboard.press('ArrowLeft')
            await page.wait_for_timeout(20)
        await settle(page)
        keyboard_left = (await position(reel))['left']
        assert keyboard_left < keyboard_right - 3, 'focused reel must respond to native ArrowLeft'
        result['keyboardScroll'] = [keyboard_right, keyboard_left]

        # Tabbing reaches every actual image, including offscreen cards with JS disabled.
        await reel.focus()
        visited = []
        for index in range(6):
            await page.keyboard.press('Tab')
            link = links.nth(index)
            assert await link.evaluate('(e)=>e===document.activeElement'), f'keyboard focus missed image {index + 1}'
            await settle(page)
            img = link.locator('img')
            await page.wait_for_function('(i)=>i.complete && i.naturalWidth>0', arg=await img.element_handle())
            data = await link.evaluate('''(a)=>{
                const r=a.closest('.work-reel').getBoundingClientRect(), b=a.getBoundingClientRect(),i=a.querySelector('img');
                return {visible:b.right>r.left && b.left<r.right, imageLoaded:i.complete&&i.naturalWidth>0, naturalWidth:i.naturalWidth, alt:i.alt, href:a.getAttribute('href')};
            }''')
            assert data['visible'] and data['imageLoaded'] and data['alt'], data
            assert data['href'] == 'service-model-images.html#model-portfolio'
            visited.append(data)
        result['keyboardImageVisits'] = visited
        assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'page overflow after navigation'
        assert not errors, errors
        result['javascriptErrors'] = errors
        result['passed'] = True
    except Exception as error:
        result['failure'] = str(error)
        result['javascriptErrors'] = errors
    finally:
        await ctx.close()
    return result


async def main():
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
        results = []
        for width in [1440, 768, 390, 320]:
            for mode in ['normal', 'reduced', 'no-js']:
                result = await run_case(browser, width, mode)
                results.append(result)
                print(json.dumps({key:result[key] for key in ['width', 'mode', 'passed', 'failure'] if key in result}), flush=True)
        await browser.close()
    failures = [{key:r[key] for key in ['width', 'mode', 'failure']} for r in results if not r['passed']]
    REPORT.write_text(json.dumps({'scope': 'Production homepage reel: end/start button regression, native keyboard and no-JS image access, reduced motion, overflow and browser errors', 'date': '2026-11-09', 'base': BASE, 'results': results, 'failures': failures}, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'cases':len(results), 'failures':failures, 'report':str(REPORT)}))
    assert not failures, failures


asyncio.run(main())
