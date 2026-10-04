const choices = (...labels: string[]) => labels.map((label, i) => ({ id: String(i), label }));

export const prExperiments = [
  {
    title: "Find the prevalence effect",
    question: "Keep threshold 0.55 and the class score distributions fixed. What happens when every negative score has four copies?",
    predictions: choices("Precision falls; recall stays fixed.", "Both precision and recall must fall.", "Changing the class balance retrains the model."),
    action: "Keep Mostly ordered and Decision threshold 0.55. Set Negative copies per score to 4. Compare counts, precision, recall and the full PR curve.",
    explanation: "Why did precision change?",
    explanations: choices(
      "Six positives stay fixed while negatives rise from 6 to 24. TP stays 5; FP rises from 1 to 4. Precision falls from 5/6 = 83.3% to 5/9 = 55.6%, while recall stays 5/6 = 83.3%. Prevalence falls from 50% to 20%; each class’s score frequencies stay fixed. AP changes from 0.794444 to 0.537037.",
      "Recall uses all 30 cases, so recall is now 5/30.",
      "Lower precision proves the scores were refitted or are no longer calibrated.",
    ),
    retry: "Precision divides TP by predicted positives, TP + FP. Recall divides TP by six actual positives. Uniform negative copies add false positives at this cutoff while preserving the same positive scores and within-class frequencies.",
    takeaway: "Precision and PR summaries depend on class balance as well as score ordering. Compare them in a relevant evaluation population. These illustrative copies isolate a mechanism; they are not new independent observations or evidence about future performance.",
  },
  {
    title: "Move a point; keep the curve",
    question: "At four negative copies per score, lower threshold 0.55 to 0.40. Does finding every positive force average precision to become 1?",
    predictions: choices("No. Recall reaches 1, but the fixed score sweep and AP stay unchanged.", "Yes. Recall 1 means every accepted prediction is correct.", "AP always equals the current threshold’s precision."),
    action: "Keep Mostly ordered and Negative copies per score 4. Set Decision threshold to 0.40. Inspect the diamond and the AP rectangles.",
    explanation: "What changed, and what stayed fixed?",
    explanations: choices(
      "TP 6 and FP 12 give recall 6/6 = 100% and precision 6/18 = 33.3%. The point moved from recall 83.3%, precision 55.6%. Scores and class balance stayed fixed, so AP stays 29/54 ≈ 0.537037. AP sums recall increases × each score group’s precision, not the current point’s precision or trapezoidal area.",
      "Recall 100% removes false positives and makes AP 1.",
      "The shaded area is ROC AUC and uses trapezoids between these PR points.",
    ),
    retry: "Recall counts found actual positives; false positives can remain. Average precision (AP) summarizes the entire grouped score sweep with rectangular recall weights. Moving one cutoff does not change its scores or class balance. AP and linearly interpolated PR area are different conventions.",
    takeaway: "A threshold selects an operating point; non-interpolated average precision summarizes a full curve. Step segments are accounting for AP, not additional attainable hard-threshold outcomes or an automatic optimal cutoff.",
  },
  {
    title: "Precision can rise too",
    question: "With four negative copies per score, lower threshold 0.80 to 0.70. Must precision fall whenever recall rises?",
    predictions: choices("No. This next group can add positives without adding negatives.", "Yes. Precision is always decreasing as the threshold falls.", "Equal-score cases can be separated by arbitrary cutoffs."),
    action: "Keep Mostly ordered and Negative copies per score 4. Set Decision threshold to 0.70. Use the score-group table to see which cases entered together.",
    explanation: "Why did both precision and recall rise?",
    explanations: choices(
      "At 0.80, TP 2 and FP 4 give precision 2/6 = 33.3%, recall 2/6 = 33.3%. At 0.70, the tied positive pair P3 and P4 enters together: TP 4 and FP 4, precision 4/8 = 50%, recall 4/6 = 66.7%. No negative score lies at 0.70. Recall cannot fall as the cutoff lowers, but precision can rise, fall or stay fixed. AP stays unchanged.",
      "The precision increase violates the definition of a PR curve.",
      "The threshold randomly chose one member of the tied positive pair.",
    ),
    retry: "Count the newly accepted group, including ties. More true positives with no extra false positives can raise precision. Recall uses a fixed actual-positive denominator; precision’s numerator and denominator can both change. Do not replace the exact curve with a necessarily descending template.",
    takeaway: "PR curves need not be monotone in precision. Equal scores enter together; the exact grouped curve and optional table expose the mechanism. Neither AP nor a score gives calibrated probabilities, task costs or guaranteed future performance.",
  },
];

