import { type SoftmaxClass } from "./scenario";

export type TemperatureAnalysis = {
  scaledLogits: Record<string, number>;
  expValues: Record<string, number>;
  probabilities: Record<string, number>;
  topClass: SoftmaxClass;
  runnerUpClass: SoftmaxClass;
  confidence: number;
  margin: number;
  entropy: number;
  entropyRatio: number;
  entropyLabel: string;
  confidenceLabel: string;
  temperatureLabel: string;
  narrative: string;
};

const minTemperature = 0.25;
const maxTemperature = 3;

export function analyzeTemperature(
  classes: SoftmaxClass[],
  logits: Record<string, number>,
  temperature: number,
): TemperatureAnalysis {
  if (classes.length < 2) {
    throw new Error("Softmax temperature needs at least two classes.");
  }

  const safeTemperature = clamp(temperature, minTemperature, maxTemperature);
  const scaledLogits = Object.fromEntries(
    classes.map((classItem) => [
      classItem.id,
      (logits[classItem.id] ?? 0) / safeTemperature,
    ]),
  );
  const maxScaledLogit = Math.max(
    ...classes.map((classItem) => scaledLogits[classItem.id] ?? 0),
  );
  const expValues = Object.fromEntries(
    classes.map((classItem) => [
      classItem.id,
      Math.exp((scaledLogits[classItem.id] ?? 0) - maxScaledLogit),
    ]),
  );
  const expTotal = classes.reduce(
    (total, classItem) => total + (expValues[classItem.id] ?? 0),
    0,
  );
  const probabilities = Object.fromEntries(
    classes.map((classItem) => [
      classItem.id,
      (expValues[classItem.id] ?? 0) / expTotal,
    ]),
  );
  const rankedClasses = [...classes].sort(
    (left, right) =>
      (probabilities[right.id] ?? 0) - (probabilities[left.id] ?? 0),
  );
  const topClass = rankedClasses[0] ?? classes[0];
  const runnerUpClass = rankedClasses[1] ?? classes[1] ?? topClass;
  const confidence = probabilities[topClass.id] ?? 0;
  const margin = confidence - (probabilities[runnerUpClass.id] ?? 0);
  const entropy = classes.reduce((total, classItem) => {
    const probability = probabilities[classItem.id] ?? 0;

    return probability > 0 ? total - probability * Math.log(probability) : total;
  }, 0);
  const entropyRatio = entropy / Math.log(classes.length);

  return {
    scaledLogits,
    expValues,
    probabilities,
    topClass,
    runnerUpClass,
    confidence,
    margin,
    entropy,
    entropyRatio,
    entropyLabel: getEntropyLabel(entropyRatio),
    confidenceLabel: getConfidenceLabel(confidence),
    temperatureLabel: getTemperatureLabel(safeTemperature),
    narrative: getNarrative(safeTemperature, confidence, margin),
  };
}

export function setLogit(
  logits: Record<string, number>,
  classId: string,
  value: number,
) {
  return {
    ...logits,
    [classId]: round(clamp(value, -3, 3), 1),
  };
}

export function formatNumber(value: number, digits = 2) {
  return value.toFixed(digits);
}

export function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function getTemperatureLabel(temperature: number) {
  if (temperature < 0.65) {
    return "Sharp";
  }

  if (temperature > 1.6) {
    return "Soft";
  }

  return "Neutral";
}

function getEntropyLabel(entropyRatio: number) {
  if (entropyRatio < 0.45) {
    return "Low";
  }

  if (entropyRatio > 0.8) {
    return "High";
  }

  return "Medium";
}

function getConfidenceLabel(confidence: number) {
  if (confidence > 0.72) {
    return "Confident";
  }

  if (confidence < 0.42) {
    return "Unsure";
  }

  return "Leaning";
}

function getNarrative(temperature: number, confidence: number, margin: number) {
  if (temperature < 0.65 && confidence > 0.7) {
    return "Low temperature makes the leader absorb most of the probability mass.";
  }

  if (temperature > 1.6) {
    return "High temperature spreads probability back toward the other classes.";
  }

  if (margin < 0.12) {
    return "The logits are close, so softmax keeps the prediction cautious.";
  }

  return "The ranking comes from logits; temperature controls how decisive it feels.";
}

function round(value: number, digits: number) {
  const scale = 10 ** digits;

  return Math.round(value * scale) / scale;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
