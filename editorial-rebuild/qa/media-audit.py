#!/usr/bin/env python3
"""Record and audit the media-led 12-page update. Mail is always mocked/blocked."""
import argparse
import asyncio
import base64
import json
import importlib.util
import subprocess
import time
from datetime import datetime, timezone
from pathlib import Path

from playwright.async_api import async_playwright
import audit as existing
from record import glide,section as glide_to_section

APP=Path(__file__).resolve().parents[1]
OUT=APP/'output/playwright/media-rich-update'
existing.OUT=OUT
spec=importlib.util.spec_from_file_location('media_evidence_helpers',Path(__file__).with_name('evidence-audit.py'))
evidence=importlib.util.module_from_spec(spec);spec.loader.exec_module(evidence)
evidence.OUT=OUT;existing.OUT=OUT

MEDIA_STATE='''()=>{
 const intersect=(r,a)=>({left:Math.max(r.left,a.left),right:Math.min(r.right,a.right),top:Math.max(r.top,a.top),bottom:Math.min(r.bottom,a.bottom)});
 const viewport={left:0,right:innerWidth,top:0,bottom:innerHeight};
 return [...document.querySelectorAll('main img[src],main video,main canvas,main svg[role=img]')].map(e=>{
  const r=e.getBoundingClientRect();let b=intersect(r,viewport),p=e.parentElement;
  while(p&&p!==document.body){const s=getComputedStyle(p);if(['hidden','clip','scroll','auto'].includes(s.overflowX)||['hidden','clip','scroll','auto'].includes(s.overflowY))b=intersect(b,p.getBoundingClientRect());p=p.parentElement;}
  const style=getComputedStyle(e),area=Math.max(0,b.right-b.left)*Math.max(0,b.bottom-b.top);
  return{tag:e.tagName,src:e.currentSrc||e.getAttribute('src'),alt:e.getAttribute('alt'),width:r.width,height:r.height,
   visibleArea:style.visibility==='hidden'||style.display==='none'?0:area,fit:style.objectFit,
   natural:e.tagName==='IMG'?[e.naturalWidth,e.naturalHeight]:null,loaded:e.tagName==='IMG'?e.complete&&e.naturalWidth>0:null,
   video:e.tagName==='VIDEO'?{currentTime:e.currentTime,paused:e.paused,readyState:e.readyState,controls:e.controls,poster:e.poster,muted:e.muted,loop:e.loop}:null};
 });
}'''


async def capture(page,label):
    path=OUT/f'{label}.png';path.parent.mkdir(parents=True,exist_ok=True)
    await page.screenshot(path=str(path),animations='allow')
    return str(path.relative_to(APP))


async def home_scenes(page,label):
    result={'hero':[],'stories':[]}
    height=page.viewport_size['height'];mobile=page.viewport_size['width']==390
    for kind,selector in [('hero','.home-opening'),('stories','.home-stories')]:
        section=page.locator(selector)
        if not await section.count():raise RuntimeError(f'Expected home motion section missing: {selector}')
        geometry=await section.evaluate('e=>({top:e.getBoundingClientRect().top+scrollY,height:e.offsetHeight})')
        span=max(1,geometry['height']-height+(0 if mobile else 88))
        for name,fraction in [('start',0),('middle',.5),('end',1)]:
            await existing.scroll_to(page,max(0,geometry['top']-(72 if mobile else 88)+span*fraction),1100)
            result[kind].append({'state':name,'motion':await page.evaluate('window.__kottoMotion||null'),'selected':await page.locator('[data-story-select][aria-pressed="true"]').get_attribute('data-story-select'),
                'screenshot':await capture(page,f'{label}-{kind}-{name}')})
    result['storyButtons']=[]
    for i in range(3):
        button=page.locator(f'[data-story-select="{i}"]');await button.click();await page.wait_for_timeout(1000)
        scene=page.locator(f'[data-story-scene="{i}"]')
        await scene.locator('img').evaluate('e=>e.decode()')
        result['storyButtons'].append({'index':i,'pressed':await button.get_attribute('aria-pressed'),'visible':await scene.is_visible(),'imageLoaded':await scene.locator('img').evaluate('e=>e.complete&&e.naturalWidth>0')})
    return result


