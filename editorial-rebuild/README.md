# 고또마케팅 — B 에디토리얼 전체 홈페이지

선택된 B 방향으로 기존 12페이지를 다시 설계한 검토용 사이트입니다. 운영 사이트와 분리된 `codex/kotto-creative-rebuild` 브랜치의 `editorial-rebuild/`에서 작업했습니다. 기존 루트 HTML·CSS·기능 파일과 A/B/C 프로토타입은 그대로 유지했습니다.

## 실제 작업물과 고객 반응 복원

글 중심이었던 구성을 보완해 기존 홈페이지형 블로그 제작 화면 7개, 고객 후기 15개, 상담 문의 8개를 다시 넣었습니다. 30개 PNG는 기존 가림 처리를 포함해 원본과 바이트가 동일합니다. 제작 사례를 선택하고, 고객 반응과 상담 문의를 전환하며, 큰 보기에서 이미지 전체를 읽을 수 있습니다.

메인에는 안경 업종의 소재·카피·실제 제작 화면이 하나의 편집면으로 모이는 스크롤 장면을 추가했습니다. 제작 사례는 데스크톱에서 화면을 펼치는 전환으로, 모바일에서는 직접 넘기는 방식으로 살펴봅니다. 회사 소개와 브랜드 블로그·홈페이지형 블로그 상세에도 관련 실제 자료를 배치했습니다. 기존 12페이지 구성은 유지합니다.

사용자가 2026-10-09 현재 사용 중이라고 확인한 **5,000건+ 안경 제작 사례 작성, 100% 메인 품목 재계약률, 98% 전문성 만족도, 2위 에실로 얼티밋 전국 순위**를 원래 의미대로 복원했습니다. 사용자 확인과 원자료의 독립 검증을 구분한 기록은 [출처 감사](reports/evidence-source-audit.md), 변경 내용과 검수 결과는 [시각 업데이트 보고서](reports/visual-update-summary.md)에 있습니다.

## 직접 보기

