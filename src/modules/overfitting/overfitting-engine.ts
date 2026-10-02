import {
  overfittingScenarios,
  type OverfittingScenario,
} from "./scenario";

export type DataSplit = "train" | "test";

export type DataPoint = {
  id: string;
  split: DataSplit;
  x: number;
  y: number;
  trueY: number;
};

export type FittedPoint = DataPoint & {
  predictedY: number;
  residual: number;
};

export type OverfittingAnalysis = {
  scenario: OverfittingScenario;
  degree: number;
  noise: number;
  trainPoints: FittedPoint[];
  testPoints: FittedPoint[];
  coefficients: number[];
  trainMse: number;
  testMse: number;
  gap: number;
  plotMinY: number;
  plotMaxY: number;
  curve: Array<{ x: number; y: number; trueY: number }>;
  lossByDegree: Array<{
    degree: number;
    trainMse: number;
    testMse: number;
    curve: Array<{ x: number; y: number; trueY: number }>;
  }>;
};

const minDegree = 1;
const maxDegree = 12;
const minNoise = 0;
const maxNoise = 0.45;

export function analyzeOverfitting(
  scenarioId: string,
  degree: number,
  noise: number,
): OverfittingAnalysis {
  const scenario =
    overfittingScenarios.find((entry) => entry.id === scenarioId) ??
    overfittingScenarios[0];
  const safeDegree = clampInteger(degree, minDegree, maxDegree);
  const safeNoise = clamp(noise, minNoise, maxNoise);
  const trainPoints = buildPoints(
    scenario.trainX,
    scenario.trainNoise,
    safeNoise,
    "train",
  );
  const testPoints = buildPoints(
    scenario.testX,
    scenario.testNoise,
    safeNoise,
    "test",
  );
  const coefficients = fitPolynomial(trainPoints, safeDegree);
  const fittedTrain = applyFit(trainPoints, coefficients);
  const fittedTest = applyFit(testPoints, coefficients);
  const trainMse = meanSquaredError(fittedTrain);
  const testMse = meanSquaredError(fittedTest);
  const gap = testMse - trainMse;
  const lossByDegree = Array.from({ length: maxDegree }, (_, index) => {
    const nextDegree = index + 1;
    const nextCoefficients = fitPolynomial(trainPoints, nextDegree);
    const nextTrainMse = meanSquaredError(
      applyFit(trainPoints, nextCoefficients),
    );
    const nextTestMse = meanSquaredError(
      applyFit(testPoints, nextCoefficients),
    );

    return {
      degree: nextDegree,
      trainMse: nextTrainMse,
      testMse: nextTestMse,
      curve: sampleCurve(nextCoefficients),
    };
  });

  const allY = [...trainPoints, ...testPoints].map((point) => point.y).concat(lossByDegree.flatMap((fit) => fit.curve.flatMap((point) => [point.y, point.trueY])));
  return {
    scenario,
    degree: safeDegree,
    noise: safeNoise,
    trainPoints: fittedTrain,
    testPoints: fittedTest,
    coefficients,
    trainMse,
    testMse,
    gap,
    plotMinY: Math.floor(Math.min(-1, ...allY) * 1.1 * 2) / 2,
    plotMaxY: Math.ceil(Math.max(1, ...allY) * 1.1 * 2) / 2,
    curve: sampleCurve(coefficients),
    lossByDegree,
  };
}

export function formatMetric(value: number, digits = 3) {
  return value.toFixed(digits);
}

export function formatSigned(value: number, digits = 2) {
  const formatted = Math.abs(value).toFixed(digits);

  return value < 0 ? `-${formatted}` : `+${formatted}`;
}

function buildPoints(
  xValues: number[],
  noisePattern: number[],
  noise: number,
  split: DataSplit,
): DataPoint[] {
  return xValues.map((x, index) => {
    const trueY = trueFunction(x);
    const y = trueY + (noisePattern[index] ?? 0) * noise;

    return {
      id: `${split}-${index}`,
      split,
      x,
      y,
      trueY,
    };
  });
}

function trueFunction(x: number) {
  return 0.58 * Math.sin(Math.PI * (x + 0.12)) + 0.34 * x - 0.24 * x * x;
}

// A fixed tiny coefficient penalty keeps underdetermined fits unique.
// Reorthogonalized QR avoids squaring the design matrix's condition number.
export const coefficientPenalty = 0.0000001;
function fitPolynomial(points: DataPoint[], degree: number) {
  const size = degree + 1;
  const matrix = [
    ...points.map((point) => powersFor(point.x, degree)),
    ...Array.from({ length: size }, (_, row) => Array.from({ length: size }, (_, column) => row === column ? Math.sqrt(coefficientPenalty * (row === 0 ? .1 : 1)) : 0)),
  ];
  const targets = [...points.map((point) => point.y), ...Array(size).fill(0)];
  const q: number[][] = [];
  const r = Array.from({ length: size }, () => Array(size).fill(0) as number[]);
  for (let column = 0; column < size; column += 1) {
    const vector = matrix.map((row) => row[column]);
    for (let pass = 0; pass < 2; pass += 1) {
      for (let previous = 0; previous < column; previous += 1) {
        const projection = vector.reduce((sum, value, index) => sum + value * q[previous][index], 0);
        r[previous][column] += projection;
        for (let row = 0; row < vector.length; row += 1) vector[row] -= projection * q[previous][row];
      }
    }
    const norm = Math.hypot(...vector);
    r[column][column] = norm;
    q.push(vector.map((value) => value / norm));
  }
  const transformed = q.map((column) => column.reduce((sum, value, index) => sum + value * targets[index], 0));
  const coefficients = Array(size).fill(0) as number[];
  for (let row = size - 1; row >= 0; row -= 1) {
    coefficients[row] = (transformed[row] - r[row].slice(row + 1).reduce((sum, value, index) => sum + value * coefficients[row + 1 + index], 0)) / r[row][row];
  }
  return coefficients;
}

function powersFor(x: number, degree: number) {
  const powers = [1];

  for (let index = 1; index <= degree; index += 1) {
    powers.push(powers[index - 1] * x);
  }

  return powers;
}

function applyFit(points: DataPoint[], coefficients: number[]): FittedPoint[] {
  return points.map((point) => {
    const predictedY = predict(point.x, coefficients);

    return {
      ...point,
      predictedY,
      residual: point.y - predictedY,
    };
  });
}

function predict(x: number, coefficients: number[]) {
  return coefficients.reduce(
    (total, coefficient, degree) => total + coefficient * x ** degree,
    0,
  );
}

function meanSquaredError(points: FittedPoint[]) {
  if (points.length === 0) {
    return 0;
  }

  return (
    points.reduce((total, point) => total + point.residual ** 2, 0) /
    points.length
  );
}

function sampleCurve(coefficients: number[]) {
  return Array.from({ length: 120 }, (_, index) => {
    const x = -1 + (index / 119) * 2;

    return {
      x,
      y: predict(x, coefficients),
      trueY: trueFunction(x),
    };
  });
}

function clampInteger(value: number, min: number, max: number) {
  return Math.round(clamp(value, min, max));
}

function clamp(value: number, min: number, max: number) {
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min;
}
