'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { trackResumeAction } from '@/lib/tracker';

const RESUME_URL = '/resume/resume_new.pdf#toolbar=0&navpanes=0&scrollbar=0&view=FitH';

export default function ResumePage() {
  useEffect(() => {
    trackResumeAction('view');
  }, []);

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black px-4 py-6 text-zinc-900 dark:text-white sm:px-6 md:px-10 transition-colors">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="text-xs font-bold tracking-widest text-zinc-500 hover:text-amber-600 dark:text-zinc-400 dark:hover:text-yellow-300 transition-colors uppercase font-mono"
          >
            ← BACK TO PORTFOLIO
          </Link>

          <a
            href={RESUME_URL}
            download
            onClick={() => trackResumeAction('download')}
            className="bg-yellow-400 dark:bg-yellow-300 px-5 py-2.5 text-xs font-black tracking-widest text-black hover:bg-yellow-500 dark:hover:bg-yellow-400 transition-all uppercase font-mono shadow-md"
          >
            DOWNLOAD RESUME
          </a>
        </div>

        <div className="h-[calc(100vh-110px)] overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl bg-white dark:bg-zinc-950">
          <iframe
            src={RESUME_URL}
            title="Resume Preview"
            className="h-full w-full border-0"
          />
        </div>
      </div>
    </main>
  );
}