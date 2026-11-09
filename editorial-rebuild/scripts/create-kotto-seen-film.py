#!/usr/bin/env python3
"""Author KOTTO's optical-industry brand film and 22-second silent hero loops.

Uses the user's existing unaltered model portraits. Only camera framing, dissolves,
layout and typography change over time; this does not synthesize facial movement.
Requires Pillow, numpy, fontTools[woff], brotli and FFmpeg. No remote dependencies.
"""
from pathlib import Path
from functools import lru_cache
import argparse, subprocess, json, math, tempfile
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public/films'
WORK=ROOT/'output/brand-film'
PHOTOS=ROOT/'public/portfolio/model-images'
FPS=24
DURATION=26
HERO_DURATION=22
PAPER=(240,237,228)
INK=(39,40,35)
CLAY=(133,73,57)
IDS=['tf6032-001-women-02','tf5922-020-men-03','tf1381-01a-men-03','tf1291-28a-women-03','tf1289-01a-women-03']
COLORS=[(46,53,63),(195,209,193),(22,37,48),(145,100,91),(119,64,38)]
FOCUS=[(.56,.38),(.53,.25),(.39,.30),(.49,.24),(.34,.24)]
# Each following scene dissolves in over 0.7 seconds; no flash or abrupt zoom.
STARTS=[0,4.4,8.8,13.2,17.6]


def smooth(x):
    x=max(0,min(1,x))
    return x*x*(3-2*x)


def prepare_fonts():
    from fontTools.ttLib import TTFont
    from fontTools.varLib.instancer import instantiateVariableFont
    d=WORK/'fonts';d.mkdir(parents=True,exist_ok=True)
    for source,name,weight in [('NotoSerifKR','serif',450),('PretendardVariable','sans',400)]:
        path=d/(name+'.ttf')
        if not path.exists():
            font=TTFont(ROOT.parent/'creative-rebuild/public/fonts'/f'{source}.woff2')
            if 'fvar' in font: font=instantiateVariableFont(font,{'wght':weight},inplace=True)
            font.flavor=None; font.save(path)


@lru_cache(maxsize=40)
def font(size,kind='sans'):
    return ImageFont.truetype(str(WORK/'fonts'/f'{kind}.ttf'),max(1,int(size)))


@lru_cache(maxsize=8)
def photo(index):
    return Image.open(PHOTOS/f'{IDS[index]}.webp').convert('RGB')


def camera(index,size,p,focus=None,zoom=None):
    """Sample the original photograph with a slowly moving virtual camera."""
    w,h=map(int,size); src=photo(index); iw,ih=src.size
    px,py=focus or FOCUS[index]
    if zoom is None: zoom=1.025+(.025*p if index%2==0 else .025*(1-p))
    scale=max(w/iw,h/ih)*zoom
    cw,ch=w/scale,h/scale
    px+=.009*(p-.5)*(1 if index%2==0 else -1)
    py+=.007*(p-.5)
    left=max(0,min(iw-cw,iw*px-cw/2));top=max(0,min(ih-ch,ih*py-ch/2))
    return src.resize((w,h),Image.Resampling.BICUBIC,box=(left,top,left+cw,top+ch))


def text(frame,words,xy,size,fill,kind='serif',alpha=1,spacing=None):
    if alpha<=0:return
    layer=Image.new('RGBA',frame.size)
    draw=ImageDraw.Draw(layer)
    if spacing is None:
        
        for line_no,line in enumerate(words.split('\n')):
            draw.text((int(xy[0]),int(xy[1]+line_no*size*1.6)),line,font=font(size,kind),fill=(*fill,round(255*min(1,alpha))),anchor='lt')
    else:
        x,y=xy
        for c in words:
            draw.text((int(x),int(y)),c,font=font(size,kind),fill=(*fill,round(255*min(1,alpha))),anchor='lt')
            x+=draw.textlength(c,font=font(size,kind))+spacing
    frame.paste(layer,(0,0),layer)


@lru_cache(maxsize=32)
def horizontal_mask(w,h,side='left'):
    ramp=np.linspace(0,1,w,dtype=np.float32)
    if side=='left': ramp=np.clip(ramp/.13,0,1)
    else:ramp=np.clip((1-ramp)/.13,0,1)
    return Image.fromarray(np.broadcast_to((ramp*255).astype('uint8'),(h,w)).copy())


