
"use client"
import React from "react";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { aiTools, type AiTool } from "./data";


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
                    <Link
                        href="/#section6"
                        className="inline-block px-5 py-2 bg-yellow-400 text-black font-bold shadow hover:bg-yellow-500 transition-colors duration-150"
                    >
                        &larr; Go Back to Blog
                    </Link>
                </div>
            <div className="flex flex-col gap-10 px-4 md:px-20">
               
                <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-8 md:gap-0 h-auto md:h-60 py-10 md:py-20">
                    <div className="flex-1">
                        <h1 className="text-3xl md:text-4xl font-black text-yellow-400 tracking-widest mb-2">
                            AI TOOLS I&apos;VE EXPLORED
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
                            value={search || ''}
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
                                Can&apos;t find the AI tool you&apos;re looking for?
                            </div>
                            <div className="text-base text-gray-400 max-w-xl">
                                If you know an awesome AI tool that&apos;s not listed here, let Hemanth Atthuluri know! He&apos;ll check it out and add it for everyone to explore.
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
                            <Link href={`/aitoolspage/${item.slug}`} key={item.name} aria-label={`Read ${item.name} article`}>
                                <div className="flex flex-col justify-center gap-2 items-center text-center p-4 border-t-4 border-t-yellow-300 bg-zinc-900/80 px-6 md:px-10 rounded-lg transition-transform hover:scale-105 duration-200 min-h-[320px] shadow-lg">
                                    <Image src={item.logo} alt={item.name} width={74} height={74} className="rounded-full mb-2"/>
                                    <code className="text-xl md:text-2xl font-bold tracking-wide text-yellow-300 mb-1">{item.name}</code>
                                    <p className="bg-yellow-500 text-black p-1 px-2 rounded mb-1 text-xs md:text-sm">{item.category}</p>
                                    <p className="text-sm md:text-base text-gray-200">{item.description}</p>
                                    <span className="mt-3 text-xs font-bold tracking-[0.2em] text-yellow-300">READ ARTICLE</span>
                                </div>
                            </Link>
                        )
                    )}
                </div>
            </div>
        </div>
    )
}
