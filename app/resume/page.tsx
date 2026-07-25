import Link from "next/link";

const RESUME_URL = "/resume/resume_new.pdf#toolbar=0&navpanes=0&scrollbar=0&view=FitH";

export default function ResumePage() {
  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white sm:px-6 md:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="text-xs font-bold tracking-widest text-zinc-400 hover:text-yellow-300 transition-colors"
          >
            BACK TO PORTFOLIO
          </Link>

          <a
            href={RESUME_URL}
            download
            className="bg-yellow-300 px-4 py-2 text-xs font-black tracking-widest text-black hover:bg-yellow-400 transition-colors"
          >
            DOWNLOAD RESUME
          </a>
        </div>

        <div className="h-[calc(100vh-110px)] overflow-hidden">
    <iframe
        src={RESUME_URL}
        className="h-full w-full border-0"
    />
</div>

      </div>
    </main>
  );
}