export type OverfittingScenario = {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  trainX: number[];
  testX: number[];
  trainNoise: number[];
  testNoise: number[];
  underfitUntil: number;
  overfitFrom: number;
};

export const overfittingScenarios: OverfittingScenario[] = [
  {
    id: "balanced",
    label: "Balanced Split",
    shortLabel: "Signal plus noise",
    description:
      "Enough training points to learn the curve, but still enough noise to tempt a wiggly fit.",
    trainX: [-0.96, -0.78, -0.62, -0.45, -0.27, -0.08, 0.11, 0.31, 0.5, 0.68, 0.84, 0.97],
    testX: [-0.88, -0.7, -0.54, -0.36, -0.18, 0.02, 0.22, 0.41, 0.59, 0.76, 0.91],
    trainNoise: [1.05, -0.85, 0.35, 0.92, -1.18, 0.74, -0.66, 1.2, -0.86, 0.48, -0.92, 0.82],
    testNoise: [-0.1, 0.16, -0.12, 0.08, -0.08, 0.18, -0.14, 0.06, -0.1, 0.12, -0.08],
    underfitUntil: 2,
    overfitFrom: 8,
  },
  {
    id: "sparse",
    label: "Sparse Training",
    shortLabel: "Few examples",
    description:
      "A small training set lets a complex curve memorize dots while missing the held-out trend.",
    trainX: [-0.94, -0.66, -0.39, -0.12, 0.18, 0.47, 0.73, 0.96],
    testX: [-0.86, -0.74, -0.55, -0.28, -0.02, 0.09, 0.32, 0.58, 0.82, 0.93],
    trainNoise: [0.7, -0.35, 0.64, -0.72, 0.42, -0.46, 0.38, -0.22],
    testNoise: [-0.18, 0.3, -0.28, 0.16, -0.12, 0.32, -0.35, 0.12, -0.18, 0.2],
    underfitUntil: 2,
    overfitFrom: 6,
  },
  {
    id: "smooth",
    label: "Low Noise",
    shortLabel: "Cleaner data",
    description:
      "When the dots are calmer, moderate complexity can help before the curve starts chasing tiny wiggles.",
    trainX: [-0.98, -0.82, -0.69, -0.51, -0.33, -0.14, 0.04, 0.23, 0.39, 0.57, 0.74, 0.89, 0.99],
    testX: [-0.91, -0.76, -0.59, -0.42, -0.22, -0.03, 0.15, 0.34, 0.49, 0.66, 0.81, 0.94],
    trainNoise: [0.24, -0.2, 0.12, 0.22, -0.32, 0.18, -0.15, 0.28, -0.18, 0.1, -0.2, 0.16, -0.1],
    testNoise: [-0.1, 0.16, -0.12, 0.1, -0.08, 0.14, -0.16, 0.08, -0.1, 0.12, -0.08, 0.1],
    underfitUntil: 2,
    overfitFrom: 9,
  },
];

export const defaultOverfittingScenario = overfittingScenarios[0];
export const initialDegree = 4;
export const initialNoise = 0.34;
