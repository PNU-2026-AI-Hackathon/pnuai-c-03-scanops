import { useNavigate } from 'react-router-dom'

const features = [
  {
    icon: '🔍',
    title: '자동 취약점 탐지',
    desc: 'OWASP Top 10 기반으로 XSS, SQLi, CSRF 등을 자동으로 스캔합니다.',
  },
  {
    icon: '🤖',
    title: 'AI 분석 리포트',
    desc: 'AI가 각 취약점의 위험도와 대응 방안을 자동으로 분석합니다.',
  },
  {
    icon: '📊',
    title: 'CVSS 점수 시각화',
    desc: '국제 표준 CVSS 점수로 위험도를 직관적으로 확인할 수 있습니다.',
  },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-green-400 text-xl font-mono font-bold">⬡</span>
          <span className="text-xl font-bold tracking-tight">ScanOps</span>
        </div>
        <div className="flex gap-6 text-sm text-gray-400">
          <button onClick={() => navigate('/scan')} className="hover:text-green-400 transition-colors">
            스캔 시작
          </button>
          <button onClick={() => navigate('/reports')} className="hover:text-green-400 transition-colors">
            스캔 이력
          </button>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-400/10 border border-green-400/20 text-green-400 text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          AI 기반 자동 보안 진단
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
          웹 취약점을{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
            자동으로 탐지
          </span>
          합니다
        </h1>

        <p className="max-w-xl text-lg text-gray-400 mb-10 leading-relaxed">
          URL 하나만 입력하면 ScanOps가 XSS·SQL Injection·CSRF 등 주요 취약점을 자동으로
          분석하고 AI 기반 보안 보고서를 생성합니다.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/scan')}
            className="px-8 py-3.5 rounded-lg bg-green-400 text-gray-950 font-semibold text-sm hover:bg-green-300 transition-colors shadow-lg shadow-green-400/20"
          >
            스캔 시작하기 →
          </button>
          <button
            onClick={() => navigate('/reports')}
            className="px-8 py-3.5 rounded-lg border border-gray-700 text-gray-300 font-semibold text-sm hover:border-gray-500 hover:text-white transition-colors"
          >
            내 스캔 이력
          </button>
        </div>

        {/* Feature grid */}
        <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl w-full text-left">
          {features.map((f) => (
            <div
              key={f.title}
              className="p-5 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors"
            >
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-sm mb-1.5">{f.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-gray-600 border-t border-gray-800">
        © 2026 ScanOps · 보안 진단 자동화 솔루션
      </footer>
    </div>
  )
}
