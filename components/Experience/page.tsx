'use client'
import { transition } from "../Skills/page"
import { useState, useEffect } from "react"
import { Eye, EyeClosedIcon, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react"
import Image from "next/image"

type ExperienceItem = {
    title: string
    img: string
}

const defaultExperiences: ExperienceItem[] = [
    {
        title: "Teaching English as a Foreign Language (TEFL) Essentials",
        img: "https://res.cloudinary.com/dqtlqvhw5/image/upload/v1749008635/09dcdb1b-fa4e-4be9-a278-d60c53b448bb_uhw2lf.png"
    },
    {
        title: "Breaking into IoT Workshop – Certificate of Participation",
        img: "https://res.cloudinary.com/dqtlqvhw5/image/upload/v1749008643/80d599e9-4c2e-431e-923f-d12c12b9b872_srwint.png"
    },
    {
        title: "Tech meets Green: Revolutionizing Agriculture & Dairy – Certificate of Participation",
        img: "https://res.cloudinary.com/dqtlqvhw5/image/upload/v1749008651/b8c03bde-daed-4070-bd35-50dd3c82fdca_s8fjmr.png"
    },
    {
        title: "Drone Club – Certificate of Participation",
        img: "https://res.cloudinary.com/dqtlqvhw5/image/upload/v1749008657/9b988d61-ca03-4d9d-ab0d-50816b892068_ys1m8p.png"
    },
    {
        title: "Swarm Integration Workshop Participation",
        img: "https://res.cloudinary.com/dqtlqvhw5/image/upload/v1749008665/57d59a68-d802-41b8-b165-b6c0044c8901_yddgrf.png"
    },
    {
        title: "Swarm Integration of Drones – Achievement Certificate",
        img: "https://res.cloudinary.com/dqtlqvhw5/image/upload/v1749008671/97442ef7-7bb3-47f5-bd43-1f7c20f2242c_rapojl.png"
    },
    {
        title: "Neo4j",
        img: "https://res.cloudinary.com/dqtlqvhw5/image/upload/v1763050891/download_ld5qq8.jpg"
    },
    {
        title: "Deloitte",
        img: "https://res.cloudinary.com/dqtlqvhw5/image/upload/v1763050907/download_pjhm4a.png"
    },
    {
        title: "Base44 Hackthon",
        img: "https://res.cloudinary.com/dqtlqvhw5/image/upload/v1766465957/Base44-Hackthon-HNG83QSUJT_z1svhc.png"
    },
    {
        title: "Sports Event Contribution – NIAT Hexaverse 2.0",
        img: "https://res.cloudinary.com/dqtlqvhw5/image/upload/q_auto/f_auto/v1776495220/1774324572940.pdf_v2lv8b.png"
    }
]

export const Experience = () => {
    const [experiences, setExperiences] = useState<ExperienceItem[]>(defaultExperiences)
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
    const [modalAutoplay, setModalAutoplay] = useState(false)

    useEffect(() => {
        // 1. Try to load from localStorage first for instant display
        try {
            const cached = localStorage.getItem('portfolio_certificates_cache')
            if (cached) {
                const parsed = JSON.parse(cached)
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setExperiences(parsed)
                }
            }
        } catch (e) {
            console.warn("Failed to load cached certificates:", e)
        }

        // 2. Fetch fresh certificates in the background
        const fetchCertificates = async () => {
            try {
                const res = await fetch('/api/certificates')
                if (res.ok) {
                    const data = await res.json()
                    if (data.certificates && data.certificates.length > 0) {
                        setExperiences(data.certificates)
                        localStorage.setItem('portfolio_certificates_cache', JSON.stringify(data.certificates))
                    }
                }
            } catch (e) {
                console.error("Failed to fetch fresh certificates:", e)
            }
        }

        fetchCertificates()
    }, [])

    const prevCertificate = () => {
        if (selectedIndex !== null) {
            setSelectedIndex((prev) => (prev === 0 ? experiences.length - 1 : (prev ?? 0) - 1))
        }
    }

    const nextCertificate = () => {
        if (selectedIndex !== null) {
            setSelectedIndex((prev) => (prev === experiences.length - 1 ? 0 : (prev ?? 0) + 1))
        }
    }

    // Modal Autoplay cycle
    useEffect(() => {
        if (selectedIndex === null || !modalAutoplay) return

        const interval = setInterval(() => {
            nextCertificate()
        }, 2000)

        return () => clearInterval(interval)
    }, [selectedIndex, modalAutoplay])

    // Keyboard navigation in modal (Left/Right/Esc)
    useEffect(() => {
        if (selectedIndex === null) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") prevCertificate()
            if (e.key === "ArrowRight") nextCertificate()
            if (e.key === "Escape") setSelectedIndex(null)
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [selectedIndex])

    return (
        <section className="min-h-screen bg-black text-white px-6 md:px-10 py-24 font-mono">
            <div className="mx-auto">
                <div className="mb-20">
                    <h2 className={`text-yellow-400 text-sm md:text-4xl tracking-wide font-bold flex items-center gap-4 uppercase font-roboto ${transition}`}>
                        Certifications & Achievements
                    </h2>
                </div>

                {/* Original Static 4-Column Grid */}
                <div className="grid md:grid-cols-4 gap-5">
                    {experiences.map((item, index) => (
                        <div 
                            key={item.title} 
                            onClick={() => setSelectedIndex(index)}
                            className="group relative overflow-hidden rounded-md cursor-pointer"
                        >
                            {/* The Certificate Image */}
                            <div className="group relative overflow-hidden rounded-md">
                                <Image
                                    src={item.img}
                                    alt={item.title}
                                    width={400}
                                    height={280}
                                    className="h-full w-full object-cover border-t-6 border-yellow-300 rounded-md transition-all duration-500 ease-out group-hover:scale-110 group-hover:-translate-y-2 group-hover:shadow-[0_20px_50px_rgba(253,224,71,0.5)]"
                                />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setSelectedIndex(index)
                                    }}
                                    className="absolute top-2 right-2 z-30 flex items-center justify-center rounded-full bg-black/60 p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-150 cursor-pointer hover:text-yellow-300"
                                >
                                    <Eye />
                                </button>
                            </div>

                            {/* Hover Overlay with Title */}
                            <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center p-6 text-center border-t-6 border-transparent">
                                <p className="text-yellow-300 text-sm md:text-base font-bold tracking-widest uppercase transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 font-roboto">
                                    {item.title}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modal View with Slide Controls & Autoplay */}
                {selectedIndex !== null && (
                    <div 
                        onClick={() => setSelectedIndex(null)}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
                    >
                        <div 
                            onClick={(e) => e.stopPropagation()}
                            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col justify-between items-center rounded-3xl border-b-5 border-yellow-300 bg-zinc-950 p-6 md:p-8 shadow-2xl"
                        >
                            {/* Autoplay Play/Pause Toggle */}
                            <div className="absolute left-4 top-4 z-40">
                                <button
                                    onClick={() => setModalAutoplay(!modalAutoplay)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-black/80 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-full text-[10px] font-mono transition-all cursor-pointer shadow-md"
                                >
                                    {modalAutoplay ? (
                                        <>
                                            <Pause size={10} className="text-yellow-400 fill-yellow-400 animate-pulse" />
                                            <span>AUTOPLAY ON</span>
                                        </>
                                    ) : (
                                        <>
                                            <Play size={10} />
                                            <span>AUTOPLAY OFF</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Close Modal Button */}
                            <button
                                onClick={() => setSelectedIndex(null)}
                                className="absolute right-4 top-4 z-40 rounded-full bg-black/80 px-3.5 py-2 text-xs text-white transition hover:text-yellow-300 cursor-pointer border border-zinc-800"
                            >
                                <EyeClosedIcon size={14} />
                            </button>

                            {/* Carousel Navigation Arrows */}
                            <button
                                onClick={(e) => { e.stopPropagation(); prevCertificate(); }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 z-40 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-black/75 border border-zinc-800 hover:border-yellow-300 hover:text-yellow-300 text-white cursor-pointer active:scale-95 transition-all shadow-lg"
                                aria-label="Previous Certificate"
                            >
                                <ChevronLeft size={20} />
                            </button>

                            <button
                                onClick={(e) => { e.stopPropagation(); nextCertificate(); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 z-40 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-black/75 border border-zinc-800 hover:border-yellow-300 hover:text-yellow-300 text-white cursor-pointer active:scale-95 transition-all shadow-lg"
                                aria-label="Next Certificate"
                            >
                                <ChevronRight size={20} />
                            </button>

                            {/* Selected Certificate Image */}
                            <div className="w-full flex items-center justify-center p-4">
                                <Image
                                    src={experiences[selectedIndex].img}
                                    alt={experiences[selectedIndex].title}
                                    width={1200}
                                    height={800}
                                    className="max-h-[65vh] w-full object-contain p-1"
                                />
                            </div>

                            {/* Title & Counter */}
                            <div className="w-full text-center mt-4 border-t border-zinc-900 pt-4 flex flex-col md:flex-row justify-between items-center gap-2">
                                <span className="text-yellow-300 text-xs font-roboto font-bold tracking-wide uppercase text-left max-w-[85%] truncate" title={experiences[selectedIndex].title}>
                                    {experiences[selectedIndex].title}
                                </span>
                                <span className="text-zinc-500 text-xs font-mono shrink-0">
                                    {selectedIndex + 1} / {experiences.length}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}
