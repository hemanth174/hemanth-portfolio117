'use client'
import { transition } from "../Skills/page"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

const blogs = [
    {
        date: "MAY 2026",
        title: "Building HOAS: Revolutionizing Hostel Accountability",
        description: "A deep dive into how we built a full-stack platform to bridge the gap between students and management.",
        link: "/blog/hoas"
    },
    {
        date: "APR 2026",
        title: "Do You Want to Know More About AI Tools?",
        description: "Exploring the best AI tools for developers, from LLMs to website builders and hosting platforms.",
        link: "/aitoolspage"
    },
    {
        date: "MAR 2026",
        title: "The Vision Behind SyllabiQ: Tracking Academic Success",
        description: "Why I built an exam syllabus tracker and how it helps students stay on top of their studies.",
        link: "/blog/syllabiq"
    },
    {
        date: "FEB 2026",
        title: "AI Study Companions: Lessons from LLM Development",
        description: "What I learned while building and deploying an AI-powered student assistant on Hugging Face.",
        link: "/blog/llm-assistant"
    }
]

export const Blog = () => {
    return (
        <section id="section6" className="min-h-screen bg-black text-white px-6 md:px-10 py-24 font-mono">
            <div className="mx-auto">
                <div className="mb-20">
                    <h2 className={`text-yellow-400 text-sm md:text-4xl tracking-widest font-bold flex items-center gap-4 uppercase font-roboto ${transition}`}>
                        BLOG
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                    {blogs.map((blog, index) => (
                        <Link href={blog.link} key={index} aria-label={`Read ${blog.title}`}>
                            <div
                                className="group relative bg-zinc-900/30 p-10 rounded-2xl border border-zinc-800/50 hover:border-yellow-400 transition-all duration-500 cursor-pointer overflow-hidden shadow-2xl h-full flex flex-col"
                            >
                                <div className="absolute -inset-1 bg-yellow-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl" />

                                <div className="relative z-10 flex flex-col h-full">
                                    <p className="text-zinc-500 text-xs md:text-sm font-bold tracking-[0.3em] mb-6 uppercase transition-colors group-hover:text-yellow-400/60">
                                        {blog.date}
                                    </p>

                                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 leading-[1.2] tracking-tight group-hover:text-yellow-50 transition-colors">
                                        {blog.title}
                                    </h3>

                                    <p className="text-zinc-400 text-sm md:text-base mb-10 line-clamp-3 font-sans">
                                        {blog.description}
                                    </p>

                                    <div className="mt-auto flex items-center gap-3 text-yellow-500 font-bold text-xs md:text-sm tracking-[0.2em] group-hover:gap-6 transition-all duration-300">
                                        READ <ArrowRight size={20} className="transform group-hover:translate-x-2 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
