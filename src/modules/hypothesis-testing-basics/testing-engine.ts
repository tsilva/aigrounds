export type TestingState = { difference: number; size: number; alpha: number };
export const testingPresets = [
  { id: "equal", label: "Equal means", shortLabel: "Observed gap 0", difference: 0 },
  { id: "small", label: "Small gap", shortLabel: "Observed gap 1", difference: 1 },
  { id: "larger", label: "Larger gap", shortLabel: "Observed gap 2.5", difference: 2.5 },
];
export function nullDensity(z: number) { return Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI); }
export function testingTail(z: number) {
  if (!Number.isFinite(z) || z < 0) throw new Error("Tail distance must be finite and nonnegative");
  if (z === 0) return .5;
  if (z > 4) {
    // DLMF 7.9.2, transformed from erfc(z/√2). Preserve relative precision
    // for the very small probabilities in the displayed parameter range.
    let fraction = 0;
    for (let k = 100; k >= 1; k--) fraction = (2 * k - 1) * (2 * k) / (z * z + 4 * k + 1 - fraction);
    return nullDensity(z) * z / (z * z + 1 - fraction);
  }
  const t = 1 / (1 + .2316419 * z);
  return nullDensity(z) * t * (.319381530 + t * (-.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
}
export function testingCritical(alpha: number) {
  if (!Number.isInteger(alpha) || alpha < 1 || alpha > 10) throw new Error("Choose integer significance from 1 to 10 percent");
  let low = 0, high = 4;
  for (let i = 0; i < 60; i++) {
    const mid = (low + high) / 2;
    if (testingTail(mid) > alpha / 200) low = mid; else high = mid;
  }
  return (low + high) / 2;
}
export function testingDecision(p: number, alpha: number) {
  if (!Number.isFinite(p) || p < 0 || p > 1 || !Number.isInteger(alpha) || alpha < 1 || alpha > 10) throw new Error("Choose a probability and allowed significance");
  return p <= alpha / 100;
}
export function analyzeTesting(state: TestingState) {
  if (!Number.isFinite(state.difference) || state.difference < -3 || state.difference > 3 ||
    !Number.isInteger(state.size) || state.size < 1 || state.size > 400) throw new Error("Choose gap −3 to 3 and size 1–400 per group");
  const se = Math.sqrt(16 / state.size + 16 / state.size), z = state.difference / se;
  const tail = testingTail(Math.abs(z)), p = 2 * tail, critical = testingCritical(state.alpha);
  return { ...state, se, z, tail, p, critical, reject: testingDecision(p, state.alpha), meanA: 20, meanB: 20 + state.difference };
}
export type TestingAnalysis = ReturnType<typeof analyzeTesting>;
export function formatTestingP(p: number) { return p > 0 && p < .0001 ? p.toExponential(2) : p.toFixed(4); }
export function testingChart(a: TestingAnalysis, width: number) {
  if (!Number.isFinite(width) || width < 200) throw new Error("Chart width must be at least 200");
  const height = 300, left = 44, right = 20, top = 22, baseline = 254, min = -12, max = 12;
  const x = (v: number) => left + (v - min) / (max - min) * (width - left - right);
  const y = (v: number) => top + (.45 - v) / .45 * (baseline - top);
  const point = (v: number) => `${x(v).toFixed(3)},${y(nullDensity(v)).toFixed(3)}`;
  const extreme = Math.abs(a.z);
  const polygon = (lo: number, hi: number) => [`${x(lo).toFixed(3)},${baseline}`, ...Array.from({ length: 121 }, (_, i) => point(lo + (hi - lo) * i / 120)), `${x(hi).toFixed(3)},${baseline}`].join(" ");
  return { width, height, left, right, top, baseline, min, max,
    curve: Array.from({ length: 601 }, (_, i) => point(min + (max - min) * i / 600)).join(" "),
    tails: [polygon(min, -extreme), polygon(extreme, max)], observedX: x(a.z),
    extremes: [-extreme, extreme].map(x), criticals: [-a.critical, a.critical].map(x),
    ticks: [-12, -6, 0, 6, 12].map(value => ({ value, x: x(value) })),
    densityTicks: [0, .2, .4, .45].map(value => ({ value, y: y(value) })) };
}