export const prTutorPlan = {
  intro: "Three experiments isolate prevalence, separate a cutoff from AP, and challenge a monotone-precision assumption. A tied-score transfer uses a different class balance.",
  whyItMatters: "Rare positives can leave many accepted predictions false even when recall is high. Precision-recall curves retain that denominator and expose class-balance effects.",
  openingMessage: "Prerequisites: binary actual/predicted labels, TP/FP/FN counts, precision, recall and fractions. Precision = TP/(TP + FP), the true positives among predicted positives; recall = TP/(TP + FN), the fraction of actual positives found. Prevalence means actual positives divided by all cases. This toy has six positive cases P1..P6, with scores [.90,.80,.70,.70,.60,.40], and six negative score types [.80,.50,.40,.30,.20,.10]. Negative copies per score, an integer 1..4 slider/number editor, creates the same number of labelled copies of every negative score: N1.1..N6.4 as applicable. Total negatives are 6 × copies; positives remain six. Copies are illustrative class-balance accounting, not new independent observations. Their within-class score frequencies stay fixed, so changing copies preserves recall at every cutoff. It can change precision, the PR curve and AP.\n\nMostly ordered uses those fixed scores. Reversed uses 1 − each score with the same labels/copy rule. All tied assigns score .50 to every case. These are ranking signals, not calibrated probabilities or a trained model. Decision threshold ranges 0..1 in .05 steps; score ≥ threshold predicts Positive, including equality. Native number and slider controls have keyboard equivalents. Scenario changes preserve copies and threshold. Parameter or scenario edits clear stale explanation/transfer completion. Changing the experiment prediction restores that step’s baseline; Reset restarts the current step or Experiment 1 from free exploration.\n\nThe chart uses Recall horizontally and Precision vertically, both fixed 0..1. Circles are outcomes at each distinct score in descending order, grouping equal scores together. The hollow diamond is the current operating point only when at least one case is predicted positive. If no case is predicted positive, precision is undefined (0/0): the summary shows —, recall is 0, and there is no selected diamond. The open square at recall 0, precision 1 is a drawing convention with no threshold, not the actual precision of zero accepted cases. Threshold plateaus can preserve one point without being a dead control. AP steps also do not make every intermediate point a separate hard-threshold decision.\n\nAverage precision (AP) is defined here by summing (current recall − previous recall) × current group precision over descending score groups, starting with previous recall 0. Each pale rectangle has that recall-width and current-group precision-height; vertical moves add zero area. This non-interpolated convention differs from trapezoidal PR area and from ROC AUC. Threshold-dependent precision is not whole-curve AP. AP is unchanged by threshold edits within a fixed score/copy dataset. Changing class balance or the ranking can change AP. The dashed prevalence line is precision when all cases are predicted positive. It is a useful reference, not a statement that every finite random ranking has AP exactly equal to prevalence. With all scores tied, the single group has recall 1 and precision prevalence, so AP equals prevalence exactly in this toy.\n\nExperiment 1 starts Mostly ordered, copies 1, threshold .55: TP 5, FP 1, FN 1, TN 5, precision 5/6, recall 5/6, prevalence .5, AP 143/180 = .794444. Set Negative copies per score to 4: TP 5, FP 4, FN 1, TN 20, precision 5/9 = 55.6%, recall 5/6 = 83.3%, prevalence .2, AP 29/54 = .537037. No fit or class-specific score distribution changed.\n\nExperiment 2 starts Mostly ordered, copies 4, threshold .55. Set Decision threshold to .40: TP 6, FP 12, FN 0, TN 12, recall 1, precision 1/3. The full curve and AP 29/54 stay fixed. Recall 1 does not eliminate false positives or choose a best cutoff.\n\nExperiment 3 starts Mostly ordered, copies 4, threshold .80: TP 2, FP 4, precision 1/3, recall 1/3. Lower to .70: P3 and P4 enter together, with no added negatives, so TP 4, FP 4, precision .5, recall 2/3. Precision rose while recall rose; PR curves need not decrease monotonically in precision. AP remains unchanged. As cutoff lowers, recall cannot fall with these fixed actual labels; precision can rise, fall or stay flat.\n\nOptional Cases and decisions retains every identity, score, label, prediction and confusion category. Score groups and AP retains each threshold’s counts, exact ratio values, recall increase and AP term. Construction and limits gives the recipe and sources. Scope: finite unweighted binary class-balance toy with both actual classes present; no training, score calibration, ROC plot, automatic optimal threshold, uncertainty, real independent sampling or guarantees about a deployment population. Preserve the transfer challenge: guide concepts but do not reveal its numeric rates or AP before the learner tries the requested tied-score state.",
  masteryCriteria: [
    "Explains prevalence effects while preserving within-class score frequencies.",
    "Uses distinct precision and recall denominators.",
    "Separates cutoff precision from non-interpolated AP and handles undefined precision.",
    "Transfers to tied scores at a new class balance without arbitrary within-tie decisions or future guarantees.",
  ],
  steps: prExperiments.map(e => ({ title: e.title, experiment: e.action, predictionQuestion: e.question, observationPrompt: e.explanation, takeaway: e.takeaway })),
};
