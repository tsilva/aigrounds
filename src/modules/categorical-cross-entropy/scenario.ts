export type CrossEntropyClass = {
  id: string;
  label: string;
  color: string;
  mutedColor: string;
};

export type CrossEntropyMode = "binary" | "categorical" | "multilabel";

export type IntuitionExample = {
  id: string;
  mood: "happy" | "neutral" | "sad";
  title: string;
  subtitle: string;
  hint: string;
  trueClassId: string;
  trueClassIds?: string[];
  probabilities: Record<string, number>;
};

export type CrossEntropyLesson = {
  mode: CrossEntropyMode;
  title: string;
  switchLabel: string;
  subtitle: string;
  formulaIntro: string;
  simplificationIntro: string;
  insight: string;
  scenarioLabel: string;
  targetLabel: string;
  targetMode: "exclusive" | "multiple";
  probabilityLabel: string;
  totalLabel: string;
  distributionLabel: string;
  focusLabel: string;
  focusExplanation: string;
  lossTitle: string;
  helpText: string;
  tip: string;
  calculationNote: string;
  classes: CrossEntropyClass[];
  initialTrueClassIds: string[];
  initialProbabilities: Record<string, number>;
  examples: IntuitionExample[];
};

const categoricalClasses: CrossEntropyClass[] = [
  {
    id: "a",
    label: "A",
    color: "#16a34a",
    mutedColor: "#bbf7d0",
  },
  {
    id: "b",
    label: "B",
    color: "#2f7bf5",
    mutedColor: "#bfdbfe",
  },
  {
    id: "c",
    label: "C",
    color: "#f2a100",
    mutedColor: "#fde68a",
  },
  {
    id: "d",
    label: "D",
    color: "#ff4c4c",
    mutedColor: "#fecaca",
  },
];

const binaryClasses: CrossEntropyClass[] = [
  {
    id: "negative",
    label: "No",
    color: "#2f7bf5",
    mutedColor: "#bfdbfe",
  },
  {
    id: "positive",
    label: "Yes",
    color: "#16a34a",
    mutedColor: "#bbf7d0",
  },
];

const multilabelClasses: CrossEntropyClass[] = [
  {
    id: "cat",
    label: "Cat",
    color: "#16a34a",
    mutedColor: "#bbf7d0",
  },
  {
    id: "dog",
    label: "Dog",
    color: "#2f7bf5",
    mutedColor: "#bfdbfe",
  },
  {
    id: "tree",
    label: "Tree",
    color: "#f2a100",
    mutedColor: "#fde68a",
  },
  {
    id: "car",
    label: "Car",
    color: "#ff4c4c",
    mutedColor: "#fecaca",
  },
];

