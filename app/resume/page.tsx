import Link from 'next/link'

const ENHANCV_RESUME_URL =
    'https://app.enhancv.com/share/05b040a2/?utm_medium=growth&utm_campaign=share-resume&utm_source=dynamic'

export default function ResumePage() {
    return (
        <main className="min-h-screen bg-black px-4 py-6 text-white sm:px-6 md:px-10">
            <div className="mx-auto flex max-w-6xl flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link
                        href="/"
                        className="text-xs font-bold tracking-widest text-zinc-400 transition-colors hover:text-yellow-300"
                    >
                        ← BACK TO PORTFOLIO
                    </Link>
                    <a
                        href={ENHANCV_RESUME_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-yellow-300 px-4 py-2 text-xs font-black tracking-widest text-black transition-colors hover:bg-yellow-400"
                    >
                        DOWNLOAD RESUME
                    </a>
                </div>
                <div className="h-[calc(100vh-110px)] min-h-[620px] overflow-hidden rounded-xl border border-zinc-800 bg-white shadow-2xl">
                    <iframe
                        src={ENHANCV_RESUME_URL}
                        title="Hemanth Atthuluri resume"
                        className="h-full w-full border-0"
                    />
                </div>
            </div>
        </main>
    )
}
