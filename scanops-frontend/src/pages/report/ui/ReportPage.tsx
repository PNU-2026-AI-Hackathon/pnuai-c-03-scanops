import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  RadialBarChart,
  RadialBar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts'
import { getScan, getVulnerabilities, generateVulnMeta } from '../../../api/scanApi'
import type { VulnMeta as AiVulnMeta } from '../../../api/scanApi'
import type { Vulnerability, RiskLevel, Scan } from '../../../types/scan'
import { getVulnMeta } from './vulnMeta'

// ── constants ──────────────────────────────────────────────────────────────

const RISK_ORDER: Record<RiskLevel, number> = { HIGH: 0, MEDIUM: 1, LOW: 2, INFORMATIONAL: 3 }

const RISK_COLOR: Record<RiskLevel, string> = {
  HIGH: '#ef4444',
  MEDIUM: '#f97316',
  LOW: '#eab308',
  INFORMATIONAL: '#3b82f6',
}

const RISK_LABEL: Record<RiskLevel, string> = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
  INFORMATIONAL: 'INFO',
}

function cvssColor(score: number) {
  if (score >= 9) return '#ef4444'
  if (score >= 7) return '#f97316'
  if (score >= 4) return '#eab308'
  return '#22c55e'
}

function cvssLabel(score: number) {
  if (score >= 9) return 'Critical'
  if (score >= 7) return 'High'
  if (score >= 4) return 'Medium'
  return 'Low'
}

// GitHub description에서 파일 경로 파싱
function parseFilePath(vuln: Vulnerability): string {
  if (!vuln.description) return ''
  const match = vuln.description.match(/^파일:\s*(.+?)(?:\n|$)/)
  return match ? match[1].trim() : ''
}

function parseAttack(vuln: Vulnerability): string {
  if (!vuln.description) return ''
  const match = vuln.description.match(/\n공격:\s*(.+?)(?:\n|$)/)
  return match ? match[1].trim() : ''
}

// 백엔드가 저장한 줄번호 파싱 (없으면 null)
function parseLineNumber(vuln: Vulnerability): number | null {
  if (!vuln.description) return null
  const match = vuln.description.match(/\n줄번호:\s*(\d+)/)
  return match ? parseInt(match[1], 10) : null
}

// 취약 가능성(오탐 가능) 여부: GitHub 스캔 결과인데 줄번호가 없는 경우
function isPotentialVuln(vuln: Vulnerability): boolean {
  return vuln.aiModel === 'CUSTOM' && parseLineNumber(vuln) === null
}

// ── small components ───────────────────────────────────────────────────────

function RiskBadge({ risk }: { risk: RiskLevel }) {
  const color = RISK_COLOR[risk]
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: color + '20', color }}
    >
      {RISK_LABEL[risk]}
    </span>
  )
}

function SummaryCard({
  label,
  value,
  color,
  icon,
}: {
  label: string
  value: number
  color: string
  icon?: string
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        {icon && <span className="text-sm">{icon}</span>}
        <span className="text-xs text-gray-500 font-medium">{label}</span>
      </div>
      <span className="text-2xl font-extrabold" style={{ color }}>
        {value}
      </span>
    </div>
  )
}

