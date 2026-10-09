#!/usr/bin/env python3
"""Reproducible browser observations. Does not submit mail or modify site files."""
from __future__ import annotations

import argparse
import asyncio
import io
import json
import statistics
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from PIL import Image, ImageChops
from playwright.async_api import async_playwright

APP = Path(__file__).resolve().parents[1]
OUT = APP / "output" / "playwright" / "rebuild-qa"
REPORT = APP / "reports" / "qa-summary.md"

INIT = """() => {
  window.__qa = { shifts: [], longTasks: [] };
  new PerformanceObserver(list => {
    for (const e of list.getEntries()) if (!e.hadRecentInput)
      window.__qa.shifts.push({ value:e.value,startTime:e.startTime,
        nodes:(e.sources||[]).map(s=>s.node?.className||s.node?.nodeName||'') });
  }).observe({type:'layout-shift',buffered:true});
  try { new PerformanceObserver(list => {
    for (const e of list.getEntries()) window.__qa.longTasks.push({ duration:e.duration,startTime:e.startTime });
  }).observe({type:'longtask',buffered:true}); } catch(e) {}
}"""

LAYOUT = """() => {
 const shown = e => {const s=getComputedStyle(e),b=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&b.width>0&&b.height>0;};
 const headings=[...document.querySelectorAll('h1,h2,h3')].filter(shown).map(e=>{
   const lines=[]; const walker=document.createTreeWalker(e,NodeFilter.SHOW_TEXT);
   while(walker.nextNode()){const n=walker.currentNode;for(let i=0;i<n.length;i++){
     if(!n.textContent[i].trim())continue;const r=document.createRange();r.setStart(n,i);r.setEnd(n,i+1);
     const b=r.getBoundingClientRect();let l=lines.find(x=>Math.abs(x.top-b.top)<4);
     if(!l){l={top:b.top,text:'',left:b.left,right:b.right};lines.push(l);}l.text+=n.textContent[i];l.left=Math.min(l.left,b.left);l.right=Math.max(l.right,b.right);
   }}
   return {tag:e.tagName,text:e.textContent.trim().replace(/\\s+/g,' '),font:getComputedStyle(e).fontSize,
     lines:lines.sort((a,b)=>a.top-b.top),box:{width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height}};
 });
 return {scrollY,viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,
   documentHeight:document.documentElement.scrollHeight,headings,
   outOfViewport:[...document.querySelectorAll('header a,main p,main h1,main h2,main h3,main button')].filter(shown).filter(e=>{
     const b=e.getBoundingClientRect();return b.left < -2 || b.right > innerWidth+2;
   }).slice(0,20).map(e=>({tag:e.tagName,class:e.className,text:e.textContent.trim().slice(0,85)}))};
}"""


async def state(page):
    return await page.evaluate("() => ({...window.__kottoMotion,frameIntervals:undefined})")


async def scroll(page, y):
    await page.evaluate("y => window.scrollTo({top:y,behavior:'instant'})", y)
    await page.wait_for_timeout(1100)


async def screenshot(page, folder, name):
    path = folder / f"{name}.png"
    await page.screenshot(path=str(path), animations="allow")
    return str(path.relative_to(APP))


def difference(a, b):
    a, b = Image.open(io.BytesIO(a)).convert("RGB"), Image.open(io.BytesIO(b)).convert("RGB")
    data = list(ImageChops.difference(a, b).convert("L").get_flattened_data())
    return round(sum(v > 8 for v in data) / len(data) * 100, 3)


def cls_score(shifts):
    maximum = current = 0
    start = previous = None
    for shift in shifts:
        t = shift["startTime"]
        if start is None or t - previous > 1000 or t - start > 5000:
            current, start = 0, t
        current += shift["value"]
        maximum = max(maximum, current)
        previous = t
    return round(maximum, 5)


