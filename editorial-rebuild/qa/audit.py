#!/usr/bin/env python3
"""Browser observations for the 12-page editorial rebuild. Never sends mail."""
from __future__ import annotations

import argparse
import asyncio
import json
import statistics
from datetime import datetime, timezone
from pathlib import Path

from playwright.async_api import async_playwright

APP = Path(__file__).resolve().parents[1]
OUT = APP / "output/playwright/full-qa"
ROUTES = ["index", "about", "services", "service-place", "service-blog",
          "service-instagram", "service-cafe", "service-daangn", "service-hpblog",
          "service-website", "location", "contact"]

INIT = """() => {
  window.__qa = { shifts:[], longTasks:[] };
  new PerformanceObserver(list=>{for(const e of list.getEntries()) if(!e.hadRecentInput)
    window.__qa.shifts.push({value:e.value,time:e.startTime,nodes:(e.sources||[]).map(s=>s.node?.className||s.node?.nodeName||'')});
  }).observe({type:'layout-shift',buffered:true});
  try {new PerformanceObserver(list=>{for(const e of list.getEntries())
    window.__qa.longTasks.push({duration:e.duration,time:e.startTime});
  }).observe({type:'longtask',buffered:true});}catch{}
}"""

LAYOUT = """() => {
 const shown=e=>{const s=getComputedStyle(e),b=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&b.width>0&&b.height>0;};
 return {width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,
  scrollY,documentHeight:document.documentElement.scrollHeight,
  h1:[...document.querySelectorAll('h1')].map(e=>e.textContent.trim()),
  overflowingText:[...document.querySelectorAll('main h1,main h2,main h3,main p,main button')].filter(shown).filter(e=>{
   const b=e.getBoundingClientRect();return b.left < -2||b.right>innerWidth+2;
  }).slice(0,30).map(e=>({tag:e.tagName,cls:e.className,text:e.textContent.trim().slice(0,100)})),
  images:[...document.images].map(e=>({src:e.getAttribute('src'),loaded:e.complete&&e.naturalWidth>0})),
  unnamedControls:[...document.querySelectorAll('button,a[href]')].filter(shown).filter(e=>!e.textContent.trim()&&!e.getAttribute('aria-label')&&!e.querySelector('img[alt]')).map(e=>e.outerHTML.slice(0,160)),
  brokenAnchors:[...document.querySelectorAll('a[href^="#"]')].filter(e=>e.hash.length>1&&!document.getElementById(decodeURIComponent(e.hash.slice(1)))).map(e=>e.hash),
  footerHeadingLines:(()=>{const el=document.querySelector('.footer-heading>span');if(!el)return[];
   const lines=[],walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);while(walk.nextNode()){
    const node=walk.currentNode;for(let i=0;i<node.length;i++){
     const range=document.createRange();range.setStart(node,i);range.setEnd(node,i+1);const box=range.getBoundingClientRect();
     let line=lines.find(line=>Math.abs(line.top-box.top)<3);if(!line){line={top:box.top,text:''};lines.push(line)}line.text+=node.textContent[i];
    }
   }return lines.sort((a,b)=>a.top-b.top).map(line=>line.text.trim()).filter(Boolean)})()
 };
}"""

MOCK_SDK = """window.__mailCalls=window.__mailCalls||[];window.__mailMode=window.__mailMode||'success';window.emailjs={
 init(key){window.__mailInit=key},
 send(service,template,payload){window.__mailCalls.push({service,template,payload});
  if(window.__mailMode==='failure')return Promise.reject(new Error('QA simulated delivery failure'));
  if(window.__mailMode==='pending')return new Promise(resolve=>window.__resolveMail=resolve);
  return Promise.resolve({status:200,text:'QA mock only'});
 }};"""


async def block_mail(context, sdk=True):
    await context.route("**/api.emailjs.com/**", lambda route: route.abort())
    if sdk:
        await context.route("**/assets/vendor/email.min.js", lambda route: route.fulfill(status=200, content_type="application/javascript", body=MOCK_SDK))


async def capture(page, label):
    filename = OUT / f"{label}.png"
    filename.parent.mkdir(parents=True, exist_ok=True)
    await page.screenshot(path=str(filename), animations="allow")
    return str(filename.relative_to(APP))


async def settle(page, ms=1700):
    await page.evaluate("document.fonts.ready")
    await page.wait_for_timeout(ms)


