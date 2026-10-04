import type { PcaState } from "./pca-engine";
export const pcaBaseline = (index = 0): PcaState => ({ scenario: index === 1 ? "shifted" : index === 2 ? "balanced" : "correlated", angle: index === 1 ? 45 : 0, kept: 1 });
export function reachedPca(index: number, state: PcaState) {
  const targets: PcaState[] = [{ scenario: "correlated", angle: 45, kept: 1 }, { scenario: "shifted", angle: 45, kept: 2 }, { scenario: "balanced", angle: 45, kept: 1 }, { scenario: "constant", angle: 90, kept: 1 }];
  const target = targets[index];
  return !!target && target.scenario === state.scenario && target.angle === state.angle && target.kept === state.kept;
}
