import { Routes, Route } from 'react-router-dom'
import LandingPage from '../pages/landing/ui/LandingPage'
import ScanPage from '../pages/scan/ui/ScanPage'
import StatusPage from '../pages/scan-status/ui/StatusPage'
import ReportPage from '../pages/report/ui/ReportPage'
import ReportsPage from '../pages/reports/ui/ReportsPage'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/scan" element={<ScanPage />} />
      <Route path="/scan/:id/status" element={<StatusPage />} />
      <Route path="/report/:id" element={<ReportPage />} />
      <Route path="/reports" element={<ReportsPage />} />
    </Routes>
  )
}
