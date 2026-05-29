export type MixMode = "cutmix" | "mixup";

export type LabelMixExampleId = "cat" | "sneaker" | "stop-sign" | "leaf";

export type LabelMixExample = {
  classIndex: number;
  color: string;
  id: LabelMixExampleId;
  imageAlt: string;
  imageSrc: string;
  label: string;
  objectPosition: string;
};

export type CutMixPatch = {
  height: number;
  left: number;
  top: number;
  width: number;
};

export function clampMixLambda(value: number) {
  return Math.min(0.95, Math.max(0.05, value));
}

export function formatMixValue(value: number) {
  return value.toFixed(2);
}

export function oneHotVector(classIndex: number, classCount: number) {
  return Array.from({ length: classCount }, (_, index) =>
    index === classIndex ? 1 : 0,
  );
}

export function mixedLabelVector({
  classCount,
  exampleA,
  exampleB,
  lambda,
}: {
  classCount: number;
  exampleA: LabelMixExample;
  exampleB: LabelMixExample;
  lambda: number;
}) {
  const vector = Array.from({ length: classCount }, () => 0);
  const clampedLambda = clampMixLambda(lambda);

  vector[exampleA.classIndex] += clampedLambda;
  vector[exampleB.classIndex] += 1 - clampedLambda;

  return vector;
}

export function seededUnit(seed: number, salt: number) {
  const value = Math.sin(seed * 947.3 + salt * 431.7) * 10000;

  return value - Math.floor(value);
}

export function getCutMixPatch(lambda: number, sampleSeed: number): CutMixPatch {
  const areaFromB = 1 - clampMixLambda(lambda);
  const side = Math.sqrt(areaFromB);
  const maxOffset = 1 - side;

  return {
    height: side,
    left: seededUnit(sampleSeed, 2) * maxOffset,
    top: seededUnit(sampleSeed, 5) * maxOffset,
    width: side,
  };
}
