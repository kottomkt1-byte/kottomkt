#!/usr/bin/env python3
"""Audit the async GLB eyewear viewer in a local build; never changes production content.

Run after the viewer build is ready:
  python qa/eyewear-viewer-audit.py --base http://127.0.0.1:4181

Browser instrumentation counts actual WebGL draw calls. The visibility check
simulates document.hidden + visibilitychange; it does not claim a real OS tab
background test. Context-unavailable and context-loss cases are deliberate.
"""
import argparse
import asyncio
import hashlib
import json
import math
import re
import traceback
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/playwright/eyewear-viewer'
REPORT = ROOT / 'reports/eyewear-viewer-qa.json'
STAGE = '[data-eyewear-stage]'
VIEWER = '[data-eyewear-viewer]'
PLAY = '[data-eyewear-play]'
RESET = '[data-eyewear-reset]'
ENTER = '[data-eyewear-enter]'
ROUTE = '/service-model-images.html'
VIEW_TARGETS = []
MODEL_URL = re.compile(r'\.(?:glb|gltf)(?:\?.*)?$',re.IGNORECASE)
EXPECTED_MODEL_PATH = '/models/zin-01.glb'
EXPECTED_POSTER_PATH = '/art/zin-01-studio.webp'
EXPECTED_SOURCE = 'Photo-reconstructed ZIN 01'

INSTRUMENT = r'''({disableWebGL = false}) => {
  const contexts = [], events = [], draws = new WeakMap();
  let totalDraws = 0, contextAttempts = 0;
  const originalGet = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function(type, ...args) {
    if (/^webgl2?$|^experimental-webgl$/.test(type)) {
      contextAttempts++;
      if (disableWebGL) return null;
    }
    const context = originalGet.call(this, type, ...args);
    if (context && /^webgl2?$|^experimental-webgl$/.test(type) && !contexts.includes(context)) {
      contexts.push(context);
      this.addEventListener('webglcontextlost', () => events.push('lost'));
      this.addEventListener('webglcontextrestored', () => events.push('restored'));
    }
    return context;
  };
  for (const type of ['WebGLRenderingContext', 'WebGL2RenderingContext']) {
    const proto = window[type]?.prototype;
    if (!proto) continue;
    for (const name of ['drawArrays','drawElements','drawArraysInstanced','drawElementsInstanced']) {
      if (!Object.prototype.hasOwnProperty.call(proto, name)) continue;
      const original = proto[name];
      if (typeof original !== 'function') continue;
      proto[name] = function(...args) {
        totalDraws++; draws.set(this.canvas, (draws.get(this.canvas) || 0) + 1);
        return original.apply(this, args);
      };
    }
  }
  window.__eyewearQA = {
    snapshot: () => ({contextAttempts, contexts:contexts.length, totalDraws, events:[...events],
      canvases: contexts.map(c=>({className:c.canvas.className, width:c.canvas.width,
        height:c.canvas.height, draws:draws.get(c.canvas)||0}))}),
    loseContext: () => {
      const canvas = document.querySelector('[data-eyewear-stage] canvas');
      const context = contexts.find(c=>c.canvas===canvas);
      const extension = context?.getExtension('WEBGL_lose_context');
      if (!extension) return false;
      extension.loseContext(); return true;
    },
    simulateHidden: hidden => {
      if (hidden) {
        Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});
        Object.defineProperty(document,'visibilityState',{configurable:true,get:()=> 'hidden'});
      } else { delete document.hidden; delete document.visibilityState; }
      document.dispatchEvent(new Event('visibilitychange'));
    }
  };
}'''


def save(report):
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')


def read_view_targets():
    """Read the final preset endpoints only to synchronize with the current build.

    Behavior assertions below still exercise actual controls and rendered output.
    Do not use a copied delay or guessed endpoint while the scene is being tuned.
    """
    source = (ROOT/'src/eyewear-viewer.js').read_text()
    match = re.search(r'const\s+views\s*=\s*(\[[\s\S]*?\]);',source)
    if not match:
        raise ValueError('Viewer preset definitions unavailable; update the QA synchronization adapter.')
    literal = re.sub(r'([{,]\s*)([A-Za-z_]\w*)(\s*:)',r'\1"\2"\3',match[1])
    literal = re.sub(r'(?<![\w.])(-?)\.(\d+)',r'\g<1>0.\2',literal)
    literal = re.sub(r',\s*([\]}])',r'\1',literal)
    presets = json.loads(literal)
    assert len(presets)==3 and all(all(key in preset for key in ['x','y','distance']) for preset in presets)
    return presets


async def state(page):
    return await page.locator(STAGE).evaluate('e=>e.__eyewearState?.() || {state:e.dataset.state}')


async def draws(page):
    return await page.evaluate('window.__eyewearQA.snapshot()')


