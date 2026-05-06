import {
  type SoftmaxClass,
  type SoftmaxClassId,
  type SoftmaxLogits,
} from "./scenario";

export type TemperatureAnalysis = {
  scaledLogits: SoftmaxLogits;
  expValues: SoftmaxLogits;
  probabilities: SoftmaxLogits;
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
  logits: SoftmaxLogits,
  temperature: number,
): TemperatureAnalysis {
  if (classes.length < 2) {
    throw new Error("Softmax temperature needs at least two classes.");
  }

  const safeTemperature = clamp(temperature, minTemperature, maxTemperature);
  const scaledLogits = mapClassValues(
    classes,
    (classItem) => logits[classItem.id] / safeTemperature,
  );
  const maxScaledLogit = Math.max(
    ...classes.map((classItem) => scaledLogits[classItem.id]),
  );
  const expValues = mapClassValues(classes, (classItem) =>
    Math.exp(scaledLogits[classItem.id] - maxScaledLogit),
  );
  const expTotal = classes.reduce(
    (total, classItem) => total + expValues[classItem.id],
    0,
  );
  const probabilities = mapClassValues(
    classes,
    (classItem) => expValues[classItem.id] / expTotal,
  );
  const rankedClasses = [...classes].sort(
    (left, right) =>
      probabilities[right.id] - probabilities[left.id],
  );
  const topClass = rankedClasses[0] ?? classes[0];
  const runnerUpClass = rankedClasses[1] ?? classes[1] ?? topClass;
  const confidence = probabilities[topClass.id];
  const margin = confidence - probabilities[runnerUpClass.id];
  const entropy = classes.reduce((total, classItem) => {
    const probability = probabilities[classItem.id];

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
  logits: SoftmaxLogits,
  classId: SoftmaxClassId,
  value: number,
) {
  return {
    ...logits,
    [classId]: round(clamp(value, -3, 3), 1),
  };
}

function mapClassValues(
  classes: SoftmaxClass[],
  getValue: (classItem: SoftmaxClass) => number,
) {
  return classes.reduce<SoftmaxLogits>(
    (values, classItem) => ({
      ...values,
      [classItem.id]: getValue(classItem),
    }),
    {
      rover: 0,
      comet: 0,
      harbor: 0,
      signal: 0,
    },
  );
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
