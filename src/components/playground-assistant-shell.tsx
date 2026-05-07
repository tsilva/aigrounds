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
import {
  getPlaygroundMetadataFromPathname,
} from "@/lib/playground-metadata";
import { type TutorStep } from "@/lib/tutor-plans";
import {
  isChatStreamEvent,
  type ChatRole,
  type ChatStreamEvent,
  type PlaygroundScreenshot,
  type ScreenshotToolCall,
  type TutorContext,
  type TutorRequestPhase,
} from "@/lib/assistant-chat";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
  pathname?: string;
};

type ScreenshotAction = {
  id: string;
  createdAt: number;
  pathname: string;
  capturedAt: string;
  dataUrl: string;
  previewUrl: string;
  image: PlaygroundScreenshot["image"];
};

type TutorPhase = "predict" | "observe" | "reflect" | "readyNext" | "complete";

type QuickReply = {
  label: string;
  message: string;
  requestPhase: TutorRequestPhase;
  nextPhase: TutorPhase;
  nextStepIndex?: number;
};

type PlaygroundAssistantShellProps = {
  children: ReactNode;
};

type MarkdownLineKind = "paragraph" | "heading" | "list" | "quote" | "code";

const welcomeMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  createdAt: 0,
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

async function readAssistantError(response: Response) {
  const responseText = await response.text();

  try {
    const payload = JSON.parse(responseText) as unknown;

    if (isRecord(payload) && typeof payload.error === "string") {
      return payload.error;
    }
  } catch {
    return (
      responseText.slice(0, 300) ||
      `The assistant request failed with status ${response.status}.`
    );
  }

  return (
    responseText.slice(0, 300) ||
    `The assistant request failed with status ${response.status}.`
  );
}

async function readAssistantMessage(response: Response) {
  const payload = (await response.json()) as unknown;

  if (!isRecord(payload)) {
    throw new Error("The assistant returned an invalid JSON response.");
  }

  if (typeof payload.error === "string") {
    throw new Error(payload.error);
  }

  if (typeof payload.message !== "string" || !payload.message.trim()) {
    throw new Error("The assistant did not respond.");
  }

  return payload.message;
}

