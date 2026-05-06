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
import { getPlaygroundMetadataFromPathname } from "@/lib/playground-metadata";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  pathname?: string;
};

type ScreenshotToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

type PlaygroundScreenshot = {
  toolCall: ScreenshotToolCall;
  dataUrl: string;
  capturedAt: string;
  pathname: string;
  viewport: {
    width: number;
    height: number;
    devicePixelRatio: number;
  };
  image: {
    width: number;
    height: number;
  };
};

type ChatStreamEvent =
  | {
      type: "text";
      content: string;
    }
  | {
      type: "tool_call";
      toolCall: ScreenshotToolCall;
    }
  | {
      type: "done";
    };

type PlaygroundAssistantShellProps = {
  children: ReactNode;
};

type MarkdownLineKind = "paragraph" | "heading" | "list" | "quote" | "code";

const welcomeMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Ask me about the playground while you experiment. I can explain what changed and suggest what to try next.",
};

function isMarkdownBlockStart(line: string, currentKind: MarkdownLineKind) {
  if (!line.trim()) {
    return true;
  }

  if (currentKind === "code") {
    return line.trim().startsWith("```");
  }

  return (
    line.trim().startsWith("```") ||
    /^#{1,3}\s+/.test(line) ||
    /^>\s?/.test(line) ||
    /^[-*]\s+/.test(line) ||
    /^\d+[.)]\s+/.test(line)
  );
}

function safeLinkHref(href: string) {
  return /^(https?:|mailto:)/i.test(href) ? href : undefined;
}

function renderInlineMarkdown(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let index = 0;

  while (index < text.length) {
    const codeStart = text.indexOf("`", index);
    const boldStart = text.indexOf("**", index);
    const linkStart = text.indexOf("[", index);
    const italicStart = text.indexOf("*", index);

    const starts = [
      { type: "code", start: codeStart },
      { type: "bold", start: boldStart },
      { type: "link", start: linkStart },
      { type: "italic", start: italicStart },
    ]
      .filter(({ start }) => start >= 0)
      .sort((a, b) => a.start - b.start);

    const next = starts[0];

    if (!next) {
      nodes.push(text.slice(index));
      break;
    }

    if (next.start > index) {
      nodes.push(text.slice(index, next.start));
    }

    if (next.type === "code") {
      const end = text.indexOf("`", next.start + 1);

      if (end < 0) {
        nodes.push(text.slice(next.start));
        break;
      }

      nodes.push(
        <code
          key={`${keyPrefix}-code-${next.start}`}
          className="rounded bg-slate-200/70 px-1 py-0.5 font-mono text-[0.92em] text-slate-900"
        >
          {text.slice(next.start + 1, end)}
        </code>,
      );
      index = end + 1;
      continue;
    }

    if (next.type === "bold") {
      const end = text.indexOf("**", next.start + 2);

      if (end < 0) {
        nodes.push(text.slice(next.start));
        break;
      }

      nodes.push(
        <strong key={`${keyPrefix}-bold-${next.start}`} className="font-semibold text-slate-900">
          {renderInlineMarkdown(
            text.slice(next.start + 2, end),
            `${keyPrefix}-bold-${next.start}`,
          )}
        </strong>,
      );
      index = end + 2;
      continue;
    }

    if (next.type === "link") {
      const textEnd = text.indexOf("]", next.start + 1);
      const hrefStart = textEnd >= 0 ? text.indexOf("(", textEnd + 1) : -1;
      const hrefEnd = hrefStart >= 0 ? text.indexOf(")", hrefStart + 1) : -1;

      if (textEnd < 0 || hrefStart !== textEnd + 1 || hrefEnd < 0) {
        nodes.push(text.slice(next.start, next.start + 1));
        index = next.start + 1;
        continue;
      }

      const label = text.slice(next.start + 1, textEnd);
      const href = safeLinkHref(text.slice(hrefStart + 1, hrefEnd).trim());

      nodes.push(
        href ? (
          <a
            key={`${keyPrefix}-link-${next.start}`}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-indigo-700 underline underline-offset-2"
          >
            {renderInlineMarkdown(label, `${keyPrefix}-link-${next.start}`)}
          </a>
        ) : (
          `[${label}]`
        ),
      );
      index = hrefEnd + 1;
      continue;
    }

    const end = text.indexOf("*", next.start + 1);

    if (end < 0 || text[next.start + 1] === " ") {
      nodes.push(text.slice(next.start, next.start + 1));
      index = next.start + 1;
      continue;
    }

    nodes.push(
      <em key={`${keyPrefix}-em-${next.start}`} className="italic">
        {renderInlineMarkdown(
          text.slice(next.start + 1, end),
          `${keyPrefix}-em-${next.start}`,
        )}
      </em>,
    );
    index = end + 1;
  }

  return nodes;
}

