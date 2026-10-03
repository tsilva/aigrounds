export const errorExamples = [
  { id: "null-high", label: "Null truth", shortLabel: "Observed Z 2.4", truth: "null", z: 2.4 },
  { id: "real-high", label: "Real gap", shortLabel: "Observed Z 2.4", truth: "real", z: 2.4 },
  { id: "null-low", label: "Null truth", shortLabel: "Observed Z 1.2", truth: "null", z: 1.2 },
  { id: "real-low", label: "Real gap", shortLabel: "Observed Z 1.2", truth: "real", z: 1.2 },
] as const;
export type ErrorExampleId = typeof errorExamples[number]["id"];
export type ErrorState = { cutoff: number; exampleId: ErrorExampleId };
export const differenceSE = Math.sqrt(16 / 25 + 16 / 25);
export const alternativeMean = 2.5 / differenceSE;
export function errorDensity(z: number, mean = 0) { return Math.exp(-((z - mean) ** 2) / 2) / Math.sqrt(2 * Math.PI); }
export function errorTail(z: number) {
  if (!Number.isFinite(z) || z < 0) throw new Error("Tail distance must be finite and nonnegative");
  if (z === 0) return .5;
  if (z > 4) {
    // NIST DLMF 7.9.2, transformed from erfc(z/√2).
    let fraction = 0;
    for (let k = 100; k >= 1; k--) fraction = (2 * k - 1) * (2 * k) / (z * z + 4 * k + 1 - fraction);
    return errorDensity(z) * z / (z * z + 1 - fraction);
  }
  const t = 1 / (1 + .2316419 * z);
  return errorDensity(z) * t * (.319381530 + t * (-.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
}
export function errorCDF(z: number) { return z < 0 ? errorTail(-z) : 1 - errorTail(z); }
export function analyzeErrors(state: ErrorState) {
  const example = errorExamples.find(e => e.id === state.exampleId);
  if (!example || !Number.isFinite(state.cutoff) || state.cutoff < 0 || state.cutoff > 4) throw new Error("Choose an example and cutoff from 0 to 4");
  const alpha = 2 * errorTail(state.cutoff);
  const beta = state.cutoff === 0 ? 0 : errorCDF(state.cutoff - alternativeMean) - errorCDF(-state.cutoff - alternativeMean);
  const reject = Math.abs(example.z) >= state.cutoff;
  const classification = example.truth === "null" ? reject ? "Type I false alarm" : "Correct non-alarm" : reject ? "Correct detection" : "Type II miss";
  return { ...state, example, alpha, beta, detection: 1 - beta, nonAlarm: 1 - alpha, reject, classification };
}
export type ErrorAnalysis = ReturnType<typeof analyzeErrors>;
export function errorPercent(p: number) { return (p * 100).toFixed(p > 0 && p < .0001 ? 4 : 2) + "%"; }
export function errorChart(a: ErrorAnalysis, width: number, truth: "null" | "real") {
  if (!Number.isFinite(width) || width < 200) throw new Error("Chart width must be at least 200");
  const height = 230, left = 44, right = 20, top = 22, baseline = 184, min = -7, max = 7, mean = truth === "null" ? 0 : alternativeMean;
  const x = (v: number) => left + (v - min) / (max - min) * (width - left - right);
  const y = (v: number) => top + (.45 - v) / .45 * (baseline - top);
  const point = (v: number) => `${x(v).toFixed(3)},${y(errorDensity(v, mean)).toFixed(3)}`;
  const polygon = (lo: number, hi: number) => [`${x(lo).toFixed(3)},${baseline}`, ...Array.from({ length: 151 }, (_, i) => point(lo + (hi - lo) * i / 150)), `${x(hi).toFixed(3)},${baseline}`].join(" ");
  return { width, height, left, right, top, baseline, min, max, mean,
    curve: Array.from({ length: 701 }, (_, i) => point(min + (max - min) * i / 700)).join(" "),
    areas: truth === "null" ? [polygon(min, -a.cutoff), polygon(a.cutoff, max)] : [polygon(-a.cutoff, a.cutoff)],
    boundaries: [-a.cutoff, a.cutoff].map(x), observedX: x(a.example.z), marker: a.example.truth === truth,
    ticks: [-6, -3, 0, 3, 6].map(value => ({ value, x: x(value) })),
    densityTicks: [0, .2, .4, .45].map(value => ({ value, y: y(value) })) };
}
