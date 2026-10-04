export const groupIds = ["A", "B", "C", "D"] as const;
export type GroupId = typeof groupIds[number];
export type ConfidenceVector = readonly [number, number, number, number];
export type BinCount = 5 | 10;
export type CalibrationState = { confidence: ConfidenceVector; bins: BinCount; threshold: number };
export const correctCounts = [3, 4, 5, 2] as const;
export const confidencePresets = { mixed: [65, 75, 85, 95], single: [70, 70, 70, 70], certain: [100, 100, 100, 100] } as const;
export const calibrationScenarios = [
  { id: "mixed", label: "Mixed confidence", shortLabel: "Four confidence groups" },
  { id: "single", label: "One confidence", shortLabel: "All confidence 70%" },
  { id: "certain", label: "Certain predictions", shortLabel: "All confidence 100%" },
] as const;
export const calibrationNumber = (value: number | null) => value === null ? "Undefined" : Number(value.toFixed(6)).toString();
const validConfidence = (v: number) => Number.isInteger(v) && v >= 50 && v <= 100 && v % 5 === 0;
export function validateCalibration(state: CalibrationState) {
  if (state.confidence.length !== 4 || !state.confidence.every(validConfidence) || ![5, 10].includes(state.bins) || !validConfidence(state.threshold)) throw Error("Unsupported calibration state");
}
export const confidenceBin = (value: number, bins: BinCount) => Math.max(0, Math.min(bins - 1, Math.ceil(value * bins / 100) - 1));
export function setGroupConfidence(state: CalibrationState, id: GroupId, value: number): CalibrationState {
  validateCalibration(state);
  if (!groupIds.includes(id) || !validConfidence(value)) throw Error("Unsupported confidence edit");
  const confidence: [number, number, number, number] = [...state.confidence];
  confidence[groupIds.indexOf(id)] = value;
  return { ...state, confidence };
}
export function analyzeCalibration(state: CalibrationState) {
  validateCalibration(state);
  const groups = groupIds.map((id, i) => ({ id, index: i, count: 5, confidence: state.confidence[i], p0: 100 - state.confidence[i], correct: correctCounts[i], accuracy: correctCounts[i] * 20, bin: confidenceBin(state.confidence[i], state.bins) + 1, kept: state.confidence[i] >= state.threshold }));
  const kept = groups.filter(g => g.kept), keptCount = kept.length * 5, keptCorrect = kept.reduce((s, g) => s + g.correct, 0);
  function binsFor(ids: typeof groups, denominator: number) {
    return Array.from({ length: state.bins }, (_, i) => {
      const members = ids.filter(g => g.bin === i + 1), count = members.length * 5;
      const confidence = count ? members.reduce((s, g) => s + g.confidence * g.count, 0) / count : null;
      const correct = members.reduce((s, g) => s + g.correct, 0), accuracy = count ? correct * 100 / count : null;
      const gap = confidence === null || accuracy === null ? null : Math.abs(confidence - accuracy);
      return { bin: i + 1, lower: i * 100 / state.bins, upper: (i + 1) * 100 / state.bins, groups: members.map(g => g.id), count, correct, confidence, accuracy, gap, contribution: count && denominator && gap !== null ? count / denominator * gap : 0 };
    });
  }
  const bins = binsFor(groups, 20), retainedBins = binsFor(kept, keptCount);
  const ece = bins.reduce((s, b) => s + b.contribution, 0), retainedECE = keptCount ? retainedBins.reduce((s, b) => s + b.contribution, 0) : null;
  return { groups, bins, retainedBins, ece, fullAccuracy: 70, fullCorrect: 14, total: 20, keptCount, keptCorrect, coverage: keptCount * 5, retainedAccuracy: keptCount ? keptCorrect * 100 / keptCount : null, retainedECE };
}
export const binInterval = (lower: number, upper: number) => `${lower === 0 ? "[" : "("}${lower}, ${upper}]`;
export const calibrationPresetId = (state: CalibrationState) => state.bins === 10 && state.threshold === 50 ? Object.entries(confidencePresets).find(([, v]) => v.every((x, i) => x === state.confidence[i]))?.[0] ?? "custom" : "custom";
export function reliabilityChart(a: ReturnType<typeof analyzeCalibration>, width: number) {
  const left = 44, top = 20, span = Math.max(100, width - 72), height = 200;
  const x = (value: number) => left + span * value / 100, y = (value: number) => top + height * (100 - value) / 100;
  return { width, height: 272, left, top, span, plotHeight: height, ticks: [0, 25, 50, 75, 100].map(value => ({ value, x: x(value), y: y(value) })), diagonal: { x1: x(0), y1: y(0), x2: x(100), y2: y(100) }, points: a.bins.flatMap(b => b.confidence === null || b.accuracy === null ? [] : [{ ...b, x: x(b.confidence), y: y(b.accuracy), diagonalY: y(b.confidence) }]) };
}
