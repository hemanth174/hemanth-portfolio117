'use client'
import { transition } from "../Skills/page"
import { LucideHandshake, FileText } from "lucide-react"
import Image from "next/image"

export const About = () => {
    return (
        <section className="min-h-screen flex flex-col justify-center bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white font-roboto pt-20 px-6 md:px-10 pb-10">
            <div className="pb-10 pt-10 md:pt-0">
                <h1 className={`tracking-widest text-3xl md:text-4xl font-roboto text-amber-600 dark:text-yellow-300 font-bold ${transition}`}>ABOUT ME</h1>
            </div>
            <div className="font-mono flex flex-col xl:flex-row items-center justify-center gap-10 xl:gap-16 w-full">
                <div className="flex items-end p-2 md:p-5 w-full xl:w-auto justify-center">
                    <Image
                        className="block h-64 md:h-100 object-cover rounded-l-sm border border-zinc-200 dark:border-zinc-900"
                        src="https://res.cloudinary.com/dqtlqvhw5/image/upload/v1781927873/Hemnath_img_yshhlo.png"
                        alt="hemanth-photo"
                        width={400}
                        height={400}
                        priority
                    />
                    <a
                        href="/resume"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Open resume"
                        className="flex flex-col items-center justify-center gap-2 md:gap-3 bg-yellow-400 dark:bg-yellow-300 text-black py-2 px-1 md:py-3 md:px-2 rounded-r-sm shadow-lg cursor-pointer hover:bg-yellow-500 dark:hover:bg-yellow-400 transition-colors h-64 md:h-30 md:rounded-none"
                    >
                        <span className="[writing-mode:vertical-lr] rotate-180 font-bold text-sm">RESUME</span>
                        <FileText className="rotate-270" size={20} />
                    </a>
                </div>
                <div className="flex flex-col justify-around items-center gap-6 md:gap-8 w-full xl:w-auto px-4 md:px-0">
                    <div className="w-full md:w-[80vw] xl:w-[50vw]">
                        <p className="text-xl sm:text-2xl md:text-3xl text-center leading-relaxed">Student at <span className="text-amber-600 dark:text-yellow-400 font-bold">NIAT</span>, building full-stack products and experimenting with AI focused on creating things that people actually need.</p>
                    </div>
                    <div className="p-2 pt-2 md:pt-4 flex flex-wrap justify-center gap-3 md:gap-5 w-full">
                        <span className="border border-zinc-200 dark:border-zinc-800 p-2 px-4 bg-zinc-100 dark:bg-zinc-900/60 hover:bg-zinc-200 dark:hover:bg-zinc-800/80 transition-colors text-amber-600 dark:text-yellow-450 md:text-zinc-700 md:dark:text-zinc-300 rounded-sm font-bold md:font-normal text-sm md:text-base">NIAT</span>
                        <span className="border border-zinc-200 dark:border-zinc-800 p-2 px-4 bg-zinc-100 dark:bg-zinc-900/60 hover:bg-zinc-200 dark:hover:bg-zinc-800/80 transition-colors text-amber-600 dark:text-yellow-450 md:text-zinc-700 md:dark:text-zinc-300 rounded-sm font-bold md:font-normal text-sm md:text-base">HYDERABAD</span>
                        <span className="border border-zinc-200 dark:border-zinc-800 p-2 px-4 bg-zinc-100 dark:bg-zinc-900/60 hover:bg-zinc-200 dark:hover:bg-zinc-800/80 transition-colors text-amber-600 dark:text-yellow-450 md:text-zinc-700 md:dark:text-zinc-300 rounded-sm font-bold md:font-normal text-sm md:text-base">2024</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center w-full mt-2 max-w-xs sm:max-w-none">
                        <a href="https://www.linkedin.com/in/hemanth-atthuluri/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer w-full sm:w-auto justify-center text-xs md:text-sm font-bold font-mono text-white">
                            <LucideHandshake size={18} className="shrink-0" />
                            <span>Connect Via <span className="font-bold text-yellow-500 dark:text-yellow-350 tracking-wider">LINKEDIN</span></span>
                        </a>
                        <a href="https://github.com/hemanth174" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer w-full sm:w-auto justify-center text-xs md:text-sm font-bold font-mono text-white">
                            <LucideHandshake size={18} className="shrink-0" />
                            <span>Connect Via <span className="font-bold text-yellow-250 dark:text-yellow-500 tracking-wider">GITHUB</span></span>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    )
}
