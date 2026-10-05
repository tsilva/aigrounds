import { experimentChoices as choices } from "@/lib/experiment-choices";
export const scalingExperiments = [
  {
    title: "Units change numerical influence",
    question: "Multiply feature B’s units by 10 while keeping Raw. What happens to its P1/P4 squared-difference term?",
    predictions: choices("It becomes 100 times larger.", "It stays fixed because the cases are the same.", "The data gains 100 times more information."),
    action: "Keep Different units and Raw. Set Feature B unit multiplier to 10. Compare raw B values and the two squared-difference terms.",
    explanation: "Why did the numerical contribution change?",
    explanations: choices(
      "B’s P1/P4 difference grows from 300 to 3000, so its squared term grows from 90000 to 9000000. A’s term stays 9. Total squared distance changes from 90009 to 9000009; the total is not exactly 100 times larger because A is unchanged. Case identities, ordering and information stay fixed; only B’s units change.",
      "The feature multiplier changes A and B equally, leaving their raw contributions fixed.",
      "A larger raw distance proves feature B is more informative or predicts better.",
    ),
    retry: "Square the changed numerical difference. A positive unit change preserves case order but changes the magnitude of raw numbers. These bars describe this equal-number-weight distance, not learned feature importance or a physical mixed-unit distance.",
    takeaway: "Raw numerical weighting can depend on the units you choose. A distance change alone is not new information or improved model performance; the task must justify how feature differences should count.",
  },
  {
    title: "Cancel a positive unit multiplier",
    question: "Apply Min–max to the two columns at multiplier 10. Must B’s large raw numbers still dominate this endpoint comparison?",
    predictions: choices("No. Each nonconstant reference column maps its minimum to 0 and maximum to 1.", "Yes. Large raw numbers must dominate after any transformation.", "Min–max makes every distribution normal."),
    action: "Keep Different units and Feature B unit multiplier 10. Choose Min–max under Scaling method. Inspect Output A and Output B for all four cases.",
    explanation: "What did min–max scaling preserve and change?",
    explanations: choices(
      "A uses (x − 1)/3; B uses (x − 1000)/3000. Outputs are A [0, 1/3, 2/3, 1], B [0, 1/6, 5/6, 1]. P1/P4 squared terms are 1 and 1, total 2. Re-expressing B’s units and recomputing the same reference statistics cancels the positive multiplier. Case identity and within-column order stay fixed, but raw units and numerical distances change.",
      "Min–max divides each row by its length and forces identical A and B distributions.",
      "All unseen values are guaranteed to remain in 0..1, and equal endpoint terms prove equal feature importance.",
    ),
    retry: "Subtract each column’s own reference minimum and divide by its own nonzero reference range. This is per-feature min–max normalization, not per-row unit-length normalization. The 0..1 claim is about these reference rows; unseen values outside the fitted range can fall outside it.",
    takeaway: "Per-feature rescaling can remove a positive unit factor without adding information or equalizing distribution shape. Equal endpoint contributions are a result of this chosen pair and recipe, not a general importance or accuracy guarantee.",
  },
  {
    title: "Standardize without erasing shape",
    question: "Outlier starts with A [1,2,3,20] under Min–max. If you choose Z-score, does mean 0 and standard deviation 1 make the outlier disappear or the distribution normal?",
    predictions: choices("No. It centers and rescales the column; relative ordering and the unusual extreme remain.", "Yes. Standardization creates a normal distribution and removes outliers.", "Z-score always constrains every output to 0..1."),
    action: "Keep Outlier and Feature B unit multiplier 1. Choose Z-score under Scaling method. Compare the output values with their column mean and population SD.",
    explanation: "What do the standardized values establish?",
    explanations: choices(
      "Reference A mean is 6.5 and population SD sqrt(61.25) ≈ 7.826238; B mean is 250 and SD sqrt(16250) ≈ 127.475488. Both nonconstant output columns have mean 0 and population SD 1. A’s outputs are approximately [−0.702764, −0.574989, −0.447214, 1.724967], so the extreme case remains. Z-scores may be negative or exceed 1; no normality or accuracy claim follows.",
      "Mean 0 and SD 1 prove Gaussian data; P4 is no longer an outlier.",
      "Population SD uses three as its divisor here, and a constant feature must also attain SD 1.",
    ),
    retry: "Z = (x − reference mean)/reference population SD. The SD here divides the sum of squared deviations by four, not three. Center and scale do not change the basic distribution shape or remove cases. Constant columns are a separate zero-scale boundary.",
    takeaway: "Min–max controls the observed reference range; z-score controls reference center and spread for nonconstant columns. Both depend on reference statistics and can be affected by outliers. Neither changes the data into a normal distribution or guarantees a good task-specific distance.",
  },
];

