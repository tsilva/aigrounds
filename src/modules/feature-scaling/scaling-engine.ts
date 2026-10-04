export type ScalingScenario = "units" | "outlier" | "constant";
export type ScalingMode = "raw" | "minmax" | "zscore";
export type ScalingState = { scenario: ScalingScenario; mode: ScalingMode; multiplier: number };

export const scalingScenarios = [
  { id: "units", label: "Different units", shortLabel: "Four fixed reference cases" },
  { id: "outlier", label: "Outlier", shortLabel: "Feature A ends at 20" },
  { id: "constant", label: "Constant feature", shortLabel: "Feature A stays at 2" },
];
export const scalingModes = [
  { id: "raw", label: "Raw" }, { id: "minmax", label: "Min–max" }, { id: "zscore", label: "Z-score" },
];

function columnStats(values: number[]) {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  const min = Math.min(...values), max = Math.max(...values);
  return { min, max, range: max - min, mean, variance, std: Math.sqrt(variance) };
}

export function analyzeScaling(state: ScalingState) {
  if (!["units", "outlier", "constant"].includes(state.scenario)
    || !["raw", "minmax", "zscore"].includes(state.mode)
    || !Number.isInteger(state.multiplier) || state.multiplier < 1 || state.multiplier > 10) {
    throw new Error("Invalid feature scenario, scaling method or unit multiplier");
  }
  const a = state.scenario === "units" ? [1, 2, 3, 4]
    : state.scenario === "outlier" ? [1, 2, 3, 20] : [2, 2, 2, 2];
  const b = [100, 150, 350, 400].map(value => value * state.multiplier);
  const raw = a.map((value, i) => [value, b[i]]);
  const stats = [columnStats(a), columnStats(b)];
  const recipes = stats.map(s => state.mode === "raw" ? { center: 0, denominator: 1 }
    : state.mode === "minmax" ? { center: s.min, denominator: s.range || 1 }
      : { center: s.mean, denominator: s.std || 1 });
  const values = raw.map(row => row.map((value, j) => (value - recipes[j].center) / recipes[j].denominator));
  const outputs = [0, 1].map(j => columnStats(values.map(row => row[j])));
  const terms = [0, 1].map(j => (values[3][j] - values[0][j]) ** 2);
  const distanceSquared = terms[0] + terms[1];
  return {
    ...state, raw, stats, recipes, values, outputs, terms, distanceSquared,
    shares: terms.map(term => term / distanceSquared),
  };
}

export type ScalingAnalysis = ReturnType<typeof analyzeScaling>;
export const scalingNumber = (value: number) => (Math.abs(value) < .0000005 ? 0 : value).toFixed(6);

export function scalingChart(a: ScalingAnalysis, width: number) {
  if (!Number.isFinite(width) || width < 200) throw new Error("Chart width must be at least 200");
  const left = 74, right = 24, span = width - left - right;
  return {
    width, height: 230, left, right, span,
    bars: a.shares.map((share, i) => ({ id: i, x: left, y: 30 + 70 * i, width: span * share, height: 24 })),
    ticks: [0, .5, 1].map(value => ({ value, x: left + span * value })),
  };
}
