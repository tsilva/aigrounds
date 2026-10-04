export type LineScenario = "rising" | "falling" | "straight";
export type LineState = { scenario: LineScenario; slope: number; intercept: number; revealed: boolean };
export const linePresets = [
  { id: "rising", label: "Rising", shortLabel: "Five scattered pairs", values: [2, 3, 3, 5, 5] },
  { id: "falling", label: "Falling", shortLabel: "Negative direction", values: [6, 5, 5, 3, 3] },
  { id: "straight", label: "Straight", shortLabel: "Exact line", values: [2, 3, 4, 5, 6] },
] as const;
export function analyzeLine(state: LineState) {
  const dataset = linePresets.find(d => d.id === state.scenario);
  const onGrid = (v: number) => Number.isFinite(v) && Math.abs(v * 10 - Math.round(v * 10)) < 1e-9;
  if (!dataset || !onGrid(state.slope) || state.slope < -1 || state.slope > 1 || !onGrid(state.intercept) || state.intercept < 0 || state.intercept > 8 || typeof state.revealed !== "boolean") throw new Error("Choose a known dataset, slope −1 to 1 and intercept 0 to 8 in tenths");
  const points = dataset.values.map((y, x) => { const predicted = state.slope * x + state.intercept, residual = y - predicted; return { x, y, predicted, residual, squared: residual * residual }; });
  const mx = 2, my = points.reduce((sum, p) => sum + p.y, 0) / points.length;
  const sxx = points.reduce((sum, p) => sum + (p.x - mx) ** 2, 0), sxy = points.reduce((sum, p) => sum + (p.x - mx) * (p.y - my), 0);
  const slope = sxy / sxx, intercept = my - slope * mx;
  const fitPoints = points.map(p => { const predicted = slope * p.x + intercept, residual = p.y - predicted; return { ...p, predicted, residual, squared: residual * residual }; });
  return { ...state, points, sse: points.reduce((sum, p) => sum + p.squared, 0), residualSum: points.reduce((sum, p) => sum + p.residual, 0), fit: { slope, intercept, points: fitPoints, sse: fitPoints.reduce((sum, p) => sum + p.squared, 0), residualSum: fitPoints.reduce((sum, p) => sum + p.residual, 0), mx, my } };
}
export type LineAnalysis = ReturnType<typeof analyzeLine>;
export function lineNumber(value: number, decimals = 2) { return (Math.abs(value) < 1e-10 ? 0 : value).toFixed(decimals).replace("-", "−"); }
export function lineSigned(value: number) { return `${value < -1e-10 ? "−" : value > 1e-10 ? "+" : ""}${Math.abs(value) < 1e-10 ? "0.00" : Math.abs(value).toFixed(2)}`; }
export function lineChart(a: LineAnalysis, width: number) {
  if (!Number.isFinite(width) || width < 200) throw new Error("Chart width must be at least 200");
  const left = 44, right = 26, top = 26, baseline = 326, height = 374;
  const x = (value: number) => left + value / 4 * (width - left - right), y = (value: number) => baseline - (value + 4) / 16 * (baseline - top);
  const segment = (m: number, b: number) => ({ x1: x(0), y1: y(b), x2: x(4), y2: y(m * 4 + b) });
  const own = segment(a.slope, a.intercept);
  return { width, height, left, right, top, baseline, own, reference: segment(a.fit.slope, a.fit.intercept), points: a.points.map(p => ({ ...p, cx: x(p.x), cy: y(p.y), py: y(p.predicted) })), xTicks: [0, 1, 2, 3, 4].map(value => ({ value, x: x(value) })), yTicks: [-4, 0, 4, 8, 12].map(value => ({ value, y: y(value) })), diamond: `${own.x2},${own.y2 - 9} ${own.x2 + 9},${own.y2} ${own.x2},${own.y2 + 9} ${own.x2 - 9},${own.y2}` };
}
export type LineChart = ReturnType<typeof lineChart>;
export type LineDrag = { mode: "intercept" | "slope" | "body"; startY: number; slope: number; intercept: number };
export function linePointerY(clientY: number, rect: { y: number; height: number }, chart: LineChart) { return -4 + (chart.baseline - (clientY - rect.y) / rect.height * chart.height) / (chart.baseline - chart.top) * 16; }
export function lineDragValue(drag: LineDrag, y: number) {
  const snap = (v: number, min: number, max: number) => {
    const bounded = Math.min(max, Math.max(min, v));
    return Number(Math.min(max, min + Math.round((bounded - min) / .1 + 1e-9) * .1).toFixed(1));
  };
  if (drag.mode === "slope") return { slope: snap((y - drag.intercept) / 4, -1, 1) };
  return { intercept: snap(drag.mode === "body" ? drag.intercept + y - drag.startY : y, 0, 8) };
}
