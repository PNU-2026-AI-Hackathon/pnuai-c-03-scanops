import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../../../shared/ui/Logo'

const TERMS = [
  { key: 'tos', label: '[필수] 이용약관 동의', required: true },
  { key: 'privacy', label: '[필수] 개인정보 수집·이용 동의', required: true },
  { key: 'marketing', label: '[선택] 마케팅 정보 수신 동의', required: false },
] as const

export default function SignupPage() {
  const navigate = useNavigate()
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  const allChecked = TERMS.every((t) => checked[t.key])
  const toggleAll = () => {
    const next = !allChecked
    setChecked(Object.fromEntries(TERMS.map((t) => [t.key, next])))
  }
  const toggle = (k: string) => setChecked((c) => ({ ...c, [k]: !c[k] }))

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="h-18 flex items-center px-10 py-5">
        <Logo onClick={() => navigate('/')} />
      </header>

      <main className="flex-1 flex items-start justify-center px-6 pb-16">
        <div className="w-full max-w-[400px] mt-10 flex flex-col items-center">
          <h1 className="text-[26px] font-bold text-ink tracking-tight">ScanOps 시작하기</h1>
          <p className="mt-1.5 text-[15px] text-ink-muted">30초면 가입이 끝나요</p>

          <button
            type="button"
            className="w-full mt-7 h-[52px] rounded-xl bg-ink text-white font-semibold text-[15px] hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <GitHubMark />
            GitHub로 시작하기
          </button>

          <div className="w-full flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-line" />
            <span className="text-[13px] text-ink-muted">또는</span>
            <div className="flex-1 h-px bg-line" />
          </div>

          <form
            className="w-full flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              navigate('/scan')
            }}
          >
            <Field label="이메일" type="email" placeholder="you@example.com" />
            <Field label="비밀번호" type="password" placeholder="8자 이상 입력" />
            <Field label="비밀번호 확인" type="password" placeholder="비밀번호를 다시 입력" />

            <div className="rounded-xl bg-surface border border-line px-4 py-3.5 flex flex-col gap-3">
              <Check label="전체 동의하기" checked={allChecked} onChange={toggleAll} bold />
              <div className="h-px bg-line" />
              {TERMS.map((t) => (
                <Check
                  key={t.key}
                  label={t.label}
                  checked={!!checked[t.key]}
                  onChange={() => toggle(t.key)}
                />
              ))}
            </div>

            <button
              type="submit"
              className="h-[52px] rounded-xl bg-brand text-white font-semibold text-[15px] hover:bg-brand-hover transition-colors"
            >
              가입하기
            </button>
          </form>

          <p className="mt-5 text-sm text-ink-muted">
            이미 계정이 있으신가요?{' '}
            <button onClick={() => navigate('/login')} className="text-brand font-semibold hover:underline">
              로그인
            </button>
          </p>
        </div>
      </main>
    </div>
  )
}

function Field({ label, type, placeholder }: { label: string; type: string; placeholder: string }) {
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

function Check({
  label,
  checked,
  onChange,
  bold,
}: {
  label: string
  checked: boolean
  onChange: () => void
  bold?: boolean
}) {
  return (
    <button type="button" onClick={onChange} className="flex items-center gap-2.5 text-left">
      <span
        className={`w-5 h-5 rounded-md flex items-center justify-center text-white text-[12px] border transition-colors ${
          checked ? 'bg-brand border-brand' : 'bg-white border-line-strong'
        }`}
      >
        {checked ? '✓' : ''}
      </span>
      <span className={`text-sm ${bold ? 'text-ink font-semibold' : 'text-ink-sub'}`}>{label}</span>
    </button>
  )
}

function GitHubMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .5a12 12 0 00-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.3-1.8-1.3-1.8-1.1-.7 0-.7 0-.7 1.2 0 1.9 1.2 1.9 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.4-1.3-5.4-5.9 0-1.3.5-2.4 1.2-3.2 0-.4-.5-1.6.2-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 016 0C17.3 4.7 18.3 5 18.3 5c.7 1.6.2 2.8.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.5.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0012 .5z" />
    </svg>
  )
}
