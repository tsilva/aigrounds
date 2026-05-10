import {
  playgroundTutorPlans,
  type TutorPlan,
} from "@/lib/tutor-plans";

type Theme = {
  badgeClassName: string;
};

export type PlaygroundMetadata = {
  slug: string;
  title: string;
  tag: string;
  kicker: string;
  summary: string;
  estimatedDuration: string;
  concepts: string[];
  learningGoals: string[];
  presentation: "standard" | "immersive";
  tutorPlan: TutorPlan;
  theme: Theme;
};

type UpcomingPlayground = {
  slug: string;
  title: string;
  tag: string;
  summary: string;
  concepts: string[];
};

// The landing dashboard is the canonical lesson plan for both live and planned
// playgrounds. Keep this metadata and the dashboard order in sync with what `/`
// should show.
export const activePlaygroundMetadata = [
  {
    slug: "mean-median-mode",
    title: "Mean, Median & Mode Lab",
    tag: "statistics",
    kicker:
      "Drag data points and watch three definitions of typical tell different stories.",
    summary:
      "Move values on a number line, switch between dataset shapes, and see how the mean, median, and mode respond when values repeat or an outlier appears.",
    estimatedDuration: "5 to 7 minutes",
    concepts: [
      "Mean",
      "Median",
      "Mode",
      "Outliers",
    ],
    learningGoals: [
      "Understand mean as the balance point of all values.",
      "See why the median resists extreme values after sorting.",
      "Recognize mode as the most common value and when a dataset has no mode.",
    ],
    presentation: "immersive",
    tutorPlan: playgroundTutorPlans["mean-median-mode"],
    theme: {
      badgeClassName: "border-blue-300 bg-blue-100 text-blue-950",
    },
  },
  {
    slug: "range-quartiles-iqr",
    title: "Range, Quartiles & IQR Explorer",
    tag: "statistics",
    kicker:
      "Move outliers and watch the full span stretch while the middle 50% stays steady.",
    summary:
      "Drag values on a number line, inspect the five-number summary, and see how range, quartiles, percentile rank, IQR, and box plots respond when one edge gets extreme.",
    estimatedDuration: "5 to 7 minutes",
    concepts: [
      "Range",
      "Quartiles",
      "Interquartile range",
      "Box plots",
    ],
    learningGoals: [
      "Understand range as the distance from minimum to maximum.",
      "See how quartiles split sorted data into lower, middle, and upper sections.",
      "Recognize why IQR describes the middle 50% and resists outliers better than range.",
    ],
    presentation: "immersive",
    tutorPlan: playgroundTutorPlans["range-quartiles-iqr"],
    theme: {
      badgeClassName: "border-indigo-300 bg-indigo-100 text-indigo-950",
    },
  },
  {
    slug: "variance-standard-deviation",
    title: "Variance & Standard Deviation Lab",
    tag: "statistics",
    kicker:
      "Drag data points and watch squared distances turn spread into a typical distance.",
    summary:
      "Move values on a number line, compare same-mean dataset shapes, and see how deviations, variance, and standard deviation react when points spread away from the mean.",
    estimatedDuration: "5 to 7 minutes",
    concepts: [
      "Deviations",
      "Squared deviations",
      "Variance",
      "Standard deviation",
    ],
    learningGoals: [
      "Understand deviations as signed distances from the mean.",
      "See why squaring deviations makes far-away values dominate variance.",
      "Recognize standard deviation as a typical distance from the mean in the original units.",
    ],
    presentation: "immersive",
    tutorPlan: playgroundTutorPlans["variance-standard-deviation"],
    theme: {
      badgeClassName: "border-blue-300 bg-blue-100 text-blue-950",
    },
  },
  {
    slug: "shape-skew-outliers",
    title: "Shape, Skew & Outliers Lab",
    tag: "statistics",
    kicker:
      "Move one outlier and watch the histogram, box plot, and summaries disagree.",
    summary:
      "Choose a distribution shape, slide an outlier across the scale, and compare how mean, median, range, and IQR respond when tails stretch.",
    estimatedDuration: "5 to 7 minutes",
    concepts: [
      "Histograms",
      "Skew",
      "Outliers",
      "Robust summaries",
    ],
    learningGoals: [
      "Recognize distribution shape from pile-ups, tails, and clusters.",
      "See how outliers can pull the mean and range more than the median and IQR.",
      "Understand why a histogram and box plot explain what one summary number hides.",
    ],
    presentation: "immersive",
    tutorPlan: playgroundTutorPlans["shape-skew-outliers"],
    theme: {
      badgeClassName: "border-sky-300 bg-sky-100 text-sky-950",
    },
  },
  {
    slug: "probability-rules",
    title: "Probability Rules Simulator",
    tag: "probability",
    kicker:
      "Count dice outcomes and watch complements, intersections, and unions become arithmetic.",
    summary:
      "Choose two dice events, switch between probability rules, and see the sample-space grid, formulas, counts, and simulation results update together.",
    estimatedDuration: "5 to 7 minutes",
    concepts: [
      "Sample spaces",
      "Complements",
      "Intersections",
      "Unions",
    ],
    learningGoals: [
      "Understand probability as counted outcomes divided by the whole sample space.",
      "See why complements, intersections, and unions are regions of the same grid.",
      "Recognize why union probability subtracts overlap that was counted twice.",
    ],
    presentation: "immersive",
    tutorPlan: playgroundTutorPlans["probability-rules"],
    theme: {
      badgeClassName: "border-sky-300 bg-sky-100 text-sky-950",
    },
  },
  {
    slug: "conditional-probability",
    title: "Conditional Probability & Independence Lab",
    tag: "probability",
    kicker:
      "Filter a population and see why conditional probability changes the denominator first.",
    summary:
      "Toggle between independent, dependent, and base-rate scenarios. The lab updates a 100-person grid, marginal and conditional fractions, joint probability, and the independence verdict together.",
    estimatedDuration: "5 to 7 minutes",
    concepts: [
      "Conditional probability",
      "Joint probability",
      "Marginal probability",
      "Independence",
    ],
    learningGoals: [
      "Understand conditional probability as counting inside a filtered denominator.",
      "See how P(B ∣ A), P(B), and P(A ∩ B) describe different slices of the same population.",
      "Recognize independence as the case where filtering by A does not change the probability of B.",
    ],
    presentation: "immersive",
    tutorPlan: playgroundTutorPlans["conditional-probability"],
    theme: {
      badgeClassName: "border-indigo-300 bg-indigo-100 text-indigo-950",
    },
  },
  {
    slug: "bayes-rule",
    title: "Bayes Rule Playground",
    tag: "probability",
    kicker:
      "Tune base rates and test errors to see why a positive signal can still be uncertain.",
    summary:
      "Adjust prevalence, sensitivity, and false-positive rate in a rare-event scenario. The lab shows how true positives and false positives combine into the posterior probability after evidence arrives.",
    estimatedDuration: "5 to 7 minutes",
    concepts: [
      "Bayes theorem",
      "Priors",
      "Likelihoods",
      "False positives",
    ],
    learningGoals: [
      "Understand the prior as the number of real cases available before evidence.",
      "See how sensitivity and false-positive rate create the positive-test denominator.",
      "Recognize why rare base rates can make a positive result less certain than expected.",
    ],
    presentation: "immersive",
    tutorPlan: playgroundTutorPlans["bayes-rule"],
    theme: {
      badgeClassName: "border-emerald-300 bg-emerald-100 text-emerald-950",
    },
  },
  {
    slug: "expected-value-risk",
    title: "Expected Value & Risk Lab",
    tag: "probability",
    kicker:
      "Tune two bets and see why the best long-run average can still swing hard.",
    summary:
      "Build a safe bet and a risky bet, then compare expected value, spread, break-even probability, and deterministic long-run simulations as the payoff sliders move.",
    estimatedDuration: "5 to 7 minutes",
    concepts: [
      "Random variables",
      "Expected value",
      "Risk",
      "Long-run averages",
    ],
    learningGoals: [
      "Understand expected value as a probability-weighted average of outcomes.",
      "See why two bets with similar expected value can have very different spread.",
      "Recognize that short-run samples can bounce around before the long-run average appears.",
    ],
    presentation: "immersive",
    tutorPlan: playgroundTutorPlans["expected-value-risk"],
    theme: {
      badgeClassName: "border-amber-300 bg-amber-100 text-amber-950",
    },
  },
  {
    slug: "bernoulli-categorical-binomial",
    title: "Bernoulli, Categorical & Binomial Lab",
    tag: "probability",
    kicker:
      "Switch between one trial, one choice, and repeated counts while probability mass reshapes.",
    summary:
      "Move a success probability, change repeated trials, and compare Bernoulli, categorical, and binomial probability mass so the shared idea and different questions stay distinct.",
    estimatedDuration: "5 to 7 minutes",
    concepts: [
      "Bernoulli trials",
      "Categorical outcomes",
      "Binomial counts",
      "Probability mass",
    ],
    learningGoals: [
      "Understand Bernoulli as one yes/no trial with a success probability.",
      "See categorical outcomes as one draw from several probability buckets.",
      "Recognize binomial counts as repeated Bernoulli trials summarized by number of successes.",
    ],
    presentation: "immersive",
    tutorPlan: playgroundTutorPlans["bernoulli-categorical-binomial"],
    theme: {
      badgeClassName: "border-emerald-300 bg-emerald-100 text-emerald-950",
    },
  },
  {
    slug: "waiting-arrival-distributions",
    title: "Waiting & Arrival Distributions Lab",
    tag: "probability",
    kicker:
      "Tune one event chance and watch waits stretch while arrival counts shift.",
    summary:
      "Move a per-second event chance, change the time window, and compare a geometric waiting-time view with a Poisson rate-model count view.",
    estimatedDuration: "5 to 7 minutes",
    concepts: [
      "Geometric distribution",
      "Poisson distribution",
      "Arrival rates",
      "Rare events",
    ],
    learningGoals: [
      "Understand geometric waiting time as the question of how long until the next event.",
      "See how a Poisson rate model describes counts inside a fixed time window.",
      "Recognize when the rare-event approximation is useful and when the exact formula is safer.",
    ],
    presentation: "immersive",
    tutorPlan: playgroundTutorPlans["waiting-arrival-distributions"],
    theme: {
      badgeClassName: "border-cyan-300 bg-cyan-100 text-cyan-950",
    },
  },
  {
    slug: "overfitting",
    title: "Overfitting Lab",
    tag: "generalization",
    kicker:
      "Raise model complexity and watch memorization beat training loss while future error gets worse.",
    summary:
      "Fit polynomial curves to noisy training dots, then compare them against held-out test dots. The lab shows why the lowest training loss can be the wrong model when a wiggly curve starts chasing noise.",
    estimatedDuration: "5 to 7 minutes",
    concepts: [
      "Model complexity",
      "Training loss",
      "Test loss",
      "Generalization",
    ],
    learningGoals: [
      "See how higher model complexity can keep reducing training error.",
      "Understand why test error can rise when a curve memorizes noisy training examples.",
      "Recognize the useful middle between underfitting and overfitting.",
    ],
    presentation: "immersive",
    tutorPlan: playgroundTutorPlans.overfitting,
    theme: {
      badgeClassName: "border-orange-300 bg-orange-100 text-orange-950",
    },
  },
  {
    slug: "confusion-matrix-thresholds",
    title: "Confusion Matrix & Thresholds",
    tag: "evaluation",
    kicker:
      "Move one cutoff and watch false positives trade places with false negatives.",
    summary:
      "Drag a classification threshold across scored examples. The lab updates the confusion matrix, precision, recall, F1, and accuracy so decision tradeoffs become visible.",
    estimatedDuration: "5 to 7 minutes",
    concepts: [
      "Classification thresholds",
      "False positives",
      "False negatives",
      "Precision and recall",
    ],
    learningGoals: [
      "See how a score threshold converts model confidence into a yes/no prediction.",
      "Understand why lowering a threshold usually raises recall while adding false positives.",
      "Recognize how precision, recall, and F1 summarize different mistake costs.",
    ],
    presentation: "immersive",
    tutorPlan: playgroundTutorPlans["confusion-matrix-thresholds"],
    theme: {
      badgeClassName: "border-rose-300 bg-rose-100 text-rose-950",
    },
  },
  {
    slug: "softmax-temperature",
    title: "Softmax Temperature Lab",
    tag: "probability",
    kicker:
      "Adjust logits and temperature to see confidence sharpen without changing the winner.",
    summary:
      "Move raw class logits, tune temperature, and watch softmax convert scores into probabilities. The lab shows why low temperature gets overconfident and high temperature spreads probability mass back out.",
    estimatedDuration: "5 to 7 minutes",
    concepts: [
      "Raw logits",
      "Softmax normalization",
      "Temperature scaling",
      "Confidence",
    ],
    learningGoals: [
      "Understand how softmax turns raw logits into a probability distribution.",
      "See why temperature changes confidence while preserving the class ranking.",
      "Recognize the difference between a sharp and a high-entropy prediction.",
    ],
    presentation: "immersive",
    tutorPlan: playgroundTutorPlans["softmax-temperature"],
    theme: {
      badgeClassName: "border-violet-300 bg-violet-100 text-violet-950",
    },
  },
  {
    slug: "categorical-cross-entropy",
    title: "Cross Entropy Loss",
    tag: "loss",
    kicker:
      "Move probability mass around and watch classification penalties update instantly.",
    summary:
      "Switch between binary, categorical, and multi-label cross entropy. Choose targets, edit predicted probabilities, and see why the loss rewards confidence on the outcomes that are actually true.",
    estimatedDuration: "5 to 7 minutes",
    concepts: [
      "Binary targets",
      "One-hot targets",
      "Multi-hot targets",
      "Predicted probabilities",
    ],
    learningGoals: [
      "Understand how binary cross entropy penalizes a yes/no prediction.",
      "See why categorical cross entropy uses the predicted probability assigned to the one true class.",
      "Recognize that multi-label cross entropy treats every label as an independent binary question.",
    ],
    presentation: "immersive",
    tutorPlan: playgroundTutorPlans["categorical-cross-entropy"],
    theme: {
      badgeClassName: "border-indigo-300 bg-indigo-100 text-indigo-950",
    },
  },
  {
    slug: "gradient-descent",
    title: "Gradient Descent Playground",
    tag: "optimization",
    kicker:
      "Step downhill on a loss curve and see why the same gradient can crawl, land, or overshoot.",
    summary:
      "Tune learning rate and momentum while a point moves across a simple loss landscape. The lab links slope, step size, and carry-over so convergence and overshooting become visible.",
    estimatedDuration: "5 to 7 minutes",
    concepts: [
      "Loss landscapes",
      "Gradients",
      "Learning rate",
      "Momentum",
    ],
    learningGoals: [
      "See that the gradient gives the downhill direction from the current position.",
      "Understand how learning rate changes the distance traveled on each update.",
      "Recognize how momentum carries previous updates and can speed convergence or overshoot.",
    ],
    presentation: "immersive",
    tutorPlan: playgroundTutorPlans["gradient-descent"],
    theme: {
      badgeClassName: "border-blue-300 bg-blue-100 text-blue-950",
    },
  },
  {
    slug: "monte-carlo-tree-search",
    title: "Monte Carlo Tree Search",
    tag: "search",
    kicker:
      "Spend rollouts where confidence and curiosity say the tree can learn most.",
    summary:
      "Tune the UCB exploration constant, step through selection, expansion, simulation, and backpropagation, and see why MCTS sometimes samples an uncertain move before returning to the best-proven branch.",
    estimatedDuration: "5 to 7 minutes",
    concepts: [
      "Tree search",
      "Rollouts",
      "UCB selection",
      "Backpropagation",
    ],
    learningGoals: [
      "Understand MCTS as a loop of select, expand, simulate, and backpropagate.",
      "See how UCB combines win rate with an exploration bonus for less-visited moves.",
      "Recognize why more rollouts turn uncertain branches into evidence-backed decisions.",
    ],
    presentation: "immersive",
    tutorPlan: playgroundTutorPlans["monte-carlo-tree-search"],
    theme: {
      badgeClassName: "border-amber-300 bg-amber-100 text-amber-950",
    },
  },
  {
    slug: "transformer-attention",
    title: "Transformer Attention",
    tag: "transformers",
    kicker:
      "Select a token and watch query-key scores become a weighted context mix.",
    summary:
      "Switch between two meanings of bank, choose a query token, and adjust attention sharpness. The lab shows how queries compare with keys, softmax creates weights, and values blend into the next token representation.",
    estimatedDuration: "5 to 7 minutes",
    concepts: [
      "Self-attention",
      "Queries and keys",
      "Softmax weights",
      "Value mixing",
    ],
    learningGoals: [
      "Understand attention as a weighted lookup over context tokens.",
      "See how query-key scores decide which tokens receive larger weights.",
      "Recognize that values, not keys, are blended into the next representation.",
    ],
    presentation: "immersive",
    tutorPlan: playgroundTutorPlans["transformer-attention"],
    theme: {
      badgeClassName: "border-cyan-300 bg-cyan-100 text-cyan-950",
    },
  },
] satisfies PlaygroundMetadata[];