async def wait_view_endpoint(page, index):
    target = VIEW_TARGETS[index]
    await page.wait_for_function('''({index,target}) => {
      const state = document.querySelector('[data-eyewear-stage]')?.__eyewearState?.();
      return state && state.visible && !state.playing && Number(state.view) === index
        && Math.abs(state.cameraDistance-target.distance) < .001
        && Math.abs(state.rotation.x-target.x) < .0002
        && Math.abs(state.rotation.y-target.y) < .0002;
    }''',arg={'index':index,'target':target},polling=100,timeout=45000)
    return await state(page)


async def wait_pose_change(page, before):
    await page.wait_for_function('''before => {
      const state = document.querySelector('[data-eyewear-stage]')?.__eyewearState?.();
      return state && (Math.abs(state.rotation.x-before.rotation.x) > .002
        || Math.abs(state.rotation.y-before.rotation.y) > .002);
    }''',arg=before,polling=100,timeout=30000)
    return await state(page)


async def wait_render_after(page, render_count):
    await page.wait_for_function('''count =>
      document.querySelector('[data-eyewear-stage]')?.__eyewearState?.().renderCount > count
    ''',arg=render_count,polling=100,timeout=30000)


async def wait_draws_after(page, draw_count):
    await page.wait_for_function('count => window.__eyewearQA.snapshot().totalDraws > count',
        arg=draw_count,polling=100,timeout=30000)


async def show_stage(page):
    await page.locator(STAGE).scroll_into_view_if_needed()
    await page.locator(STAGE).evaluate("e=>window.scrollTo({top:e.getBoundingClientRect().top+scrollY-Math.max(90,(innerHeight-e.clientHeight)/2),behavior:'instant'})")


async def screenshot(page, name, selector=None):
    target = page.locator(selector) if selector else page
    path = OUT / f'{name}.png'
    await target.screenshot(path=str(path), animations='allow')
    return str(path.relative_to(ROOT))


async def pause(page):
    before = await state(page)
    changed = await page.locator(PLAY).get_attribute('aria-pressed') == 'true'
    if changed:
        await page.locator(PLAY).click()
    await show_stage(page)
    await page.wait_for_function('''() => {
      const s = document.querySelector('[data-eyewear-stage]')?.__eyewearState?.();
      return s && s.visible && !s.playing;
    }''',polling=100,timeout=30000)
    if changed:
        await wait_render_after(page,before['renderCount'])
    assert (await state(page))['playing'] is False, await state(page)


async def stable_draws(page, label, settle=350, sample=550):
    await page.wait_for_timeout(settle)
    before = await draws(page)
    await page.wait_for_timeout(sample)
    after = await draws(page)
    assert before['totalDraws'] == after['totalDraws'], (label, before, after, await state(page))
    return {'drawCallsBefore': before['totalDraws'], 'drawCallsAfter': after['totalDraws'], 'sampleMs': sample}


def pose_changed(first, second):
    return any(abs(first.get('rotation', {}).get(key, 0)-second.get('rotation', {}).get(key, 0)) > .002 for key in ['x','y'])


async def new_page(browser, width, reduced=False, no_js=False, no_webgl=False):
    context = await browser.new_context(viewport={'width':width, 'height':900 if width==1440 else 844},
        locale='ko-KR', is_mobile=width<700, has_touch=width<700,
        reduced_motion='reduce' if reduced else 'no-preference', java_script_enabled=not no_js)
    if not no_js:
        await context.add_init_script(f'({INSTRUMENT})({json.dumps({"disableWebGL":no_webgl})})')
    page = await context.new_page()
    logs = {'pageErrors':[], 'consoleErrors':[], 'consoleWarnings':[], 'httpErrors':[], 'javascriptRequests':[],
        'modelRequests':[], 'modelRequestFailures':[]}
    page.on('pageerror', lambda error: logs['pageErrors'].append(str(error)))
    page.on('console', lambda msg: logs['consoleErrors' if msg.type=='error' else 'consoleWarnings'].append(msg.text) if msg.type in ['error','warning'] else None)
    page.on('response', lambda res: logs['httpErrors'].append({'url':res.url,'status':res.status}) if res.status>=400 else None)
    page.on('request', lambda req: logs['javascriptRequests'].append(req.url) if req.resource_type=='script' else None)
    page.on('request', lambda req: logs['modelRequests'].append(req.url) if MODEL_URL.search(req.url) else None)
    page.on('requestfailed', lambda req: logs['modelRequestFailures'].append({'url':req.url,'failure':req.failure}) if MODEL_URL.search(req.url) else None)
    return context, page, logs


