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
  "bernoulli-categorical-binomial": distributionTutorPlan,
  "waiting-arrival-distributions": arrivalTutorPlan,
  "monte-carlo-tree-search": {
    intro:
      "Work through three search experiments. Predict which move gets the next rollout, change the exploration pressure, then connect the result to the counters that flow back up the tree.",
    whyItMatters:
      "MCTS exists because some decision spaces are too large to search completely. It is useful because it spends simulations where they matter, balancing promising moves with uncertain moves that still need evidence.",
    steps: [
      {
        title: "Choose by UCB",
        experiment:
          "Keep c near 1.4 and compare the UCB table with the highlighted tree branch.",
        predictionQuestion:
          "Should the next rollout always choose the move with the highest win rate?",
        observationPrompt:
          "Why did the selected move win the UCB comparison?",
        takeaway:
          "MCTS selects by confidence plus curiosity, so a less-proven move can earn the next rollout.",
      },
      {
        title: "Turn exploration down",
        experiment:
          "Move c toward exploit. Watch the UCB table and selected branch update.",
        predictionQuestion:
          "What should happen when the exploration bonus becomes small?",
        observationPrompt:
          "Which part of the UCB score mattered more after lowering c?",
        takeaway:
          "Low exploration pressure makes MCTS behave more like it is exploiting the strongest current evidence.",
      },
      {
        title: "Backpropagate one rollout",
        experiment:
          "Press Step once. Compare the tree, rollout result, and Backpropagate table.",
        predictionQuestion:
          "After one simulated win, which counters should change?",
        observationPrompt:
          "Where did the rollout result travel after the simulation ended?",
        takeaway:
          "Backpropagation pushes the rollout result through every node on the selected path, changing later UCB choices.",
      },
    ],
  },
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
  "zero-knowledge-proofs": {
    intro:
      "Work through three proof experiments. Predict what the verifier learns, open one edge, then connect repeated checks to cheating risk and secrecy.",
    whyItMatters:
      "Zero-knowledge proofs exist because sometimes you need to prove a claim without revealing the secret behind it. They are useful for privacy-preserving verification, where trust comes from checks rather than exposing private data.",
    openingMessage:
      "No prior cryptography knowledge needed. We will build the idea by predicting, trying one small proof round, and explaining what changed.\n\n- The prover claims to know a valid coloring of the graph.\n- A commitment hides each node color until the verifier asks to open one edge.\n- The verifier learns only whether the two opened endpoint colors differ.\n- A fresh hidden shuffle each round keeps many local openings from revealing the full coloring.\n\nFirst prediction: after opening just one edge, what should the verifier learn: the whole coloring, or only whether that edge is valid? Reply with your prediction first. Then I will tell you exactly what to try.",
    masteryCriteria: [
      "Describes the commit, challenge, open, verify round structure.",
      "Explains why one opened edge proves only a local color-difference check.",
      "Connects repeated random challenges to a shrinking cheating escape probability.",
      "Explains why a fresh hidden color shuffle protects the original secret coloring.",
    ],
    steps: [
      {
        title: "Open one edge",
        experiment:
          "Use Honest prover. Press Next challenge once and watch the graph, opened endpoints, and transcript row.",
        predictionQuestion:
          "After opening one challenged edge, what should the verifier learn?",
        observationPrompt:
          "What became visible, and what stayed hidden after the edge opened?",
        takeaway:
          "A single round reveals a local check: the two endpoint colors differ, while the rest of the coloring remains committed and hidden.",
      },
      {
        title: "Try the cheating prover",
        experiment:
          "Switch to Cheating prover and press Next challenge until a caught edge appears. Compare the verdict with the transcript.",
        predictionQuestion:
          "What should happen when the verifier randomly asks for a bad same-color edge?",
        observationPrompt:
          "How did the verdict change when the challenged edge was one of the bad edges?",
        takeaway:
          "A cheating prover can pass some edge challenges, but any bad same-color edge exposes the lie immediately.",
      },
      {
        title: "Raise the round count",
        experiment:
          "Move the rounds slider from a low value to a high value. Watch the formula and cheater escape chart.",
        predictionQuestion:
          "What should happen to the cheater's escape chance as random rounds increase?",
        observationPrompt:
          "What changed in the formula and chart as k increased?",
        takeaway:
          "Repeated independent challenges make cheating risk shrink quickly, while fresh shuffles keep the original coloring private.",
      },
    ],
  },
  "batch-normalization": {
    intro:
      "Work through four BatchNorm experiments. Predict how batch statistics reshape activations, switch from a centered batch to a shifted batch, inspect one value, tune scale and shift, then compare training with inference.",
    whyItMatters:
      "BatchNorm exists because neural-network activations can drift and change scale during training, making optimization harder. It is useful because it stabilizes layer inputs while still letting the model learn the scale and shift it needs.",
    openingMessage:
      "No prior neural-network normalization knowledge needed. We will build BatchNorm by predicting, trying one small batch, and explaining what changed.\n\n- A mini-batch is a small set of activations processed together during training.\n- BatchNorm computes the mini-batch mean and standard deviation.\n- It normalizes each activation with normalized = (x - mean) / sqrt(variance + epsilon), so the batch is centered and scaled.\n- The playground shows variance used = std used squared so the formula number is not a mystery.\n- Learned scale and shift then stretch and move the normalized values, keeping the layer expressive.\n- Vocabulary: papers often write mean as mu, std as sigma, scale as gamma, and shift as beta. This lab uses the plain names first.\n- During inference, BatchNorm uses saved running statistics instead of the current mini-batch.\n\nFirst prediction: the page starts on a Centered batch. When you switch to the Shifted scenario, what should happen to the activations after normalization: stay shifted right, center near zero, or all become equal? Reply with your prediction first. Then I will tell you exactly what to try.",
    masteryCriteria: [
      "Explains that BatchNorm computes mean and standard deviation from a mini-batch during training.",
      "Connects normalized = (x - mean) / sqrt(variance + epsilon) to recentering and rescaling activations.",
      "Uses one displayed x value to explain how a normalized value is produced.",
      "Explains how scale changes output spread and shift changes output center.",
      "Distinguishes training-time batch statistics from inference-time running statistics.",
    ],
    steps: [
      {
        title: "Center a shifted batch",
        experiment:
          "Notice the page starts on the Centered scenario with batch size 6. Switch to the Shifted scenario and set batch size to 8. Compare the raw x strip, batch mean and batch std pills, and the normalized value strip. Wide and Outlier are optional stress-test scenarios after the guide.",
        predictionQuestion:
          "In the Shifted scenario, what should happen after normalization: stay shifted right, center near zero, or all become equal?",
        observationPrompt:
          "What happened to the center and spread after the raw activations became normalized values?",
        takeaway:
          "BatchNorm uses the batch mean and spread to turn a shifted activation cloud into a centered, scaled signal.",
      },
      {
        title: "Inspect one activation",
        experiment:
          "Click one raw dot or normalized-value chip. Read the formula line that substitutes x, mean, and variance used into normalized = (x - mean) / sqrt(variance + epsilon). Also read the variance used pill; it is std used squared.",
        predictionQuestion:
          "If an activation is above the batch mean, should its normalized value be negative, near zero, or positive?",
        observationPrompt:
          "How did the selected x value become its displayed normalized value?",
        takeaway:
          "A normalized value is the activation's signed distance from the batch mean, measured in batch-standard-deviation units.",
      },
      {
        title: "Give expressiveness back",
        experiment:
          "Move scale below and above 1.00, then move shift left and right. Watch the output y strip plus mean(y) and std(y).",
        predictionQuestion:
          "Which parameter should stretch the output spread, and which should move the output center?",
        observationPrompt:
          "What changed when scale moved, and what changed when shift moved?",
        takeaway:
          "Normalization stabilizes the signal, then scale and shift let the layer learn the output size and offset it needs.",
      },
      {
        title: "Switch to inference",
        experiment:
          "Toggle from Training to Inference. Compare the using mean/std pills with the Training path and Inference path table. The momentum pill is fixed context for how running stats update during training; this step focuses on which stats are used.",
        predictionQuestion:
          "At inference time, should BatchNorm use the current example batch or saved running statistics?",
        observationPrompt:
          "Which statistics did the playground use after you switched to Inference?",
        takeaway:
          "Training uses the current mini-batch. Inference uses saved running estimates so predictions stay stable when examples arrive one at a time.",
      },
    ],
  },
  "layer-normalization": {
    intro:
      "Work through four LayerNorm experiments. Predict which values contribute to one token's statistics, change hidden features, inspect the z-score calculation, then tune gamma and beta.",
    whyItMatters:
      "LayerNorm exists because sequence models need stable hidden activations without depending on other examples in the batch. It is useful because each token can normalize its own features, which works well for transformers and variable batch sizes.",
    openingMessage:
      "No prior normalization knowledge needed. We will build LayerNorm with one token row at a time.\n\n- A token has several hidden feature activations.\n- LayerNorm computes the mean and variance across the features inside that one token.\n- It turns those features into z-scores with x_hat = (x - mean) / sqrt(variance + epsilon).\n- Learned gamma and beta then scale and shift each feature so the layer stays expressive.\n- Unlike BatchNorm, the current token's stats do not depend on other examples or tokens in the batch.\n\nFirst prediction: for the selected cat token, which values should decide the mean and variance: cat's four features, the same feature across all tokens, or the whole table? Reply with your prediction first. Then I will tell you exactly what to try.",
    masteryCriteria: [
      "Explains that LayerNorm computes mean and variance across features within one token.",
      "Connects the displayed mean, variance, and standard deviation to the selected token's hidden vector.",
      "Uses the formula to explain how a raw feature becomes a normalized z-score.",
      "Explains that gamma scales and beta shifts each normalized feature after stabilization.",
      "Distinguishes LayerNorm's row-wise statistics from BatchNorm's column-wise batch statistics.",
    ],
    steps: [
      {
        title: "Find the contributing row",
        experiment:
          "Keep cat selected. Compare the highlighted cat row with the Current selection panel and the formula values.",
        predictionQuestion:
          "For the selected cat token, which values should decide the mean and variance: cat's four features, the same feature across all tokens, or the whole table?",
        observationPrompt:
          "Which values did the formula use to compute cat's mean and variance?",
        takeaway:
          "LayerNorm normalizes one token at a time, so the selected row's hidden features provide that token's statistics.",
      },
      {
        title: "Move one hidden feature",
        experiment:
          "Drag x1 for the selected token toward -2, then toward +2. Watch the feature grid, mean, variance, raw bars, and normalized bars.",
        predictionQuestion:
          "If one feature moves far from the other three, what should happen to the variance?",
        observationPrompt:
          "What changed in the formula and charts when x1 moved?",
        takeaway:
          "Changing one hidden feature changes the selected token's row statistics, and the z-score chart recenters the row around zero.",
      },
      {
        title: "Read one z-score",
        experiment:
          "Use the formula panel to explain x_hat_i = (x_i - mean) / sqrt(variance + epsilon) for one displayed feature.",
        predictionQuestion:
          "If a feature is below the selected token's mean, should its normalized value be negative, near zero, or positive?",
        observationPrompt:
          "How did subtracting the mean and dividing by the standard deviation create the z-score?",
        takeaway:
          "A LayerNorm z-score is the feature's signed distance from that token's mean in that token's own standard-deviation units.",
      },
      {
        title: "Restore useful feature sizes",
        experiment:
          "Move one gamma slider and one beta slider. Watch the output y bars and the y vector while the normalized checks stay focused on x_hat.",
        predictionQuestion:
          "Which learned parameter should stretch a normalized feature, and which should shift it?",
        observationPrompt:
          "What did gamma change, and what did beta change?",
        takeaway:
          "LayerNorm stabilizes hidden activations first; gamma and beta then let the model recover useful scale and offset feature by feature.",
      },
      {
        title: "Compare the axis",
        experiment:
          "Look at the Compare the Axis panel. Compare the LayerNorm highlighted row with the BatchNorm highlighted column.",
        predictionQuestion:
          "Which normalization depends on the other examples or tokens in a batch?",
        observationPrompt:
          "How did the highlighted row and column explain the difference?",
        takeaway:
          "LayerNorm's statistics come from features inside the current token, while BatchNorm's statistics come from matching features across the batch.",
      },
    ],
  },
  "mnist-mlp-inference-debugger": {
    intro:
      "Work through one uploaded MNIST classifier. Predict what the drawn digit should produce, run the forward pass on WebGPU, then inspect the strongest probabilities, neuron contributions, and saliency pixels.",
    whyItMatters:
      "A neural network inference is more useful when you can inspect the computation instead of only seeing the final class. This lab connects an uploaded model file, GPU execution, hidden activations, softmax confidence, and input saliency in one browser-side pass.",
    openingMessage:
      "Upload a supported ONNX MNIST MLP first. The lab expects a 28x28 input and dense Gemm or MatMul layers ending in 10 digit logits.\n\nFirst prediction: draw a digit and predict which class should get the largest softmax probability. Reply with your prediction first. Then run inference and compare it with the output bars.",
    masteryCriteria: [
      "Explains that a 28x28 drawing becomes 784 input values.",
      "Recognizes that each dense layer computes weighted sums before an activation.",
      "Connects softmax probabilities to the final 10 digit logits.",
      "Uses contribution colors to distinguish positive and negative evidence.",
      "Uses the saliency map to identify pixels that support or oppose the predicted class.",
    ],
    steps: [
      {
        title: "Load and run the model",
        experiment:
          "Upload an ONNX MLP classifier, draw a digit, then press Run if inference has not already started.",
        predictionQuestion:
          "Which digit do you expect the classifier to predict from the current drawing?",
        observationPrompt:
          "What changed in the output panel after the WebGPU run?",
        takeaway:
          "The uploaded graph turns 784 pixel values into 10 logits, and softmax converts those logits into comparable class probabilities.",
      },
      {
        title: "Inspect a hidden neuron",
        experiment:
          "Click a hidden neuron in the network view and compare its activation with the top upstream contributors.",
        predictionQuestion:
          "Do you expect positive or negative weighted inputs to dominate this neuron?",
        observationPrompt:
          "Which upstream values most changed the selected neuron's activation?",
        takeaway:
          "A hidden activation is a weighted sum passed through an activation function, so both the incoming activation and the weight sign matter.",
      },
      {
        title: "Read saliency as evidence",
        experiment:
          "Compare the input drawing with the saliency map after inference. Look for blue and pink regions over the digit strokes.",
        predictionQuestion:
          "Which pixels should most support the predicted class?",
        observationPrompt:
          "Where did the model find positive and negative evidence in the drawing?",
        takeaway:
          "Saliency estimates how changing each input pixel would move the predicted class score, so it helps debug what the classifier used as evidence.",
      },
    ],
  },
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
    intro:
      "Work through three label-mixing experiments. Choose two examples, compare CutMix with MixUp, move lambda, and connect the mixed image to the soft target vector.",
    whyItMatters:
      "CutMix and MixUp are different from ordinary image transforms because the class target is no longer one-hot. Training with them only makes sense when the label vector changes in the same proportion as the mixed pixels.",
    openingMessage:
      "No prior CutMix or MixUp details needed. We will build the label contract visually.\n\n- Ordinary single-image transforms keep the original one-hot target.\n- CutMix pastes a region from one image into another.\n- MixUp blends two full images.\n- Both require a soft target vector such as 0.62 cat and 0.38 stop sign.\n\nFirst prediction: if 38% of a stop sign is pasted into a cat image, should the target stay 100% cat or become a mixture? Reply with your prediction first. Then I will tell you exactly what to try.",
    masteryCriteria: [
      "Explains why CutMix and MixUp change both pixels and labels.",
      "Connects lambda to the visible image mixture and soft-label vector.",
      "Compares CutMix patch mixing with MixUp full-image blending.",
      "Explains why the loss has weighted terms for both selected classes.",
    ],
    steps: [
      {
        title: "Choose the two source labels",
        experiment:
          "Keep cat as source A and stop sign as source B. Read the one-hot target rows for y_A and y_B before changing the mixed image.",
        predictionQuestion:
          "If the training example contains evidence from both images, should the label stay one-hot?",
        observationPrompt:
          "What did the two source target rows show before mixing?",
        takeaway:
          "CutMix and MixUp start from ordinary one-hot labels, then combine those labels in the same proportions as the image mixture.",
      },
      {
        title: "Move lambda",
        experiment:
          "Use CutMix. Move lambda from about 0.20 to about 0.80. Watch the mixed image, the A/B percentage pill, and the soft-label bars.",
        predictionQuestion:
          "When lambda gets larger, should the source A label weight go up or down?",
        observationPrompt:
          "Which surfaces changed when lambda moved?",
        takeaway:
          "Lambda is the target weight for source A. The complement, 1 - lambda, is the target weight for source B.",
      },
      {
        title: "Compare CutMix and MixUp",
        experiment:
          "Switch between CutMix and MixUp while keeping the same lambda. Compare the image preview with the soft-label vector.",
        predictionQuestion:
          "Should switching between CutMix and MixUp change the label formula if lambda stays the same?",
        observationPrompt:
          "What changed and what stayed the same after switching modes?",
        takeaway:
          "CutMix and MixUp mix pixels differently, but both produce soft labels from the same weighted-label idea.",
      },
      {
        title: "Read the loss",
        experiment:
          "Look at the weighted cross-entropy panel. Compare the two weights with the soft-label bars above it.",
        predictionQuestion:
          "Why should the loss include terms for both selected classes?",
        observationPrompt:
          "How did the loss terms match the mixed target vector?",
        takeaway:
          "A soft label asks the model to put probability mass on both classes, weighted by how much each source contributed.",
      },
    ],
  },
  "autograd-graphs": {
    intro:
      "Work through three autograd experiments. Predict the forward value, inspect how local derivatives send gradients backward, then change the formula and explain why shared paths add.",
    whyItMatters:
      "Autograd is how modern neural-network libraries turn ordinary formulas into trainable parameters. It matters because each parameter needs its own gradient, and those gradients come from the computation graph, not from a separate hand-written rule.",
    openingMessage:
      "No prior autograd details needed. We will trace tiny formulas as graphs.\n\n- The forward pass computes and caches values at each node.\n- The backward pass starts with output gradient 1 and moves opposite the arrows.\n- Each edge multiplies the incoming gradient by a local derivative.\n- If one parameter affects the output through multiple paths, the path gradients add.\n\nFirst prediction: for f(a,b)=a*b+b^2 at a=2 and b=3, which parameter should have the larger gradient: a or b? Reply with your prediction first. Then I will tell you exactly what to try.",
    masteryCriteria: [
      "Explains that autograd records a computation graph during the forward pass.",
      "Connects node activations to cached values used during the backward pass.",
      "Uses local derivatives to explain how a gradient message moves one edge backward.",
      "Explains why b in a*b+b^2 receives two gradient contributions that add.",
      "Interprets derivative charts as gradients for one parameter while the other values are held fixed.",
      "Uses a one-step update preview to explain why parameters move opposite the gradient.",
    ],
    steps: [
      {
        title: "Follow the forward cache",
        experiment:
          "Use f(a,b)=a*b+b^2 with a=2 and b=3. Read the graph from left to right and compare the mul, square, add, and out node values.",
        predictionQuestion:
          "Before looking closely, what output do you expect from a*b+b^2 when a=2 and b=3?",
        observationPrompt:
          "Which cached forward values did the output combine?",
        takeaway:
          "Autograd first records the exact operations and cached values, so backward gradients have a graph to follow.",
      },
      {
        title: "Add shared-path gradients",
        experiment:
          "Stay on f(a,b)=a*b+b^2. Compare the badges near a and b, then read the chain-rule panel for b's two paths.",
        predictionQuestion:
          "Which parameter should get the larger gradient, a or b, and why?",
        observationPrompt:
          "How did b's two backward paths combine?",
        takeaway:
          "A shared input can affect the output through multiple paths. Autograd sums those incoming contributions, so df/db becomes 2 + 6 = 8.",
      },
      {
        title: "Compare another graph",
        experiment:
          "Choose the sigmoid formula, then the squared-error formula. Move one slider in each and compare the graph, derivative charts, and update preview.",
        predictionQuestion:
          "When the formula changes, should the graph structure and derivative curves stay the same or change?",
        observationPrompt:
          "What changed when the formula changed?",
        takeaway:
          "Autograd follows the actual operations in the selected formula, so changing the formula changes both the graph and the gradients.",
      },
      {
        title: "Use a gradient as an update",
        experiment:
          "Return to f(a,b)=a*b+b^2. Move b high and low, then compare df/db with the one-step gradient descent preview.",
        predictionQuestion:
          "If df/db gets larger, should the one-step update move b by a larger or smaller amount?",
        observationPrompt:
          "How did the preview use the gradient value?",
        takeaway:
          "Autograd computes gradients; an optimizer turns them into parameter moves, usually by stepping opposite the gradient.",
      },
    ],
  },
  "tensor-shape-broadcasting": tensorTutorPlan,
  "ai-concept-atlas": {
    intro:
      "Use the atlas for three short navigation experiments. Read one center-out branch, control how much detail is visible, and jump directly between distant concepts.",
    whyItMatters:
      "AI vocabulary is difficult because the field is not a flat list. A branching mind map gives every concept a clear learning home without turning the taxonomy into a web of crossing lines.",
    openingMessage:
      "No prior AI knowledge is required. Read the mind map from the blue Artificial Intelligence core outward. Each color-coded category owns subcategories, and those subcategories own increasingly specific concepts. A branch means ‘belongs under,’ not ‘must be learned first.’ Search automatically opens the ancestors of a result.\n\nFirst prediction: Transformer is selected. Which category and subcategory do you expect to contain it? Reply with your prediction first. Then I will tell you exactly what to try.",
    masteryCriteria: [
      "Reads a concept's path from Artificial Intelligence through its category and subcategory.",
      "Uses branch controls to reveal or hide local detail.",
      "Uses search to locate a concept and reveal its ancestor branch.",
      "Explains that a taxonomy branch shows category membership rather than prerequisite order.",
    ],
    steps: [
      {
        title: "Read one taxonomy branch",
        experiment:
          "Keep Transformer selected. Read the highlighted branch from the Artificial Intelligence core through Deep Learning and Attention & Transformers.",
        predictionQuestion:
          "Which category and subcategory do you expect to contain Transformer?",
        observationPrompt:
          "What parent-to-child sequence places Transformer in the taxonomy?",
        takeaway:
          "A taxonomy branch answers where an idea belongs: Artificial Intelligence → Deep Learning → Attention & Transformers → Transformer.",
      },
      {
        title: "Open one local branch",
        experiment:
          "Expand Value Learning, then collapse it. Finally use Search to find Q-learning and select the exact result.",
        predictionQuestion:
          "What detail do you expect the Value Learning branch to reveal?",
        observationPrompt:
          "What changed when you opened and closed the branch, and which ancestor path did Search reveal for Q-learning?",
        takeaway:
          "Progressive disclosure keeps a very large taxonomy navigable: local branch controls reveal detail where you need it, while Search opens the path to a result.",
      },
      {
        title: "Compare distant branches",
        experiment:
          "Search for Calibration and read its highlighted path. Then search for Sparse autoencoders and compare the two locations.",
        predictionQuestion:
          "Will Calibration and Sparse autoencoders share a category, a subcategory, or only the Artificial Intelligence core?",
        observationPrompt:
          "Which category and subcategory contained each concept?",
        takeaway:
          "Distant concepts can share the AI core while belonging to different category branches; the branch describes classification, not prerequisite order.",
      },
    ],
  },
} satisfies Record<string, TutorPlan>;
