import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getScan } from '../../../api/scanApi'
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
        // silent retry
      }
    }
    poll()
    const timer = setInterval(poll, 3000)
    return () => clearInterval(timer)
  }, [id, navigate])

  const isGithub = scan?.scanMode === 'GITHUB_REPO'

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-800">
        <button onClick={() => navigate('/')} className="flex items-center gap-2">
          <span className="text-green-400 text-xl font-mono font-bold">⬡</span>
          <span className="text-xl font-bold tracking-tight">ScanOps</span>
        </button>
        <button
          onClick={() => navigate('/')}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          ← 홈으로
        </button>
      </nav>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          {scan ? (
            <StatusView scan={scan} dots={dots} isGithub={isGithub} />
          ) : (
            <LoadingView />
          )}
        </div>
      </main>
    </div>
  )
}

function LoadingView() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Spinner />
      <p className="text-gray-400 text-sm">연결 중...</p>
    </div>
  )
}

function StatusView({
  scan,
  dots,
  isGithub,
}: {
  scan: Scan
  dots: string
  isGithub: boolean
}) {
  const config = getStatusConfig(scan.status, isGithub)

  return (
    <div className="flex flex-col items-center gap-6">
      {/* 모드 배지 */}
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
          isGithub
            ? 'bg-violet-500/10 border-violet-500/30 text-violet-400'
            : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
        }`}
      >
        <span>{isGithub ? '📁' : '🌐'}</span>
        <span>{isGithub ? 'GitHub 레포 분석' : '웹사이트 스캔'}</span>
      </div>

      {/* 아이콘 영역 */}
      <div
        className={`w-24 h-24 rounded-full flex items-center justify-center border-2 ${config.ring}`}
      >
        {config.spinner ? (
          <Spinner color={config.spinnerColor} size="lg" />
        ) : (
          <span className="text-4xl">{config.icon}</span>
        )}
      </div>

      {/* 상태 텍스트 */}
      <div className="space-y-2">
        <h2 className={`text-2xl font-bold ${config.textColor}`}>
          {config.label}
          {config.spinner ? dots : ''}
        </h2>
        <p className="text-sm text-gray-500 font-mono truncate max-w-xs">{scan.targetUrl}</p>
      </div>

      {/* 진행 바 (RUNNING) */}
      {scan.status === 'RUNNING' && (
        <div className="w-full max-w-xs space-y-3">
          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${isGithub ? 'bg-violet-500' : 'bg-green-400'} animate-[progress_2s_ease-in-out_infinite]`}
              style={{ width: '60%' }}
            />
          </div>
          {isGithub && (
            <div className="text-xs text-gray-600 text-center space-y-1">
              <p>파일을 가져와 QLoRA 모델로 분석 중...</p>
              <p className="text-gray-700">파일당 약 3초 소요</p>
            </div>
          )}
        </div>
      )}

      {/* FAILED */}
      {scan.status === 'FAILED' && (
        <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-5 py-3">
          {isGithub
            ? '레포 분석 중 오류가 발생했습니다. GitHub URL과 접근 권한을 확인해 주세요.'
            : '스캔 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'}
        </div>
      )}

      {/* ID 배지 */}
      <p className="text-xs text-gray-700 font-mono">Job ID: {scan.id}</p>
    </div>
  )
}

function Spinner({
  color = 'text-green-400',
  size = 'md',
}: {
  color?: string
  size?: 'md' | 'lg'
}) {
  const sz = size === 'lg' ? 'w-10 h-10' : 'w-5 h-5'
  return (
    <svg className={`animate-spin ${sz} ${color}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )
}

function getStatusConfig(
  status: ScanStatus,
  isGithub: boolean,
): {
  label: string
  icon: string
  spinner: boolean
  spinnerColor: string
  textColor: string
  ring: string
} {
  const accent = isGithub ? 'violet' : 'green'
  const accentClass = isGithub ? 'text-violet-400' : 'text-green-400'
  const ringClass = isGithub
    ? 'border-violet-500/30 bg-violet-500/10'
    : 'border-green-400/30 bg-green-400/10'

  const configs: Record<ScanStatus, ReturnType<typeof getStatusConfig>> = {
    PENDING: {
      label: isGithub ? '분석 대기 중' : '스캔 대기 중',
      icon: '⏳',
      spinner: true,
      spinnerColor: 'text-yellow-400',
      textColor: 'text-yellow-400',
      ring: 'border-yellow-400/30 bg-yellow-400/10',
    },
    RUNNING: {
      label: isGithub ? '코드 분석 중' : '스캔 진행 중',
      icon: '',
      spinner: true,
      spinnerColor: accentClass,
      textColor: accentClass,
      ring: ringClass,
    },
    DONE: {
      label: isGithub ? '분석 완료!' : '스캔 완료!',
      icon: '✅',
      spinner: false,
      spinnerColor: '',
      textColor: accentClass,
      ring: ringClass,
    },
    FAILED: {
      label: isGithub ? '분석 실패' : '스캔 실패',
      icon: '❌',
      spinner: false,
      spinnerColor: '',
      textColor: 'text-red-400',
      ring: 'border-red-400/30 bg-red-400/10',
    },
  }

  // suppress unused variable warning
  void accent

  return configs[status]
}
