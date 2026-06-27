# ScanOps Frontend — 직접 해야 할 일 (Manual Setup)

V3 프론트엔드는 **목 데이터 + 목 인증**으로 전 화면이 동작합니다. 실제 서비스로
연결할 때 직접 발급/설정해야 하는 것만 정리했습니다.

배포 도메인 (현재):
- 프론트: `https://scanops-frontend.vercel.app` (Vercel)
- 백엔드: `https://scanops-backend-production.up.railway.app` (Railway)

---

## 1. 백엔드 API 연결
- **Vercel 환경변수**에 `VITE_API_BASE_URL=https://scanops-backend-production.up.railway.app` 설정.
  (로컬 기본값은 `http://localhost:8080`.)
- 목 데이터 접근자는 `src/shared/lib/mock.ts`에 모여 있습니다. 실제 엔드포인트가
  생기면 이 함수들(`fetchScans`, `fetchReport`, `fetchUsage`, `fetchGitHubRepos`,
  `fetchTeam`)의 본문을 `shared/api/httpClient`의 `http()` 호출로 교체하세요.
  **반환 타입이 곧 백엔드 계약**입니다.

## 2. GitHub 로그인 (OAuth App) — ⚠️ 토큰 발급 필요
GitHub Settings → Developer settings → **OAuth Apps → New OAuth App**
- **Authorization callback URL은 백엔드로** 지정하세요. Client Secret은 서버에만 있어야 하므로
  code↔token 교환은 백엔드가 합니다. (프론트에 Secret을 두면 안 됩니다.)
  - Spring Security OAuth2 기본 경로면:
    `https://scanops-backend-production.up.railway.app/login/oauth2/code/github`
  - 커스텀 라우트를 쓰면 그 경로로.
- 흐름: 프론트 "GitHub로 계속하기" → `github.com/login/oauth/authorize?client_id=...`로 이동
  → GitHub가 **백엔드 콜백**으로 리다이렉트 → 백엔드가 토큰 교환·세션(JWT/쿠키) 발급
  → 브라우저를 프론트(`/auth/github/callback` 또는 `/dashboard`)로 리다이렉트.
- 발급한 **Client ID / Client Secret**은 백엔드 환경변수에 보관.
- 프론트 측 연결 지점: `src/shared/lib/auth.tsx`의 `completeGitHub()`와
  `src/pages/auth-callback/ui/GitHubCallbackPage.tsx`(현재는 왕복을 흉내만 냄). 실제로는
  콜백에서 백엔드가 내려준 세션을 확정하는 코드로 바꾸면 됩니다.
- Homepage URL은 `https://scanops-frontend.vercel.app`.

## 3. GitHub App (PR 자동 분석) — ✅ 이미 생성됨, 설정만
앱은 이미 만들어 두셨습니다: **`scanops-security-scanner`**
(`https://github.com/apps/scanops-security-scanner`).
- 프론트의 "App 설치" 버튼은 설치 URL
  `https://github.com/apps/scanops-security-scanner/installations/new`로 이미 연결됨
  (`src/shared/lib/config.ts`).
- 남은 설정(앱 콘솔에서): **Webhook URL**을 백엔드로 지정
  (`https://scanops-backend-production.up.railway.app/<webhook 경로>`), Webhook Secret 설정,
  권한 — Repository contents(read), Pull requests(read/write), Checks(write).
- 설치 후 백엔드가 installation token으로 PR 코멘트·체크 상태를 작성합니다.

## 4. 도메인 소유권 인증 (DAST) — ⚠️ 백엔드/스캐너 구현
설계한 **파일 업로드(.well-known) 방식**대로 백엔드가 처리합니다. 프론트의 "소유권 인증 완료"
표시(`ScanForm`)는 현재 정적 목업이며, 인증 API가 생기면 연결하세요.
1. 도메인 인증 요청 → ScanOps가 랜덤 토큰 발급
2. 사용자가 `https://<도메인>/.well-known/scanops-verify.txt`에 토큰을 넣어 배포
3. **매 스캔 직전** 백엔드가 그 URL을 fetch → 토큰 존재·일치·만료 확인
4. 통과 시 해당 호스트만 ZAP 스캔(서브도메인 제외), 불일치·만료 시 재인증 요구
- 참고: ZAP은 기본적으로 비로그인 공개 페이지만 스캔 → 로그인 후 페이지는 ZAP 세션/인증 설정 별도,
  큰 사이트는 scan policy 조정(불필요 공격 룰 off)으로 시간 단축.

## 5. 결제 (PG) — ⏸️ 보류
사업자등록이 필요해 당장은 보류. `src/pages/checkout/ui/CheckoutPage.tsx`는 목 결제 상태로
유지됩니다. 나중에 토스페이먼츠/포트원 등 PG 위젯으로 교체하세요.

---

## 이미 처리된 것 (할 일 아님)
- **폰트**: Pretendard 적용 완료 (`index.html`의 jsdelivr CDN). 별도 작업 불필요.
- **GitHub App 생성**: `scanops-security-scanner` 생성 완료(위 3번은 설정만).

## 참고: 구조
- 컴포넌트 `src/shared/ui/` · 아이콘 전부 [Feather](https://feathericons.com)(`Icon.tsx`)
- 외부 URL/상수 `src/shared/lib/config.ts`
- 인증/세션 `src/shared/lib/auth.tsx`(localStorage 목) · `ProtectedRoute`
- 목 데이터 단일 소스 `src/shared/lib/mock.ts` · 라우트 `src/app/router.tsx`
- 데모: 아무 이메일/비번이나 입력하면 로그인됨(목). GitHub 버튼도 즉시 연결됨.
