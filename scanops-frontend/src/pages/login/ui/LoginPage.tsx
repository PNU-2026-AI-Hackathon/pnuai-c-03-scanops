import { useNavigate } from 'react-router-dom'
import Logo from '../../../shared/ui/Logo'

export default function LoginPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="h-18 flex items-center px-10 py-5">
        <Logo onClick={() => navigate('/')} />
      </header>

      <main className="flex-1 flex items-start justify-center px-6">
        <div className="w-full max-w-[400px] mt-16 flex flex-col items-center">
          <h1 className="text-[26px] font-bold text-ink tracking-tight">다시 만나서 반가워요</h1>
          <p className="mt-1.5 text-[15px] text-ink-muted">ScanOps 계정으로 로그인하세요</p>

          <form
            className="w-full mt-8 flex flex-col"
            onSubmit={(e) => {
              e.preventDefault()
              navigate('/scan')
            }}
          >
            <Field label="이메일" type="email" placeholder="you@example.com" />
            <div className="h-4" />
            <Field label="비밀번호" type="password" placeholder="••••••••" />

            <button
              type="button"
              className="self-end mt-2.5 text-[13px] text-ink-muted font-medium hover:text-ink-sub"
            >
              비밀번호를 잊으셨나요?
            </button>

            <button
              type="submit"
              className="mt-5 h-[52px] rounded-xl bg-brand text-white font-semibold text-[15px] hover:bg-brand-hover transition-colors"
            >
              로그인
            </button>
            <button
              type="button"
              className="mt-3 h-[52px] rounded-xl bg-ink text-white font-semibold text-[15px] hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <GitHubMark />
              GitHub로 계속하기
            </button>
          </form>

          <p className="mt-6 text-sm text-ink-muted">
            아직 계정이 없으신가요?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="text-brand font-semibold hover:underline"
            >
              회원가입
            </button>
          </p>
        </div>
      </main>
    </div>
  )
}

function Field({
  label,
  type,
  placeholder,
}: {
  label: string
  type: string
  placeholder: string
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[13px] font-medium text-ink-sub">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        className="h-[52px] rounded-xl bg-field border border-line px-4 text-[15px] text-ink placeholder:text-ink-faint outline-none focus:border-brand focus:bg-white transition-colors"
      />
    </label>
  )
}

function GitHubMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .5a12 12 0 00-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.3-1.8-1.3-1.8-1.1-.7 0-.7 0-.7 1.2 0 1.9 1.2 1.9 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.4-1.3-5.4-5.9 0-1.3.5-2.4 1.2-3.2 0-.4-.5-1.6.2-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 016 0C17.3 4.7 18.3 5 18.3 5c.7 1.6.2 2.8.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.5.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0012 .5z" />
    </svg>
  )
}
