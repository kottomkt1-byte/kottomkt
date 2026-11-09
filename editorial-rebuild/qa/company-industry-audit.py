#!/usr/bin/env python3
"""Scoped About/Contact QA; EmailJS is mocked and its network API is blocked.

--fixture renders the current company module into temporary HTML in memory,
using the dev server only for modules/assets. No site build or HTML is changed.
Omit --fixture to run against an integrated build.
"""
import argparse
import asyncio
import json
import re
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/playwright/company-industry'
REPORT = ROOT / 'reports/company-industry-qa.json'
MOCK = """window.__mailCalls=[];window.__mailMode='success';window.emailjs={
 init(key){window.__mailInit=key},
 send(service,template,payload){window.__mailCalls.push({service,template,payload});
  if(window.__mailMode==='failure')return Promise.reject(new Error('QA simulated failure'));
  if(window.__mailMode==='pending')return new Promise(resolve=>window.__resolveMail=resolve);
  return Promise.resolve({status:200,text:'Mock only'});
 }};"""
SERVICE = '안경테·선글라스 모델 이미지 제작'


def fixtures():
    code = """import {renderAbout,renderContact} from './src/company.js';
import {renderHeader,renderFooter} from './src/shell.js';
const result={};for(const [page,render] of [['about',renderAbout],['contact',renderContact]]){
result[page]=`<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Scoped company QA</title>${['global','company','achievements','evidence'].map(x=>`<link rel="stylesheet" href="/src/${x}.css">`).join('')}</head><body data-page="${page}">${renderHeader(page+'.html')}<main id="main">${render()}</main>${renderFooter()}<script type="module">import {initCompany} from '/src/company.js';initCompany();</script></body></html>`;
}console.log(JSON.stringify(result));"""
    return json.loads(subprocess.check_output(['node','--input-type=module','-e',code],cwd=ROOT,text=True))


async def layout(page):
    await page.evaluate('document.fonts.ready')
    await page.evaluate("async()=>{await Promise.all([...document.querySelectorAll('main img')].map(async img=>{img.loading='eager';await img.decode()}))}")
    result = await page.evaluate("""()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,
      headings:[...document.querySelectorAll('h1')].map(e=>e.innerText),
      overflow:[...document.querySelectorAll('main h1,main h2,main h3,main p,main button,main input,main select,main textarea')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.height&&(r.left < -1||r.right>innerWidth+1)}).map(e=>({tag:e.tagName,id:e.id,text:e.textContent.slice(0,80)}))})""")
    assert result['width']==result['scrollWidth'] and not result['overflow'],result
    assert len(result['headings'])==1,result
    return result


async def fill(page, **values):
    for key,value in values.items():
        await page.locator(f'[name="{key}"]').fill(value)


async def check_form(page):
    form=page.locator('#contactForm');submit=form.locator('[type="submit"]')
    assert await page.locator('#message').input_value()==SERVICE+'에 대해 상담받고 싶습니다.'
    assert await page.locator('[data-co-service-selection]').inner_text()=='관심 서비스 · '+SERVICE
    assert not await page.locator('#storeName').evaluate('e=>e.required')
    assert not await page.locator('#region').evaluate('e=>e.required')
    await submit.click()
    assert await page.locator('#co-errors').is_visible()
    assert await page.evaluate('window.__mailCalls.length')==0
    await fill(page,company='QA 안경렌즈 기업',phone='12',message='프로젝트 문의 테스트입니다.')
    await page.locator('#privacy').check()
    await submit.click()
    assert await page.locator('#phone').get_attribute('aria-invalid')=='true'
    assert await page.evaluate('window.__mailCalls.length')==0
    await fill(page,phone='+82 (2) 1234-5678')
    assert await page.locator('#phone').input_value()=='+82 (2) 1234-5678'
    await page.locator('#industry').select_option('spectacle-lens')
    await page.locator('[name="inquiryType"][value="project"]').check()
    assert await page.locator('[data-co-budget-label]').inner_text()=='프로젝트 총 예산'
    await page.locator('#budget').select_option('500~1,000만원')
    await page.evaluate("window.__mailMode='pending'")
    await submit.click()
    await page.wait_for_function('window.__mailCalls.length===1')
    assert await submit.is_disabled() and await form.get_attribute('aria-busy')=='true'
    await form.evaluate("e=>e.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))")
    assert await page.evaluate('window.__mailCalls.length')==1
    call=await page.evaluate('window.__mailCalls[0]')
    assert call['service']=='service_peqoeen' and call['template']=='template_v9eprz5',call
    assert await page.evaluate('window.__mailInit')=='wRB7RcKgCZ0rb8bqx'
    payload=call['payload']
    assert set(payload)=={'company','store_name','phone','region','budget','message'},payload
    assert payload['company']==payload['store_name']=='QA 안경렌즈 기업' and payload['region']=='미정',payload
    assert payload['phone']=='+82 (2) 1234-5678',payload
    assert payload['budget']=='500~1,000만원',payload
    for text in ['업종: 안경렌즈 기업','문의 유형: 프로젝트 제작','프로젝트 총 예산: 500~1,000만원','관심 서비스: '+SERVICE,'프로젝트 문의 테스트입니다.']:
        assert text in payload['message'],(text,payload)
    await page.evaluate('window.__resolveMail({status:200})')
    await page.wait_for_function("document.querySelector('#form-status').dataset.state==='success'")
    assert await page.locator('#company').input_value()==''
    assert await page.locator('#industry').input_value()==''
    assert await page.locator('[name="inquiryType"][value="consult"]').is_checked()
    assert await page.locator('[data-co-budget-label]').inner_text()=='예상 예산'
    assert await page.locator('#message').input_value()==SERVICE+'에 대해 상담받고 싶습니다.'
    await fill(page,company='QA 유통사',storeName='QA 브랜드',phone='02-123-4567',region='서울',contactName='QA 기획팀',email='invalid',message='정기 운영 문의 테스트입니다.')
    await page.locator('#industry').select_option('brand-distributor')
    await page.locator('[name="inquiryType"][value="retainer"]').check()
    assert await page.locator('[data-co-budget-label]').inner_text()=='월 운영 예산'
    await page.locator('#budget').select_option('100~300만원')
    await page.locator('#privacy').check()
    await submit.click()
    assert await page.locator('#email').get_attribute('aria-invalid')=='true'
    assert await page.evaluate('window.__mailCalls.length')==1
    await fill(page,email='qa@example.invalid')
    await page.locator('#privacy').uncheck()
    await submit.click()
    assert await page.evaluate('window.__mailCalls.length')==1
    await page.locator('#privacy').check()
    await page.evaluate("window.__mailMode='failure'")
    await submit.click()
    await page.wait_for_function("document.querySelector('#form-status').dataset.state==='error'")
    assert await page.locator('#company').input_value()=='QA 유통사'
    assert await page.locator('#email').input_value()=='qa@example.invalid'
    assert await page.locator('[name="inquiryType"][value="retainer"]').is_checked()
    assert not await submit.is_disabled()
    failure=await page.evaluate('window.__mailCalls[1].payload')
    for text in ['업종: 아이웨어 브랜드·제조·수입·유통사','문의 유형: 지속적인 운영','브랜드·지점명: QA 브랜드','담당자: QA 기획팀','이메일: qa@example.invalid','지역: 서울','월 운영 예산: 100~300만원','관심 서비스: '+SERVICE,'정기 운영 문의 테스트입니다.']:
        assert text in failure['message'],(text,failure)
    assert failure['store_name']=='QA 브랜드' and failure['region']=='서울'
    return {'contractKeys':sorted(payload),'enterpriseWithoutStoreOrRegion':True,'internationalAndLandlinePreserved':True,'optionalEmailValidated':True,'consentAndInvalidPhoneBlocked':True,'pendingDuplicatePrevented':True,'queryServicePreservedAfterEditingAndReset':True,'allSelectedInfoInMessage':True,'failurePreservesFields':True,'mockCalls':await page.evaluate('window.__mailCalls.length')}


