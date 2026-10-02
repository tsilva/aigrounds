export type ShapePresetId = "balanced" | "right-skew" | "left-skew" | "two-clusters";
export type ShapePoint = { id: string; label: string; value: number; role: "fixed" | "movable" };
export type HistogramBin = { start: number; end: number; count: number; movableCount: number };

export function clampShapeValue(value: number) {
  if (!Number.isFinite(value)) throw new Error("A finite value is required.");
  return Math.min(100, Math.max(0, Math.round(value)));
}

function median(values: number[]) {
  const middle = Math.floor(values.length / 2);
  return values.length % 2 ? values[middle]! : (values[middle - 1]! + values[middle]!) / 2;
}

// Match Range, Quartiles & IQR: exclude the median for odd counts.
export function fiveNumberSummary(values: number[]) {
  if (values.length < 2 || values.some((value) => !Number.isFinite(value))) {
    throw new Error("At least two finite values are required.");
  }
  const sortedValues = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sortedValues.length / 2);
  const min = sortedValues[0]!;
  const max = sortedValues[sortedValues.length - 1]!;
  const q1 = median(sortedValues.slice(0, middle));
  const q3 = median(sortedValues.slice(middle + sortedValues.length % 2));
  return { sortedValues, min, max, q1, q3, median: median(sortedValues), range: max - min, iqr: q3 - q1 };
}

export function analyzeShape(baseValues: number[], movableValue: number) {
  if (baseValues.length < 5) throw new Error("At least five fixed values are required.");
  const points: ShapePoint[] = [
    ...baseValues.map((value, index) => ({ id: `point-${index + 1}`, label: String.fromCharCode(65 + index), value: clampShapeValue(value), role: "fixed" as const })),
    { id: "movable", label: "M", value: clampShapeValue(movableValue), role: "movable" },
  ];
  const values = points.map((point) => point.value);
  const summary = fiveNumberSummary(values);
  const sum = values.reduce((total, value) => total + value, 0);
  const histogram: HistogramBin[] = Array.from({ length: 10 }, (_, index) => {
    const start = index * 10;
    const members = points.filter((point) => Math.min(9, Math.floor(point.value / 10)) === index);
    return { start, end: start + 10, count: members.length, movableCount: members.filter((point) => point.role === "movable").length };
  });
  const lowerFence = summary.q1 - 1.5 * summary.iqr;
  const upperFence = summary.q3 + 1.5 * summary.iqr;
  const flaggedValues = values.filter((value) => value < lowerFence || value > upperFence).sort((a, b) => a - b);
  return { ...summary, count: values.length, sum, mean: sum / values.length, points, histogram, lowerFence, upperFence, flaggedValues };
}

export type ShapeAnalysis = ReturnType<typeof analyzeShape>;
