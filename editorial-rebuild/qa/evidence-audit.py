#!/usr/bin/env python3
"""Audit the restored 30 original images and interactive evidence UI. Never sends mail."""
import argparse
import asyncio
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image
from playwright.async_api import async_playwright

import audit as existing

APP = Path(__file__).resolve().parents[1]
REPO = APP.parent
OUT = APP / 'output/playwright/visual-update'
existing.OUT = OUT
COUNTS = {'portfolio':7,'review':15,'inquiry':8}


def original_assets():
    originals=json.loads((APP/'reports/visual-update-original-images.json').read_text())['assets']
    results=[]
    for original in originals:
        target=APP/'public/evidence'/original['filename']
        result={**original,'copy':str(target.relative_to(APP)),'exists':target.is_file()}
        if target.is_file():
            content=target.read_bytes()
            with Image.open(target) as image:
                result['copyDimensions']=list(image.size)
            result['copySha256']=hashlib.sha256(content).hexdigest()
            result['byteIdentical']=result['copySha256']==original['sha256']
            result['dimensionsMatch']=result['copyDimensions']==[original['width'],original['height']]
        results.append(result)
    return results


async def screenshot(page,label):
    path=OUT/f'{label}.png'
    path.parent.mkdir(parents=True,exist_ok=True)
    await page.screenshot(path=str(path),animations='allow')
    return str(path.relative_to(APP))


async def position(page,selector,offset=110):
    y=await page.locator(selector).first.evaluate('e=>e.getBoundingClientRect().top+scrollY')
    await existing.scroll_to(page,max(0,y-offset),850)


async def image_state(page):
    await page.locator('.ev-dialog-image').evaluate('e=>e.decode()')
    return await page.locator('.ev-dialog-image').evaluate('''e=>{
      const b=e.getBoundingClientRect(),v=e.parentElement.getBoundingClientRect(),s=getComputedStyle(e);
      return {src:e.getAttribute('src'),natural:[e.naturalWidth,e.naturalHeight],display:[b.width,b.height],
        loaded:e.complete&&e.naturalWidth>0,fit:s.objectFit,boxWithinView:b.left>=v.left-1&&b.right<=v.right+1&&b.top>=v.top-1&&b.bottom<=v.bottom+1,
        scroll:[e.parentElement.scrollWidth,e.parentElement.clientWidth,e.parentElement.scrollHeight,e.parentElement.clientHeight]}
    }''')


async def viewer_group(page,kind,label,all_images=True):
    section=page.locator('[data-ev-portfolio]' if kind=='portfolio' else '[data-ev-voices]').first
    if kind=='portfolio':
        await section.locator('[data-ev-select="0"]').click()
        await page.wait_for_timeout(900)
    else:
        await section.locator(f'[data-ev-filter="{kind}"]').click()
        more=section.locator('[data-ev-more]')
        if await more.get_attribute('aria-expanded')!='true':
            await more.click()
        await page.wait_for_timeout(800)
    anchors=page.locator(f'[data-evidence-open="{kind}"]')
    opener=anchors.first
    await opener.scroll_into_view_if_needed()
    await opener.click()
    dialog=page.locator('#kotto-evidence-dialog')
    await page.wait_for_timeout(350)
    result={'kind':kind,'anchorCount':await anchors.count(),'open':await dialog.evaluate('e=>e.open'),'images':[]}
    if kind!='portfolio':
        result['visibleCards']=await section.locator('[data-ev-voice]:not([hidden])').count()
    count=COUNTS[kind] if all_images else 1
    for i in range(count):
        state=await image_state(page)
        state['counter']=await dialog.locator('[data-ev-counter]').inner_text()
        result['images'].append(state)
        if i in {0,count-1}:
            await screenshot(page,f'{label}-{kind}-{i+1:02d}-viewer')
        if i<count-1:
            await dialog.locator('[data-ev-dialog-next]').click()
    # Restore first image, then verify actual keyboard previous / next navigation.
    if count>1:
        await dialog.locator('[data-ev-dialog-next]').click()
    await dialog.locator('[data-ev-close]').focus()
    await page.keyboard.press('ArrowRight')
    result['keyboardNext']=await dialog.locator('[data-ev-counter]').inner_text()
    await page.keyboard.press('ArrowLeft')
    result['keyboardPrevious']=await dialog.locator('[data-ev-counter]').inner_text()
    await dialog.locator('[data-ev-zoom]').click()
    await page.wait_for_timeout(200)
    result['zoom']=await image_state(page)
    result['zoom']['pressed']=await dialog.locator('[data-ev-zoom]').get_attribute('aria-pressed')
    view=dialog.locator('.ev-dialog-view')
    await view.evaluate('e=>{e.scrollTop=e.scrollHeight;e.scrollLeft=e.scrollWidth}')
    result['zoom']['scrolled']=await view.evaluate('e=>({left:e.scrollLeft,top:e.scrollTop})')
    result['zoom']['closeVisible']=await dialog.locator('[data-ev-close]').evaluate('e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight+1}')
    await screenshot(page,f'{label}-{kind}-zoom')
    await dialog.locator('[data-ev-zoom]').click()
    await dialog.locator('[data-ev-close]').focus()
    result['focusContained']=[]
    for key in ['Tab']*9+['Shift+Tab']*3:
        await page.keyboard.press(key)
        result['focusContained'].append(await dialog.evaluate('e=>e.contains(document.activeElement)'))
    await page.keyboard.press('Escape')
    result['escapeClosed']=not await dialog.evaluate('e=>e.open')
    result['focusRestored']=await opener.evaluate('e=>e===document.activeElement')
    return result


