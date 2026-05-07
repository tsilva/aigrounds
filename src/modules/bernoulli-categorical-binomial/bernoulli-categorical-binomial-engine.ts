export type DistributionMode = "bernoulli" | "categorical" | "binomial";

export type MassPoint = {
  id: string;
  label: string;
  detail: string;
  probability: number;
  tone: string;
  isTarget: boolean;
};

export type DistributionAnalysis = {
  mode: DistributionMode;
  p: number;
  trials: number;
  massPoints: MassPoint[];
  expectedValue: number;
  variance: number;
  targetProbability: number;
  mostLikelyLabel: string;
};

const categoryRemainderWeights = [0.52, 0.3, 0.18];
const categoryTones = ["#16a34a", "#3078f2", "#f59e0b", "#ff4545"];

export function clampProbability(value: number) {
  if (Number.isNaN(value)) {
    return 0.5;
  }

  return Math.min(0.95, Math.max(0.05, value));
}

export function clampTrials(value: number) {
  if (Number.isNaN(value)) {
    return 8;
  }

  return Math.min(16, Math.max(1, Math.round(value)));
}

export function binomialCoefficient(n: number, k: number) {
  if (k < 0 || k > n) {
    return 0;
  }

  const smallerK = Math.min(k, n - k);
  let coefficient = 1;

  for (let i = 1; i <= smallerK; i += 1) {
    coefficient = (coefficient * (n - smallerK + i)) / i;
  }

  return coefficient;
}

export function binomialProbability(n: number, k: number, p: number) {
  const probability = clampProbability(p);

  return (
    binomialCoefficient(n, k) *
    probability ** k *
    (1 - probability) ** (n - k)
  );
}

function roundProbability(value: number) {
  return Math.round(value * 1000) / 1000;
}

function formatSuccessCount(count: number) {
  return `${count} success${count === 1 ? "" : "es"}`;
}

function analyzeBernoulli(p: number, trials: number): DistributionAnalysis {
  const probability = clampProbability(p);
  const massPoints: MassPoint[] = [
    {
      id: "failure",
      label: "0",
      detail: "failure",
      probability: roundProbability(1 - probability),
      tone: "#94a3b8",
      isTarget: false,
    },
    {
      id: "success",
      label: "1",
      detail: "success",
      probability: roundProbability(probability),
      tone: "#16a34a",
      isTarget: true,
    },
  ];

  return {
    mode: "bernoulli",
    p: probability,
    trials,
    massPoints,
    expectedValue: probability,
    variance: probability * (1 - probability),
    targetProbability: probability,
    mostLikelyLabel: probability >= 0.5 ? "1 success" : "0 failure",
  };
}

function analyzeCategorical(p: number, trials: number): DistributionAnalysis {
  const probability = clampProbability(p);
  const remainder = 1 - probability;
  const probabilities = [
    probability,
    ...categoryRemainderWeights.map((weight) => remainder * weight),
  ];
  const labels = ["A", "B", "C", "D"];
  const details = ["target class", "near class", "middle class", "rare class"];
  const massPoints = labels.map((label, index) => ({
    id: label.toLowerCase(),
    label,
    detail: details[index],
    probability: roundProbability(probabilities[index]),
    tone: categoryTones[index],
    isTarget: index === 0,
  }));
  const mostLikelyPoint = massPoints.reduce((best, point) =>
    point.probability > best.probability ? point : best,
  );

  return {
    mode: "categorical",
    p: probability,
    trials,
    massPoints,
    expectedValue: probability,
    variance: 1 - probabilities.reduce((sum, item) => sum + item ** 2, 0),
    targetProbability: probability,
    mostLikelyLabel: `class ${mostLikelyPoint.label}`,
  };
}

function analyzeBinomial(p: number, trials: number): DistributionAnalysis {
  const probability = clampProbability(p);
  const n = clampTrials(trials);
  const mean = n * probability;
  const rawMassPoints = Array.from({ length: n + 1 }, (_, k) => {
    const probabilityMass = binomialProbability(n, k, probability);

    return {
      id: String(k),
      label: String(k),
      detail: formatSuccessCount(k),
      probability: roundProbability(probabilityMass),
      tone: "#3078f2",
      isTarget: false,
    };
  });
  const mostLikelyPoint = rawMassPoints.reduce((best, point) =>
    point.probability > best.probability ? point : best,
  );
  const massPoints = rawMassPoints.map((point) => {
    const isTarget = point.id === mostLikelyPoint.id;

    return {
      ...point,
      tone: isTarget ? "#16a34a" : point.tone,
      isTarget,
    };
  });

  return {
    mode: "binomial",
    p: probability,
    trials: n,
    massPoints,
    expectedValue: mean,
    variance: n * probability * (1 - probability),
    targetProbability: mostLikelyPoint.probability,
    mostLikelyLabel: formatSuccessCount(Number(mostLikelyPoint.label)),
  };
}

export function analyzeDistribution(
  mode: DistributionMode,
  p: number,
  trials: number,
): DistributionAnalysis {
  const clampedTrials = clampTrials(trials);

  if (mode === "categorical") {
    return analyzeCategorical(p, clampedTrials);
  }

  if (mode === "binomial") {
    return analyzeBinomial(p, clampedTrials);
  }

  return analyzeBernoulli(p, clampedTrials);
}
