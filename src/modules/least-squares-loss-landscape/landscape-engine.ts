export type LandscapeState = { slope: number; intercept: number };
export const landscapeValues = [2, 3, 3, 5, 5] as const;
export const landscapePresets = [
  { id: "far", label: "Far from fit", shortLabel: "Slope 0 · Intercept 6", slope: 0, intercept: 6 },
  { id: "balanced", label: "Balance sum", shortLabel: "Slope 0.4 · Intercept 2.8", slope: .4, intercept: 2.8 },
  { id: "other", label: "Other side", shortLabel: "Slope 1.2 · Intercept 1.2", slope: 1.2, intercept: 1.2 },
];
export function landscapePreset(id: string): LandscapeState { const p = landscapePresets.find(p => p.id === id); if (!p) throw new Error("Unknown parameter pair"); return { slope: p.slope, intercept: p.intercept }; }
export function landscapePresetId(s: LandscapeState) { return landscapePresets.find(p => p.slope === s.slope && p.intercept === s.intercept)?.id ?? "custom"; }
export function landscapeCost(slope: number, intercept: number) { return landscapeValues.reduce((sum, y, x) => sum + (y - slope * x - intercept) ** 2, 0); }
// Raw-sum OLS on these fixed integer observations. The denominator is positive.
const n = landscapeValues.length, sx = 10, sx2 = 30, sy = landscapeValues.reduce<number>((sum, y) => sum + y, 0), sxy = landscapeValues.reduce<number>((sum, y, x) => sum + x * y, 0), denominator = n * sx2 - sx * sx;
const minimumSlope = (n * sxy - sx * sy) / denominator, minimumIntercept = (sy * sx2 - sx * sxy) / denominator;
export const landscapeMinimum = { slope: minimumSlope, intercept: minimumIntercept, sse: landscapeCost(minimumSlope, minimumIntercept) };
export const landscapeMaximum = Math.max(...[-1, 2].flatMap(m => [0, 8].map(b => landscapeCost(m, b))));
export function analyzeLandscape(s: LandscapeState) {
  const grid = (v: number) => Number.isFinite(v) && Math.abs(v * 10 - Math.round(v * 10)) < 1e-9;
  if (!grid(s.slope) || s.slope < -1 || s.slope > 2 || !grid(s.intercept) || s.intercept < 0 || s.intercept > 8) throw new Error("Choose slope −1 to 2 and intercept 0 to 8 in tenths");
  const points = landscapeValues.map((y, x) => { const predicted = s.slope * x + s.intercept, residual = y - predicted; return { x, y, predicted, residual, squared: residual * residual }; });
  const tilt = 10 * (s.slope - landscapeMinimum.slope) ** 2, center = 5 * (s.intercept - landscapeMinimum.intercept + 2 * (s.slope - landscapeMinimum.slope)) ** 2;
  return { ...s, points, sse: points.reduce((sum, p) => sum + p.squared, 0), signed: points.reduce((sum, p) => sum + p.residual, 0), tilt, center, excess: tilt + center };
}
export type LandscapeAnalysis = ReturnType<typeof analyzeLandscape>;
export function landscapeNumber(n: number, decimals = 2) { return (Math.abs(n) < 1e-10 ? 0 : n).toFixed(decimals).replace("-", "−"); }
export function landscapeSigned(n: number) { return `${n < -1e-10 ? "−" : n > 1e-10 ? "+" : ""}${Math.abs(n) < 1e-10 ? "0.00" : Math.abs(n).toFixed(2)}`; }
export function landscapeColor(sse: number) { const t = Math.log1p(Math.min(landscapeMaximum, Math.max(0, sse))) / Math.log1p(landscapeMaximum); return `rgb(${[[40,245],[62,201],[105,146]].map(([lo,hi]) => Math.round(lo + (hi - lo) * t)).join(", ")})`; }
export const landscapeCells = Array.from({ length: 30 }, (_, i) => Array.from({ length: 80 }, (_, j) => { const slope = -1 + (i + .5) / 10, intercept = (j + .5) / 10, sse = landscapeCost(slope, intercept); return { i, j, slope, intercept, sse, color: landscapeColor(sse) }; })).flat();
export function landscapeChart(width: number) {
  if (!Number.isFinite(width) || width < 200) throw new Error("Chart width must be at least 200");
  const left = 52, right = 26, top = 26, baseline = 326, height = 374, plotWidth = width - left - right, plotHeight = baseline - top;
  const x = (m: number) => left + (m + 1) / 3 * plotWidth, y = (b: number) => baseline - b / 8 * plotHeight;
  return { width, height, left, right, top, baseline, plotWidth, plotHeight, minimum: { x: x(landscapeMinimum.slope), y: y(landscapeMinimum.intercept) },
    xTicks: [-1, 0, 1, 2].map(value => ({ value, x: x(value) })), yTicks: [0, 2, 4, 6, 8].map(value => ({ value, y: y(value) })),
    cells: landscapeCells.map(c => ({ ...c, x: left + c.i / 30 * plotWidth, y: baseline - (c.j + 1) / 80 * plotHeight, width: plotWidth / 30, height: plotHeight / 80 })),
    contours: [1.2, 2.4, 5, 20, 80, 200].map(level => { const dm = Math.sqrt((level - landscapeMinimum.sse) / 10), db = Math.sqrt((level - landscapeMinimum.sse) / 5); return { level, matrix: [plotWidth / 3 * dm, plotHeight / 4 * dm, 0, -plotHeight / 8 * db, x(landscapeMinimum.slope), y(landscapeMinimum.intercept)] }; }) };
}
export type LandscapeChart = ReturnType<typeof landscapeChart>;
export function landscapeLocation(s: LandscapeState, chart: LandscapeChart) { const x = chart.left + (s.slope + 1) / 3 * chart.plotWidth, y = chart.baseline - s.intercept / 8 * chart.plotHeight; return { x, y, diamond: `${x},${y - 9} ${x + 9},${y} ${x},${y + 9} ${x - 9},${y}` }; }
export function landscapeDrag(clientX: number, clientY: number, rect: { x: number; y: number; width: number; height: number }, chart: LandscapeChart) { const x = (clientX - rect.x) / rect.width * chart.width, y = (clientY - rect.y) / rect.height * chart.height; const snap = (v: number, min: number, max: number) => Number(Math.min(max, min + Math.round((Math.min(max, Math.max(min, v)) - min) / .1 + 1e-9) * .1).toFixed(1)); return { slope: snap(-1 + (x - chart.left) / chart.plotWidth * 3, -1, 2), intercept: snap((chart.baseline - y) / chart.plotHeight * 8, 0, 8) }; }
export function landscapePreview(a: LandscapeAnalysis, width: number) {
  const left = 44, right = 26, top = 20, baseline = 204, height = 250, x = (v: number) => left + v / 4 * (width - left - right), y = (v: number) => baseline - (v + 4) / 20 * (baseline - top);
  return { width, height, left, right, top, baseline, own: { x1: x(0), y1: y(a.intercept), x2: x(4), y2: y(4 * a.slope + a.intercept) }, points: a.points.map(p => ({ ...p, cx: x(p.x), cy: y(p.y), py: y(p.predicted) })), xTicks: [0, 1, 2, 3, 4].map(value => ({ value, x: x(value) })), yTicks: [-4, 0, 4, 8, 12, 16].map(value => ({ value, y: y(value) })) };
}
