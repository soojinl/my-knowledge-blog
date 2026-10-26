---
title: "(1) Quartz 설치와 GitHub Pages 배포"
date: 2026-10-25
tags:
  - Quartz
  - 업무자동화
description: 마크다운 파일을 무료 웹사이트로 바꿔 주는 Quartz를 설치하고, GitHub Pages로 자동 배포되는 블로그를 만드는 방법
---

Obsidian에서 쓴 글을 무료로 웹에 발행하고, 매주 AI 뉴스는 AI가 알아서 써서 올리는 블로그를 만드는 과정을 4편으로 정리했습니다. 이 글만 보고 그대로 따라 할 수 있도록 순서대로 적었습니다.

- **1편. Quartz 설치와 GitHub Pages 배포** (이 글)
- [[AI-Projects/obsidian-quartz-blog/2-obsidian-workflow|2편. Obsidian에서 글 쓰고 발행하기]]
- [[AI-Projects/obsidian-quartz-blog/3-ai-auto-publish|3편. Claude Code로 AI 뉴스 자동 발행하기]]
- [[AI-Projects/obsidian-quartz-blog/4-ga4|4편. Google Analytics 4 설치하기]]

## 완성된 구조

| 구성 요소 | 역할 |
|---|---|
| **Obsidian** | 글 초안을 쓰고 다듬는 곳 (비공개) |
| **Quartz** | 마크다운 파일을 웹사이트로 바꿔 주는 도구 |
| **GitHub** | 블로그 파일 저장소 + GitHub Pages로 무료 호스팅 |
| **GitHub Actions** | 파일을 올리면 자동으로 사이트를 빌드·배포 |
| **Claude Code 루틴** | 정해진 시간마다 AI 뉴스를 찾아 글을 쓰고 자동 발행 |

글이 공개되기까지의 흐름은 이렇습니다.

```
Obsidian 초안 작성 → 검토 → Quartz content 폴더로 복사 → git push → GitHub Actions 빌드 → 블로그 공개
```

이번 1편에서는 Quartz 블로그를 만들고 인터넷에 공개하는 데까지 진행합니다.

## 준비물

