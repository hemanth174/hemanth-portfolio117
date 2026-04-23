'use client';

import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Bot, ArrowLeft, Maximize2, Sparkles, AlertCircle } from 'lucide-react';
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

interface PreviewPageProps {
  geminiConfigured: boolean;
}

export default function PreviewPage({ geminiConfigured }: PreviewPageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const url = searchParams.get('url') ?? '';
  const title = searchParams.get('title') ?? 'Project Preview';
  const description = searchParams.get('description') ?? '';
  const [iframeError, setIframeError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const validUrl = useMemo(() => isValidLiveUrl(url), [url]);
  const codeUrl = searchParams.get('codeUrl') ?? '';
  const fallbackPath = codeUrl ? `/testing?codeUrl=${encodeURIComponent(codeUrl)}` : '/testing';
  
  const assistantUrl = useMemo(() => {
    const params = new URLSearchParams({
      title,
      liveUrl: url,
      codeUrl,
    });

    if (description) {
      params.set('description', description);
    }

    return `/api/ai-preview?${params.toString()}`;
  }, [codeUrl, description, title, url]);

  useEffect(() => {
    if (!validUrl) {
      router.replace(fallbackPath);
    }
  }, [fallbackPath, router, validUrl]);

  if (!validUrl) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 selection:bg-yellow-400 selection:text-black">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-yellow-500/5 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      <header className="sticky top-0 z-30 border-b border-white/5 bg-black/60 px-4 py-4 backdrop-blur-xl md:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 transition-all hover:border-yellow-400/50 hover:bg-yellow-400/10 hover:text-yellow-400"
              title="Go Back"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-yellow-400">
                <span className="h-1 w-1 rounded-full bg-yellow-400 animate-pulse" />
                Live Preview
              </p>
              <h1 className="mt-0.5 text-xl font-bold tracking-tight text-white md:text-2xl">{title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400 px-5 py-2.5 text-sm font-bold text-black transition-all hover:bg-yellow-300 hover:shadow-[0_0_20px_rgba(250,204,21,0.3)]"
            >
              Visit Site <ExternalLink size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-[1600px] px-4 py-8 md:px-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Main Preview */}
          <div className="space-y-6">
            {iframeError ? (
              <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-[32px] border border-red-500/20 bg-red-500/5 p-12 text-center backdrop-blur-sm">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/20 text-red-400">
                  <AlertCircle size={32} />
                </div>
                <h3 className="text-2xl font-bold text-red-200">Connection Refused</h3>
                <p className="mt-3 max-w-md text-zinc-400">
                  This website doesn&apos;t allow embedding for security reasons. You can still view it by opening it in a new tab.
                </p>
                <div className="mt-8 flex gap-4">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-zinc-100 px-8 py-3 text-sm font-bold text-black transition-all hover:bg-white hover:scale-105"
                  >
                    Open Externally
                  </a>
                </div>
              </div>
            ) : (
              <div className="group relative">
                <div className="absolute -inset-0.5 rounded-[32px] bg-gradient-to-tr from-yellow-400/20 to-blue-500/20 opacity-0 blur transition duration-1000 group-hover:opacity-100" />
                <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-zinc-900/50 shadow-2xl backdrop-blur-sm">
                  {/* Browser-like Header */}
                  <div className="flex items-center justify-between border-b border-white/5 bg-zinc-900/80 px-4 py-3">
                    <div className="flex gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
                      <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/50" />
                      <div className="h-2.5 w-2.5 rounded-full bg-green-500/50" />
                    </div>
                    <div className="flex-1 px-4">
                      <div className="mx-auto max-w-md rounded-lg bg-zinc-950/50 py-1 text-center text-[10px] text-zinc-500 border border-white/5">
                        {url}
                      </div>
                    </div>
                    <div className="text-zinc-600">
                       <Maximize2 size={12} />
                    </div>
                  </div>
                  
                  <div className="relative min-h-[75vh]">
               
                    <iframe
                      src={url}
                      title={title}
                      className="h-[75vh] w-full border-0 bg-white"
                      onLoad={() => setLoaded(true)}
                      onError={() => setIframeError(true)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI Assistant Sidebar */}
          <aside className="flex flex-col gap-6">
            <div className="rounded-[32px] border border-white/10 bg-zinc-900/30 p-1 backdrop-blur-xl shadow-xl">
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">
                    <Bot size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                       AI Guide <Sparkles size={14} className="text-yellow-400" />
                    </h2>
                    <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-500">Project Assistant</p>
                  </div>
                </div>
                
                <div className="mt-6 flex flex-col gap-4">
                  <div className="rounded-2xl border border-white/5 bg-black/40 p-4">
                    <p className="text-xs leading-relaxed text-zinc-400">
                      I&apos;m trained on this project&apos;s details. Ask me about features, tech stack, or the developer&apos;s role.
                    </p>
                  </div>
                  
                  <div className="h-[460px] overflow-hidden rounded-2xl border border-white/10 shadow-inner">
                    <iframe
                      title="Project AI assistant"
                      src={assistantUrl}
                      className="h-full w-full border-0"
                      sandbox="allow-scripts allow-same-origin allow-forms"
                    />
                  </div>
                </div>
              </div>
            </div>

           
          </aside>
        </div>
      </main>
    </div>
  );
}