async def studio_state(page, loaded=False):
    assert await page.locator(VIEWER).get_attribute('data-mode')=='studio'
    assert await page.locator(ENTER).get_attribute('aria-pressed')=='false'
    poster = page.locator(VIEWER+' .mi-product-poster')
    await page.wait_for_function("getComputedStyle(document.querySelector('[data-eyewear-viewer] .mi-product-poster')).opacity==='1'",timeout=10000)
    assert await poster.get_attribute('aria-hidden')!='true'
    image = await poster.evaluate('async e=>{await e.decode();return {src:e.getAttribute("src"),width:e.naturalWidth,height:e.naturalHeight}}')
    assert image['width']==1200 and image['height']==1000, image
    assert urlparse(image['src']).path.endswith(EXPECTED_POSTER_PATH.lstrip('/')), image
    assert not await page.locator('[data-eyewear-tools]').is_visible()
    canvas = page.locator(STAGE+' canvas')
    if loaded:
        assert (await state(page))['active'] is False
        assert await canvas.get_attribute('tabindex')=='-1'
        assert await canvas.get_attribute('aria-hidden')=='true'
        assert not await canvas.is_visible()
    else:
        assert await canvas.count()==0
    return {'poster':image,'toolsHidden':True,'loadedCanvasInactive':loaded}


async def open_viewer(page, base, logs, lazy=True, detail_entry=False):
    response = await page.goto(base+ROUTE, wait_until='networkidle')
    assert response.status == 200
    await page.evaluate('document.fonts.ready')
    await page.wait_for_timeout(300)
    initial = await draws(page)
    initial_scripts = set(logs['javascriptRequests'])
    if lazy:
        assert initial['contexts'] == 0, ('WebGL created before near viewport', initial)
        assert not logs['modelRequests'], ('GLB requested before near viewport',logs['modelRequests'])
    await show_stage(page)
    await page.wait_for_timeout(400)
    initial_poster = await studio_state(page)
    assert not logs['modelRequests'],'GLB was requested by scrolling alone.'
    assert (await draws(page))['contextAttempts']==0
    assert await page.locator(ENTER).is_visible()
    await page.locator('[data-mi-point="0"]' if detail_entry else ENTER).click()
    await show_stage(page)
    await page.wait_for_function("document.querySelector('[data-eyewear-stage]')?.dataset.state === 'ready'", timeout=30000)
    await wait_render_after(page,0)
    assert (await state(page))['active'] is True
    assert await page.locator(ENTER).get_attribute('aria-pressed')=='true'
    current = await draws(page)
    assert current['contexts'] >= 1 and current['totalDraws'] > 0, current
    assert logs['modelRequests'] and not logs['modelRequestFailures'],logs
    assert all(urlparse(url).path.endswith(EXPECTED_MODEL_PATH) for url in logs['modelRequests']), logs['modelRequests']
    assert (await state(page))['source']==EXPECTED_SOURCE
    assert (await state(page))['finish']=='black'
    scripts = sorted(set(logs['javascriptRequests'])-initial_scripts)
    if lazy:
        assert scripts, ('No additional JavaScript requested after stage approached viewport', logs)
    return {'beforeViewport':initial,'afterViewport':current,'lazyJavaScriptRequests':scripts,
        'loadedModelUrls':list(logs['modelRequests']),'primaryStudioPoster':initial_poster,
        'activation':'already-selected detail button' if detail_entry else 'explicit enter button',
        'noModelRequestBeforeInteraction':True}


async def capture_framing(page):
    """Check the visible CSS box and all actual model vertices independently.

    Body scrollWidth cannot detect a canvas hidden by an ancestor overflow:clip.
    NDC alone likewise cannot detect an oversized stage clipped by its host.
    """
    measurement = await page.locator(STAGE).evaluate("""stage => {
      const host=stage.closest('[data-eyewear-viewer]'),canvas=stage.querySelector('canvas');
      const rect=e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}};
      return {host:rect(host),hostClientWidth:host.clientWidth,stage:rect(stage),canvas:rect(canvas),
        viewport:{width:innerWidth,height:innerHeight},projection:stage.__eyewearFraming?.() || null};
    }""")
    host,viewport=measurement['host'],measurement['viewport']
    for name in ['stage','canvas']:
        rect=measurement[name]
        assert rect['width']<=measurement['hostClientWidth']+1,(name,'wider than clipping host',measurement)
        assert rect['left']>=host['left']-1 and rect['right']<=host['right']+1,(name,'outside host horizontally',measurement)
        assert rect['top']>=host['top']-1 and rect['bottom']<=host['bottom']+1,(name,'outside host vertically',measurement)
        assert rect['left']>=-1 and rect['right']<=viewport['width']+1,(name,'outside viewport horizontally',measurement)
        assert rect['top']>=-1 and rect['bottom']<=viewport['height']+1,(name,'outside viewport vertically',measurement)
    projection=measurement['projection']
    assert projection and projection['vertexCount']>0,('All-vertex projection diagnostics unavailable',measurement)
    bounds=projection['bounds']
    assert all(math.isfinite(bounds[k]) for k in ['minX','maxX','minY','maxY','minZ','maxZ']),projection
    assert -1<bounds['minZ']<=bounds['maxZ']<1,('Geometry outside near/far clip planes',projection)
    canvas=measurement['canvas']
    margin={'left':(bounds['minX']+1)*canvas['width']/2,'right':(1-bounds['maxX'])*canvas['width']/2,
        'top':(1-bounds['maxY'])*canvas['height']/2,'bottom':(bounds['minY']+1)*canvas['height']/2}
    assert min(margin.values())>=3,('Product geometry lacks a 3px visible margin',margin,measurement)
    measurement['geometryMarginCssPixels']=margin
    return measurement


