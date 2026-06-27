import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppNav from '../../../shared/ui/AppNav'
import Card from '../../../shared/ui/Card'
import Badge from '../../../shared/ui/Badge'
import Button from '../../../shared/ui/Button'
import Icon from '../../../shared/ui/Icon'
import Segmented from '../../../shared/ui/Segmented'
import { MODE_META, formatDateTime, type ScanSummary, type ScanStatus, type ScanMode } from '../../../shared/lib/mock'
import { fetchAllScans } from '../../../shared/api/scan'

type Filter = 'ALL' | ScanMode

const STATUS: Record<ScanStatus, { label: string; tone: 'success' | 'brand' | 'warning' | 'danger' }> = {
  DONE: { label: '완료', tone: 'success' },
  RUNNING: { label: '진행 중', tone: 'brand' },
  PENDING: { label: '대기 중', tone: 'warning' },
  FAILED: { label: '실패', tone: 'danger' },
}

export default function ReportsPage() {
  const navigate = useNavigate()
  const [scans, setScans] = useState<ScanSummary[] | null>(null)
  const [filter, setFilter] = useState<Filter>('ALL')
  const [q, setQ] = useState('')

  useEffect(() => { fetchAllScans().then(setScans) }, [])

  const filtered = useMemo(() => {
    if (!scans) return null
    return scans.filter((s) =>
      (filter === 'ALL' || s.mode === filter) &&
      (q === '' || s.target.toLowerCase().includes(q.toLowerCase())),
    )
  }, [scans, filter, q])

  return (
    <div className="min-h-screen bg-surface">
      <AppNav />
      <main className="max-w-[920px] mx-auto px-6 py-8 fade-up">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h1 className="text-[26px] font-bold text-ink tracking-tight">스캔 기록</h1>
            <p className="mt-1 text-sm text-ink-muted">완료된 스캔을 클릭하면 보고서를 볼 수 있어요 · 결과는 1개월간 보관됩니다</p>
          </div>
          <Button variant="outline" size="sm" leftIcon="plus" onClick={() => navigate('/scan')}>새 스캔</Button>
        </div>

        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <Segmented<Filter>
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'ALL', label: '전체' },
              { value: 'WEBSITE', label: 'DAST' },
              { value: 'GITHUB_REPO', label: 'SAST' },
              { value: 'GITHUB_ACTIONS', label: 'PR' },
            ]}
          />
          <div className="relative flex-1 min-w-[180px] max-w-[280px]">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint"><Icon name="search" size={17} /></span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="대상 검색"
              className="w-full h-10 rounded-xl bg-white border border-line pl-10 pr-3 text-[14px] text-ink placeholder:text-ink-faint outline-none focus:border-brand transition-colors" />
          </div>
        </div>

        {!filtered ? (
          <div className="flex flex-col gap-2.5">{[0, 1, 2, 3].map((i) => <div key={i} className="h-[72px] rounded-2xl skeleton" />)}</div>
        ) : filtered.length === 0 ? (
          <Card pad="lg" className="text-center py-16">
            <span className="inline-flex w-14 h-14 rounded-2xl bg-field text-ink-muted items-center justify-center mb-3"><Icon name="search" size={26} /></span>
            <p className="text-sm text-ink-muted">조건에 맞는 스캔이 없어요.</p>
            <button onClick={() => navigate('/scan')} className="mt-3 text-brand text-sm font-semibold hover:underline">첫 번째 스캔을 시작해보세요 →</button>
          </Card>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filtered.map((s) => {
              const m = MODE_META[s.mode]
              const st = STATUS[s.status]
              const clickable = s.status === 'DONE'
              return (
                <Card
                  key={s.id}
                  pad="none"
                  interactive={clickable}
                  onClick={() => clickable && navigate(`/report/${s.id}`)}
                  className="px-[18px] py-4 flex items-center gap-4"
                >
                  <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: m.soft, color: m.color }}>
                    <Icon name={m.icon} size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge tone={s.mode === 'WEBSITE' ? 'brand' : s.mode === 'GITHUB_REPO' ? 'purple' : 'success'} size="sm">{m.tag}</Badge>
                      <p className="text-[14.5px] font-semibold text-ink truncate">{s.target}</p>
                    </div>
                    <p className="text-[12.5px] text-ink-muted">
                      {formatDateTime(s.createdAt)}
                      {s.status === 'DONE' && s.total > 0 && ` · 취약점 ${s.total}건`}
                      {s.loc ? ` · ${s.loc.toLocaleString('ko-KR')}줄` : ''}
                    </p>
                  </div>
                  {s.status === 'DONE' && s.maxCvss > 0 && (
                    <Badge tone={s.maxCvss >= 9 ? 'critical' : s.maxCvss >= 7 ? 'high' : s.maxCvss >= 4 ? 'medium' : 'low'} size="sm">
                      CVSS {s.maxCvss.toFixed(1)}
                    </Badge>
                  )}
                  <Badge tone={st.tone} size="sm">{st.label}</Badge>
                  {clickable && <Icon name="chevron-right" size={16} className="text-ink-faint" />}
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
