import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getScans } from '../../../api/scanApi'
import AppNav from '../../../shared/ui/AppNav'
import type { Scan, ScanStatus } from '../../../types/scan'

const STATUS_CONFIG: Record<ScanStatus, { label: string; color: string; bg: string }> = {
  PENDING: { label: '대기 중', color: '#f5a623', bg: '#fef6e6' },
  RUNNING: { label: '진행 중', color: 'var(--color-brand)', bg: 'var(--color-brand-soft)' },
  DONE: { label: '완료', color: '#15b36a', bg: '#e7f8ef' },
  FAILED: { label: '실패', color: '#f04452', bg: '#fdecee' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ReportsPage() {
  const navigate = useNavigate()
  const [scans, setScans] = useState<Scan[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    getScans()
      .then((data) =>
        setScans([...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())),
      )
      .catch(() => setError(true))
  }, [])

  const handleClick = (scan: Scan) => {
    if (scan.status === 'DONE') navigate(`/report/${scan.id}`)
    else if (scan.status === 'PENDING' || scan.status === 'RUNNING') navigate(`/scan/${scan.id}/status`)
  }

  return (
    <div className="min-h-screen bg-surface">
      <AppNav />

      <main className="max-w-[880px] mx-auto px-6 py-10">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[26px] font-bold text-ink tracking-tight">스캔 기록</h1>
            <p className="mt-1 text-sm text-ink-muted">
              완료된 스캔을 클릭하면 보고서를 볼 수 있어요 · 결과는 1개월간 보관됩니다
            </p>
          </div>
          <button className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-[10px] bg-white border border-line text-[13px] text-red-500 font-semibold hover:bg-red-50 transition-colors">
            🗑 전체 삭제
          </button>
        </div>

        {error && (
          <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            이력을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
          </p>
        )}

        {!scans && !error && (
          <div className="flex items-center gap-3 text-ink-muted text-sm">
            <svg className="animate-spin w-4 h-4 text-brand" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            불러오는 중...
          </div>
        )}

        {scans && scans.length === 0 && (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-sm text-ink-muted">스캔 이력이 없습니다.</p>
            <button onClick={() => navigate('/scan')} className="mt-4 text-brand text-sm font-semibold hover:underline">
              첫 번째 스캔을 시작해보세요 →
            </button>
          </div>
        )}

        {scans && scans.length > 0 && (
          <div className="flex flex-col gap-2.5">
            {scans.map((scan) => {
              const cfg = STATUS_CONFIG[scan.status]
              const isGithub = scan.scanMode === 'GITHUB_REPO'
              const clickable = scan.status !== 'FAILED'
              return (
                <div
                  key={scan.id}
                  onClick={() => handleClick(scan)}
                  className={`bg-white border border-line rounded-2xl px-[18px] py-4 flex items-center gap-4 transition-colors ${
                    clickable ? 'cursor-pointer hover:border-line-strong' : ''
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-[10px] flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: isGithub ? '#f3eefe' : 'var(--color-brand-soft)' }}
                  >
                    {isGithub ? '📦' : '🌐'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                        style={{
                          background: isGithub ? '#f3eefe' : 'var(--color-brand-soft)',
                          color: isGithub ? 'var(--color-scan-code)' : 'var(--color-brand)',
                        }}
                      >
                        {isGithub ? 'SAST' : 'DAST'}
                      </span>
                      <p className="text-[14.5px] font-semibold text-ink truncate">{scan.targetUrl}</p>
                    </div>
                    <p className="text-[12.5px] text-ink-muted">{formatDate(scan.createdAt)}</p>
                  </div>
                  <span
                    className="px-2.5 py-1 rounded-full text-[11.5px] font-semibold flex-shrink-0"
                    style={{ background: cfg.bg, color: cfg.color }}
                  >
                    {cfg.label}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                    className="text-ink-faint hover:text-red-500 transition-colors flex-shrink-0"
                    aria-label="삭제"
                  >
                    🗑
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