async def portfolio_scene(page,label,mobile,reduced):
    section=page.locator('[data-ev-portfolio]').first
    await position(page,'[data-ev-portfolio]')
    result={'states':[]}
    geometry=await section.evaluate('e=>({top:e.getBoundingClientRect().top+scrollY,height:e.offsetHeight})')
    if not mobile and not reduced:
        span=max(0,geometry['height']-page.viewport_size['height']+88)
        for name,fraction in [('start',0),('middle',.5),('end',1)]:
            await existing.scroll_to(page,geometry['top']-88+span*fraction,950)
            result['states'].append({'stage':name,'selected':await section.locator('[aria-pressed="true"]').get_attribute('data-ev-select'),
                'screenshot':await screenshot(page,f'{label}-portfolio-{name}')})
    else:
        result['screenshot']=await screenshot(page,f'{label}-portfolio')
    await section.locator('[data-ev-select="6"]').click()
    await page.wait_for_timeout(1000)
    result['lastProjectSelected']=await section.locator('[data-ev-select="6"]').get_attribute('aria-pressed')
    await section.locator('[data-ev-select="0"]').click()
    await page.wait_for_timeout(800)
    viewport=section.locator('.ev-projects')
    await viewport.focus()
    await page.keyboard.press('ArrowRight')
    await page.wait_for_timeout(900)
    result['keyboardProject']=await section.locator('[aria-pressed="true"]').get_attribute('data-ev-select')
    if mobile:
        await section.locator('[data-ev-select="0"]').click()
        await page.wait_for_timeout(650)
        await viewport.scroll_into_view_if_needed()
        box=await viewport.bounding_box()
        y=min(page.viewport_size['height']-80,box['y']+min(130,box['height']/2))
        cdp=await page.context.new_cdp_session(page)
        await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':330,'y':y}]})
        for x in [285,235,185,135,85]:
            await cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x,'y':y}]})
            await page.wait_for_timeout(35)
        await cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
        await page.wait_for_timeout(900)
        result['touchScrollLeft']=await viewport.evaluate('e=>e.scrollLeft')
        result['touchSelected']=await section.locator('[aria-pressed="true"]').get_attribute('data-ev-select')
        await cdp.detach()
    return result


async def brand_scene(page,label):
    section=page.locator('[data-brand-film]')
    if not await section.count():
        return None
    geom=await page.locator('.film-scroll-range').evaluate('e=>({top:e.getBoundingClientRect().top+scrollY,height:e.offsetHeight})')
    height=page.viewport_size['height']
    start=max(0,geom['top']-height*.72)
    end=max(start+100,geom['top']+geom['height']-height*.85)
    states=[]
    for name,fraction in [('start',0),('middle',.5),('end',1)]:
        await existing.scroll_to(page,start+(end-start)*fraction,900)
        states.append({'stage':name,'motion':await section.evaluate('e=>e.brandFilmMotion||null'),
            'screenshot':await screenshot(page,f'{label}-brand-{name}')})
    return states