async def framing_case(browser,base,width):
    context,page,logs=await new_page(browser,width)
    case={'width':width,'mode':'framing','passed':False,**logs}
    try:
        case['lazyLoad']=await open_viewer(page,base,logs)
        await pause(page)
        case['views']=[]
        for index in [0,1,2]:
            await page.locator(f'[data-mi-point="{index}"]').click()
            if index==0:
                await page.locator(RESET).click()
            await show_stage(page)
            endpoint=await wait_view_endpoint(page,index)
            before=await capture_framing(page)
            shot=await screenshot(page,f'zin01-view-{index}-{width}',VIEWER)
            after=await capture_framing(page)
            case['views'].append({'view':index,'endpoint':endpoint,'beforeScreenshot':before,'afterScreenshot':after,'screenshot':shot})
        assert not logs['pageErrors'] and not logs['consoleErrors'] and not logs['httpErrors'],logs
        case['passed']=True
    except Exception as exc:
        case['failure']=f'{type(exc).__name__}: {exc}'
        case['traceback']=traceback.format_exc()
        await screenshot(page,f'failure-framing-{width}')
    finally:
        await context.close()
    return case


async def standard_case(browser, base, width):
    context, page, logs = await new_page(browser,width)
    case = {'width':width,'mode':'standard','passed':False,**logs}
    try:
        case['lazyLoad'] = await open_viewer(page,base,logs,detail_entry=width==320)
        canvas = page.locator(STAGE+' canvas')
        assert await canvas.get_attribute('tabindex') == '0'
        assert await canvas.get_attribute('aria-label')
        assert await canvas.get_attribute('role') == 'img'
        assert (await state(page))['playing'] is True
        assert (await state(page))['finish'] == 'black'
        assert await page.locator('[data-eyewear-finish]').count() == 0
        case['fixedFinish'] = {'finish':'black','source':(await state(page))['source'],'noAlternateFinishControls':True}
        await pause(page)
        case['manualPause'] = await stable_draws(page,'manual pause')
        case['viewStates'] = []
        case['viewScreenshots'] = []
        case['framingStates'] = []
        for index in [0,1,2]:
            await page.locator(f'[data-mi-point="{index}"]').click()
            # Selecting the already active first detail intentionally does not reset
            # its ambient pose; use the public reset control to establish its preset.
            if index == 0:
                await page.locator(RESET).click()
            await show_stage(page)
            current = await wait_view_endpoint(page,index)
            assert str(current['view']) == str(index), current
            assert await page.locator(f'[data-mi-point="{index}"]').get_attribute('aria-pressed') == 'true'
            assert await page.locator('[data-mi-point][aria-pressed="true"]').count() == 1
            assert await page.locator(STAGE).get_attribute('data-view') == str(index)
            case['viewStates'].append(current)
            framing_before=await capture_framing(page)
            case['viewScreenshots'].append(await screenshot(page,f'zin01-view-{index}-{width}',VIEWER))
            case['framingStates'].append({'view':index,'beforeScreenshot':framing_before,'afterScreenshot':await capture_framing(page)})
        assert any(pose_changed(case['viewStates'][0],x) for x in case['viewStates'][1:]), case['viewStates']
        zooms = [x.get('zoom',x.get('cameraDistance')) for x in case['viewStates']]
        if all(x is not None for x in zooms):
            assert len({json.dumps(x,sort_keys=True) for x in zooms}) > 1, ('No zoom/distance change',zooms)
            case['zoomChanged'] = True
        else:
            case['zoomChanged'] = 'Not exposed; inspect view screenshots.'
        actual_distances = [x.get('actualCameraDistance') for x in case['viewStates']]
        if all(isinstance(x,(int,float)) for x in actual_distances):
            assert len({round(x,4) for x in actual_distances})>1,('Actual camera did not zoom',actual_distances)
            case['actualCameraZoomChanged']={'distances':actual_distances,'passed':True}
        case['screenshots'] = [await screenshot(page,f'inspection-{width}', '.mi-inspection')]
        await pause(page)
        assert (await state(page))['finish'] == 'black'
        case['screenshots'].append(await screenshot(page,f'zin01-black-{width}',VIEWER))
        before = await state(page)
        await canvas.focus()
        await page.keyboard.press('ArrowRight')
        after = await wait_pose_change(page,before)
        assert pose_changed(before,after), ('Keyboard rotation did not move',before,after)
        assert after['playing'] is False
        case['keyboardRotation'] = {'before':before,'after':after}
        box = await canvas.bounding_box()
        x,y = box['x']+box['width']*.38,box['y']+box['height']*.50
        before = await state(page)
        if width<700:
            cdp = await context.new_cdp_session(page)
            await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y}]})
            for step in range(1,7):
                await cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x+step*12,'y':y+step}]})
                await page.wait_for_timeout(25)
            await cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
            await cdp.detach()
        else:
            await page.mouse.move(x,y)
            await page.mouse.down()
            await page.mouse.move(x+100,y+20,steps=8)
            await page.mouse.up()
        after = await wait_pose_change(page,before)
        assert pose_changed(before,after), ('Drag did not rotate',before,after)
        assert after['playing'] is False
        case['dragRotation'] = {'input':'touch' if width<700 else 'mouse','before':before,'after':after}
        await page.locator(RESET).click()
        await show_stage(page)
        reset = await wait_view_endpoint(page,int(after['view']))
        await canvas.focus()
        await page.keyboard.press('ArrowLeft')
        await wait_pose_change(page,reset)
        await page.keyboard.press('Home')
        home = await wait_view_endpoint(page,int(reset['view']))
        assert not pose_changed(reset,home), ('Reset and Home differ',reset,home)
        case['resetAndHome'] = {'button':reset,'key':home}
        if width<700:
            await show_stage(page)
            box = await canvas.bounding_box()
            x,y = box['x']+box['width']*.5,box['y']+box['height']*.65
            scroll_before = await page.evaluate('scrollY')
            cdp = await context.new_cdp_session(page)
            await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y}]})
            for step in range(1,7):
                await cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x,'y':y-step*18}]})
                await page.wait_for_timeout(30)
            await cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
            await cdp.detach()
            await page.wait_for_timeout(400)
            scroll_after = await page.evaluate('scrollY')
            assert scroll_after>scroll_before+20, ('Vertical swipe trapped by viewer',scroll_before,scroll_after)
            case['verticalTouchScroll'] = {'before':scroll_before,'after':scroll_after}
        if await page.locator(PLAY).get_attribute('aria-pressed') != 'true':
            await page.locator(PLAY).click()
        await show_stage(page)
        before = await draws(page)
        await wait_draws_after(page,before['totalDraws'])
        after = await draws(page)
        assert after['totalDraws'] > before['totalDraws']
        case['playResumesDraws'] = True
        requests_before_studio = len(logs['modelRequests'])
        await page.locator(ENTER).click()
        await show_stage(page)
        case['studioReturn'] = await studio_state(page,loaded=True)
        assert (await state(page))['playing'] is True,'Studio mode should retain the user playback preference.'
        case['studioReturn']['pausedDraws'] = await stable_draws(page,'studio mode rendering pause')
        before = await draws(page)
        await page.locator(ENTER).click()
        await show_stage(page)
        await wait_draws_after(page,before['totalDraws'])
        assert (await state(page))['active'] is True
        assert await canvas.get_attribute('tabindex')=='0'
        assert await canvas.get_attribute('aria-hidden')!='true'
        assert len(logs['modelRequests'])==requests_before_studio,'Reentry redownloaded the GLB.'
        case['studioReturn']['reentryReusesModelAndResumes']=True
        await page.evaluate("window.scrollTo({top:0,behavior:'instant'})")
        await page.wait_for_function("document.querySelector('[data-eyewear-stage]').__eyewearState().visible === false",timeout=30000)
        assert (await state(page))['visible'] is False
        case['offscreenPause'] = await stable_draws(page,'offscreen pause')
        await show_stage(page)
        await wait_draws_after(page,case['offscreenPause']['drawCallsAfter'])
        assert (await state(page))['visible'] is True
        resumed = await draws(page)
        assert resumed['totalDraws'] > case['offscreenPause']['drawCallsAfter']
        await page.evaluate('window.__eyewearQA.simulateHidden(true)')
        case['hiddenPause'] = await stable_draws(page,'simulated document.hidden')
        await page.evaluate('window.__eyewearQA.simulateHidden(false)')
        await wait_draws_after(page,case['hiddenPause']['drawCallsAfter'])
        assert (await draws(page))['totalDraws'] > case['hiddenPause']['drawCallsAfter']
        case['visibilityTestMethod'] = 'Simulated document.hidden getter plus visibilitychange event; not an OS background-tab test.'
        case['layout'] = await page.evaluate('({width:innerWidth,scrollWidth:document.documentElement.scrollWidth})')
        assert case['layout']['width'] == case['layout']['scrollWidth'],case['layout']
        if width==1440:
            await pause(page)
            for index,key in [(0,'Enter'),(1,'Space')]:
                await page.locator(f'[data-mi-point="{index}"]').focus()
                await page.keyboard.press(key)
                await show_stage(page)
                await wait_view_endpoint(page,index)
                assert str((await state(page))['view'])==str(index)
            case['keyboardDetailButtons'] = True
            await page.locator(PLAY).click()
            assert (await state(page))['playing'] is True
            case['runtimeReducedBefore'] = await page.evaluate('''()=>({scrollY,hidden:document.hidden,
                visibility:document.visibilityState,focus:document.activeElement.getAttribute('data-eyewear-play'),
                state:document.querySelector('[data-eyewear-stage]').__eyewearState()})''')
            await page.emulate_media(reduced_motion='reduce')
            # GSAP matchMedia reverts scroll-bound timelines and can restore scrollY
            # to the page's initial position. First verify the preference handler
            # independently of visibility, then bring the scene back into view.
            await page.wait_for_function('''() => {
              const button=document.querySelector('[data-eyewear-play]');
              return button?.disabled && button.getAttribute('aria-pressed')==='false';
            }''',polling=100,timeout=30000)
            case['runtimeReducedApplied'] = await page.evaluate('''()=>({scrollY,hidden:document.hidden,
                visibility:document.visibilityState,state:document.querySelector('[data-eyewear-stage]').__eyewearState()})''')
            await show_stage(page)
            await wait_view_endpoint(page,1)
            assert (await state(page))['playing'] is False
            assert (await state(page))['reduced'] is True
            assert await page.locator(PLAY).is_disabled()
            case['runtimeReducedMotion'] = await stable_draws(page,'runtime reduced motion')
            await page.emulate_media(reduced_motion='no-preference')
            await page.wait_for_function("!document.querySelector('[data-eyewear-play]').disabled",timeout=30000)
            assert not await page.locator(PLAY).is_disabled()
            assert (await state(page))['playing'] is False
            await page.evaluate("window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:false}))")
            case['pagehideCleanup'] = await stable_draws(page,'pagehide cleanup')
        assert not logs['pageErrors'] and not logs['consoleErrors'] and not logs['httpErrors'],logs
        case['passed'] = True
    except Exception as exc:
        case['failure'] = f'{type(exc).__name__}: {exc}'
        case['traceback'] = traceback.format_exc()
        case['lastState'] = await state(page) if await page.locator(STAGE).count() else None
        await screenshot(page,f'failure-{width}')
    finally:
        await context.close()
    return case