@lru_cache(maxsize=8)
def vertical_mask(w,h):
    ramp=np.clip((.96-np.linspace(0,1,h,dtype=np.float32))/.26,0,1)
    return Image.fromarray(np.broadcast_to((ramp[:,None]*255).astype('uint8'),(h,w)).copy())


def scene(index,p,w,h,mode):
    s=w/1920
    if mode=='mobile':
        frame=Image.new('RGB',(w,h),COLORS[index])
        ph=round(h*.86)
        portrait=camera(index,(w,ph),p,focus=(.5,.42),zoom=1.035+.025*p)
        frame.paste(portrait,(0,0),vertical_mask(w,ph))
        return frame
    if mode=='hero':
        frame=Image.new('RGB',(w,h),COLORS[index])
        left=int(w*.35);pw=w-left
        portrait=camera(index,(pw,h),p,focus=(.5,.40))
        frame.paste(portrait,(left,0),horizontal_mask(pw,h))
        return frame
    if index==0:
        frame=Image.new('RGB',(w,h),COLORS[index]);left=int(w*.43);pw=w-left
        frame.paste(camera(index,(pw,h),p,focus=(.53,.43)),(left,0),horizontal_mask(pw,h))
        a=smooth((p*5.1-.6)/1.1)
        text(frame,'안경을 아는\n시선으로,',(112*s,(415+(1-a)*22)*s),78*s,PAPER,alpha=a)
    elif index==1:
        frame=Image.new('RGB',(w,h),PAPER);pw=int(w*.57)
        frame.paste(camera(index,(pw,h),p,focus=(.5,.38)),(0,0),horizontal_mask(pw,h,'right'))
        a=smooth((p*5.1-.45)/1.0)
        text(frame,'브랜드의\n가치를 전합니다.',(1210*s,(415+(1-a)*22)*s),78*s,INK,alpha=a)
    elif index in (2,3):
        frame=camera(index,(w,h),p)
        # A restrained lower exposure veil leaves the supplied photograph intact.
        shade=Image.new('RGB',(w,h),INK)
        frame=Image.blend(frame,shade,.035)
    else:
        frame=Image.new('RGB',(w,h),COLORS[index]);pw=int(w*.61)
        frame.paste(camera(index,(pw,h),p,focus=(.43,.39)),(0,0),horizontal_mask(pw,h,'right'))
        a=smooth((p*5.1-.45)/1.0)
        text(frame,'보이는 이야기로.\n기억되는 장면으로.',(1210*s,(448+(1-a)*15)*s),43*s,PAPER,alpha=a)
    # Brand ownership is always visible, without product or model labels.
    markcolor=INK if index==1 else PAPER
    text(frame,'kotto',(110*s,78*s),58*s,markcolor)
    if index in (0,1):
        text(frame,'KOTTO MARKETING',(112*s,165*s),15*s,markcolor,kind='sans',spacing=3*s)
    return frame


def endcard(t,w,h):
    frame=Image.new('RGB',(w,h),PAPER);s=w/1920
    a=smooth((t-.05)/.8)
    title='안경을 아는 시선.\n브랜드를 위한 콘텐츠.'
    text(frame,title,(190*s,(180+(1-a)*18)*s),65*s,INK,alpha=a)
    b=smooth((t-.5)/.9)
    text(frame,'kotto',(177*s,(445+(1-b)*16)*s),265*s,CLAY,alpha=b)
    text(frame,'고또마케팅',(197*s,795*s),29*s,INK,kind='sans',alpha=b)
    text(frame,'안경 산업 전문 광고·콘텐츠 마케팅',(197*s,870*s),23*s,(112,107,96),kind='sans',alpha=b)
    # Fine editorial rules and a quiet counterweight keep the closing frame deliberate.
    d=ImageDraw.Draw(frame);d.line((1260*s,185*s,1260*s,900*s),fill=(197,188,173),width=max(1,round(s)))
    text(frame,'제품의 디테일에서,\n브랜드의 이야기까지.',(1365*s,735*s),29*s,(112,107,96),kind='sans',alpha=b)
    text(frame,'KOTTO.KR',(1365*s,873*s),18*s,CLAY,kind='sans',spacing=2*s,alpha=b)
    return frame


