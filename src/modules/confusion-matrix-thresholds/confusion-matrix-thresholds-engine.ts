export type ActualClass = "positive" | "negative";

export type PredictedClass = "positive" | "negative";

export type ThresholdExample = {
  id: string;
  label: string;
  score: number;
  actual: ActualClass;
};

export type ClassifiedExample = ThresholdExample & {
  predicted: PredictedClass;
  bucket: ConfusionBucket;
};

export type ConfusionBucket = "tp" | "fp" | "fn" | "tn";

export type ConfusionCounts = Record<ConfusionBucket, number>;

type ThresholdMetrics = {
  precision: number | null;
  recall: number | null;
  f1: number | null;
  accuracy: number;
  predictedPositive: number;
  predictedNegative: number;
  actualPositive: number;
  actualNegative: number;
};

export type ThresholdAnalysis = {
  threshold: number;
  examples: ClassifiedExample[];
  counts: ConfusionCounts;
  metrics: ThresholdMetrics;
};

function clampThreshold(value: number) {
  return Math.min(0.95, Math.max(0.05, value));
}

export function formatPercent(value: number | null, digits = 0) {
  if (value === null) {
    return "n/a";
  }

  return `${Math.round(value * 100).toFixed(digits)}%`;
}

export function formatDecimal(value: number | null, digits = 2) {
  if (value === null) {
    return "n/a";
  }

  return value.toFixed(digits);
}

export function analyzeThreshold(
  examples: ThresholdExample[],
  threshold: number,
): ThresholdAnalysis {
  const clampedThreshold = clampThreshold(threshold);
  const classifiedExamples = [...examples]
    .sort((left, right) => right.score - left.score)
    .map((example) => classifyExample(example, clampedThreshold));
  const counts = classifiedExamples.reduce<ConfusionCounts>(
    (nextCounts, example) => ({
      ...nextCounts,
      [example.bucket]: nextCounts[example.bucket] + 1,
    }),
    { tp: 0, fp: 0, fn: 0, tn: 0 },
  );

  return {
    threshold: clampedThreshold,
    examples: classifiedExamples,
    counts,
    metrics: calculateMetrics(counts),
  };
}

function classifyExample(
  example: ThresholdExample,
  threshold: number,
): ClassifiedExample {
  const predicted = example.score >= threshold ? "positive" : "negative";

  if (example.actual === "positive" && predicted === "positive") {
    return { ...example, predicted, bucket: "tp" };
  }

  if (example.actual === "negative" && predicted === "positive") {
    return { ...example, predicted, bucket: "fp" };
  }

  if (example.actual === "positive" && predicted === "negative") {
    return { ...example, predicted, bucket: "fn" };
  }

  return { ...example, predicted, bucket: "tn" };
}

function calculateMetrics(counts: ConfusionCounts): ThresholdMetrics {
  const predictedPositive = counts.tp + counts.fp;
  const predictedNegative = counts.tn + counts.fn;
  const actualPositive = counts.tp + counts.fn;
  const actualNegative = counts.tn + counts.fp;
  const total = actualPositive + actualNegative;
  const precision =
    predictedPositive === 0 ? null : counts.tp / predictedPositive;
  const recall = actualPositive === 0 ? null : counts.tp / actualPositive;
  const f1 =
    precision === null || recall === null || precision + recall === 0
      ? null
      : (2 * precision * recall) / (precision + recall);

  return {
    precision,
    recall,
    f1,
    accuracy: total === 0 ? 0 : (counts.tp + counts.tn) / total,
    predictedPositive,
    predictedNegative,
    actualPositive,
    actualNegative,
  };
}

export function describeTradeoff(analysis: ThresholdAnalysis) {
  const { counts, metrics } = analysis;

  if (counts.fn > counts.fp + 1) {
    return "This cutoff is strict: fewer reviews, but true positives are slipping below the line.";
  }

  if (counts.fp > counts.fn + 1) {
    return "This cutoff is generous: recall improves, but the positive queue now contains more false alarms.";
  }

  if (metrics.f1 !== null && metrics.f1 >= 0.75) {
    return "This cutoff is balanced for this batch: precision and recall are both pulling their weight.";
  }

  return "The threshold is near the tradeoff point: one small move can swap a false positive for a false negative.";
}
