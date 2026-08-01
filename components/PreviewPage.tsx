'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, ArrowLeft, Copy, CopyCheck, Maximize2, Minimize2, Moon, Sparkles, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
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

type AssistantMessage = {
    role: 'assistant' | 'user';
    text: string;
};

const MIN_ASSISTANT_THINKING_MS = 900;

export default function PreviewPage({ geminiConfigured }: PreviewPageProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const previewContainerRef = useRef<HTMLDivElement>(null);
    const assistantEndRef = useRef<HTMLDivElement>(null);
    const url = searchParams.get('url') ?? '';
    const title = searchParams.get('title') ?? 'Project Preview';
    const description = searchParams.get('description') ?? '';
    const [iframeError, setIframeError] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [viewMode, setViewMode] = useState<'laptop' | 'tablet' | 'mobile'>('laptop');
    const [copied, setCopied] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [assistantQuestion, setAssistantQuestion] = useState('');
    const [assistantLoading, setAssistantLoading] = useState(false);
    const [assistantMessages, setAssistantMessages] = useState<AssistantMessage[]>(() => [
        {
            role: 'assistant',
            text: geminiConfigured
                ? `Hi! I can help with details about ${title}. Ask me about the project scope, stack, or role.`
                : 'Gemini is not configured yet. Add GEMINI_API_KEY to .env.local and restart the server to enable the assistant.',
        },
    ]);
    const validUrl = useMemo(() => isValidLiveUrl(url), [url]);
    const codeUrl = searchParams.get('codeUrl') ?? '';
    const fallbackPath = codeUrl ? `/testing?codeUrl=${encodeURIComponent(codeUrl)}` : '/testing';
    const isDarkTheme = mounted ? theme !== 'light' : true;

    const handleCopy = async () => {
        if (!url) {
            return;
        }

        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);

            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            const fallbackInput = document.createElement('textarea');
            fallbackInput.value = url;
            fallbackInput.setAttribute('readonly', 'true');
            fallbackInput.style.position = 'fixed';
            fallbackInput.style.opacity = '0';
            document.body.appendChild(fallbackInput);
            fallbackInput.select();

            try {
                document.execCommand('copy');
                setCopied(true);
                window.setTimeout(() => setCopied(false), 2000);
            } finally {
                document.body.removeChild(fallbackInput);
            }
        }
    };

    const submitAssistantQuestion = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const question = assistantQuestion.trim();
        if (!question || assistantLoading) {
            return;
        }

        setAssistantMessages((currentMessages) => [...currentMessages, { role: 'user', text: question }]);
        setAssistantQuestion('');
        setAssistantLoading(true);
        const thinkingStartedAt = Date.now();

        try {
            const response = await fetch('/api/ai-preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    liveUrl: url,
                    codeUrl,
                    question,
                }),
            });

            const data = (await response.json()) as { answer?: string; error?: string };

            if (!response.ok) {
                throw new Error(data.error || 'The assistant is unavailable right now.');
            }

            setAssistantMessages((currentMessages) => [
                ...currentMessages,
                { role: 'assistant', text: data.answer || 'I can only answer questions about this project.' },
            ]);
        } catch (error) {
            setAssistantMessages((currentMessages) => [
                ...currentMessages,
                {
                    role: 'assistant',
                    text: error instanceof Error ? error.message : 'The assistant is unavailable right now.',
                },
            ]);
        } finally {
            const elapsed = Date.now() - thinkingStartedAt;
            const remaining = Math.max(0, MIN_ASSISTANT_THINKING_MS - elapsed);

            window.setTimeout(() => {
                setAssistantLoading(false);
            }, remaining);
        }
    };

    const toggleFullscreen = async () => {
        try {
            if (document.fullscreenElement) {
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                    return;
                }

                const webkitDocument = document as Document & { webkitExitFullscreen?: () => Promise<void> | void };
                await webkitDocument.webkitExitFullscreen?.();
                return;
            }

            const previewElement = previewContainerRef.current;
            if (!previewElement) {
                return;
            }

            if (previewElement.requestFullscreen) {
                await previewElement.requestFullscreen();
                return;
            }

            const webkitElement = previewElement as HTMLDivElement & { webkitRequestFullscreen?: () => Promise<void> | void };
            await webkitElement.webkitRequestFullscreen?.();
        } catch (error) {
            console.error('Failed to toggle fullscreen preview', error);
        }
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(Boolean(document.fullscreenElement));
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        handleFullscreenChange();

        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    useEffect(() => {
        assistantEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [assistantMessages]);

    const previewIframeUrl = useMemo(() => {
        if (!mounted) {
            return url;
        }

        try {
            const parsedUrl = new URL(url);
            parsedUrl.searchParams.set('previewReload', Date.now().toString());
            return parsedUrl.toString();
        } catch {
            return url;
        }
    }, [mounted, url]);

    useEffect(() => {
        if (!validUrl) {
            router.replace(fallbackPath);
        }
    }, [fallbackPath, router, validUrl]);

    if (!validUrl) {
        return null;
    }

    return (
        <div className={`min-h-screen selection:bg-yellow-400 selection:text-black ${isDarkTheme ? 'bg-[#050505] text-zinc-100' : 'bg-zinc-50 text-zinc-900'}`}>
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full blur-[120px] ${isDarkTheme ? 'bg-yellow-500/5' : 'bg-amber-300/20'}`} />
                <div className={`absolute top-[20%] -right-[10%] h-[30%] w-[30%] rounded-full blur-[120px] ${isDarkTheme ? 'bg-blue-500/5' : 'bg-sky-300/20'}`} />
            </div>

            <header className={`sticky top-0 z-30 border-b px-4 py-4 backdrop-blur-xl md:px-10 ${isDarkTheme ? 'border-white/5 bg-black/60' : 'border-zinc-200 bg-white/80'}`}>
                <div className="mx-auto flex     items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center justify-start gap-4">
                        <button
                            onClick={() => router.push('/')}
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all ${isDarkTheme ? 'border-white/10 bg-white/5 text-zinc-400 hover:border-yellow-400/50 hover:bg-yellow-400/10 hover:text-yellow-400' : 'border-zinc-200 bg-white text-zinc-600 hover:border-amber-400/50 hover:bg-amber-50 hover:text-amber-600'}`}
                            title="Go Back"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div className="truncate">
                            <p className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] ${isDarkTheme ? 'text-yellow-400' : 'text-amber-600'}`}>
                                <span className={`h-1 w-1 rounded-full animate-pulse ${isDarkTheme ? 'bg-yellow-400' : 'bg-amber-500'}`} />
                                Live Preview
                            </p>
                            <h1 className={`mt-0.5 truncate text-lg font-bold tracking-tight md:text-2xl ${isDarkTheme ? 'text-white' : 'text-zinc-900'}`}>{title}</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <div className={`hidden items-center rounded-full border p-1 sm:flex ${isDarkTheme ? 'border-white/10 bg-black/40' : 'border-zinc-200 bg-white/70'}`}>
                            <button
                                onClick={() => setViewMode('laptop')}
                                className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${viewMode === 'laptop' ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20' : isDarkTheme ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-500 hover:text-zinc-900'}`}
                                title="Laptop View"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="13" rx="2" ry="2" /><path d="M2 20h20" /><path d="M8 20h8" /></svg>
                            </button>
                            <button
                                onClick={() => setViewMode('tablet')}
                                className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${viewMode === 'tablet' ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20' : isDarkTheme ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-500 hover:text-zinc-900'}`}
                                title="Tablet View"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><path d="M12 18h.01" /></svg>
                            </button>
                            <button
                                onClick={() => setViewMode('mobile')}
                                className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${viewMode === 'mobile' ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20' : isDarkTheme ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-500 hover:text-zinc-900'}`}
                                title="Mobile View"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" /></svg>
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => setTheme(isDarkTheme ? 'light' : 'dark')}
                            aria-label={mounted ? (isDarkTheme ? 'Switch to light mode' : 'Switch to dark mode') : 'Switch theme'}
                            title={mounted ? (isDarkTheme ? 'Switch to Light Mode' : 'Switch to Dark Mode') : 'Switch Theme'}
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all ${isDarkTheme ? 'border-white/10 bg-white/5 text-zinc-300 hover:border-yellow-400/50 hover:bg-yellow-400/10 hover:text-yellow-400' : 'border-zinc-200 bg-white text-zinc-600 hover:border-amber-400/50 hover:bg-amber-50 hover:text-amber-600'}`}
                        >
                            {mounted && (isDarkTheme ? <Sun size={16} /> : <Moon size={16} />)}
                        </button>


                    </div>
                </div>
            </header>

            <main className={`relative z-10 mx-auto px-4 py-3 md:px-10 ${isFullscreen ? 'max-w-none' : 'max-w-[1600px]'}`}>
                <div className={`grid gap-8 ${isFullscreen ? 'grid-cols-1' : 'lg:grid-cols-[1fr_380px]'}`}>
                    <div className="flex flex-col space-y-6">
                        {iframeError ? (
                            <div className={`flex min-h-[60vh] flex-col items-center justify-center rounded-[32px] border p-8 text-center backdrop-blur-sm md:p-12 ${isDarkTheme ? 'border-red-500/20 bg-red-500/5' : 'border-red-200 bg-red-50'}`}>
                                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/20 text-red-400">
                                    <AlertCircle size={32} />
                                </div>
                                <h3 className={`text-xl font-bold md:text-2xl ${isDarkTheme ? 'text-red-200' : 'text-red-700'}`}>Connection Refused</h3>
                                <p className={`mt-3 max-w-md text-sm ${isDarkTheme ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                    This website doesn&apos;t allow embedding for security reasons. You can still view it by opening it in a new tab.
                                </p>
                                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                                    <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="rounded-full bg-zinc-100 px-8 py-3 text-sm font-bold text-black transition-all hover:scale-105 hover:bg-white"
                                    >
                                        Open Externally
                                    </a>
                                    <button
                                        onClick={() => router.push('/')}
                                        className={`rounded-full border px-8 py-3 text-sm font-bold transition-all ${isDarkTheme ? 'border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10' : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'}`}
                                    >
                                        Back to Projects
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className={`group relative self-center transition-all duration-700 ease-in-out ${isFullscreen ? 'w-full' : viewMode === 'mobile' ? 'max-w-[330px] w-full' : viewMode === 'tablet' ? 'max-w-[680px] w-full' : 'w-full'}`}>
                                {viewMode === 'mobile' && (
                                    <div className={`absolute -inset-4 md:-inset-6 rounded-[60px] blur-xl opacity-50 ${isDarkTheme ? 'bg-gradient-to-tr from-yellow-400/20 to-blue-500/20' : 'bg-gradient-to-tr from-amber-300/20 to-sky-300/20'}`} />
                                )}

                                <div ref={previewContainerRef} className={`relative overflow-hidden transition-all duration-700 ${isFullscreen ? 'min-h-[calc(100vh-120px)] border-[8px] shadow-2xl md:border-[12px] backdrop-blur-sm' : viewMode === 'mobile' ? `h-[700px] max-h-[85vh] border-[8px] shadow-2xl md:border-[12px] ${isDarkTheme ? 'border-zinc-800' : 'border-zinc-300 bg-white'}` : viewMode === 'tablet' ? `h-[760px] max-h-[85vh]  border-[10px] shadow-2xl ${isDarkTheme ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-300 bg-white/80'}` : `min-h-[75vh] border shadow-2xl backdrop-blur-sm ${isDarkTheme ? 'border-white/10 bg-zinc-900/50' : 'border-zinc-200 bg-white/80'}`}`}>
                                    <div className={`flex items-center justify-between border-b px-4 py-3 ${((viewMode === 'mobile' || viewMode === 'tablet') && !isFullscreen) ? 'hidden' : ''} ${isDarkTheme ? 'border-white/5 bg-zinc-900/80' : 'border-zinc-200 bg-white/80'}`}>
                                        <div className="flex gap-1.5">
                                            <div className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
                                            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/50" />
                                            <div className="h-2.5 w-2.5 rounded-full bg-green-500/50" />
                                        </div>
                                        <div className="flex flex-1 items-center gap-2 px-4">
                                            <div className={`min-w-0 flex-1 truncate rounded-lg border py-1 text-center text-[10px] ${isDarkTheme ? 'border-white/5 bg-zinc-950/50 text-zinc-500' : 'border-zinc-200 bg-zinc-100 text-zinc-600'}`}>
                                                {url}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleCopy}
                                                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold transition-all ${isDarkTheme ? 'border-white/10 bg-white/5 text-zinc-300 hover:border-yellow-400/50 hover:bg-yellow-400/10 hover:text-yellow-400' : 'border-zinc-200 bg-white text-zinc-600 hover:border-amber-400/50 hover:bg-amber-50 hover:text-amber-600'}`}
                                                title={copied ? 'Copied' : 'Copy preview link'}
                                                aria-label={copied ? 'Copied' : 'Copy preview link'}
                                            >
                                                {copied ? <CopyCheck size={10} /> : <Copy size={10} />}
                                                <span>{copied ? 'Copied' : 'Copy'}</span>
                                            </button>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={toggleFullscreen}
                                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all ${isDarkTheme ? 'border-white/10 bg-white/5 text-zinc-500 hover:border-yellow-400/50 hover:bg-yellow-400/10 hover:text-yellow-400' : 'border-zinc-200 bg-white text-zinc-500 hover:border-amber-400/50 hover:bg-amber-50 hover:text-amber-600'}`}
                                            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                                            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                                        >
                                            {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                                        </button>
                                    </div>

                                    {viewMode === 'mobile' && !isFullscreen && (
                                        <div className={`absolute left-1/2 top-0 z-20 flex h-6 w-32 -translate-x-1/2 items-center justify-center gap-2 rounded-b-2xl ${isDarkTheme ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
                                            <div className={`h-1.5 w-1.5 rounded-full ${isDarkTheme ? 'bg-zinc-700' : 'bg-zinc-300'}`} />
                                            <div className={`h-1 w-8 rounded-full ${isDarkTheme ? 'bg-zinc-700' : 'bg-zinc-300'}`} />
                                        </div>
                                    )}

                                    {viewMode === 'tablet' && !isFullscreen && (
                                        <div className={`absolute left-1/2 top-0 z-20 flex h-6 w-44 -translate-x-1/2 items-center justify-center gap-2 rounded-b-2xl ${isDarkTheme ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
                                            <div className={`h-1.5 w-1.5 rounded-full ${isDarkTheme ? 'bg-zinc-700' : 'bg-zinc-300'}`} />
                                            <div className={`h-1 w-12 rounded-full ${isDarkTheme ? 'bg-zinc-700' : 'bg-zinc-300'}`} />
                                        </div>
                                    )}

                                    <div className={`relative ${isFullscreen ? 'min-h-[calc(100vh-188px)]' : viewMode === 'mobile' ? 'h-full' : viewMode === 'tablet' ? 'h-[calc(760px-64px)] max-h-[calc(85vh-64px)]' : 'min-h-[75vh]'}`}>
                                     
                                        <iframe
                                            src={previewIframeUrl}
                                            title={title}
                                            className={`w-full border-0 transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} ${isFullscreen ? 'h-[calc(100vh-188px)]' : viewMode === 'mobile' ? 'h-full' : viewMode === 'tablet' ? 'h-[calc(760px-64px)] max-h-[calc(95vh-64px)]' : 'h-[75vh]'} ${isDarkTheme ? 'bg-white' : 'bg-zinc-50'}`}
                                            onLoad={() => setLoaded(true)}
                                            onError={() => setIframeError(true)}
                                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                                            allow="microphone; camera"
                                            loading="eager"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <aside className={`${isFullscreen ? 'hidden' : 'hidden flex-col gap-6 lg:flex'}`}>
                        <div className={` border p-1 shadow-xl backdrop-blur-xl ${isDarkTheme ? 'border-white/10 bg-zinc-900/30' : 'border-zinc-200 bg-white/80'}`}>
                            <div className="p-5">
                                <div className="flex items-center gap-3">
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${isDarkTheme ? 'border-yellow-400/20 bg-yellow-400/10 text-yellow-400' : 'border-amber-200 bg-amber-50 text-amber-600'}`}>
                                        <Sparkles size={18} />
                                    </div>
                                    <div>
                                        <h2 className={`text-lg font-bold ${isDarkTheme ? 'text-white' : 'text-zinc-900'}`}>
                                            AI Assistant
                                        </h2>
                                        <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-500">Ask about this project</p>
                                    </div>
                                </div>

                                <div className={`mt-6 flex h-[520px] flex-col overflow-hidden rounded-3xl border ${isDarkTheme ? 'border-white/10 bg-black/30' : 'border-zinc-200 bg-zinc-50'}`}>
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                        {assistantMessages.map((message, index) => (
                                            <div
                                                key={`${message.role}-${index}-${message.text.slice(0, 16)}`}
                                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${message.role === 'user'
                                                        ? 'rounded-br-md bg-yellow-400 text-black font-semibold'
                                                        : isDarkTheme
                                                            ? 'rounded-bl-md border border-white/5 bg-zinc-900 text-zinc-200'
                                                            : 'rounded-bl-md border border-zinc-200 bg-white text-zinc-700'
                                                        }`}
                                                >
                                                    {message.text}
                                                </div>
                                            </div>
                                        ))}
                                        {assistantLoading && (
                                            <div className="flex justify-start">
                                                <div className={`flex justify-around items-center`}>
                                                    <object
                                                        data="/live-chatbot.svg"
                                                        type="image/svg+xml"
                                                        aria-label="Thinking"
                                                        className="h-16 w-16 shrink-0 pointer-events-none"
                                                    >
                                                        Thinking
                                                    </object>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-yellow-400">Thinking...</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div ref={assistantEndRef} />
                                    </div>

                                    <form onSubmit={submitAssistantQuestion} className={`border-t p-4 ${isDarkTheme ? 'border-white/5 bg-zinc-950' : 'border-zinc-200 bg-white'}`}>
                                        <div className={`flex items-center gap-2 rounded-2xl border px-4 py-2 ${isDarkTheme ? 'border-white/10 bg-zinc-900' : 'border-zinc-200 bg-zinc-50'}`}>
                                            <textarea
                                                value={assistantQuestion}
                                                onChange={(event) => setAssistantQuestion(event.target.value)}
                                                rows={1}
                                                placeholder="Ask about this project..."
                                                className={`max-[40px] flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-zinc-500 ${isDarkTheme ? 'text-zinc-100' : 'text-zinc-900'}`}
                                            />
                                            <button
                                                type="submit"
                                                disabled={assistantLoading || !assistantQuestion.trim()}
                                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-black transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                                                aria-label="Send question"
                                                title="Send question"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </aside>

                </div>
            </main>
        </div>
    );
}
