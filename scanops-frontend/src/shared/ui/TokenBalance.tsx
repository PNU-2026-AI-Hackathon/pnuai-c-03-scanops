import Icon from './Icon'
import Badge from './Badge'
import ProgressBar from './ProgressBar'
import type { TokenWallet } from '../api/tokens'

/** 이번 달 지급량 대비 남은 토큰. 진행 중인 스캔이 예약해 둔 만큼은 별도 표기. */
export default function TokenBalance({ wallet }: { wallet: TokenWallet | null }) {
  const ready = wallet != null
  const pct = ready && wallet.monthlyGrant > 0 ? Math.min(100, (wallet.available / wallet.monthlyGrant) * 100) : 0
  const low = ready && wallet.monthlyGrant > 0 && pct < 15
  const fmt = (n: number) => n.toLocaleString('ko-KR')

  return (
    <div className="rounded-xl bg-surface border border-line p-4">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[12.5px] font-semibold text-ink-sub">
          <span style={{ color: 'var(--color-brand)' }}><Icon name="zap" size={14} /></span>남은 토큰
        </span>
        {low && <Badge tone="warning" size="sm">부족</Badge>}
      </div>
      <p className="mt-1.5 text-ink">
        <span className="text-[20px] font-bold tnum">{ready ? fmt(wallet.available) : '—'}</span>
        <span className="text-[12.5px] text-ink-muted"> / 이번 달 {ready ? fmt(wallet.monthlyGrant) : '—'}토큰</span>
      </p>
      <ProgressBar value={pct} color={low ? 'var(--color-warning)' : 'var(--color-brand)'} className="mt-2" height={5} />
      {ready && wallet.heldBalance > 0 && (
        <p className="mt-2 text-[12px] text-ink-faint">진행 중인 스캔이 {fmt(wallet.heldBalance)}토큰 예약해 뒀어요.</p>
      )}
      {ready && wallet.purchasedBalance > 0 && (
        <p className="mt-1 text-[12px] text-ink-faint">이 중 충전분 {fmt(wallet.purchasedBalance)}토큰은 다음 달로 이월돼요.</p>
      )}
    </div>
  )
}
