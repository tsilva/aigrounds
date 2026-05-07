# TODO

## Data Science / AI / ML Foundations Roadmap

Ranked by learning priority. Each item is scoped as one fully interactive playground-sized chunk: one core intuition, one primary visual interaction, and enough description to teach the concept thoroughly. Concepts are merged only when they naturally share the same interaction.

1. [x] **Mean, Median & Mode Lab**
   Learn mean, median, mode, weighted mean, and why each "typical value" can tell a different story. Drag data points across a number line and watch the summaries move differently.

2. [x] **Range, Quartiles & IQR Explorer**
   Learn minimum, maximum, range, quartiles, percentile rank, interquartile range, and box plots. Move points in and out of the middle 50% to see which summaries resist extremes.

3. [x] **Variance & Standard Deviation Lab**
   Learn deviations from the mean, squared deviations, variance, standard deviation, and why spread can change while the mean stays fixed. Use one draggable dataset with live deviation bars.

4. [x] **Shape, Skew & Outliers Lab**
   Learn histograms, density shape, skew, tails, outliers, robustness, and why a single summary statistic is not enough. Add/remove outliers and compare histogram, box plot, and summary stats.

5. [x] **Probability Rules Simulator**
   Learn sample spaces, events, complements, unions, intersections, mutually exclusive events, and basic probability arithmetic. Use dice/cards/spinners so probability starts as counting outcomes.

6. [x] **Conditional Probability & Independence Lab**
   Learn conditional probability, joint probability, marginal probability, independence, dependence, and base rates. Filter a population grid and watch probabilities change as conditions are applied.

7. [x] **Bayes Rule Playground**
   Learn Bayes theorem, priors, likelihoods, posteriors, false positives, false negatives, and base-rate neglect. Use a medical-test or fraud-detection scenario with adjustable prevalence and test accuracy.

8. [x] **Expected Value & Risk Lab**
   Learn random variables, expected value, probability-weighted outcomes, variance of outcomes, and risk/reward tradeoffs. Build simple games or bets and compare long-run average outcomes.

9. [x] **Bernoulli, Categorical & Binomial Lab**
   Learn Bernoulli trials, categorical outcomes, binomial counts, parameters, and probability mass. Adjust success probability and trial count to watch mass move across outcome counts.

10. **Waiting & Arrival Distributions Lab**
    Learn geometric and Poisson distributions, waiting time, event counts, rates, and rare-event intuition. Tune event probability or arrival rate and compare likely waits or counts.

11. **PDF, CDF & Probability Area Lab**
    Learn continuous random variables, uniform and normal shapes, PDFs, CDFs, percentiles, and probability as area under a curve. Move interval bounds and watch shaded probability update.

12. **Normal Distribution & Z-Scores Lab**
    Learn the normal distribution, mean, standard deviation, z-scores, tail probabilities, and percentile lookup. Move a value across a bell curve and connect raw units to standardized distance.

13. **Sampling & Sample Size Lab**
    Learn population vs sample, random sampling, sample size, sampling variability, law of large numbers, and why bigger samples stabilize estimates. Repeatedly sample from a hidden population.

14. **Sampling Bias Lab**
    Learn selection bias, survivorship bias, nonresponse bias, confounding from bad sampling, and why a large biased sample can still be wrong. Compare random samples with biased collection rules.

15. **Standard Error & Margin of Error Lab**
    Learn sampling distributions, standard error, margin of error, and how uncertainty shrinks with sample size. This is the bridge from sampling into confidence intervals.

16. **Confidence Intervals Explorer**
    Learn confidence level, confidence intervals, coverage, interval width, and common misinterpretations. Run many simulated samples and show which intervals capture the true population value.

17. **Hypothesis Testing Basics**
    Learn null hypothesis, alternative hypothesis, test statistic, p-value, significance level, and statistical decision rules. Use one clean A/B test with controllable difference between groups.

18. **Errors, Power & Effect Size Lab**
    Learn Type I error, Type II error, statistical power, effect size, sample size, and practical vs statistical significance. Show why "not significant" does not always mean "no effect."

19. **Covariance & Correlation Map**
    Learn covariance, Pearson correlation, correlation direction, correlation strength, and scale sensitivity. Drag points on a scatterplot and watch the metrics update.

20. **Correlation Shape & Outliers Lab**
    Learn Spearman rank correlation, nonlinear relationships, outliers, and why similar Pearson correlations can hide different scatterplot shapes. Switch among datasets and drag outliers to compare correlation metrics.