async def scroll_to(page, y, delay=650):
    await page.evaluate("y=>scrollTo({top:y,behavior:'instant'})", y)
    await page.wait_for_timeout(delay)


def cls(shifts):
    maximum = current = 0
    start = previous = None
    for shift in shifts:
        t = shift["time"]
        if start is None or t - previous > 1000 or t - start > 5000:
            current, start = 0, t
        current += shift["value"]
        maximum, previous = max(maximum, current), t
    return round(maximum, 5)


async def menu_check(page):
    toggle = page.locator("[data-menu-open]").first
    if not await toggle.count():
        return {"error": "menu opener missing"}
    await scroll_to(page, 0)
    await toggle.click()
    await page.wait_for_timeout(650)
    dialog = page.locator("#site-menu")
    result = {"open": await dialog.evaluate("e=>e.open"), "expanded": await toggle.get_attribute("aria-expanded")}
    result["screenshot"] = await capture(page, f"menu-{page.viewport_size['width']}")
    result["links"] = await dialog.locator("a[href]").evaluate_all("xs=>xs.map(e=>e.getAttribute('href'))")
    result["focusInside"] = []
    # Both forward and reverse traversal include wrap-around.
    for key in ["Tab"] * (len(result["links"]) + 3) + ["Shift+Tab"] * 3:
        await page.keyboard.press(key)
        result["focusInside"].append(await dialog.evaluate("e=>e.contains(document.activeElement)"))
    await page.keyboard.press("Escape")
    await page.wait_for_timeout(400)
    result["closedOnEscape"] = not await dialog.evaluate("e=>e.open")
    result["focusRestored"] = await toggle.evaluate("e=>e===document.activeElement")
    result["expandedAfter"] = await toggle.get_attribute("aria-expanded")
    await toggle.click()
    await page.wait_for_timeout(350)
    await dialog.evaluate('e=>e.scrollTop=e.scrollHeight')
    await page.wait_for_timeout(200)
    close=dialog.locator('[data-menu-close]')
    result['closeVisibleAtMenuBottom']=await close.evaluate('e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight}')
    if page.viewport_size['width']==390:
        result['menuBottomScreenshot']=await capture(page,'menu-bottom-390')
        await close.tap()
    else:
        await close.click()
    await page.wait_for_timeout(350)
    result['closeButtonWorks']=not await dialog.evaluate('e=>e.open')
    return result


async def home_check(page, mobile, reduced):
    result = {"scrollStates": []}
    hero = page.locator(".home-opening")
    if await hero.count():
        geom = await hero.evaluate("e=>({top:e.getBoundingClientRect().top+scrollY,height:e.offsetHeight})")
        span = max(200, geom["height"] - page.viewport_size["height"])
        for name, fraction in [("start", 0), ("middle", .5), ("end", 1)]:
            await scroll_to(page, geom["top"] + span * fraction)
            result["scrollStates"].append({"name": name,"layout": await page.evaluate(LAYOUT),
                "motion": await page.evaluate("()=>window.__kottoMotion||null"),
                "screenshot": await capture(page, f"home-{page.viewport_size['width']}-{'reduced' if reduced else 'normal'}-scene-{name}")})
        await scroll_to(page, 0)
        await page.mouse.wheel(0, 700)
        await page.wait_for_timeout(800)
        result["nativeWheel"] = {"scrollY": await page.evaluate("scrollY"), "motion": await page.evaluate("()=>window.__kottoMotion||null")}
        if not reduced:
            frames = await page.evaluate("""({start,end})=>new Promise(resolve=>{
              const dt=[];let first,last;function tick(t){first??=t;if(last)dt.push(t-last);last=t;
              const p=Math.min((t-first)/2000,1);scrollTo({top:start+(end-start)*p,behavior:'instant'});
              if(p<1)requestAnimationFrame(tick);else resolve(dt)}requestAnimationFrame(tick)
            })""", {"start": geom["top"], "end": geom["top"] + span})
            frames.sort()
            result["raf"] = {"samples":len(frames),"medianMs":round(statistics.median(frames),2),
                "p95Ms":round(frames[min(len(frames)-1,int(len(frames)*.95))],2),"over50ms":sum(x>50 for x in frames)}
    if mobile:
        await scroll_to(page, 0)
        client = await page.context.new_cdp_session(page)
        await client.send("Input.dispatchTouchEvent", {"type":"touchStart","touchPoints":[{"x":200,"y":720}]})
        for y in [660,590,520,450,380]:
            await client.send("Input.dispatchTouchEvent", {"type":"touchMove","touchPoints":[{"x":200,"y":y}]})
            await page.wait_for_timeout(40)
        await client.send("Input.dispatchTouchEvent", {"type":"touchEnd","touchPoints":[]})
        await page.wait_for_timeout(500)
        result["touchSwipeY"] = await page.evaluate("scrollY")
        await client.detach()
    result["menu"] = await menu_check(page)
    return result


