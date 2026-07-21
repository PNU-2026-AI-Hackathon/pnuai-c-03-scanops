import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppNav from '../../../shared/ui/AppNav'
import Card from '../../../shared/ui/Card'
import Button from '../../../shared/ui/Button'
import Icon from '../../../shared/ui/Icon'
import Badge, { SeverityBadge } from '../../../shared/ui/Badge'
import { useToast } from '../../../shared/ui/Toast'
import {
  fetchReport, MODE_META, SEVERITY_META, formatDateTime,
  type Report, type Vulnerability, type Severity, type SeverityCounts,
} from '../../../shared/lib/mock'
import { isRealId, fetchRealReport } from '../../../shared/api/scan'

const SEV_ORDER: Severity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO']

// SAST 엔진 표시 라벨(리포트 헤더). 실제 배포 = rebuild (api_rebuild: 2026-07 재구축
// Qwen3.5-9B 단일 모델, LLM은 RunPod llama.cpp 워커). 버전이 응답에 실려오지 않아
// 여기 표기만 하므로, 차기 버전 배포 시 이 한 줄만 갱신.
const SAST_ENGINE_LABEL = 'ScanOps Rebuild (Qwen3.5-9B)'

export default function ReportPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [report, setReport] = useState<Report | null>(null)

  useEffect(() => {
    if (!id) return
    const load = isRealId(id) ? fetchRealReport(id) : fetchReport(id)
    load.then(setReport).catch(() => fetchReport('s-1041').then(setReport))
  }, [id])

  if (!report) {
    return (
      <div className="min-h-screen bg-surface">
        <AppNav />
        <main className="max-w-[860px] mx-auto px-6 py-8 flex flex-col gap-4">
          <div className="h-7 w-40 rounded skeleton" />
          <div className="h-32 rounded-2xl skeleton" />
          <div className="h-24 rounded-2xl skeleton" />
        </main>
      </div>
    )
  }

  const m = MODE_META[report.mode]
  const sorted = [...report.vulnerabilities].sort((a, b) => b.cvss - a.cvss)

  return (
    <div className="min-h-screen bg-surface">
      <AppNav />
      <main className="max-w-[860px] mx-auto px-6 py-7 fade-up">
        <button onClick={() => navigate('/reports')} className="flex items-center gap-1 text-[13px] text-ink-muted font-medium hover:text-ink-sub mb-4">
          <Icon name="chevron-left" size={16} /> 스캔 기록
        </button>

        {/* header */}
        <Card pad="lg">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge tone={report.mode === 'WEBSITE' ? 'brand' : report.mode === 'GITHUB_REPO' ? 'purple' : 'success'}>{m.tag} · {m.label}</Badge>
                <span className="text-[12.5px] text-ink-muted">{formatDateTime(report.createdAt)}</span>
              </div>
              <h1 className="text-[22px] font-bold text-ink tracking-tight break-all flex items-center gap-2">
                <span style={{ color: m.color }}><Icon name={m.icon} size={20} /></span>{report.target}
              </h1>
              <p className="mt-1 text-[13px] text-ink-muted">
                분석 {report.durationSec ? `${report.durationSec}초` : ''}{report.loc ? ` · ${report.loc.toLocaleString('ko-KR')}줄` : ''} · 엔진 {report.mode === 'WEBSITE' ? 'OWASP ZAP + AI 분석' : SAST_ENGINE_LABEL}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" leftIcon="download" onClick={() => toast('PDF 리포트를 준비했어요')}>PDF</Button>
              <Button size="sm" leftIcon="refresh-cw" onClick={() => navigate('/scan')}>재스캔</Button>
            </div>
          </div>

          <div className="h-px bg-line my-5" />

          <div className="flex items-center gap-6 flex-wrap">
            <Stat value={String(report.total)} label="취약점" />
            <div className="w-px h-10 bg-line" />
            <Stat value={report.maxCvss.toFixed(1)} label="최고 CVSS" color={report.maxCvss >= 9 ? 'var(--color-sev-critical)' : 'var(--color-sev-high)'} />
            <div className="w-px h-10 bg-line" />
            <div className="flex-1 min-w-[200px]">
              <SeverityBar counts={report.counts} total={report.total} />
              <div className="flex flex-wrap gap-x-3.5 gap-y-1 mt-2.5">
                {SEV_ORDER.filter((k) => report.counts[k] > 0).map((k) => (
                  <span key={k} className="flex items-center gap-1.5 text-[12px] text-ink-sub">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: SEVERITY_META[k].color }} />
                    {SEVERITY_META[k].label} <b className="text-ink tnum">{report.counts[k]}</b>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {report.total === 0 ? (
          <Card pad="lg" className="mt-4 text-center py-14">
            <span className="inline-flex w-14 h-14 rounded-2xl bg-success-soft text-success items-center justify-center mb-3"><Icon name="check-circle" size={28} /></span>
            <p className="text-[15px] font-semibold text-ink">발견된 취약점이 없어요</p>
            <p className="mt-1 text-[13px] text-ink-muted">현재 기준으로 안전합니다. 코드가 바뀌면 다시 검사해 주세요.</p>
          </Card>
        ) : (
          <div className="mt-4 flex flex-col gap-2.5">
            <p className="text-[13px] font-semibold text-ink-sub px-1">발견된 취약점 {report.total}건</p>
            {sorted.map((v, i) => <VulnCard key={v.id} v={v} defaultOpen={i === 0} onCopy={() => toast('복사되었어요', 'success')} />)}
          </div>
        )}
      </main>
    </div>
  )
}

