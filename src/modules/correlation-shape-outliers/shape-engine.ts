export type ShapeState = { scenario: string; x: number; y: number };
export type ShapePair = { x: number; y: number };
export const shapePresets = [
  { id: "line", label: "Straight", shortLabel: "Same numeric trend", ys: [1, 2, 3, 4, 5, 6], x: 7, y: 7 },
  { id: "curve", label: "Increasing curve", shortLabel: "Same rank order", ys: [0, .5, 1, 1.5, 2.5, 5], x: 7, y: 9 },
  { id: "u", label: "U shape", shortLabel: "Turns back", ys: [9, 4, 1, 0, 1, 4], x: 7, y: 9 },
  { id: "outlier", label: "Off-pattern point", shortLabel: "One pair moved", ys: [1, 2, 3, 4, 5, 6], x: 9, y: 1 },
];
export function shapeDataset(id: string): ShapeState { const p = shapePresets.find(p => p.id === id); if (!p) throw new Error("Unknown shape scenario"); return { scenario: id, x: p.x, y: p.y }; }
export function shapePairs(state: ShapeState): ShapePair[] {
  const p = shapePresets.find(p => p.id === state.scenario);
  if (!p || !Number.isFinite(state.x) || !Number.isFinite(state.y) || state.x < 0 || state.x > 10 || state.y < 0 || state.y > 10) throw new Error("Choose a prepared shape and finite Point 7 coordinates 0 to 10");
  return [...p.ys.map((y, i) => ({ x: i + 1, y })), { x: state.x, y: state.y }];
}
export function shapePresetId(state: ShapeState) { const pairs = shapePairs(state); return shapePresets.find(p => p.x === state.x && p.y === state.y && p.ys.every((y, i) => y === pairs[i].y))?.id ?? "custom"; }
export function averageRanks(values: number[]) {
  if (values.some(v => !Number.isFinite(v))) throw new Error("Rank values must be finite");
  const ordered = values.map((value, index) => ({ value, index })).sort((a, b) => a.value - b.value), ranks = Array<number>(values.length);
  for (let first = 0; first < ordered.length;) { let end = first + 1; while (end < ordered.length && ordered[end].value === ordered[first].value) end++; const rank = (first + 1 + end) / 2; for (let i = first; i < end; i++) ranks[ordered[i].index] = rank; first = end; }
  return ranks;
}
export function pairedCorrelation(x: number[], y: number[]): number | null {
  if (x.length !== y.length || x.length < 2 || [...x, ...y].some(v => !Number.isFinite(v))) throw new Error("Use matching finite paired lists with at least two values");
  const mx = x.reduce((s, v) => s + v, 0) / x.length, my = y.reduce((s, v) => s + v, 0) / y.length;
  let xy = 0, xx = 0, yy = 0;
  for (let i = 0; i < x.length; i++) { const dx = x[i] - mx, dy = y[i] - my; xy += dx * dy; xx += dx * dx; yy += dy * dy; }
  return xx === 0 || yy === 0 ? null : Math.max(-1, Math.min(1, xy / Math.sqrt(xx * yy)));
}
export function analyzeShapePairs(points: ShapePair[]) { const x = points.map(p => p.x), y = points.map(p => p.y), rx = averageRanks(x), ry = averageRanks(y); return { points, rx, ry, r: pairedCorrelation(x, y), rho: pairedCorrelation(rx, ry), mx: x.reduce((s, v) => s + v, 0) / points.length, my: y.reduce((s, v) => s + v, 0) / points.length }; }
export function analyzeShape(state: ShapeState) { return analyzeShapePairs(shapePairs(state)); }
export function shapeNumber(value: number | null) { return value === null ? "Undefined" : (Math.abs(value) < 1e-10 ? 0 : value).toFixed(4); }
export function shapeChart(a: ReturnType<typeof analyzeShape>, width: number) {
  if (!Number.isFinite(width) || width < 200) throw new Error("Chart width must be at least 200");
  const left = 44, right = 22, top = 28, baseline = 304, height = 350, x = (v: number) => left + v / 10 * (width - left - right), y = (v: number) => baseline - v / 10 * (baseline - top);
  const points = a.points.map(p => ({ x: x(p.x), y: y(p.y) })), probe = points[6];
  const candidates = [18, 36, 54].flatMap(radius => Array.from({ length: 8 }, (_, i) => ({ x: Math.max(left + 9, Math.min(width - right - 9, probe.x + radius * Math.cos(-Math.PI / 4 + i * Math.PI / 4))), y: Math.max(top + 10, Math.min(baseline - 10, probe.y + radius * Math.sin(-Math.PI / 4 + i * Math.PI / 4))) })));
  const label = candidates.find(c => points.every(p => Math.hypot(c.x - p.x, c.y - p.y) >= 16));
  if (!label) throw new Error("Point label needs more space");
  return { width, height, left, right, top, baseline, points, label, diamond: [[probe.x, probe.y - 9], [probe.x + 9, probe.y], [probe.x, probe.y + 9], [probe.x - 9, probe.y]].map(p => p.map(v => v.toFixed(3)).join(",")).join(" "), ticks: [0, 2, 4, 6, 8, 10].map(value => ({ value, x: x(value), y: y(value) })) };
}
export function shapeDrag(clientX: number, clientY: number, rect: { x: number; y: number; width: number; height: number }, chart: ReturnType<typeof shapeChart>) { const px = (clientX - rect.x) / rect.width * chart.width, py = (clientY - rect.y) / rect.height * chart.height, snap = (v: number) => Math.max(0, Math.min(10, Math.round(v * 2) / 2)); return { x: snap((px - chart.left) / (chart.width - chart.left - chart.right) * 10), y: snap((chart.baseline - py) / (chart.baseline - chart.top) * 10) }; }
