import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import AppNav from '../../../shared/ui/AppNav'
import Icon, { type IconName } from '../../../shared/ui/Icon'
import ProgressBar from '../../../shared/ui/ProgressBar'
import Button from '../../../shared/ui/Button'
import { MODE_META, type ScanMode } from '../../../shared/lib/mock'
import { isRealId, getScanJob } from '../../../shared/api/scan'

interface Stage { label: string; icon: IconName }
const WEB_STAGES: Stage[] = [
  { label: '대상 연결 및 크롤링', icon: 'globe' },
  { label: '동적 취약점 스캔 (ZAP)', icon: 'search' },
  { label: 'AI 분석·위험도 산정', icon: 'cpu' },
  { label: '리포트 생성', icon: 'file-text' },
]
const CODE_STAGES: Stage[] = [
  { label: '레포 가져오기', icon: 'box' },
  { label: 'AI 모델 정적 분석', icon: 'cpu' },
  { label: 'taint 그래프 오탐 억제', icon: 'shield' },
  { label: '리포트 생성', icon: 'file-text' },
]

export default function StatusPage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { state } = useLocation() as { state?: { target?: string; mode?: ScanMode } }
  const mode: ScanMode = state?.mode ?? 'WEBSITE'
  const target = state?.target ?? '대상 분석'
  const m = MODE_META[mode]
  const stages = mode === 'GITHUB_REPO' ? CODE_STAGES : WEB_STAGES
  const mockReportId = mode === 'GITHUB_REPO' ? 's-1039' : mode === 'GITHUB_ACTIONS' ? 's-1036' : 's-1041'
  const real = isRealId(id)

  const [progress, setProgress] = useState(real ? 8 : 6)
  const [failed, setFailed] = useState(false)
  const [failReason, setFailReason] = useState<string | null>(null)

  useEffect(() => {
    if (real) {
      // 실제 백엔드(ZAP) 스캔 — 상태 폴링
      let stopped = false
      let timer: ReturnType<typeof setTimeout>
      const poll = async () => {
        try {
          const job = await getScanJob(id)
          if (job.status === 'COMPLETED') {
            setProgress(100)
            setTimeout(() => navigate(`/report/${id}`, { replace: true }), 500)
            return
          }
          if (job.status === 'FAILED') { setFailReason(job.failureReason ?? null); setFailed(true); return }
          setProgress((p) => Math.min(90, p + (job.status === 'RUNNING' ? 7 : 2)))
        } catch { /* 일시 오류 — 계속 폴링 */ }
        if (!stopped) timer = setTimeout(poll, 2500)
      }
      timer = setTimeout(poll, 700)
      return () => { stopped = true; clearTimeout(timer) }
    }
    // 목 시뮬레이션 — 데모용 목 리포트 id(예: s-1039)로 들어온 경우에만
    const t = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 9 + 4
        if (next >= 100) {
          clearInterval(t)
          setTimeout(() => navigate(`/report/${mockReportId}`, { replace: true }), 600)
          return 100
        }
        return next
      })
    }, 520)
    return () => clearInterval(t)
  }, [real, id, navigate, mockReportId])

  const activeStage = Math.min(stages.length - 1, Math.floor((progress / 100) * stages.length))

  if (failed) {
    return (
      <div className="min-h-screen bg-surface flex flex-col">
        <AppNav />
        <main className="flex-1 flex items-center justify-center px-5 py-10">
          <div className="w-full max-w-[440px] text-center fade-up">
            <span className="inline-flex w-14 h-14 rounded-2xl bg-danger-soft text-danger items-center justify-center mb-4"><Icon name="alert-triangle" size={26} /></span>
            <h2 className="text-[20px] font-bold text-ink">스캔에 실패했어요</h2>
            <p className="mt-1.5 text-[13.5px] text-ink-muted">{failReason || '대상에 접근할 수 없거나 스캐너 오류일 수 있어요. 잠시 후 다시 시도해 주세요.'}</p>
            {failReason?.includes('App') && (
              <div className="mt-4 rounded-xl bg-warning-soft px-4 py-3 text-left">
                <p className="text-[12.5px] text-[#9a5b00] leading-relaxed">
                  프라이빗 레포를 검사하려면 <b>ScanOps App</b>을 그 레포에 설치해야 해요.
                  설치 화면에서 <b>“Only select repositories”</b>를 고르고 검사할 레포를 선택하세요.
                  (“All repositories”는 공개 레포까지 포함하지만, 프라이빗은 명시적으로 골라도 됩니다.)
                </p>
              </div>
            )}
            <div className="mt-5 flex gap-2 justify-center">
              {failReason?.includes('App') && (
                <Button variant="dark" leftIcon="github" onClick={() => navigate('/integrations')}>App 설치하러 가기</Button>
              )}
              <Button variant="outline" onClick={() => navigate('/reports')}>스캔 기록</Button>
              <Button onClick={() => navigate('/scan')}>다시 스캔</Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <AppNav />
      <main className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-[460px] fade-up">
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12.5px] font-bold mb-6" style={{ background: m.soft, color: m.color }}>
              <Icon name={m.icon} size={15} /> {m.tag} · {m.label}{real && ' · 실제 스캔'}
            </span>

            <div className="relative w-28 h-28 mb-5">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="44" fill="none" stroke="var(--color-field)" strokeWidth="8" />
                <circle cx="50" cy="50" r="44" fill="none" stroke={m.color} strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 44} strokeDashoffset={2 * Math.PI * 44 * (1 - progress / 100)}
                  style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[24px] font-bold text-ink tnum">{Math.floor(progress)}%</span>
              </div>
            </div>

            <h2 className="text-[20px] font-bold text-ink">{progress >= 100 ? '분석 완료!' : '분석 중이에요'}</h2>
            <p className="mt-1 text-[13.5px] text-ink-muted truncate max-w-full">{target}</p>
          </div>

          <div className="mt-7 bg-white border border-line rounded-2xl p-5 flex flex-col gap-3">
            {stages.map((s, i) => {
              const doneStage = i < activeStage || progress >= 100
              const current = i === activeStage && progress < 100
              return (
                <div key={s.label} className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    doneStage ? 'bg-success-soft text-success' : current ? 'bg-brand-soft text-brand' : 'bg-field text-ink-faint'
                  }`}>
                    {doneStage ? <Icon name="check" size={15} strokeWidth={3} />
                      : current ? <span className="w-3.5 h-3.5 rounded-full border-2 border-brand border-t-transparent spin" />
                      : <Icon name={s.icon} size={15} />}
                  </span>
                  <span className={`text-[13.5px] ${doneStage || current ? 'text-ink font-medium' : 'text-ink-muted'}`}>{s.label}</span>
                </div>
              )
            })}
            <ProgressBar value={progress} color={m.color} className="mt-1" height={6} />
          </div>

          <p className="mt-5 text-center text-[12px] text-ink-faint flex items-center justify-center gap-1.5">
            <Icon name="lock" size={13} />
            {real ? '실제 동적 스캔은 몇 분 걸릴 수 있어요. 이 페이지를 떠나도 진행됩니다.' : '코드는 외부로 전송되지 않고 분석 후 즉시 폐기됩니다.'}
          </p>
        </div>
      </main>
    </div>
  )
}
