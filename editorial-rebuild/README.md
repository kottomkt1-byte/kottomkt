# 고또마케팅 — B 에디토리얼 전체 홈페이지

선택된 B 방향으로 기존 12페이지를 다시 설계한 검토용 사이트입니다. 운영 사이트와 분리된 `codex/kotto-creative-rebuild` 브랜치의 `editorial-rebuild/`에서 작업했습니다. 이번 구현의 소스와 배포 산출물은 이 폴더에서 관리합니다.

## 최신 구성

이번 업데이트는 메인뿐 아니라 **12페이지 전체에서 사진·영상·일러스트와 본문이 교차하도록** 보완한 버전입니다. 메인은 재생을 제어할 수 있는 브랜드 영상, 콘텐츠 제작을 설명하는 3개 장면, 이미지 중심의 서비스 소개, 강점 기록, 실제 고객 반응으로 이어집니다.

사용자 요청에 따라 메인의 홈페이지형 블로그 제작 사례 갤러리는 제외했습니다. 실제 제작 사례 7개는 `service-hpblog.html`에서 계속 볼 수 있습니다. 고객 후기 15개와 상담 문의 8개, 원본 전체 보기와 확대 기능도 유지합니다. 기존 공개 PNG 30개는 가림 처리를 포함해 원본과 바이트가 동일합니다.

서비스 목차와 7개 상세에는 업무에 맞는 사진·일러스트, 선택 버튼과 화면 구성 예시를 넣었습니다. 회사 소개에는 기획·소통·제작을 보여주는 이미지, 문의에는 소통 일러스트와 편집물, 오시는 길에는 동네 일러스트와 실제 주소·지도를 배치했습니다. 그림은 실제 고객 작업이나 지도와 구분해 표시합니다.

사용자가 2026-10-09 현재 사용 중이라고 확인한 **5,000건+ 안경 제작 사례 작성, 100% 메인 품목 재계약률, 98% 전문성 만족도, 2위 에실로 얼티밋 전국 순위**를 원래 의미대로 유지합니다. 사용자 확인과 원자료의 독립 검증은 구분합니다.

최신 변경 내용은 [전체 페이지 미디어 업데이트](reports/media-rich-update-summary.md), 출처와 인용·수치는 [증거 자료 감사](reports/evidence-source-audit.md)에 있습니다. 이전 [시각 업데이트 보고서](reports/visual-update-summary.md)는 앞선 제작 사례·후기 복원 단계의 기록입니다.

## 직접 보기

