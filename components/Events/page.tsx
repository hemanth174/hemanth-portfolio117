'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, Calendar, ExternalLink, MapPin, Moon, Sparkles, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export type EventItem = {
  _id?: string
  title: string
  type: 'college' | 'off-college'
  date: string
  description: string
  story?: string
  tags?: string[]
  location: string
  image?: string
  projectUrl?: string
}

export function EventCard({ event, index = 0 }: { event: EventItem; index?: number }) {
  const id = event._id || encodeURIComponent(event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
  return (
    <Link href={`/events/${id}`} className="group block overflow-hidden rounded-[2rem] border border-zinc-200 bg-white transition-all hover:-translate-y-1 hover:border-yellow-400 hover:shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
      <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100 dark:bg-zinc-900">
        {event.image ? <img src={event.image} alt={event.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center bg-gradient-to-br from-yellow-300 via-amber-500 to-zinc-950 text-5xl font-black text-black/70">{String(index + 1).padStart(2, '0')}</div>}
        <span className="absolute left-4 top-4 rounded-full bg-black/75 px-3 py-1.5 font-mono text-[9px] font-bold tracking-[.18em] text-yellow-300">{event.type === 'college' ? 'CAMPUS' : 'EXTERNAL'}</span>
        <span className="absolute bottom-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-yellow-300 text-black transition group-hover:rotate-45"><ArrowUpRight size={18} /></span>
      </div>
      <div className="space-y-4 p-6">
        <p className="font-mono text-[10px] font-bold tracking-[.2em] text-amber-600 dark:text-yellow-300">{event.tags?.slice(0, 2).join(' / ') || 'EVENT STORY'}</p>
        <h2 className="text-xl font-black uppercase leading-tight text-zinc-900 dark:text-white">{event.title}</h2>
        <p className="line-clamp-3 text-sm leading-6 text-zinc-500 dark:text-zinc-400">{event.description}</p>
        <div className="flex flex-wrap gap-4 border-t border-zinc-100 pt-4 font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:border-zinc-800">
          <span className="flex items-center gap-1.5"><Calendar size={13} />{event.date}</span>
          <span className="flex items-center gap-1.5"><MapPin size={13} />{event.location}</span>
        </div>
      </div>
    </Link>
  )
}

export const Events = () => {
  const { resolvedTheme, setTheme } = useTheme()
  const [events, setEvents] = useState<EventItem[]>([])
  const [lastOpened, setLastOpened] = useState<EventItem | null>(null)
  const [filter, setFilter] = useState<'all' | 'college' | 'off-college'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('portfolio_last_event')
    fetch('/api/events').then((res) => res.json()).then((data) => {
      const nextEvents = data.events || []
      setEvents(nextEvents)
      if (saved) {
        const parsed = JSON.parse(saved) as { id?: string; title?: string }
        setLastOpened(nextEvents.find((event: EventItem) => event._id === parsed.id || event.title === parsed.title) || null)
      }
    }).catch(() => setEvents([])).finally(() => setLoading(false))
  }, [])

  const filtered = events.filter((event) => filter === 'all' || event.type === filter)
  const base44 = events.find((event) => event.title.toLowerCase().includes('base44'))
  const spotlight = lastOpened || base44
  return (
    <main className="min-h-screen bg-zinc-50 px-4 pb-20 pt-20 text-zinc-900 dark:bg-black dark:text-white sm:px-6 lg:px-8">
      <button type="button" onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme" className="fixed right-5 top-5 z-20 grid h-10 w-10 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-600 shadow-md transition hover:border-yellow-300 hover:bg-yellow-100 hover:text-black dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-yellow-300 dark:hover:text-black">{resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}</button>
      <div className="mx-auto max-w-[1500px]">
        <Link href="/" className="mb-7 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 font-mono text-xs font-bold tracking-widest text-zinc-600 shadow-sm transition hover:border-yellow-300 hover:bg-yellow-100 hover:text-black dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-yellow-300 dark:hover:text-black"><ArrowLeft size={15} /> BACK TO PORTFOLIO</Link>
        <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl"><p className="mb-5 font-mono text-xs font-bold tracking-[.3em] text-amber-600 dark:text-yellow-300">FIELD NOTES / 2025—2026</p><h1 className="text-5xl font-black uppercase leading-[.9] tracking-tight sm:text-7xl">The moments<br /><span className="text-zinc-300 dark:text-zinc-800">behind the work.</span></h1><p className="mt-7 max-w-xl text-base leading-7 text-zinc-500 dark:text-zinc-400">Hackathons, workshops, teams, and experiments. Every event has a separate story: what happened, what I owned, and what I carried into the next build.</p></div>
          <div className="flex gap-2 font-mono text-[10px] font-bold tracking-widest"><button onClick={() => setFilter('all')} className={`rounded-full border px-4 py-2 ${filter === 'all' ? 'border-yellow-300 bg-yellow-300 text-black' : 'border-zinc-300 dark:border-zinc-700'}`}>ALL {events.length}</button><button onClick={() => setFilter('college')} className={`rounded-full border px-4 py-2 ${filter === 'college' ? 'border-yellow-300 bg-yellow-300 text-black' : 'border-zinc-300 dark:border-zinc-700'}`}>CAMPUS</button><button onClick={() => setFilter('off-college')} className={`rounded-full border px-4 py-2 ${filter === 'off-college' ? 'border-yellow-300 bg-yellow-300 text-black' : 'border-zinc-300 dark:border-zinc-700'}`}>EXTERNAL</button></div>
        </div>
        {spotlight && <section className="relative mb-12 overflow-hidden rounded-[2rem] border border-yellow-400/50 bg-zinc-950 p-7 text-white shadow-[8px_8px_0_#facc15] sm:p-10"><div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-yellow-300/20 blur-3xl" /><div className="relative grid gap-8 lg:grid-cols-[1fr_280px] lg:items-center"><div><p className="mb-4 flex items-center gap-2 font-mono text-[10px] font-bold tracking-[.25em] text-yellow-300"><Sparkles size={14} /> {lastOpened ? 'LAST OPENED' : 'FEATURED BUILD / BASE44 HACKATHON'}</p><h2 className="max-w-2xl text-3xl font-black uppercase leading-tight sm:text-5xl">{spotlight.title}</h2><p className="mt-4 max-w-xl text-sm leading-6 text-zinc-300">{spotlight.description}</p><div className="mt-7 flex flex-wrap gap-3"><Link href={`/events/${spotlight._id || encodeURIComponent(spotlight.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}`} className="inline-flex items-center gap-2 rounded-full bg-yellow-300 px-5 py-3 font-mono text-xs font-bold text-black">{lastOpened ? 'CONTINUE STORY' : 'READ THE STORY'} <ArrowUpRight size={15} /></Link>{spotlight.projectUrl && <a href={spotlight.projectUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-5 py-3 font-mono text-xs font-bold text-zinc-200">OPEN LIVE BUILD <ExternalLink size={14} /></a>}</div></div><div className="relative overflow-hidden rounded-2xl border border-yellow-300/30 bg-zinc-900"><img src={spotlight.image || ''} alt={spotlight.title} className="aspect-[4/3] w-full object-cover" /><div className="border-t border-yellow-300/20 px-4 py-3 font-mono text-[10px] font-bold tracking-widest text-yellow-300">{spotlight.tags?.slice(0, 3).join(' · ') || 'EVENT STORY'}</div></div></div></section>}
        {loading ? <div className="py-24 text-center font-mono text-xs text-zinc-500">LOADING FIELD NOTES...</div> : <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">{filtered.map((event, index) => <EventCard key={event._id || event.title} event={event} index={index} />)}</div>}
      </div>
    </main>
  )
}

export default Events