21. **Simpson's Paradox & Confounding Lab**
    Learn confounders, grouped relationships, Simpson's paradox intuition, and why correlation is not causation. Toggle between subgroup and combined views to see the apparent relationship reverse.

22. **Linear Regression Line Fitting**
    Learn slope, intercept, predictions, residuals, least squares, mean absolute error, and mean squared error. Drag a regression line before revealing the best-fit line.

23. **R Squared & Residual Diagnostics**
    Learn R squared, adjusted R squared, residual plots, unexplained variance, overclaiming fit quality, and when a high R squared is misleading. Pair the same score with different residual patterns.

24. **Train/Test Split & Generalization Lab**
    Learn train/test split, validation sets, baseline models, generalization gap, data leakage, and why fitting known data is not the same as predicting new data. Overfitting covers part of this story, but this broader split-and-leakage lesson is still open.

25. **Classification Metrics Foundations**
    Learn accuracy, precision, recall, F1, specificity, sensitivity, false positives, false negatives, and class imbalance. Confusion Matrix & Thresholds covers the threshold tradeoff; this foundations lesson is still open for specificity, sensitivity, and class imbalance.

26. **Feature Scaling Lab**
    Learn units, normalization, standardization, min-max scaling, and why feature scale changes model behavior. Rescale axes or features and watch the same points become comparable.

27. **Distance Metrics Lab**
    Learn Euclidean distance, Manhattan distance, nearest neighbors, and why distance depends on both metric choice and feature scale. Move points on a grid and compare nearest-neighbor decisions.

28. **Entropy & Information Starter**
    Learn surprise, entropy, uncertainty, and information gain. Softmax Temperature shows an entropy readout, but this standalone uncertainty and information-gain lesson is still open.

29. **Log Loss & Calibration Lab**
    Learn log loss, calibrated probabilities, confidence, and why confident wrong predictions hurt. Cross Entropy Loss covers the scoring penalty; this remains open for calibration against observed frequencies.

30. **KL Divergence Intuition Lab**
    Learn KL divergence, reference distributions, model distributions, and why one distribution can be a poor approximation of another. Move probability mass between buckets and watch directional mismatch change.

31. **Vector Geometry & Similarity Lab**
    Learn vectors, dimensions, dot products, magnitude, cosine similarity, and nearest-neighbor intuition. Move vectors in 2D before connecting the same geometry to embeddings.

32. **Projection Foundations Lab**
    Learn projection, components, reconstruction error, variance captured, and why choosing an axis can preserve or lose structure. Rotate a projection axis and watch points collapse onto one dimension.

33. **Embedding Retrieval Lab**
    Learn embeddings, query vectors, document vectors, cosine similarity ranking, nearest-neighbor retrieval, and why semantic search depends on geometry. Move a query point and watch retrieved items reorder.

34. **Contrastive Loss Lab**
    Learn anchor, positive, and negative examples, pair similarity, margins, temperature, and why representation learning pulls matching pairs together while pushing mismatches apart. Move embedding points and tune the margin or temperature to watch pairwise loss terms change.

## Ranked Playground Ideas

1. [x] **Cross Entropy Loss**
   Move probability mass around and watch classification penalties update instantly. This is live as the loss-focused bridge from probability foundations into model training.

2. [x] **Softmax Temperature Lab**
   Adjust raw logits and temperature to see predictions snap from uncertain to overconfident. Best paired with cross entropy because it explains where class probabilities come from.

3. [x] **Gradient Descent Playground**
   Move across a loss landscape step by step. Tune learning rate and momentum to see convergence, slow learning, and overshooting.

4. [x] **Overfitting Lab**
   Fit curves to noisy data while changing model complexity. Show train loss dropping while test loss gets worse.

5. [x] **Confusion Matrix & Thresholds**
   Drag a classification threshold and watch precision, recall, F1, false positives, and false negatives update. Very practical and instantly understandable after generalization basics.

6. **K-Means Clustering Studio**
   Place points and centroids, then step through assign/update cycles. Simple, visual, and satisfying.

7. **Regularization Lab**
   Compare no regularization, L1, and L2 while weights and decision boundaries change. Best if paired with overfitting.

8. **Backpropagation Inspector**
   Use a tiny neural net to show forward activations and backward gradients. Powerful, but harder to make beginner-friendly on one page.

9. **ROC vs Precision-Recall Curves**
   Move a threshold across classifier scores and trace both curves. Useful, but probably better after the confusion-matrix module exists.

10. [x] **Transformer Attention Playground**
    Adjust a token's query focus and watch attention weights decide which context tokens flow into its next representation.