async def fallback_state(page, interactive=True):
    """The existing poster remains the sole visible model surface on failure."""
    poster = page.locator(VIEWER+' .mi-product-poster')
    expected_src = await poster.get_attribute('src')
    assert await poster.is_visible()
    assert await poster.get_attribute('aria-hidden') != 'true'
    await page.wait_for_function("getComputedStyle(document.querySelector('[data-eyewear-viewer] .mi-product-poster')).opacity==='1'",timeout=10000)
    result = await poster.evaluate('''async e=>{await e.decode();return {
      src:e.getAttribute('src'),width:e.naturalWidth,height:e.naturalHeight,
      opacity:getComputedStyle(e).opacity,fit:getComputedStyle(e).objectFit}}''')
    assert result['src']==expected_src and result['width']>0 and result['height']>0,result
    assert urlparse(result['src']).path.endswith(EXPECTED_POSTER_PATH.lstrip('/')), result
    assert result['opacity']=='1',result
    assert await page.locator(STAGE+' canvas:visible').count()==0
    assert not await page.locator('[data-eyewear-tools]').is_visible()
    assert not await page.locator(ENTER).is_visible()
    if interactive:
        await page.locator('[data-mi-point="1"]').click()
        assert await page.locator('[data-mi-point="1"]').get_attribute('aria-pressed')=='true'
        assert await page.locator('[data-mi-check-label]').inner_text()=='구조와 연결'
        assert await page.locator(STAGE).get_attribute('data-state')=='fallback'
        await show_stage(page)
        result['detailButtonsStillWork']=True
    return result


