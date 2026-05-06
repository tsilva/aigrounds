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

export type ComplexityStatus = "underfit" | "sweet-spot" | "overfit";

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
  status: ComplexityStatus;
  narrative: string;
  curve: Array<{ x: number; y: number; trueY: number }>;
  lossByDegree: Array<{
    degree: number;
    trainMse: number;
    testMse: number;
    status: ComplexityStatus;
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
      status: getStatus(nextDegree, nextTrainMse, nextTestMse, scenario),
    };
  });
  const status = getStatus(safeDegree, trainMse, testMse, scenario);

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
    status,
    narrative: describeFit(status, trainMse, testMse, safeDegree),
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

function fitPolynomial(points: DataPoint[], degree: number) {
  const size = degree + 1;
  const matrix = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => 0),
  );
  const vector = Array.from({ length: size }, () => 0);
  const ridge = degree >= points.length - 1 ? 0.00002 : 0.0000001;

  points.forEach((point) => {
    const powers = powersFor(point.x, degree);

    for (let row = 0; row < size; row += 1) {
      vector[row] += powers[row] * point.y;

      for (let column = 0; column < size; column += 1) {
        matrix[row][column] += powers[row] * powers[column];
      }
    }
  });

  for (let index = 0; index < size; index += 1) {
    matrix[index][index] += index === 0 ? ridge * 0.1 : ridge;
  }

  return solveLinearSystem(matrix, vector);
}

function powersFor(x: number, degree: number) {
  const powers = [1];

  for (let index = 1; index <= degree; index += 1) {
    powers.push(powers[index - 1] * x);
  }

  return powers;
}

function solveLinearSystem(matrix: number[][], vector: number[]) {
  const size = vector.length;
  const augmented = matrix.map((row, index) => [...row, vector[index]]);

  for (let pivotIndex = 0; pivotIndex < size; pivotIndex += 1) {
    let bestRow = pivotIndex;

    for (let row = pivotIndex + 1; row < size; row += 1) {
      if (
        Math.abs(augmented[row][pivotIndex]) >
        Math.abs(augmented[bestRow][pivotIndex])
      ) {
        bestRow = row;
      }
    }

    [augmented[pivotIndex], augmented[bestRow]] = [
      augmented[bestRow],
      augmented[pivotIndex],
    ];

    const pivot = augmented[pivotIndex][pivotIndex] || 1e-12;

    for (let column = pivotIndex; column <= size; column += 1) {
      augmented[pivotIndex][column] /= pivot;
    }

    for (let row = 0; row < size; row += 1) {
      if (row === pivotIndex) {
        continue;
      }

      const factor = augmented[row][pivotIndex];

      for (let column = pivotIndex; column <= size; column += 1) {
        augmented[row][column] -= factor * augmented[pivotIndex][column];
      }
    }
  }

  return augmented.map((row) => row[size] ?? 0);
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

function getStatus(
  degree: number,
  trainMse: number,
  testMse: number,
  scenario: OverfittingScenario,
): ComplexityStatus {
  if (degree <= scenario.underfitUntil || trainMse > 0.14) {
    return "underfit";
  }

  if (degree >= scenario.overfitFrom || testMse > trainMse + 0.16) {
    return "overfit";
  }

  return "sweet-spot";
}

function describeFit(
  status: ComplexityStatus,
  trainMse: number,
  testMse: number,
  degree: number,
) {
  if (status === "underfit") {
    return "The curve is too simple, so both training and future examples miss the same broad pattern.";
  }

  if (status === "overfit") {
    return `Degree ${degree} chases training noise: train MSE is ${formatMetric(
      trainMse,
    )}, but test MSE has climbed to ${formatMetric(testMse)}.`;
  }

  return "This is the useful middle: the curve follows the signal without memorizing every noisy bump.";
}

function clampInteger(value: number, min: number, max: number) {
  return Math.round(clamp(value, min, max));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
