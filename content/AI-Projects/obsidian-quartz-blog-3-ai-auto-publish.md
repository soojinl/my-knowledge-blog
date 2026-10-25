---
title: "Obsidian + Quartz 블로그 만들기 (3) Claude Code로 AI 뉴스 자동 발행하기"
date: 2026-10-25
tags:
  - ClaudeCode
  - Quartz
  - 업무자동화
description: Claude Code 루틴으로 매주 AI 뉴스를 찾아 요약 글을 쓰고, 블로그에 자동으로 발행하는 방법
---

Claude Code의 **루틴(Routine)** 기능으로 매주 AI 뉴스를 찾아 요약 글을 쓰고, 블로그에 자동으로 발행하도록 만드는 방법을 정리합니다. 루틴은 정해진 시간마다 Anthropic 클라우드에서 Claude가 실행되는 기능이라, 내 컴퓨터가 꺼져 있어도 돌아갑니다.

- [[AI-Projects/obsidian-quartz-blog-1-quartz-setup|1편. Quartz 설치와 GitHub Pages 배포]]
- [[AI-Projects/obsidian-quartz-blog-2-obsidian-workflow|2편. Obsidian에서 글 쓰고 발행하기]]
- **3편. Claude Code로 AI 뉴스 자동 발행하기** (이 글)

## 준비물

- 1편에서 만든 Quartz 블로그 (GitHub 저장소 + GitHub Pages 배포)
- Claude 유료 요금제 (Claude Code 사용)

## 작동 방식

```
루틴 실행 (예: 매주 일요일 18:00)
→ Claude가 뉴스 검색·원문 확인
→ content/AI-News/에 글 작성
→ 빌드 확인 후 git push
→ GitHub Actions가 블로그에 자동 배포
```

---

## 1단계. GitHub 연결하기

루틴이 내 저장소에 글을 쓰고 push하려면 두 가지 연결이 필요합니다.

**① claude.ai에 GitHub 계정 연결**

