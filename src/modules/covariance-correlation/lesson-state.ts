import { covarianceDataset, type CovarianceState } from "./covariance-engine";
export function covarianceBaseline(index = 0): CovarianceState { return { points: covarianceDataset(index === 4 ? "negative" : "positive"), scale: 1 }; }
export function reachedCovariance(index: number, state: CovarianceState) {
  const target = covarianceDataset(index === 0 || index === 4 ? "negative" : index === 3 ? "flat" : "positive");
  if (index === 2) target[4] = { x: 8, y: 2 };
  if (index === 4) target[0] = { x: 2, y: 6 };
  return state.scale === (index === 1 ? 3 : index === 4 ? 2 : 1) && state.points.length === 5 && state.points.every((p, i) => p.x === target[i].x && p.y === target[i].y);
}
