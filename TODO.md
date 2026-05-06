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

5. **Probability Rules Simulator**
   Learn sample spaces, events, complements, unions, intersections, mutually exclusive events, and basic probability arithmetic. Use dice/cards/spinners so probability starts as counting outcomes.

6. **Conditional Probability & Independence Lab**
   Learn conditional probability, joint probability, marginal probability, independence, dependence, and base rates. Filter a population grid and watch probabilities change as conditions are applied.

7. **Bayes Rule Playground**
   Learn Bayes theorem, priors, likelihoods, posteriors, false positives, false negatives, and base-rate neglect. Use a medical-test or fraud-detection scenario with adjustable prevalence and test accuracy.

8. **Expected Value & Risk Lab**
   Learn random variables, expected value, probability-weighted outcomes, variance of outcomes, and risk/reward tradeoffs. Build simple games or bets and compare long-run average outcomes.

9. **Discrete Distributions Playground**
   Learn Bernoulli, categorical, binomial, geometric, and Poisson distributions. Adjust parameters and watch probability mass move across outcomes.

10. **Continuous Distributions Playground**
    Learn uniform, normal, PDF, CDF, percentiles, z-scores, and probability as area under a curve. Move interval bounds and watch shaded probability update.

11. **Sampling & Sample Size Lab**
    Learn population vs sample, random sampling, sample size, sampling variability, law of large numbers, and why bigger samples stabilize estimates. Repeatedly sample from a hidden population.

12. **Sampling Bias Lab**
    Learn selection bias, survivorship bias, nonresponse bias, confounding from bad sampling, and why a large biased sample can still be wrong. Compare random samples with biased collection rules.

13. **Standard Error & Margin of Error Lab**
    Learn sampling distributions, standard error, margin of error, and how uncertainty shrinks with sample size. This is the bridge from sampling into confidence intervals.

14. **Confidence Intervals Explorer**
    Learn confidence level, confidence intervals, coverage, interval width, and common misinterpretations. Run many simulated samples and show which intervals capture the true population value.

15. **Hypothesis Testing Basics**
    Learn null hypothesis, alternative hypothesis, test statistic, p-value, significance level, and statistical decision rules. Use one clean A/B test with controllable difference between groups.

16. **Errors, Power & Effect Size Lab**
    Learn Type I error, Type II error, statistical power, effect size, sample size, and practical vs statistical significance. Show why "not significant" does not always mean "no effect."

17. **Covariance & Correlation Map**
    Learn covariance, Pearson correlation, correlation direction, correlation strength, and scale sensitivity. Drag points on a scatterplot and watch the metrics update.

18. **Correlation Traps Lab**
    Learn Spearman rank correlation, nonlinear relationships, outliers, Simpson's paradox intuition, confounders, and why correlation is not causation. Use multiple datasets that share similar correlations but tell different stories.

19. **Linear Regression Line Fitting**
    Learn slope, intercept, predictions, residuals, least squares, mean absolute error, and mean squared error. Drag a regression line before revealing the best-fit line.

20. **R Squared & Residual Diagnostics**
    Learn R squared, adjusted R squared, residual plots, unexplained variance, overclaiming fit quality, and when a high R squared is misleading. Pair the same score with different residual patterns.

21. **Train/Test Split & Generalization Lab**
    Learn train/test split, validation sets, baseline models, generalization gap, data leakage, and why fitting known data is not the same as predicting new data.

22. **Classification Metrics Foundations**
    Learn accuracy, precision, recall, F1, specificity, sensitivity, false positives, false negatives, and class imbalance. Keep this focused on metric meaning before adding threshold curves.

23. **Feature Scaling & Distance Lab**
    Learn units, normalization, standardization, min-max scaling, Euclidean distance, Manhattan distance, and why scale changes k-NN, clustering, and gradient descent behavior.

24. **Entropy & Information Starter**
    Learn surprise, entropy, uncertainty, and information gain. Use guessing games or decision splits before introducing model loss functions.

25. **Cross Entropy, KL & Log Loss Bridge**
    Learn cross entropy, KL divergence intuition, log loss, calibrated probabilities, and why confident wrong predictions hurt. This should connect directly to the existing categorical cross entropy and softmax playgrounds.

26. **Vectors, Projection & PCA Foundations**
    Learn vectors, dimensions, dot products, projection, variance captured, principal components, and explained variance. This prepares users for embeddings, PCA, and representation learning.

## Ranked Playground Ideas

1. [x] **Softmax Temperature Lab**
   Adjust raw logits and temperature to see predictions snap from uncertain to overconfident. Best follow-up to cross entropy because it explains where class probabilities come from.

2. [x] **Gradient Descent Playground**
   Move across a loss landscape step by step. Tune learning rate and momentum to see convergence, slow learning, and overshooting.

3. [x] **Confusion Matrix & Thresholds**
   Drag a classification threshold and watch precision, recall, F1, false positives, and false negatives update. Very practical and instantly understandable.

4. [x] **Overfitting Lab**
   Fit curves to noisy data while changing model complexity. Show train loss dropping while test loss gets worse.

5. **Embedding Similarity Explorer**
   Move vectors around and watch cosine similarity, nearest neighbors, and retrieval rankings change. Strong bridge from BM25 to semantic search.

6. **K-Means Clustering Studio**
   Place points and centroids, then step through assign/update cycles. Simple, visual, and satisfying.

7. **Backpropagation Inspector**
   Use a tiny neural net to show forward activations and backward gradients. Powerful, but harder to make beginner-friendly on one page.

8. **Regularization Lab**
   Compare no regularization, L1, and L2 while weights and decision boundaries change. Best if paired with overfitting.

9. **PCA Projection Lab**
   Rotate a projection axis and show variance captured. Good visual geometry, but a little less central than the others.

10. **ROC vs Precision-Recall Curves**
    Move a threshold across classifier scores and trace both curves. Useful, but probably better after the confusion-matrix module exists.
