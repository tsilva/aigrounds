export type PowerState = { gap: number; size: number };
export const powerCritical = 1.959963984540054;
export const powerPresets = [
  { id: "none", label: "No effect", shortLabel: "True gap 0", gap: 0 },
  { id: "small", label: "Small effect", shortLabel: "True gap 1", gap: 1 },
  { id: "larger", label: "Larger effect", shortLabel: "True gap 2", gap: 2 },
];
export function powerDensity(z: number, mean: number) { return Math.exp(-((z - mean) ** 2) / 2) / Math.sqrt(2 * Math.PI); }
export function powerUpper(z: number): number {
  if (!Number.isFinite(z)) throw new Error("Normal distance must be finite");
  if (z < 0) return 1 - powerUpper(-z);
  if (z === 0) return .5;
  if (z > 4) {
    // NIST DLMF 7.9.2, transformed from erfc(z/√2).
    let fraction = 0;
    for (let k = 100; k >= 1; k--) fraction = (2 * k - 1) * (2 * k) / (z * z + 4 * k + 1 - fraction);
    return powerDensity(z, 0) * z / (z * z + 1 - fraction);
  }
  const t = 1 / (1 + .2316419 * z);
  return powerDensity(z, 0) * t * (.319381530 + t * (-.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
}
export function analyzePower(state: PowerState) {
  if (!Number.isFinite(state.gap) || state.gap < -3 || state.gap > 3 || !Number.isInteger(state.size) || state.size < 1 || state.size > 400) throw new Error("Choose gap −3 to 3 and integer group size 1 to 400");
  const se = Math.sqrt(16 / state.size + 16 / state.size), shift = state.gap / se, distance = Math.abs(shift);
  const power = powerUpper(powerCritical - distance) + powerUpper(powerCritical + distance);
  // Compute the central interval directly; 1-power would erase tiny positive misses.
  const beta = powerUpper(distance - powerCritical) - powerUpper(distance + powerCritical);
  return { ...state, se, shift, effect: state.gap / 4, power, beta, alpha: 2 * powerUpper(powerCritical) };
}
export type PowerAnalysis = ReturnType<typeof analyzePower>;
export function powerPercent(p: number) { return p > 0 && p < .0001 ? (p * 100).toExponential(2) + "%" : (p * 100).toFixed(2) + "%"; }
export function powerChart(a: PowerAnalysis, width: number) {
  if (!Number.isFinite(width) || width < 200) throw new Error("Chart width must be at least 200");
  const height = 300, left = 44, right = 20, top = 22, baseline = 254, min = -14, max = 14;
  const x = (v: number) => left + (v - min) / (max - min) * (width - left - right);
  const y = (d: number) => top + (.45 - d) / .45 * (baseline - top);
  const point = (v: number) => `${x(v).toFixed(3)},${y(powerDensity(v, a.shift)).toFixed(3)}`;
  const area = (lo: number, hi: number) => [`${x(lo).toFixed(3)},${baseline}`, ...Array.from({ length: 201 }, (_, i) => point(lo + (hi - lo) * i / 200)), `${x(hi).toFixed(3)},${baseline}`].join(" ");
  return { width, height, left, right, top, baseline, min, max,
    curve: Array.from({ length: 1401 }, (_, i) => point(min + (max - min) * i / 1400)).join(" "),
    areas: [area(min, -powerCritical), area(powerCritical, max)], boundaries: [-powerCritical, powerCritical].map(x), meanX: x(a.shift),
    ticks: [-12, -6, 0, 6, 12].map(value => ({ value, x: x(value) })),
    densityTicks: [0, .2, .4, .45].map(value => ({ value, y: y(value) })) };
}
