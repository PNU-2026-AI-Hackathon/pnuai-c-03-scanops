import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../../../shared/ui/Logo'
import Input from '../../../shared/ui/Input'
import Button from '../../../shared/ui/Button'
import Checkbox from '../../../shared/ui/Checkbox'
import Icon from '../../../shared/ui/Icon'
import { useAuth } from '../../../shared/lib/auth'

const TERMS = [
  { key: 'tos', label: '[필수] 이용약관 동의', required: true },
  { key: 'privacy', label: '[필수] 개인정보 수집·이용 동의', required: true },
  { key: 'marketing', label: '[선택] 마케팅 정보 수신 동의', required: false },
] as const

export default function SignupPage() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const allChecked = TERMS.every((t) => checked[t.key])
  const requiredOk = TERMS.filter((t) => t.required).every((t) => checked[t.key])
  const toggleAll = () => {
    const next = !allChecked
    setChecked(Object.fromEntries(TERMS.map((t) => [t.key, next])))
  }
  const toggle = (k: string) => setChecked((c) => ({ ...c, [k]: !c[k] }))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (pw.length < 8) return setError('비밀번호는 8자 이상이어야 해요.')
    if (pw !== pw2) return setError('비밀번호가 일치하지 않아요.')
    if (!requiredOk) return setError('필수 약관에 동의해 주세요.')
    setLoading(true)
    try {
      await signup(email, pw)
      navigate('/onboarding', { replace: true })
    } catch {
      setError('가입에 실패했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="h-18 flex items-center px-6 sm:px-10 py-5">
        <Logo onClick={() => navigate('/')} />
      </header>

      <main className="flex-1 flex items-start justify-center px-6 pb-16">
        <div className="w-full max-w-[400px] mt-8 sm:mt-10 flex flex-col items-center fade-up">
          <h1 className="text-[26px] font-bold text-ink tracking-tight">ScanOps 시작하기</h1>
          <p className="mt-1.5 text-[15px] text-ink-muted">30초면 가입이 끝나요</p>

          <Button
            variant="github"
            size="lg"
            block
            leftIcon="github"
            className="mt-7"
            onClick={() => navigate('/auth/github/callback', { state: { from: '/onboarding', signup: true } })}
          >
            GitHub로 시작하기
          </Button>

          <div className="w-full flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-line" />
            <span className="text-[13px] text-ink-muted">또는</span>
            <div className="flex-1 h-px bg-line" />
          </div>

          <form className="w-full flex flex-col gap-4" onSubmit={onSubmit}>
            <Input label="이메일" type="email" leftIcon="mail" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input label="비밀번호" reveal leftIcon="lock" placeholder="8자 이상 입력" value={pw} onChange={(e) => setPw(e.target.value)} />
            <Input label="비밀번호 확인" reveal leftIcon="lock" placeholder="비밀번호를 다시 입력" value={pw2} onChange={(e) => setPw2(e.target.value)} />

            <div className="rounded-xl bg-surface border border-line px-4 py-3.5 flex flex-col gap-3">
              <Checkbox label="전체 동의하기" checked={allChecked} onChange={toggleAll} bold />
              <div className="h-px bg-line" />
              {TERMS.map((t) => (
                <Checkbox key={t.key} label={t.label} checked={!!checked[t.key]} onChange={() => toggle(t.key)} />
              ))}
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-danger-soft px-4 py-3 text-danger text-[13px]">
                <Icon name="alert-circle" size={16} /> {error}
              </div>
            )}

            <Button type="submit" size="lg" block loading={loading}>가입하기</Button>
          </form>

          <p className="mt-5 text-sm text-ink-muted">
            이미 계정이 있으신가요?{' '}
            <button onClick={() => navigate('/login')} className="text-brand font-semibold hover:underline">로그인</button>
          </p>
        </div>
      </main>
    </div>
  )
}
