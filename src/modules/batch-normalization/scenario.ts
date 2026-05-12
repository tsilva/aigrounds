export type BatchScenarioId = "centered" | "shifted" | "wide" | "outlier";

export type BatchScenario = {
  id: BatchScenarioId;
  label: string;
  helper: string;
  values: number[];
  runningMean: number;
  runningStd: number;
};

export const batchNormalizationScenarios: BatchScenario[] = [
  {
    id: "centered",
    label: "Centered",
    helper: "Already near zero",
    values: [-1.2, -0.8, -0.3, -0.1, 0.2, 0.4, 0.8, 1.0],
    runningMean: 0.05,
    runningStd: 0.78,
  },
  {
    id: "shifted",
    label: "Shifted",
    helper: "Same shape, moved right",
    values: [2.0, 2.7, 3.4, 4.0, 4.8, 5.1, 6.2, 7.0],
    runningMean: 4.15,
    runningStd: 1.62,
  },
  {
    id: "wide",
    label: "Wide",
    helper: "Spread out activations",
    values: [-3.5, -2.2, -0.9, 0.2, 1.4, 2.1, 3.6, 4.9],
    runningMean: 0.55,
    runningStd: 2.55,
  },
  {
    id: "outlier",
    label: "Outlier",
    helper: "One activation dominates",
    values: [0.1, 0.3, 0.4, 0.6, 0.8, 1.0, 1.1, 6.2],
    runningMean: 1.05,
    runningStd: 1.85,
  },
];

export const defaultBatchScenario = batchNormalizationScenarios[1];
