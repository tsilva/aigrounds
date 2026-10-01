import type { DataPoint } from "./variance-standard-deviation-engine";
import { spreadPresets } from "./scenario";

type Choice = { id: string; label: string };
export type SpreadExperiment = {
  title: string; question: string; predictions: Choice[]; correctPrediction: string;
  action: string; explanationQuestion: string; explanations: Choice[];
  correctExplanation: string; retryHint: string; takeaway: string;
};

export const spreadExperiments: SpreadExperiment[] = [
  {
    title: "Start with short deviations",
    question: "If points sit close to the mean, what happens to variance and standard deviation?",
    predictions: [{ id: "small", label: "Both stay small" }, { id: "large", label: "Both become large" }],
    correctPrediction: "small",
    action: "Choose Tight. Read the Deviation and Squared columns, then the two summaries.",
    explanationQuestion: "Why are both measures small in Tight?",
    explanations: [
      { id: "short", label: "Short distances produce small squared terms, so their average and its square root stay small." },
      { id: "cancel", label: "Negative and positive squared terms cancel each other." },
      { id: "mean", label: "A mean of 50 always means a small spread." },
    ],
    correctExplanation: "short",
    retryHint: "Look at −8 and +8: both square to 64. The squared terms never become negative.",
    takeaway: "A deviation is a signed distance from the mean. Squaring removes its sign; short distances keep variance and standard deviation small.",
  },
  {
    title: "Spread the same mean",
    question: "Can standard deviation change while the mean stays at 50?",
    predictions: [{ id: "yes", label: "Yes, spread can change independently" }, { id: "no", label: "No, the mean fixes the spread" }],
    correctPrediction: "yes",
    action: "Choose Balanced, then Wide. Compare the mean above the dots and the Standard deviation summary.",
    explanationQuestion: "Why did standard deviation rise while the mean stayed at 50?",
    explanations: [
      { id: "center", label: "The mean increased too; all summaries move together." },
      { id: "distances", label: "The center stayed fixed, but distances from it grew." },
      { id: "count", label: "Wide contains more data points." },
    ],
    correctExplanation: "distances",
    retryHint: "All presets have 7 values and mean 50. Compare their distances and the Same mean, different spread readout.",
    takeaway: "The average describes the center; standard deviation describes spread around it. Tight, Balanced, and Wide share a mean of 50 but have standard deviations of 4.9, 11.6, and 24.1.",
  },
  {
    title: "Watch squaring amplify edges",
    question: "If you move an edge farther from the mean, what happens to its squared contribution?",
    predictions: [{ id: "grow", label: "It grows faster than the distance" }, { id: "linear", label: "It grows by the same amount as the distance" }],
    correctPrediction: "grow",
    action: "With Wide selected, move A below 10 or G above 90. Change only that point. Compare its Deviation and Squared entries.",
    explanationQuestion: "Why does the far point contribute so much to variance?",
    explanations: [
      { id: "same", label: "Variance uses the distance without changing it." },
      { id: "squared", label: "Squaring gives large distances more weight; variance averages these squared terms." },
      { id: "units", label: "Standard deviation is measured in squared units." },
    ],
    correctExplanation: "squared",
    retryHint: "Compare a distance of 2 (squared: 4) with 40 (squared: 1600). The square root returns standard deviation to the original units.",
    takeaway: "Far points contribute large squared terms. Variance averages those terms in squared units; standard deviation takes the square root to describe spread in the original units. Moving one point can also move the mean.",
  },
];

export function matchesPreset(points: DataPoint[], presetId: string) {
  const preset = spreadPresets.find((item) => item.id === presetId);
  return !!preset && points.length === preset.values.length && points.every((point, index) =>
    point.id === `point-${index + 1}` && point.value === preset.values[index]);
}

export function isEdgeExperiment(points: DataPoint[]) {
  const wide = spreadPresets.find((item) => item.id === "wide")!;
  if (points.length !== wide.values.length) return false;
  const changed = points.filter((point, index) => point.value !== wide.values[index]);
  return changed.length === 1 && points.every((point, index) => point.id === `point-${index + 1}`) &&
    ((changed[0]!.id === "point-1" && changed[0]!.value < 10) || (changed[0]!.id === "point-7" && changed[0]!.value > 90));
}
