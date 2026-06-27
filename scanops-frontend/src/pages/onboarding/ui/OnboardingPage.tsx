import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../../../shared/ui/Logo'
import Icon, { type IconName } from '../../../shared/ui/Icon'
import Button from '../../../shared/ui/Button'
import Card from '../../../shared/ui/Card'
import { useAuth } from '../../../shared/lib/auth'
import { useToast } from '../../../shared/ui/Toast'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { user, update } = useAuth()
  const { toast } = useToast()
  const [step, setStep] = useState(0)
  const connected = !!user?.githubLogin

  const steps = ['GitHub 연결', '시작 방법 선택']

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="h-16 flex items-center px-6 sm:px-10">
        <Logo onClick={() => navigate('/dashboard')} />
      </header>

      <main className="flex-1 flex items-start justify-center px-6 py-8">
        <div className="w-full max-w-[520px] fade-up">
          {/* stepper */}
          <div className="flex items-center gap-2 mb-6">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold ${
                  i <= step ? 'bg-brand text-white' : 'bg-field text-ink-muted'
                }`}>{i + 1}</span>
                <span className={`text-[13px] font-semibold ${i <= step ? 'text-ink' : 'text-ink-muted'}`}>{s}</span>
                {i < steps.length - 1 && <div className="flex-1 h-px bg-line" />}
              </div>
            ))}
          </div>

          {step === 0 && (
            <Card pad="lg">
              <h1 className="text-[22px] font-bold text-ink">환영해요, {user?.name}님 👋</h1>
              <p className="mt-1.5 text-[14.5px] text-ink-sub">
                GitHub를 연결하면 레포 전체(SAST)·PR 자동 분석을 바로 사용할 수 있어요.
              </p>

              <div className="mt-5 rounded-xl border border-line p-4 flex items-center gap-3.5">
                <span className="w-11 h-11 rounded-xl bg-ink text-white flex items-center justify-center shrink-0">
                  <Icon name="github" size={22} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14.5px] font-semibold text-ink">
                    {connected ? `@${user?.githubLogin} 연결됨` : 'GitHub 계정 연결'}
                  </p>
                  <p className="text-[12.5px] text-ink-muted">
                    {connected ? '레포·PR 분석을 사용할 수 있어요.' : '읽기 권한만 요청합니다.'}
                  </p>
                </div>
                {connected ? (
                  <span className="text-success"><Icon name="check-circle" size={22} /></span>
                ) : (
                  <Button size="sm" variant="dark" leftIcon="github" onClick={() => { update({ githubLogin: 'octocat' }); toast('GitHub 연결됨', 'success') }}>
                    연결
                  </Button>
                )}
              </div>

              <div className="mt-5 flex gap-2.5">
                <Button variant="ghost" block onClick={() => setStep(1)}>나중에 하기</Button>
                <Button block rightIcon="arrow-right" onClick={() => setStep(1)}>다음</Button>
              </div>
            </Card>
          )}

          {step === 1 && (
            <Card pad="lg">
              <h1 className="text-[22px] font-bold text-ink">무엇부터 해볼까요?</h1>
              <p className="mt-1.5 text-[14.5px] text-ink-sub">원하는 방식으로 첫 보안 점검을 시작해요.</p>

              <div className="mt-5 flex flex-col gap-3">
                <StartOption icon="globe" tag="DAST · 무료 1회" title="웹사이트 검사" sub="실행 중인 사이트를 동적 분석" onClick={() => navigate('/scan')} />
                <StartOption icon="box" tag="SAST" title="GitHub 레포 분석" sub="소스코드 전체 정적 분석" onClick={() => navigate(connected ? '/scan' : '/integrations')} />
                <StartOption icon="home" tag="둘러보기" title="대시보드로 이동" sub="샘플 리포트와 사용량을 먼저 확인" onClick={() => navigate('/dashboard')} />
              </div>

              <button onClick={() => setStep(0)} className="mt-5 text-[13px] text-ink-muted font-medium hover:text-ink-sub flex items-center gap-1">
                <Icon name="chevron-left" size={15} /> 이전
              </button>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

function StartOption({ icon, tag, title, sub, onClick }: { icon: IconName; tag: string; title: string; sub: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="group flex items-center gap-3.5 rounded-xl border border-line p-4 text-left transition-all hover:border-brand hover:bg-brand-soft/40">
      <span className="w-11 h-11 rounded-xl bg-field group-hover:bg-white text-ink flex items-center justify-center shrink-0">
        <Icon name={icon} size={22} />
      </span>
      <div className="min-w-0 flex-1">
        <span className="text-[11px] font-bold text-brand">{tag}</span>
        <p className="text-[15px] font-semibold text-ink">{title}</p>
        <p className="text-[12.5px] text-ink-muted">{sub}</p>
      </div>
      <Icon name="chevron-right" size={18} className="text-ink-faint group-hover:text-brand" />
    </button>
  )
}
