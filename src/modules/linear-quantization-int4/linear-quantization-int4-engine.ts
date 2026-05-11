import { type QuantizationScenario } from "./scenario";

export type QuantizationRangePreset = "auto" | "tighter" | "wider";

export type QuantizedValue = {
  source: number;
  rawCode: number;
  code: number;
  dequantized: number;
  error: number;
  clipped: boolean;
};

export type HistogramBin = {
  label: string;
  start: number;
  end: number;
  count: number;
  ratio: number;
  clipped: boolean;
};

export type CodeBin = {
  code: number;
  center: number;
  count: number;
  ratio: number;
  selected: boolean;
};

export type QuantizationAnalysis = {
  min: number;
  max: number;
  scale: number;
  zeroPoint: number;
  selectedValue: number;
  selected: QuantizedValue;
  roundingInterval: {
    start: number;
    end: number;
  };
  averageAbsoluteError: number;
  maxRoundingError: number;
  clippedRatio: number;
  compressionRatio: number;
  realHistogram: HistogramBin[];
  codeBins: CodeBin[];
  quantizedValues: QuantizedValue[];
};

export const int4Bits = 4;
export const int4CodeCount = 16;
export const int4QMin = 0;
export const int4QMax = int4CodeCount - 1;
export const float32Bits = 32;

export function rangeForPreset(
  scenario: QuantizationScenario,
  preset: QuantizationRangePreset,
) {
  const midpoint = (scenario.defaultMin + scenario.defaultMax) / 2;
  const span = scenario.defaultMax - scenario.defaultMin;

  if (preset === "tighter") {
    const tightSpan = span * 0.68;

    return {
      min: midpoint - tightSpan / 2,
      max: midpoint + tightSpan / 2,
    };
  }

  if (preset === "wider") {
    const wideSpan = span * 1.22;

    return {
      min: midpoint - wideSpan / 2,
      max: midpoint + wideSpan / 2,
    };
  }

  return {
    min: scenario.defaultMin,
    max: scenario.defaultMax,
  };
}

export function analyzeQuantization(
  scenario: QuantizationScenario,
  preset: QuantizationRangePreset,
  selectedValue: number,
): QuantizationAnalysis {
  const range = rangeForPreset(scenario, preset);
  const min = round(range.min, 3);
  const max = round(range.max, 3);
  const scale = (max - min) / int4QMax;
  const zeroPoint = clampInteger(Math.round(-min / scale), int4QMin, int4QMax);
  const selected = quantizeValue(selectedValue, scale, zeroPoint);
  const quantizedValues = scenario.samples.map((value) =>
    quantizeValue(value, scale, zeroPoint),
  );
  const absoluteErrors = quantizedValues.map((value) => Math.abs(value.error));
  const averageAbsoluteError =
    absoluteErrors.reduce((sum, value) => sum + value, 0) /
    Math.max(1, absoluteErrors.length);
  const clippedCount = quantizedValues.filter((value) => value.clipped).length;

  return {
    min,
    max,
    scale,
    zeroPoint,
    selectedValue,
    selected,
    roundingInterval: getRoundingInterval(selected.code, scale, zeroPoint),
    averageAbsoluteError,
    maxRoundingError: scale / 2,
    clippedRatio: clippedCount / Math.max(1, quantizedValues.length),
    compressionRatio: float32Bits / int4Bits,
    realHistogram: buildRealHistogram(scenario.samples, min, max),
    codeBins: buildCodeBins(quantizedValues, selected.code, scale, zeroPoint),
    quantizedValues,
  };
}

function quantizeValue(value: number, scale: number, zeroPoint: number) {
  const rawCode = Math.round(value / scale) + zeroPoint;
  const code = clampInteger(rawCode, int4QMin, int4QMax);
  const dequantized = scale * (code - zeroPoint);

  return {
    source: value,
    rawCode,
    code,
    dequantized,
    error: dequantized - value,
    clipped: rawCode !== code,
  };
}

function getRoundingInterval(code: number, scale: number, zeroPoint: number) {
  const center = scale * (code - zeroPoint);

  return {
    start: center - scale / 2,
    end: center + scale / 2,
  };
}

function buildRealHistogram(values: number[], min: number, max: number) {
  const binCount = 24;
  const span = max - min;
  const step = span / binCount;
  const bins = Array.from({ length: binCount }, (_, index) => {
    const start = min + index * step;
    const end = start + step;

    return {
      label: formatSigned((start + end) / 2, 2),
      start,
      end,
      count: 0,
      ratio: 0,
      clipped: false,
    };
  });

  for (const value of values) {
    const index = clampInteger(
      Math.floor((value - min) / step),
      0,
      binCount - 1,
    );
    bins[index].count += 1;
    bins[index].clipped = bins[index].clipped || value < min || value > max;
  }

  const maxCount = Math.max(1, ...bins.map((bin) => bin.count));

  return bins.map((bin) => ({
    ...bin,
    ratio: bin.count / maxCount,
    clipped: bin.clipped || bin.start < min + step || bin.end > max - step,
  }));
}

function buildCodeBins(
  quantizedValues: QuantizedValue[],
  selectedCode: number,
  scale: number,
  zeroPoint: number,
) {
  const counts = Array.from({ length: int4CodeCount }, () => 0);

  for (const value of quantizedValues) {
    counts[value.code] += 1;
  }

  const maxCount = Math.max(1, ...counts);

  return counts.map((count, code) => ({
    code,
    center: scale * (code - zeroPoint),
    count,
    ratio: count / maxCount,
    selected: code === selectedCode,
  }));
}

export function formatSigned(value: number, digits = 3) {
  const normalized = Math.abs(value) < 0.0005 ? 0 : value;
  const prefix = normalized > 0 ? "+" : "";

  return `${prefix}${normalized.toFixed(digits)}`;
}

export function formatPercent(value: number, digits = 1) {
  return `${(value * 100).toFixed(digits)}%`;
}

function round(value: number, digits: number) {
  const factor = 10 ** digits;

  return Math.round(value * factor) / factor;
}

function clampInteger(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(max, Math.max(min, Math.round(value)));
}
