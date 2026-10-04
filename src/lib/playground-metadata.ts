import {
  playgroundTutorPlans,
  type TutorPlan,
} from "@/lib/tutor-plans";

export type PlaygroundMetadata = {
  slug: string;
  title: string;
  tag: string;
  kicker: string;
  summary: string;
  estimatedDuration: string;
  concepts: string[];
  learningGoals: string[];
  tutorPlan: TutorPlan;
  layout?: "guided-discovery";
};

type UpcomingPlayground = {
  slug: string;
  title: string;
  tag: string;
  summary: string;
  concepts: string[];
};

type ActivePlaygroundDefinition = Omit<PlaygroundMetadata, "tutorPlan"> & {
  slug: keyof typeof playgroundTutorPlans;
};

// The landing dashboard is the canonical lesson plan for both live and planned
// playgrounds. Keep this metadata and the dashboard order in sync with what `/`
// should show.
const activePlaygroundDefinitions = [
  {
    slug: "reference-answer-metrics",
    layout: "guided-discovery",
    kicker: "Compare answers. See what each metric counts.",
    estimatedDuration: "7 to 10 minutes",
    learningGoals: ["State the text normalization and metric conventions.", "Separate clipped overlap, adjacent pairs and ordered subsequences.", "Reject similarity as a correctness probability.", "Transfer to a changed reference and boundary examples."],
    title: "Reference Answer Metrics Lab",
    tag: "llm evaluation",
    summary:
      "Compare authored answers with references and trace why exact match, token F1, BLEU, ROUGE, and toy vector similarity disagree.",
    concepts: ["Exact match", "Token F1", "BLEU", "ROUGE"],
  },

  {
    slug: "rms-normalization",
    layout: "guided-discovery",
    kicker: "Rescale a vector. Compare RMS scaling with mean centering.",
    estimatedDuration: "7 to 10 minutes",
    learningGoals: ["Separate RMS scaling from mean centering.", "Trace epsilon inside the root and gain after normalization.", "Explain exact rescaling and singular denominator boundaries.", "Transfer to a centered vector without a unit-RMS guarantee."],
    title: "RMSNorm Lab",
    tag: "transformers",
    summary:
      "Remove mean-centering and watch root-mean-square scaling keep transformer activations controlled.",
    concepts: ["RMS scaling", "Residual streams", "Transformer stability"],
  },

  {
    slug: "positional-encoding-token-order",
    layout: "guided-discovery",
    kicker: "Rearrange tokens. Compare identity with position signals.",
    estimatedDuration: "7 to 10 minutes",
    learningGoals: ["Separate token identity from zero-based position.", "Compare unchanged, additive and rotary query/key vectors.", "Explain raw-score dependence on relative offsets.", "Transfer a reordered and shifted sequence without language-understanding claims."],
    title: "Positional Encoding & Token Order",
    tag: "transformers",
    summary:
      "Rearrange tokens and compare position signals that let attention recover word order.",
    concepts: ["Token order", "Position encodings", "Sequence representations"],
  },
  {
    slug: "context-windows-attention-masks",
    layout: "guided-discovery",
    kicker: "Move the context window. See which keys each query may use.",
    estimatedDuration: "6 to 9 minutes",
    learningGoals: ["Read query rows and key columns with self-inclusive causal direction.", "Intersect window, direction and padding-key eligibility.", "Separate key exclusion from padding-query policy.", "Transfer to new masks without inventing attention weights."],
    title: "Context Windows & Attention Masks",
    tag: "transformers",
    summary:
      "Slide a context window and apply masks to see which tokens can attend to which past text.",
    concepts: ["Context windows", "Attention masks", "Token visibility"],
  },
  {
    slug: "llm-loss-perplexity",
    layout: "guided-discovery",
    kicker: "Change a token probability. Compare local cost with sequence cost.",
    estimatedDuration: "6 to 9 minutes",
    learningGoals: ["Trace a prior-only prefix to actual next-token log loss.", "Average all scored target costs before exponentiating.", "Relate natural-log loss, perplexity and bits per token.", "Handle probability endpoints and transfer a new sequence cost."],
    title: "LLM Loss & Perplexity Lab",
    tag: "llm evaluation",
    summary:
      "Step through next-token predictions and watch token loss, average cross entropy, perplexity, and bits per token update across a sequence.",
    concepts: ["Next-token prediction", "NLL", "Perplexity", "Bits per token"],
  },

  {
    slug: "neural-network-forward-pass",
    layout: "guided-discovery",
    kicker: "Change one weight. Trace the signal to class scores.",
    estimatedDuration: "6 to 9 minutes",
    learningGoals: ["Trace weighted inputs, bias and ReLU through a tiny network.", "Compare upstream changes with direct output-edge changes.", "Explain a changed hidden sum with unchanged activation.", "Reconstruct a new path to raw class scores."],
    title: "Neural Network Forward Pass Lab",
    tag: "neural networks",
    summary:
      "Move weights in a tiny network and watch inputs become class scores.",
    concepts: ["Layers", "Weights", "Activations"],
  },

  {
    slug: "activation-functions",
    layout: "guided-discovery",
    kicker: "Change the input. Compare three activation rules.",
    estimatedDuration: "5 to 8 minutes",
    learningGoals: ["Separate shared input from activation-specific output.", "Apply ReLU clipping and compare zero-input outputs.", "Compare linear growth with bounded saturation.", "Interpret a new negative input without probability claims."],
    title: "Activation Functions Lab",
    tag: "neural networks",
    summary:
      "Move input signals through ReLU, sigmoid, and tanh to see how neurons reshape values.",
    concepts: ["ReLU", "Sigmoid", "Tanh"],
  },
  {
    slug: "exploration-exploitation",
    layout: "guided-discovery",
    kicker: "Compare observed reward with a reason to explore.",
    estimatedDuration: "6 to 9 minutes",
    learningGoals: ["Separate observed rewards, means and policy scores.", "Compare greedy selection with a UCB count bonus.", "Explain a rule change without changing past observations.", "Reconstruct new trial counts and alphabetical score ties."],
    title: "Exploration vs Exploitation Lab",
    tag: "search",
    summary:
      "Allocate trials across options and watch a policy balance rewards against learning value.",
    concepts: ["Exploration", "Exploitation", "UCB"],
  },
  {
    slug: "k-means-clustering",
    layout: "guided-discovery",
    kicker: "Assign members. Then move their centroids.",
    estimatedDuration: "6 to 9 minutes",
    learningGoals: ["Assign nearest members from squared distances and the tie rule.", "Compute coordinate means while keeping memberships fixed.", "Handle an empty group's undefined mean under an explicit policy.", "Reconstruct held SSE without accuracy or global-optimum claims."],
    title: "K-Means Clustering Studio",
    tag: "clustering",
    summary:
      "Place points and centroids, then step through assign/update cycles.",
    concepts: ["Centroids", "Assignment", "Clusters"],
  },
  {
    slug: "regularization",
    layout: "guided-discovery",
    kicker: "Choose a penalty. Then fit the weights.",
    estimatedDuration: "7 to 10 minutes",
    learningGoals: [
      "Separate data loss, penalty and objective before fitting.",
      "Compare L1 coefficient zeros with L2 common shrinkage.",
      "Reconstruct fixed-case scores, ties and decision boundaries.",
      "Interpret grid optima without a held-out performance claim.",
    ],
    title: "Regularization Lab",
    tag: "optimization",
    summary:
      "Compare None, L1 and L2 on a fixed toy scorer, separate penalty selection from an explicit weight-grid fit, and track data loss, sparse weights, score ties and boundaries.",
    concepts: ["L1", "L2", "Penalty strength"],
  },
  {
    slug: "contrastive-loss",
    layout: "guided-discovery",
    kicker: "Move pairs. Watch the margin stop the penalty.",
    estimatedDuration: "6 to 9 minutes",
    learningGoals: [
      "Choose each pair penalty from its fixed similarity label.",
      "Explain zero dissimilar penalty at and beyond the margin.",
      "Separate margin changes from fixed embedding coordinates.",
      "Reconstruct two pair penalties after moving their shared anchor.",
    ],
    title: "Contrastive Loss Lab",
    tag: "loss",
    summary:
      "Move three scalar embeddings and tune a positive margin to reconstruct fixed similar and dissimilar pair penalties, their mean, and shared-anchor effects.",
    concepts: ["Anchor pairs", "Margins", "Representation learning"],
  },
  {
    slug: "calibration-reliability-diagrams",
    layout: "guided-discovery",
    kicker: "Compare confidence with observed correctness.",
    estimatedDuration: "7 to 10 minutes",
    learningGoals: [
      "Reconstruct bin means, observed rates and count-weighted gaps.",
      "Separate confidence edits from fixed correctness counts.",
      "Explain ECE binning dependence without claiming improved predictions.",
      "Interpret abstention coverage, retained denominators and empty sets.",
    ],
    title: "Calibration & Reliability Diagrams",
    tag: "evaluation",
    summary:
      "Compare predicted confidence bins with observed frequencies to spot overconfident classifiers and LLM answers.",
    concepts: ["Calibration", "Reliability diagrams", "ECE", "Abstention"],
  },
  {
    slug: "log-loss-confidence-penalties",
    layout: "guided-discovery",
    kicker: "Same labels; different penalties.",
    estimatedDuration: "6 to 9 minutes",
    learningGoals: [
      "Use each known true outcome to determine its probability penalty.",
      "Explain increasing confident-mistake loss at unchanged accuracy.",
      "Handle zero and one probabilities without hiding infinite loss.",
      "Average all examples without omitting mistakes or zero terms.",
    ],
    title: "Log Loss Confidence Penalties",
    tag: "loss",
    summary:
      "Move probability mass onto and away from the true class to see confident mistakes get punished.",
    concepts: ["Log loss", "Confidence", "Prediction penalties"],
  },

  {
    slug: "class-score-logits",
    layout: "guided-discovery",
    kicker: "Move scores; separate the winner from its gap.",
    estimatedDuration: "6 to 9 minutes",
    learningGoals: [
      "Edit one raw class score and reconstruct the winner and top-two gap.",
      "Explain common-shift invariance, including negative scores.",
      "Separate positive scale-dependent margins from probabilities or correctness.",
      "Handle tied maxima and deterministic class selection.",
    ],
    title: "Class Scores & Logits Lab",
    tag: "classification",
    summary:
      "Move raw class scores before converting them into probabilities.",
    concepts: ["Class scores", "Logits", "Decision margins"],
  },
  {
    slug: "entropy-information",
    layout: "guided-discovery",
    kicker: "Move mass; distinguish surprise from uncertainty.",
    estimatedDuration: "7 to 10 minutes",
    learningGoals: [
      "Move conserved probability mass and reconstruct entropy as weighted surprise in bits.",
      "Distinguish rare-outcome surprise from average uncertainty.",
      "Compute expected information gain from a probability-weighted group observation.",
      "Handle impossible outcomes/groups and certainty without false infinities or accuracy claims.",
    ],
    title: "Entropy & Information Starter",
    tag: "information",
    summary:
      "Move probability mass across buckets and watch uncertainty shrink or spread.",
    concepts: ["Surprise", "Entropy", "Information gain"],
  },
  {
    slug: "retrieval-ranking-metrics",
    layout: "guided-discovery",
    kicker: "Reorder results; separate metric questions.",
    estimatedDuration: "7 to 10 minutes",
    learningGoals: [
      "Separate returned-set precision/recall from rank-sensitive first-hit and graded utility.",
      "Reconstruct precision/recall denominators as the result count changes.",
      "Trace exponential gain, logarithmic discount and same-k ideal nDCG.",
      "Distinguish per-query RR from two-query MRR and state empty-query conventions.",
    ],
    title: "Retrieval Ranking Metrics Lab",
    tag: "retrieval",
    summary:
      "Reorder search results and watch recall@k, precision@k, MRR, and nDCG respond to relevant items moving up or down.",
    concepts: ["Recall@k", "Precision@k", "MRR", "nDCG"],
  },
  {
    slug: "embedding-retrieval",
    layout: "guided-discovery",
    kicker: "Move a query; track the ranked results.",
    estimatedDuration: "6 to 9 minutes",
    learningGoals: [
      "Trace query-caused reordering while stored vectors stay fixed.",
      "Distinguish raw Euclidean proximity from nonzero cosine alignment.",
      "Separate top-k selection from scores and semantic relevance.",
      "Preserve duplicate IDs and handle undefined zero-vector cosine.",
    ],
    title: "Embedding Retrieval Lab",
    tag: "retrieval",
    summary:
      "Move a query point and watch retrieved items reorder.",
    concepts: ["Embeddings", "Query vectors", "Nearest-neighbor retrieval"],
  },
  {
    slug: "umap-manifold-projection",
    layout: "guided-discovery",
    title: "UMAP Manifold Projection Lab",
    tag: "dimensionality",
    kicker: "Change graph scale; inspect map packing.",
    estimatedDuration: "7 to 10 minutes",
    summary: "Adjust neighbor and distance settings to compare local clusters with global shape.",
    concepts: ["UMAP", "Nearest neighbors", "Manifold structure"],
    learningGoals: [
      "Trace source graph connectivity as neighborhood scale changes.",
      "Separate map packing from source graph membership and normalized probability rows.",
      "Explain soft minimum-distance behavior and finite graph-objective fitting.",
      "Transfer local distance normalization to uniform source rescaling without global-unit guarantees.",
    ],
  },
  {
    slug: "t-sne-neighborhood-map",
    layout: "guided-discovery",
    title: "t-SNE Neighborhood Map",
    tag: "dimensionality",
    kicker: "Tune neighborhoods; inspect the map’s limits.",
    estimatedDuration: "7 to 10 minutes",
    summary: "Tune perplexity and see how local neighborhoods become a two-dimensional map.",
    concepts: ["t-SNE", "Perplexity", "Local neighborhoods"],
    learningGoals: [
      "Interpret perplexity as effective neighborhood size rather than a hard count.",
      "Distinguish conditional Gaussian rows from globally normalized joint P and Q.",
      "Trace fixed-objective optimization without global-distance or accuracy guarantees.",
      "Handle initialization dependence and duplicate identities in finite maps.",
    ],
  },
  {
    slug: "pca-principal-components",
    layout: "guided-discovery",
    title: "PCA & Principal Components Lab",
    tag: "dimensionality",
    kicker: "Rotate centered axes; decide what to keep.",
    estimatedDuration: "7 to 10 minutes",
    summary: "Rotate principal axes and watch variance concentrate into fewer dimensions.",
    concepts: ["PCA", "Principal components", "Variance captured"],
    learningGoals: [
      "Center original points and distinguish scores from raw reconstruction.",
      "Compare manual-axis variance with the computed PC1 maximum.",
      "Explain one-component loss and a complete two-component reconstruction.",
      "Handle non-unique principal directions and undefined zero-variance ratios without task-quality claims.",
    ],
  },
  {
    slug: "projection-foundations",
    layout: "guided-discovery",
    title: "Projection Foundations Lab",
    tag: "vectors",
    kicker: "Rotate an axis; see what one component keeps.",
    estimatedDuration: "6 to 9 minutes",
    summary: "Rotate a projection axis and watch points collapse onto one dimension.",
    concepts: ["Projection", "Components", "Reconstruction error"],
    learningGoals: [
      "Distinguish a signed scalar component from its reconstructed 2D projection.",
      "Compute squared perpendicular loss while original points stay fixed.",
      "Explain when an origin-line projection exactly reconstructs these points.",
      "Transfer to perpendicular collapse and direction reversal without task-quality claims.",
    ],
  },
  {
    slug: "vector-geometry-similarity",
    layout: "guided-discovery",
    title: "Vector Geometry & Similarity Lab",
    tag: "vectors",
    kicker: "Move vectors; separate length from alignment.",
    estimatedDuration: "6 to 9 minutes",
    summary: "Move vectors in 2D before connecting the same geometry to embeddings.",
    concepts: ["Dot products", "Magnitude", "Cosine similarity"],
    learningGoals: [
      "Reconstruct signed coordinate products and both vector magnitudes.",
      "Explain positive length cancellation in cosine without equating dot and cosine.",
      "Distinguish same, perpendicular and opposite nonzero directions.",
      "Handle zero-vector undefinedness without probability or semantic guarantees.",
    ],
  },
  {
    slug: "distance-metrics",
    layout: "guided-discovery",
    title: "Distance Metrics Lab",
    tag: "features",
    kicker: "Move a query; compare what closest means.",
    estimatedDuration: "6 to 9 minutes",
    summary: "Move points on a grid and compare nearest-neighbor decisions.",
    concepts: ["Euclidean distance", "Manhattan distance", "Nearest neighbors"],
    learningGoals: [
      "Compute Euclidean and Manhattan distances from the same coordinate differences.",
      "Isolate metric-only and query-only changes to one-neighbor decisions.",
      "Retain exact ties and coincident identities under an explicit decision policy.",
      "Distinguish nearest labels from probabilities and measured accuracy.",
    ],
  },
  {
    slug: "feature-scaling",
    layout: "guided-discovery",
    title: "Feature Scaling Lab",
    tag: "features",
    kicker: "Change units; compare column transformations.",
    estimatedDuration: "7 to 10 minutes",
    summary:
      "Rescale axes or features and watch the same points become comparable.",
    concepts: ["Normalization", "Standardization", "Min-max scaling"],
    learningGoals: [
      "Trace unit changes to raw numerical contributions without adding information.",
      "Reconstruct column-specific min–max normalization and unit cancellation.",
      "Distinguish z-score center and spread from bounds, normality and outlier removal.",
      "Handle constant reference features without a unit-variance or accuracy guarantee.",
    ],
  },
  {
    slug: "precision-recall-curves-imbalance",
    layout: "guided-discovery",
    title: "Precision-Recall Curves & Imbalance",
    tag: "evaluation",
    kicker: "Make positives rare; inspect accepted predictions.",
    estimatedDuration: "7 to 10 minutes",
    summary:
      "Change class balance and trace why precision-recall curves reveal rare-positive tradeoffs.",
    concepts: ["Precision-recall curves", "Class imbalance", "Rare positives"],
    learningGoals: [
      "Isolate prevalence effects while preserving class-specific score frequencies.",
      "Reconstruct precision and recall with their different denominators.",
      "Separate threshold precision from non-interpolated average precision.",
      "Handle non-monotonic precision, tied scores and undefined empty-set precision.",
    ],
  },
  {
    slug: "roc-auc-thresholds",
    layout: "guided-discovery",
    title: "ROC, AUC & Thresholds Lab",
    tag: "evaluation",
    kicker: "Move one operating point; inspect the whole ranking.",
    estimatedDuration: "6 to 9 minutes",
    summary:
      "Move a threshold across classifier scores and trace true-positive versus false-positive rates.",
    concepts: ["ROC curves", "AUC", "Thresholds"],
    learningGoals: [
      "Reconstruct true-positive and false-positive rates using actual-class denominators.",
      "Separate threshold decisions from whole-ranking ROC area.",
      "Group tied scores and count pair ties half in AUC.",
      "Transfer to reversed scores without calibration or future-performance guarantees.",
    ],
  },
  {
    slug: "classification-metrics-foundations",
    layout: "guided-discovery",
    title: "Classification Metrics Foundations",
    tag: "evaluation",
    kicker: "Count the cases behind each score.",
    estimatedDuration: "6 to 9 minutes",
    summary:
      "Build confusion-matrix intuition before tuning a decision threshold or reading benchmark scores.",
    concepts: ["Accuracy", "Precision", "Recall", "F1"],
    learningGoals: [
      "Trace actual and predicted labels to the four confusion cells.",
      "Distinguish accuracy, precision and recall denominators.",
      "Calculate F1 and preserve undefined zero-denominator cases.",
      "Transfer across class balance without universal metric or future-performance claims.",
    ],
  },
  {
    slug: "bias-variance-tradeoff",
    layout: "guided-discovery",
    title: "Bias-Variance Tradeoff Lab",
    tag: "generalization",
    kicker: "Compare repeated fits, not just one training score.",
    estimatedDuration: "7 to 10 minutes",
    summary:
      "Tune model flexibility and see underfitting, useful fit, and overfitting as bias and variance move.",
    concepts: ["Bias", "Variance", "Model flexibility"],
    learningGoals: [
      "Separate average-fit bias from repeated-training variance at a fixed prediction location.",
      "Reconstruct expected squared error with independent response noise.",
      "Reject zero-training-error and universal model-complexity guarantees.",
      "Transfer to a new noise and probe condition without conflating one fit with an expectation.",
    ],
  },
  {
    slug: "train-test-generalization",
    layout: "guided-discovery",
    title: "Train/Test Split & Generalization Lab",
    tag: "generalization",
    kicker: "Fit on one group; evaluate on another.",
    estimatedDuration: "6 to 9 minutes",
    summary:
      "Compare known-data fit with held-out prediction and expose data leakage.",
    concepts: ["Train/test split", "Validation sets", "Data leakage"],
    learningGoals: [
      "Distinguish fitting-row errors from unused validation and test errors.",
      "Use validation for model choice and later test evaluation without refitting.",
      "Trace leaked fitting information and reject contaminated score guarantees.",
      "Transfer to a different fixed split without universal error-ordering claims.",
    ],
  },
  {
    slug: "r-squared-residual-diagnostics",
    layout: "guided-discovery",
    title: "R Squared & Residual Diagnostics",
    tag: "regression",
    kicker: "Compare the score; inspect what the residuals hide.",
    estimatedDuration: "6 to 9 minutes",
    summary:
      "Pair the same fit score with different residual patterns to spot misleading models.",
    concepts: ["R squared", "Residual plots", "Unexplained variance"],
    learningGoals: [
      "Reconstruct R² against the observed-mean squared-error benchmark.",
      "Distinguish coordinate changes from data and prediction changes.",
      "Compare equal-score residual patterns without causal or validity claims.",
      "Interpret zero, negative and new-scale scores with appropriate limits.",
    ],
  },
  {
    slug: "least-squares-loss-landscape",
    layout: "guided-discovery",
    title: "Least Squares Loss Landscape",
    tag: "regression",
    kicker: "Move two parameters; compare squared error across lines.",
    estimatedDuration: "6 to 9 minutes",
    summary:
      "Move slope and intercept across a loss surface to see why one line minimizes squared residuals.",
    concepts: ["Squared error", "Loss surfaces", "Best fit"],
    learningGoals: [
      "Read slope/intercept coordinates as one line for fixed observations.",
      "Distinguish signed cancellation from squared error.",
      "Explain equal-error contours and a unique positive joint minimum.",
      "Transfer to a balanced but nonminimal pair without causal guarantees.",
    ],
  },
  {
    slug: "linear-regression-line-fitting",
    layout: "guided-discovery",
    title: "Linear Regression Line Fitting",
    tag: "regression",
    kicker: "Move a line; explain slope, intercept and vertical residuals.",
    summary: "Drag a regression line before revealing the least-squares best-fit line.",
    estimatedDuration: "6 to 9 minutes",
    concepts: ["Slope", "Intercept", "Residuals"],
    learningGoals: [
      "Separate slope pivots from intercept shifts while observations stay fixed.",
      "Compute signed vertical observed-minus-predicted residuals and their squared sum.",
      "Compare a preserved attempt with a revealed least-squares reference.",
      "Transfer to descending data without causal or new-data guarantees.",
    ],
  },
  {
    slug: "simpsons-paradox-confounding",
    layout: "guided-discovery",
    title: "Simpson's Paradox & Confounding Lab",
    tag: "relationships",
    kicker: "Change task mixes; compare grouped and overall success.",
    summary: "Toggle subgroup and combined views to see an apparent relationship reverse.",
    estimatedDuration: "6 to 9 minutes",
    concepts: ["Confounders", "Grouped relationships", "Causation"],
    learningGoals: [
      "Reconstruct overall rates using each algorithm’s own subgroup weights.",
      "Distinguish view changes from mix changes and fixed subgroup performance.",
      "Explain reversal and amplification without causal claims from counts alone.",
      "Transfer to a new mix and handle absent subgroups as undefined.",
    ],
  },
  {
    slug: "correlation-shape-outliers",
    layout: "guided-discovery",
    title: "Correlation Shape & Outliers Lab",
    tag: "relationships",
    kicker: "Move one pair; compare straight-line and rank alignment.",
    summary: "Switch among datasets and drag outliers to compare correlation metrics.",
    estimatedDuration: "7 to 10 minutes",
    concepts: ["Spearman correlation", "Nonlinear relationships", "Outliers"],
    learningGoals: [
      "Compare numeric straight-line alignment with strict monotonic rank agreement.",
      "Recognize nonlinear dependence despite zero correlation and influence on both metrics.",
      "Handle average ties and preserve paired observations when computing Spearman.",
      "Transfer to new spacings without causal or automatic data-removal claims.",
    ],
  },
  {
    slug: "covariance-correlation",
    layout: "guided-discovery",
    title: "Covariance & Correlation Map",
    tag: "relationships",
    kicker: "Move paired values; separate direction, strength and units.",
    summary: "Drag points on a scatterplot and watch direction, strength, and scale sensitivity update.",
    estimatedDuration: "7 to 10 minutes",
    concepts: ["Covariance", "Pearson correlation", "Scale sensitivity"],
    learningGoals: [
      "Connect signed paired departures with covariance and correlation direction.",
      "Explain why positive unit scaling changes covariance but preserves Pearson r.",
      "Recompute centers after point edits and distinguish zero correlation from zero-spread undefined correlation.",
      "Transfer to a new edited pair and unit scale without causal or probability claims.",
    ],
  },
  {
    slug: "mean-median-mode",
    layout: "guided-discovery",
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
  },
  {
    slug: "range-quartiles-iqr",
    layout: "guided-discovery",
    title: "Range, Quartiles & IQR Explorer",
    tag: "statistics",
    kicker:
      "Move one value and compare the full span with the middle half.",
    summary:
      "Predict, move one value, and explain how range and IQR change. Read aligned number lines, a box plot, and the sorted pairs that determine each quartile.",
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
  },
  {
    slug: "variance-standard-deviation",
    layout: "guided-discovery",
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
  },
  {
    slug: "shape-skew-outliers",
    layout: "guided-discovery",
    title: "Shape, Skew & Outliers Lab",
    tag: "statistics",
    kicker:
      "Move one point and read piles, tails, and gaps before choosing a summary.",
    summary:
      "Explore four distribution shapes, compare the same points before and after a move, and discover what histograms, box plots, and robust summaries reveal or hide.",
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
  },
  {
    slug: "probability-rules",
    layout: "guided-discovery",
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
  },
  {
    slug: "conditional-probability",
    layout: "guided-discovery",
    title: "Conditional Probability & Independence Lab",
    tag: "probability",
    kicker:
      "Filter a population and see why conditional probability changes the denominator first.",
    summary:
      "Compare independent, dependent, and base-rate populations with an exact count table and optional 100-person grid. Three guided experiments and a transfer check connect marginal, joint, and conditional fractions to their reference groups.",
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
  },
  {
    slug: "bayes-rule",
    layout: "guided-discovery",
    title: "Bayes Rule Playground",
    tag: "probability",
    kicker:
      "Tune base rates and test errors to see why a positive signal can still be uncertain.",
    summary:
      "Adjust prevalence, sensitivity, and false-positive rate in medical-test and fraud-alert models. Exact expected counts, three guided experiments, and a transfer check show how both positive-result pools determine the posterior.",
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
  },
  {
    slug: "expected-value-risk",
    layout: "guided-discovery",
    title: "Expected Value & Risk Lab",
    tag: "probability",
    kicker:
      "Tune two bets and see why the best long-run average can still swing hard.",
    summary:
      "Weight two fictional bets by their probabilities, separate average payoff from per-round spread, cross break-even and compare repeatable finite samples with model expectations.",
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
  },
  {
    slug: "law-large-numbers-simulation",
    layout: "guided-discovery",
    title: "Law of Large Numbers Simulator",
    tag: "probability",
    kicker: "Extend one reproducible run and separate its average from its individual outcomes.",
    summary: "Run short and long seeded simulations to compare observed averages with their model expectations, inspect temporary reversals and reject exact finite guarantees.",
    estimatedDuration: "7 to 10 minutes",
    concepts: ["Expected value", "Long-run averages", "Simulation"],
    learningGoals: [
      "Compare average gaps with absolute count gaps while extending the same run.",
      "Recognize that a running average can move away after another draw.",
      "Change a reproducible sequence without changing its fixed distribution or demanding a compensating outcome.",
      "Use the correct model expectation as the long-run target, even when it is not a possible individual outcome.",
      "State the independent fixed-distribution assumptions and reject finite guarantees.",
    ],
  },
  {
    slug: "pdf-cdf-probability-area",
    layout: "guided-discovery",
    title: "PDF, CDF & Probability Area Lab",
    tag: "probability",
    kicker: "Connect density area to cumulative endpoint differences.",
    summary: "Move interval bounds across exact density models and compare shaded area with cumulative probability, including zero-width intervals and density above one.",
    estimatedDuration: "7 to 10 minutes",
    concepts: ["PDFs", "CDFs", "Continuous variables"],
    learningGoals: [
      "Calculate flat density interval probability as width times height.",
      "Distinguish positive density from zero point probability in continuous density models.",
      "Explain why density can exceed one while probability cannot.",
      "Equate density area with a cumulative endpoint difference.",
      "Compare equal-width intervals under a nonuniform density and transfer to a new interval.",
    ],
  },
  {
    slug: "normal-distribution-z-scores",
    layout: "guided-discovery",
    title: "Normal Distribution & Z-Scores Lab",
    tag: "probability",
    kicker: "Read signed distance in standard-deviation units and compare normal tails.",
    summary: "Move a value across an assumed normal model and connect raw distance, z-score and tail probability while changing the mean and spread.",
    estimatedDuration: "7 to 10 minutes",
    concepts: ["Normal distribution", "Z-scores", "Tail probabilities"],
    learningGoals: [
      "Calculate signed z-distance relative to the model mean and positive standard deviation.",
      "Choose the correct normal tail and distinguish probability from density height or z.",
      "Preserve relative position when moving mean and value together.",
      "Explain how spread changes normal tail probability at a fixed raw distance.",
      "Transfer across model locations and scales while retaining the normality assumption.",
    ],
  },
  {
    slug: "bernoulli-categorical-binomial",
    layout: "guided-discovery",
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
  },
  {
    slug: "waiting-arrival-distributions",
    layout: "guided-discovery",
    title: "Waiting & Arrival Distributions Lab",
    tag: "probability",
    kicker:
      "Tune one event chance and watch waits stretch while arrival counts shift.",
    summary:
      "Move a per-second event chance, change the time window, and compare exact geometric waits with a Poisson count approximation and exact tick probabilities.",
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
      "Distinguish exact tick probability from Poisson approximation and the small-expected-count probability shortcut.",
    ],
  },
  {
    slug: "power-effect-size-sample-size",
    layout: "guided-discovery",
    title: "Power, Effect Size & Sample Size Lab",
    tag: "inference",
    kicker: "Change a true effect or study size; compare detection probability.",
    summary: "Adjust effect size and sample size to see when real effects become detectable.",
    estimatedDuration: "8 to 11 minutes",
    concepts: ["Power", "Effect size", "Sample size"],
    learningGoals: [
      "Separate assumed true effect, standardized effect, expected Z and difference standard error.",
      "Explain size and effect-magnitude changes in conditional detection probability.",
      "Keep two-sided sign symmetry and null false alarms distinct from real-effect detection.",
      "Transfer to a new plan without posterior, causal or certainty claims.",
    ],
  },
  {
    slug: "type-i-type-ii-errors",
    layout: "guided-discovery",
    title: "Type I & Type II Errors Lab",
    tag: "inference",
    kicker: "Move a cutoff; compare false alarms and missed effects.",
    summary: "Move a decision cutoff and compare false alarms with missed real effects.",
    estimatedDuration: "7 to 10 minutes",
    concepts: ["Type I error", "Type II error", "Decision thresholds"],
    learningGoals: [
      "Define Type I and Type II errors from both population truth and a decision.",
      "Explain the cutoff tradeoff for fixed null and alternative probability laws.",
      "Separate one known-truth outcome from conditional repeated-test rates and posterior claims.",
      "Transfer the distinction to a missed real-effect example.",
    ],
  },
  {
    slug: "hypothesis-testing-basics",
    layout: "guided-discovery",
    title: "Hypothesis Testing Basics",
    tag: "inference",
    kicker: "Compare an A/B gap with what the null model predicts.",
    summary: "Use one clean A/B test to connect null hypotheses, p-values, and decision rules.",
    estimatedDuration: "8 to 11 minutes",
    concepts: ["Null hypothesis", "P-values", "Significance"],
    learningGoals: [
      "Interpret a two-sided p-value as null-model tail evidence rather than posterior truth probability.",
      "Separate a predeclared significance rule from the observed evidence.",
      "Distinguish failure to reject, raw magnitude, precision, significance and causal validity.",
      "Treat opposite directions symmetrically and transfer to a new size and threshold.",
    ],
  },
  {
    slug: "confidence-intervals",
    layout: "guided-discovery",
    title: "Confidence Intervals Explorer",
    tag: "inference",
    kicker: "See which repeated intervals capture the fixed true mean.",
    summary: "Run many simulated samples and show which intervals capture the true population value.",
    estimatedDuration: "7 to 10 minutes",
    concepts: ["Confidence intervals", "Coverage", "Interval width"],
    learningGoals: [
      "Distinguish fixed population truth from moving sample means and intervals.",
      "Separate finite coverage from a selected repeated-procedure confidence level.",
      "Explain confidence-width and size-precision tradeoffs under a stated model.",
      "Reject posterior, individual-value and guaranteed-coverage claims while transferring to another batch.",
    ],
  },
  {
    slug: "margin-of-error-sample-size",
    layout: "guided-discovery",
    title: "Margin of Error & Sample Size Lab",
    tag: "inference",
    kicker: "Trade sample size against confidence and interval width.",
    summary: "Change sample size and confidence level to see interval width expand or shrink.",
    estimatedDuration: "6 to 9 minutes",
    concepts: ["Margin of error", "Sample size", "Confidence level"],
    learningGoals: [
      "Use the square-root size rule without changing selected confidence.",
      "Explain higher confidence through critical distance and interval width.",
      "Separate known spread, SE, half-width, full width and unobserved actual error.",
      "Transfer precision tradeoffs to different size, spread and confidence settings.",
    ],
  },
  {
    slug: "central-limit-theorem",
    layout: "guided-discovery",
    title: "Central Limit Theorem Lab",
    tag: "inference",
    kicker: "Compare sample means with a normal reference.",
    summary: "Sample from strange populations and watch sample means form a predictable bell shape.",
    estimatedDuration: "7 to 10 minutes",
    concepts: ["Sample means", "Sampling distributions", "Normal approximation"],
    learningGoals: [
      "Keep the original source fixed while standardized mean shape changes.",
      "Compare approximate mean distributions from discrete non-normal observations.",
      "Reject standardization-as-normality and universal finite-size thresholds.",
      "Interpret source-dependent approximation without exact finite or monotone guarantees and transfer to another interval.",
    ],
  },
  {
    slug: "sampling-distributions-standard-error",
    layout: "guided-discovery",
    title: "Sampling Distributions & Standard Error",
    tag: "inference",
    kicker: "Repeat samples. Measure how their means vary.",
    summary: "Repeat samples and watch estimate-to-estimate spread become standard error.",
    estimatedDuration: "6 to 9 minutes",
    concepts: ["Sampling distributions", "Standard error", "Estimate spread"],
    learningGoals: [
      "Distinguish individual values from sample means and their sampling distribution.",
      "Use the square-root size rule under independent replacement sampling.",
      "Separate source mean and spread, repetition count and within-sample size.",
      "Distinguish theoretical SE, finite batch SD and one selected error without guaranteed bounds.",
    ],
  },
  {
    slug: "sampling-bias",
    layout: "guided-discovery",
    title: "Sampling Bias Lab",
    tag: "inference",
    kicker: "Change who gets observed, then change sample size.",
    summary: "Compare random samples with biased collection rules and see why size cannot fix bad sampling.",
    estimatedDuration: "7 to 10 minutes",
    concepts: ["Selection bias", "Nonresponse bias", "Survivorship bias"],
    learningGoals: [
      "Keep the original population target fixed while selection-frame coverage changes.",
      "Separate larger-sample concentration from expected bias.",
      "Distinguish random invitation from outcome-related response.",
      "Identify survivor-only observation and the original-target mismatch.",
      "Separate collection expectation, theoretical bias and finite sample error.",
    ],
  },
  {
    slug: "sampling-sample-size",
    layout: "guided-discovery",
    title: "Sampling & Sample Size Lab",
    tag: "inference",
    kicker: "Compare sample estimates with a revealed toy population.",
    summary: "Repeatedly inspect reproducible samples from initially hidden populations and compare how sample size changes estimate variability without finite guarantees.",
    estimatedDuration: "7 to 10 minutes",
    concepts: ["Sampling", "Sample size", "Sampling variability"],
    learningGoals: [
      "Separate a sample mean statistic from a fixed population mean parameter.",
      "Compare sample-to-sample variability at smaller and larger sizes.",
      "Inspect another sample while keeping the source and size fixed.",
      "Reject guaranteed improvement of a particular larger sample prefix.",
      "Distinguish estimate stability from individual source-value variability and transfer to another source.",
    ],
  },
  {
    slug: "overfitting",
    layout: "guided-discovery",
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
  },
  {
    slug: "confusion-matrix-thresholds",
    layout: "guided-discovery",
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
  },
  {
    slug: "softmax-temperature",
    layout: "guided-discovery",
    title: "Softmax Temperature Lab",
    tag: "probability",
    kicker:
      "Separate score changes from temperature changes and compare normalized probabilities.",
    summary:
      "Edit four class logits and tune positive temperature to explore normalization, concentration, ranking and ties. Compare equal-score and close-call cases without treating a sharp distribution as proof of correctness.",
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
  },
  {
    slug: "categorical-cross-entropy",
    layout: "guided-discovery",
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
  },
  {
    slug: "kl-divergence",
    layout: "guided-discovery",
    title: "KL Divergence Intuition Lab",
    tag: "loss",
    kicker:
      "Move probability mass between buckets and watch directional distribution mismatch change.",
    summary:
      "Choose a reference distribution, reshape an approximation, inspect per-bucket KL terms, and flip DKL(P || Q) into DKL(Q || P) to see why the direction matters.",
    estimatedDuration: "5 to 7 minutes",
    concepts: [
      "KL divergence",
      "Reference distributions",
      "Approximation",
      "Directional mismatch",
    ],
    learningGoals: [
      "Understand KL divergence as a directional comparison between a reference distribution and an approximation.",
      "See how source-weighted log-ratio terms make high-probability reference buckets expensive to miss.",
      "Recognize why DKL(P || Q) and DKL(Q || P) can differ for the same two distributions.",
    ],
  },
  {
    slug: "gradient-descent",
    layout: "guided-discovery",
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
      "See that the negative gradient gives the local downhill direction from the current position.",
      "Understand how learning rate changes the distance traveled on each update.",
      "Recognize how momentum carries previous updates and can speed convergence or overshoot.",
    ],
  },
  {
    slug: "monte-carlo-tree-search",
    layout: "guided-discovery",
    title: "Monte Carlo Tree Search",
    tag: "search",
    kicker: "Choose a branch by evidence plus exploration, then back up its result.",
    summary: "Explore UCB selection, scripted successes and failures, path-count updates and finite budgets in an explicitly labeled mechanics demo. Illustrations share generic branches; this lesson does not solve a game.",
    estimatedDuration: "7 to 10 minutes",
    concepts: ["Tree search", "Rollouts", "UCB selection", "Backpropagation"],
    learningGoals: [
      "Distinguish the largest observed success rate from the next UCB selection priority.",
      "Change exploration pressure while keeping historical counts fixed.",
      "Back up success and failure through the visited path with aggregate root counts.",
      "Stop at a total visit budget without claiming proof of the best action.",
      "Locate selection, expansion, simulation and backup in full MCTS, and identify this scripted demo’s limits.",
    ],
  },
  {
    slug: "matrix-multiplication",
    layout: "guided-discovery",
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
  },
  {
    slug: "tensor-shape-broadcasting",
    layout: "guided-discovery",
    title: "Tensor Shape & Broadcasting Lab",
    tag: "tensors",
    kicker:
      "Pick two tensor shapes and see each aligned axis stretch, match, or block the operation.",
    summary:
      "Edit tensor shape axes, zip them from the right, compare success and failure cases, and inspect one output index to see how size-1 axes reuse values.",
    estimatedDuration: "5 to 7 minutes",
    concepts: [
      "Tensor shapes",
      "Broadcasting",
      "Shape compatibility",
      "Axis alignment",
    ],
    learningGoals: [
      "Understand that broadcasting compares tensor shapes from the trailing axes.",
      "See why axes are compatible when sizes match or one side is 1.",
      "Recognize that size-1 axes reuse values across the larger output axis.",
      "Identify when mismatched non-1 axes make an operation fail.",
    ],
  },
  {
    slug: "byte-pair-encoding",
    layout: "guided-discovery",
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
      "Distinguish growing vocabulary from token counts that can decrease or remain unchanged for a particular text.",
      "Recognize why learned tokens transfer best to text that repeats training patterns.",
    ],
  },
  {
    slug: "transformer-attention",
    layout: "guided-discovery",
    title: "Transformer Attention",
    tag: "transformers",
    kicker:
      "Select a token and watch query-key scores become a weighted context mix.",
    summary:
      "Compare two hand-authored fixtures, choose a query and adjust attention sharpness. Inspect scaled query-key scores, normalized weights and every weighted value contribution to one unmasked attention-head output.",
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
      "Recognize that all values, not a winning key, are blended into the attention-head output.",
    ],
  },
  {
    slug: "linear-quantization-int4",
    layout: "guided-discovery",
    title: "Linear Quantization (INT4) Lab",
    tag: "compression",
    kicker:
      "Turn real weights into 16 reusable integer codes and see what memory savings cost.",
    summary:
      "Choose a synthetic block, tune its range and trace one real value through rounding, an unsigned 4-bit code and reconstruction. Compare block errors, zero-point shifts and payload savings with explicit storage overhead.",
    estimatedDuration: "5 to 7 minutes",
    concepts: [
      "Linear quantization",
      "4-bit affine codes",
      "Scale and zero point",
      "Rounding and clipping error",
    ],
    learningGoals: [
      "Derive scale and zero point from a block’s calibration range.",
      "Understand how scale and zero point map a real value onto one of 16 unsigned 4-bit codes.",
      "See why dequantized values are approximate shelf centers rather than the original decimals.",
      "Compare why different blocks use different ranges while the 16-code budget stays fixed.",
      "Compare smaller steps with tail clamping, and distinguish fixed payload bits from storage overhead.",
    ],
  },
  {
    slug: "convolution-filter-lab",
    layout: "guided-discovery",
    title: "Convolution Filter Lab",
    tag: "computer vision",
    kicker:
      "Slide a small grid of weights and trace one image patch into one output.",
    summary:
      "Compare Edge, Blur, and Sharpen on three tiny images. Trace exact patch products into a selectable output map, then predict how stride and zero padding change it.",
    estimatedDuration: "7 to 10 minutes",
    concepts: [
      "Convolution kernels",
      "Stride",
      "Padding",
      "Feature maps",
    ],
    learningGoals: [
      "Explain one convolution output cell as a weighted sum of a local patch and kernel.",
      "Connect the highlighted image window to the patch, product table, formula, and feature-map cell.",
      "Compare how different 3x3 kernels ask different local questions of the same image.",
      "Explain how stride changes sampled windows and output size.",
      "Explain zero padding and recognize filter responses caused by border zeros.",
    ],
  },
  {
    slug: "pytorch-image-augmentations",
    title: "PyTorch Image Transforms",
    layout: "guided-discovery",
    tag: "computer vision",
    kicker: "Sample a transform, trace the order, and check the target assumption.",
    summary: "Compose ten single-image transforms in a reproducible browser simulation, inspect sampled stages and type requirements, and copy a runnable torchvision v1 configuration with explicitly separate Python draws.",
    estimatedDuration: "8 to 12 minutes",
    concepts: ["Image augmentation", "Transform composition", "Random sampling", "Tensor representation", "One-hot targets"],
    learningGoals: [
      "Distinguish a transform's configured probability or range from its actual sampled outcome.",
      "Demonstrate how sequential crop and flip order can change a composed result.",
      "Explain RGB byte-to-CHW float conversion and why RandomErasing requires ToTensor first.",
      "Distinguish predefined RandAugment fixed magnitudes from TrivialAugmentWide sampled magnitudes.",
      "Separate a mechanically retained one-hot target from task-dependent augmentation validity.",
    ],
  },
  {
    slug: "label-mixing-image-transforms",
    title: "Label-Mixing Image Transforms",
    layout: "guided-discovery",
    tag: "computer vision",
    kicker: "Mix the pixels, measure the patch, and weight the target.",
    summary: "Compare whole-image MixUp with coordinate-matched CutMix, correct target weights for actual clipped area, inspect fixed-model cross-entropy, and test same-class mixing.",
    estimatedDuration: "8 to 12 minutes",
    concepts: ["CutMix", "MixUp", "Soft targets", "Actual patch area", "Weighted cross-entropy"],
    learningGoals: [
      "Construct targets with the same effective coefficient used by the pixel rule.",
      "Distinguish same-coordinate patch replacement from whole-image blending.",
      "Recompute CutMix target weights from integer patch area after border clipping.",
      "Connect weighted target entries to numeric cross-entropy for a fixed illustrative prediction.",
      "Recognize that same-class contributions can add to a one-hot target.",
    ],
  },
  {
    slug: "batch-normalization",
    title: "Batch Normalization Lab",
    layout: "guided-discovery",
    tag: "neural networks",
    kicker: "Compare activations with batchmates or a frozen reference.",
    summary: "Follow one feature through batch normalization and manual scale/shift, test an outlier’s effect on its batchmates, and compare current with frozen inference statistics.",
    estimatedDuration: "7 to 10 minutes",
    concepts: ["Mini-batches", "Population variance", "Batch normalization", "Scale and shift", "Frozen inference statistics"],
    learningGoals: [
      "Explain training-time centering and epsilon-sensitive normalized spread.",
      "Follow one activation through normalization and scale/shift.",
      "Distinguish scale’s effect on spread from shift’s effect on center.",
      "Show how an outlier changes its batchmates during training.",
      "Explain why frozen inference statistics remove dependence on batchmates without forcing an arriving batch to zero mean.",
    ],
  },
  {
    slug: "layer-normalization",
    layout: "guided-discovery",
    title: "Layer Normalization Lab",
    tag: "neural networks",
    kicker: "Change one feature and follow its token’s own normalization reference.",
    summary: "Edit illustrative token features, compare row-local statistics, test a constant row and shared per-feature Scale/Shift, then declare the axes in a BatchNorm comparison.",
    estimatedDuration: "5 to 7 minutes",
    concepts: ["Row-local statistics", "Epsilon", "Layer normalization", "Per-feature scale and shift"],
    learningGoals: [
      "Explain independence from other rows and coupling within one edited row.",
      "Calculate normalized values with population variance and epsilon, including a constant row.",
      "Explain per-feature Scale/Shift shared across tokens and output mean/spread.",
      "Declare normalization axes for a LayerNorm/BatchNorm comparison.",
    ],
  },
  {
    slug: "mnist-mlp-inference-debugger",
    layout: "guided-discovery",
    title: "MNIST MLP Inference Debugger",
    tag: "neural networks",
    kicker: "Draw an input, trace fixed weights, and question the prediction.",
    summary: "Inspect real WebGPU inference from input preprocessing to hidden neuron sums, softmax probabilities and local score saliency. Sampled views never change the model.",
    estimatedDuration: "6 to 9 minutes",
    concepts: ["MLP inference", "Input preprocessing", "WebGPU", "Softmax", "Local score saliency"],
    learningGoals: [
      "Trace 28×28 brightness values through the default model’s input contract and fixed weights.",
      "Distinguish relative class probabilities from correctness or digit presence.",
      "Reconcile signed contributions, remaining terms, bias and activation from the actual GPU trace.",
      "Distinguish sampled graph filtering from model pruning or training.",
      "Interpret local score sensitivity and rerun a finite pixel intervention.",
    ],
  },
  {
    slug: "autograd-graphs",
    layout: "guided-discovery",
    title: "Autograd Graphs",
    tag: "neural networks",
    kicker: "Cache values, multiply backward, and add shared paths.",
    summary: "Trace three fixed formulas through forward caches and backward messages. Test cancellation and sigmoid saturation, compare conditional function/derivative slices, then inspect a separate optimizer proposal.",
    estimatedDuration: "6 to 8 minutes",
    concepts: ["Computation graphs", "Chain rule", "Shared-path gradients", "Local derivatives", "Optimizer separation"],
    learningGoals: [
      "Trace cached values and signed backward messages through actual formula operations.",
      "Explain shared-path addition and cancellation without claiming zero dependency.",
      "Explain small nonzero sigmoid gradients using local derivatives.",
      "Read conditional function and derivative slices with the other argument fixed.",
      "Separate gradient computation from a simultaneous optimizer preview and transfer a finite edit at zero slope.",
    ],
  },
  {
    slug: "backpropagation-inspector",
    title: "Backpropagation Inspector",
    tag: "neural networks",
    layout: "guided-discovery",
    kicker:
      "Follow local gradients backward, then test a separate gradient-descent step.",
    summary:
      "Predict, reveal, and explain output-weight gradients, target changes, learning-rate scaling, and hidden-activation signals in one live computation graph. Preview a step and compare its probability and loss.",
    estimatedDuration: "5 to 7 minutes",
    concepts: [
      "Backpropagation",
      "Gradients",
      "Credit assignment",
      "Learning rate",
    ],
    learningGoals: [
      "Explain output delta as p - y for sigmoid binary cross entropy.",
      "Connect each output-weight gradient to cached activation times downstream error.",
      "Use gradient sign and learning rate to explain a before/after weight update and its effect on loss.",
      "Distinguish output-weight gradients from signals sent back to hidden activations.",
    ],
  },
  {
    slug: "zero-knowledge-proofs",
    title: "Zero Knowledge Proofs Lab",
    layout: "guided-discovery",
    tag: "cryptography",
    kicker: "Commit before opening one edge; separate local checks from repeated random evidence.",
    summary: "Illustrate graph-coloring commitments, honest and invalid colorings, one edge per fresh round, and the fixed cheater’s theoretical escape probability under independent uniform challenges. This is a visual simulation, not cryptographic secrecy.",
    estimatedDuration: "7 to 10 minutes",
    concepts: ["Provers", "Verifiers", "Hiding and binding", "Independent repetition", "Zero knowledge"],
    learningGoals: [
      "Explain why commitments hide and bind before the challenge.",
      "Separate two opened shuffled endpoint colors and a local pass from a full-coloring check.",
      "Show that color permutations preserve equality and expose the fixed invalid coloring’s two bad edges.",
      "Explain why each opening needs fresh commitments and independently sampled color names may repeat.",
      "Use (7/9)^k only for the specified independent uniform challenges, without confusing theory, actual history or certainty.",
    ],
  },
  {
    slug: "ai-concept-atlas",
    layout: "guided-discovery",
    title: "The AI Concept Atlas",
    tag: "concept map",
    kicker:
      "Open a local branch, search the full catalog and read a chosen browse path.",
    summary:
      "Navigate 903 curated nodes through a center-out map or the same hierarchy in a readable branch list. Expand and collapse local branches, search hidden concepts and compare chosen browse homes without mistaking overlapping categories for prerequisites.",
    estimatedDuration: "8 to 12 minutes",
    concepts: [
      "AI taxonomy",
      "Branch hierarchies",
      "Progressive disclosure",
      "Concept search",
    ],
    learningGoals: [
      "Expand one category locally while keeping the full catalog available.",
      "Read a concept’s chosen root/category/subcategory/label path.",
      "Collapse a selected child’s branch and explain the move to its parent without catalog deletion.",
      "Search a hidden concept and reveal its ancestors without changing its browse home.",
      "Compare actual category and subcategory labels without inferring prerequisites or exclusive scientific membership.",
    ],
  },
] satisfies ActivePlaygroundDefinition[];

type ActivePlaygroundSlug =
  (typeof activePlaygroundDefinitions)[number]["slug"];

export const activePlaygroundMetadata: Array<
  PlaygroundMetadata & { slug: ActivePlaygroundSlug }
> = activePlaygroundDefinitions.map((metadata) => ({
  ...metadata,
  tutorPlan: playgroundTutorPlans[metadata.slug],
}));

export const upcomingPlaygrounds: UpcomingPlayground[] = [
























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
  "tensor-shape-broadcasting",
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
  "mnist-mlp-inference-debugger",
  "convolution-filter-lab",
  "pytorch-image-augmentations",
  "label-mixing-image-transforms",
  "autograd-graphs",
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
  "ai-concept-atlas",
] as const;

function getPlaygroundMetadata(slug: string) {
  return activePlaygroundMetadata.find((playground) => playground.slug === slug);
}

export function getPlaygroundMetadataFromPathname(pathname?: string) {
  const slug = pathname?.split("/").filter(Boolean).at(-1);

  return slug ? getPlaygroundMetadata(slug) : undefined;
}
