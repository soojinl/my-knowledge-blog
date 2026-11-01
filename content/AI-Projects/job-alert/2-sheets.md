---
title: "(2) 구글 시트에 쌓아 지원 현황 관리하기"
date: 2026-11-01
tags:
  - 업무자동화
  - 구글시트
  - AppsScript
  - GitHubActions
  - 채용
description: GitHub Actions가 찾은 채용 공고를 서비스 계정 없이 Apps Script 웹훅으로 구글 시트에 자동으로 쌓고, 시트에서 지원 여부를 관리하는 방법
---

[[AI-Projects/job-alert/1-notifier|앞선 글]]에서 채용 공고를 매일 아침 텔레그램으로 받게 만들었습니다. 그런데 알림은 읽고 나면 흘러가 버립니다. 어느 공고에 지원했는지, 어디까지 진행됐는지는 따로 적어야 했습니다.

그래서 알림 대상 공고를 구글 시트에 한 줄씩 자동으로 쌓게 했습니다. 시트에는 `지원여부` 열을 드롭다운으로 두고, 거기서 지원 현황을 관리합니다.

## 어떤 방식으로 연결할까

GitHub Actions에서 구글 시트에 쓰려면 보통 구글 클라우드에서 서비스 계정을 만들고, 키 파일을 받아서 시트에 공유해야 합니다. 설정 단계가 많습니다.

대신 **Apps Script 웹훅**을 썼습니다. 시트에 작은 스크립트를 붙이고 웹 앱으로 배포하면, 그 주소로 데이터를 보내면 시트에 한 줄씩 추가해 주는 구조입니다. 구글 클라우드 콘솔을 쓰지 않아도 되고, 5분 안에 끝납니다.

```
GitHub Actions ──(POST: 공고 목록 + 토큰)──▶ Apps Script 웹 앱 ──▶ 구글 시트
```

## 1. 시트와 스크립트 만들기

새 구글 시트를 만들고 **확장 프로그램 → Apps Script**를 엽니다. 기존 코드를 지우고 아래 코드를 붙여넣습니다.

```javascript
const TOKEN = '여기에-직접-정한-비밀문자열';
const SHEET = '공고';
const HEADERS = ['날짜', '점수', '회사', '공고', '링크', '회사규모', '직급', '연봉', '경력', '마감',
                 '지역', '트랙', '추천 이력서', '재무', '판단', '확인할 점', '출처', '지원여부', '메모'];
const STATUS = ['관심', '지원 예정', '지원 완료', '서류 합격', '면접', '최종 합격', '탈락', '패스'];

function doGet() {
  return out({ ok: true, msg: 'alive' });
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  if (body.token !== TOKEN) return out({ ok: false, error: 'token' });

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEET) || ss.insertSheet(SHEET);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sh.getRange('R2:R1000').setDataValidation(
      SpreadsheetApp.newDataValidation().requireValueInList(STATUS, true).build());
  }

  const last = sh.getLastRow();
  const links = new Set(last > 1 ? sh.getRange(2, 5, last - 1, 1).getValues().flat() : []);
  let added = 0;
  body.rows.forEach(r => {
    if (links.has(r[4])) return;   // 같은 링크는 두 번 쌓지 않음
    sh.appendRow(r);
    added++;
  });
  return out({ ok: true, added: added });
}

function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
```

핵심은 세 가지입니다.

- **토큰 확인:** 웹 앱 주소를 아는 누구나 시트에 쓸 수 있으니, 직접 정한 비밀 문자열이 맞을 때만 받습니다.
- **중복 방지:** 링크 열을 보고, 이미 있는 공고는 다시 쌓지 않습니다. 실수로 두 번 보내도 안전합니다.
- **지원여부 드롭다운:** 처음 시트를 만들 때 한 번만 설정합니다. 새 줄이 추가돼도 이 열은 비워 두기 때문에, 직접 골라서 관리할 수 있습니다.

`TOKEN`은 영문과 숫자로 15자 이상 직접 만든 값으로 바꾸세요. 예시를 그대로 쓰면 안 됩니다.

