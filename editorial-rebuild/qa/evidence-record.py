#!/usr/bin/env python3
"""Record the rebuilt home, real work, and original review viewer in Chromium."""
import argparse
import asyncio
import base64
import json
import time
from pathlib import Path

from playwright.async_api import async_playwright
from record import glide,section

APP=Path(__file__).resolve().parents[1]


async def record(browser,base,mobile):
    width,height=(390,844) if mobile else (1440,900)
    label='mobile' if mobile else 'desktop'
    directory=APP/f'output/playwright/visual-update/recording-frames/{label}'
    directory.mkdir(parents=True,exist_ok=True)
    videos=APP/'output/playwright/visual-update/videos';videos.mkdir(parents=True,exist_ok=True)
    context=await browser.new_context(viewport={'width':width,'height':height},is_mobile=mobile,has_touch=mobile,locale='ko-KR')
    await context.route('**/api.emailjs.com/**',lambda route:route.abort())
    page=await context.new_page();cdp=await context.new_cdp_session(page)
    frames=[];pending=set()
    async def frame(event):
        await cdp.send('Page.screencastFrameAck',{'sessionId':event['sessionId']})
        path=directory/f'{len(frames):05d}.jpg'
        frames.append((path,event['metadata'].get('timestamp',time.time())))
        path.write_bytes(base64.b64decode(event['data']))
    def receive(event):
        task=asyncio.create_task(frame(event));pending.add(task);task.add_done_callback(pending.discard)
    cdp.on('Page.screencastFrame',receive)
    await cdp.send('Page.startScreencast',{'format':'jpeg','quality':88,'maxWidth':width,'maxHeight':height,'everyNthFrame':2})
    await page.goto(f'{base}/index.html',wait_until='networkidle')
    await page.evaluate('document.fonts.ready');await page.wait_for_timeout(2100)
    if not mobile:
        await page.mouse.move(width*.58,height*.45)
        await page.mouse.move(width*.88,height*.62,steps=20)
    opening=await page.locator('.home-opening').evaluate('e=>e.offsetHeight')
    await glide(page,max(0,opening-height),4.7);await page.wait_for_timeout(700)
    await section(page,'.achievement-ledger',1.8)
    await page.wait_for_timeout(1300)
    await section(page,'[data-brand-film]',2.5)
    film=await page.locator('.film-scroll-range').evaluate('e=>({top:e.getBoundingClientRect().top+scrollY,height:e.offsetHeight})')
    await glide(page,film['top']+film['height']-height*.65,4.7)
    await page.wait_for_timeout(900)
    await section(page,'[data-ev-portfolio]',2.7)
    portfolio=page.locator('[data-ev-portfolio]')
    if not mobile:
        geometry=await portfolio.evaluate('e=>({top:e.getBoundingClientRect().top+scrollY,height:e.offsetHeight})')
        await glide(page,geometry['top']+geometry['height']-height,4)
    else:
        await portfolio.locator('[data-ev-select="2"]').tap()
        await page.wait_for_timeout(900)
    await portfolio.locator('[data-ev-select="6"]').click()
    await page.wait_for_timeout(1000)
    await portfolio.locator('[data-evidence-index="6"]').click()
    await page.wait_for_timeout(1300)
    await page.locator('[data-ev-close]').click()
    await page.wait_for_timeout(400)
    await section(page,'[data-ev-voices]',2.9)
    await page.wait_for_timeout(1100)
    await page.locator('[data-evidence-open="review"][data-evidence-index="0"]').click()
    await page.wait_for_timeout(1500)
    await page.locator('[data-ev-zoom]').click()
    await page.wait_for_timeout(1300)
    await page.locator('[data-ev-zoom]').click()
    await page.locator('[data-ev-dialog-next]').click()
    await page.wait_for_timeout(1300)
    await page.locator('[data-ev-close]').click()
    await page.locator('[data-ev-filter="inquiry"]').click()
    await page.wait_for_timeout(950)
    await page.locator('[data-evidence-open="inquiry"][data-evidence-index="0"]').click()
    await page.wait_for_timeout(1300)
    await page.locator('[data-ev-close]').click()
    await page.wait_for_timeout(500)
    stop=time.time()
    await cdp.send('Page.stopScreencast')
    if pending:await asyncio.gather(*pending)
    await context.close()
    lines=[]
    for i,(path,timestamp) in enumerate(frames):
        duration=(frames[i+1][1] if i+1<len(frames) else stop)-timestamp
        lines.extend([f"file '{path.name}'",'option framerate 1000',f'duration {max(.001,duration):.6f}'])
    lines.extend([f"file '{frames[-1][0].name}'",'option framerate 1000','duration 0.001'])
    concat=directory/'frames.txt';concat.write_text('\n'.join(lines)+'\n')
    video=videos/f'kotto-visual-update-{label}.mp4'
    proc=await asyncio.create_subprocess_exec('ffmpeg','-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',str(concat),'-vf','fps=30','-c:v','libx264','-preset','fast','-crf','24','-pix_fmt','yuv420p','-movflags','+faststart','-t',str(stop-frames[0][1]),str(video))
    if await proc.wait():raise RuntimeError('Video encoding failed')
    result={'viewport':[width,height],'file':str(video.relative_to(APP)),'durationSeconds':round(stop-frames[0][1],2),'frames':len(frames),'method':'Actual Chromium CDP frames, timestamp-preserving MP4; no synthetic interpolation or submitted inquiry'}
    print(json.dumps(result),flush=True)
    return result


async def main(args):
    async with async_playwright() as p:
        browser=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        results=[]
        for mobile in [False,True]:results.append(await record(browser,args.base.rstrip('/'),mobile))
        await browser.close()
    (APP/'reports/visual-update-recordings.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n')


if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--base',default='http://127.0.0.1:4181')
    asyncio.run(main(parser.parse_args()))
