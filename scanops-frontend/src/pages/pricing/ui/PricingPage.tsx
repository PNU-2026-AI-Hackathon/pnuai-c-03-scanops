import AppNav from '../../../shared/ui/AppNav'

interface Plan {
  name: string
  price: string
  per: string
  desc: string
  popular?: boolean
  cta: string
  ctaPrimary?: boolean
  feats: [string, string][]
}

const PLANS: Plan[] = [
  {
    name: 'Free',
    price: '₩0',
    per: '',
    desc: '가입하고 가볍게 체험',
    cta: '무료로 시작',
    feats: [
      ['DAST 웹 스캔', '1회 무료'],
      ['GitHub Actions', '미지원'],
      ['SAST 레포 분석', '미지원'],
      ['스캔 결과 보관', '1개월'],
    ],
  },
  {
    name: 'Pro',
    price: '₩9,900',
    per: '/월',
    desc: '개인·소규모 팀에 추천',
    popular: true,
    cta: 'Pro 시작하기',
    ctaPrimary: true,
    feats: [
      ['DAST 웹 스캔', '월 10회'],
      ['GitHub Actions', '월 5만 줄'],
      ['SAST 레포 분석', '월 15만 줄'],
      ['AI 브리핑·PDF', '제공'],
    ],
  },
  {
    name: 'Max',
    price: '₩29,900',
    per: '/월',
    desc: '본격적인 보안 운영',
    cta: 'Max 시작하기',
    feats: [
      ['DAST 웹 스캔', '월 100회'],
      ['GitHub Actions', '월 50만 줄'],
      ['SAST 레포 분석', '월 100만 줄'],
      ['우선 분석 큐', '제공'],
    ],
  },
  {
    name: 'App',
    price: '₩4,900',
    per: '/월',
    desc: 'GitHub App 단독',
    cta: 'App 시작하기',
    feats: [
      ['DAST 웹 스캔', '미지원'],
      ['GitHub Actions', '월 10만 줄'],
      ['SAST 레포 분석', '미지원'],
      ['PR 자동 댓글', '제공'],
    ],
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-surface">
      <AppNav />

      <main className="max-w-[1240px] mx-auto px-6 py-14">
        <div className="flex flex-col items-center text-center gap-2.5 mb-12">
          <span className="px-3 py-1.5 rounded-full bg-brand-soft text-brand text-xs font-bold">요금제</span>
          <h1 className="text-3xl font-bold text-ink tracking-tight">필요한 만큼만, 합리적으로</h1>
          <p className="text-[15px] text-ink-muted max-w-xl">
            회원가입하면 DAST 1회를 무료로 체험할 수 있어요. 모든 플랜은 언제든 해지 가능합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {PLANS.map((p) => (
            <PlanCard key={p.name} plan={p} />
          ))}
        </div>

        <p className="mt-8 flex items-center gap-2 text-[13px] text-ink-muted">
          <span>ⓘ</span>
          LOC(줄 수) 한도는 베타 기간 측정값 기준의 잠정값이며, SAST·Actions 처리 비용을 통제하기 위한 안전장치입니다.
        </p>
      </main>
    </div>
  )
}

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <div
      className={`rounded-[18px] bg-white p-6 flex flex-col ${
        plan.popular ? 'border-2 border-brand' : 'border border-line'
      }`}
    >
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold text-ink">{plan.name}</h2>
        {plan.popular && (
          <span className="px-2 py-0.5 rounded-full bg-brand text-white text-[11px] font-bold">인기</span>
        )}
      </div>
      <p className="mt-1 text-[13px] text-ink-muted">{plan.desc}</p>

      <div className="mt-4 flex items-baseline gap-0.5">
        <span className="text-[30px] font-bold text-ink tracking-tight">{plan.price}</span>
        <span className="text-sm text-ink-muted font-medium">{plan.per}</span>
      </div>

      <button
        className={`mt-5 h-[46px] rounded-xl font-semibold text-sm transition-colors ${
          plan.ctaPrimary
            ? 'bg-brand text-white hover:bg-brand-hover'
            : 'bg-field text-ink hover:bg-line'
        }`}
      >
        {plan.cta}
      </button>

      <div className="h-px bg-line my-5" />

      <ul className="flex flex-col gap-3">
        {plan.feats.map(([k, v]) => {
          const off = v === '미지원'
          return (
            <li key={k} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <span className={`text-xs font-bold ${off ? 'text-ink-faint' : 'text-emerald-500'}`}>
                  {off ? '—' : '✓'}
                </span>
                <span className="text-[13px] text-ink-sub font-medium">{k}</span>
              </span>
              <span className={`text-[13px] font-semibold ${off ? 'text-ink-faint' : 'text-ink'}`}>{v}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
