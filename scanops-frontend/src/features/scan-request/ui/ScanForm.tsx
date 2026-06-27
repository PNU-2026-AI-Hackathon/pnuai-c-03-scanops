import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../../../shared/ui/Icon'
import Button from '../../../shared/ui/Button'
import Card from '../../../shared/ui/Card'
import Badge from '../../../shared/ui/Badge'
import { MODE_META, type ScanMode } from '../../../shared/lib/mock'
import { useAuth } from '../../../shared/lib/auth'

const ORDER: ScanMode[] = ['WEBSITE', 'GITHUB_REPO', 'GITHUB_ACTIONS']
const SUB: Record<ScanMode, string> = {
  WEBSITE: '실행 중인 앱 동적 분석',
  GITHUB_REPO: '소스코드 전체 정적 분석',
  GITHUB_ACTIONS: 'PR diff 자동 검사',
}

export default function ScanForm() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [mode, setMode] = useState<ScanMode>('WEBSITE')
  const [target, setTarget] = useState('')
  const [email, setEmail] = useState(user?.email ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isActions = mode === 'GITHUB_ACTIONS'
  const isRepo = mode === 'GITHUB_REPO'
  const ghConnected = !!user?.githubLogin

  const validate = (): string => {
    if (isRepo) {
      if (!/^https?:\/\/github\.com\/[^/]+\/[^/]+/.test(target) && !/^[\w.-]+\/[\w.-]+$/.test(target))
        return 'GitHub 레포를 입력해 주세요. (예: acme/payments-api)'
      return ''
    }
    if (!/^https?:\/\//.test(target)) return 'URL은 http:// 또는 https://로 시작해야 합니다.'
    return ''
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const v = validate()
    if (v) return setError(v)
    setLoading(true)
    // mock: pretend the backend queued a job, then go to live status
    await new Promise((r) => setTimeout(r, 600))
    setLoading(false)
    navigate(`/scan/s-new/status`, { state: { target, mode } })
  }

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
              style={{
                background: selected ? m.soft : '#fff',
                border: `${selected ? 2 : 1}px solid ${selected ? m.color : 'var(--color-line)'}`,
              }}
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

      {/* Body */}
      <Card pad="lg">
        {isActions ? (
          <div className="text-center py-3">
            <span className="inline-flex w-12 h-12 rounded-2xl bg-success-soft text-success items-center justify-center mb-3">
              <Icon name="git-pull-request" size={24} />
            </span>
            <p className="text-[15px] text-ink-sub leading-relaxed mb-1">
              GitHub Actions 분석은 레포에 ScanOps App을 설치하면 자동으로 동작해요.
            </p>
            <p className="text-[13px] text-ink-muted mb-5">PR을 올릴 때마다 변경된 코드가 자동으로 검사됩니다.</p>
            <Button variant="dark" leftIcon="github" onClick={() => navigate('/integrations')}>App 설치 / 연동 관리</Button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <label className="block text-[13px] font-medium text-ink-sub mb-2">
              {isRepo ? 'GitHub 레포지토리' : '대상 URL'}
            </label>

            {isRepo && !ghConnected ? (
              <div className="rounded-xl bg-warning-soft px-4 py-3.5 flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-[13.5px] text-[#9a5b00]">
                  <Icon name="alert-triangle" size={16} /> GitHub 연결이 필요해요.
                </span>
                <Button size="sm" variant="dark" leftIcon="github" onClick={() => navigate('/integrations')}>연결하기</Button>
              </div>
            ) : (
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint">
                  <Icon name={isRepo ? 'box' : 'globe'} size={18} />
                </span>
                <input
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  required
                  placeholder={isRepo ? 'acme/payments-api' : 'https://example.com'}
                  className="w-full h-[52px] rounded-xl bg-field border border-line pl-11 pr-4 text-[15px] text-ink placeholder:text-ink-faint outline-none focus:border-brand focus:bg-white transition-colors"
                />
              </div>
            )}

            {/* Ownership verification */}
            {(!isRepo || ghConnected) && (
              <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-success-soft px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-success"><Icon name="check-circle" size={18} /></span>
                  <div>
                    <p className="text-[13.5px] font-semibold text-ink">소유권 인증 완료</p>
                    <p className="text-[12px] text-ink-sub">
                      {isRepo ? '연결된 GitHub 계정으로 소유 확인됨' : 'DNS TXT 레코드로 도메인 소유 확인됨'}
                    </p>
                  </div>
                </div>
                <button type="button" className="text-[12.5px] text-success font-semibold hover:underline">재검증</button>
              </div>
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

            {/* Usage gate */}
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

            <Button type="submit" size="lg" block loading={loading} className="mt-5"
              disabled={isRepo && !ghConnected}>
              {isRepo ? '레포 분석 시작하기' : '스캔 시작하기'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  )
}
