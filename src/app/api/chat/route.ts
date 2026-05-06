import { NextResponse } from "next/server";
import {
  getPlaygroundMetadataFromPathname,
  type PlaygroundMetadata,
} from "@/lib/playground-metadata";

type ChatRole = "user" | "assistant";

type ClientMessage = {
  role: ChatRole;
  content: string;
};

type OpenRouterContentPart =
  | {
      type: "text";
      text: string;
    }
  | {
      type: "image_url";
      image_url: {
        url: string;
      };
    };

type OpenRouterToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

type ScreenshotToolResult = {
  toolCall: OpenRouterToolCall;
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

type ChatRequestBody = {
  messages?: ClientMessage[];
  screenshot?: ScreenshotToolResult;
  stream?: boolean;
  context?: {
    pathname?: string;
    playgroundName?: string;
    playground?: PlaygroundMetadata;
  };
};

type OpenRouterMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string | OpenRouterContentPart[] | null;
  tool_call_id?: string;
  tool_calls?: OpenRouterToolCall[];
};

type OpenRouterResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

type OpenRouterStreamChunk = {
  choices?: Array<{
    finish_reason?: string;
    delta?: {
      content?: string;
      tool_calls?: Array<{
        index?: number;
        id?: string;
        type?: "function";
        function?: {
          name?: string;
          arguments?: string;
        };
      }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-5.5";
const MAX_MESSAGES = 16;
const MAX_CONTENT_LENGTH = 4000;
const MAX_COMPLETION_TOKENS = 700;
const MAX_SCREENSHOT_DATA_URL_LENGTH = 1_500_000;

const PLAYGROUND_SCREENSHOT_TOOLS = [
  {
    type: "function",
    function: {
      name: "take_playground_screenshot",
      description:
        "Capture the learner's current visible playground state, including graphs, selected controls, current values, and visual annotations. Use this when the learner asks about the current graph, current UI state, what they are looking at, or anything that requires seeing the playground.",
      parameters: {
        type: "object",
        properties: {
          reason: {
            type: "string",
            description:
              "Brief reason why seeing the current playground state will help answer the learner.",
          },
        },
        required: ["reason"],
        additionalProperties: false,
      },
    },
  },
] as const;

function isClientMessage(value: unknown): value is ClientMessage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const message = value as Record<string, unknown>;

  return (
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string" &&
    message.content.trim().length > 0
  );
}

function cleanMessages(messages: ClientMessage[]) {
  return messages.slice(-MAX_MESSAGES).map((message) => ({
    role: message.role,
    content: message.content.slice(0, MAX_CONTENT_LENGTH),
  }));
}

function systemPrompt(context: ChatRequestBody["context"]) {
  const pathname = context?.pathname ?? "/playgrounds";
  const resolvedPlayground =
    getPlaygroundMetadataFromPathname(pathname) ?? context?.playground;
  const playgroundName =
    resolvedPlayground?.title ??
    context?.playgroundName ??
    "the current playground";

  return [
    "You are the AI Grounds playground assistant.",
    "Help learners understand the interactive AI concept they are currently exploring.",
    "Keep answers concise, concrete, and tied to what the learner can try in the UI.",
    "Prefer intuition, small experiments, and plain language over formal derivations.",
    "Use the playground context below as the source of truth for the current lesson.",
    "When suggesting experiments, name controls or visual surfaces from the lesson summary and goals.",
    "You have a take_playground_screenshot tool. Use it when the learner asks about the current graph, current controls, visible values, what they are looking at, or when a screenshot would materially improve the answer.",
    "When a screenshot is provided, ground your explanation in what is visible in it.",
    `Current playground: ${playgroundName}.`,
    `Current path: ${pathname}.`,
    resolvedPlayground
      ? `Lesson hook: ${resolvedPlayground.kicker}.`
      : undefined,
    resolvedPlayground
      ? `Lesson summary: ${resolvedPlayground.summary}`
      : undefined,
    resolvedPlayground
      ? `Core concepts: ${resolvedPlayground.concepts.join(", ")}.`
      : undefined,
    resolvedPlayground
      ? `Learning goals:\n${resolvedPlayground.learningGoals
          .map((goal) => `- ${goal}`)
          .join("\n")}`
      : undefined,
  ].filter(Boolean).join("\n");
}

function isScreenshotToolResult(value: unknown): value is ScreenshotToolResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const result = value as Record<string, unknown>;
  const toolCall = result.toolCall as Record<string, unknown> | undefined;
  const fn = toolCall?.function as Record<string, unknown> | undefined;
  const viewport = result.viewport as Record<string, unknown> | undefined;
  const image = result.image as Record<string, unknown> | undefined;

  return (
    typeof result.dataUrl === "string" &&
    /^data:image\/(?:png|jpeg|webp);base64,/.test(result.dataUrl) &&
    result.dataUrl.length <= MAX_SCREENSHOT_DATA_URL_LENGTH &&
    typeof result.capturedAt === "string" &&
    typeof result.pathname === "string" &&
    typeof toolCall?.id === "string" &&
    toolCall.type === "function" &&
    typeof fn?.name === "string" &&
    fn.name === "take_playground_screenshot" &&
    typeof fn.arguments === "string" &&
    typeof viewport?.width === "number" &&
    typeof viewport.height === "number" &&
    typeof viewport.devicePixelRatio === "number" &&
    typeof image?.width === "number" &&
    typeof image.height === "number"
  );
}

function buildOpenRouterMessages(
  clientMessages: ClientMessage[],
  context: ChatRequestBody["context"],
  screenshot?: ScreenshotToolResult,
): OpenRouterMessage[] {
  const messages: OpenRouterMessage[] = [
    {
      role: "system",
      content: systemPrompt(context),
    },
    ...cleanMessages(clientMessages),
  ];

  if (!screenshot) {
    return messages;
  }

  messages.push(
    {
      role: "assistant",
      content: null,
      tool_calls: [screenshot.toolCall],
    },
    {
      role: "tool",
      tool_call_id: screenshot.toolCall.id,
      content: JSON.stringify({
        status: "captured",
        capturedAt: screenshot.capturedAt,
        pathname: screenshot.pathname,
        viewport: screenshot.viewport,
        image: screenshot.image,
      }),
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "Here is the screenshot captured by take_playground_screenshot. Answer the learner's latest question using the visible playground state.",
        },
        {
          type: "image_url",
          image_url: {
            url: screenshot.dataUrl,
          },
        },
      ],
    },
  );

  return messages;
}

