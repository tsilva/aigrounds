export type PositionToken = "A" | "B" | "C";
export type PositionMode = "none" | "absolute" | "rotary";
export type PositionState = { order: string; mode: PositionMode; query: PositionToken; start: number };
export const positionTokens: PositionToken[] = ["A", "B", "C"];
export const positionBase: Record<PositionToken, readonly [number, number]> = { A: [1, 0], B: [0, 1], C: [-1, 0] };
export const positionOrders = ["ABC", "ACB", "BAC", "BCA", "CAB", "CBA"].map(id => ({ id, label: id.split("").join(" ") }));
export const positionQueries = positionTokens.map(id => ({ id, label: id }));
export const positionModes = [{ id: "none", label: "No signal" }, { id: "absolute", label: "Absolute" }, { id: "rotary", label: "Rotary" }] as const;
export const positionScenarios = [
  { id: "none", label: "No position", shortLabel: "ABC at 0" },
  { id: "absolute", label: "Add positions", shortLabel: "ABC at 0" },
  { id: "rotary", label: "Rotate Q / K", shortLabel: "ABC at 0" },
] as const;
export function positionBaseline(mode: PositionMode = "none"): PositionState { return { order: "ABC", mode, query: "A", start: 0 }; }
export function samePosition(a: PositionState, b: PositionState) { return a.order === b.order && a.mode === b.mode && a.query === b.query && a.start === b.start; }
export function positionPresetId(s: PositionState) { return samePosition(s, positionBaseline(s.mode)) ? s.mode : "custom"; }
export function editPositionStart(s: PositionState, value: number): PositionState { if (!Number.isFinite(value)) return s; const start = Math.max(0, Math.min(4, Math.round(value))); return start === s.start ? s : { ...s, start }; }
export function positionVector(token: PositionToken, position: number, mode: PositionMode): readonly [number, number] {
  const [x, y] = positionBase[token], sin = Math.sin(position), cos = Math.cos(position);
  return mode === "none" ? [x, y] : mode === "absolute" ? [x + sin, y + cos] : [cos * x - sin * y, sin * x + cos * y];
}
const dot = (a: readonly number[], b: readonly number[]) => a[0]! * b[0]! + a[1]! * b[1]!;
export function analyzePosition(s: PositionState) {
  const rows = positionTokens.map(token => { const position = s.start + s.order.indexOf(token), vector = positionVector(token, position, s.mode); return { token, position, base: positionBase[token], vector, norm: Math.hypot(...vector), referencePosition: positionTokens.indexOf(token), referenceVector: positionVector(token, positionTokens.indexOf(token), s.mode) }; });
  const queryRow = rows[positionTokens.indexOf(s.query)]!;
  const matrix = rows.map(q => rows.map(k => dot(q.vector, k.vector)));
  const scores = rows.map(k => dot(queryRow.vector, k.vector)), reference = rows.map(k => dot(queryRow.referenceVector, k.referenceVector)), differences = scores.map((v, i) => v - reference[i]!);
  return { rows, matrix, queryRow, scores, reference, differences, changed: differences.filter(d => Math.abs(d) > 1e-12).length, maxDifference: Math.max(...differences.map(Math.abs)), slots: s.order.split("").map((token, i) => ({ token, position: s.start + i })) };
}
export const positionNumber = (v: number) => Number((Math.abs(v) < 1e-12 ? 0 : v).toFixed(6)).toLocaleString("en-US", { useGrouping: false, maximumFractionDigits: 6 });
export const positionScoreX = (score: number) => 90 + 50 * (score + 4);
