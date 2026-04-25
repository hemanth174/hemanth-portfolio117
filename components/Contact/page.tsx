'use client'
import { transition } from "../Skills/page"

export const Contact = () => {
    return (
        <section id="section7" className="min-h-screen bg-black text-white px-6 md:px-10 py-24 font-mono">
            <div className="mx-auto">
                <div className="mb-16">
                    <h2 className={`text-yellow-400 text-sm md:text-4xl tracking-widest font-bold flex items-center gap-4 uppercase font-roboto ${transition}`}>
                        CONTACT
                    </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-start">
                    {/* Left Column: Socials */}
                    <div className="flex flex-col gap-10">
                        <h1 className="text-4xl md:text-7xl font-bold leading-tight tracking-tight uppercase">
                            Let&apos;s build <br /> something <span className="text-yellow-400">great.</span>
                        </h1>

                        <div className="flex flex-wrap gap-4 mt-8">
                            <a 
                                href="https://github.com/hemanth174" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="hover:bg-yellow-300 px-8 py-3 text-white hover:text-black  border-2 border-yellow-400 transition-all tracking-[0.2em] font-bold text-sm hover:rounded-lg"
                            >
                                GITHUB
                            </a>
                            <a 
                                href="https://www.linkedin.com/in/hemanth-atthuluri/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="hover:bg-yellow-300 px-8 py-3 text-white hover:text-black  border-2 border-yellow-400 transition-all tracking-[0.2em] font-bold text-sm hover:rounded-lg"
                            >
                                LINKEDIN
                            </a>
                            <a 
                                href="mailto:ramasaiahemanth@gmail.com" 
                                className="hover:bg-yellow-300 px-8 py-3 text-white hover:text-black  border-2 border-yellow-400 transition-all tracking-[0.2em] font-bold text-sm hover:rounded-lg"
                            >
                                EMAIL
                            </a>
                        </div>
                    </div>

                    {/* Right Column: Form */}
                    <div className="bg-zinc-900/20 p-8 md:p-12 rounded-2xl border border-zinc-900 shadow-2xl">
                        <form className="flex flex-col gap-8" onSubmit={(e) => e.preventDefault()}>
                            <div className="flex flex-col gap-2 group">
                                <label className="text-zinc-600 text-xs font-bold tracking-widest group-focus-within:text-yellow-400 transition-colors">NAME</label>
                                <input 
                                    type="text" 
                                    placeholder="Your Name"
                                    className="bg-transparent border-b border-zinc-800 py-3 focus:border-yellow-400 outline-none transition-all text-white placeholder:text-zinc-700" 
                                />
                            </div>

                            <div className="flex flex-col gap-2 group">
                                <label className="text-zinc-600 text-xs font-bold tracking-widest group-focus-within:text-yellow-400 transition-colors">EMAIL</label>
                                <input 
                                    type="email" 
                                    placeholder="Your Email"
                                    className="bg-transparent border-b border-zinc-800 py-3 focus:border-yellow-400 outline-none transition-all text-white placeholder:text-zinc-700" 
                                />
                            </div>

                            <div className="flex flex-col gap-2 group">
                                <label className="text-zinc-600 text-xs font-bold tracking-widest group-focus-within:text-yellow-400 transition-colors">MESSAGE</label>
                                <textarea 
                                    rows={4}
                                    placeholder="Tell me about your project..."
                                    className="bg-transparent border-b border-zinc-800 py-3 focus:border-yellow-400 outline-none transition-all text-white placeholder:text-zinc-700 resize-none" 
                                />
                            </div>

                            <button 
                                className="w-full bg-yellow-300 text-black font-bold py-5 tracking-[0.3em] hover:bg-yellow-400 transition-all transform hover:-translate-y-1 shadow-lg shadow-yellow-400/10 mt-4 uppercase"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    )
}
