export type Example = { id: string; x: readonly [number, number]; y: number };
export type Parameters = readonly number[];
// [w11,w12,w21,w22,b1,b2,v1,v2,bOutput]; ReLU hidden units, sigmoid output.
export const initialParameters: Parameters = [.6, -.2, -.3, .8, .1, .1, .5, -.4, 0];
export const trainingScenarios = [
  { id: "standard", label: "Four corners", shortLabel: "Fixed training order" },
  { id: "shifted", label: "Shifted points", shortLabel: "A different transfer dataset" },
] as const;
export function trainingData(scenario: string): { train: Example[]; validation: Example[] } {
  return scenario === "shifted" ? {
    train: [{ id: "A1", x: [-1.5, 0], y: 0 }, { id: "A2", x: [-.5, 1], y: 0 }, { id: "A3", x: [.5, -1], y: 1 }, { id: "A4", x: [1.5, 0], y: 1 }],
    validation: [{ id: "H1", x: [-.75, .25], y: 0 }, { id: "H2", x: [.75, -.25], y: 1 }],
  } : {
    train: [{ id: "A1", x: [-1, -1], y: 0 }, { id: "A2", x: [-1, 1], y: 0 }, { id: "A3", x: [1, -1], y: 1 }, { id: "A4", x: [1, 1], y: 1 }],
    validation: [{ id: "H1", x: [-.5, .5], y: 0 }, { id: "H2", x: [.5, -.5], y: 1 }],
  };
}
export function forwardTraining(p: Parameters, e: Example) {
  const [x1, x2] = e.x;
  const pre = [p[0]! * x1 + p[1]! * x2 + p[4]!, p[2]! * x1 + p[3]! * x2 + p[5]!];
  const hidden = pre.map(v => Math.max(0, v));
  const score = p[6]! * hidden[0]! + p[7]! * hidden[1]! + p[8]!;
  const probability = score >= 0 ? 1 / (1 + Math.exp(-score)) : Math.exp(score) / (1 + Math.exp(score));
  const loss = Math.max(score, 0) - e.y * score + Math.log1p(Math.exp(-Math.abs(score)));
  const d = probability - e.y;
  // ReLU derivative convention is zero at exactly zero.
  const d1 = pre[0]! > 0 ? d * p[6]! : 0, d2 = pre[1]! > 0 ? d * p[7]! : 0;
  const gradient = [d1 * x1, d1 * x2, d2 * x1, d2 * x2, d1, d2, d * hidden[0]!, d * hidden[1]!, d];
  return { example: e, pre, hidden, score, probability, loss, gradient };
}
export function trainingBatch(p: Parameters, examples: readonly Example[]) {
  const rows = examples.map(e => forwardTraining(p, e));
  return { rows, loss: rows.reduce((sum, row) => sum + row.loss, 0) / rows.length,
    gradient: p.map((_, i) => rows.reduce((sum, row) => sum + row.gradient[i]!, 0) / rows.length) };
}
export type TrainingState = {
  scenario: string; parameters: Parameters; batchSize: number; rate: number;
  stage: number; cursor: number; epoch: number; updates: number;
  cache: ReturnType<typeof trainingBatch> | null;
  history: readonly { update: number; train: number; validation: number }[];
};
export function createTraining(scenario = "standard", batchSize = 2, rate = .1): TrainingState {
  return { scenario, parameters: [...initialParameters], batchSize, rate, stage: 0, cursor: 0, epoch: 0, updates: 0, cache: null, history: [] };
}
export function stepTraining(s: TrainingState): TrainingState {
  if (s.updates >= 100) return s;
  const data = trainingData(s.scenario);
  if (s.stage === 0) return { ...s, stage: 1, cache: trainingBatch(s.parameters, data.train.slice(s.cursor, s.cursor + s.batchSize)) };
  if (s.stage < 3) return { ...s, stage: s.stage + 1 };
  if (!s.cache) return s;
  const parameters = s.parameters.map((p, i) => p - s.rate * s.cache!.gradient[i]!);
  const end = s.cursor + s.batchSize >= data.train.length;
  const update = s.updates + 1;
  return { ...s, parameters, stage: 0, cursor: end ? 0 : s.cursor + s.batchSize,
    epoch: s.epoch + Number(end), updates: update, cache: s.cache,
    history: [...s.history, { update, train: trainingBatch(parameters, data.train).loss, validation: trainingBatch(parameters, data.validation).loss }] };
}
export function runTrainingEpoch(s: TrainingState) {
  const target = s.epoch + 1;
  let next = s;
  while (next.epoch < target && next.updates < 100) next = stepTraining(next);
  return next;
}
export function trainingLosses(s: TrainingState) {
  const data = trainingData(s.scenario);
  return { train: trainingBatch(s.parameters, data.train).loss, validation: trainingBatch(s.parameters, data.validation).loss };
}
export const parameterNames = ["w11", "w12", "w21", "w22", "b1", "b2", "v1", "v2", "bOutput"];
