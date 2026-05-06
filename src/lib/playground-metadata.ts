type Theme = {
  badgeClassName: string;
};

export type TutorStep = {
  title: string;
  experiment: string;
  predictionQuestion: string;
  observationPrompt: string;
  observationOptions: string[];
  takeaway: string;
};

export type TutorPlan = {
  intro: string;
  steps: TutorStep[];
};

export type PlaygroundMetadata = {
  slug: string;
  title: string;
  tag: string;
  kicker: string;
  summary: string;
  estimatedDuration: string;
  concepts: string[];
  learningGoals: string[];
  presentation: "standard" | "immersive";
  tutorPlan?: TutorPlan;
  theme: Theme;
};

type UpcomingPlayground = {
  slug: string;
  title: string;
  summary: string;
};

export const activePlaygroundMetadata = [
  {
    slug: "mean-median-mode",
    title: "Mean, Median & Mode Lab",
    tag: "statistics",
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
    presentation: "immersive",
    theme: {
      badgeClassName: "border-blue-300 bg-blue-100 text-blue-950",
    },
  },
  {
    slug: "range-quartiles-iqr",
    title: "Range, Quartiles & IQR Explorer",
    tag: "statistics",
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
    presentation: "immersive",
    theme: {
      badgeClassName: "border-indigo-300 bg-indigo-100 text-indigo-950",
    },
  },
  {
    slug: "variance-standard-deviation",
    title: "Variance & Standard Deviation Lab",
    tag: "statistics",
    kicker:
      "Drag data points and watch squared distances turn spread into a typical distance.",
    summary:
      "Move values on a number line, compare same-mean dataset shapes, and see how deviations, variance, and standard deviation react when points spread away from the mean.",
    estimatedDuration: "5 to 7 minutes",
    concepts: [
      "Deviations",
      "Squared deviations",
      "Variance",
      "Standard deviation",
    ],
    learningGoals: [
      "Understand deviations as signed distances from the mean.",
      "See why squaring deviations makes far-away values dominate variance.",
      "Recognize standard deviation as a typical distance from the mean in the original units.",
    ],
    presentation: "immersive",
    theme: {
      badgeClassName: "border-blue-300 bg-blue-100 text-blue-950",
    },
  },
  {
    slug: "shape-skew-outliers",
    title: "Shape, Skew & Outliers Lab",
    tag: "statistics",
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
    presentation: "immersive",
    theme: {
      badgeClassName: "border-sky-300 bg-sky-100 text-sky-950",
    },
  },
  {
    slug: "categorical-cross-entropy",
    title: "Cross Entropy Loss",
    tag: "loss",
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
    presentation: "immersive",
    theme: {
      badgeClassName: "border-indigo-300 bg-indigo-100 text-indigo-950",
    },
  },
  {
    slug: "probability-rules",
    title: "Probability Rules Simulator",
    tag: "probability",
    kicker:
      "Count dice outcomes and watch complements, intersections, and unions become arithmetic.",
    summary:
      "Choose two dice events, switch between probability rules, and see the sample-space grid, formulas, counts, and simulation results update together.",
    estimatedDuration: "5 to 7 minutes",
    concepts: [
      "Sample spaces",
      "Complements",
      "Intersections",
      "Unions",
    ],
    learningGoals: [
      "Understand probability as counted outcomes divided by the whole sample space.",
      "See why complements, intersections, and unions are regions of the same grid.",
      "Recognize why union probability subtracts overlap that was counted twice.",
    ],
    presentation: "immersive",
    theme: {
      badgeClassName: "border-sky-300 bg-sky-100 text-sky-950",
    },
  },
  {
    slug: "conditional-probability",
    title: "Conditional Probability & Independence Lab",
    tag: "probability",
    kicker:
      "Filter a population and see why conditional probability changes the denominator first.",
    summary:
      "Toggle between independent, dependent, and base-rate scenarios. The lab updates a 100-person grid, marginal and conditional fractions, joint probability, and the independence verdict together.",
    estimatedDuration: "5 to 7 minutes",
    concepts: [
      "Conditional probability",
      "Joint probability",
      "Marginal probability",
      "Independence",
    ],
    learningGoals: [
      "Understand conditional probability as counting inside a filtered denominator.",
      "See how P(B ∣ A), P(B), and P(A ∩ B) describe different slices of the same population.",
      "Recognize independence as the case where filtering by A does not change the probability of B.",
    ],
    presentation: "immersive",
    theme: {
      badgeClassName: "border-indigo-300 bg-indigo-100 text-indigo-950",
    },
  },
  {
    slug: "softmax-temperature",
    title: "Softmax Temperature Lab",
    tag: "probability",
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
    presentation: "immersive",
    theme: {
      badgeClassName: "border-violet-300 bg-violet-100 text-violet-950",
    },
  },
  {
    slug: "gradient-descent",
    title: "Gradient Descent Playground",
    tag: "optimization",
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
    presentation: "immersive",
    tutorPlan: {
      intro:
        "Work through four tiny experiments. Predict first, change the controls, observe the graph, then explain what you learned.",
      steps: [
        {
          title: "Make descent crawl",
          experiment:
            "Choose Creep, press Reset, then press Step three times. Watch the point and the loss value.",
          predictionQuestion:
            "Before stepping, do you expect θ to move a little or a lot each step?",
          observationPrompt:
            "What did you notice about the point and the loss after three tiny steps?",
          observationOptions: [
            "It moved slowly",
            "Loss changed only a little",
            "I am not sure",
          ],
          takeaway:
            "A small learning rate follows the downhill direction but makes tiny updates, so progress is stable and slow.",
        },
        {
          title: "Find a useful step",
          experiment:
            "Choose Converge, press Reset, then press Step two or three times. Compare the point's path to Creep.",
          predictionQuestion:
            "What do you think a useful learning rate should do differently from Creep?",
          observationPrompt:
            "What changed faster this time: θ, loss, or both?",
          observationOptions: [
            "θ moved near the valley",
            "Loss dropped faster",
            "I am not sure",
          ],
          takeaway:
            "A useful learning rate makes visible progress toward the minimum without jumping wildly across the valley.",
        },
        {
          title: "Force an overshoot",
          experiment:
            "Choose Overshoot, press Reset, then press Step once or twice. Watch whether the point crosses the minimum.",
          predictionQuestion:
            "If the learning rate is too large, where do you expect the next point to land?",
          observationPrompt:
            "What did the point do relative to the minimum?",
          observationOptions: [
            "It jumped across the minimum",
            "The step was too large",
            "I am not sure",
          ],
          takeaway:
            "A large learning rate can still point downhill locally, but the step can be so long that it launches past the minimum.",
        },
        {
          title: "Test momentum",
          experiment:
            "Choose Converge, press Reset, raise Momentum β toward heavy, then press Step several times. Compare it with low momentum.",
          predictionQuestion:
            "What do you expect momentum to carry from one step into the next?",
          observationPrompt:
            "How did the path change when previous movement carried into later steps?",
          observationOptions: [
            "Momentum carried the point forward",
            "It sped up but could overshoot",
            "I am not sure",
          ],
          takeaway:
            "Momentum reuses previous motion. It can speed travel on smooth slopes, but too much carry-over can push past the valley.",
        },
      ],
    },
    theme: {
      badgeClassName: "border-blue-300 bg-blue-100 text-blue-950",
    },
  },
  {
    slug: "confusion-matrix-thresholds",
    title: "Confusion Matrix & Thresholds",
    tag: "evaluation",
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
    presentation: "immersive",
    theme: {
      badgeClassName: "border-rose-300 bg-rose-100 text-rose-950",
    },
  },
  {
    slug: "overfitting",
    title: "Overfitting Lab",
    tag: "generalization",
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
    presentation: "immersive",
    theme: {
      badgeClassName: "border-orange-300 bg-orange-100 text-orange-950",
    },
  },
] satisfies PlaygroundMetadata[];

export const upcomingPlaygrounds: UpcomingPlayground[] = [];

function getPlaygroundMetadata(slug: string) {
  return activePlaygroundMetadata.find((playground) => playground.slug === slug);
}

export function getPlaygroundMetadataFromPathname(pathname?: string) {
  const slug = pathname?.split("/").filter(Boolean).at(-1);

  return slug ? getPlaygroundMetadata(slug) : undefined;
}
