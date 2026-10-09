#!/usr/bin/env python3
"""Record actual Chromium frames, preserving capture timing. No interpolated stills."""
import argparse
import asyncio
import base64
import json
import time
from pathlib import Path

from playwright.async_api import async_playwright

APP = Path(__file__).resolve().parents[1]


async def glide(page, y, seconds):
    await page.evaluate("""({y,seconds})=>new Promise(resolve=>{
      const from=scrollY;let start;
      function tick(t){start??=t;const p=Math.min(1,(t-start)/(seconds*1000));
        const ease=p*p*(3-2*p);scrollTo({top:from+(y-from)*ease,behavior:'instant'});
        if(p<1)requestAnimationFrame(tick);else resolve()}requestAnimationFrame(tick)
    })""", {"y": y, "seconds": seconds})


async def section(page, selector, seconds=2):
    y=await page.locator(selector).evaluate("e=>e.getBoundingClientRect().top+scrollY-110")
    await glide(page,y,seconds)


async def record(browser, base, mobile):
    width,height=(390,844) if mobile else (1440,900)
    label="mobile" if mobile else "desktop"
    directory=APP/f"output/playwright/recording-frames/{label}"
    directory.mkdir(parents=True,exist_ok=True)
    videos=APP/"output/playwright/videos"
    videos.mkdir(parents=True,exist_ok=True)
    context=await browser.new_context(viewport={"width":width,"height":height},is_mobile=mobile,has_touch=mobile,locale="ko-KR")
    await context.route("**/api.emailjs.com/**",lambda route:route.abort())
    page=await context.new_page()
    cdp=await context.new_cdp_session(page)
    frames=[];pending=set()
    async def on_frame(event):
        await cdp.send("Page.screencastFrameAck",{"sessionId":event["sessionId"]})
        path=directory/f"{len(frames):05d}.jpg"
        timestamp=event["metadata"].get("timestamp",time.time())
        frames.append((path,timestamp))
        path.write_bytes(base64.b64decode(event["data"]))
    def receive(event):
        task=asyncio.create_task(on_frame(event));pending.add(task);task.add_done_callback(pending.discard)
    cdp.on("Page.screencastFrame",receive)
    await cdp.send("Page.startScreencast",{"format":"jpeg","quality":88,"maxWidth":width,"maxHeight":height,"everyNthFrame":2})
    await page.goto(f"{base}/index.html",wait_until="networkidle")
    await page.evaluate("document.fonts.ready")
    await page.wait_for_timeout(2200)
    if not mobile:
        await page.mouse.move(width*.60,height*.42)
        await page.mouse.move(width*.90,height*.63,steps=30)
        await page.wait_for_timeout(600)
    opening=await page.locator(".home-opening").evaluate("e=>e.offsetHeight")
    await glide(page,max(0,opening-height),5.5)
    await page.wait_for_timeout(900)
    await section(page,".achievements",2)
    await page.wait_for_timeout(1300)
    await section(page,".brand-film",3.2)
    await page.wait_for_timeout(1700)
    await section(page,".home-services",3.5)
    await page.wait_for_timeout(1300)
    link=page.locator('.home-service-list a[href="service-blog.html"]')
    await link.scroll_into_view_if_needed()
    if mobile:
        await link.tap()
    else:
        await link.click()
    await page.wait_for_url("**/service-blog.html")
    await page.wait_for_timeout(1600)
    await section(page,".sv-scope",3.5)
    await page.wait_for_timeout(1500)
    await page.locator("[data-menu-open]").click()
    await page.wait_for_timeout(1200)
    contact=page.locator('#site-menu .menu-chapters a[href="contact.html"]')
    await contact.click()
    await page.wait_for_url("**/contact.html")
    await page.wait_for_timeout(1400)
    await section(page,"#contactForm",2.5)
    await page.wait_for_timeout(1600)
    stop=time.time()
    await cdp.send("Page.stopScreencast")
    if pending:
        await asyncio.gather(*pending)
    await context.close()
    concat=directory/"frames.txt"
    lines=[]
    for i,(path,timestamp) in enumerate(frames):
        duration=(frames[i+1][1] if i+1<len(frames) else stop)-timestamp
        lines.extend([f"file '{path.name}'","option framerate 1000",f"duration {max(.001,duration):.6f}"])
    lines.extend([f"file '{frames[-1][0].name}'","option framerate 1000","duration 0.001"])
    concat.write_text("\n".join(lines)+"\n")
    output=videos/f"kotto-editorial-{label}.mp4"
    proc=await asyncio.create_subprocess_exec("ffmpeg","-hide_banner","-loglevel","error","-y","-f","concat","-safe","0","-i",str(concat),"-vf","fps=30","-c:v","libx264","-preset","fast","-crf","24","-pix_fmt","yuv420p","-movflags","+faststart","-t",str(stop-frames[0][1]),str(output))
    if await proc.wait():
        raise RuntimeError(f"Video encoding failed: {label}")
    result={"viewport":[width,height],"file":str(output.relative_to(APP)),"durationSeconds":round(stop-frames[0][1],2),"frames":len(frames),"method":"Chromium CDP actual JPEG frames with timestamp-preserving FFmpeg encode; no submitted form"}
    print(json.dumps(result),flush=True)
    return result


async def main(args):
    async with async_playwright() as p:
        browser=await p.chromium.launch(executable_path="/usr/bin/chromium",args=["--no-sandbox"])
        results=[]
        for mobile in [False,True]:
            results.append(await record(browser,args.base.rstrip("/"),mobile))
        await browser.close()
    (APP/"reports/qa-recordings.json").write_text(json.dumps(results,ensure_ascii=False,indent=2)+"\n")


if __name__=="__main__":
    parser=argparse.ArgumentParser();parser.add_argument("--base",default="http://127.0.0.1:4176")
    asyncio.run(main(parser.parse_args()))
