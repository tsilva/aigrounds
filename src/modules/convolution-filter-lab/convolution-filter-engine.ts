export type Matrix = number[][];

export type KernelOption = {
  id: "edge" | "blur" | "sharpen";
  label: string;
  shortLabel: string;
  description: string;
  kernel: Matrix;
};

export type ConvolutionState = {
  colIndex: number;
  filterId: KernelOption["id"];
  padding: number;
  rowIndex: number;
  stride: number;
};

export type ConvolutionAnalysis = {
  currentPatch: Matrix;
  elementProducts: Matrix;
  flattenedProducts: number[];
  output: Matrix;
  outputSize: number;
  paddedImage: Matrix;
  sum: number;
  topLeftCol: number;
  topLeftRow: number;
};

export function padImage(image: Matrix, padding: number) {
  const paddedSize = image.length + padding * 2;

  return Array.from({ length: paddedSize }, (_, row) =>
    Array.from({ length: paddedSize }, (_, col) => {
      const sourceRow = row - padding;
      const sourceCol = col - padding;

      if (
        sourceRow < 0 ||
        sourceCol < 0 ||
        sourceRow >= image.length ||
        sourceCol >= image[0].length
      ) {
        return 0;
      }

      return image[sourceRow][sourceCol];
    }),
  );
}

export function getOutputSize(
  imageSize: number,
  kernelSize: number,
  padding: number,
  stride: number,
) {
  return Math.floor((imageSize + padding * 2 - kernelSize) / stride) + 1;
}

export function getPatch(
  paddedImage: Matrix,
  topLeftRow: number,
  topLeftCol: number,
  kernelSize: number,
) {
  return Array.from({ length: kernelSize }, (_, row) =>
    Array.from(
      { length: kernelSize },
      (_, col) => paddedImage[topLeftRow + row][topLeftCol + col],
    ),
  );
}

export function multiplyPatch(patch: Matrix, kernel: Matrix) {
  return patch.map((row, rowIndex) =>
    row.map((value, colIndex) => value * kernel[rowIndex][colIndex]),
  );
}

export function sumMatrix(matrix: Matrix) {
  return matrix.flat().reduce((total, value) => total + value, 0);
}

export function convolveImage(
  image: Matrix,
  kernel: Matrix,
  padding: number,
  stride: number,
) {
  const paddedImage = padImage(image, padding);
  const outputSize = getOutputSize(image.length, kernel.length, padding, stride);

  return Array.from({ length: outputSize }, (_, rowIndex) =>
    Array.from({ length: outputSize }, (_, colIndex) => {
      const patch = getPatch(
        paddedImage,
        rowIndex * stride,
        colIndex * stride,
        kernel.length,
      );

      return sumMatrix(multiplyPatch(patch, kernel));
    }),
  );
}

export function analyzeConvolution(
  image: Matrix,
  kernel: Matrix,
  state: Pick<ConvolutionState, "rowIndex" | "colIndex" | "padding" | "stride">,
): ConvolutionAnalysis {
  const paddedImage = padImage(image, state.padding);
  const output = convolveImage(image, kernel, state.padding, state.stride);
  const outputSize = output.length;
  const rowIndex = clampIndex(state.rowIndex, outputSize);
  const colIndex = clampIndex(state.colIndex, outputSize);
  const topLeftRow = rowIndex * state.stride;
  const topLeftCol = colIndex * state.stride;
  const currentPatch = getPatch(
    paddedImage,
    topLeftRow,
    topLeftCol,
    kernel.length,
  );
  const elementProducts = multiplyPatch(currentPatch, kernel);
  const flattenedProducts = elementProducts.flat();

  return {
    currentPatch,
    elementProducts,
    flattenedProducts,
    output,
    outputSize,
    paddedImage,
    sum: sumMatrix(elementProducts),
    topLeftCol,
    topLeftRow,
  };
}

export function clampIndex(index: number, size: number) {
  return Math.min(Math.max(index, 0), Math.max(0, size - 1));
}

export function makeFormulaTerms(values: number[]) {
  return values.map((value) => (value < 0 ? `(${value})` : `${value}`));
}
