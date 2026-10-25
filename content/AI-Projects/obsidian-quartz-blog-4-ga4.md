---
title: "Obsidian + Quartz 블로그 만들기 (4) Google Analytics 4 설치하기"
date: 2026-10-25
tags:
  - Quartz
  - GA4
  - 데이터분석
description: Quartz 블로그에 Google Analytics 4를 설치하고, 데이터가 제대로 들어오는지 확인하는 방법
---

블로그에 누가, 어떤 글을 읽는지 보려면 방문 데이터를 모아야 합니다. 이번 편에서는 Quartz 블로그에 **Google Analytics 4(GA4)** 를 설치하고, 데이터가 제대로 들어오는지 확인하는 방법을 정리합니다.

- [[AI-Projects/obsidian-quartz-blog-1-quartz-setup|1편. Quartz 설치와 GitHub Pages 배포]]
- [[AI-Projects/obsidian-quartz-blog-2-obsidian-workflow|2편. Obsidian에서 글 쓰고 발행하기]]
- [[AI-Projects/obsidian-quartz-blog-3-ai-auto-publish|3편. Claude Code로 AI 뉴스 자동 발행하기]]
- **4편. Google Analytics 4 설치하기** (이 글)

## 준비물

- 1편에서 만든 Quartz 블로그
- 구글 계정

---

## 1단계. GA4 속성과 데이터 스트림 만들기

