export type AttentionScenarioId = "river-bank" | "money-bank";

export type AttentionDimensionId = "water" | "money" | "syntax";

export type AttentionVector = Record<AttentionDimensionId, number>;

export type AttentionToken = {
  id: string;
  label: string;
  role: string;
  query: number[];
  key: number[];
  value: AttentionVector;
};

export type AttentionScenario = {
  id: AttentionScenarioId;
  label: string;
  shortLabel: string;
  sentence: string;
  description: string;
  defaultQueryId: string;
  tokens: AttentionToken[];
};

export const attentionDimensions: Array<{
  id: AttentionDimensionId;
  label: string;
  color: string;
  mutedColor: string;
}> = [
  {
    id: "water",
    label: "shore meaning",
    color: "#0ea5e9",
    mutedColor: "#d8f1ff",
  },
  {
    id: "money",
    label: "finance meaning",
    color: "#16a34a",
    mutedColor: "#dcfce7",
  },
  {
    id: "syntax",
    label: "sentence glue",
    color: "#f59e0b",
    mutedColor: "#fef3c7",
  },
];

export const attentionScenarios: AttentionScenario[] = [
  {
    id: "river-bank",
    label: "River Bank",
    shortLabel: "river context",
    sentence: "The duck sat by the river bank",
    description:
      "The ambiguous word bank should borrow meaning from river and shore-like context.",
    defaultQueryId: "bank",
    tokens: [
      {
        id: "the",
        label: "The",
        role: "determiner",
        query: [0.05, 0.03, 0.92],
        key: [0.04, 0.02, 0.9],
        value: { water: 0.04, money: 0.02, syntax: 0.74 },
      },
      {
        id: "duck",
        label: "duck",
        role: "creature",
        query: [0.52, 0.04, 0.22],
        key: [0.55, 0.03, 0.24],
        value: { water: 0.38, money: 0.02, syntax: 0.12 },
      },
      {
        id: "sat",
        label: "sat",
        role: "action",
        query: [0.16, 0.02, 0.72],
        key: [0.16, 0.03, 0.76],
        value: { water: 0.1, money: 0.02, syntax: 0.52 },
      },
      {
        id: "by",
        label: "by",
        role: "relation",
        query: [0.3, 0.02, 0.8],
        key: [0.3, 0.03, 0.82],
        value: { water: 0.18, money: 0.02, syntax: 0.62 },
      },
      {
        id: "river",
        label: "river",
        role: "context key",
        query: [0.98, 0.02, 0.16],
        key: [1, 0.02, 0.12],
        value: { water: 1, money: 0.01, syntax: 0.06 },
      },
      {
        id: "bank",
        label: "bank",
        role: "ambiguous",
        query: [0.95, 0.08, 0.18],
        key: [0.62, 0.25, 0.26],
        value: { water: 0.58, money: 0.16, syntax: 0.2 },
      },
    ],
  },
  {
    id: "money-bank",
    label: "Money Bank",
    shortLabel: "cash context",
    sentence: "She put cash in the bank",
    description:
      "The same word bank should borrow meaning from cash and finance-like context.",
    defaultQueryId: "bank",
    tokens: [
      {
        id: "she",
        label: "She",
        role: "subject",
        query: [0.06, 0.08, 0.82],
        key: [0.05, 0.08, 0.8],
        value: { water: 0.03, money: 0.08, syntax: 0.72 },
      },
      {
        id: "put",
        label: "put",
        role: "action",
        query: [0.08, 0.18, 0.72],
        key: [0.06, 0.2, 0.74],
        value: { water: 0.04, money: 0.14, syntax: 0.56 },
      },
      {
        id: "cash",
        label: "cash",
        role: "context key",
        query: [0.02, 0.98, 0.12],
        key: [0.02, 1, 0.08],
        value: { water: 0.01, money: 1, syntax: 0.06 },
      },
      {
        id: "in",
        label: "in",
        role: "relation",
        query: [0.14, 0.22, 0.8],
        key: [0.12, 0.24, 0.82],
        value: { water: 0.05, money: 0.18, syntax: 0.64 },
      },
      {
        id: "the",
        label: "the",
        role: "determiner",
        query: [0.04, 0.04, 0.9],
        key: [0.04, 0.04, 0.88],
        value: { water: 0.03, money: 0.04, syntax: 0.74 },
      },
      {
        id: "bank",
        label: "bank",
        role: "ambiguous",
        query: [0.08, 0.95, 0.2],
        key: [0.24, 0.66, 0.3],
        value: { water: 0.16, money: 0.6, syntax: 0.22 },
      },
    ],
  },
];

export const initialSharpness = 1.9;
