import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../../../shared/ui/Icon'
import Button from '../../../shared/ui/Button'
import Card from '../../../shared/ui/Card'
import Badge from '../../../shared/ui/Badge'
import { useToast } from '../../../shared/ui/Toast'
import { MODE_META, type ScanMode } from '../../../shared/lib/mock'
import { useAuth } from '../../../shared/lib/auth'
import { initDomainVerify, confirmDomainVerify, type DomainVerifyInit } from '../../../shared/api/verify'

const ORDER: ScanMode[] = ['WEBSITE', 'GITHUB_REPO', 'GITHUB_ACTIONS']
const SUB: Record<ScanMode, string> = {
  WEBSITE: '실행 중인 앱 동적 분석',
  GITHUB_REPO: '소스코드 전체 정적 분석',
  GITHUB_ACTIONS: 'PR diff 자동 검사',
}

type VState = 'idle' | 'unverified' | 'pending' | 'checking' | 'verified'

const extractOwner = (repo: string): string | null => {
  const m = repo.trim().match(/github\.com\/([^/]+)\/([^/\s]+)/) ?? repo.trim().match(/^([\w.-]+)\/([\w.-]+)$/)
  return m ? m[1] : null
}

export default function ScanForm() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const [mode, setMode] = useState<ScanMode>('WEBSITE')
  const [target, setTarget] = useState('')
  const [email, setEmail] = useState(user?.email ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 도메인 인증 상태 (WEBSITE)
  const [vstate, setVstate] = useState<VState>('idle')
  const [vinfo, setVinfo] = useState<DomainVerifyInit | null>(null)

  const isActions = mode === 'GITHUB_ACTIONS'
  const isRepo = mode === 'GITHUB_REPO'
  const ghConnected = !!user?.githubLogin

  const validUrl = /^https?:\/\/.+\..+/.test(target)
  // URL이 바뀌면 인증 상태 초기화
  useEffect(() => {
    setVstate(validUrl ? 'unverified' : 'idle')
    setVinfo(null)
  }, [target, validUrl])

  // GitHub 레포 소유 여부 (내 계정 소유면 인증된 것으로 간주)
  const repoOwner = useMemo(() => (isRepo ? extractOwner(target) : null), [isRepo, target])
  const repoOwned = isRepo && ghConnected && !!repoOwner &&
    repoOwner.toLowerCase() === (user?.githubLogin ?? '').toLowerCase()

  const startVerify = async () => {
    setError('')
    setVstate('pending')
    try {
      const info = await initDomainVerify(target)
      setVinfo(info)
      if (info.verified) setVstate('verified')
    } catch {
      setError('인증 시작에 실패했어요. 잠시 후 다시 시도해 주세요.')
      setVstate('unverified')
    }
  }

  const checkVerify = async () => {
    setError('')
    setVstate('checking')
    try {
      const res = await confirmDomainVerify(target)
      if (res.verified) {
        setVstate('verified')
        toast('도메인 인증 완료', 'success')
      } else {
        setVstate('pending')
        setError('파일을 찾지 못했어요. 경로와 내용을 다시 확인해 주세요.')
      }
    } catch {
      setVstate('pending')
      setError('확인에 실패했어요. 파일이 공개 접근 가능한지 확인해 주세요.')
    }
  }

  const canScan = isRepo ? repoOwned : vstate === 'verified'

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!canScan) return setError(isRepo ? 'GitHub 레포 소유 확인이 필요해요.' : '도메인 소유권 인증이 필요해요.')
    setLoading(true)
    await new Promise((r) => setTimeout(r, 600)) // 스캔 큐잉(목)
    setLoading(false)
    navigate(`/scan/s-new/status`, { state: { target, mode } })
  }

  const copy = (text: string) => { navigator.clipboard?.writeText(text); toast('복사되었어요', 'success') }

  return (
    <div className="w-full">
      {/* Mode cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {ORDER.map((id) => {
          const m = MODE_META[id]
          const selected = mode === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => { setMode(id); setTarget(''); setError('') }}
              className="rounded-2xl p-[18px] text-left bg-white transition-all"
              style={{ background: selected ? m.soft : '#fff', border: `${selected ? 2 : 1}px solid ${selected ? m.color : 'var(--color-line)'}` }}
            >
              <div className="flex items-center justify-between mb-2.5">
                <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: selected ? '#fff' : 'var(--color-field)', color: m.color }}>
                  <Icon name={m.icon} size={19} />
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold" style={{ background: selected ? m.color : 'var(--color-field)', color: selected ? '#fff' : 'var(--color-ink-muted)' }}>
                  {m.tag}
                </span>
              </div>
              <p className="text-[15px] font-bold text-ink">{m.label}</p>
              <p className="text-[12.5px] text-ink-muted mt-0.5">{SUB[id]}</p>
            </button>
          )
        })}
      </div>

      <Card pad="lg">
        {isActions ? (
          <div className="text-center py-3">
            <span className="inline-flex w-12 h-12 rounded-2xl bg-success-soft text-success items-center justify-center mb-3"><Icon name="git-pull-request" size={24} /></span>
            <p className="text-[15px] text-ink-sub leading-relaxed mb-1">GitHub Actions 분석은 레포에 ScanOps App을 설치하면 자동으로 동작해요.</p>
            <p className="text-[13px] text-ink-muted mb-5">PR을 올릴 때마다 변경된 코드가 자동으로 검사됩니다.</p>
            <Button variant="dark" leftIcon="github" onClick={() => navigate('/integrations')}>App 설치 / 연동 관리</Button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <label className="block text-[13px] font-medium text-ink-sub mb-2">{isRepo ? 'GitHub 레포지토리' : '대상 URL'}</label>

            {isRepo && !ghConnected ? (
              <div className="rounded-xl bg-warning-soft px-4 py-3.5 flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-[13.5px] text-[#9a5b00]"><Icon name="alert-triangle" size={16} /> GitHub 연결이 필요해요.</span>
                <Button size="sm" variant="dark" leftIcon="github" onClick={() => navigate('/integrations')}>연결하기</Button>
              </div>
            ) : (
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint"><Icon name={isRepo ? 'box' : 'globe'} size={18} /></span>
                <input value={target} onChange={(e) => setTarget(e.target.value)} required
                  placeholder={isRepo ? 'acme/payments-api' : 'https://example.com'}
                  className="w-full h-[52px] rounded-xl bg-field border border-line pl-11 pr-4 text-[15px] text-ink placeholder:text-ink-faint outline-none focus:border-brand focus:bg-white transition-colors" />
              </div>
            )}

            {/* ── 소유권 인증 ───────────────────────────── */}
            {isRepo ? (
              ghConnected && (
                repoOwned ? (
                  <VerifiedBox text={`@${user?.githubLogin} 계정 소유로 확인됨`} />
                ) : repoOwner ? (
                  <div className="mt-4 rounded-xl bg-warning-soft px-4 py-3 flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-[13px] text-[#9a5b00]">
                      <Icon name="alert-triangle" size={16} /> 이 레포는 @{user?.githubLogin} 소유가 아니에요. App 설치가 필요해요.
                    </span>
                    <Button size="sm" variant="outline" onClick={() => navigate('/integrations')}>App 설치</Button>
                  </div>
                ) : null
              )
            ) : (
              <DomainVerify
                vstate={vstate} vinfo={vinfo} validUrl={validUrl}
                onStart={startVerify} onCheck={checkVerify} onCopy={copy}
              />
            )}

            {!isRepo && (
              <>
                <label className="block text-[13px] font-medium text-ink-sub mt-4 mb-2">결과 수신 이메일</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint"><Icon name="mail" size={18} /></span>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com"
                    className="w-full h-[52px] rounded-xl bg-field border border-line pl-11 pr-4 text-[15px] text-ink placeholder:text-ink-faint outline-none focus:border-brand focus:bg-white transition-colors" />
                </div>
              </>
            )}

            <div className="mt-4 flex items-center gap-1.5 text-[13px] text-ink-muted">
              <Icon name="info" size={15} />
              {isRepo ? (
                <span>이번 달 SAST <span className="text-brand font-semibold tnum">117,600줄</span> 남음</span>
              ) : (
                <span>이번 달 DAST 스캔 <Badge tone="brand" size="sm" className="mx-0.5">2 / 5회</Badge> 남음</span>
              )}
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-danger-soft px-4 py-3 text-danger text-sm">
                <Icon name="alert-triangle" size={16} /> {error}
              </div>
            )}

            <Button type="submit" size="lg" block loading={loading} className="mt-5" disabled={!canScan}>
              {isRepo ? '레포 분석 시작하기' : '스캔 시작하기'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  )
}

