import type { ShapePresetId } from "./shape-skew-outliers-engine";

type Choice = { id: string; label: string };
export type ShapeExperiment = {
  scenario: ShapePresetId; title: string; start: number; target: number;
  question: string; predictions: Choice[]; correctPrediction: string;
  explanationQuestion: string; explanations: Choice[]; correctExplanation: string;
  retry: string; takeaway: string;
};

export const shapeExperiments: ShapeExperiment[] = [
  {
    scenario: "right-skew", title: "Follow a tail", start: 94, target: 100,
    question: "Move M from 94 to 100. What will change?",
    predictions: [{ id: "endpoint", label: "Tail endpoint; bin counts stay the same" }, { id: "bars", label: "Every histogram bar rises" }, { id: "low", label: "The low-value tail extends" }], correctPrediction: "endpoint",
    explanationQuestion: "Why is the rightmost bar unchanged?",
    explanations: [{ id: "bin", label: "94 and 100 belong to the same 90–100 bin." }, { id: "fixed", label: "Histograms cannot respond to changed values." }, { id: "left", label: "Right skew means the tail points left." }], correctExplanation: "bin",
    retry: "Read the last bin’s interval and compare M on the number line. A bar counts points, not their exact positions.",
    takeaway: "Most points sit at lower values; the long tail reaches toward high values. Skew names the tail direction. A histogram groups values, so movement within one bin can be invisible in its bars.",
  },
  {
    scenario: "balanced", title: "Stretch one edge", start: 50, target: 100,
    question: "Move M from 50 to 100. Which pair will change more in this dataset?",
    predictions: [{ id: "sensitive", label: "Mean and range" }, { id: "robust", label: "Median and IQR" }, { id: "nothing", label: "None of the summaries" }], correctPrediction: "sensitive",
    explanationQuestion: "Why do mean and range react more here?",
    explanations: [{ id: "uses", label: "Mean uses every value; range uses the two extremes." }, { id: "never", label: "Median and IQR never change." }, { id: "discard", label: "The mean discards unusual points." }], correctExplanation: "uses",
    retry: "Compare all four Start values. Median and IQR can change, but they follow positions in the sorted middle.",
    takeaway: "Mean and range react strongly to this high point. Median and IQR change less, not necessarily by zero. Robust means less sensitive to extreme values; it does not mean always best or fixed.",
  },
  {
    scenario: "left-skew", title: "Read the other direction", start: 6, target: 0,
    question: "Move M from 6 to 0. Which direction does the tail extend?",
    predictions: [{ id: "low", label: "Toward low values" }, { id: "high", label: "Toward high values" }, { id: "pile", label: "Toward the main high-value pile" }], correctPrediction: "low",
    explanationQuestion: "Why is this a low-value tail?",
    explanations: [{ id: "shape", label: "Most values are high; sparse points reach down toward 0." }, { id: "mean", label: "A mean below 50 always proves left skew." }, { id: "largest", label: "The largest value determines the skew direction." }], correctExplanation: "shape",
    retry: "Locate the main pile and the sparse tail in the histogram. Skew is about shape, not an absolute cutoff for the mean.",
    takeaway: "A left tail extends toward smaller values while most values remain higher. Mean and median help describe center, but their gap alone cannot prove a distribution’s shape.",
  },
  {
    scenario: "two-clusters", title: "Find what a center hides", start: 96, target: 50,
    question: "Move M into the gap at 50. Will the two main groups merge?",
    predictions: [{ id: "remain", label: "Two groups remain, with one point in the gap" }, { id: "merge", label: "They become one central pile" }, { id: "vanish", label: "One group disappears" }], correctPrediction: "remain",
    explanationQuestion: "What evidence should accompany a center summary?",
    explanations: [{ id: "histogram", label: "The histogram and values show two groups with a sparse middle." }, { id: "median", label: "The median proves that values form one central group." }, { id: "mean", label: "A mean near 50 means every point is near 50." }], correctExplanation: "histogram",
    retry: "Count points below 40 and above 60. One middle point does not move either of those groups.",
    takeaway: "A center can sit between groups where few points lie. The histogram exposes groups and gaps that a mean, median, or box alone can hide.",
  },
];
