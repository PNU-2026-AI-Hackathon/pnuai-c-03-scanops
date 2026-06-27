# ScanOps Frontend — 직접 해야 할 일 (Manual Setup)

V3 프론트엔드는 **목 데이터 + 목 인증**으로 전 화면이 동작합니다. 실제 서비스로
연결하려면 아래 항목만 직접 발급/설정하면 됩니다. (코드 구조는 이미 다 준비됨)

## 1. 백엔드 API 연결
- `.env`에 `VITE_API_BASE_URL=https://api.scanops...` 설정 (기본값 `http://localhost:8080`).
- 목 데이터 접근자는 `src/shared/lib/mock.ts`에 모여 있습니다. 실제 엔드포인트가
  생기면 이 함수들(`fetchScans`, `fetchReport`, `fetchUsage`, `fetchGitHubRepos`,
  `fetchTeam`)의 본문을 `shared/api/httpClient`의 `http()` 호출로 교체하세요.
  **반환 타입(시그니처)이 곧 백엔드 계약**입니다.

## 2. GitHub 로그인 (OAuth App) — ⚠️ 토큰 필요
GitHub Settings → Developer settings → **OAuth Apps → New OAuth App**
- Authorization callback URL: `https://<도메인>/auth/github/callback`
- 발급된 **Client ID / Client Secret**를 백엔드 환경변수로 보관(시크릿은 절대 프론트에 두지 말 것).
- 현재 `src/shared/lib/auth.tsx`의 `completeGitHub()`와
  `src/pages/auth-callback/ui/GitHubCallbackPage.tsx`가 OAuth 왕복을 **흉내**만 냅니다.
  실제로는 ① 로그인 버튼 → `https://github.com/login/oauth/authorize?client_id=...`로 이동,
  ② 콜백에서 `?code=`를 백엔드로 보내 토큰 교환, 으로 바꾸면 됩니다.

## 3. GitHub App (PR 자동 분석) — ⚠️ 앱 생성 필요
GitHub Settings → Developer settings → **GitHub Apps → New GitHub App**
- 권한: Repository contents(read), Pull requests(read/write), Checks(write).
- Webhook URL을 백엔드로 설정. 설치 URL(`https://github.com/apps/<앱이름>/installations/new`)을
  `IntegrationsPage`의 "App 설치" 버튼과 `ScanForm`의 Actions 탭 CTA에 연결하세요.

## 4. 도메인 소유권 인증 (DAST) — ⚠️ DNS 설정
- 웹사이트 스캔은 소유권 확인이 필요합니다. 백엔드가 발급하는 **DNS TXT 레코드**(또는
  파일 업로드) 값을 사용자가 자기 도메인에 등록 → 백엔드가 검증.
- 현재 `ScanForm`의 "소유권 인증 완료"는 정적 목업입니다. 검증 API가 생기면 연결하세요.

## 5. 결제 (PG) — ⚠️ 가맹점 계약 필요
- `src/pages/checkout/ui/CheckoutPage.tsx`는 목 결제입니다. 토스페이먼츠/포트원 등
  PG SDK 키를 발급받아 결제 위젯으로 교체하세요. 영수증/구독 관리도 PG 웹훅과 연동.

## 6. 폰트 (선택)
- 현재 `Pretendard` 폴백 스택 사용. 더 토스에 가깝게 하려면 `Pretendard` 웹폰트를
  `index.html`에 추가하면 됩니다(라이선스 확인).

---

## 참고: 구조
- **컴포넌트**: `src/shared/ui/` (Icon=Feather, Button, Input, Card, Badge, Checkbox,
  Toggle, Avatar, Modal, ProgressBar, Segmented, Toast, AppNav, Logo)
- **아이콘**: 전부 [Feather](https://feathericons.com) — `Icon.tsx`의 `PATHS`에 추가하면 새 아이콘 사용 가능.
- **인증/세션**: `src/shared/lib/auth.tsx` (localStorage 목). `ProtectedRoute`가 비로그인 차단.
- **목 데이터**: `src/shared/lib/mock.ts` (단일 소스).
- **라우트**: `src/app/router.tsx`.
- 데모 로그인: 아무 이메일/비번이나 입력하면 로그인됩니다(목). GitHub 버튼도 즉시 연결됨.
