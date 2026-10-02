import { type DistributionMode } from "./bernoulli-categorical-binomial-engine";

export type DistributionModeFact = {
  mode: DistributionMode;
  eyebrow: string;
  title: string;
  question: string;
  targetShape: string;
  parameter: string;
  support: string;
  formula: string;
  simplified: string;
  simulatorTitle: string;
  takeaway: string;
};

export const modeOrder: DistributionMode[] = [
  "bernoulli",
  "categorical",
  "binomial",
];

export const modeFacts: Record<DistributionMode, DistributionModeFact> = {
  bernoulli: {
    mode: "bernoulli",
    eyebrow: "one yes/no",
    title: "Bernoulli Trial",
    question: "Did one event succeed?",
    targetShape: "x is 0 or 1",
    parameter: "p = chance of success",
    support: "{0, 1}",
    formula: "P(X = x) = p^x(1 - p)^(1 - x)",
    simplified: "P(X = 1) = p, P(X = 0) = 1 - p",
    simulatorTitle: "One trial has two places for mass.",
    takeaway:
      "Bernoulli assigns probability to failure (0) and success (1) on one trial.",
  },
  categorical: {
    mode: "categorical",
    eyebrow: "one of many",
    title: "Categorical Choice",
    question: "Which single class happened?",
    targetShape: "one label from K classes",
    parameter: "one probability per class",
    support: "{A, B, C, D}",
    formula: "P(class i) = probability assigned to class i; all class probabilities sum to 1",
    simplified: "one draw, many buckets, total mass = 1",
    simulatorTitle: "One choice spreads mass across classes.",
    takeaway:
      "Categorical is a one-shot choice where every class owns a slice of the same probability mass.",
  },
  binomial: {
    mode: "binomial",
    eyebrow: "many repeats",
    title: "Binomial Count",
    question: "How many successes after n trials?",
    targetShape: "k successes from n trials",
    parameter: "n and p",
    support: "{0, 1, ..., n}",
    formula: "P(K = k) = C(n,k) p^k (1 - p)^(n-k)",
    simplified: "repeat Bernoulli n times, then count successes",
    simulatorTitle: "Repeated trials turn yes/no mass into a count shape.",
    takeaway:
      "Binomial repeats independent Bernoulli trials with the same success probability and asks for the count, not the exact order.",
  },
};

export const comparisonRows = modeOrder.map((mode) => {
  const fact = modeFacts[mode];

  return {
    mode,
    label: fact.title,
    asks: fact.question,
    parameter: fact.parameter,
    support: fact.support,
  };
});
