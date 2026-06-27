import { http } from './httpClient'
import { fetchScans } from '../lib/mock'
import { enrichZap } from '../lib/zapMeta'
import type { Report, ScanMode, ScanSummary, Severity, SeverityCounts, Vulnerability } from '../lib/mock'

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

/** Spring Data Page 응답(필요한 필드만). */
interface SpringPage<T> {
  content: T[]
  number: number        // 0-based 현재 페이지
  totalPages: number
  totalElements: number
  first: boolean
  last: boolean
}

/** 대시보드 등 "최근 스캔" 요약용 — 첫 페이지(최신 50건). 기록 페이지는 fetchScansPage 사용. */
export const listScanJobs = async () =>
  (await http<SpringPage<BeScanJob>>('/api/scans?page=0&size=50')).content

/** 스캔 기록 한 페이지(최신순). 백엔드가 page/size/mode/q로 페이지네이션. */
export interface ScanPage {
  items: ScanSummary[]
  page: number
  totalPages: number
  totalElements: number
  first: boolean
  last: boolean
}

export async function fetchScansPage(opts: {
  page: number
  size?: number
  mode?: ScanMode | 'ALL'
  q?: string
}): Promise<ScanPage> {
  const { page, size = 10, mode = 'ALL', q = '' } = opts
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  if (mode && mode !== 'ALL') params.set('mode', mode)
  if (q.trim()) params.set('q', q.trim())
  const res = await http<SpringPage<BeScanJob>>(`/api/scans?${params.toString()}`)
  return {
    items: res.content.map((j) => mapJobToSummary(j)),
    page: res.number,
    totalPages: res.totalPages,
    totalElements: res.totalElements,
    first: res.first,
    last: res.last,
  }
}

/** 스캔 기록 삭제(연결된 취약점도 백엔드에서 함께 제거). */
export const deleteScan = (id: string) =>
  http<void>(`/api/scans/${id}`, { method: 'DELETE' })

// ── GitHub 레포(실데이터) ────────────────────────────────────────────────
export interface MyGithubRepo {
  id: number
  fullName: string
  private: boolean
  defaultBranch: string
  htmlUrl?: string
  language?: string | null
  pushedAt?: string | null
}

/** 로그인 사용자가 소유한 GitHub 공개 레포 목록. */
export const fetchMyGithubRepos = () => http<MyGithubRepo[]>('/api/github/repos')

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
