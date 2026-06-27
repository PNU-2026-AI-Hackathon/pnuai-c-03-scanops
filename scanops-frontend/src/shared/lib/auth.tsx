import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { PlanId, User } from './mock'

/**
 * Authentication/session.
 * - GitHub OAuth is REAL: the button redirects to the backend, which exchanges
 *   the code and redirects back with a JWT; `loginWithToken` calls /api/auth/me.
 * - Email/password remain mocked (no backend endpoint yet).
 * Token is stored in localStorage and attached as Bearer by the http client.
 */

const STORAGE_KEY = 'scanops.session'
const TOKEN_KEY = 'scanops.token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

interface AuthState {
  user: User | null
  ready: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  /** Completes a REAL GitHub login from the OAuth callback (?token=…). */
  loginWithToken: (token: string) => Promise<void>
  /** Mock GitHub completion — local-dev fallback when no token is present. */
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
  // REAL: store JWT from OAuth callback, then fetch the profile from the backend.
  const loginWithToken = async (token: string) => {
    localStorage.setItem(TOKEN_KEY, token)
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error('me failed')
    const me = await res.json()
    set({
      id: String(me.id),
      name: me.name || me.githubLogin,
      email: me.email || `${me.githubLogin}@users.noreply.github.com`,
      plan: (me.plan as PlanId) ?? 'FREE',
      avatarUrl: me.avatarUrl || null,
      githubLogin: me.githubLogin ?? null,
    })
  }
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    set(null)
  }
  const update = (patch: Partial<User>) => setUser((u) => {
    if (!u) return u
    const next = { ...u, ...patch }
    persist(next)
    return next
  })

  return (
    <Ctx.Provider value={{ user, ready, login, signup, loginWithToken, completeGitHub, logout, update }}>
      {children}
    </Ctx.Provider>
  )
}
