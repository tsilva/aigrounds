export type FitState = { scenario: string; degree: number; noise: number };
export const fitDefaults: FitState = { scenario: "balanced", degree: 4, noise: .34 };
export const fitExperiments = [
  {
    title: "More shape, better fit", baseline: { ...fitDefaults, degree: 1 }, target: fitDefaults,
    question: "In Balanced Split at Noise amplitude 0.34, raise Polynomial degree from 1 to 4. What happens to training and held-out MSE?",
    predictions: [{ id: "both", label: "Both fall" }, { id: "train", label: "Only training MSE falls" }, { id: "rise", label: "Both rise" }], correctPrediction: "both",
    action: "Set Polynomial degree to 4. Press Enter to apply the exact edit.",
    explanation: "Why do both errors improve in this comparison?",
    explanations: [{ id: "shape", label: "Degree 1 misses the curved pattern. Degree 4 follows it better on both the training and held-out points." }, { id: "test", label: "The held-out points were added to the fitting data." }, { id: "universal", label: "Every increase in degree always improves both errors." }], correctExplanation: "shape",
    retry: "Only training circles determine the fitted curve. Compare the curve shape and the two errors before claiming that more complexity always helps.",
    takeaway: "Training MSE falls from about 0.20037 to 0.07891; held-out MSE from 0.11187 to 0.00665. Here a straight line underfits the curved pattern, while degree 4 captures more of it.",
  },
  {
    title: "Fit familiar points, miss new ones", baseline: fitDefaults, target: { ...fitDefaults, degree: 10 },
    question: "At Noise amplitude 0.34, raise Polynomial degree from 4 to 10. Can training MSE fall while held-out MSE rises?",
    predictions: [{ id: "yes", label: "Yes, the two errors can move apart" }, { id: "no", label: "No, the errors must move together" }, { id: "degree", label: "Degree alone tells us which curve generalizes best" }], correctPrediction: "yes",
    action: "Set Polynomial degree to 10. Keep Noise amplitude at 0.34.",
    explanation: "Which evidence supports overfitting in this comparison?",
    explanations: [{ id: "diverge", label: "Training MSE falls to about 0.04300, while held-out MSE rises to 0.07228. Extra flexibility fits training-specific noise and hurts these unseen points." }, { id: "threshold", label: "Every degree of 10 or higher must overfit regardless of its errors." }, { id: "gap", label: "Any positive gap proves the model memorized every training point exactly." }], correctExplanation: "diverge",
    retry: "Compare against degree 4 at the same noise, not a universal degree threshold or a gap alone. Training error improves while held-out error worsens; training error is not zero.",
    takeaway: "The more flexible fit lowers training error but increases error on these held-out points. This comparison is evidence of overfitting; neither degree nor the sign of the gap alone is a diagnosis.",
  },
  {
    title: "Remove noise, challenge the rule", baseline: { ...fitDefaults, degree: 10 }, target: { ...fitDefaults, degree: 10, noise: 0 },
    question: "Keep Polynomial degree at 10 and reduce Noise amplitude from 0.34 to 0. Does high degree alone guarantee poor held-out predictions?",
    predictions: [{ id: "no", label: "No, the evidence depends on the data" }, { id: "always", label: "Yes, degree 10 is always overfit" }, { id: "zero", label: "No noise guarantees exactly zero error for every degree" }], correctPrediction: "no",
    action: "Set Noise amplitude to 0. Keep Polynomial degree at 10.",
    explanation: "What changes when the noisy deviations disappear?",
    explanations: [{ id: "signal", label: "Both errors become tiny at degree 10; the points now follow the same smooth signal. High degree is not automatically poor, and a polynomial approximation need not have exactly zero error." }, { id: "testfit", label: "Noise zero lets the model secretly train on held-out points." }, { id: "degree", label: "The fitted polynomial became degree 1 even though the control still says 10." }], correctExplanation: "signal",
    retry: "The degree and fitting split stay fixed. Noise changes observed y values in both splits. Read tiny positive errors without rounding them to a claim of exact zero.",
    takeaway: "With this noiseless data, degree 10 predicts the held-out points very accurately. Complexity can help or hurt depending on data and fitting constraints; compare errors instead of applying a preset label.",
  },
];
export const fitTutorPlan = {
  intro: "Three predict–try–explain experiments compare simple, flexible and noise-free fits; a sparse-data transfer check tests the same reasoning.",
  whyItMatters: "A model can fit familiar examples while predicting new ones poorly. Comparing errors on points withheld from fitting exposes that tradeoff.",
  openingMessage: "You need to read an x/y plot and compare squared prediction errors; no polynomial fitting algebra is required. A polynomial is a curve formed from powers of x. Polynomial degree 1 is a straight line; larger degree permits more flexible shapes, but does not by itself prove overfitting. The training circles determine the fitted curve. Held-out squares are never used to fit its coefficients. MSE (mean squared error) is the average of (observed y − predicted y)², in squared y units. Lower is better on the split being measured. Overfitting evidence here is training error improving while held-out error worsens relative to a simpler fit on the same data. A positive gap alone is not proof; a negative gap can occur.\n\nBalanced Split, Sparse Training and Low Noise use fixed illustrative x positions and different fixed noise patterns in each split. Noise amplitude (0–0.45, steps 0.01) scales those deviations from the common smooth signal; changing degree keeps all points fixed. Polynomial degree ranges 1–12. Both have native sliders and exact editors: press Enter or leave the field to apply. A fixed tiny coefficient penalty keeps fits unique, even when there are fewer training points than coefficients; it does not change with degree. The fitted curve, circle/square data and dashed signal share a y scale fixed across all degrees for the current scenario/noise. The scale may change when scenario or noise changes. The loss-by-degree chart compares every degree on these exact same points; its complete numeric table and all point predictions are optional. Small nonzero errors use scientific notation, not a false zero.\n\nChoosing a prediction restores the current experiment’s baseline. Reset restarts it. Start with Balanced Split, noise 0.34: predict what raising degree 1 to 4 does to both errors, then edit, compare and explain. Next raise degree 4 to 10; finally remove noise at degree 10. The transfer check asks you to choose Sparse Training and degree 10 with noise 0.34 and compare degree 4. These fixed splits illustrate mechanisms, not an unbiased estimate of future error. In real work choose complexity using validation data and reserve an untouched test set for final evaluation; repeatedly selecting on test error leaks evaluation information.",
  masteryCriteria: ["Identifies which points determine the fit and which measure held-out error.", "Explains underfitting by a missing pattern and overfitting by a controlled train/held-out comparison.", "Does not equate high degree, a positive gap or a wiggly curve alone with overfitting.", "Explains the noise-zero counterexample without claiming exact zero error.", "Transfers the comparison to sparse data and distinguishes illustrative held-out exploration from final test evaluation."],
  steps: fitExperiments.map((experiment,index)=>({title:experiment.title,experiment:`Choose a prediction to restore the baseline. ${experiment.action} Explain, then use ${index===2?"Try the transfer check":"Next experiment"}.`,predictionQuestion:experiment.question,observationPrompt:experiment.explanation,takeaway:experiment.takeaway})),
};
