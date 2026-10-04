import { vectorPresets, type VectorState } from "./vector-engine";
export function vectorBaseline(index = 0): VectorState { return { ...vectorPresets[index === 1 ? "right" : index === 2 ? "zero" : "angled"] }; }
export function reachedVectors(index: number, state: VectorState) {
  const targets: VectorState[] = [
    { ax: 1, ay: 2, bx: 4, by: 2 }, { ax: 3, ay: 4, bx: 3, by: 4 },
    { ax: 3, ay: 4, bx: 0, by: 1 }, { ax: 3, ay: 4, bx: -3, by: -4 },
  ];
  const t = targets[index];
  return !!t && state.ax === t.ax && state.ay === t.ay && state.bx === t.bx && state.by === t.by;
}
