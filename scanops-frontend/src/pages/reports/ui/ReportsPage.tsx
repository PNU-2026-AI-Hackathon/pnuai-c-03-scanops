import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getScans } from '../../../api/scanApi'
import type { Scan, ScanStatus } from '../../../types/scan'

const STATUS_CONFIG: Record<ScanStatus, { label: string; color: string; dot: string }> = {
  PENDING: { label: '대기 중', color: 'text-yellow-400', dot: 'bg-yellow-400' },
  RUNNING: { label: '진행 중', color: 'text-green-400', dot: 'bg-green-400 animate-pulse' },
  DONE: { label: '완료', color: 'text-green-400', dot: 'bg-green-400' },
  FAILED: { label: '실패', color: 'text-red-400', dot: 'bg-red-400' },
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
      .then((data) => setScans([...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())))
      .catch(() => setError(true))
  }, [])

  const handleClick = (scan: Scan) => {
    if (scan.status === 'DONE') navigate(`/report/${scan.id}`)
    else if (scan.status === 'PENDING' || scan.status === 'RUNNING') navigate(`/scan/${scan.id}/status`)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-800">
        <button onClick={() => navigate('/')} className="flex items-center gap-2">
          <span className="text-green-400 text-xl font-mono font-bold">⬡</span>
          <span className="text-xl font-bold tracking-tight">ScanOps</span>
        </button>
        <button
          onClick={() => navigate('/scan')}
          className="px-4 py-2 rounded-lg bg-green-400 text-gray-950 font-semibold text-xs hover:bg-green-300 transition-colors"
        >
          + 새 스캔
        </button>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold mb-1">스캔 이력</h1>
          <p className="text-gray-400 text-sm">완료된 스캔은 클릭하면 보고서를 확인할 수 있습니다.</p>
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
            이력을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
          </p>
        )}

        {!scans && !error && (
          <div className="flex items-center gap-3 text-gray-400 text-sm">
            <svg className="animate-spin w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            불러오는 중...
          </div>
        )}

        {scans && scans.length === 0 && (
          <div className="text-center py-20 text-gray-600">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-sm">스캔 이력이 없습니다.</p>
            <button
              onClick={() => navigate('/scan')}
              className="mt-4 text-green-400 text-sm hover:underline"
            >
              첫 번째 스캔을 시작해보세요 →
            </button>
          </div>
        )}

        {scans && scans.length > 0 && (
          <div className="space-y-3">
            {scans.map((scan) => {
              const cfg = STATUS_CONFIG[scan.status]
              const clickable = scan.status === 'DONE' || scan.status === 'RUNNING' || scan.status === 'PENDING'
              return (
                <div
                  key={scan.id}
                  onClick={() => handleClick(scan)}
                  className={`bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 flex items-center justify-between gap-4 transition-colors ${
                    clickable ? 'cursor-pointer hover:border-gray-700 hover:bg-gray-800/60' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs">
                          {scan.scanMode === 'GITHUB_REPO' ? '📁' : '🌐'}
                        </span>
                        <p className="text-sm font-medium text-gray-200 truncate">{scan.targetUrl}</p>
                      </div>
                      <p className="text-xs text-gray-500 font-mono">{formatDate(scan.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
                    {scan.status === 'DONE' && (
                      <span className="text-gray-600 text-xs">→</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