function CvssGauge({ score }: { score: number }) {
  const color = cvssColor(score)
  const pct = score / 10
  const data = [
    { value: pct * 100, fill: color },
    { value: (1 - pct) * 100, fill: '#1f2937' },
  ]
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col items-center">
      <h3 className="text-sm font-medium text-gray-400 mb-4">최고 CVSS 점수</h3>
      <div className="relative w-40" style={{ height: '100px', overflow: 'hidden' }}>
        <div className="absolute top-0 left-0 w-full" style={{ height: '160px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="70%"
              outerRadius="100%"
              startAngle={180}
              endAngle={0}
              data={data}
              barSize={14}
            >
              <RadialBar dataKey="value" cornerRadius={7} background={false} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <span className="text-3xl font-extrabold" style={{ color }}>
            {score.toFixed(1)}
          </span>
          <span className="text-xs text-gray-500">/ 10.0</span>
        </div>
      </div>
      <span
        className="mt-8 text-xs font-semibold px-2.5 py-1 rounded-full"
        style={{ backgroundColor: color + '20', color }}
      >
        {cvssLabel(score)}
      </span>
    </div>
  )
}

function VulnPieChart({ vulns }: { vulns: Vulnerability[] }) {
  const counts: Partial<Record<RiskLevel, number>> = {}
  for (const v of vulns) counts[v.riskLevel] = (counts[v.riskLevel] ?? 0) + 1
  const data = (Object.keys(counts) as RiskLevel[]).map((k) => ({
    name: RISK_LABEL[k],
    value: counts[k]!,
    color: RISK_COLOR[k],
  }))
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col items-center">
      <h3 className="text-sm font-medium text-gray-400 mb-4">위험도 분포</h3>
      <ResponsiveContainer width="100%" height={140}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" paddingAngle={4}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: '#111827',
              border: '1px solid #374151',
              borderRadius: 8,
              fontSize: 12,
            }}
            itemStyle={{ color: '#e5e7eb' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-5 flex items-center gap-4 flex-wrap justify-center">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="text-xs text-gray-400">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── code snippet helpers ───────────────────────────────────────────────────

const VULN_KEYWORD_MAP: Record<string, string[]> = {
  xss:                    ['innerHTML', 'dangerouslySetInnerHTML', '__html', 'document.write', 'outerHTML', 'eval(', 'insertAdjacentHTML', '<script', 'unsafe', 'sanitize', 'userInput', 'userhtml', 'rawHtml', 'markup'],
  'cross-site scripting': ['innerHTML', 'dangerouslySetInnerHTML', '__html', 'document.write', 'outerHTML', 'eval(', 'insertAdjacentHTML', '<script', 'unsafe'],
  'code injection':       ['eval(', 'new Function(', 'execScript', 'Function('],
  'sql injection':        ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'executeQuery', 'createQuery', 'createNativeQuery', 'prepareStatement', 'nativeQuery', 'rawQuery'],
  sql:                    ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'executeQuery', 'rawQuery'],
  'command injection':    ['exec(', 'spawn(', 'Runtime.exec', 'subprocess', 'os.system', 'shell=True', 'child_process'],
  'path traversal':       ['readFile', 'writeFile', '../', 'path.join', 'fs.open', 'resolve(', '__dirname'],
  hardcoded:              ['password', 'secret', 'api_key', 'apikey', 'token', 'passwd', 'credential', 'privateKey', 'accessKey'],
  cors:                   ['Access-Control-Allow-Origin', 'cors(', 'allowedOrigins', 'origin:', 'allowOrigin'],
  deserialization:        ['ObjectInputStream', 'readObject', 'pickle.loads', 'unserialize', 'yaml.load', 'JSON.parse('],
  ssrf:                   ['fetch(', 'axios.get', 'axios.post', 'WebClient', 'HttpClient', 'URL(', 'open(', 'request(', 'got('],
  xxe:                    ['DocumentBuilder', 'XMLReader', 'SAXParser', 'parseXML', 'xml.etree', 'lxml'],
}

function githubBlobToRaw(url: string): string {
  return url
    .replace('https://github.com/', 'https://raw.githubusercontent.com/')
    .replace('/blob/', '/')
}

function findVulnLine(lines: string[], vulnType: string): number | null {
  const key = vulnType.toLowerCase()
  const keywords: string[] = []
  for (const [k, v] of Object.entries(VULN_KEYWORD_MAP)) {
    if (key.includes(k)) keywords.push(...v)
  }
  if (!keywords.length) return null
  for (let i = 0; i < lines.length; i++) {
    const lc = lines[i].toLowerCase()
    if (keywords.some((kw) => lc.includes(kw.toLowerCase()))) return i + 1
  }
  return null
}

