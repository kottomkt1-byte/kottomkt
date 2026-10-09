# 실제 사용한 스킬과 기술

작업 루트 `/workspace/kottomkt`, 독립 구현 폴더 `creative-rebuild/`. 원래 프로젝트는 HTML/CSS/JavaScript 정적 사이트여서 프로토타입도 같은 기본 기술을 사용하고 Vite 빌드만 추가했습니다. React를 필요 없이 도입하지 않았습니다.

## 실제 로드·적용

아래 경로는 모두 `/workspace/kottomkt/` 기준입니다. 각 `SKILL.md`를 실제로 읽었으며, 카피 담당/개발 담당의 적용 결과는 본문과 동작 검수로 통합했습니다. 단순 설치 여부를 적용 근거로 삼지 않았습니다.

| 스킬 이름 | 실제 읽은 파일 | 적용 내용 |
| --- | --- | --- |
| astra-frontend-design | `.agents/skills/astra-frontend-design/SKILL.md` | 콘셉트별 하나의 조형 원리, 실물 브라우저 캡처 기반 수정. art-direction, reference-to-code, motion-and-interaction, quality-gates 참고 |
| frontend-design | `.agents/skills/frontend-design/SKILL.md` | 큰 한국어 타이포와 서로 다른 정보 구조, 반복 카드·관습적 장식 배제 |
| ui-ux-pro-max | `.agents/skills/ui-ux-pro-max/SKILL.md` | 로컬 search.py 실제 실행, scroll storytelling·reduced motion·읽기 방해 최소화 적용. 자동 제안한 범용 색상·영문 서체는 채택하지 않음 |
| kotto-korean-copywriter | `.agents/skills/kotto-korean-copywriter/SKILL.md` | 사업 사실·원장님 대상 어휘·과장 금지·사례 증빙. 브랜드 전용 지침 우선 |
| product-marketing | `.agents/skills/product-marketing/SKILL.md` | 기존 `.agents/product-marketing.md`의 업종·고객·서비스 맥락 활용. 사실 자료 변경 없음 |
| copywriting | `.agents/skills/copywriting/SKILL.md` | 서로 다른 헤드라인 3개, 구체적인 업무 설명과 상담 CTA |
| copy-editing | `.agents/skills/copy-editing/SKILL.md` | 쉼표·상투어·불필요한 수식 제거, 최종 구현 문구 재검토 |
| humanizer | `.agents/skills/humanizer/SKILL.md` | 번역투·막연한 추상어·획일적인 문장 패턴 점검. 사람 작성 여부나 감지 정확도를 주장하지 않음 |
| grammar-checker | `.agents/skills/grammar-checker/SKILL.md` | 조사·띄어쓰기·구두점·의미 연결 검토 |
| style-guide | `.agents/skills/style-guide/SKILL.md` | 합니다체, 채널명·서비스명·문의 표현 일관성 |
| playwright | `.agents/skills/playwright/SKILL.md` | 공식 wrapper로 실제 Chromium 열기→새 snapshot→관찰한 버튼 클릭→스크린샷. 반복 QA는 Python Playwright 병행 |
| gsap-scrolltrigger | `.agents/skills/gsap-scrolltrigger/SKILL.md` | 기존 로컬 보조 지침의 scrub·모바일·접근성 원칙 참고 |
| threejs-r3f | `.agents/skills/threejs-r3f/SKILL.md` | 렌더링 부하·폴백 판단 참고. Three.js/R3F 패키지를 사용했다는 뜻은 아님 |

환경 구성은 `cloud-environment-onboarding:setup`의 `skill://plugin_connector_1p_ed5feb9070a08191b08c81c47947bc16/setup/SKILL.md`와 onboarding 참고문서를 읽고 따랐습니다. 현재 환경 검증과 설정 초안 저장·게시를 구분했습니다.

디자인 스킬의 원본은 `Enixes/astra-frontend-design`, `anthropics/skills`, `nextlevelbuilder/ui-ux-pro-max-skill`입니다. Astra 스킬은 커뮤니티 원본이며 OpenAI 공식 스킬이라고 부르지 않습니다. 기존 설치의 커밋·출처 기록을 보존했고, 이번에 추가한 OpenAI 공식 스킬은 아래 Playwright입니다.

## 공식 Playwright 스킬 설치·실행

기존 저장소에 공식 Playwright 스킬이 없어 `openai/skills`의 `skills/public/playwright` 전체를 고정 커밋 `49f948faa9258a0c61caceaf225e179651397431`에서 설치했습니다. 원본 scripts/references/agents/assets/LICENSE/NOTICE를 보존했습니다. `INSTALL-SOURCE.md`에 검토·실행 조건을 기록했습니다. 기존 디자인·카피 스킬의 내용을 바꾸지 않았습니다.

`npx` wrapper는 패키지를 내려받아 실행하는 스크립트입니다. sudo·자격 증명 추출·파일 삭제를 수행하는 명령은 없습니다. 읽기 전용 기본 캐시 대신 작업용 `npm_config_cache`와 `XDG_CACHE_HOME`을 사용했고 HOME/CODEX_HOME은 바꾸지 않았습니다. 실제 CLI가 C 페이지에서 플레이스 버튼을 클릭하고 캡처한 로그를 남겼습니다. FFmpeg 다운로드는 네트워크 정책으로 실패하여 녹화는 시스템 FFmpeg와 실제 Chromium CDP 프레임으로 구현했습니다.

## Codex 인식과 적용의 구분

실제 Codex app-server에 `initialize`, `skills/list(cwds=["/workspace/kottomkt"], forceReload=true)`를 요청했습니다. 필수 디자인·카피 10개와 Playwright, **11개 모두 `scope=repo`, `enabled=true`, 로더 오류 0개**입니다. 원본 응답은 [skill-discovery.json](skill-discovery.json)에 있습니다.

현재 대화의 `skills.list` executor 커넥터는 빈 목록을 반환했습니다. 이것을 저장소 Codex 로더와 같은 목록이라고 주장하지 않습니다. 새 Cloud 작업의 자동 호출·환경 게시까지 검증한 것은 아닙니다. 스킬 지침은 이번 대화에서 실제로 읽고 결과물에 적용했고, 별도의 app-server 요청은 등록 인식을 검증했습니다.

## 실제 채택 기술

GSAP 3.15.0의 ScrollTrigger를 A/B/C 장면에, Flip을 C 채널별 정보 재배열에 사용했습니다. A는 직접 작성한 WebGL vertex/fragment shader입니다. B는 새로 생성한 브랜드 종이 그래픽을 사용합니다. 한국어 행 마스크는 명시적 HTML 두 줄로 구현해 SplitText 의존성을 추가하지 않았습니다. Motion for React, Three.js, Rive, WebGPU, React Bits는 설치하지 않았고 사용했다고 주장하지 않습니다.

숨겨진 장면의 키보드 접근, focus-visible, 실제 메일 링크, 키보드 선택, 화면 밖 렌더 중단, prefers-reduced-motion을 구현했습니다. 모든 필수 설명은 HTML 텍스트로 남습니다. 모바일은 포인터 효과를 제외하고 A/C의 고정을 해제해 읽기 흐름을 유지합니다.
