import { type BayesInputs, type BayesScenarioId } from "./bayes-rule-engine";

export type BayesScenario = {
  id: BayesScenarioId;
  shortLabel: string;
  title: string;
  description: string;
  conditionLabel: string;
  signalLabel: string;
  truePositiveLabel: string;
  falsePositiveLabel: string;
  defaultInputs: BayesInputs;
  takeaway: string;
};

export const bayesScenarios: BayesScenario[] = [
  {
    id: "medical",
    shortLabel: "rare condition",
    title: "Medical Test",
    description: "A positive result can still include many healthy people.",
    conditionLabel: "has condition",
    signalLabel: "tests positive",
    truePositiveLabel: "sick and positive",
    falsePositiveLabel: "healthy but positive",
    defaultInputs: {
      total: 1000,
      prevalence: 0.01,
      sensitivity: 0.95,
      falsePositiveRate: 0.05,
    },
    takeaway:
      "A good test still needs enough real cases in the prior population.",
  },
  {
    id: "fraud",
    shortLabel: "rare fraud",
    title: "Fraud Alert",
    description: "Most alerts can be false when real fraud is rare.",
    conditionLabel: "real fraud",
    signalLabel: "flagged",
    truePositiveLabel: "fraud and flagged",
    falsePositiveLabel: "normal but flagged",
    defaultInputs: {
      total: 1000,
      prevalence: 0.02,
      sensitivity: 0.9,
      falsePositiveRate: 0.08,
    },
    takeaway:
      "Alert quality depends on the base rate before the model fires.",
  },
];
