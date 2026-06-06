import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getScan } from '../../../api/scanApi'
import AppNav from '../../../shared/ui/AppNav'
import type { Scan, ScanStatus } from '../../../types/scan'

export default function StatusPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [scan, setScan] = useState<Scan | null>(null)
  const [dots, setDots] = useState('')

  useEffect(() => {
    const dotTimer = setInterval(() => setDots((d) => (d.length >= 3 ? '' : d + '.')), 500)
    return () => clearInterval(dotTimer)
  }, [])

  useEffect(() => {
    if (!id) return
    const poll = async () => {
      try {
        const data = await getScan(id)
        setScan(data)
        if (data.status === 'DONE') navigate(`/report/${id}`)
      } catch {
        /* silent retry */
      }
    }
    poll()
    const timer = setInterval(poll, 3000)
    return () => clearInterval(timer)
  }, [id, navigate])

  const isGithub = scan?.scanMode === 'GITHUB_REPO'

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <AppNav />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          {scan ? <StatusView scan={scan} dots={dots} isGithub={isGithub} /> : <LoadingView />}
        </div>
      </main>
    </div>
  )
}

function LoadingView() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Spinner />
      <p className="text-ink-muted text-sm">연결 중...</p>
    </div>
  )
}

function StatusView({ scan, dots, isGithub }: { scan: Scan; dots: string; isGithub: boolean }) {
  const cfg = getStatusConfig(scan.status, isGithub)
  const accent = isGithub ? 'var(--color-scan-code)' : 'var(--color-brand)'

  return (
    <div className="flex flex-col items-center gap-7">
      {/* Mode badge */}
      <span
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-semibold"
        style={{ background: isGithub ? '#f3eefe' : 'var(--color-brand-soft)', color: accent }}
      >
        <span>{isGithub ? '📦' : '🌐'}</span>
        {isGithub ? 'SAST · 레포 분석' : 'DAST · 웹사이트 스캔'}
      </span>

      {/* Ring */}
      <div
        className="w-28 h-28 rounded-full flex items-center justify-center"
        style={{ background: isGithub ? '#f3eefe' : 'var(--color-brand-soft)', border: `4px solid ${accent}` }}
      >
        {cfg.spinner ? (
          <Spinner color={cfg.color} size="lg" />
        ) : (
          <span className="text-4xl">{cfg.icon}</span>
        )}
      </div>

      {/* Text */}
      <div className="space-y-1.5">
        <h2 className="text-2xl font-bold" style={{ color: cfg.textColor }}>
          {cfg.label}
          {cfg.spinner ? dots : ''}
        </h2>
        <p className="text-sm text-ink-muted truncate max-w-xs">{scan.targetUrl}</p>
      </div>

      {/* Progress bar */}
      {scan.status === 'RUNNING' && (
        <div className="w-full max-w-xs space-y-3">
          <div className="w-full h-2 bg-field rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: '60%', background: accent }} />
          </div>
          <p className="text-[13px] text-ink-sub font-medium">
            {isGithub ? '파일을 가져와 모델로 분석 중...' : '취약점 패턴 분석 중...'}
          </p>
        </div>
      )}

      {/* Failed */}
      {scan.status === 'FAILED' && (
        <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-5 py-3">
          {isGithub
            ? '레포 분석 중 오류가 발생했습니다. URL과 접근 권한을 확인해 주세요.'
            : '스캔 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'}
        </div>
      )}

      {/* Job ID */}
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-line text-[11px]">
        <span className="text-ink-faint font-medium">Job ID</span>
        <span className="text-ink-sub font-semibold">{scan.id}</span>
      </span>
    </div>
  )
}

function Spinner({ color = 'var(--color-brand)', size = 'md' }: { color?: string; size?: 'md' | 'lg' }) {
  const sz = size === 'lg' ? 'w-10 h-10' : 'w-5 h-5'
  return (
    <svg className={`animate-spin ${sz}`} style={{ color }} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )
}

function getStatusConfig(status: ScanStatus, isGithub: boolean) {
  const accent = isGithub ? 'var(--color-scan-code)' : 'var(--color-brand)'
  const configs: Record<ScanStatus, { label: string; icon: string; spinner: boolean; color: string; textColor: string }> = {
    PENDING: {
      label: isGithub ? '분석 대기 중' : '스캔 대기 중',
      icon: '⏳',
      spinner: true,
      color: '#f5a623',
      textColor: '#f5a623',
    },
    RUNNING: {
      label: isGithub ? '코드 분석 중' : '스캔 진행 중',
      icon: '',
      spinner: true,
      color: accent,
      textColor: accent,
    },
    DONE: {
      label: isGithub ? '분석 완료!' : '스캔 완료!',
      icon: '✅',
      spinner: false,
      color: accent,
      textColor: accent,
    },
    FAILED: {
      label: isGithub ? '분석 실패' : '스캔 실패',
      icon: '❌',
      spinner: false,
      color: '#f04452',
      textColor: '#f04452',
    },
  }
  return configs[status]
}
