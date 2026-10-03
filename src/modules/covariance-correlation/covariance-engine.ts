export type Pair = { x: number; y: number };
export type CovarianceState = { points: Pair[]; scale: number };
const xs = [2, 3, 5, 7, 8];
export const covariancePresets = [
  { id: "positive", label: "Upward", shortLabel: "Same direction", ys: [2, 3, 5, 7, 8] },
  { id: "negative", label: "Downward", shortLabel: "Opposite direction", ys: [8, 7, 5, 3, 2] },
  { id: "balanced", label: "Balanced", shortLabel: "Canceling products", ys: [3, 7, 5, 7, 3] },
  { id: "flat", label: "Flat Y", shortLabel: "Zero spread", ys: [5, 5, 5, 5, 5] },
];
export function covarianceDataset(id: string): Pair[] {
  const preset = covariancePresets.find(p => p.id === id);
  if (!preset) throw new Error("Unknown paired dataset");
  return xs.map((x, i) => ({ x, y: preset.ys[i] }));
}
export function covariancePresetId(points: Pair[]) { return covariancePresets.find(p => points.length === 5 && points.every((v, i) => v.x === xs[i] && v.y === p.ys[i]))?.id ?? "custom"; }
export function analyzeCovariance(state: CovarianceState) {
  if (!Number.isInteger(state.scale) || state.scale < 1 || state.scale > 5 || state.points.length !== 5 || state.points.some(p => !Number.isFinite(p.x) || !Number.isFinite(p.y) || p.x < 0 || p.x > 10 || p.y < 0 || p.y > 10)) throw new Error("Use five finite paired values in 0 to 10 and an integer multiplier 1 to 5");
  const points = state.points.map(p => ({ x: p.x * state.scale, y: p.y })), mx = points.reduce((s, p) => s + p.x, 0) / 5, my = points.reduce((s, p) => s + p.y, 0) / 5;
  const terms = points.map(p => ({ ...p, dx: p.x - mx, dy: p.y - my, product: (p.x - mx) * (p.y - my) }));
  const total = terms.reduce((s, t) => s + t.product, 0), xx = terms.reduce((s, t) => s + t.dx * t.dx, 0), yy = terms.reduce((s, t) => s + t.dy * t.dy, 0);
  const sx = Math.sqrt(xx / 4), sy = Math.sqrt(yy / 4), covariance = total / 4, denominator = sx * sy, r = xx === 0 || yy === 0 ? null : Math.max(-1, Math.min(1, total / Math.sqrt(xx * yy)));
  return { points, terms, mx, my, total, sx, sy, covariance, denominator, r, scale: state.scale };
}
export type CovarianceAnalysis = ReturnType<typeof analyzeCovariance>;
export function covarianceNumber(value: number) { return (Object.is(value, -0) || Math.abs(value) < .00000001 ? 0 : value).toFixed(4); }
export function covarianceChart(a: CovarianceAnalysis, width: number) {
  if (!Number.isFinite(width) || width < 200) throw new Error("Chart width must be at least 200");
  const left = 52, right = 22, top = 28, baseline = 312, height = 360;
  const x = (value: number) => left + value / (10 * a.scale) * (width - left - right), y = (value: number) => baseline - value / 10 * (baseline - top);
  const points = a.points.map((p, i) => ({ id: i, x: x(p.x), y: y(p.y) })), labels: { x: number; y: number }[] = [];
  // Keep identities readable even at coincident values and plot boundaries.
  for (const p of points) {
    const candidates = [18, 36, 54, 72].flatMap(radius => Array.from({ length: 8 }, (_, i) => ({ x: Math.max(left + 9, Math.min(width - right - 9, p.x + radius * Math.cos(-Math.PI / 4 + i * Math.PI / 4))), y: Math.max(top + 10, Math.min(baseline - 10, p.y + radius * Math.sin(-Math.PI / 4 + i * Math.PI / 4))) })));
    const label = candidates.find(c => labels.every(l => Math.abs(c.x - l.x) >= 20 || Math.abs(c.y - l.y) >= 22) && points.every(q => Math.hypot(c.x - q.x, c.y - q.y) >= 16));
    if (!label) throw new Error("Point labels need more space");
    labels.push(label);
  }
  return { width, height, left, right, top, baseline, points, labels, meanX: x(a.mx), meanY: y(a.my), xTicks: [0, 2, 4, 6, 8, 10].map(v => ({ value: v * a.scale, x: x(v * a.scale) })), yTicks: [0, 2, 4, 6, 8, 10].map(value => ({ value, y: y(value) })) };
}
export function covarianceDrag(clientX: number, clientY: number, rect: { x: number; y: number; width: number; height: number }, chart: ReturnType<typeof covarianceChart>): Pair {
  const px = (clientX - rect.x) / rect.width * chart.width, py = (clientY - rect.y) / rect.height * chart.height;
  const snap = (v: number) => Math.max(0, Math.min(10, Math.round(v * 2) / 2));
  return { x: snap((px - chart.left) / (chart.width - chart.left - chart.right) * 10), y: snap((chart.baseline - py) / (chart.baseline - chart.top) * 10) };
}
