import type { DistributionMode } from "./bernoulli-categorical-binomial-engine";
type Choice = { id: string; label: string };
export type DistributionState = { mode: DistributionMode; p: number; n: number };
export const distributionDefaults: DistributionState = { mode: "bernoulli", p: .62, n: 8 };
export const distributionExperiments = [
  {
    title: "Move probability between outcomes", baseline: distributionDefaults, target: { ...distributionDefaults, p: .8 },
    question: "Raise Success probability from 62% to 80%. What happens to the failure probability in one Bernoulli trial?",
    predictions: [{ id: "falls", label: "It falls" }, { id: "fixed", label: "It stays fixed" }, { id: "rises", label: "It also rises" }], correctPrediction: "falls",
    action: "Set Success probability (%) to 80. Press Enter to apply the exact edit.",
    explanation: "Why does failure now have 20% probability?",
    explanations: [{ id: "complement", label: "Success and failure exhaust one trial, so failure is 1 − 0.80 = 0.20." }, { id: "twodraws", label: "The two bars represent two separate trials." }, { id: "mean", label: "The next outcome must equal the mean, 0.8." }], correctExplanation: "complement",
    retry: "The two bars are alternative outcomes of one trial. Their probabilities sum to one; its actual value is 0 or 1.",
    takeaway: "Moving 18 percentage points to success removes 18 from failure. The mean is 0.8, but a single outcome is still 0 or 1.",
  },
  {
    title: "Share the remaining mass", baseline: { mode: "categorical", p: .62, n: 8 } as DistributionState, target: { mode: "categorical", p: .3, n: 8 } as DistributionState,
    question: "In Categorical Choice, lower Class A probability from 62% to 30%. What happens to the combined probability of B, C and D?",
    predictions: [{ id: "more", label: "It rises to 70%" }, { id: "same", label: "It stays at 38%" }, { id: "separate", label: "Each other class becomes 70%" }], correctPrediction: "more",
    action: "Set Class A probability (%) to 30. The other classes share the remaining probability in a fixed 52:30:18 ratio.",
    explanation: "Which statement matches the four bars?",
    explanations: [{ id: "one", label: "One draw gives one label; A has 30%, and B/C/D share 70% in the stated ratio." }, { id: "count", label: "The bars count four successive trials." }, { id: "mean", label: "A, B, C and D have an intrinsic numerical mean." }], correctExplanation: "one",
    retry: "B has 36.4%, C 21% and D 12.6%. Add them, then distinguish class names from numerical counts.",
    takeaway: "B + C + D = 36.4% + 21% + 12.6% = 70%. Class B is most likely. The labels have no numerical order or intrinsic mean/variance; probability summaries describe them without inventing numeric codes.",
  },
  {
    title: "Count independent repeats", baseline: { mode: "binomial", p: .5, n: 8 } as DistributionState, target: { mode: "binomial", p: .5, n: 9 } as DistributionState,
    question: "At 50% success probability, increase Trials from 8 to 9. Is the expected success count necessarily a possible count in one run?",
    predictions: [{ id: "no", label: "No, an expected count can be fractional" }, { id: "yes", label: "Yes, an expected count must be a whole number" }, { id: "prob", label: "The expected count must stay at 0.5" }], correctPrediction: "no",
    action: "Set Trials to 9. Keep Success probability (%) at 50.",
    explanation: "How do the mean and two outlined bars fit together?",
    explanations: [{ id: "average", label: "The mean is 9 × 0.5 = 4.5; one run has an integer count, and 4 and 5 are tied most likely." }, { id: "half", label: "One trial can be half a success, so one run can score 4.5." }, { id: "order", label: "Each bar represents one particular order of successes and failures." }], correctExplanation: "average",
    retry: "A binomial bar combines every order with the same number of successes. There are ten possible integer counts, 0 through 9.",
    takeaway: "Nine independent trials with the same p give mean 4.5 and variance 2.25. Four and five successes each have probability 126/512 ≈ 24.61%. The mean is a weighted average; the mode is a most likely outcome.",
  },
] satisfies { title: string; baseline: DistributionState; target: DistributionState; question: string; predictions: Choice[]; correctPrediction: string; action: string; explanation: string; explanations: Choice[]; correctExplanation: string; retry: string; takeaway: string }[];
export const distributionTutorPlan = {
  intro: "Three predict–try–explain experiments distinguish a yes/no outcome, a class label and a count of independent repeats, followed by a one-trial transfer check.",
  whyItMatters: "Matching the probability model to its question keeps probabilities, numerical averages and outcome counts meaningful.",
  openingMessage: "You need complementary probabilities and probability-weighted averages. Probability mass means the chance assigned to a possible outcome; all outcomes together have mass one. Bernoulli Trial is one yes/no outcome coded 0 = failure or 1 = success. Categorical Choice is one class label A/B/C/D; names have no intrinsic numerical mean or variance. Binomial Count counts successes in n independent trials with the same success probability p. A count bar combines all trial orders giving that count. A mode is a most likely outcome; ties are allowed. A mean can be between possible outcomes.\n\nUse Bernoulli Trial, Categorical Choice or Binomial Count in the toolbar. Switching models keeps the current probability and stored trial count. Success probability (%) or Class A probability (%) has a native slider and exact editor; press Enter or leave the number field to apply. Trials (1–16) appears only for Binomial Count. This categorical example gives A probability p and distributes the rest to B/C/D in a fixed 52:30:18 ratio; it is one constrained family, not every categorical distribution. The bars use a fixed 0–100% probability scale, with labels outside and every tied mode outlined. Tiny probabilities keep their full-precision bar height. The optional probability table gives numerical equivalents. Mean/variance appear for numeric 0/1 outcomes and counts, while categorical summaries show P(A), total mass and most likely class.\n\nChoosing a prediction restores that experiment’s starting model and values. Reset restarts the current experiment. Start by predicting failure’s probability when Success probability (%) changes from 62% to 80%, then make the edit and explain. Follow Next experiment through three experiments, then Try the transfer check with Binomial Count, Trials 1 and Success probability 80. These are theoretical distributions, not simulated samples.",
  masteryCriteria: ["Uses complementary Bernoulli probabilities summing to one.", "Explains the categorical probability vector without treating labels as numbers.", "Distinguishes one trial, one class label and a count of independent equal-p trials.", "Separates a fractional expected count from integer outcomes and tied modes.", "Recognizes the n=1 binomial distribution as Bernoulli."],
  steps: distributionExperiments.map((experiment, index) => ({ title: experiment.title, experiment: `Choose a prediction to restore the starting model and parameters. ${experiment.action} Explain, then use ${index === 2 ? "Try the transfer check" : "Next experiment"}.`, predictionQuestion: experiment.question, observationPrompt: experiment.explanation, takeaway: experiment.takeaway })),
};
