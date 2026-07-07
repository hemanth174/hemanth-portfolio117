'use client';

import { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { transition } from '../Skills/page';

import projectImg1 from '@/app/Logo_main.png';
import projectImg2 from '@/app/Img2.png';
import projectImg3 from '@/app/Img3.png';
import projectImg4 from '@/app/restaurant_demo.png';

const projectsData = [
    {
        id: 1,
        title: 'SyllabiQ — Exam Syllabus Tracker',
        category: 'Personal Project',
        description:
            'A full-stack web app that helps students track their syllabus topics, monitor subject-wise progress, and count down to exam day — all in one dashboard.',
        image: projectImg1.src,
        codeUrl: 'https://github.com/hemanth174/SyllbuIQ.git',
        liveUrl: '#',
    },
    {
        id: 2,
        title: 'HOAS — Hostel Operational Accountability System',
        category: 'StartUp',
        description:
            'A full-stack web platform that streamlines hostel operations by enabling complaint tracking, role-based management, and real-time accountability between students, wardens, and management.',
        image: projectImg2.src,
        codeUrl: 'https://github.com/niatapppurpose-APPs/HOAS.git',
        liveUrl: 'https://hoas-client-4n13.vercel.app/',
    },
    {
        id: 3,
        title: 'LLM Student Assistant — AI Study Companion',
        category: 'Personal Project',
        description:
            'LLM-based student assistant deployed on Hugging Face Spaces that delivers real-time answers, explanations, and learning support using natural language interaction.',
        image: projectImg3.src,
        codeUrl: 'https://huggingface.co/spaces/Hemanth789/LLM_student_assisstant/tree/main',
        liveUrl: 'https://huggingface.co/spaces/Hemanth789/LLM_student_assisstant',
    },
    {
        id: 4,
        title: 'Ember & Oak — Fine Dining Restaurant',
        category: 'Freelance Project',
        description:
            'A premium fine-dining restaurant website featuring an elegant menu, booking integration, and a sophisticated aesthetic. Built as a freelance demo to showcase high-end UI/UX.',
        image: projectImg4.src,
        codeUrl: 'https://github.com/hemanth174/restaurant-client.git',
        liveUrl: 'https://restaurant-demo117.netlify.app/',
    },
];

const isValidLiveUrl = (value?: string) => {
    if (!value || !value.trim() || value.trim() === '#') {
        return false;
    }

    try {
        const url = new URL(value.trim());
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
};

export const handleLiveLinks = (liveUrl?: string) => {
    if (!isValidLiveUrl(liveUrl)) {
        return '/testing';
    }

    return `/preview?url=${encodeURIComponent(liveUrl!.trim())}`;
};

const getPreviewHref = (project: { title: string; description: string; codeUrl: string; liveUrl: string }) => {
    const params = new URLSearchParams({
        url: project.liveUrl.trim(),
        title: project.title,
        description: project.description,
        codeUrl: project.codeUrl,
    });

    return `/preview?${params.toString()}`;
};

const requiresDirectOpen = (liveUrl?: string) => {
    if (!liveUrl) {
        return false;
    }

    try {
        const url = new URL(liveUrl.trim());
        const hostname = url.hostname;
        return hostname === 'huggingface.co' || 
               hostname === 'www.huggingface.co' ||
               hostname === 'colab.research.google.com' ||
               hostname.includes('github.com') ||
               hostname.includes('kaggle.com') ||
               hostname.includes('youtube.com') ||
               hostname.includes('medium.com') ||
               hostname.includes('linkedin.com');
    } catch {
        return false;
    }
};

function ProjectsList() {
    const [projects, setProjects] = useState<any[]>(projectsData);
    const [showAll, setShowAll] = useState(false);
    const [filter, setFilter] = useState<'all' | 'notebooks'>('all');

    useEffect(() => {
        // 1. Try to load from localStorage first for instant display
        try {
            const cached = localStorage.getItem('portfolio_projects_cache');
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setProjects(parsed);
                }
            }
        } catch (e) {
            console.warn("Failed to load cached projects:", e);
        }

        // 2. Fetch fresh projects in the background
        const fetchProjects = async () => {
            try {
                const res = await fetch('/api/projects');
                if (res.ok) {
                    const data = await res.json();
                    if (data.projects && data.projects.length > 0) {
                        setProjects(data.projects);
                        // Cache for the next visit
                        localStorage.setItem('portfolio_projects_cache', JSON.stringify(data.projects));
                    }
                }
            } catch (err) {
                console.error("Failed to fetch dynamic projects:", err);
            }
        };
        fetchProjects();
    }, []);

    const normalProjects = projects.filter(p => p.category !== 'LLM Notebook');
    const notebookProjects = projects.filter(p => p.category === 'LLM Notebook');

    const displayedProjects = filter === 'notebooks'
        ? notebookProjects
        : [...normalProjects, ...notebookProjects];

    return (
        <section id="section4" className="min-h-screen bg-black px-6 md:px-10 pt-24 pb-10">
            {/* Header with Title and Dropdown */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 border-b border-zinc-900 pb-6">
                <h1 className={`tracking-widest text-4xl font-roboto text-yellow-300 font-bold ${transition}`}>
                    PROJECTS
                </h1>
                <div className="relative z-20">
                    <select
                        value={filter}
                        onChange={(e) => {
                            setFilter(e.target.value as 'all' | 'notebooks');
                            setShowAll(false); // Reset grid collapse on filter change
                        }}
                        className="bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white px-4 py-2.5 pr-9 rounded-lg text-xs font-mono font-bold tracking-wider uppercase outline-none focus:border-yellow-400 transition-all cursor-pointer appearance-none shadow-md"
                    >
                        <option value="all">All Projects</option>
                        <option value="notebooks">LLM Notebooks Only</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                {(showAll ? displayedProjects : displayedProjects.slice(0, 5)).map((project) => {
                    const isColab = project.category === 'LLM Notebook' || 
                                    (project.liveUrl && project.liveUrl.includes('colab.research.google.com'));
                    const hasCode = project.codeUrl && project.codeUrl.trim() !== '' && project.codeUrl.trim() !== '#';
                    const hasLive = isValidLiveUrl(project.liveUrl);

                    return (
                        <div
                            key={project._id || project.id}
                            className="group flex flex-col h-[350px] bg-zinc-750 border-t-3 border-yellow-300 rounded-2xl overflow-hidden shadow-lg hover:shadow-[0_0_30px_rgba(255,221,0,0.15)] transition-all duration-300"
                        >
                            <div className="relative w-full h-40 flex items-center justify-center overflow-hidden bg-black/40">
                                {/* Category Badge - Appears on Hover */}
                                <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-[-10px] group-hover:translate-y-0">
                                    <span className="px-3 py-1 bg-yellow-300 text-black text-[10px] font-bold rounded-full shadow-lg uppercase tracking-widest border border-black/10">
                                        {project.category}
                                    </span>
                                </div>

                                {project.image ? (
                                    <img
                                        className="p-1 rounded-xl object-contain w-full h-full group-hover:scale-105 transition-transform duration-500"
                                        src={project.image}
                                        alt={project.title}
                                    />
                                ) : isColab ? (
                                    <div className="w-full h-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-black flex flex-col items-center justify-center relative group-hover:scale-105 transition-transform duration-500 p-4 border border-zinc-800/40 rounded-xl">
                                        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#f9ab00_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                                        <svg className="w-14 h-14 filter drop-shadow-[0_0_12px_rgba(249,171,0,0.3)] z-10" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M24 16C19.58 16 16 19.58 16 24C16 28.42 19.58 32 24 32C26.2 32 28.2 31.1 29.66 29.66L32.48 32.48C30.28 34.68 27.3 36 24 36C17.37 36 12 30.63 12 24C12 17.37 17.37 12 24 12C27.3 12 30.28 13.32 32.48 15.52L29.66 18.34C28.2 16.9 26.2 16 24 16Z" fill="#F9AB00" />
                                            <path d="M24 32C28.42 32 32 28.42 32 24C32 19.58 28.42 16 24 16C21.8 16 19.8 16.9 18.34 18.34L15.52 15.52C17.72 13.32 20.7 12 24 12C30.63 12 36 17.37 36 24C36 30.63 30.63 36 24 36C20.7 36 17.72 34.68 15.52 32.48L18.34 29.66C19.8 31.1 21.8 32 24 32Z" fill="#E37400" />
                                        </svg>
                                        <span className="text-[9px] font-bold text-yellow-500 uppercase tracking-[0.25em] mt-3 z-10 font-mono">
                                            Google Colab Notebook
                                        </span>
                                    </div>
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-zinc-950 to-zinc-900 flex flex-col items-center justify-center p-4 rounded-xl border border-zinc-800/40">
                                        <svg className="w-10 h-10 text-zinc-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Project</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col flex-1 p-6 text-center">
                                <h1 className="text-xl font-bold text-white group-hover:text-yellow-300 transition-colors mb-3 line-clamp-1" title={project.title}>
                                    {project.title}
                                </h1>
                                <p className="text-sm text-gray-400 font-mono line-clamp-3" title={project.description}>
                                    {project.description}
                                </p>
                            </div>
                            <div className="flex gap-4 p-6 pt-0 justify-center mt-auto">
                                {hasCode ? (
                                    <a
                                        href={project.codeUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-yellow-400 hover:text-black text-white font-roboto text-[10px] sm:text-xs md:text-sm transition-colors duration-300 w-full justify-center"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 8 18v4" />
                                            <path d="M12 18h-.01" />
                                        </svg>
                                        CODE
                                    </a>
                                ) : (
                                    <button
                                        disabled
                                        className="flex items-center gap-2 px-4 py-2 bg-zinc-800/30 text-zinc-600 border border-zinc-800/10 font-roboto text-[10px] sm:text-xs md:text-sm cursor-not-allowed w-full justify-center"
                                        title="No source code link provided"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
                                            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 8 18v4" />
                                            <path d="M12 18h-.01" />
                                        </svg>
                                        NO CODE
                                    </button>
                                )}

                                {hasLive ? (
                                    <a
                                        href={requiresDirectOpen(project.liveUrl)
                                            ? project.liveUrl
                                            : getPreviewHref(project)}
                                        target={requiresDirectOpen(project.liveUrl) ? "_blank" : undefined}
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-yellow-400 hover:text-black text-white font-roboto text-[10px] sm:text-xs md:text-sm transition-colors duration-300 w-full justify-center"
                                    >
                                        <ExternalLink size={16} /> LIVE DEMO
                                    </a>
                                ) : hasCode ? (
                                    <a
                                        href={`/testing?codeUrl=${encodeURIComponent(project.codeUrl)}`}
                                        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-yellow-400 hover:text-black text-white font-roboto text-[10px] sm:text-xs md:text-sm transition-colors duration-300 w-full justify-center"
                                    >
                                        <ExternalLink size={16} /> LIVE DEMO
                                    </a>
                                ) : (
                                    <button
                                        disabled
                                        className="flex items-center gap-2 px-4 py-2 bg-zinc-800/30 text-zinc-600 border border-zinc-800/10 font-roboto text-[10px] sm:text-xs md:text-sm cursor-not-allowed w-full justify-center"
                                        title="No demo link provided"
                                    >
                                        <ExternalLink size={16} className="opacity-40" /> NO DEMO
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* 6th "View More" Card */}
                {!showAll && displayedProjects.length > 5 && (
                    <div
                        onClick={() => setShowAll(true)}
                        className="group relative flex flex-col h-[350px] bg-zinc-900/40 border-2 border-dashed border-yellow-300/40 rounded-2xl overflow-hidden shadow-lg hover:border-yellow-300 hover:shadow-[0_0_30px_rgba(255,221,0,0.1)] transition-all duration-300 cursor-pointer justify-center items-center p-6 text-center"
                    >
                        {/* Static view */}
                        <div className="flex flex-col items-center justify-center space-y-4 group-hover:scale-95 transition-transform duration-300">
                            <div className="w-16 h-16 rounded-full bg-yellow-300/10 border border-yellow-300/20 flex items-center justify-center text-yellow-300 shadow-inner group-hover:bg-yellow-300 group-hover:text-black transition-colors duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white group-hover:text-yellow-300 transition-colors">
                                    + {displayedProjects.length - 5} More Projects
                                </h3>
                                <p className="text-xs text-zinc-500 mt-1 font-mono">
                                    including LLM notebooks & works
                                </p>
                            </div>
                        </div>

                        {/* Hover Overlay View */}
                        <div className="absolute inset-0 bg-black/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center p-6 text-left">
                            <p className="text-[10px] font-bold text-yellow-300 uppercase tracking-widest mb-4">Remaining Works:</p>
                            <ul className="space-y-3 text-xs text-zinc-300 font-mono">
                                {displayedProjects.slice(5).map((p) => (
                                    <li key={p._id || p.id} className="truncate flex items-center gap-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 shrink-0" />
                                        <span className="truncate" title={p.title}>{p.title}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-6 text-center border-t border-zinc-800/80 pt-4">
                                <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-[0.2em] animate-pulse">
                                    Click to Expand Grid
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showAll && displayedProjects.length > 5 && (
                <div className="flex justify-center mt-10">
                    <button
                        onClick={() => {
                            setShowAll(false);
                            document.getElementById('section4')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="flex items-center gap-2 px-6 py-2.5 bg-zinc-800 hover:bg-yellow-300 hover:text-black text-white font-bold font-roboto text-xs uppercase tracking-widest rounded-full transition-all duration-300 shadow-md hover:shadow-yellow-300/10 cursor-pointer"
                    >
                        <svg className="rotate-180" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                        Show Less
                    </button>
                </div>
            )}
        </section>
    );
}

export const Projects = ProjectsList;
