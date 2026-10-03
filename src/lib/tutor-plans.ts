import { biasTutorPlan } from "@/modules/sampling-bias/learning-experiments";
import { samplingTutorPlan } from "@/modules/sampling-sample-size/learning-experiments";
import { normalTutorPlan } from "@/modules/normal-distribution-z-scores/learning-experiments";
import { areaTutorPlan } from "@/modules/pdf-cdf-probability-area/learning-experiments";
import { llnTutorPlan } from "@/modules/law-large-numbers-simulation/learning-experiments";
import { mctsTutorPlan } from "@/modules/monte-carlo-tree-search/learning-experiments";
import { atlasTutorPlan } from "@/modules/ai-concept-atlas/learning-experiments";
import { proofTutorPlan } from "@/modules/zero-knowledge-proofs/learning-experiments";
import { autogradTutorPlan } from "@/modules/autograd-graphs/learning-experiments";
import { mnistTutorPlan } from "@/modules/mnist-mlp-inference-debugger/learning-experiments";
import { layerTutorPlan } from "@/modules/layer-normalization/learning-experiments";
import { quantizationTutorPlan } from "@/modules/linear-quantization-int4/learning-experiments";
import { attentionTutorPlan } from "@/modules/transformer-attention/learning-experiments";
import { bpeTutorPlan } from "@/modules/byte-pair-encoding/learning-experiments";
import { tensorTutorPlan } from "@/modules/tensor-shape-broadcasting/learning-experiments";
import { gradientTutorPlan } from "@/modules/gradient-descent/learning-experiments";
import { klTutorPlan } from "@/modules/kl-divergence/learning-experiments";
import { lossTutorPlan } from "@/modules/categorical-cross-entropy/learning-experiments";
import { softmaxTutorPlan } from "@/modules/softmax-temperature/learning-experiments";
import { thresholdTutorPlan } from "@/modules/confusion-matrix-thresholds/learning-experiments";
import { fitTutorPlan } from "@/modules/overfitting/learning-experiments";
import { arrivalTutorPlan } from "@/modules/waiting-arrival-distributions/learning-experiments";
import { distributionTutorPlan } from "@/modules/bernoulli-categorical-binomial/learning-experiments";
import { payoffTutorPlan } from "@/modules/expected-value-risk/learning-experiments";
import { bayesTutorPlan } from "@/modules/bayes-rule/learning-experiments";
import { conditionalTutorPlan } from "@/modules/conditional-probability/learning-experiments";
import { probabilityTutorPlan } from "@/modules/probability-rules/learning-experiments";

export type TutorStep = {
  title: string;
  experiment: string;
  predictionQuestion: string;
  observationPrompt: string;
  takeaway: string;
};

export type TutorPlan = {
  intro: string;
  whyItMatters: string;
  openingMessage?: string;
  masteryCriteria?: string[];
  steps: TutorStep[];
};

export function getTutorOpeningMessage(plan: TutorPlan) {
  const motivation = ["Why this exists:", plan.whyItMatters].join("\n\n");

  if (plan.openingMessage) {
    return [motivation, plan.openingMessage].join("\n\n");
  }

  const firstStep = plan.steps[0];

  return [
    motivation,
    plan.intro,
    firstStep
      ? `First prediction: ${firstStep.predictionQuestion} Reply with your prediction first. Then I will tell you exactly what to try.`
      : "Reply with what you want to understand first, and I will guide one small experiment at a time.",
  ].join("\n\n");
}

