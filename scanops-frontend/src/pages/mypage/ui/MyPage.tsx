import { useNavigate } from 'react-router-dom'
import AppNav from '../../../shared/ui/AppNav'

const SIDE_ITEMS = [
  { icon: '👤', label: '개인정보', active: true },
  { icon: '📊', label: '사용량', active: false },
  { icon: '🗂', label: '스캔 기록', active: false },
  { icon: '💳', label: '구독 관리', active: false },
  { icon: '🔒', label: '보안', active: false },
]

const METERS = [
  { label: 'DAST 스캔', value: '7 / 10회', pct: 70, color: 'var(--color-brand)' },
  { label: 'SAST 분석 (LOC)', value: '32,400 / 150,000 줄', pct: 22, color: 'var(--color-scan-code)' },
  { label: 'GitHub Actions (LOC)', value: '12,100 / 50,000 줄', pct: 24, color: '#15b36a' },
]

const PROFILE = [
  { label: '이름', value: '김세한', action: '수정' },
  { label: '이메일', value: 'tudyver1@gmail.com', action: '수정' },
  { label: '비밀번호', value: '••••••••', action: '변경' },
  { label: 'GitHub 계정', value: '@HanseKim 연결됨', action: '해제' },
]

export default function MyPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-surface">
      <AppNav />

      <main className="max-w-[928px] mx-auto px-6 py-10">
        <h1 className="text-[26px] font-bold text-ink tracking-tight mb-6">마이페이지</h1>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Sidebar */}
          <aside className="w-full md:w-[260px] flex flex-col gap-4 flex-shrink-0">
            <div className="rounded-2xl bg-white border border-line px-5 py-6 flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-brand" />
              <p className="text-[17px] font-bold text-ink">김세한</p>
              <p className="text-[13px] text-ink-muted">tudyver1@gmail.com</p>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold">
                ✓ GitHub 연결됨
              </span>
            </div>
            <nav className="rounded-2xl bg-white border border-line p-2">
              {SIDE_ITEMS.map((it) => (
                <button
                  key={it.label}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-sm transition-colors ${
                    it.active ? 'bg-brand-soft text-brand font-semibold' : 'text-ink-sub font-medium hover:bg-surface'
                  }`}
                >
                  <span>{it.icon}</span>
                  {it.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main */}
          <div className="flex-1 w-full flex flex-col gap-4">
            {/* Plan banner */}
            <div className="rounded-2xl bg-ink px-6 py-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-white">Pro 플랜</span>
                  <span className="px-2 py-0.5 rounded-full bg-brand text-white text-[11px] font-bold">구독중</span>
                </div>
                <p className="mt-1.5 text-[13px] text-ink-faint">다음 결제일 2026.07.05 · 월 9,900원</p>
              </div>
              <button
                onClick={() => navigate('/pricing')}
                className="px-4 py-2.5 rounded-[10px] bg-white text-ink text-[13px] font-semibold hover:bg-surface transition-colors"
              >
                구독 관리
              </button>
            </div>

            {/* Usage */}
            <section className="rounded-2xl bg-white border border-line px-6 py-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-ink">이번 달 사용량</h2>
                <span className="text-xs text-ink-muted">2026년 6월 · 매월 1일 초기화</span>
              </div>
              <div className="flex flex-col gap-4.5 gap-y-5">
                {METERS.map((m) => (
                  <div key={m.label} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-ink">{m.label}</span>
                      <span className="text-[13px] text-ink-sub font-medium">{m.value}</span>
                    </div>
                    <div className="h-2 rounded-full bg-field overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${m.pct}%`, background: m.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Profile */}
            <section className="rounded-2xl bg-white border border-line px-6 pt-6 pb-2">
              <h2 className="text-base font-bold text-ink mb-3">개인정보</h2>
              {PROFILE.map((r, i) => (
                <div key={r.label}>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[12.5px] text-ink-muted font-medium">{r.label}</span>
                      <span className="text-[14.5px] text-ink font-semibold">{r.value}</span>
                    </div>
                    <button className="text-[13px] text-brand font-semibold hover:underline">{r.action}</button>
                  </div>
                  {i < PROFILE.length - 1 && <div className="h-px bg-line" />}
                </div>
              ))}
            </section>

            {/* Danger zone */}
            <section className="rounded-2xl bg-red-50/60 border border-red-200/70 px-6 py-5 flex flex-col gap-3.5">
              <h2 className="text-[15px] font-bold text-red-500">위험 영역</h2>
              <DangerRow
                title="스캔 기록 전체 삭제"
                desc="모든 스캔 결과를 영구 삭제합니다."
                btn="전체 삭제"
              />
              <DangerRow title="회원 탈퇴" desc="계정과 모든 데이터가 삭제됩니다." btn="회원 탈퇴" />
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

function DangerRow({ title, desc, btn }: { title: string; desc: string; btn: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold text-ink">{title}</span>
        <span className="text-[12.5px] text-ink-sub">{desc}</span>
      </div>
      <button className="px-3.5 py-2 rounded-[9px] bg-white border border-red-200 text-[12.5px] text-red-500 font-semibold hover:bg-red-50 transition-colors">
        {btn}
      </button>
    </div>
  )
}
