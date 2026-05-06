import { type CrossEntropyClass, type CrossEntropyMode } from "./scenario";

const MIN_PROBABILITY = 0.01;

type LossAnalysis = {
  trueClass: CrossEntropyClass;
  trueClasses: CrossEntropyClass[];
  trueProbability: number;
  loss: number;
  total: number;
  isValidDistribution: boolean;
  qualityLabel: string;
  qualityTone: "good" | "medium" | "bad";
  calculationTerms: string[];
};

export function categoricalCrossEntropyLoss(
  classes: CrossEntropyClass[],
  probabilities: Record<string, number>,
  trueClassIds: string[],
  mode: CrossEntropyMode = "categorical",
) {
  if (mode === "multilabel") {
    const trueClassSet = new Set(trueClassIds);
    const totalLoss = classes.reduce((sum, classItem) => {
      const target = trueClassSet.has(classItem.id) ? 1 : 0;
      const probability = clampProbability(probabilities[classItem.id] ?? 0);
      const term =
        target === 1
          ? -Math.log(probability)
          : -Math.log(1 - probability);

      return sum + term;
    }, 0);

    return totalLoss / classes.length;
  }

  const trueClassId = trueClassIds[0] ?? classes[0]?.id ?? "";
  const trueProbability = clampProbability(probabilities[trueClassId] ?? 0);

  return -Math.log(trueProbability);
}

function probabilityTotal(
  classes: CrossEntropyClass[],
  probabilities: Record<string, number>,
) {
  return classes.reduce(
    (total, classItem) => total + (probabilities[classItem.id] ?? 0),
    0,
  );
}

export function analyzeLoss(
  classes: CrossEntropyClass[],
  probabilities: Record<string, number>,
  trueClassIds: string[],
  mode: CrossEntropyMode,
): LossAnalysis {
  const trueClassSet = new Set(trueClassIds);
  const trueClasses = classes.filter((classItem) =>
    trueClassSet.has(classItem.id),
  );
  const trueClass = trueClasses[0] ?? classes[0];

  if (!trueClass) {
    throw new Error("At least one class is required.");
  }

  const trueProbability =
    mode === "multilabel"
      ? trueClasses.reduce(
          (sum, classItem) =>
            sum + clampProbability(probabilities[classItem.id] ?? 0),
          0,
        ) / Math.max(1, trueClasses.length)
      : clampProbability(probabilities[trueClass.id] ?? 0);
  const loss = categoricalCrossEntropyLoss(
    classes,
    probabilities,
    trueClassIds,
    mode,
  );
  const total = probabilityTotal(classes, probabilities);

  return {
    trueClass,
    trueClasses,
    trueProbability,
    loss,
    total,
    isValidDistribution:
      mode === "multilabel" || Math.abs(total - 1) < 0.005,
    qualityLabel: qualityLabel(loss),
    qualityTone: qualityTone(loss),
    calculationTerms: classes.map((classItem) => {
      const target = trueClassSet.has(classItem.id) ? 1 : 0;
      const probability = probabilities[classItem.id] ?? 0;

      if (mode === "multilabel" && target === 0) {
        return `(1 − ${target}) × log(1 − ${probability.toFixed(2)})`;
      }

      return `${target} × log(${probability.toFixed(2)})`;
    }),
  };
}

export function adjustProbability(
  classes: CrossEntropyClass[],
  probabilities: Record<string, number>,
  changedClassId: string,
  nextValue: number,
  mode: CrossEntropyMode = "categorical",
) {
  const clampedValue = clamp(nextValue, MIN_PROBABILITY, 0.97);

  if (mode === "multilabel") {
    return {
      ...probabilities,
      [changedClassId]: roundProbability(clampedValue),
    };
  }

  const otherClasses = classes.filter(
    (classItem) => classItem.id !== changedClassId,
  );
  const remainingMass = 1 - clampedValue;
  const previousOtherTotal = otherClasses.reduce(
    (total, classItem) => total + (probabilities[classItem.id] ?? 0),
    0,
  );
  const equalShare = remainingMass / otherClasses.length;
  const nextProbabilities: Record<string, number> = {
    [changedClassId]: roundProbability(clampedValue),
  };

  for (const classItem of otherClasses) {
    const previous = probabilities[classItem.id] ?? equalShare;
    const scaled =
      previousOtherTotal > 0
        ? (previous / previousOtherTotal) * remainingMass
        : equalShare;
    nextProbabilities[classItem.id] = roundProbability(scaled);
  }

  return rebalance(classes, nextProbabilities, changedClassId);
}

export function setTrueClassDistribution(
  classes: CrossEntropyClass[],
  probabilities: Record<string, number>,
  trueClassId: string,
) {
  if ((probabilities[trueClassId] ?? 0) >= 0.45) {
    return probabilities;
  }

  return adjustProbability(classes, probabilities, trueClassId, 0.7);
}

function qualityLabel(loss: number) {
  if (loss < 0.5) {
    return "Lower is better! The model is more confident in the correct class.";
  }

  if (loss < 1.4) {
    return "The correct class has some probability, but the model is uncertain.";
  }

  return "The loss is high because the true class received too little probability.";
}

function qualityTone(loss: number): LossAnalysis["qualityTone"] {
  if (loss < 0.5) {
    return "good";
  }

  if (loss < 1.4) {
    return "medium";
  }

  return "bad";
}

function rebalance(
  classes: CrossEntropyClass[],
  probabilities: Record<string, number>,
  preferredClassId: string,
) {
  const total = probabilityTotal(classes, probabilities);
  const difference = roundProbability(1 - total);
  const preferred = probabilities[preferredClassId] ?? MIN_PROBABILITY;

  return {
    ...probabilities,
    [preferredClassId]: roundProbability(
      clamp(preferred + difference, MIN_PROBABILITY, 0.97),
    ),
  };
}

function roundProbability(value: number) {
  return Math.round(value * 100) / 100;
}

function clampProbability(value: number) {
  return clamp(value, MIN_PROBABILITY, 0.99);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
