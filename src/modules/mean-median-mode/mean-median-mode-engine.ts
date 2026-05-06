export type DataPoint = {
  id: string;
  label: string;
  value: number;
  color: string;
};

export type TypicalValuesAnalysis = {
  count: number;
  sum: number;
  sortedValues: number[];
  mean: number;
  median: number;
  modeValues: number[];
  modeFrequency: number;
  range: number;
  min: number;
  max: number;
  meanMedianGap: number;
  story: {
    mean: string;
    median: string;
    mode: string;
  };
};

const minValue = 0;
const maxValue = 100;

export function analyzeTypicalValues(points: DataPoint[]): TypicalValuesAnalysis {
  if (points.length === 0) {
    throw new Error("At least one data point is required.");
  }

  const values = points.map((point) => point.value);
  const sortedValues = [...values].sort((left, right) => left - right);
  const count = sortedValues.length;
  const sum = sortedValues.reduce((total, value) => total + value, 0);
  const mean = sum / count;
  const median = medianValue(sortedValues);
  const { modeValues, modeFrequency } = modeSummary(sortedValues);
  const min = sortedValues[0] ?? 0;
  const max = sortedValues[sortedValues.length - 1] ?? 0;

  return {
    count,
    sum,
    sortedValues,
    mean,
    median,
    modeValues,
    modeFrequency,
    range: max - min,
    min,
    max,
    meanMedianGap: mean - median,
    story: {
      mean: meanStory(mean, median),
      median: "Middle point after sorting. It ignores how far the extremes are.",
      mode:
        modeValues.length > 0
          ? "Most common value. It only appears when values repeat."
          : "No repeat yet. This dataset has no single most common value.",
    },
  };
}

export function movePoint(points: DataPoint[], pointId: string, nextValue: number) {
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
    color: pointColors[index % pointColors.length] ?? "#5335f4",
  }));
}

export function clampValue(value: number) {
  return Math.min(maxValue, Math.max(minValue, Math.round(value)));
}

function medianValue(sortedValues: number[]) {
  const middle = Math.floor(sortedValues.length / 2);

  if (sortedValues.length % 2 === 1) {
    return sortedValues[middle] ?? 0;
  }

  return ((sortedValues[middle - 1] ?? 0) + (sortedValues[middle] ?? 0)) / 2;
}

function modeSummary(sortedValues: number[]) {
  const counts = new Map<number, number>();

  for (const value of sortedValues) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  const modeFrequency = Math.max(...counts.values());

  if (modeFrequency < 2) {
    return {
      modeValues: [],
      modeFrequency: 1,
    };
  }

  return {
    modeValues: [...counts.entries()]
      .filter(([, frequency]) => frequency === modeFrequency)
      .map(([value]) => value),
    modeFrequency,
  };
}

function meanStory(mean: number, median: number) {
  const gap = mean - median;

  if (Math.abs(gap) < 3) {
    return "Balance point. It stays near the middle when values are even.";
  }

  if (gap > 0) {
    return "Balance point. A high value is pulling it to the right.";
  }

  return "Balance point. A low value is pulling it to the left.";
}

const pointColors = [
  "#2563eb",
  "#2f39ff",
  "#5335f4",
  "#7c3aed",
  "#f59e0b",
  "#16a34a",
  "#ef4444",
  "#0891b2",
  "#db2777",
];
