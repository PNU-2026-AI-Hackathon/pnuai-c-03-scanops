/**
 * App-level external URLs / config. Centralized so deployment changes touch
 * one place. See SETUP_TODO.md for what each requires.
 */

// 이미 생성된 ScanOps GitHub App (PR 자동 분석)
export const GITHUB_APP_SLUG = 'scanops-security-scanner'
export const GITHUB_APP_INSTALL_URL = `https://github.com/apps/${GITHUB_APP_SLUG}/installations/new`

// 배포 도메인 (참고용)
export const FRONTEND_URL = 'https://scanops-frontend.vercel.app'
export const BACKEND_URL = 'https://scanops-backend.kr'

// 백엔드 API 베이스 (env 우선, 없으면 로컬)
export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
// GitHub OAuth 로그인 시작점 — Spring Security 기본 authorization 엔드포인트.
// 여기로 이동하면 GitHub 동의 → 백엔드 콜백(/login/oauth2/code/github) → 프론트로 토큰 리다이렉트.
export const GITHUB_AUTHORIZE_URL = `${API_BASE}/oauth2/authorization/github`
