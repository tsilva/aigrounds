import type { ProjectionState } from "./projection-engine";
export const projectionBaseline = (index = 0): ProjectionState => ({ scenario: index === 1 ? "diagonal" : "horizontal", angle: 0 });
export function reachedProjection(index: number, state: ProjectionState) {
  const targets: ProjectionState[] = [{ scenario: "horizontal", angle: 90 }, { scenario: "diagonal", angle: 45 }, { scenario: "horizontal", angle: 180 }, { scenario: "diagonal", angle: 135 }];
  return targets[index]?.scenario === state.scenario && targets[index]?.angle === state.angle;
}
