import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../../../shared/ui/Logo'
import Icon, { type IconName } from '../../../shared/ui/Icon'
import Button from '../../../shared/ui/Button'
import { ENABLE_PRICING } from '../../../shared/lib/config'

// ── data ─────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: '검증', href: '#benchmark' },
  { label: '왜 다른가', href: '#why' },
  { label: '코드 보안', href: '#security' },
  ...(ENABLE_PRICING ? [{ label: '요금제', href: '#pricing' }] : []),
]

const stats = [
  { value: '0건', label: '외부 API로 나가는 소스코드' },
  { value: '84.7%', label: '오탐 필터 제거율 · 상용 API(83.9%) 앞섬' },
  { value: '하이브리드', label: '그래프 데이터흐름 추적 + AI 룰 판단' },
  { value: '3가지', label: 'DAST·SAST·PR 자동분석 한 번에' },
]

const whyCards: { icon: IconName; title: string; desc: string }[] = [
  {
    icon: 'cpu',
    title: '보안만 학습한 로컬 모델',
    desc: '룰 생성·오탐 필터링·탐지까지 전부 자체 로컬 모델(Qwen3.5-9B)로 처리해요. 코드가 ChatGPT·Claude 같은 외부 API로 전송되는 일이 없습니다.',
  },
  {
    icon: 'layers',
    title: '파일 하나가 아니라 레포 전체를',
    desc: 'JS·TS 레포는 코드 속성 그래프(CPG)로 전체를 연결해 파일 간 데이터 흐름까지 추적해요. 한 파일씩만 보는 방식으로는 원리적으로 놓치는 취약점을 잡습니다.',
  },
  {
    icon: 'shield',
    title: '오탐은 확신 있을 때만 제거',
    desc: 'API 각각의 위험도는 손규칙 8종 + 레포별로 학습한 규칙이 판단하고, 실제 취약점 흐름 추적은 그래프 알고리즘이 맡아요. 오탐 필터는 확신 있게 안전한 코드만 제거합니다. 놓치는 것보다 잘못 알리는 게 낫다는 원칙이에요.',
  },
]

const scanModes: { tag: string; icon: IconName; accent: string; soft: string; title: string; desc: string }[] = [
  { tag: 'DAST', icon: 'globe', accent: 'var(--color-scan-web)', soft: 'var(--color-brand-soft)', title: '웹사이트 동적 분석', desc: '실행 중인 앱을 외부에서 스캔. 코드 전송 없이 URL만으로 진단합니다.' },
  { tag: 'SAST', icon: 'box', accent: 'var(--color-scan-code)', soft: 'var(--color-purple-soft)', title: '레포 전체 정적 분석', desc: '전 언어는 AI 모델이, JS·TS 레포는 파일 간 흐름을 추적하는 그래프 분석까지 함께 적용돼요.' },
  { tag: 'Actions', icon: 'git-pull-request', accent: 'var(--color-scan-pr)', soft: 'var(--color-success-soft)', title: 'PR 자동 분석', desc: '고객 인프라 안에서 PR diff를 검사하고 결과만 전송. 코드가 밖으로 안 나갑니다.' },
]

const plans = [
  { name: 'Free', price: '₩0', per: '', desc: '가입하고 가볍게 체험', feats: ['DAST 웹 스캔 1회', '결과 1개월 보관'], primary: false },
  { name: 'Pro', price: '₩19,900', per: '/월', desc: '1인 개발자·바이브코더에게 추천', feats: ['DAST 월 5회', 'SAST·액션 월 10만 줄', 'PR 자동 분석', 'AI 브리핑·PDF'], primary: true },
  { name: 'Max', price: '₩69,000', per: '/월', desc: '코드량이 많은 개인에게 추천', feats: ['DAST 월 30회', 'SAST·액션 월 40만 줄', '우선 분석 큐'], primary: false },
]

