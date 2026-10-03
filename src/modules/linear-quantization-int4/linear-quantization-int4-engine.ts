import { type QuantizationScenario } from "./scenario";
export type QuantizationRangePreset = "auto" | "tighter" | "wider";
export type QuantizedValue = { source: number; rounded: number; rawCode: number; code: number; dequantized: number; error: number; clipped: boolean };
export type HistogramBin = { label: string; start: number; end: number; count: number; ratio: number; kind: "underflow" | "interior" | "overflow" };
export type CodeBin = { code: number; center: number; count: number; clippedCount: number; ratio: number; selected: boolean };
export const int4Bits = 4, int4CodeCount = 16, int4QMin = 0, int4QMax = 15, float32Bits = 32;
export type QuantizationAnalysis = {
  min: number; max: number; scale: number; zeroPoint: number; selectedValue: number; selected: QuantizedValue;
  roundingInterval: { start: number; end: number }; inputInterval: { start: number; end: number };
  averageAbsoluteError: number; maxRoundingError: number; clippedCount: number; clippedRatio: number; compressionRatio: number;
  realHistogram: HistogramBin[]; codeBins: CodeBin[]; quantizedValues: QuantizedValue[];
  storage: { fp32Bytes: number; packedBytes: number; metadataBytes: number; totalBytes: number; ratio: number };
};
export function rangeForPreset(scenario: QuantizationScenario, preset: QuantizationRangePreset) {
  const midpoint = (scenario.defaultMin + scenario.defaultMax) / 2;
  const span = scenario.defaultMax - scenario.defaultMin;
  const factor = preset === "tighter" ? 0.68 : preset === "wider" ? 1.22 : 1;
  return { min: midpoint - span * factor / 2, max: midpoint + span * factor / 2 };
}
export function inspectorBounds(scenario: QuantizationScenario) {
  const wider = rangeForPreset(scenario, "wider");
  return { min: round(wider.min - 0.03, 3), max: round(wider.max + 0.03, 3) };
}
// Treat authored decimal inputs exactly when deciding a half-step tie. This avoids
// a binary division moving e.g. 0.050 / 0.020 just below the half boundary.
function decimalFraction(value: number): [bigint, bigint] {
  const [coefficient, exponent = "0"] = value.toString().toLowerCase().split("e");
  const [whole, fraction = ""] = coefficient.split(".");
  const places = fraction.length - Number(exponent);
  const numerator = BigInt(whole + fraction);
  return places >= 0 ? [numerator, BigInt(10) ** BigInt(places)] : [numerator * BigInt(10) ** BigInt(-places), BigInt(1)];
}
function roundFraction(numerator: bigint, denominator: bigint) {
  let lower = numerator / denominator;
  if (numerator < BigInt(0) && numerator % denominator !== BigInt(0)) lower -= BigInt(1);
  const remainder = numerator - lower * denominator;
  return Number(lower + (remainder * BigInt(2) >= denominator ? BigInt(1) : BigInt(0)));
}
function quantizeValue(value: number, scale: number, zeroPoint: number, spanUnits: number): QuantizedValue {
  const [n, d] = decimalFraction(value);
  const rounded = roundFraction(n * BigInt(15000), d * BigInt(spanUnits));
  const rawCode = rounded + zeroPoint;
  const code = Math.min(15, Math.max(0, rawCode));
  const dequantized = scale * (code - zeroPoint);
  return { source: value, rounded, rawCode, code, dequantized, error: dequantized - value, clipped: rawCode !== code };
}
export function analyzeQuantization(scenario: QuantizationScenario, preset: QuantizationRangePreset, selectedValue: number): QuantizationAnalysis {
  const range = rangeForPreset(scenario, preset);
  const min = round(range.min, 3), max = round(range.max, 3);
  if (![min, max, selectedValue, ...scenario.samples].every(Number.isFinite) || max <= min || scenario.samples.length === 0) throw new Error("Quantization requires finite values, a positive range and a nonempty sample block.");
  const spanUnits = Math.round((max - min) * 1000);
  const scale = spanUnits / 15000;
  const zeroPoint = Math.min(15, Math.max(0, roundFraction(BigInt(Math.round(-min * 1000)) * BigInt(15), BigInt(spanUnits))));
  const selected = quantizeValue(selectedValue, scale, zeroPoint, spanUnits);
  const quantizedValues = scenario.samples.map(value => quantizeValue(value, scale, zeroPoint, spanUnits));
  const averageAbsoluteError = quantizedValues.reduce((sum, v) => sum + Math.abs(v.error), 0) / quantizedValues.length;
  const clippedCount = quantizedValues.filter(v => v.clipped).length;
  const codeBins = Array.from({ length: 16 }, (_, code) => {
    const assigned = quantizedValues.filter(v => v.code === code);
    return { code, center: scale * (code - zeroPoint), count: assigned.length, clippedCount: assigned.filter(v => v.clipped).length, ratio: assigned.length / quantizedValues.length, selected: code === selected.code };
  });
  const roundingInterval = { start: selected.dequantized - scale / 2, end: selected.dequantized + scale / 2 };
  const fp32Bytes = scenario.samples.length * 4, packedBytes = Math.ceil(scenario.samples.length / 2), metadataBytes = 5;
  return { min, max, scale, zeroPoint, selectedValue, selected, roundingInterval,
    inputInterval: { start: selected.code === 0 ? -Infinity : roundingInterval.start, end: selected.code === 15 ? Infinity : roundingInterval.end },
    averageAbsoluteError, maxRoundingError: scale / 2, clippedCount, clippedRatio: clippedCount / quantizedValues.length, compressionRatio: 8,
    realHistogram: buildRealHistogram(scenario.samples, min, max), codeBins, quantizedValues,
    storage: { fp32Bytes, packedBytes, metadataBytes, totalBytes: packedBytes + metadataBytes, ratio: fp32Bytes / (packedBytes + metadataBytes) },
  };
}
function buildRealHistogram(values: number[], min: number, max: number): HistogramBin[] {
  const boundaries = Array.from({ length: 25 }, (_, i) => min + (max - min) * i / 24);
  const interior: HistogramBin[] = Array.from({ length: 24 }, (_, i) => ({ label: `[${formatSigned(boundaries[i], 5)}, ${formatSigned(boundaries[i + 1], 5)}${i === 23 ? "]" : ")"}`, start: boundaries[i], end: boundaries[i + 1], count: 0, ratio: 0, kind: "interior" }));
  const bins: HistogramBin[] = [{ label: `Below ${formatSigned(min, 5)}`, start: -Infinity, end: min, count: 0, ratio: 0, kind: "underflow" }, ...interior, { label: `Above ${formatSigned(max, 5)}`, start: max, end: Infinity, count: 0, ratio: 0, kind: "overflow" }];
  const minUnits = BigInt(Math.round(min * 1000));
  const spanUnits = BigInt(Math.round((max - min) * 1000));
  for (const value of values) {
    const [n, d] = decimalFraction(value);
    const offset = n * BigInt(1000) - minUnits * d;
    const span = spanUnits * d;
    const index = offset < BigInt(0) ? 0 : offset > span ? 25 : Math.min(24, Number(offset * BigInt(24) / span) + 1);
    bins[index].count += 1;
  }
  return bins.map(bin => ({ ...bin, ratio: bin.count / values.length }));
}
export function formatSigned(value: number, digits = 5) {
  const normalized = Math.abs(value) < 0.5 * 10 ** -digits ? 0 : value;
  return `${normalized > 0 ? "+" : ""}${normalized.toFixed(digits)}`;
}
export function formatPercent(value: number, digits = 2) { return `${(value * 100).toFixed(digits)}%`; }
function round(value: number, digits: number) { const factor = 10 ** digits; return Math.round(value * factor) / factor; }
