export type Shape = readonly number[];

export type AxisStatus = "same" | "stretch-a" | "stretch-b" | "fail";

export type AxisAnalysis = {
  axisLabel: number;
  axisIndex: number;
  aSize: number;
  bSize: number;
  status: AxisStatus;
  outputSize: number | null;
};

export type BroadcastAnalysis = {
  aShape: Shape;
  bShape: Shape;
  axes: AxisAnalysis[];
  isCompatible: boolean;
  outputShape: number[] | null;
  totalElements: number | null;
  failedAxis: AxisAnalysis | null;
};

export type ValueTrace = {
  outputIndex: number[];
  aIndex: number[];
  bIndex: number[];
  aValue: number;
  bValue: number;
  outputValue: number;
};

export function formatShape(shape: Shape) {
  return `[${shape.join(", ")}]`;
}

function getAlignedSize(shape: Shape, alignedIndex: number, alignedRank: number) {
  const offset = alignedRank - shape.length;
  const shapeIndex = alignedIndex - offset;

  return shapeIndex < 0 ? 1 : shape[shapeIndex];
}

export function analyzeBroadcast(aShape: Shape, bShape: Shape): BroadcastAnalysis {
  for (const shape of [aShape,bShape]) if (shape.some(size=>!Number.isSafeInteger(size)||size<0)) throw new Error("Axis sizes must be nonnegative integers.");
  const rank = Math.max(aShape.length, bShape.length);
  const axes = Array.from({ length: rank }, (_, axisIndex) => {
    const aSize = getAlignedSize(aShape, axisIndex, rank);
    const bSize = getAlignedSize(bShape, axisIndex, rank);
    const outputSize =
      aSize === bSize || aSize === 1 || bSize === 1
        ? aSize === 1 ? bSize : bSize === 1 ? aSize : aSize
        : null;
    const status: AxisStatus =
      outputSize === null
        ? "fail"
        : aSize === bSize
          ? "same"
          : aSize === 1
            ? "stretch-a"
            : "stretch-b";

    return {
      axisLabel: axisIndex - rank,
      axisIndex,
      aSize,
      bSize,
      status,
      outputSize,
    };
  });
  const failedAxis = axes.find((axis) => axis.status === "fail") ?? null;
  const outputShape = failedAxis
    ? null
    : axes.map((axis) => axis.outputSize ?? 1);

  return {
    aShape,
    bShape,
    axes,
    isCompatible: failedAxis === null,
    outputShape,
    totalElements: outputShape
      ? outputShape.reduce((total, size) => total * size, 1)
      : null,
    failedAxis,
  };
}

export function clampShapeAxis(value: number) {
  return Number.isFinite(value) ? Math.min(5, Math.max(1, Math.round(value))) : 1;
}

export function clampOutputIndex(index: number[], outputShape: Shape | null) {
  if (!outputShape) {
    return index;
  }

  return outputShape.map((size, axisIndex) =>
    Math.min(size - 1, Math.max(0, Number.isFinite(index[axisIndex]) ? Math.round(index[axisIndex]) : 0)),
  );
}

function mapOutputIndexToInput(outputIndex: Shape, inputShape: Shape) {
  const rank = outputIndex.length;
  const offset = rank - inputShape.length;

  return inputShape.map((size, shapeIndex) => {
    const outputAxisIndex = shapeIndex + offset;
    return size === 1 ? 0 : outputIndex[outputAxisIndex] ?? 0;
  });
}

function getAValue(index: Shape) {
  const [i = 0, j = 0] = index;
  return 1 + i * 3 + j;
}

function getBValue(index: Shape) {
  const [, j = 0, k = 0] = index;
  return 10 + j * 5 + k;
}

export function getValueTrace({
  aShape,
  bShape,
  outputIndex,
}: {
  aShape: Shape;
  bShape: Shape;
  outputIndex: Shape;
}): ValueTrace {
  const analysis=analyzeBroadcast(aShape,bShape);
  if(!analysis.outputShape||outputIndex.length!==analysis.outputShape.length||outputIndex.some((v,i)=>!Number.isInteger(v)||v<0||v>=analysis.outputShape![i])) throw new Error("A trace requires compatible shapes and a valid output index.");
  const aIndex = mapOutputIndexToInput(outputIndex, aShape);
  const bIndex = mapOutputIndexToInput(outputIndex, bShape);
  const aValue = getAValue(aIndex);
  const bValue = getBValue(bIndex);

  return {
    outputIndex: [...outputIndex],
    aIndex,
    bIndex,
    aValue,
    bValue,
    outputValue: aValue + bValue,
  };
}
