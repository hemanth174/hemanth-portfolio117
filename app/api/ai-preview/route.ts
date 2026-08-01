import { NextRequest, NextResponse } from 'next/server';

type ProjectContext = {
  title: string;
  description: string;
  liveUrl: string;
  codeUrl: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const DEFAULT_MODEL = 'gemini-3.5-flash';

const asText = (value: unknown, maxLength: number): string => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.replace(/\s+/g, ' ').trim().slice(0, maxLength);
};

const getModelName = () => {
  const model = asText(process.env.GEMINI_MODEL, 120) || DEFAULT_MODEL;
  return model.replace(/^models\//, '');
};

const getContextFromSearch = (url: string): ProjectContext => {
  const params = new URL(url).searchParams;

  return {
    title: asText(params.get('title'), 140) || 'this project',
    description: asText(params.get('description'), 3000),
    liveUrl: asText(params.get('liveUrl'), 260),
    codeUrl: asText(params.get('codeUrl'), 260),
  };
};

const getContextFromBody = (body: Record<string, unknown>): ProjectContext => ({
  title: asText(body.title, 140) || 'this project',
  description: asText(body.description, 3000),
  liveUrl: asText(body.liveUrl, 260),
  codeUrl: asText(body.codeUrl, 260),
});

const createSystemPrompt = (context: ProjectContext) => `You are the AI assistant for a single portfolio project preview.

Rules:
- Answer only questions about the active project in PROJECT_CONTEXT.
- Stay precise, factual, and consistent. Prefer one clear answer over multiple variations.
- If the same question is asked again, give the same direct answer.
- If the user asks about anything outside this project, reply exactly: "I can only answer questions about this project."
- Do not answer general coding, unrelated portfolio, personal, school, news, or other project questions.
- Do not invent features, tech stack, metrics, credentials, deployment details, or private information.
- If PROJECT_CONTEXT does not contain enough detail, say what is known from the context and what is not specified.
- Keep answers short, clear, and plain. Do not use markdown, bullets, numbering, bold, italics, or leading asterisks.
- Do not add preambles, disclaimers, or filler text.

PROJECT_CONTEXT:
Title: ${context.title}
Description: ${context.description || 'Not specified'}
Live URL: ${context.liveUrl || 'Not specified'}
Code URL: ${context.codeUrl || 'Not specified'}`;

const normalizeAssistantText = (text: string) => {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/^\s*[*-]\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^\s*#+\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const renderAssistantHtml = (context: ProjectContext, keyConfigured: boolean) => {
  const bootData = JSON.stringify({ context, keyConfigured })
    .replace(/</g, '\\u003c')
    .replace(/`/g, '\\`');

  return `<!doctype html>
<html lang="en" class="dark">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Project AI Assistant</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: { sans: ['Inter', 'sans-serif'] },
          colors: {
            zinc: { 950: '#09090b' },
            yellow: { 400: '#facc15' }
          }
        }
      }
    }
  </script>
  <style type="text/css">
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes float3d { 0%, 100% { transform: translateY(0) rotateX(18deg) rotateY(-18deg) rotateZ(0deg); } 50% { transform: translateY(-7px) rotateX(18deg) rotateY(-18deg) rotateZ(2deg); } }
    @keyframes ringSpin { from { transform: rotateZ(0deg); } to { transform: rotateZ(360deg); } }
    @keyframes barPulse { 0%, 100% { transform: scaleY(0.55); opacity: 0.5; } 50% { transform: scaleY(1); opacity: 1; } }
    @keyframes orbGlow { 0%, 100% { opacity: 0.55; transform: scale(1); } 50% { opacity: 1; transform: scale(1.1); } }
    .animate-in { animation: fadeIn 0.3s ease-out forwards; }
    .think-shell { perspective: 900px; transform-style: preserve-3d; }
    .think-ring { animation: ringSpin 8s linear infinite; transform-style: preserve-3d; }
    .think-float { animation: float3d 1.8s ease-in-out infinite; transform-style: preserve-3d; }
    .think-bar { animation: barPulse 1.05s ease-in-out infinite; transform-origin: center bottom; }
    .think-orb { animation: orbGlow 1.6s ease-in-out infinite; }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  </style>
</head>
<body class="bg-zinc-950 text-zinc-100 font-sans h-screen overflow-hidden antialiased">
  <div class="flex flex-col h-full relative">
    <div id="messages" class="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide scroll-smooth">
    </div>

    <div id="typing" class="hidden px-5 py-2">
      <div class="think-shell flex w-fit items-center gap-4 rounded-2xl rounded-bl-none border border-white/10 bg-zinc-900/70 px-4 py-3 shadow-[0_16px_45px_rgba(0,0,0,0.35)]">
        <div class="relative flex h-12 w-12 items-center justify-center">
          <div class="think-ring absolute inset-0 rounded-full border border-yellow-400/20 border-t-yellow-400/80"></div>
          <div class="think-orb h-5 w-5 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-[0_0_18px_rgba(250,204,21,0.55)]"></div>
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-bold uppercase tracking-[0.35em] text-yellow-400">Thinking</span>
            <span class="text-[10px] text-zinc-500">building a clear reply</span>
          </div>
          <div class="mt-2 flex items-end gap-1.5">
            <div class="think-bar h-4 w-1.5 rounded-full bg-yellow-400/80 [animation-delay:-0.2s]"></div>
            <div class="think-bar h-6 w-1.5 rounded-full bg-yellow-300/90 [animation-delay:-0.1s]"></div>
            <div class="think-bar h-3 w-1.5 rounded-full bg-yellow-400/70"></div>
            <div class="think-bar h-5 w-1.5 rounded-full bg-yellow-300/80 [animation-delay:-0.15s]"></div>
          </div>
        </div>
        <div class="think-float flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-zinc-800/80 text-yellow-300 shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M13 2L4 14h7l-1 8 10-12h-7l0-8z"></path>
          </svg>
        </div>
      </div>
    </div>

    <div class="p-4 bg-zinc-950 border-t border-white/5">
      <form id="composer" class="relative group">
        <div class="absolute -inset-0.5 bg-gradient-to-r from-yellow-400/20 to-blue-500/20 rounded-[24px] blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
        <div class="relative flex items-center gap-2 bg-zinc-900 border border-white/10 rounded-[22px] px-4 py-2 transition-all focus-within:border-yellow-400/50">
          <textarea 
            id="question" 
            placeholder="Ask about this project..." 
            rows="1" 
            class="flex-1 bg-transparent border-0 ring-0 focus:ring-0 text-sm py-2 resize-none outline-none placeholder:text-zinc-600"
          ></textarea>
          <button 
            id="send" 
            type="submit" 
            class="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-400 text-black transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale disabled:hover:scale-100"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 12h14M12 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </form>
    </div>
  </div>

  <script>
    const boot = ${bootData};
    const messagesEl = document.getElementById('messages');
    const typingEl = document.getElementById('typing');
    const form = document.getElementById('composer');
    const input = document.getElementById('question');
    const sendBtn = document.getElementById('send');

    function scrollToBottom() {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    function formatText(text) {
      const escaped = escapeHtml(text);
      return escaped
        .replace(/\\n\\n/g, '<div class="h-2"></div>')
        .replace(/\\n/g, '<br/>');
    }

    function addMessage(role, text) {
      const wrapper = document.createElement('div');
      wrapper.className = 'animate-in flex ' + (role === 'user' ? 'justify-end' : 'justify-start');
      
      const content = role === 'assistant' ? formatText(text) : escapeHtml(text);
      const theme = role === 'user' 
        ? 'bg-yellow-400 text-black font-semibold rounded-br-none' 
        : 'bg-zinc-900 text-zinc-200 border border-white/5 rounded-bl-none';

      const bubble = document.createElement('div');
      bubble.className = 'max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ' + theme;
      bubble.innerHTML = content;
      
      wrapper.appendChild(bubble);
      messagesEl.appendChild(wrapper);
      scrollToBottom();
    }

    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
      sendBtn.disabled = !input.value.trim();
    });

    if (!boot.keyConfigured) {
      addMessage('assistant', 'Gemini API key is missing. Please add your key to .env.local and restart the server.');
    } else {
      // Escape the title in the initial message
      const title = boot.context.title;
      addMessage('assistant', 'Hi! I can help with details about ' + title + '. What would you like to know?');
    }

    async function handleSend() {
      const question = input.value.trim();
      if (!question) return;

      addMessage('user', question);
      input.value = '';
      input.style.height = 'auto';
      sendBtn.disabled = true;

      if (!boot.keyConfigured) {
        setTimeout(() => {
          addMessage('assistant', 'I cannot process your request without a GEMINI_API_KEY. Please configure it in your environment.');
        }, 300);
        return;
      }

      typingEl.classList.remove('hidden');
      scrollToBottom();

      try {
        const res = await fetch('/api/ai-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...boot.context, question })
        });
        
        const data = await res.json();
        typingEl.classList.add('hidden');

        if (!res.ok) throw new Error(data.error || 'The AI is unavailable right now.');
        addMessage('assistant', data.answer);
      } catch (err) {
        typingEl.classList.add('hidden');
        addMessage('assistant', '⚠️ ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        input.focus();
        sendBtn.disabled = !input.value.trim();
        scrollToBottom();
      }
    }

    form.addEventListener('submit', (e) => { e.preventDefault(); handleSend(); });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });

    window.addEventListener('load', () => input.focus());
  </script>
</body>
</html>`;
};

export async function GET(request: NextRequest) {
  const context = getContextFromSearch(request.url);

  return new Response(renderAssistantHtml(context, Boolean(process.env.GEMINI_API_KEY)), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const question = asText(body.question, 600);
  const context = getContextFromBody(body);
  const apiKey = process.env.GEMINI_API_KEY;

  if (!question) {
    return NextResponse.json({ error: 'Please enter a project question.' }, { status: 400 });
  }

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Gemini is not configured. Add GEMINI_API_KEY to .env.local and restart the server.' },
      { status: 503 },
    );
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${getModelName()}:generateContent`;
  
  try {
    const geminiResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: createSystemPrompt(context) }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: question }],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1000,
        },
      }),
    });

    const data = (await geminiResponse.json()) as GeminiResponse;

    if (!geminiResponse.ok) {
      return NextResponse.json(
        { error: data.error?.message || 'Gemini could not answer right now.' },
        { status: 502 },
      );
    }

    const answer = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter(Boolean)
      .join('\n')
      .trim();

    return NextResponse.json({
      answer: normalizeAssistantText(answer || 'I can only answer questions about this project.'),
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to communicate with Gemini API.' },
      { status: 500 }
    );
  }
}

