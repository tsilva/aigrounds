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
    slug: "matrix-multiplication",
    title: "Matrix Multiplication Lab",
    tag: "linear algebra",
    kicker:
      "Highlight one output cell and watch a row-column dot product build it term by term.",
    summary:
      "Choose compatible matrix shapes, select output cells, and step through the multiply-add terms that turn rows of A and columns of B into the product matrix C.",
    estimatedDuration: "5 to 7 minutes",
    concepts: [
      "Matrix shapes",
      "Dot products",
      "Linear algebra",
      "Multiply-adds",
    ],
    learningGoals: [
      "Understand when two matrix shapes are compatible for multiplication.",
      "Compute one output cell as a row of A dotted with a column of B.",
      "Recognize why (m x n) times (n x p) produces an (m x p) matrix.",
    ],
    presentation: "immersive",
    tutorPlan: playgroundTutorPlans["matrix-multiplication"],
    theme: {
      badgeClassName: "border-blue-300 bg-blue-100 text-blue-950",
    },
  },
  {
    slug: "byte-pair-encoding",
    title: "Byte Pair Encoding Lab",
    tag: "tokenization",
    kicker:
      "Spend merge budget and watch frequent character pairs become reusable tokens.",
    summary:
      "Choose a tiny training corpus, step through BPE merges, and compare how learned subword chunks reduce token count while growing the vocabulary.",
    estimatedDuration: "5 to 7 minutes",
    concepts: [
      "Tokenization",
      "Subword tokens",
      "Pair frequency",
      "Vocabulary tradeoffs",
    ],
    learningGoals: [
      "Understand BPE as repeated merging of frequent adjacent pieces.",
      "See why more merge steps reduce token count while increasing vocabulary size.",
      "Recognize why learned tokens transfer best to text that repeats training patterns.",
    ],
    presentation: "immersive",
    tutorPlan: playgroundTutorPlans["byte-pair-encoding"],
    theme: {
      badgeClassName: "border-blue-300 bg-blue-100 text-blue-950",
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
  {
    slug: "linear-quantization-int4",
    title: "Linear Quantization (INT4) Lab",
    tag: "compression",
    kicker:
      "Turn real weights into 16 reusable integer codes and see what memory savings cost.",
    summary:
      "Choose a block of values, tune the quantization range, inspect one value as it snaps to an INT4 code, and compare rounding, clipping, and 8x storage savings.",
    estimatedDuration: "5 to 7 minutes",
    concepts: [
      "Linear quantization",
      "INT4 codes",
      "Scale and zero point",
      "Rounding and clipping error",
    ],
    learningGoals: [
      "Derive scale and zero point from a block's min/max range.",
      "Understand how scale and zero point map a real value onto one of 16 INT4 codes.",
      "See why dequantized values are approximate shelf centers rather than the original decimals.",
      "Compare why different blocks use different ranges while the 16-code INT4 budget stays fixed.",
      "Recognize the range tradeoff between smaller steps, more clipping, and memory savings.",
    ],
    presentation: "immersive",
    tutorPlan: playgroundTutorPlans["linear-quantization-int4"],
    theme: {
      badgeClassName: "border-emerald-300 bg-emerald-100 text-emerald-950",
    },
  },
  {
    slug: "batch-normalization",
    title: "Batch Normalization Lab",
    tag: "neural networks",
    kicker:
      "Change mini-batch statistics and watch activations recentered, rescaled, and reshaped.",
    summary:
      "Choose shifted, wide, centered, or outlier mini-batches, inspect how BatchNorm computes normalized values, then tune scale and shift before comparing training with inference statistics.",
    estimatedDuration: "5 to 7 minutes",
    concepts: [
      "Mini-batches",
      "Activation statistics",
      "Batch normalization",
      "Scale and shift",
    ],
    learningGoals: [
      "See how BatchNorm uses mini-batch mean and standard deviation during training.",
      "Connect the normalization formula to the displayed normalized value for one activation.",
      "Understand how learned scale and shift restore output size and center.",
      "Distinguish training-time batch statistics from inference-time running statistics.",
    ],
    presentation: "immersive",
    tutorPlan: playgroundTutorPlans["batch-normalization"],
    theme: {
      badgeClassName: "border-blue-300 bg-blue-100 text-blue-950",
    },
  },
  {
    slug: "layer-normalization",
    title: "Layer Normalization Lab",
    tag: "neural networks",
    kicker:
      "Select one token row and watch its hidden features normalize from their own statistics.",
    summary:
      "Adjust a token's hidden activations, inspect the per-token mean and variance, then tune learned gamma and beta while comparing LayerNorm's row-wise statistics with BatchNorm's batch-wise axis.",
    estimatedDuration: "5 to 7 minutes",
    concepts: [
      "Hidden features",
      "Per-token statistics",
      "Layer normalization",
      "Scale and shift",
    ],
    learningGoals: [
      "See how LayerNorm computes mean and variance across the features inside one token.",
      "Connect the normalization formula to displayed z-score values.",
      "Understand how gamma and beta restore useful feature scale after normalization.",
      "Distinguish LayerNorm's per-token statistics from BatchNorm's batch statistics.",
    ],
    presentation: "immersive",
    tutorPlan: playgroundTutorPlans["layer-normalization"],
    theme: {
      badgeClassName: "border-indigo-300 bg-indigo-100 text-indigo-950",
    },
  },
  {
    slug: "zero-knowledge-proofs",
    title: "Zero Knowledge Proofs Lab",
    tag: "cryptography",
    kicker:
      "Open one random edge and watch confidence grow while the secret coloring stays hidden.",
    summary:
      "Run a graph-coloring proof where a prover commits hidden colors, the verifier challenges one edge, and repeated fresh shuffles prove local checks without revealing the full coloring.",
    estimatedDuration: "5 to 7 minutes",
    concepts: [
      "Provers",
      "Verifiers",
      "Commitments",
      "Zero knowledge",
    ],
    learningGoals: [
      "Understand a proof round as commit, challenge, open, and verify.",
      "See how repeated random edge checks reduce a cheating prover's chance of escaping.",
      "Recognize why fresh hidden shuffles keep local openings from revealing the secret coloring.",
    ],
    presentation: "immersive",
    tutorPlan: playgroundTutorPlans["zero-knowledge-proofs"],
    theme: {
      badgeClassName: "border-violet-300 bg-violet-100 text-violet-950",
    },
  },
] satisfies PlaygroundMetadata[];

export const upcomingPlaygrounds: UpcomingPlayground[] = [
  {
    slug: "law-large-numbers-simulation",
    title: "Law of Large Numbers Simulator",
    tag: "probability",
    summary:
      "Run short and long simulations to see noisy outcomes settle toward expected value.",
    concepts: ["Expected value", "Long-run averages", "Simulation"],
  },
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
    slug: "central-limit-theorem",
    title: "Central Limit Theorem Lab",
    tag: "inference",
    summary:
      "Sample from strange populations and watch sample means form a predictable bell shape.",
    concepts: ["Sample means", "Sampling distributions", "Normal approximation"],
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
    slug: "sampling-distributions-standard-error",
    title: "Sampling Distributions & Standard Error",
    tag: "inference",
    summary:
      "Repeat samples and watch estimate-to-estimate spread become standard error.",
    concepts: ["Sampling distributions", "Standard error", "Estimate spread"],
  },
  {
    slug: "margin-of-error-sample-size",
    title: "Margin of Error & Sample Size Lab",
    tag: "inference",
    summary:
      "Change sample size and confidence level to see interval width expand or shrink.",
    concepts: ["Margin of error", "Sample size", "Confidence level"],
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
    slug: "type-i-type-ii-errors",
    title: "Type I & Type II Errors Lab",
    tag: "inference",
    summary:
      "Move a decision cutoff and compare false alarms with missed real effects.",
    concepts: ["Type I error", "Type II error", "Decision thresholds"],
  },
  {
    slug: "power-effect-size-sample-size",
    title: "Power, Effect Size & Sample Size Lab",
    tag: "inference",
    summary:
      "Adjust effect size and sample size to see when real effects become detectable.",
    concepts: ["Power", "Effect size", "Sample size"],
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
    slug: "least-squares-loss-landscape",
    title: "Least Squares Loss Landscape",
    tag: "regression",
    summary:
      "Move slope and intercept across a loss surface to see why one line minimizes squared residuals.",
    concepts: ["Squared error", "Loss surfaces", "Best fit"],
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
    slug: "bias-variance-tradeoff",
    title: "Bias-Variance Tradeoff Lab",
    tag: "generalization",
    summary:
      "Tune model flexibility and see underfitting, useful fit, and overfitting as bias and variance move.",
    concepts: ["Bias", "Variance", "Model flexibility"],
  },
  {
    slug: "classification-metrics-foundations",
    title: "Classification Metrics Foundations",
    tag: "evaluation",
    summary:
      "Build confusion-matrix intuition before tuning a decision threshold or reading benchmark scores.",
    concepts: ["Accuracy", "Precision", "Recall", "F1"],
  },
  {
    slug: "roc-auc-thresholds",
    title: "ROC, AUC & Thresholds Lab",
    tag: "evaluation",
    summary:
      "Move a threshold across classifier scores and trace true-positive versus false-positive rates.",
    concepts: ["ROC curves", "AUC", "Thresholds"],
  },
  {
    slug: "precision-recall-curves-imbalance",
    title: "Precision-Recall Curves & Imbalance",
    tag: "evaluation",
    summary:
      "Change class balance and trace why precision-recall curves reveal rare-positive tradeoffs.",
    concepts: ["Precision-recall curves", "Class imbalance", "Rare positives"],
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
    slug: "log-loss-confidence-penalties",
    title: "Log Loss Confidence Penalties",
    tag: "loss",
    summary:
      "Move probability mass onto and away from the true class to see confident mistakes get punished.",
    concepts: ["Log loss", "Confidence", "Prediction penalties"],
  },
  {
    slug: "calibration-reliability-diagrams",
    title: "Calibration & Reliability Diagrams",
    tag: "evaluation",
    summary:
      "Compare predicted confidence bins with observed frequencies to spot overconfident classifiers and LLM answers.",
    concepts: ["Calibration", "Reliability diagrams", "ECE", "Abstention"],
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
    slug: "retrieval-ranking-metrics",
    title: "Retrieval Ranking Metrics Lab",
    tag: "retrieval",
    summary:
      "Reorder search results and watch recall@k, precision@k, MRR, and nDCG respond to relevant items moving up or down.",
    concepts: ["Recall@k", "Precision@k", "MRR", "nDCG"],
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
    slug: "activation-functions",
    title: "Activation Functions Lab",
    tag: "neural networks",
    summary:
      "Move input signals through ReLU, sigmoid, and tanh to see how neurons reshape values.",
    concepts: ["ReLU", "Sigmoid", "Tanh"],
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
    slug: "computational-graphs-chain-rule",
    title: "Computational Graphs & Chain Rule",
    tag: "neural networks",
    summary:
      "Trace local derivatives through a small graph before sending credit backward.",
    concepts: ["Computational graphs", "Chain rule", "Local derivatives"],
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
    slug: "rms-normalization",
    title: "RMSNorm Lab",
    tag: "transformers",
    summary:
      "Remove mean-centering and watch root-mean-square scaling keep transformer activations controlled.",
    concepts: ["RMS scaling", "Residual streams", "Transformer stability"],
  },
  {
    slug: "llm-loss-perplexity",
    title: "LLM Loss & Perplexity Lab",
    tag: "llm evaluation",
    summary:
      "Step through next-token predictions and watch token loss, average cross entropy, perplexity, and bits per token update across a sequence.",
    concepts: ["Next-token prediction", "NLL", "Perplexity", "Bits per token"],
  },
  {
    slug: "context-windows-attention-masks",
    title: "Context Windows & Attention Masks",
    tag: "transformers",
    summary:
      "Slide a context window and apply masks to see which tokens can attend to which past text.",
    concepts: ["Context windows", "Attention masks", "Token visibility"],
  },
  {
    slug: "positional-encoding-token-order",
    title: "Positional Encoding & Token Order",
    tag: "transformers",
    summary:
      "Rearrange tokens and compare position signals that let attention recover word order.",
    concepts: ["Token order", "Position encodings", "Sequence representations"],
  },
  {
    slug: "reference-answer-metrics",
    title: "Reference Answer Metrics Lab",
    tag: "llm evaluation",
    summary:
      "Compare generated answers with references and see why exact match, token F1, BLEU, ROUGE, and semantic similarity can disagree.",
    concepts: ["Exact match", "Token F1", "BLEU", "ROUGE"],
  },
  {
    slug: "benchmark-scores-pass-k",
    title: "Benchmark Scores & Pass@k Lab",
    tag: "llm evaluation",
    summary:
      "Run sampled benchmark attempts and watch accuracy, pass@k, majority vote, variance, and contamination change the score story.",
    concepts: ["Benchmark accuracy", "Pass@k", "Variance", "Contamination"],
  },
  {
    slug: "preference-judge-metrics",
    title: "Preference & Judge Metrics Lab",
    tag: "llm evaluation",
    summary:
      "Compare two model answers with rubrics and judge votes to see how win rates, pairwise ratings, and evaluator bias shape rankings.",
    concepts: ["Win rate", "Rubrics", "Judge bias", "Agreement"],
  },
  {
    slug: "rag-groundedness-metrics",
    title: "RAG Groundedness Metrics Lab",
    tag: "llm evaluation",
    summary:
      "Connect retrieved context to an answer and inspect context relevance, faithfulness, citation support, and answer completeness.",
    concepts: ["Context relevance", "Faithfulness", "Citation support", "Completeness"],
  },
  {
    slug: "safety-refusal-robustness-metrics",
    title: "Safety, Refusal & Robustness Metrics Lab",
    tag: "llm evaluation",
    summary:
      "Vary prompts and policies to compare harmful-compliance rate, false-refusal rate, jailbreak success, and robustness across prompt variants.",
    concepts: ["Harmful compliance", "False refusal", "Jailbreak success", "Robustness"],
  },
  {
    slug: "llm-app-ops-metrics",
    title: "LLM App Ops Metrics Lab",
    tag: "llm systems",
    summary:
      "Tune request patterns and streaming behavior to compare latency, time to first token, throughput, cost, and cache hit rate.",
    concepts: ["Latency", "TTFT", "Throughput", "Cost per request"],
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
  "expected-value-risk",
  "law-large-numbers-simulation",
  "bernoulli-categorical-binomial",
  "waiting-arrival-distributions",
  "pdf-cdf-probability-area",
  "normal-distribution-z-scores",
  "sampling-sample-size",
  "sampling-bias",
  "sampling-distributions-standard-error",
  "central-limit-theorem",
  "margin-of-error-sample-size",
  "confidence-intervals",
  "hypothesis-testing-basics",
  "type-i-type-ii-errors",
  "power-effect-size-sample-size",
  "covariance-correlation",
  "correlation-shape-outliers",
  "simpsons-paradox-confounding",
  "linear-regression-line-fitting",
  "least-squares-loss-landscape",
  "r-squared-residual-diagnostics",
  "train-test-generalization",
  "overfitting",
  "bias-variance-tradeoff",
  "classification-metrics-foundations",
  "confusion-matrix-thresholds",
  "roc-auc-thresholds",
  "precision-recall-curves-imbalance",
  "feature-scaling",
  "distance-metrics",
  "vector-geometry-similarity",
  "matrix-multiplication",
  "projection-foundations",
  "pca-principal-components",
  "t-sne-neighborhood-map",
  "umap-manifold-projection",
  "embedding-retrieval",
  "retrieval-ranking-metrics",
  "entropy-information",
  "class-score-logits",
  "softmax-temperature",
  "log-loss-confidence-penalties",
  "categorical-cross-entropy",
  "calibration-reliability-diagrams",
  "kl-divergence",
  "contrastive-loss",
  "gradient-descent",
  "regularization",
  "k-means-clustering",
  "exploration-exploitation",
  "monte-carlo-tree-search",
  "activation-functions",
  "neural-network-forward-pass",
  "computational-graphs-chain-rule",
  "backpropagation-inspector",
  "batch-normalization",
  "byte-pair-encoding",
  "llm-loss-perplexity",
  "context-windows-attention-masks",
  "positional-encoding-token-order",
  "transformer-attention",
  "layer-normalization",
  "rms-normalization",
  "linear-quantization-int4",
  "reference-answer-metrics",
  "benchmark-scores-pass-k",
  "preference-judge-metrics",
  "rag-groundedness-metrics",
  "safety-refusal-robustness-metrics",
  "llm-app-ops-metrics",
  "zero-knowledge-proofs",
] as const;

function getPlaygroundMetadata(slug: string) {
  return activePlaygroundMetadata.find((playground) => playground.slug === slug);
}

export function getPlaygroundMetadataFromPathname(pathname?: string) {
  const slug = pathname?.split("/").filter(Boolean).at(-1);

  return slug ? getPlaygroundMetadata(slug) : undefined;
}
