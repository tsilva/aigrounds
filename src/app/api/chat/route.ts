import { NextResponse } from "next/server";
import { getPlaygroundMetadataFromPathname } from "@/lib/playground-metadata";
import { getTutorOpeningMessage } from "@/lib/tutor-plans";
import {
  isClientMessage,
  type ChatRequestBody,
  type ChatStreamEvent,
  type ClientMessage,
  type PlaygroundScreenshot,
  type ScreenshotToolCall,
  type TutorContext,
} from "@/lib/assistant-chat";

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

type OpenRouterMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string | OpenRouterContentPart[] | null;
  tool_call_id?: string;
  tool_calls?: ScreenshotToolCall[];
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isChatRequestBody(value: unknown): value is ChatRequestBody {
  if (!isRecord(value)) {
    return false;
  }

  return (
    (value.messages === undefined || Array.isArray(value.messages)) &&
    (value.stream === undefined || typeof value.stream === "boolean") &&
    (value.context === undefined || isRecord(value.context)) &&
    (value.tutor === undefined || isRecord(value.tutor)) &&
    (value.screenshot === undefined || isScreenshotToolResult(value.screenshot))
  );
}

function isOpenRouterResponse(value: unknown): value is OpenRouterResponse {
  if (!isRecord(value)) {
    return false;
  }

  const error = value.error;

  return (
    (value.choices === undefined || Array.isArray(value.choices)) &&
    (error === undefined ||
      (isRecord(error) &&
        (error.message === undefined || typeof error.message === "string")))
  );
}

function isOpenRouterStreamChunk(
  value: unknown,
): value is OpenRouterStreamChunk {
  if (!isRecord(value)) {
    return false;
  }

  const error = value.error;

  return (
    (value.choices === undefined || Array.isArray(value.choices)) &&
    (error === undefined ||
      (isRecord(error) &&
        (error.message === undefined || typeof error.message === "string")))
  );
}

function cleanMessages(messages: ClientMessage[]) {
  return messages.slice(-MAX_MESSAGES).map((message) => ({
    role: message.role,
    content: message.content.slice(0, MAX_CONTENT_LENGTH),
  }));
}

function systemPrompt(
  context: ChatRequestBody["context"],
  tutor?: TutorContext,
) {
  const pathname = context?.pathname ?? "/playgrounds";
  const resolvedPlayground =
    getPlaygroundMetadataFromPathname(pathname) ?? context?.playground;
  const playgroundName =
    resolvedPlayground?.title ??
    context?.playgroundName ??
    "the current playground";
  const tutorPlan = resolvedPlayground?.tutorPlan;
  return [
    "You are the AI Grounds playground assistant.",
    "Help learners understand the interactive AI concept they are currently exploring.",
    "Keep answers concise, concrete, and tied to what the learner can try in the UI.",
    "Prefer intuition, small experiments, and plain language over formal derivations.",
    [
      "Do not use LaTeX or TeX delimiters such as \\(...\\), $...$, \\mid, or \\frac;",
      "the chat UI renders plain Markdown only.",
      "Write formulas in the same plain text used by the playground, such as P(B given A), A ∩ B, and 22 / 40.",
    ].join(" "),
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
    tutor?.mode === "guide" && tutorPlan
      ? [
          `Tutor mode is active for ${playgroundName}.`,
          "Act like a patient lab tutor, not a generic answer bot.",
          "Guide one experiment at a time. Do not jump ahead to later experiments unless the learner asks.",
          "Prefer a Socratic loop: ask for a prediction, tell the learner exactly what to try, ask what they observed, then connect their observation to the concept.",
          "When evaluating a learner explanation, correct only mismatches that are actually present in the learner's words. Do not invent a correction after an otherwise correct answer.",
          "Use the screenshot tool when the learner says they tried it, asks what happened, asks about the graph, or when checking the current visible state would improve your coaching.",
          "Keep each tutor reply short: 2-5 concise sentences or a small bullet list.",
          `Current tutor phase: ${tutor.phase ?? "start"}.`,
          `Current experiment number: ${(tutor.stepIndex ?? 0) + 1}.`,
          `Tutor opening message shown to learner:\n${getTutorOpeningMessage(
            tutorPlan,
          )}`,
          "This tutor plan is typed-only: quick reply buttons are hidden. Use the learner's typed messages as the signal to advance. The learner must type a prediction before you give experiment controls. After a prediction, acknowledge it briefly, give the exact experiment action, and ask what they observe. After an observation, connect it to the target takeaway and ask for a short explanation in their own words.",
          tutorPlan.masteryCriteria?.length
            ? `Mastery criteria. The learner has understood this lesson only when their answers show they can:\n${tutorPlan.masteryCriteria
                .map((criterion) => `- ${criterion}`)
                .join("\n")}`
            : undefined,
          tutor.stepTitle ? `Experiment title: ${tutor.stepTitle}.` : undefined,
          tutor.experiment ? `Experiment action: ${tutor.experiment}` : undefined,
          tutor.predictionQuestion
            ? `Prediction question: ${tutor.predictionQuestion}`
            : undefined,
          tutor.observationPrompt
            ? `Observation prompt: ${tutor.observationPrompt}`
            : undefined,
          tutor.takeaway ? `Target takeaway: ${tutor.takeaway}` : undefined,
          tutor.phase === "start" || tutor.phase === "predict"
            ? "Your next move: explain the playground and key concepts in plain language, then ask only the prediction question. Do not give the experiment action until the learner has answered."
            : undefined,
          tutor.phase === "observe"
            ? "Your next move: treat the learner's latest message as their prediction. Do not call the screenshot tool in this phase unless the learner explicitly says they already changed controls or asks about the current graph. Briefly acknowledge the prediction, tell the learner the exact experiment action, name the UI surfaces to watch, and ask what they observe. Avoid giving away the full explanation yet."
            : undefined,
          tutor.phase === "reflect"
            ? "Your next move: treat the learner's latest message as their observation. Respond to it, connect it to the target takeaway, then ask them to explain the concept in their own words before moving on."
            : undefined,
          tutor.phase === "next"
            ? "Your next move: treat the learner's latest message as their explanation of the previous concept. Briefly acknowledge or correct it, introduce only the next experiment title, then ask the prediction question. Do not give the next experiment controls until the learner answers."
            : undefined,
          tutor.phase === "complete"
            ? tutorPlan.masteryCriteria?.length
              ? `Your next move: evaluate the learner's latest answer against the mastery criteria. If it demonstrates the core ideas, start with exactly "Lesson finished." and give a one-sentence summary. If it is incomplete or vague, do not say "Lesson finished"; ask one targeted Socratic follow-up question or prescribe one small UI check that addresses the missing idea.`
              : `Your next move: summarize the guided ${playgroundName} experiments and ask the learner to explain the main lesson back in their own words.`
            : undefined,
        ]
          .filter(Boolean)
          .join("\n")
      : undefined,
  ].filter(Boolean).join("\n");
}

