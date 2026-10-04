import { editForward, forwardBaseline, sameForward, type ForwardState } from "./forward-engine";
export const forwardTargets = [{ edge: 1, value: 1 }, { edge: 3, value: 0.5 }, { edge: 6, value: 1.5 }, { edge: 2, value: 1 }];
export function reachedForward(index: number, s: ForwardState) {
  const t = forwardTargets[index];
  return !!t && sameForward(s, editForward(forwardBaseline(), t.edge, t.value));
}