async def fill_contact(page):
    for name, value in {"company":"QA 검수 담당자", "storeName":"테스트 안경원", "phone":"010-1234-5678", "region":"서울", "message":"자동화 검수용 가상 문의입니다. 실제로 발송되지 않습니다."}.items():
        await page.locator(f'[name="{name}"]').fill(value)
    await page.locator("#privacy").check()


async def contact_check(page):
    result = {}
    form = page.locator("#contactForm")
    submit = form.locator('[type="submit"]')
    if not await form.count():
        return {"error":"contact form missing"}
    await submit.click()
    result["emptyBlocked"] = await form.evaluate("e=>!e.checkValidity()")
    result["emptySendCalls"] = await page.evaluate("()=>window.__mailCalls?.length||0")
    await fill_contact(page)
    await page.locator("#privacy").uncheck()
    await submit.click()
    result["consentBlocked"] = await page.evaluate("()=>window.__mailCalls?.length||0") == 0
    await page.locator("#privacy").check()
    await page.locator('[name="phone"]').fill("12")
    await submit.click()
    result["badPhoneBlocked"] = await page.evaluate("()=>window.__mailCalls?.length||0") == 0
    await page.locator('[name="phone"]').fill("010-1234-5678")
    await page.evaluate("window.__mailMode='pending'")
    await submit.click()
    await page.wait_for_timeout(350)
    result["pending"] = {"disabled":await submit.is_disabled(), "busy":await form.get_attribute("aria-busy"),
        "calls":await page.evaluate("()=>window.__mailCalls||[]")}
    await form.evaluate("e=>e.dispatchEvent(new Event('submit',{cancelable:true,bubbles:true}))")
    result["duplicateCalls"] = await page.evaluate("()=>window.__mailCalls?.length||0")
    await page.evaluate("()=>window.__resolveMail?.({status:200})")
    await page.wait_for_timeout(450)
    result["success"] = {"reset":await page.locator('[name="company"]').input_value()=="",
        "status":await page.locator("#form-status").inner_text(), "disabled":await submit.is_disabled(),
        "statusVisible":await page.locator('#form-status').evaluate('e=>{const b=e.getBoundingClientRect();return b.top>=-1&&b.bottom<=innerHeight+1}')}
    await fill_contact(page)
    await page.evaluate("window.__mailMode='failure'")
    await submit.click()
    await page.wait_for_timeout(450)
    result["failure"] = {"preserved":await page.locator('[name="company"]').input_value()=="QA 검수 담당자",
        "status":await page.locator("#form-status").inner_text(),"disabled":await submit.is_disabled(),
        "statusVisible":await page.locator('#form-status').evaluate('e=>{const b=e.getBoundingClientRect();return b.top>=-1&&b.bottom<=innerHeight+1}')}
    result["screenshot"] = await capture(page, f"contact-failure-{page.viewport_size['width']}")
    return result


async def service_check(page):
    result = {}
    preview = page.locator('[data-sv-preview="place"]')
    if await page.locator('.sv-index').count() and await preview.count():
        await preview.first.focus()
        await page.wait_for_timeout(800)
        result['keyboardPreview'] = await page.locator('.sv-object-stack .is-active').get_attribute('data-sv-object')
    first_faq = page.locator('.sv-faq-item').first
    if await first_faq.count():
        summary = first_faq.locator('summary')
        await summary.focus()
        await page.keyboard.press('Enter')
        result['faqKeyboardOpen'] = await first_faq.evaluate('e=>e.open')
        result['faqAnswerVisible'] = await first_faq.locator('.sv-faq-answer').is_visible()
        await page.keyboard.press('Enter')
        result['faqKeyboardClosed'] = not await first_faq.evaluate('e=>e.open')
    return result


