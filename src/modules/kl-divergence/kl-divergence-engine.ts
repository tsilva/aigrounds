import { type KlCategory } from "./scenario";

export type KlDirection = "p-to-q" | "q-to-p";

export type KlContribution = {
  category: KlCategory;
  sourceValue: number;
  targetValue: number;
  referenceValue: number;
  approximationValue: number;
  ratio: number;
  contribution: number;
};

export type KlAnalysis = {
  direction: KlDirection;
  sourceLabel: "P" | "Q";
  targetLabel: "P" | "Q";
  score: number;
  reverseScore: number;
  contributions: KlContribution[];
  formulaTerms: string[];
  qualityLabel: string;
  qualityTone: "good" | "medium" | "bad";
};

const minProbability = 0.01;
const maxProbability = 0.97;

export function analyzeKlDivergence(
  categories: KlCategory[],
  reference: number[],
  approximation: number[],
  direction: KlDirection,
): KlAnalysis {
  const forwardContributions = buildContributions(
    categories,
    reference,
    approximation,
    "p-to-q",
  );
  const reverseContributions = buildContributions(
    categories,
    reference,
    approximation,
    "q-to-p",
  );
  const contributions =
    direction === "p-to-q" ? forwardContributions : reverseContributions;
  const score = sumContributions(contributions);
  const reverseScore = sumContributions(
    direction === "p-to-q" ? reverseContributions : forwardContributions,
  );
  const sourceLabel = direction === "p-to-q" ? "P" : "Q";
  const targetLabel = direction === "p-to-q" ? "Q" : "P";

  return {
    direction,
    sourceLabel,
    targetLabel,
    score,
    reverseScore,
    contributions,
    formulaTerms: contributions.map(
      (row) =>
        `${formatProbability(row.sourceValue)} log(${formatProbability(
          row.sourceValue,
        )}/${formatProbability(row.targetValue)})`,
    ),
    qualityLabel: qualityLabel(score),
    qualityTone: qualityTone(score),
  };
}

export function adjustApproximation(
  approximation: number[],
  changedIndex: number,
  nextValue: number,
) {
  const clamped = roundProbability(
    Math.min(maxProbability, Math.max(minProbability, nextValue)),
  );
  const otherIndexes = approximation
    .map((_, index) => index)
    .filter((index) => index !== changedIndex);
  const remaining = 1 - clamped;
  const previousOtherTotal = otherIndexes.reduce(
    (total, index) => total + approximation[index],
    0,
  );
  const next = approximation.map((value, index) => {
    if (index === changedIndex) {
      return clamped;
    }

    const share =
      previousOtherTotal > 0
        ? (value / previousOtherTotal) * remaining
        : remaining / otherIndexes.length;

    return roundProbability(Math.max(minProbability, share));
  });

  const total = roundProbability(next.reduce((sum, value) => sum + value, 0));
  const diff = roundProbability(1 - total);
  const adjustmentIndex =
    otherIndexes.find((index) => next[index] + diff >= minProbability) ??
    changedIndex;

  next[adjustmentIndex] = roundProbability(next[adjustmentIndex] + diff);

  return next;
}

export function distributionTotal(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

export function formatProbability(value: number) {
  return value.toFixed(2);
}

export function formatRatio(value: number) {
  return value.toFixed(4);
}

export function formatKl(value: number) {
  return value.toFixed(4);
}

function buildContributions(
  categories: KlCategory[],
  reference: number[],
  approximation: number[],
  direction: KlDirection,
) {
  return categories.map((category, index) => {
    const referenceValue = clampProbability(reference[index] ?? minProbability);
    const approximationValue = clampProbability(
      approximation[index] ?? minProbability,
    );
    const sourceValue =
      direction === "p-to-q" ? referenceValue : approximationValue;
    const targetValue =
      direction === "p-to-q" ? approximationValue : referenceValue;
    const ratio = sourceValue / targetValue;

    return {
      category,
      sourceValue,
      targetValue,
      referenceValue,
      approximationValue,
      ratio,
      contribution: sourceValue * Math.log(ratio),
    };
  });
}

function sumContributions(contributions: KlContribution[]) {
  return contributions.reduce((total, row) => total + row.contribution, 0);
}

function qualityLabel(score: number) {
  if (score < 0.05) {
    return "The approximation is close to the reference shape.";
  }

  if (score < 0.25) {
    return "A few buckets are mismatched enough to create a visible penalty.";
  }

  return "The approximation is missing important mass from the reference.";
}

function qualityTone(score: number): KlAnalysis["qualityTone"] {
  if (score < 0.05) {
    return "good";
  }

  if (score < 0.25) {
    return "medium";
  }

  return "bad";
}

function roundProbability(value: number) {
  return Math.round(value * 100) / 100;
}

function clampProbability(value: number) {
  return Math.min(0.99, Math.max(0.001, value));
}
