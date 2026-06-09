import { useNavigate, useLocation } from 'react-router-dom'
import Logo from './Logo'

interface NavItem {
  label: string
  path: string
  match: (p: string) => boolean
}

const ITEMS: NavItem[] = [
  { label: '스캔', path: '/scan', match: (p) => p.startsWith('/scan') },
  { label: '스캔 기록', path: '/reports', match: (p) => p.startsWith('/reports') || p.startsWith('/report/') },
  { label: '요금제', path: '/pricing', match: (p) => p.startsWith('/pricing') },
]

/** Shared top navigation for authenticated app screens (light theme). */
export default function AppNav({ plan = 'Pro' }: { plan?: string | null }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav className="sticky top-0 z-20 flex items-center justify-between h-16 px-6 sm:px-10 bg-white border-b border-line">
      <div className="flex items-center gap-8">
        <Logo size={18} onClick={() => navigate('/')} />
        <div className="hidden sm:flex items-center gap-7">
          {ITEMS.map((it) => {
            const active = it.match(pathname)
            return (
              <button
                key={it.path}
                onClick={() => navigate(it.path)}
                className={`text-sm transition-colors ${
                  active ? 'text-ink font-semibold' : 'text-ink-muted font-medium hover:text-ink-sub'
                }`}
              >
                {it.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex items-center gap-3.5">
        {plan && (
          <span className="px-3 py-1.5 rounded-full bg-brand-soft text-brand text-xs font-bold">
            {plan}
          </span>
        )}
        <button
          onClick={() => navigate('/mypage')}
          className="w-8 h-8 rounded-full bg-ink hover:opacity-90 transition-opacity"
          aria-label="마이페이지"
        />
      </div>
    </nav>
  )
}
