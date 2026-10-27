import { plannedLessonGroups, plannedPlaygroundDefinitions } from "./planned-curriculum";

// Curriculum structure is independent of the component and tutor registries.
// A path is a recommendation, never an access restriction.
export type LearningPath = {
  id: string;
  title: string;
  summary: string;
  lessons: readonly string[];
  parentId?: string;
};

const publishedLessonGroups = [
  { slug: "linear-regression-line-fitting", title: "Fit a Line & Understand Its Loss", chapters: ["linear-regression-line-fitting", "least-squares-loss-landscape"] },
  { slug: "classification-metrics-foundations", title: "Classification Decisions & Metrics", chapters: ["classification-metrics-foundations", "confusion-matrix-thresholds"] },
  { slug: "log-loss-confidence-penalties", title: "Probability Predictions & Cross Entropy", chapters: ["log-loss-confidence-penalties", "categorical-cross-entropy"] },
  { slug: "confidence-intervals", title: "Confidence Intervals & Precision", chapters: ["confidence-intervals", "margin-of-error-sample-size"] },
  { slug: "type-i-type-ii-errors", title: "Errors, Power & Sample Planning", chapters: ["type-i-type-ii-errors", "power-effect-size-sample-size"] },
] as const;

export const lessonGroups = [...publishedLessonGroups, ...plannedLessonGroups];

export const coreLessonOrder = [
  "mean-median-mode", "variance-standard-deviation", "sampling-sample-size", "sampling-bias",
  "linear-regression-line-fitting", "gradient-descent", "train-test-generalization", "overfitting",
  "class-score-logits", "linear-classification-boundaries", "softmax-temperature",
  "classification-metrics-foundations", "log-loss-confidence-penalties", "regularization",
  "activation-functions", "neural-network-forward-pass", "autograd-graphs",
  "backpropagation-inspector", "neural-network-training-loop", "mnist-mlp-inference-debugger",
] as const;

