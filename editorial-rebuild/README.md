# 고또마케팅 — B 에디토리얼 전체 홈페이지

선택된 B 방향으로 기존 13페이지를 다시 설계한 검토용 사이트입니다. 운영 사이트와 분리된 `codex/kotto-creative-rebuild` 브랜치의 `editorial-rebuild/`에서 작업했습니다. 이번 구현의 소스와 배포 산출물은 이 폴더에서 관리합니다.

## 최신 구성

2026-11-09 사용자 요청으로 **안경 산업 전문 광고·콘텐츠 마케팅**으로 대상을 넓혔습니다. 안경원, 아이웨어 브랜드, 안경렌즈·콘택트렌즈 기업, 제조·수입·유통 및 관련 기업을 안내합니다.

메인은 무음 배경 영상 → 네 업종 안내 → 원본 화보 중심 작업 소개 → 서비스 → 기존 성과·고객 반응으로 이어집니다. 영상 위 재생/정지·브랜드 필름 보기·필름 캡션은 숨깁니다. 서비스 목차는 업종별 필터를 제공하며 홈페이지의 업종 링크에서 해당 목록으로 연결됩니다. 회사 소개와 문의 양식도 기업·브랜드 담당자에 맞춰 정리했습니다.

플레이스·당근은 안경원 중심 서비스, 모델 이미지는 안경테·선글라스 서비스입니다. 기존 32장 원본 포트폴리오, 실제 후기·작업 화면, ZIN 01 디테일 뷰어와 법정 정보는 유지합니다. 기존 사용자 확인 수치와 안경원 후기를 새 기업 고객 실적으로 확대하지 않습니다.

디자인 방향은 [DESIGN.md](DESIGN.md), 이번 변경과 검수는 [업종 확대 기록](reports/industry-repositioning.md)에 정리합니다. 이전 업데이트 보고서는 당시 검수 기록으로 보존합니다.

## 운영 반영

승인한 디자인의 운영 파일은 저장소 루트에서 관리하며 편집 원본은 이 폴더에 있습니다. `npm run build:production`은 검색 차단을 해제하고 기존 인증·canonical·사이트맵을 복원한 별도 `production/`을 만듭니다. 검수 후 `node scripts/apply-production.mjs --apply`로 루트에 적용합니다. 배포 방식은 [루트 안내](../README.md), 검수는 [운영 반영 기록](reports/production-release.md)에 있습니다. 기존 미리보기 빌드는 검색 차단을 유지합니다.

## 직접 보기

