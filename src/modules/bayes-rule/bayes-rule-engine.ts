export type BayesScenarioId = "medical" | "fraud";

export type BayesInputs = {
  total: number;
  prevalence: number;
  sensitivity: number;
  falsePositiveRate: number;
};

export type BayesGroup = "true-positive" | "false-positive" | "false-negative" | "true-negative";

export type BayesMember = {
  id: number;
  group: BayesGroup;
  hasCondition: boolean;
  testedPositive: boolean;
};

export type BayesAnalysis = {
  inputs: BayesInputs;
  counts: {
    total: number;
    condition: number;
    noCondition: number;
    truePositive: number;
    falsePositive: number;
    falseNegative: number;
    trueNegative: number;
    positiveTests: number;
    negativeTests: number;
  };
  rates: {
    prior: number;
    sensitivity: number;
    falsePositiveRate: number;
    posterior: number;
    positiveRate: number;
  };
  members: BayesMember[];
};

export function analyzeBayesRule(inputs: BayesInputs): BayesAnalysis {
  const total = Math.max(1, Math.round(inputs.total));
  const prevalence = clampRate(inputs.prevalence);
  const sensitivity = clampRate(inputs.sensitivity);
  const falsePositiveRate = clampRate(inputs.falsePositiveRate);
  const condition = clampCount(Math.round(total * prevalence), total);
  const noCondition = total - condition;
  const truePositive = clampCount(Math.round(condition * sensitivity), condition);
  const falseNegative = condition - truePositive;
  const falsePositive = clampCount(
    Math.round(noCondition * falsePositiveRate),
    noCondition,
  );
  const trueNegative = noCondition - falsePositive;
  const positiveTests = truePositive + falsePositive;
  const negativeTests = falseNegative + trueNegative;
  const posterior = positiveTests === 0 ? 0 : truePositive / positiveTests;
  const normalizedInputs = {
    total,
    prevalence,
    sensitivity,
    falsePositiveRate,
  };

  return {
    inputs: normalizedInputs,
    counts: {
      total,
      condition,
      noCondition,
      truePositive,
      falsePositive,
      falseNegative,
      trueNegative,
      positiveTests,
      negativeTests,
    },
    rates: {
      prior: condition / total,
      sensitivity,
      falsePositiveRate,
      posterior,
      positiveRate: positiveTests / total,
    },
    members: buildMembers({
      truePositive,
      falsePositive,
      falseNegative,
      trueNegative,
    }),
  };
}

function buildMembers(counts: {
  truePositive: number;
  falsePositive: number;
  falseNegative: number;
  trueNegative: number;
}) {
  const groups: Array<{
    group: BayesGroup;
    count: number;
    hasCondition: boolean;
    testedPositive: boolean;
  }> = [
    {
      group: "true-positive",
      count: counts.truePositive,
      hasCondition: true,
      testedPositive: true,
    },
    {
      group: "false-positive",
      count: counts.falsePositive,
      hasCondition: false,
      testedPositive: true,
    },
    {
      group: "false-negative",
      count: counts.falseNegative,
      hasCondition: true,
      testedPositive: false,
    },
    {
      group: "true-negative",
      count: counts.trueNegative,
      hasCondition: false,
      testedPositive: false,
    },
  ];
  let id = 0;

  return groups.flatMap((entry) =>
    Array.from({ length: entry.count }, () => {
      id += 1;

      return {
        id,
        group: entry.group,
        hasCondition: entry.hasCondition,
        testedPositive: entry.testedPositive,
      };
    }),
  );
}

function clampRate(value: number) {
  return Math.min(1, Math.max(0, value));
}

function clampCount(value: number, max: number) {
  return Math.min(max, Math.max(0, value));
}