async function parseOpenRouterResponse(response: Response) {
  const responseText = await response.text();

  try {
    return JSON.parse(responseText) as OpenRouterResponse;
  } catch {
    return {
      error: {
        message:
          responseText.slice(0, 300) ||
          `OpenRouter returned a non-JSON response with status ${response.status}.`,
      },
    };
  }
}

function streamEvent(event: unknown, encoder: TextEncoder) {
  return encoder.encode(`${JSON.stringify(event)}\n`);
}

function streamOpenRouterResponse(response: Response) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = response.body?.getReader();

      if (!reader) {
        controller.error(new Error("OpenRouter returned an empty stream."));
        return;
      }

      let buffer = "";
      const toolCalls = new Map<number, OpenRouterToolCall>();

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmedLine = line.trim();

            if (!trimmedLine.startsWith("data:")) {
              continue;
            }

            const data = trimmedLine.slice("data:".length).trim();

            if (!data || data === "[DONE]") {
              continue;
            }

            const parsed = JSON.parse(data) as OpenRouterStreamChunk;
            const errorMessage = parsed.error?.message;

            if (errorMessage) {
              controller.error(new Error(errorMessage));
              return;
            }

            for (const choice of parsed.choices ?? []) {
              const content = choice.delta?.content;

              if (content) {
                controller.enqueue(
                  streamEvent({ type: "text", content }, encoder),
                );
              }

              for (const toolCallDelta of choice.delta?.tool_calls ?? []) {
                const index = toolCallDelta.index ?? toolCalls.size;
                const current =
                  toolCalls.get(index) ??
                  ({
                    id: "",
                    type: "function",
                    function: {
                      name: "",
                      arguments: "",
                    },
                  } satisfies OpenRouterToolCall);

                if (toolCallDelta.id) {
                  current.id = toolCallDelta.id;
                }

                if (toolCallDelta.type) {
                  current.type = toolCallDelta.type;
                }

                if (toolCallDelta.function?.name) {
                  current.function.name = toolCallDelta.function.name;
                }

                if (toolCallDelta.function?.arguments) {
                  current.function.arguments +=
                    toolCallDelta.function.arguments;
                }

                toolCalls.set(index, current);
              }
            }
          }
        }

        for (const toolCall of toolCalls.values()) {
          if (
            toolCall.id &&
            toolCall.function.name === "take_playground_screenshot"
          ) {
            controller.enqueue(
              streamEvent({ type: "tool_call", toolCall }, encoder),
            );
          }
        }

        controller.enqueue(streamEvent({ type: "done" }, encoder));
        controller.close();
      } catch (streamError) {
        controller.error(streamError);
      } finally {
        reader.releaseLock();
      }
    },
  });
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "OpenRouter is not configured. Add OPENROUTER_API_KEY to .env.local and restart the dev server.",
      },
      { status: 500 },
    );
  }

  let body: ChatRequestBody;

  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const clientMessages = Array.isArray(body.messages)
    ? body.messages.filter(isClientMessage)
    : [];
  const screenshot = isScreenshotToolResult(body.screenshot)
    ? body.screenshot
    : undefined;

  if (clientMessages.length === 0) {
    return NextResponse.json(
      { error: "At least one message is required." },
      { status: 400 },
    );
  }

  const messages = buildOpenRouterMessages(
    clientMessages,
    body.context,
    screenshot,
  );

  const response = await fetch(OPENROUTER_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer":
        process.env.OPENROUTER_SITE_URL ?? "https://aigrounds.tsilva.eu",
      "X-Title": process.env.OPENROUTER_APP_NAME ?? "AI Grounds",
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL,
      messages,
      max_completion_tokens: MAX_COMPLETION_TOKENS,
      ...(screenshot
        ? {
            tool_choice: "none",
          }
        : {
            tools: PLAYGROUND_SCREENSHOT_TOOLS,
            tool_choice: "auto",
            parallel_tool_calls: false,
          }),
      stream: body.stream === true,
      temperature: 0.4,
    }),
  });

  if (body.stream === true) {
    if (!response.ok) {
      const payload = await parseOpenRouterResponse(response);

      return NextResponse.json(
        {
          error:
            payload.error?.message ??
            `OpenRouter request failed with status ${response.status}.`,
        },
        { status: response.status },
      );
    }

    if (!response.body) {
      return NextResponse.json(
        { error: "OpenRouter returned an empty stream." },
        { status: 502 },
      );
    }

    return new Response(streamOpenRouterResponse(response), {
      headers: {
        "Cache-Control": "no-cache, no-transform",
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  const payload = await parseOpenRouterResponse(response);

  if (!response.ok) {
    return NextResponse.json(
      {
        error:
          payload.error?.message ??
          `OpenRouter request failed with status ${response.status}.`,
      },
      { status: response.status },
    );
  }

  const message = payload.choices?.[0]?.message?.content?.trim();

  if (!message) {
    return NextResponse.json(
      { error: "OpenRouter returned an empty response." },
      { status: 502 },
    );
  }

  return NextResponse.json({ message });
}
