import { BrowserRouter } from 'react-router-dom'
import AppRouter from './app/router'
import { AuthProvider } from './shared/lib/auth'
import { ToastProvider } from './shared/ui/Toast'
import ErrorReportWidget from './widgets/error-report/ui/ErrorReportWidget'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRouter />
          <ErrorReportWidget />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
