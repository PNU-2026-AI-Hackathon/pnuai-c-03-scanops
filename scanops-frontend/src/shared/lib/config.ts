/**
 * App-level external URLs / config. Centralized so deployment changes touch
 * one place. See SETUP_TODO.md for what each requires.
 */

// 이미 생성된 ScanOps GitHub App (PR 자동 분석)
export const GITHUB_APP_SLUG = 'scanops-security-scanner'
export const GITHUB_APP_INSTALL_URL = `https://github.com/apps/${GITHUB_APP_SLUG}/installations/new`

// 배포 도메인 (참고용)
export const FRONTEND_URL = 'https://scanops-frontend.vercel.app'
export const BACKEND_URL = 'https://scanops-backend-production.up.railway.app'
