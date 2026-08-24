import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './auth'

export interface TourStep {
  id: string
  /** CSS selector for the element to spotlight (matched via data-tour attributes). */
  selector: string
  title: string
  desc: string
  placement: 'bottom' | 'top'
}

/** Beta onboarding tour. Every target lives on /dashboard, so no cross-page nav is needed. */
export const TOUR_STEPS: TourStep[] = [
  {
    id: 'new-scan',
    selector: '[data-tour="dashboard-new-scan"]',
    title: '여기서 스캔을 시작해요',
    desc: '웹사이트 URL은 DAST(동적 분석), GitHub 레포는 SAST(정적 분석)로 검사할 수 있어요.',
    placement: 'bottom',
  },
  {
    id: 'usage',
    selector: '[data-tour="usage-cards"]',
    title: '사용량을 한눈에',
    desc: 'DAST·SAST·PR 자동분석 사용량과 한도를 확인해요. 한도를 넘으면 여기 표시돼요.',
    placement: 'bottom',
  },
  {
    id: 'token-balance',
    selector: '[data-tour="posture-card"]',
    title: '토큰 현황',
    desc: '이번 달 받은 토큰과 남은 잔액을 확인해요. 진행 중인 스캔이 예약해 둔 토큰도 여기 표시돼요.',
    placement: 'bottom',
  },
  {
    id: 'recent-scans',
    selector: '[data-tour="recent-scans-card"]',
    title: '최근 스캔 기록',
    desc: '실행한 스캔 목록이에요. 완료된 스캔을 누르면 취약점 상세 리포트로 이동해요.',
    placement: 'top',
  },
  {
    id: 'integrations',
    selector: '[data-tour="nav-integrations"]',
    title: 'GitHub 레포 연동',
    desc: 'GitHub를 연동하면 레포 전체 SAST 분석과 PR 자동 분석을 쓸 수 있어요.',
    placement: 'bottom',
  },
  {
    id: 'pricing',
    selector: '[data-tour="nav-pricing"]',
    title: 'Pro, 지금 무료로 써보세요',
    desc: '베타 기간에는 Pro 요금제를 무료로 체험할 수 있어요. 요금제에서 Pro를 선택해 "결제하기"를 눌러도 실제로 청구되지 않으니 편하게 눌러보세요.',
    placement: 'bottom',
  },
  {
    id: 'account',
    selector: '[data-tour="nav-avatar"]',
    title: '마이페이지',
    desc: '플랜·토큰 잔액을 확인하고, 베타 테스트 설문에 참여할 수 있어요.',
    placement: 'bottom',
  },
]

interface TourCtx {
  active: boolean
  stepIndex: number
  steps: TourStep[]
  next: () => void
  prev: () => void
  skip: () => void
  /** Manually replay the tour (e.g. from a "가이드 다시보기" menu item). */
  restart: () => void
}

const Ctx = createContext<TourCtx | null>(null)

export function useTour() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useTour must be used within TourProvider')
  return c
}

const seenKey = (email: string) => `scanops.tour.seen.${email}`
/** Poll for the first step's target to mount (skeletons resolve async) before revealing it. */
const POLL_MS = 80
const POLL_TRIES = 40

export function TourProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [active, setActive] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const autoTriedRef = useRef(false)
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const beginWhenReady = useCallback(() => {
    if (pollRef.current) clearTimeout(pollRef.current)
    let tries = 0
    const tick = () => {
      if (document.querySelector(TOUR_STEPS[0].selector)) {
        setStepIndex(0)
        setActive(true)
        return
      }
      if (tries++ < POLL_TRIES) pollRef.current = setTimeout(tick, POLL_MS)
    }
    tick()
  }, [])

  useEffect(() => () => { if (pollRef.current) clearTimeout(pollRef.current) }, [])

  // Auto-start once per beta tester, the first time they land on the dashboard.
  useEffect(() => {
    if (!user || location.pathname !== '/dashboard') return
    if (autoTriedRef.current || localStorage.getItem(seenKey(user.email))) return
    autoTriedRef.current = true
    const t = setTimeout(beginWhenReady, 350)
    return () => clearTimeout(t)
  }, [user, location.pathname, beginWhenReady])

  const finish = useCallback(() => {
    setActive(false)
    if (user) localStorage.setItem(seenKey(user.email), '1')
  }, [user])

  const next = useCallback(() => {
    setStepIndex((i) => {
      if (i + 1 >= TOUR_STEPS.length) { finish(); return i }
      return i + 1
    })
  }, [finish])

  const prev = useCallback(() => setStepIndex((i) => Math.max(0, i - 1)), [])
  const skip = useCallback(() => finish(), [finish])

  const restart = useCallback(() => {
    if (location.pathname !== '/dashboard') navigate('/dashboard')
    beginWhenReady()
  }, [location.pathname, navigate, beginWhenReady])

  return (
    <Ctx.Provider value={{ active, stepIndex, steps: TOUR_STEPS, next, prev, skip, restart }}>
      {children}
    </Ctx.Provider>
  )
}
