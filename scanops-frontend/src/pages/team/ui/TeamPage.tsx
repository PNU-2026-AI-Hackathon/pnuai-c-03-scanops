import { useEffect, useState } from 'react'
import AppNav from '../../../shared/ui/AppNav'
import Card from '../../../shared/ui/Card'
import Button from '../../../shared/ui/Button'
import Badge from '../../../shared/ui/Badge'
import Avatar from '../../../shared/ui/Avatar'
import Input from '../../../shared/ui/Input'
import Modal from '../../../shared/ui/Modal'
import Icon from '../../../shared/ui/Icon'
import { useToast } from '../../../shared/ui/Toast'
import { fetchTeam, type TeamMember } from '../../../shared/lib/mock'

const ROLE: Record<TeamMember['role'], { label: string; tone: 'brand' | 'purple' | 'neutral' }> = {
  OWNER: { label: '소유자', tone: 'brand' },
  ADMIN: { label: '관리자', tone: 'purple' },
  MEMBER: { label: '멤버', tone: 'neutral' },
}

export default function TeamPage() {
  const { toast } = useToast()
  const [team, setTeam] = useState<TeamMember[] | null>(null)
  const [invite, setInvite] = useState(false)
  const [email, setEmail] = useState('')

  useEffect(() => { fetchTeam().then(setTeam) }, [])

  const active = team?.filter((m) => m.status === 'ACTIVE').length ?? 0
  const seats = 3

  const sendInvite = () => {
    if (!email.includes('@')) return toast('올바른 이메일을 입력해 주세요', 'danger')
    setTeam((t) => [...(t ?? []), { id: 'inv-' + Date.now(), name: email.split('@')[0], email, role: 'MEMBER', status: 'INVITED' }])
    setInvite(false); setEmail('')
    toast('초대를 보냈어요', 'success')
  }

  return (
    <div className="min-h-screen bg-surface">
      <AppNav />
      <main className="max-w-[820px] mx-auto px-6 py-8 fade-up">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h1 className="text-[26px] font-bold text-ink tracking-tight">팀</h1>
            <p className="mt-1 text-sm text-ink-muted">멤버를 초대하고 권한을 관리하세요.</p>
          </div>
          <Button leftIcon="plus" onClick={() => setInvite(true)}>멤버 초대</Button>
        </div>

        <Card pad="lg" className="mb-4">
          <div className="flex items-center gap-6">
            <div><p className="text-[26px] font-bold text-ink tnum leading-none">{active}<span className="text-[15px] text-ink-muted font-medium"> / {seats}</span></p><p className="mt-1 text-[12.5px] text-ink-muted">사용 중인 좌석</p></div>
            <div className="w-px h-9 bg-line" />
            <p className="text-[13px] text-ink-sub flex items-center gap-1.5"><Icon name="info" size={15} className="text-ink-muted" /> 기본 3명 포함 · 멤버 추가 시 1명당 ₩25,000</p>
          </div>
        </Card>

        {!team ? (
          <div className="flex flex-col gap-2.5">{[0, 1, 2].map((i) => <div key={i} className="h-16 rounded-2xl skeleton" />)}</div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {team.map((m) => (
              <Card key={m.id} pad="none" className="px-[18px] py-3.5 flex items-center gap-3.5">
                <Avatar name={m.name} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-ink">{m.name}</p>
                  <p className="text-[12.5px] text-ink-muted">{m.email}</p>
                </div>
                {m.status === 'INVITED' && <Badge tone="warning" size="sm">초대됨</Badge>}
                <Badge tone={ROLE[m.role].tone} size="sm">{ROLE[m.role].label}</Badge>
                {m.role !== 'OWNER' && (
                  <button onClick={() => { setTeam((t) => t!.filter((x) => x.id !== m.id)); toast('멤버를 제거했어요') }} className="text-ink-faint hover:text-danger transition-colors" aria-label="제거">
                    <Icon name="x" size={18} />
                  </button>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>

      <Modal open={invite} onClose={() => setInvite(false)} title="멤버 초대"
        footer={<><Button variant="ghost" block onClick={() => setInvite(false)}>취소</Button><Button block onClick={sendInvite}>초대 보내기</Button></>}>
        <p className="text-[13.5px] text-ink-muted mb-3">초대할 멤버의 이메일을 입력하세요. 기본 3명을 초과하면 추가 요금이 발생해요.</p>
        <Input label="이메일" leftIcon="mail" placeholder="member@team.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      </Modal>
    </div>
  )
}
