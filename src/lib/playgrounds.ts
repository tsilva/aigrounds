import { type ComponentType } from "react";
import { AttentionPlayground } from "@/modules/attention/AttentionPlayground";
import { Bm25Playground } from "@/modules/bm25/Bm25Playground";
import { CategoricalCrossEntropyPlayground } from "@/modules/categorical-cross-entropy/CategoricalCrossEntropyPlayground";
import { ConfusionMatrixThresholdsPlayground } from "@/modules/confusion-matrix-thresholds/ConfusionMatrixThresholdsPlayground";
import { DiffusionPlayground } from "@/modules/diffusion/DiffusionPlayground";
import { GradientDescentPlayground } from "@/modules/gradient-descent/GradientDescentPlayground";
import { MeanMedianModePlayground } from "@/modules/mean-median-mode/MeanMedianModePlayground";
import { MctsPlayground } from "@/modules/mcts/MctsPlayground";
import { OverfittingPlayground } from "@/modules/overfitting/OverfittingPlayground";
import { QLearningPlayground } from "@/modules/q-learning/QLearningPlayground";
import { RangeQuartilesIqrPlayground } from "@/modules/range-quartiles-iqr/RangeQuartilesIqrPlayground";
import { ShapeSkewOutliersPlayground } from "@/modules/shape-skew-outliers/ShapeSkewOutliersPlayground";
import { SoftmaxTemperaturePlayground } from "@/modules/softmax-temperature/SoftmaxTemperaturePlayground";

type Theme = {
  badgeClassName: string;
};

export type ActivePlayground = {
  slug: string;
  title: string;
  kicker: string;
  summary: string;
  estimatedDuration: string;
  concepts: string[];
  learningGoals: string[];
  theme: Theme;
  component: ComponentType;
  presentation?: "standard" | "immersive";
};

export type UpcomingPlayground = {
  slug: string;
  title: string;
  summary: string;
};

