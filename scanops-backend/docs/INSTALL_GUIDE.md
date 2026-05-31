# ScanOps 설치 가이드

PR을 올리면 자동으로 보안 취약점을 분석해주는 GitHub App입니다.

---

## 동작 방식

```
PR 오픈 / 커밋 push
       ↓
GitHub → ScanOps Webhook 전송
       ↓
보안 분석 시작 → PR에 "ScanOps 보안 분석 중..." 상태 표시
       ↓
분석 완료 → 파일별 인라인 댓글 + 요약 테이블 작성
       ↓
PR 상태 업데이트 (취약점 없음 / 취약점 N개 발견)
```

---

## Step 1 — GitHub App 설치

아래 링크에서 ScanOps Security Scanner를 설치합니다.

**[→ GitHub App 설치 페이지](https://github.com/apps/scanops-security-scanner)**

1. **Install** 클릭
2. 설치할 계정(개인/조직) 선택
3. **Repository access** 설정
   - `All repositories` — 해당 계정의 모든 레포에 적용
   - `Only select repositories` — 특정 레포만 선택 (권장)
4. **Install & Authorize** 클릭

> 필요 권한: `Contents: Read-only`, `Commit statuses: Read & write`, `Pull requests: Read & write`

---

## Step 2 — 확인

설치가 완료되면 해당 레포에서 PR을 올릴 때 자동으로 분석이 시작됩니다.

### 정상 동작 확인 방법

1. 레포에서 브랜치를 하나 만들고 PR을 오픈합니다.
2. PR Checks 섹션에 아래가 표시되면 정상입니다:

```
● scanops/security    Waiting for status to be reported — ScanOps 보안 분석 중...
```

3. 1~2분 후 분석이 완료되면:
   - 파일별로 취약점 인라인 댓글이 달립니다.
   - PR 하단에 전체 요약 테이블이 추가됩니다.
   - Checks 상태가 업데이트됩니다.

---

## 분석 결과 읽는 법

### 요약 테이블

```
## 🔍 ScanOps 보안 스캔 결과

> **3개 취약점 발견** | 분석 파일: 2개

| 심각도 | 파일 | 취약점 유형 | 위치 |
|--------|------|------------|------|
| 🔴 HIGH | src/Component/Card.tsx | XSS (CWE-79) | 42번째 줄 |
| 🔴 CRITICAL | src/Component/Card.tsx | Code Injection (CWE-95) | 44번째 줄 |
| 🔴 HIGH | src/Component/Card.tsx | SSRF (CWE-918) | 47번째 줄 |
```

### 인라인 댓글

각 취약점마다 해당 코드 줄에 댓글이 달립니다:

```
⚠️ [ScanOps] Cross-Site Scripting (XSS, CWE-79)
파일: src/Component/Card.tsx | 심각도: HIGH
CVSS Score: 7.5
위치: 42번째 줄

공격 시나리오:
공격자가 악성 스크립트를 주입해 다른 사용자의 세션·쿠키를 탈취할 수 있습니다.

수정 방법:
DOMPurify로 HTML을 새니타이즈하거나 textContent를 사용하세요.

관련 CVE:
- CVE-2021-44228 (HIGH, CWE-79)
```

---

## 지원 언어

| 언어 | 확장자 |
|------|--------|
| JavaScript / TypeScript | `.js` `.ts` `.jsx` `.tsx` |
| Java | `.java` |
| Kotlin | `.kt` |
| Python | `.py` |
| Go | `.go` |
| Rust | `.rs` |
| C / C++ | `.c` `.cpp` |
| PHP | `.php` |
| Ruby | `.rb` |

---

## 자주 묻는 질문

**Q. 분석이 시작됐는데 댓글이 안 달려요.**

PR의 변경 파일이 위 지원 언어에 해당하지 않으면 "분석 대상 파일 없음"으로 처리됩니다. (마크다운, JSON, YAML 등은 분석 대상이 아닙니다.)

**Q. 취약점이 아닌데 잡혔어요 (오탐).**

ScanOps는 AI 모델 + 규칙 기반 분석을 병행합니다. 의심되는 오탐은 PR 댓글에서 "Resolve conversation"으로 닫아두시면 됩니다.

**Q. 분석에 얼마나 걸려요?**

파일 수와 크기에 따라 다르지만 일반적으로 **1~3분** 이내입니다.

**Q. 특정 레포에서 앱을 제거하고 싶어요.**

GitHub → Settings → Applications → **ScanOps Security Scanner** → Configure → 해당 레포 제거

---

## 문의

- GitHub: [26Graduation/scanops-backend](https://github.com/26Graduation/scanops-backend)
- 프론트엔드 대시보드: [scanops-frontend.vercel.app](https://scanops-frontend.vercel.app)
