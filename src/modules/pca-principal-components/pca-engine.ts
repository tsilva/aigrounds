export type PcaState = { scenario: "correlated" | "shifted" | "balanced" | "constant"; angle: number; kept: 1 | 2 };
export const pcaScenarios = [
  { id: "correlated", label: "Correlated cloud", shortLabel: "Spread along a diagonal" },
  { id: "shifted", label: "Shifted cloud", shortLabel: "Same spread, new mean" },
  { id: "balanced", label: "Equal spread", shortLabel: "No unique first axis" },
  { id: "constant", label: "Constant cloud", shortLabel: "Zero total variance" },
];
export const pcaPoints: Record<PcaState["scenario"], readonly (readonly [number, number])[]> = {
  correlated: [[-4, -2], [-2, -4], [2, 4], [4, 2]],
  shifted: [[-2, -1], [0, -3], [4, 5], [6, 3]],
  balanced: [[-3, -3], [-3, 3], [3, -3], [3, 3]],
  constant: [[2, 1], [2, 1], [2, 1], [2, 1]],
};
export function analyzePca(state: PcaState) {
  if (!pcaPoints[state.scenario] || !Number.isInteger(state.angle) || state.angle < 0 || state.angle > 180 || state.angle % 5 || (state.kept !== 1 && state.kept !== 2)) throw new Error("Select a fixed cloud, angle 0..180 in five-degree steps and one or two retained components");
  const points = pcaPoints[state.scenario], n = points.length;
  const mean = [points.reduce((s, p) => s + p[0], 0) / n, points.reduce((s, p) => s + p[1], 0) / n] as const;
  const centered = points.map(p => [p[0] - mean[0], p[1] - mean[1]] as const);
  const covariance = [centered.reduce((s, c) => s + c[0] ** 2, 0) / (n - 1), centered.reduce((s, c) => s + c[0] * c[1], 0) / (n - 1), centered.reduce((s, c) => s + c[1] ** 2, 0) / (n - 1)] as const;
  const [a, b, d] = covariance, totalVariance = a + d, spread = Math.hypot(a - d, 2 * b);
  const eigenvalues = [(totalVariance + spread) / 2, (totalVariance - spread) / 2];
  const principalAngle = spread === 0 ? null : (Math.atan2(2 * b, a - d) * 90 / Math.PI + 180) % 180;
  const theta = state.angle * Math.PI / 180, s = Math.SQRT1_2;
  const cardinal: Record<number, readonly [number, number]> = { 0: [1, 0], 45: [s, s], 90: [0, 1], 135: [-s, s], 180: [-1, 0] };
  const direction = cardinal[state.angle] ?? [Math.cos(theta), Math.sin(theta)];
  const [ux, uy] = direction, perpendicular = [-uy, ux];
  const exact: Record<number, readonly [number, number, number]> = { 0: [1, 0, 0], 45: [.5, .5, .5], 90: [0, 0, 1], 135: [.5, -.5, .5], 180: [1, 0, 0] };
  const [xx, xy, yy] = exact[state.angle] ?? [ux * ux, ux * uy, uy * uy];
  const rows = points.map((original, i) => {
    const c = centered[i], scores = [c[0] * ux + c[1] * uy, -c[0] * uy + c[1] * ux];
    // A complete orthonormal basis reconstructs the original exactly. Special
    // one-axis matrices are algebraically equivalent to t1*u without false zeros.
    const reconstructed = state.kept === 2 ? [original[0], original[1]] : [mean[0] + xx * c[0] + xy * c[1], mean[1] + xy * c[0] + yy * c[1]];
    return { id: `P${i + 1}`, original, centered: c, scores, reconstructed, errorSquared: (original[0] - reconstructed[0]) ** 2 + (original[1] - reconstructed[1]) ** 2 };
  });
  const variances = [0, 1].map(j => rows.reduce((sum, r) => sum + r.scores[j] ** 2, 0) / (n - 1));
  const retainedRatio = totalVariance === 0 ? null : Math.min(1, Math.max(0, variances.slice(0, state.kept).reduce((sum, v) => sum + v, 0) / totalVariance));
  return { ...state, mean, covariance, eigenvalues, principalAngle, totalVariance, direction, perpendicular, rows, variances, retainedRatio,
    principalRatio: totalVariance === 0 ? null : eigenvalues[0] / totalVariance,
    meanError: rows.reduce((sum, r) => sum + r.errorSquared, 0) / n };
}
export type PcaAnalysis = ReturnType<typeof analyzePca>;
export const pcaNumber = (value: number | null) => value === null ? "Undefined" : (Math.abs(value) < .0000005 ? 0 : value).toFixed(6);
export function pcaChart(a: PcaAnalysis, width: number) {
  if (!Number.isFinite(width) || width < 200) throw new Error("Chart width must be at least 200");
  const span = Math.min(width - 80, 360), left = (width - span) / 2 + 8, top = 24, bottom = top + span;
  const point = (x: number, y: number) => ({ x: left + span * (x + 6) / 12, y: bottom - span * (y + 6) / 12 });
  const axes = [a.direction, a.perpendicular].map(([ux, uy]) => {
    const start = point(-5.5 * ux, -5.5 * uy), end = point(5.5 * ux, 5.5 * uy);
    return { start, end, head: `${end.x},${end.y} ${end.x - 10 * ux + 5 * uy},${end.y + 10 * uy + 5 * ux} ${end.x - 10 * ux - 5 * uy},${end.y + 10 * uy - 5 * ux}` };
  });
  const rows = a.rows.map(row => ({ ...row, source: point(...row.centered), target: point(row.reconstructed[0] - a.mean[0], row.reconstructed[1] - a.mean[1]) }));
  const groups = rows.filter((row, i, all) => all.findIndex(r => r.reconstructed[0] === row.reconstructed[0] && r.reconstructed[1] === row.reconstructed[1]) === i).map(row => ({ ...row.target, ids: rows.filter(r => r.reconstructed[0] === row.reconstructed[0] && r.reconstructed[1] === row.reconstructed[1]).map(r => r.id) }));
  const originalGroups = rows.filter((row, i, all) => all.findIndex(r => r.centered[0] === row.centered[0] && r.centered[1] === row.centered[1]) === i).map(row => {
    const ids = rows.filter(r => r.centered[0] === row.centered[0] && r.centered[1] === row.centered[1]).map(r => r.id);
    return { ...row.source, ids, labelX: ids.length > 1 ? 0 : row.centered[0] > 3 ? -12 : 12,
      labelY: row.centered[1] > 3 ? 24 : -14, anchor: ids.length > 1 ? "middle" as const : row.centered[0] > 3 ? "end" as const : "start" as const };
  });
  return { width, height: span + 82, span, left, top, bottom, origin: point(0, 0), axes, rows, groups, originalGroups,
    ticks: [-6, -4, -2, 0, 2, 4, 6].map(value => ({ value, ...point(value, value) })) };
}
