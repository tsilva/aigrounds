export type ShapePoint = {
  id: string;
  value: number;
  role: "regular" | "outlier";
};

export type ShapePresetId = "balanced" | "right-skew" | "left-skew" | "two-clusters";

export type HistogramBin = {
  id: string;
  start: number;
  end: number;
  center: number;
  count: number;
  outlierCount: number;
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

export type ShapeAnalysis = FiveNumberSummary & {
  points: ShapePoint[];
  baseSummary: FiveNumberSummary;
  mean: number;
  baseMean: number;
  histogram: HistogramBin[];
  maxBinCount: number;
  meanMedianGap: number;
  outlier: ShapePoint;
  outlierPercent: number;
  effects: {
    meanShift: number;
    medianShift: number;
    rangeShift: number;
    iqrShift: number;
  };
  story: {
    skew: string;
    sensitivity: string;
    robust: string;
    tail: string;
  };
};

const minValue = 0;
const maxValue = 100;
const binSize = 10;

export function clampShapeValue(value: number) {
  return Math.min(maxValue, Math.max(minValue, Math.round(value)));
}

export function makeShapePoints(values: number[], outlierValue: number): ShapePoint[] {
  return [
    ...values.map((value, index) => ({
      id: `point-${index + 1}`,
      value: clampShapeValue(value),
      role: "regular" as const,
    })),
    {
      id: "outlier",
      value: clampShapeValue(outlierValue),
      role: "outlier" as const,
    },
  ];
}

export function analyzeShape(
  baseValues: number[],
  outlierValue: number,
): ShapeAnalysis {
  if (baseValues.length < 5) {
    throw new Error("At least five regular values are required.");
  }

  const points = makeShapePoints(baseValues, outlierValue);
  const values = points.map((point) => point.value);
  const summary = fiveNumberSummary(values);
  const baseSummary = fiveNumberSummary(baseValues);
  const mean = average(values);
  const baseMean = average(baseValues);
  const histogram = makeHistogram(points);
  const maxBinCount = Math.max(...histogram.map((bin) => bin.count), 1);
  const outlier = points.find((point) => point.role === "outlier") ?? points[points.length - 1]!;
  const meanMedianGap = mean - summary.median;
  const effects = {
    meanShift: mean - baseMean,
    medianShift: summary.median - baseSummary.median,
    rangeShift: summary.range - baseSummary.range,
    iqrShift: summary.iqr - baseSummary.iqr,
  };

  return {
    ...summary,
    points,
    baseSummary,
    mean,
    baseMean,
    histogram,
    maxBinCount,
    meanMedianGap,
    outlier,
    outlierPercent: (outlier.value / maxValue) * 100,
    effects,
    story: {
      skew: skewStory(meanMedianGap),
      sensitivity: sensitivityStory(effects.meanShift, effects.rangeShift),
      robust: robustStory(effects.medianShift, effects.iqrShift),
      tail: tailStory(outlier.value, baseSummary),
    },
  };
}

export function fiveNumberSummary(values: number[]): FiveNumberSummary {
  if (values.length === 0) {
    throw new Error("At least one value is required.");
  }

  const sortedValues = [...values].sort((left, right) => left - right);
  const count = sortedValues.length;
  const min = sortedValues[0] ?? 0;
  const max = sortedValues[count - 1] ?? 0;
  const q1 = percentile(sortedValues, 0.25);
  const median = percentile(sortedValues, 0.5);
  const q3 = percentile(sortedValues, 0.75);

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

function average(values: number[]) {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function percentile(sortedValues: number[], ratio: number) {
  if (sortedValues.length === 1) {
    return sortedValues[0] ?? 0;
  }

  const position = (sortedValues.length - 1) * ratio;
  const lowerIndex = Math.floor(position);
  const upperIndex = Math.ceil(position);
  const lowerValue = sortedValues[lowerIndex] ?? 0;
  const upperValue = sortedValues[upperIndex] ?? lowerValue;

  return lowerValue + (upperValue - lowerValue) * (position - lowerIndex);
}

function makeHistogram(points: ShapePoint[]) {
  const bins: HistogramBin[] = Array.from({ length: maxValue / binSize }, (_, index) => {
    const start = index * binSize;
    const end = start + binSize;

    return {
      id: `${start}-${end}`,
      start,
      end,
      center: start + binSize / 2,
      count: 0,
      outlierCount: 0,
    };
  });

  for (const point of points) {
    const binIndex = Math.min(bins.length - 1, Math.floor(point.value / binSize));
    const bin = bins[binIndex]!;
    bin.count += 1;
    bin.outlierCount += point.role === "outlier" ? 1 : 0;
  }

  return bins;
}

function skewStory(meanMedianGap: number) {
  if (meanMedianGap > 3) {
    return "Right tail: the mean has been pulled above the median.";
  }

  if (meanMedianGap < -3) {
    return "Left tail: the mean has been pulled below the median.";
  }

  return "Balanced center: mean and median are telling a similar story.";
}

function sensitivityStory(meanShift: number, rangeShift: number) {
  const meanText =
    Math.abs(meanShift) < 0.5
      ? "Mean barely moved"
      : `Mean moved ${formatSigned(meanShift)}`;
  const rangeText =
    Math.abs(rangeShift) < 0.5
      ? "range stayed steady"
      : `range changed ${formatSigned(rangeShift)}`;

  return `${meanText}; ${rangeText}.`;
}

function robustStory(medianShift: number, iqrShift: number) {
  const medianText =
    Math.abs(medianShift) < 0.5
      ? "Median stayed put"
      : `Median moved ${formatSigned(medianShift)}`;
  const iqrText =
    Math.abs(iqrShift) < 0.5 ? "IQR stayed put" : `IQR moved ${formatSigned(iqrShift)}`;

  return `${medianText}; ${iqrText}.`;
}

function tailStory(outlierValue: number, baseSummary: FiveNumberSummary) {
  const tailMargin = baseSummary.iqr * 0.5;

  if (outlierValue > baseSummary.q3 + tailMargin) {
    return "The red point stretches the right tail.";
  }

  if (outlierValue < baseSummary.q1 - tailMargin) {
    return "The red point stretches the left tail.";
  }

  return "The red point has joined the main pile.";
}

function formatSigned(value: number) {
  const formatted = Math.abs(value).toFixed(1);

  if (value > 0) {
    return `+${formatted}`;
  }

  if (value < 0) {
    return `-${formatted}`;
  }

  return "0.0";
}
