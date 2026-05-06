import { makePoints, type DataPoint } from "./mean-median-mode-engine";

export type TypicalPreset = {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  values: number[];
};

export const typicalPresets: TypicalPreset[] = [
  {
    id: "balanced",
    label: "Balanced",
    shortLabel: "One center",
    description: "Mean and median nearly agree when the values are symmetric.",
    values: [18, 24, 30, 36, 42, 48, 54, 60, 66],
  },
  {
    id: "repeated-peak",
    label: "Repeated Peak",
    shortLabel: "Mode appears",
    description: "Repeated values create a most common point.",
    values: [18, 22, 24, 24, 24, 29, 34, 38, 43],
  },
  {
    id: "outlier",
    label: "Add Outlier",
    shortLabel: "Mean gets pulled",
    description: "One extreme value drags the balance point away from the middle.",
    values: [18, 20, 22, 24, 24, 24, 26, 28, 92],
  },
];

export const initialTypicalPreset = typicalPresets[2] ?? typicalPresets[0]!;

export function pointsForPreset(preset: TypicalPreset): DataPoint[] {
  return makePoints(preset.values);
}
