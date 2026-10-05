# Curriculum

The recommended AI core has 20 steps. Specialist paths share foundations and
have their own local order. Paths recommend study; they never restrict access.
The dashboard is the learner-facing lesson plan. `src/lib/curriculum.ts` defines
its order, path membership, chapter groups and prerequisite concepts; metadata
defines published versus planned status.

## Applied structure

- Global search, Browse all, and 13 specialist paths alongside
  the core. Regression is core step 5 and gradient descent is step 6.
- Optional prerequisite refreshers appear within lessons.
- Path-aware next links, explicit skips over planned steps, chapter links and
  browser-local progress. No account is required.
- Visits, self-reported reviews and successful **explicit transfer checks** are
  separate records. Regular experiment completion does not establish transfer.
  Lessons without an explicit transfer result do not produce a transfer record.
- After a day, completed transfer chapters offer a recall prompt tied to that
  chapter's learning goal. These prompts invite practice; they do not grade or
  claim retained mastery. Progress stays in local storage, with an in-memory
  fallback when storage is unavailable.
- The Concept Atlas and Zero Knowledge Proofs remain available under Explore &
  reference, outside the numbered course.

All 84 previously published lesson routes remain registered. Five pairs now
share one dashboard card, with two linked chapters and their original engines,
scenarios, guided experiments and AI Guides:

| Group | Chapter 1 | Chapter 2 |
| --- | --- | --- |
| Fit a Line & Understand Its Loss | Linear Regression Line Fitting | Least Squares Loss Landscape |
| Classification Decisions & Metrics | Classification Metrics Foundations | Confusion Matrix & Thresholds |
| Probability Predictions & Cross Entropy | Log Loss Confidence Penalties | Cross Entropy Loss |
| Confidence Intervals & Precision | Confidence Intervals Explorer | Margin of Error & Sample Size Lab |
| Errors, Power & Sample Planning | Type I & Type II Errors Lab | Power, Effect Size & Sample Size Lab |

This uses the approved linked-chapter consolidation option. It does not claim a
shared dataset or a combined engine. There are 89 registered playgrounds and 84 published catalog cards after the
five chapter consolidations; two cards are reference/extras. All 20 core steps
are available locally.

## Core

1. Mean, Median & Mode
2. Variance & Standard Deviation
3. Sampling & Sample Size
4. Sampling Bias
5. Fit a Line & Understand Its Loss
6. Gradient Descent
7. Train/Test Split & Generalization
8. Overfitting
9. Class Scores & Logits
10. Linear Classification & Decision Boundaries
11. Softmax & Temperature
12. Classification Decisions & Metrics
13. Probability Predictions & Cross Entropy
14. Regularization
15. Activation Functions
16. Neural Network Forward Pass
17. Autograd & the Chain Rule
18. Backpropagation
19. The Training Loop
20. MNIST: inspect a real model

## Implemented bridges

| Priority | Lesson | Teaching contract |
| --- | --- | --- |
| 1 | The Training Loop | Step forward, loss, backward and update separately; repeat batches and epochs; compare held-out loss without fitting held-out rows. |
| 2 | Linear Classification & Decision Boundaries | Change weights/bias and distinguish signed scores, sigmoid readouts and decision cutoffs; handle degenerate boundaries explicitly. |
| 3 | How Tokens Become an Answer | Append tokens from a disclosed authored transition bank; compare greedy and seeded sampling, candidate filters, EOS and length limits. |
| 4 | Inside a Transformer Block | Trace one disclosed pre-normalized decoder block, residual additions and attention/MLP branches; retain a complete numeric trace beyond the default first-addition view. |
| 5 | From Retrieval to a Grounded Answer | Trace ranked authored chunks into supplied context and evidence-linked authored answers; isolate retrieval failure from answer failure. |

Each bridge includes three gated prediction/action/explanation experiments,
incorrect-answer recovery and a different-case transfer check. The accepted
designs and refinements are stored with each module. Pure engines have
independent numeric and state checks in `scripts/verify-bridge-engines.mjs`.
Authored generation, transformer and retrieval traces explicitly identify their
teaching assumptions; they do not imply live model inference.

Local built-in exercises can run without server-backed assistance. Live AI Guide
verification requires a configured OpenRouter server. The local verification
run found it unconfigured, so the full lesson clean-pass certification remains
blocked. Local implementation does not imply deployment or learner validation.

## Remaining learning work

The navigation refactor leaves existing teaching mechanics intact. The next
lesson-level work includes a regression-objective follow-up after scalar
gradient descent, short probability/weighted-sum refreshers at their points of
use, mixed milestone challenges and guidance that fades after prerequisite
success. Explain that fixed regularization examples do not prove improved
generalization and fixed MNIST inference is not network training. Further
workbench consolidation is warranted only if outcome and counterexample
coverage survives a smaller default journey.

Compare the old and proposed routes with prerequisite-qualified beginners and
intermediate learners on the same outcomes. Measure time to an independently
explained insight, unnecessary navigation, misconception recovery, near
transfer and delayed retention. Analyze skip-ahead separately. Fewer clicks
and completion alone do not establish better learning; no learner study has
yet validated the 20-step route.