[claude.ai/code](https://claude.ai/code)에서 **Connect GitHub**를 눌러 GitHub 계정을 승인합니다. 이 연결이 없으면 루틴을 만들 때 `github_token_missing` 오류가 납니다.

**② GitHub에 Claude 앱 설치**

1. [github.com/apps/claude](https://github.com/apps/claude)에서 **Install**을 누릅니다.
2. 내 계정을 선택하고 **Only select repositories**에서 블로그 저장소만 체크합니다.
3. 저장소 쓰기 권한(Contents)을 허용합니다.

설치 확인은 [github.com/settings/installations](https://github.com/settings/installations)에서 할 수 있습니다.

## 2단계. 루틴 만들기

Claude Code에서 `/schedule`을 입력하고 원하는 작업을 말로 설명하면 Claude가 루틴을 만들어 줍니다.

```
/schedule 매주 일요일 18:00에 AI 주간 뉴스를 골라 요약 글을
my-knowledge-blog 저장소의 content/AI-News/에 작성하고 v5 브랜치에 push해줘.
승인 없이 자동 게시.
```

설정할 때 알아 둘 점입니다.

- **시간은 UTC로 저장됩니다.** 한국 시간 일요일 18:00은 UTC로 일요일 09:00이라 cron 표현식은 `0 9 * * 0`입니다. Claude가 변환해 주지만 한 번 확인하세요.
- **저장소:** `https://github.com/내아이디/my-knowledge-blog`
- **허용 도구:** 뉴스 검색을 위해 `WebSearch`, `WebFetch`가 들어가 있어야 합니다.

## 3단계. 루틴 지시문(프롬프트) 쓰기

루틴은 매번 아무 기억 없이 시작합니다. 그래서 지시문에 필요한 내용을 전부 적어야 합니다. 지시문에 넣을 항목은 아래와 같습니다.

1. **역할과 권한:** "블로그 발행은 승인 없이 끝까지 진행한다. 다른 곳에는 게시하지 않는다."
2. **독자와 관심사:** 어떤 독자를 위해, 어떤 분야의 뉴스를 고를지 적습니다. 예: "마케팅과 데이터 분석 실무자 기준으로 고른다."
3. **참고 채널:** 뉴스를 찾을 뉴스레터와 블로그 목록. 예: The Batch, Last Week in AI, Import AI, The Rundown AI, TLDR AI, Ben's Bites, Simon Willison's Weblog
4. **사실 확인 규칙:** "원문을 직접 읽고 쓴다. 원문 사이트에 접속이 안 되면 2곳 이상에서 확인된 사실만 쓴다. 발표일이 최근 7일 밖이면 뺀다."
5. **글 형식:** 파일 이름(`content/AI-News/YYYY-MM-DD-ai-weekly.md`), frontmatter, 항목별 구성(요약 + 실무 관점 + 원문 링크), 문체
6. **기준 글:** "가장 최근 뉴스 글을 먼저 읽고 형식과 분량을 맞춘다."
7. **안전장치:** "빌드가 실패하거나 확인된 항목이 5개 미만이면 발행하지 말고 이유를 보고한다."
8. **커밋과 push:** `git add content/AI-News/` → 커밋 → `git push origin v5`

위 항목을 모두 담은 지시문 예시입니다. 그대로 복사해서 관심 분야, 참고 채널, 저장소 경로만 바꿔 쓰면 됩니다. 루틴을 만들 때 Claude에게 "지시문은 이걸로 해줘"라고 함께 붙여 넣으세요.

```
너는 내 Quartz 블로그(저장소 루트의 content/ 폴더)에 'AI 주간 뉴스' 글을
매주 작성해 발행하는 에이전트다. 블로그 발행은 승인 없이 끝까지 진행한다.
다른 곳에는 아무것도 게시하지 않는다.

## 독자와 관심사
독자는 마케팅·데이터 분석 실무자다. 뉴스는 이 관심사 기준으로 고른다.

## 1. 저장소 준비
- git fetch origin v5 && git checkout v5 && git pull origin v5
- 날짜 확인: TZ=Asia/Seoul date +%F (이하 YYYY-MM-DD)
- content/AI-News/의 가장 최근 *-ai-weekly.md 파일을 먼저 읽고,
  구성·분량·문체를 그 글에 맞춘다.

## 2. 뉴스 수집 (최근 7일)
- 참고 채널: The Batch, Last Week in AI, Import AI, The Rundown AI,
  TLDR AI, Ben's Bites, Simon Willison's Weblog
- 후보마다 원문(공식 발표, 주요 매체)을 WebFetch로 읽어 세부 사실을 확보한다.
- WebFetch가 실패하면 WebSearch로 2곳 이상에서 확인된 사실만 쓴다.
- 발표일이 최근 7일 밖이면 제외한다.

## 3. 선정 기준
- 관심사와 직접 연결되는 뉴스를 우선한다.
- 같은 사건은 하나로 합치고, 근거 없는 과장 기사는 뺀다.
- 6~10개. 개수를 채우려고 약한 항목을 넣지 않는다.

## 4. 글 작성
파일: content/AI-News/YYYY-MM-DD-ai-weekly.md
frontmatter:
---
title: AI 주간 뉴스 (YYYY년 M월 N주차)
date: YYYY-MM-DD
tags:
  - AI
  - 주간뉴스
description: 이번 주 흐름을 한 문장으로
---
본문:
- 첫 문단: 이번 주 흐름을 3~4문장으로 요약한다.
- 항목마다 '### N. 제목' 아래 3~4개의 짧은 문단으로 쓴다.
  누가, 언제, 무엇을, 어떻게 작동하는지, 핵심 수치, 이용 조건, 한계를
  링크를 열지 않아도 이해될 만큼 구체적으로 쓴다.
- 각 항목 끝에 '**실무 관점:**' 문단과 '- **원문:** [출처명](URL)' 줄을 붙인다.
- 문체: 존댓말, 사실 중심, 짧은 문장. 과장 표현과 이모지 금지.

## 5. 검증
- npm install 후 npx quartz build로 빌드 성공을 확인한다.
- 빌드가 실패하면 커밋하지 말고 원인을 보고하고 종료한다.
- 원문 확인이 된 항목이 5개 미만이면 발행하지 말고 이유를 보고하고 종료한다.

## 6. 커밋과 push
- git add content/AI-News/
- git commit -m "Add AI 주간 뉴스 YYYY-MM-DD"
- git push origin v5. 실패하면 git pull --rebase origin v5 후 한 번 더.

## 7. 보고
- 글 제목, 선정한 항목 목록, 블로그 주소를 짧게 보고한다.

주의: content/AI-News/ 밖의 파일은 수정하거나 삭제하지 않는다.
```

팁 두 가지입니다.

- **6번 "기준 글" 규칙이 유용합니다.** 형식을 바꾸고 싶으면 지시문을 고칠 필요 없이 최근 글 하나만 원하는 형식으로 고쳐 두면 다음 실행부터 반영됩니다.
- **4번 "교차 확인" 규칙을 꼭 넣으세요.** 루틴이 도는 클라우드 환경에서는 일부 뉴스 사이트 접속이 막혀 있을 수 있습니다. 이 규칙이 있으면 원문 접속이 안 될 때도 검색 결과만으로 정확하게 쓸 수 있습니다.

## 4단계. 실행 확인하기

- 루틴 목록과 실행 기록은 [claude.ai/code/routines](https://claude.ai/code/routines)에서 볼 수 있습니다.
- 처음 만든 뒤에는 한 번 바로 실행해서 글이 제대로 올라오는지 확인하는 것을 권합니다.
- 실행이 끝나고 push되면 GitHub Actions가 1~2분 안에 블로그에 반영합니다.

## 5단계. 글 쓰고 고치기: 어디서 하면 되나요?

여기까지 만들면 자주 헷갈리는 부분이 있습니다. **Obsidian에서 쓰기만 해서는 블로그에 올라가지 않습니다.** Obsidian 보관함과 블로그 폴더는 서로 다른 곳이기 때문입니다.

| 위치 | 역할 |
|---|---|
| Obsidian `Blog Drafts` | 초안을 쓰고 고치는 곳. 여기서 고쳐도 블로그는 바뀌지 않습니다. |
| 블로그 폴더 `my-knowledge-blog/content` | 실제 블로그 원본. 여기를 바꾸고 push해야 블로그에 반영됩니다. |

### 방법 1. Claude Code에게 요청하기 (가장 쉬움)

블로그 폴더에서 Claude Code를 열고 말로 요청하면, Claude가 파일 복사부터 빌드 확인, push까지 해 줍니다. 블로그 폴더 밖에서 열었다면 Obsidian 보관함과 블로그 폴더 경로를 함께 알려 줍니다.

- **새 글 올리기:** "Blog Drafts의 ○○ 글을 Study 카테고리에 올려줘"
- **기존 글 수정:** Obsidian `Blog Drafts`에서 글을 고친 뒤 "○○ 글 수정한 걸로 반영해줘"
- **AI 주간 뉴스 수정:** 뉴스 글은 루틴이 블로그 폴더에 바로 쓰기 때문에 Obsidian에는 없습니다. "이번 주 AI 뉴스에서 3번 항목 고쳐줘"처럼 요청합니다.

Claude가 올리기 전에 내용을 보여 주고 확인받게 하려면 "올리기 전에 나한테 확인받아"라고 덧붙이면 됩니다.

### 방법 2. 직접 올리기

1. 글 파일을 블로그 폴더의 카테고리 폴더로 복사합니다. 기존 글을 고친 경우에는 같은 이름으로 덮어씁니다.

```powershell
Copy-Item "$HOME\Documents\내보관함\Blog Drafts\글제목.md" "$HOME\Documents\my-knowledge-blog\content\Study\글제목.md"
```

2. 블로그 폴더에서 올립니다.

```powershell
cd $HOME\Documents\my-knowledge-blog
git add .
git commit -m "Update 글 제목"
git push origin v5
```

3. 1~2분 뒤 블로그에 반영됩니다.

**습관 하나:** 블로그 폴더의 파일을 직접 고치면 Obsidian 초안과 내용이 달라집니다. **항상 Obsidian `Blog Drafts`에서 고친 뒤 반영**하면 두 곳의 내용이 어긋나지 않습니다.

---

## 마무리

이제 직접 쓰는 글은 Obsidian에서 검토 후 발행하고, AI 뉴스는 루틴이 매주 자동으로 발행하는 블로그가 완성됐습니다.

- [[AI-Projects/obsidian-quartz-blog-1-quartz-setup|1편. Quartz 설치와 GitHub Pages 배포]]
- [[AI-Projects/obsidian-quartz-blog-2-obsidian-workflow|2편. Obsidian에서 글 쓰고 발행하기]]
