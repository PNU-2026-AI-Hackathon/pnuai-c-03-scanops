import { useNavigate } from 'react-router-dom'
import Logo from '../../../shared/ui/Logo'

// ── data ─────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: '차별점', href: '#benchmark' },
  { label: '신뢰성', href: '#trust' },
  { label: '코드 보안', href: '#security' },
  { label: '요금제', href: '#pricing' },
]

const stats = [
  { value: '100%', label: 'DVWA 취약점 탐지율' },
  { value: '1~2분', label: '평균 분석 소요 시간' },
  { value: '3가지', label: 'DAST · SAST · Actions' },
]

const trustFeatures = [
  {
    icon: '🎯',
    title: '수치로 증명하는 신뢰도',
    desc: '"면책 문구" 대신 DVWA 벤치마크 기준 탐지율·오탐율을 공식 수치로 제시합니다.',
  },
  {
    icon: '🔁',
    title: '재현성 검증',
    desc: '동일 URL을 다시 스캔해 결과 일관성을 비교합니다. 매번 흔들리지 않는 분석.',
  },
  {
    icon: '🤝',
    title: '다중 AI 교차검증',
    desc: 'GPT→Claude→Gemini 폴백 구조로 결과가 일치하는지 비교하고, 불일치 시 "검토 필요"로 표시합니다.',
  },
  {
    icon: '📉',
    title: 'CVSS 기반 노이즈 감소',
    desc: 'CVSS 7.0 이상을 우선 표시해 실질적인 오탐 체감률을 낮춥니다.',
  },
]

const scanModes = [
  {
    tag: 'DAST',
    icon: '🌐',
    accent: 'var(--color-brand)',
    soft: 'var(--color-brand-soft)',
    title: '웹사이트 동적 분석',
    desc: '실행 중인 앱을 외부에서 스캔. 코드 전송 없이 URL만으로 진단합니다.',
    meter: '스캔 횟수',
  },
  {
    tag: 'SAST',
    icon: '📦',
    accent: 'var(--color-scan-code)',
    soft: '#f3eefe',
    title: '레포 전체 정적 분석',
    desc: '파인튜닝 모델이 레포 소스코드를 정적 분석해 취약 패턴을 찾습니다.',
    meter: 'LOC 누적',
  },
  {
    tag: 'Actions',
    icon: '🔀',
    accent: 'var(--color-ink)',
    soft: 'var(--color-field)',
    title: 'PR 자동 분석',
    desc: '고객 인프라 안에서 PR diff를 검사하고 결과만 전송. 코드가 밖으로 안 나갑니다.',
    meter: 'LOC 누적',
  },
]

const plans = [
  {
    name: 'Free',
    price: '₩0',
    per: '',
    desc: '가입하고 가볍게 체험',
    feats: ['DAST 웹 스캔 1회', '결과 1개월 보관'],
    primary: false,
  },
  {
    name: 'Pro',
    price: '₩9,900',
    per: '/월',
    desc: '개인·소규모 팀에 추천',
    feats: ['DAST 월 10회', 'Actions 월 5만 줄', 'SAST 월 15만 줄', 'AI 브리핑·PDF'],
    primary: true,
  },
  {
    name: 'Max',
    price: '₩29,900',
    per: '/월',
    desc: '본격적인 보안 운영',
    feats: ['DAST 월 100회', 'Actions 월 50만 줄', 'SAST 월 100만 줄', '우선 분석 큐'],
    primary: false,
  },
]

