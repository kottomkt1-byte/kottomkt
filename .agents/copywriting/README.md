# 한국어 카피라이팅 스킬 설치 보고서

기록일: 2026-10-09 (한국 시간). 설치 기준 저장소는 `/workspace/kottomkt`다. 기존 디자인 스킬 및 홈페이지 코드·본문은 수정하지 않았다.

## 설치 및 출처

| name | SKILL.md 경로 (저장소 루트 기준) | 설치/실제 목록 인식/직접 로드·수동 적용 |
| --- | --- | --- |
| copywriting | `.agents/skills/copywriting/SKILL.md` | 통과 / 통과 / 통과 |
| copy-editing | `.agents/skills/copy-editing/SKILL.md` | 통과 / 통과 / 통과 |
| product-marketing | `.agents/skills/product-marketing/SKILL.md` | 통과 / 통과 / 통과 |
| humanizer | `.agents/skills/humanizer/SKILL.md` | 통과 / 통과 / 통과 |
| grammar-checker | `.agents/skills/grammar-checker/SKILL.md` | 통과 / 통과 / 통과 |
| style-guide | `.agents/skills/style-guide/SKILL.md` | 통과 / 통과 / 통과 |
| kotto-korean-copywriter | `.agents/skills/kotto-korean-copywriter/SKILL.md` | 통과 / 통과 / 통과 |

원본의 name과 description을 유지했다. 정확한 description, 출처 커밋, 배포 파일 SHA-256은 [sources.json](sources.json)에 있다.

- 마케팅 3개: [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills/tree/1efedbc5148b54b2f0f6c6c9fe0be62e151c7fff), 커밋 `1efedbc5148b54b2f0f6c6c9fe0be62e151c7fff`.
- 한국어 3개: [DaleSeo/korean-skills](https://github.com/DaleSeo/korean-skills/tree/ae12ba27982ebeff03b46dc738365aaa34260d9a), 커밋 `ae12ba27982ebeff03b46dc738365aaa34260d9a`.
- `kotto-korean-copywriter`: 이번 요청에 맞춰 직접 작성. 기존 여섯 스킬을 다른 이름으로 복제한 것이 아니다.

## 설치 전 검토

여섯 SKILL.md 전체를 읽고 해당 폴더의 파일 목록·참고 경로·텍스트 실행 지시를 점검했다. 설치 대상의 실파일은 Markdown과 JSON뿐이다. 실행 스크립트·바이너리·설치 훅이 없으므로 외부 설치 프로그램을 실행하지 않았다. 기술 문서 예시의 `curl`은 예문으로 확인했으며 실행하지 않았다.

요청한 폴더의 모든 references/examples/evals 파일과 저장소 MIT LICENSE를 포함했다. 각 파일은 고정한 원본과 바이트 단위로 대조했다. 저장소 루트의 CLAUDE.md 심볼릭 링크 및 범위 밖 플러그인·자동화 설정은 설치하지 않았다. 관련 스킬 목록에 언급된 다른 마케팅 스킬은 선택적 참조이며 이번 설치 대상이 아니다.

일반 파일 권한은 0644, 폴더는 0755로 설정했다. 원본의 `allowed-tools` 표기는 보존했지만 이 문자열이 Codex의 실행 권한을 추가하거나 홈페이지 편집을 허용하는 것은 아니다. 새 비밀키·네트워크 권한·패키지 의존성은 필요하지 않다.

원본 내용에서 다음 한계를 확인하여 전용 스킬의 적용 기준에 반영했다. 원본 스킬 파일은 수정하지 않았다.

- 마케팅 예시의 통계·보장 조건은 고또마케팅 사업 사실이 아니다.
- humanizer의 AUC 수치·등급은 이번 설치에서 재현·검증한 성능이 아니다. 문체 판단으로 실제 작성 주체를 단정하지 않는다.
- grammar-checker의 '10개 → 10 개' 예시와 style-guide의 '~합니다 (해요체)' 표기를 보편적인 국어 규정으로 취급하지 않는다. 허용 표기와 합니다체/해요체를 구별한다.

## 실제 인식과 적용 검증

Codex CLI `0.159.0-alpha.3` app-server에 `initialize`와 `skills/list`를 요청했다. `cwd=/workspace/kottomkt`, `forceReload=true` 조건에서 일곱 스킬 모두 `scope=repo`, `enabled=true`, 오류 0건으로 반환됐다.

- [외부 6개 설치 후 조회](discovery-upstream.json): 전용 스킬 제작 전에 완료.
- [전용 스킬 포함 7개 조회](discovery-all.json): 제작 후 완료.
- [입력·출력과 수동 적용 판정](usage-checks.md): 모든 스킬을 현재 대화에서 직접 읽고 적용한 기록. 새로운 모델 작업이나 새 Cloud 작업의 자동 호출 테스트는 아님.

전용 스킬은 skill-creator의 `quick_validate.py`도 통과했다. 이 검사는 형식을 확인하며 문안 품질을 자동 보증하지 않는다. 파일 무결성·참조 검사에서는 style-guide의 문법 예시 `[제목](URL)`을 실제 파일 참조와 구분했다.

## 고또마케팅 전용 맥락

전용 스킬에는 리디자인 전 Git 원문에서 확인한 안경원 전문 마케팅 업종, 원장님·운영자 대상, 7개 서비스와 상담 흐름을 기록했다. 알려진 정보, 독자에 대한 작업 가설, 추가 증빙이 필요한 주장을 분리했다. 공통 연결 문서는 [product-marketing.md](../product-marketing.md)다.

재계약률·만족도·순위·독점성을 기존 사이트에 적혀 있다는 이유로 확정하지 않는다. 고객 사례는 원자료, 측정 범위, 인용의 정확성, 개인정보, 공개 동의를 각각 확인하도록 했다. 실제 고객의 원자료·동의를 이번 작업에서 확보한 것은 아니다.

## 재검증과 다음 작업

스킬과 관련 자료는 `codex/install-kotto-korean-copywriting-skills` 브랜치에 보존한다. 이 브랜치는 앞서 설치한 디자인 스킬 커밋을 포함하며 그 내용을 변경하지 않는다. 홈페이지의 기존 미커밋 변경분은 이 작업 커밋에 포함하지 않는다.

새 작업에서 이 브랜치를 선택하고 저장소 루트에서 실행한다:

```bash
python3 -B .agents/copywriting/verify-install.py
python3 -B .agents/copywriting/verify-discovery.py --include-kotto
```

읽기 전용 Codex 설정 경로 때문에 app-server 초기화가 막히면 지원되는 승인 절차로 목록 조회만 실행한다. 이번 작업에서도 해당 조회를 승인받아 수행했다. HOME/CODEX_HOME을 바꾸거나 보호 기능을 끄지 않는다.

새 대화의 자동 호출은 다음을 스킬별로 보내 별도 확인한다:

```text
$kotto-korean-copywriter 설치 확인만 하세요. 인식된 이름·경로를 보고하고 SKILL.md를 로드하세요. 홈페이지와 디자인 스킬은 수정하지 마세요.
```

다른 여섯 이름으로도 반복할 수 있다. 자동 인식을 확인할 때는 파일 경로를 직접 붙여 강제로 읽게 하는 것과 구분한다. 새 Cloud 작업 실행·환경 게시·프로덕션 문안 변경은 이번 작업 범위에 포함하지 않았다.
