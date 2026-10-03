import { shapeDataset, type ShapeState } from "./shape-engine";
export function shapeBaseline(index = 0): ShapeState { return shapeDataset(index === 1 || index === 4 ? "curve" : "line"); }
export function reachedShape(index: number, s: ShapeState) {
  if (index === 0) return s.scenario === "curve" && s.x === 7 && s.y === 9;
  if (index === 1) return s.scenario === "u" && s.x === 7 && s.y === 9;
  if (index === 2) return (s.scenario === "line" || s.scenario === "outlier") && s.x === 9 && s.y === 1;
  if (index === 3) return s.scenario === "line" && s.x === 7 && s.y === 6;
  return s.scenario === "curve" && s.x === 9 && s.y === 8;
}
