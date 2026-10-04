import { scorePresets, type ClassId, type ScoreState } from "./class-score-engine";
export const scoreBaseline = (index = 0): ScoreState => ({ base: index === 1 ? scorePresets.negative : index === 3 ? [-1, -1, -3] : scorePresets.close, scale: 1, shift: 0 });
export const scoreBaselineClass = (index = 0): ClassId => index === 0 ? "C" : "A";
export const sameScores = (a: ScoreState, b: ScoreState) => a.scale === b.scale && a.shift === b.shift && a.base.every((v, i) => v === b.base[i]);
export function reachedScore(index: number, state: ScoreState) {
  const targets: ScoreState[] = [
    { base: [1, 0.5, 2], scale: 1, shift: 0 },
    { base: scorePresets.negative, scale: 1, shift: -2 },
    { base: scorePresets.close, scale: 2, shift: 0 },
    { base: [-1, -1, -3], scale: 2, shift: 2 },
  ];
  return !!targets[index] && sameScores(state, targets[index]);
}