function parseStreamEvent(line: string) {
  const parsed = JSON.parse(line) as unknown;

  if (!isChatStreamEvent(parsed)) {
    throw new Error("The assistant returned an invalid stream event.");
  }

  return parsed;
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

function createTimelineTimestamp() {
  return Date.now();
}

function createScreenshotPreviewUrl(dataUrl: string) {
  const [metadata, base64Data] = dataUrl.split(",");
  const mimeType =
    metadata.match(/^data:([^;]+);base64$/)?.[1] ?? "image/jpeg";
  const binary = window.atob(base64Data ?? "");
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return window.URL.createObjectURL(new Blob([bytes], { type: mimeType }));
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

function tutorContextFromStep(
  step: TutorStep,
  stepIndex: number,
  phase: TutorRequestPhase,
): TutorContext {
  return {
    mode: "guide",
    phase,
    stepIndex,
    stepTitle: step.title,
    experiment: step.experiment,
    predictionQuestion: step.predictionQuestion,
    observationPrompt: step.observationPrompt,
    takeaway: step.takeaway,
  };
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
  const [screenshotActions, setScreenshotActions] = useState<
    ScreenshotAction[]
  >([]);
  const [isTutorActive, setIsTutorActive] = useState(false);
  const [tutorStepIndex, setTutorStepIndex] = useState(0);
  const [tutorPhase, setTutorPhase] = useState<TutorPhase>("predict");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const screenshotActionsRef = useRef<ScreenshotAction[]>([]);

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
  const tutorPlan = playgroundContext?.tutorPlan;
  const currentTutorStep = tutorPlan?.steps[tutorStepIndex];

  useEffect(() => {
    if (!isAssistantOpen) {
      return;
    }

    const focusTimer = window.setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);

    return () => window.clearTimeout(focusTimer);
  }, [isAssistantOpen]);

  useEffect(() => {
    screenshotActionsRef.current = screenshotActions;
  }, [screenshotActions]);

  useEffect(
    () => () => {
      for (const action of screenshotActionsRef.current) {
        window.URL.revokeObjectURL(action.previewUrl);
      }
    },
    [],
  );

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const content = draft.trim();

    if (!content || isSending) {
      return;
    }

    await sendChatMessage(content);
  }

  async function sendChatMessage(
    content: string,
    tutorContext?: TutorContext,
  ): Promise<boolean> {
    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content,
      createdAt: createTimelineTimestamp(),
      pathname,
    };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setDraft("");
    setError(null);
    setIsSending(true);

    try {
      await streamAssistantResponse(
        nextMessages,
        undefined,
        tutorContext ??
          (isTutorActive && currentTutorStep
            ? tutorContextFromStep(
                currentTutorStep,
                tutorStepIndex,
                tutorPhase === "readyNext" ? "reflect" : tutorPhase,
              )
            : undefined),
      );
      return true;
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "The assistant could not respond.",
      );
      return false;
    } finally {
      setIsSending(false);
      setToolStatus(null);
      textareaRef.current?.focus();
    }
  }

  function handleQuickReply(reply: QuickReply) {
    if (!tutorPlan) {
      return;
    }

    const nextStepIndex = reply.nextStepIndex ?? tutorStepIndex;
    const requestStep = tutorPlan.steps[nextStepIndex];

    if (!requestStep || isSending) {
      return;
    }

    const previousTutorState = {
      isTutorActive,
      tutorPhase,
      tutorStepIndex,
    };

    setIsTutorActive(true);
    setTutorStepIndex(nextStepIndex);
    setTutorPhase(reply.nextPhase);
    void sendChatMessage(
      reply.message,
      tutorContextFromStep(requestStep, nextStepIndex, reply.requestPhase),
    ).then((didSend) => {
      if (didSend) {
        return;
      }

      setIsTutorActive(previousTutorState.isTutorActive);
      setTutorStepIndex(previousTutorState.tutorStepIndex);
      setTutorPhase(previousTutorState.tutorPhase);
    });
  }

  async function streamAssistantResponse(
    conversationMessages: ChatMessage[],
    screenshot?: PlaygroundScreenshot,
    tutorContext?: TutorContext,
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
        tutor: tutorContext,
      }),
    });

    if (!response.ok) {
      throw new Error(await readAssistantError(response));
    }

    const contentType = response.headers.get("Content-Type") ?? "";

    if (contentType.includes("application/json")) {
      const assistantMessage = await readAssistantMessage(response);

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: createMessageId(),
          role: "assistant",
          content: assistantMessage,
          createdAt: createTimelineTimestamp(),
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
        createdAt: createTimelineTimestamp(),
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
        setScreenshotActions((currentActions) => [
          ...currentActions,
          {
            id: createMessageId(),
            createdAt: createTimelineTimestamp(),
            pathname,
            capturedAt: capturedScreenshot.capturedAt,
            dataUrl: capturedScreenshot.dataUrl,
            previewUrl: createScreenshotPreviewUrl(
              capturedScreenshot.dataUrl,
            ),
            image: capturedScreenshot.image,
          },
        ]);
        setToolStatus("Screenshot captured. Reading the graph...");
        assistantMessage = await streamAssistantResponse(
          conversationMessages,
          capturedScreenshot,
          tutorContext,
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

          await handleStreamEvent(parseStreamEvent(line));
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
      await handleStreamEvent(parseStreamEvent(eventBuffer));
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
  const quickReplies = useMemo<QuickReply[]>(() => {
    if (!tutorPlan) {
      return [];
    }

    if (!isTutorActive) {
      return [
        {
          label: "Guide me",
          message: `Guide me through ${playgroundName} one experiment at a time. Start with the first experiment and ask me to predict what will happen.`,
          requestPhase: "start",
          nextPhase: "predict",
          nextStepIndex: 0,
        },
      ];
    }

    const step = tutorPlan.steps[tutorStepIndex];

    if (!step) {
      return [];
    }

    if (tutorPhase === "predict") {
      return [
        {
          label: "I made a prediction",
          message:
            "I made my prediction. Remind me of the exact controls to use and what to watch for, but do not explain the result yet.",
          requestPhase: "observe",
          nextPhase: "observe",
        },
        {
          label: "Give me a hint",
          message:
            "Give me a small hint for this prediction without revealing the answer.",
          requestPhase: "predict",
          nextPhase: "predict",
        },
      ];
    }

    if (tutorPhase === "observe") {
      return [
        {
          label: "I tried it",
          message:
            "I tried the experiment. Use the screenshot tool if helpful, then ask what I observed before giving the full explanation.",
          requestPhase: "reflect",
          nextPhase: "reflect",
        },
        {
          label: "I am stuck",
          message:
            "I am stuck on this experiment. Use the screenshot tool if helpful and give me one concrete next action.",
          requestPhase: "observe",
          nextPhase: "observe",
        },
      ];
    }

    if (tutorPhase === "reflect") {
      return step.observationOptions.map((option: string) => ({
        label: option,
        message: `What I noticed: ${option}. Connect that observation to the lesson and ask what I learned.`,
        requestPhase: "reflect",
        nextPhase: "readyNext",
      }));
    }

    if (tutorPhase === "readyNext") {
      const nextStepIndex = tutorStepIndex + 1;

      if (nextStepIndex >= tutorPlan.steps.length) {
        return [
          {
            label: "Finish summary",
            message:
              "Wrap up the guided lab. Ask me to explain the main lesson in my own words.",
            requestPhase: "complete",
            nextPhase: "complete",
            nextStepIndex: tutorStepIndex,
          },
        ];
      }

      return [
        {
          label: "Next experiment",
          message:
            "Move me to the next experiment. Give one concrete action and ask me to predict what will happen.",
          requestPhase: "next",
          nextPhase: "predict",
          nextStepIndex,
        },
        {
          label: "Review this one",
          message:
            "Review this experiment once more in plain language and ask me one quick check question.",
          requestPhase: "reflect",
          nextPhase: "readyNext",
        },
      ];
    }

    return [
      {
        label: "Quiz me",
        message: `Quiz me on the ${playgroundName} guided experiments, one question at a time.`,
        requestPhase: "complete",
        nextPhase: "complete",
      },
    ];
  }, [isTutorActive, playgroundName, tutorPhase, tutorPlan, tutorStepIndex]);
  const tutorProgress =
    isTutorActive && tutorPlan && currentTutorStep
      ? `Guide ${tutorStepIndex + 1}/${tutorPlan.steps.length}: ${
          currentTutorStep.title
        }`
      : tutorPlan
        ? `${playgroundName} tutor`
        : undefined;

  const assistantPanel = (
    <ChatPanel
      draft={draft}
      error={error}
      isSending={isSending}
      messages={messages.filter(
        (message) => message.id === "welcome" || message.pathname === pathname,
      )}
      playgroundName={playgroundName}
      quickReplies={quickReplies}
      screenshotActions={screenshotActions.filter(
        (action) => action.pathname === pathname,
      )}
      textareaRef={textareaRef}
      toolStatus={toolStatus}
      tutorProgress={tutorProgress}
      onDraftChange={setDraft}
      onClose={() => setIsAssistantOpen(false)}
      onSubmit={submitMessage}
      onQuickReply={handleQuickReply}
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
  quickReplies,
  screenshotActions,
  textareaRef,
  toolStatus,
  tutorProgress,
  onDraftChange,
  onClose,
  onQuickReply,
  onSubmit,
}: {
  draft: string;
  error: string | null;
  isSending: boolean;
  messages: ChatMessage[];
  playgroundName: string;
  quickReplies: QuickReply[];
  screenshotActions: ScreenshotAction[];
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  toolStatus: string | null;
  tutorProgress?: string;
  onDraftChange: (value: string) => void;
  onClose: () => void;
  onQuickReply: (reply: QuickReply) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const [expandedScreenshotId, setExpandedScreenshotId] = useState<
    string | null
  >(null);
  const lastMessage = messages.at(-1);
  const shouldShowThinking =
    (isSending || toolStatus) &&
    !(
      lastMessage?.role === "assistant" &&
      lastMessage.content.trim().length > 0
    );
  const timelineItems = useMemo(
    () =>
      [
        ...messages.map((message) => ({
          id: message.id,
          createdAt: message.createdAt,
          type: "message" as const,
          message,
        })),
        ...screenshotActions.map((action) => ({
          id: action.id,
          createdAt: action.createdAt,
          type: "screenshot" as const,
          action,
        })),
      ].sort((first, second) => first.createdAt - second.createdAt),
    [messages, screenshotActions],
  );

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [draft, textareaRef]);

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
          {tutorProgress ? (
            <p className="mt-1 truncate text-xs font-medium text-slate-500">
              {tutorProgress}
            </p>
          ) : null}
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
        {timelineItems.map((item) =>
          item.type === "message" ? (
            <article
              key={item.id}
              className={
                item.message.role === "user"
                  ? "ml-auto max-w-[86%] rounded-[14px] bg-slate-950 px-4 py-3 text-sm leading-6 text-white"
                  : "max-w-[86%] rounded-[14px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700"
              }
            >
              {item.message.role === "assistant" ? (
                <MarkdownMessage content={item.message.content} />
              ) : (
                item.message.content
              )}
            </article>
          ) : (
            <ScreenshotActionTip
              key={item.id}
              action={item.action}
              isExpanded={expandedScreenshotId === item.id}
              onToggle={() =>
                setExpandedScreenshotId((currentId) =>
                  currentId === item.id ? null : item.id,
                )
              }
            />
          ),
        )}

        {shouldShowThinking ? (
          <div className="max-w-[86%] rounded-[14px] border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-xs text-slate-500">
            {toolStatus ?? "Thinking..."}
          </div>
        ) : null}
      </div>

      <form
        onSubmit={onSubmit}
        className="border-t border-slate-200 bg-white px-4 py-3"
      >
        {error ? (
          <p className="mb-3 rounded-[10px] border border-rose-200 bg-rose-50 px-3 py-2 text-sm leading-5 text-rose-700">
            {error}
          </p>
        ) : null}
        {quickReplies.length > 0 ? (
          <div className="mb-3 flex flex-wrap gap-2">
            {quickReplies.map((reply) => (
              <button
                key={`${reply.requestPhase}-${reply.label}`}
                type="button"
                disabled={isSending}
                onClick={() => onQuickReply(reply)}
                className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
              >
                {reply.label}
              </button>
            ))}
          </div>
        ) : null}
        <label className="block">
          <span className="sr-only">Message assistant</span>
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.altKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            placeholder="Ask next. Enter submits."
            rows={1}
            className="min-h-10 w-full resize-none overflow-hidden rounded-[14px] border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:text-slate-400"
            disabled={isSending}
          />
        </label>
      </form>
    </section>
  );
}

function ScreenshotActionTip({
  action,
  isExpanded,
  onToggle,
}: {
  action: ScreenshotAction;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const capturedAt = new Date(action.capturedAt);
  const capturedLabel = Number.isNaN(capturedAt.getTime())
    ? "now"
    : capturedAt.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

  return (
    <div className="max-w-[86%]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="inline-flex max-w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
        <span className="truncate">Screenshot captured</span>
        <span className="font-mono text-[10px] text-slate-400">
          {capturedLabel}
        </span>
        <span className="text-indigo-600">{isExpanded ? "Hide" : "View"}</span>
      </button>

      {isExpanded ? (
        <div className="mt-2 rounded-[10px] border border-slate-200 bg-white p-2 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={action.previewUrl}
            alt={`Playground screenshot captured at ${capturedLabel}`}
            className="max-h-72 w-full rounded-md object-contain"
            width={action.image.width}
            height={action.image.height}
          />
        </div>
      ) : null}
    </div>
  );
}