async def async_model_case(browser,base,mode):
    """Control only the GLB response, preserving the page's real async caller.

    The failure case returns HTTP 200 with an invalid GLB body so parser failure
    is handled without manufacturing an unrelated HTTP/browser console error.
    The two race cases hold the response until selection or disposal occurs.
    """
    context,page,logs = await new_page(browser,390)
    case = {'width':390,'mode':mode,'passed':False,**logs}
    started,release,aborted = asyncio.Event(),asyncio.Event(),asyncio.Event()
    controlled_urls = []

    def model_failed(request):
        if MODEL_URL.search(request.url):
            aborted.set()

    async def control_model(route):
        controlled_urls.append(route.request.url)
        started.set()
        if mode=='model-load-failure':
            await route.fulfill(status=200,content_type='model/gltf-binary',body=b'QA deliberately invalid GLB payload')
            return
        await release.wait()
        try:
            await route.continue_()
        except Exception as exc:
            if mode!='model-loading-dispose':
                raise
            # An already-aborted browser request may reject interception release.
            # The requestfailed assertion below must still confirm the abort.
            case['routeReleaseAfterAbort']=str(exc)

    page.on('requestfailed',model_failed)
    await context.route(MODEL_URL,control_model)
    try:
        await page.goto(base+ROUTE,wait_until='domcontentloaded')
        await page.evaluate('document.fonts.ready')
        poster_src = await page.locator(VIEWER+' .mi-product-poster').get_attribute('src')
        assert not logs['modelRequests'],'GLB must remain lazy before the stage approaches the viewport.'
        await show_stage(page)
        await studio_state(page)
        assert not logs['modelRequests'],'GLB must not load without a user action.'
        await page.locator(ENTER).click()
        await asyncio.wait_for(started.wait(),timeout=30)
        case['controlledModelUrls']=controlled_urls
        assert all(urlparse(url).path.endswith(EXPECTED_MODEL_PATH) for url in controlled_urls), controlled_urls
        if mode=='model-load-failure':
            await page.wait_for_function("document.querySelector('[data-eyewear-stage]').dataset.state==='fallback'",timeout=30000)
            case['failureInjection']='HTTP 200 containing intentionally malformed GLB bytes; validates loader/parser failure handling.'
            case['fallback']=await fallback_state(page)
            assert case['fallback']['src']==poster_src
            assert not logs['modelRequestFailures'],logs
        else:
            assert await page.locator(STAGE).get_attribute('data-state')=='loading'
            held = await draws(page)
            assert held['contextAttempts']==0,('GPU allocated while GLB is still pending',held)
            assert not await page.locator('[data-eyewear-tools]').is_visible()
            case['loadingState']={'webglContextAttempts':held['contextAttempts'],'controlsHidden':True}
            if mode=='model-loading-selection':
                await page.locator('[data-mi-point="2"]').click()
                assert await page.locator('[data-mi-point="2"]').get_attribute('aria-pressed')=='true'
                assert await page.locator('[data-mi-check-label]').inner_text()=='색과 질감'
                release.set()
                await show_stage(page)
                await page.wait_for_function("document.querySelector('[data-eyewear-stage]').dataset.state==='ready'",timeout=30000)
                await wait_render_after(page,0)
                loaded = await state(page)
                assert str(loaded['view'])=='2'
                assert abs(loaded['cameraDistance']-VIEW_TARGETS[2]['distance'])<.001,loaded
                case['latestSelectedViewOnFirstRender']=loaded
                await pause(page)
                await page.locator(RESET).click()
                await show_stage(page)
                case['latestSelectedViewAfterLoad']=await wait_view_endpoint(page,2)
                assert not logs['modelRequestFailures'],logs
            elif mode=='model-loading-studio':
                await page.locator(ENTER).click()
                assert await page.locator(VIEWER).get_attribute('data-mode')=='studio'
                release.set()
                await page.wait_for_function("document.querySelector('[data-eyewear-stage]').dataset.state==='ready'",timeout=30000)
                case['studioDuringLoading']=await studio_state(page,loaded=True)
                assert (await state(page))['renderCount']==0,'Viewer rendered after returning to studio during loading.'
                before_requests=len(logs['modelRequests'])
                case['inactiveAfterLoad']=await stable_draws(page,'loaded while studio mode active')
                assert (await state(page))['renderCount']==0
                await page.locator(ENTER).click()
                await show_stage(page)
                await wait_render_after(page,0)
                assert (await state(page))['active'] is True
                assert len(logs['modelRequests'])==before_requests
                case['firstActivationAfterInactiveLoad']=True
            else:
                await page.evaluate("window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:false}))")
                release.set()
                await asyncio.wait_for(aborted.wait(),timeout=30)
                case['abortedRequests']=list(logs['modelRequestFailures'])
                assert case['abortedRequests'] and all('ABORT' in (x['failure'] or '').upper() for x in case['abortedRequests']),case
                case['afterAbort']=await stable_draws(page,'GLB cancelled during disposal')
                final = await draws(page)
                assert final['contextAttempts']==0 and final['totalDraws']==0,final
                assert await page.locator(STAGE+' canvas').count()==0
                assert await page.locator(STAGE).evaluate("e=>typeof e.__eyewearState==='undefined'")
                case['noLateViewerOrGpuAllocation']=True
        assert not logs['pageErrors'] and not logs['consoleErrors'] and not logs['httpErrors'],logs
        case['screenshot']=await screenshot(page,mode,VIEWER)
        case['passed']=True
    except Exception as exc:
        case['failure']=f'{type(exc).__name__}: {exc}'
        case['traceback']=traceback.format_exc()
        await screenshot(page,f'failure-{mode}')
    finally:
        release.set()
        await context.close()
    return case


