---
title: "Obsidian + Quartz 블로그 만들기 (2) Obsidian에서 글 쓰고 발행하기"
date: 2026-10-25
tags:
  - Obsidian
  - Quartz
  - 업무자동화
description: Obsidian 템플릿으로 초안을 쓰고, 검토한 글만 Quartz 블로그로 발행하는 작업 흐름 만들기
---

Obsidian에서 글을 쓰고, 검토를 마친 글만 Quartz 블로그로 발행하는 방법을 정리합니다. 초안과 공개 글을 분리해 두면 미완성 글이나 민감한 내용이 실수로 공개되는 일을 막을 수 있습니다.

- [[AI-Projects/obsidian-quartz-blog-1-quartz-setup|1편. Quartz 설치와 GitHub Pages 배포]]
- **2편. Obsidian에서 글 쓰고 발행하기** (이 글)
- [[AI-Projects/obsidian-quartz-blog-3-ai-auto-publish|3편. Claude Code로 AI 뉴스 자동 발행하기]]

## 준비물

- 1편에서 만든 Quartz 블로그
- [Obsidian](https://obsidian.md/)

---

## 1단계. Obsidian 폴더 나누기

Obsidian 보관함(vault)에 폴더 두 개를 만듭니다. 보관함이 없다면 Obsidian을 처음 열 때 **새 보관함 만들기**로 먼저 만듭니다. 블로그 폴더(`my-knowledge-blog`)와는 다른 위치에 둡니다.

| 폴더 | 용도 | Quartz로 복사? |
|---|---|---|
| `Blog Templates` | 글 양식 보관 | 하지 않음 |
| `Blog Drafts` | 비공개 초안 작성 | 검토 끝난 글만 |

Quartz의 `content` 폴더는 **공개 대상**입니다. push하면 그대로 인터넷에 공개되므로, 검토를 마친 글만 복사합니다.

## 2단계. 글 템플릿 만들기

`Blog Templates` 폴더에 `Blog Post Template`이라는 노트를 만들고 아래 내용을 붙여 넣습니다.

```markdown
---
title: 글 제목을 입력하세요
date: "{{date:YYYY-MM-DD}}"
tags:
  - 학습기록
description: 글의 핵심 내용을 한 문장으로 요약하세요
---

## 1. 배경과 문제

왜 이 주제를 다루게 되었는지 작성합니다.

## 2. 핵심 내용

주요 개념이나 문제를 설명합니다.

## 3. 직접 해본 것

실행 과정, 사용한 도구, 결과를 기록합니다.

## 4. 배운 점과 인사이트

새롭게 알게 된 점과 실무에 적용할 내용을 정리합니다.

## 5. 다음 액션

- [ ] 추가로 확인할 내용
- [ ] 실무에 적용할 내용

---

## 발행 전 체크리스트

- [ ] 제목과 본문을 검토했다.
- [ ] 회사·고객·개인 민감정보를 제거했다.
- [ ] 사실과 수치를 확인했다.
- [ ] 공개용 Quartz 파일에 복사할 준비가 됐다.
```

포인트 세 가지입니다.

- **`date` 값은 반드시 따옴표로 감쌉니다.** 따옴표 없이 `{{date:YYYY-MM-DD}}`를 쓰면 YAML이 이를 다른 형식으로 해석해서, Obsidian 속성 편집기가 `"{ date:YYYY-MM-DD }":`처럼 깨진 값으로 바꿔 버립니다. 템플릿은 소스 모드(`Ctrl + E`)에서 편집하는 것이 안전합니다.
- **태그는 공통 태그(`학습기록`)만** 넣어 두고, 글마다 `CRM`, `데이터분석`, `업무자동화`처럼 주제 태그를 추가합니다.
- **본문에 `# 제목`을 쓰지 않습니다.** Quartz가 `title` 값을 페이지 제목으로 쓰기 때문에 본문에 다시 쓰면 제목이 두 번 나옵니다.

## 3단계. Templates 플러그인 설정

1. Obsidian 왼쪽 아래 **설정(톱니바퀴)** → **코어 플러그인**에서 **Templates(템플릿)** 를 켭니다.
2. 설정 왼쪽 메뉴의 **Templates**에서 아래처럼 입력합니다.
   - **Template folder location:** `Blog Templates`
   - **Date format:** `YYYY-MM-DD`

## 4단계. 새 글 쓰기

1. `Blog Drafts` 폴더에서 새 노트를 만듭니다.
2. `Ctrl + P` → `Insert template`(템플릿 삽입) 검색 → **Blog Post Template** 선택
3. 양식이 들어오고 `date`에 오늘 날짜가 자동으로 채워집니다.

## 5단계. 발행하기

1. 발행 전 체크리스트를 확인합니다.
2. 글 파일을 Quartz 프로젝트의 알맞은 카테고리 폴더(예: `content/Study/`)로 **복사**합니다. 파일 탐색기로 복사해도 되고, PowerShell에서는 아래처럼 합니다. 경로는 내 보관함 위치에 맞게 바꿉니다.

```powershell
Copy-Item "$HOME\Documents\내보관함\Blog Drafts\새글.md" "$HOME\Documents\my-knowledge-blog\content\Study\새글.md"
```

3. 블로그 폴더로 이동해 미리 보기로 확인합니다.

```powershell
cd $HOME\Documents\my-knowledge-blog
npx quartz build --serve
```

4. 올립니다.

```powershell
git add content/Study/새글.md
git commit -m "Add 새 글 제목"
git push origin v5
```

1~2분 뒤 블로그에 반영됩니다.

---

## 다음 편

이제 직접 쓴 글을 발행할 수 있습니다. 다음 편에서는 Claude Code를 이용해 AI가 매주 뉴스를 찾아 글을 쓰고 자동으로 발행하도록 만듭니다.

- [[AI-Projects/obsidian-quartz-blog-3-ai-auto-publish|3편. Claude Code로 AI 뉴스 자동 발행하기]]
