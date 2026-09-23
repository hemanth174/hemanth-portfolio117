'use client'

import { useEffect, useRef, useState } from 'react'
import { Bot, Send, Sparkles, X } from 'lucide-react'

type Msg = { role: 'user' | 'assistant'; text: string }

const SUGGESTIONS = [
  "Do you know about Hemanth's project HOAS?",
  'What skills does Hemanth have?',
  "Tell me about Hemanth's experience",
  'How can I contact Hemanth?',
]

const GREETING: Msg = {
  role: 'assistant',
  text: "Hi! I'm Hemanth's AI assistant. Ask me about his projects, skills, experience — or just say hi.",
}

const LIMIT_TEXT = 'Daily free limit reached (20/20). Please come back tomorrow for more questions.'
const DISMISS_KEY = 'sitechat-suggest-dismissed'
const PROACTIVE_DELAY_MS = 6000
const ROTATE_MS = 10 * 60 * 1000 // fresh suggestion every 10 minutes
const SHEET_CLOSE_PX = 90

export const SiteChatbot = () => {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [locked, setLocked] = useState(false)
  const [suggestIdx, setSuggestIdx] = useState(0)
  const [showSuggest, setShowSuggest] = useState(false)
  // AI-written suggestions when the AI is reachable, else the defaults below.
  const [aiSuggest, setAiSuggest] = useState<string[]>([])
  const activeSuggest = aiSuggest.length > 0 ? aiSuggest : SUGGESTIONS
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartY = useRef(0)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const greeted = useRef(false)

  // Proactive suggestion bubble: appears after a delay, rotates every
  // 10 minutes while the site is open. Timers die with the page, and a
  // dismiss lasts for the session.
  useEffect(() => {
    let dismissed = false
    try {
      dismissed = sessionStorage.getItem(DISMISS_KEY) === '1'
    } catch {
      // storage unavailable — still show suggestions
    }
    if (dismissed) return
    const show = window.setTimeout(() => setShowSuggest(true), PROACTIVE_DELAY_MS)
    const rotate = window.setInterval(() => {
      try {
        if (sessionStorage.getItem(DISMISS_KEY) === '1') return
      } catch {
        // ignore
      }
      setSuggestIdx((i) => i + 1)
    }, ROTATE_MS)
    return () => {
      window.clearTimeout(show)
      window.clearInterval(rotate)
    }
  }, [])

  // Ask the AI for fresh suggestions once per page load. Any failure
  // (AI down, quota out, offline) silently keeps the default list.
  useEffect(() => {
    let cancelled = false
    fetch('/api/ai-preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scope: 'site', suggest: true }),
    })
      .then((res) => res.json())
      .then((data: { suggestions?: unknown }) => {
        if (cancelled || !Array.isArray(data.suggestions)) return
        const clean = data.suggestions
          .filter((s): s is string => typeof s === 'string')
          .map((s) => s.trim())
          .filter((s) => s.length >= 10 && s.length <= 90)
          .slice(0, 4)
        if (clean.length > 0) setAiSuggest(clean)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  // Lock background scroll while the mobile sheet is open
  useEffect(() => {
    if (!open) return
    if (window.innerWidth >= 768) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open ])

  // Auto-scroll chat to the newest message
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [msgs, loading, open])

  const openChat = (withMessage?: string) => {
    setOpen(true)
    setShowSuggest(false)
    if (!greeted.current) {
      greeted.current = true
      setMsgs([GREETING])
    }
    if (withMessage) {
      // Let the panel paint before the message lands
      window.setTimeout(() => sendMessage(withMessage), 150)
    }
  }

  const dismissSuggest = () => {
    setShowSuggest(false)
    try {
      sessionStorage.setItem(DISMISS_KEY, '1')
    } catch {
      // ignore
    }
  }

  const sendMessage = async (raw?: string) => {
    const text = (raw ?? input).trim()
    if (!text || loading || locked) return
    setInput('')
    setMsgs((m) => [...m, { role: 'user', text }])
    setLoading(true)
    try {
      const res = await fetch('/api/ai-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scope: 'site',
          title: "Hemanth's Portfolio",
          description: 'Personal portfolio website of Hemanth Atthuluri.',
          liveUrl: '',
          codeUrl: '',
          question: text,
        }),
      })
      const data = (await res.json()) as { answer?: string; error?: string; limitReached?: boolean }
      if (!res.ok) {
        if (res.status === 429 || data.limitReached) {
          setLocked(true)
          setMsgs((m) => [...m, { role: 'assistant', text: data.error || LIMIT_TEXT }])
          return
        }
        throw new Error(data.error || 'The assistant is unavailable right now.')
      }
      setMsgs((m) => [...m, { role: 'assistant', text: data.answer || 'Sorry, I could not answer that.' }])
    } catch (err) {
      setMsgs((m) => [
        ...m,
        { role: 'assistant', text: err instanceof Error ? err.message : 'The assistant is unavailable right now.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  // ── Mobile sheet: drag the handle down to close (only way to dismiss) ──
  const onDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true)
    dragStartY.current = e.clientY
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onDragMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    const dy = e.clientY - dragStartY.current
    setDragY(dy > 0 ? dy : 0)
  }
  const onDragEnd = () => {
    if (!isDragging) return
    setIsDragging(false)
    if (dragY > SHEET_CLOSE_PX) setOpen(false)
    setDragY(0)
  }

  const messages = (
    <>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-yellow-400 dark:bg-yellow-300 text-black font-medium rounded-br-md'
                  : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 rounded-bl-md border border-zinc-200 dark:border-zinc-800'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-bl-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              {[0, 1, 2].map((d) => (
                <span
                  key={d}
                  style={{ animationDelay: `${d * 0.18}s` }}
                  className="h-2 w-2 rounded-full bg-amber-500 dark:bg-yellow-300 animate-bounce"
                />
              ))}
            </div>
          </div>
        )}
        {msgs.length <= 1 && !loading && (
          <div className="flex flex-wrap gap-2 pt-1">
            {activeSuggest.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-[11px] font-semibold px-3 py-1.5 rounded-full border border-yellow-500/60 dark:border-yellow-400/50 text-amber-700 dark:text-yellow-300 hover:bg-yellow-400 hover:text-black dark:hover:bg-yellow-300 dark:hover:text-black transition-colors cursor-pointer text-left"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          sendMessage()
        }}
        className="border-t border-zinc-200 dark:border-zinc-800 p-3"
      >
        <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            rows={1}
            disabled={locked}
            placeholder={locked ? 'Daily limit reached (20/20)' : 'Ask about Hemanth... (Enter to send)'}
            className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-zinc-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={loading || locked || !input.trim()}
            aria-label="Send message"
            title="Send message"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-yellow-400 dark:bg-yellow-300 text-black transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Send size={15} />
          </button>
        </div>
        {locked && (
          <p className="mt-2 text-[11px] text-center text-amber-600 dark:text-yellow-400 font-semibold">{LIMIT_TEXT}</p>
        )}
      </form>
    </>
  )

  const header = (closable: boolean, roundedTop: boolean) => (
    <div
      className={`flex items-center gap-3 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-yellow-400 dark:bg-yellow-300 text-black ${
        roundedTop ? 'rounded-t-2xl' : ''
      }`}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-yellow-300">
        <Bot size={18} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black tracking-wide">HEMANTH&apos;S AI</p>
        <p className="text-[11px] font-semibold opacity-70 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-green-700 animate-pulse" /> Online · replies instantly
        </p>
      </div>
      {closable && (
        <button
          onClick={() => setOpen(false)}
          aria-label="Close chat"
          className="hidden md:flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/10 transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )

  return (
    <>
      <style>{`
        @keyframes sitechat-mac-open {
          0% { opacity: 0; transform: scale(0.65) translateY(26px); }
          60% { opacity: 1; transform: scale(1.015) translateY(-2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .sitechat-mac-open {
          transform-origin: bottom right;
          animation: sitechat-mac-open 0.38s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .sitechat-mac-open-mobile {
          transform-origin: bottom center;
          animation: sitechat-mac-open 0.38s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .sitechat-mac-open, .sitechat-mac-open-mobile { animation: none; }
        }
      `}</style>
      {/* Proactive suggestion bubble */}
      {showSuggest && !open && (
        <div className="fixed bottom-24 right-5 z-[70] max-w-[270px]">
          <div className="relative rounded-2xl rounded-br-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl p-3.5 pr-9">
            <button
              onClick={dismissSuggest}
              aria-label="Dismiss suggestion"
              className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X size={13} />
            </button>
            <p className="text-[10px] font-bold tracking-[0.2em] text-amber-600 dark:text-yellow-400 flex items-center gap-1">
              <Sparkles size={11} /> TRY ASKING
            </p>
            <button
              onClick={() => openChat(activeSuggest[suggestIdx % activeSuggest.length])}
              className="mt-1.5 block text-left text-[13px] font-semibold leading-snug text-zinc-800 dark:text-zinc-200 hover:text-amber-600 dark:hover:text-yellow-300 transition-colors cursor-pointer"
            >
              “{activeSuggest[suggestIdx % activeSuggest.length]}”
            </button>
          </div>
        </div>
      )}

      {/* Floating button */}
      {!open && (
        <button
          onClick={() => openChat()}
          aria-label="Open AI chat"
          title="Chat with Hemanth's AI"
          className="fixed bottom-5 right-5 z-[70] flex h-14 w-14 items-center justify-center rounded-full bg-yellow-400 dark:bg-yellow-300 text-black shadow-[0_10px_36px_rgba(250,204,21,0.5)] hover:scale-105 active:scale-95 transition-transform cursor-pointer"
        >
          {showSuggest && (
            <span className="absolute inset-0 rounded-full bg-yellow-400 dark:bg-yellow-300 animate-ping opacity-30" />
          )}
          <Bot size={24} className="relative" />
        </button>
      )}

      {/* Desktop chat card */}
      {open && (
        <div className="sitechat-mac-open hidden md:flex fixed bottom-24 right-5 z-[70] w-[380px] max-h-[560px] h-[540px] flex-col overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl font-mono">
          {header(true, true)}
          {messages}
        </div>
      )}

      {/* Mobile backdrop (tap does NOT close — drag the handle) */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 z-[70] bg-black/50 transition-opacity duration-300 md:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* Mobile bottom sheet — drag down to close only */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="AI chat"
        aria-hidden={!open}
        className={`fixed inset-x-0 bottom-0 z-[71] md:hidden font-mono ${
          !isDragging ? 'transition-transform duration-300 ease-out' : ''
        } ${!open ? 'pointer-events-none' : ''}`}
        style={{ transform: open ? `translateY(${dragY}px)` : 'translateY(110%)' }}
      >
        <div className="sitechat-mac-open-mobile overflow-hidden rounded-t-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl flex flex-col h-[72dvh]">
          <div
            onPointerDown={onDragStart}
            onPointerMove={onDragMove}
            onPointerUp={onDragEnd}
            onPointerCancel={onDragEnd}
            className="flex touch-none cursor-grab select-none flex-col items-center gap-1 px-6 pt-2.5 pb-1 active:cursor-grabbing shrink-0"
          >
            <span className="h-1.5 w-12 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <span className="text-[9px] font-bold tracking-[0.3em] text-zinc-400 dark:text-zinc-500">
              DRAG DOWN TO CLOSE
            </span>
          </div>
          {header(false, false)}
          {messages}
        </div>
      </div>
    </>
  )
}
