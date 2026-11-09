"""Exercise the production optical-industry journey. No messages are sent."""
import asyncio, json, re
from pathlib import Path
from urllib.parse import urlsplit, unquote
from html.parser import HTMLParser
from playwright.async_api import async_playwright

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output/industry-redesign'
BASE='http://127.0.0.1:4186/'
REPORT=ROOT/'reports/industry-qa.json'

class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.ids=set(); self.links=[]; self.h1=0; self.meta={}
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a: self.ids.add(a['id'])
        if tag=='a': self.links.append(a.get('href',''))
        if tag=='h1': self.h1+=1
        if tag=='meta': self.meta[a.get('name') or a.get('property')]=a.get('content')

async def main():
    OUT.mkdir(parents=True,exist_ok=True)
    report={'date':'2026-11-09','note':'Local production build; browser viewport emulation; no live emails','routes':[],'journeys':[],'failures':[]}
    pages={}
    for path in sorted((ROOT/'production').glob('*.html')):
        p=Page(); p.feed(path.read_text()); pages[path.name]=p
        assert p.h1==1,(path.name,p.h1)
        assert p.meta['description']==p.meta['og:description'],path.name
        assert p.meta['robots']=='index,follow,max-image-preview:large',path.name
    for name,p in pages.items():
        for href in p.links:
            url=urlsplit(href)
            if url.scheme or url.netloc or not url.fragment: continue
            target=url.path or name
            if target in pages: assert unquote(url.fragment) in pages[target].ids,(name,href)
    async with async_playwright() as pw:
        browser=await pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        for width in [1440,390]:
            ctx=await browser.new_context(viewport={'width':width,'height':900 if width==1440 else 844})
            await ctx.route('**/api.emailjs.com/**',lambda route:route.abort())
            for name in pages:
                page=await ctx.new_page(); errors=[]; bad=[]
                page.on('pageerror',lambda e:errors.append(str(e)))
                page.on('response',lambda r:bad.append([r.url,r.status]) if r.status>=400 else None)
                await page.goto(BASE+name,wait_until='networkidle')
                await page.evaluate('document.fonts.ready')
                await page.wait_for_timeout(350)
                assert await page.locator('h1').is_visible(),name
                height=await page.evaluate('document.documentElement.scrollHeight')
                for y in range(0,height,700):
                    await page.evaluate('(y)=>scrollTo(0,y)',y)
                    await page.wait_for_timeout(70)
                await page.wait_for_timeout(450)
                overflow=await page.evaluate('document.documentElement.scrollWidth>innerWidth')
                broken=await page.locator('main img').evaluate_all('(imgs)=>imgs.filter(i=>i.getAttribute("src") && i.complete && i.naturalWidth===0).map(i=>i.src)')
                assert not overflow,(width,name,'overflow')
                assert not errors,(width,name,errors)
                assert not bad,(width,name,bad)
                assert not broken,(width,name,broken)
                if name in ['index.html','services.html','about.html','contact.html']:
                    await page.evaluate('scrollTo(0,0)'); await page.wait_for_timeout(900)
                    await page.screenshot(path=str(OUT/f'{width}-{name[:-5]}-top.png'))
                    if name=='index.html':
                        for key in ['world','selected','services']:
                            loc=page.locator('.home-'+key)
                            await loc.scroll_into_view_if_needed(); await page.wait_for_timeout(900)
                            await loc.screenshot(path=str(OUT/f'{width}-home-{key}.png'))
                report['routes'].append({'width':width,'page':name,'overflow':False,'errors':errors,'httpErrors':bad,'brokenImages':broken})
                await page.close()
            page=await ctx.new_page()
            await page.goto(BASE,wait_until='networkidle')
            await page.locator('.hero-cta').click(); await page.wait_for_timeout(650)
            assert await page.locator('#home-world').evaluate('(e)=>document.activeElement===e')
            await page.locator('.world-sector[href$="lenses"]').click(); await page.wait_for_url('**/services.html?audience=lenses')
            await page.wait_for_timeout(400)
            assert await page.locator('[data-sv-audience="lenses"]').get_attribute('aria-pressed')=='true'
            assert await page.locator('.sv-directory-links .sv-directory-row:visible').count()==5
            assert await page.locator('.sv-directory-links a[href="service-model-images.html"]').is_hidden()
            for key,count in [('store',8),('eyewear',6),('distribution',6),('all',8)]:
                btn=page.locator(f'[data-sv-audience="{key}"]'); await btn.focus(); await page.keyboard.press('Enter'); await page.wait_for_timeout(300)
                assert await page.locator('.sv-directory-links .sv-directory-row:visible').count()==count,(key,count)
            await page.locator('.sv-directory-links a[href="service-model-images.html"]').click(); await page.wait_for_url('**/service-model-images.html')
            await page.wait_for_timeout(500)
            await page.locator('.mi-hero-copy a[href="contact.html?service=model-images"]').click(); await page.wait_for_url('**/contact.html?service=model-images')
            assert '모델 이미지 제작' in await page.locator('#message').input_value()
            await page.locator('[data-menu-open]').click(); assert await page.locator('#site-menu').is_visible()
            await page.keyboard.press('Escape'); assert await page.locator('#site-menu').is_hidden()
            assert await page.locator('[data-menu-open]').evaluate('(e)=>document.activeElement===e')
            report['journeys'].append({'width':width,'homeIndustryLink':True,'filterCounts':[8,6,5,6],'keyboardFilters':True,'modelServiceInquiry':True,'menuEscapeFocus':True})
            await ctx.close()
        # Essential content remains useful without JavaScript.
        ctx=await browser.new_context(java_script_enabled=False,viewport={'width':390,'height':844})
        page=await ctx.new_page(); await page.goto(BASE+'services.html?audience=lenses')
        assert await page.locator('.sv-directory-links .sv-directory-row:visible').count()==8
        assert await page.locator('.no-script-nav').is_visible()
        report['noJsAllServices']=True
        await ctx.close(); await browser.close()
    REPORT.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'routes':len(report['routes']),'journeys':len(report['journeys']),'failures':report['failures']}))

asyncio.run(main())
