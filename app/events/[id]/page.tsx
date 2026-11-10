'use client'

import { ReactNode, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowUpRight, Calendar, ExternalLink, MapPin, Play, Users } from 'lucide-react'
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaWhatsapp, FaYoutube } from 'react-icons/fa'
import { Plyr } from 'plyr-react'
import 'plyr-react/plyr.css'
import { EventGallery } from '@/components/Events/EventGallery'
import type { GalleryLayout } from '@/components/Events/eventLayout'
import { EventStorySkeleton } from '@/components/Events/EventLoaders'

type SocialPlatform = 'instagram' | 'youtube' | 'facebook' | 'linkedin' | 'x' | 'threads' | 'whatsapp'

type Event = {
  _id?: string; title: string; type: string; date: string; description: string; story?: string; location: string; image?: string; link?: string; videoUrl?: string; gallery?: string[]; team?: string[]; contributions?: string[]; outcomes?: string[]; projectUrl?: string; tags?: string[]
  socialLinks?: { platform: SocialPlatform; url: string }[]
  galleryLayout?: GalleryLayout
}

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-')
const matches = (event: Event, id: string) => event._id === id || slug(event.title) === decodeURIComponent(id)
const youtubeId = (url: string) => url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?/]+)/)?.[1] || null

const platformLabels: Record<SocialPlatform, string> = { instagram: 'Instagram', youtube: 'YouTube', facebook: 'Facebook', linkedin: 'LinkedIn', x: 'X', threads: 'Threads', whatsapp: 'WhatsApp' }
const platformIcon = (platform: SocialPlatform): ReactNode => {
  if (platform === 'instagram') return <FaInstagram aria-hidden="true" />
  if (platform === 'youtube') return <FaYoutube aria-hidden="true" />
  if (platform === 'facebook') return <FaFacebookF aria-hidden="true" />
  if (platform === 'linkedin') return <FaLinkedinIn aria-hidden="true" />
  if (platform === 'whatsapp') return <FaWhatsapp aria-hidden="true" />
  return <span aria-hidden="true" className="text-sm font-bold">{platform === 'x' ? 'X' : '@'}</span>
}

