'use client';

import { ExternalLink } from 'lucide-react';
import { transition } from '../Skills/page';

import projectImg1 from '@/app/Logo_main.png';
import projectImg2 from '@/app/Img2.png';
import projectImg3 from '@/app/Img3.png';

const projectsData = [
    {
        id: 1,
        title: 'SyllabiQ — Exam Syllabus Tracker',
        description:
            'A full-stack web app that helps students track their syllabus topics, monitor subject-wise progress, and count down to exam day — all in one dashboard.',
        image: projectImg1.src,
        codeUrl: 'https://github.com/hemanth174/SyllbuIQ.git',
        liveUrl: '#',
    },
    {
        id: 2,
        title: 'HOAS — Hostel Operational Accountability System',
        description:
            'A full-stack web platform that streamlines hostel operations by enabling complaint tracking, role-based management, and real-time accountability between students, wardens, and management.',
        image: projectImg2.src,
        codeUrl: 'https://github.com/niatapppurpose-APPs/HOAS.git',
        liveUrl: 'https://hoas-client-4n13.vercel.app/',
    },
    {
        id: 3,
        title: 'LLM Student Assistant — AI Study Companion',
        description:
            'LLM-based student assistant deployed on Hugging Face Spaces that delivers real-time answers, explanations, and learning support using natural language interaction.',
        image: projectImg3.src,
        codeUrl: 'https://huggingface.co/spaces/Hemanth789/LLM_student_assisstant/tree/main',
        liveUrl: 'https://huggingface.co/spaces/Hemanth789/LLM_student_assisstant',
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

const requiresDirectOpen = (liveUrl?: string) => {
    if (!liveUrl) {
        return false;
    }

    try {
        const url = new URL(liveUrl.trim());
        return url.hostname === 'huggingface.co' || url.hostname === 'www.huggingface.co';
    } catch {
        return false;
    }
};

function ProjectsList() {
    return (
        <section id="section4" className="min-h-screen bg-black px-6 md:px-10 pt-24 pb-10">
            <h1 className={`tracking-widest text-4xl font-roboto text-yellow-300 font-bold ${transition}`}>PROJECTS</h1>
            <div className="felx items-center grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 mt-10">
                {projectsData.map((project) => (
                    <div
                        key={project.id}
                        className="group flex flex-col h-[350px] bg-zinc-750 border-t-3 border-yellow-300 rounded-2xl overflow-hidden shadow-lg hover:shadow-[0_0_30px_rgba(255,221,0,0.15)] transition-all duration-300"
                    >
                        <div className="w-full h-40 flex items-center justify-center overflow-hidden bg-black/40">
                            {project.image ? (
                                <img
                                    className="p-1 rounded-xl object-contain w-full h-full group-hover:scale-105 transition-transform duration-500"
                                    src={project.image}
                                    alt={project.title}
                                />
                            ) : (
                                <span className="text-gray-600 font-mono">No Image</span>
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
                            {isValidLiveUrl(project.liveUrl) ? (
                                <a
                                    href={requiresDirectOpen(project.liveUrl)
                                        ? project.liveUrl
                                        : `${handleLiveLinks(project.liveUrl)}&title=${encodeURIComponent(project.title)}`}
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-yellow-400 hover:text-black text-white font-roboto text-[10px] sm:text-xs md:text-sm transition-colors duration-300 w-full justify-center"
                                >
                                    <ExternalLink size={16} /> LIVE DEMO
                                </a>
                            ) : (
                                <a
                                    href={`/testing?codeUrl=${encodeURIComponent(project.codeUrl)}`}
                                    className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-yellow-400 hover:text-black text-white font-roboto text-[10px] sm:text-xs md:text-sm transition-colors duration-300 w-full justify-center"
                                >
                                    <ExternalLink size={16} /> LIVE DEMO
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export const Projects = ProjectsList;
