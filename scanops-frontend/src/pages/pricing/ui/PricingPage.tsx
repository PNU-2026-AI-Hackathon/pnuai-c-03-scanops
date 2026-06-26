import AppNav from '../../../shared/ui/AppNav'

interface Plan {
  name: string
  price: string
  per: string
  desc: string
  popular?: boolean
  cta: string
  ctaPrimary?: boolean
  trial?: string
  feats: [string, string][]
}

const PERSONAL_PLANS: Plan[] = [
  {
    name: 'Free',
    price: '₩0',
    per: '',
    desc: '회원가입만 하면 바로 체험',
    cta: '무료로 시작',
    feats: [
      ['DAST 웹 스캔', '1회 무료'],
      ['GitHub App / Actions', '미지원'],
      ['SAST 레포 분석', '미지원'],
      ['스캔 결과 보관', '1개월'],
    ],
  },
  {
    name: 'Pro',
    price: '₩29,900',
    per: '/월',
    desc: '개인·소규모 프로젝트에 추천',
    popular: true,
    cta: 'Pro 시작하기',
    ctaPrimary: true,
    trial: '7일 무료체험',
    feats: [
      ['DAST 웹 스캔', '월 5회'],
      ['GitHub App / Actions', '월 5만 줄'],
      ['SAST 레포 분석', '월 10만 줄'],
      ['AI 브리핑·PDF', '제공'],
    ],
  },
  {
    name: 'Max',
    price: '₩99,000',
    per: '/월',
    desc: '본격적인 보안 운영',
    cta: 'Max 시작하기',
    feats: [
      ['DAST 웹 스캔', '월 30회'],
      ['GitHub App / Actions', '월 30만 줄'],
      ['SAST 레포 분석', '월 50만 줄'],
      ['우선 분석 큐', '제공'],
    ],
  },
]

const TEAM_PLAN: Plan = {
  name: 'Team',
  price: '₩89,000',
  per: '/월',
  desc: '기본 3명 포함 · 팀 단위 보안 운영',
  cta: 'Team 도입 문의',
  ctaPrimary: true,
  feats: [
    ['DAST 웹 스캔', '월 20회'],
    ['GitHub App / Actions', '월 24만 줄'],
    ['SAST 레포 분석', '월 45만 줄'],
    ['멤버 수', '기본 3명'],
  ],
}

const TEAM_ADDON: [string, string][] = [
  ['멤버 추가', '1명당 +₩25,000'],
  ['DAST 웹 스캔', '+월 7회'],
  ['GitHub App / Actions', '+월 8만 줄'],
  ['SAST 레포 분석', '+월 15만 줄'],
]

const OVERAGE: [string, string][] = [
  ['SAST 레포 분석', '1만 줄당 ₩5,000'],
  ['GitHub App / Actions', '1만 줄당 ₩5,000'],
  ['DAST 웹 스캔', '3회당 ₩5,000'],
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
            회원가입하면 DAST 1회를 무료로 체험할 수 있어요. Pro는 7일 무료체험을 제공하며, 모든 플랜은 언제든 해지 가능합니다.
          </p>
        </div>

        {/* 개인 플랜 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-ink">개인 플랜</h2>
            <span className="text-[13px] text-ink-muted">혼자 또는 소규모로 시작할 때</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
            {PERSONAL_PLANS.map((p) => (
              <PlanCard key={p.name} plan={p} />
            ))}
          </div>
        </section>

        {/* 팀 플랜 */}
        <section className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-ink">팀 플랜</h2>
            <span className="text-[13px] text-ink-muted">멤버가 늘어도 한도가 함께 커져요</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
            <PlanCard plan={TEAM_PLAN} />
            <div className="rounded-[18px] bg-white border border-line p-6 flex flex-col">
              <h3 className="text-lg font-bold text-ink">멤버 추가 시</h3>
              <p className="mt-1 text-[13px] text-ink-muted">
                기본 3명을 초과해 1명을 추가할 때마다 요금과 한도가 함께 늘어납니다.
              </p>
              <div className="h-px bg-line my-5" />
              <ul className="flex flex-col gap-3">
                {TEAM_ADDON.map(([k, v]) => (
                  <li key={k} className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <span className="text-xs font-bold text-brand">＋</span>
                      <span className="text-[13px] text-ink-sub font-medium">{k}</span>
                    </span>
                    <span className="text-[13px] font-semibold text-ink">{v}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 종량 추가결제 */}
        <section className="mt-12">
          <div className="rounded-[18px] bg-white border border-line p-6">
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
          </div>
        </section>

        <p className="mt-8 flex items-center gap-2 text-[13px] text-ink-muted">
          <span>ⓘ</span>
          LOC(줄 수) 한도는 베타 기간 측정값 기준의 잠정값이며, SAST·GitHub App 처리 비용을 통제하기 위한 안전장치입니다.
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
        {plan.trial && (
          <span className="px-2 py-0.5 rounded-full bg-brand-soft text-brand text-[11px] font-bold">
            {plan.trial}
          </span>
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
