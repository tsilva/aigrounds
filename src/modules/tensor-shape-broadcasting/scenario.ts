import type { Shape } from "./tensor-shape-broadcasting-engine";

export type BroadcastPreset = {
  id: string;
  label: string;
  aShape: number[];
  bShape: number[];
};

export const broadcastPresets: BroadcastPreset[] = [
  {
    id: "stretches",
    label: "stretches",
    aShape: [2, 3, 1],
    bShape: [1, 3, 4],
  },
  {
    id: "same-axes",
    label: "same axes",
    aShape: [2, 3, 4],
    bShape: [2, 3, 4],
  },
  {
    id: "fails",
    label: "fails",
    aShape: [2, 3, 1],
    bShape: [3, 3, 4],
  },
];

export const defaultBroadcastPreset = broadcastPresets[0];

export const defaultOutputIndex = [1, 2, 3] satisfies Shape;

export const axisProbeValues = [1, 2, 3, 4] as const;

export const axisProbeBase = {
  axisLabel: -3,
  aSize: 2,
};