export const scalingTutorPlan = {
  intro: "Three experiments trace raw unit sensitivity, min–max normalization and z-score standardization. A constant-feature transfer checks the zero-scale exception.",
  whyItMatters: "Features with different numeric units can contribute very differently to a distance or objective. Scaling changes the numerical representation using a declared column recipe, without adding information or guaranteeing model quality.",
  openingMessage: "Prerequisites: feature columns, means, ranges, population standard deviations, fractions and squared differences. A feature column holds one numeric measurement for each case. This toy transforms two columns of four fixed reference cases P1..P4. Different units uses A [1,2,3,4]; Outlier uses A [1,2,3,20]; Constant feature uses A [2,2,2,2]. Base B is [100,150,350,400] in every scenario. Feature B unit multiplier, a native integer slider/number editor from 1 to 10, multiplies every B value equally. Positive changes of units preserve case identity/order and do not add information. Scenario changes preserve Scaling method and multiplier.\n\nScaling method has Raw, Min–max and Z-score. Raw preserves the current numeric values. Min–max means per-feature normalization here: subtract the column’s reference minimum and divide by its reference max−min. Each nonconstant reference column maps to 0..1; this does not make all unseen values stay in that range. This is not per-row unit-norm normalization. Z-score standardization subtracts the column’s reference mean and divides by its reference population SD. The population variance is the sum of squared deviations divided by four (ddof=0), not three. Each nonconstant reference output column has mean 0 and SD 1, without changing its ordering or making its distribution Gaussian.\n\nIf a column’s range or SD is zero, use denominator 1 after subtracting the minimum or mean. Its observed constant values map to 0; their output SD remains 0, because variation cannot be created by scaling. The formula’s raw zero denominator would otherwise be undefined; this explicit convention matches constant-feature handling. Claims about min–max bounds and z-score SD 1 apply to nonconstant reference columns. Other/unseen values are not implemented. Reference statistics use only the displayed four rows and are recomputed after scenario or unit changes; the same recipe applies to all four cases. Real evaluation pipelines must fit preprocessing on appropriate training data and reuse it for held-out inputs, rather than learning their statistics from test data.\n\nThe primary table retains Case, Raw A, Raw B, Output A and Output B. Scaling applies to columns, not rows. The exact Feature B unit multiplier editor is below it. Squared differences between P1 and P4 use distance² = (output A4 − output A1)² + (output B4 − output B1)². This is equal numerical weighting of the two feature differences, not a physically meaningful mixed-unit distance, feature importance, learned weights or model performance. The A and B bars show exact fractions of the current squared distance on a common 0..100% axis; tiny contributions are not visually inflated. Text gives each squared term and share. Output means/SDs and the total follow; optional Reference statistics and recipes retains min, max, range, mean, population SD and the used center/denominator for each column.\n\nExperiment 1 starts Different units, Raw, multiplier 1: P1/P4 terms A 9 and B 90000, total 90009. Set multiplier 10: B difference 3000, term 9000000, A still 9, total 9000009. Only B’s term is exactly 100 times larger; the total is not, since A is fixed. No case or information was added.\n\nExperiment 2 starts Different units, Raw, multiplier 10. Choose Min–max: A recipe (x−1)/3, B recipe (x−1000)/3000; outputs A [0,1/3,2/3,1], B [0,1/6,5/6,1]. Endpoint terms become 1 and 1, total 2. Recomputing reference statistics in different positive B units cancels that multiplier. The two columns still have different distributions; equal endpoint differences are not a general feature-importance statement.\n\nExperiment 3 starts Outlier, Min–max, multiplier 1. A’s first three outputs are 0,1/19,2/19: the high reference maximum compresses the other values. Choose Z-score. A mean is 6.5, SD sqrt(61.25)=7.826238; B mean 250, SD sqrt(16250)=127.475488. A outputs [−.702764,−.574989,−.447214,1.724967], B [−1.176697,−.784465,.784465,1.176697]. Both nonconstant output columns have mean 0 and population SD 1; the high A case remains. P1/P4 squared terms are approximately 5.893878 and 5.538462, total 11.432339. Neither method removes outliers, equalizes every pairwise distance or creates normally distributed data.\n\nParameter/method/scenario edits clear stale explanation and transfer completion. Changing prediction restores that experiment’s baseline; Reset restores the current step, or Experiment 1 from free exploration. The constant-feature transfer uses another unit multiplier; do not reveal its numeric B outputs or total distance before the learner tries it. Scope is a finite column-scaling toy; no model training/accuracy evaluation, arbitrary point/probe editing, robust/quantile scaling, row normalization or future guarantees are implemented.",
  masteryCriteria: [
    "Traces raw unit changes to squared numerical contributions without new information.",
    "Reconstructs column-specific min–max recipes and positive unit cancellation.",
    "Distinguishes z-score center/spread from normality, bounds and outlier removal.",
    "Handles a constant feature and transfers without a universal accuracy or importance claim.",
  ],
  steps: scalingExperiments.map(e => ({ title: e.title, experiment: e.action, predictionQuestion: e.question, observationPrompt: e.explanation, takeaway: e.takeaway })),
};
