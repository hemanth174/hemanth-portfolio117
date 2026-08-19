'use client'
import { useState, useEffect, useCallback } from "react"
import { Calendar, MapPin, ExternalLink, X, Tag, ChevronLeft, ChevronRight } from "lucide-react"
import { transition } from "../Skills/page"

type EventItem = {
    _id?: string;
    title: string;
    type: 'college' | 'off-college';
    date: string;
    description: string;
    story?: string;
    tags?: string[];
    location: string;
    image?: string;
    link?: string;
    createdAt?: string;
}

// ─── Event Detail Drawer ────────────────────────────────────────────────────
const EventDrawer = ({
    event,
    index,
    total,
    onClose,
    onPrev,
    onNext,
}: {
    event: EventItem;
    index: number;
    total: number;
    onClose: () => void;
    onPrev: () => void;
    onNext: () => void;
}) => {
    // Close on Escape key
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') onPrev();
            if (e.key === 'ArrowRight') onNext();
        };
        window.addEventListener('keydown', handleKey);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', handleKey);
            document.body.style.overflow = '';
        };
    }, [onClose, onPrev, onNext]);

    const mockThemes = [
        { bg: "bg-emerald-950/30 dark:bg-[#0d1a0d]", border: "border-emerald-900/40", text: "text-emerald-600 dark:text-[#4CAF50]", label: "CERTIFICATE OF PARTICIPATION" },
        { bg: "bg-amber-950/20 dark:bg-[#1a1200]", border: "border-amber-900/40", text: "text-amber-600 dark:text-[#FFDD00]", label: "CERTIFICATE OF ATTENDANCE" },
        { bg: "bg-blue-950/20 dark:bg-[#0d0d1a]", border: "border-blue-900/40", text: "text-blue-600 dark:text-[#6c9eff]", label: "CERTIFICATE OF ACHIEVEMENT" }
    ];
    const theme = mockThemes[index % mockThemes.length];

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/60 dark:bg-black/75 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Drawer Panel */}
            <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[520px] md:w-[600px] bg-white dark:bg-[#0a0a0a] border-l border-zinc-200 dark:border-zinc-900 shadow-2xl flex flex-col overflow-hidden animate-slide-in-right">

                {/* Header */}
                <div className="relative flex-shrink-0">
                    {/* Top accent */}
                    <div className="h-[3px] bg-amber-600 dark:bg-[#FFDD00] w-full" />

                    {/* Image or Mock Badge */}
                    <div className="relative w-full h-[200px] sm:h-[240px] bg-zinc-100 dark:bg-[#111] flex items-center justify-center overflow-hidden">
                        {event.image ? (
                            <img
                                src={event.image}
                                alt={event.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className={`w-[75%] max-w-[320px] h-[110px] rounded border flex flex-col items-center justify-center p-4 select-none ${theme.bg} ${theme.border} ${theme.text}`}>
                                <div className="text-[8px] tracking-[0.3em] font-black uppercase text-center mb-1.5 opacity-80 font-mono">
                                    {theme.label}
                                </div>
                                <div className="text-[13px] font-black tracking-wider uppercase text-center font-mono">
                                    HEMANTH RAMA SAI
                                </div>
                                <div className="text-[7px] tracking-widest uppercase text-center font-mono opacity-60 mt-1.5">
                                    {event.location}
                                </div>
                            </div>
                        )}

                        {/* Type Badge */}
                        <span className={`absolute top-4 left-4 text-[8px] tracking-[0.2em] font-black px-3 py-1.5 select-none ${
                            event.type === 'college'
                                ? 'bg-amber-600 dark:bg-[#FFDD00] text-white dark:text-black'
                                : 'bg-zinc-800 dark:bg-white text-white dark:text-black'
                        }`}>
                            {event.type === 'college' ? 'ON-CAMPUS' : 'OFF-CAMPUS'}
                        </span>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-black/40 dark:bg-black/60 hover:bg-black/60 dark:hover:bg-black/80 text-white backdrop-blur-sm transition-all cursor-pointer"
                            title="Close (Esc)"
                        >
                            <X size={14} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

                    {/* Event Type Label */}
                    <div className="text-[9px] tracking-[0.3em] font-bold text-amber-600 dark:text-[#FFDD00] uppercase font-mono">
                        {event.type === 'college' ? '— COLLEGE EVENT' : '— EXTERNAL EVENT'}
                    </div>

                    {/* Title */}
                    <h2 className="text-xl sm:text-2xl font-black uppercase leading-tight tracking-tight text-zinc-900 dark:text-white font-roboto">
                        {event.title}
                    </h2>

                    {/* Meta Row */}
                    <div className="flex flex-wrap gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-900">
                        <div className="flex items-center gap-2 text-[10px] text-zinc-500 dark:text-zinc-500 tracking-widest uppercase font-bold font-mono">
                            <Calendar size={12} className="text-amber-600 dark:text-[#FFDD00]" />
                            {event.date}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-500 dark:text-zinc-500 tracking-widest uppercase font-bold font-mono">
                            <MapPin size={12} className="text-amber-600 dark:text-[#FFDD00]" />
                            {event.location}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <h3 className="text-[9px] tracking-[0.25em] font-black text-zinc-400 dark:text-zinc-600 uppercase font-mono mb-2">
                            ABOUT THIS EVENT
                        </h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed">
                            {event.description}
                        </p>
                    </div>

                    {/* Story / Narrative */}
                    {event.story && (
                        <div className="bg-zinc-50 dark:bg-zinc-950 border-l-2 border-amber-600 dark:border-[#FFDD00] pl-5 py-4 pr-4">
                            <h3 className="text-[9px] tracking-[0.25em] font-black text-amber-600 dark:text-[#FFDD00] uppercase font-mono mb-3">
                                HOW IT WENT
                            </h3>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed">
                                {event.story}
                            </p>
                        </div>
                    )}

                    {/* Tags */}
                    {event.tags && event.tags.length > 0 && (
                        <div>
                            <h3 className="text-[9px] tracking-[0.25em] font-black text-zinc-400 dark:text-zinc-600 uppercase font-mono mb-3">
                                TAGS & TOPICS
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {event.tags.map((tag, i) => (
                                    <span
                                        key={i}
                                        className="inline-flex items-center gap-1 px-3 py-1 text-[9px] font-bold tracking-widest uppercase font-mono border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-900/50"
                                    >
                                        <Tag size={9} className="text-amber-600 dark:text-[#FFDD00]" />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* External Link */}
                    {event.link && (
                        <a
                            href={event.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between w-full border border-amber-600 dark:border-[#FFDD00] px-5 py-3.5 text-[10px] tracking-widest font-black uppercase font-mono text-amber-600 dark:text-[#FFDD00] hover:bg-amber-600 dark:hover:bg-[#FFDD00] hover:text-white dark:hover:text-black transition-all group cursor-pointer"
                        >
                            VIEW CERTIFICATE / EVENT
                            <ExternalLink size={13} className="group-hover:translate-x-1 transition-transform" />
                        </a>
                    )}
                </div>

                {/* Footer — Navigation */}
                <div className="flex-shrink-0 border-t border-zinc-100 dark:border-zinc-900 px-6 py-4 flex items-center justify-between bg-white dark:bg-[#0a0a0a]">
                    <button
                        onClick={onPrev}
                        className="flex items-center gap-2 text-[9px] tracking-widest font-bold font-mono text-zinc-400 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer uppercase disabled:opacity-30"
                        disabled={index === 0}
                    >
                        <ChevronLeft size={14} /> PREV
                    </button>

                    <span className="text-[9px] tracking-widest font-mono text-zinc-400 dark:text-zinc-700 font-bold">
                        {index + 1} / {total}
                    </span>

                    <button
                        onClick={onNext}
                        className="flex items-center gap-2 text-[9px] tracking-widest font-bold font-mono text-zinc-400 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer uppercase disabled:opacity-30"
                        disabled={index === total - 1}
                    >
                        NEXT <ChevronRight size={14} />
                    </button>
                </div>
            </div>
        </>
    );
};

// ─── Events Section ─────────────────────────────────────────────────────────
export const Events = () => {
    const [events, setEvents] = useState<EventItem[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'college' | 'off-college'>('all')
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

    useEffect(() => {
        // 1. Try to load cached events from localStorage
        try {
            const cached = localStorage.getItem('portfolio_events_cache')
            if (cached) {
                const parsed = JSON.parse(cached)
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setEvents(parsed)
                    setLoading(false)
                }
            }
        } catch (e) {
            console.warn("Failed to load cached events:", e)
        }

        // 2. Fetch fresh events from the API
        const fetchEvents = async () => {
            try {
                const res = await fetch('/api/events')
                if (res.ok) {
                    const data = await res.json()
                    if (data.events && data.events.length > 0) {
                        setEvents(data.events)
                        localStorage.setItem('portfolio_events_cache', JSON.stringify(data.events))
                    }
                }
            } catch (e) {
                console.error("Failed to fetch events:", e)
            } finally {
                setLoading(false)
            }
        }

        fetchEvents()
    }, [])

    const filteredEvents = events.filter(e => {
        if (filter === 'all') return true
        return e.type === filter
    })

    const totalEvents = events.length
    const collegeCount = events.filter(e => e.type === 'college').length
    const offCollegeCount = events.filter(e => e.type === 'off-college').length

    const openEvent = useCallback((index: number) => {
        setSelectedIndex(index)
    }, [])

    const closeEvent = useCallback(() => {
        setSelectedIndex(null)
    }, [])

    const goPrev = useCallback(() => {
        setSelectedIndex(prev => (prev !== null && prev > 0 ? prev - 1 : prev))
    }, [])

    const goNext = useCallback(() => {
        setSelectedIndex(prev => (prev !== null && prev < filteredEvents.length - 1 ? prev + 1 : prev))
    }, [filteredEvents.length])

    // Renders the stylized mock certificate/event placeholder if no image exists
    const renderMockBadge = (event: EventItem, index: number) => {
        const themes = [
            { bg: "bg-emerald-950/20 dark:bg-[#0d1a0d]", border: "border-emerald-900/40 dark:border-[#1a3a1a]", text: "text-emerald-600 dark:text-[#4CAF50]", title: "CERTIFICATE OF PARTICIPATION" },
            { bg: "bg-amber-950/20 dark:bg-[#1a1200]", border: "border-amber-900/40 dark:border-[#3a2800]", text: "text-amber-600 dark:text-[#FFDD00]", title: "CERTIFICATE OF ATTENDANCE" },
            { bg: "bg-blue-950/20 dark:bg-[#0d0d1a]", border: "border-blue-900/40 dark:border-[#1a1a3a]", text: "text-blue-600 dark:text-[#6c9eff]", title: "CERTIFICATE OF ACHIEVEMENT" }
        ]
        const theme = themes[index % themes.length]

        return (
            <div className={`w-[85%] h-[80px] rounded border flex flex-col items-center justify-center p-3 select-none transition-all ${theme.bg} ${theme.border} ${theme.text}`}>
                <div className="text-[7px] md:text-[8px] tracking-[0.25em] font-black uppercase text-center mb-1 leading-tight font-mono opacity-80">
                    {theme.title}
                </div>
                <div className="text-[10px] md:text-[11px] font-black tracking-wider uppercase text-center font-mono truncate max-w-full">
                    HEMANTH RAMA SAI
                </div>
                <div className="text-[6px] md:text-[7px] tracking-widest uppercase text-center font-mono opacity-60 mt-1 truncate max-w-full">
                    {event.location}
                </div>
            </div>
        )
    }

    return (
        <>
            {/* Event Detail Drawer */}
            {selectedIndex !== null && filteredEvents[selectedIndex] && (
                <EventDrawer
                    event={filteredEvents[selectedIndex]}
                    index={selectedIndex}
                    total={filteredEvents.length}
                    onClose={closeEvent}
                    onPrev={goPrev}
                    onNext={goNext}
                />
            )}

            <section id="section6" className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white px-6 md:px-10 py-24 font-mono">
                <div className="mx-auto">
                    {/* Section Title */}
                    <div className="mb-10">
                        
                       <div className="mb-5">
                        <h2 className={`text-4xl md:text-6xl font-black tracking-tight leading-none uppercase font-roboto flex flex-wrap gap-x-4 ${transition}`}>
                            <span>EVENTS &</span>
                            <span className="text-zinc-300 dark:text-zinc-800">ACTIVITIES.</span>
                        </h2>
                       </div>
                        <p className="text-zinc-500 dark:text-zinc-600 text-xs md:text-sm tracking-wider mt-3 font-sans max-w-xl">
                            Workshops, hackathons, college programs, and off-campus meetups attended over time. Click any card to read the full story.
                        </p>
                    </div>

                    {/* Stats Section */}
                    <div className="flex flex-wrap gap-8 md:gap-16 mb-12">
                        <div>
                            <div className="text-3xl md:text-5xl font-black text-amber-600 dark:text-[#FFDD00] font-sans">
                                {loading ? "--" : totalEvents}
                            </div>
                            <div className="text-[9px] md:text-[10px] tracking-widest text-zinc-500 dark:text-zinc-600 font-bold mt-1 uppercase">
                                EVENTS ATTENDED
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl md:text-5xl font-black text-amber-600 dark:text-[#FFDD00] font-sans">
                                {loading ? "--" : collegeCount}
                            </div>
                            <div className="text-[9px] md:text-[10px] tracking-widest text-zinc-500 dark:text-zinc-600 font-bold mt-1 uppercase">
                                ON-CAMPUS (COLLEGE)
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl md:text-5xl font-black text-amber-600 dark:text-[#FFDD00] font-sans">
                                {loading ? "--" : offCollegeCount}
                            </div>
                            <div className="text-[9px] md:text-[10px] tracking-widest text-zinc-500 dark:text-zinc-600 font-bold mt-1 uppercase">
                                OFF-CAMPUS (EXTERNAL)
                            </div>
                        </div>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex flex-wrap gap-2 md:gap-3 mb-12">
                        {[
                            { key: 'all', label: 'ALL' },
                            { key: 'college', label: 'ON-CAMPUS (COLLEGE)' },
                            { key: 'off-college', label: 'OFF-CAMPUS (EXTERNAL)' },
                        ].map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setFilter(key as typeof filter)}
                                className={`px-5 py-2 text-[10px] tracking-[0.2em] font-bold border transition-all cursor-pointer ${
                                    filter === key
                                        ? 'bg-amber-600 dark:bg-[#FFDD00] text-white dark:text-[#0a0a0a] border-amber-600 dark:border-[#FFDD00]'
                                        : 'bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-400 dark:hover:border-zinc-600'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Grid of 3D Cards */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-10 h-10 border-4 border-amber-600/20 border-t-amber-600 dark:border-yellow-400/20 dark:border-t-[#FFDD00] rounded-full animate-spin" />
                        </div>
                    ) : filteredEvents.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-900/50 rounded-2xl">
                            <p className="text-zinc-500">No events found matching this filter.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-8 lg:perspective-[1000px] mt-10">
                            {filteredEvents.map((event, index) => {
                                let rotClass = ""
                                let shadowClass = ""

                                if (index % 3 === 0) {
                                    rotClass = "lg:rotate-x-[4deg] lg:-rotate-y-[3deg]"
                                    shadowClass = "shadow-[6px_6px_0px_rgba(217,119,6,0.8)] dark:shadow-[6px_6px_0px_#FFDD00] lg:shadow-[6px_6px_0px_rgba(217,119,6,0.8),12px_12px_0px_rgba(217,119,6,0.1)] lg:dark:shadow-[6px_6px_0px_#FFDD00,12px_12px_0px_#1a1500]"
                                } else if (index % 3 === 1) {
                                    rotClass = "lg:rotate-x-[4deg] lg:rotate-y-0 lg:-translate-y-3"
                                    shadowClass = "shadow-[0px_6px_0px_rgba(217,119,6,0.8)] dark:shadow-[0px_6px_0px_#FFDD00] lg:shadow-[0px_8px_0px_rgba(217,119,6,0.8),0px_16px_0px_rgba(217,119,6,0.1)] lg:dark:shadow-[0px_8px_0px_#FFDD00,0px_16px_0px_#1a1500]"
                                } else {
                                    rotClass = "lg:rotate-x-[4deg] lg:rotate-y-[3deg]"
                                    shadowClass = "shadow-[-6px_6px_0px_rgba(217,119,6,0.8)] dark:shadow-[-6px_6px_0px_#FFDD00] lg:shadow-[-6px_6px_0px_rgba(217,119,6,0.8),-12px_12px_0px_rgba(217,119,6,0.1)] lg:dark:shadow-[-6px_6px_0px_#FFDD00,-12px_12px_0px_#1a1500]"
                                }

                                return (
                                    <div
                                        key={event._id || index}
                                        onClick={() => openEvent(index)}
                                        className={`relative bg-white dark:bg-[#0f0f0f] border border-zinc-200 dark:border-[#1e1e1e] rounded-lg overflow-hidden flex flex-col group transition-all duration-300 lg:transform-style-3d hover:scale-[1.03] hover:rotate-x-0 hover:rotate-y-0 hover:-translate-y-2 hover:shadow-[0_20px_30px_rgba(217,119,6,0.15)] dark:hover:shadow-[0_20px_30px_rgba(255,221,0,0.1)] hover:border-amber-600 dark:hover:border-[#FFDD00] cursor-pointer ${rotClass} ${shadowClass}`}
                                    >
                                        {/* Top decorative accent bar */}
                                        <div className="h-[3px] bg-amber-600 dark:bg-[#FFDD00] w-full" />

                                        {/* Event Image Header */}
                                        <div className="w-full h-[130px] bg-zinc-100 dark:bg-[#141414] flex items-center justify-center border-b border-zinc-200 dark:border-[#1e1e1e] overflow-hidden relative">
                                            {event.image ? (
                                                <img
                                                    src={event.image}
                                                    alt={event.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                renderMockBadge(event, index)
                                            )}

                                            {/* Hover overlay hint */}
                                            <div className="absolute inset-0 bg-amber-600/0 dark:bg-[#FFDD00]/0 group-hover:bg-amber-600/5 dark:group-hover:bg-[#FFDD00]/5 transition-colors duration-300 flex items-center justify-center">
                                                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[8px] tracking-widest font-black uppercase font-mono text-amber-700 dark:text-[#FFDD00] bg-white/80 dark:bg-black/60 px-3 py-1.5 backdrop-blur-sm">
                                                    CLICK TO READ STORY →
                                                </span>
                                            </div>

                                            {/* Dynamic Tag Badge */}
                                            <span className={`absolute top-3 right-3 text-[8px] tracking-[0.2em] font-black px-2.5 py-1 select-none ${
                                                event.type === 'college'
                                                    ? 'bg-amber-600 dark:bg-[#FFDD00] text-white dark:text-[#0a0a0a]'
                                                    : 'bg-zinc-800 dark:bg-white text-white dark:text-[#0a0a0a]'
                                            }`}>
                                                {event.type === 'college' ? 'ON-CAMPUS' : 'OFF-CAMPUS'}
                                            </span>
                                        </div>

                                        {/* Event Content Body */}
                                        <div className="p-5 flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="text-[8px] tracking-[0.25em] font-bold text-amber-600 dark:text-[#FFDD00] mb-2 uppercase flex items-center gap-2">
                                                    {event.type === 'college' ? 'COLLEGE WORKSHOP' : 'EXTERNAL CAMPAIGN'}
                                                    {event.story && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-600 dark:bg-[#FFDD00] text-white dark:text-[#0a0a0a] font-black tracking-widest">
                                                            ★ STORY
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="text-sm md:text-base font-black text-zinc-800 dark:text-white leading-snug tracking-normal mb-3 uppercase line-clamp-2">
                                                    {event.title}
                                                </h3>
                                                <p className="text-zinc-500 dark:text-zinc-400 text-xs font-sans leading-relaxed mb-4 line-clamp-3">
                                                    {event.description}
                                                </p>
                                            </div>

                                            {/* Event Metadata */}
                                            <div className="space-y-2 border-t border-zinc-100 dark:border-[#1a1a1a] pt-4 mt-auto">
                                                <div className="flex items-center gap-2 text-[10px] text-zinc-500 dark:text-zinc-600 tracking-[0.1em] uppercase font-bold">
                                                    <Calendar size={12} className="text-amber-600 dark:text-[#FFDD00] shrink-0" />
                                                    <span>{event.date}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] text-zinc-500 dark:text-zinc-600 tracking-[0.1em] uppercase font-bold">
                                                    <MapPin size={12} className="text-amber-600 dark:text-[#FFDD00] shrink-0" />
                                                    <span className="truncate">{event.location}</span>
                                                </div>
                                            </div>

                                            {/* Tags strip */}
                                            {event.tags && event.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-zinc-100 dark:border-[#1a1a1a]">
                                                    {event.tags.slice(0, 3).map((tag, i) => (
                                                        <span key={i} className="text-[8px] font-bold tracking-wider px-2 py-0.5 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-600 uppercase font-mono">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    {event.tags.length > 3 && (
                                                        <span className="text-[8px] font-bold tracking-wider px-2 py-0.5 text-zinc-400 dark:text-zinc-700 uppercase font-mono">
                                                            +{event.tags.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* Slide-in animation */}
            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .animate-slide-in-right {
                    animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </>
    )
}
