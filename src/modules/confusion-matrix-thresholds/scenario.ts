import { type ThresholdExample } from "./confusion-matrix-thresholds-engine";

export type ThresholdScenarioId = "medical" | "spam" | "fraud";

export type ThresholdScenario = {
  id: ThresholdScenarioId;
  label: string;
  shortLabel: string;
  description: string;
  positiveLabel: string;
  negativeLabel: string;
  scoreLabel: string;
  thresholdLabel: string;
  defaultThreshold: number;
  examples: ThresholdExample[];
};

export type ThresholdByScenario = Record<ThresholdScenarioId, number>;

export const thresholdScenarios: ThresholdScenario[] = [
  {
    id: "medical",
    label: "Medical Screen",
    shortLabel: "Catch the cases",
    description:
      "A clinic flags patients for a follow-up test. Missing a true case hurts more than reviewing extra patients.",
    positiveLabel: "Needs follow-up",
    negativeLabel: "Routine",
    scoreLabel: "Risk score",
    thresholdLabel: "Flag for follow-up",
    defaultThreshold: 0.62,
    examples: [
      { id: "a", label: "Ava", score: 0.94, actual: "positive" },
      { id: "b", label: "Milo", score: 0.89, actual: "positive" },
      { id: "c", label: "Rin", score: 0.84, actual: "negative" },
      { id: "d", label: "Noor", score: 0.77, actual: "positive" },
      { id: "e", label: "Iris", score: 0.71, actual: "positive" },
      { id: "f", label: "Jules", score: 0.66, actual: "negative" },
      { id: "g", label: "Theo", score: 0.58, actual: "positive" },
      { id: "h", label: "Lena", score: 0.51, actual: "negative" },
      { id: "i", label: "Kai", score: 0.46, actual: "negative" },
      { id: "j", label: "Mina", score: 0.39, actual: "positive" },
      { id: "k", label: "Owen", score: 0.33, actual: "negative" },
      { id: "l", label: "Zara", score: 0.27, actual: "negative" },
    ],
  },
  {
    id: "spam",
    label: "Spam Filter",
    shortLabel: "Protect the inbox",
    description:
      "A mail client quarantines suspicious messages. Raising the threshold protects real mail but lets more spam through.",
    positiveLabel: "Spam",
    negativeLabel: "Inbox",
    scoreLabel: "Spam score",
    thresholdLabel: "Send to spam",
    defaultThreshold: 0.68,
    examples: [
      { id: "a", label: "Prize link", score: 0.97, actual: "positive" },
      { id: "b", label: "Crypto pitch", score: 0.91, actual: "positive" },
      { id: "c", label: "Invoice", score: 0.86, actual: "negative" },
      { id: "d", label: "Password reset", score: 0.79, actual: "negative" },
      { id: "e", label: "Coupon blast", score: 0.73, actual: "positive" },
      { id: "f", label: "Shipping alert", score: 0.64, actual: "negative" },
      { id: "g", label: "Survey reward", score: 0.57, actual: "positive" },
      { id: "h", label: "Team notes", score: 0.48, actual: "negative" },
      { id: "i", label: "Bank warning", score: 0.42, actual: "positive" },
      { id: "j", label: "Calendar invite", score: 0.31, actual: "negative" },
      { id: "k", label: "Receipt", score: 0.24, actual: "negative" },
      { id: "l", label: "Family photo", score: 0.12, actual: "negative" },
    ],
  },
  {
    id: "fraud",
    label: "Fraud Review",
    shortLabel: "Spend review time",
    description:
      "A payments team sends risky transactions to analysts. Lowering the threshold catches more fraud but floods the queue.",
    positiveLabel: "Fraud",
    negativeLabel: "Legit",
    scoreLabel: "Fraud score",
    thresholdLabel: "Manual review",
    defaultThreshold: 0.74,
    examples: [
      { id: "a", label: "Order 18", score: 0.96, actual: "positive" },
      { id: "b", label: "Order 04", score: 0.88, actual: "negative" },
      { id: "c", label: "Order 27", score: 0.82, actual: "positive" },
      { id: "d", label: "Order 31", score: 0.76, actual: "positive" },
      { id: "e", label: "Order 11", score: 0.69, actual: "negative" },
      { id: "f", label: "Order 02", score: 0.61, actual: "positive" },
      { id: "g", label: "Order 40", score: 0.54, actual: "negative" },
      { id: "h", label: "Order 08", score: 0.49, actual: "negative" },
      { id: "i", label: "Order 23", score: 0.43, actual: "positive" },
      { id: "j", label: "Order 36", score: 0.32, actual: "negative" },
      { id: "k", label: "Order 15", score: 0.23, actual: "negative" },
      { id: "l", label: "Order 06", score: 0.16, actual: "negative" },
    ],
  },
];

export const defaultThresholdScenario =
  thresholdScenarios.find((scenario) => scenario.id === "medical") ??
  thresholdScenarios[0];

export const defaultThresholdsByScenario = thresholdScenarios.reduce<ThresholdByScenario>(
  (thresholds, scenario) => ({
    ...thresholds,
    [scenario.id]: scenario.defaultThreshold,
  }),
  {
    medical: 0,
    spam: 0,
    fraud: 0,
  },
);