1. [analytics.google.com](https://analytics.google.com)에 구글 계정으로 로그인합니다.
2. 처음이라면 **측정 시작**을 누르고 계정 이름을 입력합니다. 이미 GA 계정이 있다면 왼쪽 아래 **관리(톱니바퀴)** → **+ 만들기 → 속성**을 누릅니다.
3. **속성 만들기**
   - 속성 이름: 블로그 이름
   - 보고 시간대: **대한민국**
   - 통화: **대한민국 원(₩)**
4. 업종과 규모는 아무거나 고르고, 목표는 **트래픽 및 사용자 행동 파악**을 고릅니다.
5. 플랫폼에서 **웹**을 고르고 블로그 주소를 입력합니다.
   - 웹사이트 URL: `https://내아이디.github.io/my-knowledge-blog/`
   - 스트림 이름: 블로그 이름
6. **스트림 만들기**를 누르면 `G-XXXXXXXXXX` 형태의 **측정 ID**가 나옵니다. 이 값을 복사해 둡니다.

"Google 태그 설치" 안내 화면이 나오면 **건너뛰어도 됩니다.** 코드는 다음 단계에서 Quartz 설정으로 넣습니다.

## 2단계. Quartz에 측정 ID 넣기

`quartz.config.yaml`을 열고 `analytics` 항목을 아래처럼 바꿉니다. Quartz 기본 설정에는 `provider: plausible`이 들어 있는데, 이것을 대체하면 됩니다.

```yaml
configuration:
  analytics:
    provider: google
    tagId: G-XXXXXXXXXX   # 1단계에서 복사한 측정 ID
```

**GA4가 알려 주는 코드를 직접 붙여 넣지 않는 이유**

GA4 화면은 `<script>`로 시작하는 코드를 페이지에 붙여 넣으라고 안내합니다. 하지만 Quartz는 페이지를 넘길 때 새로 불러오지 않고 내용만 바꾸는 방식(SPA)이라, 그 코드를 그대로 붙이면 **첫 페이지만 조회수로 잡히고 이후에 넘긴 글은 잡히지 않습니다.** Quartz의 `analytics` 설정을 쓰면 글을 옮겨 다닐 때마다 조회수가 따로 기록되도록 처리해 줍니다.

## 3단계. 올리기

```powershell
git add quartz.config.yaml
git commit -m "Add Google Analytics 4"
git push origin v5
```

GitHub Actions 배포가 끝나면(1~2분) 블로그에 GA4가 적용됩니다.

## 4단계. 데이터가 들어오는지 확인하기

1. 블로그를 열고 글을 두세 개 눌러 봅니다.
2. GA4에서 **보고서 → 실시간**으로 갑니다.
3. 1~2분 안에 "지난 30분 동안의 활성 사용자"가 1명 이상이 되면 정상입니다.

일반 보고서(사용자 수, 페이지별 조회수)는 반영까지 하루 정도 걸립니다.

### 실시간 보고서가 0명이라면

설치가 잘못된 게 아닐 수도 있습니다. 아래를 차례로 확인합니다.

1. **속성 확인:** GA4 왼쪽 위 속성 이름과 측정 ID가 블로그에 넣은 값과 같은지 확인합니다. GA 계정 안에 속성이 여러 개면 헷갈리기 쉽습니다.
2. **브라우저 차단 확인:** 광고 차단 확장 프로그램이나 브라우저의 추적 방지 기능(Edge의 "엄격" 모드, Brave 등)이 GA4를 막을 수 있습니다. 차단 기능을 끄거나, 다른 브라우저나 휴대폰으로 접속해 봅니다.
3. **설치 여부 직접 확인:** 블로그에서 `F12`로 개발자 도구를 열고 **Network(네트워크)** 탭에서 `collect`를 검색합니다. 글을 넘길 때마다 `google-analytics.com/g/collect` 요청이 보이면 GA4로 데이터가 전송되고 있는 것입니다.
4. **자동화 브라우저는 제외됨:** 테스트 도구나 자동화 브라우저로 접속하면 GA4가 봇으로 판단해 집계하지 않습니다. 확인은 일반 브라우저로 합니다.

## 5단계. 내 방문 제외하기 (선택)

글을 쓰면서 내 블로그를 자주 열면 내 방문이 통계에 섞입니다. 내 IP를 제외할 수 있습니다.

**① 내 IP 확인**

구글에서 "내 IP"를 검색하면 `123.45.67.89` 같은 형식으로 나옵니다.

**② 내부 트래픽 정의**

1. **관리 → 데이터 수집 및 수정 → 데이터 스트림**에서 블로그 웹 스트림을 누릅니다.
2. 화면 **맨 아래**의 **태그 설정 구성(Configure tag settings)** 을 누릅니다.
3. **설정** 영역에서 **모두 표시**를 누르고 **내부 트래픽 정의**를 선택합니다.
4. **만들기**를 누르고 아래처럼 입력합니다.
   - 규칙 이름: 내 IP
   - traffic_type 값: `internal` (기본값)
   - 일치 유형: **IP 주소가 다음과 같음**
   - 값: ①에서 확인한 IP

**③ 필터 켜기**

1. **관리 → 데이터 수집 및 수정 → 데이터 필터**로 갑니다.
2. **Internal Traffic** 필터의 상태를 **테스트**에서 **활성**으로 바꿉니다.

필터를 켜면 내 방문이 실시간 보고서에서도 보이지 않습니다. 그래서 **4단계에서 설치를 확인한 뒤에** 켜는 것이 좋습니다. 휴대폰 데이터나 다른 와이파이로 접속하면 IP가 달라서 내 방문도 집계됩니다.

---

## 마무리

이제 블로그에 어떤 글이 많이 읽히는지, 방문자가 어디서 들어오는지 GA4에서 볼 수 있습니다. 데이터가 며칠 쌓이면 **보고서 → 참여도 → 페이지 및 화면**에서 글별 조회수를 확인해 보세요.

- [[AI-Projects/obsidian-quartz-blog-1-quartz-setup|1편. Quartz 설치와 GitHub Pages 배포]]
- [[AI-Projects/obsidian-quartz-blog-2-obsidian-workflow|2편. Obsidian에서 글 쓰고 발행하기]]
- [[AI-Projects/obsidian-quartz-blog-3-ai-auto-publish|3편. Claude Code로 AI 뉴스 자동 발행하기]]
