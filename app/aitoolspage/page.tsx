
"use client"
import React from "react";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
type AiTool = {
    name: string;
    category: string;
    description: string;
    logo: string;
    link: string;
};

const aiTools: AiTool[] = [
    // Text to Text
    { name: "ChatGPT", category: "Text to Text", description: "AI chatbot by OpenAI for writing, coding and problem solving.", logo: "https://www.google.com/s2/favicons?domain=openai.com&sz=128", link: "https://chat.openai.com" },
    { name: "Claude", category: "Text to Text", description: "AI assistant by Anthropic focused on safety and helpfulness.", logo: "https://www.google.com/s2/favicons?domain=anthropic.com&sz=128", link: "https://claude.ai" },
    { name: "Gemini", category: "Text to Text", description: "Google's multimodal AI assistant for text, images and code.", logo: "https://www.google.com/s2/favicons?domain=gemini.google.com&sz=128", link: "https://gemini.google.com" },

    // Text to Speech
    { name: "Murf AI", category: "Text to Speech", description: "AI voice generator with 120+ realistic studio-quality voices.", logo: "https://www.google.com/s2/favicons?domain=murf.ai&sz=128", link: "https://murf.ai" },
    { name: "ElevenLabs", category: "Text to Speech", description: "AI voice cloning and text to speech with emotional control.", logo: "https://www.google.com/s2/favicons?domain=elevenlabs.io&sz=128", link: "https://elevenlabs.io" },
    { name: "Whisper Flow", category: "Text to Speech", description: "AI-powered real time speech transcription and voice tool.", logo: "https://www.google.com/s2/favicons?domain=whisperflow.app&sz=128", link: "https://whisperflow.app" },

    // AI Website Builders
    { name: "Lovable", category: "AI Website Builder", description: "Build full stack web apps from a simple text prompt.", logo: "https://www.google.com/s2/favicons?domain=lovable.dev&sz=128", link: "https://lovable.dev" },
    { name: "V0", category: "AI Website Builder", description: "Vercel's AI tool to generate UI components instantly.", logo: "https://www.google.com/s2/favicons?domain=v0.dev&sz=128", link: "https://v0.dev" },
    { name: "Replit", category: "AI Website Builder", description: "AI-powered browser IDE for building and deploying apps.", logo: "https://www.google.com/s2/favicons?domain=replit.com&sz=128", link: "https://replit.com" },
    { name: "GitHub Copilot", category: "AI Website Builder", description: "AI pair programmer that suggests code right in your editor.", logo: "https://www.google.com/s2/favicons?domain=github.com&sz=128", link: "https://github.com/features/copilot" },
    { name: "Cursor", category: "AI Website Builder", description: "AI-first code editor built for pair programming with AI.", logo: "https://www.google.com/s2/favicons?domain=cursor.com&sz=128", link: "https://cursor.com" },
    { name: "POPAI", category: "AI Website Builder", description: "AI tool for generating presentations and documents fast.", logo: "https://www.google.com/s2/favicons?domain=popai.pro&sz=128", link: "https://popai.pro" },
    { name: "Base44", category: "AI Website Builder", description: "Build and deploy full stack apps using just plain English.", logo: "https://www.google.com/s2/favicons?domain=base44.com&sz=128", link: "https://base44.com" },
    { name: "SoftGen", category: "AI Website Builder", description: "AI software generator that builds apps from descriptions.", logo: "https://www.google.com/s2/favicons?domain=softgen.ai&sz=128", link: "https://softgen.ai" },
    { name: "BlackBox AI", category: "AI Website Builder", description: "AI coding assistant for code generation and debugging.", logo: "https://www.google.com/s2/favicons?domain=blackbox.ai&sz=128", link: "https://blackbox.ai" },

    // Hosting Platforms
    { name: "Vercel", category: "Hosting", description: "Frontend cloud platform for deploying web apps instantly.", logo: "https://www.google.com/s2/favicons?domain=vercel.com&sz=128", link: "https://vercel.com" },
    { name: "Netlify", category: "Hosting", description: "Platform for deploying and hosting modern web projects.", logo: "https://www.google.com/s2/favicons?domain=netlify.com&sz=128", link: "https://netlify.com" },
    { name: "Render", category: "Hosting", description: "Cloud platform to deploy web apps, APIs and databases.", logo: "https://www.google.com/s2/favicons?domain=render.com&sz=128", link: "https://render.com" },
    { name: "GoDaddy", category: "Hosting", description: "Domain registration and web hosting platform.", logo: "https://www.google.com/s2/favicons?domain=godaddy.com&sz=128", link: "https://godaddy.com" },
]