- [13페이지 웹 미리보기](https://raw.githack.com/kottomkt1-byte/kottomkt/codex/kotto-creative-rebuild/editorial-rebuild/share/site/index.html)
- [전체 사이트 간편 보기 ZIP](https://github.com/kottomkt1-byte/kottomkt/raw/refs/heads/codex/kotto-creative-rebuild/editorial-rebuild/share/kotto-full-site.zip)
- 실제 화면 녹화: [PC · 45초](share/recordings/kotto-media-rich-desktop.mp4) / [모바일 · 43초](share/recordings/kotto-media-rich-mobile.mp4). Chromium에서 페이지를 열고 스크롤·메뉴로 이동한 장면이며 [녹화 기록](reports/media-rich-update-recordings.json)에 사양을 보존했습니다.

ZIP은 PC에서 압축을 풀고 `kotto-full-site.html`을 Chrome/Edge로 열면 됩니다. 설치·서버 실행 없이 메뉴로 13페이지를 이동할 수 있습니다. 일부 휴대폰 파일 미리보기 앱은 스크립트를 실행하지 않으므로 모바일에서는 웹 주소를 사용하세요. 간편 보기의 콘텐츠·폰트·이미지·브랜드 영상·모션은 파일에 포함하도록 구성합니다. 영상 포함 뷰어는 13페이지×PC·모바일의 오프라인 검수를 통과했습니다. 원본 30개 확대, 포함 MP4 재생·정지·재개, 링크·뒤로가기·상담 항목 전달을 확인했고 추가 HTTP 요청과 페이지 오류는 없었습니다. 실제 문의 전송과 외부 지도·카카오톡 등은 인터넷 연결이 필요합니다.

웹 주소는 공개 GitHub 파일을 제공하는 GitHack 중계입니다. Vercel 운영 배포가 아닙니다. 이 클라우드의 네트워크 정책은 GitHack 요청을 차단하므로 이 환경에서 중계의 최종 응답을 검증했다고 주장하지 않습니다. GitHub에 게시한 원본과 다운로드 파일을 별도로 확인합니다. 내부 localhost 주소를 외부 미리보기로 안내하지 않습니다.

## 페이지

| 주소 | 역할 |
| --- | --- |
| index.html | 무음 브랜드 영상, 네 업종 안내, 화보 중심 작업 소개, 서비스와 실제 고객 반응 |
| about.html | 광학 산업의 네 분야, 실제 이미지·블로그 작업, 업무 기록과 회사 정보 |
| services.html | 화보 중심의 서비스 목차, 업종 필터, 상세 연결 |
| service-blog.html | 브랜드 블로그 대행, 실제 고객 반응 |
| service-hpblog.html | 홈페이지형 블로그, 실제 제작 사례 7개 |
| service-instagram.html | 인스타그램 마케팅 |
| service-place.html | 플레이스 관리·세팅 |
| service-daangn.html | 당근마켓 마케팅 |
| service-cafe.html | 카페 바이럴 |
| service-website.html | 홈페이지 제작 |
| contact.html | 기업·브랜드 문의 양식, 업종·프로젝트 유형, 기존 EmailJS 전송 및 연락 채널 |
| location.html | 동네 브랜드 일러스트, 실제 주소 복사·지도, 방문 안내 |

## 실행과 빌드

Node 22 이상과 npm을 사용합니다. 현재 환경에서는 Node와 Chromium/Python Playwright가 이미 제공됩니다.

```bash
cd /workspace/kottomkt/editorial-rebuild
npm ci --ignore-scripts --cache /tmp/kotto-npm-cache
npm run dev -- --port 4180
```

`src/home.js`, `services.js`, `company.js`, `shell.js`의 렌더 함수와 `content.js`를 `scripts/build-pages.mjs`가 완전한 HTML 13개로 생성합니다. 내용은 클라이언트 JS가 없어도 읽을 수 있습니다. 문의 전송에는 JavaScript가 필요하며 카카오톡·이메일 링크는 계속 제공됩니다.

```bash
npm run build
npm run preview -- --port 4181
node scripts/create-share.mjs
```

`dist/`가 독립 배포 폴더입니다. `share/site/`는 동일한 정적 배포본, `share/kotto-full-site.html`은 단일 파일 간편 보기입니다. HTML의 robots noindex/nofollow는 검토 환경용입니다.

별도 Vercel 프로젝트를 만들 경우 Root Directory를 `editorial-rebuild`, Build Command를 `npm run build`, Output Directory를 `dist`로 지정하고 **운영 도메인을 연결하지 않은 Preview**로 배포합니다. 자격 증명이 연결되지 않은 현재 환경에서 Vercel 배포 성공을 주장하지 않습니다. 정적 호스팅에는 `dist/`의 내용만 업로드하면 됩니다.

## 검수

**1440px·390px의 13페이지, 총 24개 기본 화면 조합을 검수했습니다.** 페이지·콘솔 오류와 가로 넘침은 없었습니다. 영상 6개 조건(PC·모바일 × 일반·축소 모션·데이터 절약), 원본 확대, 메뉴·선택 버튼·문의 폼도 실제 조작했습니다. 홈 왕복 스크롤 CLS는 0, 전체 페이지 초기 CLS 최댓값은 0.00859였습니다. 프레임 간격 p95는 약 16.7ms이며 데스크톱에서 83.3ms 한 번과 영상 216프레임 중 2개 드롭도 기록했습니다. 영상 제어 버튼 잘림과 모바일 제작 사례의 불필요한 중복 제목을 수정하고 해당 화면을 재검수했습니다.

- `python qa/media-audit.py --help` — 이번 13페이지 미디어 업데이트 검수. 범위는 [QA 계획](reports/media-rich-update-plan.md), 최종 결과는 `reports/media-rich-update-results.json`과 `reports/media-rich-update-qa.md`에 기록합니다.
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

현재 홈페이지는 사용자가 제공한 모델 포트폴리오 사진 5장을 편집한 **고또마케팅 브랜드 필름**을 사용합니다. 느린 카메라 이동, 부드러운 디졸브와 브랜드 타이포그래피로 “안경을 아는 시선으로, 브랜드의 가치를 전합니다.”에서 “안경을 아는 시선. 브랜드를 위한 콘텐츠.”로 이어집니다. 사진 속 인물의 움직임을 새로 합성한 영상이 아니라, 원본 사진의 구도와 화면 배치를 시간에 따라 편집한 필름입니다.

첫 화면에는 **22초 무음 반복 영상**을 사용합니다. 데스크톱은 1280×720·약 1.86MB, 모바일은 별도로 구성한 720×1280·약 1.82MB이며 각각 첫 프레임 포스터가 있습니다. 홈페이지의 영상 위 버튼과 브랜드 필름 표시는 숨깁니다. **26초·1920×1080·약 6.66MB** 본편은 `films/kotto-industry-brand-film.mp4`에서 직접 열 수 있습니다. 본편에는 직접 합성·작곡한 앰비언트 음악이 있습니다. 본편은 `public/films/kotto-industry-brand-film.mp4`, 무음 배경 영상과 포스터는 `public/films/kotto-seen-*`입니다.

배경 영상은 화면 밖과 숨겨진 탭에서 정지하고, 동작 감소·데이터 절약 설정에서는 포스터를 먼저 보여줍니다. 전체 영상 대화상자가 열리면 배경 영상은 정지하며, 닫으면 사용자의 기존 재생·정지 상태를 따릅니다. 닫기 버튼·Escape·바깥 영역 클릭을 지원하고 초점은 원래 링크로 돌아갑니다. JS가 없어도 전체 MP4를 새 창에서 여는 링크를 사용할 수 있습니다. 홈페이지는 GSAP ScrollTrigger·SplitText와 절제된 이미지 모션을 사용합니다. 긴 화면 고정 없이 자연스럽게 스크롤됩니다.

장면·출처·재현 명령은 [영상 제작 기록](reports/brand-video-production.md), 원본과 산출물 해시는 [자산 기록](reports/kotto-seen-film-assets.json)에 있습니다. 실제 새 MP4를 사용하는 통합 홈페이지 검수는 별도이며, 결과 기록 위치는 `reports/kotto-seen-film-qa.json`입니다. 이전 `kotto-studio-*` 영상과 제작 스크립트는 과거 제작 자료로 남아 있고 현재 홈페이지에서는 사용하지 않습니다.

## 폰트와 재현

`Kotto Text`/`Kotto Display`는 Pretendard/Noto Serif KR의 이 사이트용 서브셋입니다. 원래 글자 디자인을 유지하면서 실제 한국어 카피의 글자만 포함합니다. 수정 폰트의 내부 이름을 변경하고 OFL 원문·저작권을 보존했습니다. 새 카피에 맞춰 서브셋을 갱신하며 방문자가 입력하는 다른 글자는 시스템 폰트가 보완합니다.

카피에 새 글자가 추가되어 서브셋을 갱신하려면 FontTools와 Brotli가 있는 Python에서 `python scripts/subset-fonts.py`를 실행합니다. 원본은 `../creative-rebuild/public/fonts/`에 있습니다. 일반 사이트 빌드에는 Python 패키지가 필요 없습니다.

## 클라우드 환경 설정

현재 환경에서 npm 설치·개발 서버·production 빌드·브라우저 검사는 실제 실행했습니다. 자동 시작 지침을 환경 초안에 저장하려 했으나 `stale_base` 충돌로 저장되지 않았습니다. 제안 전체는 `reports/cloud-setup-proposal.json`에 보존했습니다. 환경 설정에서 새 setup 대화를 시작한 뒤 최신 초안과 이 파일을 대조해 저장해야 자동 시작 구성이 반영됩니다. 이 설정 충돌은 Git에 보존한 소스·정적 빌드·미리보기 파일을 변경하지 않습니다.

## 안경테·선글라스 모델 이미지 제작

전용 페이지 `service-model-images.html`은 자체 개발 프로그램과 안경사 검수 방식을 소개합니다. `src/model-images.js/css`가 페이지와 모션을, `src/model-gallery.js/css`가 필터·확대 갤러리를 관리합니다.

사용자 제공 포트폴리오 32장(선글라스 23장·안경테 9장)은 `public/portfolio/model-images/`의 전체 해상도 lossless WebP와 `thumbnails/`의 900px 표시용 WebP로 제공합니다. 확대 보기와 원본 보기에는 lossless 자산을 사용합니다. PNG 원본과 RGB 픽셀이 동일함을 전수 대조했으며, 자세한 기록은 `reports/model-images-asset-provenance.json`에 있습니다. 이미지 목록과 설명은 `src/model-portfolio-data.js`에서 편집하세요.