function isScreenshotToolResult(value: unknown): value is PlaygroundScreenshot {
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
  tutor?: TutorContext,
  screenshot?: PlaygroundScreenshot,
): OpenRouterMessage[] {
  const messages: OpenRouterMessage[] = [
    {
      role: "system",
      content: systemPrompt(context, tutor),
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

function shouldOfferScreenshotTool(
  tutor?: TutorContext,
  screenshot?: PlaygroundScreenshot,
) {
  if (screenshot) {
    return false;
  }

  if (tutor?.mode === "guide" && tutor.phase === "observe") {
    return false;
  }

  return true;
}

async function parseOpenRouterResponse(response: Response) {
  const responseText = await response.text();

  try {
    const payload = JSON.parse(responseText) as unknown;

    if (isOpenRouterResponse(payload)) {
      return payload;
    }

    return {
      error: {
        message: `OpenRouter returned an unexpected JSON response with status ${response.status}.`,
      },
    };
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

function streamEvent(event: ChatStreamEvent, encoder: TextEncoder) {
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
      const toolCalls = new Map<number, ScreenshotToolCall>();

      function processSseLine(line: string) {
        const trimmedLine = line.trim();

        if (!trimmedLine.startsWith("data:")) {
          return;
        }

        const data = trimmedLine.slice("data:".length).trim();

        if (!data || data === "[DONE]") {
          return;
        }

        const payload = JSON.parse(data) as unknown;

        if (!isOpenRouterStreamChunk(payload)) {
          throw new Error("OpenRouter returned an invalid stream chunk.");
        }

        const errorMessage = payload.error?.message;

        if (errorMessage) {
          throw new Error(errorMessage);
        }

        for (const choice of payload.choices ?? []) {
          const content = choice.delta?.content;

          if (content) {
            controller.enqueue(streamEvent({ type: "text", content }, encoder));
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
              } satisfies ScreenshotToolCall);

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
              current.function.arguments += toolCallDelta.function.arguments;
            }

            toolCalls.set(index, current);
          }
        }
      }

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
            processSseLine(line);
          }
        }

        buffer += decoder.decode();

        if (buffer.trim()) {
          if (!buffer.trim().startsWith("data:")) {
            throw new Error("OpenRouter returned an incomplete stream event.");
          }

          processSseLine(buffer);
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
    const payload = (await request.json()) as unknown;

    if (!isChatRequestBody(payload)) {
      return NextResponse.json(
        { error: "Invalid chat request body." },
        { status: 400 },
      );
    }

    body = payload;
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
    body.tutor,
    screenshot,
  );
  const offerScreenshotTool = shouldOfferScreenshotTool(body.tutor, screenshot);

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
      ...(!offerScreenshotTool
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

  if (payload.error?.message) {
    return NextResponse.json(
      {
        error: payload.error.message,
      },
      { status: 502 },
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
