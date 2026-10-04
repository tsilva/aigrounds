import type { DistanceState } from "./distance-engine";
export function distanceBaseline(index = 0): DistanceState {
  if (index === 2) return { scenario: "tie", metric: "euclidean", x: 4, y: 5 };
  return { scenario: "disagreement", metric: index === 1 ? "manhattan" : "euclidean", x: 0, y: 0 };
}
export function reachedDistance(index: number, state: DistanceState) {
  const targets: DistanceState[] = [
    { scenario: "disagreement", metric: "manhattan", x: 0, y: 0 },
    { scenario: "disagreement", metric: "manhattan", x: 4, y: 1 },
    { scenario: "tie", metric: "euclidean", x: 5, y: 5 },
    { scenario: "coincident", metric: "manhattan", x: 2, y: 2 },
  ];
  const t = targets[index];
  return !!t && state.scenario === t.scenario && state.metric === t.metric && state.x === t.x && state.y === t.y;
}
