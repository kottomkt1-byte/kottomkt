# 프론트엔드 디자인 스킬 설치·검증

홈페이지를 수정하지 않고 스킬만 설치한 기록입니다. Git 저장소 루트는 `/workspace/kottomkt`입니다.

## 설치된 세 스킬

| name | 실제 SKILL.md 경로 | 원본 저장소 |
| --- | --- | --- |
| frontend-design | `/workspace/kottomkt/.agents/skills/frontend-design/SKILL.md` | https://github.com/anthropics/skills |
| astra-frontend-design | `/workspace/kottomkt/.agents/skills/astra-frontend-design/SKILL.md` | https://github.com/Enixes/astra-frontend-design |
| ui-ux-pro-max | `/workspace/kottomkt/.agents/skills/ui-ux-pro-max/SKILL.md` | https://github.com/nextlevelbuilder/ui-ux-pro-max-skill |

`astra-frontend-design`은 Enixes의 공개 원본이며 OpenAI 공식 배포물이라고 주장하지 않습니다. 세 스킬 모두 원본의 이름과 설명을 유지했습니다. 커밋과 파일별 SHA-256은 [skill-sources.json](skill-sources.json)에 있습니다.

### 실제 description

**frontend-design**

> Guidance for distinctive, intentional visual design when building new UI or reshaping an existing one. Helps with aesthetic direction, typography, and making choices that don't read as templated defaults.

**astra-frontend-design**

> Design, implement, or visually refine a web interface when the visible experience is a primary deliverable. Use for greenfield UI, redesigns, reference matching, and visual polish; skip backend-only work and behavior-only frontend changes.

**ui-ux-pro-max**

> UI/UX design intelligence for web, mobile, and desktop. This skill should be used when designing, building, reviewing, or fixing interfaces, including pages, components, design systems, accessibility, interaction, responsive layout, typography, color, charts, and stack-specific UI implementation. Searchable local data: 79 searchable styles (50 active), 192 product palettes and reasoning profiles, 74 font pairings, 119 UX guidelines, 105 icons, 17 GSAP presets, 25 chart types, and 22 stacks.

## 파일 열람과 Codex 인식의 차이

`/workspace/design-skills/frontend-design/SKILL.md`는 이전 다운로드 보관본입니다. 파일을 직접 읽을 수 있지만 그 위치 자체는 이번 Codex 목록 조회에서 등록된 스킬로 나오지 않았습니다.

Codex CLI `0.159.0-alpha.3`의 실제 app-server에 `initialize`와 `skills/list`를 요청했습니다. `cwds`를 명시하고 `forceReload: true`로 캐시를 우회했습니다.

| 조회 cwd | 요청한 세 스킬의 인식 |
| --- | --- |
| `/workspace/kottomkt` | 세 개 모두 `scope: repo`, `enabled: true`, 오류 0 |
| `/workspace` | 세 개 모두 목록에 없음 |
| `/workspace/design-skills` | 세 개 모두 목록에 없음 |

[실제 조회 응답](skill-discovery-evidence.json)을 보관했습니다. 현재 대화의 `skills.list` 커넥터 목록은 프로젝트 스킬을 표시하지 않았습니다. 이 커넥터 목록과 별도 Codex CLI의 저장소 스킬 로더 결과를 혼동하지 않습니다.

프로젝트 스킬 경로는 저장소의 `.agents/skills/<name>/SKILL.md`입니다. Codex는 작업 경로의 영향을 받으므로 새 작업에서도 저장소를 작업 루트로 선택해야 합니다. 사용자 범위에는 `~/.agents/skills`와 `$CODEX_HOME/skills`, 시스템 범위에는 시스템 설정 옆 `skills` 경로가 사용됩니다. 이번 작업은 사용자·시스템 경로에 스킬을 설치하지 않았습니다.

## 내용·실행 검토 및 검사 결과

