// Curriculum structure is independent of the component and tutor registries.
// A path is a recommendation, never an access restriction.
export type LearningPath = {
  id: string;
  title: string;
  summary: string;
  lessons: readonly string[];
};

export const lessonGroups = [
  { slug: "linear-regression-line-fitting", title: "Fit a Line & Understand Its Loss", chapters: ["linear-regression-line-fitting", "least-squares-loss-landscape"] },
  { slug: "classification-metrics-foundations", title: "Classification Decisions & Metrics", chapters: ["classification-metrics-foundations", "confusion-matrix-thresholds"] },
  { slug: "log-loss-confidence-penalties", title: "Probability Predictions & Cross Entropy", chapters: ["log-loss-confidence-penalties", "categorical-cross-entropy"] },
  { slug: "confidence-intervals", title: "Confidence Intervals & Precision", chapters: ["confidence-intervals", "margin-of-error-sample-size"] },
  { slug: "type-i-type-ii-errors", title: "Errors, Power & Sample Planning", chapters: ["type-i-type-ii-errors", "power-effect-size-sample-size"] },
] as const;

export const coreLessonOrder = [
  "mean-median-mode", "variance-standard-deviation", "sampling-sample-size", "sampling-bias",
  "linear-regression-line-fitting", "gradient-descent", "train-test-generalization", "overfitting",
  "class-score-logits", "linear-classification-boundaries", "softmax-temperature",
  "classification-metrics-foundations", "log-loss-confidence-penalties", "regularization",
  "activation-functions", "neural-network-forward-pass", "autograd-graphs",
  "backpropagation-inspector", "neural-network-training-loop", "mnist-mlp-inference-debugger",
] as const;

export const learningPaths: readonly LearningPath[] = [
  { id: "core", title: "Start here: the AI core", summary: "Twenty steps from data to a working neural network. Skip familiar ideas and return whenever you need a refresher.", lessons: coreLessonOrder },
  { id: "probability", title: "Data & probability", summary: "Describe data, count outcomes and reason about uncertainty.", lessons: ["mean-median-mode", "range-quartiles-iqr", "variance-standard-deviation", "shape-skew-outliers", "probability-rules", "conditional-probability", "bayes-rule", "bernoulli-categorical-binomial", "expected-value-risk", "law-large-numbers-simulation", "waiting-arrival-distributions", "pdf-cdf-probability-area", "normal-distribution-z-scores"] },
  { id: "inference", title: "Statistical inference", summary: "Separate sampling uncertainty, interval coverage and test decisions.", lessons: ["sampling-sample-size", "sampling-bias", "sampling-distributions-standard-error", "central-limit-theorem", "confidence-intervals", "hypothesis-testing-basics", "type-i-type-ii-errors"] },
  { id: "relationships", title: "Relationships & diagnostics", summary: "Inspect associations, residuals and repeated-fit behavior.", lessons: ["covariance-correlation", "correlation-shape-outliers", "simpsons-paradox-confounding", "linear-regression-line-fitting", "r-squared-residual-diagnostics", "train-test-generalization", "overfitting", "bias-variance-tradeoff"] },
  { id: "evaluation", title: "Evaluate a classifier", summary: "Choose denominators, compare cutoffs and check probability calibration.", lessons: ["class-score-logits", "classification-metrics-foundations", "precision-recall-curves-imbalance", "roc-auc-thresholds", "softmax-temperature", "log-loss-confidence-penalties", "calibration-reliability-diagrams"] },
  { id: "retrieval", title: "Build a retrieval pipeline", summary: "Go directly from distances and vectors to retrieval, ranking and grounded answers.", lessons: ["feature-scaling", "distance-metrics", "vector-geometry-similarity", "embedding-retrieval", "retrieval-ranking-metrics", "rag-pipeline", "rag-groundedness-metrics", "contrastive-loss"] },
  { id: "projection", title: "Projection & clustering", summary: "Group points and compare linear projections with neighborhood maps.", lessons: ["feature-scaling", "distance-metrics", "k-means-clustering", "vector-geometry-similarity", "projection-foundations", "pca-principal-components", "t-sne-neighborhood-map", "umap-manifold-projection"] },
  { id: "tools", title: "Math & implementation tools", summary: "Learn matrix and tensor rules at the point you need them.", lessons: ["matrix-multiplication", "tensor-shape-broadcasting"] },
  { id: "information", title: "Information theory", summary: "Connect surprise, expected information and directional distribution mismatch.", lessons: ["bernoulli-categorical-binomial", "conditional-probability", "entropy-information", "log-loss-confidence-penalties", "kl-divergence"] },
  { id: "vision", title: "Vision", summary: "Trace image features, input transforms and training-time normalization.", lessons: ["mnist-mlp-inference-debugger", "convolution-filter-lab", "tensor-shape-broadcasting", "pytorch-image-augmentations", "label-mixing-image-transforms", "batch-normalization"] },
  { id: "transformers", title: "Understand transformers", summary: "Trace tokens through attention and a complete decoder block.", lessons: ["byte-pair-encoding", "llm-loss-perplexity", "vector-geometry-similarity", "matrix-multiplication", "softmax-temperature", "transformer-attention", "context-windows-attention-masks", "positional-encoding-token-order", "layer-normalization", "rms-normalization", "transformer-block-residual-stream", "linear-quantization-int4"] },
  { id: "generation", title: "Understand text generation", summary: "Follow next-token predictions into generated sequences without taking every transformer lesson first.", lessons: ["class-score-logits", "softmax-temperature", "byte-pair-encoding", "llm-loss-perplexity", "autoregressive-generation-decoding", "llm-app-ops-metrics"] },
  { id: "llm-evaluation", title: "Evaluate an LLM", summary: "Compare answer scores, judges, safety and operating tradeoffs.", lessons: ["reference-answer-metrics", "benchmark-scores-pass-k", "preference-judge-metrics", "safety-refusal-robustness-metrics", "embedding-retrieval", "retrieval-ranking-metrics", "rag-pipeline", "rag-groundedness-metrics", "llm-app-ops-metrics"] },
  { id: "search", title: "Search & exploration", summary: "Balance observed reward against exploration, then inspect tree-search mechanics.", lessons: ["expected-value-risk", "exploration-exploitation", "monte-carlo-tree-search"] },
];

