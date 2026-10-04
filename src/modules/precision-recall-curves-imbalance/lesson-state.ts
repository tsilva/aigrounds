import type { PrState } from "./pr-engine";

export function prBaseline(index = 0): PrState {
  return { scenario: "ordered", copies: index === 1 || index === 2 ? 4 : 1, tick: index === 2 ? 16 : 11 };
}

export function reachedPr(index: number, state: PrState) {
  const targets: PrState[] = [
    { scenario: "ordered", copies: 4, tick: 11 },
    { scenario: "ordered", copies: 4, tick: 8 },
    { scenario: "ordered", copies: 4, tick: 14 },
    { scenario: "tied", copies: 3, tick: 10 },
  ];
  const target = targets[index];
  return !!target && state.scenario === target.scenario && state.copies === target.copies && state.tick === target.tick;
}
