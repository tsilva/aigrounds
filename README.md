<p align="center">
  <img src="logo.png" alt="AI Grounds" width="420" />
  <br />
  <!-- repo-tagline:start -->
  <strong>🧠 Learn AI by experimenting with algorithms 🔬</strong>
  <!-- repo-tagline:end -->
  <br />
  <a href="https://aigrounds.tsilva.eu">Live Demo</a>
</p>

<p align="center">
  <a href="https://github.com/tsilva/aigrounds/actions/workflows/ci.yml"><img src="https://github.com/tsilva/aigrounds/actions/workflows/ci.yml/badge.svg?branch=main" alt="CI status on main" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/tsilva/aigrounds" alt="MIT license" /></a>
</p>

AI Grounds is a web app for people learning artificial intelligence through hands-on experiments. Move data points, tune parameters, and step through algorithms to see how their behavior changes. Try the [live playgrounds](https://aigrounds.tsilva.eu) to explore statistics, probability, neural networks, and more.

The gallery opens with a **20-step AI core** and optional paths for probability, inference, evaluation, retrieval, transformers, vision and search. Five pairs share a curriculum entry with linked chapters; every published chapter keeps its original URL. The Concept Atlas and Zero Knowledge Proofs sit under Explore & reference. Five new bridge lessons connect classification scores to decisions, backward gradients to training, token probabilities to generation, attention to a complete decoder block, and retrieval to answer evidence.

Lessons show prerequisites, chapter links and a path-aware next step. Visits, self-reported review and explained transfer checks are saved separately in this browser, with delayed recall practice; no account is required. Many lessons guide you through **Predict → Try → Explain**, with an optional AI Guide in the experiment rail. Use a desktop or laptop: screens below 768 pixels show a notice instead of the playgrounds. See the [curriculum](docs/curriculum.md) for the core, path map, chapter consolidations and bridge lessons.

## Install

Use Node.js 24 (the CI version) and pnpm 10.27.0.

```bash
git clone https://github.com/tsilva/aigrounds.git
cd aigrounds
pnpm install --frozen-lockfile
pnpm dev --port auto
```

Open the local URL printed by the dev server. Playground experiments work without an API key; see [configuration](docs/configuration.md) to enable the AI Guide or monitoring.

## Commands

```bash
pnpm dev --port auto   # start development on an available port
pnpm build            # build production output and check TypeScript
pnpm start --port auto # serve a production build
pnpm typecheck        # check TypeScript separately
pnpm lint             # run ESLint
pnpm check:cycles     # check for import cycles
pnpm check:bridges    # verify the five bridge engines independently
pnpm test:deps        # check patched dependency security boundaries
```

## Notes

- [The Training Loop](src/modules/neural-network-training-loop) steps an actual tiny model through forward values, batch loss, backward gradients and parameter updates while keeping held-out rows out of fitting.
- [Linear Classification & Decision Boundaries](src/modules/linear-classification-boundaries) connects editable weights, bias and cutoff policy to fixed observations, sigmoid readouts and degenerate boundaries.
- [How Tokens Become an Answer](src/modules/autoregressive-generation-decoding) feeds selected tokens into an authored prefix with reproducible sampling, candidate filtering and distinct EOS/length stopping.
- [Inside a Transformer Block](src/modules/transformer-block-residual-stream) traces a disclosed two-token pre-norm block, causal attention and separate attention/MLP residual additions.
- [From Retrieval to a Grounded Answer](src/modules/rag-pipeline) separates authored rankings, supplied context and answer evidence, including unsupported, outdated and incomplete claims.
- [LLM App Ops Metrics Lab](https://aigrounds.tsilva.eu/playgrounds/llm-app-ops-metrics) traces a toy single-worker request timeline, model/client first content, queueing, finite-window throughput, cold prefix reuse and fictional token charges.
- [Safety, Refusal & Robustness Metrics Lab](https://aigrounds.tsilva.eu/playgrounds/safety-refusal-robustness-metrics) traces harmful compliance, benign false refusal, conditional jailbreak success and all-variant robustness through a disclosed authored outcome bank.
- [RAG Groundedness Metrics Lab](https://aigrounds.tsilva.eu/playgrounds/rag-groundedness-metrics) separates retrieved context relevance, claim faithfulness, citation support/precision and reference completeness through disclosed fictional sources, fragments, invalid citations and outdated evidence.
- [Preference & Judge Metrics Lab](https://aigrounds.tsilva.eu/playgrounds/preference-judge-metrics) traces disclosed rubric weights, toy position/length judge bonuses, win and tie-adjusted rates, reference agreement and exact sequential pairwise rating updates.
- [Benchmark Scores & Pass@k Lab](https://aigrounds.tsilva.eu/playgrounds/benchmark-scores-pass-k) separates first/sample accuracy, exact per-item pass@k and plurality voting in disclosed authored batches, with descriptive variation and exposure-subset comparisons.
- [Reference Answer Metrics Lab](https://aigrounds.tsilva.eu/playgrounds/reference-answer-metrics) traces normalization, clipped token F1, fixed BLEU-1/2, sentence ROUGE-L F1 and a disclosed toy vector cosine through authored answer counterexamples and boundary conventions.
- [RMSNorm Lab](https://aigrounds.tsilva.eu/playgrounds/rms-normalization) compares RMS scaling with mean-centered LayerNorm through editable feature coordinates, epsilon, shared gain and exact output construction, including undefined zero denominators.
- [Positional Encoding & Token Order](https://aigrounds.tsilva.eu/playgrounds/positional-encoding-token-order) compares fixed token identity, absolute sine/cosine additions and rotary query/key signals through exact vector construction and signed raw-score changes under reordering or a common shift.
- [Context Windows & Attention Masks](https://aigrounds.tsilva.eu/playgrounds/context-windows-attention-masks) intersects a shared context slice, self-inclusive causal direction and padding-key eligibility in an exact eight-token permission grid, with explicit inactive-query and padding-query policies.
- [LLM Loss & Perplexity Lab](https://aigrounds.tsilva.eu/playgrounds/llm-loss-perplexity) traces authored next-token probabilities through local NLL, four-target mean cross entropy, perplexity and bits per token, with exact zero-probability costs.
- [Neural Network Forward Pass Lab](https://aigrounds.tsilva.eu/playgrounds/neural-network-forward-pass) traces editable weights through fixed inputs, hidden biases and ReLU to raw class scores, including clipped paths and exact ties.
- [Activation Functions Lab](https://aigrounds.tsilva.eu/playgrounds/activation-functions) compares ReLU, sigmoid and tanh through a shared input, selected-rule flow, exact outputs, zero-input behavior and bounded saturation.
- [Exploration vs Exploitation Lab](https://aigrounds.tsilva.eu/playgrounds/exploration-exploitation) compares Greedy and UCB on authored option rewards, with manual trials, count bonuses, exact score ties and a twelve-trial budget.
- [K-Means Clustering Studio](https://aigrounds.tsilva.eu/playgrounds/k-means-clustering) separates nearest-center assignment from coordinate-mean updates with editable points and centroids, exact ties, held SSE and an explicit empty-cluster policy.
- [Regularization Lab](https://aigrounds.tsilva.eu/playgrounds/regularization) separates penalty selection from an explicit two-weight grid fit and compares data loss, L1 zeros, L2 shrinkage, score ties and decision boundaries.
- [Contrastive Loss Lab](https://aigrounds.tsilva.eu/playgrounds/contrastive-loss): move three scalar embeddings and tune a positive margin to reconstruct two fixed labeled pair penalties and their mean.
- [Calibration & Reliability Diagrams](https://aigrounds.tsilva.eu/playgrounds/calibration-reliability-diagrams) compares count-weighted confidence bins, ECE binning effects and confidence-based abstention with explicit coverage and retained denominators.
- [Log Loss Confidence Penalties](https://aigrounds.tsilva.eu/playgrounds/log-loss-confidence-penalties) compares individual probability penalties, unchanged accuracy and three-example mean loss, including exact zero/one endpoints.
- [Class Scores & Logits Lab](https://aigrounds.tsilva.eu/playgrounds/class-score-logits) edits raw signed scores, separates common shifts from positive gap scaling, and handles tied maxima before any probability conversion.
- [Entropy & Information Starter](https://aigrounds.tsilva.eu/playgrounds/entropy-information) conserves categorical mass, separates rare-outcome surprise from average entropy, and computes expected information gain from a group observation with explicit zero-probability handling.
- [Retrieval Ranking Metrics Lab](https://aigrounds.tsilva.eu/playgrounds/retrieval-ranking-metrics) reorders judged toy results, separates precision/recall from full-list two-query MRR and graded nDCG, and makes empty-query conventions explicit.
- [Embedding Retrieval Lab](https://aigrounds.tsilva.eu/playgrounds/embedding-retrieval) moves one query around six fixed vectors, contrasts raw Euclidean and cosine ranking, separates top-k inclusion from relevance, and handles tied identities and zero vectors.
- [UMAP Manifold Projection Lab](https://aigrounds.tsilva.eu/playgrounds/umap-manifold-projection) separates source graph scale from soft map packing, computes finite full-pair graph-objective fits, and tests local normalization under uniform source rescaling.
- [t-SNE Neighborhood Map](https://aigrounds.tsilva.eu/playgrounds/t-sne-neighborhood-map) computes exact eight-point affinities and finite optimization checkpoints, separates perplexity from a hard neighbor count, and exposes initialization and global-geometry limits.
- [PCA & Principal Components](https://aigrounds.tsilva.eu/playgrounds/pca-principal-components) centers fixed clouds, compares manual axes with computed principal directions, and reconstructs with one or two components while handling tied and zero variance.
- [Projection Foundations](https://aigrounds.tsilva.eu/playgrounds/projection-foundations) rotates a unit direction, separates signed scalar components from reconstructed points, and traces perpendicular squared loss without task-quality claims.
- [Vector Geometry & Similarity](https://aigrounds.tsilva.eu/playgrounds/vector-geometry-similarity) moves signed 2D vectors, separates dot-product magnitude from cosine alignment, and treats zero vectors as an undefined-direction boundary.

- [Distance Metrics](https://aigrounds.tsilva.eu/playgrounds/distance-metrics) moves a query through an equal-scale grid, compares Euclidean and Manhattan nearest cases, and retains exact ties and coincident identities under an explicit decision policy.

- [Feature Scaling](https://aigrounds.tsilva.eu/playgrounds/feature-scaling) compares raw units, per-feature min–max normalization and z-score standardization with exact reference recipes, outliers and a constant-feature boundary.

- [Precision-Recall Curves & Imbalance](https://aigrounds.tsilva.eu/playgrounds/precision-recall-curves-imbalance) isolates prevalence effects on accepted predictions and distinguishes a threshold point from non-interpolated average precision.

- [ROC, AUC & Thresholds](https://aigrounds.tsilva.eu/playgrounds/roc-auc-thresholds) separates a threshold’s operating point from whole-ranking area, with grouped scores and half-credit ties.

- [Classification Metrics Foundations](https://aigrounds.tsilva.eu/playgrounds/classification-metrics-foundations) traces binary predictions to confusion counts, metric denominators and undefined boundaries before threshold tuning.

- [Bias–Variance Tradeoff](https://aigrounds.tsilva.eu/playgrounds/bias-variance-tradeoff) separates average-fit bias, repeated-training variance and independent response noise in an exactly enumerated finite model.

- [Train/Test Split & Generalization](https://aigrounds.tsilva.eu/playgrounds/train-test-generalization) separates fitting, validation-based choice and later Test evaluation, with an explicit contaminated-fitting comparison.

- [R Squared & Residual Diagnostics](https://aigrounds.tsilva.eu/playgrounds/r-squared-residual-diagnostics) compares equal-score residual patterns and interprets zero or negative scores against the observed-mean benchmark.

- [Least Squares Loss Landscape](https://aigrounds.tsilva.eu/playgrounds/least-squares-loss-landscape) maps slope and intercept to squared error, distinguishing equal-error contours from one joint minimum.

- [Linear Regression Line Fitting](https://aigrounds.tsilva.eu/playgrounds/linear-regression-line-fitting) moves a candidate line through fixed observations and compares its signed vertical residuals with a revealed least-squares reference.
- [Simpson’s Paradox & Confounding Lab](https://aigrounds.tsilva.eu/playgrounds/simpsons-paradox-confounding) reconstructs aggregate success from different task mixes, exposing grouped reversals and causal limits.
- [Lesson details](docs/lessons.md) cover the experiments and current subject coverage. The gallery also supports search and sorting by the latest committed lesson update.
- [Correlation Shape & Outliers Lab](https://aigrounds.tsilva.eu/playgrounds/correlation-shape-outliers) compares Pearson and average-rank Spearman across curves, turning patterns, influential pairs and ties.
- [Covariance & Correlation Map](https://aigrounds.tsilva.eu/playgrounds/covariance-correlation) connects editable paired departures with sample covariance and unitless Pearson correlation, including unit changes and zero-spread cases.
- [Power, Effect Size & Sample Size Lab](https://aigrounds.tsilva.eu/playgrounds/power-effect-size-sample-size) compares conditional detection probabilities for hypothetical true effects and study sizes under a fixed test rule, including null false alarms and tiny positive miss rates.
- [Type I & Type II Errors Lab](https://aigrounds.tsilva.eu/playgrounds/type-i-type-ii-errors) isolates the cutoff tradeoff between conditional false-alarm and missed-effect rates, separating prepared known-truth examples from repeated behavior.
- [Hypothesis Testing Basics](https://aigrounds.tsilva.eu/playgrounds/hypothesis-testing-basics) connects an explicit two-sided A/B null model, observed gap, p-value and predeclared decision threshold without posterior or practical-importance claims.
- The [Confidence Intervals Explorer](https://aigrounds.tsilva.eu/playgrounds/confidence-intervals) shows repeated normal-model intervals around moving sample means, distinguishing finite capture counts from confidence and interval width.
- The [Margin of Error & Sample Size Lab](https://aigrounds.tsilva.eu/playgrounds/margin-of-error-sample-size) isolates size, confidence and known spread in a normal-model planning calculator, separating half-width from actual estimation error.
- The [Central Limit Theorem Lab](https://aigrounds.tsilva.eu/playgrounds/central-limit-theorem) compares standardized averages from skewed and discrete sources with a normal bin reference, including a rare-event counterexample to universal size thresholds.
- [Sampling Distributions & Standard Error](https://aigrounds.tsilva.eu/playgrounds/sampling-distributions-standard-error) separates individual-value spread, theoretical mean SE and a finite batch of repeated estimates; its transfer shows SE is not a guaranteed error bound.
- The [Sampling Bias Lab](https://aigrounds.tsilva.eu/playgrounds/sampling-bias) contrasts incomplete frames, outcome-related nonresponse and survivor-only observation while separating expected bias from finite sample error.
- The [Sampling & Sample Size Lab](https://aigrounds.tsilva.eu/playgrounds/sampling-sample-size) compares reproducible sample estimates with revealed population means and separates larger-sample stability from finite guarantees.
- The [Normal Distribution & Z-Scores Lab](https://aigrounds.tsilva.eu/playgrounds/normal-distribution-z-scores) connects signed distance to normal tail probability and tests shifts, spread changes and transfers between model units.
- The [PDF, CDF & Probability Area Lab](https://aigrounds.tsilva.eu/playgrounds/pdf-cdf-probability-area) connects exact density areas to cumulative endpoint differences and distinguishes density height from probability.
- The [Law of Large Numbers Simulator](https://aigrounds.tsilva.eu/playgrounds/law-large-numbers-simulation) compares reproducible short and long runs, temporary movement away from a model expectation, and averages of coin and die outcomes.
- The Monte Carlo Tree Search lesson demonstrates UCB selection and count backup with explicitly scripted outcomes; it does not implement a game solver.
- Playgrounds run in the browser. The MNIST inference debugger needs WebGPU support.
- The optional AI Guide uses a server API route backed by OpenRouter. API keys stay on the server.
- Analytics and Sentry monitoring depend on environment configuration; see [configuration](docs/configuration.md) for settings and local credential handling.
- All lessons use the shared [learning-page design system](DESIGN_SYSTEM.md), including reusable experiment presentation, evidence typography, parameter grids and accessible table styles. Lesson state, answer checking and mathematical representations stay in each module. [Development notes](docs/development.md) explain lesson registration, validation, update dates, branding, and project workflows.

## License

[MIT](LICENSE)