async def inspect_case(browser, base_url, concept, mobile, reduced):
    width, height = (390, 844) if mobile else (1440, 900)
    label = f"{concept}-{'mobile' if mobile else 'desktop'}-{'reduced' if reduced else 'motion'}"
    folder = OUT / label
    folder.mkdir(parents=True, exist_ok=True)
    context = await browser.new_context(viewport={"width": width, "height": height},
        device_scale_factor=1, is_mobile=mobile, has_touch=mobile,
        reduced_motion="reduce" if reduced else "no-preference", locale="ko-KR")
    await context.add_init_script(f"({INIT})()")
    page = await context.new_page()
    errors, console_errors, failed_responses = [], [], []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.on("console", lambda e: console_errors.append(e.text) if e.type == "error" else None)
    page.on("response", lambda r: failed_responses.append({"url": r.url, "status": r.status}) if r.status >= 400 else None)
    result = {"case": label, "viewport": [width, height], "reducedMotion": reduced,
        "screenshots": [], "errors": errors, "consoleErrors": console_errors, "httpErrors": failed_responses}
    try:
        response = await page.goto(f"{base_url}/{concept}.html", wait_until="domcontentloaded")
        result["status"] = response.status
        await page.wait_for_function("window.__kottoMotion !== undefined", timeout=15000)
        result["screenshots"].append(await screenshot(page, folder, "01-intro-start"))
        await page.wait_for_timeout(600)
        result["screenshots"].append(await screenshot(page, folder, "02-intro-middle"))
        await page.evaluate("document.fonts.ready")
        await page.wait_for_timeout(1700)
        result["screenshots"].append(await screenshot(page, folder, "03-intro-end"))
        result["heroLayout"] = await page.evaluate(LAYOUT)
        result["initialMotion"] = await state(page)
        startup_metrics = await page.evaluate("window.__qa")
        result["startupCls"] = cls_score(startup_metrics["shifts"])
        result["startupLayoutShifts"] = startup_metrics["shifts"]
        result["pinSpacers"] = await page.locator(".pin-spacer").count()
        result["mediaMatches"] = await page.evaluate("({reduce:matchMedia('(prefers-reduced-motion:reduce)').matches,touch:matchMedia('(pointer:coarse)').matches})")
        result["fontReady"] = await page.evaluate("document.fonts.check('16px Pretendard')")
        result["images"] = await page.locator("img").evaluate_all("xs=>xs.map(x=>({src:x.currentSrc,loaded:x.complete&&x.naturalWidth>0}))")
        # Pointer response is recorded as an image delta, not asserted as a quality metric.
        if not mobile:
            await page.mouse.move(width * .35, height * .42)
            await page.wait_for_timeout(850)
            before = await page.screenshot()
            await page.mouse.move(width * .85, height * .57, steps=12)
            await page.wait_for_timeout(850)
            after = await page.screenshot()
            result["pointerPixelChangePercent"] = difference(before, after)
            result["screenshots"].append(await screenshot(page, folder, "04-pointer"))
        else:
            client = await context.new_cdp_session(page)
            await client.send("Input.dispatchTouchEvent", {"type": "touchStart", "touchPoints": [{"x": 210, "y": 705}]})
            for y in [660, 590, 510, 440, 370]:
                await client.send("Input.dispatchTouchEvent", {"type": "touchMove", "touchPoints": [{"x": 210, "y": y}]})
                await page.wait_for_timeout(30)
            await client.send("Input.dispatchTouchEvent", {"type": "touchEnd", "touchPoints": []})
            await page.wait_for_timeout(650)
            result["touchSwipeScrollY"] = await page.evaluate("scrollY")
            await client.detach()
            await scroll(page, 0)

        selector = {"a": ".a-stage", "b": ".b-story", "c": ".c-story"}[concept]
        geometry = await page.locator(selector).evaluate("e=>({top:e.getBoundingClientRect().top+scrollY,height:e.getBoundingClientRect().height})")
        duration = height * ({"a": 1.5, "b": 1.45 if mobile else 2, "c": 1.6}[concept])
        if concept == "c":
            duration = min(duration, 1500)
        if mobile and not reduced and concept == "a":
            geometry = await page.locator(".a-cover").evaluate("e=>({top:e.getBoundingClientRect().top+scrollY,height:e.getBoundingClientRect().height})")
            duration = geometry["height"] - height * .15
        if mobile and not reduced and concept == "c":
            front = await page.locator(".c-story-front").evaluate("e=>({top:e.getBoundingClientRect().top+scrollY,height:e.getBoundingClientRect().height})")
            geometry["top"] = max(0, front["top"] - height * .88)
            duration = front["height"] + height * .76
        if reduced:
            duration = min(geometry["height"] * .7, height * 1.4)
        result["scene"] = []
        for name, fraction in [("start", 0), ("middle", .52), ("end", 1)]:
            await scroll(page, geometry["top"] + duration * fraction)
            result["scene"].append({"stage": name, "motion": await state(page), "layout": await page.evaluate(LAYOUT)})
            result["screenshots"].append(await screenshot(page, folder, f"05-scene-{name}"))

        # Sample requestAnimationFrame while moving through the scroll scene.
        await scroll(page, max(0, geometry["top"]))
        sample = await page.evaluate("""({start,end})=>new Promise(resolve=>{
          const intervals=[];let first=null,last=null;function frame(t){
            if(first===null)first=t;if(last!==null)intervals.push(t-last);last=t;
            const p=Math.min((t-first)/2200,1);window.scrollTo({top:start+(end-start)*p,behavior:'instant'});
            if(p<1)requestAnimationFrame(frame);else resolve(intervals);
          }requestAnimationFrame(frame);
        })""", {"start": geometry["top"], "end": geometry["top"] + duration})
        ordered = sorted(sample)
        result["raf"] = {"samples": len(sample), "medianMs": round(statistics.median(sample), 2),
            "p95Ms": round(ordered[min(len(ordered)-1, int(len(ordered)*.95))], 2),
            "over33msPercent": round(sum(x > 33.4 for x in sample)/len(sample)*100, 2),
            "over50ms": sum(x > 50 for x in sample)}

        result["buttons"] = []
        for button in await page.locator("button[data-service],button[data-channel][aria-pressed]").all():
            await button.scroll_into_view_if_needed()
            await page.wait_for_timeout(150)
            name = (await button.inner_text()).strip()
            before = await state(page)
            if mobile:
                await button.tap()
            else:
                await button.click()
            await page.wait_for_timeout(1000)
            result["buttons"].append({"label": name, "before": before, "after": await state(page),
                "selected": await button.get_attribute("aria-selected"), "pressed": await button.get_attribute("aria-pressed")})
            result["screenshots"].append(await screenshot(page, folder, f"06-control-{len(result['buttons'])}"))
        if result["buttons"]:
            first = page.locator("button[data-service],button[data-channel][aria-pressed]").first
            await first.focus()
            await page.keyboard.press("ArrowRight")
            result["keyboardControl"] = {"focused": await page.evaluate("document.activeElement.textContent.trim()"), "motion": await state(page)}

        result["links"] = await page.locator("a[href]").evaluate_all("xs=>xs.map(x=>({text:x.textContent.trim(),href:x.getAttribute('href')}))")
        result["brokenAnchors"] = await page.locator('a[href^="#"]').evaluate_all("xs=>xs.filter(x=>x.hash.length>1&&!document.getElementById(decodeURIComponent(x.hash.slice(1)))).map(x=>x.hash)")
        await scroll(page, 0)
        nav = page.locator('header a[href^="#"]').first
        if await nav.count() and await nav.is_visible():
            if mobile:
                await nav.tap()
            else:
                await nav.click()
            await page.wait_for_timeout(1500)
            result["navigation"] = {"label": await nav.inner_text(), "hash": await page.evaluate("location.hash"), "scrollY": await page.evaluate("scrollY"), "motion": await state(page)}
            result["screenshots"].append(await screenshot(page, folder, "07-navigation"))
        await scroll(page, await page.evaluate("document.documentElement.scrollHeight-innerHeight"))
        result["footerLayout"] = await page.evaluate(LAYOUT)
        result["screenshots"].append(await screenshot(page, folder, "08-footer"))
        metrics = await page.evaluate("window.__qa")
        result["cls"] = cls_score(metrics["shifts"])
        result["layoutShifts"] = metrics["shifts"]
        result["longTasks"] = metrics["longTasks"]
        result["maxHorizontalOverflow"] = max(result["heroLayout"]["scrollWidth"]-width,
            result["footerLayout"]["scrollWidth"]-width,
            *(s["layout"]["scrollWidth"]-width for s in result["scene"]))
        if not reduced:
            await page.emulate_media(reduced_motion="reduce")
            await page.wait_for_timeout(650)
            result["liveReducedMotion"] = {"pinSpacers": await page.locator(".pin-spacer").count(),
                "mediaMatches": await page.evaluate("matchMedia('(prefers-reduced-motion:reduce)').matches"),
                "motion": await state(page)}
    except Exception as exc:
        result["harnessError"] = f"{type(exc).__name__}: {exc}"
        try:
            result["screenshots"].append(await screenshot(page, folder, "failure"))
        except Exception:
            pass
    finally:
        await context.close()
    (folder / "observations.json").write_text(json.dumps(result, ensure_ascii=False, indent=2))
    return result