function VerifiedBox({ text }: { text: string }) {
  return (
    <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-success-soft px-4 py-3">
      <div className="flex items-center gap-2.5">
        <span className="text-success"><Icon name="check-circle" size={18} /></span>
        <div>
          <p className="text-[13.5px] font-semibold text-ink">소유권 인증 완료</p>
          <p className="text-[12px] text-ink-sub">{text}</p>
        </div>
      </div>
    </div>
  )
}

function DomainVerify({
  vstate, vinfo, validUrl, onStart, onCheck, onCopy,
}: {
  vstate: VState
  vinfo: DomainVerifyInit | null
  validUrl: boolean
  onStart: () => void
  onCheck: () => void
  onCopy: (t: string) => void
}) {
  if (!validUrl) {
    return (
      <div className="mt-4 flex items-center gap-2 rounded-xl bg-field px-4 py-3 text-[13px] text-ink-muted">
        <Icon name="lock" size={15} /> 대상 URL을 입력하면 도메인 소유권 인증을 진행해요.
      </div>
    )
  }
  if (vstate === 'verified') return <VerifiedBox text=".well-known 파일로 도메인 소유 확인됨" />

  if (vstate === 'unverified') {
    return (
      <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-warning-soft px-4 py-3">
        <span className="flex items-center gap-2 text-[13px] text-[#9a5b00]"><Icon name="alert-triangle" size={16} /> 도메인 소유권 인증이 필요해요.</span>
        <Button size="sm" variant="dark" onClick={onStart}>인증하기</Button>
      </div>
    )
  }

  // pending / checking — 파일 안내 + 확인
  return (
    <div className="mt-4 rounded-xl border border-line bg-surface p-4">
      <p className="text-[13px] font-semibold text-ink mb-2 flex items-center gap-1.5"><Icon name="file-text" size={15} /> 아래 파일을 도메인에 올린 뒤 “인증 확인”을 누르세요</p>
      <Row label="파일 경로" value={vinfo?.path ?? '/.well-known/scanops-verify.txt'} onCopy={onCopy} />
      <Row label="파일 내용 (토큰)" value={vinfo?.token ?? '…'} onCopy={onCopy} mono />
      <div className="flex items-center gap-2 mt-3">
        <Button size="sm" onClick={onCheck} loading={vstate === 'checking'} leftIcon="refresh-cw">인증 확인</Button>
        <span className="text-[12px] text-ink-muted">예: https://{vinfo?.domain ?? '도메인'}{vinfo?.path}</span>
      </div>
    </div>
  )
}

function Row({ label, value, onCopy, mono }: { label: string; value: string; onCopy: (t: string) => void; mono?: boolean }) {
  return (
    <div className="flex items-center gap-2 mt-1.5">
      <span className="text-[12px] text-ink-muted w-[110px] shrink-0">{label}</span>
      <code className={`flex-1 min-w-0 truncate rounded-lg bg-white border border-line px-2.5 py-1.5 text-[12px] text-ink-sub ${mono ? 'font-mono' : ''}`}>{value}</code>
      <button type="button" onClick={() => onCopy(value)} className="w-8 h-8 rounded-lg border border-line flex items-center justify-center text-ink-muted hover:text-ink shrink-0" aria-label="복사">
        <Icon name="copy" size={14} />
      </button>
    </div>
  )
}
