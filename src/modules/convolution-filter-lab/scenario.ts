import { type KernelOption, type Matrix } from "./convolution-filter-engine";

export const baseImage: Matrix = [
  [1, 2, 3, 4, 5],
  [1, 2, 3, 4, 5],
  [1, 2, 3, 4, 5],
  [1, 2, 3, 4, 5],
  [1, 2, 3, 4, 5],
];

export const imageScenarios = [
  { id: "ramp", label: "Ramp", shortLabel: "Steady change", image: baseImage },
  {
    id: "step", label: "Step edge", shortLabel: "Sudden jump",
    image: Array.from({ length: 5 }, () => [1, 1, 5, 5, 5]),
  },
  {
    id: "spot", label: "Single spot", shortLabel: "Local contrast",
    image: Array.from({ length: 5 }, (_, row) =>
      Array.from({ length: 5 }, (_, col) => row === 2 && col === 2 ? 9 : 0)),
  },
] as const;

export type ImageId = typeof imageScenarios[number]["id"];

export const kernelOptions: KernelOption[] = [
  {
    id: "edge",
    label: "Edge (vertical)",
    shortLabel: "Edge",
    description:
      "Right column minus left column: positive for a rise, negative for a fall, zero when they match.",
    kernel: [
      [-1, 0, 1],
      [-1, 0, 1],
      [-1, 0, 1],
    ],
  },
  {
    id: "blur",
    label: "Blur",
    shortLabel: "Blur",
    description:
      "All nine weights are 1/9. The output is the average of the nine patch values, including any padded zeros.",
    kernel: [
      [1 / 9, 1 / 9, 1 / 9],
      [1 / 9, 1 / 9, 1 / 9],
      [1 / 9, 1 / 9, 1 / 9],
    ],
  },
  {
    id: "sharpen",
    label: "Sharpen",
    shortLabel: "Sharpen",
    description:
      "The center pixel gets extra weight while neighbors subtract, exaggerating local contrast.",
    kernel: [
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0],
    ],
  },
];
