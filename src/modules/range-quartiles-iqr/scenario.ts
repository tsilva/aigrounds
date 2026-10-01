export const rangePresets = [
  { id: "experiment", label: "Experiment", values: [18, 24, 28, 32, 36, 40, 44, 48, 58] },
  { id: "wide-middle", label: "Wide Middle", values: [10, 18, 26, 34, 46, 58, 70, 78, 86] },
  { id: "outlier", label: "Outlier", values: [18, 24, 28, 32, 36, 40, 44, 48, 92] },
] as const;

export const predictions = [
  { id: "range", label: "Only range changes" },
  { id: "iqr", label: "Only IQR changes" },
  { id: "both", label: "Both change" },
  { id: "neither", label: "Neither changes" },
] as const;

export const learningExperiments = [
  {
    title: "Move an edge",
    values: [18, 24, 28, 32, 36, 40, 44, 48, 58],
    pointId: "point-9", pointLabel: "I", from: 58, target: 92, prediction: "range",
    question: "If I moves from 58 to 92, which spread measure will change?",
    explanationQuestion: "Why did range change while IQR stayed at 20?",
    explanations: [
      { id: "extreme", label: "Only the maximum changed; the values used for Q1 and Q3 stayed the same." },
      { id: "all", label: "Every sorted position changed when I moved." },
      { id: "width", label: "IQR is the distance from minimum to maximum." },
    ],
    correctExplanation: "extreme",
    retryHint: "Compare the two pairs underlined in Sorted values. Did I belong to either pair?",
    takeaway: "Range grew from 40 to 74. IQR stayed at 20 because Q1 and Q3 use the same values as before.",
  },
  {
    title: "Move a quartile",
    values: [18, 24, 28, 32, 36, 40, 44, 48, 92],
    pointId: "point-8", pointLabel: "H", from: 48, target: 68, prediction: "iqr",
    question: "If H moves from 48 to 68 while I stays at 92, which spread measure will change?",
    explanationQuestion: "Why did IQR grow while range stayed at 74?",
    explanations: [
      { id: "all", label: "Range uses every value, so it always changes when a point moves." },
      { id: "quartile", label: "H contributes to Q3; the minimum and maximum stayed at 18 and 92." },
      { id: "fixed", label: "IQR only changes when the minimum or maximum moves." },
    ],
    correctExplanation: "quartile",
    retryHint: "Q3 averages the middle two values of the upper half. Check whether H is one of them.",
    takeaway: "Q3 grew from 46 to 56, so IQR grew from 20 to 30. Range stayed at 74 because neither extreme changed.",
  },
  {
    title: "Try new data",
    values: [10, 20, 24, 28, 32, 36, 40, 44, 88],
    pointId: "point-9", pointLabel: "I", from: 88, target: 30, prediction: "both",
    question: "In this new dataset, I moves from 88 to 30, into the middle. Which spread measure will change?",
    explanationQuestion: "Why did both measures change this time?",
    explanations: [
      { id: "immune", label: "IQR cannot change when an extreme value moves." },
      { id: "distance", label: "Quartiles always split the 0–100 scale into four equal distances." },
      { id: "order", label: "I changed sorted position: H became the maximum, and a different pair now determines Q3." },
    ],
    correctExplanation: "order",
    retryHint: "Find I in Sorted values, then compare the new maximum and the underlined upper-half pair with the starting data.",
    takeaway: "Range fell from 78 to 34 and IQR from 20 to 16. IQR resists an extreme moving farther away, but can change when sorted positions change.",
  },
] as const;

export type LearningExperiment = (typeof learningExperiments)[number];
