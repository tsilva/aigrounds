import { type PlaygroundMetadata } from "@/lib/playground-metadata";

export type ChatRole = "user" | "assistant";

export type ClientMessage = {
  role: ChatRole;
  content: string;
};

export type ScreenshotToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

export type PlaygroundScreenshot = {
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

export type ChatStreamEvent =
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

export type TutorRequestPhase =
  | "start"
  | "predict"
  | "observe"
  | "reflect"
  | "next"
  | "complete";

export type TutorContext = {
  mode?: "guide";
  phase?: TutorRequestPhase;
  stepIndex?: number;
  stepTitle?: string;
  experiment?: string;
  predictionQuestion?: string;
  observationPrompt?: string;
  takeaway?: string;
};

export type ChatRequestBody = {
  messages?: ClientMessage[];
  screenshot?: PlaygroundScreenshot;
  stream?: boolean;
  tutor?: TutorContext;
  context?: {
    pathname?: string;
    playgroundName?: string;
    playground?: PlaygroundMetadata;
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

export function isClientMessage(value: unknown): value is ClientMessage {
  if (!isRecord(value)) {
    return false;
  }

  return (
    (value.role === "user" || value.role === "assistant") &&
    typeof value.content === "string" &&
    value.content.trim().length > 0
  );
}

export function isScreenshotToolCall(
  value: unknown,
): value is ScreenshotToolCall {
  if (!isRecord(value)) {
    return false;
  }

  const fn = isRecord(value.function) ? value.function : undefined;

  return (
    typeof value.id === "string" &&
    value.type === "function" &&
    typeof fn?.name === "string" &&
    fn.name === "take_playground_screenshot" &&
    typeof fn.arguments === "string"
  );
}

export function isChatStreamEvent(value: unknown): value is ChatStreamEvent {
  if (!isRecord(value) || typeof value.type !== "string") {
    return false;
  }

  if (value.type === "text") {
    return typeof value.content === "string";
  }

  if (value.type === "tool_call") {
    return isScreenshotToolCall(value.toolCall);
  }

  return value.type === "done";
}
