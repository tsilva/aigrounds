export type AttentionScenarioToken = {
  id: string;
  label: string;
  detail: string;
  role: string;
  key: number[];
  value: number[];
};

export type AttentionScenarioCandidate = {
  label: string;
  detail: string;
  vector: number[];
  bias?: number;
};

export type AttentionScenario = {
  id: string;
  title: string;
  kicker: string;
  description: string;
  localLabel: string;
  contextLabel: string;
  defaultContextStrength: number;
  defaultSharpness: number;
  defaultRecencyBias: number;
  tokens: AttentionScenarioToken[];
  candidates: AttentionScenarioCandidate[];
  baseQuery: number[];
  contextQuery: number[];
};

export const attentionScenarios: AttentionScenario[] = [
  {
    id: "json-instruction",
    title: "Format instruction beats conversational momentum",
    kicker: "A far-away formatting token can overrule the friendly tone nearby.",
    description:
      "The recent phrasing sounds like ordinary chat, so the model initially leans toward a natural-language reply. As you blend in the earlier instruction, the JSON token captures the step and the predicted output flips to an opening brace.",
    localLabel: "recent phrasing",
    contextLabel: "earlier format instruction",
    defaultContextStrength: 0.42,
    defaultSharpness: 1.7,
    defaultRecencyBias: 0.3,
    baseQuery: [0.2, 1.6, 1.1, 0.1, 1.2],
    contextQuery: [2.4, 0.1, 0.3, 2.8, 0.2],
    tokens: [
      {
        id: "reply",
        label: "Reply",
        detail:
          "The setup says this is an instruction, but it does not specify the format yet.",
        role: "setup",
        key: [1.0, 0.2, 0.1, 0.0, 0.0],
        value: [0.1, 0.0, 0.1, 0.0, 0.0],
      },
      {
        id: "in",
        label: "in",
        detail: "Connector token. It carries almost no useful value on its own.",
        role: "filler",
        key: [0.3, 0.1, 0.0, 0.0, 0.0],
        value: [0.0, 0.0, 0.0, 0.0, 0.0],
      },
      {
        id: "json",
        label: "JSON",
        detail:
          "The strong formatting anchor. Once the query aligns with it, it can dominate the generation step.",
        role: "anchor",
        key: [2.7, 0.0, 0.1, 3.0, 0.1],
        value: [2.5, 0.0, 0.1, 3.2, 0.0],
      },
      {
        id: "even",
        label: "even",
        detail: "A framing token that mostly preserves sentence flow.",
        role: "filler",
        key: [0.1, 0.2, 0.2, 0.0, 0.0],
        value: [0.0, 0.0, 0.0, 0.0, 0.0],
      },
      {
        id: "if",
        label: "if",
        detail: "Logical glue. It does not provide a concrete completion target.",
        role: "filler",
        key: [0.1, 0.1, 0.1, 0.0, 0.0],
        value: [0.0, 0.0, 0.0, 0.0, 0.0],
      },
      {
        id: "the",
        label: "the",
        detail: "Another low-information connector token.",
        role: "filler",
        key: [0.0, 0.1, 0.0, 0.0, 0.0],
        value: [0.0, 0.0, 0.0, 0.0, 0.0],
      },
      {
        id: "question",
        label: "question",
        detail:
          "This starts pulling the query toward conversational completion rather than structured output.",
        role: "recent cue",
        key: [0.2, 1.0, 0.7, 0.0, 0.7],
        value: [0.0, 0.4, 0.4, 0.0, 0.5],
      },
      {
        id: "sounds",
        label: "sounds",
        detail: "Nearby wording nudges the model toward a human-sounding answer.",
        role: "recent cue",
        key: [0.1, 1.4, 0.5, 0.0, 0.7],
        value: [0.0, 0.5, 0.2, 0.0, 0.5],
      },
      {
        id: "conversational",
        label: "conversational",
        detail:
          "A strong distractor. It attracts attention when the query mostly follows the local tone.",
        role: "distractor",
        key: [0.0, 2.2, 0.5, 0.0, 1.1],
        value: [0.0, 1.5, 0.3, 0.0, 1.2],
      },
      {
        id: "answer",
        label: "answer",
        detail:
          "The closest useful token. Recency makes it the default leader before context strengthens.",
        role: "recent anchor",
        key: [0.4, 1.6, 1.9, 0.1, 1.5],
        value: [0.3, 0.7, 1.5, 0.1, 1.3],
      },
      {
        id: "with",
        label: "with",
        detail:
          "Another nearby connector that benefits from recency but carries little semantic weight.",
        role: "filler",
        key: [0.2, 1.0, 1.0, 0.0, 0.8],
        value: [0.1, 0.2, 0.4, 0.0, 0.4],
      },
    ],
    candidates: [
      {
        label: "{",
        detail: "Structured output wins when the JSON instruction takes over.",
        vector: [2.3, 0.0, 0.0, 3.3, 0.0],
      },
      {
        label: "Sure",
        detail:
          "A natural-language opener that matches the conversational drift.",
        vector: [0.0, 2.6, 0.6, 0.0, 2.5],
      },
      {
        label: "The",
        detail: "A generic prose continuation with moderate recent support.",
        vector: [0.2, 0.3, 2.2, 0.0, 1.1],
      },
    ],
  },
  {
    id: "negation-repair",
    title: "Negation rescues the right answer",
    kicker: "Without the corrective context, the model copies the wrong noun.",
    description:
      "The local wording near the cursor makes `payments` look tempting because it is recent and syntactically compatible. Bringing in the earlier correction shifts attention toward `login` and the negation cue, which restores the intended answer.",
    localLabel: "recent noun copy",
    contextLabel: "earlier correction",
    defaultContextStrength: 0.48,
    defaultSharpness: 1.7,
    defaultRecencyBias: 0.3,
    baseQuery: [0.4, 1.7, 0.3, 1.4, 0.2],
    contextQuery: [2.4, 0.1, 2.2, 0.8, 0.0],
    tokens: [
      {
        id: "the",
        label: "The",
        detail:
          "Lead-in token with almost no direct influence on the answer.",
        role: "filler",
        key: [0.1, 0.0, 0.0, 0.2, 0.0],
        value: [0.0, 0.0, 0.0, 0.0, 0.0],
      },
      {
        id: "failure",
        label: "failure",
        detail:
          "Provides incident-report context, not the identity of the broken system.",
        role: "setup",
        key: [0.2, 0.1, 0.1, 1.5, 0.0],
        value: [0.2, 0.2, 0.0, 1.6, 0.0],
      },
      {
        id: "came",
        label: "came",
        detail: "Verb token. It mainly preserves grammar.",
        role: "filler",
        key: [0.0, 0.0, 0.0, 0.2, 0.0],
        value: [0.0, 0.0, 0.0, 0.0, 0.0],
      },
      {
        id: "from",
        label: "from",
        detail: "Another glue token with little standalone signal.",
        role: "filler",
        key: [0.0, 0.0, 0.0, 0.2, 0.0],
        value: [0.0, 0.0, 0.0, 0.0, 0.0],
      },
      {
        id: "login",
        label: "login",
        detail:
          "The true source of the issue. It only wins once the correction is remembered.",
        role: "anchor",
        key: [2.7, 0.1, 0.4, 1.0, 0.0],
        value: [3.0, 0.0, 0.3, 1.1, 0.0],
      },
      {
        id: "not",
        label: "not",
        detail:
          "This token changes the meaning of the phrase, but only if attention actually lands on it.",
        role: "correction",
        key: [0.1, 0.2, 2.8, 0.5, 0.0],
        value: [0.5, 0.0, 3.0, 0.2, 0.0],
      },
      {
        id: "payments",
        label: "payments",
        detail:
          "The tempting wrong answer. It is recent, concrete, and easy to copy forward.",
        role: "distractor",
        key: [0.3, 2.3, 0.1, 1.1, 0.0],
        value: [0.2, 3.1, 0.2, 1.0, 0.0],
      },
      {
        id: "incident",
        label: "Incident",
        detail:
          "Shifts the sentence into summary mode without identifying the system.",
        role: "setup",
        key: [0.1, 0.0, 0.0, 1.3, 0.0],
        value: [0.0, 0.0, 0.0, 1.0, 0.0],
      },
      {
        id: "summary",
        label: "summary",
        detail:
          "Keeps the report style active, but still does not settle the noun.",
        role: "setup",
        key: [0.0, 0.0, 0.0, 1.4, 0.0],
        value: [0.0, 0.0, 0.0, 1.0, 0.0],
      },
      {
        id: "broken",
        label: "broken",
        detail:
          "A strong local cue for incident wording, but not for which component was affected.",
        role: "recent cue",
        key: [0.2, 0.5, 0.0, 1.6, 0.0],
        value: [0.1, 0.4, 0.0, 1.2, 0.0],
      },
      {
        id: "system",
        label: "system",
        detail:
          "Recent syntax keeps the model hovering nearby unless the earlier correction pulls harder.",
        role: "recent cue",
        key: [0.2, 0.6, 0.1, 1.7, 0.0],
        value: [0.1, 0.5, 0.0, 1.3, 0.0],
      },
      {
        id: "was",
        label: "was",
        detail: "Very recent and grammatically useful, but semantically weak.",
        role: "recent cue",
        key: [0.1, 0.6, 0.0, 1.2, 0.0],
        value: [0.0, 0.3, 0.0, 0.8, 0.0],
      },
    ],
    candidates: [
      {
        label: "login",
        detail: "Correct once the model remembers the earlier repair.",
        vector: [3.4, 0.1, 1.5, 1.1, 0.0],
      },
      {
        label: "payments",
        detail:
          "Wrong, but locally attractive because it is the nearest concrete noun.",
        vector: [0.2, 3.4, 0.1, 1.1, 0.0],
      },
      {
        label: "search",
        detail:
          "A low-confidence fallback with only generic incident-report support.",
        vector: [0.4, 0.4, 0.0, 1.3, 0.0],
      },
    ],
  },
  {
    id: "callsign-recall",
    title: "A long-range entity can suddenly take the step",
    kicker: "One earlier identifier can overpower the most recent mention.",
    description:
      "Near the cursor, `Beacon-2` feels more available because it was mentioned recently. When the query blends toward the earlier priority instruction, attention jumps back to `Aurora-7` and the decoded next token flips with it.",
    localLabel: "recent mention",
    contextLabel: "earlier priority cue",
    defaultContextStrength: 0.46,
    defaultSharpness: 1.7,
    defaultRecencyBias: 0.3,
    baseQuery: [0.5, 1.9, 0.2, 1.0, 0.0],
    contextQuery: [2.5, 0.1, 2.0, 0.4, 0.0],
    tokens: [
      {
        id: "docking",
        label: "Docking",
        detail:
          "Sets the domain: this is about traffic priority rather than free-form prose.",
        role: "setup",
        key: [0.1, 0.0, 0.0, 0.8, 0.0],
        value: [0.0, 0.0, 0.0, 0.8, 0.0],
      },
      {
        id: "log",
        label: "log:",
        detail:
          "Document-style framing token with little direct retrieval value.",
        role: "filler",
        key: [0.0, 0.0, 0.0, 0.6, 0.0],
        value: [0.0, 0.0, 0.0, 0.5, 0.0],
      },
      {
        id: "aurora",
        label: "Aurora-7",
        detail:
          "The earlier entity that really should be copied into the answer.",
        role: "anchor",
        key: [2.8, 0.1, 0.4, 0.4, 0.0],
        value: [3.1, 0.0, 0.2, 0.3, 0.0],
      },
      {
        id: "has",
        label: "has",
        detail: "Grammatical connector. It mostly preserves the phrase.",
        role: "filler",
        key: [0.0, 0.0, 0.0, 0.2, 0.0],
        value: [0.0, 0.0, 0.0, 0.0, 0.0],
      },
      {
        id: "priority",
        label: "priority.",
        detail:
          "This is the semantic clue that tells the model which call sign matters.",
        role: "context cue",
        key: [0.2, 0.0, 2.3, 0.6, 0.0],
        value: [0.6, 0.0, 2.5, 0.4, 0.0],
      },
      {
        id: "beacon",
        label: "Beacon-2",
        detail: "Recent but not approved. It wins only when locality beats memory.",
        role: "distractor",
        key: [0.3, 2.7, 0.2, 0.4, 0.0],
        value: [0.1, 3.0, 0.1, 0.3, 0.0],
      },
      {
        id: "may",
        label: "may",
        detail: "Soft modal wording that does not contribute much on its own.",
        role: "filler",
        key: [0.0, 0.1, 0.0, 0.1, 0.0],
        value: [0.0, 0.0, 0.0, 0.0, 0.0],
      },
      {
        id: "wait",
        label: "wait.",
        detail:
          "Helps mark Beacon-2 as secondary, but this only matters if context is used well.",
        role: "context cue",
        key: [0.0, 0.5, 0.0, 0.2, 0.0],
        value: [0.0, 0.6, 0.0, 0.1, 0.0],
      },
      {
        id: "final",
        label: "Final",
        detail: "Signals that a summary answer is coming next.",
        role: "recent cue",
        key: [0.1, 0.3, 0.0, 1.4, 0.0],
        value: [0.0, 0.1, 0.0, 1.0, 0.0],
      },
      {
        id: "approved",
        label: "approved",
        detail:
          "Local wording starts to align with the earlier priority semantics.",
        role: "recent cue",
        key: [0.2, 0.4, 1.2, 1.2, 0.0],
        value: [0.2, 0.2, 1.1, 1.0, 0.0],
      },
      {
        id: "call-sign",
        label: "call sign",
        detail:
          "Recent syntax wants an identifier, but it does not know which one.",
        role: "recent cue",
        key: [0.3, 1.3, 0.1, 1.3, 0.0],
        value: [0.1, 0.6, 0.0, 1.0, 0.0],
      },
      {
        id: "is",
        label: "is",
        detail:
          "The nearest token. Recency helps it, but it carries almost no answer content.",
        role: "recent cue",
        key: [0.1, 0.8, 0.0, 0.8, 0.0],
        value: [0.0, 0.4, 0.0, 0.5, 0.0],
      },
    ],
    candidates: [
      {
        label: "Aurora-7",
        detail:
          "Correct once the priority cue is allowed to influence the step.",
        vector: [3.5, 0.0, 1.2, 0.5, 0.0],
      },
      {
        label: "Beacon-2",
        detail: "The locally available but ultimately wrong copy target.",
        vector: [0.0, 3.5, 0.2, 0.5, 0.0],
      },
      {
        label: "pending",
        detail: "A generic status-like continuation with weak support.",
        vector: [0.2, 0.4, 0.0, 1.5, 0.0],
      },
    ],
  },
];
