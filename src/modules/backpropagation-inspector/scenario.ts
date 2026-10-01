export type BackpropCaseId = "case-a" | "case-b" | "case-c";

export type BackpropCase = {
  id: BackpropCaseId;
  label: string;
  name: string;
  hiddenActivations: [number, number];
  target: 0 | 1;
  note: string;
};

export const outputWeights = {
  wOut1: 1.4,
  wOut2: -0.6,
  bias: -0.25,
};

export const defaultLearningRate = 0.2;
export const defaultCaseId: BackpropCaseId = "case-a";

export const backpropCases: BackpropCase[] = [
  {
    id: "case-a",
    label: "Case A",
    name: "Underprediction",
    hiddenActivations: [0.8, 0.35],
    target: 1,
    note: "The target is 1; how should the probability change?",
  },
  {
    id: "case-b",
    label: "Case B",
    name: "False alarm",
    hiddenActivations: [0.8, 0.35],
    target: 0,
    note: "The same weights now need to push probability down.",
  },
  {
    id: "case-c",
    label: "Case C",
    name: "Equal activations",
    hiddenActivations: [0.9, 0.9],
    target: 1,
    note: "Equal activations, different signed weights: compare the two kinds of gradients.",
  },
];

export function getBackpropCase(id: BackpropCaseId) {
  return backpropCases.find((example) => example.id === id) ?? backpropCases[0];
}
