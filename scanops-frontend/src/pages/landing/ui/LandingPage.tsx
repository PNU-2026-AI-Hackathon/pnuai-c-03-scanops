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

      {/* GitHub App 설치 섹션 */}
      <section className="py-24 px-6 border-t border-gray-800">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-400/10 border border-purple-400/20 text-purple-400 text-xs font-medium">
            GitHub App
          </div>
          <h2 className="text-3xl font-bold mb-6">
            PR 올리면{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              자동으로 분석
            </span>
            됩니다
          </h2>
          <p className="text-gray-400 text-base leading-relaxed mb-10">
            ScanOps GitHub App을 내 레포에 설치하면, PR을 올릴 때마다 자동으로 보안 취약점 검사가 시작돼요.
            XSS, 코드 인젝션, SSRF 같은 취약점이 발견되면 해당 코드 줄에 바로 댓글이 달리고
            뭐가 문제인지, 어떻게 고치면 되는지 한국어로 알려줍니다.
            설치는 딱 한 번만 하면 돼요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <a
              href="https://github.com/apps/scanops-security-scanner"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 rounded-lg bg-purple-500 text-white font-semibold text-sm hover:bg-purple-400 transition-colors shadow-lg shadow-purple-500/20"
            >
              GitHub App 설치하기 →
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            {[
              { step: '01', title: 'App 설치', desc: '설치 페이지에서 Install 누르고 레포 선택' },
              { step: '02', title: 'PR 올리기', desc: '평소처럼 PR 올리면 자동 분석 시작' },
              { step: '03', title: '결과 확인', desc: '1~2분 후 코드에 취약점 댓글 자동 등록' },
            ].map((item) => (
              <div key={item.step} className="p-5 rounded-xl bg-gray-900 border border-gray-800">
                <div className="text-purple-400 text-xs font-mono mb-2">{item.step}</div>
                <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-6 text-center text-xs text-gray-600 border-t border-gray-800">
        © 2026 ScanOps · 보안 진단 자동화 솔루션
      </footer>
    </div>
  )
}