// ── page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white text-ink">
      {/* Nav */}
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-line">
        <div className="flex items-center justify-between px-6 sm:px-10 h-16">
          <div className="flex items-center gap-9">
            <Logo onClick={() => { setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
            <div className="hidden md:flex items-center gap-7">
              {NAV_LINKS.map((l) => (
                <a key={l.href} href={l.href} className="text-[15px] font-medium text-ink-sub hover:text-ink transition-colors">{l.label}</a>
              ))}
            </div>
          </div>
          {/* Hamburger — mobile only */}
          <button
            type="button"
            aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 -mr-2 rounded-lg text-ink-sub hover:bg-surface transition-colors"
          >
            {menuOpen ? (
              <Icon name="x" size={22} />
            ) : (
              <span className="flex flex-col gap-[5px]">
                <span className="block w-5 h-[2px] rounded-full bg-current" />
                <span className="block w-5 h-[2px] rounded-full bg-current" />
                <span className="block w-5 h-[2px] rounded-full bg-current" />
              </span>
            )}
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="md:hidden border-t border-line bg-white px-6 py-1">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="block py-3.5 text-[16px] font-medium text-ink-sub hover:text-ink transition-colors border-b border-line last:border-0"
              >
                {l.label}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* Hero */}
      <header className="relative overflow-hidden">
        {/* <div className="pointer-events-none absolute inset-x-0 top-0 h-[560px] -z-10" style={{ background: 'radial-gradient(60% 100% at 50% 0%, #eaf2fe 0%, rgba(255,255,255,0) 70%)' }} /> */}
        {/* <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[560px] -z-0"
          style={{
            background:
              'radial-gradient(50% 120% at 50% 0%, rgba(49,130,246,0.18) 0%, rgba(255,255,255,0) 60%)',
          }}
        /> */}
        <div className="max-w-5xl mx-auto px-6 pt-20 relative z-10 sm:pt-24 pb-12 text-center flex flex-col items-center">
          <div className="mb-6 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-soft border border-line text-[12.5px] font-semibold text-ink-sub shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
            <span className="text-brand"><Icon name="shield" size={14} /></span>
            소스코드는 외부 API로 전송되지 않습니다
          </div>
          <h1 className="text-[40px] sm:text-[60px] font-extrabold tracking-tight leading-[1.08]">
            당신의 코드는,
            <br />
            <span className="text-brand">안전한가요?</span>
          </h1>
          <p className="mt-6 max-w-2xl text-[18px] sm:text-[20px] text-ink-sub leading-relaxed break-keep [text-wrap:balance]">
            ChatGPT·Claude 같은 외부 서비스에 코드를 보내지 않고, 보안 전용 로컬 모델과 그래프 분석이 직접 취약점을 찾아드려요.
          </p>
          <p className="mt-2 max-w-2xl text-[18px] sm:text-[20px] text-ink-sub leading-relaxed break-keep [text-wrap:balance]">
            URL이나 GitHub 레포만 넣으면 위험도와 고치는 방법까지, 한국어 리포트로 알려드려요.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3">
            <Button size="lg" rightIcon="arrow-right" onClick={() => navigate('/signup')}>무료로 스캔 시작하기</Button>
            <Button size="lg" variant="weak" leftIcon="bar-chart-2" onClick={() => { document.getElementById('benchmark')?.scrollIntoView({ behavior: 'smooth' }) }}>실제 검증 보기</Button>
          </div>
          <p className="mt-4 text-[13px] text-ink-muted">가입하면 웹사이트 보안검사 1회 무료 · 카드 등록 없이 시작</p>
        </div>

        <div className="max-w-4xl mx-auto px-6 pb-[120px]">
          <ReportPreview />
        </div>
      </header>

      {/* Stats */}
      <section className="py-[120px] border-y border-line bg-surface">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-[34px] sm:text-[44px] font-extrabold tracking-tight tnum">{s.value}</p>
              <p className="mt-2 text-[14.5px] text-ink-muted break-keep">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benchmark */}
      <section id="benchmark" className="py-[120px] px-6">
        <div className="max-w-5xl mx-auto">
          <SectionHeading tag="검증" title="오탐 필터링, 상용 API를 앞섰습니다" sub="코드를 외부로 보내지 않는 로컬 모델로 상용 API보다 더 정확하게 오탐을 걸러냈어요." />
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="rounded-2xl bg-ink p-7 flex flex-col self-start">
              <div>
                <p className="text-base font-bold text-white flex items-center gap-2"><Icon name="trending-down" size={18} /> 오탐 필터링, 상용 API를 앞섰어요</p>
                <p className="text-[13px] text-ink-faint mt-2 leading-relaxed">코드를 외부로 보내는 상용 API와 달리, 로컬 모델만으로 더 높은 오탐 제거율을 냈어요.</p>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-white/10 border border-brand/40 p-5">
                  <p className="text-[13px] text-brand-soft font-semibold">ScanOps(로컬) 오탐 제거율</p>
                  <p className="text-[36px] font-extrabold text-white mt-1.5 tnum leading-none">84.7<span className="text-lg">%</span></p>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                  <p className="text-[13px] text-ink-faint font-semibold">상용 API(Claude) 오탐 제거율</p>
                  <p className="text-[36px] font-extrabold text-ink-faint mt-1.5 tnum leading-none">83.9<span className="text-lg">%</span></p>
                </div>
              </div>
              <p className="mt-6 text-[12.5px] text-ink-faint leading-relaxed">* jquery-ui 레포 기준 오탐 필터링 성능 비교(탐지력 지표 아님).</p>
            </div>
            <div className="rounded-2xl bg-white border border-line p-7 flex flex-col">
              <p className="text-base font-bold text-ink mb-1">완전한 로컬 처리</p>
              <p className="text-[13px] text-ink-muted mb-5 leading-relaxed">룰 생성부터 오탐 필터링, 탐지까지 전 단계를 자체 로컬 모델(Qwen3.5-9B)로 처리해요.</p>
              <div className="flex flex-col gap-3">
                {['룰 생성', '오탐 필터링', '취약점 탐지'].map((step) => (
                  <div key={step} className="flex items-center gap-3 rounded-xl bg-surface border border-line px-4 py-3">
                    <span className="text-success shrink-0"><Icon name="check-circle" size={18} /></span>
                    <span className="text-[14px] font-semibold text-ink">{step}</span>
                    <span className="ml-auto text-[12px] font-semibold text-ink-muted">로컬 모델</span>
                  </div>
                ))}
              </div>
              <p className="mt-5 pt-5 border-t border-line text-[13px] text-ink-sub leading-relaxed font-medium">ChatGPT·Claude 같은 외부 API로 코드가 전송되는 구간이 아예 없습니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why security-specialized */}
      <section id="why" className="py-[120px] px-6 bg-surface border-y border-line">
        <div className="max-w-5xl mx-auto">
          <SectionHeading tag="왜 다른가" title="작지만, 보안에선 더 정확합니다" sub="범용 대형 모델을 따라 크기를 키우는 대신, 보안 하나에 집중했습니다. 그게 더 잘 찾는 길이었어요." />
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-4">
            {whyCards.map((c) => (
              <div key={c.title} className="rounded-2xl bg-white border border-line p-7">
                <div className="w-12 h-12 rounded-xl bg-brand-soft text-brand flex items-center justify-center mb-5"><Icon name={c.icon} size={22} /></div>
                <h3 className="font-bold text-[18px] mb-2">{c.title}</h3>
                <p className="text-[15px] text-ink-muted leading-relaxed break-keep">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code security */}
      <section id="security" className="py-[120px] px-6">
        <div className="max-w-5xl mx-auto">
          <SectionHeading tag="코드 보안" title="소스코드는 서버로 오지 않습니다" sub="가장 강력한 보안은 정책이 아니라 구조입니다. ScanOps는 코드가 외부로 나가지 않도록 설계됐습니다." />
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-5">
            <FlowCard badge="Free · Pro" color="var(--color-brand)" soft="var(--color-brand-soft)" title="URL 스캔 — 코드 전송 없음" steps={['웹 URL 입력', 'ScanOps가 외부에서 동적 스캔', '취약점 리포트만 생성']} note="소스코드 자체가 서버로 전송되지 않습니다." />
            <FlowCard badge="GitHub Actions" color="var(--color-scan-code)" soft="var(--color-purple-soft)" title="레포 스캔 — 고객 인프라 내 분석" steps={['PR 이벤트 발생', '고객 Actions 러너 안에서 직접 스캔', '결과(리포트)만 ScanOps로 전송']} note="코드는 고객 인프라를 벗어나지 않습니다." />
          </div>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {([
              ['cpu', '메모리에서만 처리', 'DB에는 결과만 저장, 코드는 미저장'],
              ['trash-2', '분석 후 즉시 폐기', '삭제 버튼·삭제 로그로 증명'],
              ['key', 'read-only 권한', 'GitHub 최소 scope만 요청'],
              ['lock', 'HTTPS 전송 암호화', '모든 통신 기본 암호화'],
            ] as [IconName, string, string][]).map(([icon, t, d]) => (
              <div key={t} className="rounded-xl bg-surface border border-line px-4 py-4">
                <div className="text-ink-sub mb-2"><Icon name={icon} size={20} /></div>
                <p className="text-[13.5px] font-semibold text-ink">{t}</p>
                <p className="text-[12px] text-ink-muted mt-0.5 leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scan modes */}
      <section className="py-[120px] px-6 bg-surface border-y border-line">
        <div className="max-w-5xl mx-auto">
          <SectionHeading tag="3가지 스캔 방식" title="웹부터 레포, PR까지 한 번에" sub="검사 대상과 상황에 맞는 방식을 선택하세요. 사용량은 방식별로 투명하게 관리됩니다." />
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {scanModes.map((m) => (
              <div key={m.tag} className="rounded-2xl bg-white border border-line p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: m.soft, color: m.accent }}><Icon name={m.icon} size={21} /></div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold" style={{ background: m.soft, color: m.accent }}>{m.tag}</span>
                </div>
                <h3 className="font-bold text-[17px] mb-1.5">{m.title}</h3>
                <p className="text-[14.5px] text-ink-muted leading-relaxed break-keep">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      {ENABLE_PRICING && (
        <section id="pricing" className="py-[120px] px-6">
          <div className="max-w-5xl mx-auto">
            <SectionHeading tag="요금제" title="필요한 만큼만, 합리적으로" sub="회원가입하면 DAST 1회를 무료로 체험할 수 있어요. Pro는 7일 무료체험을 제공하며, 언제든 해지할 수 있습니다." />
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
              {plans.map((p) => (
                <div key={p.name} className={`rounded-2xl bg-white p-6 flex flex-col ${p.primary ? 'border-2 border-brand' : 'border border-line'}`}>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold">{p.name}</h3>
                    {p.primary && <span className="px-2 py-0.5 rounded-full bg-brand text-white text-[11px] font-bold">인기</span>}
                  </div>
                  <p className="mt-1 text-[13px] text-ink-muted">{p.desc}</p>
                  <div className="mt-4 flex items-baseline gap-0.5">
                    <span className="text-[28px] font-bold tracking-tight tnum">{p.price}</span>
                    <span className="text-sm text-ink-muted font-medium">{p.per}</span>
                  </div>
                  <Button variant={p.primary ? 'primary' : 'outline'} block className="mt-5" onClick={() => navigate('/signup')}>
                    {p.name === 'Free' ? '무료로 시작' : `${p.name} 시작하기`}
                  </Button>
                  <ul className="mt-5 flex flex-col gap-2.5">
                    {p.feats.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-[13px] text-ink-sub">
                        <span className="text-success"><Icon name="check" size={14} strokeWidth={3} /></span>{f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <button onClick={() => navigate('/pricing')} className="text-brand text-sm font-semibold hover:underline inline-flex items-center gap-1">
                팀 플랜·전체 비교 보기 <Icon name="arrow-right" size={15} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* GitHub App CTA */}
      <section className="py-[120px] px-6 bg-surface border-y border-line">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-soft text-purple text-xs font-bold">
            <Icon name="github" size={14} /> GitHub App
          </div>
          <h2 className="text-[32px] sm:text-[40px] font-bold mb-5 leading-[1.15] break-keep">PR 올리면 <span className="text-purple">자동으로 분석</span>됩니다</h2>
          <p className="text-ink-sub text-[17px] sm:text-[18px] leading-relaxed mb-9 break-keep">
            ScanOps GitHub App을 레포에 설치하면 PR마다 변경된 코드가 자동으로 검사돼요. 발견된 취약점은 해당 코드 줄에 바로 댓글로, 뭐가 문제인지·어떻게 고치면 되는지 한국어로 알려줍니다.
          </p>
          <Button size="lg" variant="dark" leftIcon="github" onClick={() => navigate('/signup')}>GitHub App 시작하기</Button>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-[120px]">
        <div className="max-w-5xl mx-auto rounded-3xl bg-ink px-8 py-16 text-center relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-0" style={{ background: 'radial-gradient(50% 120% at 50% 0%, rgba(49,130,246,0.25) 0%, rgba(0,0,0,0) 60%)' }} />
          <div className="relative">
            <h2 className="text-[32px] sm:text-[42px] font-bold text-white leading-[1.15] break-keep">당신의 코드, 지금 무료로 점검하세요</h2>
            <p className="mt-4 text-[17px] sm:text-[18px] text-ink-faint break-keep">회원가입하면 웹사이트 보안검사 1회를 무료로 체험할 수 있어요. 카드 등록도 필요 없어요.</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" onClick={() => navigate('/signup')} rightIcon="arrow-right">무료로 시작하기</Button>
              <Button size="lg" variant="weak" onClick={() => navigate('/login')} className="!bg-white/10 !text-white hover:!bg-white/20">로그인</Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-xs text-ink-faint border-t border-line">© 2026 ScanOps · 코드 비전송 자체 AI 보안 진단</footer>
    </div>
  )
}

// ── sub-components ────────────────────────────────────────────────────────────

function SectionHeading({ tag, title, sub }: { tag: string; title: string; sub: string }) {
  return (
    <div className="text-center flex flex-col items-center">
      <span className="px-3 py-1.5 rounded-full bg-brand-soft text-brand text-[13px] font-bold mb-4">{tag}</span>
      <h2 className="text-[32px] sm:text-[44px] font-bold tracking-tight leading-[1.15] break-keep">{title}</h2>
      <p className="mt-4 max-w-2xl text-ink-sub text-[17px] sm:text-[19px] leading-relaxed break-keep">{sub}</p>
    </div>
  )
}


function FlowCard({ badge, color, soft, title, steps, note }: { badge: string; color: string; soft: string; title: string; steps: string[]; note: string }) {
  return (
    <div className="rounded-2xl bg-white border border-line p-7">
      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold" style={{ background: soft, color }}>{badge}</span>
      <h3 className="mt-4 font-bold text-lg">{title}</h3>
      <div className="mt-5 flex flex-col gap-2.5">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0" style={{ background: soft, color }}>{i + 1}</span>
            <span className="text-[14.5px] text-ink-sub">{s}</span>
          </div>
        ))}
      </div>
      <p className="mt-5 pt-4 border-t border-line text-[12.5px] font-semibold flex items-center gap-1.5" style={{ color }}>
        <Icon name="check-circle" size={14} /> {note}
      </p>
    </div>
  )
}

function ReportPreview() {
  const summary = [
    { label: '취약점', value: '7건', color: 'var(--color-ink)' },
    { label: '최고 CVSS', value: '9.8', color: 'var(--color-sev-critical)' },
    { label: 'Critical', value: '1건', color: 'var(--color-sev-critical)' },
    { label: 'High', value: '1건', color: 'var(--color-sev-high)' },
  ]
  const vulns: { sev: string; color: string; bg: string; cvss: string; name: string; loc: string }[] = [
    { sev: 'Critical', color: 'var(--color-sev-critical)', bg: '#fde7e9', cvss: '9.8', name: 'SQL Injection', loc: 'POST /api/login → username' },
    { sev: 'High', color: 'var(--color-sev-high)', bg: 'var(--color-danger-soft)', cvss: '7.4', name: 'Reflected XSS', loc: 'GET /search → q' },
    { sev: 'Medium', color: 'var(--color-sev-medium)', bg: 'var(--color-warning-soft)', cvss: '5.9', name: 'Weak Crypto', loc: 'CryptoUtil.encrypt()' },
  ]
  return (
    <div className="rounded-2xl bg-white border border-line shadow-[0_24px_60px_-20px_rgba(25,31,40,0.18)] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-line bg-surface">
        <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
        <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        <div className="ml-3 flex-1 max-w-xs h-6 rounded-md bg-white border border-line flex items-center px-3">
          <span className="text-[11px] text-ink-muted">app.scanops.io/report</span>
        </div>
      </div>
      <div className="p-5 sm:p-7 text-left">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded-full bg-brand-soft text-brand text-[11px] font-bold">DAST</span>
          <span className="text-[12px] text-ink-muted">2026.06.27 스캔 완료</span>
        </div>
        <p className="text-lg font-bold text-ink">https://shop.example.com</p>

        <div className="mt-4 grid grid-cols-4 gap-2 sm:gap-2.5">
          {summary.map((s) => (
            <div key={s.label} className="rounded-xl bg-surface border border-line px-2 py-2.5 sm:px-3 sm:py-3">
              <p className="text-[10.5px] sm:text-[11px] text-ink-muted font-medium">{s.label}</p>
              <p className="text-[16px] sm:text-xl font-bold mt-0.5 tnum" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-lg bg-brand-soft px-3 py-2.5">
          <span className="text-brand"><Icon name="shield" size={15} /></span>
          <span className="text-[12.5px] text-brand font-medium">소스코드는 서버에 저장되지 않고, 결과만 남습니다</span>
        </div>

        <div className="mt-3 flex flex-col gap-2">
          {vulns.map((v) => (
            <div key={v.name} className="flex items-center gap-3 rounded-xl bg-white border border-line px-3.5 py-3">
              <div className="w-11 h-11 rounded-lg flex flex-col items-center justify-center shrink-0" style={{ background: v.bg }}>
                <span className="text-sm font-bold leading-none tnum" style={{ color: v.color }}>{v.cvss}</span>
                <span className="text-[8px] font-semibold mt-0.5" style={{ color: v.color }}>CVSS</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: v.bg, color: v.color }}>{v.sev}</span>
                  <span className="text-sm font-bold text-ink truncate">{v.name}</span>
                </div>
                <p className="text-[12px] text-ink-muted mt-0.5 truncate">{v.loc}</p>
              </div>
              <span className="text-ink-faint shrink-0"><Icon name="chevron-right" size={16} /></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