async def alternate_case(browser,base,mode):
    width = 1440 if mode=='lifecycle-cleanup' else 390
    context,page,logs = await new_page(browser,width,reduced=mode=='reduced-motion',no_js=mode=='no-javascript',no_webgl=mode=='webgl-unavailable')
    case = {'width':width,'mode':mode,'passed':False,**logs}
    try:
        if mode in ['reduced-motion','context-loss','lifecycle-cleanup']:
            case['lazyLoad'] = await open_viewer(page,base,logs)
            if mode=='reduced-motion':
                current=await state(page)
                assert current['reduced'] is True and current['playing'] is False,current
                assert await page.locator(PLAY).is_disabled()
                case['staticRender'] = await stable_draws(page,'reduced motion')
                await page.locator('[data-mi-point="2"]').click()
                await show_stage(page)
                await wait_view_endpoint(page,2)
                assert str((await state(page))['view'])=='2'
                case['manualViewSelection'] = await state(page)
                case['staticAfterSelection'] = await stable_draws(page,'reduced motion after selection')
            elif mode=='context-loss':
                assert await page.evaluate('window.__eyewearQA.loseContext()'), 'WEBGL_lose_context unavailable'
                await page.wait_for_function("document.querySelector('[data-eyewear-stage]')?.dataset.state === 'fallback'",timeout=10000)
                case['contextLossEvents'] = (await draws(page))['events']
                assert 'lost' in case['contextLossEvents']
            else:
                case['screenshot'] = await screenshot(page,'before-lifecycle-cleanup',VIEWER)
                await page.evaluate("window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:false})); window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:false}))")
                case['repeatedPagehide'] = await stable_draws(page,'repeated pagehide cleanup')
                assert await page.locator(STAGE+' canvas').count()==0
                assert await page.locator(STAGE).evaluate("e=>typeof e.__eyewearState==='undefined'")
                case['canvasAndStateRemoved'] = True
        else:
            await page.goto(base+ROUTE,wait_until='networkidle')
            await show_stage(page)
            if mode=='webgl-unavailable':
                await studio_state(page)
                assert not logs['modelRequests']
                await page.locator(ENTER).click()
                await page.wait_for_function("document.querySelector('[data-eyewear-stage]')?.dataset.state === 'fallback'",timeout=20000)
                case['contextAttempts'] = (await draws(page))['contextAttempts']
                assert case['contextAttempts'] > 0
        if mode in ['no-javascript','webgl-unavailable','context-loss']:
            case['fallback']=await fallback_state(page,interactive=mode!='no-javascript')
        assert await page.evaluate('document.documentElement.scrollWidth===innerWidth')
        if 'screenshot' not in case:
            case['screenshot'] = await screenshot(page,mode,VIEWER)
        assert not logs['pageErrors'] and not logs['httpErrors'],logs
        if mode in ['webgl-unavailable','context-loss']:
            case['expectedWebGLConsoleDiagnostics'] = list(logs['consoleErrors'])
        else:
            assert not logs['consoleErrors'],logs
        case['passed']=True
    except Exception as exc:
        case['failure']=f'{type(exc).__name__}: {exc}'
        case['traceback']=traceback.format_exc()
        await screenshot(page,f'failure-{mode}')
    finally:
        await context.close()
    return case


