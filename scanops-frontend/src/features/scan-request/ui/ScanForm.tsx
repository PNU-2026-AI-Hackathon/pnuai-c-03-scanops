import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { startScan } from '../api/startScan'

type ScanMode = 'WEBSITE' | 'GITHUB_REPO' | 'GITHUB_ACTIONS'

interface ModeCard {
  id: ScanMode
  icon: string
  tag: string
  title: string
  sub: string
  meter: string
  accent: string
  soft: string
}

const MODES: ModeCard[] = [
  {
    id: 'WEBSITE',
    icon: '🌐',
    tag: 'DAST',
    title: '웹사이트',
    sub: '실행 중인 앱 동적 분석',
    meter: '스캔 횟수',
    accent: 'var(--color-brand)',
    soft: 'var(--color-brand-soft)',
  },
  {
    id: 'GITHUB_REPO',
    icon: '📦',
    tag: 'SAST',
    title: '레포 전체',
    sub: '소스코드 정적 분석',
    meter: 'LOC 누적',
    accent: 'var(--color-scan-code)',
    soft: '#f3eefe',
  },
  {
    id: 'GITHUB_ACTIONS',
    icon: '🔀',
    tag: 'Actions',
    title: 'PR 자동 분석',
    sub: 'PR diff 검사',
    meter: 'LOC 누적',
    accent: 'var(--color-ink)',
    soft: 'var(--color-field)',
  },
]

export default function ScanForm() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<ScanMode>('WEBSITE')
  const [targetUrl, setTargetUrl] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isActions = mode === 'GITHUB_ACTIONS'
  const isRepo = mode === 'GITHUB_REPO'

  const handleUrlChange = (val: string) => {
    setTargetUrl(val)
    if (val.includes('github.com')) setMode('GITHUB_REPO')
    else if (val.startsWith('http')) setMode('WEBSITE')
  }

  const validateUrl = (): string => {
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      return 'URL은 http:// 또는 https://로 시작해야 합니다.'
    }
    if (isRepo && !/^https?:\/\/github\.com\/[^/]+\/[^/]+/.test(targetUrl)) {
      return 'GitHub 레포 URL을 입력해 주세요. (예: https://github.com/user/repo)'
    }
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const urlError = validateUrl()
    if (urlError) return setError(urlError)

    setLoading(true)
    try {
      const job = await startScan({ targetUrl, ownerEmail: email, scanMode: isRepo ? 'GITHUB_REPO' : 'WEBSITE' })
      navigate(`/scan/${job.id}/status`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      setError(msg.startsWith('HTTP') ? '스캔 요청에 실패했습니다. 잠시 후 다시 시도해주세요.' : msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      {/* Mode cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {MODES.map((m) => {
          const selected = mode === m.id
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setMode(m.id)
                setTargetUrl('')
                setError('')
              }}
              className="rounded-2xl p-[18px] text-left bg-white transition-all"
              style={{
                background: selected ? m.soft : '#fff',
                border: `${selected ? 2 : 1}px solid ${selected ? m.accent : 'var(--color-line)'}`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[22px]">{m.icon}</span>
                <span
                  className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                  style={{
                    background: selected ? m.accent : 'var(--color-field)',
                    color: selected ? '#fff' : 'var(--color-ink-muted)',
                  }}
                >
                  {m.tag}
                </span>
              </div>
              <p className="text-base font-bold text-ink">{m.title}</p>
              <p className="text-[12.5px] text-ink-muted mt-0.5">{m.sub}</p>
              <p className="mt-2 text-[11px] text-ink-faint font-medium">
                미터: <span className="text-ink-sub font-semibold">{m.meter}</span>
              </p>
            </button>
          )
        })}
      </div>

      {/* Body card */}
      <div className="rounded-2xl bg-white border border-line p-6">
        {isActions ? (
          <div className="text-center py-4">
            <p className="text-[15px] text-ink-sub leading-relaxed mb-1">
              GitHub Actions 분석은 레포에 ScanOps App을 설치하면 자동으로 동작합니다.
            </p>
            <p className="text-[13px] text-ink-muted mb-5">
              PR을 올릴 때마다 변경된 코드가 자동으로 검사돼요.
            </p>
            <a
              href="https://github.com/apps/scanops-security-scanner"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 rounded-xl bg-ink text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              GitHub App 설치하기
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label className="block text-[13px] font-medium text-ink-sub mb-2">
              {isRepo ? 'GitHub 레포지토리 URL' : '대상 URL'}
            </label>
            <input
              type="url"
              value={targetUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              required
              placeholder={isRepo ? 'https://github.com/user/repo' : 'https://example.com'}
              className="w-full h-[52px] rounded-xl bg-field border border-line px-4 text-[15px] text-ink placeholder:text-ink-faint outline-none focus:border-brand focus:bg-white transition-colors"
            />

            {/* Ownership verification */}
            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-emerald-50 px-3.5 py-3">
              <div className="flex items-center gap-2.5">
                <span className="text-emerald-500 font-bold">✓</span>
                <div>
                  <p className="text-[13.5px] font-semibold text-ink">소유권 인증 완료</p>
                  <p className="text-[12px] text-ink-sub">
                    {isRepo ? '레포 파일로 대상 소유 확인됨' : 'DNS TXT 레코드로 도메인 소유 확인됨'}
                  </p>
                </div>
              </div>
              <button type="button" className="text-[12.5px] text-emerald-600 font-semibold">
                재검증
              </button>
            </div>

            {/* Result email */}
            <label className="block text-[13px] font-medium text-ink-sub mt-4 mb-2">
              결과 수신 이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full h-[52px] rounded-xl bg-field border border-line px-4 text-[15px] text-ink placeholder:text-ink-faint outline-none focus:border-brand focus:bg-white transition-colors"
            />

            {/* Usage gate */}
            <div className="mt-4 flex items-center gap-1.5 text-[13px] text-ink-muted">
              <span>ⓘ</span>
              {isRepo ? (
                <span>
                  이번 달 SAST <span className="text-brand font-semibold">117,600줄</span> 남음
                </span>
              ) : (
                <span>
                  이번 달 DAST 스캔 <span className="text-brand font-semibold">7 / 10회</span> 남음
                </span>
              )}
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                <span className="text-red-500">⚠</span>
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`mt-5 w-full h-[54px] rounded-xl font-bold text-base text-white transition-colors ${
                loading ? 'bg-ink-faint cursor-not-allowed' : 'bg-brand hover:bg-brand-hover'
              }`}
            >
              {loading ? '분석 요청 중...' : isRepo ? '레포 분석 시작하기' : '스캔 시작하기'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
