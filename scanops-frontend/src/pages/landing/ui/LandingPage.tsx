import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../../../shared/ui/Logo'
import Icon, { type IconName } from '../../../shared/ui/Icon'
import Button from '../../../shared/ui/Button'

// ── data ─────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: '성능', href: '#benchmark' },
  { label: '왜 다른가', href: '#why' },
  { label: '코드 보안', href: '#security' },
  { label: '요금제', href: '#pricing' },
]

const stats = [
  { value: '62.1', label: 'F1 · 4개 벤치 평균 (Grok 56.2)' },
  { value: '66.5%', label: '평균 취약점 재현율 (Grok 57.9%)' },
  { value: '1~2분', label: '평균 분석 소요 시간' },
  { value: '0건', label: '외부로 나가는 소스코드' },
]

// 4개 외부 표준 벤치마크(CVEfixes·OWASP·CyberNative·DiverseVul) 평균 · 재현 가능(temperature=0)
const compare = [
  { label: 'F1 점수', scanops: 62.1, grok: 56.2 },
  { label: '취약점 재현율', scanops: 66.5, grok: 57.9 },
  { label: '종합 정확도', scanops: 65.1, grok: 58.8 },
]

const whyCards: { icon: IconName; title: string; desc: string }[] = [
  {
    icon: 'cpu',
    title: '보안만 학습한 전용 모델',
    desc: '범용 AI는 모든 걸 조금씩 압니다. ScanOps는 보안 취약점만 집중 학습해, 더 작은 모델로도 같은 코드에서 더 많이 찾아냅니다.',
  },
  {
    icon: 'refresh-cw',
    title: '최신 취약점까지 커버',
    desc: '범용 AI는 학습한 시점까지만 압니다. ScanOps는 전 세계 취약점 정보(NVD)를 실시간으로 찾아보며 검사해, 어제 공개된 CVE도 놓치지 않아요.',
  },
  {
    icon: 'shield',
    title: '오탐을 그래프로 걸러냄',
    desc: 'AI가 의심한 취약점을 정적분석(taint graph)이 한 번 더 검증합니다. 안전한 코드를 위험하다고 잘못 경고하는 오탐률을 상용 Grok-3보다 낮게 억제합니다.',
  },
]

const scanModes: { tag: string; icon: IconName; accent: string; soft: string; title: string; desc: string }[] = [
  { tag: 'DAST', icon: 'globe', accent: 'var(--color-scan-web)', soft: 'var(--color-brand-soft)', title: '웹사이트 동적 분석', desc: '실행 중인 앱을 외부에서 스캔. 코드 전송 없이 URL만으로 진단합니다.' },
  { tag: 'SAST', icon: 'box', accent: 'var(--color-scan-code)', soft: 'var(--color-purple-soft)', title: '레포 전체 정적 분석', desc: '보안 특화 모델이 레포 소스코드를 분석해 취약 패턴을 찾습니다.' },
  { tag: 'Actions', icon: 'git-pull-request', accent: 'var(--color-scan-pr)', soft: 'var(--color-success-soft)', title: 'PR 자동 분석', desc: '고객 인프라 안에서 PR diff를 검사하고 결과만 전송. 코드가 밖으로 안 나갑니다.' },
]

