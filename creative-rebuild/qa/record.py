#!/usr/bin/env python3
"""Record real Chromium frames through CDP; encode with the installed FFmpeg.

No stock footage, screenshots interpolated into motion, or external service.
Run against a built preview: python3 qa/record.py --base-url http://127.0.0.1:4174
"""
import argparse
import asyncio
import base64
import json
import time
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]

async def glide(page, y, seconds):
    await page.evaluate('''({y,seconds})=>new Promise(resolve=>{
      const from=scrollY;let start;
      function frame(t){start??=t;const p=Math.min(1,(t-start)/(seconds*1000));
        const eased=p*p*(3-2*p);window.scrollTo({top:from+(y-from)*eased,behavior:'instant'});
        p<1?requestAnimationFrame(frame):resolve();}requestAnimationFrame(frame);
    })''', {'y':y,'seconds':seconds})

async def record(browser, base_url, concept, mobile):
    label=f'{concept}-'+('mobile' if mobile else 'desktop')
    width,height=(390,844) if mobile else (1440,900)
    frames_dir=ROOT/'output/playwright/recording-frames'/label
    frames_dir.mkdir(parents=True,exist_ok=True)
    out=ROOT/'public/recordings';out.mkdir(exist_ok=True)
    context=await browser.new_context(viewport={'width':width,'height':height},
        is_mobile=mobile,has_touch=mobile,device_scale_factor=1,locale='ko-KR')
    page=await context.new_page();cdp=await context.new_cdp_session(page)
    frames=[];pending=set()
    async def on_frame(event):
        await cdp.send('Page.screencastFrameAck',{'sessionId':event['sessionId']})
        file=frames_dir/f'{len(frames):05d}.jpg'
        timestamp=event['metadata'].get('timestamp',time.time())
        frames.append((file,timestamp));file.write_bytes(base64.b64decode(event['data']))
    def receive(event):
        task=asyncio.create_task(on_frame(event));pending.add(task);task.add_done_callback(pending.discard)
    cdp.on('Page.screencastFrame',receive)
    await cdp.send('Page.startScreencast',{'format':'jpeg','quality':88,'maxWidth':width,'maxHeight':height,'everyNthFrame':2})
    await page.goto(f'{base_url}/{concept}.html',wait_until='networkidle')
    await page.evaluate('document.fonts.ready');await page.wait_for_timeout(2400)
    if not mobile:
        await page.mouse.move(width*.55,height*.4)
        await page.mouse.move(width*.87,height*.6,steps=22)
        await page.wait_for_timeout(700)
    if concept=='c':
        for channel in ['place','instagram','blog']:
            button=page.locator(f'button[data-channel="{channel}"]')
            if mobile: await button.tap()
            else: await button.click()
            await page.wait_for_timeout(1100)
    selector={'a':'.a-stage','b':'.b-story','c':'.c-story'}[concept]
    top=await page.locator(selector).evaluate('e=>e.getBoundingClientRect().top+scrollY')
    await glide(page,top,1.7)
    await page.wait_for_timeout(600)
    distance=height*{'a':1.5,'b':1.45 if mobile else 2,'c':1.6}[concept]
    if mobile and concept in ['a','c']:distance=height*1.5
    await glide(page,top+distance,6.2)
    await page.wait_for_timeout(1000)
    if concept=='b':
        for name in ['place','social']:
            button=page.locator(f'button[data-service="{name}"]')
            if mobile:await button.tap()
            else:await button.click()
            await page.wait_for_timeout(1000)
    footer=await page.evaluate('document.documentElement.scrollHeight-innerHeight')
    await glide(page,footer,2.2);await page.wait_for_timeout(1600)
    stop=time.time()
    await cdp.send('Page.stopScreencast')
    if pending:await asyncio.gather(*pending)
    await context.close()
    concat=frames_dir/'frames.txt'
    lines=[]
    for i,(file,timestamp) in enumerate(frames):
        duration=(frames[i+1][1] if i+1<len(frames) else stop)-timestamp
        # JPEG demuxing defaults to a 1/25-second time base. Millisecond precision
        # preserves the real capture timings before conversion to 30 fps.
        lines.extend([f"file '{file.name}'",'option framerate 1000',f'duration {max(.001,duration):.6f}'])
    lines.extend([f"file '{frames[-1][0].name}'",'option framerate 1000','duration 0.001'])
    concat.write_text('\n'.join(lines)+'\n')
    proc=await asyncio.create_subprocess_exec('ffmpeg','-hide_banner','-loglevel','error','-y',
        '-f','concat','-safe','0','-i',str(concat),'-vf','fps=30','-c:v','libx264','-preset','fast',
        '-crf','24','-pix_fmt','yuv420p','-movflags','+faststart','-t',str(stop-frames[0][1]),str(out/f'{label}.mp4'))
    if await proc.wait():raise RuntimeError(f'Encoding failed: {label}')
    result={'concept':concept,'viewport':[width,height],'frames':len(frames),
        'durationSeconds':round(stop-frames[0][1],2),'file':f'public/recordings/{label}.mp4',
        'method':'Chromium Page.startScreencast actual JPEG frames + FFmpeg timestamp-preserving encode'}
    print(json.dumps(result,ensure_ascii=False),flush=True)
    return result

async def main():
    parser=argparse.ArgumentParser();parser.add_argument('--base-url',default='http://127.0.0.1:4174')
    args=parser.parse_args();results=[]
    async with async_playwright() as p:
        browser=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        for concept in 'abc':
            for mobile in [False,True]:results.append(await record(browser,args.base_url,concept,mobile))
        await browser.close()
    (ROOT/'reports/recordings.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n')

if __name__=='__main__':asyncio.run(main())
