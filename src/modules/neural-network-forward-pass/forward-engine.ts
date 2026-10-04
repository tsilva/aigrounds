export type ForwardState = { units: readonly number[] };
export const forwardEdges = [
  { id: "0", label: "x1 → H1", source: 0, target: 2 },
  { id: "1", label: "x2 → H1", source: 1, target: 2 },
  { id: "2", label: "x1 → H2", source: 0, target: 3 },
  { id: "3", label: "x2 → H2", source: 1, target: 3 },
  { id: "4", label: "H1 → Class A", source: 2, target: 4 },
  { id: "5", label: "H2 → Class A", source: 3, target: 4 },
  { id: "6", label: "H1 → Class B", source: 2, target: 5 },
  { id: "7", label: "H2 → Class B", source: 3, target: 5 },
] as const;
export const forwardScenarios = [
  { id: "baseline", label: "Baseline", shortLabel: "One hidden active" },
  { id: "off", label: "Both hidden off", shortLabel: "Tied scores" },
  { id: "active", label: "Both hidden active", shortLabel: "Compare paths" },
] as const;
export function forwardBaseline(id = "baseline"): ForwardState {
  const units = [4, 2, -4, 4, 4, -4, -4, 4];
  if (id === "off") { units[0] = -4; units[1] = 0; }
  if (id === "active") units[2] = 4;
  return { units };
}
export function sameForward(a: ForwardState, b: ForwardState) { return a.units.every((v, i) => v === b.units[i]) && a.units.length === b.units.length; }
export function forwardPresetId(s: ForwardState) { return forwardScenarios.find(p => sameForward(s, forwardBaseline(p.id)))?.id ?? "custom"; }
export function editForward(s: ForwardState, edge: number, value: number): ForwardState {
  if (!Number.isFinite(value) || !Number.isInteger(edge) || edge < 0 || edge > 7) return s;
  const unit = Math.max(-8, Math.min(8, Math.round(value * 4)));
  return s.units[edge] === unit ? s : { units: s.units.map((v, i) => i === edge ? unit : v) };
}
export function analyzeForward(s: ForwardState) {
  const weights = s.units.map(v => v / 4), inputs = [1, 2];
  const z = [inputs[0]! * weights[0]! + inputs[1]! * weights[1]! - 1, inputs[0]! * weights[2]! + inputs[1]! * weights[3]! - 1];
  const h = z.map(v => Math.max(0, v));
  const scores = [h[0]! * weights[4]! + h[1]! * weights[5]!, h[0]! * weights[6]! + h[1]! * weights[7]!];
  const values = [...inputs, ...h, ...scores];
  const edges = forwardEdges.map((e, i) => ({ ...e, weight: weights[i]!, input: values[e.source]!, contribution: values[e.source]! * weights[i]! }));
  const leader = scores[0] === scores[1] ? "Tie" : scores[0]! > scores[1]! ? "Class A" : "Class B";
  const rows = ["H1", "H2", "Class A", "Class B"].map((label, i) => {
    const first = edges[i * 2]!, second = edges[i * 2 + 1]!, bias = i < 2 ? -1 : 0;
    return { label, terms: `${forwardNumber(first.input)}×(${forwardNumber(first.weight)}) + ${forwardNumber(second.input)}×(${forwardNumber(second.weight)}) + (${bias})`, sum: i < 2 ? z[i]! : scores[i - 2]!, output: values[i + 2]!, rule: i < 2 ? "ReLU" : "Raw score" };
  });
  return { weights, inputs, z, h, scores, values, edges, leader, rows };
}
export const forwardNumber = (v: number) => Number(v.toFixed(4)).toLocaleString("en-US", { useGrouping: false, maximumFractionDigits: 4 });
export function forwardGraph(s: ForwardState, selected: number, width: number) {
  const a = analyzeForward(s), xs = [55, width / 2, width - 55], ys = [95, 245], radius = 28;
  const labels = ["x1", "x2", "H1", "H2", "Class A", "Class B"];
  const nodes = a.values.map((value, i) => ({ id: i, label: labels[i]!, value, x: xs[Math.floor(i / 2)]!, y: ys[i % 2]!, sum: i === 2 || i === 3 ? a.z[i - 2]! : null }));
  const edges = a.edges.map((e, i) => {
    const from = nodes[e.source]!, to = nodes[e.target]!, dx = to.x - from.x, dy = to.y - from.y, length = Math.hypot(dx, dy);
    return { ...e, selected: i === selected, x1: from.x + radius * dx / length, y1: from.y + radius * dy / length, x2: to.x - (radius + 5) * dx / length, y2: to.y - (radius + 5) * dy / length, labelX: (from.x + to.x) / 2, labelY: (from.y + to.y) / 2 - 9 };
  });
  return { width, height: 330, radius, nodes, edges, layerXs: xs };
}