async def page_case(browser,base,route,width,baseline):
    height=844 if width==390 else 900
    label=f'{"baseline" if baseline else "final"}-{route}-{width}'
    context=await browser.new_context(viewport={'width':width,'height':height},is_mobile=width==390,has_touch=width==390,locale='ko-KR')
    await existing.block_mail(context)
    await context.add_init_script(f'({existing.INIT})()')
    page=await context.new_page();errors=[];http=[];console=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('console',lambda e:console.append(e.text) if e.type=='error' else None)
    page.on('response',lambda r:http.append({'url':r.url,'status':r.status}) if r.status>=400 else None)
    result={'route':route,'viewport':[width,height],'errors':errors,'consoleErrors':console,'httpErrors':http,'states':[]}
    try:
        response=await page.goto(f'{base}/{route}.html',wait_until='domcontentloaded')
        result['status']=response.status
        await existing.settle(page,1450)
        result['assets']=await page.locator('script[src],link[rel=stylesheet]').evaluate_all('es=>es.map(e=>e.src||e.href)')
        result['initialCls']=existing.cls((await page.evaluate('window.__qa'))['shifts'])
        scroll_max=await page.evaluate('Math.max(0,document.documentElement.scrollHeight-innerHeight)')
        for state,y in [('first',0),('middle',scroll_max*.5)]:
            await existing.scroll_to(page,y,800)
            result['states'].append({'name':state,'scrollY':await page.evaluate('scrollY'),'media':await page.evaluate(MEDIA_STATE),
                'layout':await page.evaluate(existing.LAYOUT),'screenshot':await capture(page,f'{label}-{state}')})
        result['mainTextLength']=len(await page.locator('main').inner_text())
        result['allMedia']=await page.evaluate(MEDIA_STATE)
        if not baseline:
            result['contentContract']={'homeHasPortfolioGallery':await page.locator('[data-ev-portfolio]').count() if route=='index' else None,
                'portfolioIndices':await page.locator('[data-evidence-open="portfolio"]').evaluate_all('es=>[...new Set(es.map(e=>e.dataset.evidenceIndex))]'),
                'reviewIndices':await page.locator('[data-evidence-open="review"]').evaluate_all('es=>[...new Set(es.map(e=>e.dataset.evidenceIndex))]'),
                'inquiryIndices':await page.locator('[data-evidence-open="inquiry"]').evaluate_all('es=>[...new Set(es.map(e=>e.dataset.evidenceIndex))]'),
                'metrics':await page.locator('.achievement').evaluate_all("es=>es.map(e=>[e.querySelector('dt').textContent.trim(),e.querySelector('dd').textContent.replace(/\\s/g,'')])")}
            result['galleries']=[]
            if route.startswith('service-'):
                feature=page.locator('[data-sv-feature]')
                if await feature.count()!=1:raise RuntimeError('Expected prominent follow-up media section on service detail')
                await feature.scroll_into_view_if_needed();await page.wait_for_timeout(900)
                result['serviceFeature']={'media':await feature.locator('img').evaluate_all('es=>es.map(e=>({src:e.getAttribute("src"),loaded:e.complete&&e.naturalWidth>0,alt:e.alt}))'),
                    'screenshot':await capture(page,f'{label}-service-feature')}
                result['serviceMediaControls']=[]
                for control in await page.locator('[data-sm-select],[data-sm-device]').all():
                    await control.click();await page.wait_for_timeout(700)
                    result['serviceMediaControls'].append({'label':await control.inner_text(),'pressed':await control.get_attribute('aria-pressed'),
                        'state':await control.evaluate('e=>e.closest("[data-sm-scene]").dataset.smState'),
                        'layout':await page.evaluate(existing.LAYOUT)})
            if route=='service-hpblog':
                if await page.locator('[data-ev-portfolio]').count()!=1:raise RuntimeError('Expected preserved portfolio gallery on homepage-blog detail')
                result['portfolio']=await evidence.portfolio_scene(page,label,width==390,False)
                result['galleries'].append(await evidence.viewer_group(page,'portfolio',label,True))
            if route=='index':
                result['homeScenes']=await home_scenes(page,label)
                result['menu']=await existing.menu_check(page)
                if await page.locator('[data-ev-portfolio]').count():raise RuntimeError('Homepage still contains removed homepage-blog portfolio gallery')
                for kind in ['review','inquiry']:
                    if not await page.locator('[data-ev-voices]').count():raise RuntimeError('Expected preserved customer evidence section on home')
                    result['galleries'].append(await evidence.viewer_group(page,kind,label,True))
            if route=='contact':result['form']=await existing.contact_check(page)
            if await page.locator('.sv-faq-item').count():
                result['faq']=[]
                for detail in await page.locator('.sv-faq-item').all():
                    summary=detail.locator('summary');await summary.click()
                    result['faq'].append({'open':await detail.get_attribute('open') is not None,'answer':await detail.locator('.sv-faq-answer').is_visible()})
            # Decode actual source files separately from normal lazy-loading state.
            result['imageResources']=await page.evaluate('''async()=>{const paths=[...new Set([...document.querySelectorAll('main img[src]')].map(e=>e.src))];return Promise.all(paths.map(async src=>{const i=new Image();i.src=src;try{await i.decode();return{src,loaded:true,size:[i.naturalWidth,i.naturalHeight]}}catch(e){return{src,loaded:false}}}))}''')
            result['finalLayout']=await page.evaluate(existing.LAYOUT)
            result['observedCls']=existing.cls((await page.evaluate('window.__qa'))['shifts'])
    except Exception as exc:
        result['harnessError']=f'{type(exc).__name__}: {exc}'
    await context.close()
    print(json.dumps({'route':route,'width':width,'error':result.get('harnessError'),'mediaFirst':sum(x['visibleArea'] for x in result['states'][0]['media']) if result['states'] else None}),flush=True)
    return result