function Stat({ value, label, color }: { value: string; label: string; color?: string }) {
  return (
    <div className="text-center">
      <p className="text-[28px] font-bold tnum leading-none" style={{ color: color ?? 'var(--color-ink)' }}>{value}</p>
      <p className="mt-1 text-[12px] text-ink-muted">{label}</p>
    </div>
  )
}

function SeverityBar({ counts, total }: { counts: SeverityCounts; total: number }) {
  if (total === 0) return <div className="h-2.5 rounded-full bg-field" />
  return (
    <div className="flex h-2.5 rounded-full overflow-hidden bg-field">
      {SEV_ORDER.map((k) => counts[k] > 0 && <div key={k} style={{ width: `${(counts[k] / total) * 100}%`, background: SEVERITY_META[k].color }} />)}
    </div>
  )
}

const VERDICT: Record<Vulnerability['graphVerdict'], { label: string; tone: 'success' | 'brand' | 'neutral' }> = {
  CONFIRMED: { label: '그래프 확정', tone: 'success' },
  SUPPRESSED: { label: '그래프 검증', tone: 'neutral' },
  LLM_ONLY: { label: 'AI 탐지', tone: 'brand' },
}

function VulnCard({ v, defaultOpen, onCopy }: { v: Vulnerability; defaultOpen?: boolean; onCopy: () => void }) {
  const [open, setOpen] = useState(defaultOpen)
  const sev = SEVERITY_META[v.severity]
  const verdict = VERDICT[v.graphVerdict]

  return (
    <Card pad="none" className="overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center gap-3.5 px-5 py-4 text-left hover:bg-surface transition-colors">
        <span className="w-1.5 self-stretch rounded-full shrink-0" style={{ background: sev.color }} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[15px] font-bold text-ink">{v.name}</p>
            <span className="text-[12px] text-ink-muted font-medium">{v.cwe}</span>
          </div>
          <p className="text-[12.5px] text-ink-muted truncate mt-0.5">{v.location}</p>
        </div>
        <SeverityBadge severity={v.severity} size="sm" />
        <span className="text-[13px] font-bold tnum" style={{ color: sev.color }}>{v.cvss.toFixed(1)}</span>
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={18} className="text-ink-faint" />
      </button>

      {open && (
        <div className="px-5 pb-5 pt-1 border-t border-line">
          {/* 비전문가용 한 줄 설명 */}
          {v.plain && (
            <div className="mt-3 flex items-start gap-2.5 rounded-xl bg-brand-soft/60 px-4 py-3">
              <span className="text-brand mt-0.5 shrink-0"><Icon name="info" size={16} /></span>
              <p className="text-[13.5px] text-ink-sub leading-relaxed">
                <span className="font-bold text-brand">쉽게 말하면</span>　{v.plain}
              </p>
            </div>
          )}
          {v.summary && <p className="text-[13.5px] text-ink-sub leading-relaxed mt-3">{v.summary}</p>}

          {v.evidence && (
            <Section icon="code" title="증거">
              <CodeBlock code={v.evidence} onCopy={onCopy} />
              <p className="mt-2 text-[12px] text-ink-muted">위치: <span className="font-medium text-ink-sub">{v.location}</span></p>
            </Section>
          )}

          {v.attack && (
            <Section icon="alert-triangle" title="공격 시나리오" tone="danger">
              <p className="text-[13.5px] text-ink-sub leading-relaxed">{v.attack}</p>
            </Section>
          )}

          {v.fix && (
            <Section icon="check-circle" title="해결 방법" tone="success">
              <p className="text-[13.5px] text-ink-sub leading-relaxed">{v.fix}</p>
              {v.fixCode && <div className="mt-2.5"><CodeBlock code={v.fixCode} onCopy={onCopy} good /></div>}
              <button
                type="button"
                onClick={() => { navigator.clipboard?.writeText(buildFixPrompt(v)); onCopy() }}
                className="mt-3 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-white border border-success-soft text-success text-[12.5px] font-semibold hover:bg-success-soft transition-colors"
              >
                <Icon name="zap" size={13} /> AI 수정 프롬프트 복사
              </button>
            </Section>
          )}

          <div className="mt-4 pt-3 border-t border-line">
            <p className="text-[11.5px] font-bold text-ink-muted mb-2">탐지 근거</p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge tone={verdict.tone} size="sm"><Icon name="shield" size={12} /> {verdict.label}</Badge>
              <Badge tone="neutral" size="sm"><Icon name="cpu" size={12} /> {v.aiModel}</Badge>
              <Badge tone="neutral" size="sm">신뢰도 {(v.confidence * 100).toFixed(0)}%</Badge>
              <span className="ml-auto text-[11px] text-ink-faint font-mono hidden sm:block">{v.cvssVector}</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

/** 사용자가 ChatGPT·Claude 등에 그대로 붙여넣어 수정 코드를 받을 수 있는 프롬프트 생성 (LLM 호출 없음). */
function buildFixPrompt(v: Vulnerability): string {
  return [
    '다음 보안 취약점을 수정하는 방법을 내 코드에 맞는 예시와 함께 알려줘.',
    '',
    `[취약점] ${v.name}${v.cwe ? ` (${v.cwe})` : ''}`,
    `[심각도] ${v.severity} · CVSS ${v.cvss.toFixed(1)}`,
    v.location ? `[위치] ${v.location}` : '',
    v.summary ? `[문제] ${v.summary}` : '',
    v.fix ? `[권장 조치] ${v.fix}` : '',
    '',
    '구체적인 수정 코드와 설정(헤더/옵션 등)을 단계별로 작성해줘.',
  ].filter(Boolean).join('\n')
}

function Section({ icon, title, tone, children }: { icon: Parameters<typeof Icon>[0]['name']; title: string; tone?: 'danger' | 'success'; children: React.ReactNode }) {
  const color = tone === 'danger' ? 'var(--color-danger)' : tone === 'success' ? 'var(--color-success)' : 'var(--color-ink-sub)'
  const box = tone === 'danger' ? 'bg-danger-soft/40' : tone === 'success' ? 'bg-success-soft/50' : ''
  return (
    <div className="mt-4">
      <p className="flex items-center gap-1.5 text-[12.5px] font-bold mb-2" style={{ color }}>
        <Icon name={icon} size={14} /> {title}
      </p>
      {tone ? <div className={`rounded-xl px-4 py-3 ${box}`}>{children}</div> : children}
    </div>
  )
}

function CodeBlock({ code, onCopy, good }: { code: string; onCopy: () => void; good?: boolean }) {
  return (
    <div className="relative group">
      <pre className={`rounded-xl px-4 py-3 text-[12.5px] leading-relaxed font-mono overflow-x-auto border ${
        good ? 'bg-success-soft/50 border-success-soft text-[#0a7a4d]' : 'bg-[#f6f8fa] border-line text-ink-sub'
      }`}>
        <code>{code}</code>
      </pre>
      <button
        onClick={() => { navigator.clipboard?.writeText(code); onCopy() }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg bg-white border border-line flex items-center justify-center text-ink-muted hover:text-ink"
        aria-label="복사"
      >
        <Icon name="copy" size={14} />
      </button>
    </div>
  )
}
