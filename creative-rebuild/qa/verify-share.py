"""Verify the self-contained comparison page with networking switched off."""
import asyncio
import json
from pathlib import Path
from playwright.async_api import async_playwright

async def main():
    results=[]
    async with async_playwright() as p:
        browser=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        for width,height in [(1440,900),(390,844)]:
            context=await browser.new_context(viewport={'width':width,'height':height},has_touch=width<500,is_mobile=width<500)
            page=await context.new_page();errors=[];requests=[]
            page.on('pageerror',lambda e:errors.append(str(e)))
            page.on('request',lambda r:requests.append(r.url) if r.url.startswith(('http:','https:')) and not r.url.endswith('/kotto-preview.html') else None)
            await page.goto('http://127.0.0.1:4175/kotto-preview.html')
            await context.set_offline(True)
            for concept in 'abc':
                await page.locator(f'button[data-concept="{concept}"]').click()
                frame=page.frame_locator('#site');await frame.locator('h1').wait_for()
                child=page.frames[-1]
                await child.wait_for_function('window.__kottoMotion!==undefined')
                await child.evaluate('document.fonts.ready');await page.wait_for_timeout(1700)
                if concept=='c':
                    await frame.locator('button[data-channel="place"]').click();await page.wait_for_timeout(800)
                if concept=='b':
                    await frame.locator('button[data-service="place"]').click();await page.wait_for_timeout(600)
                selector={'a':'.a-stage','b':'.b-story','c':'.c-story'}[concept]
                top=await frame.locator(selector).evaluate('e=>e.getBoundingClientRect().top+scrollY')
                await child.evaluate('y=>window.scrollTo({top:y,behavior:"instant"})',top+400)
                await page.wait_for_timeout(800)
                state=await child.evaluate('({motion:window.__kottoMotion,overflow:document.documentElement.scrollWidth-innerWidth,images:[...document.images].map(i=>({loaded:i.complete&&i.naturalWidth>0}))})')
                state['motion'].pop('frameIntervals',None)
                await child.evaluate('window.scrollTo({top:0,behavior:"instant"})');await page.wait_for_timeout(600)
                # Native page anchors must also work from the embedded document.
                anchor={'a':'header a[href="#a-work"]','b':'.b-intro .b-text-link','c':'.c-intro .c-text-link'}[concept]
                if await frame.locator(anchor).is_visible():
                    await frame.locator(anchor).click();await page.wait_for_timeout(800)
                await child.evaluate('window.scrollTo({top:0,behavior:"instant"})');await page.wait_for_timeout(700)
                await page.screenshot(path=f'output/playwright/offline-{concept}-{width}.png')
                results.append({'width':width,'concept':concept,**state})
            results.append({'width':width,'errors':errors,'additionalHttpRequests':requests})
            print('width',width,'errors',errors,'additional HTTP requests',requests,flush=True)
            await context.close()
        await browser.close()
    passed=all(not r.get('errors') and not r.get('additionalHttpRequests') and not r.get('overflow',0) for r in results)
    report={'passed':passed,'mode':'HTML served once, networking then disabled. Managed Chromium blocks file:// navigation, so direct file opening is not claimed as tested.','results':results}
    Path('reports/offline-preview-qa.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    if not passed:raise SystemExit(1)

asyncio.run(main())