const plans = [
  { name: 'Free', price: '₩0', per: '', desc: '가입하고 가볍게 체험', feats: ['DAST 웹 스캔 1회', '결과 1개월 보관'], primary: false },
  { name: 'Pro', price: '₩29,900', per: '/월', desc: '개인·소규모 팀에 추천', feats: ['DAST 월 5회', 'SAST 월 10만 줄', 'PR 자동 분석', 'AI 브리핑·PDF'], primary: true },
  { name: 'Max', price: '₩99,000', per: '/월', desc: '본격적인 보안 운영', feats: ['DAST 월 30회', 'SAST 월 50만 줄', '우선 분석 큐'], primary: false },
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
            4개 외부 표준 벤치마크 평균 상용 Grok-3 초월
          </div>
          <h1 className="text-[40px] sm:text-[60px] font-extrabold tracking-tight leading-[1.08]">
            당신의 코드는,
            <br />
            <span className="text-brand">안전한가요?</span>
          </h1>
          <p className="mt-6 max-w-2xl text-[18px] sm:text-[20px] text-ink-sub leading-relaxed break-keep [text-wrap:balance]">
            ChatGPT·Grok 같은 범용 AI가 놓치는 취약점까지, 보안만 집중 학습한 ScanOps가 찾아냅니다.
          </p>
          <p className="mt-2 max-w-2xl text-[18px] sm:text-[20px] text-ink-sub leading-relaxed break-keep [text-wrap:balance]">
            URL이나 GitHub 레포만 넣으면 위험도와 고치는 방법까지, 한국어 리포트로 알려드려요.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3">
            <Button size="lg" rightIcon="arrow-right" onClick={() => navigate('/signup')}>무료로 스캔 시작하기</Button>
            <Button size="lg" variant="weak" leftIcon="bar-chart-2" onClick={() => { document.getElementById('benchmark')?.scrollIntoView({ behavior: 'smooth' }) }}>성능 비교 보기</Button>
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
          <SectionHeading tag="성능" title="범용 AI보다 더 잡고, 덜 틀립니다" sub="같은 코드를 넣어도 결과가 다릅니다. 보안에만 특화 학습된 ScanOps는 더 많이 찾고, 덜 틀립니다. 우리가 만들지 않은 외부 표준 평가셋으로 검증했어요." />
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="rounded-2xl bg-white border border-line p-7">
              <p className="text-[15px] font-bold text-ink mb-1">4개 외부 표준 벤치마크 평균</p>
              <p className="text-xs text-ink-muted mb-6">CVEfixes·OWASP·CyberNative·DiverseVul · 높을수록 좋음</p>
              {compare.map((c) => <CompareBar key={c.label} {...c} />)}
              <div className="mt-6 flex items-center gap-5 text-xs">
                <Legend color="var(--color-brand)" label="ScanOps" />
                <Legend color="var(--color-line-strong)" label="Grok-3 (상용)" />
              </div>
            </div>
            <div className="rounded-2xl bg-ink p-7 flex flex-col self-start">
              <div>
                <p className="text-sm font-bold text-white flex items-center gap-2"><Icon name="trending-down" size={16} /> 오탐은 더 적게</p>
                <p className="text-xs text-ink-faint mt-1.5 leading-relaxed">‘안전한 코드를 위험하다고 잘못 경고’하는 오탐이 적을수록, 진짜 위험에 집중할 수 있어요.</p>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                  <p className="text-[11px] text-ink-faint font-medium">ScanOps 오탐률</p>
                  <p className="text-[34px] font-extrabold text-white mt-1 tnum leading-none">36.3<span className="text-lg">%</span></p>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                  <p className="text-[11px] text-ink-faint font-medium">Grok-3 오탐률</p>
                  <p className="text-[34px] font-extrabold text-ink-faint mt-1 tnum leading-none">40.1<span className="text-lg">%</span></p>
                </div>
              </div>
              <p className="mt-6 text-[12px] text-ink-faint leading-relaxed">* CVEfixes·OWASP·CyberNative·DiverseVul 4개 외부 표준 벤치마크 평균 · 재현 가능(temperature=0).</p>
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

function CompareBar({ label, scanops, grok }: { label: string; scanops: number; grok: number }) {
  return (
    <div className="mb-5 last:mb-0">
      <p className="text-[13px] font-medium text-ink-sub mb-2">{label}</p>
      <div className="flex items-center gap-2.5 mb-1.5">
        <div className="flex-1 h-2.5 rounded-full bg-field overflow-hidden">
          <div className="h-full rounded-full bg-brand" style={{ width: `${scanops}%` }} />
        </div>
        <span className="w-12 text-right text-[13px] font-bold text-brand tnum">{scanops}</span>
      </div>
      <div className="flex items-center gap-2.5">
        <div className="flex-1 h-2.5 rounded-full bg-field overflow-hidden">
          <div className="h-full rounded-full bg-line-strong" style={{ width: `${grok}%` }} />
        </div>
        <span className="w-12 text-right text-[13px] font-semibold text-ink-muted tnum">{grok}</span>
      </div>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-ink-muted">
      <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />{label}
    </span>
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
    { label: '오탐률', value: '12.7%', color: 'var(--color-success)' },
    { label: '분석 시간', value: '3분', color: 'var(--color-brand)' },
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
          <span className="text-[12.5px] text-brand font-medium">외부 표준 벤치마크에서 검증된 정확도 · 정적분석 그래프로 오탐 억제</span>
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
