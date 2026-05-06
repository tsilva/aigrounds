# TODO

## Ranked Playground Ideas

1. [x] **Softmax Temperature Lab**
   Adjust raw logits and temperature to see predictions snap from uncertain to overconfident. Best follow-up to cross entropy because it explains where class probabilities come from.

2. [x] **Gradient Descent Playground**
   Move across a loss landscape step by step. Tune learning rate and momentum to see convergence, slow learning, and overshooting.

3. [x] **Confusion Matrix & Thresholds**
   Drag a classification threshold and watch precision, recall, F1, false positives, and false negatives update. Very practical and instantly understandable.

4. **Overfitting Lab**
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
