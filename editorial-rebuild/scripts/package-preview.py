"""Package already-built, reviewed public files only."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root=Path(__file__).resolve().parents[1]
share=root/'share'
instructions='''고또마케팅 홈페이지 전체 보기

1. 압축을 해제합니다.
2. kotto-full-site.html을 Chrome 또는 Edge로 엽니다.
3. 상단 메뉴로 전체 12페이지를 살펴보세요.

설치나 서버 실행이 필요 없습니다. 이미지·폰트·모션도 파일에 포함되어 있습니다.
실제 문의 보내기, 외부 지도, 카카오톡·블로그 연결에는 인터넷이 필요합니다.
실제 문의를 제출하면 기존 고또마케팅 EmailJS 서비스로 전송을 시도합니다.
파일이나 Preview의 출처가 EmailJS 허용 목록에 없으면 전송이 거절될 수 있으며 오류를 표시합니다.
일부 휴대폰 파일 미리보기 앱은 HTML을 실행하지 않으므로 모바일에서는 제공한 웹 미리보기를 이용하세요.

제작 사례 7개, 고객 후기 15개, 상담 문의 8개의 이미지는 기존 공개 원본입니다.
별도로 '브랜드 이미지'라고 표시한 아트워크는 생성형 이미지이며 고객 작업물이 아닙니다.
GSAP 3.15.0: Copyright (c) 2008-2026, GreenSock. All rights reserved.
GSAP license: https://gsap.com/standard-license
폰트 OFL 및 기존 EmailJS 라이선스는 licenses 폴더에 있습니다.
'''
with ZipFile(share/'kotto-full-site.zip','w',ZIP_DEFLATED,compresslevel=9) as archive:
    archive.write(share/'kotto-full-site.html','kotto-full-site.html')
    archive.writestr('먼저 읽어주세요.txt',instructions)
    for name in ['Pretendard-LICENSE','NotoSerif-LICENSE']:
        archive.write(root/'public/fonts'/name,'licenses/'+name)
    archive.write(root/'public/assets/vendor/EMAILJS-LICENSE','licenses/EMAILJS-LICENSE')
with ZipFile(share/'kotto-static-site.zip','w',ZIP_DEFLATED,compresslevel=9) as archive:
    for path in sorted((share/'site').rglob('*')):
        if path.is_file():archive.write(path,str(path.relative_to(share/'site')))
for filename in ['kotto-full-site.zip','kotto-static-site.zip']:
    with ZipFile(share/filename) as archive:assert archive.testzip() is None
    print(filename,(share/filename).stat().st_size,'bytes')
