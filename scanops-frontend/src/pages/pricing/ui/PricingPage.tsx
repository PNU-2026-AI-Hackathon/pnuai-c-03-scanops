import { useNavigate } from 'react-router-dom'
import AppNav from '../../../shared/ui/AppNav'
import Logo from '../../../shared/ui/Logo'
import Card from '../../../shared/ui/Card'
import Button from '../../../shared/ui/Button'
import Badge from '../../../shared/ui/Badge'
import Icon from '../../../shared/ui/Icon'
import { useAuth } from '../../../shared/lib/auth'
import { PLANS, won, type PlanId } from '../../../shared/lib/mock'

interface DisplayPlan {
  id: PlanId
  name: string
  price: string
  per: string
  desc: string
  popular?: boolean
  trial?: string
  feats: [string, string][]
}

const PERSONAL: DisplayPlan[] = (['FREE', 'PRO', 'MAX'] as PlanId[]).map((id) => {
  const p = PLANS.find((x) => x.id === id)!
  return {
    id, name: p.name, price: p.price === 0 ? '₩0' : won(p.price), per: p.per, desc: p.desc,
    popular: p.popular, trial: p.trial,
    feats: [
      ['DAST 웹 스캔', p.dast],
      ['GitHub App / Actions', p.actions],
      ['SAST 레포 분석', p.sast],
      ['핵심 혜택', p.highlight],
    ],
  }
})

const TEAM = PLANS.find((p) => p.id === 'TEAM')!
const TEAM_PLAN: DisplayPlan = {
  id: 'TEAM', name: TEAM.name, price: won(TEAM.price), per: TEAM.per, desc: TEAM.desc, popular: true,
  feats: [['DAST 웹 스캔', TEAM.dast], ['GitHub App / Actions', TEAM.actions], ['SAST 레포 분석', TEAM.sast], ['멤버 수', '기본 3명']],
}
const TEAM_ADDON: [string, string][] = [
  ['멤버 추가', '1명당 +₩25,000'], ['DAST 웹 스캔', '+월 7회'],
  ['GitHub App / Actions', '+월 8만 줄'], ['SAST 레포 분석', '+월 15만 줄'],
]
const OVERAGE: [string, string][] = [
  ['SAST 레포 분석', '1만 줄당 ₩5,000'], ['GitHub App / Actions', '1만 줄당 ₩5,000'], ['DAST 웹 스캔', '3회당 ₩5,000'],
]