async def video_case(browser,base,width,mode):
    context=await browser.new_context(viewport={'width':width,'height':844 if width==390 else 900},is_mobile=width==390,has_touch=width==390,
        reduced_motion='reduce' if mode=='reduced' else 'no-preference',locale='ko-KR')
    if mode=='save-data':
        await context.add_init_script("Object.defineProperty(navigator,'connection',{configurable:true,value:{saveData:true,addEventListener(){},removeEventListener(){}}})")
    page=await context.new_page();requests=[];errors=[]
    page.on('request',lambda r:requests.append(r.url) if '.mp4' in r.url or '.webm' in r.url else None)
    page.on('pageerror',lambda e:errors.append(str(e)))
    result={'width':width,'mode':mode,'errors':errors}
    try:
        await page.goto(f'{base}/index.html',wait_until='domcontentloaded');await existing.settle(page,1700)
        figure=page.locator('[data-brand-video]').first
        if not await figure.count():raise RuntimeError('Expected new brand video on homepage')
        await figure.scroll_into_view_if_needed();await page.wait_for_timeout(1000)
        video=figure.locator('video');button=figure.locator('.brand-video-control')
        state="e=>({src:e.getAttribute('src'),currentSrc:e.currentSrc,time:e.currentTime,paused:e.paused,readyState:e.readyState,poster:e.poster,muted:e.muted,inline:e.playsInline,diagnostics:e.closest('[data-brand-video]').brandVideo})"
        result['initial']=await video.evaluate(state);result['initialRequests']=list(requests)
        result['posterLoaded']=await video.evaluate("async e=>{const p=new Image();p.src=e.poster;try{await p.decode();return p.naturalWidth>0}catch{return false}}")
        await page.wait_for_timeout(850);result['afterWait']=await video.evaluate(state)
        result['initialTimeAdvanced']=result['afterWait']['time']!=result['initial']['time']
        result['posterScreenshot']=await capture(page,f'video-{width}-{mode}-initial')
        if await video.evaluate('e=>!e.paused'):
            await button.click();await page.wait_for_timeout(180)
        paused_time=await video.evaluate('e=>e.currentTime');await page.wait_for_timeout(650)
        result['pauseStopsTime']=abs(await video.evaluate('e=>e.currentTime')-paused_time)<.05
        await button.click();await page.wait_for_timeout(900)
        t1=await video.evaluate('e=>e.currentTime');await page.wait_for_timeout(700)
        result['manualPlayback']=await video.evaluate(state)
        result['manualTimeAdvanced']=await video.evaluate('e=>e.currentTime')!=t1
        result['button']=await button.evaluate("e=>{const r=e.getBoundingClientRect();return{label:e.getAttribute('aria-label'),pressed:e.getAttribute('aria-pressed'),width:r.width,height:r.height,visible:r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight}}")
        result['playingScreenshot']=await capture(page,f'video-{width}-{mode}-playing')
        if mode=='normal':
            result['decodedScenes']=[]
            for seconds in [.7,4.5,8.3,12.2]:
                await video.evaluate("(e,t)=>new Promise(resolve=>{e.pause();e.addEventListener('seeked',()=>resolve(),{once:true});e.currentTime=t})",seconds)
                await page.wait_for_timeout(180)
                result['decodedScenes'].append({'time':await video.evaluate('e=>e.currentTime'),'screenshot':await capture(page,f'video-{width}-decoded-{seconds}')})
            await button.click();await page.wait_for_timeout(400)
        await page.evaluate('scrollTo(0,document.documentElement.scrollHeight)');await page.wait_for_timeout(750)
        result['offscreenPaused']=await video.evaluate('e=>e.paused')
        await figure.scroll_into_view_if_needed();await page.wait_for_timeout(600)
        if await video.evaluate('e=>!e.paused'):await button.click()
        await page.evaluate('scrollTo(0,document.documentElement.scrollHeight)');await page.wait_for_timeout(300)
        await figure.scroll_into_view_if_needed();await page.wait_for_timeout(650)
        result['manualPausePersists']=await video.evaluate('e=>e.paused')
        result['allVideoRequests']=requests
    except Exception as exc:result['harnessError']=f'{type(exc).__name__}: {exc}'
    await context.close();print(json.dumps({'video':mode,'width':width,'error':result.get('harnessError')}),flush=True)
    return result


