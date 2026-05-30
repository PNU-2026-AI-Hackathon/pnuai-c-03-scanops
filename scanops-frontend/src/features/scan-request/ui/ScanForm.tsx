import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { startScan } from '../api/startScan'

type ScanMode = 'WEBSITE' | 'GITHUB_REPO'

interface ModeTab {
  id: ScanMode
  icon: string
  label: string
  description: string
  placeholder: string
  example: string
}

const MODES: ModeTab[] = [
  {
    id: 'WEBSITE',
    icon: '🌐',
    label: '웹사이트 스캔',
    description: 'OWASP ZAP으로 라이브 사이트의 보안 취약점을 탐지합니다',
    placeholder: 'https://example.com',
    example: 'XSS, SQL Injection, CORS 등',
  },
  {
    id: 'GITHUB_REPO',
    icon: '📁',
    label: 'GitHub 레포 분석',
    description: 'QLoRA 파인튜닝 모델이 소스코드를 정적 분석합니다',
    placeholder: 'https://github.com/user/repo',
    example: 'React, Java, Python, Node.js 등',
  },
]

export default function ScanForm() {
  const navigate = useNavigate()
  const [mode, setMode]         = useState<ScanMode>('WEBSITE')
  const [targetUrl, setTargetUrl] = useState('')
  const [email, setEmail]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const activeMode = MODES.find(m => m.id === mode)!

  // URL 입력 시 자동으로 모드 전환
  const handleUrlChange = (val: string) => {
    setTargetUrl(val)
    if (val.includes('github.com')) setMode('GITHUB_REPO')
    else if (val.startsWith('http') && !val.includes('github.com')) setMode('WEBSITE')
  }

  const validateUrl = (): string => {
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      return 'URL은 http:// 또는 https://로 시작해야 합니다.'
    }
    if (mode === 'GITHUB_REPO') {
      const githubPattern = /^https?:\/\/github\.com\/[^/]+\/[^/]+/
      if (!githubPattern.test(targetUrl)) {
        return 'GitHub 레포 URL을 입력해 주세요. (예: https://github.com/user/repo)'
      }
    }
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const urlError = validateUrl()
    if (urlError) {
      setError(urlError)
      return
    }

    setLoading(true)
    try {
      const job = await startScan({ targetUrl, ownerEmail: email, scanMode: mode })
      navigate(`/scan/${job.id}/status`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      // 백엔드가 보낸 구체적인 메시지는 그대로, HTTP 에러만 generic 처리
      setError(msg.startsWith('HTTP') ? '스캔 요청에 실패했습니다. 잠시 후 다시 시도해주세요.' : msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-lg">

      {/* 모드 탭 */}
      <div className="flex rounded-xl bg-gray-800/60 p-1 mb-6 border border-gray-700">
        {MODES.map(m => (
          <button
            key={m.id}
            type="button"
            onClick={() => { setMode(m.id); setTargetUrl('') }}
            className={`
              flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium
              transition-all duration-200
              ${mode === m.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
              }
            `}
          >
            <span className="text-base">{m.icon}</span>
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      {/* 모드 설명 */}
      <div className={`
        rounded-xl p-4 mb-6 border
        ${mode === 'WEBSITE'
          ? 'bg-blue-950/40 border-blue-800/50'
          : 'bg-violet-950/40 border-violet-800/50'
        }
      `}>
        <p className="text-sm text-gray-300">{activeMode.description}</p>
        <p className="text-xs text-gray-500 mt-1">
          탐지 대상: <span className="text-gray-400">{activeMode.example}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* URL 입력 */}
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">
            {mode === 'WEBSITE' ? '대상 URL' : 'GitHub 레포지토리 URL'}
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-lg select-none">
              {activeMode.icon}
            </span>
            <input
              type="url"
              value={targetUrl}
              onChange={e => handleUrlChange(e.target.value)}
              required
              placeholder={activeMode.placeholder}
              className="
                w-full bg-gray-800 border border-gray-700 rounded-xl
                pl-10 pr-4 py-3 text-white placeholder-gray-600
                focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30
                transition-colors
              "
            />
          </div>
          {mode === 'GITHUB_REPO' && (
            <p className="text-xs text-gray-600 mt-1.5 ml-1">
              Public 레포: 인증 없이 분석 가능 • Private 레포: 환경변수 GITHUB_TOKEN 필요
            </p>
          )}
        </div>

        {/* 이메일 */}
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">이메일 (결과 수신용)</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="
              w-full bg-gray-800 border border-gray-700 rounded-xl
              px-4 py-3 text-white placeholder-gray-600
              focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30
              transition-colors
            "
          />
        </div>

        {/* 에러 */}
        {error && (
          <div className="flex items-center gap-2 bg-red-950/50 border border-red-800/50 rounded-xl px-4 py-3">
            <span className="text-red-400">⚠</span>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* 예상 소요시간 안내 */}
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <span>⏱</span>
          <span>
            {mode === 'WEBSITE'
              ? '예상 소요시간: 2~5분 (사이트 규모에 따라 상이)'
              : '예상 소요시간: 파일 수에 따라 1~10분 (파일당 ~3초)'}
          </span>
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={loading}
          className={`
            w-full py-3.5 rounded-xl font-semibold text-white
            transition-all duration-200 shadow-lg
            ${loading
              ? 'opacity-60 cursor-not-allowed bg-gray-700'
              : mode === 'WEBSITE'
                ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20 hover:shadow-blue-500/30'
                : 'bg-violet-600 hover:bg-violet-500 shadow-violet-600/20 hover:shadow-violet-500/30'
            }
          `}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              분석 요청 중...
            </span>
          ) : (
            `${activeMode.icon} ${mode === 'WEBSITE' ? '스캔 시작' : '레포 분석 시작'}`
          )}
        </button>
      </form>

    </div>
  )
}
