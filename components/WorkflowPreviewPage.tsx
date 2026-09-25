'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, GitBranch, ListOrdered, Maximize2, Minimize2, Moon, Sparkles, Workflow, Sun, X, MessageCircle } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useParams, useRouter } from 'next/navigation';
import N8nWorkflowViewer from './N8nWorkflowViewer';
import { toggleThemeWithRipple } from '@/lib/themeTransition';
import { parseN8nWorkflow, summarizeWorkflowForAI } from '@/lib/n8nWorkflow';

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
  const { theme, resolvedTheme, setTheme } = useTheme();
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const assistantEndRef = useRef<HTMLDivElement>(null);
  const mobileAssistantEndRef = useRef<HTMLDivElement>(null);
  const id = params.id;
  const [workflow, setWorkflow] = useState<PublicWorkflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mobileAiOpen, setMobileAiOpen] = useState(false);
  const [assistantQuestion, setAssistantQuestion] = useState('');
  const [assistantLocked, setAssistantLocked] = useState(false);
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantMessages, setAssistantMessages] = useState<AssistantMessage[]>([
    {
      role: 'assistant',
      text: 'Hi! I can help explain this n8n workflow, the nodes, the automation flow, or how it works.',
    },
  ]);
  const activeTheme = resolvedTheme ?? theme;
  const isDarkTheme = mounted ? activeTheme !== 'light' : true;

  // Ordered node breakdown + AI-ready summary, derived from the saved JSON.
  const flowSteps = useMemo(
    () => (workflow?.workflowJson ? parseN8nWorkflow(workflow.workflowJson).steps : []),
    [workflow?.workflowJson],
  );
  const workflowSummary = useMemo(
    () => (workflow ? summarizeWorkflowForAI(workflow.title, flowSteps) : ''),
    [workflow, flowSteps],
  );

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

    fetch(`/api/workflows?id=${encodeURIComponent(String(id))}`)
      .then((res) => res.json())
      .then((data) => {
        if (ignore) return;
        // Single-workflow endpoint returns { workflow }; fall back to list shape.
        const selected: PublicWorkflow | null = data.workflow
          ?? (Array.isArray(data.workflows)
            ? data.workflows.find((item: PublicWorkflow) => item._id === id)
            : null);

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
    mobileAssistantEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [assistantMessages, mobileAiOpen]);

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
          workflowSummary,
          question,
        }),
      });

      const data = (await response.json()) as { answer?: string; error?: string; limitReached?: boolean };
      if (!response.ok) {
        if (response.status === 429 || data.limitReached) setAssistantLocked(true);
        throw new Error(data.error || 'The assistant is unavailable right now.');
      }

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

  const chatBubbles = (endRef: React.RefObject<HTMLDivElement | null>) => (
    <>
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
      <div ref={endRef} />
    </>
  );

  const chatForm = (idSuffix: string) => (
    <form onSubmit={submitAssistantQuestion} className={`border-t p-4 ${isDarkTheme ? 'border-white/5 bg-zinc-950' : 'border-zinc-200 bg-white'}`}>
      <div className={`flex items-center gap-2 rounded-2xl border px-4 py-2 ${isDarkTheme ? 'border-white/10 bg-zinc-900' : 'border-zinc-200 bg-zinc-50'}`}>
        <textarea
          id={`wf-assistant-input-${idSuffix}`}
          value={assistantQuestion}
          onChange={(event) => setAssistantQuestion(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
          rows={1}
          placeholder={assistantLocked ? 'Daily limit reached (20/20) — back tomorrow' : 'Ask about this workflow... (Enter to send)'}
          disabled={assistantLocked}
          className={`flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-zinc-500 ${isDarkTheme ? 'text-zinc-100' : 'text-zinc-900'}`}
        />
        <button
          type="submit"
          disabled={assistantLoading || assistantLocked || !assistantQuestion.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-black transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Send question"
          title="Send question"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </button>
      </div>
    </form>
  );

  return (
    <div className={`min-h-screen selection:bg-yellow-400 selection:text-black ${isDarkTheme ? 'bg-[#050505] text-zinc-100' : 'bg-zinc-50 text-zinc-900'}`}>
      <header className={`sticky top-0 z-30 border-b px-4 py-4 backdrop-blur-xl md:px-10 ${isDarkTheme ? 'border-white/5 bg-black/60' : 'border-zinc-200 bg-white/80'}`}>
        <div className="mx-auto flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center justify-start gap-4">
            <button
              onClick={() => router.push('/#section3')}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all ${isDarkTheme ? 'border-white/10 bg-white/5 text-zinc-400 hover:border-yellow-400/50 hover:bg-yellow-400/10 hover:text-yellow-400' : 'border-zinc-200 bg-white text-zinc-600 hover:border-amber-400/50 hover:bg-amber-50 hover:text-amber-600'}`}
              title="Go Back"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="truncate">
              <p className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] ${isDarkTheme ? 'text-yellow-400' : 'text-amber-600'}`}>
                <span className={`h-1 w-1 rounded-full animate-pulse ${isDarkTheme ? 'bg-yellow-400' : 'bg-amber-500'}`} />
                n8n Workflow · Live Preview
              </p>
              <h1 className={`mt-0.5 truncate text-lg font-bold tracking-tight md:text-2xl ${isDarkTheme ? 'text-white' : 'text-zinc-900'}`}>
                {workflow?.title ?? 'n8n Workflow Preview'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {workflow && (
              <div className={`hidden items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] sm:flex ${isDarkTheme ? 'border-white/10 bg-white/5 text-zinc-300' : 'border-zinc-200 bg-white text-zinc-600'}`}>
                <Workflow size={14} className="text-[#EA4B35]" />
                {workflow.nodeCount ?? 0} nodes
              </div>
            )}

            <button
              type="button"
              onClick={(e) => toggleThemeWithRipple(e, isDarkTheme, setTheme)}
              aria-label={mounted ? (isDarkTheme ? 'Switch to light mode' : 'Switch to dark mode') : 'Switch theme'}
              title={mounted ? (isDarkTheme ? 'Switch to Light Mode' : 'Switch to Dark Mode') : 'Switch Theme'}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all active:scale-90 ${isDarkTheme ? 'border-white/10 bg-white/5 text-zinc-300 hover:border-yellow-400/50 hover:bg-yellow-400/10 hover:text-yellow-400' : 'border-zinc-200 bg-white text-zinc-600 hover:border-amber-400/50 hover:bg-amber-50 hover:text-amber-600'}`}
            >
              {mounted ? (isDarkTheme ? <Sun size={16} /> : <Moon size={16} />) : <Sun size={16} className="opacity-0" />}
            </button>
          </div>
        </div>
      </header>

      <main className={`relative z-10 mx-auto px-4 py-3 pb-28 md:px-10 lg:pb-3 ${isFullscreen ? 'max-w-none' : 'max-w-[1600px]'}`}>
        <div className={`grid gap-8 ${isFullscreen ? 'grid-cols-1' : 'lg:grid-cols-[1fr_380px]'}`}>
          <div className="flex flex-col space-y-6">
            {workflow?.description && (
              <p className={`max-w-4xl text-sm leading-6 ${isDarkTheme ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {workflow.description}
              </p>
            )}

            <div className="group relative self-center w-full transition-all duration-700 ease-in-out">
              <div ref={previewContainerRef} className={`relative overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-sm ${isFullscreen ? 'min-h-[calc(100vh-120px)]' : 'min-h-[75vh]'} ${isDarkTheme ? 'border-white/10 bg-[#101014]' : 'border-zinc-200 bg-white'}`}>
                {/* n8n-style canvas top bar */}
                <div className={`flex items-center justify-between border-b px-4 py-3 ${isDarkTheme ? 'border-white/5 bg-[#17171b]' : 'border-zinc-200 bg-zinc-50'}`}>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                      <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
                      <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
                    </div>
                    <span className="hidden items-center gap-1.5 rounded-md bg-[#EA4B35] px-2 py-1 text-[10px] font-black tracking-wider text-white sm:flex">
                      n8n
                    </span>
                  </div>
                  <div className="flex flex-1 items-center gap-2 px-4">
                    <div className={`min-w-0 flex-1 truncate rounded-lg border py-1 text-center font-mono text-[10px] ${isDarkTheme ? 'border-white/5 bg-black/40 text-zinc-500' : 'border-zinc-200 bg-white text-zinc-600'}`}>
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
                    <div className={`flex h-full flex-col items-center justify-center gap-3 text-sm ${isDarkTheme ? 'bg-[#101014] text-zinc-500' : 'bg-zinc-50 text-zinc-500'}`}>
                      <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#EA4B35]/20 border-t-[#EA4B35]" />
                      Loading workflow canvas...
                    </div>
                  ) : error ? (
                    <div className="flex h-full items-center justify-center text-sm text-red-400">{error}</div>
                  ) : workflow?.workflowJson ? (
                    <N8nWorkflowViewer workflowJson={workflow.workflowJson} isDark={isDarkTheme} />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-zinc-500">No workflow JSON available.</div>
                  )}
                </div>

                {/* canvas hint footer — mirrors n8n helper text */}
                <div className={`flex items-center justify-between border-t px-4 py-2 font-mono text-[10px] tracking-wider ${isDarkTheme ? 'border-white/5 bg-[#17171b] text-zinc-500' : 'border-zinc-200 bg-zinc-50 text-zinc-500'}`}>
                  <span>DRAG TO PAN · SCROLL TO ZOOM · DRAG NODES TO MOVE · CLICK A NODE FOR DETAILS</span>
                  <span className="hidden sm:inline">{workflow?.nodeCount ?? 0} NODES</span>
                </div>
              </div>
            </div>

            {/* ── How this automation works: node-by-node breakdown ── */}
            {!loading && !error && flowSteps.length > 0 && (
              <div className={`rounded-2xl border p-5 md:p-6 ${isDarkTheme ? 'border-white/10 bg-zinc-900/30' : 'border-zinc-200 bg-white/80'}`}>
                <div className="flex items-center gap-3">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${isDarkTheme ? 'border-yellow-400/20 bg-yellow-400/10 text-yellow-400' : 'border-amber-200 bg-amber-50 text-amber-600'}`}>
                    <ListOrdered size={18} />
                  </span>
                  <div>
                    <h2 className={`text-lg font-bold ${isDarkTheme ? 'text-white' : 'text-zinc-900'}`}>How this automation works</h2>
                    <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-500">
                      {flowSteps.length} steps in execution order · what each node does · where it connects
                    </p>
                  </div>
                </div>
                <ol className="mt-5 flex flex-col gap-3">
                  {flowSteps.map((step) => (
                    <li
                      key={step.id}
                      className={`flex items-start gap-4 rounded-2xl border p-4 transition-colors ${isDarkTheme ? 'border-white/5 bg-black/30' : 'border-zinc-200 bg-zinc-50'}`}
                    >
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black text-white"
                        style={{ backgroundColor: step.color }}
                      >
                        {step.order}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className={`text-sm font-bold ${isDarkTheme ? 'text-white' : 'text-zinc-900'}`}>{step.title}</span>
                          <span className={`rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${isDarkTheme ? 'border-white/10 text-zinc-400' : 'border-zinc-300 text-zinc-500'}`}>
                            {step.subtitle}
                          </span>
                        </span>
                        <span className={`mt-1 block text-[13px] leading-relaxed ${isDarkTheme ? 'text-zinc-400' : 'text-zinc-600'}`}>
                          {step.description}
                        </span>
                        {step.connectsTo.length > 0 ? (
                          <span className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[12px]">
                            <GitBranch size={12} className="text-[#EA4B35]" />
                            <span className={isDarkTheme ? 'text-zinc-500' : 'text-zinc-500'}>Connects to →</span>
                            {step.connectsTo.map((name) => (
                              <span key={name} className={`rounded-full px-2 py-0.5 font-mono text-[11px] ${isDarkTheme ? 'bg-white/5 text-zinc-300' : 'bg-zinc-200/70 text-zinc-700'}`}>
                                {name}
                              </span>
                            ))}
                          </span>
                        ) : (
                          <span className="mt-1.5 block text-[12px] text-zinc-500">End of this branch — nothing downstream.</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          {/* Desktop AI panel */}
          <aside className={`${isFullscreen ? 'hidden' : 'hidden flex-col gap-6 lg:flex'}`}>
            <div className={`rounded-3xl border p-1 shadow-xl backdrop-blur-xl ${isDarkTheme ? 'border-white/10 bg-zinc-900/30' : 'border-zinc-200 bg-white/80'}`}>
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
                    {chatBubbles(assistantEndRef)}
                  </div>
                  {chatForm('desktop')}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* ── Mobile AI: floating button bottom-right + bottom sheet ── */}
      {!isFullscreen && (
        <div className="lg:hidden">
          <button
            type="button"
            onClick={() => setMobileAiOpen(true)}
            aria-label="Open AI assistant"
            className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-yellow-400 text-black shadow-[0_10px_36px_rgba(250,204,21,0.5)] transition-transform active:scale-90"
          >
            <MessageCircle size={22} />
          </button>

          <div
            aria-hidden={!mobileAiOpen}
            onClick={() => setMobileAiOpen(false)}
            className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${mobileAiOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="AI assistant"
            aria-hidden={!mobileAiOpen}
            className={`fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ease-out ${mobileAiOpen ? 'translate-y-0' : 'pointer-events-none translate-y-full'}`}
          >
            <div className={`overflow-hidden rounded-t-3xl border-t shadow-2xl ${isDarkTheme ? 'border-white/10 bg-zinc-950' : 'border-zinc-200 bg-white'}`}>
              <div className="flex items-center justify-between px-5 pb-2 pt-3">
                <div className="flex items-center gap-2.5">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${isDarkTheme ? 'bg-yellow-400/10 text-yellow-400' : 'bg-amber-50 text-amber-600'}`}>
                    <Sparkles size={16} />
                  </span>
                  <span>
                    <span className={`block text-sm font-bold ${isDarkTheme ? 'text-white' : 'text-zinc-900'}`}>AI Assistant</span>
                    <span className="block text-[10px] uppercase tracking-widest text-zinc-500">Ask about this workflow</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileAiOpen(false)}
                  aria-label="Close AI assistant"
                  className={`flex h-9 w-9 items-center justify-center rounded-full border ${isDarkTheme ? 'border-white/10 text-zinc-400' : 'border-zinc-200 text-zinc-600'}`}
                >
                  <X size={16} />
                </button>
              </div>
              <div className={`mx-4 flex h-[52vh] flex-col overflow-hidden rounded-2xl border ${isDarkTheme ? 'border-white/10 bg-black/40' : 'border-zinc-200 bg-zinc-50'}`}>
                <div className="flex-1 space-y-4 overflow-y-auto p-4">
                  {chatBubbles(mobileAssistantEndRef)}
                </div>
                {chatForm('mobile')}
              </div>
              <div className="h-5" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