async def fallback_case(browser,base,width,js_enabled=True):
    context=await browser.new_context(viewport={'width':width,'height':844 if width==390 else 900},java_script_enabled=js_enabled,
        reduced_motion='reduce',is_mobile=width==390,has_touch=width==390,locale='ko-KR')
    page=await context.new_page();result={'width':width,'javaScript':js_enabled,'pages':[]}
    routes=['index','about','services','service-hpblog','service-blog','contact','location'] if js_enabled else ['index','service-hpblog']
    for route in routes:
        await page.goto(f'{base}/{route}.html',wait_until='domcontentloaded');await existing.settle(page,700)
        data={'route':route,'layout':await page.evaluate(existing.LAYOUT),'media':await page.evaluate(MEDIA_STATE),'screenshot':await capture(page,f'{"reduced" if js_enabled else "no-js"}-{route}-{width}')}
        for y in range(0,await page.evaluate('document.documentElement.scrollHeight'),page.viewport_size['height']):await existing.scroll_to(page,y,40)
        data['endLayout']=await page.evaluate(existing.LAYOUT)
        data['evidenceLinks']=await page.locator('[data-evidence-open]').evaluate_all('es=>es.filter(e=>e.getBoundingClientRect().width>0).map(e=>e.getAttribute("href"))')
        result['pages'].append(data)
    await context.close();return result


