'use client'
import { useEffect, useState, useSyncExternalStore } from "react"
import { transition } from "../Skills/page"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"

let isHydrated = false
const hydrationListeners = new Set<() => void>()

function subscribeToHydration(listener: () => void) {
    hydrationListeners.add(listener)
    return () => hydrationListeners.delete(listener)
}

function getHydrationSnapshot() {
    return isHydrated
}

function getServerHydrationSnapshot() {
    return false
}

function markHydrated() {
    if (isHydrated) {
        return
    }

    isHydrated = true
    hydrationListeners.forEach((listener) => listener())
}

export const HomeSection = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const { theme, setTheme } = useTheme();
    const hydrated = useSyncExternalStore(subscribeToHydration, getHydrationSnapshot, getServerHydrationSnapshot);
    const isDarkTheme = hydrated ? theme === 'dark' : true;

    useEffect(() => {
        markHydrated();
        const handleScroll = () => {
            if (window.scrollY > 80) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <div className="main-container">
                <header className="fixed z-50 flex flex-col md:flex-row justify-between items-center min-h-20 w-full bg-zinc-50/70 dark:bg-black/60 backdrop-blur-xl text-zinc-900 dark:text-white px-3 sm:px-6 py-4 md:py-2 border-b border-zinc-200 dark:border-zinc-900">
                    <a
                        href="#section1"
                        aria-label="Hemanth Atthuluri home"
                        className={`group mb-3 md:mb-0 inline-flex h-12 items-center overflow-hidden rounded-full border border-yellow-400 dark:border-yellow-300/70 bg-yellow-400 dark:bg-yellow-300 text-black transition-[width,box-shadow] duration-500 ease-out ${
                            isScrolled 
                                ? 'w-[220px] shadow-[0_0_34px_rgba(250,204,21,0.28)]' 
                                : 'w-12 hover:w-[220px] shadow-[0_0_24px_rgba(250,204,21,0.18)] hover:shadow-[0_0_34px_rgba(250,204,21,0.28)]'
                        } focus-visible:w-[220px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-200`}
                    >
                        <span className="grid h-12 min-w-12 place-items-center text-xl font-black tracking-tight">
                            HA
                        </span>
                        <span className={`whitespace-nowrap pr-3 font-mono text-lg font-bold tracking-wide transition-opacity duration-300 ${
                            isScrolled 
                                ? 'opacity-100' 
                                : 'opacity-0 group-hover:opacity-100'
                        }`}>
                            Hemanth Atthuluri
                        </span>
                    </a>
                    
                    <div className="relative flex w-full md:w-auto items-center gap-4 sm:gap-6 mt-3 md:mt-0">
                        <div className="flex min-w-0 flex-1 flex-wrap justify-center gap-x-3 gap-y-2 pr-10 sm:gap-x-4 md:gap-5 md:pr-0 tracking-widest text-zinc-500 dark:text-gray-400 text-[10px] sm:text-xs md:text-sm font-semibold">
                            <a href="#section2"> <p className={`${transition} hover:text-zinc-900 dark:hover:text-white`}>ABOUT</p></a>
                            <a href="#section3"> <p className={`${transition} hover:text-zinc-900 dark:hover:text-white`}>SKILLS</p> </a>
                            <a href="#section4"> <p className={`${transition} hover:text-zinc-900 dark:hover:text-white`}>PROJECTS</p> </a>
                            <a href="#section5"> <p className={`${transition} hover:text-zinc-900 dark:hover:text-white`}>EXPERIENCE</p> </a>
                            <a href="#section6"> <p className={`${transition} hover:text-zinc-900 dark:hover:text-white`}>CERTIFICATION</p> </a>
                            <a href="#section7"> <p className={`${transition} hover:text-zinc-900 dark:hover:text-white`}>EVENTS</p> </a>
                            <a href="#section8"><p className={`${transition} hover:text-zinc-900 dark:hover:text-white`}>CONTACT</p></a>
                        </div>
                        
                        {/* Premium Theme Toggle Button */}
                        <button
                            onClick={() => setTheme(isDarkTheme ? 'light' : 'dark')}
                            aria-label={hydrated ? (isDarkTheme ? 'Switch to light mode' : 'Switch to dark mode') : 'Switch theme'}
                            className="absolute right-0 top-1/2 flex h-8 w-8 shrink-0 -translate-y-1/2 items-center justify-center border border-white bg-zinc-100 dark:bg-zinc-900/50 hover:border-yellow-400 dark:hover:border-yellow-400 hover:text-yellow-500 dark:hover:text-yellow-400 transition-all cursor-pointer text-zinc-500 dark:text-zinc-400 active:scale-95 shadow-sm md:static md:translate-y-0"
                            title={hydrated ? (isDarkTheme ? 'Switch to Light Mode' : 'Switch to Dark Mode') : 'Switch Theme'}
                        >
                            {hydrated && (isDarkTheme ? <Sun size={14} /> : <Moon size={14} />)}
                        </button>
                    </div>
                </header>

                <section className="relative flex flex-col justify-center items-start px-6 md:px-10 h-screen bg-zinc-50 dark:bg-black gap-4 md:gap-5 pt-28 md:pt-0 pb-0 overflow-hidden">
                    {/* Background Decoration */}
                    <div className="absolute right-[-0%] top-1/3 -translate-y-1/2 text-[20rem] md:text-[20rem] font-mono tracking-widest font-black text-zinc-900/[0.20] dark:text-white/[0.20] select-none pointer-events-none hidden lg:block">
                        &lt;/&gt;
                    </div>

                    <p className="text-sm md:text-2xl tracking-widest text-amber-600 dark:text-yellow-400 font-mono"><span className="tracking-widest">B.Sc.</span> UNDERGRADUATE · UPSKILLING AT NIAT</p>
                    <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold text-zinc-900 dark:text-white font-mono tracking-tight overflow-hidden z-10">HEMANTH</h1>
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-zinc-400 dark:text-gray-600 leading-tight z-10">SOLVING PROBLEMS.</h1>
                    <p className="text-zinc-500 dark:text-gray-500 w-full md:w-100 font-mono text-sm md:text-base z-10">C++ · Python · React · Node.js — turning ideas into working software.</p>
                    <div className="flex flex-col sm:flex-row gap-4 md:gap-10 font-mono w-full sm:w-auto mt-4 z-10">
                        <button 
                            onClick={() => {
                                document.getElementById('section4')?.scrollIntoView({ behavior: 'smooth' });
                            }} 
                            className="p-3 px-6 bg-yellow-400 dark:bg-yellow-300 text-black hover:bg-yellow-500 dark:hover:bg-yellow-400 transition-colors cursor-pointer w-full sm:w-auto font-bold tracking-wider shadow-md"
                        >
                            VIEW WORK
                        </button>
                        <button 
                            onClick={() => {
                                document.getElementById('section8')?.scrollIntoView({ behavior: 'smooth' });
                            }} 
                            className="p-3 px-6 border border-zinc-300 dark:border-zinc-800 text-zinc-500 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-500 dark:hover:border-white transition-colors w-full sm:w-auto tracking-wider cursor-pointer font-bold"
                        >
                            CONTACT
                        </button>
                    </div>
                </section>
            </div>
        </>
    )
}
