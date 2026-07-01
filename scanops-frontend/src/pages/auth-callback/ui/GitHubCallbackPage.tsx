import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Logo from '../../../shared/ui/Logo'
import Icon from '../../../shared/ui/Icon'
import { useAuth } from '../../../shared/lib/auth'

/**
 * Mock GitHub OAuth callback. In production GitHub redirects here with `?code=`,
 * which the backend exchanges for a token. Here we simulate that handshake.
 * Manual setup needed for real OAuth — see README "직접 해야 할 일".
 */
export default function GitHubCallbackPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { loginWithToken, completeGitHub } = useAuth()
  const [phase, setPhase] = useState<'connecting' | 'done' | 'error'>('connecting')
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true
    const token = new URLSearchParams(location.search).get('token')
    // 실제 OAuth: 백엔드가 토큰을 붙여 리다이렉트. 토큰 없으면 로컬 데모용 목 폴백.
    const flow = token ? loginWithToken(token) : completeGitHub('octocat').then(() => {})
    flow
      .then(() => {
        setPhase('done')
        setTimeout(() => navigate('/dashboard', { replace: true }), 650)
      })
      .catch(() => setPhase('error'))
  }, [loginWithToken, completeGitHub, navigate, location.search])

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="h-18 flex items-center px-6 sm:px-10 py-5">
        <Logo />
      </header>
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="flex flex-col items-center text-center fade-up">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-12 h-12 rounded-2xl bg-ink text-white flex items-center justify-center">
              <Icon name="github" size={24} />
            </span>
            <Icon name={phase === 'error' ? 'x' : 'arrow-right'} size={18} className="text-ink-faint" />
            <span className="w-12 h-12 rounded-2xl bg-brand-soft text-brand flex items-center justify-center">
              <Icon name="shield" size={24} />
            </span>
          </div>
          {phase === 'connecting' && (
            <>
              <div className="flex items-center gap-2.5 text-ink">
                <span className="w-5 h-5 rounded-full border-2 border-line border-t-brand spin" />
                <p className="text-[17px] font-semibold">GitHub와 연결하는 중…</p>
              </div>
              <p className="mt-2 text-sm text-ink-muted">권한을 확인하고 계정을 안전하게 연결하고 있어요.</p>
            </>
          )}
          {phase === 'done' && (
            <>
              <p className="text-[17px] font-semibold text-ink flex items-center gap-2">
                <span className="text-success"><Icon name="check-circle" size={20} /></span> 연결 완료
              </p>
              <p className="mt-2 text-sm text-ink-muted">잠시 후 이동합니다…</p>
            </>
          )}
          {phase === 'error' && (
            <>
              <p className="text-[17px] font-semibold text-ink">연결에 실패했어요</p>
              <button onClick={() => navigate('/login')} className="mt-4 text-brand font-semibold text-sm hover:underline">
                다시 시도하기
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
