# 고또마케팅 B형 — 실제 브라우저 검수

검수 대상: 프로덕션 빌드의 내부 QA 서버 `http://127.0.0.1:4181`. 이 주소는 외부 접속용 미리보기가 아닙니다.

## 검수 결과

12개 페이지를 PC 1440×900과 모바일 터치 에뮬레이션 390×844에서 열었습니다. 일반 모션 24개, 축소 모션 6개, JavaScript 비활성 6개로 총 36개 조합을 검사했습니다. 전체 조합에서 JavaScript·콘솔·HTTP 오류 및 가로 넘침이 없었습니다. JavaScript가 실행된 30개 조합의 관찰 초기 CLS는 0이었습니다.

각 페이지 첫 화면을 두 폭에서 직접 캡처하여 확인했습니다. 중간·푸터 상태도 캡처했고, 홈 장면 전환, 회사 소개 본문, 서비스 디렉터리와 상세, 문의 결과, 전체 메뉴를 추가로 검토했습니다. 기능 통과를 디자인에 대한 사용자 승인이나 수상 가능성의 증거로 간주하지 않습니다.

## 사용한 스킬과 실제 호출

- `/workspace/kottomkt/.agents/skills/playwright/SKILL.md`
- `/workspace/kottomkt/.agents/skills/playwright/references/workflows.md`
- `/workspace/kottomkt/.agents/skills/playwright/references/cli.md`
- `/workspace/kottomkt/.agents/skills/astra-frontend-design/SKILL.md`
- `/workspace/kottomkt/.agents/skills/astra-frontend-design/references/quality-gates.md`

위 파일을 실제로 읽었습니다. 공식 Playwright 래퍼로 프로덕션 회사 소개를 열고, snapshot의 요소 참조로 전체 메뉴를 열어 플레이스 상세 페이지로 이동한 뒤 스크린샷을 남겼습니다. 성공 기록은 `output/playwright/cli/page-2026-10-09T12-01-01-500Z.yml`과 `page-2026-10-09T12-03-39-335Z.png`입니다. 전체 반복 검수에는 이미 설치된 Python Playwright와 `/usr/bin/chromium`을 사용했습니다.

## 실제 확인한 주요 흐름

- 홈 CTA → 전체 서비스 → 브랜드 블로그 상세 → 서비스명이 자동 입력된 문의 → 브라우저 뒤로 → 전체 메뉴 → 오시는 길.
- 전체 메뉴: `aria-expanded` 상태, 20회의 정·역방향 Tab 이동 중 초점 유지, Escape 닫기, 열기 버튼으로 초점 복귀. 모바일 최하단에서도 닫기 버튼이 보이고 실제 탭으로 닫힙니다.
- 서비스 디렉터리: 키보드 초점 이동으로 관련 타이포그래피 변경. 서비스 상세: FAQ를 Enter로 열고 닫기.
- 주소 복사: 화면 결과 문구 확인. 지도 펼치기: 기존 URL과 접근성 제목을 가진 iframe 생성 확인. QA 중 Google 응답은 대체했으므로 외부 지도 서비스의 실제 응답을 검증한 것으로 간주하지 않습니다.
- 문의: 필수 값 누락, 동의 미선택, 잘못된 전화번호 차단. 전송 중 버튼 비활성·중복 방지. 성공 시 초기화, 실패 시 입력 보존, 결과 문구 화면 내 노출. SDK가 없는 경우에도 입력을 보존하며 다른 연락 방법을 안내합니다.
- EmailJS 서비스·템플릿·payload 키가 기존과 같은지 기록했습니다. SDK를 mock으로 교체하고 메일 API 전송도 차단했습니다. 실제 문의는 발송하지 않았으며, 실제 이메일 수신이나 새 미리보기 도메인의 EmailJS 허용 여부는 이번 검수 범위가 아닙니다.
- 축소 모션: 읽을 수 있는 정적 구성과 내비게이션 유지. JavaScript 비활성: 실제 정적 본문, 상단 기본 내비게이션, 문의 대체 연락처 유지.

## 시각 검토 중 수정하고 다시 확인한 사항

1. 회사 소개의 대형 문의 CTA와 공통 푸터 CTA 반복을 제거했습니다.
2. 전체 메뉴에 명시적인 Tab 순환과 펼침 상태를 보완했습니다. 모바일 메뉴 상단을 고정하여 닫기 버튼을 유지했습니다.
3. 문의 성공·실패 문구가 화면 밖에 남던 경우에 결과 영역을 보이게 했습니다. 서브픽셀 스크롤 반올림에는 1 CSS px 허용값을 사용했습니다.
4. 390px 푸터의 조사 `를`이 혼자 줄 바뀌던 문제를 고쳤습니다. 최종 줄은 `안경원 이야기를` / `들려주세요.`입니다.
5. 히어로 종료 시 배경 사진과 흰 제목의 구도, 헤더 아래 클리핑, 종료 텍스트의 가독성을 실제 캡처에서 확인했습니다.

