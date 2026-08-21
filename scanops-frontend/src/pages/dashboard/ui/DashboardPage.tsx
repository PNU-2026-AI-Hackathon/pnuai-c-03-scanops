import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppNav from '../../../shared/ui/AppNav'
import Card from '../../../shared/ui/Card'
import Button from '../../../shared/ui/Button'
import Icon, { type IconName } from '../../../shared/ui/Icon'
import Badge from '../../../shared/ui/Badge'
import ProgressBar from '../../../shared/ui/ProgressBar'
import TokenBalance from '../../../shared/ui/TokenBalance'
import { useAuth } from '../../../shared/lib/auth'
import { MODE_META, relativeTime, type ScanSummary } from '../../../shared/lib/mock'
import { fetchRecentScans } from '../../../shared/api/scan'
import { fetchWallet, type TokenWallet } from '../../../shared/api/tokens'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [scans, setScans] = useState<ScanSummary[] | null>(null)
  const [wallet, setWallet] = useState<TokenWallet | null>(null)

  useEffect(() => {
    fetchRecentScans().then(setScans)
    fetchWallet().then(setWallet)
  }, [])

  // 마이페이지(MyPage)와 동일하게 "잔여"를 그대로 보여준다 — 지급량에서 역산한 "사용량"은
  // 충전·체험 보너스로 잔여가 월 한도를 넘는 경우 음수가 나와 마이페이지와 값이 어긋났다.
  const dastRemaining = wallet?.dastAvailable
  const sastRemaining = wallet?.sourceLinesLeft

  return (
    <div className="min-h-screen bg-surface">
      <AppNav />
      <main className="max-w-[1080px] mx-auto px-6 py-8 fade-up">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[26px] font-bold text-ink tracking-tight">안녕하세요, {user?.name}님</h1>
            <p className="mt-1 text-[14.5px] text-ink-muted">오늘도 안전하게. 최근 보안 현황을 확인하세요.</p>
          </div>
          <Button leftIcon="target" onClick={() => navigate('/scan')}>새 스캔 시작</Button>
        </div>

        {/* usage */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <UsageCard icon="globe" label="DAST 웹 스캔 잔여" remaining={dastRemaining} limit={wallet?.dastMonthlyLimit} unit="회" color="var(--color-scan-web)" />
          <UsageCard icon="box" label="SAST · GitHub 액션 잔여" remaining={sastRemaining} limit={wallet?.sourceLinesMonthlyLimit} unit="줄" color="var(--color-scan-code)" big />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          {/* token balance */}
          <Card className="lg:col-span-2" pad="lg">
            <div className="flex items-center justify-between">
              <h2 className="text-[17px] font-bold text-ink">토큰 현황</h2>
              <button onClick={() => navigate('/mypage')} className="text-[13px] text-brand font-semibold hover:underline flex items-center gap-1">
                마이페이지 <Icon name="chevron-right" size={14} />
              </button>
            </div>
            <div className="mt-4">
              <TokenBalance wallet={wallet} />
            </div>
          </Card>

          {/* model edge */}
          <Card pad="lg" className="bg-gradient-to-br from-[#f3f8ff] to-white border-brand-soft">
            <div className="flex items-center gap-2 text-brand">
              <Icon name="cpu" size={18} />
              <span className="text-[13px] font-bold">ScanOps 엔진</span>
            </div>
            <p className="mt-2 text-[13.5px] text-ink-sub leading-relaxed">
              자체 파인튜닝 모델 + 정적분석 하이브리드가 OWASP 외부 표준에서 상용 모델을 능가합니다.
            </p>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <Mini label="탐지율" value="89.1%" />
              <Mini label="오탐률" value="12.7%" />
            </div>
          </Card>
        </div>

        {/* recent scans */}
        <Card className="mt-4" pad="none">
          <div className="flex items-center justify-between px-5 py-4 border-b border-line">
            <h2 className="text-[17px] font-bold text-ink">최근 스캔</h2>
            <button onClick={() => navigate('/reports')} className="text-[13px] text-brand font-semibold hover:underline">전체 보기</button>
          </div>
          {!scans ? (
            <div className="p-5 flex flex-col gap-2.5">{[0, 1, 2].map((i) => <div key={i} className="h-14 rounded-xl skeleton" />)}</div>
          ) : (
            <div className="divide-y divide-line">
              {scans.slice(0, 4).map((s) => {
                const m = MODE_META[s.mode]
                return (
                  <button
                    key={s.id}
                    onClick={() => navigate(s.status === 'DONE' ? `/report/${s.id}` : s.status === 'FAILED' ? '/reports' : `/scan/${s.id}/status`)}
                    className="w-full flex items-center gap-3.5 px-5 py-3.5 text-left hover:bg-surface transition-colors"
                  >
                    <span className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: m.soft, color: m.color }}>
                      <Icon name={m.icon} size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-semibold text-ink truncate">{s.target}</p>
                      <p className="text-[12px] text-ink-muted">{m.tag} · {relativeTime(s.createdAt)}</p>
                    </div>
                    {s.status === 'DONE' && s.maxCvss > 0 ? (
                      <Badge tone={s.maxCvss >= 9 ? 'critical' : s.maxCvss >= 7 ? 'high' : s.maxCvss >= 4 ? 'medium' : 'low'} size="sm">
                        CVSS {s.maxCvss.toFixed(1)}
                      </Badge>
                    ) : s.status === 'DONE' ? (
                      <Badge tone="success" size="sm">완료</Badge>
                    ) : s.status === 'FAILED' ? (
                      <Badge tone="danger" size="sm">실패</Badge>
                    ) : (
                      <Badge tone="brand" size="sm">진행 중</Badge>
                    )}
                    <Icon name="chevron-right" size={16} className="text-ink-faint" />
                  </button>
                )
              })}
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}

function UsageCard({ icon, label, remaining, limit, unit, color, big }: { icon: IconName; label: string; remaining?: number; limit?: number; unit: string; color: string; big?: boolean }) {
  const ready = remaining != null && limit != null
  // 충전/체험 보너스로 잔여가 월 한도보다 많을 수 있다 — 막대만 100%로 잘라 보여준다(숫자는 그대로).
  const pct = ready ? Math.min(100, (remaining! / limit!) * 100) : 0
  const low = ready && limit! > 0 && remaining! / limit! < 0.15
  const fmt = (n: number) => (big ? n.toLocaleString('ko-KR') : String(n))
  return (
    <Card pad="md">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-[13px] font-semibold text-ink-sub">
          <span style={{ color }}><Icon name={icon} size={16} /></span>{label}
        </span>
        {low && <Badge tone="warning" size="sm">얼마 안 남음</Badge>}
      </div>
      {ready ? (
        <p className="mt-2.5 text-ink">
          <span className="text-[22px] font-bold tnum">{fmt(remaining!)}</span>
          <span className="text-[13px] text-ink-muted"> / 월 {fmt(limit!)}{unit}</span>
        </p>
      ) : (
        <div className="mt-2.5 h-7 w-24 rounded skeleton" />
      )}
      <ProgressBar value={pct} color={low ? 'var(--color-warning)' : color} className="mt-2.5" height={6} />
    </Card>
  )
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white border border-brand-soft px-3 py-2">
      <p className="text-[11px] text-ink-muted">{label}</p>
      <p className="text-[18px] font-bold text-brand tnum">{value}</p>
    </div>
  )
}
