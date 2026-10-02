import type { RuleView } from "./probability-rules-engine";

type Choice = { id: string; label: string };
export type RuleExperiment = {
  id: string; label: string; shortLabel: string; title: string; start: RuleView; target: RuleView;
  question: string; predictions: Choice[]; correctPrediction: string;
  action: string; explanation: string; explanations: Choice[]; correctExplanation: string;
  retry: string; takeaway: string; rolls?: number;
};

export const ruleExperiments: RuleExperiment[] = [
  {
    id: "complement", label: "Complement", shortLabel: "Outside A", title: "Count what is outside", start: "a", target: "not-a",
    question: "A contains 6 of the 36 outcomes. Switch to Not A: how many will be selected?",
    predictions: [{ id: "30", label: "30" }, { id: "6", label: "6" }, { id: "18", label: "18" }], correctPrediction: "30",
    action: "Choose Not A. Compare selected cells with the original six A cells.",
    explanation: "Why are 30 outcomes selected?",
    explanations: [{ id: "outside", label: "Not A contains all 36 outcomes except the 6 in A." }, { id: "b", label: "Not A always means event B." }, { id: "six", label: "Every dice event has six outcomes." }], correctExplanation: "outside",
    retry: "An outcome can be outside both events. Complement means outside A in the whole sample space.",
    takeaway: "A and Not A partition the whole sample space. Their probabilities add to 1: 6/36 + 30/36 = 1.",
  },
  {
    id: "overlap", label: "Overlap", shortLabel: "Both events", title: "Keep both conditions", start: "a", target: "intersection",
    question: "Switch from A to Both. How many sum-7 outcomes also have an even first die?",
    predictions: [{ id: "3", label: "3" }, { id: "6", label: "6" }, { id: "18", label: "18" }], correctPrediction: "3",
    action: "Choose Both. Find the selected cells labeled A+B.",
    explanation: "Which condition must each selected outcome meet?",
    explanations: [{ id: "both", label: "Sum is 7 AND the first die is even." }, { id: "either", label: "Sum is 7 OR the first die is even." }, { id: "different", label: "A and B must use different rolls." }], correctExplanation: "both",
    retry: "Read the row and column of each A+B cell. One ordered pair must satisfy both rules.",
    takeaway: "Intersection means both conditions on the same outcome. Here (2,5), (4,3), and (6,1) are the three qualifying pairs.",
  },
  {
    id: "union", label: "Union", shortLabel: "Either event", title: "Count overlap once", start: "intersection", target: "union",
    question: "Switch from Both to Either. How many outcomes will be selected?",
    predictions: [{ id: "21", label: "21" }, { id: "24", label: "24" }, { id: "3", label: "3" }], correctPrediction: "21",
    action: "Choose Either. Count A-only, B-only, and A+B cells once each.",
    explanation: "Why subtract 3 from 6 + 18?",
    explanations: [{ id: "twice", label: "The three A+B outcomes were counted in both A and B." }, { id: "remove", label: "Either excludes outcomes in both events." }, { id: "independent", label: "Every union uses the same subtraction of 3." }], correctExplanation: "twice",
    retry: "Both-event cells remain selected in Either. Subtraction removes their extra count, not the cells.",
    takeaway: "Either means inclusive OR. Union adds the event counts and subtracts their overlap once: 6 + 18 − 3 = 21.",
  },
  {
    id: "sampling", label: "Simulation", shortLabel: "Exact vs observed", title: "Compare a sample with the rule", start: "union", target: "union", rolls: 1000,
    question: "After 1000 simulated rolls, must the observed proportion equal 21/36 exactly?",
    predictions: [{ id: "no", label: "No; random sampling can differ" }, { id: "yes", label: "Yes; every sample must match" }, { id: "changes", label: "The exact probability changes after each roll" }], correctPrediction: "no",
    action: "Keep Either selected and click Roll 1000. Compare observed hits/rolls with the exact selected probability.",
    explanation: "What does a difference between observed and exact mean?",
    explanations: [{ id: "noise", label: "A finite random sample can differ from its underlying probability." }, { id: "wrong", label: "The counting rule must be wrong." }, { id: "guarantee", label: "The next batch must get closer to the exact value." }], correctExplanation: "noise",
    retry: "The sample counts actual simulated rolls; the exact fraction counts equally likely possible outcomes. More rolls need not improve the error at every step.",
    takeaway: "Exact probability comes from the model; observed frequency comes from a sample. Larger samples reduce sampling noise on average, without guaranteeing a closer result at each step.",
  },
];

export const probabilityTutorPlan = {
  intro: "Four experiments and a transfer check turn regions of an ordered dice grid into exact probabilities and sampled frequencies.",
  whyItMatters: "Probability rules organize outcomes without losing or counting them twice. Keeping exact probability separate from observed frequency helps interpret finite samples.",
  openingMessage: "You need counting, fractions and two fair independent six-sided dice. An ordered outcome is (first die, second die); all 36 pairs are equally likely. An event is a set of those pairs. Not A is the complement, Both is the intersection, and Either is the inclusive union. A-only and B-only remove overlap.\n\nThe workbench has Event A and Event B choices, six Rule buttons and simulation controls. The rail guides four experiments. Choose a prediction to restore its start, perform the named action, then explain. Reset clears the current experiment and rolls. Changing events or the rule starts a new simulation.\n\nStart Experiment 1 with Event A = Sum is 7 and Event B = First die even. A has 6 outcomes. Predict how many Not A will select before trying it.",
  masteryCriteria: ["Counts equally likely outcomes in the correct sample space.", "Distinguishes complement, intersection, inclusive union and set difference.", "Explains why union subtracts overlap once while retaining those outcomes.", "Distinguishes exact probability from a finite sample frequency without promising monotonic convergence.", "Applies a rule to a new event pair and explains the selected region."],
  steps: ruleExperiments.map((experiment) => ({ title: experiment.title, experiment: `Use Sum is 7 and First die even. Choose a rail prediction, then ${experiment.action} After Simulation, use Try the transfer check for a new event pair.`, predictionQuestion: experiment.question, observationPrompt: experiment.explanation, takeaway: experiment.takeaway })),
};
