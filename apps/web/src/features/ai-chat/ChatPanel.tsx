/**
 * ChatPanel — AI assistant chat region (pill → open → typing → response).
 *
 * Ported dari prototype `prototype-app.jsx:1057-1200` (`AiAssistant`).
 *
 * Fix bug #5 (prototype): aria-live="polite" + aria-relevant="additions"
 * on message log container. Original prototype's chat region tidak
 * announce streaming messages ke screen reader — masalah a11y kritikal untuk
 * UX yang depend pada asynchronous content delivery (AI streaming reply).
 *
 * Aturan a11y:
 *   - HANYA message log container yang `aria-live` — composer textarea
 *     tidak (kalau iya, screen reader akan re-announce setiap keystroke
 *     yang sedang user ketik).
 *   - `aria-atomic="false"` — pembaca hanya announce node yang baru
 *     ditambahkan, bukan re-read seluruh log setiap update.
 *   - `aria-relevant="additions"` — hanya bilang ketika ada message baru,
 *     bukan ketika ada penghapusan (we tidak hapus messages dari log).
 *   - `role="log"` — sesuai WAI-ARIA pattern untuk message log container.
 *   - Send button `disabled` saat busy untuk mencegah double-submit (mirror
 *     prototype-app.jsx:1194).
 *
 * NOTE: Actual `window.claude.complete()` / `POST /api/v1/ai/ask` integration
 * deferred ke Phase 8.6/9 (lihat docs/api-contract.md §9). Component ini
 * stub dengan mock reply latency supaya a11y wiring + layout reviewable.
 */
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactElement,
} from 'react';

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
}

export interface ChatPanelContext {
  page?: string;
  datasetId?: string;
}

export interface ChatPanelProps {
  /**
   * Optional context yang akan di-inject ke prompt. Mengubah greeting +
   * suggestions sesuai page/dataset.
   */
  context?: ChatPanelContext | null;
  /**
   * Optional initial messages — useful untuk testing atau seed previous
   * conversation dari backend di Phase 9.
   */
  initialMessages?: ChatMessage[];
  /**
   * Initial open state. Default `'pill'` (collapsed badge).
   */
  initialState?: 'pill' | 'open';
}

function randomId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function buildGreeting(context: ChatPanelContext | null | undefined): string {
  if (context?.datasetId) {
    return `Saya bisa bantu dengan dataset "${context.datasetId}". Misalnya, "Berapa sumur aktif di sini?" atau "Bandingkan dengan area lain".`;
  }
  return 'Halo! Tanya apa saja tentang data hulu migas di ekosistem SPEKTRUM.';
}

function buildSuggestions(context: ChatPanelContext | null | undefined): string[] {
  if (context?.datasetId) {
    return [
      'Berapa sumur aktif di area ini?',
      'Rata-rata produksi 2024',
      'Bandingkan dengan area terdekat',
    ];
  }
  return [
    'Berapa total dataset di ekosistem?',
    'Cari WK di Sumatra',
    'Provider mana yang paling aktif?',
  ];
}

