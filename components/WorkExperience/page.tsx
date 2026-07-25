'use client'

import { useState, useEffect } from 'react'
import { Briefcase, Calendar, MapPin, ExternalLink, CheckCircle2, FileCheck, X } from 'lucide-react'
import { transition } from '../Skills/page'
export type WorkExperienceItem = {
    _id?: string
    company: string
    role: string
    duration: string
    isCurrent?: boolean
    location: string
    description: string
    skills?: string[]
    link?: string
    proof?: string
    createdAt?: string
}

export const WorkExperience = () => {
    const [experiences, setExperiences] = useState<WorkExperienceItem[]>([])
    const [loading, setLoading] = useState(true)
    const [activeProof, setActiveProof] = useState<{ title: string; file: string } | null>(null)

    const getProofKind = (value: string) => {
        const normalized = value.trim().toLowerCase()

        if (normalized.startsWith('data:image/')) return 'image'
        if (normalized.startsWith('data:application/pdf')) return 'pdf'
        if (normalized.startsWith('data:')) return 'file'
        if (/\.(png|jpe?g|gif|webp|bmp|svg)(\?|#|$)/i.test(normalized)) return 'image'
        if (/\.(pdf)(\?|#|$)/i.test(normalized)) return 'pdf'
        return 'file'
    }

    const getProofPreviewSrc = (value: string) => {
        return getProofKind(value) === 'pdf'
            ? `${value}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`
            : value
    }

    const getProofFileName = (title: string) => {
        return `${title.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '') || 'proof'}`
    }

    useEffect(() => {
        // 1. Load from cache if available
        try {
            const cached = localStorage.getItem('portfolio_work_experience_cache')
            if (cached) {
                const parsed = JSON.parse(cached)
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setExperiences(parsed)
                    setLoading(false)
                }
            }
        } catch (e) {
            console.warn("Failed to load cached work experience:", e)
        }

        // 2. Fetch fresh work experiences from API
        const fetchExperiences = async () => {
            try {
                const res = await fetch('/api/experience', { cache: 'no-store' })
                if (res.ok) {
                    const data = await res.json()
                    if (Array.isArray(data.experiences) && data.experiences.length > 0) {
                        setExperiences(data.experiences)
                        localStorage.setItem('portfolio_work_experience_cache', JSON.stringify(data.experiences))
                    } else {
                        // A deleted experience must also remove any previously cached card.
                        setExperiences([])
                        localStorage.removeItem('portfolio_work_experience_cache')
                    }
                }
            } catch (e) {
                console.error("Failed to fetch work experience:", e)
            } finally {
                setLoading(false)
            }
        }

        fetchExperiences()
    }, [])

    // Close modal on escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setActiveProof(null)
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    return (
        <section id="section5" className="min-h-screen overflow-x-hidden bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white px-4 sm:px-6 md:px-10 py-24 font-mono relative">
            <div className="mx-auto">
                {/* Header */}
                <div className="mb-14 border-b border-zinc-200 dark:border-zinc-900 pb-8">
                    <h2 className={`text-4xl md:text-6xl font-black tracking-tight leading-none uppercase font-roboto flex flex-wrap gap-x-4 ${transition}`}>
                        <span>WORK EXPERIENCE &</span>
                        <span className="text-zinc-300 dark:text-zinc-800">INTERNSHIPS.</span>
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs md:text-sm tracking-wider mt-3 font-sans max-w-2xl leading-relaxed">
                        Industry internships, engineering roles, and real-world software contributions.
                    </p>
                </div>

                {/* Content Timeline / Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-amber-600/20 border-t-amber-600 dark:border-yellow-400/20 dark:border-t-[#FFDD00] rounded-full animate-spin" />
                    </div>
                ) : experiences.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-900 rounded-2xl">
                        <p className="text-zinc-500 font-sans">No work experience listed yet.</p>
                    </div>
                ) : (
                    <div className="relative ml-3 space-y-10 border-l-2 border-zinc-200 pl-4 dark:border-zinc-800/80 sm:ml-4 md:ml-4 md:pl-8">
                        {experiences.map((exp, index) => {
                            const isCurrentRole = exp.isCurrent || exp.duration?.toUpperCase().includes('PRESENT');
                            const companyInitial = exp.company ? exp.company.charAt(0).toUpperCase() : 'W';

                            return (
                                <div key={exp._id || index} className="relative group">
                                    {/* Timeline Node Icon */}
                                    <div className={`absolute -left-[32px] md:-left-[48px] top-1.5 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                                        isCurrentRole
                                            ? 'bg-amber-500/10 dark:bg-yellow-400/10 border-amber-600 dark:border-[#FFDD00] text-amber-600 dark:text-[#FFDD00] shadow-[0_0_15px_rgba(245,158,11,0.3)] dark:shadow-[0_0_15px_rgba(255,221,0,0.3)]'
                                            : 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-500'
                                    }`}>
                                        <Briefcase size={14} />
                                    </div>  

                                    {/* Card Container */}
                                    <div className="min-w-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-amber-600/60 hover:shadow-xl dark:border-zinc-900 dark:bg-zinc-950/60 dark:hover:border-[#FFDD00]/60 sm:p-6 md:p-8">
                                        
                                        {/* Card Top Row */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-900">
                                            <div className="flex min-w-0 items-center gap-3.5">
                                                {/* Initial Badge */}
                                                <div className="w-11 h-11 rounded-xl bg-amber-600/10 dark:bg-[#FFDD00]/10 border border-amber-600/20 dark:border-[#FFDD00]/20 flex items-center justify-center shrink-0">
                                                    <span className="text-amber-600 dark:text-[#FFDD00] font-black text-lg font-roboto">
                                                        {companyInitial}
                                                    </span>
                                                </div>

                                                <div className="min-w-0">
                                                    <h3 className="break-words text-lg md:text-xl font-black text-zinc-900 dark:text-white uppercase font-roboto tracking-tight leading-snug">
                                                        {exp.role}
                                                    </h3>
                                                    <p className="text-xs md:text-sm font-bold text-amber-600 dark:text-[#FFDD00] uppercase tracking-wider mt-0.5">
                                                        {exp.company}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Duration & Active Beacon */}
                                            <div className="flex w-full flex-wrap items-center gap-2 self-start sm:w-auto sm:gap-3 sm:self-center">
                                                {isCurrentRole && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[9px] font-black tracking-widest uppercase rounded-full">
                                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                        CURRENT ROLE
                                                    </span>
                                                )}
                                                <span className="inline-flex items-center gap-1.5 text-[10px] md:text-xs font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-lg tracking-wider">
                                                    <Calendar size={12} className="text-amber-600 dark:text-[#FFDD00]" />
                                                    <span className="break-words">{exp.duration}</span>
                                                </span>
                                            </div>
                                        </div>

                                        {/* Metadata Row (Location, Link & Proof Button) */}
                                        <div className="flex flex-wrap items-center gap-3 py-3 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-500 md:gap-4 md:text-xs">
                                            <div className="flex min-w-0 items-start gap-1.5">
                                                <MapPin size={12} className="text-amber-600 dark:text-[#FFDD00]" />
                                                <span className="break-words">{exp.location}</span>
                                            </div>

                                            {exp.link && (
                                                <a
                                                    href={exp.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-amber-600 dark:text-[#FFDD00] hover:underline transition-all"
                                                >
                                                    <ExternalLink size={12} />
                                                    <span>VISIT WEBSITE</span>
                                                </a>
                                            )}

                                            {exp.proof && (
                                                <button
                                                    onClick={() => setActiveProof({ title: `${exp.company} — ${exp.role}`, file: exp.proof! })}
                                                    className="flex w-full items-center justify-center gap-1.5 rounded border border-amber-600/30 bg-amber-600/10 px-2.5 py-1 text-center text-amber-600 transition-all hover:bg-amber-600 hover:text-white dark:border-[#FFDD00]/30 dark:bg-[#FFDD00]/10 dark:text-[#FFDD00] dark:hover:bg-[#FFDD00] dark:hover:text-black sm:ml-auto sm:w-auto"
                                                >
                                                    <FileCheck size={12} />
                                                    <span>VIEW OFFER / PROOF LETTER</span>
                                                </button>
                                            )}
                                        </div>

                                        {/* Description Narrative */}
                                        <div className="mt-2 text-sm text-zinc-650 dark:text-zinc-300 font-sans leading-relaxed space-y-2">
                                            {exp.description.split('\n').map((paragraph, pIdx) => (
                                                <p key={pIdx} className="flex items-start gap-2">
                                                    <CheckCircle2 size={15} className="text-amber-600 dark:text-[#FFDD00] shrink-0 mt-1" />
                                                    <span>{paragraph}</span>
                                                </p>
                                            ))}
                                        </div>

                                        {/* Skills Tag Strip */}
                                        {exp.skills && exp.skills.length > 0 && (
                                            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-900 flex flex-wrap gap-2 items-center">
                                                <span className="text-[9px] font-bold tracking-widest text-zinc-400 dark:text-zinc-600 uppercase font-mono mr-1">
                                                    TECH STACK:
                                                </span>
                                                {exp.skills.map((skill, sIdx) => (
                                                    <span
                                                        key={sIdx}
                                                        className="px-2.5 py-1 text-[9px] font-bold tracking-wider uppercase font-mono bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-md"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Proof / Offer Letter Modal */}
            {activeProof && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
                    onClick={() => setActiveProof(null)}
                >
                    <div
                        className="relative max-w-4xl w-full bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl p-4 flex flex-col items-center max-h-[92vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="w-full flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-zinc-800 px-2">
                            <div className="flex items-center gap-2">
                                <FileCheck size={18} className="text-amber-500 dark:text-yellow-400" />
                                <span className="text-xs md:text-sm font-bold text-white uppercase font-roboto tracking-wide">
                                    {activeProof.title}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <a
                                    href={activeProof.file}
                                    download={getProofFileName(activeProof.title)}
                                    className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-200 transition-colors hover:bg-zinc-700 hover:text-white"
                                >
                                    Download
                                </a>
                                <a
                                    href={activeProof.file}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-full border border-amber-600/30 bg-amber-600/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-400 transition-colors hover:bg-amber-600 hover:text-black"
                                >
                                    Open
                                </a>
                                <button
                                    onClick={() => setActiveProof(null)}
                                    className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* File Preview Container */}
                        <div className="w-full flex-1 min-h-0 overflow-hidden bg-black/40 rounded-xl p-2">
                            {getProofKind(activeProof.file) === 'image' ? (
                                <img
                                    src={activeProof.file}
                                    alt={activeProof.title}
                                    className="mx-auto max-w-full max-h-[75vh] object-contain rounded-lg shadow-lg"
                                />
                            ) : getProofKind(activeProof.file) === 'pdf' ? (
                                <iframe
                                    src={getProofPreviewSrc(activeProof.file)}
                                    title={activeProof.title}
                                    className="h-[75vh] w-full rounded-lg bg-white"
                                />
                            ) : (
                                <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-6 py-10 text-center">
                                    <FileCheck size={44} className="text-amber-500 dark:text-yellow-400" />
                                    <div>
                                        <p className="font-bold uppercase tracking-wide text-white">Preview not available in browser</p>
                                        <p className="mt-2 max-w-md text-sm text-zinc-400">
                                            This proof file is not an image or PDF. Use the link below to open or download the original file.
                                        </p>
                                    </div>
                                    <a
                                        href={activeProof.file}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 font-bold text-black transition-colors hover:bg-amber-500"
                                    >
                                        Open File
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}