- frontend-design: 보관본과 고정한 Anthropic 원본 SKILL.md의 바이트 일치 확인. 실행 스크립트 없음.
- astra-frontend-design: 원본 전체와 `agents/openai.yaml`, 참고문서 9개, assets 3개 포함. 실행 스크립트 없음. 원본 저장소에 별도의 LICENSE 파일은 없으며 임의 라이선스를 덧붙이지 않았습니다.
- ui-ux-pro-max: 원본 CLI의 universal 설치 결과를 사용. 모든 동봉 data/scripts와 추가 references 2개, 원본 LICENSE 포함. 별도 npm 패키지나 홈페이지 의존성은 추가하지 않았습니다.
- UIUX 검색 경로는 `.agents/skills/ui-ux-pro-max/scripts/search.py`. Python 표준 라이브러리 기반이며 검토한 실행 경로에서 네트워크 호출·권한 상승·외부 명령 실행을 발견하지 않았습니다. `--persist`는 파일을 생성하므로 이번 검증에서 사용하지 않았습니다.
- 세 스킬의 SKILL.md를 직접 로드했고, UIUX 검색을 실제 실행해 `Focus States` 결과를 확인했습니다. 이는 모델의 새 대화에서 `$스킬명`을 처리한 것과는 별도입니다.
- 파일 해시, 메타데이터, 필요한 참조 파일, 실행 파일 권한을 확인했습니다. 홈페이지 코드가 이번 설치 전후 동일한지도 별도로 비교했습니다.

## 새 Cloud 작업에서 검증

1. 이 파일들이 포함된 Git 브랜치 `codex/install-frontend-design-skills`로 새 작업을 시작합니다. `main`에 병합한 뒤에는 main을 선택해도 됩니다. 다른 새 작업에서의 복원은 아직 직접 실행하지 않았습니다.
2. 작업 루트를 `/workspace/kottomkt`로 설정합니다. 실제 저장소가 다른 경로에 체크아웃됐다면 그 경로를 사용합니다.
3. 설치 무결성과 로컬 검색을 확인합니다:

   ```bash
   python3 -B .agents/verify-installed-skills.py
   ```

4. Codex CLI가 있는 환경에서 실제 목록 인식을 확인합니다:

   ```bash
   python3 -B .agents/verify-skill-discovery.py
   ```

   성공 조건은 `passed: true`, 세 이름 모두 `enabled: true`, `scope: repo`, 정확한 SKILL.md 경로, 오류 0입니다. 이 도구는 모델 턴을 시작하거나 홈페이지를 수정하지 않습니다. 기본 Codex 설정 경로가 읽기 전용이면 서버 초기화가 먼저 실패할 수 있습니다. 이번 작업은 승인된 샌드박스 외 실행으로 이 검사를 통과했습니다. 읽기 전용 환경에서의 실패를 스킬 내용 오류로 단정하지 마세요.

5. 새 대화에서 다음 요청을 스킬별로 한 번씩 보냅니다:

   ```text
   $frontend-design 설치 확인만 하세요. 홈페이지는 수정하거나 디자인하지 마세요.
   인식된 스킬의 name, description, 실제 경로를 보고하고 SKILL.md를 로드하세요.
   ```

   위의 `$frontend-design`을 `$astra-frontend-design`, `$ui-ux-pro-max`로 바꿔 반복합니다. 이름 선택 UI가 제공된다면 자동완성 목록에도 나타나는지 확인합니다. 파일 경로를 프롬프트에 직접 넣어 강제로 읽게 하는 것은 자동 인식 검증을 대체하지 못합니다.

세 스킬은 활성화 범위가 겹치므로 구현 작업에서는 주된 스킬 하나를 명시하고 필요한 보조 자료만 읽는 편이 적절합니다. 설치 사실만으로 디자인 품질이나 특정 모델의 사용을 보장하지 않습니다.

## 영구 보존과 사용자 설정

스킬·데이터·참고문서·검증 도구를 Git에 포함합니다. 저장소에서 체크아웃하면 재다운로드나 npm 설치 없이 사용하며, UIUX 검색에는 Python 3만 필요합니다. 임시 audit 폴더에 의존하지 않습니다.

새 Cloud 작업에서 해당 브랜치를 선택하거나, main으로 사용할 경우 해당 커밋을 검토 후 병합하세요. 클라우드 환경 게시를 이용할 경우 게시 버튼은 사용자가 실행해야 하며, 설정 초안 저장과 실제 게시·새 작업 복원은 서로 다른 단계입니다. 스킬 사용 자체에는 신규 네트워크 도메인이나 비밀키가 필요하지 않습니다.

클라우드 설정의 시작 안내에 작업 루트와 검증 명령을 저장합니다. 스킬 파일이 Git에 들어 있으므로 별도 install_script는 필요하지 않습니다. 이번 작업에서 새 Cloud 작업을 직접 생성하거나 환경을 게시하지 않았습니다.
