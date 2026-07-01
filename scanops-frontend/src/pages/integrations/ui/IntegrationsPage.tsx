import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppNav from '../../../shared/ui/AppNav'
import Card from '../../../shared/ui/Card'
import Button from '../../../shared/ui/Button'
import Badge from '../../../shared/ui/Badge'
import Icon from '../../../shared/ui/Icon'
import { useAuth } from '../../../shared/lib/auth'
import { useToast } from '../../../shared/ui/Toast'
import { relativeTime } from '../../../shared/lib/mock'
import { fetchMyGithubRepos, type MyGithubRepo } from '../../../shared/api/scan'
import { GITHUB_APP_INSTALL_URL } from '../../../shared/lib/config'

export default function IntegrationsPage() {
  const navigate = useNavigate()
  const { user, update } = useAuth()
  const { toast } = useToast()
  const [repos, setRepos] = useState<MyGithubRepo[] | null>(null)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const connected = !!user?.githubLogin

  useEffect(() => {
    if (!connected) { setRepos(null); return }
    let alive = true
    setRepos(null)
    setError('')
    fetchMyGithubRepos()
      .then((r) => { if (alive) setRepos(r) })
      .catch(() => { if (alive) setError('GitHub 레포 목록을 불러오지 못했어요.') })
    return () => { alive = false }
  }, [connected, user?.githubLogin])

  const filtered = repos?.filter((r) => r.fullName.toLowerCase().includes(q.toLowerCase()))

  const scanRepo = (r: MyGithubRepo) =>
    navigate('/scan', { state: { mode: 'GITHUB_REPO', target: r.htmlUrl ?? `https://github.com/${r.fullName}` } })

  return (
    <div className="min-h-screen bg-surface">
      <AppNav />
      <main className="max-w-[820px] mx-auto px-6 py-8 fade-up">
        <h1 className="text-[26px] font-bold text-ink tracking-tight">연동</h1>
        <p className="mt-1 text-sm text-ink-muted">GitHub를 연결해 레포 전체(SAST)·PR 자동 분석을 사용하세요.</p>

        {/* GitHub account */}
        <Card pad="lg" className="mt-6">
          <div className="flex items-center gap-3.5">
            <span className="w-12 h-12 rounded-2xl bg-ink text-white flex items-center justify-center shrink-0"><Icon name="github" size={24} /></span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-bold text-ink">GitHub 계정</p>
              <p className="text-[13px] text-ink-muted">{connected ? `@${user?.githubLogin} 으로 연결됨` : '아직 연결되지 않았어요'}</p>
            </div>
            {connected ? (
              <div className="flex items-center gap-2">
                <Badge tone="success"><Icon name="check" size={12} strokeWidth={3} /> 연결됨</Badge>
                <Button variant="ghost" size="sm" onClick={() => { update({ githubLogin: null }); toast('연결을 해제했어요') }}>해제</Button>
              </div>
            ) : (
              <Button variant="dark" size="sm" leftIcon="github" onClick={() => { update({ githubLogin: 'octocat' }); toast('GitHub 연결됨', 'success') }}>연결하기</Button>
            )}
          </div>
        </Card>

        {/* App install */}
        <Card pad="lg" className="mt-4">
          <div className="flex items-start gap-3.5">
            <span className="w-12 h-12 rounded-2xl bg-success-soft text-success flex items-center justify-center shrink-0"><Icon name="git-pull-request" size={24} /></span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-[15px] font-bold text-ink">ScanOps GitHub App</p>
                <Badge tone="brand" size="sm">PR 자동 분석</Badge>
              </div>
              <p className="text-[13px] text-ink-muted mt-0.5">설치하면 PR을 올릴 때마다 변경된 코드를 자동으로 검사하고 댓글로 결과를 남겨요.</p>
            </div>
            <Button variant="outline" size="sm" rightIcon="external-link" onClick={() => window.open(GITHUB_APP_INSTALL_URL, '_blank', 'noopener')}>App 설치</Button>
          </div>
        </Card>

        {/* Repositories */}
        <div className="flex items-center justify-between mt-8 mb-3">
          <div>
            <h2 className="text-[17px] font-bold text-ink">내 레포지토리</h2>
            <p className="text-[12.5px] text-ink-muted mt-0.5">내가 소유한 공개 레포는 바로 SAST 스캔할 수 있어요.</p>
          </div>
          {connected && repos && repos.length > 0 && (
            <div className="relative w-[220px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"><Icon name="search" size={16} /></span>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="레포 검색"
                className="w-full h-9 rounded-lg bg-white border border-line pl-9 pr-3 text-[13.5px] outline-none focus:border-brand transition-colors" />
            </div>
          )}
        </div>

        {!connected ? (
          <Card pad="lg" className="text-center py-12">
            <span className="inline-flex w-14 h-14 rounded-2xl bg-field text-ink-muted items-center justify-center mb-3"><Icon name="github" size={26} /></span>
            <p className="text-sm text-ink-muted">GitHub를 연결하면 레포 목록이 표시돼요.</p>
          </Card>
        ) : error ? (
          <Card pad="lg" className="text-center py-12">
            <span className="inline-flex w-14 h-14 rounded-2xl bg-danger-soft text-danger items-center justify-center mb-3"><Icon name="alert-triangle" size={26} /></span>
            <p className="text-sm text-ink-muted">{error}</p>
          </Card>
        ) : !filtered ? (
          <div className="flex flex-col gap-2.5">{[0, 1, 2].map((i) => <div key={i} className="h-16 rounded-2xl skeleton" />)}</div>
        ) : filtered.length === 0 ? (
          <Card pad="lg" className="text-center py-12">
            <span className="inline-flex w-14 h-14 rounded-2xl bg-field text-ink-muted items-center justify-center mb-3"><Icon name="box" size={26} /></span>
            <p className="text-sm text-ink-muted">{q ? '검색 결과가 없어요.' : '소유한 공개 레포가 없어요.'}</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filtered.map((r) => (
              <Card key={r.id} pad="none" className="px-[18px] py-3.5 flex items-center gap-3.5">
                <span className="w-9 h-9 rounded-xl bg-field text-ink-sub flex items-center justify-center shrink-0"><Icon name="box" size={18} /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-semibold text-ink truncate">{r.fullName}</p>
                    {r.private ? <Icon name="lock" size={13} className="text-ink-faint" /> : <Badge tone="neutral" size="sm">public</Badge>}
                  </div>
                  <p className="text-[12px] text-ink-muted">
                    {r.language ? `${r.language} · ` : ''}{r.defaultBranch}
                    {r.pushedAt ? ` · ${relativeTime(r.pushedAt)} 업데이트` : ''}
                  </p>
                </div>
                <Button size="sm" variant="weak" leftIcon="target" onClick={() => scanRepo(r)}>스캔</Button>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
