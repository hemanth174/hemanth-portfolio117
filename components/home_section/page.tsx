'use client'
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { transition } from "../Skills/page"
export const HomeSection = () => {
    const router = useRouter();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
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
            <div className="main-container ">
                <header className="fixed z-50 flex flex-col md:flex-row justify-between items-center min-h-20 w-full bg-white/[0.03] backdrop-blur-xl text-white px-2 sm:px-6 py-4 md:py-2 border-b border-gray-500">
                    <a
                        href="#section1"
                        aria-label="Hemanth Atthuluri home"
                        className={`group mb-3 md:mb-0 inline-flex h-12 items-center overflow-hidden rounded-full border border-yellow-300/70 bg-yellow-300 text-black transition-[width,box-shadow] duration-500 ease-out ${
                            isScrolled 
                                ? 'w-64 shadow-[0_0_34px_rgba(250,204,21,0.28)]' 
                                : 'w-12 hover:w-64 shadow-[0_0_24px_rgba(250,204,21,0.18)] hover:shadow-[0_0_34px_rgba(250,204,21,0.28)]'
                        } focus-visible:w-64 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-200`}
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
                    <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-5 tracking-widest text-gray-400 text-[10px] sm:text-xs md:text-sm font-semibold">
                        <a href="#section2"> <p className={transition}>ABOUT</p></a>
                        <a href="#section3"> <p className={transition} >SKILLS</p> </a>
                        <a href="#section4"> <p className={transition} >PROJECTS</p> </a>
                        <a href="#section5"> <p className={transition} >CERTIFICATION</p> </a>
                        <a href="#section6"> <p className={transition}>BLOG</p></a>
                        <a href="#section7"><p className={transition}>CONTACT</p></a>
                    </div>
                </header>

                <section className="relative flex flex-col justify-center items-start px-6 md:px-10 h-screen bg-black gap-4 md:gap-5 pt-28 md:pt-0 pb-0 overflow-hidden">
                    {/* Background Decoration */}
                    <div className="absolute right-[-0%] top-1/3 -translate-y-1/2 text-[20rem] md:text-[20rem] font-mono tracking-widest font-black text-white/[0.06] select-none pointer-events-none hidden lg:block">
                        &lt;/&gt;
                    </div>

                    <p className="text-sm md:text-2xl tracking-widest text-yellow-400 font-mono"><span className="tracking-widest">B.Sc.</span> UNDERGRADUATE · UPSKILLING AT NIAT</p>
                    <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold text-white font-mono tracking-tight overflow-hidden z-10">HEMANTH</h1>
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-gray-600 leading-tight z-10">SOLVING PROBLEMS.</h1>
                    <p className="text-gray-500 w-full md:w-100 font-mono text-sm md:text-base z-10">C++ · Python · React · Node.js — turning ideas into working software.</p>
                    <div className="flex flex-col sm:flex-row gap-4 md:gap-10 font-mono w-full sm:w-auto mt-4 z-10">
                        <button 
                            onClick={() => {
                                document.getElementById('section4')?.scrollIntoView({ behavior: 'smooth' });
                            }} 
                            className="p-3 px-6 bg-yellow-300 text-black hover:bg-yellow-400 transition-colors cursor-pointer w-full sm:w-auto font-bold tracking-wider"
                        >
                            VIEW WORK
                        </button>
                        <button 
                            onClick={() => {
                                document.getElementById('section7')?.scrollIntoView({ behavior: 'smooth' });
                            }} 
                            className="p-3 px-6 border border-gray-600 text-gray-400 hover:text-white hover:border-white transition-colors  w-full sm:w-auto tracking-wider cursor-pointer font-bold"
                        >
                            CONTACT
                        </button>
                    </div>
                </section>
            </div>
        </>
    )
}
