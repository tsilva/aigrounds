import { type KernelOption, type Matrix } from "./convolution-filter-engine";

export const baseImage: Matrix = [
  [1, 2, 3, 4, 5],
  [1, 2, 3, 4, 5],
  [1, 2, 3, 4, 5],
  [1, 2, 3, 4, 5],
  [1, 2, 3, 4, 5],
];

export const kernelOptions: KernelOption[] = [
  {
    id: "edge",
    label: "Edge (vertical)",
    shortLabel: "Edge",
    description:
      "Positive right column minus negative left column detects left-to-right changes.",
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
      "Averaging nearby pixels softens local jumps by spreading each value across its neighborhood.",
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
