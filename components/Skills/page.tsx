'use client';

import { useState } from 'react';
import { 
    Globe, 
    Palette, 
    Atom, 
    Server, 
    TableProperties, 
    Database, 
    GitBranch, 
    Wand2, 
    Bot, 
    Layers, 
    Check, 
    LayoutGrid, 
    HardDrive, 
    Cpu, 
    Sparkles, 
    Box 
} from 'lucide-react';

export const transition = `relative w-fit after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-amber-600 dark:after:bg-yellow-400 after:transition-all after:duration-400 hover:after:w-full`;

type SkillItem = {
    id: string;
    name: string;
    level: 'EXPERT' | 'PRO' | 'ADVANCED';
    desc: string;
    icon: React.ReactNode;
};

type SkillCategory = {
    id: string;
    category: string;
    tagline: string;
    accentColor: string;
    badgeColor: string;
    icon: React.ReactNode;
    items: SkillItem[];
};

const skillCategories: SkillCategory[] = [
    {
        id: 'frontend',
        category: 'FRONT-END',
        tagline: 'Client-side UI & Web Architectures',
        accentColor: 'border-t-yellow-400 dark:border-t-yellow-300',
        badgeColor: 'bg-yellow-400/10 text-amber-600 dark:text-yellow-300 border-yellow-400/30',
        icon: <LayoutGrid size={20} className="text-amber-600 dark:text-yellow-300" />,
        items: [
            { id: 'fe-1', name: 'HTML, CSS, JS', level: 'EXPERT', desc: 'Semantic HTML5, Responsive CSS3 & ES6+ JavaScript', icon: <Globe size={18} className="text-amber-500" /> },
            { id: 'fe-2', name: 'TAILWIND', level: 'PRO', desc: 'Utility-First CSS, Design Systems & Glassmorphism', icon: <Palette size={18} className="text-cyan-400" /> },
            { id: 'fe-3', name: 'REACT', level: 'ADVANCED', desc: 'Component Architecture, Hooks & Next.js Ecosystem', icon: <Atom size={18} className="text-blue-400" /> },
        ],
    },
    {
        id: 'backend',
        category: 'BACK-END',
        tagline: 'Server Logic & Data Persistence',
        accentColor: 'border-t-amber-500 dark:border-t-amber-400',
        badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
        icon: <HardDrive size={20} className="text-amber-600 dark:text-amber-400" />,
        items: [
            { id: 'be-1', name: 'NODE JS', level: 'ADVANCED', desc: 'Asynchronous Event Loop, REST APIs & Express.js', icon: <Server size={18} className="text-emerald-400" /> },
            { id: 'be-2', name: 'SQL', level: 'PRO', desc: 'Relational Database Schema & Relational Queries', icon: <TableProperties size={18} className="text-indigo-400" /> },
            { id: 'be-3', name: 'MONGO DB', level: 'PRO', desc: 'NoSQL Document Store, Aggregation & Mongoose', icon: <Database size={18} className="text-teal-400" /> },
        ],
    },
    {
        id: 'tools-ai',
        category: 'TOOLS & AI',
        tagline: 'Workflow, GenAI & LLM Integration',
        accentColor: 'border-t-yellow-500 dark:border-t-yellow-400',
        badgeColor: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
        icon: <Cpu size={20} className="text-yellow-600 dark:text-yellow-400" />,
        items: [
            { id: 'ai-1', name: 'GITHUB', level: 'EXPERT', desc: 'Version Control, Collaborative Workflows & CI/CD', icon: <GitBranch size={18} className="text-purple-400" /> },
            { id: 'ai-2', name: 'GEN AI', level: 'ADVANCED', desc: 'Prompt Engineering, RAG Systems & Autonomous Agents', icon: <Wand2 size={18} className="text-amber-300" /> },
            { id: 'ai-3', name: 'LLMs', level: 'PRO', desc: 'Hugging Face, OpenAI APIs & Intelligent Assistants', icon: <Bot size={18} className="text-yellow-400" /> },
        ],
    },
];

