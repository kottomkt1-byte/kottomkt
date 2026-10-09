# 구현 및 적용 지침 기록

## 범위

사용자가 승인한 B 에디토리얼 방향을 기존 12페이지 전체로 확장했다. 루트 운영 사이트 파일을 교체하거나 main 브랜치에 병합하지 않았다. 630개 보호 대상 파일의 기존 SHA-256 스냅샷과 비교했으며 변경은 0개다.

## 실제 적용한 스킬

아래 경로는 모두 `/workspace/kottomkt/` 기준이다. 파일을 실제로 읽고 이번 구현 또는 검수에 적용했다. 설치된 이름만 나열하거나 사용하지 않은 라이브러리를 사용했다고 기재하지 않는다.

| 이름 | 실제 읽은 SKILL.md | 적용 |
| --- | --- | --- |
| astra-frontend-design | `.agents/skills/astra-frontend-design/SKILL.md` | 전체 아트 디렉션, 12페이지 기능 보존, 모션/실제 픽셀 검수. art-direction, motion-and-interaction, quality-gates 참조 |
| frontend-design | `.agents/skills/frontend-design/SKILL.md` | 한국어 중심 타입, 여백·정보 구조, 인쇄물 소재, 획일적인 카드 구성 배제 |
| ui-ux-pro-max | `.agents/skills/ui-ux-pro-max/SKILL.md` | 로컬 디자인 시스템/폼 접근성 검색. B에 맞지 않는 일반 파랑·Latin 추천은 사용하지 않음 |
| kotto-korean-copywriter | `.agents/skills/kotto-korean-copywriter/SKILL.md` | 업종·고객·업무·공개 연락처 및 문체/증빙 기준 우선 |
| product-marketing | `.agents/skills/product-marketing/SKILL.md` | 고객과 서비스의 관계, 정보 구조 |
| copywriting | `.agents/skills/copywriting/SKILL.md` | 서비스별 구체적인 설명과 실제 행동 CTA |
| copy-editing | `.agents/skills/copy-editing/SKILL.md` | 반복·군더더기·명확성 검토 |
| humanizer | `.agents/skills/humanizer/SKILL.md` | 과장과 상투적인 AI 문장 제거 |
| grammar-checker | `.agents/skills/grammar-checker/SKILL.md` | 한국어 어법·띄어쓰기 검토 |
| style-guide | `.agents/skills/style-guide/SKILL.md` | 합니다체·용어·서비스명 일관성 |
| gsap-scrolltrigger | `.agents/skills/gsap-scrolltrigger/SKILL.md` | native sticky 장면, scrub/역스크롤/cleanup/감소모션 설계 |
| gsap-splittext | `.agents/skills/gsap-splittext/SKILL.md` | 실제 SplitText 플러그인, 한국어 줄 마스크·autoSplit·aria/폰트 대응 |
| playwright | `.agents/skills/playwright/SKILL.md` | 공식 CLI wrapper 실제 호출, 페이지 탐색·메뉴 클릭·스크린샷. 추가 Python Playwright 회귀 검사 |

GSAP 두 지침은 기존에 설치된 로컬 보조 스킬이며 공식 GSAP 배포 스킬이라고 주장하지 않는다. OpenAI 공식 Playwright 스킬의 출처는 기존 `INSTALL-SOURCE.md`에 기록되어 있다. Cloud onboarding setup 지침도 환경 설치·빌드·시작 검증에 적용했다.

## 기술과 시각 자산

- 기존 프로젝트의 HTML/CSS/JavaScript 구조를 유지하고 Vite 7.3.1로 12개의 정적 페이지를 빌드한다.
- GSAP 3.15.0 / ScrollTrigger / SplitText를 실제 실행한다. 페이지 이동은 지원 브라우저의 native View Transition, 일반 링크는 모든 브라우저의 기본 경로다.
- 히어로에 작성한 WebGL 종이 표면 셰이더를 사용한다. 원래 이미지를 유지하며 포인터·스크롤에 따른 낮은 곡률과 조명을 조절한다. 프레임을 상시 돌리지 않고 idle/화면 밖에서 멈춘다.
- 모바일·터치·reduced-motion·WebGL 오류 시 이미지로 대체한다. 스크롤을 가로채지 않고 모바일의 긴 고정 장면도 제거했다.
- Three.js, Rive, Motion for React는 도입하지 않았다. 이 사이트에 필요한 기능은 GSAP·직접 작성한 작은 WebGL 장면·네이티브 브라우저 기능으로 구현했다.
- 폰트는 로컬 배포하며 원본 약 3MB를 읽는 방식에서 168KB 서브셋으로 축소했다.
- K 종이 이미지와 새로 제작한 가로형 편집물 이미지는 브랜드 아트다. 허구 고객 프로젝트·성과·후기를 추가하지 않았다. `asset-provenance.md` 참고.

## 품질 판단의 범위

기능 테스트 통과와 디자인 수상 수준은 같은 판단이 아니다. 실제 화면에서 헤드라인/이미지 겹침, 스크롤 중 문장의 너무 이른 등장, 클리핑의 잘못된 보간, 모바일 문장 고립, 중복 CTA, 키보드 메뉴와 문의 결과 위치를 찾아 수정했다. 최종 브라우저 기록과 실제 동작 영상으로 검토할 수 있게 남겼다. Awwwards 선정·수상을 보장하거나 스스로 달성했다고 선언하지 않는다.

## 외부 확인 한계

GitHub의 소스·다운로드 응답은 별도로 검증한다. GitHack은 이 환경의 네트워크에서 차단되어 외부 최종 로딩을 확인할 수 없다. Vercel 배포 자격 증명은 연결되어 있지 않다. EmailJS 실제 전송·외부 지도 데이터는 모킹 검사와 구분한다. 클라우드 자동 시작 초안 저장은 stale_base 충돌로 미완료이며 제안 파일을 보존했다.
