import type { FilterView, ScenarioId } from "./conditional-probability-engine";

type Choice = { id: string; label: string };
type ConditionalExperiment = {
  title: string; scenario: ScenarioId; start: FilterView;
  question: string; predictions: Choice[]; correctPrediction: string;
  action: string; explanation: string; explanations: Choice[];
  correctExplanation: string; retry: string; takeaway: string;
};

export const conditionalExperiments: ConditionalExperiment[] = [
  {
    title: "Keep the same 22", scenario: "dependent", start: "intersection",
    question: "Switch from A ∩ B to B given A. What changes in the selected fraction?",
    predictions: [{ id: "denominator", label: "Only the denominator" }, { id: "numerator", label: "Only the overlap count" }, { id: "neither", label: "Neither" }], correctPrediction: "denominator",
    action: "Choose B given A. Compare the selected fraction with A ∩ B: 22/100.",
    explanation: "Why does the fraction become 22/40?",
    explanations: [{ id: "inside", label: "The same 22 people meet both conditions; only the 40 people in A are now eligible." }, { id: "created", label: "Filtering creates more people who pass the check." }, { id: "reverse", label: "B given A divides by the number of people in B." }], correctExplanation: "inside",
    retry: "The overlap has not moved. Read the A row total and compare it with the whole-population total.",
    takeaway: "Joint probability counts both events out of everyone: 22/100. Conditional probability counts B only inside A: 22/40 = 55%. Changing the reference group does not create new people.",
  },
  {
    title: "A smaller group, the same rate", scenario: "independent", start: "b",
    question: "Independent has 25 B people out of 100. After choosing B given A, must the B rate change just because the group is smaller?",
    predictions: [{ id: "same", label: "No; it can stay at 25%" }, { id: "up", label: "Yes; it must rise" }, { id: "none", label: "Independence means A and B cannot overlap" }], correctPrediction: "same",
    action: "Choose B given A. Compare 10/40 with P(B) = 25/100.",
    explanation: "What makes these events independent?",
    explanations: [{ id: "rate", label: "B has the same rate inside A as in the whole population: 10/40 = 25/100." }, { id: "counts", label: "The number of B people must stay at 25 after filtering." }, { id: "disjoint", label: "No person can belong to both events." }], correctExplanation: "rate",
    retry: "There are ten people in the overlap. Independence concerns a proportion, not an unchanged count or no overlap.",
    takeaway: "Independence means knowing A leaves the probability of B unchanged. Both the B count and denominator shrink in the same ratio here: 25/100 = 10/40 = 25%.",
  },
  {
    title: "A higher rate, a small overlap", scenario: "base-rate", start: "b",
    question: "The rare condition B affects 8 of 100 people. With B given A, will its rate inside the positive-signal group be higher than 8%?",
    predictions: [{ id: "higher", label: "Yes; a smaller reference group can have a higher rate" }, { id: "same", label: "No; every probability of B must be 8%" }, { id: "all", label: "A positive signal guarantees the condition" }], correctPrediction: "higher",
    action: "Choose B given A. Compare 6/18 with the joint fraction 6/100.",
    explanation: "How can the conditional rate rise while the joint count stays small?",
    explanations: [{ id: "reference", label: "Six people have both facts; they are counted out of 18 signal-positive people rather than all 100." }, { id: "certain", label: "All 18 signal-positive people have the condition." }, { id: "growth", label: "The condition becomes more common in the whole population when the view changes." }], correctExplanation: "reference",
    retry: "The A row includes 6 with B and 12 without B. Filtering changes the reference group, not either count.",
    takeaway: "P(B given A) = 6/18 ≈ 33.3%, P(B) = 8/100 = 8%, and P(A ∩ B) = 6/100 = 6%. A signal can raise a conditional rate without guaranteeing B or changing the population.",
  },
];

export const conditionalTutorPlan = {
  intro: "Three prediction/action/explanation experiments compare joint, marginal and conditional fractions, then test a new reference group.",
  whyItMatters: "A probability depends on who is eligible to count. Conditioning changes that reference group; independence is the special case where the rate stays the same.",
  openingMessage: "You need event membership, counting and fractions. Each fictional scenario has 100 equally likely people. A ∩ B means both facts. P(B) counts B out of everyone; P(B given A) counts B only inside A. The four-cell table gives exact counts; Show all 100 people opens the matching grid. ✓ marks numerator groups and an outline marks eligible denominator groups.\n\nUse the View buttons and the three scenario buttons. The rail guides three experiments and a transfer check. Choosing a prediction restores that experiment’s scenario and starting view. Reset restarts the current experiment. Changing a view or scenario invalidates its explanation. These examples show associations, not proof that one event causes another.\n\nStart on Dependent and A ∩ B. There are 22 people in both groups out of 100. Predict what changes when you choose B given A, then try it.",
  masteryCriteria: ["Uses A, rather than B or the whole population, as the denominator for B given A.", "Distinguishes joint, marginal and conditional probabilities of the same population.", "Recognizes independence from equal rates, allowing overlap and changed counts.", "Explains higher conditional rates without changed population counts or certainty.", "Computes B outside A from complementary table counts."],
  steps: conditionalExperiments.map((experiment) => ({ title: experiment.title, experiment: `Choose a rail prediction, then ${experiment.action} ${experiment.scenario === "base-rate" ? "After explaining, use Try the transfer check." : "After explaining, use Next experiment."}`, predictionQuestion: experiment.question, observationPrompt: experiment.explanation, takeaway: experiment.takeaway })),
};
