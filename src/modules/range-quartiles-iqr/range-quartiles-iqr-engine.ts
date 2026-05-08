export type RangePoint = {
  id: string;
  label: string;
  value: number;
  color: string;
  role?: "regular" | "outlier";
};

export type FiveNumberSummary = {
  count: number;
  sortedValues: number[];
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  range: number;
  iqr: number;
};

export type SelectedPointSummary = {
  label: string;
  value: number;
  percentileRank: number;
  atOrBelow: number;
  valuesBelow: number;
  valuesAtOrBelow: number;
};

export type RangeQuartileAnalysis = FiveNumberSummary & {
  summary: FiveNumberSummary;
  sortedPoints: RangePoint[];
  lowerHalf: number[];
  upperHalf: number[];
  outlierPointIds: string[];
  selected: SelectedPointSummary;
  withoutOutlier: FiveNumberSummary;
  rangeJump: number;
  iqrShift: number;
  story: {
    range: string;
    iqr: string;
    selected: string;
  };
};

const minValue = 0;
const maxValue = 100;

export function analyzeRangeQuartiles(
  points: RangePoint[],
  selectedPointId: string,
): RangeQuartileAnalysis {
  if (points.length < 5) {
    throw new Error("At least five data points are required.");
  }

  const summary = fiveNumberSummary(points.map((point) => point.value));
  const sortedPoints = [...points].sort((left, right) => {
    if (left.value === right.value) {
      return left.label.localeCompare(right.label);
    }

    return left.value - right.value;
  });
  const middle = Math.floor(summary.sortedValues.length / 2);
  const lowerHalf = summary.sortedValues.slice(0, middle);
  const upperHalf =
    summary.sortedValues.length % 2 === 0
      ? summary.sortedValues.slice(middle)
      : summary.sortedValues.slice(middle + 1);
  const lowerFence = summary.q1 - 1.5 * summary.iqr;
  const upperFence = summary.q3 + 1.5 * summary.iqr;
  const outlierPointIds = points
    .filter((point) => point.value < lowerFence || point.value > upperFence)
    .map((point) => point.id);
  const outlierPointIdSet = new Set(outlierPointIds);
  const nonOutlierPoints = points.filter(
    (point) => !outlierPointIdSet.has(point.id),
  );
  const withoutOutlier = fiveNumberSummary(
    (nonOutlierPoints.length > 0 ? nonOutlierPoints : points).map(
      (point) => point.value,
    ),
  );
  const selectedPoint = points.find((point) => point.id === selectedPointId) ?? points[0]!;
  const valuesBelow = summary.sortedValues.filter(
    (value) => value < selectedPoint.value,
  ).length;
  const atOrBelow = summary.sortedValues.filter(
    (value) => value <= selectedPoint.value,
  ).length;
  const percentileRank = (atOrBelow / summary.count) * 100;
  const rangeJump = summary.range - withoutOutlier.range;
  const iqrShift = summary.iqr - withoutOutlier.iqr;
  const hasMarkedOutlier = outlierPointIds.length > 0;

  return {
    ...summary,
    summary,
    sortedPoints,
    lowerHalf,
    upperHalf,
    outlierPointIds,
    selected: {
      label: selectedPoint.label,
      value: selectedPoint.value,
      percentileRank,
      atOrBelow,
      valuesBelow,
      valuesAtOrBelow: atOrBelow,
    },
    withoutOutlier,
    rangeJump,
    iqrShift,
    story: {
      range: rangeStory(summary.range, rangeJump, hasMarkedOutlier),
      iqr: iqrStory(summary.iqr, summary.range, iqrShift, hasMarkedOutlier),
      selected: `${atOrBelow} of ${summary.count} values are at or below ${selectedPoint.label}.`,
    },
  };
}

export function movePoint(
  points: RangePoint[],
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

export function makeRangePoints(
  values: number[],
  outlierIndexes: number[] = [],
): RangePoint[] {
  const outlierIndexSet = new Set(outlierIndexes);

  return values.map((value, index) => ({
    id: `point-${index + 1}`,
    label: String.fromCharCode(65 + index),
    value: clampValue(value),
    color: pointColors[index % pointColors.length] ?? "#352cff",
    role: outlierIndexSet.has(index) ? "outlier" : "regular",
  }));
}

export function clampValue(value: number) {
  return Math.min(maxValue, Math.max(minValue, Math.round(value)));
}

export function fiveNumberSummary(values: number[]): FiveNumberSummary {
  if (values.length === 0) {
    throw new Error("At least one value is required.");
  }

  const sortedValues = [...values].sort((left, right) => left - right);
  const count = sortedValues.length;
  const min = sortedValues[0] ?? 0;
  const max = sortedValues[count - 1] ?? 0;
  const median = medianValue(sortedValues);
  const middle = Math.floor(count / 2);
  const lowerHalf =
    count % 2 === 0
      ? sortedValues.slice(0, middle)
      : sortedValues.slice(0, middle);
  const upperHalf =
    count % 2 === 0
      ? sortedValues.slice(middle)
      : sortedValues.slice(middle + 1);
  const q1 = medianValue(lowerHalf);
  const q3 = medianValue(upperHalf);

  return {
    count,
    sortedValues,
    min,
    q1,
    median,
    q3,
    max,
    range: max - min,
    iqr: q3 - q1,
  };
}

function medianValue(sortedValues: number[]) {
  const middle = Math.floor(sortedValues.length / 2);

  if (sortedValues.length % 2 === 1) {
    return sortedValues[middle] ?? 0;
  }

  return ((sortedValues[middle - 1] ?? 0) + (sortedValues[middle] ?? 0)) / 2;
}

function rangeStory(
  range: number,
  rangeJump: number,
  hasMarkedOutlier: boolean,
) {
  if (hasMarkedOutlier && rangeJump > 20) {
    return "The full span is being stretched by one extreme value.";
  }

  if (hasMarkedOutlier && rangeJump > 5) {
    return "The full span notices the outlier immediately.";
  }

  if (range <= 40) {
    return "The full span is short because min and max are close.";
  }

  return "The full span is wide because the values cover more of the scale.";
}

function iqrStory(
  iqr: number,
  range: number,
  iqrShift: number,
  hasMarkedOutlier: boolean,
) {
  if (hasMarkedOutlier && Math.abs(iqrShift) <= 3 && range - iqr > 30) {
    return "The middle 50% stayed much shorter than the full span.";
  }

  if (iqr >= 45) {
    return "The middle 50% widened because the center values spread apart.";
  }

  if (iqr <= 25) {
    return "The middle 50% is compact, so the box stays narrow.";
  }

  return "The middle 50% sits between Q1 and Q3.";
}

const pointColors = [
  "#2563eb",
  "#2f39ff",
  "#5335f4",
  "#7c3aed",
  "#f59e0b",
  "#16a34a",
  "#0891b2",
  "#db2777",
  "#ef4444",
];
