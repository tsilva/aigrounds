import type { BayesInputs } from "./bayes-rule-engine";

type Choice = { id: string; label: string };
export const medicalDefaults: BayesInputs = { total: 1000, prevalence: 0.01, sensitivity: 0.95, falsePositiveRate: 0.05 };
type BayesExperiment = { title: string; target: BayesInputs; question: string; predictions: Choice[]; correctPrediction: string; action: string; explanation: string; explanations: Choice[]; correctExplanation: string; retry: string; takeaway: string };
export const bayesExperiments: BayesExperiment[] = [
  {
    title: "Give the test more real cases", target: { ...medicalDefaults, prevalence: 0.05 },
    question: "Raise Prevalence from 1% to 5%, leaving the test rates fixed. What happens to the posterior probability after a positive result?",
    predictions: [{ id: "rises", label: "It rises" }, { id: "sensitivity", label: "It stays at 95%" }, { id: "falls", label: "It falls" }], correctPrediction: "rises",
    action: "Set Prevalence (%) to 5. Keep Sensitivity at 95 and False-positive rate at 5.",
    explanation: "Why does the posterior rise from about 16.1% to 50%?",
    explanations: [{ id: "pools", label: "More real cases produce more true positives; fewer non-cases produce slightly fewer false positives." }, { id: "accuracy", label: "The test’s sensitivity changed to 50%." }, { id: "same", label: "Posterior probability always equals prevalence." }], correctExplanation: "pools",
    retry: "Sensitivity and false-positive rate stayed fixed. Compare the expected real-case and non-case pool sizes before and after.",
    takeaway: "At 5% prevalence, true positives and false positives are both 47.5 per 1000. Half of all positive results are real cases. The same test can have different posteriors in different populations.",
  },
  {
    title: "Change what the test catches", target: { ...medicalDefaults, sensitivity: 0.5 },
    question: "Return to the medical defaults. Lower Sensitivity from 95% to 50%. Which positive-result pool should shrink?",
    predictions: [{ id: "true", label: "True positives only" }, { id: "both", label: "Both true and false positives" }, { id: "false", label: "False positives only" }], correctPrediction: "true",
    action: "Set Sensitivity (%) to 50. Keep Prevalence at 1 and False-positive rate at 5.",
    explanation: "Why does the posterior fall to about 9.2%?",
    explanations: [{ id: "denominator", label: "Five true positives now share the positive denominator with the unchanged 49.5 false positives." }, { id: "wronggroup", label: "Sensitivity is the chance that a non-case tests positive." }, { id: "prior", label: "Lowering sensitivity makes the condition less prevalent." }], correctExplanation: "denominator",
    retry: "Sensitivity acts on the ten real cases. The 990 non-cases still generate 49.5 false positives at 5%.",
    takeaway: "Sensitivity is P(positive given real case), not P(real case given positive). Lower sensitivity creates more false negatives and fewer true positives, while the prior and false-positive pool remain fixed.",
  },
  {
    title: "Remove competing false alarms", target: { ...medicalDefaults, falsePositiveRate: 0.01 },
    question: "At the medical defaults, lower False-positive rate from 5% to 1%. What happens to the posterior?",
    predictions: [{ id: "rises", label: "It rises as false positives become less common" }, { id: "falls", label: "It falls because there are fewer positive results" }, { id: "fixed", label: "It is fixed by sensitivity alone" }], correctPrediction: "rises",
    action: "Set False-positive rate (%) to 1. Keep Prevalence at 1 and Sensitivity at 95.",
    explanation: "Why is the new posterior about 49%, rather than 95%?",
    explanations: [{ id: "competition", label: "There are still 9.9 false positives alongside 9.5 true positives in the positive denominator." }, { id: "sensitivity", label: "95% sensitivity guarantees a 95% posterior." }, { id: "none", label: "A 1% false-positive rate means zero false positives." }], correctExplanation: "competition",
    retry: "The 1% false-positive rate applies to 990 non-cases, not to the positive-result group. Compare both positive pools.",
    takeaway: "Bayes divides true positives by every positive result. Even a small false-positive rate can produce many false alarms when the non-case population is much larger.",
  },
];
export const bayesTutorPlan = {
  intro: "Three parameter experiments and a fraud-signal transfer check explain Bayes through exact expected frequencies.",
  whyItMatters: "Evidence must be interpreted alongside the prior and false alarms. The positive-result denominator contains both real and false positives.",
  openingMessage: "You need conditional probability and fractions. This is a fictional fixed-rate model. Prevalence is the prior chance of a real case before evidence; sensitivity is P(positive given real case); false-positive rate is P(positive given no real case). Posterior means P(real case given positive). Those two conditional directions differ.\n\nThe workbench has Medical Test and Fraud Alert scenarios, three percentage sliders with exact editors (press Enter or leave the number field to apply), and Rare, Balanced and Clean presets. Expected counts per 1000 are model averages, so 9.5 expected cases is valid; they are not a simulated or rounded sample. The table and bar separate true and false positives. The fraction beneath the bar uses every positive result. Changing controls invalidates explanations; choosing a prediction restores medical defaults. Reset restarts the current experiment.\n\nStart Experiment 1 by predicting what happens when Prevalence (%) rises from 1 to 5 while Sensitivity stays at 95 and False-positive rate stays at 5. Then make that one edit and explain from the two positive pools. After three experiments, use Try the transfer check with Fraud Alert.",
  masteryCriteria: ["Distinguishes prevalence, sensitivity, false-positive rate and posterior by their reference groups.", "Explains how the prior changes the two evidence pools with fixed test rates.", "Uses true plus false positives as the positive-result denominator.", "Distinguishes fractional expected frequencies from realized sample counts.", "Transfers the evidence-pool reasoning to a fraud scenario."],
  steps: bayesExperiments.map((experiment, index) => ({ title: experiment.title, experiment: `Choose a rail prediction to restore Medical Test defaults. ${experiment.action} Explain, then use ${index === 2 ? "Try the transfer check" : "Next experiment"}.`, predictionQuestion: experiment.question, observationPrompt: experiment.explanation, takeaway: experiment.takeaway })),
};
