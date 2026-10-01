import type { DataPoint } from "./mean-median-mode-engine";
import type { TypicalPreset } from "./scenario";

type Choice = { id: string; label: string };

export type LearningExperiment = {
  title: string;
  question: string;
  pointLabel: string;
  target: number;
  predictions: Choice[];
  correctPrediction: string;
  explanationQuestion: string;
  explanations: Choice[];
  correctExplanation: string;
  takeaway: string;
  retryHint: string;
};

export const learningExperiments: Record<string, LearningExperiment> = {
  balanced: {
    title: "Can one point break the balance?",
    question: "If you move I from 66 to 90, which summary values will change?",
    pointLabel: "I",
    target: 90,
    predictions: [
      { id: "all", label: "All three" },
      { id: "mean", label: "Only the mean" },
      { id: "median", label: "Only the median" },
    ],
    correctPrediction: "mean",
    explanationQuestion: "Why did the mean change while the median stayed at 42?",
    explanations: [
      { id: "middle", label: "The sum changed; the 5th sorted value did not." },
      { id: "ignore", label: "The mean ignores the largest value." },
      { id: "same", label: "Mean and median always have to agree." },
    ],
    correctExplanation: "middle",
    takeaway: "Mean and median agree in this balanced dataset, but they answer different questions. Moving one extreme changes the sum without changing the middle value.",
    retryHint: "Compare the sum in the Mean calculation with the highlighted 5th sorted value.",
  },
  "repeated-peak": {
    title: "What makes a value most common?",
    question: "If A joins the group at 24, what happens to the mode?",
    pointLabel: "A",
    target: 24,
    predictions: [
      { id: "value", label: "The mode moves to a higher value" },
      { id: "frequency", label: "It stays at 24, with one more occurrence" },
      { id: "none", label: "There is no longer a mode" },
    ],
    correctPrediction: "frequency",
    explanationQuestion: "Why is 24 still the mode?",
    explanations: [
      { id: "middle", label: "It is always the middle value." },
      { id: "frequency", label: "It occurs more often than any other value." },
      { id: "largest", label: "It is the largest value." },
    ],
    correctExplanation: "frequency",
    takeaway: "Mode follows frequency: 24 now appears four times. It does not need to be the average or the middle. Tied highest frequencies can produce several modes.",
    retryHint: "Count occurrences in the sorted values. Mode depends on frequency, not position.",
  },
  outlier: {
    title: "How much can one point change?",
    question: "If you move I from 92 to 28, which summary values will change?",
    pointLabel: "I",
    target: 28,
    predictions: [
      { id: "all", label: "All three" },
      { id: "mean", label: "Only the mean" },
      { id: "median", label: "Only the median" },
    ],
    correctPrediction: "mean",
    explanationQuestion: "Why did the median and mode stay at 24?",
    explanations: [
      { id: "never", label: "Median and mode can never change." },
      { id: "ignore", label: "All three summaries ignore outliers." },
      { id: "middle", label: "The middle value and most frequent value stayed the same." },
    ],
    correctExplanation: "middle",
    takeaway: "The mean fell from 30.9 to 23.8 because every value contributes to the sum. The median stayed at 24 and 24 remained most frequent. Moving other points can change either one.",
    retryHint: "Check the 5th sorted value and count the most frequent value. Neither is fixed for every possible dataset.",
  },
};

// Certify the intended single-point experiment, not just its destination.
export function isExperimentDataset(
  points: DataPoint[],
  preset: TypicalPreset,
  experiment: LearningExperiment,
) {
  return points.length === preset.values.length && points.every((point, index) =>
    point.label === String.fromCharCode(65 + index) &&
    point.value === (point.label === experiment.pointLabel ? experiment.target : preset.values[index]),
  );
}

// Keep exact horizontal values while placing nearby handles in separate rows.
export function pointLanes(points: Pick<DataPoint, "id" | "value">[], trackWidth: number, minimumSpacing = 36) {
  const lanes: number[] = [];
  const positions = new Map<string, number>();
  const spacing = minimumSpacing / Math.max(1, trackWidth) * 100;
  for (const point of [...points].sort((a, b) => a.value - b.value)) {
    let lane = lanes.findIndex((lastValue) => point.value - lastValue >= spacing);
    if (lane < 0) lane = lanes.length;
    lanes[lane] = point.value;
    positions.set(point.id, lane);
  }
  return { positions, count: lanes.length };
}
