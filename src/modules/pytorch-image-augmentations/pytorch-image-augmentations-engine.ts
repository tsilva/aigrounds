export type AugmentationFamilyId =
  | "geometry"
  | "color"
  | "occlusion"
  | "batch-mixing";

export type TransformId =
  | "random-resized-crop"
  | "horizontal-flip"
  | "rotation"
  | "color-jitter"
  | "random-grayscale"
  | "gaussian-blur"
  | "random-erasing"
  | "cutmix"
  | "mixup"
  | "augmix";

export type AugmentationFamily = {
  id: AugmentationFamilyId;
  title: string;
  summary: string;
  transforms: TransformId[];
  labelContract: string;
};

export type TransformDefinition = {
  id: TransformId;
  title: string;
  family: AugmentationFamilyId;
  codeName: string;
  labelBehavior: "one-hot" | "soft";
  helper: string;
};

export type ClassExample = {
  id: "cat" | "sneaker" | "stop-sign" | "leaf";
  label: string;
  classIndex: number;
  tone: "blue" | "red" | "green" | "amber";
};

export type MixAnalysis = {
  sourceAWeight: number;
  sourceBWeight: number;
  sourceAPercent: number;
  sourceBPercent: number;
  entropyBits: number;
  oneHotViolation: number;
  labelMode: "One-hot" | "Soft target";
};

export type SingleImageAnalysis = {
  labelClarity: number;
  diversityGain: number;
  risk: number;
  labelMode: "One-hot";
};

export function clampUnit(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function formatDecimal(value: number, digits = 2) {
  return value.toFixed(digits);
}

export function calculateMixAnalysis(lambda: number): MixAnalysis {
  const sourceAWeight = clampUnit(lambda);
  const sourceBWeight = 1 - sourceAWeight;
  const entropyBits = -[sourceAWeight, sourceBWeight].reduce((sum, value) => {
    if (value === 0) {
      return sum;
    }

    return sum + value * Math.log2(value);
  }, 0);

  return {
    sourceAWeight,
    sourceBWeight,
    sourceAPercent: Math.round(sourceAWeight * 100),
    sourceBPercent: Math.round(sourceBWeight * 100),
    entropyBits,
    oneHotViolation: sourceBWeight,
    labelMode: "Soft target",
  };
}

export function calculateSingleImageAnalysis(
  transform: TransformDefinition,
  strength: number,
): SingleImageAnalysis {
  const boundedStrength = clampUnit(strength);
  const baseRisk =
    transform.family === "occlusion"
      ? 0.18
      : transform.family === "color"
        ? 0.1
        : 0.14;
  const risk = Math.min(0.42, baseRisk * boundedStrength + 0.03);
  const diversityGain = Math.min(0.65, 0.18 + boundedStrength * 0.42);
  const labelClarity = Math.max(0.58, 1 - risk);

  return {
    labelClarity,
    diversityGain,
    risk,
    labelMode: "One-hot",
  };
}

export function getFamilyForTransform(
  transform: TransformDefinition,
): AugmentationFamilyId {
  return transform.family;
}
