import { outputWeights, type BackpropCase } from "./scenario";

export type BackpropAnalysis = {
  h1: number;
  h2: number;
  target: 0 | 1;
  z: number;
  probability: number;
  loss: number;
  outputDelta: number;
  outputGradients: {
    wOut1: number;
    wOut2: number;
  };
  hiddenCredit: {
    h1: number;
    h2: number;
  };
  updates: {
    wOut1: WeightUpdate;
    wOut2: WeightUpdate;
  };
};

export type WeightUpdate = {
  before: number;
  gradient: number;
  change: number;
  after: number;
};

export function sigmoid(value: number) {
  return 1 / (1 + Math.exp(-value));
}

export function binaryCrossEntropy(probability: number, target: 0 | 1) {
  const clipped = Math.min(Math.max(probability, 0.000001), 0.999999);

  return target === 1 ? -Math.log(clipped) : -Math.log(1 - clipped);
}

export function analyzeBackprop(
  example: BackpropCase,
  learningRate: number,
): BackpropAnalysis {
  const [h1, h2] = example.hiddenActivations;
  const z = outputWeights.wOut1 * h1 + outputWeights.wOut2 * h2 + outputWeights.bias;
  const probability = roundTo(sigmoid(z), 3);
  const loss = binaryCrossEntropy(probability, example.target);
  const outputDelta = probability - example.target;
  const dWOut1 = h1 * outputDelta;
  const dWOut2 = h2 * outputDelta;
  const dH1 = outputWeights.wOut1 * outputDelta;
  const dH2 = outputWeights.wOut2 * outputDelta;

  return {
    h1,
    h2,
    target: example.target,
    z,
    probability,
    loss,
    outputDelta,
    outputGradients: {
      wOut1: dWOut1,
      wOut2: dWOut2,
    },
    hiddenCredit: {
      h1: dH1,
      h2: dH2,
    },
    updates: {
      wOut1: buildUpdate(outputWeights.wOut1, dWOut1, learningRate),
      wOut2: buildUpdate(outputWeights.wOut2, dWOut2, learningRate),
    },
  };
}

function roundTo(value: number, digits: number) {
  const factor = 10 ** digits;

  return Math.round(value * factor) / factor;
}

function buildUpdate(
  before: number,
  gradient: number,
  learningRate: number,
): WeightUpdate {
  const change = -learningRate * gradient;

  return {
    before,
    gradient,
    change,
    after: before + change,
  };
}

export function formatFixed(value: number, digits = 2) {
  return value.toFixed(digits);
}

export function formatSigned(value: number, digits = 3) {
  const formatted = Math.abs(value).toFixed(digits);

  if (Object.is(value, -0) || value < 0) {
    return `-${formatted}`;
  }

  return `+${formatted}`;
}

export function formatProbability(value: number) {
  return value.toFixed(3);
}
