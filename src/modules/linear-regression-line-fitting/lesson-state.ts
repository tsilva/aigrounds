import type { LineState } from "./line-engine";
export function lineBaseline(index = 0): LineState { return { scenario: "rising", slope: index === 1 || index === 2 ? 1 : 0, intercept: index === 2 ? 3 : 2, revealed: false }; }
export function reachedLine(index: number, s: LineState) {
  if (index === 0) return s.scenario === "rising" && s.slope === 1 && s.intercept === 2;
  if (index === 1) return s.scenario === "rising" && s.slope === 1 && s.intercept === 3;
  if (index === 2) return s.scenario === "rising" && s.slope === .6 && s.intercept === 2.4 && s.revealed;
  return s.scenario === "falling" && s.slope === -.5 && s.intercept === 5.4 && s.revealed;
}
