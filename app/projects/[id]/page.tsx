'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTheme } from 'next-themes'
import { ArrowLeft, ArrowRight, ExternalLink, Moon, Play, Sun } from 'lucide-react'
import { getNextProject, getStoryFor, type StoryProject } from '@/lib/projectStories'

const readProjectCache = (): StoryProject[] => {
  try {
    if (typeof window === 'undefined') return []
    const cached = localStorage.getItem('portfolio_projects_cache')
    if (cached) {
      const parsed = JSON.parse(cached)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    // corrupt / unavailable storage
  }
  return []
}

const isLive = (url?: string) => !!url && /^https?:\/\//.test(url.trim())

const getYouTubeId = (url: string): string | null => {
  const m = url.match(/(?:youtube\.com\/(?:watch\?[^#]*v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/)
  return m ? m[1] : null
}

const isDirectVideo = (url: string) => /\.(mp4|webm|mov)(\?|#|$)/i.test(url)

const Kicker = ({ index, label }: { index: string; label: string }) => (
  <p className="font-mono text-[11px] font-bold tracking-[0.3em] text-amber-600 dark:text-yellow-400">
    {index} — {label}
  </p>
)

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="mt-2 text-xl md:text-2xl font-black tracking-tight leading-snug">{children}</h2>
)

const Body = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-3 flex flex-col gap-3 text-sm md:text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400">
    {children}
  </div>
)

export default function ProjectStoryPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  // Cache first (instant return visits), network refreshes after.
  const [projects, setProjects] = useState<StoryProject[]>(readProjectCache)
  const [loading, setLoading] = useState(() => readProjectCache().length === 0)
  const { theme, setTheme } = useTheme()
  // `theme` is undefined until hydration — fall back to light (the default).
  const isDark = theme === 'dark'

  useEffect(() => {
    window.scrollTo(0, 0)
    let cancelled = false
    fetch('/api/projects')
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && Array.isArray(d.projects)) {
          setProjects(d.projects)
          try {
            localStorage.setItem('portfolio_projects_cache', JSON.stringify(d.projects))
          } catch {
            // storage full / unavailable
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  const project = projects.find((p) => String(p._id ?? p.id) === String(id))

  useEffect(() => {
    document.title = project ? `${project.title} — Story | Hemanth's Portfolio` : "Project Story | Hemanth's Portfolio"
  }, [project])

  if (loading && projects.length === 0) {
    return (
      <main className="min-h-screen bg-zinc-50 dark:bg-black px-4 md:px-8 py-10 font-mono">
        <div className="mx-auto max-w-6xl grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
          <div className="flex flex-col gap-4 animate-pulse">
            <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-10 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>
          <div className="flex flex-col gap-4 animate-pulse">
            <div className="h-56 w-full bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
            <div className="h-4 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>
        </div>
      </main>
    )
  }

  if (!project) {
    return (
      <main className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white px-4 md:px-8 py-16 font-mono">
        <div className="mx-auto max-w-2xl flex flex-col items-center gap-5 text-center">
          <p className="text-sm tracking-[0.3em] text-zinc-400 dark:text-zinc-600">STORY NOT FOUND</p>
          <h1 className="text-3xl md:text-4xl font-black">This project doesn&apos;t exist (yet).</h1>
          <Link
            href="/#section4"
            className="inline-flex items-center gap-2 mt-2 px-6 py-3 bg-yellow-400 dark:bg-yellow-300 text-black font-bold text-sm tracking-[0.2em] hover:bg-yellow-500 dark:hover:bg-yellow-400 transition-colors"
          >
            <ArrowLeft size={16} /> ALL PROJECTS
          </Link>
        </div>
      </main>
    )
  }

  const { story, curated } = getStoryFor(project)
  const next = getNextProject(projects, id)
  const hasLive = isLive(project.liveUrl)
  const hasCode = isLive(project.codeUrl)
  const videoUrl = project.videoUrl?.trim() || ''
  const youTubeId = videoUrl ? getYouTubeId(videoUrl) : null
  const directVideo = videoUrl && !youTubeId && isDirectVideo(videoUrl)

  return (
    <main className="relative min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white font-mono overflow-x-clip">
      {/* ── Ambient background ── */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-32 left-1/2 h-80 w-[46rem] -translate-x-1/2 rounded-full bg-yellow-400/15 blur-3xl dark:bg-yellow-300/10" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-100 [background-image:linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)] [background-size:44px_44px] dark:[background-image:linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)]" />

      {/* ── Floating theme toggle — fixed, stays visible while scrolling ── */}
      <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className="fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-yellow-400 dark:bg-yellow-300 text-black shadow-[0_8px_28px_rgba(250,204,21,0.45)] hover:bg-yellow-500 dark:hover:bg-yellow-400 transition-all cursor-pointer active:scale-95"
      >
        {isDark ? <Sun size={17} /> : <Moon size={17} />}
      </button>

      {/* ── Top bar ── */}
      <div className="relative border-b border-zinc-200 dark:border-zinc-900">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-3">
          <Link
            href="/#section4"
            className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.25em] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={14} /> ALL PROJECTS
          </Link>
          <span className="px-3 py-1 bg-yellow-400 dark:bg-yellow-300 text-black text-[10px] font-bold rounded-full uppercase tracking-widest">
            {project.category}
          </span>
        </div>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 md:py-10 grid gap-10 lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* ── Left panel (sticky summary) ── */}
        <aside className="lg:sticky lg:top-6 self-start flex flex-col gap-6">
          <div>
            <p className="text-[11px] font-bold tracking-[0.3em] text-zinc-400 dark:text-zinc-500">
              {curated ? 'PROJECT STORY' : 'OVERVIEW · FULL STORY IN PROGRESS'}
            </p>
            <h1 className="mt-2 text-3xl md:text-4xl font-black tracking-tight leading-[1.05]">
              {project.title}
            </h1>
            <p className="mt-3 text-sm md:text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-300">
              {story.outcome}
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            {hasLive && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-yellow-400 dark:bg-yellow-300 text-black font-bold text-xs tracking-[0.2em] hover:bg-yellow-500 dark:hover:bg-yellow-400 transition-colors"
              >
                <ExternalLink size={14} /> LIVE DEMO
              </a>
            )}
            {hasCode && (
              <a
                href={project.codeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-zinc-300 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold text-xs tracking-[0.2em] hover:text-zinc-900 dark:hover:text-white hover:border-zinc-500 dark:hover:border-white transition-colors"
              >
                CODE
              </a>
            )}
          </div>

          <dl className="rounded-2xl border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950/40 divide-y divide-zinc-200 dark:divide-zinc-900 overflow-hidden">
            {story.stats.map((s, i) => (
              <div key={i} className="px-4 py-3 flex items-baseline justify-between gap-3">
                <dt className="text-[10px] tracking-[0.2em] text-zinc-500 dark:text-zinc-500 uppercase">{s.label}</dt>
                <dd className="text-sm font-black text-zinc-900 dark:text-white text-right">{s.value}</dd>
              </div>
            ))}
            <div className="px-4 py-3 flex items-baseline justify-between gap-3">
              <dt className="text-[10px] tracking-[0.2em] text-zinc-500 dark:text-zinc-500 uppercase">Role</dt>
              <dd className="text-xs font-bold text-right">{story.role}</dd>
            </div>
          </dl>

          <div>
            <p className="text-[10px] font-bold tracking-[0.3em] text-zinc-400 dark:text-zinc-500">BUILT WITH</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {story.stack.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900/60 px-3 py-1 text-[11px] font-bold tracking-widest text-zinc-600 dark:text-zinc-300"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Right panel (the story) ── */}
        <article className="min-w-0">
          {/* Hero visual */}
          <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-950/40">
            {project.image ? (
              <img
                src={project.image}
                alt={`${project.title} — project visual`}
                className="w-full max-h-72 object-cover"
                loading="eager"
                decoding="async"
              />
            ) : (
              <div className="relative w-full h-48 bg-gradient-to-br from-zinc-100 via-zinc-50 to-zinc-200 dark:from-zinc-950 dark:via-zinc-900 dark:to-black flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-20 dark:opacity-25 bg-[radial-gradient(#facc15_1px,transparent_1px)] [background-size:18px_18px] pointer-events-none" />
                <span className="relative text-xl md:text-2xl font-black tracking-tight text-zinc-400 dark:text-zinc-600 uppercase text-center px-6">
                  {project.title}
                </span>
              </div>
            )}
          </div>

          {/* Demo video (added from the admin panel) */}
          {videoUrl && (
            <section className="mt-10">
              <Kicker index="▶" label="WATCH IT IN ACTION" />
              <div className="mt-3 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-900 bg-black">
                {youTubeId ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${youTubeId}`}
                    title={`${project.title} — demo video`}
                    className="w-full aspect-video"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : directVideo ? (
                  <video src={videoUrl} controls preload="metadata" playsInline className="w-full aspect-video">
                    Your browser can&apos;t play this video.{' '}
                    <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="underline">
                      Open it directly
                    </a>
                    .
                  </video>
                ) : (
                  <a
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 px-6 py-10 text-sm font-bold tracking-[0.2em] text-white hover:text-yellow-300 transition-colors"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400 text-black">
                      <Play size={20} className="ml-0.5" />
                    </span>
                    WATCH THE DEMO
                  </a>
                )}
              </div>
            </section>
          )}

          {/* 01 Problem */}
          <section className="mt-10">
            <Kicker index="01" label="THE PROBLEM" />
            <H2>{story.problemHeading}</H2>
            <Body>
              {story.problem.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </Body>
          </section>

          {/* 02 Constraints */}
          <section className="mt-10">
            <Kicker index="02" label="CONSTRAINTS" />
            <H2>Real limits. That&apos;s what makes the decisions interesting.</H2>
            <ul className="mt-3 flex flex-col gap-2">
              {story.constraints.map((c, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950/40 px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-yellow-400 dark:bg-yellow-300 text-black text-[11px] font-black">
                    {i + 1}
                  </span>
                  {c}
                </li>
              ))}
            </ul>
          </section>

          {/* 03 Process */}
          <section className="mt-10">
            <Kicker index="03" label="PROCESS" />
            <H2>{story.processHeading}</H2>
            {story.processIntro && (
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">{story.processIntro}</p>
            )}
            <ol className="mt-4 relative ml-2 flex flex-col">
              {story.phases.map((ph, i) => (
                <li key={i} className="relative pl-8 pb-6 last:pb-0">
                  {i < story.phases.length - 1 && (
                    <span aria-hidden="true" className="absolute left-[7px] top-5 bottom-0 w-px bg-zinc-200 dark:bg-zinc-800" />
                  )}
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full border-2 ${
                      ph.marker
                        ? 'border-yellow-500 dark:border-yellow-300 bg-yellow-400 dark:bg-yellow-300 shadow-[0_0_12px_rgba(250,204,21,0.6)]'
                        : 'border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-black'
                    }`}
                  />
                  <p className="text-[11px] font-bold tracking-[0.25em] text-zinc-400 dark:text-zinc-500">{ph.label.toUpperCase()}</p>
                  <p className="mt-0.5 text-sm font-bold text-zinc-900 dark:text-white">{ph.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{ph.desc}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* 04 Decision log */}
          <section className="mt-10">
            <Kicker index="04" label="DECISION LOG" />
            <H2>{story.decisionsHeading}</H2>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {story.decisions.map((d, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-3 rounded-2xl border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950/40 p-5"
                >
                  <p className="font-bold text-sm leading-snug text-zinc-900 dark:text-white">{d.decision}</p>
                  <div className="text-[13px] leading-relaxed">
                    <p className="text-[10px] font-bold tracking-[0.25em] text-zinc-400 dark:text-zinc-600">REJECTED</p>
                    <p className="mt-1 text-zinc-500 dark:text-zinc-500 line-through decoration-red-400/60">{d.rejected}</p>
                  </div>
                  <div className="text-[13px] leading-relaxed mt-auto">
                    <p className="text-[10px] font-bold tracking-[0.25em] text-zinc-400 dark:text-zinc-500">WHY</p>
                    <p className="mt-1 text-zinc-600 dark:text-zinc-400">{d.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 05 Outcome */}
          <section className="mt-10">
            <Kicker index="05" label="OUTCOME" />
            <H2>{story.outcomeHeading}</H2>
            <Body>
              {story.outcomeBody.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </Body>
            {(hasLive || hasCode) && (
              <div className="mt-4 flex flex-wrap gap-2.5">
                {hasLive && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-400 dark:bg-yellow-300 text-black font-bold text-xs tracking-[0.2em] hover:bg-yellow-500 dark:hover:bg-yellow-400 transition-colors"
                  >
                    <ExternalLink size={14} /> TRY IT LIVE
                  </a>
                )}
                {hasCode && (
                  <a
                    href={project.codeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-zinc-300 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold text-xs tracking-[0.2em] hover:text-zinc-900 dark:hover:text-white hover:border-zinc-500 dark:hover:border-white transition-colors"
                  >
                    READ THE SOURCE
                  </a>
                )}
              </div>
            )}
          </section>

          {/* 06 Role */}
          <section className="mt-10">
            <Kicker index="06" label="MY ROLE" />
            <H2>{story.role}</H2>
            <ul className="mt-3 flex flex-col gap-2">
              {story.rolePoints.map((r, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                  <span aria-hidden="true" className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600 dark:bg-yellow-300" />
                  {r}
                </li>
              ))}
            </ul>
          </section>

          {/* 07 Reflection */}
          <section className="mt-8 rounded-2xl border border-zinc-200 dark:border-zinc-900 border-l-4 border-l-yellow-400 dark:border-l-yellow-300 bg-white dark:bg-zinc-950/40 p-5 md:p-6">
            <Kicker index="07" label="REFLECTION" />
            <h2 className="mt-2 text-lg md:text-xl font-black tracking-tight">{story.reflectionHeading}</h2>
            <p className="mt-2 text-sm md:text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400">
              {story.reflection}
            </p>
          </section>
        </article>
      </div>

      {/* ── Next + contact (full width) ── */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-14">
        {next && (
          <Link
            href={`/projects/${next._id ?? next.id}`}
            className="group flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950/40 p-5 md:p-6 hover:border-yellow-400 dark:hover:border-yellow-300 transition-colors"
          >
            <span>
              <span className="text-[11px] font-bold tracking-[0.3em] text-zinc-400 dark:text-zinc-500">NEXT STORY</span>
              <span className="mt-1.5 block text-xl md:text-2xl font-black tracking-tight group-hover:text-amber-600 dark:group-hover:text-yellow-300 transition-colors">
                {next.title}
              </span>
              <span className="mt-1 block text-xs tracking-[0.2em] text-zinc-500 dark:text-zinc-500 uppercase">{next.category}</span>
            </span>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-yellow-400 dark:bg-yellow-300 text-black transition-transform group-hover:translate-x-1">
              <ArrowRight size={19} />
            </span>
          </Link>
        )}

        <div className="mt-6 rounded-2xl bg-zinc-900 dark:bg-yellow-300 text-white dark:text-black p-7 md:p-9 text-center">
          <p className="text-[11px] font-bold tracking-[0.3em] opacity-70">LIKE THIS KIND OF WORK?</p>
          <p className="mt-2 text-2xl md:text-3xl font-black tracking-tight">Let&apos;s build something great.</p>
          <Link
            href="/#section8"
            className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 dark:bg-black text-black dark:text-yellow-300 font-bold text-sm tracking-[0.2em] hover:bg-yellow-500 dark:hover:bg-zinc-900 transition-colors"
          >
            CONTACT ME <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </main>
  )
}