- [12페이지 웹 미리보기](https://raw.githack.com/kottomkt1-byte/kottomkt/codex/kotto-creative-rebuild/editorial-rebuild/share/site/index.html)
- [전체 사이트 간편 보기 ZIP](https://github.com/kottomkt1-byte/kottomkt/raw/refs/heads/codex/kotto-creative-rebuild/editorial-rebuild/share/kotto-full-site.zip)
- 실제 화면 녹화: [데스크톱](https://raw.githubusercontent.com/kottomkt1-byte/kottomkt/codex/kotto-creative-rebuild/editorial-rebuild/share/recordings/kotto-visual-update-desktop.mp4) · [모바일](https://raw.githubusercontent.com/kottomkt1-byte/kottomkt/codex/kotto-creative-rebuild/editorial-rebuild/share/recordings/kotto-visual-update-mobile.mp4)

ZIP은 PC에서 압축을 풀고 `kotto-full-site.html`을 Chrome/Edge로 열면 됩니다. 설치·서버 실행 없이 메뉴로 12페이지를 이동할 수 있습니다. 일부 휴대폰 파일 미리보기 앱은 스크립트를 실행하지 않으므로 모바일에서는 웹 주소를 사용하세요. 간편 보기의 콘텐츠·폰트·이미지·모션은 파일에 포함되어 있습니다. 실제 문의 전송과 외부 지도·카카오톡 등은 인터넷 연결이 필요합니다.

웹 주소는 공개 GitHub 파일을 제공하는 GitHack 중계입니다. Vercel 운영 배포가 아닙니다. 이 클라우드의 네트워크 정책은 GitHack 요청을 차단하므로 이 환경에서 중계의 최종 응답을 검증했다고 주장하지 않습니다. GitHub에 게시한 원본과 다운로드 파일을 별도로 확인합니다. 내부 localhost 주소를 외부 미리보기로 안내하지 않습니다.

## 페이지

| 주소 | 역할 |
| --- | --- |
| index.html | 메인, 편집 장면, 제작 사례, 고객 반응, 서비스 목차, 상담 흐름 |
| about.html | 회사 소개, 브랜드 이미지, 업무 기록과 고객 반응, 회사 정보 |
| services.html | 전체 서비스와 상세 연결 |
| service-blog.html | 브랜드 블로그 대행, 실제 고객 반응 |
| service-hpblog.html | 홈페이지형 블로그, 실제 제작 사례 7개 |
| service-instagram.html | 인스타그램 마케팅 |
| service-place.html | 플레이스 관리·세팅 |
| service-daangn.html | 당근마켓 마케팅 |
| service-cafe.html | 카페 바이럴 |
| service-website.html | 홈페이지 제작 |
| contact.html | 기존 EmailJS 문의 양식과 연락 채널 |
| location.html | 주소 복사, 지도, 방문 연락 안내 |

## 실행과 빌드

Node 22 이상과 npm을 사용합니다. 현재 환경에서는 Node와 Chromium/Python Playwright가 이미 제공됩니다.

```bash
cd /workspace/kottomkt/editorial-rebuild
npm ci --ignore-scripts --cache /tmp/kotto-npm-cache
npm run dev -- --port 4180
```

`src/home.js`, `services.js`, `company.js`, `shell.js`의 렌더 함수와 `content.js`를 `scripts/build-pages.mjs`가 완전한 HTML 12개로 생성합니다. 내용은 클라이언트 JS가 없어도 읽을 수 있습니다. 문의 전송에는 JavaScript가 필요하며 카카오톡·이메일 링크는 계속 제공됩니다.

```bash
npm run build
npm run preview -- --port 4181
node scripts/create-share.mjs
```

`dist/`가 독립 배포 폴더입니다. `share/site/`는 동일한 정적 배포본, `share/kotto-full-site.html`은 단일 파일 간편 보기입니다. HTML의 robots noindex/nofollow는 검토 환경용입니다.

별도 Vercel 프로젝트를 만들 경우 Root Directory를 `editorial-rebuild`, Build Command를 `npm run build`, Output Directory를 `dist`로 지정하고 **운영 도메인을 연결하지 않은 Preview**로 배포합니다. 자격 증명이 연결되지 않은 현재 환경에서 Vercel 배포 성공을 주장하지 않습니다. 정적 호스팅에는 `dist/`의 내용만 업로드하면 됩니다.

## 검수

이번 이미지·모션 업데이트는 1440px·390px에서 16개 상세 검사와 12페이지×2폭 회귀 검사를 마쳤습니다. 일반·축소 모션, 원본 30개 확대, 터치·키보드, JS 비활성화, 수치의 가림 여부와 문의 폼을 확인했습니다. 추가 검수에서 콘솔 오류·가로 넘침·누적 CLS는 0이었습니다. 물리적 휴대폰의 성능까지 보장하는 결과는 아닙니다.

- `python qa/audit.py --base http://127.0.0.1:4181` — 실제 Chromium 페이지·레이아웃·기능 검수. SDK 모킹 및 EmailJS API 차단으로 실제 메시지를 보내지 않습니다. 실행 옵션은 `--help`로 확인할 수 있습니다.
- `python qa/evidence-audit.py --base http://127.0.0.1:4181` — 새 갤러리·원문 뷰어·장면과 12페이지 검사. 최신 결과는 `reports/visual-update-results.json`, 보충 검사는 `visual-update-supplemental.json`에 있습니다.
- `python qa/standalone.py` — 개발 서버의 간편 보기 파일을 한 번 불러온 뒤 브라우저를 오프라인으로 전환. 12페이지×1440/390, 페이지 연결·뒤로가기·서비스 문의 자동 입력을 확인합니다.
- `python scripts/verify-build.py` — 배포본 12페이지·54개 파일의 연결, 원본 이미지 보존과 배포 범위를 검사합니다.
- 간편 보기에서는 추가 HTTP 요청 없이 원본 이미지 30개×2폭을 열고 확대하는 검사도 통과했습니다. `reports/standalone-qa.json` 참고.
- 스크린샷과 영상의 실제 원본: `output/playwright/`(Git 제외). 전달용 녹화는 `share/recordings/`에 보존합니다.

관리형 Chromium은 `file://` 탐색을 막으므로 파일 더블클릭 자체를 이 환경에서 검사했다고 주장하지 않습니다. 단일 HTML을 HTTP로 한 번 연 뒤 인터넷 없이 동작하는 경로는 검사했습니다.

## 기능과 데이터

기존 문의 필드·EmailJS service/template/payload와 카카오톡·이메일·블로그·지도·사업자 정보를 유지했습니다. 실제 운영 수신함으로 테스트 메시지를 보내지 않았습니다. Preview 도메인이 EmailJS 허용 목록에 포함되는지와 실제 수신은 운영자가 확인해야 합니다. 계정·결제·데이터 저장 서버는 기존 루트 소스에서 발견되지 않았고 새로 추가하지 않았습니다.

클라이언트에 원래 있던 EmailJS 공개 키를 유지합니다. 서버 비밀키·환경 변수·새로 접수한 문의 데이터는 배포 폴더에 포함하지 않았습니다. 폼 QA의 허구 테스트 데이터는 공개 빌드에 포함하지 않습니다.

`public/evidence/`의 30개 이미지는 기존에 공개한 실제 제작 화면과 대화 캡처입니다. `public/art/`의 `editorial.webp`, `editing-desk.webp`, `optical-editorial.webp` 세 개는 생성한 브랜드 아트워크이며 실제 고객 작업·사무실 사진으로 소개하지 않습니다. 두 종류의 출처는 [증거 이미지 감사](reports/evidence-source-audit.md)와 [브랜드 아트 제작 기록](reports/asset-provenance.md)으로 구분했습니다. 개별 고객 반응을 전체 고객의 평균이나 성과 보장으로 확대하지 않습니다.

## 폰트와 재현

`Kotto Text`/`Kotto Display`는 Pretendard/Noto Serif KR의 이 사이트용 서브셋입니다. 원래 글자 디자인을 유지하면서 실제 한국어 카피의 글자만 포함합니다. 수정 폰트의 내부 이름을 변경하고 OFL 원문·저작권을 보존했습니다. 새 카피에 맞춰 서브셋을 갱신하며 방문자가 입력하는 다른 글자는 시스템 폰트가 보완합니다.

카피에 새 글자가 추가되어 서브셋을 갱신하려면 FontTools와 Brotli가 있는 Python에서 `python scripts/subset-fonts.py`를 실행합니다. 원본은 `../creative-rebuild/public/fonts/`에 있습니다. 일반 사이트 빌드에는 Python 패키지가 필요 없습니다.

## 클라우드 환경 설정

현재 환경에서 npm 설치·개발 서버·production 빌드·브라우저 검사는 실제 실행했습니다. 자동 시작 지침을 환경 초안에 저장하려 했으나 `stale_base` 충돌로 저장되지 않았습니다. 제안 전체는 `reports/cloud-setup-proposal.json`에 보존했습니다. 환경 설정에서 새 setup 대화를 시작한 뒤 최신 초안과 이 파일을 대조해 저장해야 자동 시작 구성이 반영됩니다. 이 설정 충돌은 Git에 보존한 소스·정적 빌드·미리보기 파일을 변경하지 않습니다.
