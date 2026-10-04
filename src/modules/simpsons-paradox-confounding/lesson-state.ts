import { simpsonPreset, type SimpsonState } from "./simpson-engine";
export function simpsonBaseline(index = 0): SimpsonState { return simpsonPreset(index === 2 ? "equal" : "unequal", index === 2 ? "grouped" : "combined"); }
export function reachedSimpson(index: number, s: SimpsonState) {
  if (index === 0) return s.easyA === 20 && s.easyB === 80 && s.view === "grouped";
  if (index === 1) return s.easyA === 50 && s.easyB === 50 && s.view === "combined";
  if (index === 2) return s.easyA === 80 && s.easyB === 20 && s.view === "combined";
  return s.easyA === 30 && s.easyB === 70 && s.view === "grouped";
}
