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
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
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
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => router.push('/')}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 transition-all hover:border-yellow-400/50 hover:bg-yellow-400/10 hover:text-yellow-400"
              title="Go Back"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="truncate">
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-yellow-400">
                <span className="h-1 w-1 rounded-full bg-yellow-400 animate-pulse" />
                Live Preview
              </p>
              <h1 className="mt-0.5 text-lg font-bold tracking-tight text-white md:text-2xl truncate">{title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Device Switcher - Hidden on small mobile screens to save space */}
            <div className="hidden sm:flex items-center rounded-full border border-white/10 bg-black/40 p-1">
              <button
                onClick={() => setViewMode('desktop')}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${viewMode === 'desktop' ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20' : 'text-zinc-500 hover:text-zinc-300'}`}
                title="Desktop View"
              >
                <Maximize2 size={16} />
              </button>
              <button
                onClick={() => setViewMode('mobile')}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${viewMode === 'mobile' ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20' : 'text-zinc-500 hover:text-zinc-300'}`}
                title="Mobile View"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
              </button>
            </div>

            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400 px-3 md:px-5 py-2 md:py-2.5 text-xs md:text-sm font-bold text-black transition-all hover:bg-yellow-300 hover:shadow-[0_0_20px_rgba(250,204,21,0.3)] shrink-0"
            >
              <span className="hidden xs:inline">Visit Site</span> <ExternalLink size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-[1600px] px-4 py-6 md:px-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Main Preview */}
          <div className="space-y-6 flex flex-col">
            {iframeError ? (
              <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-[32px] border border-red-500/20 bg-red-500/5 p-8 md:p-12 text-center backdrop-blur-sm">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/20 text-red-400">
                  <AlertCircle size={32} />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-red-200">Connection Refused</h3>
                <p className="mt-3 max-w-md text-sm text-zinc-400">
                  This website doesn&apos;t allow embedding for security reasons. You can still view it by opening it in a new tab.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-zinc-100 px-8 py-3 text-sm font-bold text-black transition-all hover:bg-white hover:scale-105"
                  >
                    Open Externally
                  </a>
                  <button 
                    onClick={() => router.push('/')}
                    className="rounded-full border border-white/10 bg-white/5 px-8 py-3 text-sm font-bold text-zinc-300 transition-all hover:bg-white/10"
                  >
                    Back to Projects
                  </button>
                </div>
              </div>
            ) : (
              <div className={`group relative transition-all duration-700 ease-in-out self-center ${viewMode === 'mobile' ? 'max-w-[340px] w-full' : 'w-full'}`}>
                {viewMode === 'mobile' && (
                  <div className="absolute -inset-4 md:-inset-6 rounded-[60px] bg-gradient-to-tr from-yellow-400/20 to-blue-500/20 blur-xl opacity-50" />
                )}
                
                <div className={`relative overflow-hidden transition-all duration-700 ${
                  viewMode === 'mobile' 
                    ? 'rounded-[3rem] border-[8px] md:border-[12px] border-zinc-800 shadow-2xl h-[700px] max-h-[85vh]' 
                    : 'rounded-[30px] border border-white/10 bg-zinc-900/50 shadow-2xl backdrop-blur-sm min-h-[75vh]'
                }`}>
                  {/* Browser/Device Header */}
                  <div className={`flex items-center justify-between border-b border-white/5 bg-zinc-900/80 px-4 py-3 ${viewMode === 'mobile' ? 'hidden' : ''}`}>
                    <div className="flex gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
                      <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/50" />
                      <div className="h-2.5 w-2.5 rounded-full bg-green-500/50" />
                    </div>
                    <div className="flex-1 px-4">
                      <div className="mx-auto max-w-md rounded-lg bg-zinc-950/50 py-1 text-center text-[10px] text-zinc-500 border border-white/5 truncate">
                        {url}
                      </div>
                    </div>
                    <div className="text-zinc-600">
                       <Maximize2 size={12} />
                    </div>
                  </div>

                  {/* Mobile Camera Notch */}
                  {viewMode === 'mobile' && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-800 rounded-b-2xl z-20 flex items-center justify-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                       <div className="w-8 h-1 bg-zinc-700 rounded-full" />
                    </div>
                  )}
                  
                  <div className={`relative ${viewMode === 'mobile' ? 'h-full' : 'min-h-[75vh]'}`}>
                    {!loaded && (
                      <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/50 backdrop-blur-sm z-10">
                        <div className="flex flex-col items-center gap-4">
                           <div className="w-12 h-12 border-4 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin" />
                           <p className="text-xs font-bold text-zinc-500 tracking-widest uppercase">Initializing Preview...</p>
                        </div>
                      </div>
                    )}
                    <iframe
                      src={url}
                      title={title}
                      className={`w-full border-0 bg-white transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} ${viewMode === 'mobile' ? 'h-full' : 'h-[75vh]'}`}
                      onLoad={() => setLoaded(true)}
                      onError={() => setIframeError(true)}
                      sandbox="allow-scripts allow-same-origin allow-forms"
                      loading="lazy"
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