def report(results, base_url):
    rows = []
    for r in results:
        raf = r.get("raf", {})
        errors = len(r["errors"]) + len(r["consoleErrors"]) + len(r["httpErrors"])
        rows.append(f"| {r['case']} | {r.get('maxHorizontalOverflow','—')} | {r.get('startupCls','—')} / {r.get('cls','—')} | {raf.get('medianMs','—')} / {raf.get('p95Ms','—')} | {errors} | {'실패' if r.get('harnessError') else '완료'} |")
    text = "\n".join([
        "# 실제 브라우저 QA 기록", "",
        f"실행 시각: {datetime.now(ZoneInfo('Asia/Seoul')).isoformat()} (한국 시각)", "",
        f"검수 대상: `{base_url}`. 이 주소는 내부 검수 서버이며 외부 미리보기 URL이 아닙니다.", "",
        "Chromium 헤드리스 · PC 1440×900 · 모바일 터치 에뮬레이션 390×844 · 일반/축소 모션. 각 조합에서 인트로, 스크롤 장면, CTA 앵커, 채널/서비스 버튼, 키보드 방향키, 이메일 링크 목적지를 확인했습니다. 이메일은 발송하지 않았습니다.", "",
        "| 조합 | 가로 넘침 px | 초기/전체 CLS | rAF 중앙/p95 ms | 콘솔·페이지·HTTP 오류 | 자동 관찰 |",
        "|---|---:|---:|---:|---:|---|", *rows, "",
        "## 해석 범위", "",
        "- rAF는 2.2초 스크롤 중 관찰한 프레임 간격이며 실제 휴대전화/GPU 성능이나 INP 측정값이 아닙니다. 공유 클라우드 CPU와 소프트웨어 그래픽 드라이버의 영향을 받습니다.",
        "- 초기 CLS는 인트로 종료 시점까지의 값입니다. 전체 CLS는 자동 점프 스크롤·고정 위치 전환을 포함합니다. 최근 입력 이후 이동을 제외한 표준 세션 창의 최댓값이며, 전체 값은 일반 방문자의 Core Web Vitals로 단정하지 않습니다. 세부 sources를 함께 기록합니다.",
        "- 스크린샷 시작/중간/종료는 실시간 캡처 시점입니다. 로딩 시간과 캡처 비용 때문에 애니메이션의 정확한 0/50/100%를 보장하지 않습니다. 스크롤은 실제 진단 진행률도 함께 기록했습니다.",
        "- 기능 통과는 시각 디자인 승인으로 간주하지 않습니다. 아래 별도 시각 검토에서 결함과 제한을 기록합니다.", "",
        "## 원본 기록", "",
        "`output/playwright/rebuild-qa/results.json` 및 조합별 PNG·`observations.json`.", "",
        "## 시각 검토", "", "시각 검토 결과를 캡처 검사 이후 이 절에 추가합니다.", "",
    ])
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(text)


