export type Matrix = number[][];

export type CellPosition = {
  row: number;
  col: number;
};

export type DotProductTerm = {
  index: number;
  left: number;
  right: number;
  product: number;
  runningTotal: number;
};

export type MatrixProductAnalysis = {
  isCompatible: boolean;
  leftShape: [number, number];
  rightShape: [number, number];
  outputShape: [number, number] | null;
  product: Matrix | null;
};

export function getShape(matrix: Matrix): [number, number] {
  return [matrix.length, matrix[0]?.length ?? 0];
}

export function canMultiply(left: Matrix, right: Matrix) {
  const [, leftColumns] = getShape(left);
  const [rightRows] = getShape(right);

  return leftColumns === rightRows;
}

export function multiplyMatrices(left: Matrix, right: Matrix): Matrix | null {
  if (!canMultiply(left, right)) {
    return null;
  }

  const [leftRows, sharedSize] = getShape(left);
  const [, rightColumns] = getShape(right);

  return Array.from({ length: leftRows }, (_, rowIndex) =>
    Array.from({ length: rightColumns }, (_, columnIndex) =>
      Array.from({ length: sharedSize }, (_, sharedIndex) => {
        return left[rowIndex][sharedIndex] * right[sharedIndex][columnIndex];
      }).reduce((total, value) => total + value, 0),
    ),
  );
}

export function analyzeProduct(
  left: Matrix,
  right: Matrix,
): MatrixProductAnalysis {
  const leftShape = getShape(left);
  const rightShape = getShape(right);
  const product = multiplyMatrices(left, right);

  return {
    isCompatible: product !== null,
    leftShape,
    rightShape,
    outputShape: product ? [leftShape[0], rightShape[1]] : null,
    product,
  };
}

export function getDotProductTerms({
  left,
  right,
  cell,
}: {
  left: Matrix;
  right: Matrix;
  cell: CellPosition;
}): DotProductTerm[] {
  if (!canMultiply(left, right)) {
    return [];
  }

  const [, sharedSize] = getShape(left);
  let runningTotal = 0;

  return Array.from({ length: sharedSize }, (_, index) => {
    const leftValue = left[cell.row][index];
    const rightValue = right[index][cell.col];
    const product = leftValue * rightValue;
    runningTotal += product;

    return {
      index,
      left: leftValue,
      right: rightValue,
      product,
      runningTotal,
    };
  });
}

export function formatFactor(value: number) {
  return value < 0 ? `(${value})` : String(value);
}

export function formatTerm(left: number, right: number) {
  return `${formatFactor(left)} x ${formatFactor(right)}`;
}

export function formatShape(shape: [number, number]) {
  return `${shape[0]} x ${shape[1]}`;
}
