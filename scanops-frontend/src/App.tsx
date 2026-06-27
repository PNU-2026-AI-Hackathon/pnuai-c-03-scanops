import { BrowserRouter } from 'react-router-dom'
import AppRouter from './app/router'
import { AuthProvider } from './shared/lib/auth'
import { ToastProvider } from './shared/ui/Toast'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRouter />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