async def inspect_native_scroll(browser, base_url, concept, mobile=False):
    """Separate real wheel/touch input from the main suite's deterministic jumps."""
    width, height = (390, 844) if mobile else (1440, 900)
    context = await browser.new_context(viewport={"width": width, "height": height},
        device_scale_factor=1, is_mobile=mobile, has_touch=mobile, reduced_motion="no-preference")
    await context.add_init_script(f"({INIT})()")
    page = await context.new_page()
    await page.goto(f"{base_url}/{concept}.html", wait_until="networkidle")
    await page.evaluate("document.fonts.ready")
    await page.wait_for_timeout(2300)
    startup = await page.evaluate("window.__qa.shifts")
    heights = await page.evaluate("({h:document.documentElement.scrollHeight,v:innerHeight})")
    end = min(heights["h"] - heights["v"], 3900)
    if not mobile:
        # Real wheel input: no scrollTo, scrollIntoView, or element clicks.
        for _ in range(int(end / 70) + 3):
            await page.mouse.wheel(0, 70)
            await page.wait_for_timeout(80)
    else:
        client = await context.new_cdp_session(page)
        for _ in range(int(end / 380) + 2):
            await client.send("Input.dispatchTouchEvent", {"type": "touchStart", "touchPoints": [{"x": 210, "y": 730}]})
            for y in range(700, 329, -30):
                await client.send("Input.dispatchTouchEvent", {"type": "touchMove", "touchPoints": [{"x": 210, "y": y}]})
                await page.wait_for_timeout(20)
            await client.send("Input.dispatchTouchEvent", {"type": "touchEnd", "touchPoints": []})
            await page.wait_for_timeout(200)
        await client.detach()
    await page.wait_for_timeout(500)
    shifts = await page.evaluate("window.__qa.shifts")
    result = {"concept": concept, "viewport": [width,height], "input": "touch" if mobile else "wheel",
        "startupCls": cls_score(startup), "overallCls": cls_score(shifts),
        "shifts": shifts, "scrollY": await page.evaluate("scrollY"), "motion": await state(page)}
    await context.close()
    return result


