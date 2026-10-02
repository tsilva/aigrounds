import { type ShapePresetId } from "./shape-skew-outliers-engine";

export type ShapePreset = {
  id: ShapePresetId;
  label: string;
  shortLabel: string;
  description: string;
  values: number[];
  defaultMovable: number;
};

export const shapePresets: ShapePreset[] = [
  {
    id: "balanced",
    label: "Balanced",
    shortLabel: "Center mound",
    description: "Most values pile up in the middle with short tails.",
    values: [31, 35, 38, 42, 45, 48, 51, 54, 58, 62, 65, 69],
    defaultMovable: 50,
  },
  {
    id: "right-skew",
    label: "Right Skew",
    shortLabel: "Long high tail",
    description: "Most values are lower, with a few high values trailing away.",
    values: [12, 16, 18, 21, 24, 27, 30, 34, 39, 45, 53, 62],
    defaultMovable: 94,
  },
  {
    id: "left-skew",
    label: "Left Skew",
    shortLabel: "Long low tail",
    description: "Most values are higher, with a few low values trailing away.",
    values: [38, 47, 55, 61, 66, 70, 73, 76, 79, 82, 85, 89],
    defaultMovable: 6,
  },
  {
    id: "two-clusters",
    label: "Two Clusters",
    shortLabel: "Two piles",
    description: "Values split into two groups, so one center can hide structure.",
    values: [18, 22, 25, 28, 31, 34, 64, 68, 71, 74, 78, 82],
    defaultMovable: 96,
  },
];

export const initialShapePreset = shapePresets[1] ?? shapePresets[0]!;