export function ChatPanel({
  context = null,
  initialMessages,
  initialState = 'pill',
}: ChatPanelProps): ReactElement {
  const [panelState, setPanelState] = useState<'pill' | 'open'>(initialState);
  const [messages, setMessages] = useState<ChatMessage[]>(
    () =>
      initialMessages ?? [
        { id: randomId(), role: 'assistant', text: buildGreeting(context) },
      ],
  );
  const [input, setInput] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, busy]);

  const ask = async (question: string): Promise<void> => {
    const trimmed = question.trim();
    if (!trimmed || busy) return;

    setMessages((prev) => [
      ...prev,
      { id: randomId(), role: 'user', text: trimmed },
    ]);
    setInput('');
    setBusy(true);

    // Stub reply — actual API wiring di Phase 8.6/9.
    // Phase 9 spec: POST /api/v1/ai/ask { prompt, context } → SSE stream.
    try {
      const reply = await mockReply(trimmed);
      setMessages((prev) => [
        ...prev,
        { id: randomId(), role: 'assistant', text: reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: randomId(),
          role: 'assistant',
          text: 'Maaf, saya tidak dapat memproses permintaan saat ini.',
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    void ask(input);
  };

  const onComposerKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void ask(input);
    }
  };

  if (panelState === 'pill') {
    return (
      <button
        type="button"
        onClick={() => setPanelState('open')}
        aria-label="Open AI assistant"
        style={{
          position: 'absolute',
          right: 16,
          bottom: 16,
          padding: '8px 14px',
          borderRadius: 999,
          border: '1px solid #e6e1d4',
          background: '#ffffff',
          boxShadow: '0 4px 12px rgba(14,23,38,.12)',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          zIndex: 600,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4a7afc, #7a5cb8)',
            color: '#fff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          ✦
        </span>
        <span style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
          <span style={{ fontSize: 12.5, fontWeight: 700 }}>AI Assistant</span>
          <span style={{ fontSize: 10.5, color: '#6b7280' }}>Ask anything…</span>
        </span>
      </button>
    );
  }

  const suggestions = buildSuggestions(context);

  return (
    <section
      aria-label="AI assistant"
      style={{
        position: 'absolute',
        right: 16,
        bottom: 16,
        width: 360,
        maxHeight: 480,
        display: 'flex',
        flexDirection: 'column',
        background: '#ffffff',
        border: '1px solid #e6e1d4',
        borderRadius: 16,
        boxShadow: '0 12px 32px rgba(14,23,38,.18)',
        overflow: 'hidden',
        zIndex: 600,
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: '12px 14px',
          borderBottom: '1px solid #e6e1d4',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #4a7afc, #7a5cb8)',
            color: '#fff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
          }}
        >
          ✦
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>AI Assistant</div>
          <div style={{ fontSize: 10.5, color: '#6b7280' }}>
            Powered by Claude · SPEKTRUM AI
          </div>
        </div>
        <button
          type="button"
          onClick={() => setPanelState('pill')}
          aria-label="Minimize AI assistant"
          style={{
            width: 26,
            height: 26,
            border: 0,
            background: 'transparent',
            cursor: 'pointer',
            fontSize: 14,
            color: '#4b5563',
          }}
        >
          ×
        </button>
      </header>

      {/*
        Fix bug #5 (prototype): message log container has
        aria-live="polite" + aria-relevant="additions" + role="log".
        Streaming assistant replies dan user inputs sekarang ter-announce
        ke screen reader. aria-atomic="false" supaya pembaca tidak
        re-read seluruh transcript setiap append.
      */}
      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-atomic="false"
        aria-relevant="additions"
        aria-label="Conversation"
        aria-busy={busy}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 14,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          minHeight: 200,
        }}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              display: 'flex',
              justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                maxWidth: '85%',
                padding: '8px 12px',
                borderRadius: 12,
                fontSize: 12,
                lineHeight: 1.55,
                background: m.role === 'user' ? '#1f8a4a' : '#f4f1ea',
                color: m.role === 'user' ? '#ffffff' : '#0e1726',
              }}
            >
              {m.text}
            </div>
          </div>
        ))}
        {busy && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div
              aria-label="Assistant is composing a reply"
              style={{
                padding: '10px 14px',
                borderRadius: 12,
                background: '#f4f1ea',
                display: 'flex',
                gap: 4,
              }}
            >
              <span style={{ fontSize: 14 }}>…</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && !busy && (
        <div
          style={{
            padding: '0 14px 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => void ask(s)}
              style={{
                alignSelf: 'flex-start',
                padding: '4px 10px',
                borderRadius: 999,
                border: '1px solid #c7d8f4',
                background: '#eaf1fb',
                color: '#2a5fb8',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Composer — JANGAN aria-live ke sini (akan re-announce keystrokes) */}
      <form
        onSubmit={onSubmit}
        style={{
          padding: 12,
          borderTop: '1px solid #e6e1d4',
          display: 'flex',
          gap: 8,
          alignItems: 'center',
        }}
      >
        <label htmlFor="ai-composer" className="sr-only" style={{ display: 'none' }}>
          Tanyakan sesuatu ke AI Assistant
        </label>
        <input
          id="ai-composer"
          type="text"
          placeholder="Tanya apa saja…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onComposerKeyDown}
          disabled={busy}
          aria-label="Ask the AI assistant"
          style={{
            flex: 1,
            border: '1px solid #e6e1d4',
            borderRadius: 8,
            padding: '8px 10px',
            fontSize: 12,
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          aria-label="Send message"
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: 0,
            background: busy || !input.trim() ? '#a7d3b6' : '#1f8a4a',
            color: '#fff',
            cursor: busy || !input.trim() ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            fontSize: 12,
          }}
        >
          Send
        </button>
      </form>
    </section>
  );
}

// Mock reply untuk Phase 8.5 stub. Phase 8.6+ replace dengan POST /api/v1/ai/ask.
async function mockReply(question: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 450));
  return `(stub) Pertanyaan diterima: "${question}". API integration di Phase 8.6.`;
}
