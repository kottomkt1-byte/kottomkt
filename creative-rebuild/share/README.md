# 고또마케팅 시안 쉽게 보기

[브라우저에서 A/B/C 비교 화면 열기](https://raw.githack.com/kottomkt1-byte/kottomkt/codex/kotto-creative-rebuild/creative-rebuild/share/kotto-preview.html)

위 주소는 공개 GitHub 파일을 웹페이지로 제공하는 GitHack 중계 주소입니다. 별도 Vercel 운영 배포가 아닙니다. 현재 클라우드의 네트워크 정책은 GitHack 접속을 차단해 외부 중계의 최종 응답을 이 환경에서 검증하지 못했습니다.

웹주소가 열리지 않는 PC에서는 [간편 보기 ZIP 다운로드](https://github.com/kottomkt1-byte/kottomkt/raw/refs/heads/codex/kotto-creative-rebuild/creative-rebuild/share/kotto-preview.zip)를 이용하세요.

1. ZIP 압축을 해제합니다.
2. `kotto-preview.html`을 Chrome 또는 Edge로 엽니다.
3. 상단의 A/B/C 버튼으로 시안을 선택하고 화면을 스크롤합니다.

이 HTML에는 세 시안의 스크립트·스타일·폰트·이미지가 모두 들어 있어 서버, 프로그램 설치, 배포 계정이 필요하지 않습니다. 일부 휴대폰 파일 미리보기 앱은 HTML 스크립트를 실행하지 않으므로 모바일에서는 웹주소를 사용하세요.

1440×900·390×844 브라우저에서 단일 HTML을 한 번 로드한 뒤 네트워크를 끄고 세 시안의 전환·스크롤·서비스/채널 선택을 검사했습니다. 추가 HTTP 요청은 없습니다. 관리형 Chromium 정책이 `file://` 열기를 차단하므로 이 환경에서 더블클릭 경로까지 검증했다고 주장하지 않습니다. 실제 검사 결과는 `../reports/offline-preview-qa.json`입니다.

`site/`에는 기존 배포 빌드도 함께 보존했습니다. 원래 화면 크기로 각 시안을 열려면 이 폴더의 `index.html`, `a.html`, `b.html`, `c.html`을 정적 호스팅하면 됩니다. 운영 홈페이지와 기존 디자인 소스는 변경하지 않았습니다.

재생성: `npm run build` 다음 `node qa/create-share.mjs`. 비교 HTML과 `site/`가 생성됩니다. ZIP에는 생성한 HTML과 폰트 라이선스를 포함합니다.
