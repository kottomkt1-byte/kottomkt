# 승인 디자인의 운영 적용

사용자가 2026-10-09 승인한 미디어 보강 버전 `545d17c56ba0e479375a449a284eb695fca97ab4`를 운영 루트에 적용하는 변경이다. 이전 운영 기준은 `58e34ce81f7efb03924db646aba2771b64c5e6bc`다.

## 확인한 배포 경로

저장소의 CNAME과 GitHub 공개 저장소 메타데이터는 `https://www.kotto.kr/`를 가리킨다. 기존 [Pages 실행 24547956002](https://github.com/kottomkt1-byte/kottomkt/actions/runs/24547956002)는 `main`의 `58e34ce`에서 build와 deploy가 성공했다. 따라서 기존 main 루트 자동 배포를 유지하고 승인된 정적 파일을 반영한다. 환경의 네트워크 정책은 운영 도메인 및 api.github.com 직접 접속을 차단한다. 배포 후 상태는 허용된 GitHub의 Pages 실행 화면에서 확인해야 하며 운영 도메인 직접 브라우저 검수와 구분한다.

## 운영에 맞춘 변경

- 12개 기존 HTML 경로와 문의·연락·지도 연결을 유지한다.
- 운영 HTML은 `index,follow,max-image-preview:large`, 미리보기는 `noindex,nofollow`로 구분한다.
- 기존 Google·네이버 공개 소유권 인증, 페이지별 canonical, 공유 이미지와 CNAME을 보존한다.
- 최신 12페이지 사이트맵과 검색 로봇 설정을 생성한다.
- `_config.yml`로 제작 원본·스킬·QA·이전 시안이 Pages 게시물에 섞이지 않도록 제외한다.
- 기존 고객 PNG 30개와 승인된 사진·일러스트·영상·폰트·라이선스를 포함한다. 새 비밀키나 접수 고객 데이터는 추가하지 않는다.

## 검증

`qa/production-audit.py`로 실제 HTTP 정적 서버에서 게시 후보 67개 파일을 해시 대조하고, 모든 HTML의 canonical·검색 설정·인증 태그·로컬 파일 연결을 검사했다. Chromium 1440×900 / 390×844로 12페이지씩 총 24개를 열었다. 페이지·HTTP 오류 및 가로 넘침이 없고 영상이 실제로 재생된다. 메뉴 키보드·닫기·초점 복귀, 문의 필수값·동의·전화번호·중복 방지·성공 초기화·실패 보존도 확인했다.

문의 호출은 실제 운영 원본과 동일한 service/template 및 `company`, `store_name`, `phone`, `region`, `budget`, `message` 필드다. 테스트에서는 SDK를 모킹하고 API를 차단했으므로 실제 운영 메일을 보내거나 수신을 검증하지 않았다. 기록은 `production-qa.json`, 배포 파일 해시는 `production-manifest.json`이다. 이번 변경은 시각 디자인을 다시 바꾸지 않는다.

## 보존과 복구

적용 전에 작업 폴더에 남아 있던 이전 HTML·스크립트·스타일·README와 assets를 `/workspace/kotto-production-backups/20261009-235332`에 보존했다. 적용 스크립트도 변경 대상 파일을 저장소 외부에 별도로 보존한다. 기존 미커밋 script.js/styles.css 및 무관한 스킬·테스트 파일은 이번 반영 커밋에 포함하지 않는다.

Git에 보존된 이전 main 및 승인 버전으로 변경을 추적할 수 있다. 운영 반영 커밋을 되돌릴 때는 `git revert`를 사용하고 새 Pages 실행을 확인한다. 실제 배포 완료 여부의 기준은 해당 커밋의 GitHub Pages 실행 결과이며 이 빌드 검수 기록만으로 외부 서비스 도달을 주장하지 않는다.
