import type { Matrix } from "./matrix-multiplication-engine";

export type MatrixShapePreset = {
  id: string;
  label: string;
  left: Matrix;
  right: Matrix;
  defaultCell: {
    row: number;
    col: number;
  };
};

export const matrixShapePresets: MatrixShapePreset[] = [
  {
    id: "two-by-three-times-three-by-two",
    label: "2x3 x 3x2",
    left: [
      [2, -1, 3],
      [0, 4, 1],
    ],
    right: [
      [1, 5],
      [2, -2],
      [0, 3],
    ],
    defaultCell: {
      row: 0,
      col: 1,
    },
  },
  {
    id: "two-by-two-times-two-by-three",
    label: "2x2 x 2x3",
    left: [
      [3, -2],
      [1, 4],
    ],
    right: [
      [2, 0, 5],
      [-1, 3, 2],
    ],
    defaultCell: {
      row: 0,
      col: 2,
    },
  },
  {
    id: "three-by-two-times-two-by-one",
    label: "3x2 x 2x1",
    left: [
      [1, 2],
      [-3, 4],
      [5, 0],
    ],
    right: [[6], [-1]],
    defaultCell: {
      row: 1,
      col: 0,
    },
  },
];

export const incompatibleExample = {
  leftShape: [2, 3] as [number, number],
  rightShape: [2, 2] as [number, number],
};
