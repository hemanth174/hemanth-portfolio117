'use client';

import { ExternalLink } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function TestingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const codeUrl = searchParams.get('codeUrl') ?? 'https://github.com/hemanth174/SyllbuIQ.git';

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 py-10 md:px-10">
      <div className="mx-auto max-w-3xl rounded-3xl border border-zinc-800 bg-zinc-900/90 p-10 text-center shadow-xl">
        <p className="text-sm uppercase tracking-[0.35em] text-yellow-300">Under development</p>
        <h1 className="mt-6 text-3xl font-semibold text-white">This project is under development</h1>
        <p className="mt-4 text-sm leading-7 text-zinc-400">
          This project is not ready for a live preview yet. You can still check the source code.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <a
            href={codeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-yellow-300"
          >
            <ExternalLink size={16} /> View GitHub Code
          </a>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-700 bg-transparent px-5 py-3 text-sm text-white transition hover:border-yellow-300 hover:text-yellow-300"
          >
            Back to Projects
          </button>
        </div>
      </div>
    </div>
  );
}
