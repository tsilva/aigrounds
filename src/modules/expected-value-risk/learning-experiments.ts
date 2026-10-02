type Choice = { id: string; label: string };
export type PayoffExperiment = {
  title: string; baseline: string; targetPreset: string; targetWin?: number; targetProbability?: number; rounds: number;
  question: string; predictions: Choice[]; correctPrediction: string; action: string;
  explanation: string; explanations: Choice[]; correctExplanation: string; retry: string; takeaway: string;
};
export const payoffExperiments: PayoffExperiment[] = [
  {
    title: "Give the prize its weight", baseline: "steady", targetPreset: "steady", targetWin: 150, rounds: 60,
    question: "In Steady vs Swingy, increase Bet B’s win amount from $125 to $150. Keep its 34% win chance and −$38 loss fixed. What happens to EV?",
    predictions: [{ id: "rises", label: "It rises" }, { id: "fixed", label: "It stays fixed" }, { id: "prize", label: "It becomes $150" }], correctPrediction: "rises",
    action: "Set Bet B win amount ($) to 150. Press Enter to apply the exact edit.",
    explanation: "Why did Bet B’s EV rise by $8.50 rather than $25?",
    explanations: [{ id: "weighted", label: "Only the 34% win branch gets the extra $25: 0.34 × 25 = 8.50." }, { id: "all", label: "Every round earns the extra $25." }, { id: "loss", label: "The loss branch also got bigger." }], correctExplanation: "weighted",
    retry: "The probability and loss stayed fixed. Weight the change in the winning payoff by its probability.",
    takeaway: "Bet B’s EV rises from $17.42 to $25.92. A random variable is the numerical payoff of one uncertain round; its expectation weights both possible payoffs, not just the prize.",
  },
  {
    title: "Separate average from spread", baseline: "steady", targetPreset: "upside", rounds: 60,
    question: "Switch to Higher EV, Wider Swings. Can Bet B have both a higher EV and a larger standard deviation than Bet A?",
    predictions: [{ id: "both", label: "Yes, average and spread describe different things" }, { id: "safe", label: "No, higher EV guarantees smaller spread" }, { id: "loss", label: "No, EV is the chance of losing" }], correctPrediction: "both",
    action: "Choose Higher EV, Wider Swings in the toolbar.",
    explanation: "What do the comparison values tell you?",
    explanations: [{ id: "different", label: "Bet B has a higher average payoff and larger per-round spread; it can still lose on any round." }, { id: "guarantee", label: "Bet B’s higher EV guarantees a win on the next round." }, { id: "chance", label: "Standard deviation is the probability of a loss." }], correctExplanation: "different",
    retry: "EV is in dollars per round; SD is also in dollars. The loss chance is a separate percentage.",
    takeaway: "Bet A’s EV is $18; Bet B’s is $22.96. Bet B’s SD is larger and its loss chance is 72%. Here SD measures spread, one aspect of risk; it is not a guarantee or a complete decision rule.",
  },
  {
    title: "Cross the break-even point", baseline: "trap", targetPreset: "trap", targetProbability: 0.15, rounds: 60,
    question: "Bad Long Shot gives Bet B a $210 win, −$36 loss and 12% win chance. Raise its win chance to 15%. Does its EV cross zero?",
    predictions: [{ id: "positive", label: "Yes, it becomes positive" }, { id: "negative", label: "No, the loss keeps it negative" }, { id: "always", label: "It was already positive because the prize is large" }], correctPrediction: "positive",
    action: "Set Bet B win probability (%) to 15. Leave its payoffs at $210 and −$36.",
    explanation: "Why is the sign positive at 15%?",
    explanations: [{ id: "threshold", label: "15% is above the break-even probability, 36 / (210 + 36) ≈ 14.6%." }, { id: "majority", label: "A positive EV means most rounds are wins." }, { id: "prize", label: "Any positive prize guarantees a positive EV." }], correctExplanation: "threshold",
    retry: "Solve p × 210 + (1 − p) × (−36) = 0. Positive EV does not require winning most rounds.",
    takeaway: "EV moves from −$6.48 to +$0.90. Break-even is the win probability that makes the weighted payoff zero; the loss chance is still 85% at 15% wins.",
  },
  {
    title: "Compare a sample with its target", baseline: "steady", targetPreset: "steady", rounds: 120,
    question: "Extend the Steady vs Swingy sample from 60 to 120 rounds. Must its average equal EV exactly?",
    predictions: [{ id: "no", label: "No, a finite sample can differ from EV" }, { id: "exact", label: "Yes, 120 rounds guarantee exact agreement" }, { id: "changes", label: "The model’s EV changes with sample length" }], correctPrediction: "no",
    action: "Choose 120 rounds below Running average.",
    explanation: "Why can the solid sample line differ from the dotted EV line?",
    explanations: [{ id: "frequency", label: "This sample’s win frequency can differ from p; EV uses model probabilities." }, { id: "wrong", label: "Any mismatch proves the EV formula is wrong." }, { id: "closer", label: "Every added round is guaranteed to move the average closer to EV." }], correctExplanation: "frequency",
    retry: "Compare the sample’s win count with its model win probability. More independent repeats support long-run convergence, not exact or monotonic agreement.",
    takeaway: "The repeatable sample uses the same first 60 outcomes when extended to 120. The model’s probabilities and EV stay fixed. Under independent repeats with unchanged probabilities, the sample average approaches EV in the long run; a particular extension can move away from it.",
  },
];
export const payoffTutorPlan = {
  intro: "Four predict–try–explain experiments connect weighted payoffs, spread, break-even and finite samples, followed by a transfer check.",
  whyItMatters: "An expectation summarizes uncertain numerical outcomes, while per-round spread and loss probability reveal different parts of the uncertainty.",
  openingMessage: "You need fractions, complementary probabilities, a mean and standard deviation. The fictional bets have net payoffs: a win adds money and a loss subtracts it. A random variable is the numerical payoff of one uncertain round. Expected value (EV) is its probability-weighted average, not the next guaranteed payoff. Standard deviation (SD) measures per-round spread in dollars, not the chance of loss. Break-even is the win probability giving EV zero.\n\nThe toolbar has Steady vs Swingy, Higher EV, Wider Swings and Bad Long Shot. Bet A and Bet B each have three sliders and exact number editors. Press Enter or leave a number field to apply it. The bars show outcome probabilities, the arithmetic weights both payoffs, and the comparison table separates EV, SD, loss chance and break-even. Running average offers 24, 60 and 120 rounds of one seeded pseudorandom sample per bet. Payoff changes keep its win/loss sequence; changing sample length keeps the shared prefix. This illustrates independent fixed-probability repeats without guaranteeing exact or monotonic convergence. Optional round tables provide every numerical sample outcome.\n\nChoosing a prediction restores the experiment’s starting preset and 60 rounds. Reset restarts the current experiment. Start by predicting the effect of raising Bet B win amount ($) from 125 to150 in Steady vs Swingy, then edit that one value and explain. Follow Next experiment through four experiments and Try the transfer check. Free exploration preserves all three presets and the original parameter ranges.",
  masteryCriteria: ["Weights every payoff by its probability.", "Separates EV, per-round SD and loss chance.", "Explains the EV sign using break-even probability.", "Distinguishes model expectation from a finite sample and rejects monotonic-convergence promises.", "Transfers weighted-payoff reasoning to a changed long-shot probability."],
  steps: payoffExperiments.map((experiment, index) => ({ title: experiment.title, experiment: `Choose a prediction to restore ${experiment.baseline === "trap" ? "Bad Long Shot" : "Steady vs Swingy"} and 60 rounds. ${experiment.action} Explain, then use ${index === 3 ? "Try the transfer check" : "Next experiment"}.`, predictionQuestion: experiment.question, observationPrompt: experiment.explanation, takeaway: experiment.takeaway })),
};
