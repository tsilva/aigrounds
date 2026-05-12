export type NormalizationMode = "training" | "inference";

export type BatchNormalizationInput = {
  values: number[];
  batchSize: number;
  gamma: number;
  beta: number;
  epsilon: number;
  mode: NormalizationMode;
  runningMean: number;
  runningStd: number;
};

export type BatchNormalizationAnalysis = {
  rawValues: number[];
  mean: number;
  variance: number;
  std: number;
  normalizationMean: number;
  normalizationStd: number;
  normalizedValues: number[];
  outputValues: number[];
  outputMean: number;
  outputStd: number;
};

export function mean(values: number[]) {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

export function variance(values: number[], center = mean(values)) {
  return (
    values.reduce((total, value) => total + (value - center) ** 2, 0) /
    values.length
  );
}

export function standardDeviation(values: number[], center = mean(values)) {
  return Math.sqrt(variance(values, center));
}

export function analyzeBatchNormalization({
  values,
  batchSize,
  gamma,
  beta,
  epsilon,
  mode,
  runningMean,
  runningStd,
}: BatchNormalizationInput): BatchNormalizationAnalysis {
  const rawValues = values.slice(0, batchSize);
  const batchMean = mean(rawValues);
  const batchVariance = variance(rawValues, batchMean);
  const batchStd = Math.sqrt(batchVariance);
  const normalizationMean = mode === "training" ? batchMean : runningMean;
  const normalizationStd = mode === "training" ? batchStd : runningStd;
  const normalizedValues = rawValues.map(
    (value) => (value - normalizationMean) / Math.sqrt(normalizationStd ** 2 + epsilon),
  );
  const outputValues = normalizedValues.map((value) => gamma * value + beta);
  const outputMean = mean(outputValues);

  return {
    rawValues,
    mean: batchMean,
    variance: batchVariance,
    std: batchStd,
    normalizationMean,
    normalizationStd,
    normalizedValues,
    outputValues,
    outputMean,
    outputStd: standardDeviation(outputValues, outputMean),
  };
}

export function formatValue(value: number, digits = 2) {
  const rounded = Number(value.toFixed(digits));

  if (Object.is(rounded, -0)) {
    return (0).toFixed(digits);
  }

  return rounded.toFixed(digits);
}

export function valueToPercent(value: number, min: number, max: number) {
  return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
}
