import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Logo from '../../../shared/ui/Logo'
import Card from '../../../shared/ui/Card'
import Button from '../../../shared/ui/Button'
import Input from '../../../shared/ui/Input'
import Icon from '../../../shared/ui/Icon'
import { useAuth } from '../../../shared/lib/auth'
import { useToast } from '../../../shared/ui/Toast'
import { PLANS, won, type PlanId } from '../../../shared/lib/mock'

export default function CheckoutPage() {
  const { plan: planParam } = useParams<{ plan: string }>()
  const navigate = useNavigate()
  const { update } = useAuth()
  const { toast } = useToast()
  const plan = PLANS.find((p) => p.id === (planParam?.toUpperCase() as PlanId)) ?? PLANS[1]
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const vat = Math.round(plan.price * 0.1)
  const total = plan.price + vat

  const pay = async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1100))
    update({ plan: plan.id })
    setLoading(false)
    setDone(true)
    toast(`${plan.name} 플랜이 시작됐어요`, 'success')
    setTimeout(() => navigate('/dashboard', { replace: true }), 1400)
  }

  if (done) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
        <span className="w-16 h-16 rounded-full bg-success-soft text-success flex items-center justify-center mb-5 fade-up"><Icon name="check" size={32} strokeWidth={3} /></span>
        <h1 className="text-[22px] font-bold text-ink">결제가 완료됐어요</h1>
        <p className="mt-1.5 text-[14.5px] text-ink-muted">{plan.name} 플랜으로 업그레이드됐어요. 대시보드로 이동합니다…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="h-16 flex items-center px-6 sm:px-10 bg-white border-b border-line">
        <Logo onClick={() => navigate('/pricing')} />
      </header>
      <main className="flex-1 flex items-start justify-center px-6 py-10">
        <div className="w-full max-w-[860px] grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 fade-up">
          {/* payment form */}
          <Card pad="lg">
            <h1 className="text-[20px] font-bold text-ink">결제 정보</h1>
            <p className="mt-1 text-[13.5px] text-ink-muted">안전하게 암호화되어 처리돼요. (목업 결제)</p>
            <div className="flex flex-col gap-4 mt-5">
              <Input label="카드 번호" leftIcon="credit-card" placeholder="0000 0000 0000 0000" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="유효기간" placeholder="MM/YY" />
                <Input label="CVC" placeholder="123" />
              </div>
              <Input label="카드 소유자" placeholder="HONG GILDONG" />
            </div>
          </Card>

          {/* summary */}
          <div>
            <Card pad="lg">
              <h2 className="text-[15px] font-bold text-ink mb-3">주문 요약</h2>
              <div className="flex items-center justify-between py-2">
                <span className="text-[14px] text-ink-sub">{plan.name} 플랜</span>
                <span className="text-[14px] font-semibold text-ink tnum">{won(plan.price)}{plan.per}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[14px] text-ink-sub">부가세 (10%)</span>
                <span className="text-[14px] text-ink-sub tnum">{won(vat)}</span>
              </div>
              <div className="h-px bg-line my-2" />
              <div className="flex items-center justify-between py-1">
                <span className="text-[15px] font-bold text-ink">합계</span>
                <span className="text-[18px] font-bold text-ink tnum">{won(total)}</span>
              </div>
              {plan.trial && (
                <p className="mt-2 flex items-center gap-1.5 text-[12.5px] text-brand font-medium"><Icon name="zap" size={14} /> {plan.trial} 후 결제됩니다</p>
              )}
              <Button block size="lg" loading={loading} className="mt-4" onClick={pay}>
                {plan.price === 0 ? '무료로 시작' : `${won(total)} 결제하기`}
              </Button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-[11.5px] text-ink-faint"><Icon name="lock" size={12} /> 언제든 해지할 수 있어요</p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