export const referenceSlugs = ["ai-concept-atlas", "zero-knowledge-proofs"] as const;
export function getLessonGroup(slug: string) {
  return lessonGroups.find(group => group.chapters.some(chapter => chapter === slug));
}
export function canonicalLessonSlug(slug: string) {
  return getLessonGroup(slug)?.slug ?? slug;
}
export function getLearningPath(id?: string | null) {
  return learningPaths.find(path => path.id === id);
}
export function getLessonPath(slug: string, preferred?: string | null) {
  const canonical = canonicalLessonSlug(slug);
  const requested = getLearningPath(preferred);
  return requested?.lessons.includes(canonical) ? requested : learningPaths.find(path => path.lessons.includes(canonical));
}
export function lessonHref(slug: string, path?: string) {
  return `/playgrounds/${slug}${getLearningPath(path) ? `?path=${encodeURIComponent(path!)}` : ""}`;
}

// Each catalog card appears once. Chapters retain their original reachable routes.
export const dashboardLessonPlanOrder: readonly string[] = [...new Set([
  ...learningPaths.flatMap(path => path.lessons), ...referenceSlugs,
])];

export type Prerequisite = { concept: string; lesson?: string };
export const lessonPrerequisites: Record<string, readonly Prerequisite[]> = {
  "least-squares-loss-landscape": [{ concept: "Straight-line parameters and residuals", lesson: "linear-regression-line-fitting" }],
  "confusion-matrix-thresholds": [{ concept: "Confusion counts, precision and recall", lesson: "classification-metrics-foundations" }],
  "categorical-cross-entropy": [{ concept: "True-outcome surprise and probability normalization", lesson: "log-loss-confidence-penalties" }],
  "margin-of-error-sample-size": [{ concept: "Coverage and normal-model interval width", lesson: "confidence-intervals" }],
  "power-effect-size-sample-size": [{ concept: "Conditional false alarms and misses", lesson: "type-i-type-ii-errors" }],
  "variance-standard-deviation": [{ concept: "Arithmetic means", lesson: "mean-median-mode" }],
  "sampling-sample-size": [{ concept: "Means and equally likely draws", lesson: "mean-median-mode" }],
  "sampling-bias": [{ concept: "Population versus sample", lesson: "sampling-sample-size" }],
  "linear-regression-line-fitting": [{ concept: "Paired X/Y coordinates and signed subtraction" }],
  "gradient-descent": [{ concept: "Parameters and squared prediction error", lesson: "linear-regression-line-fitting" }],
  "train-test-generalization": [{ concept: "Predictions and squared error", lesson: "linear-regression-line-fitting" }],
  overfitting: [{ concept: "Training versus held-out error", lesson: "train-test-generalization" }],
  "class-score-logits": [{ concept: "Signed numbers and comparing maxima" }],
  "linear-classification-boundaries": [{ concept: "Raw class scores", lesson: "class-score-logits" }],
  "softmax-temperature": [{ concept: "Scores and ranking", lesson: "class-score-logits" }, { concept: "Percentages and probabilities summing to one", lesson: "bernoulli-categorical-binomial" }],
  "classification-metrics-foundations": [{ concept: "Binary labels, counts and fractions" }],
  "log-loss-confidence-penalties": [{ concept: "Known labels and complementary probabilities", lesson: "bernoulli-categorical-binomial" }, { concept: "Probability readouts", lesson: "softmax-temperature" }],
  regularization: [{ concept: "Squared error and parameter updates", lesson: "gradient-descent" }, { concept: "Signed class scores", lesson: "class-score-logits" }],
  "activation-functions": [{ concept: "Signed scalar inputs" }],
  "neural-network-forward-pass": [{ concept: "Weighted sums and ReLU", lesson: "activation-functions" }],
  "autograd-graphs": [{ concept: "Signed arithmetic and squares" }],
  "backpropagation-inspector": [{ concept: "Forward activations", lesson: "neural-network-forward-pass" }, { concept: "Probability loss", lesson: "log-loss-confidence-penalties" }, { concept: "Local gradients", lesson: "autograd-graphs" }],
  "neural-network-training-loop": [{ concept: "Forward pass", lesson: "neural-network-forward-pass" }, { concept: "Probability loss", lesson: "log-loss-confidence-penalties" }, { concept: "Backward gradients", lesson: "backpropagation-inspector" }, { concept: "Train/validation/test roles", lesson: "train-test-generalization" }],
  "mnist-mlp-inference-debugger": [{ concept: "Forward inference and probability readout", lesson: "neural-network-forward-pass" }],
  "range-quartiles-iqr": [{ concept: "Sorted values and medians", lesson: "mean-median-mode" }],
  "shape-skew-outliers": [{ concept: "Centers and robust spread", lesson: "range-quartiles-iqr" }],
  "probability-rules": [{ concept: "Counts and fractions" }],
  "conditional-probability": [{ concept: "Overlaps and reference groups", lesson: "probability-rules" }],
  "bayes-rule": [{ concept: "Conditional rates", lesson: "conditional-probability" }],
  "bernoulli-categorical-binomial": [{ concept: "Complementary probabilities", lesson: "probability-rules" }],
  "expected-value-risk": [{ concept: "Probability-weighted averages", lesson: "bernoulli-categorical-binomial" }],
  "law-large-numbers-simulation": [{ concept: "Expected averages", lesson: "expected-value-risk" }],
  "waiting-arrival-distributions": [{ concept: "Independent Bernoulli trials", lesson: "bernoulli-categorical-binomial" }],
  "pdf-cdf-probability-area": [{ concept: "Interval bounds and probability" }],
  "normal-distribution-z-scores": [{ concept: "Continuous probability area", lesson: "pdf-cdf-probability-area" }, { concept: "Standard deviation", lesson: "variance-standard-deviation" }],
  "sampling-distributions-standard-error": [{ concept: "Sample means", lesson: "sampling-sample-size" }, { concept: "Population SD", lesson: "variance-standard-deviation" }],
  "central-limit-theorem": [{ concept: "Sampling distributions and SE", lesson: "sampling-distributions-standard-error" }, { concept: "Normal Z scores", lesson: "normal-distribution-z-scores" }],
  "confidence-intervals": [{ concept: "Mean SE", lesson: "sampling-distributions-standard-error" }, { concept: "Normal tail probabilities", lesson: "normal-distribution-z-scores" }],
  "hypothesis-testing-basics": [{ concept: "SE and normal probabilities", lesson: "sampling-distributions-standard-error" }, { concept: "Conditional probability", lesson: "conditional-probability" }],
  "type-i-type-ii-errors": [{ concept: "Null hypotheses and decision cutoffs", lesson: "hypothesis-testing-basics" }],
  "covariance-correlation": [{ concept: "Means and spread; sample SD is defined in this lesson", lesson: "variance-standard-deviation" }],
  "correlation-shape-outliers": [{ concept: "Pearson correlation", lesson: "covariance-correlation" }],
  "simpsons-paradox-confounding": [{ concept: "Grouped conditional rates", lesson: "conditional-probability" }],
  "r-squared-residual-diagnostics": [{ concept: "Residuals and squared error", lesson: "linear-regression-line-fitting" }],
  "bias-variance-tradeoff": [{ concept: "Held-out squared prediction error", lesson: "overfitting" }, { concept: "Repeated-sample spread", lesson: "sampling-sample-size" }],
  "precision-recall-curves-imbalance": [{ concept: "Precision, recall and cutoffs", lesson: "classification-metrics-foundations" }],
  "roc-auc-thresholds": [{ concept: "Confusion counts and cutoffs", lesson: "classification-metrics-foundations" }],
  "calibration-reliability-diagrams": [{ concept: "Probability versus correctness", lesson: "log-loss-confidence-penalties" }],
  "feature-scaling": [{ concept: "Means, ranges and population SD", lesson: "variance-standard-deviation" }],
  "distance-metrics": [{ concept: "Coordinates, absolute differences and square roots" }],
  "vector-geometry-similarity": [{ concept: "Signed coordinates, ratios and Euclidean length", lesson: "distance-metrics" }],
  "embedding-retrieval": [{ concept: "Vector similarity", lesson: "vector-geometry-similarity" }],
  "retrieval-ranking-metrics": [{ concept: "Ranked results and relevance labels", lesson: "embedding-retrieval" }],
  "rag-pipeline": [{ concept: "Embedding retrieval", lesson: "embedding-retrieval" }, { concept: "Ranking and top-k", lesson: "retrieval-ranking-metrics" }],
  "rag-groundedness-metrics": [{ concept: "Retrieved context and answer evidence", lesson: "rag-pipeline" }],
  "contrastive-loss": [{ concept: "Embedding distance", lesson: "embedding-retrieval" }, { concept: "Squared penalties and optimization", lesson: "gradient-descent" }],
  "k-means-clustering": [{ concept: "Means and squared distances", lesson: "distance-metrics" }],
  "projection-foundations": [{ concept: "Dot products and vector length", lesson: "vector-geometry-similarity" }],
  "pca-principal-components": [{ concept: "Projection and reconstruction", lesson: "projection-foundations" }, { concept: "Variance", lesson: "variance-standard-deviation" }],
  "t-sne-neighborhood-map": [{ concept: "Distances and probability distributions", lesson: "distance-metrics" }],
  "umap-manifold-projection": [{ concept: "Distances and nearest neighbors", lesson: "distance-metrics" }],
  "matrix-multiplication": [{ concept: "Products, sums and rectangular arrays" }],
  "tensor-shape-broadcasting": [{ concept: "Axis sizes, zero-based indices and addition" }],
  "entropy-information": [{ concept: "Categorical probabilities", lesson: "bernoulli-categorical-binomial" }, { concept: "Conditional probability", lesson: "conditional-probability" }],
  "kl-divergence": [{ concept: "Weighted surprise", lesson: "entropy-information" }, { concept: "Probability loss", lesson: "log-loss-confidence-penalties" }],
  "convolution-filter-lab": [{ concept: "Signed multiplication and image grids" }],
  "pytorch-image-augmentations": [{ concept: "RGB pixels, labels and transform order" }],
  "label-mixing-image-transforms": [{ concept: "Image transforms", lesson: "pytorch-image-augmentations" }, { concept: "Target weights and cross entropy", lesson: "log-loss-confidence-penalties" }],
  "batch-normalization": [{ concept: "Activations", lesson: "neural-network-forward-pass" }, { concept: "Population variance", lesson: "variance-standard-deviation" }, { concept: "Training versus inference" }],
  "byte-pair-encoding": [{ concept: "Adjacent symbols and frequency counts" }],
  "llm-loss-perplexity": [{ concept: "True-outcome log loss", lesson: "log-loss-confidence-penalties" }, { concept: "Tokens", lesson: "byte-pair-encoding" }],
  "transformer-attention": [{ concept: "Vector dot products", lesson: "vector-geometry-similarity" }, { concept: "Softmax", lesson: "softmax-temperature" }],
  "context-windows-attention-masks": [{ concept: "Query/key roles", lesson: "transformer-attention" }],
  "positional-encoding-token-order": [{ concept: "Query/key vectors", lesson: "transformer-attention" }],
  "layer-normalization": [{ concept: "Means and population variance", lesson: "variance-standard-deviation" }],
  "rms-normalization": [{ concept: "Mean-centered normalization", lesson: "layer-normalization" }],
  "transformer-block-residual-stream": [{ concept: "Attention", lesson: "transformer-attention" }, { concept: "Masking and position signals", lesson: "context-windows-attention-masks" }, { concept: "Normalization", lesson: "layer-normalization" }, { concept: "Matrix multiplication", lesson: "matrix-multiplication" }, { concept: "Forward activations", lesson: "neural-network-forward-pass" }],
  "linear-quantization-int4": [{ concept: "Subtraction, division and nearest integers" }],
  "autoregressive-generation-decoding": [{ concept: "Softmax", lesson: "softmax-temperature" }, { concept: "Next-token prediction", lesson: "llm-loss-perplexity" }],
  "reference-answer-metrics": [{ concept: "Token counts, overlap and fractions" }],
  "benchmark-scores-pass-k": [{ concept: "Correct-answer counts and sampling budgets" }],
  "preference-judge-metrics": [{ concept: "Weighted rubrics and pairwise outcomes" }],
  "safety-refusal-robustness-metrics": [{ concept: "False positives, misses and eligible denominators", lesson: "classification-metrics-foundations" }],
  "llm-app-ops-metrics": [{ concept: "Generated token work and request timelines", lesson: "autoregressive-generation-decoding" }],
  "exploration-exploitation": [{ concept: "Observed sample means and rewards", lesson: "expected-value-risk" }],
  "monte-carlo-tree-search": [{ concept: "UCB exploration scores", lesson: "exploration-exploitation" }],
};

