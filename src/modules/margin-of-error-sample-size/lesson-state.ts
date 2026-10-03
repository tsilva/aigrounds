import type { MarginState } from "./margin-engine";
export function marginBaseline(index = 0): MarginState {
  return { source: "reference", size: index === 1 || index === 2 ? 100 : 25, confidence: 95 };
}
export function reachedMargin(index: number, state: MarginState) {
  if (index === 0) return state.source === "reference" && state.size === 100 && state.confidence === 95;
  if (index === 1) return state.source === "reference" && state.size === 100 && state.confidence === 99;
  if (index === 2) return state.source === "higher" && state.size === 100 && state.confidence === 95;
  return state.source === "lower" && state.size === 64 && state.confidence === 90;
}
