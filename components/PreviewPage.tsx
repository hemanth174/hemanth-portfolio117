'use client';

import { useEffect, useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

const isValidLiveUrl = (value?: string) => {
  if (!value || !value.trim() || value.trim() === '#') {
    return false;
  }

  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export default function PreviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const url = searchParams.get('url') ?? '';
  const title = searchParams.get('title') ?? 'Project Preview';
  const [iframeError, setIframeError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const validUrl = useMemo(() => isValidLiveUrl(url), [url]);
  const codeUrl = searchParams.get('codeUrl') ?? '';
  const fallbackPath = codeUrl ? `/testing?codeUrl=${encodeURIComponent(codeUrl)}` : '/testing';

  useEffect(() => {
    if (!validUrl) {
      router.replace(fallbackPath);
    }
  }, [fallbackPath, router, validUrl]);

  if (!validUrl) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950/95 px-4 py-4 backdrop-blur-md md:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-yellow-300">Preview</p>
            <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">{title}</h1>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white transition hover:border-yellow-300 hover:text-yellow-300"
            >
              Back to Projects
            </button>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-4 py-3 text-sm font-semibold text-black transition hover:bg-yellow-300"
            >
              Open in New Tab
            </a>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-10">
        {iframeError ? (
          <div className="rounded-3xl border border-red-500 bg-zinc-900/90 p-8 text-center shadow-xl">
            <p className="text-lg font-semibold text-red-300">Unable to load preview.</p>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              The target site may refuse embedding or the URL is invalid.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-yellow-300"
              >
                Open in New Tab
              </a>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="rounded-2xl border border-zinc-700 bg-transparent px-5 py-3 text-sm text-white transition hover:border-yellow-300 hover:text-yellow-300"
              >
                Back to Projects
              </button>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/90 shadow-xl">
            <iframe
              src={url}
              title={title}
              className="min-h-[70vh] w-full border-0 bg-black"
              onLoad={() => setLoaded(true)}
              onError={() => setIframeError(true)}
            />
          </div>
        )}
      </main>
    </div>
  );
}
