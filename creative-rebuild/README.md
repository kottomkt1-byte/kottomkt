# 고또마케팅 — 세 가지 인터랙티브 프로토타입

운영 홈페이지와 분리된 디자인 비교용 프로젝트입니다. 브랜치는 `codex/kotto-creative-rebuild`입니다. 전체 홈페이지를 구현하지 않았으며, 다음 제작은 사용자의 콘셉트 선택 후 진행합니다.

| 페이지 | 방향 | 핵심 동작 |
| --- | --- | --- |
| `index.html` | 비교 화면 | A/B/C 열기, 실제 작동 영상 |
| `a.html` | IMMERSIVE | 직접 작성한 WebGL 인쇄 리본, 포인터 조명, 서비스 지면 전환 |
| `b.html` | EDITORIAL | 큰 한국어 명조, 종이 그래픽, 펼친 지면의 확대와 서비스 선택 |
| `c.html` | EXPERIMENTAL | 한국어 활자 포스터, 채널별 편집 변경, 활자 면이 열리는 장면 |

세 페이지의 문의 링크는 공개 사업 이메일 `communication@kotto.kr`을 여는 `mailto:`입니다. 실제 메일 발송이나 기존 API·결제·데이터 저장 로직은 실행하거나 수정하지 않았습니다.

## 직접 열어보는 방법

현재 공개 Preview URL은 **발급되지 않았습니다**. 연결된 Vercel 프로젝트·배포 인증이 없고 GitHub API 조회도 403으로 차단되었습니다. 내부 개발 주소는 외부 미리보기 링크가 아닙니다.

가장 간단한 방법은 제공한 `kotto-creative-preview.zip`을 압축 해제한 뒤, **새로운 정적 사이트 프로젝트**에 내용물을 업로드하는 것입니다. `index.html`, `a.html`, `b.html`, `c.html`, `assets/`, `fonts/`, `art/`, `previews/`, `recordings/`가 같은 루트에 있어야 합니다. 저장소 전체를 업로드하지 마세요.

### Vercel의 별도 Preview로 배포

배포 가능한 개인 환경에서 로그인 후 실행합니다. 아래 명령은 이 클라우드에서 실행·인증된 명령이 아니라 사용자가 수행할 절차입니다.

```bash
cd /path/to/unzipped/kotto-creative-preview
npx vercel login
npx vercel
```

질문이 나오면 기존 운영 프로젝트에 연결하지 말고 `kotto-creative-preview`라는 **새 프로젝트**를 만드세요. Framework는 Other, 업로드한 정적 파일을 그대로 사용합니다. `--prod`는 사용하지 않습니다. CLI가 실제 출력한 URL의 `/a.html`, `/b.html`, `/c.html`에서 각 콘셉트를 비교합니다. 배포 보호가 켜져 있으면 계정 로그인 또는 공유 가능한 Preview 접근 설정이 필요합니다.

명령어 없이 배포하려면 [Netlify Drop](https://app.netlify.com/drop)에 로그인한 뒤, 압축을 해제해 `index.html`이 바로 들어 있는 폴더를 드래그합니다. 새 사이트가 생성되면 실제 발급된 주소를 열어 A/B/C 링크를 클릭합니다. 이 환경에서 Netlify 업로드를 실행하거나 검증한 것은 아닙니다. 기존 사이트의 도메인·CNAME·DNS·배포 설정은 바꾸지 않습니다.

### 로컬에서 실행

빌드만 확인할 때는 압축을 해제한 폴더에서 `python3 -m http.server 4174`를 실행하고 **본인 PC**의 브라우저에서 접속하면 됩니다. HTML을 파일 탐색기에서 더블클릭하는 방식은 ES 모듈 때문에 지원하지 않습니다.

소스로 개발하거나 다시 빌드할 때:

```bash
git switch codex/kotto-creative-rebuild
cd creative-rebuild
npm ci --ignore-scripts --cache /tmp/kotto-npm-cache
npm run build
npm run preview -- --host 127.0.0.1 --port 4174
```

Node.js 22.12 이상이 필요합니다. 현재 검증 환경은 Node 24.19.0/npm 11.9.0입니다. `npm run dev`는 개발용, 배포할 폴더는 `dist/`입니다. 외부 CDN 없이 폰트와 그래픽을 함께 제공합니다.

## 실제 브라우저 검수와 녹화

- `qa/verify.py`: 1440×900·390×844, 일반/축소 모션, 시작·중간·종료, 포인터·터치·키보드·CTA·오류·CLS·rAF 관찰.
- `qa/record.py`: Chromium이 렌더한 연속 프레임을 실제로 캡처하고 FFmpeg로 MP4 변환. PC·모바일 영상 6개를 `public/recordings/`에 저장합니다.
- `qa/skill-discovery.py`: Codex app-server의 실제 `skills/list` 조회. 모델의 자동 스킬 선택을 검증하는 테스트는 아닙니다.

```bash
python3 qa/verify.py --base-url http://127.0.0.1:4174
python3 qa/record.py --base-url http://127.0.0.1:4174
```

위 로컬 주소는 검수용입니다. Python Playwright 1.62.0, Pillow 12.3.0, 시스템 Chromium과 FFmpeg를 사용했습니다. 다른 환경에서는 이 도구를 설치하고 스크립트의 Chromium 경로를 맞춰야 합니다. 성능 관찰값은 이 컨테이너의 소프트웨어 GPU 기준으로 실제 모바일 기기의 성능 보장이 아닙니다.

## 보고서

- [실제 사용 스킬·기술](reports/skills-and-implementation.md)
- [레퍼런스 접근 결과·최종 아트 디렉션·모션](reports/design-and-motion.md)
- [한국어 카피 검토](reports/copy-review.md)
- [브라우저 QA](reports/qa-summary.md)
- [환경 설정 저장 상태](reports/environment-status.md)
- [에셋 출처](reports/assets.md)

디자인 선택 전에는 전체 페이지 제작과 운영 배포를 진행하지 않습니다.