export const activePlaygrounds: ActivePlayground[] = [
  {
    slug: "mean-median-mode",
    title: "Mean, Median & Mode Lab",
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
    theme: {
      badgeClassName: "border-blue-300 bg-blue-100 text-blue-950",
    },
    component: MeanMedianModePlayground,
    presentation: "immersive",
  },
  {
    slug: "range-quartiles-iqr",
    title: "Range, Quartiles & IQR Explorer",
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
    theme: {
      badgeClassName: "border-indigo-300 bg-indigo-100 text-indigo-950",
    },
    component: RangeQuartilesIqrPlayground,
    presentation: "immersive",
  },
  {
    slug: "shape-skew-outliers",
    title: "Shape, Skew & Outliers Lab",
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
    theme: {
      badgeClassName: "border-sky-300 bg-sky-100 text-sky-950",
    },
    component: ShapeSkewOutliersPlayground,
    presentation: "immersive",
  },
  {
    slug: "categorical-cross-entropy",
    title: "Cross Entropy Loss",
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
    theme: {
      badgeClassName: "border-indigo-300 bg-indigo-100 text-indigo-950",
    },
    component: CategoricalCrossEntropyPlayground,
    presentation: "immersive",
  },
  {
    slug: "softmax-temperature",
    title: "Softmax Temperature Lab",
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
    theme: {
      badgeClassName: "border-violet-300 bg-violet-100 text-violet-950",
    },
    component: SoftmaxTemperaturePlayground,
    presentation: "immersive",
  },
  {
    slug: "gradient-descent",
    title: "Gradient Descent Playground",
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
    theme: {
      badgeClassName: "border-blue-300 bg-blue-100 text-blue-950",
    },
    component: GradientDescentPlayground,
    presentation: "immersive",
  },
  {
    slug: "confusion-matrix-thresholds",
    title: "Confusion Matrix & Thresholds",
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
    theme: {
      badgeClassName: "border-rose-300 bg-rose-100 text-rose-950",
    },
    component: ConfusionMatrixThresholdsPlayground,
    presentation: "immersive",
  },
  {
    slug: "overfitting",
    title: "Overfitting Lab",
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
    theme: {
      badgeClassName: "border-orange-300 bg-orange-100 text-orange-950",
    },
    component: OverfittingPlayground,
    presentation: "immersive",
  },
  {
    slug: "attention",
    title: "Attention Maps",
    kicker:
      "Trace how tokens compete for influence and why one earlier cue can suddenly take the whole step.",
    summary:
      "Blend between recent phrasing and long-range context, then watch attention weights and next-token predictions flip in public. The lab makes softmax takeovers, recency bias, and instruction-following feel concrete.",
    estimatedDuration: "7 to 10 minutes",
    concepts: [
      "Query-key similarity",
      "Softmax competition",
      "Recency bias",
      "Next-token decoding",
    ],
    learningGoals: [
      "See how a small query shift can cause one token to absorb most of the attention mass.",
      "Understand why recent tokens often win by default until a stronger contextual cue appears.",
      "Recognize how the weighted context vector changes the final next-token ranking.",
    ],
    theme: {
      badgeClassName: "border-sky-300 bg-sky-100 text-sky-900",
    },
    component: AttentionPlayground,
  },
  {
    slug: "bm25",
    title: "BM25 Ranking Lab",
    kicker: "See why rare words spike, repeats saturate, and long docs get checked.",
    summary:
      "Type a query, tune k1 and b, and watch document scores reshuffle. Each result exposes per-term contributions so BM25 stops feeling like a magic relevance number.",
    estimatedDuration: "6 to 9 minutes",
    concepts: [
      "Inverse document frequency",
      "Term saturation",
      "Length normalization",
      "Ranking",
    ],
    learningGoals: [
      "See why rare query terms create more score than common ones.",
      "Understand how repeated matches help, but not linearly forever.",
      "Recognize how document length changes the denominator and the final ranking.",
    ],
    theme: {
      badgeClassName:
        "border-emerald-300 bg-emerald-100 text-emerald-900",
    },
    component: Bm25Playground,
  },
  {
    slug: "q-learning",
    title: "Q-Learning Arcade",
    kicker: "Watch a policy emerge from raw trial, error, and changing curiosity.",
    summary:
      "Run episodes through a small arcade floor, inspect Q-values in every direction, and switch epsilon schedules to see when the agent settles too early or keeps finding the jackpot route.",
    estimatedDuration: "7 to 10 minutes",
    concepts: [
      "Temporal-difference updates",
      "Epsilon-greedy exploration",
      "Discounting",
      "Policy improvement",
    ],
    learningGoals: [
      "See how single rewards propagate backward into earlier state-action values.",
      "Understand how epsilon schedules change whether the agent discovers the better long-term route.",
      "Recognize how the greedy policy sharpens only after repeated episodes update the same choices.",
    ],
    theme: {
      badgeClassName: "border-sky-300 bg-sky-100 text-sky-900",
    },
    component: QLearningPlayground,
  },
  {
    slug: "diffusion",
    title: "Diffusion Studio",
    kicker:
      "Scrub through denoising steps and watch structure land before texture.",
    summary:
      "Slide across a toy diffusion run and compare milestone frames. The image resolves from noise in stages so you can see why composition settles early while crisp detail arrives late.",
    estimatedDuration: "7 to 10 minutes",
    concepts: [
      "Denoising loop",
      "Noise schedules",
      "Low vs high frequencies",
      "Latent refinement",
    ],
    learningGoals: [
      "Understand why broad composition appears before crisp edges and texture.",
      "See how repeated denoising steps remove uncertainty gradually instead of all at once.",
      "Recognize that late diffusion steps mostly polish detail rather than rewrite the scene.",
    ],
    theme: {
      badgeClassName: "border-cyan-300 bg-cyan-100 text-cyan-900",
    },
    component: DiffusionPlayground,
  },
  {
    slug: "mcts",
    title: "Monte Carlo Tree Search",
    kicker: "Watch exploration and exploitation negotiate in public.",
    summary:
      "Run single simulations or let the search loop play out. The tree, scores, and narration update live so the MCTS cycle feels concrete instead of mystical.",
    estimatedDuration: "8 to 12 minutes",
    concepts: ["Selection", "UCT", "Rollouts", "Backpropagation"],
    learningGoals: [
      "See how UCT balances trying popular branches against testing uncertain ones.",
      "Understand what expansion, rollout, and backpropagation each contribute.",
      "Recognize why the best move emerges only after repeated simulations.",
    ],
    theme: {
      badgeClassName:
        "border-amber-300 bg-amber-100 text-amber-900",
    },
    component: MctsPlayground,
  },
];

export const upcomingPlaygrounds: UpcomingPlayground[] = [];

export function getActivePlayground(slug: string) {
  return activePlaygrounds.find((playground) => playground.slug === slug);
}
