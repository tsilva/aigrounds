import type { ErrorState } from "./errors-engine";
export function errorsBaseline(index = 0): ErrorState { return { cutoff: 1.96, exampleId: index === 1 ? "real-low" : "null-high" }; }
export function reachedErrors(index: number, s: ErrorState) {
  if (index === 0) return s.cutoff === 2.58 && s.exampleId === "null-high";
  if (index === 1) return s.cutoff === 1 && s.exampleId === "real-low";
  if (index === 2) return s.cutoff === 1.96 && s.exampleId === "real-high";
  return s.cutoff === 2.58 && s.exampleId === "real-low";
}