export const upcomingPlaygrounds: UpcomingPlayground[] = [
  {
    slug: "pdf-cdf-probability-area",
    title: "PDF, CDF & Probability Area Lab",
    tag: "probability",
    summary:
      "Move interval bounds and watch probability update as shaded area under a curve.",
    concepts: ["PDFs", "CDFs", "Continuous variables"],
  },
  {
    slug: "normal-distribution-z-scores",
    title: "Normal Distribution & Z-Scores Lab",
    tag: "probability",
    summary:
      "Move a value across a bell curve and connect raw units to standardized distance.",
    concepts: ["Normal distribution", "Z-scores", "Tail probabilities"],
  },
  {
    slug: "sampling-sample-size",
    title: "Sampling & Sample Size Lab",
    tag: "inference",
    summary:
      "Repeatedly sample from a hidden population and see why bigger samples stabilize estimates.",
    concepts: ["Sampling", "Sample size", "Sampling variability"],
  },
  {
    slug: "sampling-bias",
    title: "Sampling Bias Lab",
    tag: "inference",
    summary:
      "Compare random samples with biased collection rules and see why size cannot fix bad sampling.",
    concepts: ["Selection bias", "Nonresponse bias", "Survivorship bias"],
  },
  {
    slug: "standard-error-margin-of-error",
    title: "Standard Error & Margin of Error Lab",
    tag: "inference",
    summary:
      "Watch uncertainty shrink as sample size grows and estimates form a sampling distribution.",
    concepts: ["Standard error", "Margin of error", "Sampling distributions"],
  },
  {
    slug: "confidence-intervals",
    title: "Confidence Intervals Explorer",
    tag: "inference",
    summary:
      "Run many simulated samples and show which intervals capture the true population value.",
    concepts: ["Confidence intervals", "Coverage", "Interval width"],
  },
  {
    slug: "hypothesis-testing-basics",
    title: "Hypothesis Testing Basics",
    tag: "inference",
    summary:
      "Use one clean A/B test to connect null hypotheses, p-values, and decision rules.",
    concepts: ["Null hypothesis", "P-values", "Significance"],
  },
  {
    slug: "errors-power-effect-size",
    title: "Errors, Power & Effect Size Lab",
    tag: "inference",
    summary:
      "Show why not significant does not always mean no effect.",
    concepts: ["Type I error", "Type II error", "Power"],
  },
  {
    slug: "covariance-correlation",
    title: "Covariance & Correlation Map",
    tag: "relationships",
    summary:
      "Drag points on a scatterplot and watch direction, strength, and scale sensitivity update.",
    concepts: ["Covariance", "Pearson correlation", "Scale sensitivity"],
  },
  {
    slug: "correlation-shape-outliers",
    title: "Correlation Shape & Outliers Lab",
    tag: "relationships",
    summary:
      "Switch among datasets and drag outliers to compare correlation metrics.",
    concepts: ["Spearman correlation", "Nonlinear relationships", "Outliers"],
  },
  {
    slug: "simpsons-paradox-confounding",
    title: "Simpson's Paradox & Confounding Lab",
    tag: "relationships",
    summary:
      "Toggle subgroup and combined views to see an apparent relationship reverse.",
    concepts: ["Confounders", "Grouped relationships", "Causation"],
  },
  {
    slug: "linear-regression-line-fitting",
    title: "Linear Regression Line Fitting",
    tag: "regression",
    summary:
      "Drag a regression line before revealing the least-squares best-fit line.",
    concepts: ["Slope", "Intercept", "Residuals"],
  },
  {
    slug: "r-squared-residual-diagnostics",
    title: "R Squared & Residual Diagnostics",
    tag: "regression",
    summary:
      "Pair the same fit score with different residual patterns to spot misleading models.",
    concepts: ["R squared", "Residual plots", "Unexplained variance"],
  },
  {
    slug: "train-test-generalization",
    title: "Train/Test Split & Generalization Lab",
    tag: "generalization",
    summary:
      "Compare known-data fit with held-out prediction and expose data leakage.",
    concepts: ["Train/test split", "Validation sets", "Data leakage"],
  },
  {
    slug: "classification-metrics-foundations",
    title: "Classification Metrics Foundations",
    tag: "evaluation",
    summary:
      "Build confusion-matrix intuition before tuning a decision threshold.",
    concepts: ["Accuracy", "Specificity", "Class imbalance"],
  },
  {
    slug: "roc-precision-recall-curves",
    title: "ROC vs Precision-Recall Curves",
    tag: "evaluation",
    summary:
      "Trace both curves while moving a threshold across classifier scores.",
    concepts: ["ROC curves", "Precision-recall curves", "Thresholds"],
  },
  {
    slug: "feature-scaling",
    title: "Feature Scaling Lab",
    tag: "features",
    summary:
      "Rescale axes or features and watch the same points become comparable.",
    concepts: ["Normalization", "Standardization", "Min-max scaling"],
  },
  {
    slug: "distance-metrics",
    title: "Distance Metrics Lab",
    tag: "features",
    summary:
      "Move points on a grid and compare nearest-neighbor decisions.",
    concepts: ["Euclidean distance", "Manhattan distance", "Nearest neighbors"],
  },
  {
    slug: "entropy-information",
    title: "Entropy & Information Starter",
    tag: "information",
    summary:
      "Move probability mass across buckets and watch uncertainty shrink or spread.",
    concepts: ["Surprise", "Entropy", "Information gain"],
  },
  {
    slug: "class-score-logits",
    title: "Class Scores & Logits Lab",
    tag: "classification",
    summary:
      "Move raw class scores before converting them into probabilities.",
    concepts: ["Class scores", "Logits", "Decision margins"],
  },
  {
    slug: "log-loss-calibration",
    title: "Log Loss & Calibration Lab",
    tag: "loss",
    summary:
      "Compare predicted probabilities against observed frequencies.",
    concepts: ["Log loss", "Calibration", "Confidence"],
  },
  {
    slug: "kl-divergence",
    title: "KL Divergence Intuition Lab",
    tag: "loss",
    summary:
      "Move probability mass between buckets and watch directional mismatch change.",
    concepts: ["KL divergence", "Reference distributions", "Approximation"],
  },
  {
    slug: "vector-geometry-similarity",
    title: "Vector Geometry & Similarity Lab",
    tag: "vectors",
    summary:
      "Move vectors in 2D before connecting the same geometry to embeddings.",
    concepts: ["Dot products", "Magnitude", "Cosine similarity"],
  },
  {
    slug: "projection-foundations",
    title: "Projection Foundations Lab",
    tag: "vectors",
    summary:
      "Rotate a projection axis and watch points collapse onto one dimension.",
    concepts: ["Projection", "Components", "Reconstruction error"],
  },
  {
    slug: "pca-principal-components",
    title: "PCA & Principal Components Lab",
    tag: "dimensionality",
    summary:
      "Rotate principal axes and watch variance concentrate into fewer dimensions.",
    concepts: ["PCA", "Principal components", "Variance captured"],
  },
  {
    slug: "t-sne-neighborhood-map",
    title: "t-SNE Neighborhood Map",
    tag: "dimensionality",
    summary:
      "Tune perplexity and see how local neighborhoods become a two-dimensional map.",
    concepts: ["t-SNE", "Perplexity", "Local neighborhoods"],
  },
  {
    slug: "umap-manifold-projection",
    title: "UMAP Manifold Projection Lab",
    tag: "dimensionality",
    summary:
      "Adjust neighbor and distance settings to compare local clusters with global shape.",
    concepts: ["UMAP", "Nearest neighbors", "Manifold structure"],
  },
  {
    slug: "embedding-retrieval",
    title: "Embedding Retrieval Lab",
    tag: "retrieval",
    summary:
      "Move a query point and watch retrieved items reorder.",
    concepts: ["Embeddings", "Query vectors", "Nearest-neighbor retrieval"],
  },
  {
    slug: "contrastive-loss",
    title: "Contrastive Loss Lab",
    tag: "loss",
    summary:
      "Move embedding points and tune margin or temperature to watch pairwise loss terms change.",
    concepts: ["Anchor pairs", "Margins", "Representation learning"],
  },
  {
    slug: "regularization",
    title: "Regularization Lab",
    tag: "optimization",
    summary:
      "Compare no regularization, L1, and L2 while weights and decision boundaries change.",
    concepts: ["L1", "L2", "Penalty strength"],
  },
  {
    slug: "k-means-clustering",
    title: "K-Means Clustering Studio",
    tag: "clustering",
    summary:
      "Place points and centroids, then step through assign/update cycles.",
    concepts: ["Centroids", "Assignment", "Clusters"],
  },
  {
    slug: "exploration-exploitation",
    title: "Exploration vs Exploitation Lab",
    tag: "search",
    summary:
      "Allocate trials across options and watch a policy balance rewards against learning value.",
    concepts: ["Exploration", "Exploitation", "UCB"],
  },
  {
    slug: "neural-network-forward-pass",
    title: "Neural Network Forward Pass Lab",
    tag: "neural networks",
    summary:
      "Move weights in a tiny network and watch inputs become class scores.",
    concepts: ["Layers", "Weights", "Activations"],
  },
  {
    slug: "backpropagation-inspector",
    title: "Backpropagation Inspector",
    tag: "neural networks",
    summary:
      "Trace how one loss value sends credit assignment back through weights.",
    concepts: ["Backpropagation", "Gradients", "Credit assignment"],
  },
  {
    slug: "token-context-position",
    title: "Token Context & Position Lab",
    tag: "transformers",
    summary:
      "Rearrange tokens and inspect how positions change the representation.",
    concepts: ["Tokens", "Context windows", "Position"],
  },
];

