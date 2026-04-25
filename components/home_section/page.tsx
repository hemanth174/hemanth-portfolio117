'use client'
import { useRouter } from "next/navigation"
import { transition } from "../Skills/page"
export const HomeSection = () => {
    const router = useRouter();

    return (
        <>
            <div className="main-container">
                <header className="fixed z-50 flex flex-col md:flex-row justify-between items-center min-h-20 w-full bg-white/[0.03] backdrop-blur-xl text-white px-2 sm:px-6 py-4 md:py-2 border-b border-gray-500">
                    <a
                        href="#section1"
                        aria-label="Hemanth Atthuluri home"
                        className="group mb-3 md:mb-0 inline-flex h-12 w-12 items-center overflow-hidden rounded-full border border-yellow-300/70 bg-yellow-300 text-black shadow-[0_0_24px_rgba(250,204,21,0.18)] transition-[width,box-shadow] duration-500 ease-out hover:w-64 hover:shadow-[0_0_34px_rgba(250,204,21,0.28)] focus-visible:w-64 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-200"
                    >
                        <span className="grid h-12 min-w-12 place-items-center text-xl font-black tracking-tight">
                            HA
                        </span>
                        <span className="whitespace-nowrap pr-3 font-mono text-lg font-bold tracking-wide opacity-0 transition-opacity duration-300 group-hover:opacity-100">
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

                <section className="flex flex-col justify-center items-start px-6 md:px-10 h-screen bg-black gap-4 md:gap-5 pt-28 md:pt-0 pb-0">
                    <p className="text-sm md:text-2xl tracking-widest text-yellow-400 font-mono"><span className="tracking-widest">BSc.</span> UNDERGRADUATE · UPSKILLING AT NIAT</p>
                    <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold text-white font-mono tracking-tight overflow-hidden">HEMANTH</h1>
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-gray-600 leading-tight">SOLVING PROBLEMS.</h1>
                    <p className="text-gray-500 w-full md:w-100 font-mono text-sm md:text-base">C++ · Python · React · Node.js — turning ideas into working software.</p>
                    <div className="flex flex-col sm:flex-row gap-4 md:gap-10 font-mono w-full sm:w-auto mt-4">
                        <button onClick={() => { router.push('/#section2') }} className="p-3 px-6 bg-yellow-300 text-black hover:bg-yellow-400 transition-colors rounded-sm cursor-pointer w-full sm:w-auto font-bold tracking-wider">
                            VIEW WORK
                        </button>
                        <button onClick={() => { router.push('/#section7') }} className="p-3 px-6 border border-gray-600 text-gray-400 hover:text-white hover:border-white transition-colors rounded-sm w-full sm:w-auto tracking-wider">
                            CONTACT
                        </button>
                    </div>
                </section>
            </div>
        </>
    )
}