async def performance_case(browser,base,width):
    context=await browser.new_context(viewport={'width':width,'height':844 if width==390 else 900},is_mobile=width==390,has_touch=width==390)
    await context.add_init_script(f'({existing.INIT})()')
    page=await context.new_page();await page.goto(f'{base}/index.html',wait_until='networkidle');await existing.settle(page,1000)
    result={'width':width,'dpr':await page.evaluate('devicePixelRatio'),'motions':[]}
    for selector in ['.home-opening','.home-stories']:
        target=page.locator(selector);g=await target.evaluate('e=>({top:e.getBoundingClientRect().top+scrollY,height:e.offsetHeight})')
        start=max(0,g['top']-88);span=max(300,g['height']-page.viewport_size['height']+88)
        await existing.scroll_to(page,start,600)
        await page.mouse.move(35,page.viewport_size['height']*.6)
        await page.evaluate('''()=>{window.__mediaFrames={times:[],running:true};let last;function tick(t){if(last)window.__mediaFrames.times.push(t-last);last=t;if(window.__mediaFrames.running)requestAnimationFrame(tick)}requestAnimationFrame(tick)}''')
        for direction in [1,-1]:
            for _ in range(45):
                await page.mouse.wheel(0,direction*span/45);await page.wait_for_timeout(35)
            await page.wait_for_timeout(300)
            if direction==1:forward=await page.evaluate('window.__kottoMotion||null')
        data=await page.evaluate('''()=>{window.__mediaFrames.running=false;const a=window.__mediaFrames.times.sort((a,b)=>a-b);return{frames:a.length,p50Ms:a[Math.floor(a.length*.5)],p95Ms:a[Math.floor(a.length*.95)],maxMs:a.at(-1),over34:a.filter(x=>x>34).length,over50:a.filter(x=>x>50).length}}''')
        result['motions'].append({'selector':selector,'forward':forward,'reverse':await page.evaluate('window.__kottoMotion||null'),'raf':data})
    result['cls']=existing.cls((await page.evaluate('window.__qa'))['shifts'])
    result['videoPlaybackQuality']=await page.locator('video').first.evaluate('e=>{const q=e.getVideoPlaybackQuality();return{time:e.currentTime,totalFrames:q.totalVideoFrames,droppedFrames:q.droppedVideoFrames,decodedFrames:e.webkitDecodedFrameCount}}')
    await context.close();return result


async def record_tour(browser,base,mobile):
    width,height=(390,844) if mobile else (1440,900)
    label='mobile' if mobile else 'desktop'
    directory=OUT/f'recording-frames/{label}';directory.mkdir(parents=True,exist_ok=True)
    videos=OUT/'videos';videos.mkdir(parents=True,exist_ok=True)
    context=await browser.new_context(viewport={'width':width,'height':height},is_mobile=mobile,has_touch=mobile,locale='ko-KR')
    await context.route('**/api.emailjs.com/**',lambda route:route.abort())
    page=await context.new_page();cdp=await context.new_cdp_session(page);frames=[];pending=set()
    async def frame(event):
        await cdp.send('Page.screencastFrameAck',{'sessionId':event['sessionId']})
        path=directory/f'{len(frames):05d}.jpg';frames.append((path,event['metadata'].get('timestamp',time.time())))
        path.write_bytes(base64.b64decode(event['data']))
    def receive(event):
        task=asyncio.create_task(frame(event));pending.add(task);task.add_done_callback(pending.discard)
    cdp.on('Page.screencastFrame',receive)
    await cdp.send('Page.startScreencast',{'format':'jpeg','quality':88,'maxWidth':width,'maxHeight':height,'everyNthFrame':2})
    await page.goto(f'{base}/index.html',wait_until='networkidle');await page.evaluate('document.fonts.ready')
    await page.wait_for_timeout(4600)
    if not mobile:await page.mouse.move(width*.8,height*.4,steps=12)
    opening=await page.locator('.home-opening').evaluate('e=>e.offsetHeight')
    await glide(page,max(0,opening-height),4.7);await page.wait_for_timeout(700)
    await glide_to_section(page,'.home-stories',2.2)
    story=page.locator('.home-stories')
    if not mobile:
        geometry=await story.evaluate('e=>({top:e.getBoundingClientRect().top+scrollY,height:e.offsetHeight})')
        await glide(page,geometry['top']+geometry['height']-height,5.2)
    else:
        await page.locator('[data-story-select="2"]').tap();await page.wait_for_timeout(1000)
        await glide_to_section(page,'.story-main',1.6);await page.wait_for_timeout(700)
    await glide_to_section(page,'.achievements',1.6);await page.wait_for_timeout(850)
    await glide_to_section(page,'.home-services',2);await page.wait_for_timeout(950)
    link=page.locator('.home-service-list a[href="service-instagram.html"]');await link.scroll_into_view_if_needed();await link.click()
    await page.wait_for_url('**/service-instagram.html');await page.wait_for_timeout(1800)
    await glide_to_section(page,'[data-sv-feature]',3.3);await page.wait_for_timeout(1000)
    await page.locator('[data-menu-open]').click();await page.wait_for_timeout(700)
    await page.locator('#site-menu a[href="service-place.html"]').click();await page.wait_for_url('**/service-place.html');await page.wait_for_timeout(1800)
    await glide_to_section(page,'[data-sv-feature]',3.3);await page.wait_for_timeout(1000)
    await page.locator('[data-menu-open]').click();await page.wait_for_timeout(700)
    await page.locator('#site-menu a[href="about.html"]').click();await page.wait_for_url('**/about.html');await page.wait_for_timeout(1700)
    await glide_to_section(page,'.co-making',3);await page.wait_for_timeout(1700)
    stop=time.time();await cdp.send('Page.stopScreencast')
    if pending:await asyncio.gather(*pending)
    await context.close()
    lines=[]
    for i,(path,timestamp) in enumerate(frames):
        duration=(frames[i+1][1] if i+1<len(frames) else stop)-timestamp
        lines.extend([f"file '{path.name}'",'option framerate 1000',f'duration {max(.001,duration):.6f}'])
    lines.extend([f"file '{frames[-1][0].name}'",'option framerate 1000','duration 0.001'])
    concat=directory/'frames.txt';concat.write_text('\n'.join(lines)+'\n')
    output=videos/f'kotto-media-rich-{label}.mp4'
    process=await asyncio.create_subprocess_exec('ffmpeg','-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',str(concat),'-vf','fps=30','-c:v','libx264','-preset','fast','-crf','24','-pix_fmt','yuv420p','-movflags','+faststart','-t',str(stop-frames[0][1]),str(output))
    if await process.wait():raise RuntimeError('Tour video encoding failed')
    result={'viewport':[width,height],'file':str(output.relative_to(APP)),'durationSeconds':round(stop-frames[0][1],2),'frames':len(frames),
        'routes':['index','service-instagram','service-place','about'],'method':'Actual Chromium CDP frames, timestamp-preserving MP4; real navigation, no synthetic still animation'}
    print(json.dumps(result),flush=True);return result


