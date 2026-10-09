#!/usr/bin/env python3
"""Final build checks: no JS fallback, real image resources, metrics, native wheel timing."""
import asyncio
import json
from datetime import datetime, timezone
from pathlib import Path

from playwright.async_api import async_playwright
import audit as existing
import importlib.util

spec=importlib.util.spec_from_file_location('evidence_audit',Path(__file__).with_name('evidence-audit.py'))
evidence=importlib.util.module_from_spec(spec);spec.loader.exec_module(evidence)

APP=Path(__file__).resolve().parents[1]
OUT=APP/'output/playwright/visual-update'
BASE='http://127.0.0.1:4181'
EXPECTED=[['안경 제작 사례 작성','5,000건+'],['메인 품목 재계약률','100%'],['전문성 만족도','98%'],['에실로 얼티밋 전국 순위','2위']]


async def screenshot(page,name):
    file=OUT/f'{name}.png'
    await page.screenshot(path=str(file))
    return str(file.relative_to(APP))


async def measure(page,selector):
    section=page.locator(selector)
    geometry=await section.evaluate('e=>({top:e.getBoundingClientRect().top+scrollY,height:e.offsetHeight})')
    start=max(0,geometry['top']-page.viewport_size['height']*.5)
    end=geometry['top']+geometry['height']-page.viewport_size['height']*.6
    await page.evaluate('(y)=>scrollTo(0,y)',start)
    await page.wait_for_timeout(1000)
    await page.mouse.move(80,page.viewport_size['height']*.7)
    await page.evaluate('''()=>{window.__frameSample={times:[],running:true};let last;
      function tick(t){if(last)window.__frameSample.times.push(t-last);last=t;if(window.__frameSample.running)requestAnimationFrame(tick)}requestAnimationFrame(tick)}''')
    steps=60
    for _ in range(steps):
        await page.mouse.wheel(0,(end-start)/steps)
        await page.wait_for_timeout(40)
    await page.wait_for_timeout(500)
    first=await section.evaluate('e=>({scroll:scrollY,motion:e.brandFilmMotion||null,selected:e.querySelector("[data-ev-select][aria-pressed=true]")?.dataset.evSelect||null})')
    for _ in range(steps):
        await page.mouse.wheel(0,-(end-start)/steps)
        await page.wait_for_timeout(40)
    await page.wait_for_timeout(500)
    second=await section.evaluate('e=>({scroll:scrollY,motion:e.brandFilmMotion||null,selected:e.querySelector("[data-ev-select][aria-pressed=true]")?.dataset.evSelect||null})')
    data=await page.evaluate('''()=>{window.__frameSample.running=false;const a=window.__frameSample.times.sort((x,y)=>x-y);return{frames:a.length,medianMs:a[Math.floor(a.length*.5)],p95Ms:a[Math.floor(a.length*.95)],maxMs:a.at(-1),over34:a.filter(x=>x>34).length,over50:a.filter(x=>x>50).length}}''')
    return {'selector':selector,'nativeWheelForward':first,'nativeWheelReverse':second,'raf':data}