export const crossEntropyLessons: Record<CrossEntropyMode, CrossEntropyLesson> = {
  binary: {
    mode: "binary",
    title: "Cross Entropy Loss",
    switchLabel: "Binary Cross Entropy",
    subtitle:
      "Learn how surprise grows when a yes/no classifier puts probability on the wrong outcome.",
    formulaIntro:
      "For a single binary label y and predicted probability p for the positive class:",
    simplificationIntro:
      "When the true label is selected, the formula becomes the negative log of that outcome:",
    insight:
      "Binary cross entropy only needs one probability: p for Yes, and 1 - p for No.",
    scenarioLabel: "Select the true outcome (binary target)",
    targetLabel: "True outcome",
    targetMode: "exclusive",
    probabilityLabel: "Adjust predicted probabilities",
    totalLabel: "Total (should be 1.00)",
    distributionLabel: "Predicted Binary Distribution",
    focusLabel: "Focus on the true outcome",
    focusExplanation:
      "We only care about the probability assigned to the outcome that actually happened.",
    lossTitle: "Binary Cross Entropy Loss",
    helpText:
      "Cross entropy measures surprise. Binary cross entropy is the two-outcome version: if the real answer is Yes, the loss is -log(p). If the real answer is No, the loss is -log(1 - p).",
    tip: "Try putting more probability on the true outcome. See how the loss decreases!",
    calculationNote:
      "Only the true binary outcome contributes because the other target is 0.",
    classes: binaryClasses,
    initialTrueClassIds: ["positive"],
    initialProbabilities: {
      negative: 0.3,
      positive: 0.7,
    },
    examples: [
      {
        id: "binary-high",
        mood: "happy",
        title: "High probability on the true outcome",
        subtitle: "Low loss",
        hint: "The model is confident in the event that happened.",
        trueClassId: "positive",
        probabilities: {
          negative: 0.1,
          positive: 0.9,
        },
      },
      {
        id: "binary-medium",
        mood: "neutral",
        title: "Medium probability on the true outcome",
        subtitle: "Medium loss",
        hint: "The correct outcome is plausible, but uncertain.",
        trueClassId: "positive",
        probabilities: {
          negative: 0.6,
          positive: 0.4,
        },
      },
      {
        id: "binary-low",
        mood: "sad",
        title: "Low probability on the true outcome",
        subtitle: "High loss",
        hint: "The model is surprised by what actually happened.",
        trueClassId: "positive",
        probabilities: {
          negative: 0.99,
          positive: 0.01,
        },
      },
    ],
  },
  categorical: {
    mode: "categorical",
    title: "Cross Entropy Loss",
    switchLabel: "Categorical Cross Entropy",
    subtitle:
      "Measure how far predicted probabilities are from the true distribution.",
    formulaIntro:
      "For a single example with true label y and predicted probabilities p over K classes:",
    simplificationIntro:
      "Since y is one-hot, this simplifies to:",
    insight:
      "Categorical cross entropy only depends on the predicted probability of the true class.",
    scenarioLabel: "Select the true class (one-hot target)",
    targetLabel: "True class",
    targetMode: "exclusive",
    probabilityLabel: "Adjust predicted probabilities p",
    totalLabel: "Total (should be 1.00)",
    distributionLabel: "Predicted Probability Distribution",
    focusLabel: "Focus on the true class",
    focusExplanation:
      "We only care about the probability assigned to the true class.",
    lossTitle: "Categorical Cross Entropy Loss",
    helpText:
      "Categorical cross entropy measures surprise across several possible classes. The one-hot target makes every wrong class multiply by 0, so the loss becomes -log(probability assigned to the true class).",
    tip: "Try putting more probability on the true class. See how the loss decreases!",
    calculationNote:
      "Only the true class has y = 1. Every other one-hot target is 0.",
    classes: categoricalClasses,
    initialTrueClassIds: ["a"],
    initialProbabilities: {
      a: 0.7,
      b: 0.2,
      c: 0.07,
      d: 0.03,
    },
    examples: [
      {
        id: "high",
        mood: "happy",
        title: "High probability on the true class",
        subtitle: "Low loss",
        hint: "The model is confident in the correct answer.",
        trueClassId: "a",
        probabilities: {
          a: 0.9,
          b: 0.05,
          c: 0.03,
          d: 0.02,
        },
      },
      {
        id: "medium",
        mood: "neutral",
        title: "Medium probability on the true class",
        subtitle: "Medium loss",
        hint: "The correct class is plausible, but not dominant.",
        trueClassId: "a",
        probabilities: {
          a: 0.3,
          b: 0.4,
          c: 0.2,
          d: 0.1,
        },
      },
      {
        id: "low",
        mood: "sad",
        title: "Low probability on the true class",
        subtitle: "High loss",
        hint: "The model gives the right answer almost no probability.",
        trueClassId: "a",
        probabilities: {
          a: 0.01,
          b: 0.3,
          c: 0.4,
          d: 0.29,
        },
      },
    ],
  },
  multilabel: {
    mode: "multilabel",
    title: "Cross Entropy Loss",
    switchLabel: "Multi-label Cross Entropy",
    subtitle:
      "Learn how independent label probabilities are penalized when several categories can be true at once.",
    formulaIntro:
      "For L independent labels, each label has a binary target y_l and predicted probability p_l:",
    simplificationIntro:
      "For each label, the loss is binary cross entropy; the lesson averages those label losses:",
    insight:
      "Multi-label cross entropy does not force probabilities to sum to 1. Each label is its own yes/no question.",
    scenarioLabel: "Select all true labels (multi-hot target)",
    targetLabel: "True labels",
    targetMode: "multiple",
    probabilityLabel: "Adjust independent label probabilities p",
    totalLabel: "Independent labels (no sum-to-1 rule)",
    distributionLabel: "Predicted Label Probabilities",
    focusLabel: "Focus on every label",
    focusExplanation:
      "Positive labels are rewarded for high probability. Negative labels are rewarded for low probability.",
    lossTitle: "Multi-label Cross Entropy Loss",
    helpText:
      "Multi-label cross entropy is binary cross entropy applied independently to every label. It is used when more than one category may be true, such as an image tagged with both Cat and Tree.",
    tip: "Try raising probabilities for true labels and lowering probabilities for false labels. See how the loss decreases!",
    calculationNote:
      "Each label contributes: true labels use -log(p), false labels use -log(1 - p).",
    classes: multilabelClasses,
    initialTrueClassIds: ["cat", "tree"],
    initialProbabilities: {
      cat: 0.82,
      dog: 0.2,
      tree: 0.68,
      car: 0.12,
    },
    examples: [
      {
        id: "multilabel-high",
        mood: "happy",
        title: "Good probabilities for every label",
        subtitle: "Low loss",
        hint: "True labels are high and false labels are low.",
        trueClassId: "cat",
        trueClassIds: ["cat", "tree"],
        probabilities: {
          cat: 0.9,
          dog: 0.05,
          tree: 0.85,
          car: 0.08,
        },
      },
      {
        id: "multilabel-medium",
        mood: "neutral",
        title: "Mixed confidence across labels",
        subtitle: "Medium loss",
        hint: "Some labels are right, but the model is uncertain.",
        trueClassId: "cat",
        trueClassIds: ["cat", "tree"],
        probabilities: {
          cat: 0.6,
          dog: 0.35,
          tree: 0.48,
          car: 0.2,
        },
      },
      {
        id: "multilabel-low",
        mood: "sad",
        title: "Wrong direction on several labels",
        subtitle: "High loss",
        hint: "True labels are low and false labels are high.",
        trueClassId: "cat",
        trueClassIds: ["cat", "tree"],
        probabilities: {
          cat: 0.12,
          dog: 0.78,
          tree: 0.2,
          car: 0.7,
        },
      },
    ],
  },
};
