import { contrastivePresets, sameContrastive, type ContrastiveState, type PointId } from "./contrastive-engine";
export function contrastiveBaseline(): ContrastiveState { return { coordinates: [...contrastivePresets.near!.coordinates], margin: 30 }; }
export function contrastiveBaselinePoint(index: number): PointId { return index === 0 ? "P" : index === 1 ? "N" : "A"; }
export const contrastiveTargets: ContrastiveState[] = [
  { coordinates: [40, 40, 50], margin: 30 },
  { coordinates: [40, 60, 70], margin: 30 },
  { coordinates: [40, 60, 50], margin: 50 },
  { coordinates: [30, 20, 60], margin: 40 },
];
export function reachedContrastive(index: number, state: ContrastiveState) { return !!contrastiveTargets[index] && sameContrastive(contrastiveTargets[index]!, state); }
