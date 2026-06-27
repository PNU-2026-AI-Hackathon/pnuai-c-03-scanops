import { http } from './httpClient'
import { fetchScans } from '../lib/mock'
import { enrichZap } from '../lib/zapMeta'
import type { Report, ScanSummary, Severity, SeverityCounts, Vulnerability } from '../lib/mock'

/** 실 백엔드 스캔 API (DAST/웹). SAST·PR은 아직 목(shared/lib/mock). */

interface BeScanJob {
  id: string
  targetUrl: string
  status: 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED'
  ownerEmail?: string
  verified?: boolean
  scanMode: 'WEBSITE' | 'GITHUB_REPO'
  createdAt: string
  finishedAt?: string | null
}

interface BeVuln {
  id: string
  jobId: string
  vulnType: string
  url?: string
  parameter?: string
  riskLevel?: 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL'
  cvssScore?: number | null
  cvssVector?: string | null
  summary?: string
  description?: string
  solution?: string
  aiAnalysis?: string
  aiModel?: string | null
}

/** 백엔드가 만든 UUID인지(실 스캔) vs 목 id("s-1041")인지. */
export const isRealId = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}/i.test(id)

export const createWebsiteScan = (targetUrl: string, ownerEmail: string) =>
  http<BeScanJob>('/api/scans', {
    method: 'POST',
    body: JSON.stringify({ targetUrl, ownerEmail, scanMode: 'WEBSITE' }),
  })

export const getScanJob = (id: string) => http<BeScanJob>(`/api/scans/${id}`)
export const getScanVulns = (id: string) => http<BeVuln[]>(`/api/scans/${id}/vulnerabilities`)
export const listScanJobs = () => http<BeScanJob[]>('/api/scans')

// ── mappers ───────────────────────────────────────────────────────────────
function mapSeverity(risk?: string, cvss?: number | null): Severity {
  if ((cvss ?? 0) >= 9) return 'CRITICAL'
  switch (risk) {
    case 'HIGH': return 'HIGH'
    case 'MEDIUM': return 'MEDIUM'
    case 'LOW': return 'LOW'
    default: return 'INFO'
  }
}

function mapVuln(v: BeVuln): Vulnerability {
  const cvss = v.cvssScore ?? 0
  const meta = enrichZap(v.vulnType || '') // 흔한 ZAP 경보 → 한국어 메타
  return {
    id: v.id,
    name: meta?.name ?? v.vulnType ?? '취약점',
    cwe: meta?.cwe ?? '',
    severity: mapSeverity(v.riskLevel, cvss),
    cvss,
    cvssVector: v.cvssVector ?? '',
    location: [v.url, v.parameter].filter(Boolean).join(' → '),
    evidence: '',
    // "쉽게 말하면": 사전 한 줄 → 백엔드 AI설명 순
    plain: meta?.plain ?? v.aiAnalysis ?? '',
    summary: meta?.summary ?? v.summary ?? '',
    attack: meta?.attack ?? v.description ?? '',
    fix: meta?.fix ?? v.solution ?? '',
    aiModel: v.aiModel ? `ZAP + AI(${v.aiModel})` : 'ZAP',
    confidence: 1,
    graphVerdict: 'LLM_ONLY',
  }
}

function countsOf(vs: Vulnerability[]): SeverityCounts {
  const c: SeverityCounts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 }
  vs.forEach((v) => (c[v.severity] += 1))
  return c
}

export function mapJobToSummary(j: BeScanJob, vulns?: Vulnerability[]): ScanSummary {
  const counts = vulns ? countsOf(vulns) : { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 }
  const maxCvss = vulns ? vulns.reduce((m, v) => Math.max(m, v.cvss), 0) : 0
  const dur = j.finishedAt ? Math.max(1, Math.round((+new Date(j.finishedAt) - +new Date(j.createdAt)) / 1000)) : undefined
  return {
    id: j.id,
    target: j.targetUrl,
    mode: j.scanMode,
    status: j.status,
    maxCvss,
    counts,
    total: vulns ? vulns.length : 0,
    createdAt: j.createdAt,
    finishedAt: j.finishedAt ?? undefined,
    durationSec: dur,
  }
}

export async function fetchRealReport(id: string): Promise<Report> {
  const [job, beVulns] = await Promise.all([getScanJob(id), getScanVulns(id)])
  const vulns = beVulns.map(mapVuln)
  return { ...mapJobToSummary(job, vulns), vulnerabilities: vulns }
}

/** 실제 DAST 스캔 기록 + 목 샘플을 합쳐서 최신순 반환. 백엔드 불가 시 목만. */
export async function fetchAllScans(): Promise<ScanSummary[]> {
  const mock = await fetchScans()
  try {
    const real = (await listScanJobs()).map((j) => mapJobToSummary(j))
    return [...real, ...mock].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
  } catch {
    return mock
  }
}