async def run(args):
    rendered=fixtures() if args.fixture else None
    OUT.mkdir(parents=True,exist_ok=True)
    report={'checkedAt':datetime.now(timezone.utc).isoformat(),'base':args.base,'scope':'Current company module fixture with shared CSS/assets; no full site build or global motion integration.' if args.fixture else 'Integrated About/Contact pages.','mailSafety':'EmailJS mocked in memory; API requests blocked. No live email sent.','cases':[],'passed':False}
    async with async_playwright() as pw:
        browser=await pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        for width in [1440,390,320]:
            context=await browser.new_context(viewport={'width':width,'height':900 if width==1440 else 844},is_mobile=width<700,has_touch=width<700,reduced_motion='reduce')
            await context.add_init_script(MOCK)
            await context.route('**/api.emailjs.com/**',lambda route:route.abort())
            if rendered:
                async def serve(route):
                    key=Path(urlparse(route.request.url).path).stem
                    await route.fulfill(status=200,content_type='text/html',body=rendered[key])
                await context.route(re.compile(r'/(?:about|contact)\.html(?:\?.*)?$'),serve)
            page=await context.new_page();errors=[];http=[];mail=[]
            page.on('pageerror',lambda error:errors.append(str(error)))
            page.on('response',lambda response:http.append({'url':response.url,'status':response.status}) if response.status>=400 else None)
            page.on('request',lambda request:mail.append(request.url) if 'api.emailjs.com' in request.url else None)
            case={'width':width,'passed':False}
            try:
                await page.goto(args.base+'/about.html',wait_until='networkidle')
                case['aboutLayout']=await layout(page)
                assert await page.locator('.co-industry-list li').count()==4
                case['aboutScreenshot']=str((OUT/f'about-{width}.png').relative_to(ROOT))
                await page.locator('.co-about-hero').screenshot(path=str(ROOT/case['aboutScreenshot']))
                await page.locator('.co-about-work').screenshot(path=str(OUT/f'about-work-{width}.png'))
                await page.goto(args.base+'/contact.html?service=model-images',wait_until='networkidle')
                await page.wait_for_selector('#contactForm[data-initialized="true"]')
                case['contactLayout']=await layout(page)
                await page.locator('.co-contact-intro').screenshot(path=str(OUT/f'contact-{width}.png'))
                await page.locator('.co-form-area').screenshot(path=str(OUT/f'contact-form-{width}.png'))
                case['form']=await check_form(page)
                case['afterValidationLayout']=await layout(page)
                assert not errors and not http and not mail,(errors,http,mail)
                case['passed']=True
            except Exception as exc:
                case['error']=f'{type(exc).__name__}: {exc}'
                await page.screenshot(path=str(OUT/f'failure-{width}.png'),full_page=True)
            case.update(pageErrors=errors,httpErrors=http,mailApiRequests=mail)
            report['cases'].append(case)
            REPORT.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
            print(width,'PASS' if case['passed'] else case['error'],flush=True)
            await context.close()
        await browser.close()
    report['passed']=all(c['passed'] for c in report['cases'])
    REPORT.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    return report['passed']

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base',default='http://127.0.0.1:4191')
    parser.add_argument('--fixture',action='store_true')
    args=parser.parse_args();args.base=args.base.rstrip('/')
    raise SystemExit(0 if asyncio.run(run(args)) else 1)
