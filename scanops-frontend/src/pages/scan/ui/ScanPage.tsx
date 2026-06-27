import AppNav from '../../../shared/ui/AppNav'
import ScanForm from '../../../features/scan-request/ui/ScanForm'

export default function ScanPage() {
  return (
    <div className="min-h-screen bg-surface">
      <AppNav />

      <main className="max-w-[760px] mx-auto px-6 py-10">
        <h1 className="text-[28px] font-bold text-ink tracking-tight">새 보안 스캔</h1>
        <p className="mt-1.5 text-[15px] text-ink-muted">
          검사할 대상과 방식을 선택하세요. 모든 스캔은 소유권 인증 후 실행됩니다.
        </p>
        <div className="mt-7">
          <ScanForm />
        </div>
      </main>
    </div>
  )
}
