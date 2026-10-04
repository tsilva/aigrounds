import { probabilityPresets, type ExampleId, type ProbabilityState } from "./log-loss-engine";
export const lossBaseline = (index = 0): ProbabilityState => index === 0 ? probabilityPresets.correct : probabilityPresets.error;
export const lossBaselineExample = (index = 0): ExampleId => index === 0 ? "A" : "B";
export const sameProbabilities = (a: ProbabilityState, b: ProbabilityState) => a.every((v, i) => v === b[i]);
export function reachedLoss(index: number, state: ProbabilityState) {
  const targets: ProbabilityState[] = [[95, 80, 80], [80, 5, 80], [80, 0, 80], [100, 5, 100]];
  return !!targets[index] && sameProbabilities(state, targets[index]);
}