async def detailed_case(browser,base,route,width,reduced):
    height=844 if width==390 else 900
    label=f'{route}-{width}-'+('reduced' if reduced else 'normal')
    context=await browser.new_context(viewport={'width':width,'height':height},is_mobile=width==390,has_touch=width==390,
        locale='ko-KR',reduced_motion='reduce' if reduced else 'no-preference')
    await existing.block_mail(context)
    await context.add_init_script(f'({existing.INIT})()')
    page=await context.new_page()
    errors=[];console=[];http=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('console',lambda e:console.append(e.text) if e.type=='error' else None)
    page.on('response',lambda r:http.append({'url':r.url,'status':r.status}) if r.status>=400 else None)
    result={'case':label,'route':route,'width':width,'reduced':reduced,'errors':errors,'consoleErrors':console,'httpErrors':http}
    try:
        response=await page.goto(f'{base}/{route}.html',wait_until='domcontentloaded')
        result['status']=response.status
        await existing.settle(page,1800)
        result['initialCls']=existing.cls((await page.evaluate('window.__qa'))['shifts'])
        result['hero']=await screenshot(page,f'{label}-hero')
        result['brand']=await brand_scene(page,label)
        result['galleries']=[]
        if await page.locator('[data-ev-portfolio]').count():
            result['portfolio']=await portfolio_scene(page,label,width==390,reduced)
            result['galleries'].append(await viewer_group(page,'portfolio',label,route=='index' and not reduced))
        if await page.locator('[data-ev-voices]').count():
            await position(page,'[data-ev-voices]')
            await screenshot(page,f'{label}-voices')
            for kind in ['review','inquiry']:
                result['galleries'].append(await viewer_group(page,kind,label,route=='index' and not reduced))
            result['visibleAfterInquiries']=await page.locator('[data-ev-voice]:not([hidden])').count()
            await screenshot(page,f'{label}-inquiries-expanded')
        result['layout']=await page.evaluate(existing.LAYOUT)
        result['overflow']=result['layout']['scrollWidth']-width
        result['motion']=await page.evaluate('()=>window.__kottoMotion||null')
    except Exception as exc:
        result['harnessError']=f'{type(exc).__name__}: {exc}'
        await screenshot(page,f'{label}-failure')
    finally:
        await context.close()
    (OUT/f'{label}.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'case':label,'errors':len(errors)+len(console)+len(http),'overflow':result.get('overflow'),'harnessError':result.get('harnessError')}),flush=True)
    return result


async def smoke(browser,base,route,width):
    context=await browser.new_context(viewport={'width':width,'height':844 if width==390 else 900},is_mobile=width==390,has_touch=width==390,locale='ko-KR')
    await existing.block_mail(context)
    page=await context.new_page();errors=[];failed=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('response',lambda r:failed.append(r.url) if r.status>=400 else None)
    response=await page.goto(f'{base}/{route}.html',wait_until='domcontentloaded')
    await existing.settle(page,800)
    height=page.viewport_size['height']
    for y in range(0,await page.evaluate('document.documentElement.scrollHeight'),height-130):
        await existing.scroll_to(page,y,45)
    await page.wait_for_timeout(600)
    layout=await page.evaluate(existing.LAYOUT)
    unloaded=await page.locator('img[src]').evaluate_all("xs=>xs.filter(e=>{const b=e.getBoundingClientRect(),s=getComputedStyle(e);return b.width>0&&b.height>0&&s.visibility!=='hidden'&&!(e.complete&&e.naturalWidth>0)}).map(e=>{const b=e.getBoundingClientRect();return{src:e.getAttribute('src'),loading:e.loading,intersectsViewport:b.left<innerWidth&&b.right>0&&b.top<innerHeight&&b.bottom>0}})")
    missing=[x['src'] for x in unloaded if x['intersectsViewport'] or x['loading']!='lazy']
    result={'route':route,'width':width,'status':response.status,'errors':errors,'failed':failed,'overflow':layout['scrollWidth']-width,
        'missingImages':missing, 'deferredLazyImages':[x['src'] for x in unloaded if not x['intersectsViewport'] and x['loading']=='lazy'], 'brokenAnchors':layout['brokenAnchors']}
    if route=='contact':
        result['form']=await existing.contact_check(page)
    await context.close()
    return result


async def main(args):
    OUT.mkdir(parents=True,exist_ok=True)
    originals=original_assets()
    async with async_playwright() as playwright:
        browser=await playwright.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        details=[];smokes=[]
        for route in args.routes.split(','):
            for width in [1440,390]:
                for reduced in [False,True]:
                    details.append(await detailed_case(browser,args.base.rstrip('/'),route,width,reduced))
        if not args.skip_smoke:
            for route in existing.ROUTES:
                for width in [1440,390]:
                    smokes.append(await smoke(browser,args.base.rstrip('/'),route,width))
        await browser.close()
    report={'time':datetime.now(timezone.utc).isoformat(),'base':args.base,'originals':originals,'details':details,'smoke':smokes}
    (APP/'reports/visual-update-results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print('REPORT reports/visual-update-results.json',flush=True)


if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--base',default='http://127.0.0.1:4181')
    parser.add_argument('--routes',default='index,about,service-hpblog,service-blog');parser.add_argument('--skip-smoke',action='store_true')
    asyncio.run(main(parser.parse_args()))