- [12페이지 웹 미리보기](https://raw.githack.com/kottomkt1-byte/kottomkt/codex/kotto-creative-rebuild/editorial-rebuild/share/site/index.html)
- [전체 사이트 간편 보기 ZIP](https://github.com/kottomkt1-byte/kottomkt/raw/refs/heads/codex/kotto-creative-rebuild/editorial-rebuild/share/kotto-full-site.zip)
- 실제 화면 녹화: [PC · 45초](share/recordings/kotto-media-rich-desktop.mp4) / [모바일 · 43초](share/recordings/kotto-media-rich-mobile.mp4). Chromium에서 페이지를 열고 스크롤·메뉴로 이동한 장면이며 [녹화 기록](reports/media-rich-update-recordings.json)에 사양을 보존했습니다.

ZIP은 PC에서 압축을 풀고 `kotto-full-site.html`을 Chrome/Edge로 열면 됩니다. 설치·서버 실행 없이 메뉴로 12페이지를 이동할 수 있습니다. 일부 휴대폰 파일 미리보기 앱은 스크립트를 실행하지 않으므로 모바일에서는 웹 주소를 사용하세요. 간편 보기의 콘텐츠·폰트·이미지·브랜드 영상·모션은 파일에 포함하도록 구성합니다. 영상 포함 뷰어는 12페이지×PC·모바일의 오프라인 검수를 통과했습니다. 원본 30개 확대, 포함 MP4 재생·정지·재개, 링크·뒤로가기·상담 항목 전달을 확인했고 추가 HTTP 요청과 페이지 오류는 없었습니다. 실제 문의 전송과 외부 지도·카카오톡 등은 인터넷 연결이 필요합니다.

웹 주소는 공개 GitHub 파일을 제공하는 GitHack 중계입니다. Vercel 운영 배포가 아닙니다. 이 클라우드의 네트워크 정책은 GitHack 요청을 차단하므로 이 환경에서 중계의 최종 응답을 검증했다고 주장하지 않습니다. GitHub에 게시한 원본과 다운로드 파일을 별도로 확인합니다. 내부 localhost 주소를 외부 미리보기로 안내하지 않습니다.

## 페이지

| 주소 | 역할 |
| --- | --- |
| index.html | 브랜드 영상, 콘텐츠 제작 3개 장면, 강점 기록, 서비스 이미지, 실제 고객 반응 |
| about.html | 회사 소개, 소통·편집·제작 이미지, 업무 기록과 고객 반응, 회사 정보 |
| services.html | 사진 중심의 서비스 목차, 선택에 반응하는 이미지, 상세 연결 |
| service-blog.html | 브랜드 블로그 대행, 실제 고객 반응 |
| service-hpblog.html | 홈페이지형 블로그, 실제 제작 사례 7개 |
| service-instagram.html | 인스타그램 마케팅 |
| service-place.html | 플레이스 관리·세팅 |
| service-daangn.html | 당근마켓 마케팅 |
| service-cafe.html | 카페 바이럴 |
| service-website.html | 홈페이지 제작 |
| contact.html | 소통 일러스트, 기존 EmailJS 문의 양식과 연락 채널 |
| location.html | 동네 브랜드 일러스트, 실제 주소 복사·지도, 방문 안내 |

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

**1440px·390px의 12페이지, 총 24개 기본 화면 조합을 검수했습니다.** 페이지·콘솔 오류와 가로 넘침은 없었습니다. 영상 6개 조건(PC·모바일 × 일반·축소 모션·데이터 절약), 원본 확대, 메뉴·선택 버튼·문의 폼도 실제 조작했습니다. 홈 왕복 스크롤 CLS는 0, 전체 페이지 초기 CLS 최댓값은 0.00859였습니다. 프레임 간격 p95는 약 16.7ms이며 데스크톱에서 83.3ms 한 번과 영상 216프레임 중 2개 드롭도 기록했습니다. 영상 제어 버튼 잘림과 모바일 제작 사례의 불필요한 중복 제목을 수정하고 해당 화면을 재검수했습니다.

- `python qa/media-audit.py --help` — 이번 12페이지 미디어 업데이트 검수. 범위는 [QA 계획](reports/media-rich-update-plan.md), 최종 결과는 `reports/media-rich-update-results.json`과 `reports/media-rich-update-qa.md`에 기록합니다.
- `python qa/audit.py --base http://127.0.0.1:4181` — 페이지·레이아웃·기능 회귀 검사. SDK 모킹과 EmailJS API 차단으로 실제 메시지를 보내지 않습니다.
- `python qa/standalone.py` — 단일 HTML을 불러온 뒤 오프라인으로 전환해 페이지 연결과 기능을 확인합니다.
- `python scripts/verify-build.py` — 배포본 연결과 원본 이미지 보존을 검사합니다.
- 브랜드 영상 컴포넌트의 실제 재생·정지·포스터 대체 검수는 [영상 제작 기록](reports/brand-video-production.md)에 있습니다. 통합 홈페이지 검수와 구분합니다.
- 스크린샷과 녹화 원본은 `output/playwright/`에, 전달용 녹화는 `share/recordings/`에 보존합니다.

관리형 Chromium은 `file://` 탐색을 막으므로 파일 더블클릭 자체를 이 환경에서 검사했다고 주장하지 않습니다. 단일 HTML의 HTTP 최초 로드 후 오프라인 검수와 구분합니다. 클라우드 모바일 화면 검수가 물리적 휴대폰의 성능 보장을 뜻하지는 않습니다.

## 기능과 데이터

기존 문의 필드·EmailJS service/template/payload와 카카오톡·이메일·블로그·지도·사업자 정보를 유지했습니다. 실제 운영 수신함으로 테스트 메시지를 보내지 않았습니다. Preview 도메인이 EmailJS 허용 목록에 포함되는지와 실제 수신은 운영자가 확인해야 합니다. 계정·결제·데이터 저장 서버는 기존 루트 소스에서 발견되지 않았고 새로 추가하지 않았습니다.

클라이언트에 원래 있던 EmailJS 공개 키를 유지합니다. 서버 비밀키·환경 변수·새로 접수한 문의 데이터는 배포 폴더에 포함하지 않았습니다. 폼 QA의 허구 테스트 데이터는 공개 빌드에 포함하지 않습니다.

`public/evidence/`의 30개 이미지는 기존에 공개한 실제 제작 화면과 대화 캡처입니다. `public/art/`의 이미지 7개는 생성한 브랜드 아트워크입니다. 이번에 사진 스타일의 편집 작업대·인쇄물 이미지 2개와 손그림 스타일의 동네·소통 일러스트 2개를 추가했습니다. 실제 고객 작업·직원·사무실·위치 지도라고 소개하지 않습니다.

출처는 [기존 브랜드 아트](reports/asset-provenance.md), [새 사진 스타일 이미지](reports/media-asset-photo-provenance.md), [새 일러스트](reports/media-asset-illustration-provenance.md), [실제 증거 자료](reports/evidence-source-audit.md)로 나누어 기록했습니다. 개별 고객 반응을 전체 고객의 평균이나 성과 보장으로 확대하지 않습니다.

## 브랜드 영상과 모션

첫 화면의 브랜드 필름은 이 프로젝트의 이미지를 재구성한 **15.208초 무음 영상**입니다. 실제 고객 현장 촬영이나 웹사이트 조작 녹화가 아닙니다. 데스크톱 MP4는 약 2.13MB, 모바일 MP4는 약 649KB이며 각각 포스터를 제공합니다. 장면과 재현 명령은 [brand-video-production.md](reports/brand-video-production.md)에 있습니다.

현재 페이지는 GSAP ScrollTrigger·SplitText·Flip, 네이티브 video와 재생 버튼·dialog를 사용합니다. 기존 종이 WebGL 장면은 현재 메인 진입점에서 제거했습니다. 실시간 3D·셰이더를 사용하는 버전으로 안내하지 않습니다. 영상은 화면 밖에서 정지하고 축소 모션·데이터 절약에서는 포스터를 먼저 보여줍니다.

## 폰트와 재현

`Kotto Text`/`Kotto Display`는 Pretendard/Noto Serif KR의 이 사이트용 서브셋입니다. 원래 글자 디자인을 유지하면서 실제 한국어 카피의 글자만 포함합니다. 수정 폰트의 내부 이름을 변경하고 OFL 원문·저작권을 보존했습니다. 새 카피에 맞춰 서브셋을 갱신하며 방문자가 입력하는 다른 글자는 시스템 폰트가 보완합니다.

카피에 새 글자가 추가되어 서브셋을 갱신하려면 FontTools와 Brotli가 있는 Python에서 `python scripts/subset-fonts.py`를 실행합니다. 원본은 `../creative-rebuild/public/fonts/`에 있습니다. 일반 사이트 빌드에는 Python 패키지가 필요 없습니다.

## 클라우드 환경 설정

현재 환경에서 npm 설치·개발 서버·production 빌드·브라우저 검사는 실제 실행했습니다. 자동 시작 지침을 환경 초안에 저장하려 했으나 `stale_base` 충돌로 저장되지 않았습니다. 제안 전체는 `reports/cloud-setup-proposal.json`에 보존했습니다. 환경 설정에서 새 setup 대화를 시작한 뒤 최신 초안과 이 파일을 대조해 저장해야 자동 시작 구성이 반영됩니다. 이 설정 충돌은 Git에 보존한 소스·정적 빌드·미리보기 파일을 변경하지 않습니다.
