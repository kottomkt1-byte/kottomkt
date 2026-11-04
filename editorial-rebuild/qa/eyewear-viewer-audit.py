#!/usr/bin/env python3
"""Audit the real eyewear viewer in a local build; never changes production content.

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
import re
import traceback
from datetime import datetime, timezone
from pathlib import Path

from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/playwright/eyewear-viewer'
REPORT = ROOT / 'reports/eyewear-viewer-qa.json'
STAGE = '[data-eyewear-stage]'
VIEWER = '[data-eyewear-viewer]'
PLAY = '[data-eyewear-play]'
RESET = '[data-eyewear-reset]'
ROUTE = '/service-model-images.html'
VIEW_TARGETS = []

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
    logs = {'pageErrors':[], 'consoleErrors':[], 'consoleWarnings':[], 'httpErrors':[], 'javascriptRequests':[]}
    page.on('pageerror', lambda error: logs['pageErrors'].append(str(error)))
    page.on('console', lambda msg: logs['consoleErrors' if msg.type=='error' else 'consoleWarnings'].append(msg.text) if msg.type in ['error','warning'] else None)
    page.on('response', lambda res: logs['httpErrors'].append({'url':res.url,'status':res.status}) if res.status>=400 else None)
    page.on('request', lambda req: logs['javascriptRequests'].append(req.url) if req.resource_type=='script' else None)
    return context, page, logs


async def open_viewer(page, base, logs, lazy=True):
    response = await page.goto(base+ROUTE, wait_until='networkidle')
    assert response.status == 200
    await page.evaluate('document.fonts.ready')
    await page.wait_for_timeout(300)
    initial = await draws(page)
    initial_scripts = set(logs['javascriptRequests'])
    if lazy:
        assert initial['contexts'] == 0, ('WebGL created before near viewport', initial)
    await show_stage(page)
    await page.wait_for_function("document.querySelector('[data-eyewear-stage]')?.dataset.state === 'ready'", timeout=30000)
    await wait_render_after(page,0)
    current = await draws(page)
    assert current['contexts'] >= 1 and current['totalDraws'] > 0, current
    scripts = sorted(set(logs['javascriptRequests'])-initial_scripts)
    if lazy:
        assert scripts, ('No additional JavaScript requested after stage approached viewport', logs)
    return {'beforeViewport':initial,'afterViewport':current,'lazyJavaScriptRequests':scripts}


async def standard_case(browser, base, width):
    context, page, logs = await new_page(browser,width)
    case = {'width':width,'mode':'standard','passed':False,**logs}
    try:
        case['lazyLoad'] = await open_viewer(page,base,logs)
        canvas = page.locator(STAGE+' canvas')
        assert await canvas.get_attribute('tabindex') == '0'
        assert await canvas.get_attribute('aria-label')
        assert await canvas.get_attribute('role') == 'img'
        assert (await state(page))['playing'] is True
        await pause(page)
        case['manualPause'] = await stable_draws(page,'manual pause')
        case['viewStates'] = []
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
        assert any(pose_changed(case['viewStates'][0],x) for x in case['viewStates'][1:]), case['viewStates']
        zooms = [x.get('zoom',x.get('cameraDistance')) for x in case['viewStates']]
        if all(x is not None for x in zooms):
            assert len({json.dumps(x,sort_keys=True) for x in zooms}) > 1, ('No zoom/distance change',zooms)
            case['zoomChanged'] = True
        else:
            case['zoomChanged'] = 'Not exposed; inspect view screenshots.'
        case['screenshots'] = [await screenshot(page,f'inspection-{width}', '.mi-inspection')]
        await pause(page)
        before_count = (await state(page))['renderCount']
        await page.locator('[data-eyewear-finish="black"]').click()
        await show_stage(page)
        await wait_render_after(page,before_count)
        black = hashlib.sha256(await canvas.screenshot()).hexdigest()
        before_count = (await state(page))['renderCount']
        await page.locator('[data-eyewear-finish="havana"]').click()
        await show_stage(page)
        await wait_render_after(page,before_count)
        havana = hashlib.sha256(await canvas.screenshot()).hexdigest()
        assert (await state(page))['finish'] == 'havana'
        assert await page.locator('[data-eyewear-finish="havana"]').get_attribute('aria-pressed') == 'true'
        assert black != havana, 'Canvas pixels did not change for finish selection.'
        case['finishChanged'] = {'state':'havana','canvasPixelsDiffer':True}
        case['screenshots'].append(await screenshot(page,f'havana-{width}',VIEWER))
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
                await page.wait_for_function("document.querySelector('[data-eyewear-stage]')?.dataset.state === 'fallback'",timeout=20000)
                case['contextAttempts'] = (await draws(page))['contextAttempts']
                assert case['contextAttempts'] > 0
        if mode in ['no-javascript','webgl-unavailable','context-loss']:
            images = page.locator(VIEWER+' img:visible')
            assert await images.count()>0,'Visible fallback poster missing'
            case['fallbackImages'] = await images.evaluate_all('els=>Promise.all(els.map(async e=>{await e.decode();return {src:e.getAttribute("src"),width:e.naturalWidth,height:e.naturalHeight}}))')
            assert all(x['width']>0 and x['height']>0 for x in case['fallbackImages'])
            case['visibleCanvases'] = await page.locator(STAGE+' canvas:visible').count()
            assert case['visibleCanvases']==0
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
    report={'checkedAt':datetime.now(timezone.utc).isoformat(),'base':args.base,'scope':'Actual WebGL eyewear viewer, local built page.',
        'browser':'Chromium with ANGLE SwiftShader software WebGL; hardware GPU performance not measured.',
        'endpointWaitTargets':VIEW_TARGETS,
        'cases':[],'passed':False}
    save(report)
    async with async_playwright() as p:
        browser=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        for width in args.widths:
            case=await standard_case(browser,args.base,width)
            report['cases'].append(case);save(report)
            print(f"standard {width}: {'PASS' if case['passed'] else case['failure']}",flush=True)
        for mode in args.modes:
            case=await alternate_case(browser,args.base,mode)
            report['cases'].append(case);save(report)
            print(f"{mode}: {'PASS' if case['passed'] else case['failure']}",flush=True)
        await browser.close()
    report['passed']=all(case['passed'] for case in report['cases'])
    save(report)
    return report['passed']


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base',default='http://127.0.0.1:4181')
    parser.add_argument('--widths',type=int,nargs='*',default=[1440,390,320])
    parser.add_argument('--modes',nargs='*',default=['reduced-motion','webgl-unavailable','context-loss','no-javascript'])
    args=parser.parse_args();args.base=args.base.rstrip('/')
    raise SystemExit(0 if asyncio.run(run(args)) else 1)
