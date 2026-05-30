import { useNavigate } from 'react-router-dom'
import ScanForm from '../../../features/scan-request/ui/ScanForm'

export default function ScanPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-800">
        <button onClick={() => navigate('/')} className="flex items-center gap-2">
          <span className="text-green-400 text-xl font-mono font-bold">⬡</span>
          <span className="text-xl font-bold tracking-tight">ScanOps</span>
        </button>
        <button
          onClick={() => navigate('/reports')}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          스캔 이력
        </button>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg mb-8 text-center">
          <h1 className="text-3xl font-extrabold mb-2">보안 스캔 시작</h1>
          <p className="text-gray-400 text-sm">
            웹사이트 URL 또는 GitHub 레포 URL을 입력하세요.
          </p>
        </div>
        <ScanForm />
      </main>
    </div>
  )
}
