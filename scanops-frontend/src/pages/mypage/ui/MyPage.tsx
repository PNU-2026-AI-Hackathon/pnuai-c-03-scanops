import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppNav from '../../../shared/ui/AppNav'
import Card from '../../../shared/ui/Card'
import Button from '../../../shared/ui/Button'
import Badge from '../../../shared/ui/Badge'
import Avatar from '../../../shared/ui/Avatar'
import Icon, { type IconName } from '../../../shared/ui/Icon'
import ProgressBar from '../../../shared/ui/ProgressBar'
import { useAuth } from '../../../shared/lib/auth'
import { fetchUsage, planById, won, type Usage } from '../../../shared/lib/mock'

export default function MyPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [usage, setUsage] = useState<Usage | null>(null)
  useEffect(() => { fetchUsage().then(setUsage) }, [])
  if (!user) return null
  const plan = planById(user.plan)

  return (
    <div className="min-h-screen bg-surface">
      <AppNav />
      <main className="max-w-[820px] mx-auto px-6 py-8 fade-up">
        <h1 className="text-[26px] font-bold text-ink tracking-tight">마이페이지</h1>

        {/* profile */}
        <Card pad="lg" className="mt-5">
          <div className="flex items-center gap-4">
            <Avatar name={user.name} size={56} />
            <div className="min-w-0 flex-1">
              <p className="text-[18px] font-bold text-ink">{user.name}</p>
              <p className="text-[13.5px] text-ink-muted">{user.email}</p>
              {user.githubLogin && (
                <span className="inline-flex items-center gap-1 mt-1 text-[12px] text-ink-sub">
                  <Icon name="github" size={13} /> @{user.githubLogin}
                </span>
              )}
            </div>
            <Button variant="outline" size="sm" leftIcon="settings" onClick={() => navigate('/settings')}>설정</Button>
          </div>
        </Card>

        {/* plan + usage */}
        <Card pad="lg" className="mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-[17px] font-bold text-ink">{plan.name} 플랜</h2>
              {plan.id === 'PRO' && <Badge tone="brand" size="sm">인기</Badge>}
            </div>
            <Button size="sm" variant="weak" onClick={() => navigate('/pricing')}>플랜 변경</Button>
          </div>
          <p className="mt-0.5 text-[13px] text-ink-muted">
            {plan.price === 0 ? '무료' : `${won(plan.price)}${plan.per}`} · 다음 결제일 {usage ? new Date(usage.periodEnd).toLocaleDateString('ko-KR') : '—'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
            <UsageRow icon="globe" label="DAST" used={usage?.dastUsed} limit={usage?.dastLimit} unit="회" color="var(--color-scan-web)" />
            <UsageRow icon="box" label="SAST" used={usage?.sastUsed} limit={usage?.sastLimit} unit="줄" color="var(--color-scan-code)" big />
            <UsageRow icon="git-pull-request" label="PR 분석" used={usage?.actionsUsed} limit={usage?.actionsLimit} unit="줄" color="var(--color-scan-pr)" big />
          </div>
        </Card>

        {/* quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          <QuickLink icon="github" title="연동 관리" sub="GitHub·App 연결" onClick={() => navigate('/integrations')} />
          <QuickLink icon="users" title="팀 관리" sub="멤버·권한 초대" onClick={() => navigate('/team')} />
          <QuickLink icon="credit-card" title="결제·청구" sub="플랜·영수증" onClick={() => navigate('/settings')} />
          <QuickLink icon="file-text" title="스캔 기록" sub="지난 리포트" onClick={() => navigate('/reports')} />
        </div>
      </main>
    </div>
  )
}

function UsageRow({ icon, label, used, limit, unit, color, big }: { icon: IconName; label: string; used?: number; limit?: number; unit: string; color: string; big?: boolean }) {
  const ready = used != null && limit != null
  const pct = ready ? Math.min(100, (used! / limit!) * 100) : 0
  const over = ready && used! > limit!
  const fmt = (n: number) => (big ? n.toLocaleString('ko-KR') : String(n))
  return (
    <div className="rounded-xl bg-surface border border-line p-3.5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[12.5px] font-semibold text-ink-sub"><span style={{ color }}><Icon name={icon} size={14} /></span>{label}</span>
        {over && <Badge tone="warning" size="sm">초과</Badge>}
      </div>
      <p className="mt-1.5 text-ink"><span className="text-[16px] font-bold tnum">{ready ? fmt(used!) : '—'}</span><span className="text-[12px] text-ink-muted"> / {ready ? fmt(limit!) : '—'}{unit}</span></p>
      <ProgressBar value={pct} color={over ? 'var(--color-warning)' : color} className="mt-2" height={5} />
    </div>
  )
}

function QuickLink({ icon, title, sub, onClick }: { icon: IconName; title: string; sub: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="group flex items-center gap-3 rounded-2xl bg-white border border-line p-4 text-left transition-all hover:border-line-strong hover:shadow-[0px_2px_8px_rgba(0,0,0,0.06)]">
      <span className="w-10 h-10 rounded-xl bg-field text-ink-sub flex items-center justify-center shrink-0 group-hover:bg-brand-soft group-hover:text-brand transition-colors"><Icon name={icon} size={19} /></span>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-semibold text-ink">{title}</p>
        <p className="text-[12px] text-ink-muted">{sub}</p>
      </div>
      <Icon name="chevron-right" size={16} className="text-ink-faint" />
    </button>
  )
}