// ── page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white text-ink">
      {/* Nav */}
      <nav className="sticky top-0 z-30 flex items-center justify-between px-6 sm:px-10 h-16 bg-white/80 backdrop-blur-md border-b border-line">
        <div className="flex items-center gap-9">
          <Logo />
          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="text-sm font-medium text-ink-sub hover:text-ink transition-colors">
                {l.label}
              </a>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={() => navigate('/login')} className="hidden sm:block text-sm font-semibold text-ink-sub hover:text-ink px-3 py-2">
            로그인
          </button>
          <button
            onClick={() => navigate('/scan')}
            className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand-hover transition-colors"
          >
            스캔 시작하기
          </button>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[520px] -z-10"
          style={{ background: 'radial-gradient(60% 100% at 50% 0%, #eaf2fe 0%, rgba(255,255,255,0) 70%)' }}
        />
        <div className="max-w-5xl mx-auto px-6 pt-20 pb-10 text-center flex flex-col items-center">
          <div className="mb-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-soft text-brand text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-brand" />
            보안 특화 파인튜닝 모델 · AI 자동 진단
          </div>
          <h1 className="text-[40px] sm:text-[56px] font-extrabold tracking-tight leading-[1.12]">
            범용 AI가 놓치는 취약점,
            <br />
            <span className="text-brand">ScanOps는 잡습니다</span>
          </h1>
          <p className="mt-6 max-w-xl text-[17px] text-ink-sub leading-relaxed">
            URL·레포·PR 하나로 XSS·SQL Injection·CSRF를 자동 진단하고, 벤치마크로 검증된 정확도의 AI 보안
            브리핑을 받아보세요.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/scan')}
              className="px-7 py-3.5 rounded-xl bg-brand text-white font-semibold text-sm hover:bg-brand-hover transition-colors"
            >
              무료로 스캔 시작하기
            </button>
            <a
              href="#benchmark"
              className="px-7 py-3.5 rounded-xl bg-brand-soft text-brand font-semibold text-sm hover:bg-line transition-colors"
            >
              성능 비교 보기
            </a>
          </div>
        </div>

        {/* Product preview (replaces the old "web image" placeholder) */}
        <div className="max-w-4xl mx-auto px-6 pb-4">
          <ReportPreview />
        </div>
      </header>

      {/* Stats */}
      <section className="py-12 border-y border-line bg-surface">
        <div className="max-w-3xl mx-auto px-6 grid grid-cols-3 gap-6 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">{s.value}</p>
              <p className="mt-2 text-[13px] text-ink-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benchmark / differentiation */}
      <section id="benchmark" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <SectionHeading
            tag="차별점"
            title="범용 AI보다 정확합니다"
            sub="같은 코드를 넣어도 결과가 다릅니다. 보안에만 특화 학습된 ScanOps는 더 많이 찾고, 덜 틀립니다."
          />
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* bars */}
            <div className="rounded-2xl bg-white border border-line p-7">
              <p className="text-sm font-bold text-ink mb-1">DVWA 벤치마크 비교</p>
              <p className="text-xs text-ink-muted mb-6">동일 취약 코드셋 기준 · 높을수록 좋음</p>
              <CompareBar label="취약점 탐지율" scanops={100} generic={64} />
              <CompareBar label="한국어 리포트 품질" scanops={98} generic={71} />
              <CompareBar label="위치(파일·라인) 정확도" scanops={95} generic={52} />
              <div className="mt-6 flex items-center gap-5 text-xs">
                <Legend color="var(--color-brand)" label="ScanOps" />
                <Legend color="var(--color-line-strong)" label="범용 LLM (Claude·GPT)" />
              </div>
            </div>
            {/* false-positive callout */}
            <div className="rounded-2xl bg-ink p-7 flex flex-col justify-between">
              <div>
                <p className="text-sm font-bold text-white">오탐은 더 적게</p>
                <p className="text-xs text-ink-faint mt-1">불필요한 경고가 적을수록 실제 작업에 집중할 수 있어요.</p>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                  <p className="text-[11px] text-ink-faint font-medium">ScanOps 오탐율</p>
                  <p className="text-3xl font-extrabold text-white mt-1">3.2<span className="text-lg">%</span></p>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                  <p className="text-[11px] text-ink-faint font-medium">범용 LLM 오탐율</p>
                  <p className="text-3xl font-extrabold text-ink-faint mt-1">21<span className="text-lg">%</span></p>
                </div>
              </div>
              <p className="mt-6 text-[12px] text-ink-faint leading-relaxed">
                * DVWA 대상 내부 테스트 기준의 잠정 수치이며, 베타에서 공식 벤치마크로 갱신됩니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust / reliability */}
      <section id="trust" className="py-24 px-6 bg-surface border-y border-line">
        <div className="max-w-5xl mx-auto">
          <SectionHeading
            tag="신뢰성"
            title='면책 문구 대신, 검증된 수치로'
            sub='"참고용입니다"가 아니라 "벤치마크 기준 OO% 정확도로 검증된 분석 결과입니다"라고 말합니다.'
          />
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trustFeatures.map((f) => (
              <div key={f.title} className="rounded-2xl bg-white border border-line p-6">
                <div className="w-11 h-11 rounded-xl bg-brand-soft flex items-center justify-center text-xl mb-4">
                  {f.icon}
                </div>
                <h3 className="font-bold text-[15px] mb-1.5">{f.title}</h3>
                <p className="text-[13px] text-ink-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code security (structural separation) */}
      <section id="security" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <SectionHeading
            tag="코드 보안"
            title="소스코드는 서버로 오지 않습니다"
            sub="가장 강력한 보안은 정책이 아니라 구조입니다. ScanOps는 코드가 외부로 나가지 않도록 설계됐습니다."
          />
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-5">
            <FlowCard
              badge="Free · Pro"
              badgeColor="var(--color-brand)"
              badgeBg="var(--color-brand-soft)"
              title="URL 스캔 — 코드 전송 없음"
              steps={['웹 URL 입력', 'ScanOps가 외부에서 동적 스캔', '취약점 리포트만 생성']}
              note="소스코드 자체가 서버로 전송되지 않습니다."
            />
            <FlowCard
              badge="GitHub Actions"
              badgeColor="var(--color-scan-code)"
              badgeBg="#f3eefe"
              title="레포 스캔 — 고객 인프라 내 분석"
              steps={['PR 이벤트 발생', '고객 Actions 러너 안에서 직접 스캔', '결과(리포트)만 ScanOps로 전송']}
              note="코드는 고객 인프라를 벗어나지 않습니다."
            />
          </div>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              ['🧠', '메모리에서만 처리', 'DB에는 결과만 저장, 코드는 미저장'],
              ['🗑️', '분석 후 즉시 폐기', '삭제 버튼·삭제 증빙 로그로 증명'],
              ['🔑', 'read-only 권한', 'GitHub OAuth 최소 scope만 요청'],
              ['🔒', 'HTTPS 전송 암호화', '모든 통신 기본 암호화'],
            ].map(([icon, t, d]) => (
              <div key={t} className="rounded-xl bg-surface border border-line px-4 py-4">
                <div className="text-lg mb-2">{icon}</div>
                <p className="text-[13.5px] font-semibold text-ink">{t}</p>
                <p className="text-[12px] text-ink-muted mt-0.5 leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scan modes */}
      <section className="py-24 px-6 bg-surface border-y border-line">
        <div className="max-w-5xl mx-auto">
          <SectionHeading
            tag="3가지 스캔 방식"
            title="웹부터 레포, PR까지 한 번에"
            sub="검사 대상과 상황에 맞는 방식을 선택하세요. 사용량은 방식별 미터로 투명하게 관리됩니다."
          />
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {scanModes.map((m) => (
              <div key={m.tag} className="rounded-2xl bg-white border border-line p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ background: m.soft }}>
                    {m.icon}
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold" style={{ background: m.soft, color: m.accent }}>
                    {m.tag}
                  </span>
                </div>
                <h3 className="font-bold text-base mb-1.5">{m.title}</h3>
                <p className="text-[13px] text-ink-muted leading-relaxed">{m.desc}</p>
                <p className="mt-4 pt-3 border-t border-line text-[12px] text-ink-faint font-medium">
                  미터 · <span className="text-ink-sub font-semibold">{m.meter}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI briefing */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block px-3 py-1.5 rounded-full bg-brand-soft text-brand text-xs font-bold mb-4">
              AI 보안 브리핑
            </span>
            <h2 className="text-3xl font-bold leading-snug">
              결과를 그대로 AI에 붙여넣어
              <br />
              <span className="text-brand">수정 코드까지</span> 받으세요
            </h2>
            <p className="mt-5 text-ink-sub leading-relaxed">
              PDF의 법적 효력에 기대지 않습니다. 대신 마크다운 형태의 보안 브리핑으로 출력해 Claude·GPT에 바로
              붙여넣을 수 있어요. "이 브리핑을 AI에 입력하면 취약점별 수정 코드를 즉시 받을 수 있습니다."
            </p>
            <p className="mt-4 text-[13px] text-ink-muted">
              ISO 27001 · ISMS 자체 점검 보조 자료로도 활용할 수 있습니다.
            </p>
          </div>
          <BriefingMock />
        </div>
      </section>

      {/* Pricing teaser */}
      <section id="pricing" className="py-24 px-6 bg-surface border-y border-line">
        <div className="max-w-5xl mx-auto">
          <SectionHeading
            tag="요금제"
            title="필요한 만큼만, 합리적으로"
            sub="GitHub Actions 연동이 핵심 락인 포인트 — 한 번 워크플로우에 붙이면 매 PR마다 자동 스캔됩니다."
          />
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`rounded-2xl bg-white p-6 flex flex-col ${p.primary ? 'border-2 border-brand' : 'border border-line'}`}
              >
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold">{p.name}</h3>
                  {p.primary && <span className="px-2 py-0.5 rounded-full bg-brand text-white text-[11px] font-bold">인기</span>}
                </div>
                <p className="mt-1 text-[13px] text-ink-muted">{p.desc}</p>
                <div className="mt-4 flex items-baseline gap-0.5">
                  <span className="text-[28px] font-bold tracking-tight">{p.price}</span>
                  <span className="text-sm text-ink-muted font-medium">{p.per}</span>
                </div>
                <ul className="mt-5 flex flex-col gap-2.5">
                  {p.feats.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-[13px] text-ink-sub">
                      <span className="text-emerald-500 font-bold">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <button onClick={() => navigate('/pricing')} className="text-brand text-sm font-semibold hover:underline">
              App 플랜·전체 비교 보기 →
            </button>
          </div>
        </div>
      </section>

      {/* GitHub App CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 text-violet-600 text-xs font-semibold">
            GitHub App
          </div>
          <h2 className="text-3xl font-bold mb-6">
            PR 올리면 <span className="text-violet-600">자동으로 분석</span>됩니다
          </h2>
          <p className="text-ink-sub text-base leading-relaxed mb-10">
            ScanOps GitHub App을 레포에 설치하면 PR마다 변경된 코드가 자동으로 검사돼요. 발견된 취약점은 해당
            코드 줄에 바로 댓글로, 뭐가 문제인지·어떻게 고치면 되는지 한국어로 알려줍니다.
          </p>
          <a
            href="https://github.com/apps/scanops-security-scanner"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-7 py-3.5 rounded-xl bg-violet-600 text-white font-semibold text-sm hover:bg-violet-500 transition-colors"
          >
            GitHub App 설치하기
          </a>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto rounded-3xl bg-ink px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-white">지금 무료로 시작해보세요</h2>
          <p className="mt-3 text-ink-faint">회원가입하면 DAST 1회를 무료로 체험할 수 있어요.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/signup')}
              className="px-7 py-3.5 rounded-xl bg-brand text-white font-semibold text-sm hover:bg-brand-hover transition-colors"
            >
              무료로 시작하기
            </button>
            <button
              onClick={() => navigate('/scan')}
              className="px-7 py-3.5 rounded-xl bg-white/10 text-white font-semibold text-sm hover:bg-white/20 transition-colors"
            >
              먼저 스캔 둘러보기
            </button>
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-xs text-ink-faint border-t border-line">
        © 2026 ScanOps · 보안 진단 자동화 솔루션
      </footer>
    </div>
  )
}

// ── sub-components ────────────────────────────────────────────────────────────

function SectionHeading({ tag, title, sub }: { tag: string; title: string; sub: string }) {
  return (
    <div className="text-center flex flex-col items-center">
      <span className="px-3 py-1.5 rounded-full bg-brand-soft text-brand text-xs font-bold mb-3">{tag}</span>
      <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
      <p className="mt-3 max-w-2xl text-ink-sub text-[15px] leading-relaxed">{sub}</p>
    </div>
  )
}

function CompareBar({ label, scanops, generic }: { label: string; scanops: number; generic: number }) {
  return (
    <div className="mb-5 last:mb-0">
      <p className="text-[13px] font-medium text-ink-sub mb-2">{label}</p>
      <div className="flex items-center gap-2.5 mb-1.5">
        <div className="flex-1 h-2.5 rounded-full bg-field overflow-hidden">
          <div className="h-full rounded-full bg-brand" style={{ width: `${scanops}%` }} />
        </div>
        <span className="w-10 text-right text-[13px] font-bold text-brand">{scanops}%</span>
      </div>
      <div className="flex items-center gap-2.5">
        <div className="flex-1 h-2.5 rounded-full bg-field overflow-hidden">
          <div className="h-full rounded-full bg-line-strong" style={{ width: `${generic}%` }} />
        </div>
        <span className="w-10 text-right text-[13px] font-semibold text-ink-muted">{generic}%</span>
      </div>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-ink-muted">
      <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  )
}

function FlowCard({
  badge,
  badgeColor,
  badgeBg,
  title,
  steps,
  note,
}: {
  badge: string
  badgeColor: string
  badgeBg: string
  title: string
  steps: string[]
  note: string
}) {
  return (
    <div className="rounded-2xl bg-white border border-line p-7">
      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold" style={{ background: badgeBg, color: badgeColor }}>
        {badge}
      </span>
      <h3 className="mt-4 font-bold text-lg">{title}</h3>
      <div className="mt-5 flex flex-col gap-2.5">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-3">
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0"
              style={{ background: badgeBg, color: badgeColor }}
            >
              {i + 1}
            </span>
            <span className="text-[13.5px] text-ink-sub">{s}</span>
          </div>
        ))}
      </div>
      <p className="mt-5 pt-4 border-t border-line text-[12.5px] font-semibold" style={{ color: badgeColor }}>
        ✓ {note}
      </p>
    </div>
  )
}

function ReportPreview() {
  const summary = [
    { label: '평균 CVSS', value: '6.4', color: '#ff8a00' },
    { label: '취약점', value: '7건', color: 'var(--color-ink)' },
    { label: '최고 위험도', value: '8.8', color: '#f04452' },
    { label: '분석 신뢰도', value: '94%', color: '#15b36a' },
  ]
  const vulns = [
    { sev: 'Critical', color: '#f04452', bg: '#fdecee', cvss: '8.8', name: 'SQL Injection', loc: '/api/products?id=' },
    { sev: 'High', color: '#ff8a00', bg: '#fff1e0', cvss: '7.4', name: 'Reflected XSS', loc: '/search?q=' },
    { sev: 'Medium', color: '#f5a623', bg: '#fef6e6', cvss: '5.3', name: 'Missing CSRF Token', loc: '/account/update' },
  ]
  return (
    <div className="rounded-2xl bg-white border border-line shadow-[0_24px_60px_-20px_rgba(25,31,40,0.18)] overflow-hidden">
      {/* browser chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-line bg-surface">
        <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
        <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        <div className="ml-3 flex-1 max-w-xs h-6 rounded-md bg-white border border-line flex items-center px-3">
          <span className="text-[11px] text-ink-muted">app.scanops.io/report</span>
        </div>
      </div>
      {/* body */}
      <div className="p-5 sm:p-7 text-left">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded-full bg-brand-soft text-brand text-[11px] font-bold">DAST</span>
          <span className="text-[12px] text-ink-muted">2026.06.05 스캔 완료</span>
        </div>
        <p className="text-lg font-bold text-ink">https://shop.example.com</p>

        <div className="mt-4 grid grid-cols-4 gap-2.5">
          {summary.map((s) => (
            <div key={s.label} className="rounded-xl bg-surface border border-line px-3 py-3">
              <p className="text-[11px] text-ink-muted font-medium">{s.label}</p>
              <p className="text-xl font-bold mt-0.5" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-lg bg-brand-soft px-3 py-2.5">
          <span className="text-brand font-bold text-sm">✓</span>
          <span className="text-[12.5px] text-brand font-medium">벤치마크 기준 94% 정확도로 검증 · 다중 AI 교차검증 통과</span>
        </div>

        <div className="mt-3 flex flex-col gap-2">
          {vulns.map((v) => (
            <div key={v.name} className="flex items-center gap-3 rounded-xl bg-white border border-line px-3.5 py-3">
              <div className="w-11 h-11 rounded-lg flex flex-col items-center justify-center flex-shrink-0" style={{ background: v.bg }}>
                <span className="text-sm font-bold leading-none" style={{ color: v.color }}>{v.cvss}</span>
                <span className="text-[8px] font-semibold mt-0.5" style={{ color: v.color }}>CVSS</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: v.bg, color: v.color }}>{v.sev}</span>
                  <span className="text-sm font-bold text-ink truncate">{v.name}</span>
                </div>
                <p className="text-[12px] text-ink-muted mt-0.5">위치: {v.loc}</p>
              </div>
              <span className="text-[12px] text-brand font-semibold flex-shrink-0">자세히 →</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function BriefingMock() {
  return (
    <div className="rounded-2xl bg-ink p-5 sm:p-6 font-mono text-[12.5px] leading-relaxed shadow-[0_24px_60px_-20px_rgba(25,31,40,0.3)]">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
        <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        <span className="ml-2 text-ink-faint text-[11px]">security-briefing.md</span>
      </div>
      <pre className="whitespace-pre-wrap text-ink-faint">
        <span className="text-brand">## SQL Injection</span>{'\n'}
        <span className="text-white">- 위치:</span> /api/products?id={'\n'}
        <span className="text-white">- 위험도:</span> <span className="text-[#f04452]">Critical (CVSS 8.8)</span>{'\n'}
        <span className="text-white">- 원인:</span> 사용자 입력이 쿼리에 직접 연결됨{'\n'}
        <span className="text-white">- 신뢰도:</span> <span className="text-[#15b36a]">97% (교차검증 일치)</span>{'\n'}
        {'\n'}
        <span className="text-ink-muted"># ↑ 이 브리핑을 Claude·GPT에</span>{'\n'}
        <span className="text-ink-muted"># 붙여넣으면 수정 코드를 즉시 받습니다</span>
      </pre>
    </div>
  )
}
