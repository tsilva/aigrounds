export type Vec = readonly [number, number];
export const blockScenarios = [
  { id: "base", label: "Two tokens", shortLabel: "Trace the first addition" },
  { id: "future", label: "Changed future", shortLabel: "Earlier token stays causal" },
  { id: "shifted", label: "Shifted input", shortLabel: "A new transfer vector" },
] as const;
export type BlockState = { scenario: string; attentionScale: number; mlpScale: number; token: number; operation: number };
export const blockOperations = ["Input", "RMSNorm 1", "Causal attention", "First residual sum", "RMSNorm 2", "MLP", "Output"];
export function blockPreset(scenario = "base"): BlockState { return { scenario, attentionScale: 1, mlpScale: 1, token: 0, operation: 3 }; }
export function blockInputs(scenario: string): readonly Vec[] {
  return scenario === "shifted" ? [[-1, 2], [1, -1]] : [[1, 2], scenario === "future" ? [4, -1] : [-1, 1]];
}
export function rmsVector(x: Vec): Vec { const d = Math.sqrt((x[0] ** 2 + x[1] ** 2) / 2 + .000001); return [x[0] / d, x[1] / d]; }
const valueScale = Math.sqrt(2.5 + .000001);
export const blockWeights = { valueDiagonal: [.2 * valueScale, -.05 * valueScale] as Vec, mlpRows: [[.2, .1], [-.1, .3]] as readonly Vec[] };
const add = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1]];
export function traceBlock(s: BlockState) {
  const inputs = blockInputs(s.scenario), norm1 = inputs.map(rmsVector);
  const values = norm1.map((n): Vec => [n[0] * blockWeights.valueDiagonal[0], n[1] * blockWeights.valueDiagonal[1]]);
  return inputs.map((input, i) => {
    const scores = norm1.map(k => (norm1[i]![0] * k[0] + norm1[i]![1] * k[1]) / Math.sqrt(2));
    const maximum = Math.max(...scores.slice(0, i + 1));
    const exps = scores.map((v, j) => j <= i ? Math.exp(v - maximum) : 0), sum = exps.reduce((a, b) => a + b, 0);
    const weights = exps.map(v => v / sum);
    const attention: Vec = [weights.reduce((v, w, j) => v + w * values[j]![0], 0), weights.reduce((v, w, j) => v + w * values[j]![1], 0)];
    const branch: Vec = [s.attentionScale * attention[0], s.attentionScale * attention[1]], h = add(input, branch), norm2 = rmsVector(h);
    // W_up = identity; ReLU; W_down rows below; no biases or dropout.
    const hidden: Vec = [Math.max(0, norm2[0]), Math.max(0, norm2[1])];
    const mlp: Vec = [blockWeights.mlpRows[0]![0] * hidden[0] + blockWeights.mlpRows[0]![1] * hidden[1], blockWeights.mlpRows[1]![0] * hidden[0] + blockWeights.mlpRows[1]![1] * hidden[1]];
    const mlpBranch: Vec = [s.mlpScale * mlp[0], s.mlpScale * mlp[1]];
    return { input, norm1: norm1[i]!, values: values[i]!, scores, weights, attention, branch, h, norm2, hidden, mlp, mlpBranch, output: add(h, mlpBranch) };
  });
}
