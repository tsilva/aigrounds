import { positionBaseline, samePosition, type PositionState } from "./position-engine";
export const positionTargets: PositionState[] = [
  { ...positionBaseline(), order: "CBA" },
  { ...positionBaseline("absolute"), order: "CBA" },
  { ...positionBaseline("rotary"), start: 3 },
  { order: "BAC", mode: "rotary", query: "B", start: 2 },
];
export function reachedPosition(index: number, s: PositionState) { return !!positionTargets[index] && samePosition(s, positionTargets[index]!); }
