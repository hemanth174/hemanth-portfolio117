'use client'
import { transition } from "../Skills/page"
import { useState } from "react"
import { Eye, EyeClosedIcon } from "lucide-react"
import Image from "next/image"
type ExperienceItem = {
    title: string
    img: string
}

const experiences: ExperienceItem[] = [
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
    const [selectedItem, setSelectedItem] = useState<ExperienceItem | null>(null)

    return (
        <section className="min-h-screen bg-black text-white px-6 md:px-10 py-24 font-mono">
            <div className=" mx-auto">
                <div className="mb-20">
                    <h2 className={`text-yellow-400 text-sm md:text-4xl tracking-wide font-bold flex items-center gap-4 uppercase font-roboto ${transition}`}>
                        Certifications & Achievements
                    </h2>
                </div>

                <div className="grid  md:grid-cols-4 gap-5">
                    {experiences.map((item) => (
                        <div key={item.title} className="group relative overflow-hidden rounded-md">
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
                                    onClick={() => setSelectedItem(item)}
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

                {selectedItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
                        <div className="relative max-w-6xl w-full max-h-[90vh] overflow-hidden rounded-3xl border-b-5  border-yellow-300 bg-black">
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="absolute right-4 top-4 z-40 rounded-full bg-black/70 px-3 py-2 text-sm text-white transition hover:text-yellow-300"
                            >
                                <EyeClosedIcon />
                            </button>
                            <Image
                                src={selectedItem.img}
                                alt={selectedItem.title}
                                width={1200}
                                height={800}
                                className="h-full w-full object-contain"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-4 text-center text-sm text-yellow-300">
                                {selectedItem.title}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}