export const Skills = () => {
    // Interactive Stack State: All items selected by default
    const allSkillIds = skillCategories.flatMap((c) => c.items.map((i) => i.id));
    const [selectedSkills, setSelectedSkills] = useState<string[]>(allSkillIds);

    const toggleSkill = (id: string) => {
        setSelectedSkills((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const isAllSelected = selectedSkills.length === allSkillIds.length;

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedSkills([]);
        } else {
            setSelectedSkills(allSkillIds);
        }
    };

    return (
        <section id="section3" className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white px-6 md:px-10 pt-24 pb-16 font-mono">
            <div className="mx-auto max-w-7xl">
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12 border-b border-zinc-200 dark:border-zinc-900 pb-6">
                    <div>
                        <h1 className={`tracking-widest text-3xl md:text-4xl font-roboto text-amber-600 dark:text-yellow-300 font-bold uppercase ${transition}`}>
                            SKILLS & TECH TOOLKIT
                        </h1>
                        <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 mt-2 font-mono">
                            Developer Technical Competencies & Mastered Technologies
                        </p>
                    </div>

                    {/* Tech Toolkit Summary Badge */}
                    <div className="flex items-center gap-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 pl-4 rounded-xl shadow-sm">
                        <div className="relative">
                            <Layers size={18} className="text-amber-600 dark:text-yellow-300" />
                            <span className="absolute -top-1.5 -right-2 bg-yellow-400 text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                                {selectedSkills.length}
                            </span>
                        </div>
                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                            {selectedSkills.length} / {allSkillIds.length} Skills Active
                        </span>
                        <button
                            onClick={toggleSelectAll}
                            className="text-[10px] uppercase font-bold text-black rounded-tr-lg rounded-br-lg bg-[#FFDF20] p-2 ml-2 cursor-pointer"
                        >
                            {isAllSelected ? 'Clear All' : 'Select All'}
                        </button>
                    </div>
                </div>

                {/* 3 Tech Stack Category Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {skillCategories.map((category) => {
                        const categoryItemsCount = category.items.filter((i) => selectedSkills.includes(i.id)).length;

                        return (
                            <div
                                key={category.id}
                                className={`flex flex-col bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-900 border-t-4 ${category.accentColor} rounded-2xl overflow-hidden shadow-lg hover:shadow-[0_0_30px_rgba(255,221,0,0.08)] transition-all duration-300 group`}
                            >
                                {/* Category Header */}
                                <div className="p-6 bg-zinc-50/80 dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                            {category.icon}
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-black tracking-wider uppercase text-zinc-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-yellow-300 transition-colors font-roboto">
                                                {category.category}
                                            </h2>
                                            <p className="text-[11px] text-zinc-500 dark:text-zinc-500 font-sans leading-tight mt-0.5">
                                                {category.tagline}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${category.badgeColor} uppercase tracking-wider font-mono shrink-0`}>
                                        {categoryItemsCount} Skill{categoryItemsCount !== 1 ? 's' : ''}
                                    </span>
                                </div>

                                {/* Skill Items List */}
                                <div className="p-6 flex-1 flex flex-col gap-4">
                                    {category.items.map((skill) => {
                                        const isSelected = selectedSkills.includes(skill.id);

                                        return (
                                            <div
                                                key={skill.id}
                                                onClick={() => toggleSkill(skill.id)}
                                                className={`group/item relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 cursor-pointer select-none ${
                                                    isSelected
                                                        ? 'bg-zinc-50/90 dark:bg-zinc-900/60 border-yellow-400/60 dark:border-yellow-300/40 shadow-sm'
                                                        : 'bg-zinc-100/40 dark:bg-zinc-950/30 border-zinc-200/60 dark:border-zinc-900/60 opacity-60 hover:opacity-100'
                                                }`}
                                            >
                                                {/* Checkbox / Status Pill */}
                                                <button
                                                    type="button"
                                                    aria-label={`Toggle ${skill.name}`}
                                                    className={`mt-0.5 w-5 h-5 rounded-d flex items-center justify-center border transition-all shrink-0 ${
                                                        isSelected
                                                            ? 'bg-yellow-400 dark:bg-yellow-300 border-yellow-400 dark:border-yellow-300 text-black shadow-sm'
                                                            : 'border-zinc-300 dark:border-zinc-700 bg-transparent text-transparent'
                                                    }`}
                                                >
                                                    <Check size={12} strokeWidth={3} />
                                                </button>

                                                {/* Skill Details */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2 mb-1">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="p-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0 shadow-sm">
                                                                {skill.icon}
                                                            </div>
                                                            <h3 className={`text-sm font-bold tracking-wider font-mono transition-colors ${
                                                                isSelected 
                                                                    ? 'text-zinc-900 dark:text-white group-hover/item:text-amber-600 dark:group-hover/item:text-yellow-300' 
                                                                    : 'text-zinc-500 dark:text-zinc-500'
                                                            }`}>
                                                                {skill.name}
                                                            </h3>
                                                        </div>
                                                        <span className={`text-[9px] font-black tracking-widest px-2 py-0.5 rounded border uppercase ${
                                                            skill.level === 'EXPERT'
                                                                ? 'bg-yellow-400/15 text-amber-600 dark:text-yellow-300 border-yellow-400/30'
                                                                : skill.level === 'PRO'
                                                                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                                                                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                                        }`}>
                                                            {skill.level}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-sans leading-relaxed">
                                                        {skill.desc}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Category Card Footer */}
                                <div className="p-4 bg-zinc-100/50 dark:bg-black/40 border-t border-zinc-200/80 dark:border-zinc-900 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-500">
                                    <span className="flex items-center gap-1.5 font-mono">
                                        <Sparkles size={12} className="text-amber-600 dark:text-yellow-300" />
                                        Production Ready
                                    </span>
                                    <span className="font-mono text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-600">
                                        {categoryItemsCount} of {category.items.length} Active
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom Tech Toolkit Summary Bar */}
                <div className="mt-12 p-6 bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-900 border-b-4 border-b-yellow-400 dark:border-b-yellow-300 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-400 dark:bg-yellow-300 text-black rounded-xl font-bold shadow-md">
                            <Box size={22} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-zinc-900 dark:text-white font-roboto tracking-wide uppercase">
                                Technical Skillset Summary
                            </h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans mt-0.5">
                                Core developer competencies across Modern Front-End, Scalable Back-End & Artificial Intelligence.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                        <div className="text-right font-mono hidden sm:block">
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">Proficiency Status</span>
                            <span className="text-sm font-bold text-amber-600 dark:text-yellow-300">100% Full-Stack Competent</span>
                        </div>
                        <button
                            onClick={() => {
                                const selectedNames = skillCategories
                                    .flatMap((c) => c.items)
                                    .filter((i) => selectedSkills.includes(i.id))
                                    .map((i) => i.name)
                                    .join(', ');
                                navigator.clipboard.writeText(`Developer Skillset: ${selectedNames}`);
                                alert(`Copied Skillset to Clipboard!\n\n${selectedNames}`);
                            }}
                            className="px-5 py-3 bg-yellow-400 dark:bg-yellow-300 hover:bg-yellow-500 dark:hover:bg-yellow-400 text-black font-mono text-xs font-black tracking-widest uppercase rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-2"
                        >
                            <Box size={14} />
                            Copy Skillset
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};