export const dashboardLessonPlanOrder = [
  "mean-median-mode",
  "range-quartiles-iqr",
  "variance-standard-deviation",
  "shape-skew-outliers",
  "probability-rules",
  "conditional-probability",
  "bayes-rule",
  "bernoulli-categorical-binomial",
  "expected-value-risk",
  "waiting-arrival-distributions",
  "pdf-cdf-probability-area",
  "normal-distribution-z-scores",
  "sampling-sample-size",
  "sampling-bias",
  "standard-error-margin-of-error",
  "confidence-intervals",
  "hypothesis-testing-basics",
  "errors-power-effect-size",
  "covariance-correlation",
  "correlation-shape-outliers",
  "simpsons-paradox-confounding",
  "linear-regression-line-fitting",
  "r-squared-residual-diagnostics",
  "train-test-generalization",
  "overfitting",
  "classification-metrics-foundations",
  "confusion-matrix-thresholds",
  "roc-precision-recall-curves",
  "feature-scaling",
  "distance-metrics",
  "vector-geometry-similarity",
  "projection-foundations",
  "pca-principal-components",
  "t-sne-neighborhood-map",
  "umap-manifold-projection",
  "embedding-retrieval",
  "entropy-information",
  "class-score-logits",
  "softmax-temperature",
  "categorical-cross-entropy",
  "log-loss-calibration",
  "kl-divergence",
  "contrastive-loss",
  "gradient-descent",
  "regularization",
  "k-means-clustering",
  "exploration-exploitation",
  "monte-carlo-tree-search",
  "neural-network-forward-pass",
  "backpropagation-inspector",
  "token-context-position",
  "transformer-attention",
] as const;

function getPlaygroundMetadata(slug: string) {
  return activePlaygroundMetadata.find((playground) => playground.slug === slug);
}

export function getPlaygroundMetadataFromPathname(pathname?: string) {
  const slug = pathname?.split("/").filter(Boolean).at(-1);

  return slug ? getPlaygroundMetadata(slug) : undefined;
}