def frame_at(t,w,h,mode):
    if mode=='full' and t>=22:
        end=endcard(t-22,w,h)
        if t<22.7: return Image.blend(scene(4,1,w,h,mode),end,smooth((t-22)/.7))
        return end
    idx=max(i for i,start in enumerate(STARTS) if t>=start)
    local=t-STARTS[idx];p=min(1,local/5.1)
    frame=scene(idx,p,w,h,mode)
    if idx and local<.7:
        prev=scene(idx-1,min(1,(t-STARTS[idx-1])/5.1),w,h,mode)
        frame=Image.blend(prev,frame,smooth(local/.7))
    if mode!='full' and t>=HERO_DURATION-.8:
        first=scene(0,0,w,h,mode)
        frame=Image.blend(frame,first,smooth((t-(HERO_DURATION-.8))/.8))
    return frame


def render(mode,w,h,name,duration,crf,maxrate):
    OUT.mkdir(parents=True,exist_ok=True)
    path=OUT/name
    args=['ffmpeg','-hide_banner','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{w}x{h}','-r',str(FPS),'-i','pipe:0']
    if mode=='full': args+=['-i',str(WORK/'kotto-seen-score.wav'),'-map','0:v','-map','1:a','-c:a','aac','-b:a','160k']
    else: args+=['-an']
    args+=['-c:v','libx264','-preset','medium','-threads','3','-crf',str(crf),'-maxrate',maxrate,'-bufsize',maxrate,'-profile:v','high','-level','4.1','-pix_fmt','yuv420p','-movflags','+faststart','-t',str(duration),str(path)]
    proc=subprocess.Popen(args,stdin=subprocess.PIPE)
    try:
        for f in range(round(duration*FPS)):
            proc.stdin.write(frame_at(f/FPS,w,h,mode).tobytes())
            if f%(FPS*5)==0: print(f'{mode}: {f/FPS:.0f}s / {duration}s',flush=True)
    finally: proc.stdin.close()
    if proc.wait(): raise RuntimeError('FFmpeg encoding failed')
    if mode!='full':
        poster='kotto-seen-poster-mobile.webp' if mode=='mobile' else 'kotto-seen-poster.webp'
        frame_at(0,w,h,mode).save(OUT/poster,quality=88,method=6)
    data=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(path)]))
    result={'file':name,'bytes':path.stat().st_size,'seconds':float(data['format']['duration']),'width':w,'height':h,'fps':FPS,'audio':mode=='full'}
    print(json.dumps(result),flush=True)
    return result


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--preview',action='store_true')
    parser.add_argument('--only',choices=['full','hero','mobile'])
    parser.add_argument('--preview-dir',type=Path,default=ROOT/'output/industry-film')
    args=parser.parse_args()
    WORK.mkdir(parents=True,exist_ok=True);prepare_fonts()
    if args.preview:
        preview=args.preview_dir;preview.mkdir(parents=True,exist_ok=True)
        if args.only in (None,'full'):
            sheet=Image.new('RGB',(1920,800),PAPER)
            for i,t in enumerate([2.8,7.2,11.4,15.8,20.2,25.0]):
                frame=frame_at(t,1920,1080,'full')
                frame.save(preview/f'frame-{i}.jpg',quality=92)
                x=(i%3)*640;y=(i//3)*400
                sheet.paste(frame.resize((640,360),Image.Resampling.LANCZOS),(x,y))
                text(sheet,f'{t:04.1f}s',(x+16,y+371),16,INK,kind='sans')
            sheet.save(preview/'contact-sheet.jpg',quality=93)
        if args.only in (None,'hero'):
            frame_at(0,1280,720,'hero').save(preview/'hero-preview.jpg',quality=92)
        if args.only in (None,'mobile'):
            frame_at(0,720,1280,'mobile').save(preview/'mobile-preview.jpg',quality=92)
        print(str(preview));return
    score=WORK/'kotto-seen-score.wav'
    if not score.exists(): raise RuntimeError('Create original soundtrack with scripts/create-kotto-score.py before rendering')
    exports=[('full',1920,1080,'kotto-industry-brand-film.mp4',26,20,'8000k'),('hero',1280,720,'kotto-seen-hero-desktop.mp4',22,24,'1900k'),('mobile',720,1280,'kotto-seen-hero-mobile.mp4',22,25,'1300k')]
    results=[]
    for spec in exports:
        if args.only and args.only!=spec[0]: continue
        results.append(render(*spec))
    (WORK/f'exports-{args.only or "all"}.json').write_text(json.dumps(results,indent=2)+'\n')

if __name__=='__main__':main()
