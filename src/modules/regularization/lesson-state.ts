import { regularizationPresets, sameRegularization, type RegularizationState } from "./regularization-engine";
export function regularizationBaseline(): RegularizationState { return { ...regularizationPresets.unregularized!, weightUnits: [20,10] }; }
export const regularizationTargets: RegularizationState[] = [
  { weightUnits: [20,10], strengthUnits: 5, mode: "l1" },
  { weightUnits: [10,0], strengthUnits: 5, mode: "l1" },
  { weightUnits: [10,5], strengthUnits: 10, mode: "l2" },
  { weightUnits: [0,0], strengthUnits: 10, mode: "l1" },
];
export function reachedRegularization(index: number, s: RegularizationState) { return !!regularizationTargets[index] && sameRegularization(regularizationTargets[index]!, s); }