export default function PricingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const choose = (id: PlanId) => {
    if (!user) return navigate('/signup')
    if (id === 'FREE') return navigate('/scan')
    if (id === 'TEAM') return navigate('/checkout/team')
    navigate(`/checkout/${id.toLowerCase()}`)
  }

  return (
    <div className="min-h-screen bg-surface">
      {user ? <AppNav /> : (
        <header className="h-16 flex items-center justify-between px-6 sm:px-10 bg-white border-b border-line">
          <Logo onClick={() => navigate('/')} />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>로그인</Button>
            <Button size="sm" onClick={() => navigate('/signup')}>무료로 시작</Button>
          </div>
        </header>
      )}

      <main className="max-w-[1180px] mx-auto px-6 py-14">
        <div className="flex flex-col items-center text-center gap-2.5 mb-12">
          <Badge tone="brand">요금제</Badge>
          <h1 className="text-3xl font-bold text-ink tracking-tight">필요한 만큼만, 합리적으로</h1>
          <p className="text-[15px] text-ink-muted max-w-xl">
            회원가입하면 DAST 1회를 무료로 체험할 수 있어요. Pro는 7일 무료체험을 제공하며, 모든 플랜은 언제든 해지할 수 있습니다.
          </p>
        </div>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-ink">개인 플랜</h2>
            <span className="text-[13px] text-ink-muted">혼자 또는 소규모로 시작할 때</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
            {PERSONAL.map((p) => <PlanCard key={p.id} plan={p} current={user?.plan === p.id} onChoose={choose} />)}
          </div>
        </section>

        <section className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-ink">팀 플랜</h2>
            <span className="text-[13px] text-ink-muted">멤버가 늘어도 한도가 함께 커져요</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
            <PlanCard plan={TEAM_PLAN} current={user?.plan === 'TEAM'} onChoose={choose} />
            <Card pad="lg" className="flex flex-col">
              <h3 className="text-lg font-bold text-ink">멤버 추가 시</h3>
              <p className="mt-1 text-[13px] text-ink-muted">기본 3명을 초과해 1명을 추가할 때마다 요금과 한도가 함께 늘어납니다.</p>
              <div className="h-px bg-line my-5" />
              <ul className="flex flex-col gap-3">
                {TEAM_ADDON.map(([k, v]) => (
                  <li key={k} className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2"><span className="text-brand"><Icon name="plus" size={14} /></span><span className="text-[13px] text-ink-sub font-medium">{k}</span></span>
                    <span className="text-[13px] font-semibold text-ink">{v}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </section>

        <section className="mt-12">
          <Card pad="lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
              <h2 className="text-lg font-bold text-ink">한도 초과 시 종량 추가결제</h2>
              <span className="text-[13px] text-ink-muted">필요한 만큼만 그때그때 추가로 결제해요</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              {OVERAGE.map(([k, v]) => (
                <div key={k} className="rounded-xl bg-field px-4 py-3.5">
                  <div className="text-[13px] text-ink-sub font-medium">{k}</div>
                  <div className="mt-1 text-[15px] font-bold text-ink">{v}</div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <p className="mt-8 flex items-center gap-2 text-[13px] text-ink-muted">
          <Icon name="info" size={15} />
          LOC(줄 수) 한도는 베타 기간 측정값 기준의 잠정값이며, SAST·GitHub App 처리 비용을 통제하기 위한 안전장치입니다.
        </p>
      </main>
    </div>
  )
}

function PlanCard({ plan, current, onChoose }: { plan: DisplayPlan; current?: boolean; onChoose: (id: PlanId) => void }) {
  return (
    <Card pad="lg" className={`flex flex-col ${plan.popular ? 'border-2 border-brand' : ''}`}>
      <div className="flex items-center gap-2 flex-wrap">
        <h2 className="text-lg font-bold text-ink">{plan.name}</h2>
        {plan.popular && <Badge tone="brand" solid size="sm">인기</Badge>}
        {plan.trial && <Badge tone="brand" size="sm">{plan.trial}</Badge>}
        {current && <Badge tone="success" size="sm">현재 플랜</Badge>}
      </div>
      <p className="mt-1 text-[13px] text-ink-muted">{plan.desc}</p>
      <div className="mt-4 flex items-baseline gap-0.5">
        <span className="text-[30px] font-bold text-ink tracking-tight tnum">{plan.price}</span>
        <span className="text-sm text-ink-muted font-medium">{plan.per}</span>
      </div>

      <Button
        variant={plan.popular ? 'primary' : 'outline'}
        block
        className="mt-5"
        disabled={current}
        onClick={() => onChoose(plan.id)}
      >
        {current ? '사용 중' : plan.id === 'FREE' ? '무료로 시작' : plan.id === 'TEAM' ? 'Team 시작하기' : `${plan.name} 시작하기`}
      </Button>

      <div className="h-px bg-line my-5" />
      <ul className="flex flex-col gap-3">
        {plan.feats.map(([k, v]) => {
          const off = v === '미지원'
          return (
            <li key={k} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <span className={off ? 'text-ink-faint' : 'text-success'}>
                  <Icon name={off ? 'x' : 'check'} size={14} strokeWidth={off ? 2 : 3} />
                </span>
                <span className="text-[13px] text-ink-sub font-medium">{k}</span>
              </span>
              <span className={`text-[13px] font-semibold ${off ? 'text-ink-faint' : 'text-ink'}`}>{v}</span>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