function getSnippetLines(
  lines: string[],
  vulnLine: number,
  context = 3,
): Array<{ lineNum: number; content: string; isVuln: boolean }> {
  // vulnLine === 0 → 라인 특정 실패, 파일 상단 12줄 표시
  if (vulnLine === 0) {
    return lines.slice(0, 12).map((content, i) => ({
      lineNum: i + 1,
      content,
      isVuln: false,
    }))
  }
  const start = Math.max(0, vulnLine - 1 - context)
  const end = Math.min(lines.length, vulnLine + context)
  return lines.slice(start, end).map((content, i) => ({
    lineNum: start + i + 1,
    content,
    isVuln: start + i + 1 === vulnLine,
  }))
}

// ── detail modal ───────────────────────────────────────────────────────────

function VulnDetailModal({ vuln, onClose }: { vuln: Vulnerability; onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const hardcodedMeta = getVulnMeta(vuln.vulnType)
  const color = RISK_COLOR[vuln.riskLevel]
  const cvssCol = cvssColor(vuln.cvssScore)

  const [aiMeta, setAiMeta] = useState<AiVulnMeta | null>(null)
  const [metaLoading, setMetaLoading] = useState(false)
  const needsAi = !hardcodedMeta && !vuln.description && !vuln.summary

  const [fileLines, setFileLines] = useState<string[] | null>(null)
  const [vulnLine, setVulnLine] = useState<number | null>(null)
  const [snippetLoading, setSnippetLoading] = useState(false)
  const [snippetFetchFailed, setSnippetFetchFailed] = useState(false)

  const filePath = parseFilePath(vuln)
  const attack = parseAttack(vuln)
  const isGithubVuln = vuln.aiModel === 'CUSTOM'
  const storedLineNumber = parseLineNumber(vuln)  // 백엔드가 저장한 줄번호

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  useEffect(() => {
    if (!needsAi) return
    setMetaLoading(true)
    generateVulnMeta(vuln.id)
      .then(setAiMeta)
      .catch(() => setAiMeta(null))
      .finally(() => setMetaLoading(false))
  }, [vuln.id, needsAi])

  useEffect(() => {
    if (!isGithubVuln || !vuln.url || !filePath) return
    setSnippetLoading(true)
    setFileLines(null)
    setVulnLine(null)
    setSnippetFetchFailed(false)

    // HEAD → main → master 순서로 재시도
    const rawBase = githubBlobToRaw(vuln.url)  // .../HEAD/...
    const urls = [
      rawBase,
      rawBase.replace('/HEAD/', '/main/'),
      rawBase.replace('/HEAD/', '/master/'),
    ]

    const tryFetch = (index: number): Promise<string> => {
      if (index >= urls.length) return Promise.reject(new Error('all refs failed'))
      return fetch(urls[index]).then((r) => {
        if (!r.ok) return tryFetch(index + 1)
        return r.text()
      }).catch(() => tryFetch(index + 1))
    }

    tryFetch(0)
      .then((text) => {
        const lines = text.split('\n')
        setFileLines(lines)
        // 백엔드 저장 줄번호 우선 사용, 없으면 클라이언트 키워드 매칭
        setVulnLine(storedLineNumber ?? findVulnLine(lines, vuln.vulnType))
      })
      .catch(() => {
        console.error('[ScanOps] 코드 fetch 실패:', urls)
        setSnippetFetchFailed(true)
      })
      .finally(() => setSnippetLoading(false))
  }, [isGithubVuln, vuln.url, filePath, vuln.vulnType])

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-800">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <RiskBadge risk={vuln.riskLevel} />
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full font-mono"
                style={{ backgroundColor: cvssCol + '20', color: cvssCol }}
              >
                CVSS {vuln.cvssScore.toFixed(1)} · {cvssLabel(vuln.cvssScore)}
              </span>
              {isGithubVuln && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400">
                  QLoRA 모델
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-white leading-snug">{vuln.vulnType}</h2>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-gray-500 hover:text-white transition-colors flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Summary */}
          {vuln.summary && (
            <p className="text-sm text-gray-300 bg-gray-800/60 rounded-lg px-4 py-3 leading-relaxed border-l-2 border-gray-600">
              {vuln.summary}
            </p>
          )}

          {/* File info (GitHub 취약점일 때) */}
          {isGithubVuln && filePath && (
            <div className="bg-gray-800/60 rounded-lg px-4 py-3 border border-gray-700">
              <p className="text-xs text-gray-500 mb-1">분석된 파일</p>
              <a
                href={vuln.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-mono text-violet-400 hover:underline break-all"
              >
                {filePath}
              </a>
            </div>
          )}

          {/* Code snippet viewer (GitHub-style) */}
          {isGithubVuln && filePath && (snippetLoading || fileLines !== null || snippetFetchFailed) && (
            <div className="rounded-lg overflow-hidden border border-gray-700 text-xs font-mono">
              {/* header */}
              <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                  </svg>
                  <span className="text-gray-300 font-medium">{filePath.split('/').pop()}</span>
                  {vulnLine && (
                    <span className="text-gray-500 font-sans">· {vulnLine}번째 줄에서 발견</span>
                  )}
                </div>
                <a
                  href={`${vuln.url}${vulnLine ? `#L${vulnLine}` : ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-400 hover:text-violet-300 transition-colors font-sans flex-shrink-0 ml-2"
                >
                  GitHub에서 보기 →
                </a>
              </div>

              {/* body */}
              {snippetLoading ? (
                <div className="bg-gray-950 px-4 py-3 text-gray-600 font-sans flex items-center gap-2">
                  <svg className="animate-spin w-3 h-3 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  코드 불러오는 중...
                </div>
              ) : snippetFetchFailed ? (
                <div className="bg-gray-950 px-4 py-4 font-sans flex items-start gap-3">
                  <span className="text-yellow-400 flex-shrink-0">⚠️</span>
                  <div>
                    <p className="text-yellow-400/90 text-xs font-semibold mb-1">코드를 불러올 수 없습니다</p>
                    <p className="text-gray-500 text-xs">비공개 레포이거나 네트워크 오류가 발생했습니다.</p>
                    <a href={vuln.url} target="_blank" rel="noopener noreferrer"
                      className="inline-block mt-2 text-xs text-violet-400 hover:underline">
                      GitHub에서 직접 확인 →
                    </a>
                  </div>
                </div>
              ) : fileLines ? (
                vulnLine ? (
                  /* 줄번호 확인됨 — 코드 스니펫 표시 */
                  <div className="bg-gray-950 overflow-x-auto">
                    {getSnippetLines(fileLines, vulnLine).map(({ lineNum, content, isVuln }) => (
                      <div
                        key={lineNum}
                        className={`flex min-h-[1.5rem] ${
                          isVuln ? 'bg-red-500/10 border-l-2 border-red-500' : 'border-l-2 border-transparent'
                        }`}
                      >
                        <span className="select-none w-10 text-right pr-4 py-0.5 text-gray-600 flex-shrink-0 leading-6">
                          {lineNum}
                        </span>
                        <span className={`py-0.5 pr-4 whitespace-pre leading-6 ${isVuln ? 'text-red-200' : 'text-gray-400'}`}>
                          {content || ' '}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* 줄번호 불명 — 취약 가능성 안내 */
                  <div className="bg-yellow-500/5 px-4 py-4 font-sans">
                    <div className="flex items-start gap-3">
                      <span className="text-yellow-400 text-base flex-shrink-0 mt-0.5">⚠️</span>
                      <div>
                        <p className="text-yellow-400/90 text-xs font-semibold mb-1">취약 패턴 위치를 특정하지 못했습니다</p>
                        <p className="text-yellow-500/70 text-xs leading-relaxed">
                          이 파일에서 잠재적 취약 가능성이 감지되었으나 정확한 코드 위치를 확인하지 못했습니다.
                          실제 취약점이 아닐 수 있으며, 파일 전체를 직접 검토하는 것을 권장합니다.
                        </p>
                        <a href={vuln.url} target="_blank" rel="noopener noreferrer"
                          className="inline-block mt-2 text-xs text-violet-400 hover:underline">
                          GitHub에서 파일 전체 확인 →
                        </a>
                      </div>
                    </div>
                  </div>
                )
              ) : null}
            </div>
          )}

          {/* URL / Param (website) */}
          {!isGithubVuln && (
            <div className="space-y-2">
              <InfoRow label="URL" value={vuln.url} mono />
              {vuln.parameter && <InfoRow label="파라미터" value={vuln.parameter} mono />}
              {vuln.cvssVector && <InfoRow label="CVSS Vector" value={vuln.cvssVector} mono />}
            </div>
          )}

          {/* Attack / Cause */}
          {isGithubVuln ? (
            <>
              {attack && (
                <Section title="공격 패턴" icon="⚡" color="#f97316">
                  <p className="text-sm text-gray-300 leading-relaxed">{attack}</p>
                </Section>
              )}
              {vuln.solution && (
                <Section title="수정 방법" icon="🛠️" color="#22c55e">
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {vuln.solution}
                  </p>
                </Section>
              )}
            </>
          ) : hardcodedMeta ? (
            <>
              <Section title="발생 원인" icon="🔎" color="#f97316">
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {hardcodedMeta.cause}
                </p>
              </Section>
              <Section title="해결 방법" icon="🛠️" color="#22c55e">
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {hardcodedMeta.remedy}
                </p>
                {hardcodedMeta.reference && (
                  <a
                    href={hardcodedMeta.reference}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-xs text-cyan-400 hover:underline"
                  >
                    참고 문서 →
                  </a>
                )}
              </Section>
            </>
          ) : vuln.description || aiMeta?.description ? (
            <>
              {(vuln.description || aiMeta?.description) && (
                <Section title="발생 원인" icon="🔎" color="#f97316">
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {vuln.description ?? aiMeta?.description}
                  </p>
                </Section>
              )}
              {(vuln.solution || aiMeta?.solution) && (
                <Section title="해결 방법" icon="🛠️" color="#22c55e">
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {vuln.solution ?? aiMeta?.solution}
                  </p>
                </Section>
              )}
            </>
          ) : metaLoading ? (
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-800/50 rounded-lg px-4 py-3">
              <svg
                className="animate-spin w-3.5 h-3.5 text-green-400 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              설명을 생성하고 있습니다...
            </div>
          ) : (
            <div className="text-xs text-gray-500 bg-gray-800/50 rounded-lg px-4 py-3">
              이 취약점 유형에 대한 상세 설명이 아직 준비되지 않았습니다.
            </div>
          )}

          {/* AI Analysis */}
          {vuln.aiAnalysis && (
            <Section title="AI 분석" icon="🤖" color="#3b82f6">
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                {vuln.aiAnalysis}
              </p>
              {vuln.aiModel && (
                <p className="text-xs text-gray-600 mt-2">모델: {vuln.aiModel}</p>
              )}
            </Section>
          )}
        </div>

        {/* Footer CVSS bar */}
        <div className="px-6 pb-6">
          <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: color + '30' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${(vuln.cvssScore / 10) * 100}%`, backgroundColor: cvssCol }}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-xs text-gray-600">
            <span>0</span>
            <span>CVSS 점수 범위</span>
            <span>10</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex gap-3 items-start">
      <span className="text-xs text-gray-500 w-24 flex-shrink-0 pt-0.5">{label}</span>
      <span className={`text-xs text-gray-300 break-all ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}

function Section({
  title,
  icon,
  color,
  children,
}: {
  title: string
  icon: string
  color: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span>{icon}</span>
        <h3 className="text-sm font-semibold" style={{ color }}>
          {title}
        </h3>
      </div>
      <div className="pl-6 border-l-2 border-gray-700">{children}</div>
    </div>
  )
}

// ── Website report table row ───────────────────────────────────────────────

function VulnRow({ vuln, onClick }: { vuln: Vulnerability; onClick: () => void }) {
  const color = RISK_COLOR[vuln.riskLevel]
  return (
    <tr
      onClick={onClick}
      className="border-b border-gray-800 cursor-pointer hover:bg-gray-800/60 transition-colors"
    >
      <td className="px-4 py-3">
        <RiskBadge risk={vuln.riskLevel} />
      </td>
      <td className="px-4 py-3 text-sm font-medium text-gray-200">{vuln.vulnType}</td>
      <td className="px-4 py-3 text-xs text-gray-400 max-w-xs truncate font-mono">{vuln.url}</td>
      <td className="px-4 py-3 text-xs text-gray-400">{vuln.parameter || '—'}</td>
      <td className="px-4 py-3 text-sm font-mono font-semibold" style={{ color }}>
        {vuln.cvssScore.toFixed(1)}
      </td>
      <td className="px-4 py-3 text-gray-600 text-xs">→</td>
    </tr>
  )
}

// ── GitHub report card ─────────────────────────────────────────────────────

function GitHubVulnCard({ vuln, onClick }: { vuln: Vulnerability; onClick: () => void }) {
  const cvssCol = cvssColor(vuln.cvssScore)
  const filePath = parseFilePath(vuln)
  const attack = parseAttack(vuln)
  const fileName = filePath.split('/').pop() ?? filePath
  const isPotential = isPotentialVuln(vuln)

  return (
    <div
      onClick={onClick}
      className={`bg-gray-900 border rounded-xl p-5 cursor-pointer transition-all group ${
        isPotential
          ? 'border-yellow-900/50 hover:border-yellow-700/60 hover:bg-yellow-950/20'
          : 'border-gray-800 hover:border-gray-600 hover:bg-gray-800/60'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <RiskBadge risk={vuln.riskLevel} />
            <span
              className="text-xs font-mono font-semibold px-2 py-0.5 rounded"
              style={{ backgroundColor: cvssCol + '15', color: cvssCol }}
            >
              {vuln.cvssScore.toFixed(1)}
            </span>
            {isPotential && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
                ⚠️ 취약 가능성
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-white mb-1">{vuln.vulnType}</h3>
          {attack && <p className="text-xs text-gray-500 leading-relaxed truncate">{attack}</p>}
        </div>
        <span className="text-gray-600 group-hover:text-gray-400 text-xs transition-colors flex-shrink-0">
          →
        </span>
      </div>

      {filePath && (
        <div
          className={`mt-3 flex items-center gap-2 text-xs rounded-lg px-3 py-2 ${
            isPotential ? 'text-yellow-700/80 bg-yellow-950/30' : 'text-gray-600 bg-gray-800/60'
          }`}
        >
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span className="font-mono truncate" title={filePath}>
            {filePath.length > 50 ? '…/' + fileName : filePath}
          </span>
        </div>
      )}
    </div>
  )
}

// ── GitHub severity bar chart ──────────────────────────────────────────────

function SeverityBarChart({ vulns }: { vulns: Vulnerability[] }) {
  const data = (['HIGH', 'MEDIUM', 'LOW'] as RiskLevel[])
    .map((r) => ({
      name: RISK_LABEL[r],
      count: vulns.filter((v) => v.riskLevel === r).length,
      color: RISK_COLOR[r],
    }))
    .filter((d) => d.count > 0)

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <h3 className="text-sm font-medium text-gray-400 mb-4">심각도별 분포</h3>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={data} barSize={28}>
          <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              background: '#111827',
              border: '1px solid #374151',
              borderRadius: 8,
              fontSize: 12,
            }}
            itemStyle={{ color: '#e5e7eb' }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── page ───────────────────────────────────────────────────────────────────

export default function ReportPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [scan, setScan] = useState<Scan | null>(null)
  const [vulns, setVulns] = useState<Vulnerability[] | null>(null)
  const [selected, setSelected] = useState<Vulnerability | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([getScan(id), getVulnerabilities(id)])
      .then(([scanData, data]) => {
        setScan(scanData)
        setVulns(
          [...data].sort(
            (a, b) =>
              RISK_ORDER[a.riskLevel] - RISK_ORDER[b.riskLevel] || b.cvssScore - a.cvssScore,
          ),
        )
      })
      .catch(() => setError(true))
  }, [id])

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">리포트를 불러오지 못했습니다.</p>
          <button
            onClick={() => navigate('/reports')}
            className="text-sm text-gray-400 hover:text-white"
          >
            ← 이력으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  if (!vulns || !scan) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <p className="text-gray-400 text-sm">리포트 로딩 중...</p>
        </div>
      </div>
    )
  }

  const isGithub = scan.scanMode === 'GITHUB_REPO'

  return isGithub ? (
    <GitHubReportView scan={scan} vulns={vulns} selected={selected} setSelected={setSelected} />
  ) : (
    <WebsiteReportView scan={scan} vulns={vulns} selected={selected} setSelected={setSelected} />
  )
}

// ── Website Report ─────────────────────────────────────────────────────────

function WebsiteReportView({
  scan,
  vulns,
  selected,
  setSelected,
}: {
  scan: Scan
  vulns: Vulnerability[]
  selected: Vulnerability | null
  setSelected: (v: Vulnerability | null) => void
}) {
  const navigate = useNavigate()
  const maxCvss = vulns.length > 0 ? Math.max(...vulns.map((v) => v.cvssScore)) : 0
  const countByRisk = (r: RiskLevel) => vulns.filter((v) => v.riskLevel === r).length

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {selected && <VulnDetailModal vuln={selected} onClose={() => setSelected(null)} />}

      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-800 sticky top-0 bg-gray-950/90 backdrop-blur-sm z-10">
        <button onClick={() => navigate('/')} className="flex items-center gap-2">
          <span className="text-green-400 text-xl font-mono font-bold">⬡</span>
          <span className="text-xl font-bold tracking-tight">ScanOps</span>
        </button>
        <button
          onClick={() => navigate('/reports')}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          ← 이력으로 돌아가기
        </button>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-medium">
              🌐 웹사이트 스캔
            </span>
            {scan.verified && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs">
                ✓ 인증됨
              </span>
            )}
          </div>
          <h1 className="text-3xl font-extrabold mb-1">보안 진단 리포트</h1>
          <p className="text-gray-400 text-sm font-mono truncate">{scan.targetUrl}</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <SummaryCard label="총 취약점" value={vulns.length} color="#e5e7eb" icon="🔍" />
          <SummaryCard label="HIGH" value={countByRisk('HIGH')} color={RISK_COLOR.HIGH} />
          <SummaryCard label="MEDIUM" value={countByRisk('MEDIUM')} color={RISK_COLOR.MEDIUM} />
          <SummaryCard label="LOW" value={countByRisk('LOW')} color={RISK_COLOR.LOW} />
        </div>

        {/* Charts */}
        {vulns.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
            <CvssGauge score={maxCvss} />
            <VulnPieChart vulns={vulns} />
          </div>
        )}

        {/* Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="font-semibold text-sm">취약점 목록</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              항목을 클릭하면 발생 원인과 해결 방법을 확인할 수 있습니다.
            </p>
          </div>
          {vulns.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500 text-sm">
              <p className="text-3xl mb-3">🎉</p>
              발견된 취약점이 없습니다.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-800 text-xs text-gray-500">
                    <th className="px-4 py-3 font-medium">위험도</th>
                    <th className="px-4 py-3 font-medium">유형</th>
                    <th className="px-4 py-3 font-medium">URL</th>
                    <th className="px-4 py-3 font-medium">파라미터</th>
                    <th className="px-4 py-3 font-medium">CVSS</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {vulns.map((v) => (
                    <VulnRow key={v.id} vuln={v} onClick={() => setSelected(v)} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

// ── GitHub Report ──────────────────────────────────────────────────────────

function GitHubReportView({
  scan,
  vulns,
  selected,
  setSelected,
}: {
  scan: Scan
  vulns: Vulnerability[]
  selected: Vulnerability | null
  setSelected: (v: Vulnerability | null) => void
}) {
  const navigate = useNavigate()
  const maxCvss = vulns.length > 0 ? Math.max(...vulns.map((v) => v.cvssScore)) : 0
  const countByRisk = (r: RiskLevel) => vulns.filter((v) => v.riskLevel === r).length

  // 파일 수 추출
  const uniqueFiles = new Set(vulns.map((v) => parseFilePath(v)).filter(Boolean)).size

  // 확인된 취약점 vs 취약 가능성(오탐) 분리
  const confirmedCount = vulns.filter((v) => !isPotentialVuln(v)).length
  const potentialCount = vulns.filter((v) => isPotentialVuln(v)).length

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {selected && <VulnDetailModal vuln={selected} onClose={() => setSelected(null)} />}

      {/* Top gradient accent */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-800 sticky top-0 bg-gray-950/90 backdrop-blur-sm z-10">
        <button onClick={() => navigate('/')} className="flex items-center gap-2">
          <span className="text-green-400 text-xl font-mono font-bold">⬡</span>
          <span className="text-xl font-bold tracking-tight">ScanOps</span>
        </button>
        <button
          onClick={() => navigate('/reports')}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          ← 이력으로 돌아가기
        </button>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-medium">
              📁 GitHub 레포 분석
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-800 border border-gray-700 text-gray-400 text-xs">
              🤖 QLoRA 파인튜닝 모델
            </span>
          </div>
          <h1 className="text-3xl font-extrabold mb-2">코드 보안 분석 리포트</h1>
          <a
            href={scan.targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-mono text-violet-400 hover:underline truncate block"
          >
            {scan.targetUrl}
          </a>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <SummaryCard label="확인된 취약점" value={confirmedCount} color="#a78bfa" icon="🛡️" />
          <SummaryCard label="취약 가능성" value={potentialCount} color="#eab308" icon="⚠️" />
          <SummaryCard label="HIGH" value={countByRisk('HIGH')} color={RISK_COLOR.HIGH} />
          <SummaryCard label="분석 파일" value={uniqueFiles} color="#6b7280" icon="📄" />
        </div>

        {/* Charts */}
        {vulns.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
            <CvssGauge score={maxCvss} />
            <SeverityBarChart vulns={vulns} />
          </div>
        )}

        {/* Vulnerability cards */}
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h2 className="font-semibold text-sm">취약점 목록</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                카드를 클릭하면 공격 패턴과 수정 방법을 확인할 수 있습니다.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {confirmedCount > 0 && (
                <span className="text-xs font-medium bg-violet-500/15 text-violet-400 border border-violet-500/30 px-2.5 py-1 rounded-full">
                  🛡️ 확인 {confirmedCount}개
                </span>
              )}
              {potentialCount > 0 && (
                <span className="text-xs font-medium bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 px-2.5 py-1 rounded-full">
                  ⚠️ 가능성 {potentialCount}개
                </span>
              )}
            </div>
          </div>

          {vulns.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl px-6 py-16 text-center">
              <p className="text-4xl mb-3">🎉</p>
              <p className="text-gray-400 text-sm">취약점이 발견되지 않았습니다.</p>
              <p className="text-gray-600 text-xs mt-1">코드가 안전합니다!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {vulns.map((v) => (
                <GitHubVulnCard key={v.id} vuln={v} onClick={() => setSelected(v)} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
