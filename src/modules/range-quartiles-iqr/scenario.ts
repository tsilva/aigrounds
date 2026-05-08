import {
  makeRangePoints,
  type RangePoint,
} from "./range-quartiles-iqr-engine";

export type RangePreset = {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  values: number[];
  outlierIndexes?: number[];
};

export const rangePresets: RangePreset[] = [
  {
    id: "steady",
    label: "Compact",
    shortLabel: "Tight middle",
    description: "Most values sit close together, so range and IQR agree.",
    values: [22, 27, 31, 35, 39, 43, 47, 52, 58],
  },
  {
    id: "wide-middle",
    label: "Wide Middle",
    shortLabel: "IQR opens",
    description: "The center values spread out, widening the box.",
    values: [10, 18, 26, 34, 46, 58, 70, 78, 86],
  },
  {
    id: "outlier",
    label: "Outlier",
    shortLabel: "Range stretches",
    description: "One far value pulls the whisker while the box stays calm.",
    values: [18, 24, 28, 32, 36, 40, 44, 48, 92],
    outlierIndexes: [8],
  },
];

export const initialRangePreset = rangePresets[2] ?? rangePresets[0]!;

export function pointsForPreset(preset: RangePreset): RangePoint[] {
  return makeRangePoints(preset.values, preset.outlierIndexes);
}
