export type DistributionMode = "bernoulli" | "categorical" | "binomial";
export type MassPoint = { id: string; label: string; detail: string; probability: number; isTarget: boolean };
export type DistributionAnalysis = {
  mode: DistributionMode; p: number; trials: number; massPoints: MassPoint[];
  expectedValue: number | null; variance: number | null; totalMass: number; mostLikelyLabel: string;
};
export function clampProbability(value: number) { return Number.isNaN(value) ? 0.5 : Math.min(0.95, Math.max(0.05, value)); }
export function clampTrials(value: number) { return Number.isNaN(value) ? 8 : Math.min(16, Math.max(1, Math.round(value))); }
export function binomialCoefficient(n: number, k: number) {
  if (!Number.isInteger(n) || !Number.isInteger(k) || n < 0 || k < 0 || k > n) return 0;
  const smallerK = Math.min(k, n - k); let coefficient = 1;
  for (let i = 1; i <= smallerK; i++) coefficient = coefficient * (n - smallerK + i) / i;
  return coefficient;
}
export function binomialProbability(n: number, k: number, p: number) {
  if (!Number.isFinite(p) || p < 0 || p > 1) return 0;
  return binomialCoefficient(n, k) * p ** k * (1 - p) ** (n - k);
}
export function analyzeDistribution(mode: DistributionMode, p: number, trials: number): DistributionAnalysis {
  p = clampProbability(p); trials = clampTrials(trials);
  let massPoints: MassPoint[];
  if (mode === "categorical") {
    const values = [p, (1 - p) * .52, (1 - p) * .30, (1 - p) * .18];
    massPoints = ["A", "B", "C", "D"].map((label, i) => ({ id: label, label, detail: `class ${label}`, probability: values[i], isTarget: false }));
  } else if (mode === "binomial") {
    massPoints = Array.from({ length: trials + 1 }, (_, k) => ({ id: String(k), label: String(k), detail: `${k} success${k === 1 ? "" : "es"}`, probability: binomialProbability(trials, k, p), isTarget: false }));
  } else {
    massPoints = [{ id: "0", label: "0", detail: "failure", probability: 1 - p, isTarget: false }, { id: "1", label: "1", detail: "success", probability: p, isTarget: false }];
  }
  const largestMass = Math.max(...massPoints.map((point) => point.probability));
  // A small relative tolerance resolves floating-point arithmetic at exact
  // equal-mass modes (for example n=9,p=.5). UI probabilities step by .01.
  massPoints = massPoints.map((point) => ({ ...point, isTarget: Math.abs(point.probability - largestMass) <= largestMass * 1e-12 }));
  const numerical = mode !== "categorical", multiplier = mode === "binomial" ? trials : 1;
  return { mode, p, trials, massPoints, totalMass: massPoints.reduce((sum, point) => sum + point.probability, 0), expectedValue: numerical ? multiplier * p : null, variance: numerical ? multiplier * p * (1 - p) : null, mostLikelyLabel: massPoints.filter((point) => point.isTarget).map((point) => point.label).join(" & ") };
}
