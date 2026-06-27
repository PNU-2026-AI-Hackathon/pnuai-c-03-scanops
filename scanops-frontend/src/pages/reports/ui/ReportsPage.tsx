import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppNav from '../../../shared/ui/AppNav'
import Card from '../../../shared/ui/Card'
import Badge from '../../../shared/ui/Badge'
import Button from '../../../shared/ui/Button'
import Icon from '../../../shared/ui/Icon'
import Modal from '../../../shared/ui/Modal'
import Segmented from '../../../shared/ui/Segmented'
import { useToast } from '../../../shared/ui/Toast'
import { MODE_META, formatDateTime, type ScanSummary, type ScanStatus, type ScanMode } from '../../../shared/lib/mock'
import { fetchScansPage, deleteScan, type ScanPage } from '../../../shared/api/scan'

type Filter = 'ALL' | ScanMode
const PAGE_SIZE = 10

const STATUS: Record<ScanStatus, { label: string; tone: 'success' | 'brand' | 'warning' | 'danger' }> = {
  DONE: { label: '완료', tone: 'success' },
  RUNNING: { label: '진행 중', tone: 'brand' },
  PENDING: { label: '대기 중', tone: 'warning' },
  FAILED: { label: '실패', tone: 'danger' },
}

export default function ReportsPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [page, setPage] = useState(0)        // 0-based
  const [filter, setFilter] = useState<Filter>('ALL')
  const [q, setQ] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')

  const [data, setData] = useState<ScanPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [target, setTarget] = useState<ScanSummary | null>(null) // 삭제 확인 대상
  const [deleting, setDeleting] = useState(false)

  // 검색어 디바운스
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300)
    return () => clearTimeout(t)
  }, [q])

  // 필터/검색어가 바뀌면 첫 페이지로
  useEffect(() => { setPage(0) }, [filter, debouncedQ])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchScansPage({ page, size: PAGE_SIZE, mode: filter, q: debouncedQ })
      setData(res)
    } catch {
      setError('스캔 기록을 불러오지 못했어요. 백엔드 연결 상태를 확인해 주세요.')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [page, filter, debouncedQ])

  useEffect(() => { load() }, [load])

  const confirmDelete = async () => {
    if (!target) return
    setDeleting(true)
    try {
      await deleteScan(target.id)
      toast('스캔 기록을 삭제했어요', 'success')
      setTarget(null)
      // 마지막 항목을 지워 페이지가 비고, 첫 페이지가 아니면 한 칸 뒤로
      if (data && data.items.length === 1 && page > 0) setPage((p) => p - 1)
      else load()
    } catch {
      toast('삭제에 실패했어요. 잠시 후 다시 시도해 주세요.', 'danger')
    } finally {
      setDeleting(false)
    }
  }

  const items = data?.items ?? []
  const total = data?.totalElements ?? 0
  const totalPages = data?.totalPages ?? 0

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

        {loading ? (
          <div className="flex flex-col gap-2.5">{[0, 1, 2, 3].map((i) => <div key={i} className="h-[72px] rounded-2xl skeleton" />)}</div>
        ) : error ? (
          <Card pad="lg" className="text-center py-16">
            <span className="inline-flex w-14 h-14 rounded-2xl bg-danger-soft text-danger items-center justify-center mb-3"><Icon name="alert-triangle" size={26} /></span>
            <p className="text-sm text-ink-muted">{error}</p>
            <button onClick={load} className="mt-3 text-brand text-sm font-semibold hover:underline">다시 시도</button>
          </Card>
        ) : items.length === 0 ? (
          <Card pad="lg" className="text-center py-16">
            <span className="inline-flex w-14 h-14 rounded-2xl bg-field text-ink-muted items-center justify-center mb-3"><Icon name="search" size={26} /></span>
            <p className="text-sm text-ink-muted">{debouncedQ || filter !== 'ALL' ? '조건에 맞는 스캔이 없어요.' : '아직 스캔 기록이 없어요.'}</p>
            <button onClick={() => navigate('/scan')} className="mt-3 text-brand text-sm font-semibold hover:underline">첫 번째 스캔을 시작해보세요 →</button>
          </Card>
        ) : (
          <>
            <div className="flex flex-col gap-2.5">
              {items.map((s) => {
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
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setTarget(s) }}
                      className="w-8 h-8 -mr-1 rounded-lg flex items-center justify-center text-ink-faint hover:text-danger hover:bg-danger-soft transition-colors shrink-0"
                      aria-label="스캔 기록 삭제"
                    >
                      <Icon name="trash-2" size={16} />
                    </button>
                  </Card>
                )
              })}
            </div>

            {/* 페이지네이션 */}
            <div className="flex items-center justify-between gap-3 mt-5">
              <p className="text-[12.5px] text-ink-muted">
                전체 <span className="text-ink-sub font-semibold tnum">{total.toLocaleString('ko-KR')}</span>건
              </p>
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="sm" leftIcon="chevron-left"
                  disabled={data?.first ?? true} onClick={() => setPage((p) => Math.max(0, p - 1))}>
                  이전
                </Button>
                <span className="px-2 text-[13px] text-ink-sub tabular-nums">
                  {totalPages === 0 ? 0 : page + 1} / {totalPages}
                </span>
                <Button variant="outline" size="sm" rightIcon="chevron-right"
                  disabled={data?.last ?? true} onClick={() => setPage((p) => p + 1)}>
                  다음
                </Button>
              </div>
            </div>
          </>
        )}
      </main>

      {/* 삭제 확인 */}
      <Modal
        open={!!target}
        onClose={() => !deleting && setTarget(null)}
        title="스캔 기록 삭제"
        width={420}
        footer={
          <>
            <Button variant="outline" block onClick={() => setTarget(null)} disabled={deleting}>취소</Button>
            <Button variant="danger" block loading={deleting} onClick={confirmDelete}>삭제</Button>
          </>
        }
      >
        <p className="text-[14px] text-ink-sub leading-relaxed">
          <span className="font-semibold text-ink break-all">{target?.target}</span> 의 스캔 기록과
          발견된 취약점이 모두 삭제돼요. 이 작업은 되돌릴 수 없어요.
        </p>
      </Modal>
    </div>
  )
}
