export type VectorState = { ax: number; ay: number; bx: number; by: number };
export type VectorId = "A" | "B";
export const vectorScenarios = [
  { id: "angled", label: "Angled pair", shortLabel: "A (1,2), B (2,1)" },
  { id: "right", label: "Right angle", shortLabel: "A (3,4), B (−4,3)" },
  { id: "zero", label: "Zero vector", shortLabel: "B has no direction" },
];
export const vectorPresets: Record<string, VectorState> = {
  angled: { ax: 1, ay: 2, bx: 2, by: 1 }, right: { ax: 3, ay: 4, bx: -4, by: 3 }, zero: { ax: 3, ay: 4, bx: 0, by: 0 },
};
export function vectorPresetId(state: VectorState) {
  return Object.entries(vectorPresets).find(([, v]) => v.ax === state.ax && v.ay === state.ay && v.bx === state.bx && v.by === state.by)?.[0] ?? "custom";
}
export function analyzeVectors(state: VectorState) {
  if (![state.ax, state.ay, state.bx, state.by].every(v => Number.isInteger(v) && v >= -5 && v <= 5)) throw new Error("Vector coordinates must be integers from -5 to 5");
  const squared = [state.ax ** 2 + state.ay ** 2, state.bx ** 2 + state.by ** 2];
  const norms = squared.map(v => Math.sqrt(v));
  const terms = [state.ax * state.bx, state.ay * state.by];
  const dot = terms.reduce((sum, value) => sum + value, 0), denominator = Math.sqrt(squared[0] * squared[1]);
  const cosine = denominator === 0 ? null : Math.max(-1, Math.min(1, dot / denominator));
  return { ...state, terms, squared, norms, dot, denominator, cosine, angle: cosine === null ? null : Math.acos(cosine) * 180 / Math.PI };
}
export type VectorAnalysis = ReturnType<typeof analyzeVectors>;
export const vectorNumber = (value: number | null) => value === null ? "Undefined" : (Math.abs(value) < .0000005 ? 0 : value).toFixed(6);
export const boundVectorCoordinate = (value: number) => Math.min(5, Math.max(-5, Math.round(value)));
export function vectorChart(a: VectorAnalysis, width: number) {
  if (!Number.isFinite(width) || width < 200) throw new Error("Chart width must be at least 200");
  const span = Math.min(width - 80, 360), left = (width - span) / 2 + 8, top = 24, bottom = top + span;
  const point = (x: number, y: number) => ({ x: left + span * (x + 5) / 10, y: bottom - span * (y + 5) / 10 });
  const origin = point(0, 0);
  const vectors = ([{ id: "A", x: a.ax, y: a.ay }, { id: "B", x: a.bx, y: a.by }] as const).map(v => {
    const tip = point(v.x, v.y), dx = tip.x - origin.x, dy = tip.y - origin.y, length = Math.hypot(dx, dy);
    const ux = length ? dx / length : 0, uy = length ? dy / length : 0;
    const head = length ? `${tip.x},${tip.y} ${tip.x - 10 * ux + 5 * uy},${tip.y - 10 * uy - 5 * ux} ${tip.x - 10 * ux - 5 * uy},${tip.y - 10 * uy + 5 * ux}` : null;
    return { ...v, tip, head, d: `M${origin.x},${origin.y} L${tip.x},${tip.y}` };
  });
  const initialGroups = vectors.filter((v, i, all) => all.findIndex(p => p.x === v.x && p.y === v.y) === i).map(v => ({
    ...v.tip, ids: vectors.filter(p => p.x === v.x && p.y === v.y).map(p => p.id),
    labelX: v.x > 3 ? -16 : 16, labelY: v.y > 3 ? 26 : -18, anchor: v.x > 3 ? "end" as const : "start" as const,
  }));
  const labelBox = (g: typeof initialGroups[number]) => {
    const size = g.ids.join("/").length * 8, x = g.x + g.labelX;
    return { left: g.anchor === "end" ? x - size : x, right: g.anchor === "end" ? x : x + size,
      top: g.y + g.labelY - 14, bottom: g.y + g.labelY + 12 };
  };
  const boxes = initialGroups.map(labelBox);
  const overlap = boxes.length === 2 && Math.min(boxes[0].right, boxes[1].right) + 4 > Math.max(boxes[0].left, boxes[1].left)
    && Math.min(boxes[0].bottom, boxes[1].bottom) + 4 > Math.max(boxes[0].top, boxes[1].top);
  const groups = initialGroups.map((g, i) => {
    if (!overlap || i === 0) return { ...g, labelMoved: false };
    const firstBaseline = initialGroups[0].y + initialGroups[0].labelY;
    const baseline = firstBaseline + 32 <= bottom - 12 ? firstBaseline + 32 : firstBaseline - 32;
    return { ...g, labelY: baseline - g.y, labelMoved: true };
  });
  return { width, height: span + 82, left, top, bottom, span, origin, vectors, groups,
    ticks: [-5, -3, -1, 0, 1, 3, 5].map(value => ({ value, ...point(value, value) })) };
}
