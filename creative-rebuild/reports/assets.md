# 시각 에셋과 라이선스

| 파일 | 출처·제작 | 용도 |
| --- | --- | --- |
| `public/art/editorial.webp` | 이번 작업에서 이미지 생성 도구로 새로 제작한 KOTTO 종이·활자 그래픽, 원본 1086×1448 PNG를 WebP로 변환 | B의 브랜드 콘셉트 물성. 실제 고객 프로젝트·촬영 기록 아님 |
| `src/a.js` vertex/fragment shader | 이번 작업에서 직접 작성 | 열린 금속 인쇄 리본, 광원·포인터·스크롤 상호작용 |
| `public/art/ribbon-poster.png` | 실제 WebGL 리본의 투명 정지 프레임을 캡처 | WebGL 미지원·context loss 시 동일한 조형을 유지하는 폴백 |
| `public/previews/*.webp` | 실제 작동하는 A/B/C 브라우저 화면 캡처 | 비교 페이지의 진입 링크 |
| `public/recordings/*.mp4` | 실제 Chromium 연속 화면을 CDP로 녹화, 시스템 FFmpeg 인코딩 | 데스크톱·모바일 동작 영상 |
| `public/fonts/PretendardVariable.woff2` | orioncactus/pretendard v1.3.9, jsDelivr의 원본 패키지 파일 | 한국어 고딕, SIL OFL 1.1. 동봉 `Pretendard-LICENSE` |
| `public/fonts/NotoSerifKR.woff2` | @fontsource/noto-serif-kr 5.2.6 korean-600-normal | 한국어 명조, SIL OFL 1.1. 동봉 `NotoSerif-LICENSE` |
| `public/favicon.svg` | 이번 작업에서 작성한 K 이니셜 | 브라우저 탭 아이콘 |

폰트 원본 URL:

- https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/variable/woff2/PretendardVariable.woff2
- https://cdn.jsdelivr.net/npm/@fontsource/noto-serif-kr@5.2.6/files/noto-serif-kr-korean-600-normal.woff2

이미지 제작 방향: 두꺼운 흰 종이를 접어 버건디 K 활자와 작은 KOTTO 워드마크를 인쇄한 물성 연구. 안경 제품, 고객명, 성과 차트, 사진 촬영 주장 없이 브랜드 편집 작업 자체를 보여줍니다. 생성한 이미지를 포트폴리오 실적으로 제시하지 않았습니다.

GSAP의 배포 라이선스는 공식 패키지의 standard license를 따릅니다. MIT라고 임의로 표시하지 않습니다. 프로토타입의 폰트·이미지·JS는 빌드에 로컬 포함되어 런타임 외부 CDN을 요구하지 않습니다.
