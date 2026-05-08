import {
  makePoints,
  type DataPoint,
} from "./variance-standard-deviation-engine";

export type SpreadPreset = {
  id: "tight" | "balanced" | "wide";
  label: string;
  shortLabel: string;
  description: string;
  values: number[];
};

export const spreadPresets: SpreadPreset[] = [
  {
    id: "tight",
    label: "Tight",
    shortLabel: "Clustered",
    description: "Same center, short deviation bars.",
    values: [42, 46, 48, 50, 52, 54, 58],
  },
  {
    id: "balanced",
    label: "Balanced",
    shortLabel: "Moderate spread",
    description: "Same center, a few longer distances.",
    values: [30, 42, 47, 50, 53, 58, 70],
  },
  {
    id: "wide",
    label: "Wide",
    shortLabel: "Far edges",
    description: "Same center, squared terms surge.",
    values: [10, 30, 45, 50, 55, 70, 90],
  },
];

export const initialSpreadPreset = spreadPresets[0]!;

export function pointsForPreset(preset: SpreadPreset): DataPoint[] {
  return makePoints(preset.values);
}
