export type DataPoint = {
  id: string;
  label: string;
  value: number;
  color: string;
};

export type DeviationRow = {
  point: DataPoint;
  deviation: number;
  squaredDeviation: number;
  absoluteDeviation: number;
};

export type SpreadAnalysis = {
  count: number;
  sum: number;
  mean: number;
  variance: number;
  standardDeviation: number;
  squaredDeviationSum: number;
  min: number;
  max: number;
  range: number;
  rows: DeviationRow[];
  largestDeviationPointId: string;
  story: {
    deviation: string;
    variance: string;
    standardDeviation: string;
  };
};

const minValue = 0;
const maxValue = 100;

export function analyzeSpread(points: DataPoint[]): SpreadAnalysis {
  if (points.length === 0) {
    throw new Error("At least one data point is required.");
  }

  const values = points.map((point) => point.value);
  const count = values.length;
  const sum = values.reduce((total, value) => total + value, 0);
  const mean = sum / count;
  const rows = points.map((point) => {
    const deviation = point.value - mean;
    const squaredDeviation = deviation ** 2;

    return {
      point,
      deviation,
      squaredDeviation,
      absoluteDeviation: Math.abs(deviation),
    };
  });
  const squaredDeviationSum = rows.reduce(
    (total, row) => total + row.squaredDeviation,
    0,
  );
  const variance = squaredDeviationSum / count;
  const standardDeviation = Math.sqrt(variance);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const largestDeviationPoint =
    rows.reduce((largest, row) =>
      row.absoluteDeviation > largest.absoluteDeviation ? row : largest,
    ).point ?? points[0]!;

  return {
    count,
    sum,
    mean,
    variance,
    standardDeviation,
    squaredDeviationSum,
    min,
    max,
    range: max - min,
    rows,
    largestDeviationPointId: largestDeviationPoint.id,
    story: {
      deviation: deviationStory(standardDeviation),
      variance: varianceStory(variance),
      standardDeviation: standardDeviationStory(standardDeviation),
    },
  };
}

export function movePoint(
  points: DataPoint[],
  pointId: string,
  nextValue: number,
) {
  return points.map((point) =>
    point.id === pointId
      ? {
          ...point,
          value: clampValue(nextValue),
        }
      : point,
  );
}

export function makePoints(values: number[]): DataPoint[] {
  return values.map((value, index) => ({
    id: `point-${index + 1}`,
    label: String.fromCharCode(65 + index),
    value: clampValue(value),
    color: pointColors[index % pointColors.length] ?? "#352cff",
  }));
}

export function clampValue(value: number) {
  return Math.min(maxValue, Math.max(minValue, Math.round(value)));
}

function deviationStory(standardDeviation: number) {
  if (standardDeviation < 8) {
    return "Short bars mean most values sit close to the mean.";
  }

  if (standardDeviation < 18) {
    return "Mixed bars show a dataset with a visible but moderate spread.";
  }

  return "Long bars reveal values far from the mean.";
}

function varianceStory(variance: number) {
  if (variance < 70) {
    return "Squared deviations stay small when points cluster together.";
  }

  if (variance < 320) {
    return "A few bigger squared terms now dominate the average.";
  }

  return "Far points explode after squaring, so variance jumps fast.";
}

function standardDeviationStory(standardDeviation: number) {
  if (standardDeviation < 8) {
    return "Typical distance is small.";
  }

  if (standardDeviation < 18) {
    return "Typical distance is noticeable.";
  }

  return "Typical distance is large.";
}

const pointColors = [
  "#2563eb",
  "#2f39ff",
  "#5335f4",
  "#7c3aed",
  "#f59e0b",
  "#16a34a",
  "#ef4444",
];
