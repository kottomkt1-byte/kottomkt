# 실제 작업물·고객 대화 복원 — QA 범위

이번 변경은 12페이지 구조를 유지하면서 실제 업무와 기존 증거 이미지를 다시 보여주는 작업입니다. 브라우저 검수는 구현 담당자의 production freeze 알림 이후에 시작합니다.

## 원본 보존

- 기존 후기 15개: `images/reviews/review-01.png`–`review-15.png`.
- 기존 문의 8개: `images/nosales/chat-01.png`–`chat-08.png`.
- 기존 제작물 7개: `images/portfolio/portfolio-01.png`–`portfolio-07.png`.
- `visual-update-original-images.json`에 원본 SHA-256·치수·크기를 기록했습니다. 설치 사본과 일치하는지 확인합니다. 후기의 진위를 외부 고객에게 재확인했다는 뜻은 아닙니다.

## 실제 화면과 동작

- 1440×900 / 390×844, 일반 / 축소 모션에서 홈·회사 소개·홈페이지형 블로그 상세.
- 30개 원본 이미지의 접근 가능 여부, 큰 보기 이미지의 로딩·원본 비율·자르지 않는 구성.
- 이미지 뷰어: 이전·다음, 확대/축소, Escape, Tab 순환, 닫기 후 초점 복귀, 모바일 닫기 버튼과 터치 스크롤.
- 제작 사례 구간: 네이티브 휠·터치, sticky 장면과 최종 카드, 한글 줄바꿈, 큰 이미지 구성, 실제 작업물과 설명의 연결.
- 전체 12페이지 오류·이미지 누락·가로 넘침, 내비게이션·서비스 FAQ·문의 기능 회귀 확인. 문의 전송은 SDK 대체 및 API 차단으로 실발송 없이 확인.
- 실제 홈 → 제작 사례 → 후기 원본 보기 동작을 PC·모바일에서 녹화.

## 시각 판정

텍스트 양만 늘렸는지, 기존의 실제 결과물이 지나치게 작은 카드에 묻혔는지, 제작 사례와 고객 대화가 충분히 읽히는지 따로 봅니다. 기능 통과를 디자인 승인으로 간주하지 않습니다. 문제는 소유자에게 전달하고 영향을 받는 상태를 재검수합니다.

## 적용한 QA 지침

실제로 읽은 지침은 기존 작업과 동일한 프로젝트 경로의 `playwright/SKILL.md`, `playwright/references/workflows.md`, `playwright/references/cli.md`, `astra-frontend-design/SKILL.md`, `astra-frontend-design/references/quality-gates.md`입니다. 전체 경로는 `/workspace/kottomkt/.agents/skills/` 아래입니다.
