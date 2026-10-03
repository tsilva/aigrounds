import type { IntervalState } from "./interval-engine";
export function intervalBaseline(index = 0): IntervalState {
  return { source: "reference", size: 25, confidence: index === 1 ? 90 : 95, batch: 1 };
}
export function reachedIntervals(index: number, state: IntervalState) {
  if (index === 0) return state.source === "reference" && state.size === 25 && state.confidence === 95 && state.batch === 2;
  if (index === 1) return state.source === "reference" && state.size === 25 && state.confidence === 99 && state.batch === 1;
  if (index === 2) return state.source === "reference" && state.size === 100 && state.confidence === 95 && state.batch === 1;
  return state.source === "higher" && state.size === 64 && state.confidence === 90 && state.batch === 7;
}
