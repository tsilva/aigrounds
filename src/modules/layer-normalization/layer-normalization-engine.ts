export type LayerNormInput = {
  values: number[];
  gamma: number[];
  beta: number[];
  epsilon: number;
};

export type LayerNormAnalysis = {
  values: number[];
  mean: number;
  variance: number;
  standardDeviation: number;
  normalizedValues: number[];
  normalizedMean: number;
  normalizedVariance: number;
  outputValues: number[];
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

export function analyzeLayerNormalization({
  values,
  gamma,
  beta,
  epsilon,
}: LayerNormInput): LayerNormAnalysis {
  const currentMean = mean(values);
  const currentVariance = variance(values, currentMean);
  const standardDeviation = Math.sqrt(currentVariance + epsilon);
  const normalizedValues = values.map(
    (value) => (value - currentMean) / standardDeviation,
  );
  const outputValues = normalizedValues.map(
    (value, index) => gamma[index] * value + beta[index],
  );

  return {
    values,
    mean: currentMean,
    variance: currentVariance,
    standardDeviation,
    normalizedValues,
    normalizedMean: mean(normalizedValues),
    normalizedVariance: variance(normalizedValues, mean(normalizedValues)),
    outputValues,
  };
}

export function formatValue(value: number, digits = 2) {
  const rounded = Number(value.toFixed(digits));

  if (Object.is(rounded, -0)) {
    return (0).toFixed(digits);
  }

  return rounded.toFixed(digits);
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function valueToPercent(value: number, min: number, max: number) {
  return clamp(((value - min) / (max - min)) * 100, 0, 100);
}
