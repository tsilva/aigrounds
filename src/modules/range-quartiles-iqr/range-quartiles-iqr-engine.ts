export type RangePoint = { id: string; label: string; value: number };

export type FiveNumberSummary = {
  sortedValues: number[];
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  range: number;
  iqr: number;
};

export function clampValue(value: number) {
  if (!Number.isFinite(value)) throw new Error("A finite value is required.");
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function makeRangePoints(values: readonly number[]): RangePoint[] {
  return values.map((value, index) => ({
    id: `point-${index + 1}`,
    label: String.fromCharCode(65 + index),
    value: clampValue(value),
  }));
}

export function movePoint(points: RangePoint[], id: string, value: number) {
  const next = clampValue(value);
  return points.map((point) => point.id === id ? { ...point, value: next } : point);
}

export function sortPoints(points: RangePoint[]) {
  return [...points].sort((a, b) => a.value - b.value || a.label.localeCompare(b.label));
}

function median(values: number[]) {
  const middle = Math.floor(values.length / 2);
  return values.length % 2 ? values[middle]! : (values[middle - 1]! + values[middle]!) / 2;
}

// Median-of-halves convention: exclude the overall median for odd sample sizes.
export function fiveNumberSummary(values: readonly number[]): FiveNumberSummary {
  if (values.length < 2 || values.some((value) => !Number.isFinite(value))) {
    throw new Error("At least two finite values are required.");
  }
  const sortedValues = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sortedValues.length / 2);
  const min = sortedValues[0]!;
  const max = sortedValues[sortedValues.length - 1]!;
  const q1 = median(sortedValues.slice(0, middle));
  const q3 = median(sortedValues.slice(middle + sortedValues.length % 2));
  return { sortedValues, min, q1, median: median(sortedValues), q3, max, range: max - min, iqr: q3 - q1 };
}

// Collision packing preserves each value's exact horizontal position.
export function pointLanes(points: RangePoint[], width: number, spacing = 38) {
  const ends: number[] = [];
  const positions = new Map<string, number>();
  for (const point of sortPoints(points)) {
    const x = point.value / 100 * width;
    let lane = ends.findIndex((end) => x - end >= spacing);
    if (lane === -1) lane = ends.length;
    ends[lane] = x;
    positions.set(point.id, lane);
  }
  return { positions, count: ends.length };
}