async def location_check(page):
    await page.locator('[data-copy-address]').click()
    await page.wait_for_timeout(250)
    result = {'copyFeedback':await page.locator('#co-copy-status').inner_text()}
    await page.context.route('**/maps/embed**',lambda route:route.fulfill(status=200,content_type='text/html',body='<p>QA: external map isolated</p>'))
    await page.locator('[data-load-map]').click()
    result['iframe'] = await page.locator('#co-map-window iframe').evaluate('e=>({src:e.src,title:e.title})')
    return result


async def navigation_and_fallback(browser, base, width):
    context=await browser.new_context(viewport={"width":width,"height":844 if width==390 else 900},is_mobile=width==390,has_touch=width==390,locale='ko-KR')
    await block_mail(context,sdk=False)
    # Script successfully loads but exposes no SDK. The site must retain the inquiry.
    await context.route('**/assets/vendor/email.min.js',lambda route:route.fulfill(status=200,content_type='application/javascript',body='/* QA intentionally unavailable SDK */'))
    page=await context.new_page()
    result={'width':width,'mailApiRequests':[]}
    page.on('request',lambda request:result['mailApiRequests'].append(request.url) if 'api.emailjs.com' in request.url else None)
    try:
        await page.goto(f'{base}/index.html')
        await settle(page,1800)
        await page.locator('.hero-cta[href="services.html"]').click()
        await page.wait_for_url('**/services.html')
        result['homeToServices']=True
        await settle(page,700)
        await page.locator('.sv-directory-links a[href="service-blog.html"]').click()
        await page.wait_for_url('**/service-blog.html')
        result['servicesToDetail']=True
        await settle(page,700)
        await page.locator('.sv-detail-heading a[href="contact.html?service=blog"]').click()
        await page.wait_for_url('**/contact.html?service=blog')
        await settle(page,700)
        result['detailToContactPrefill']=await page.locator('[name="message"]').input_value()
        await fill_contact(page)
        await page.locator('#contactForm [type="submit"]').click()
        await page.wait_for_timeout(500)
        result['sdkUnavailable']={'status':await page.locator('#form-status').inner_text(),
            'preserved':await page.locator('[name="company"]').input_value()=='QA 검수 담당자',
            'buttonEnabled':await page.locator('#contactForm [type="submit"]').is_enabled()}
        await page.go_back()
        await page.wait_for_url('**/service-blog.html')
        await settle(page,700)
        await page.locator('[data-menu-open]').click()
        await page.wait_for_timeout(600)
        await page.locator('#site-menu .menu-chapters a[href="location.html"]').click()
        await page.wait_for_url('**/location.html')
        result['menuToLocation']=True
    except Exception as exc:
        result['harnessError']=f'{type(exc).__name__}: {exc}'
    finally:
        await context.close()
    return result


