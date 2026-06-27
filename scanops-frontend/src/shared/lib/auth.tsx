import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { PlanId, User } from './mock'

/**
 * Mock authentication/session. Persists a fake user to localStorage so the app
 * behaves like a logged-in SaaS without a backend. Replace the bodies of
 * login/signup/loginWithGitHub with real API + OAuth once available — the
 * `User` shape and hook surface are the contract the UI depends on.
 */

const STORAGE_KEY = 'scanops.session'

interface AuthState {
  user: User | null
  ready: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  /** Completes a (mocked) GitHub OAuth login — called from the callback screen. */
  completeGitHub: (login: string) => Promise<User>
  logout: () => void
  update: (patch: Partial<User>) => void
}

const Ctx = createContext<AuthState | null>(null)

export function useAuth() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useAuth must be used within AuthProvider')
  return c
}

function persist(u: User | null) {
  if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
  else localStorage.removeItem(STORAGE_KEY)
}

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms))

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setUser(JSON.parse(raw))
    } catch { /* ignore */ }
    setReady(true)
  }, [])

  const set = (u: User | null) => {
    setUser(u)
    persist(u)
  }

  const makeUser = (email: string, plan: PlanId = 'PRO', githubLogin?: string): User => ({
    id: 'u-' + email.length,
    name: email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    email,
    plan,
    githubLogin: githubLogin ?? null,
  })

  const login = async (email: string) => {
    await delay()
    set(makeUser(email, 'PRO'))
  }
  const signup = async (email: string) => {
    await delay()
    set(makeUser(email, 'FREE'))
  }
  const completeGitHub = async (login: string) => {
    await delay(900)
    const u = makeUser(`${login}@users.noreply.github.com`, 'PRO', login)
    u.name = login
    set(u)
    return u
  }
  const logout = () => set(null)
  const update = (patch: Partial<User>) => setUser((u) => {
    if (!u) return u
    const next = { ...u, ...patch }
    persist(next)
    return next
  })

  return (
    <Ctx.Provider value={{ user, ready, login, signup, completeGitHub, logout, update }}>
      {children}
    </Ctx.Provider>
  )
}
