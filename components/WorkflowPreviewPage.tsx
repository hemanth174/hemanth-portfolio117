'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Maximize2, Minimize2, Moon, Sparkles, Workflow, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useParams, useRouter } from 'next/navigation';
import N8nWorkflowViewer from './N8nWorkflowViewer';

type PublicWorkflow = {
  _id: string;
  title: string;
  description: string;
  category: string;
  tags?: string[];
  nodeCount?: number;
  workflowJson?: string;
};

type AssistantMessage = {
  role: 'assistant' | 'user';
  text: string;
};

const MIN_ASSISTANT_THINKING_MS = 900;

export default function WorkflowPreviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const assistantEndRef = useRef<HTMLDivElement>(null);
  const id = params.id;
  const [workflow, setWorkflow] = useState<PublicWorkflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [assistantQuestion, setAssistantQuestion] = useState('');
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantMessages, setAssistantMessages] = useState<AssistantMessage[]>([
    {
      role: 'assistant',
      text: 'Hi! I can help explain this n8n workflow, the nodes, the automation flow, or how it works.',
    },
  ]);
  const isDarkTheme = mounted ? theme !== 'light' : true;

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
    let ignore = false;

    fetch('/api/workflows')
      .then((res) => res.json())
      .then((data) => {
        if (ignore) return;
        const selected = Array.isArray(data.workflows)
          ? data.workflows.find((item: PublicWorkflow) => item._id === id)
          : null;

        if (!selected) {
          setError('Workflow not found.');
          return;
        }

        setWorkflow(selected);
      })
      .catch(() => {
        if (!ignore) setError('Unable to load workflow preview.');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  useEffect(() => {
    assistantEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [assistantMessages]);

  const toggleFullscreen = async () => {
    const previewElement = previewContainerRef.current;
    if (!previewElement) return;

    if (document.fullscreenElement) {
      await document.exitFullscreen?.();
      return;
    }

    await previewElement.requestFullscreen?.();
  };

  const submitAssistantQuestion = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const question = assistantQuestion.trim();
    if (!question || assistantLoading) return;

    setAssistantMessages((currentMessages) => [...currentMessages, { role: 'user', text: question }]);
    setAssistantQuestion('');
    setAssistantLoading(true);
    const thinkingStartedAt = Date.now();

    try {
      const response = await fetch('/api/ai-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: workflow?.title ?? 'n8n Workflow Preview',
          description: workflow?.description ?? 'An n8n automation workflow rendered with React Flow.',
          liveUrl: `/workflows/${id}`,
          codeUrl: '',
          question,
        }),
      });

      const data = (await response.json()) as { answer?: string; error?: string };
      if (!response.ok) throw new Error(data.error || 'The assistant is unavailable right now.');

      setAssistantMessages((currentMessages) => [
        ...currentMessages,
        { role: 'assistant', text: data.answer || 'I can help with questions about this workflow.' },
      ]);
    } catch (err) {
      setAssistantMessages((currentMessages) => [
        ...currentMessages,
        {
          role: 'assistant',
          text: err instanceof Error ? err.message : 'The assistant is unavailable right now.',
        },
      ]);
    } finally {
      const elapsed = Date.now() - thinkingStartedAt;
      const remaining = Math.max(0, MIN_ASSISTANT_THINKING_MS - elapsed);
      window.setTimeout(() => setAssistantLoading(false), remaining);
    }
  };

  return (
    <div className={`min-h-screen selection:bg-yellow-400 selection:text-black ${isDarkTheme ? 'bg-[#050505] text-zinc-100' : 'bg-zinc-50 text-zinc-900'}`}>
      <header className={`sticky top-0 z-30 border-b px-4 py-4 backdrop-blur-xl md:px-10 ${isDarkTheme ? 'border-white/5 bg-black/60' : 'border-zinc-200 bg-white/80'}`}>
        <div className="mx-auto flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center justify-start gap-4">
            <button
              onClick={() => router.push('/#section4')}
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
              <h1 className={`mt-0.5 truncate text-lg font-bold tracking-tight md:text-2xl ${isDarkTheme ? 'text-white' : 'text-zinc-900'}`}>
                {workflow?.title ?? 'n8n Workflow Preview'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {workflow && (
              <div className={`hidden items-center gap-2 border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] sm:flex ${isDarkTheme ? 'border-white/10 bg-white/5 text-zinc-300' : 'border-zinc-200 bg-white text-zinc-600'}`}>
                <Workflow size={14} className="text-[#EA4B35]" />
                {workflow.nodeCount ?? 0} nodes
              </div>
            )}

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
            {workflow?.description && (
              <p className={`max-w-4xl text-sm leading-6 ${isDarkTheme ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {workflow.description}
              </p>
            )}

            <div className="group relative self-center w-full transition-all duration-700 ease-in-out">
              <div ref={previewContainerRef} className={`relative overflow-hidden border shadow-2xl backdrop-blur-sm ${isFullscreen ? 'min-h-[calc(100vh-120px)] border-[8px] md:border-[12px]' : `min-h-[75vh] ${isDarkTheme ? 'border-white/10 bg-zinc-900/50' : 'border-zinc-200 bg-white/80'}`}`}>
              <div className={`flex items-center justify-between border-b px-4 py-3 ${isDarkTheme ? 'border-white/5 bg-zinc-900/80' : 'border-zinc-200 bg-white/80'}`}>
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/50" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500/50" />
                </div>
                <div className="flex flex-1 items-center gap-2 px-4">
                  <div className={`min-w-0 flex-1 truncate rounded-lg border py-1 text-center text-[10px] ${isDarkTheme ? 'border-white/5 bg-zinc-950/50 text-zinc-500' : 'border-zinc-200 bg-zinc-100 text-zinc-600'}`}>
                    /workflows/{id}
                  </div>
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

              <div className={isFullscreen ? 'h-[calc(100vh-188px)]' : 'h-[75vh]'}>
                {loading ? (
                  <div className="flex h-full items-center justify-center text-sm text-zinc-500">Loading workflow...</div>
                ) : error ? (
                  <div className="flex h-full items-center justify-center text-sm text-red-300">{error}</div>
                ) : workflow?.workflowJson ? (
                  <N8nWorkflowViewer workflowJson={workflow.workflowJson} />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-zinc-500">No workflow JSON available.</div>
                )}
              </div>
            </div>
          </div>
          </div>

          <aside className={`${isFullscreen ? 'hidden' : 'hidden flex-col gap-6 lg:flex'}`}>
            <div className={`border p-1 shadow-xl backdrop-blur-xl ${isDarkTheme ? 'border-white/10 bg-zinc-900/30' : 'border-zinc-200 bg-white/80'}`}>
              <div className="p-5">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${isDarkTheme ? 'border-yellow-400/20 bg-yellow-400/10 text-yellow-400' : 'border-amber-200 bg-amber-50 text-amber-600'}`}>
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h2 className={`text-lg font-bold ${isDarkTheme ? 'text-white' : 'text-zinc-900'}`}>AI Assistant</h2>
                    <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-500">Ask about this workflow</p>
                  </div>
                </div>

                <div className={`mt-6 flex h-[520px] flex-col overflow-hidden rounded-3xl border ${isDarkTheme ? 'border-white/10 bg-black/30' : 'border-zinc-200 bg-zinc-50'}`}>
                  <div className="flex-1 space-y-4 overflow-y-auto p-4">
                    {assistantMessages.map((message, index) => (
                      <div key={`${message.role}-${index}-${message.text.slice(0, 16)}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                            message.role === 'user'
                              ? 'rounded-br-md bg-yellow-400 font-semibold text-black'
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
                        <div className="flex items-center justify-around">
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
                        placeholder="Ask about this workflow..."
                        className={`flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-zinc-500 ${isDarkTheme ? 'text-zinc-100' : 'text-zinc-900'}`}
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
