# 고또마케팅 홈페이지

운영 주소: https://www.kotto.kr/
배포: GitHub Pages, `main` 브랜치의 저장소 루트.

루트의 12개 HTML과 `art/`, `assets/`, `evidence/`, `films/`, `fonts/`는 승인한 B 에디토리얼 디자인의 운영 파일입니다. 페이지 URL, 문의·지도·카카오톡 연결과 기존 고객 원본을 유지합니다.

## 수정할 곳

실제 편집 원본은 `editorial-rebuild/src/`입니다. 루트 HTML은 생성물이므로 이곳을 수정한 뒤 운영 파일을 다시 만드세요. 상세 디자인·모션·자료 출처는 `editorial-rebuild/README.md`에 있습니다. `creative-rebuild/`는 이전 콘셉트 기록입니다.

```bash
cd editorial-rebuild
npm ci --ignore-scripts
npm run build:production
```

`production/`에 운영용 12페이지와 필요한 파일이 생성됩니다. 일반 `npm run build`의 `dist/`는 검색 차단된 미리보기이므로 그대로 운영에 복사하지 않습니다. 운영 주소·Google/네이버 공개 소유권 인증은 `production.config.json`으로 관리합니다.

검수 후 운영 파일 적용:

```bash
node scripts/apply-production.mjs --apply
```

이 명령은 `reports/production-manifest.json`의 해시를 확인하고, 기존 대상 파일을 저장소 바깥의 `kotto-production-backups/`에 보존한 뒤 현재 루트에 복사합니다. 관련 변경만 검토·커밋하고 `main`에 반영하면 기존 GitHub Pages가 배포합니다. 강제 푸시는 사용하지 않습니다.

## 배포 전 검수

`editorial-rebuild/production/`을 정적 서버로 실행하고 `python qa/production-audit.py --base <검수 서버 주소>`로 검사합니다. 실제 메일은 보내지 않으며 EmailJS SDK를 모킹합니다. 검수는 12페이지의 PC·모바일 표시, 에셋 연결, canonical·검색 인증·robots 설정, 영상 재생과 메뉴·문의 기능을 포함합니다.

운영에서는 기존 EmailJS 서비스·템플릿·공개 키를 유지합니다. 실제 메일 수신은 운영 서비스의 상태에 달려 있으며 자동화 검사와 구분합니다. 서버 비밀키나 고객이 제출한 데이터는 정적 빌드에 포함하지 않습니다.

`_config.yml`은 개발 원본·스킬·QA·미리보기 폴더를 Pages 게시 대상에서 제외합니다. CNAME과 검색 인증, 12페이지 사이트맵, 기존 공유 이미지를 보존합니다. HTML, JavaScript, CSS의 배포본을 각각 따로 수작업으로 수정하지 마세요.

문제 발생 시 해당 운영 반영 커밋을 `git revert`하고 Pages 배포 결과를 확인하세요. 이전 운영 기준은 `58e34ce81f7efb03924db646aba2771b64c5e6bc`입니다. 되돌릴 때도 원격 기록을 강제로 덮어쓰지 않습니다.