export default function EventStoryPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { params.then(({ id }) => fetch('/api/events').then((res) => res.json()).then((data) => { const found = (data.events || []).find((item: Event) => matches(item, id)) || null; setEvent(found); if (found) localStorage.setItem('portfolio_last_event', JSON.stringify({ id: found._id, title: found.title })); }).finally(() => setLoading(false))) }, [params])
  if (loading) return <EventStorySkeleton />
  if (!event) return <div className="grid min-h-screen place-items-center bg-zinc-50 px-6 text-center dark:bg-black"><div><p className="mb-5 font-mono text-xs text-zinc-500">EVENT NOT FOUND</p><Link href="/events" className="font-bold text-amber-600 underline">Back to events</Link></div></div>

  const gallery = event.gallery?.length ? event.gallery : event.image ? [event.image] : []
  const socialLinks = event.socialLinks?.filter((item) => item.url) || []
  const sections = [{ title: 'What I worked on', items: event.contributions }, { title: 'What came out of it', items: event.outcomes }]
  return <main className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-white">
    <div className="mx-auto max-w-[1500px] px-4 pb-24 pt-6 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => router.back()} className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 font-mono text-[10px] font-bold tracking-widest text-zinc-600 shadow-sm hover:border-yellow-300 hover:bg-yellow-100 hover:text-black dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-yellow-300"><ArrowLeft size={14} /> BACK</button><Link href="/events" className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 font-mono text-[10px] font-bold tracking-widest text-zinc-600 shadow-sm hover:border-yellow-300 hover:bg-yellow-100 hover:text-black dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-yellow-300">ALL EVENTS</Link><Link href="/" className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 font-mono text-[10px] font-bold tracking-widest text-zinc-600 shadow-sm hover:border-yellow-300 hover:bg-yellow-100 hover:text-black dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-yellow-300">PORTFOLIO HOME</Link></div>
      <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end"><div><p className="mb-4 font-mono text-[11px] font-bold tracking-[.28em] text-amber-600 dark:text-yellow-300">{event.type === 'college' ? 'CAMPUS EVENT' : 'EXTERNAL EVENT'} / CASE STUDY</p><h1 className="max-w-3xl text-4xl font-bold uppercase leading-[.98] tracking-[-.03em] sm:text-5xl lg:text-6xl">{event.title}</h1><p className="mt-6 max-w-2xl text-base leading-7 text-zinc-500 dark:text-zinc-400">{event.description}</p></div><div className="grid grid-cols-2 gap-3 font-mono text-[10px]"><div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"><Calendar className="mb-5 text-amber-500" size={17} /><span className="text-zinc-400">WHEN</span><strong className="mt-2 block">{event.date}</strong></div><div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"><MapPin className="mb-5 text-amber-500" size={17} /><span className="text-zinc-400">WHERE</span><strong className="mt-2 block uppercase">{event.location}</strong></div></div></div>
      {socialLinks.length > 0 && <section className="mt-8 flex flex-wrap items-center gap-3" aria-label="Event social links"><span className="mr-1 font-mono text-[10px] font-bold tracking-[.2em] text-zinc-400">EVENT LINKS</span>{socialLinks.map((socialLink, index) => <a key={`${socialLink.platform}-${index}`} href={socialLink.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2.5 font-mono text-[10px] font-bold text-zinc-700 transition hover:-translate-y-0.5 hover:border-yellow-400 hover:bg-yellow-300 hover:text-black dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:border-yellow-300"><span className="text-base">{platformIcon(socialLink.platform)}</span>{platformLabels[socialLink.platform] || socialLink.platform}<ExternalLink size={12} /></a>)}</section>}
      {gallery.length > 0 && <EventGallery images={gallery} layout={event.galleryLayout} title={event.title} className="mt-12" />}
      {event.videoUrl && <section className="mx-auto mt-16 max-w-5xl"><p className="mb-4 font-mono text-xs font-bold tracking-[.25em] text-amber-600 dark:text-yellow-300">02 / WATCH THE EVENT</p><div className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-zinc-900 shadow-xl dark:border-zinc-800">{youtubeId(event.videoUrl) ? <iframe className="aspect-video w-full" src={`https://www.youtube.com/embed/${youtubeId(event.videoUrl)}`} title={`${event.title} video`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /> : <Plyr source={{ type: 'video', sources: [{ src: event.videoUrl, type: 'video/mp4' }] }} options={{ autoplay: false, clickToPlay: true, settings: ['speed', 'quality'], seekTime: 10 }} />}</div></section>}
      <div className="mx-auto mt-16 grid max-w-5xl gap-14 lg:grid-cols-[1fr_280px]"><article className="space-y-6 text-base leading-8 text-zinc-600 dark:text-zinc-300"><p className="font-mono text-xs font-bold tracking-[.25em] text-amber-600 dark:text-yellow-300">03 / THE STORY</p><h2 className="text-3xl font-black uppercase text-zinc-900 dark:text-white">From a rough idea to something people could try.</h2><p>{event.story || event.description}</p>{sections.map((section) => section.items?.length ? <section key={section.title} className="pt-7"><h3 className="mb-5 text-xl font-black uppercase text-zinc-900 dark:text-white">{section.title}</h3><ul className="space-y-3">{section.items.map((item) => <li key={item} className="flex gap-3"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-yellow-300" />{item}</li>)}</ul></section> : null)}</article><aside className="space-y-7"><div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"><div className="mb-5 flex items-center gap-2 font-mono text-xs font-bold tracking-widest"><Users size={16} className="text-amber-500" /> THE TEAM</div>{event.team?.length ? <ul className="space-y-3 text-sm text-zinc-500">{event.team.map((member) => <li key={member}>{member}</li>)}</ul> : <p className="text-sm text-zinc-500">A focused team build.</p>}</div>{event.tags?.length ? <div className="flex flex-wrap gap-2">{event.tags.map((tag) => <span key={tag} className="rounded-full border border-zinc-200 px-3 py-1 font-mono text-[10px] font-bold uppercase text-zinc-500 dark:border-zinc-800">{tag}</span>)}</div> : null}</aside></div>
      {(event.projectUrl || event.videoUrl || event.link) && <div className="mt-16 flex flex-wrap gap-3 border-t border-zinc-200 pt-8 dark:border-zinc-800">{event.projectUrl && <a href={event.projectUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-yellow-300 px-5 py-3 font-mono text-xs font-bold text-black">VIEW THE BUILD <ArrowUpRight size={15} /></a>}{event.videoUrl && <a href={event.videoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-5 py-3 font-mono text-xs font-bold dark:border-zinc-700"><Play size={14} /> WATCH VIDEO</a>}{event.link && <a href={event.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-5 py-3 font-mono text-xs font-bold dark:border-zinc-700">CERTIFICATE <ArrowUpRight size={15} /></a>}</div>}
    </div>
  </main>
}