## 2. 웹 앱으로 배포하기

1. **배포 → 새 배포 → 톱니바퀴 → 웹 앱**을 고릅니다.
2. **실행 사용자**는 `나`, **액세스 권한이 있는 사용자**는 `모든 사용자`로 설정합니다.
3. 배포하면 `.../exec`로 끝나는 주소가 나옵니다. 이 주소를 복사합니다.

주소를 브라우저 시크릿 창에서 열었을 때 `{"ok":true,"msg":"alive"}`가 보이면 외부에서 접근할 수 있는 상태입니다. 이걸 확인하려고 `doGet`을 넣어 뒀습니다.

## 3. GitHub Secrets 등록하기

GitHub 저장소의 **Settings → Secrets and variables → Actions → Secrets**에 두 개를 등록합니다. 값은 **Secret 칸**에 넣고, Name 칸에는 이름만 적습니다.

| Name | Secret에 넣을 값 |
|---|---|
| `SHEETS_WEBHOOK_URL` | 복사한 웹 앱 주소 (`.../exec`) |
| `SHEETS_TOKEN` | 스크립트의 `TOKEN`과 같은 문자열 |

워크플로우 파일의 실행 단계에 이 두 값을 환경 변수로 넘겨 주면 됩니다.

```yaml
env:
  SHEETS_WEBHOOK_URL: ${{ secrets.SHEETS_WEBHOOK_URL }}
  SHEETS_TOKEN: ${{ secrets.SHEETS_TOKEN }}
```

## 4. 파이썬에서 보내기

알림 대상 공고를 한 줄씩의 목록으로 만들어서 웹 앱 주소로 POST합니다.

```python
r = requests.post(url, json={"token": token, "rows": rows}, timeout=60)
data = r.json()
if not data.get("ok"):
    raise RuntimeError(f"시트가 거절함 {data}")
```

시트 기록이 실패해도 텔레그램 알림은 그대로 가야 하므로, 이 호출은 `try/except`로 감쌌습니다. 그리고 실패하면 보내지 못한 공고를 파일에 보관해 두었다가 다음 실행 때 다시 보냅니다. 중복 방지가 있어서 다시 보내도 같은 줄이 두 번 생기지 않습니다.

## 자주 하는 실수 두 가지

### 코드를 고친 뒤 "새 버전"으로 배포하지 않기

Apps Script에서 코드를 고치고 저장만 하면, 웹 앱은 **이전에 배포한 버전**의 코드를 계속 실행합니다. 토큰을 바꾸거나 코드를 고쳤는데도 같은 오류가 난다면 이것부터 의심하세요. **배포 → 배포 관리 → 연필 아이콘 → 버전: 새 버전 → 배포**를 해야 반영됩니다.

### 토큰이 다르면 오류 없이 조용히 거절된다

스크립트의 `TOKEN`과 GitHub의 `SHEETS_TOKEN`이 한 글자라도 다르면, 웹 앱은 HTTP 오류가 아니라 정상 응답으로 `{"ok":false,"error":"token"}`을 돌려줍니다. 그래서 `raise_for_status()`만으로는 실패를 알아챌 수 없습니다. 응답 본문의 `ok` 값까지 확인해야 합니다. 값을 붙여넣을 때 앞뒤 공백이나 따옴표가 같이 들어가지 않았는지도 확인하세요.

참고로 `401` 오류가 나면 토큰 문제가 아니라, 배포할 때 액세스 권한이 `모든 사용자`가 아니라는 뜻입니다.

## 정리

- 서비스 계정 없이도 Apps Script 웹훅으로 GitHub Actions에서 구글 시트에 쓸 수 있습니다.
- 토큰으로 아무나 쓰지 못하게 막고, 링크로 중복을 막았습니다.
- `지원여부` 드롭다운 덕분에 알림 확인부터 지원 현황 관리까지 한 시트에서 끝납니다.

## 관련

- [[AI-Projects/job-alert/1-notifier|(1) 텔레그램으로 채용 공고 받기]]