async def main():
    report={'time':datetime.now(timezone.utc).isoformat(),'finalHeroes':[],'noJs':[],'home':[],'mobilePortfolioImages':[]}
    async with async_playwright() as p:
        browser=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        # Visual recheck after the last two service hero CSS fixes.
        for route in ['service-blog','service-hpblog']:
            for width in [1440,390]:
                context=await browser.new_context(viewport={'width':width,'height':844 if width==390 else 900},is_mobile=width==390,has_touch=width==390)
                page=await context.new_page();errors=[]
                page.on('pageerror',lambda e:errors.append(str(e)))
                await page.goto(f'{BASE}/{route}.html',wait_until='networkidle')
                await page.evaluate('document.fonts.ready');await page.wait_for_timeout(1800)
                report['finalHeroes'].append({'route':route,'width':width,'errors':errors,'layout':await page.evaluate(existing.LAYOUT),'assets':await page.locator('script[src],link[rel=stylesheet]').evaluate_all('es=>es.map(e=>e.src||e.href)'), 'screenshot':await screenshot(page,f'{route}-{width}-final-hero')})
                await context.close()
        for route in ['index','service-hpblog']:
            context=await browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
            page=await context.new_page();await page.goto(f'{BASE}/{route}.html',wait_until='networkidle')
            section=page.locator('[data-ev-portfolio]');await section.scroll_into_view_if_needed()
            active=[]
            for i in range(7):
                await section.locator(f'[data-ev-select="{i}"]').tap();await page.wait_for_timeout(1000)
                img=section.locator(f'[data-ev-project="{i}"] img');await img.evaluate('e=>e.decode()')
                active.append(await img.evaluate('''e=>{const b=e.getBoundingClientRect(),v=e.closest('.ev-projects').getBoundingClientRect();return{src:e.getAttribute('src'),loaded:e.complete&&e.naturalWidth>0,natural:[e.naturalWidth,e.naturalHeight],display:[b.width,b.height],horizontallyInView:b.left>=v.left-1&&b.right<=v.right+1}}'''))
            report['mobilePortfolioImages'].append({'route':route,'images':active})
            await context.close()
        # Replace only the two false positives with a corrected viewport-aware smoke.
        current=json.loads((APP/'reports/visual-update-results.json').read_text())
        for route in ['index','service-hpblog']:
            new=await evidence.smoke(browser,BASE,route,390)
            current['smoke']=[new if old['route']==route and old['width']==390 else old for old in current['smoke']]
        current['lazyImageRecheck']=datetime.now(timezone.utc).isoformat()
        (APP/'reports/visual-update-results.json').write_text(json.dumps(current,ensure_ascii=False,indent=2)+'\n')
        for width in [1440,390]:
            context=await browser.new_context(viewport={'width':width,'height':844 if width==390 else 900},java_script_enabled=False,is_mobile=width==390,has_touch=width==390)
            page=await context.new_page()
            await page.goto(f'{BASE}/index.html',wait_until='networkidle')
            await page.wait_for_timeout(800)
            # Inspect real, visible fallback links: no JS is enabled in this context.
            result={'width':width,'title':await page.title(),'galleries':[],'overflow':await page.evaluate('document.documentElement.scrollWidth-innerWidth')}
            for kind in ['portfolio','review','inquiry']:
                links=page.locator(f'[data-evidence-open="{kind}"]')
                visible=[]
                for link in await links.all():
                    if await link.is_visible():visible.append(await link.get_attribute('href'))
                result['galleries'].append({'kind':kind,'allLinks':await links.count(),'visibleLinks':len(visible),'originalTargets':visible})
            link=page.locator('[data-evidence-open="review"]').first
            href=await link.get_attribute('href')
            await link.click()
            await page.wait_for_load_state('load')
            result['nativeImageNavigation']={'expected':href,'actual':page.url,'originalImageVisible':await page.locator('img').evaluate_all('es=>es.some(e=>e.complete&&e.naturalWidth>0)')}
            report['noJs'].append(result)
            await context.close()
        for width in [1440,390]:
            context=await browser.new_context(viewport={'width':width,'height':844 if width==390 else 900},is_mobile=width==390,has_touch=width==390,locale='ko-KR')
            await context.add_init_script(f'({existing.INIT})()')
            page=await context.new_page();await page.goto(f'{BASE}/index.html',wait_until='networkidle')
            await page.evaluate('document.fonts.ready');await page.wait_for_timeout(1700)
            data={'width':width}
            # Actual image files all decode. Horizontal offscreen lazy images are deferred, not failed.
            data['imageResources']=await page.evaluate('''async()=>{const paths=[...new Set([...document.querySelectorAll('img[src]')].map(e=>e.src))];return Promise.all(paths.map(async src=>{const i=new Image();i.src=src;try{await i.decode();return{src,loaded:true,size:[i.naturalWidth,i.naturalHeight]}}catch(e){return{src,loaded:false}}}))}''')
            ledger=page.locator('.achievement-ledger')
            await ledger.scroll_into_view_if_needed();await page.wait_for_timeout(1600)
            data['metrics']=await page.locator('.achievement').evaluate_all('''es=>es.map(e=>{const d=e.querySelector('dd'),s=getComputedStyle(d),r=d.getBoundingClientRect();return{label:e.querySelector('dt').textContent.trim(),value:d.textContent.replace(/\\s/g,''),opacity:s.opacity,clipPath:s.clipPath,withinViewport:r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight,dimensions:[r.width,r.height]}})''')
            data['metricPairsCorrect']=[[x['label'],x['value']] for x in data['metrics']]==EXPECTED
            data['metricsScreenshot']=await screenshot(page,f'index-{width}-achievements')
            data['motion']=[await measure(page,'[data-brand-film]'),await measure(page,'[data-ev-portfolio]')]
            data['layout']=await page.evaluate(existing.LAYOUT)
            data['cls']=existing.cls((await page.evaluate('window.__qa'))['shifts'])
            report['home'].append(data)
            await context.close()
        await browser.close()
    (APP/'reports/visual-update-supplemental.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'finalHeroes':len(report['finalHeroes']),'noJs':report['noJs'],'home':[{'width':x['width'],'metricsCorrect':x['metricPairsCorrect'],'cls':x['cls'],'motion':x['motion']} for x in report['home']]},ensure_ascii=False),flush=True)


if __name__=='__main__':asyncio.run(main())