async def inspect_webgl_fallbacks(browser, base_url):
    results = []
    for mode in ["unavailable", "context-lost"]:
        mobile = mode == "context-lost"
        width, height = (390, 844) if mobile else (1440, 900)
        context = await browser.new_context(viewport={"width": width, "height": height},
            is_mobile=mobile, has_touch=mobile)
        if mode == "unavailable":
            await context.add_init_script("""(() => {
              const original=HTMLCanvasElement.prototype.getContext;
              HTMLCanvasElement.prototype.getContext=function(type,...args){
                return /webgl/i.test(type) ? null : original.call(this,type,...args);
              };
            })()""")
        page = await context.new_page()
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        await page.goto(f"{base_url}/a.html", wait_until="networkidle")
        await page.evaluate("document.fonts.ready")
        if mode == "context-lost":
            await page.evaluate("document.querySelector('#a-ribbon').getContext('webgl').getExtension('WEBGL_lose_context').loseContext()")
        await page.wait_for_function("window.__kottoMotion.renderer.includes('poster')")
        await page.wait_for_timeout(1800)
        results.append({"mode": mode, "viewport": [width,height], "motion": await state(page), "errors": errors,
            "h1Visible": await page.locator("h1").is_visible(),
            "fallbackImages": await page.locator(".a-art img").evaluate_all("xs=>xs.map(x=>({source:x.currentSrc,loaded:x.complete&&x.naturalWidth>0,naturalWidth:x.naturalWidth}))"),
            "screenshot": await screenshot(page, OUT, f"webgl-{mode}")})
        await context.close()
    return results


