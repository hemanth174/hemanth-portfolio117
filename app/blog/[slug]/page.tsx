"use client"
import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getBlogPost } from "../data";
import { ArrowLeft, Calendar, Tag, Share2 } from "lucide-react";

export default function BlogPostPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const post = getBlogPost(slug);

    if (!post) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-4xl font-bold text-yellow-400 mb-4">Post Not Found</h1>
                <p className="text-gray-400 mb-8">The blog post you are looking for doesn&apos;t exist or has been moved.</p>
                <Link href="/#section6" className="px-6 py-3 bg-yellow-400 text-black font-bold rounded-sm hover:bg-yellow-500 transition-colors">
                    Back to Blog
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-yellow-400 selection:text-black font-mono">
            {/* Navigation Header */}
            <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 py-4">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <button 
                        onClick={() => router.push('/#section6')}
                        className="flex items-center gap-2 text-zinc-400 hover:text-yellow-400 transition-colors text-sm font-bold uppercase tracking-widest"
                    >
                        <ArrowLeft size={18} /> Back to Blog
                    </button>
                    <div className="flex gap-4">
                        <button className="text-zinc-500 hover:text-white transition-colors">
                            <Share2 size={18} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-16 md:py-24">
                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-6 mb-8 text-[10px] md:text-xs font-bold tracking-[0.2em] text-yellow-400/80 uppercase">
                    <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        {post.date}
                    </div>
                    <div className="flex items-center gap-2">
                        <Tag size={14} />
                        {post.category}
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-[1.1] tracking-tight">
                    {post.title}
                </h1>

                {/* Introduction / Description */}
                <p className="text-xl md:text-2xl text-zinc-400 mb-16 font-sans italic leading-relaxed border-l-4 border-yellow-400 pl-6">
                    {post.description}
                </p>

                {/* Content Sections */}
                <div className="space-y-10">
                    {post.content.map((paragraph, index) => (
                        <p key={index} className="text-lg md:text-xl text-zinc-300 leading-relaxed font-sans">
                            {paragraph}
                        </p>
                    ))}
                </div>

                {/* Footer Section */}
                <footer className="mt-24 pt-12 border-t border-white/10">
                    <div className="bg-zinc-900/50 p-8 md:p-12 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center gap-8 justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">Liked this post?</h2>
                            <p className="text-zinc-500 font-sans">Explore more projects and tools on my portfolio.</p>
                        </div>
                        <div className="flex gap-4 w-full md:w-auto">
                             <Link href="/" className="flex-1 md:flex-none text-center px-8 py-3 bg-white text-black font-bold hover:bg-yellow-400 transition-colors rounded-sm">
                                HOME
                             </Link>
                             <Link href="/#section7" className="flex-1 md:flex-none text-center px-8 py-3 border border-white/20 text-white font-bold hover:border-white transition-colors rounded-sm">
                                CONTACT
                             </Link>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}