초기 개발 서버의 스타일 로딩과 HMR 중 관찰한 큰 CLS/컨텍스트 소멸은 프로덕션 빌드에서 재현되지 않았습니다. 보고 수치는 프로덕션 결과이며 초기 개발 서버 수치를 섞지 않았습니다. 마지막 공통 메뉴·푸터 및 문의 수정 후에는 영향을 받는 홈·문의만 다시 검사해 관찰 기록을 갱신했습니다.

## 모션 관찰

데스크톱 홈에서는 WebGL 종이 그래픽이 실행됐고, 스크롤 진행률이 실제로 바뀌어 장면이 전환됐습니다. 네이티브 휠 700px 이후 진행률은 약 0.864였습니다. 모바일에서는 WebGL 대신 완성된 사진과 일반 스크롤을 사용했고, 실제 합성 터치 스와이프가 페이지를 이동시켰습니다.

최종 2초 스크롤 측정은 PC와 모바일 모두 rAF 중앙값 16.7ms, p95 16.8ms였으며 50ms 초과 간격은 없었습니다. 첫 PC 통합 실행에서는 p95 33.3ms가 관찰됐습니다. 이는 공유 클라우드 Chromium에서의 프레임 간격이며 실제 기기 GPU 성능이나 모든 사용자의 60fps 보장으로 해석하면 안 됩니다. 스크린샷과 동시 작업이 실행 비용에 영향을 줍니다.

## 조합별 결과

| 조합 | HTTP | 페이지·콘솔·HTTP 오류 수 | 가로 넘침 px | 초기 CLS |
|---|---:|---:|---:|---:|
| index-1440-normal | 200 | 0 | 0 | 0 |
| index-390-normal | 200 | 0 | 0 | 0 |
| about-1440-normal | 200 | 0 | 0 | 0 |
| about-390-normal | 200 | 0 | 0 | 0 |
| services-1440-normal | 200 | 0 | 0 | 0 |
| services-390-normal | 200 | 0 | 0 | 0 |
| service-place-1440-normal | 200 | 0 | 0 | 0 |
| service-place-390-normal | 200 | 0 | 0 | 0 |
| service-blog-1440-normal | 200 | 0 | 0 | 0 |
| service-blog-390-normal | 200 | 0 | 0 | 0 |
| service-instagram-1440-normal | 200 | 0 | 0 | 0 |
| service-instagram-390-normal | 200 | 0 | 0 | 0 |
| service-cafe-1440-normal | 200 | 0 | 0 | 0 |
| service-cafe-390-normal | 200 | 0 | 0 | 0 |
| service-daangn-1440-normal | 200 | 0 | 0 | 0 |
| service-daangn-390-normal | 200 | 0 | 0 | 0 |
| service-hpblog-1440-normal | 200 | 0 | 0 | 0 |
| service-hpblog-390-normal | 200 | 0 | 0 | 0 |
| service-website-1440-normal | 200 | 0 | 0 | 0 |
| service-website-390-normal | 200 | 0 | 0 | 0 |
| location-1440-normal | 200 | 0 | 0 | 0 |
| location-390-normal | 200 | 0 | 0 | 0 |
| contact-1440-normal | 200 | 0 | 0 | 0 |
| contact-390-normal | 200 | 0 | 0 | 0 |
| index-1440-reduced | 200 | 0 | 0 | 0 |
| index-390-reduced | 200 | 0 | 0 | 0 |
| services-1440-reduced | 200 | 0 | 0 | 0 |
| services-390-reduced | 200 | 0 | 0 | 0 |
| contact-1440-reduced | 200 | 0 | 0 | 0 |
| contact-390-reduced | 200 | 0 | 0 | 0 |
| index-1440-normal-nojs | 200 | 0 | 0 | 해당 없음 |
| index-390-normal-nojs | 200 | 0 | 0 | 해당 없음 |
| service-place-1440-normal-nojs | 200 | 0 | 0 | 해당 없음 |
| service-place-390-normal-nojs | 200 | 0 | 0 | 해당 없음 |
| contact-1440-normal-nojs | 200 | 0 | 0 | 해당 없음 |
| contact-390-normal-nojs | 200 | 0 | 0 | 해당 없음 |

## 재현

```bash
python qa/audit.py --base http://127.0.0.1:4181 --extended
python qa/record.py --base http://127.0.0.1:4181
```

특정 수정의 관찰 결과만 기존 전체 보고서에 병합하려면 `--routes index,contact --merge`를 사용합니다. 원본 수치는 `reports/qa-results.json`, 화면 캡처는 `output/playwright/full-qa/`에 있습니다. 녹화는 실제 Chromium CDP 프레임을 원래 시각 간격으로 인코딩하며, 화면을 정지 이미지에서 보간하지 않습니다.