async def inspect_back_navigation(browser, base_url, concept="a"):
    context = await browser.new_context(viewport={"width": 1440, "height": 900})
    await context.add_init_script("window.__qaVisit=crypto.randomUUID();window.__qaPageShows=[];addEventListener('pageshow',e=>window.__qaPageShows.push({persisted:e.persisted}));")
    page = await context.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    await page.goto(f"{base_url}/{concept}.html", wait_until="networkidle")
    await page.wait_for_timeout(1700)
    if concept == "b":
        await page.locator('[data-service="place"]').click()
    elif concept == "c":
        await page.locator('[data-channel="instagram"][aria-pressed]').click()
    await page.wait_for_timeout(650)
    selection_before = await state(page)
    visit = await page.evaluate("window.__qaVisit")
    await page.locator({"a": ".a-brand", "b": ".b-brand", "c": ".c-logo"}[concept]).click()
    await page.wait_for_url("**/index.html")
    gallery_title = await page.title()
    # BFCache restoration does not emit a new DOMContentLoaded event.
    await page.evaluate("history.back()")
    await page.wait_for_function("concept=>location.pathname.endsWith('/'+concept+'.html') && window.__kottoMotion?.concept===concept", arg=concept)
    await page.wait_for_timeout(600)
    before = await state(page)
    if concept == "a":
        await page.mouse.move(1200, 450, steps=10)
        await page.wait_for_timeout(850)
    else:
        if concept == "b":
            await page.locator('[data-service="social"]').click()
        else:
            await page.locator('[data-channel="place"][aria-pressed]').click()
        top = await page.locator(f".{concept}-story").evaluate("e=>e.getBoundingClientRect().top+scrollY")
        await scroll(page, top + 900 * (2 if concept == "b" else 1.6) * .52)
    after = await state(page)
    result = {"concept": concept, "galleryTitle": gallery_title, "returnedUrl": page.url,
        "sameDocumentRestored": visit == await page.evaluate("window.__qaVisit"),
        "pageShows": await page.evaluate("window.__qaPageShows"), "selectionBeforeNavigation": selection_before,
        "beforeInteraction": before, "afterInteraction": after,
        "contextLost": await page.evaluate("document.querySelector('#a-ribbon').getContext('webgl').isContextLost()") if concept == "a" else None,
        "errors": errors, "screenshot": await screenshot(page, OUT, f"{concept}-after-gallery-back")}
    await context.close()
    return result


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://127.0.0.1:4173")
    parser.add_argument("--concepts", default="abc")
    parser.add_argument("--motion-only", action="store_true")
    parser.add_argument("--merge", action="store_true", help="Replace selected cases in an existing final report after a targeted fix.")
    parser.add_argument("--native-scroll-only", action="store_true", help="Observe B/C native input CLS without deterministic scroll jumps.")
    parser.add_argument("--fallback-only", action="store_true", help="Exercise A without WebGL and after a lost context.")
    parser.add_argument("--back-navigation-only", action="store_true", help="Observe A after navigating to the gallery and back, with BFCache enabled.")
    args = parser.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    results = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path="/usr/bin/chromium", headless=True,
            ignore_default_args=["--disable-back-forward-cache"] if args.back_navigation_only else None,
            args=["--no-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
        if args.back_navigation_only:
            results = [await inspect_back_navigation(browser, args.base_url.rstrip("/"), concept) for concept in args.concepts]
            await browser.close()
            (OUT / "back-navigation-results.json").write_text(json.dumps(results, ensure_ascii=False, indent=2))
            print(json.dumps(results, ensure_ascii=False), flush=True)
            return
        if args.fallback_only:
            results = await inspect_webgl_fallbacks(browser, args.base_url.rstrip("/"))
            await browser.close()
            (OUT / "webgl-fallback-results.json").write_text(json.dumps(results, ensure_ascii=False, indent=2))
            print(json.dumps(results, ensure_ascii=False), flush=True)
            return
        if args.native_scroll_only:
            for concept, mobile in [("b", False), ("b", True), ("c", False)]:
                results.append(await inspect_native_scroll(browser, args.base_url.rstrip("/"), concept, mobile))
                print(json.dumps(results[-1], ensure_ascii=False), flush=True)
            await browser.close()
            (OUT / "native-scroll-results.json").write_text(json.dumps(results, ensure_ascii=False, indent=2))
            return
        for concept in args.concepts:
            for mobile in [False, True]:
                for reduced in ([False] if args.motion_only else [False, True]):
                    result = await inspect_case(browser, args.base_url.rstrip("/"), concept, mobile, reduced)
                    results.append(result)
                    print(json.dumps({k: result.get(k) for k in ["case", "cls", "maxHorizontalOverflow", "raf", "harnessError"]}), flush=True)
        await browser.close()
    if args.merge and (OUT / "results.json").exists():
        previous = json.loads((OUT / "results.json").read_text())
        indexed = {r["case"]: r for r in previous}
        indexed.update({r["case"]: r for r in results})
        results = [indexed[key] for key in sorted(indexed)]
    (OUT / "results.json").write_text(json.dumps(results, ensure_ascii=False, indent=2))
    report(results, args.base_url)
    has_errors = any(r.get("harnessError") or r.get("errors") or r.get("consoleErrors") or r.get("httpErrors")
        or r.get("brokenAnchors") or r.get("maxHorizontalOverflow", 0) > 1
        or any(not image["loaded"] for image in r.get("images", []))
        or any(button["selected"] != "true" and button["pressed"] != "true" for button in r.get("buttons", []))
        for r in results)
    raise SystemExit(1 if has_errors else 0)


if __name__ == "__main__":
    asyncio.run(main())
