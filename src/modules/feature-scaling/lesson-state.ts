import type { ScalingState } from "./scaling-engine";

export function scalingBaseline(index = 0): ScalingState {
  if (index === 2) return { scenario: "outlier", mode: "minmax", multiplier: 1 };
  return { scenario: "units", mode: "raw", multiplier: index === 1 ? 10 : 1 };
}

export function reachedScaling(index: number, state: ScalingState) {
  const targets: ScalingState[] = [
    { scenario: "units", mode: "raw", multiplier: 10 },
    { scenario: "units", mode: "minmax", multiplier: 10 },
    { scenario: "outlier", mode: "zscore", multiplier: 1 },
    { scenario: "constant", mode: "zscore", multiplier: 7 },
  ];
  const target = targets[index];
  return !!target && state.scenario === target.scenario && state.mode === target.mode && state.multiplier === target.multiplier;
}
