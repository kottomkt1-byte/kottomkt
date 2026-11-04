# 프레임 디테일 — 실물 기반 3D 모델 교체

2026-11-04

`service-model-images.html#frame-details`의 임의로 구성한 안경 메시를 전문 아티스트가 실물을 참고해 제작한 Sunglasses Khronos 모델로 교체했다. 원본의 곡면 렌즈, 금속 앞판·브리지·힌지·템플, 이어팁, 코받침 형상을 사용한다. 형태·구조·소재의 세 시점, 직접 회전, 재생·정지, 골드·실버 금속 전환을 제공한다.

## 자산과 출처

- 제작자: Eric Chadwick / Darmstadt Graphics Group GmbH (2024).
- 출처: https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/SunglassesKhronos
- 라이선스: CC BY 4.0. 페이지에 제작자·출처·라이선스·변경 사항을 표시하고 `public/models/`에 원문 라이선스와 원본 README, Khronos 상표 고지를 포함했다.
- `public/models/eyewear-studio.glb`: 원본 GLB 371,188 bytes. SHA-256 `25d72dd0869c99f94a3c0d6dfe0707714eca056e531f6ff77e7545719c86ab8c`.
- `src/eyewear-model.js`: GLB 형상을 보존하고 단위·중심을 조정한다. 금속·렌즈·코받침 재질과 조명을 변경하며 원본 이어팁 로고 텍스처는 표시하지 않는다.
- `public/art/eyewear-studio.webp`: 같은 원본 모델을 Blender Cycles로 렌더링한 1200×1000 정적 포스터. 생성형 이미지가 아니다. 재현: `blender -b --python scripts/render-eyewear-poster.py -- final hero`.
- 특정 포트폴리오 제품의 복제 또는 실측 스캔이 아니라 구조·소재 설명용 모델이다. 사용자 요청에 따라 브랜드와 무관한 실물 기반 모델을 사용했다.
- 사용자 제공 포트폴리오 32장과 기존 고객 사례 원본 이미지는 변경하지 않았다.

## 동작과 접근성

기본 화면은 Blender Cycles의 512샘플 스튜디오 렌더다. ‘직접 돌려보기’ 또는 검수 항목을 선택할 때만 Three.js 코드와 로컬 GLB를 가져온다. ‘스튜디오 컷 보기’로 복귀하면 3D 렌더링과 타임라인을 멈추고 포스터를 복원하며, 다시 들어갈 때 같은 모델과 재생 선택을 유지한다. 모델 fetch/parse 후 WebGL을 만들며, 페이지 종료 시 로딩 요청과 GPU 자원을 정리한다. 로딩 중 검수 항목을 변경하면 마지막 선택을 유지한다.

화면 밖·백그라운드에서는 렌더링과 시점 애니메이션을 멈춘다. 모션 감소 설정에서는 자동 회전 없이 수동 조작을 제공한다. 드래그·방향키 회전, Home·초기 각도 복원, 터치 화면의 세로 스크롤·확대를 지원한다. 모델 로드 실패, WebGL 미지원·컨텍스트 손실, JavaScript 비활성화에서는 스튜디오 렌더와 검수 설명을 유지한다. 작동하지 않는 3D 진입 버튼은 숨긴다.

## 검수 기록

브라우저 동작 결과는 `eyewear-viewer-qa.json`, 빌드·링크 검수는 `build-audit.json`, 배포 파일 해시는 `production-manifest.json`에 기록한다. 브라우저 검수는 Chromium/SwiftShader 기반이며 실제 휴대폰 GPU의 성능 측정은 포함하지 않는다. 기존 서비스·갤러리 연동 기록은 `eyewear-integration-qa.json`에 보존한다.