export type ReadinessCheck = { question: string; choices: readonly string[]; answer: number; explanation: string };
export const readinessChecks: Record<string, ReadinessCheck> = {
  core: { question: "For values 2, 4 and 6, what is the mean?", choices: ["4", "6", "12"], answer: 0, explanation: "The sum is 12; divide by three values to get 4. This checks one foundation, not mastery of the whole core." },
  probability: { question: "Two of eight equally likely outcomes satisfy an event. What is its probability?", choices: ["25%", "50%", "Two outcomes means certainty"], answer: 0, explanation: "Count eligible outcomes over all equally likely outcomes: 2/8 = 25%." },
  inference: { question: "Across repeated samples, standard error describes the spread of…", choices: ["Sample estimates", "Individual observations", "Guaranteed estimation errors"], answer: 0, explanation: "SE describes estimate-to-estimate spread under a sampling model. Review Sampling Distributions & Standard Error if this is unfamiliar." },
  relationships: { question: "A fitted line has small residuals. Does that establish a causal effect?", choices: ["No", "Yes", "Only when the slope is positive"], answer: 0, explanation: "A descriptive association or fit alone cannot establish causation." },
  evaluation: { question: "Precision divides true positives by…", choices: ["Predicted positives", "Actual positives", "All cases"], answer: 0, explanation: "Precision asks how many predicted positives are truly positive. Recall uses actual positives." },
  retrieval: { question: "Doubling a nonzero vector's length without changing direction changes its cosine with another nonzero vector by…", choices: ["Nothing", "Doubling it", "Making it zero"], answer: 0, explanation: "Cosine measures alignment after dividing by both lengths. The dot product can change." },
  projection: { question: "A centroid update takes the mean of…", choices: ["Its assigned points", "Every point regardless of group", "The class labels"], answer: 0, explanation: "K-means alternates assignment and coordinate means; it does not need known class labels." },
  tools: { question: "A 2×3 matrix times a 3×4 matrix produces what shape?", choices: ["2×4", "3×3", "2×3×4"], answer: 0, explanation: "The inner sizes agree; each output cell uses one row and column." },
  information: { question: "Entropy averages outcome surprise using…", choices: ["Outcome probabilities as weights", "Equal weights for every outcome", "Only the rarest outcome"], answer: 0, explanation: "Entropy is expected surprise. A rare event's large surprise need not dominate that average." },
  vision: { question: "A convolution kernel's weights are applied to…", choices: ["Each local input patch", "The labels only", "One random output pixel"], answer: 0, explanation: "Shared local weighted sums produce an output feature map." },
  transformers: { question: "In attention, which vectors determine the weights before values are mixed?", choices: ["Queries and keys", "Values alone", "Token names alone"], answer: 0, explanation: "Query/key scores are normalized into weights; those weights then mix values." },
  generation: { question: "After appending a generated token, the next prediction uses…", choices: ["The updated prefix", "The original prefix only", "The true future answer"], answer: 0, explanation: "Generation feeds the selected token back as context. Teacher-forced evaluation instead uses actual prior tokens." },
  "llm-evaluation": { question: "A candidate has high word overlap with a reference. Does that prove it is correct?", choices: ["No", "Yes", "Only for long answers"], answer: 0, explanation: "Overlap is one score. Incorrect answers can share many words with the reference." },
  search: { question: "An exploration bonus changes which option to try next. Does it change past observed rewards?", choices: ["No", "Yes", "Only for low-count options"], answer: 0, explanation: "The policy changes priorities; it does not rewrite the evidence already collected." },
};
