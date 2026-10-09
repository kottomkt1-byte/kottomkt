"""Exercise the portable viewer after disconnecting the browser from networking."""
import asyncio
import json
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]
NAMES = ['index','about','services','service-blog','service-hpblog','service-instagram','service-place','service-daangn','service-cafe','service-website','contact','location']

async def run():
    report = {'mode': 'HTTP load once, then browser offline; file:// is blocked by managed Chromium and is not claimed as tested', 'results': []}
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        for width,height in [(1440,900),(390,844)]:
            context = await browser.new_context(viewport={'width':width,'height':height},has_touch=width==390,is_mobile=width==390)
            await context.route('**/api.emailjs.com/**',lambda route:route.abort())
            page = await context.new_page()
            errors,requests=[],[]
            page.on('pageerror',lambda error:errors.append(str(error)))
            await page.goto('http://127.0.0.1:4180/share/kotto-full-site.html',wait_until='networkidle')
            await context.set_offline(True)
            page.on('request',lambda request:requests.append(request.url) if request.url.startswith('http') else None)
            for name in NAMES:
                await page.evaluate('route=>location.hash=route',name+'.html')
                await page.wait_for_timeout(80)
                frame=page.frames[1]
                await frame.wait_for_function('document.documentElement.dataset.ready === "true"')
                await page.wait_for_timeout(1350)
                # Decode every authored source, including the initially hidden
                # gallery items. The empty dialog image gets its source on open.
                await frame.evaluate('''async()=>{await Promise.all([...document.images].filter(i=>i.hasAttribute('src')).map(async i=>{i.loading='eager';await i.decode()}))}''')
                await frame.evaluate('scrollTo(0,0)')
                metrics=await frame.evaluate('({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,h1:document.querySelector("h1").textContent,images:[...document.images].filter(i=>i.hasAttribute("src")).map(i=>i.complete&&i.naturalWidth>0)})')
                assert metrics['width']==metrics['scrollWidth'],(name,metrics)
                assert all(metrics['images']),(name,metrics)
                report['results'].append({'width':width,'page':name,**metrics})
            await page.evaluate('location.hash="index.html"')
            await page.wait_for_timeout(1400)
            frame=page.frames[1]
            # All thirty full-size originals must also open without networking.
            await frame.locator('.ev-portfolio .ev-project.is-active [data-evidence-open]').click()
            for i in range(7):
                image=frame.locator('.ev-dialog-image')
                await image.evaluate('image=>image.decode()')
                assert await image.evaluate('i=>i.src.startsWith("data:image/png;")&&i.naturalWidth>0')
                await frame.locator('[data-ev-dialog-next]').click()
            await frame.locator('[data-ev-close]').click()
            for kind,total in [('review',15),('inquiry',8)]:
                await frame.locator(f'[data-ev-filter="{kind}"]').click()
                await frame.locator(f'.ev-voice:not([hidden]) [data-evidence-open="{kind}"]').first.click()
                for i in range(total):
                    image=frame.locator('.ev-dialog-image')
                    await image.evaluate('image=>image.decode()')
                    assert await image.evaluate('i=>i.src.startsWith("data:image/png;")&&i.naturalWidth>0')
                    await frame.locator('[data-ev-dialog-next]').click()
                await frame.locator('[data-ev-zoom]').click()
                assert await frame.locator('.ev-dialog').evaluate('e=>e.classList.contains("is-zoomed")')
                await frame.locator('[data-ev-close]').click()
            report['results'].append({'width':width,'offlineOriginalImages':30,'dialogZoom':True})
            await frame.evaluate('scrollTo(0,0)')
            await frame.wait_for_timeout(1300)
            await frame.locator('.hero-intro a[href="services.html"]').click()
            await page.wait_for_function('location.hash==="#services.html"')
            await page.wait_for_timeout(1300)
            await page.frames[1].locator('.sv-directory-links a').first.click()
            await page.wait_for_function('location.hash==="#service-blog.html"')
            await page.wait_for_timeout(1400)
            await page.frames[1].locator('.sv-detail-heading .sv-text-link').click()
            await page.wait_for_function('location.hash==="#contact.html?service=blog"')
            await page.wait_for_timeout(1400)
            assert '브랜드 블로그' in await page.frames[1].locator('#message').input_value()
            await page.go_back()
            await page.wait_for_function('location.hash==="#service-blog.html"')
            report['results'].append({'width':width,'errors':errors,'additionalHttpRequests':requests,'navigationAndBack':True,'queryPrefill':True})
            assert not errors,errors
            assert not requests,requests
            await context.close()
        await browser.close()
    report['passed']=True
    (ROOT/'reports/standalone-qa.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
    print('Portable viewer passed 12 routes × 2 widths, internal navigation, history, query prefill, zero additional HTTP requests.')

asyncio.run(run())