export const playgroundTutorPlans = {
  "mean-median-mode": {
    intro:
      "Work through three small experiments. Predict first, change the data, observe the summaries, then explain which measure of typical stayed useful.",
    whyItMatters:
      "Typical values exist because raw lists are hard to compare at a glance. Mean, median, and mode give compact center summaries, and choosing the right one helps avoid being fooled by repeats or outliers.",
    openingMessage:
      "No prior statistics knowledge needed. The Guided experiment walks you through predict, try, and explain. You can use it independently or talk through your reasoning here.\n\n- Mean is the average: add all values, then divide by how many values there are.\n- Median is the middle value after sorting the data.\n- Mode is the most common value. A dataset can have no mode, one mode, or more than one mode.\n- Outliers are far-away values that can pull some summaries more than others.\n\nStart with Balanced. First prediction: if you move I from 66 to 90, which summary values will change? Reply with your prediction first, or share the prediction you already chose in the Guided experiment.",
    masteryCriteria: [
      "Defines mean as the average that uses every value.",
      "Defines median as the middle after sorting the values.",
      "Defines mode as the most common value and recognizes when repeats matter.",
      "Explains why mean and median often agree in a balanced dataset.",
      "Explains why an outlier pulls the mean more than the median.",
      "Chooses an appropriate typical-value summary for balanced, repeated, and outlier-heavy datasets.",
    ],
    steps: [
      {
        title: "Compare one calm center",
        experiment:
          "Choose Balanced if it is not already selected. Compare the mean and median in Live summaries. In Guided experiment, choose a prediction, then move point I from 66 to 90 using its dot or Point I value field. Watch the summary marker lanes and the outlined middle in Sorted values.",
        predictionQuestion:
          "In Balanced, if you move I from 66 to 90, which summary values will change?",
        observationPrompt:
          "How did the mean and median compare before and after point I moved to 90?",
        takeaway:
          "The original Balanced dataset has equal mean and median. Moving I changes the sum and mean, while the fifth sorted value and median stay at 42.",
      },
      {
        title: "Create a mode",
        experiment:
          "Choose Repeated Peak. Predict what happens if A joins 24, then move point A to 24 using its dot or Point A value field. Compare Sorted values with the Mode summary and its occurrence count.",
        predictionQuestion:
          "In Repeated Peak, if A joins the group at 24, what happens to the mode?",
        observationPrompt:
          "Did the mode's value change, or did its occurrence count change when A joined 24?",
        takeaway:
          "Mode is about frequency, not balance or position, so repeats can make it the clearest typical value.",
      },
      {
        title: "Pull with an outlier",
        experiment:
          "Choose Add Outlier. In Guided experiment, choose a prediction, then move point I from 92 to 28 using its dot or Point I value field. Watch the Mean, Median, and Mode marker lanes and Live summaries. Explain the result before trying another dataset.",
        predictionQuestion:
          "In Add Outlier, if you move I from 92 to 28, which summary values will change?",
        observationPrompt:
          "Which summary changed when I moved from 92 to 28, and why did the other two stay at 24?",
        takeaway:
          "The mean uses every value and gets pulled by extremes; the median uses sorted position and is more resistant.",
      },
    ],
  },
  "range-quartiles-iqr": {
    intro:
      "Predict, move one value, and explain the change in range and IQR. Follow the three on-page experiments or discuss them here.",
    whyItMatters:
      "A center value does not tell you how scattered the data is. Range measures the full span; IQR measures the span between the two quartiles, so the two can react differently to the same change.",
    openingMessage:
      "You need only number order, subtraction, and averaging two numbers. The on-page experiments work independently of this chat.\n\nRange is maximum minus minimum. The median is the fifth sorted value in this nine-value lesson. To find quartiles, exclude the median: Q1 averages the middle two values of the lower half; Q3 averages the middle two of the upper half. IQR means interquartile range: Q3 minus Q1. The box spans Q1 to Q3, with the median marked inside. This lesson's whiskers show min and max. Other quartile and whisker conventions exist.\n\nChoose Experiment, then Reset to begin Move an edge. Before moving I from 58 to 92, predict which measure changes: only range, only IQR, both, or neither. Choose your prediction on the page, or tell me your reasoning here.",
    masteryCriteria: [
      "Computes range as maximum minus minimum and connects it to the full span.",
      "Finds Q1 and Q3 from the middle pairs of the sorted halves, excluding the overall median.",
      "Computes IQR as Q3 minus Q1 and connects it to the box width.",
      "Explains why moving the largest value farther outward can change range while preserving IQR.",
      "Predicts and explains IQR changes when a quartile contributor moves or sorted positions change.",
    ],
    steps: [
      {
        title: "Move an edge",
        experiment:
          "Choose Experiment and Reset if starting over. In Move an edge, choose a prediction; this restores the starting values. Move only I from 58 to 92 using its dot, arrow keys, or Point I value. Compare the Range and IQR before/now calculations and the outlined pairs in Sorted values. Choose an explanation, then press Check explanation.",
        predictionQuestion:
          "If I moves from 58 to 92, which spread measure will change?",
        observationPrompt:
          "What changed in range? Did either outlined quartile pair change? Explain before proceeding.",
        takeaway:
          "Range grows from 40 to 74. IQR stays at 20 because Q1 remains 26 and Q3 remains 46. This outward move leaves their contributing pairs unchanged.",
      },
      {
        title: "Move a quartile",
        experiment:
          "After explaining the first experiment, press Next: Move a quartile. Choose a prediction, then move only H from 48 to 68 using its dot or Point H value. Read Q3's calculation in Sorted values and compare Range with IQR. Choose an explanation and press Check explanation.",
        predictionQuestion:
          "If H moves from 48 to 68 while I stays at 92, which spread measure will change?",
        observationPrompt:
          "How did H change Q3? Why did the range stay at 74?",
        takeaway:
          "Q3 changes from (44 + 48) / 2 = 46 to (44 + 68) / 2 = 56. IQR grows from 20 to 30; range stays at 74 because the extremes are unchanged.",
      },
      {
        title: "Try new data",
        experiment:
          "After explaining Move a quartile, press Next: Try new data. Inspect the new values. Choose a prediction, then move only I from 88 to 30 using its dot or Point I value. Find its new position in Sorted values, identify the new maximum and the new upper-half pair, choose an explanation, and press Check explanation. Wide Middle and Outlier are optional free-exploration presets; Return to experiment restores the current exercise.",
        predictionQuestion:
          "In this new dataset, I moves from 88 to 30, into the middle. Which spread measure will change?",
        observationPrompt:
          "Which point became the maximum? Which two values now determine Q3? Why did IQR change this time?",
        takeaway:
          "H at 44 becomes the maximum. Q3 changes from (40 + 44) / 2 = 42 to (36 + 40) / 2 = 38. Range falls from 78 to 34 and IQR from 20 to 16. Resistance to extremes does not mean IQR never changes.",
      },
    ],
  },
  "variance-standard-deviation": {
    intro:
      "Work through three spread experiments. Predict how distances from the mean behave, then connect deviations, variance, and standard deviation.",
    whyItMatters:
      "Variance and standard deviation exist because we often need one number for how far values usually sit from the mean. They are useful for judging consistency, comparing noise, and seeing when two datasets with the same average behave very differently.",
    openingMessage:
      "No prior statistics knowledge needed. We will build the ideas by predicting, trying one small experiment, and explaining what changed.\n\n- The mean is the average and marks the center of this lab.\n- A deviation is a value's distance from the mean. Negative means left of the mean; positive means right of it.\n- Squared deviation turns each distance positive and makes far-away values count much more.\n- Variance averages the squared deviations. Standard deviation takes the square root, so it is back in the original units.\n\nFirst prediction: if most points sit near the mean, what should happen to variance and standard deviation? Reply with your prediction first. Then I will tell you exactly what to try.",
    masteryCriteria: [
      "Defines deviation as distance from the mean, including direction before squaring.",
      "Explains that small deviations make small squared deviations.",
      "Explains that squaring makes far-away values count much more.",
      "Connects variance to the average of squared deviations.",
      "Connects standard deviation to a typical distance from the mean in original units.",
      "Recognizes that standard deviation can change while the mean stays fixed.",
    ],
    steps: [
      {
        title: "Start with short deviations",
        experiment:
          "Choose Tight. Look at the Distances from the mean table, its Deviation and Squared columns, and the Variance and Standard deviation summaries.",
        predictionQuestion:
          "If most points sit near the mean, what should happen to variance and standard deviation?",
        observationPrompt:
          "What did the short deviation bars do to the squared terms?",
        takeaway:
          "Small distances from the mean produce small squared deviations, so both variance and standard deviation stay low.",
      },
      {
        title: "Spread the same mean",
        experiment:
          "Choose Balanced, then Wide. Notice that the mean stays at 50 while the points spread.",
        predictionQuestion:
          "Can standard deviation change even when the mean stays the same?",
        observationPrompt:
          "What changed when the center stayed fixed but points moved away?",
        takeaway:
          "Standard deviation measures typical distance from the mean, so it can change even when the mean does not.",
      },
      {
        title: "Watch squaring amplify edges",
        experiment:
          "Choose Wide, then move A below 10 or G above 90. Change only that point. Use the Point A value or Point G value field, or focus a dot and use arrow keys. Compare its Deviation and Squared entries in Distances from the mean.",
        predictionQuestion:
          "What should squaring do to a point that is very far from the mean?",
        observationPrompt:
          "Which point or card dominated the variance calculation?",
        takeaway:
          "Squaring makes large deviations count much more, which is why far-away values can dominate variance.",
      },
    ],
  },
  "transformer-attention": attentionTutorPlan,
  "byte-pair-encoding": bpeTutorPlan,
  "shape-skew-outliers": {
    intro: "Four experiments and a transfer check compare shape and summaries while moving only point M.",
    whyItMatters: "A center or spread number can hide tails, gaps and groups. Seeing the distribution helps choose evidence for the question instead of treating one statistic as the whole story.",
    openingMessage: "You need averages, sorted middles and subtraction. A histogram groups values into intervals; skew names the direction of a sparse tail. IQR is Q3 minus Q1, the spread of the middle half. Robust means less sensitive to extreme points, not unchanging.\n\nThere are 12 fixed points and one movable point M. Choose a rail prediction to restore the experiment’s start, move M with its dot or Point M value, then explain. Reset restarts the current experiment. Start comparisons always use the same 13 points.\n\nExperiment 1 starts at Right Skew with M = 94. Predict what changes when M moves to 100 before trying it. Share your prediction here or in the rail.",
    masteryCriteria: [
      "Reads skew direction from the tail rather than the main pile or a mean cutoff.",
      "Explains why moving within one histogram bin can leave counts unchanged.",
      "Compares mean/range sensitivity with median/IQR without claiming invariance.",
      "Uses histogram and exact values to identify groups and gaps hidden by a center or box.",
      "Distinguishes a movable point from an outlier flag and chooses evidence for a new point.",
    ],
    steps: [
      {
        title: "Follow a tail",
        experiment: "In Right Skew, choose a prediction and move Point M value from 94 to 100. Compare the last histogram bin and M on the number line.",
        predictionQuestion: "What changes when M moves from 94 to 100?",
        observationPrompt: "Did the bin count change? Which exact endpoint moved?",
        takeaway: "The high-value endpoint extends but the 90–100 bin still contains one point. Skew refers to the tail direction; bins hide movement within their interval.",
      },
      {
        title: "Stretch one edge",
        experiment: "Choose Balanced or Next experiment. Predict, then move M from 50 to 100. Compare all four Start values and changes in Live shape summaries.",
        predictionQuestion: "Which pair changes more here: mean/range or median/IQR?",
        observationPrompt: "What changed in the extremes, sum and middle sorted positions?",
        takeaway: "Mean uses every value and range uses extremes. Median and IQR follow middle positions and can change less without being fixed.",
      },
      {
        title: "Read the other direction",
        experiment: "In Left Skew, predict then move M from 6 to 0. Locate the main high-value pile and the sparse low-value tail.",
        predictionQuestion: "Which direction does the tail extend?",
        observationPrompt: "Where are most values and where does the sparse tail reach?",
        takeaway: "The left tail reaches toward small values. The mean–median gap alone cannot prove shape.",
      },
      {
        title: "Find what a center hides",
        experiment: "In Two Clusters, predict then move M from 96 to 50. Compare the histogram and sorted values with the center and box. Then use Try the transfer check and set M to 60.",
        predictionQuestion: "Does placing one point in the gap merge the two groups?",
        observationPrompt: "How many points remain below 40 and above 60? What evidence would you report for M = 60?",
        takeaway: "The two groups remain. A center or box cannot reveal every gap. Report shape alongside appropriate center and spread. The optional screening rule flags values beyond 1.5 IQR fences for investigation; the displayed whiskers span min to max, not Tukey fences.",
      },
    ],
  },
  "categorical-cross-entropy": lossTutorPlan,
  "kl-divergence": klTutorPlan,
  "probability-rules": probabilityTutorPlan,
  "conditional-probability": conditionalTutorPlan,
  "bayes-rule": bayesTutorPlan,
  "softmax-temperature": softmaxTutorPlan,
  "gradient-descent": gradientTutorPlan,
  "expected-value-risk": payoffTutorPlan,
  "law-large-numbers-simulation": llnTutorPlan,
  "pdf-cdf-probability-area": areaTutorPlan,
  "normal-distribution-z-scores": normalTutorPlan,
  "sampling-bias": biasTutorPlan,
  "sampling-sample-size": samplingTutorPlan,
  "bernoulli-categorical-binomial": distributionTutorPlan,
  "waiting-arrival-distributions": arrivalTutorPlan,
  "monte-carlo-tree-search": mctsTutorPlan,
  "confusion-matrix-thresholds": thresholdTutorPlan,
  overfitting: fitTutorPlan,
  "matrix-multiplication": {
    intro:
      "Work through three matrix multiplication experiments. Predict which shapes work, pick one output cell, then connect every product cell to a row-column dot product.",
    whyItMatters:
      "Matrix multiplication exists because many linear transformations can be expressed as rows meeting columns. It is useful because neural networks, graphics, statistics, and data pipelines all rely on this compact way to combine many numbers at once.",
    openingMessage:
      "No prior linear algebra knowledge needed. We will build matrix multiplication by predicting, trying one small output cell, and explaining the pattern.\n\n- Matrix shape is rows x columns.\n- A product A x B works only when A's columns match B's rows.\n- Each output cell C[i,j] comes from row i of A dotted with column j of B.\n- The shared inner dimension tells how many multiply-add terms each output cell uses.\n- The other shape presets are optional practice after the guide.\n\nFirst prediction: for a 2 x 2 matrix times a 2 x 3 matrix, what shape should the output have? Choose a prediction in the experiment rail, or discuss it here. The rail checks your actions and explanation before offering the next experiment.",
    masteryCriteria: [
      "Reads matrix shape as rows x columns.",
      "Explains why A columns must match B rows before multiplication is possible.",
      "Computes one output cell as a row-column dot product.",
      "Connects the shared inner dimension to the number of multiply-add terms.",
      "Predicts the output shape (m x p) from (m x n) times (n x p).",
    ],
    steps: [
      {
        title: "Check the shapes",
        experiment:
          "In Check the shapes, choose a prediction in the rail. Then choose 2x2 x 2x3 in the scenario toolbar. Compare Your matrices, Output shape, Terms per cell, and the Incompatible example below the formulas. Choose an explanation and use Check explanation.",
        predictionQuestion:
          "For a 2 x 2 matrix times a 2 x 3 matrix, what shape should the output have?",
        observationPrompt:
          "What matched, what did the output shape keep from A and B, and why is the Incompatible example blocked?",
        takeaway:
          "In (m x n) times (n x p), the two n values must match and the output shape is m x p.",
      },
      {
        title: "Build one cell",
        experiment:
          "In Build one cell, choose a prediction in the rail. Use 2x2 x 2x3. Select C[1,2] in C, then select k = 1 and k = 2 in Build C[1,2]. Watch each product and the running sum. Choose an explanation and use Check explanation.",
        predictionQuestion:
          "Which values should multiply together for C[1,2]: a row with a column, two rows, or two columns?",
        observationPrompt:
          "How did k move through the highlighted row and column?",
        takeaway:
          "One output cell pairs values from a row of A and a column of B, multiplies each pair, then adds the products.",
      },
      {
        title: "Repeat across C",
        experiment:
          "In Repeat across C, choose a prediction in the rail. Use 2x2 x 2x3. Under Every output cell follows the same rule, select the C[1,2] formula and then C[2,1]. Compare the formulas and the A row/B column labels above. Choose an explanation and use Check explanation. After Lesson explained, use Try another shape: predict the output shape and term count for 3x2 x 2x1, then select C[3,1] and reveal both terms.",
        predictionQuestion:
          "What should change when you move from C[1,2] to C[2,1]?",
        observationPrompt:
          "Which part of the dot product changed for each output cell?",
        takeaway:
          "Every C cell repeats the same rule with a different row i and column j.",
      },
    ],
  },
  "linear-quantization-int4": quantizationTutorPlan,
  "zero-knowledge-proofs": proofTutorPlan,
  "batch-normalization": {
    intro: "Five Predict → Try → Explain experiments follow one scalar feature across examples, normalization, manual Scale/Shift, outlier dependence and frozen inference; then a near-transfer check.",
    whyItMatters: "BatchNorm gives a network a normalized feature plus learnable scale/shift. This lab isolates the forward mechanics and batch dependence; it does not prove optimization speed or accuracy gains.",
    openingMessage: "A mini-batch is a group of examples processed together; an activation is a numeric signal. This lab follows one feature across 4–8 examples. Training uses that batch’s mean and population variance (average squared deviation, divided by N). z=(x−mean)/√(variance+0.001); y=Scale×z+Shift. Scale/Shift are manually chosen here, though a network can learn gamma/beta. Inference represents tracked running statistics: its explicit illustrative mean/variance are frozen per preset; no moving averages or optimizer run. Epsilon makes Training std(z) slightly less than1, and Inference need not center an arriving batch. Real BatchNorm without tracked statistics is a separate configuration.\n\nThe page starts Shifted, Training, Batch size6, Scale1, Shift0. First predict: when Batch size becomes8, does normalized mean stay nearzero while examples remain distinct, become positive, or do all examples becomezero? Reply with your prediction first; then I’ll give the exact action.",
    masteryCriteria: ["Explains centering with current batch population variance and epsilon-sensitive spread.", "Substitutes a selected activation and interprets its signed distance from the used mean.", "Separates Scale and Shift through general output mean/std identities.", "Explains why adding an outlier changes its batchmates during Training.", "Distinguishes frozen tracked inference statistics and unchanged existing outputs from changes in aggregate statistics."],
    steps: [
      { title: "Center without flattening", experiment: "Start in Shifted, Training, Batch size 6, Scale 1, Shift 0 and Example 1. Choose a prediction in the rail, then set Batch size to 8. Read Input x and Normalized z means and standard deviations.", predictionQuestion: "All inputs are positive; after including eight examples, will normalized mean stay near zero, become positive, or will all examples become zero?", observationPrompt: "Which mean and variance were used, and did examples stay distinct?", takeaway: "Training uses current batch mean and population variance. Subtracting the mean centers across examples; epsilon .001 makes nonconstant normalized std slightly less than 1." },
      { title: "Follow one signed distance", experiment: "Next experiment starts Centered, Batch size 6, Scale 1, Shift 0, Training. Predict first, then choose Example 5 in Selected activation. Read Follow example 5.", predictionQuestion: "Example 5 is 0.2, above mean −0.3. What sign should z have?", observationPrompt: "Explain the displayed numerator, positive denominator and resulting z about .901425.", takeaway: "The sign comes from x minus the used mean. The denominator is √(variance+epsilon), and Scale/Shift act afterward." },
      { title: "Separate spread from center", experiment: "Next experiment starts Wide, Batch size 8, Training, Scale .5, Shift −1. Choose a prediction. Set Scale to 2 and Shift to 1 in either order. Read x/z/y means and stds.", predictionQuestion: "Which control multiplies spread, and which translates outputs?", observationPrompt: "Which columns stayed unchanged, and what happened to output mean and standard deviation?", takeaway: "std(y)=|Scale|×std(z) and mean(y)=Scale×mean(z)+Shift. Training has mean(z)=0. Parameters are manually set here; no optimizer runs." },
      { title: "An outlier changes its batchmates", experiment: "Next experiment starts Outlier, Batch size 7, Training, Scale 1, Shift 0 and Example 1. Predict first, then set Batch size to 8 to include 6.2. Read the same x=.1 calculation and active reference.", predictionQuestion: "Can unchanged example 1 get a different normalized value after including an outlier?", observationPrompt: "Which raw value stayed fixed, and which shared statistics changed?", takeaway: "Training compares each example with its batchmates; changing the shared mean and variance changes existing normalized values. N selects a fixed prefix, not random sampling." },
      { title: "Use a frozen reference", experiment: "Next experiment starts Outlier, Batch size 8, Training. Predict first, then choose Inference. Read Used mean/variance, z mean and optional Per-example exact values and both references.", predictionQuestion: "Must the arriving batch have normalized mean zero in Inference?", observationPrompt: "Compare current mean1.3125 with frozen1.05 and reference variance3.4225; why is mean(z) about .142?", takeaway: "With tracked running statistics, evaluation uses a frozen reference and still applies Scale/Shift. Current batch mean need not match it. Presets are illustrative frozen estimates, not simulated training history. Transfer check: in Outlier Inference, increase Batch size7→8 while holding Scale1.5, Shift−.5 and Example1: existing z/y stay fixed although aggregate statistics can change." },
    ],
  },
  "layer-normalization": layerTutorPlan,
  "mnist-mlp-inference-debugger": mnistTutorPlan,
  "backpropagation-inspector": {
    intro:
      "Inspect one sigmoid output layer through four Predict → Try → Explain experiments. Compare local gradients, flip only the target, scale a previewed step, and follow signals to cached hidden activations. The visual computation sits above its equivalent matrix form so learners can compare the same values.",
    whyItMatters:
      "Backprop computes how sensitive loss is to each parameter. Gradient descent separately turns those sensitivities into weight changes. Keeping these jobs distinct makes neural-network training easier to reason about.",
    openingMessage:
      "We need weighted sums, probabilities, and loss; no calculus derivation is required. A gradient tells us how loss responds to a tiny increase. h1 and h2 are outputs cached from an earlier layer. This lesson uses a sigmoid probability and unweighted binary cross entropy, so the output gradient is p − y. Bias and cached activations stay fixed during each update preview. The visual view and matrix view are stacked for the same single example. Matrix shapes and notation are explained beside the calculations; compare matching entries as you go.\n\nUse Underprediction, or Reset if you have edited the case. Before selecting Backward, predict: h1 is 0.80 and h2 is 0.35. Which output weight should have the larger absolute gradient? Give your prediction and reason first.",
    masteryCriteria: [
      "Uses dL/dw = h × (p − y) to compare the two weight gradients for the same example.",
      "Explains that p − y is specific to this sigmoid and binary-cross-entropy combination, not every loss.",
      "Connects target 0, positive gradients, negative weight changes, and lower probability/loss in the fixed example.",
      "Distinguishes unchanged starting gradients from learning-rate-scaled weight changes; a new pass after updating weights generally has new gradients.",
      "Distinguishes dL/dh = w × (p − y) from output-weight gradients and earlier-weight updates.",
      "Connects individual gradient values to their matching entries in the matrix form.",
    ],
    steps: [
      {
        title: "Which gradient is larger?",
        experiment:
          "Choose Underprediction. Record a prediction in the rail and select Reveal gradients, or select Backward after predicting. Compare the weight-gradient entries and their absolute sizes. The scalar formulas show h1 × (p − y) and h2 × (p − y); the matrix form directly below shows ∇W L = δ × hᵀ with the same two entries. Do not reveal the explanation before the learner tries.",
        predictionQuestion:
          "h1 is 0.80 and h2 is 0.35. Which weight will have the larger absolute gradient?",
        observationPrompt:
          "Report both gradients and identify the local multiplier in each formula.",
        takeaway:
          "Each activation multiplies the same output gradient p − y. With the same error, the larger nonnegative activation produces a larger absolute weight gradient.",
      },
      {
        title: "Flip only the target",
        experiment:
          "Use Next experiment or choose False alarm. The activations and starting weights are unchanged, but y is now 0. Record a prediction and select Preview update. Compare Gradient and Change in the table with ∇W L and ΔW directly below, then probability/loss before and after one step.",
        predictionQuestion:
          "Should a gradient-descent step raise or lower both weights when y changes to 0?",
        observationPrompt:
          "Explain the gradient and change signs, including why the negative weight also moves down.",
        takeaway:
          "p − y is positive and the activations are positive, so both weight gradients are positive. Subtracting them lowers both weights and lowers probability and loss for this example.",
      },
      {
        title: "Gradient or step size?",
        experiment:
          "Use Next experiment from Flip only the target; the starting learning rate is 0.10. Predict, then select Set learning rate to 0.50, or use Exact learning rate. Compare the Gradient column and Change at η = 0.10 / 0.50; the matrix form directly below shows the same comparison as ∇W L and the two ΔW rows. Each preview starts from the same original weights, not the preceding preview.",
        predictionQuestion:
          "When η goes from 0.10 to 0.50, do the starting gradients or the weight changes become five times larger?",
        observationPrompt:
          "Which values stayed fixed? Which values scaled, and why?",
        takeaway:
          "Backprop computes gradients at the starting state; η scales the optimizer step. Recomputing after a real update generally gives new gradients. This example does not prove larger rates always improve training.",
      },
      {
        title: "Two kinds of gradients",
        experiment:
          "Use Next experiment or choose Equal activations. Predict the hidden-signal signs, then select Reveal hidden signals. Compare the equal output-weight gradients with dL/dh1 and dL/dh2 in How gradients reach the hidden layer; the matrix form directly below shows those as ∇W L = δ × hᵀ and ∇h L = Wᵀ × δ. For near transfer, Explore freely and set Hidden activation h1 to 0; inspect its weight gradient and explain it.",
        predictionQuestion:
          "With equal activations but opposite signed output weights, do the two hidden-activation signals have the same or opposite signs?",
        observationPrompt:
          "Explain why weight gradients are equal while hidden-activation signals differ, and why dL/dh is not an earlier-weight update.",
        takeaway:
          "Output-weight gradients use h × (p − y); hidden-activation signals use w × (p − y). Reaching an earlier weight requires its layer’s local derivatives. With h1 = 0, the output weight 1 gradient is zero for this example.",
      },
    ],
  },
  "pytorch-image-augmentations": {
    "intro": "Five prediction \u2192 try \u2192 explanation experiments and a near-transfer check connect probability, sequential image transforms, tensor types, predefined policies and target assumptions.",
    "whyItMatters": "Augmentation encodes what a training task should ignore. Tracing sampled pixels and valid input types helps distinguish configuration from a draw and retained targets from semantic guarantees.",
    "openingMessage": "No PyTorch background is needed. Pixels have three RGB channel bytes; a one-hot target has a 1 for one selected class. The entire photo is first resized to RGB 224\u00d7224, which can change its aspect ratio. This is a browser simulation, not Python execution: its seed, geometry/interpolation and byte rounding differ from torchvision/PIL. Python configuration uses the torchvision v1 API and its own random draws.\n\nThe rail has five experiments. Choose a prediction to restore starting settings, perform the named action, press Run pipeline, then explain. Reset restarts the current experiment. New draw advances the browser seed; Run pipeline repeats it. Only enabled stages run. ToTensor and RandomErasing have fixed final positions to preserve their types.\n\nStart with cat, HorizontalFlip and ToTensor, probability 0, seed 1. First prediction: changing Flip probability to 1, will the whole image mirror, only half the pixels mirror, or the target change? Share your prediction before trying it.",
    "masteryCriteria": [
        "Explains a configured probability/range versus a sampled outcome.",
        "Uses ordered crop/flip evidence without confusing a changed random sample with order.",
        "Explains ToTensor HWC bytes to CHW float byte/255 and RandomErasing input type.",
        "Distinguishes fixed RandAugment magnitude from sampled TrivialAugmentWide strength and avoids learned-policy claims.",
        "Separates a retained one-hot target from task-dependent semantic validity."
    ],
    "steps": [
        {
            "title": "A chance is not a strength",
            "experiment": "Choose a prediction in Experiment 1: cat, only HorizontalFlip and ToTensor, Flip probability 0, Replay seed 1. Set Flip probability to 1, then Run pipeline. Read the sampled HorizontalFlip row.",
            "predictionQuestion": "Does the whole image mirror, only half its pixels, or its target change?",
            "observationPrompt": "What does the draw-versus-p comparison decide?",
            "takeaway": "A probability determines whether a whole transform applies. At 1 it always applies and at 0 it never applies. At 0.5 a run is all-or-none, not half of its pixels; a small set need not contain exactly half flips."
        },
        {
            "title": "The next block receives the result",
            "experiment": "Next experiment restores cat with crop minimum area 0.5, HorizontalFlip probability 1, ToTensor and seed 1. Choose a prediction; use Move HorizontalFlip up once, then Run pipeline. Compare Starting result with Current composed result and the sampled-stage order.",
            "predictionQuestion": "Must reversing this off-center crop and mirror give the same pixels?",
            "observationPrompt": "Which source region is selected when mirroring happens before rather than after cropping?",
            "takeaway": "Compose passes each output onward. Here order changes selected source pixels; some symmetric cases can coincide. Browser operation-keyed draws preserve the crop sample for causal comparison, unlike the separate Python RNG stream."
        },
        {
            "title": "An image is not yet a tensor",
            "experiment": "Next experiment restores sneaker, RandomErasing only, Replay seed 2. Choose a prediction and read the type error. Enable ToTensor then Run pipeline. Read ToTensor and RandomErasing rows; optionally expand One pixel and tensor indexing.",
            "predictionQuestion": "Is a torchvision v1 RandomErasing pipeline without ToTensor valid on a PIL input?",
            "observationPrompt": "What representation did conversion produce, and did this specific erasing draw apply?",
            "takeaway": "RandomErasing requires a tensor. ToTensor converts RGB uint8 HWC to float32 CHW [3,224,224], dividing bytes by 255, without recoloring the display or changing targets. Seed 2 erasing applies, but p=0.35 does not guarantee future application. Black value 0 is used after tensor conversion."
        },
        {
            "title": "A policy can be predefined",
            "experiment": "Next experiment restores leaf, RandAugment and ToTensor, Number of operations 2, Magnitude index 0, Replay seed 14. Choose a prediction, set Magnitude index to 30, then Run pipeline. Read the Rotate and Posterize samples.",
            "predictionQuestion": "Must the operation names change when this fixed magnitude index rises?",
            "observationPrompt": "Which units differ between the two operations, and is a policy trained here?",
            "takeaway": "Same browser draw names remain Rotate and Posterize; magnitudes change from 0 degrees/8 retained bits to 30 degrees/4 bits. RandAugment samples with replacement from 14 predefined operations and uses a fixed magnitude bin; names may repeat. TrivialAugmentWide samples one name and one wider random bin. Neither learns here. Index 0 is not always identity because AutoContrast and Equalize do not vary with magnitude."
        },
        {
            "title": "Retained is not guaranteed valid",
            "experiment": "Next experiment restores stop sign, VerticalFlip and ToTensor, probability 0, seed 1. Choose a prediction, set Flip probability to 1, then Run pipeline. Compare the upside-down result with Retained target.",
            "predictionQuestion": "Will the demo keep [0,0,1,0] and does that guarantee augmentation validity?",
            "observationPrompt": "Who retains the target, and what determines whether an upside-down sign is a suitable example?",
            "takeaway": "The caller mechanically retains class 2. Single-image transforms do not infer a new class or guarantee semantic validity. Suitability depends on the task; one-hot means one selected class, not model confidence or certainty the transformation is valid."
        },
        {
            "title": "Same assumption, a different photo",
            "experiment": "Try the transfer check restores leaf with VerticalFlip probability 0 and ToTensor. Without Guide help, predict, set Flip probability to 1, Run pipeline, then explain in the rail.",
            "predictionQuestion": "Must an upside-down leaf change the target?",
            "observationPrompt": "What remains in the target vector and what would a leaf-recognition task have to assume?",
            "takeaway": "The target stays [0,0,0,1]. Whether the transformed example preserves relevant species features depends on the task, not on the unchanged vector. No label mixing or training occurs here."
        }
    ]
},
  "convolution-filter-lab": {
    intro:
      "Use five prediction → try → explanation experiments, then a border-response transfer check. The image window, exact products, and selected output are linked.",
    whyItMatters:
      "Image models reuse a small grid of weights across local neighborhoods. Tracing one weighted sum reveals what a filter detects and why stride and boundary assumptions matter.",
    openingMessage:
      "You only need addition, signed multiplication, and averages; no computer-vision background. A kernel is a small grid of weights. An output map contains one weighted sum per image window. Rows and columns count from 0.\n\nThe rail has five experiments and a transfer check. Choose a prediction there to restore its starting settings, try the named control, then explain the result. Reset restarts the current experiment. You can explore any image or filter at any time.\n\nStart with Experiment 1, Ramp, Edge, Stride 1, Zero padding 1, y[1,1]. First prediction: switching to Blur, what will y[1,1] become: 2, 6, or 18? Share your prediction before trying it.",
    masteryCriteria: [
      "Calculates one output by multiplying matching patch and kernel positions and adding all nine products.",
      "Maps a selected output cell to its image window and explains that moving reuses fixed weights.",
      "Compares Edge column differences, Blur averaging, and Sharpen local contrast without assuming outputs stay in the image range.",
      "Explains stride as window step and uses floor((5 + 2p - 3) / s) + 1 to predict output dimensions.",
      "Explains zero padding as an outside-image assumption and identifies a border-created negative Edge response.",
    ],
    steps: [
      {
        title: "One patch, one number",
        experiment:
          "In Experiment 1 choose a prediction, which restores Ramp, Edge, Stride 1, Zero padding 1, Output row 1 and Output column 1. Select Blur. Inspect Image patch, Kernel weights, Products, Row sums, and Selected sum. Answer the rail explanation before Next experiment.",
        predictionQuestion:
          "Switching to Blur on the three rows of 1, 2, 3, what will y[1,1] become: 2, 6, or 18?",
        observationPrompt:
          "How do the nine exact Products and Row sums produce the selected output?",
        takeaway:
          "Blur weights each value by 1/9; the patch total is 18 and the output is 2. The center happens to equal this average, but all nine values contribute. Products are elementwise, not matrix multiplication.",
      },
      {
        title: "Same weights, new patch",
        experiment:
          "Use Next experiment and choose a prediction in Experiment 2. Use Move window right once or set Output column to 2. Keep Ramp, Blur, Stride 1, Zero padding 1 and Output row 1. Compare the patch and weights.",
        predictionQuestion:
          "Moving one output cell right, does the patch change, do the weights change, or do both change?",
        observationPrompt:
          "What changed in Image patch and Kernel weights as the selected output moved from y[1,1] to y[1,2]?",
        takeaway:
          "The patch rows change from 1,2,3 to 2,3,4 and the Blur output becomes 3. The same weights are reused. The complete output map is computed immediately; selection inspects a calculation, not a visit/completion state.",
      },
      {
        title: "Choose the local question",
        experiment:
          "Use Next experiment and choose a prediction in Experiment 3. This restores Single spot, Blur, Stride 1, Zero padding 1, Output row 2 and Output column 2. Select Sharpen, leaving the position unchanged. Compare the center product and Selected sum.",
        predictionQuestion:
          "For a center pixel of 9 with zero neighbors, will Sharpen output 45, 9, or 1?",
        observationPrompt:
          "What is the center product, and which neighbor products contribute?",
        takeaway:
          "Sharpen gives 9×5=45 while Blur gives 9/9=1 on this patch. Edge compares the right and left columns. Outputs can exceed the input range or be negative. These are fixed demonstration filters; changing filters does not train or replace the image.",
      },
      {
        title: "Skip window positions",
        experiment:
          "Use Next experiment and choose a prediction in Experiment 4. Set Stride to 2; keep Ramp, Edge and Zero padding 1. Read Output size and inspect the highlighted window. Use Output row and Output column or arrow keys on an output cell to inspect other sampled positions.",
        predictionQuestion:
          "Keeping zero padding at 1, does Stride 2 produce a 3×3, 5×5, or 2×2 output?",
        observationPrompt:
          "What start positions can a 3×3 window use on the 7×7 padded image when stepping by two?",
        takeaway:
          "Positions 0,2,4 fit, producing 3×3. Stride samples fewer windows without resizing the image or averaging output cells. The dimension formula assumes this 5×5 image, fixed 3×3 kernel and no dilation.",
      },
      {
        title: "Give borders a neighborhood",
        experiment:
          "Use Next experiment and choose a prediction in Experiment 5. This restores Ramp, Blur, Stride 1, Zero padding 0 and y[0,0]. Set Zero padding to 1. Compare padded-image and output sizes and trace the new top-left patch.",
        predictionQuestion:
          "With Stride 1, does adding one ring of zero padding make the output 5×5, 3×3, or 7×7?",
        observationPrompt:
          "Which zeros are padding, and what do their products contribute to the new y[0,0]?",
        takeaway:
          "The input becomes 7×7 and output becomes 5×5. The new top-left patch has six padded zeros and Blur output 2/3. The same output index now covers a different image window. Padding enables border-centered windows, assumes zero outside the image, and can affect responses; it does not recover true missing pixels.",
      },
      {
        title: "A border can look like an edge",
        experiment:
          "Use Try the transfer check and choose a prediction. The start is Step edge, Edge, Stride 1, Zero padding 1, Output row 2 and Output column 3. Use Move window right once. Trace Products at y[2,4], then explain in the rail. Restart experiments is available after the explanation succeeds.",
        predictionQuestion:
          "Moving right from a flat patch of fives into the padded border, will Edge output a negative value, zero, or a positive value?",
        observationPrompt:
          "Why did a flat part of the original image give a negative response?",
        takeaway:
          "The patch has rows of 5, 5, 0. The right-column sum of 0 minus the left-column sum of 15 gives −15. Padding created the apparent drop; negative responses are valid. The layer uses displayed weights without flipping, the cross-correlation convention used in CNNs; one input channel, no bias or activation.",
      },
    ],
  },
  "label-mixing-image-transforms": {
    "intro": "Five prediction \u2192 try \u2192 explanation experiments and transfer connect paired pixel construction, actual CutMix area, class targets and numeric fixed-model loss.",
    "whyItMatters": "Mixing inputs requires a matching target rule. Measuring real patch area and tracing weighted loss prevents confusion between requested coefficients, semantic content and model probabilities.",
    "openingMessage": "You need RGB pixels, class labels and weighted averages; no PyTorch knowledge. A one-hot target has one selected class. A soft target can distribute training weight across classes. Natural-log cross-entropy measures how much fixed predictions disagree with that target.\n\nFour full photos are each resized to224\u00d7224, which can change aspect ratio. MixUp blends every corresponding channel. CutMix copies a donor rectangle at the same coordinates, then weights labels by actual area after integer rounding and clipping. The browser rounds display bytes; controlled Python uses float32. Random torchvision v2 augmentation uses batches and a sampled coefficient, separate from this fixed pair. No model is run or trained.\n\nChoose a rail prediction to restore starting settings, perform its named action, then explain; Reset restarts the current experiment. The Source A/B selects can choose the same photo to test same-class addition. Sample patch appears only in CutMix and advances a browser center seed.\n\nFirst experiment: cat A, stop sign B, MixUp, Requested A fraction 0.20. Prediction: raising it to 0.80, which class gains target weight: cat, stop sign, or neither? Share a prediction before moving the control.",
    "masteryCriteria": [
        "Uses the same effective coefficient for pixel construction and weighted targets.",
        "Distinguishes copied donor coordinates from resizing a donor or full-image blending.",
        "Recomputes actual CutMix label weights after integer rounding and clipping.",
        "Explains numeric weighted negative-log loss for fixed predictions and separates predictions from targets.",
        "Explains same-class contributions adding to one entry and transfers to a new class."
    ],
    "steps": [
        {
            "title": "Weight both source labels",
            "experiment": "Choose a prediction in Experiment 1: Source A cat, Source B stop sign, MixUp, Requested A fraction 0.20. Set Requested A fraction to 0.80. Read class weights, Mixed target vector and mixed image.",
            "predictionQuestion": "Which target class gets more weight when A\u2019s coefficient rises?",
            "observationPrompt": "What changes in both corresponding RGB pixels and the target entries?",
            "takeaway": "MixUp blends every corresponding RGB channel and labels with w and 1\u2212w. Cat\u2019s target grows 0.20\u21920.80, stop sign shrinks 0.80\u21920.20. These are training target weights, not fixed model probabilities or semantic-object fractions."
        },
        {
            "title": "A patch is not an opacity",
            "experiment": "Next experiment and choose a prediction. Source A cat, Source B stop sign, MixUp, Requested A fraction 0.36. Select CutMix with Patch placement Centered. Compare prepared source outlines, exact rectangle and Effective A weight.",
            "predictionQuestion": "Does CutMix blend everywhere, shrink the whole donor photo, or copy a same-coordinate region?",
            "observationPrompt": "What is the actual copied area and why is the label coefficient different from 0.36?",
            "takeaway": "Half-size floor(0.5\u00b7sqrt(1\u22120.36)\u00b7224)=89. Centered box [23,201)\u00d7[23,201) has178\u00d7178=31684 pixels, so effectiveA=1\u221231684/50176=0.368543. CutMix copies exactly that region from B at the same coordinates. Both modes use the same weighted-target formula, but effective coefficients can differ for the same requested slider value."
        },
        {
            "title": "Measure what survives the border",
            "experiment": "Next experiment and choose a prediction. Keep CutMix, requested 0.36 and centered patch. Set Patch placement to At top-left border. Read copied pixel area and Effective A weight.",
            "predictionQuestion": "When the patch center moves to the top-left border, should A\u2019s weight increase, decrease or remain0.36?",
            "observationPrompt": "Which proposed pixels are outside the image, and what remains?",
            "takeaway": "Clipping keeps x/y[0,89), only7921 pixels. Bweight=7921/50176=.157864; Aweight=.842136, versus centered.368543. Labels use actual area after integer rounding/clipping. Geometry does not infer how much recognizable class evidence survives."
        },
        {
            "title": "The loss sees class probabilities",
            "experiment": "Next experiment and choose a prediction. MixUp requested 0.75, catA and stop signB. Set Source A to sneaker. Read Weighted A loss, Weighted B loss and Mixed loss under the fixed p=[.60,.10,.20,.10].",
            "predictionQuestion": "Does moving A\u2019s target weight from cat probability.60 to sneaker probability.10 raise or lower this fixed-model loss?",
            "observationPrompt": "Which negative-log term changed, and did the model update?",
            "takeaway": "Loss rises.785479\u21922.129298 nats because .75 multiplies\u2212ln(.10) rather than\u2212ln(.60); .25\u00d7\u2212ln(.20) stays unchanged. Both terms use the same prediction on the mixed example, not separately inferred unmixed predictions. No model is run/trained. Target weights differ from prediction probabilities."
        },
        {
            "title": "Two sources can share one class",
            "experiment": "Next experiment and choose a prediction. MixUp requested 0.62, catA and stop signB. Set Source B to cat. This duplicates the same selected photo. Read source targets, Mixed target vector and fixed loss.",
            "predictionQuestion": "Must every two-source mixture create two positive target classes?",
            "observationPrompt": "Where do the two contributions go when the class index matches?",
            "takeaway": "Both weights add at class0: .62+.38=1, giving[1,0,0,0] and loss\u2212ln(.60)=.510826. Same-class mixing can remain one-hot. Duplicate photo pixels are unchanged too. Soft targets are not model uncertainty or a semantic-validity guarantee."
        },
        {
            "title": "A new class, the same addition",
            "experiment": "Try the transfer check starts duplicate leaf A/B, MixUp, Requested A fraction0.25. Predict without Guide help, change to0.75 and explain in the rail.",
            "predictionQuestion": "Must the target or fixed loss change when both contributions belong to leaf?",
            "observationPrompt": "Which entry stays1, and which model probability remains fixed?",
            "takeaway": "Target remains[0,0,0,1], duplicate pixels unchanged, loss\u2212ln(.10)=2.302585 at either coefficient. Leaf is one class regardless of having two source slots; weights are not model confidence."
        }
    ]
},
  "autograd-graphs": autogradTutorPlan,
  "tensor-shape-broadcasting": tensorTutorPlan,
  "ai-concept-atlas": atlasTutorPlan,
} satisfies Record<string, TutorPlan>;
