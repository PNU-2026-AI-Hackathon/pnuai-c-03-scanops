import { Routes, Route } from 'react-router-dom'
import LandingPage from '../pages/landing/ui/LandingPage'
import LoginPage from '../pages/login/ui/LoginPage'
import SignupPage from '../pages/signup/ui/SignupPage'
import ScanPage from '../pages/scan/ui/ScanPage'
import StatusPage from '../pages/scan-status/ui/StatusPage'
import ReportPage from '../pages/report/ui/ReportPage'
import ReportsPage from '../pages/reports/ui/ReportsPage'
import MyPage from '../pages/mypage/ui/MyPage'
import PricingPage from '../pages/pricing/ui/PricingPage'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/scan" element={<ScanPage />} />
      <Route path="/scan/:id/status" element={<StatusPage />} />
      <Route path="/report/:id" element={<ReportPage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/mypage" element={<MyPage />} />
      <Route path="/pricing" element={<PricingPage />} />
    </Routes>
  )
}
