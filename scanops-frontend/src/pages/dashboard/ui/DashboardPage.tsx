import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppNav from '../../../shared/ui/AppNav'
import Card from '../../../shared/ui/Card'
import Button from '../../../shared/ui/Button'
import Icon, { type IconName } from '../../../shared/ui/Icon'
import Badge from '../../../shared/ui/Badge'
import ProgressBar from '../../../shared/ui/ProgressBar'
import { useAuth } from '../../../shared/lib/auth'
import {
  fetchUsage, MODE_META, SEVERITY_META,
  relativeTime, type ScanSummary, type Usage, type Severity, type SeverityCounts,
} from '../../../shared/lib/mock'
import { fetchAllScans } from '../../../shared/api/scan'

const SEV_ORDER: Severity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO']

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [scans, setScans] = useState<ScanSummary[] | null>(null)
  const [usage, setUsage] = useState<Usage | null>(null)

  useEffect(() => {
    fetchAllScans().then(setScans)
    fetchUsage().then(setUsage)
  }, [])

  const done = scans?.filter((s) => s.status === 'DONE') ?? []
  const agg: SeverityCounts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 }
  done.forEach((s) => SEV_ORDER.forEach((k) => (agg[k] += s.counts[k])))
  const totalFindings = SEV_ORDER.reduce((a, k) => a + agg[k], 0)
  const maxCvss = done.reduce((m, s) => Math.max(m, s.maxCvss), 0)

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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <UsageCard icon="globe" label="DAST 웹 스캔" used={usage?.dastUsed} limit={usage?.dastLimit} unit="회" color="var(--color-scan-web)" />
          <UsageCard icon="box" label="SAST 레포 분석" used={usage?.sastUsed} limit={usage?.sastLimit} unit="줄" color="var(--color-scan-code)" big />
          <UsageCard icon="git-pull-request" label="PR 자동 분석" used={usage?.actionsUsed} limit={usage?.actionsLimit} unit="줄" color="var(--color-scan-pr)" big />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          {/* posture */}
          <Card className="lg:col-span-2" pad="lg">
            <div className="flex items-center justify-between">
              <h2 className="text-[17px] font-bold text-ink">보안 현황</h2>
              <button onClick={() => navigate('/reports')} className="text-[13px] text-brand font-semibold hover:underline flex items-center gap-1">
                전체 기록 <Icon name="chevron-right" size={14} />
              </button>
            </div>
            <div className="flex items-center gap-6 mt-4">
              <div className="text-center shrink-0">
                <p className="text-[34px] font-bold text-ink tnum leading-none">{totalFindings}</p>
                <p className="mt-1 text-[12.5px] text-ink-muted">발견된 취약점</p>
              </div>
              <div className="w-px h-12 bg-line" />
              <div className="text-center shrink-0">
                <p className="text-[34px] font-bold tnum leading-none" style={{ color: maxCvss >= 9 ? 'var(--color-sev-critical)' : 'var(--color-sev-high)' }}>{maxCvss.toFixed(1)}</p>
                <p className="mt-1 text-[12.5px] text-ink-muted">최고 CVSS</p>
              </div>
              <div className="flex-1 min-w-0">
                <SeverityBar counts={agg} total={totalFindings} />
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
                  {SEV_ORDER.filter((k) => agg[k] > 0).map((k) => (
                    <span key={k} className="flex items-center gap-1.5 text-[12px] text-ink-sub">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: SEVERITY_META[k].color }} />
                      {SEVERITY_META[k].label} <b className="text-ink tnum">{agg[k]}</b>
                    </span>
                  ))}
                </div>
              </div>
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

function UsageCard({ icon, label, used, limit, unit, color, big }: { icon: IconName; label: string; used?: number; limit?: number; unit: string; color: string; big?: boolean }) {
  const ready = used != null && limit != null
  const pct = ready ? Math.min(100, (used! / limit!) * 100) : 0
  const over = ready && used! > limit!
  const fmt = (n: number) => (big ? n.toLocaleString('ko-KR') : String(n))
  return (
    <Card pad="md">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-[13px] font-semibold text-ink-sub">
          <span style={{ color }}><Icon name={icon} size={16} /></span>{label}
        </span>
        {over && <Badge tone="warning" size="sm">한도 초과</Badge>}
      </div>
      {ready ? (
        <p className="mt-2.5 text-ink">
          <span className="text-[22px] font-bold tnum">{fmt(used!)}</span>
          <span className="text-[13px] text-ink-muted"> / {fmt(limit!)}{unit}</span>
        </p>
      ) : (
        <div className="mt-2.5 h-7 w-24 rounded skeleton" />
      )}
      <ProgressBar value={pct} color={over ? 'var(--color-warning)' : color} className="mt-2.5" height={6} />
    </Card>
  )
}

function SeverityBar({ counts, total }: { counts: SeverityCounts; total: number }) {
  if (total === 0) return <div className="h-2.5 rounded-full bg-field" />
  return (
    <div className="flex h-2.5 rounded-full overflow-hidden bg-field">
      {SEV_ORDER.map((k) => counts[k] > 0 && (
        <div key={k} style={{ width: `${(counts[k] / total) * 100}%`, background: SEVERITY_META[k].color }} />
      ))}
    </div>
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