- GitHub 계정
- [Node.js](https://nodejs.org/) 22 이상
- [Git](https://git-scm.com/)

설치 확인은 터미널(PowerShell)에서 합니다.

```powershell
node -v
git -v
```

Git을 처음 쓴다면 커밋에 남길 이름과 이메일을 한 번 설정해 둡니다. 설정하지 않으면 나중에 커밋할 때 오류가 납니다.

```powershell
git config --global user.name "내 이름"
git config --global user.email "내이메일@example.com"
```

---

## 1단계. Quartz 내려받기

블로그 파일을 둘 폴더(예: `Documents`)로 이동한 뒤 Quartz v5를 내려받습니다.

```powershell
cd $HOME\Documents
git clone -b v5 https://github.com/jackyzha0/quartz.git my-knowledge-blog
cd my-knowledge-blog
npm install
```

`my-knowledge-blog`는 폴더 이름이자 나중에 GitHub 저장소 이름이 됩니다. 원하는 이름으로 바꿔도 됩니다.

## 2단계. 내 GitHub 저장소에 연결하기

1. GitHub에서 **New repository**를 누르고 이름을 `my-knowledge-blog`로 만듭니다. README 등은 추가하지 않고 빈 저장소로 만듭니다.
2. 내려받은 Quartz가 원본 저장소가 아니라 내 저장소를 바라보도록 바꿉니다.

```powershell
git remote set-url origin https://github.com/내아이디/my-knowledge-blog.git
git push -u origin v5
```

처음 push할 때 GitHub 로그인 창이 뜨면 로그인해서 승인합니다. 이제부터 작업 브랜치는 `v5`입니다.

## 3단계. 블로그 기본 설정

프로젝트 루트의 `quartz.config.yaml`을 열고 아래 세 항목을 바꿉니다.

```yaml
configuration:
  pageTitle: 내 블로그 이름
  locale: ko-KR                                  # 한국어 날짜·문구
  baseUrl: 내아이디.github.io/my-knowledge-blog  # 블로그 주소 (https:// 없이)
```

외부 링크를 새 창으로 열고 싶다면, 같은 파일의 `crawl-links` 플러그인 설정에 한 줄을 추가합니다.

```yaml
  - source: "@quartz-community/crawl-links"
    enabled: true
    options:
      markdownLinkResolution: shortest
      openLinksInNewTab: true    # 추가
```

## 4단계. 홈 화면 만들기

`content/index.md`가 블로그 첫 화면입니다. 아래처럼 작성합니다.

```markdown
---
title: 내 블로그 이름
---

# 내 블로그 이름

블로그 소개 문구를 적습니다.
```

## 5단계. 카테고리 폴더 만들기

Quartz는 `content` 아래 **폴더가 곧 카테고리**입니다. 폴더마다 `index.md`를 넣으면 카테고리 소개 페이지가 됩니다.

```
content/
├── index.md              # 홈
├── AI-News/index.md      # AI 주간 뉴스
├── Study/index.md        # 학습 기록
└── Projects/index.md     # 프로젝트 기록
```

폴더는 블로그 폴더에서 아래 명령으로 만듭니다.

```powershell
New-Item -ItemType Directory -Force content\AI-News, content\Study, content\Projects
```

그다음 폴더마다 `index.md` 파일을 만듭니다. 메모장으로 열면 새 파일을 만들지 묻는데, **예**를 누르고 내용을 붙여 넣은 뒤 저장합니다.

```powershell
notepad content\AI-News\index.md
```

`content\AI-News\index.md` 예시입니다. 나머지 폴더도 제목과 설명만 바꿔 똑같이 만듭니다.

```markdown
---
title: AI 주간 뉴스
description: 매주 AI 분야 주요 뉴스 정리
---

# AI 주간 뉴스

매주 AI 분야에서 중요한 뉴스를 골라 정리합니다.
```

폴더 이름은 영어로 하는 것을 권합니다. 폴더 이름이 그대로 주소(URL)가 되기 때문입니다. 화면에 보이는 이름은 `title`에 한글로 적으면 됩니다.

## 6단계. 내 컴퓨터에서 미리 보기

```powershell
npx quartz build --serve
```

브라우저에서 `http://localhost:8080`을 열면 블로그를 미리 볼 수 있습니다. 끌 때는 터미널에서 `Ctrl + C`를 누릅니다.

## 7단계. GitHub Pages 자동 배포 설정

push할 때마다 자동으로 사이트가 갱신되도록 GitHub Actions를 설정합니다.

**① 배포 파일 만들기**

`.github/workflows/deploy.yaml` 파일을 만들고 아래 내용을 넣습니다. 블로그 폴더에서 아래 명령으로 메모장을 열어 붙여 넣고 저장하면 됩니다.

```powershell
New-Item -ItemType Directory -Force .github\workflows
notepad .github\workflows\deploy.yaml
```

```yaml
name: Deploy Quartz to GitHub Pages

on:
  push:
    branches:
      - v5
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build Quartz
        run: npx quartz build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: public

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**② GitHub Pages 켜기**

GitHub 저장소에서 **Settings → Pages**로 이동해 **Source**를 **GitHub Actions**로 선택합니다.

**③ 올리기**

```powershell
git add .
git commit -m "Add blog homepage and deploy workflow"
git push origin v5
```

저장소의 **Actions** 탭에서 배포가 끝나면(보통 1~2분) `https://내아이디.github.io/my-knowledge-blog/`에서 블로그가 열립니다.

---

## 다음 편

블로그가 인터넷에 공개됐습니다. 다음 편에서는 Obsidian에서 글을 쓰고, 검토한 글만 블로그로 발행하는 방법을 정리합니다.

- [[AI-Projects/obsidian-quartz-blog/2-obsidian-workflow|2편. Obsidian에서 글 쓰고 발행하기]]
