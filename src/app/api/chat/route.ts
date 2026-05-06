import { NextResponse } from "next/server";

type ChatRole = "user" | "assistant";

type ClientMessage = {
  role: ChatRole;
  content: string;
};

type ChatRequestBody = {
  messages?: ClientMessage[];
  context?: {
    pathname?: string;
    playgroundName?: string;
  };
};

type OpenRouterMessage = {
  role: "system" | ChatRole;
  content: string;
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

const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-4o-mini";
const MAX_MESSAGES = 16;
const MAX_CONTENT_LENGTH = 4000;

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
  const playgroundName = context?.playgroundName ?? "the current playground";
  const pathname = context?.pathname ?? "/playgrounds";

  return [
    "You are the AI Grounds playground assistant.",
    "Help learners understand the interactive AI concept they are currently exploring.",
    "Keep answers concise, concrete, and tied to what the learner can try in the UI.",
    "Prefer intuition, small experiments, and plain language over formal derivations.",
    `Current playground: ${playgroundName}.`,
    `Current path: ${pathname}.`,
  ].join("\n");
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

  if (clientMessages.length === 0) {
    return NextResponse.json(
      { error: "At least one message is required." },
      { status: 400 },
    );
  }

  const messages: OpenRouterMessage[] = [
    {
      role: "system",
      content: systemPrompt(body.context),
    },
    ...cleanMessages(clientMessages),
  ];

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
      temperature: 0.4,
    }),
  });

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