async def inspect(browser, base, route, width, reduced=False, js=True):
    height, mobile = (844, True) if width == 390 else (900, False)
    label = f"{route}-{width}-{'reduced' if reduced else 'normal'}{'-nojs' if not js else ''}"
    context = await browser.new_context(viewport={"width":width,"height":height},is_mobile=mobile,has_touch=mobile,
        locale="ko-KR", reduced_motion="reduce" if reduced else "no-preference",java_script_enabled=js)
    await block_mail(context)
    if js:
        await context.add_init_script(f"({INIT})()")
    page = await context.new_page()
    errors, console, http = [], [], []
    page.on("pageerror",lambda e:errors.append(str(e)))
    page.on("console",lambda e:console.append(e.text) if e.type=="error" else None)
    page.on("response",lambda r:http.append({"url":r.url,"status":r.status}) if r.status>=400 else None)
    result = {"case":label,"route":route,"width":width,"reduced":reduced,"js":js,"errors":errors,"consoleErrors":console,"httpErrors":http}
    try:
        response = await page.goto(f"{base}/{route}.html",wait_until="domcontentloaded")
        result["status"] = response.status
        if route == "index" and js:
            result["introStart"] = await capture(page,f"{label}-intro-start")
            await page.wait_for_timeout(550)
            result["introMiddle"] = await capture(page,f"{label}-intro-middle")
        await settle(page,1700 if route=="index" else 1000)
        result["heroScreenshot"] = await capture(page,f"{label}-hero")
        result["heroLayout"] = await page.evaluate(LAYOUT)
        result["title"] = await page.title()
        result["links"] = await page.locator('a[href]').evaluate_all("xs=>xs.map(x=>({href:x.getAttribute('href'),text:x.textContent.trim()}))")
        if js:
            result["initialCls"] = cls((await page.evaluate("window.__qa"))["shifts"])
        await page.keyboard.press('Tab')
        result['firstKeyboardFocus'] = await page.evaluate("()=>({text:document.activeElement.textContent.trim(),href:document.activeElement.getAttribute('href'),outline:getComputedStyle(document.activeElement).outlineStyle})")
        await page.evaluate('document.activeElement.blur()')
        if route == "index" and js:
            result["home"] = await home_check(page,mobile,reduced)
        if route == "contact" and js and not reduced:
            result["form"] = await contact_check(page)
        if route.startswith('service') and js:
            result['services'] = await service_check(page)
        if route == 'location' and js:
            result['location'] = await location_check(page)
        # Follow native scrolling to activate subsequent reveal scenes.
        doc_height = await page.evaluate("document.documentElement.scrollHeight")
        for y in range(0,doc_height,height-150):
            await scroll_to(page,y,90)
        await page.wait_for_timeout(600)
        result["footerScreenshot"] = await capture(page,f"{label}-footer")
        result["footerLayout"] = await page.evaluate(LAYOUT)
        await scroll_to(page,doc_height*.48,700)
        result["middleScreenshot"] = await capture(page,f"{label}-middle")
        result["middleLayout"] = await page.evaluate(LAYOUT)
        result["maxHorizontalOverflow"] = max(result[k]["scrollWidth"]-width for k in ["heroLayout","middleLayout","footerLayout"])
        if js:
            result["performance"] = await page.evaluate("window.__qa")
            result["cls"] = cls(result["performance"]["shifts"])
            result["motion"] = await page.evaluate("()=>window.__kottoMotion||null")
        else:
            result["readableMainTextLength"] = len(await page.locator("main").inner_text())
    except Exception as exc:
        result["harnessError"] = f"{type(exc).__name__}: {exc}"
        try:
            result["failureScreenshot"] = await capture(page,f"{label}-failure")
        except Exception:
            pass
    finally:
        await context.close()
    (OUT / f"{label}.json").write_text(json.dumps(result,ensure_ascii=False,indent=2))
    print(json.dumps({"case":label,"error":result.get("harnessError"),"pageErrors":len(errors),"consoleErrors":len(console),"httpErrors":len(http),"overflow":result.get("maxHorizontalOverflow")}),flush=True)
    return result


async def run(args):
    OUT.mkdir(parents=True,exist_ok=True)
    cases = [(r,w,args.reduced_only,True) for r in args.routes.split(",") for w in args.widths]
    if args.extended:
        cases += [(r,w,True,True) for r in ["index","services","contact"] for w in args.widths]
        cases += [(r,w,False,False) for r in ["index","service-place","contact"] for w in args.widths]
    async with async_playwright() as p:
        browser=await p.chromium.launch(executable_path="/usr/bin/chromium",args=["--no-sandbox"],headless=True)
        results=[]
        for route,width,reduced,js in cases:
            results.append(await inspect(browser,args.base.rstrip("/"),route,width,reduced,js))
        flows=[]
        if args.extended:
            for width in args.widths:
                flows.append(await navigation_and_fallback(browser,args.base.rstrip('/'),width))
        await browser.close()
    previous_path=APP/'reports/qa-results.json'
    if args.merge and previous_path.exists():
        previous=json.loads(previous_path.read_text())
        updated={result['case']:result for result in results}
        results=[updated.pop(result['case'],result) for result in previous['cases']]+list(updated.values())
        if not flows:
            flows=previous.get('navigationFlows',[])
    report={"time":datetime.now(timezone.utc).isoformat(),"base":args.base,"note":"Internal QA origin, not a public preview. EmailJS SDK replaced; API sends blocked.","cases":results,"navigationFlows":flows}
    (APP / "reports/qa-results.json").write_text(json.dumps(report,ensure_ascii=False,indent=2))
    print("REPORT",APP / "reports/qa-results.json",flush=True)


if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--base",default="http://127.0.0.1:4176")
    parser.add_argument("--routes",default=",".join(ROUTES))
    parser.add_argument("--widths",type=int,nargs="+",default=[1440,390])
    parser.add_argument("--extended",action="store_true")
    parser.add_argument("--reduced-only",action="store_true")
    parser.add_argument("--merge",action="store_true")
    asyncio.run(run(parser.parse_args()))
