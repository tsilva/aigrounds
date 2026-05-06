"use client";

import { usePathname } from "next/navigation";
import {
  useEffect,
  type FormEvent,
  type ReactNode,
  useMemo,
  useRef,
  useState,
} from "react";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

type PlaygroundAssistantShellProps = {
  children: ReactNode;
};

function createMessageId() {
  return `message-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readablePlaygroundName(pathname: string) {
  const slug = pathname.split("/").filter(Boolean).at(-1);

  if (!slug) {
    return "this playground";
  }

  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function useIsDesktopViewport() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    function syncViewport() {
      setIsDesktop(mediaQuery.matches);
    }

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);

    return () => mediaQuery.removeEventListener("change", syncViewport);
  }, []);

  return isDesktop;
}

export function PlaygroundAssistantShell({
  children,
}: PlaygroundAssistantShellProps) {
  const pathname = usePathname();
  const isDesktop = useIsDesktopViewport();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Ask me about the playground while you experiment. I can explain what changed and suggest what to try next.",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const playgroundName = useMemo(
    () => readablePlaygroundName(pathname),
    [pathname],
  );

  useEffect(() => {
    if (!isAssistantOpen) {
      return;
    }

    const focusTimer = window.setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);

    return () => window.clearTimeout(focusTimer);
  }, [isAssistantOpen]);

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const content = draft.trim();

    if (!content || isSending) {
      return;
    }

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content,
    };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setDraft("");
    setError(null);
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: nextMessages
            .filter((message) => message.id !== "welcome")
            .map(({ role, content }) => ({ role, content })),
          context: {
            pathname,
            playgroundName,
          },
        }),
      });

      const payload = (await response.json()) as {
        message?: string;
        error?: string;
      };

      if (!response.ok || !payload.message) {
        throw new Error(payload.error ?? "The assistant did not respond.");
      }

      const assistantMessage = payload.message;

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: createMessageId(),
          role: "assistant",
          content: assistantMessage,
        },
      ]);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "The assistant could not respond.",
      );
    } finally {
      setIsSending(false);
      textareaRef.current?.focus();
    }
  }

  const shellClassName =
    isDesktop && isAssistantOpen
      ? "min-h-screen bg-[#f7f9ff] text-slate-950 lg:grid lg:grid-cols-[minmax(0,1fr)_24rem]"
      : "min-h-screen bg-[#f7f9ff] text-slate-950";

  const assistantPanel = (
    <ChatPanel
      draft={draft}
      error={error}
      isSending={isSending}
      messages={messages}
      playgroundName={playgroundName}
      textareaRef={textareaRef}
      onDraftChange={setDraft}
      onClose={() => setIsAssistantOpen(false)}
      onSubmit={submitMessage}
    />
  );

  return (
    <div className={shellClassName}>
      <div id="playground-capture-root" className="min-w-0">
        {children}
      </div>

      {isDesktop && isAssistantOpen ? (
        <aside className="border-l border-slate-200 bg-white/90">
          <div className="sticky top-0 h-screen">{assistantPanel}</div>
        </aside>
      ) : null}

      {!isAssistantOpen ? (
        <button
          type="button"
          onClick={() => setIsAssistantOpen(true)}
          className="fixed right-4 bottom-4 z-40 inline-flex h-12 items-center gap-2 rounded-full bg-slate-950 px-4 text-sm font-semibold text-white shadow-[0_18px_50px_rgba(15,23,42,0.25)] transition hover:bg-slate-800"
          aria-expanded={isAssistantOpen}
          aria-controls="playground-assistant-panel"
        >
          <span aria-hidden="true">?</span>
          <span>Assistant</span>
        </button>
      ) : null}

      {!isDesktop && isAssistantOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-950/35">
          <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl">
            {assistantPanel}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ChatPanel({
  draft,
  error,
  isSending,
  messages,
  playgroundName,
  textareaRef,
  onDraftChange,
  onClose,
  onSubmit,
}: {
  draft: string;
  error: string | null;
  isSending: boolean;
  messages: ChatMessage[];
  playgroundName: string;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onDraftChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section
      id="playground-assistant-panel"
      className="flex h-full min-h-0 flex-col"
    >
      <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600">
            AI Guide
          </p>
          <h2 className="mt-1 truncate text-lg font-semibold text-slate-950">
            {playgroundName}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-lg leading-none text-slate-700 transition hover:border-slate-400"
          aria-label="Close assistant"
        >
          x
        </button>
      </header>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {messages.map((message) => (
          <article
            key={message.id}
            className={
              message.role === "user"
                ? "ml-auto max-w-[86%] rounded-[14px] bg-slate-950 px-4 py-3 text-sm leading-6 text-white"
                : "max-w-[86%] rounded-[14px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700"
            }
          >
            {message.content}
          </article>
        ))}

        {isSending ? (
          <div className="max-w-[86%] rounded-[14px] border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-xs text-slate-500">
            Thinking...
          </div>
        ) : null}
      </div>

      <form
        onSubmit={onSubmit}
        className="border-t border-slate-200 bg-white px-4 py-4"
      >
        {error ? (
          <p className="mb-3 rounded-[10px] border border-rose-200 bg-rose-50 px-3 py-2 text-sm leading-5 text-rose-700">
            {error}
          </p>
        ) : null}
        <label className="block">
          <span className="sr-only">Message assistant</span>
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            placeholder="Ask what to try next"
            rows={3}
            className="max-h-40 min-h-24 w-full resize-none rounded-[14px] border border-slate-200 bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100"
          />
        </label>
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="font-mono text-[11px] text-slate-400">Enter to send</p>
          <button
            type="submit"
            disabled={!draft.trim() || isSending}
            className="inline-flex h-10 items-center rounded-full bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSending ? "Sending" : "Send"}
          </button>
        </div>
      </form>
    </section>
  );
}
