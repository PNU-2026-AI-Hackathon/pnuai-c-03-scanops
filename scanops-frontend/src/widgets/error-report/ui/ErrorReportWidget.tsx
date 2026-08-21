import { useState } from 'react'
import Icon from '../../../shared/ui/Icon'
import Button from '../../../shared/ui/Button'
import { useToast } from '../../../shared/ui/Toast'
import { useAuth } from '../../../shared/lib/auth'

const WEBAPP_URL = import.meta.env.VITE_FEEDBACK_WEBAPP_URL as string | undefined

/**
 * 우하단 플로팅 오류 신고 위젯. 전송 성공 시 패널을 닫고 5초짜리 토스트로 접수를 알린다.
 * Google Apps Script 웹 앱은 커스텀 CORS preflight를 처리하지 않으므로,
 * Content-Type을 text/plain으로 보내 simple request로 유지한다(Apps Script 쪽에서 JSON.parse).
 */
export default function ErrorReportWidget() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const send = async () => {
    if (!message.trim() || sending) return
    if (!WEBAPP_URL) {
      toast('오류 신고 기능이 아직 설정되지 않았어요.', 'danger')
      return
    }
    setSending(true)
    try {
      await fetch(WEBAPP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          message: message.trim(),
          page: window.location.pathname,
          userEmail: user?.email ?? '',
          userName: user?.name ?? '',
          userAgent: navigator.userAgent,
        }),
      })
      setMessage('')
      setOpen(false)
      toast('오류 신고가 접수되었습니다', 'success', 5000)
    } catch {
      toast('신고 접수에 실패했어요. 잠시 후 다시 시도해 주세요.', 'danger')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed right-5 bottom-5 z-40 flex flex-col items-end gap-3">
      {open && (
        <div className="w-[320px] rounded-2xl bg-white border border-line shadow-[0_8px_30px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-line bg-surface">
            <span className="text-[14px] font-bold text-ink">오류 신고</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-faint hover:bg-field transition-colors"
              aria-label="닫기"
            >
              <Icon name="x" size={16} />
            </button>
          </div>
          <div className="p-4 flex flex-col gap-3">
            <p className="text-[12.5px] text-ink-muted leading-relaxed">
              겪으신 오류나 불편한 점을 적어주시면 팀에 바로 전달돼요.
            </p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="어떤 문제가 있었나요?"
              rows={4}
              className="w-full rounded-xl bg-field border border-line px-3.5 py-2.5 text-[13.5px] text-ink placeholder:text-ink-faint outline-none focus:border-brand transition-colors resize-none"
            />
            <Button block size="sm" rightIcon="send" loading={sending} disabled={!message.trim()} onClick={send}>
              보내기
            </Button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-[66px] px-[30px] rounded-full bg-ink text-white text-[21px] font-semibold shadow-[0_6px_20px_rgba(0,0,0,0.25)] flex items-center justify-center hover:opacity-90 transition-opacity"
        aria-label={open ? '오류 신고 닫기' : '오류 신고 열기'}
      >
        {open ? '닫기' : '오류 신고'}
      </button>
    </div>
  )
}
