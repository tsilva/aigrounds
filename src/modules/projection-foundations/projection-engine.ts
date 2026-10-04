export type ProjectionState = { scenario: "horizontal" | "vertical" | "diagonal"; angle: number };
export const projectionScenarios = [
  { id: "horizontal", label: "Horizontal spread", shortLabel: "Four fixed points" },
  { id: "vertical", label: "Vertical spread", shortLabel: "Swap dominant direction" },
  { id: "diagonal", label: "Diagonal line", shortLabel: "Points on one line" },
];
export const projectionPoints: Record<ProjectionState["scenario"], readonly (readonly [number, number])[]> = {
  horizontal: [[-4, -1], [-2, 1], [2, -1], [4, 1]],
  vertical: [[-1, -4], [1, -2], [-1, 2], [1, 4]],
  diagonal: [[-4, -4], [-2, -2], [2, 2], [4, 4]],
};
export function analyzeProjection(state: ProjectionState) {
  if (!projectionPoints[state.scenario] || !Number.isInteger(state.angle) || state.angle < 0 || state.angle > 180 || state.angle % 5) throw new Error("Select a fixed scenario and an angle 0..180 in five-degree steps");
  const theta = state.angle * Math.PI / 180, s = Math.SQRT1_2;
  const cardinal: Record<number, readonly [number, number]> = { 0: [1, 0], 45: [s, s], 90: [0, 1], 135: [-s, s], 180: [-1, 0] };
  const direction = cardinal[state.angle] ?? [Math.cos(theta), Math.sin(theta)];
  const [ux, uy] = direction;
  // Exact equivalent outer-product matrices at special angles avoid artificial
  // residuals for points lying exactly on the 45-degree line.
  const exact: Record<number, readonly [number, number, number]> = { 0: [1, 0, 0], 45: [.5, .5, .5], 90: [0, 0, 1], 135: [.5, -.5, .5], 180: [1, 0, 0] };
  const [xx, xy, yy] = exact[state.angle] ?? [ux * ux, ux * uy, uy * uy];
  const rows = projectionPoints[state.scenario].map(([x, y], i) => {
    const component = x * ux + y * uy;
    const projected = [xx * x + xy * y, xy * x + yy * y] as const;
    const residual = [x - projected[0], y - projected[1]] as const;
    return { id: `P${i + 1}`, original: [x, y] as const, component, projected, residual,
      errorSquared: residual[0] ** 2 + residual[1] ** 2,
      retainedSquared: projected[0] ** 2 + projected[1] ** 2, originalSquared: x * x + y * y };
  });
  const mean = (key: "errorSquared" | "retainedSquared" | "originalSquared") => rows.reduce((sum, row) => sum + row[key], 0) / rows.length;
  return { ...state, direction, rows, meanError: mean("errorSquared"), meanRetained: mean("retainedSquared"), meanOriginal: mean("originalSquared") };
}
export type ProjectionAnalysis = ReturnType<typeof analyzeProjection>;
export const projectionNumber = (value: number) => (Math.abs(value) < .0000005 ? 0 : value).toFixed(6);
export function projectionChart(a: ProjectionAnalysis, width: number) {
  if (!Number.isFinite(width) || width < 200) throw new Error("Chart width must be at least 200");
  const span = Math.min(width - 80, 360), left = (width - span) / 2 + 8, top = 24, bottom = top + span;
  const point = (x: number, y: number) => ({ x: left + span * (x + 6) / 12, y: bottom - span * (y + 6) / 12 });
  const [ux, uy] = a.direction, start = point(-5.5 * ux, -5.5 * uy), end = point(5.5 * ux, 5.5 * uy);
  const head = `${end.x},${end.y} ${end.x - 10 * ux + 5 * uy},${end.y + 10 * uy + 5 * ux} ${end.x - 10 * ux - 5 * uy},${end.y + 10 * uy - 5 * ux}`;
  const rows = a.rows.map(row => ({ ...row, source: point(...row.original), target: point(...row.projected) }));
  const groups = rows.filter((row, i, all) => all.findIndex(r => r.projected[0] === row.projected[0] && r.projected[1] === row.projected[1]) === i).map(row => ({ ...row.target, ids: rows.filter(r => r.projected[0] === row.projected[0] && r.projected[1] === row.projected[1]).map(r => r.id) }));
  return { width, height: span + 82, span, left, top, bottom, origin: point(0, 0), start, end, head, rows, groups,
    ticks: [-6, -4, -2, 0, 2, 4, 6].map(value => ({ value, ...point(value, value) })) };
}
