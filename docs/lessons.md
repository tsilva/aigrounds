# Lessons

The [live gallery](https://aigrounds.tsilva.eu) is the current catalog of published and planned lessons. Published lessons open directly; planned lessons are marked coming soon.

The gallery opens in curriculum order. Use the sort buttons to switch to newest updates first; search works in either view, and planned lessons follow published lessons when sorting by update date. Published cards show the date of the latest committed change in their module.

## Guided experiments

The Mean, Median & Mode lab pairs a live dataset workspace with guided predict → try → explain experiments. Drag individual points, use the keyboard or an exact value field, and compare aligned summary markers, sorted values, and calculations. The built-in experiments work independently of the optional AI Guide.

The Range, Quartiles & IQR lesson uses an exact shared scale for draggable values, range, and a min/max box plot. Compact sorted halves show the median-of-halves calculation. Three predict → try → explain experiments contrast an extreme moving outward, a quartile contributor moving, and a value changing sorted position; incorrect explanations cannot complete an experiment. The exercises work independently of the optional AI Guide.

The Variance & Standard Deviation lesson compares same-mean presets, signed distances, squared contributions, and population variance. A compact evidence table and exact value editor support three predict → try → explain experiments, including incorrect-explanation recovery. Standard deviation restores the original units; the existing calculation engine and presets are preserved.

The Backpropagation Inspector uses one staged computation graph and four predict → try → explain experiments to compare weight gradients, isolate a target change, scale an optimizer step, and distinguish hidden-activation signals. The visual view sits above the equivalent matrix view, with paired scalar and matrix forms for gradients, hidden signals, and updates. Both use the same live values and one set of controls. Exact activation and learning-rate editors support free exploration. One-step previews recompute probability and binary cross entropy from full-precision gradients; bias and cached activations remain fixed.

The Matrix Multiplication lesson uses the shared workbench and experiment rail for shape compatibility, stepwise row-column products, and comparisons across output cells. It retains three matrix presets, all output formulas, and the incompatible-shape example, with prediction/action/explanation checks and optional transfer practice.

The Shape, Skew & Outliers lesson uses the shared workbench and rail for four experiments and a transfer check. Its histogram, exact points, min-to-max box plot, and same-count summary comparisons distinguish tail direction, binning, unusual points, robust summaries, and hidden clusters. Quartiles follow the same median-of-halves convention as the Range, Quartiles & IQR lesson.

The Probability Rules lesson retains every dice event pair and six set-operation views in an accessible sample-space table. Four guided experiments and a new-event transfer check connect exact counts to complements, intersections, inclusive unions, set differences, and simulated frequencies. Shared workbench controls keep selects, mode buttons, and compact actions consistent across lessons.

The Conditional Probability & Independence lesson uses an exact four-cell count table, an optional 100-person grid, and three guided experiments plus a transfer check. Learners change the eligible reference group while retaining the overlap, compare independence as equal rates rather than equal counts, and distinguish a higher conditional rate from a changed population. Incorrect explanations and stale answers cannot complete the exercises.

The Bayes Rule lesson preserves both signal scenarios, three presets, and all rate ranges while replacing rounded person counts with exact expected frequencies. Three guided experiments and a fraud transfer check connect the prior, sensitivity, and false-positive rate to the two positive-result pools. Native sliders pair with exact percentage editors; the count table and proportional bar use the same full-precision model. Fractional expectations are explicitly distinguished from sample counts.

The Expected Value & Risk lesson preserves three two-bet presets, six payoff/probability controls and three sample lengths. Four guided experiments and a transfer check connect weighted payoffs, per-round spread, break-even and finite sample averages. Exact editors pair with native sliders; probability bars, arithmetic and accessible sample tables replace ambiguous spread bars and unlabeled outcome ticks. Seeded streams preserve wins/losses across payoff edits and shared prefixes across sample lengths, making non-monotonic sample behavior visible.

The Bernoulli, Categorical & Binomial lesson distinguishes a single yes/no outcome, one nominal class label and a count of independent equal-probability trials. Three guided experiments and a one-trial transfer check use fixed-scale probability bars, exact parameter editors, full-precision mass and tied modes. Categorical summaries avoid invented numerical moments; optional formulas and a keyboard-scrollable probability table preserve the supporting evidence.

Waiting & Arrival Distributions separates exact geometric waiting times from Poisson count approximations under independent one-second ticks. Three guided experiments and a new-window transfer check compare event chance, observation length, exact at-least-one tick probability and the small-expected-count linear shortcut. Fixed-scale probability bars include a labeled pooled count tail; an optional seeded tick timeline shows actual events without forcing the expected count.

The Overfitting lesson compares polynomial fits on training circles and held-out squares through three controlled experiments and a sparse-data transfer check. Fixed fitting constraints and stable axes across degrees expose error changes without automatic degree-based labels. Optional point predictions and all-degree losses support exact comparisons; the noise-zero counterexample and validation/test distinction challenge misleading generalization rules.

Confusion Matrix & Thresholds uses fixed score lanes, an inclusive cutoff, a complete confusion matrix, and separate precision/recall denominators. Its three guided experiments cover catching more cases, a stricter-cutoff precision counterexample, and undefined precision; the transfer check applies equality to Spam Filter. All twelve example decisions and F1/accuracy formulas remain available as supporting evidence.

Softmax Temperature Lab separates positive temperature scaling from score edits, using four exact logit controls and probability bars on a fixed scale. Three guided experiments cover preserved ranking, competition through normalization, and uniform probabilities for equal logits; a close-call transfer check distinguishes concentration from certainty or correctness. Supporting normalization and entropy evidence defines shifted weights, natural-log units, and relative spread.

Cross Entropy Loss compares binary complements, one-hot categorical targets, and separate multi-label predictions through three guided experiments and a changed-target transfer check. Fixed-scale probability bars show each target and its loss contribution; false labels remain part of the four-label mean. Exact whole-percent controls keep exclusive distributions normalized without hidden loss clipping, while optional worked calculations and all original reference cases retain supporting evidence.

KL Divergence Intuition Lab compares the original three reference distributions with exact, normalized Q edits. Three prediction → try → explanation experiments expose signed source-weighted terms, a full match and direction, then transfer to a changed reference with Q fixed. Optional worked calculations and a fixed-scale signed chart accompany the paired probability bars. The engine handles zero-source and zero-target limits without clipping.

Gradient Descent Playground preserves the scalar quadratic, three original presets and rate/momentum ranges while following the full-precision update without clamps. Four controlled experiments distinguish slow descent, a rate-only comparison, crossing with lower loss and momentum raising one loss; a new-rate transfer follows. The actual curve, proposed point, signed arithmetic and optional history replace heuristic convergence badges. Run checks both position and stored velocity before stopping.

Convolution Filter Lab links three image scenarios to selectable output cells and exact weighted-sum arithmetic. Its five prediction → try → explanation experiments finish with a zero-padding transfer check, with AI Guide access in the experiment rail.

## Coverage

The app currently includes labs for Mean, Median & Mode, Range, Quartiles & IQR, Variance & Standard Deviation, Shape, Skew & Outliers, Probability Rules, Conditional Probability & Independence, Bayes Rule, Expected Value & Risk, Bernoulli/Categorical/Binomial distributions, Waiting & Arrival Distributions, Overfitting, Confusion Matrix & Thresholds, Softmax Temperature, Cross Entropy Loss, KL Divergence, Matrix Multiplication, Tensor Shape & Broadcasting, Gradient Descent, Monte Carlo Tree Search, Byte Pair Encoding, Transformer Attention, Batch Normalization, Layer Normalization, MNIST MLP Inference Debugging with WebGPU, Convolution Filter Lab, PyTorch Image Augmentations, Label-Mixing Image Transforms, Autograd Graphs, Backpropagation Inspector, Linear Quantization (INT4), Zero Knowledge Proofs, and the AI Concept Atlas.