function MarkdownMessage({ content }: { content: string }) {
  const lines = content.trim().split(/\r?\n/);
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      index += 1;
      continue;
    }

    if (trimmedLine.startsWith("```")) {
      const codeLines: string[] = [];
      index += 1;

      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        codeLines.push(lines[index]);
        index += 1;
      }

      blocks.push(
        <pre
          key={`code-${index}`}
          className="overflow-x-auto rounded-lg bg-slate-950 px-3 py-2 text-xs leading-5 text-slate-100"
        >
          <code>{codeLines.join("\n")}</code>
        </pre>,
      );
      index += 1;
      continue;
    }

    const headingMatch = trimmedLine.match(/^(#{1,3})\s+(.+)$/);

    if (headingMatch) {
      blocks.push(
        <h3
          key={`heading-${index}`}
          className="text-sm font-semibold leading-6 text-slate-950"
        >
          {renderInlineMarkdown(headingMatch[2], `heading-${index}`)}
        </h3>,
      );
      index += 1;
      continue;
    }

    if (/^>\s?/.test(trimmedLine)) {
      const quoteLines: string[] = [];

      while (index < lines.length && /^>\s?/.test(lines[index].trim())) {
        quoteLines.push(lines[index].trim().replace(/^>\s?/, ""));
        index += 1;
      }

      blocks.push(
        <blockquote
          key={`quote-${index}`}
          className="border-l-2 border-indigo-300 pl-3 text-slate-600"
        >
          {renderInlineMarkdown(quoteLines.join(" "), `quote-${index}`)}
        </blockquote>,
      );
      continue;
    }

    if (/^[-*]\s+/.test(trimmedLine)) {
      const items: string[] = [];

      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*]\s+/, ""));
        index += 1;
      }

      blocks.push(
        <ul key={`list-${index}`} className="list-disc space-y-1 pl-5">
          {items.map((item, itemIndex) => (
            <li key={`list-${index}-${itemIndex}`}>
              {renderInlineMarkdown(item, `list-${index}-${itemIndex}`)}
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    if (/^\d+[.)]\s+/.test(trimmedLine)) {
      const items: string[] = [];

      while (index < lines.length && /^\d+[.)]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+[.)]\s+/, ""));
        index += 1;
      }

      blocks.push(
        <ol key={`ordered-${index}`} className="list-decimal space-y-1 pl-5">
          {items.map((item, itemIndex) => (
            <li key={`ordered-${index}-${itemIndex}`}>
              {renderInlineMarkdown(item, `ordered-${index}-${itemIndex}`)}
            </li>
          ))}
        </ol>,
      );
      continue;
    }

    const paragraphLines = [trimmedLine];
    index += 1;

    while (
      index < lines.length &&
      !isMarkdownBlockStart(lines[index], "paragraph")
    ) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }

    blocks.push(
      <p key={`paragraph-${index}`}>
        {renderInlineMarkdown(paragraphLines.join(" "), `paragraph-${index}`)}
      </p>,
    );
  }

  return <div className="space-y-3">{blocks}</div>;
}