async def run(args):
    global VIEW_TARGETS
    VIEW_TARGETS = read_view_targets()
    OUT.mkdir(parents=True,exist_ok=True)
    report={'checkedAt':datetime.now(timezone.utc).isoformat(),'base':args.base,'scope':'ZIN 01 studio poster first; explicit async GLB activation with a fixed black acetate / silver temple finish.',
        'expectedAssets':{'model':EXPECTED_MODEL_PATH,'poster':EXPECTED_POSTER_PATH,'source':EXPECTED_SOURCE,'finish':'black'},
        'assetStage':args.asset_stage,
        'buildAssetSnapshot':{str(path.relative_to(ROOT/'dist')):{'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()} for path in [ROOT/'dist'/EXPECTED_MODEL_PATH.lstrip('/'),ROOT/'dist'/EXPECTED_POSTER_PATH.lstrip('/')] if path.is_file()},
        'browser':'Chromium with ANGLE SwiftShader software WebGL; hardware GPU performance not measured.',
        'endpointWaitTargets':VIEW_TARGETS,
        'cases':[],'passed':False}
    save(report)
    async with async_playwright() as p:
        browser=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        for width in args.widths:
            case=await (framing_case(browser,args.base,width) if args.framing_only else standard_case(browser,args.base,width))
            report['cases'].append(case);save(report)
            print(f"{case['mode']} {width}: {'PASS' if case['passed'] else case['failure']}",flush=True)
        for mode in ([] if args.framing_only else args.modes):
            case=await (async_model_case(browser,args.base,mode) if mode.startswith('model-') else alternate_case(browser,args.base,mode))
            report['cases'].append(case);save(report)
            print(f"{mode}: {'PASS' if case['passed'] else case['failure']}",flush=True)
        await browser.close()
    report['passed']=all(case['passed'] for case in report['cases'])
    save(report)
    return report['passed']


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base',default='http://127.0.0.1:4181')
    parser.add_argument('--asset-stage',default='Unspecified asset stage; see buildAssetSnapshot for exact files.')
    parser.add_argument('--framing-only',action='store_true',help='Inspect all three model presets at each width, without repeating the full controller suite.')
    parser.add_argument('--widths',type=int,nargs='*',default=[1440,390,320])
    parser.add_argument('--modes',nargs='*',default=['reduced-motion','webgl-unavailable','context-loss','no-javascript',
        'model-load-failure','model-loading-selection','model-loading-studio','model-loading-dispose'])
    args=parser.parse_args();args.base=args.base.rstrip('/')
    raise SystemExit(0 if asyncio.run(run(args)) else 1)
