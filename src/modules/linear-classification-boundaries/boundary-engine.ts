export type BoundaryState = { w1: number; w2: number; bias: number; cutoff: number };
export const boundaryScenarios = [
  { id: "diagonal", label: "Diagonal", shortLabel: "Two features contribute" },
  { id: "vertical", label: "Vertical", shortLabel: "Only x1 contributes" },
  { id: "constant", label: "Constant score", shortLabel: "No feature weights" },
] as const;
export const boundaryPoints = [
  { id: "A1", x: 0, y: 2, label: 1 }, { id: "A2", x: 1, y: 1, label: 1 },
  { id: "A3", x: 2, y: 1, label: 1 }, { id: "A4", x: 1, y: 0, label: 1 },
  { id: "B1", x: -2, y: 1, label: 0 }, { id: "B2", x: -1, y: 0, label: 0 },
  { id: "B3", x: -1, y: -1, label: 0 }, { id: "B4", x: -2, y: -2, label: 0 },
] as const;
export function boundaryPreset(id = "diagonal"): BoundaryState {
  return id === "vertical" ? { w1: 1, w2: 0, bias: -.5, cutoff: .5 }
    : id === "constant" ? { w1: 0, w2: 0, bias: 0, cutoff: .5 }
    : { w1: 1, w2: 1, bias: 0, cutoff: .5 };
}
export function boundaryPrediction(s: BoundaryState, x: number, y: number) {
  const score = s.w1 * x + s.w2 * y + s.bias;
  const probability = score >= 0 ? 1 / (1 + Math.exp(-score)) : Math.exp(score) / (1 + Math.exp(score));
  return { score, probability, decision: Number(probability >= s.cutoff) };
}
// The policy's threshold, not necessarily the model's zero-score line.
export function decisionBoundary(s: BoundaryState) {
  if (s.cutoff === 0 || s.cutoff === 1) return { kind: "endpoint" as const, points: [] };
  const threshold = Math.log(s.cutoff / (1 - s.cutoff)) - s.bias;
  if (s.w1 === 0 && s.w2 === 0) return { kind: Math.abs(threshold) < 1e-12 ? "everywhere" as const : "constant" as const, points: [] };
  const candidates: { x: number; y: number }[] = [];
  if (s.w2 !== 0) for (const x of [-3, 3]) candidates.push({ x, y: (threshold - s.w1 * x) / s.w2 });
  if (s.w1 !== 0) for (const y of [-3, 3]) candidates.push({ x: (threshold - s.w2 * y) / s.w1, y });
  const points = candidates.filter(p => Math.abs(p.x) <= 3 + 1e-9 && Math.abs(p.y) <= 3 + 1e-9)
    .filter((p, i, all) => all.findIndex(q => Math.abs(p.x - q.x) < 1e-9 && Math.abs(p.y - q.y) < 1e-9) === i);
  return { kind: points.length >= 2 ? "line" as const : "outside" as const, points: points.slice(0, 2) };
}