export default function AIToolsPage(): React.JSX.Element {
    const categories: string[] = ["All", "Text to Text", "Text to Speech", "AI Website Builder", "Hosting"];
    const [search, setSearch] = useState<string>("");
    const [activeCategory, setActiveCategory] = useState<string>("All");
    // Filter tools by category and search
    const filteredTools: AiTool[] = aiTools.filter((tool: AiTool) => {
        const matchesCategory = activeCategory === "All" || tool.category === activeCategory;
        const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase()) ||
            tool.description.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="bg-black text-white min-h-screen">
         {/* Go Back to Blog Button */}
                <div className="pt-8 pb-2 px-10">
                    <a
                        href={"https://hemanth-portfolio117.vercel.app/#section6"}
                        className="inline-block px-5 py-2 bg-yellow-400 text-black font-bold shadow hover:bg-yellow-500 transition-colors duration-150"
                        rel="noopener noreferrer"
                    >
                        &larr; Go Back to Blog
                    </a>
                </div>
            <div className="flex flex-col gap-10 px-4 md:px-20">
               
                <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-8 md:gap-0 h-auto md:h-60 py-10 md:py-20">
                    <div className="flex-1">
                        <h1 className="text-3xl md:text-4xl font-black text-yellow-400 tracking-widest mb-2">
                            AI TOOLS I'VE EXPLORED
                        </h1>
                        <p className="text-gray-400 text-sm tracking-wider mb-6 md:mb-10">
                            A curated list of AI tools I personally used and tested.
                        </p>
                        {/* Category Filter Buttons */}
                        <div className="flex gap-2 mt-2 md:mt-4 flex-wrap">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    className={`px-4 py-1 border-2 border-yellow-400 font-bold transition-colors duration-150 ${activeCategory === cat ? "bg-yellow-400 text-black" : "bg-black"}`}
                                    onClick={() => setActiveCategory(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center w-full md:w-80 mt-4 md:mt-0">
                        <input
                            type="search"
                            className="border border-2 border-yellow-300 h-10 w-full font-mono px-3 bg-black text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder-yellow-300"
                            placeholder="Search tools..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-10 w-full p-2 md:px-8 md:py-5 overflow-y-auto"
                    style={{
                        maxHeight: 'calc(100vh - 320px)', // Adjust based on header/filter height
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#facc15 #27272a',
                    }}
                >
                    {filteredTools.length === 0 ? (
                        <div className="col-span-3 flex flex-col items-center justify-center gap-4 text-center text-gray-300 py-10">
                            <div className="text-lg font-semibold text-yellow-300">
                                Can't find the AI tool you're looking for?
                            </div>
                            <div className="text-base text-gray-400 max-w-xl">
                                If you know an awesome AI tool that's not listed here, let Hemanth Atthuluri know! He'll check it out and add it for everyone to explore.
                            </div>
                            <a
                                href={`mailto:hemanth.atthuluri@gmail.com?subject=Suggest%20AI%20Tool:%20${encodeURIComponent(search)}&body=Hi%20Hemanth%2C%0A%0AI%20searched%20for%20the%20AI%20tool%20%22${encodeURIComponent(search)}%22%20on%20your%20site%20but%20couldn't%20find%20it.%20Please%20consider%20exploring%20and%20adding%20it!%0A%0AThanks!`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <button className="mt-2 px-6 py-2 bg-yellow-400 text-black font-bold rounded-full shadow hover:bg-yellow-500 transition-colors duration-150">
                                    Share Tool Name
                                </button>
                            </a>
                        </div>
                    ) : (
                        filteredTools.map((item: AiTool) =>
                            <Link href={item.link} target="_blank" key={item.name}>
                                <div className="flex flex-col justify-center gap-2 items-center text-center p-4 border-t-4 border-t-yellow-300 bg-zinc-900/80 px-6 md:px-10 rounded-lg transition-transform hover:scale-105 duration-200 min-h-[320px] shadow-lg">
                                    <Image src={item.logo} alt={item.name} width={74} height={74} className="rounded-full mb-2"/>
                                    <code className="text-xl md:text-2xl font-bold tracking-wide text-yellow-300 mb-1">{item.name}</code>
                                    <p className="bg-yellow-500 text-black p-1 px-2 rounded mb-1 text-xs md:text-sm">{item.category}</p>
                                    <p className="text-sm md:text-base text-gray-200">{item.description}</p>
                                </div>
                            </Link>
                        )
                    )}
                </div>
            </div>
        </div>
    )
}