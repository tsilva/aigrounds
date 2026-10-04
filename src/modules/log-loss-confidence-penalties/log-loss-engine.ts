export const exampleIds = ["A", "B", "C"] as const;
export type ExampleId = typeof exampleIds[number];
export type ProbabilityState = readonly [number, number, number];
export const trueLabels = [1, 0, 1] as const;
export const probabilityPresets = { correct: [80, 80, 80], error: [80, 20, 80], boundary: [55, 45, 55] } as const;
export const probabilityScenarios = [
  { id: "correct", label: "All correct", shortLabel: "Three correct labels" },
  { id: "error", label: "One error", shortLabel: "A confident mistake" },
  { id: "boundary", label: "Near boundary", shortLabel: "Less certain labels" },
] as const;
export const lossNumber = (value: number) => value === Infinity ? "∞" : Number(value.toFixed(6)).toString();
export function validateProbabilities(state: ProbabilityState) {
  if (state.length !== 3 || !state.every(v => Number.isInteger(v) && v >= 0 && v <= 100 && v % 5 === 0)) throw Error("Unsupported probability state");
}
export function setTrueProbability(state: ProbabilityState, id: ExampleId, percent: number): ProbabilityState {
  validateProbabilities(state);
  if (!exampleIds.includes(id) || !Number.isInteger(percent) || percent < 0 || percent > 100 || percent % 5 !== 0) throw Error("Unsupported probability edit");
  const values: [number, number, number] = [...state];
  values[exampleIds.indexOf(id)] = percent;
  return values;
}
export function analyzeLoss(state: ProbabilityState) {
  validateProbabilities(state);
  const rows = exampleIds.map((id, i) => {
    const truth = trueLabels[i], percent = state[i], pTrue = percent / 100;
    const p1Percent = truth === 1 ? percent : 100 - percent;
    const predicted = p1Percent > 50 ? 1 : 0;
    const loss = percent === 0 ? Infinity : percent === 100 ? 0 : -Math.log(pTrue);
    return { id, truth, percent, pTrue, p0: (100 - p1Percent) / 100, p1: p1Percent / 100, predicted, tied: p1Percent === 50, correct: predicted === truth, loss };
  });
  const sum = rows.reduce((s, r) => s + r.loss, 0), maxLoss = Math.max(...rows.map(r => r.loss));
  return { rows, sum, mean: sum / 3, maxLoss, worst: rows.filter(r => r.loss === maxLoss).map(r => r.id), accuracyCount: rows.filter(r => r.correct).length };
}
export const probabilityPresetId = (state: ProbabilityState) => Object.entries(probabilityPresets).find(([, v]) => v.every((x, i) => x === state[i]))?.[0] ?? "custom";
export function lossChart(a: ReturnType<typeof analyzeLoss>, width: number) {
  const left = 36, span = Math.max(80, width - 120);
  return { width, height: 204, left, span, ticks: [0, 1, 2, 3].map(v => ({ value: v, x: left + span * v / 3 })), rows: a.rows.map((r, i) => {
    const infinite = r.loss === Infinity, barWidth = infinite ? 0 : span * r.loss / 3;
    const end = left + barWidth, inside = !infinite && span - barWidth < 60;
    return { ...r, infinite, x: left, y: 24 + i * 40, width: barWidth, end, inside, labelX: infinite ? left + span + 8 : end + (inside ? -6 : 8), anchor: inside ? "end" as const : "start" as const };
  }) };
}
