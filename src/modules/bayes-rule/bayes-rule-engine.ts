export type BayesScenarioId = "medical" | "fraud";
export type BayesInputs = { total: number; prevalence: number; sensitivity: number; falsePositiveRate: number };
export type BayesAnalysis = {
  inputs: BayesInputs;
  counts: { total: number; condition: number; noCondition: number; truePositive: number; falsePositive: number; falseNegative: number; trueNegative: number; positiveTests: number; negativeTests: number };
  rates: { prior: number; sensitivity: number; falsePositiveRate: number; posterior: number | null; positiveRate: number };
};

// Expected frequencies preserve the input probabilities. They are not a rounded sample.
export function analyzeBayesRule(inputs: BayesInputs): BayesAnalysis {
  const total = Number.isFinite(inputs.total) ? Math.max(1, Math.round(inputs.total)) : 1000;
  const prevalence = clampRate(inputs.prevalence);
  const sensitivity = clampRate(inputs.sensitivity);
  const falsePositiveRate = clampRate(inputs.falsePositiveRate);
  const condition = total * prevalence;
  const noCondition = total - condition;
  const truePositive = condition * sensitivity;
  const falseNegative = condition - truePositive;
  const falsePositive = noCondition * falsePositiveRate;
  const trueNegative = noCondition - falsePositive;
  const positiveTests = truePositive + falsePositive;
  const negativeTests = falseNegative + trueNegative;
  return {
    inputs: { total, prevalence, sensitivity, falsePositiveRate },
    counts: { total, condition, noCondition, truePositive, falsePositive, falseNegative, trueNegative, positiveTests, negativeTests },
    rates: { prior: prevalence, sensitivity, falsePositiveRate, posterior: positiveTests === 0 ? null : truePositive / positiveTests, positiveRate: positiveTests / total },
  };
}
function clampRate(value: number) { return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0; }
