export const classIds = ["A", "B", "C"] as const;
export type ClassId = typeof classIds[number];
export type ScoreState = { base: readonly [number, number, number]; scale: number; shift: number };
export const scorePresets = {
  close: [1, 0.5, -1],
  negative: [-1, -2, -3],
  tie: [1, 1, -1],
} as const;
export const scoreScenarios = [
  { id: "close", label: "Close call", shortLabel: "Narrow lead" },
  { id: "negative", label: "All negative", shortLabel: "Scores below zero" },
  { id: "tie", label: "Top tie", shortLabel: "Two leaders" },
] as const;
export const scoreNumber = (value: number) => Number(value.toFixed(6)).toString();
const onGrid = (v: number, min: number, max: number) => Number.isFinite(v) && v >= min && v <= max && Number.isInteger(v * 2);
export function validateScores(state: ScoreState) {
  if (state.base.length !== 3 || !state.base.every(v => onGrid(v, -4, 4)) || !onGrid(state.shift, -2, 2) || !onGrid(state.scale, 0.5, 2)) throw Error("Unsupported class-score state");
}
export function setBaseScore(state: ScoreState, id: ClassId, value: number): ScoreState {
  validateScores(state);
  if (!classIds.includes(id) || !onGrid(value, -4, 4)) throw Error("Unsupported score edit");
  const base: [number, number, number] = [...state.base];
  base[classIds.indexOf(id)] = value;
  return { ...state, base };
}
export function analyzeScores(state: ScoreState) {
  validateScores(state);
  const effective = state.base.map(b => state.scale * b + state.shift);
  const order = classIds.map((id, i) => ({ id, index: i, z: effective[i] })).sort((a, b) => b.z - a.z || a.index - b.index);
  const top = order[0].z;
  const rows = classIds.map((id, i) => ({ id, base: state.base[i], scaled: state.scale * state.base[i], z: effective[i], rank: order.findIndex(r => r.id === id) + 1, gap: top - effective[i], leader: effective[i] === top }));
  return { rows, order, winner: order[0].id, ties: rows.filter(r => r.leader).map(r => r.id), top, second: order[1].z, margin: top - order[1].z, total: effective.reduce((s, z) => s + z, 0) };
}
export function scoreChart(a: ReturnType<typeof analyzeScores>, width: number) {
  const left = 40, span = Math.max(80, width - 90), zero = left + span / 2;
  const x = (z: number) => left + span * (z + 10) / 20;
  return { width, height: 204, left, span, zero, ticks: [-10, 0, 10].map(v => ({ value: v, x: x(v) })), rows: a.rows.map((r, i) => {
    const end = x(r.z), inside = Math.abs(r.z) > 0 && (r.z > 0 ? left + span - end : end - left) < 42;
    return { ...r, x: Math.min(zero, end), y: 24 + i * 40, width: Math.abs(end - zero), end, inside, labelX: end + (r.z < 0 ? -1 : 1) * (inside ? -7 : 8), anchor: (r.z < 0) !== inside ? "end" as const : "start" as const };
  }) };
}
export const scorePresetId = (base: ScoreState["base"]) => Object.entries(scorePresets).find(([, values]) => values.every((v, i) => v === base[i]))?.[0] ?? "custom";