const learningPathDefinitions: readonly LearningPath[] = [
  { id: "core", title: "Start here: the AI core", summary: "Twenty steps from data to a working neural network. Skip familiar ideas and return whenever you need a refresher.", lessons: coreLessonOrder },
  { id: "probability", title: "Data & probability", summary: "Describe data, count outcomes and reason about uncertainty.", lessons: ["mean-median-mode", "range-quartiles-iqr", "variance-standard-deviation", "shape-skew-outliers", "probability-rules", "conditional-probability", "bayes-rule", "bernoulli-categorical-binomial", "expected-value-risk", "law-large-numbers-simulation", "waiting-arrival-distributions", "pdf-cdf-probability-area", "normal-distribution-z-scores", "bayesian-parameter-estimation"] },
  { id: "inference", title: "Statistical inference", summary: "Separate sampling uncertainty, interval coverage and test decisions.", lessons: ["sampling-sample-size", "sampling-bias", "sampling-distributions-standard-error", "central-limit-theorem", "confidence-intervals", "student-t-intervals", "hypothesis-testing-basics", "type-i-type-ii-errors"] },
  { id: "relationships", title: "Relationships & diagnostics", summary: "Inspect associations, residuals and repeated-fit behavior.", lessons: ["covariance-correlation", "correlation-shape-outliers", "simpsons-paradox-confounding", "linear-regression-line-fitting", "mse-mae-regression-losses", "r-squared-residual-diagnostics", "train-test-generalization", "overfitting", "bias-variance-tradeoff", "learning-curves-data-budgets"] },
  { id: "relationships-bayesian", title: "Relationships · optional Bayesian regression", summary: "Build on fitted lines and parameter posteriors to compare posterior weights and predictive uncertainty.", lessons: ["linear-regression-line-fitting", "normal-distribution-z-scores", "bayesian-parameter-estimation", "bayesian-regression"], parentId: "relationships" },
  { id: "evaluation", title: "Evaluate a classifier", summary: "Choose denominators, compare cutoffs and check probability calibration.", lessons: ["class-score-logits", "classification-metrics-foundations", "cost-sensitive-thresholds", "precision-recall-curves-imbalance", "roc-auc-thresholds", "softmax-temperature", "log-loss-confidence-penalties", "calibration-reliability-diagrams", "multiclass-metric-averaging", "fitting-calibrators"] },
  { id: "model-selection", title: "Model selection & experiments", summary: "Choose models with honest validation and controlled comparisons.", lessons: ["train-test-generalization", "cross-validation", "experiment-reproducibility", "bias-variance-tradeoff", "learning-curves-data-budgets", "hyperparameter-search", "bayesian-parameter-estimation", "bayesian-hyperparameter-search"] },
  { id: "training", title: "Training & optimization", summary: "Inspect optimizer state, stabilization, regularization and adaptation.", lessons: ["gradient-descent", "regression-gradient-updates", "neural-network-forward-pass", "network-capacity-width-depth", "weight-initialization", "neural-network-training-loop", "stochastic-gradient-noise", "adaptive-optimizers", "learning-rate-schedules", "gradient-flow-clipping", "dropout", "early-stopping", "debugging-neural-networks", "transfer-learning"] },
  { id: "data-preparation", title: "Data preparation", summary: "Encode features and handle rare classes without evaluation leakage.", lessons: ["feature-scaling", "categorical-feature-engineering", "feature-binning", "precision-recall-curves-imbalance", "class-weighting", "cross-validation", "resampling-imbalanced-data", "synthetic-minority-sampling"] },
  { id: "classical", title: "Classical machine learning", summary: "Introduce neighbor, linear and tree decisions before ensembles, with optional probabilistic and margin-based model families.", lessons: ["classification-metrics-foundations", "feature-scaling", "distance-metrics", "knn-classification", "linear-classification-boundaries", "entropy-information", "decision-trees", "bias-variance-tradeoff", "cross-validation", "bagging-random-forests", "boosting", "stacking"] },
  { id: "classical-naive-bayes", title: "Classical ML · optional Naive Bayes", summary: "Build class scores from conditional feature likelihoods and inspect smoothing.", lessons: ["conditional-probability", "bayes-rule", "naive-bayes-smoothing"], parentId: "classical" },
  { id: "classical-svm", title: "Classical ML · optional support vectors", summary: "Move from linear margins to nonlinear kernel boundaries without interrupting the introductory classifier sequence.", lessons: ["linear-classification-boundaries", "regularization", "svm-margins", "svm-kernels"], parentId: "classical" },
  { id: "retrieval", title: "Build a retrieval pipeline", summary: "Go directly from distances and vectors to retrieval, ranking and grounded answers.", lessons: ["feature-scaling", "distance-metrics", "vector-geometry-similarity", "embedding-retrieval", "retrieval-ranking-metrics", "rag-pipeline", "rag-groundedness-metrics", "evidence-sufficiency-guardrails", "document-chunking", "tokenization-choices", "sparse-retrieval-bm25", "hybrid-retrieval-reranking", "query-rewriting-retrieval", "contrastive-loss"] },
  { id: "retrieval-indexing", title: "Retrieval · optional search scaling", summary: "Compare clustered candidate search with an exact baseline after the basic retrieval pipeline.", lessons: ["distance-metrics", "distance-concentration", "k-means-clustering", "embedding-retrieval", "retrieval-ranking-metrics", "approximate-neighbor-search"], parentId: "retrieval" },
  { id: "projection", title: "Projection & dimensionality reduction", summary: "Go from distances and vector projections to PCA, SVD and nonlinear neighborhood maps; clustering is an optional branch.", lessons: ["feature-scaling", "distance-metrics", "distance-concentration", "vector-geometry-similarity", "projection-foundations", "pca-principal-components", "linear-transformations-eigenvectors", "svd-low-rank-approximation", "t-sne-neighborhood-map", "umap-manifold-projection"] },
  { id: "projection-clustering", title: "Projection · optional clustering", summary: "Compare hard assignments with soft Gaussian memberships after shared distance foundations.", lessons: ["feature-scaling", "distance-metrics", "k-means-clustering", "normal-distribution-z-scores", "conditional-probability", "gaussian-mixtures-em"], parentId: "projection" },
  { id: "tools", title: "Math & implementation tools", summary: "Learn matrix and tensor rules at the point you need them.", lessons: ["matrix-multiplication", "tensor-shape-broadcasting", "vector-geometry-similarity", "linear-transformations-eigenvectors", "projection-foundations", "svd-low-rank-approximation", "floating-point-precision", "stable-softmax-logsumexp"] },
  { id: "information", title: "Information theory", summary: "Connect surprise, expected information and directional distribution mismatch.", lessons: ["bernoulli-categorical-binomial", "conditional-probability", "entropy-information", "log-loss-confidence-penalties", "kl-divergence"] },
  { id: "vision", title: "Vision", summary: "Prepare images and trace convolution, pooling and normalization before choosing an optional application branch.", lessons: ["mnist-mlp-inference-debugger", "pytorch-image-augmentations", "label-mixing-image-transforms", "convolution-filter-lab", "tensor-shape-broadcasting", "pooling-receptive-fields", "batch-normalization", "cnn-residual-connections", "neural-style-transfer"] },
  { id: "efficient-vision", title: "Vision · optional efficient architectures", summary: "Compare channel factorization, parallel receptive fields and compute allocation.", lessons: ["convolution-filter-lab", "pooling-receptive-fields", "depthwise-separable-convolutions", "multiscale-convolution-branches", "channel-attention-gates", "network-capacity-width-depth", "compound-network-scaling"], parentId: "vision" },
  { id: "vision-detection", title: "Vision · optional detection & OCR", summary: "Inspect boxes and filtering, then decode dense line predictions on real document pixels.", lessons: ["convolution-filter-lab", "tensor-shape-broadcasting", "object-detection-boxes", "ocr-line-detection"], parentId: "vision" },
  { id: "vision-segmentation", title: "Vision · optional segmentation", summary: "Trace learned upsampling and spatial skip connections into pixelwise outputs.", lessons: ["convolution-filter-lab", "pooling-receptive-fields", "tensor-shape-broadcasting", "transposed-convolution-geometry", "unet-segmentation"], parentId: "vision" },
  { id: "vision-transformers", title: "Vision · optional image transformers", summary: "Apply token, position and attention foundations to image patches.", lessons: ["transformer-attention", "multi-head-attention", "positional-encoding-token-order", "transformer-block-residual-stream", "vision-transformer-patches"], parentId: "vision" },
  { id: "transformers", title: "Understand transformers", summary: "Trace tokens through attention and a complete decoder block.", lessons: ["byte-pair-encoding", "tokenization-choices", "llm-loss-perplexity", "vector-geometry-similarity", "matrix-multiplication", "softmax-temperature", "transformer-attention", "multi-head-attention", "context-windows-attention-masks", "positional-encoding-token-order", "layer-normalization", "rms-normalization", "transformer-block-residual-stream"] },
  { id: "transformers-encoder", title: "Transformers · optional masked objectives", summary: "Compare causal targets with bidirectional visibility and masked-token supervision.", lessons: ["self-supervised-objectives", "context-windows-attention-masks", "masked-language-modeling"], parentId: "transformers" },
  { id: "generation", title: "Understand text generation", summary: "Follow token probabilities into decoding and operating metrics; training and inference optimizations are optional paths.", lessons: ["class-score-logits", "softmax-temperature", "byte-pair-encoding", "llm-loss-perplexity", "autoregressive-generation-decoding", "llm-app-ops-metrics"] },
  { id: "generation-efficiency", title: "Generation · optional inference efficiency", summary: "Inspect cached tensors, head sharing, draft verification and tiled attention after basic decoding.", lessons: ["autoregressive-generation-decoding", "transformer-attention", "multi-head-attention", "transformer-block-residual-stream", "kv-caching", "grouped-query-attention", "speculative-decoding", "gpu-memory-compute", "stable-softmax-logsumexp", "flash-attention-tiling"], parentId: "generation" },
  { id: "sequence-models", title: "Sequence & language models", summary: "Compare fixed context, recurrent memory, temporal credit and cross-attention.", lessons: ["llm-loss-perplexity", "bigram-language-model", "neural-network-forward-pass", "fixed-window-language-model", "recurrent-hidden-state", "lstm-gates", "gru-gates", "backpropagation-through-time", "transformer-attention", "multi-head-attention", "seq2seq-cross-attention"] },
  { id: "representations", title: "Learn representations", summary: "Learn embeddings, reconstruction and self-supervised representations.", lessons: ["embedding-retrieval", "neural-network-training-loop", "word2vec-negative-sampling", "self-supervised-objectives", "autoencoders-latent-bottleneck", "denoising-autoencoders", "sparse-autoencoder-features", "contrastive-loss", "contrastive-infonce", "clip-image-text-alignment"] },
  { id: "nlp-applications", title: "Structured NLP · foundations", summary: "Refresh token scores and text-evaluation conventions, then choose an entity-label or answer-span application.", lessons: ["tokenization-choices", "class-score-logits", "reference-answer-metrics", "edit-distance-error-rates"] },
  { id: "nlp-entities", title: "Structured NLP · optional entities", summary: "Predict entity spans before adding transition scores and constrained decoding.", lessons: ["token-classification-entities", "crf-sequence-decoding"], parentId: "nlp-applications" },
  { id: "nlp-qa", title: "Structured NLP · optional answer spans", summary: "Select valid answer spans or no answer independently of the entity/CRF branch.", lessons: ["extractive-question-answering"], parentId: "nlp-applications" },
  { id: "adaptation", title: "Adapt pretrained models", summary: "Move from frozen features to fine-tuning, adapters and preferences.", lessons: ["transfer-learning", "matrix-multiplication", "transformer-block-residual-stream", "instruction-tuning", "lora-low-rank-adapters", "soft-prompts-prefix-tuning", "floating-point-precision", "gpu-memory-compute", "fine-tuning-memory-budgets", "preference-judge-metrics", "kl-divergence", "instruction-tuning-preferences"] },
  { id: "audio", title: "Audio & speech", summary: "Connect waveforms and spectrograms with unaligned speech targets.", lessons: ["audio-waveforms-sampling", "audio-spectrograms", "mel-frequency-features", "ctc-alignment", "edit-distance-error-rates"] },
  { id: "generative", title: "Generative models · foundations", summary: "Refresh training and noise, then choose a latent, adversarial or diffusion branch with its own relevant loss refreshers.", lessons: ["neural-network-training-loop", "normal-distribution-z-scores"] },
  { id: "generative-latents", title: "Generative models · optional latent models", summary: "Compare reconstruction bottlenecks, probabilistic latents and discrete codebooks.", lessons: ["autoencoders-latent-bottleneck", "self-supervised-objectives", "denoising-autoencoders", "kl-divergence", "variational-autoencoders", "k-means-clustering", "vqvae-codebooks"], parentId: "generative" },
  { id: "generative-adversarial", title: "Generative models · optional adversarial training", summary: "Inspect the generator/discriminator game without taking the latent-model sequence.", lessons: ["neural-network-training-loop", "log-loss-confidence-penalties", "gan-adversarial-training"], parentId: "generative" },
  { id: "generative-diffusion", title: "Generative models · optional diffusion", summary: "Learn noise and reverse sampling first; latent conditioning is a later composition, with architecture refreshers available separately.", lessons: ["normal-distribution-z-scores", "neural-network-training-loop", "diffusion-denoising", "diffusion-sampling-budgets", "variational-autoencoders", "seq2seq-cross-attention", "latent-diffusion"], parentId: "generative" },
  { id: "llm-evaluation", title: "Evaluate an LLM", summary: "Compare answer scores, judges, safety and operating tradeoffs.", lessons: ["reference-answer-metrics", "benchmark-scores-pass-k", "preference-judge-metrics", "safety-refusal-robustness-metrics", "embedding-retrieval", "retrieval-ranking-metrics", "rag-pipeline", "rag-groundedness-metrics", "evidence-sufficiency-guardrails", "llm-app-ops-metrics"] },
  { id: "search", title: "Search & reinforcement learning", summary: "Move from exploration and tree search to learned values, policies and world models.", lessons: ["expected-value-risk", "exploration-exploitation", "monte-carlo-tree-search", "sequential-decisions-returns", "q-learning", "n-step-return-targets", "model-based-rl", "prioritized-planning", "backpropagation-inspector", "neural-network-training-loop", "deep-q-networks", "softmax-temperature", "policy-gradients", "actor-critic", "ppo-policy-updates"] },
  { id: "continuous-control", title: "Continuous control", summary: "Move from actor–critic foundations to bounded actions and off-policy control.", lessons: ["n-step-return-targets", "actor-critic", "continuous-control-policies", "deep-q-networks", "soft-actor-critic", "td3-delayed-updates"] },
  { id: "efficiency", title: "Model efficiency", summary: "Compare compression, memory traffic and sparse computation.", lessons: ["floating-point-precision", "linear-quantization-int4", "neural-network-training-loop", "stochastic-gradient-noise", "gradient-accumulation", "quantization-aware-training", "binary-ternary-training", "softmax-temperature", "kl-divergence", "knowledge-distillation", "model-pruning", "matrix-multiplication", "tensor-shape-broadcasting", "gpu-memory-compute", "transformer-attention", "flash-attention-tiling", "transformer-block-residual-stream", "mixture-of-experts-routing"] },
  { id: "interpretability", title: "Interpretability & input robustness", summary: "Compare local explanations, attribution assumptions and input attacks.", lessons: ["mnist-mlp-inference-debugger", "integrated-gradients", "lime-local-surrogates", "shap-feature-attribution", "convolution-filter-lab", "grad-cam", "adversarial-perturbations"] },
  { id: "advanced", title: "Advanced learning & phenomena", summary: "Explore task adaptation, graph structure and unusual learning curves.", lessons: ["transfer-learning", "regularization", "continual-learning", "continual-parameter-protection", "task-parameter-isolation", "calibration-reliability-diagrams", "active-learning", "bias-variance-tradeoff", "learning-curves-data-budgets", "curriculum-training-order", "matrix-multiplication", "graph-message-passing", "few-shot-meta-learning", "meta-learning-inner-outer-loops", "multi-task-loss-balancing", "double-descent", "grokking-delayed-generalization"] },
  { id: "alternatives", title: "Alternative architectures & learning", summary: "Explore energy-based memory, external state, continuous depth and gradient-free search.", lessons: ["matrix-multiplication", "hopfield-associative-memory", "rbm-gibbs-sampling", "recurrent-hidden-state", "transformer-attention", "differentiable-memory-addressing", "neural-memory-read-write", "convolution-filter-lab", "capsule-routing", "cnn-residual-connections", "neural-odes", "neural-network-training-loop", "forward-forward-learning", "neuroevolution"] },
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

export type Prerequisite = { concept: string; lesson?: string };
export const lessonPrerequisites: Record<string, readonly Prerequisite[]> = {
  ...Object.fromEntries(plannedPlaygroundDefinitions.map(lesson => [lesson.slug, lesson.prerequisites])),
  "ocr-line-detection": [{ concept: "Image grids and convolution stride", lesson: "convolution-filter-lab" }, { concept: "Tensor axes and indexing", lesson: "tensor-shape-broadcasting" }, { concept: "Sigmoid scores", lesson: "activation-functions" }],
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

// Preserve preference order whenever prerequisites do not require a move.
// Paths may assume foundations elsewhere, but may not reverse dependencies
// when both lessons are present. The approved core retains its exact sequence.
function orderWithPrerequisites(preference: readonly string[]): string[] {
  const normalizedPreference = preference.map(canonicalLessonSlug);
  const candidates = new Set(normalizedPreference);
  const ordered: string[] = [];
  const visiting = new Set<string>();
  const visited = new Set<string>();
  function append(slug: string) {
    if (visited.has(slug)) return;
    if (visiting.has(slug)) throw new Error(`Cyclic curriculum prerequisite: ${slug}`);
    visiting.add(slug);
    for (const prerequisite of (getLessonGroup(slug)?.chapters ?? [slug]).flatMap(chapter => lessonPrerequisites[chapter] ?? [])) {
      if (!prerequisite.lesson) continue;
      const dependency = canonicalLessonSlug(prerequisite.lesson);
      if (dependency !== slug && candidates.has(dependency)) append(dependency);
    }
    visiting.delete(slug);
    visited.add(slug);
    ordered.push(slug);
  }
  for (const slug of normalizedPreference) append(slug);
  return ordered;
}

export const learningPaths: readonly LearningPath[] = learningPathDefinitions.map(path => ({
  ...path,
  lessons: path.id === "core" ? path.lessons : orderWithPrerequisites(path.lessons),
}));

// Learner order follows path foundations and prerequisites, independently of the build queue.
// Shared chapters resolve to one dashboard card; every card appears once.
export const dashboardLessonPlanOrder: readonly string[] = orderWithPrerequisites([
  ...coreLessonOrder,
  ...learningPaths.flatMap(path => path.lessons), ...referenceSlugs,
]);
