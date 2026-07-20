'use client';

import { useState, useEffect, useRef } from 'react';
import { ExternalLink, Download, Workflow, FolderOpen, ChevronDown } from 'lucide-react';
import { transition } from '../Skills/page';

import projectImg1 from '@/app/Logo_main.png';
import projectImg2 from '@/app/Img2.png';
import projectImg3 from '@/app/Img3.png';
import projectImg4 from '@/app/restaurant_demo.png';

// ─── Types ──────────────────────────────────────────────────────────────────

type Project = {
    _id?: string;
    id?: number;
    title: string;
    category: string;
    description: string;
    image?: string;
    codeUrl?: string;
    liveUrl?: string;
};

type N8nWorkflow = {
    _id: string;
    title: string;
    description: string;
    category: string;
    tags?: string[];
    thumbnail?: string;
    nodeCount?: number;
    workflowJson?: string;
};

// ─── Static project data ─────────────────────────────────────────────────────

const projectsData: Project[] = [
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

const isValidLiveUrl = (value?: string) => {
    if (!value || !value.trim() || value.trim() === '#') return false;
    try {
        const url = new URL(value.trim());
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
};

export const handleLiveLinks = (liveUrl?: string) => {
    if (!isValidLiveUrl(liveUrl)) return '/testing';
    return `/preview?url=${encodeURIComponent(liveUrl!.trim())}`;
};

const getPreviewHref = (project: Project) => {
    const params = new URLSearchParams({
        url: project.liveUrl?.trim() ?? '',
        title: project.title,
        description: project.description,
        codeUrl: project.codeUrl ?? '',
    });
    return `/preview?${params.toString()}`;
};

const requiresDirectOpen = (liveUrl?: string) => {
    if (!liveUrl) return false;
    try {
        const { hostname } = new URL(liveUrl.trim());
        return (
            hostname === 'huggingface.co' ||
            hostname === 'www.huggingface.co' ||
            hostname === 'colab.research.google.com' ||
            hostname.includes('github.com') ||
            hostname.includes('kaggle.com') ||
            hostname.includes('youtube.com') ||
            hostname.includes('medium.com') ||
            hostname.includes('linkedin.com')
        );
    } catch {
        return false;
    }
};

// ─── N8n category colour map ──────────────────────────────────────────────────

const N8N_CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    'Automation':     { bg: 'bg-orange-50 dark:bg-orange-500/15', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-500/30' },
    'AI Agent':       { bg: 'bg-violet-50 dark:bg-violet-500/15', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-500/30' },
    'Data Pipeline':  { bg: 'bg-blue-50 dark:bg-blue-500/15',     text: 'text-blue-600 dark:text-blue-400',   border: 'border-blue-200 dark:border-blue-500/30'   },
    'Webhook':        { bg: 'bg-green-50 dark:bg-green-500/15',    text: 'text-green-600 dark:text-green-400',  border: 'border-green-200 dark:border-green-500/30'  },
    'Notification':   { bg: 'bg-yellow-50 dark:bg-yellow-500/15', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-500/30' },
    'Custom':         { bg: 'bg-zinc-50 dark:bg-zinc-500/15',      text: 'text-zinc-600 dark:text-zinc-400',   border: 'border-zinc-200 dark:border-zinc-500/30'   },
};

// ─── N8n Logo SVG ─────────────────────────────────────────────────────────────

const N8nLogo = ({ size = 28 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="60" height="60" rx="12" fill="#EA4B35" />
        <text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle" fontSize="22" fontWeight="bold" fontFamily="monospace" fill="white">n8n</text>
    </svg>
);

// ─── N8n Workflow Card ────────────────────────────────────────────────────────

const N8nCard = ({ workflow }: { workflow: N8nWorkflow }) => {
    const [downloading, setDownloading] = useState(false);
    const colors = N8N_CATEGORY_COLORS[workflow.category] ?? N8N_CATEGORY_COLORS['Custom'];

    const handleDownload = async () => {
        if (!workflow.workflowJson || downloading) return;
        setDownloading(true);
        try {
            const blob = new Blob([workflow.workflowJson], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${workflow.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } finally {
            setTimeout(() => setDownloading(false), 800);
        }
    };

    return (
        <div className="relative group flex flex-col bg-white dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-900 hover:border-[#EA4B35]/60 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[0_12px_24px_rgba(234,75,53,0.08)] dark:hover:shadow-[0_12px_24px_rgba(234,75,53,0.15)] hover:-translate-y-1">
            {/* Top accent — n8n red */}
            <div className="h-[3px] bg-gradient-to-r from-[#EA4B35] to-[#ff7b5c] w-full shrink-0" />

            {/* Thumbnail or placeholder */}
            <div className="relative w-full h-[110px] bg-zinc-50 dark:bg-black/40 flex items-center justify-center overflow-hidden shrink-0">
                {workflow.thumbnail ? (
                    <img src={workflow.thumbnail} alt={workflow.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="flex flex-col items-center justify-center gap-2 w-full h-full bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 border border-zinc-100 dark:border-zinc-800/40 rounded-xl">
                        <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.04] bg-[radial-gradient(#EA4B35_1px,transparent_1px)] [background-size:16px_16px]" />
                        <N8nLogo size={32} />
                        <span className="text-[9px] tracking-widest font-mono font-bold text-[#EA4B35]/70 dark:text-[#EA4B35]/70 uppercase z-10">n8n Workflow</span>
                    </div>
                )}
                {/* Category pill */}
                <span className={`absolute top-2.5 right-2.5 text-[8px] font-black tracking-widest px-2 py-0.5 border ${colors.bg} ${colors.text} ${colors.border} uppercase font-mono`}>
                    {workflow.category}
                </span>
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 p-4 gap-3">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <N8nLogo size={14} />
                        <span className="text-[8px] font-bold text-[#EA4B35] tracking-widest uppercase font-mono">n8n Workflow</span>
                    </div>
                    <h3 className="text-sm font-black text-zinc-900 dark:text-white leading-snug line-clamp-2 uppercase tracking-tight group-hover:text-[#EA4B35] transition-colors">
                        {workflow.title}
                    </h3>
                    <p className="text-[11px] text-zinc-500 dark:text-gray-400 font-sans leading-relaxed mt-1.5 line-clamp-2">
                        {workflow.description}
                    </p>
                </div>

                {/* Tags */}
                {workflow.tags && workflow.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {workflow.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="text-[8px] px-1.5 py-0.5 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-600 font-mono uppercase tracking-wider bg-zinc-50/50 dark:bg-zinc-900/50">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Footer */}
                <div className="mt-auto flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-900/80">
                    {workflow.nodeCount != null && workflow.nodeCount > 0 && (
                        <div className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-400 dark:text-zinc-600 uppercase tracking-wider">
                            <Workflow size={10} className="text-[#EA4B35]/60" />
                            {workflow.nodeCount} nodes
                        </div>
                    )}
                    <button
                        onClick={handleDownload}
                        disabled={!workflow.workflowJson || downloading}
                        className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black tracking-widest uppercase font-mono transition-all cursor-pointer border ${
                            !workflow.workflowJson
                                ? 'border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-700 cursor-not-allowed'
                                : downloading
                                ? 'bg-[#EA4B35] border-[#EA4B35] text-white scale-95'
                                : 'border-[#EA4B35]/40 text-[#EA4B35] hover:bg-[#EA4B35] hover:text-white hover:border-[#EA4B35]'
                        }`}
                    >
                        <Download size={10} />
                        {downloading ? 'Saving…' : 'Download'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Folder Icon 3D Component ──────────────────────────────────────────────────

const FolderIcon = ({ isOpen, count }: { isOpen: boolean; count: number }) => (
    <div className="relative w-24 h-20 select-none flex items-center justify-center">
        {/* Perspective wrapper */}
        <div className="relative w-20 h-16 [perspective:300px] [transform-style:preserve-3d]">
            
            {/* Folder Tab (top-left back) */}
            <div className="absolute top-0 left-2 w-7 h-4 bg-amber-700 dark:bg-amber-800 rounded-t-md transform -translate-y-2" />

            {/* Folder Back Cover */}
            <div className="absolute inset-0 bg-amber-700 dark:bg-amber-800 rounded-lg shadow-md" />

            {/* Document sheet 1 (slides up when hovered or open) */}
            <div className={`absolute left-3 w-14 h-12 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded shadow-sm transition-all duration-500 ${
                isOpen 
                    ? '-translate-y-5 rotate-[-6deg] scale-105' 
                    : 'translate-y-[-4px] group-hover:-translate-y-3 group-hover:rotate-[-3deg]'
            } flex flex-col p-1.5 justify-between`}>
                <div className="space-y-0.5">
                    <div className="w-8 h-1 bg-zinc-300 dark:bg-zinc-650 rounded" />
                    <div className="w-10 h-0.5 bg-zinc-250 dark:bg-zinc-700 rounded" />
                    <div className="w-6 h-0.5 bg-zinc-250 dark:bg-zinc-700 rounded" />
                </div>
                <div className="w-3.5 h-3.5 rounded-full bg-red-400/20 self-end flex items-center justify-center">
                    <svg className="w-2 h-2 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
                </div>
            </div>

            {/* Document sheet 2 (offset, slides up slightly different) */}
            <div className={`absolute left-4 w-12 h-12 bg-[#EA4B35] rounded shadow transition-all duration-500 ${
                isOpen 
                    ? '-translate-y-6 rotate-[6deg] scale-105' 
                    : 'translate-y-[-2px] group-hover:-translate-y-4 group-hover:rotate-[3deg]'
            } flex items-center justify-center`}>
                <svg className="w-5 h-5 text-white animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            </div>

            {/* Folder Front Lid (rotates open in 3D) */}
            <div 
                className={`absolute inset-0 bg-gradient-to-tr from-yellow-500 to-yellow-400 dark:from-yellow-500 dark:to-yellow-400 rounded-lg origin-bottom transition-transform duration-500 [transform-style:preserve-3d] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] ${
                    isOpen 
                        ? '[transform:rotateX(-60deg)] opacity-90' 
                        : 'group-hover:[transform:rotateX(-25deg)]'
                }`}
                style={{ transformOrigin: 'bottom center' }}
            >
                {/* Visual front detailing */}
                <div className="absolute bottom-2 left-2 right-2 h-0.5 bg-yellow-600/30 rounded" />
                <div className="absolute top-2 left-3 w-4 h-1 bg-white/30 rounded-sm" />
            </div>
        </div>

        {/* Count badge */}
        <div className={`absolute -top-1 right-0.5 w-5 h-5 rounded-full bg-amber-600 dark:bg-[#FFDD00] text-white dark:text-black text-[9px] font-black flex items-center justify-center font-mono transition-all duration-300 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>
            {count}
        </div>
    </div>
);

// ─── Project Card ─────────────────────────────────────────────────────────────

const ProjectCard = ({ project, noHover }: { project: Project; noHover?: boolean }) => {
    const isColab =
        project.category === 'LLM Notebook' ||
        (project.liveUrl && project.liveUrl.includes('colab.research.google.com'));
    const hasCode = !!project.codeUrl?.trim() && project.codeUrl.trim() !== '#';
    const hasLive = isValidLiveUrl(project.liveUrl);

    return (
        <div className={`group flex flex-col h-[350px] bg-white dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-900 border-t-3 border-t-yellow-400 dark:border-t-yellow-300 rounded-2xl overflow-hidden shadow-lg ${noHover ? '' : 'hover:shadow-[0_0_30px_rgba(255,221,0,0.1)]'} transition-all duration-300`}>
            <div className="relative w-full h-40 flex items-center justify-center overflow-hidden bg-zinc-100 dark:bg-black/40">
                {/* Category Badge */}
                <div className="absolute top-3 right-3 z-20 transition-all duration-300 transform opacity-0 group-hover:opacity-100 translate-y-[-10px] group-hover:translate-y-0">
                    <span className="px-3 py-1 bg-yellow-400 dark:bg-yellow-300 text-black text-[10px] font-bold rounded-full shadow-lg uppercase tracking-widest border border-black/10">
                        {project.category}
                    </span>
                </div>

                {project.image ? (
                    <img
                        className={`p-1 rounded-xl object-contain w-full h-full transition-transform duration-500 ${noHover ? '' : 'group-hover:scale-105'}`}
                        src={project.image}
                        alt={project.title}
                    />
                ) : isColab ? (
                    <div className="w-full h-full bg-gradient-to-br from-zinc-100 via-zinc-50 to-zinc-200 dark:from-zinc-950 dark:via-zinc-900 dark:to-black flex flex-col items-center justify-center relative p-4">
                        <div className="absolute inset-0 opacity-10 dark:opacity-15 bg-[radial-gradient(#f9ab00_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                        <svg className="w-14 h-14 filter drop-shadow-[0_0_12px_rgba(249,171,0,0.2)] z-10" viewBox="0 0 48 48" fill="none">
                            <path d="M24 16C19.58 16 16 19.58 16 24C16 28.42 19.58 32 24 32C26.2 32 28.2 31.1 29.66 29.66L32.48 32.48C30.28 34.68 27.3 36 24 36C17.37 36 12 30.63 12 24C12 17.37 17.37 12 24 12C27.3 12 30.28 13.32 32.48 15.52L29.66 18.34C28.2 16.9 26.2 16 24 16Z" fill="#F9AB00" />
                            <path d="M24 32C28.42 32 32 28.42 32 24C32 19.58 28.42 16 24 16C21.8 16 19.8 16.9 18.34 18.34L15.52 15.52C17.72 13.32 20.7 12 24 12C30.63 12 36 17.37 36 24C36 30.63 30.63 36 24 36C20.7 36 17.72 34.68 15.52 32.48L18.34 29.66C19.8 31.1 21.8 32 24 32Z" fill="#E37400" />
                        </svg>
                        <span className="text-[9px] font-bold text-amber-600 dark:text-yellow-500 uppercase tracking-[0.25em] mt-3 z-10 font-mono">Google Colab Notebook</span>
                    </div>
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-950 dark:to-zinc-900 flex flex-col items-center justify-center p-4">
                        <svg className="w-10 h-10 text-zinc-400 dark:text-zinc-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-600 uppercase tracking-wider font-mono">Project</span>
                    </div>
                )}
            </div>

            <div className="flex flex-col flex-1 p-6 text-center">
                <h1 className={`text-xl font-bold text-zinc-900 dark:text-white transition-colors mb-3 line-clamp-1 ${noHover ? '' : 'group-hover:text-amber-600 dark:group-hover:text-yellow-300'}`} title={project.title}>
                    {project.title}
                </h1>
                <p className="text-sm text-zinc-600 dark:text-gray-400 font-mono line-clamp-3" title={project.description}>
                    {project.description}
                </p>
            </div>

            <div className="flex gap-4 p-6 pt-0 justify-center mt-auto">
                {hasCode ? (
                    <a href={project.codeUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-yellow-400 dark:hover:bg-yellow-300 text-zinc-700 dark:text-white hover:text-black dark:hover:text-black border border-zinc-200 dark:border-zinc-800 font-roboto text-[10px] sm:text-xs md:text-sm transition-colors duration-300 w-full justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 8 18v4" />
                        </svg>
                        CODE
                    </a>
                ) : (
                    <button disabled className="flex items-center gap-2 px-4 py-2 bg-zinc-100/50 dark:bg-zinc-800/30 text-zinc-400 border border-zinc-200/50 dark:border-zinc-800/10 font-roboto text-[10px] sm:text-xs md:text-sm cursor-not-allowed w-full justify-center opacity-40">
                        NO CODE
                    </button>
                )}

                {hasLive ? (
                    <a
                        href={requiresDirectOpen(project.liveUrl) ? project.liveUrl : getPreviewHref(project)}
                        target={requiresDirectOpen(project.liveUrl) ? '_blank' : undefined}
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-yellow-400 dark:hover:bg-yellow-300 text-zinc-700 dark:text-white hover:text-black dark:hover:text-black border border-zinc-200 dark:border-zinc-800 font-roboto text-[10px] sm:text-xs md:text-sm transition-colors duration-300 w-full justify-center"
                    >
                        <ExternalLink size={16} /> LIVE DEMO
                    </a>
                ) : hasCode ? (
                    <a href={`/testing?codeUrl=${encodeURIComponent(project.codeUrl!)}`}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-yellow-400 dark:hover:bg-yellow-300 text-zinc-700 dark:text-white hover:text-black dark:hover:text-black border border-zinc-200 dark:border-zinc-800 font-roboto text-[10px] sm:text-xs md:text-sm transition-colors duration-300 w-full justify-center">
                        <ExternalLink size={16} /> LIVE DEMO
                    </a>
                ) : (
                    <button disabled className="flex items-center gap-2 px-4 py-2 bg-zinc-100/50 dark:bg-zinc-800/30 text-zinc-400 border border-zinc-200/50 dark:border-zinc-800/10 font-roboto text-[10px] sm:text-xs md:text-sm cursor-not-allowed w-full justify-center opacity-40">
                        <ExternalLink size={16} /> NO DEMO
                    </button>
                )}
            </div>
        </div>
    );
};

// ─── Main Projects Component ──────────────────────────────────────────────────

function ProjectsList() {
    const [projects, setProjects] = useState<Project[]>(projectsData);
    const [workflows, setWorkflows] = useState<N8nWorkflow[]>([]);
    const [workflowsLoading, setWorkflowsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'notebooks'>('all');
    const [folderOpen, setFolderOpen] = useState(false);
    const [folderAnimating, setFolderAnimating] = useState(false);
    const folderRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Load projects from cache / API
        try {
            const cached = localStorage.getItem('portfolio_projects_cache');
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.length > 0) setProjects(parsed);
            }
        } catch {}

        fetch('/api/projects')
            .then((r) => r.json())
            .then((d) => {
                if (d.projects?.length > 0) {
                    setProjects(d.projects);
                    try { localStorage.setItem('portfolio_projects_cache', JSON.stringify(d.projects)); } catch {}
                }
            })
            .catch(() => {});

        // Load n8n workflows
        fetch('/api/workflows')
            .then((r) => r.json())
            .then((d) => { if (d.workflows) setWorkflows(d.workflows); })
            .catch(() => {})
            .finally(() => setWorkflowsLoading(false));
    }, []);

    const normalProjects = projects.filter((p) => p.category !== 'LLM Notebook');
    const notebookProjects = projects.filter((p) => p.category === 'LLM Notebook');

    const displayedProjects =
        filter === 'notebooks' ? notebookProjects : [...normalProjects, ...notebookProjects];

    // Use folder mode if there are > 5 projects OR if there are any workflows
    const useFolderMode = displayedProjects.length > 5 || workflows.length > 0;
    const visibleProjects = useFolderMode ? displayedProjects.slice(0, 5) : displayedProjects;
    const overflowProjects = useFolderMode ? displayedProjects.slice(5) : [];

    // Total inside folder = overflow projects + workflows
    const folderContentsCount = overflowProjects.length + workflows.length;

    const handleFolderClick = () => {
        if (folderAnimating) return;
        setFolderAnimating(true);
        const nextOpen = !folderOpen;
        setFolderOpen(nextOpen);
        setTimeout(() => {
            setFolderAnimating(false);
            if (nextOpen && folderRef.current) {
                folderRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 600);
    };

    return (
        <section id="section4" className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white px-6 md:px-10 pt-24 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 border-b border-zinc-200 dark:border-zinc-900 pb-6">
                <h1 className={`tracking-widest text-4xl font-roboto text-amber-600 dark:text-yellow-300 font-bold ${transition}`}>
                    PROJECTS
                </h1>
                <div className="relative z-20">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as 'all' | 'notebooks')}
                        className="bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white px-4 py-2.5 pr-9 rounded-lg text-xs font-mono font-bold tracking-wider uppercase outline-none focus:border-yellow-400/50 transition-all cursor-pointer appearance-none shadow-sm"
                    >
                        <option value="all">All Projects</option>
                        <option value="notebooks">LLM Notebooks Only</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 dark:text-zinc-500">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Main project grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                {visibleProjects.map((project) => (
                    <ProjectCard
                        key={project._id || project.id}
                        project={project}
                        noHover={useFolderMode}
                    />
                ))}

                {/* Folder Card — always shown when folderMode or workflows exist */}
                {(useFolderMode || workflows.length > 0) && (
                    <div
                        onClick={handleFolderClick}
                        className="group relative flex flex-col h-[350px] bg-white dark:bg-zinc-950/40 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl overflow-hidden cursor-pointer hover:border-yellow-400 dark:hover:border-yellow-300 hover:shadow-[0_0_30px_rgba(255,221,0,0.12)] transition-all duration-300 items-center justify-center gap-5"
                        title="Open folder to see more projects & n8n workflows"
                    >
                        {/* 3D folder icon */}
                        <div className={`transition-all duration-500 ${folderOpen ? 'scale-110' : 'group-hover:scale-105'}`} style={{ perspective: '400px' }}>
                            <FolderIcon isOpen={folderOpen} count={folderContentsCount} />
                        </div>

                        <div className="text-center px-6">
                            <h3 className={`text-lg font-black transition-colors ${folderOpen ? 'text-amber-600 dark:text-yellow-300' : 'text-zinc-700 dark:text-zinc-300 group-hover:text-amber-600 dark:group-hover:text-yellow-300'}`}>
                                {folderOpen ? 'Close Folder' : 'Open Folder'}
                            </h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-600 mt-1 font-mono">
                                {folderContentsCount} item{folderContentsCount !== 1 ? 's' : ''} inside
                                {workflows.length > 0 && ` · ${workflows.length} n8n workflow${workflows.length !== 1 ? 's' : ''}`}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Folder Contents Panel ── */}
            {folderOpen && (
                <div
                    ref={folderRef}
                    className="mt-8 animate-folder-open"
                >
                    {/* Folder panel header */}
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-900">
                        <FolderOpen size={20} className="text-amber-600 dark:text-yellow-300" />
                        <span className="text-sm font-black uppercase tracking-widest text-zinc-700 dark:text-zinc-300 font-mono">
                            Folder Contents
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-600 ml-auto">
                            {folderContentsCount} item{folderContentsCount !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {/* Overflow projects (> 5) */}
                    {overflowProjects.length > 0 && (
                        <div className="mb-10">
                            <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em] font-mono mb-4">
                                More Projects
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                                {overflowProjects.map((project) => (
                                    <ProjectCard key={project._id || project.id} project={project} noHover />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* n8n Workflows */}
                    {workflowsLoading ? (
                        <div className="flex justify-center py-16">
                            <div className="w-8 h-8 border-4 border-[#EA4B35]/20 border-t-[#EA4B35] rounded-full animate-spin" />
                        </div>
                    ) : workflows.length === 0 ? (
                        <div className="text-center py-14 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                            <N8nLogo size={36} />
                            <p className="text-sm text-zinc-500 dark:text-zinc-600 mt-4 font-mono">No n8n workflows uploaded yet.</p>
                            <p className="text-xs text-zinc-400 dark:text-zinc-700 mt-1">Add them via the admin panel.</p>
                        </div>
                    ) : (
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <N8nLogo size={18} />
                                <p className="text-[10px] font-bold text-[#EA4B35] uppercase tracking-[0.2em] font-mono">
                                    n8n Automation Workflows
                                </p>
                                <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-600 ml-1">
                                    — credentials stripped for safe download
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
                                {workflows.map((wf) => (
                                    <N8nCard key={wf._id} workflow={wf} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* CSS animations */}
            <style>{`
                @keyframes folderOpen {
                    from { opacity: 0; transform: translateY(-16px) scaleY(0.95); }
                    to   { opacity: 1; transform: translateY(0)     scaleY(1); }
                }
                .animate-folder-open {
                    animation: folderOpen 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    transform-origin: top center;
                }
            `}</style>
        </section>
    );
}

export const Projects = ProjectsList;