async def main(args):
    OUT.mkdir(parents=True,exist_ok=True)
    async with async_playwright() as p:
        browser=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        if args.record:
            recordings=[]
            for mobile in [False,True]:recordings.append(await record_tour(browser,args.base.rstrip('/'),mobile))
            await browser.close()
            (APP/'reports/media-rich-update-recordings.json').write_text(json.dumps(recordings,ensure_ascii=False,indent=2)+'\n')
            return
        results=[]
        for route in args.routes.split(','):
            for width in [1440,390]:results.append(await page_case(browser,args.base.rstrip('/'),route,width,args.baseline))
        videos=[];fallbacks=[];performance=[]
        if not args.baseline and not args.pages_only:
            for width in [1440,390]:
                for mode in ['normal','reduced','save-data']:videos.append(await video_case(browser,args.base.rstrip('/'),width,mode))
                for js in [True,False]:fallbacks.append(await fallback_case(browser,args.base.rstrip('/'),width,js))
                performance.append(await performance_case(browser,args.base.rstrip('/'),width))
        await browser.close()
    report={'time':datetime.now(timezone.utc).isoformat(),'gitHead':subprocess.check_output(['git','rev-parse','--short','HEAD'],cwd=APP,text=True).strip(),
        'base':args.base,'baseline':args.baseline,'cases':results,'video':videos,'fallbacks':fallbacks,'performance':performance}
    if not args.baseline:report['originals']=evidence.original_assets()
    file=APP/f'reports/media-rich-update-{"baseline" if args.baseline else "results"}.json'
    file.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(f'REPORT {file.relative_to(APP)}',flush=True)


if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--base',default='http://127.0.0.1:4181')
    parser.add_argument('--routes',default=','.join(existing.ROUTES));parser.add_argument('--baseline',action='store_true')
    parser.add_argument('--pages-only',action='store_true')
    parser.add_argument('--record',action='store_true')
    asyncio.run(main(parser.parse_args()))
