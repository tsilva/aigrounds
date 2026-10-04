export type TsneState = { scenario: "clouds" | "bridge" | "duplicate"; perplexity: number; init: "A" | "B"; iterations: number };
export const tsneScenarios = [
  { id: "clouds", label: "Two clouds", shortLabel: "Eight fixed 3D points" },
  { id: "bridge", label: "Bridge", shortLabel: "Two points link the gap" },
  { id: "duplicate", label: "Duplicate pair", shortLabel: "P1 and P2 coincide" },
];
type Point = readonly number[];
export const tsnePoints: Record<TsneState["scenario"], readonly Point[]> = {
  clouds: [[-3, -2, 0], [-2, -3, 1], [-3, -3, 2], [-2, -2, 3], [2, 2, 0], [3, 2, 1], [2, 3, 2], [3, 3, 3]],
  bridge: [[-3, -2, 0], [-2, -3, 1], [-3, -3, 2], [-.5, 0, 1.5], [.5, 0, 1.5], [3, 2, 1], [2, 3, 2], [3, 3, 3]],
  duplicate: [[-3, -2, 0], [-3, -2, 0], [-3, -3, 2], [-2, -2, 3], [2, 2, 0], [3, 2, 1], [2, 3, 2], [3, 3, 3]],
};
export const tsneInitializations: Record<TsneState["init"], readonly Point[]> = {
  A: [[-.8, -.2], [.1, .7], [.6, -.5], [-.4, .6], [.8, .2], [-.1, -.7], [-.6, .5], [.4, -.6]],
  B: [[.5, .8], [-.7, .1], [.2, -.9], [.8, -.4], [-.5, -.8], [.7, -.1], [-.2, .9], [-.8, .4]],
};
export const squaredDistances = (points: readonly Point[]) => points.map(p => points.map(q => p.reduce((sum, v, k) => sum + (v - q[k]) ** 2, 0)));
export function sourceAffinities(points: readonly Point[], perplexity: number) {
  const n = points.length;
  if (!Number.isFinite(perplexity) || perplexity <= 1 || perplexity >= n) throw new Error("Perplexity must lie between one and sample count");
  const distances = squaredDistances(points);
  const rows = distances.map((distances, i) => {
    const minimum = Math.min(...distances.filter((_, j) => j !== i));
    if (distances.filter((d, j) => j !== i && d === minimum).length > perplexity) throw new Error("Requested perplexity is below the tied-neighbor entropy floor");
    let beta = 1, lo = 0, hi: number | null = null, probabilities: number[] = [], entropy = 0;
    for (let search = 0; search < 100; search++) {
      const weights = distances.map((d, j) => i === j ? 0 : Math.exp(-beta * (d - minimum)));
      const total = weights.reduce((s, v) => s + v, 0);
      probabilities = weights.map(v => v / total);
      entropy = -probabilities.reduce((s, v) => s + (v > 0 ? v * Math.log(v) : 0), 0);
      const difference = entropy - Math.log(perplexity);
      if (Math.abs(difference) < 1e-10) break;
      if (difference > 0) { lo = beta; beta = hi === null ? beta * 2 : (beta + hi) / 2; }
      else { hi = beta; beta = (lo + beta) / 2; }
    }
    return { probabilities, bandwidth: Math.sqrt(1 / (2 * beta)), entropy, achieved: Math.exp(entropy) };
  });
  const conditional = rows.map(r => r.probabilities);
  const joint = conditional.map((row, i) => row.map((v, j) => (v + conditional[j][i]) / (2 * n)));
  return { distances, rows, conditional, joint };
}
export function mapAffinities(positions: readonly Point[]) {
  const distances = squaredDistances(positions), weights = distances.map((row, i) => row.map((d, j) => i === j ? 0 : 1 / (1 + d)));
  const total = weights.reduce((sum, row) => sum + row.reduce((s, v) => s + v, 0), 0);
  return { distances, weights, joint: weights.map(row => row.map(v => v / total)) };
}
export const tsneKl = (p: readonly Point[], q: readonly Point[]) => Math.max(0, p.reduce((sum, row, i) => sum + row.reduce((s, v, j) => s + (v > 0 ? v * Math.log(v / q[i][j]) : 0), 0), 0));
export function tsneGradient(p: readonly Point[], positions: readonly Point[]) {
  const q = mapAffinities(positions);
  return positions.map((y, i) => y.map((v, k) => 4 * positions.reduce((s, z, j) => s + (p[i][j] - q.joint[i][j]) * q.weights[i][j] * (v - z[k]), 0)));
}
export function tsneStep(p: readonly Point[], positions: readonly Point[]) {
  const old = tsneKl(p, mapAffinities(positions).joint), gradient = tsneGradient(p, positions);
  let rate = 20;
  for (let back = 0; back < 20; back++) {
    const next = positions.map((y, i) => y.map((v, k) => v - rate * gradient[i][k]));
    const mean = [0, 1].map(k => next.reduce((sum, y) => sum + y[k], 0) / next.length);
    const centered = next.map(y => y.map((v, k) => v - mean[k])), kl = tsneKl(p, mapAffinities(centered).joint);
    if (kl <= old) return { positions: centered, kl, rate };
    rate /= 2;
  }
  return { positions: positions.map(y => [...y]), kl: old, rate: 0 };
}
export function tsneTrajectory(scenario: TsneState["scenario"], perplexity: number, init: TsneState["init"]) {
  if (!tsnePoints[scenario] || !Number.isInteger(perplexity) || perplexity < 2 || perplexity > 6 || !tsneInitializations[init]) throw new Error("Select a fixed scenario, perplexity 2..6 and initialization A or B");
  const source = sourceAffinities(tsnePoints[scenario], perplexity), positions = tsneInitializations[init].map(y => [...y]);
  const initial = { positions, kl: tsneKl(source.joint, mapAffinities(positions).joint), rate: 0 };
  const frames = [initial];
  for (let i = 0; i < 400; i++) frames.push(tsneStep(source.joint, frames[i].positions));
  return { scenario, perplexity, init, source, frames };
}
export type TsneTrajectory = ReturnType<typeof tsneTrajectory>;
export function tsneFrame(run: TsneTrajectory, iterations: number) {
  if (!Number.isInteger(iterations) || iterations < 0 || iterations > 400 || iterations % 50) throw new Error("Iterations must be 0..400 at fifty-step checkpoints");
  const frame = run.frames[iterations];
  return { ...frame, iterations, map: mapAffinities(frame.positions) };
}
export const tsneNumber = (value: number) => (Math.abs(value) < .0000005 ? 0 : value).toFixed(6);
export function tsneChart(positions: readonly Point[], selected: number, width: number) {
  if (!Number.isFinite(width) || width < 200 || !Number.isInteger(selected) || selected < 0 || selected >= positions.length) throw new Error("Select an existing point and a chart width at least 200");
  const span = Math.min(width - 80, 360), left = (width - span) / 2 + 8, top = 24, bottom = top + span;
  const extent = Math.max(1, ...positions.flatMap(y => y.map(Math.abs))) * 1.15;
  const point = (x: number, y: number) => ({ x: left + span * (x + extent) / (2 * extent), y: bottom - span * (y + extent) / (2 * extent) });
  const points = positions.map((y, i) => ({ id: `P${i + 1}`, ...point(y[0], y[1]) }));
  const current = points[selected], raw = positions[selected];
  return { width, height: span + 82, span, left, top, bottom, extent, origin: point(0, 0), points,
    selected: { ...current, labelX: raw[0] > extent * .6 ? -12 : 12, labelY: raw[1] > extent * .6 ? 22 : -12, anchor: raw[0] > extent * .6 ? "end" as const : "start" as const },
    ticks: [-extent, 0, extent].map(value => ({ value, ...point(value, value) })) };
}