function createMessageId() {
  return `message-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function copyComputedStyles(source: Element, target: Element) {
  const computed = window.getComputedStyle(source);
  const cssText = Array.from(computed)
    .map(
      (property) =>
        `${property}:${computed.getPropertyValue(property)}${
          computed.getPropertyPriority(property) ? " !important" : ""
        };`,
    )
    .join("");

  target.setAttribute("style", cssText);

  const sourceChildren = Array.from(source.children);
  const targetChildren = Array.from(target.children);

  for (let index = 0; index < sourceChildren.length; index += 1) {
    const sourceChild = sourceChildren[index];
    const targetChild = targetChildren[index];

    if (targetChild) {
      copyComputedStyles(sourceChild, targetChild);
    }
  }
}

function imageFromSource(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not render screenshot."));
    image.src = source;
  });
}

async function capturePlaygroundScreenshot(
  toolCall: ScreenshotToolCall,
  pathname: string,
): Promise<PlaygroundScreenshot> {
  const root = document.getElementById("playground-capture-root");

  if (!root) {
    throw new Error("Could not find the playground surface to capture.");
  }

  const rect = root.getBoundingClientRect();
  const cropLeft = Math.max(0, -rect.left);
  const cropTop = Math.max(0, -rect.top);
  const visibleLeft = Math.max(0, rect.left);
  const visibleTop = Math.max(0, rect.top);
  const rawWidth = Math.max(
    1,
    Math.min(rect.width - cropLeft, window.innerWidth - visibleLeft),
  );
  const rawHeight = Math.max(
    1,
    Math.min(rect.height - cropTop, window.innerHeight - visibleTop),
  );
  const scale = Math.min(1, 1100 / rawWidth, 850 / rawHeight);
  const outputWidth = Math.max(1, Math.round(rawWidth * scale));
  const outputHeight = Math.max(1, Math.round(rawHeight * scale));
  const clone = root.cloneNode(true) as HTMLElement;

  copyComputedStyles(root, clone);

  const wrapper = document.createElement("div");
  wrapper.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
  wrapper.style.width = `${rect.width}px`;
  wrapper.style.height = `${rect.height}px`;
  wrapper.style.overflow = "hidden";
  wrapper.style.background = "#f7f9ff";
  wrapper.style.transform = `translate(${-cropLeft}px, ${-cropTop}px)`;
  wrapper.appendChild(clone);

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("width", String(rawWidth));
  svg.setAttribute("height", String(rawHeight));
  svg.setAttribute("viewBox", `0 0 ${rawWidth} ${rawHeight}`);

  const foreignObject = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "foreignObject",
  );
  foreignObject.setAttribute("width", String(rawWidth));
  foreignObject.setAttribute("height", String(rawHeight));
  foreignObject.appendChild(wrapper);
  svg.appendChild(foreignObject);

  const serializedSvg = new XMLSerializer().serializeToString(svg);
  const image = await imageFromSource(
    `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serializedSvg)}`,
  );
  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not create screenshot canvas.");
  }

  context.fillStyle = "#f7f9ff";
  context.fillRect(0, 0, outputWidth, outputHeight);
  context.scale(scale, scale);
  context.drawImage(image, 0, 0);

  return {
    toolCall,
    dataUrl: canvas.toDataURL("image/jpeg", 0.82),
    capturedAt: new Date().toISOString(),
    pathname,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
    },
    image: {
      width: outputWidth,
      height: outputHeight,
    },
  };
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
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [draft, setDraft] = useState("");
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toolStatus, setToolStatus] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const playgroundName = useMemo(
    () =>
      getPlaygroundMetadataFromPathname(pathname)?.title ??
      "this playground",
    [pathname],
  );
  const playgroundContext = useMemo(
    () => getPlaygroundMetadataFromPathname(pathname),
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
      pathname,
    };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setDraft("");
    setError(null);
    setIsSending(true);

    try {
      await streamAssistantResponse(nextMessages);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "The assistant could not respond.",
      );
    } finally {
      setIsSending(false);
      setToolStatus(null);
      textareaRef.current?.focus();
    }
  }

  async function streamAssistantResponse(
    conversationMessages: ChatMessage[],
    screenshot?: PlaygroundScreenshot,
  ): Promise<string> {
    const requestMessages = conversationMessages
      .filter(
        (message) => message.id !== "welcome" && message.pathname === pathname,
      )
      .map(({ role, content }) => ({ role, content }));
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: requestMessages,
        context: {
          pathname,
          playgroundName,
          playground: playgroundContext,
        },
        screenshot,
        stream: true,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      throw new Error(payload?.error ?? "The assistant did not respond.");
    }

    const contentType = response.headers.get("Content-Type") ?? "";

    if (contentType.includes("application/json")) {
      const payload = (await response.json()) as {
        message?: string;
        error?: string;
      };

      if (!payload.message) {
        throw new Error(payload.error ?? "The assistant did not respond.");
      }

      const assistantMessage = payload.message;

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: createMessageId(),
          role: "assistant",
          content: assistantMessage,
          pathname,
        },
      ]);
      return assistantMessage;
    }

    if (!response.body) {
      throw new Error("The assistant did not return a response stream.");
    }

    const streamingMessageId = createMessageId();
    let assistantMessage = "";
    let eventBuffer = "";

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: streamingMessageId,
        role: "assistant",
        content: "",
        pathname,
      },
    ]);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    async function handleStreamEvent(event: ChatStreamEvent) {
      if (event.type === "text") {
        assistantMessage += event.content;
        setMessages((currentMessages) =>
          currentMessages.map((message) =>
            message.id === streamingMessageId
              ? { ...message, content: assistantMessage }
              : message,
          ),
        );
        return;
      }

      if (event.type === "tool_call") {
        if (screenshot) {
          throw new Error("The assistant requested another screenshot.");
        }

        if (!assistantMessage.trim()) {
          setMessages((currentMessages) =>
            currentMessages.filter(
              (message) => message.id !== streamingMessageId,
            ),
          );
        }

        setToolStatus("Looking at the current playground...");
        const capturedScreenshot = await capturePlaygroundScreenshot(
          event.toolCall,
          pathname,
        );
        setToolStatus("Screenshot captured. Reading the graph...");
        assistantMessage = await streamAssistantResponse(
          conversationMessages,
          capturedScreenshot,
        );
      }
    }

    while (true) {
      const { done, value } = await reader.read();
      const chunk = value ? decoder.decode(value, { stream: !done }) : "";

      if (chunk) {
        eventBuffer += chunk;
        const lines = eventBuffer.split(/\r?\n/);
        eventBuffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) {
            continue;
          }

          await handleStreamEvent(JSON.parse(line) as ChatStreamEvent);
        }
      }

      if (done) {
        break;
      }
    }

    const finalChunk = decoder.decode();

    if (finalChunk) {
      eventBuffer += finalChunk;
    }

    if (eventBuffer.trim()) {
      await handleStreamEvent(JSON.parse(eventBuffer) as ChatStreamEvent);
    }

    if (!assistantMessage.trim()) {
      setMessages((currentMessages) =>
        currentMessages.filter((message) => message.id !== streamingMessageId),
      );
    }

    return assistantMessage;
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
      messages={messages.filter(
        (message) => message.id === "welcome" || message.pathname === pathname,
      )}
      playgroundName={playgroundName}
      textareaRef={textareaRef}
      toolStatus={toolStatus}
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
          className="fixed right-4 bottom-4 z-40 inline-flex min-h-14 items-center gap-3 rounded-full border border-white/70 bg-slate-950 px-5 py-3 text-left text-white shadow-[0_18px_50px_rgba(15,23,42,0.28)] transition hover:-translate-y-0.5 hover:bg-slate-800 focus:ring-4 focus:ring-indigo-200 focus:outline-none"
          aria-expanded={isAssistantOpen}
          aria-controls="playground-assistant-panel"
          aria-label="Open chat"
        >
          <span
            aria-hidden="true"
            className="grid h-8 w-8 place-items-center rounded-full bg-indigo-500 font-mono text-base font-bold"
          >
            ?
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-200">
              AI Guide
            </span>
            <span className="mt-1 text-sm font-semibold">Open chat</span>
          </span>
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
  toolStatus,
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
  toolStatus: string | null;
  onDraftChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const lastMessage = messages.at(-1);
  const shouldShowThinking =
    (isSending || toolStatus) &&
    !(
      lastMessage?.role === "assistant" &&
      lastMessage.content.trim().length > 0
    );

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
            {message.role === "assistant" ? (
              <MarkdownMessage content={message.content} />
            ) : (
              message.content
            )}
          </article>
        ))}

        {shouldShowThinking ? (
          <div className="max-w-[86%] rounded-[14px] border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-xs text-slate-500">
            {toolStatus ?? "Thinking..."}
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
