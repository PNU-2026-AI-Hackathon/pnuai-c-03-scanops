import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppNav from '../../../shared/ui/AppNav'
import Card from '../../../shared/ui/Card'
import Button from '../../../shared/ui/Button'
import Input from '../../../shared/ui/Input'
import Badge from '../../../shared/ui/Badge'
import Toggle from '../../../shared/ui/Toggle'
import Modal from '../../../shared/ui/Modal'
import Icon, { type IconName } from '../../../shared/ui/Icon'
import { useAuth } from '../../../shared/lib/auth'
import { useToast } from '../../../shared/ui/Toast'
import { planById, won } from '../../../shared/lib/mock'

type Tab = 'account' | 'security' | 'notifications' | 'billing' | 'danger'
const TABS: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'account', label: '계정', icon: 'user' },
  { id: 'security', label: '보안', icon: 'lock' },
  { id: 'notifications', label: '알림', icon: 'bell' },
  { id: 'billing', label: '결제·청구', icon: 'credit-card' },
  { id: 'danger', label: '위험 구역', icon: 'alert-triangle' },
]

export default function SettingsPage() {
  const navigate = useNavigate()
  const { user, update, logout } = useAuth()
  const { toast } = useToast()
  const [tab, setTab] = useState<Tab>('account')
  const [name, setName] = useState(user?.name ?? '')
  const [notif, setNotif] = useState({ scanDone: true, weekly: true, marketing: false, criticalOnly: false })
  const [delOpen, setDelOpen] = useState(false)
  if (!user) return null
  const plan = planById(user.plan)

  return (
    <div className="min-h-screen bg-surface">
      <AppNav />
      <main className="max-w-[900px] mx-auto px-6 py-8 fade-up">
        <h1 className="text-[26px] font-bold text-ink tracking-tight">설정</h1>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-5 mt-5">
          {/* tabs */}
          <nav className="flex md:flex-col gap-1 overflow-x-auto">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2.5 px-3.5 h-10 rounded-xl text-[13.5px] font-medium whitespace-nowrap transition-colors ${
                  tab === t.id ? 'bg-white border border-line text-ink font-semibold shadow-[0px_1px_3px_rgba(0,0,0,0.05)]'
                    : 'text-ink-muted hover:text-ink-sub hover:bg-white/60'
                } ${t.id === 'danger' ? 'text-danger' : ''}`}>
                <Icon name={t.icon} size={16} /> {t.label}
              </button>
            ))}
          </nav>

          {/* panel */}
          <div className="min-w-0">
            {tab === 'account' && (
              <Card pad="lg">
                <h2 className="text-[17px] font-bold text-ink mb-4">계정 정보</h2>
                <div className="flex flex-col gap-4 max-w-[420px]">
                  <Input label="이름" value={name} onChange={(e) => setName(e.target.value)} />
                  <Input label="이메일" value={user.email} disabled hint="이메일은 변경할 수 없어요." />
                  <Button className="self-start" onClick={() => { update({ name }); toast('저장했어요', 'success') }}>변경 저장</Button>
                </div>
              </Card>
            )}

            {tab === 'security' && (
              <div className="flex flex-col gap-4">
                <Card pad="lg">
                  <h2 className="text-[17px] font-bold text-ink mb-4">비밀번호</h2>
                  <div className="flex flex-col gap-4 max-w-[420px]">
                    <Input label="현재 비밀번호" reveal placeholder="••••••••" />
                    <Input label="새 비밀번호" reveal placeholder="8자 이상" />
                    <Button className="self-start" onClick={() => toast('비밀번호를 변경했어요', 'success')}>비밀번호 변경</Button>
                  </div>
                </Card>
                <Card pad="lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-ink text-white flex items-center justify-center"><Icon name="github" size={20} /></span>
                      <div>
                        <p className="text-[14.5px] font-semibold text-ink">GitHub 연결</p>
                        <p className="text-[12.5px] text-ink-muted">{user.githubLogin ? `@${user.githubLogin}` : '연결되지 않음'}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate('/integrations')}>관리</Button>
                  </div>
                </Card>
              </div>
            )}

            {tab === 'notifications' && (
              <Card pad="lg">
                <h2 className="text-[17px] font-bold text-ink mb-1">알림 설정</h2>
                <p className="text-[13px] text-ink-muted mb-4">어떤 소식을 받을지 선택하세요.</p>
                <div className="flex flex-col divide-y divide-line">
                  <NotifRow label="스캔 완료 알림" sub="스캔이 끝나면 이메일로 알려드려요" v={notif.scanDone} on={(x) => setNotif((n) => ({ ...n, scanDone: x }))} />
                  <NotifRow label="Critical 취약점만" sub="심각도 Critical일 때만 즉시 알림" v={notif.criticalOnly} on={(x) => setNotif((n) => ({ ...n, criticalOnly: x }))} />
                  <NotifRow label="주간 보안 브리핑" sub="매주 보안 현황 요약" v={notif.weekly} on={(x) => setNotif((n) => ({ ...n, weekly: x }))} />
                  <NotifRow label="마케팅 정보" sub="신규 기능·이벤트 소식" v={notif.marketing} on={(x) => setNotif((n) => ({ ...n, marketing: x }))} />
                </div>
              </Card>
            )}

            {tab === 'billing' && (
              <div className="flex flex-col gap-4">
                <Card pad="lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2"><h2 className="text-[17px] font-bold text-ink">{plan.name} 플랜</h2><Badge tone="brand" size="sm">현재 플랜</Badge></div>
                      <p className="mt-0.5 text-[13px] text-ink-muted">{plan.price === 0 ? '무료' : `${won(plan.price)}${plan.per}`}</p>
                    </div>
                    <Button size="sm" onClick={() => navigate('/pricing')}>플랜 변경</Button>
                  </div>
                </Card>
                <Card pad="lg">
                  <div className="flex items-center justify-between mb-3"><h3 className="text-[15px] font-bold text-ink">결제 수단</h3><Button variant="outline" size="sm" leftIcon="plus" onClick={() => toast('결제 수단 추가')}>추가</Button></div>
                  <div className="flex items-center gap-3 rounded-xl bg-surface border border-line px-4 py-3">
                    <Icon name="credit-card" size={20} className="text-ink-sub" />
                    <p className="text-[13.5px] text-ink-sub">등록된 결제 수단이 없어요.</p>
                  </div>
                </Card>
                <Card pad="lg">
                  <h3 className="text-[15px] font-bold text-ink mb-3">영수증</h3>
                  <p className="text-[13px] text-ink-muted">아직 결제 내역이 없어요.</p>
                </Card>
              </div>
            )}

            {tab === 'danger' && (
              <Card pad="lg" className="border-danger-soft">
                <h2 className="text-[17px] font-bold text-danger mb-1">위험 구역</h2>
                <p className="text-[13px] text-ink-muted mb-4">아래 작업은 되돌릴 수 없어요.</p>
                <div className="flex items-center justify-between rounded-xl border border-danger-soft bg-danger-soft/40 px-4 py-3.5">
                  <div>
                    <p className="text-[14px] font-semibold text-ink">계정 삭제</p>
                    <p className="text-[12.5px] text-ink-muted">모든 스캔 기록과 데이터가 영구 삭제됩니다.</p>
                  </div>
                  <Button variant="danger" size="sm" onClick={() => setDelOpen(true)}>계정 삭제</Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Modal
        open={delOpen}
        onClose={() => setDelOpen(false)}
        title="정말 계정을 삭제할까요?"
        footer={
          <>
            <Button variant="ghost" block onClick={() => setDelOpen(false)}>취소</Button>
            <Button variant="danger" block onClick={() => { logout(); navigate('/') }}>삭제</Button>
          </>
        }
      >
        <p className="text-[14px] text-ink-sub leading-relaxed">
          계정과 모든 스캔 기록이 영구적으로 삭제되며 복구할 수 없어요. 계속하시겠어요?
        </p>
      </Modal>
    </div>
  )
}

function NotifRow({ label, sub, v, on }: { label: string; sub: string; v: boolean; on: (x: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-3.5">
      <div><p className="text-[14px] font-medium text-ink">{label}</p><p className="text-[12.5px] text-ink-muted">{sub}</p></div>
      <Toggle checked={v} onChange={on} />
    </div>
  )
}
