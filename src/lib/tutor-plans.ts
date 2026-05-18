type TutorPlanSlug =
  | "mean-median-mode"
  | "range-quartiles-iqr"
  | "variance-standard-deviation"
  | "shape-skew-outliers"
  | "categorical-cross-entropy"
  | "kl-divergence"
  | "probability-rules"
  | "conditional-probability"
  | "bayes-rule"
  | "expected-value-risk"
  | "bernoulli-categorical-binomial"
  | "waiting-arrival-distributions"
  | "softmax-temperature"
  | "gradient-descent"
  | "monte-carlo-tree-search"
  | "confusion-matrix-thresholds"
  | "overfitting"
  | "matrix-multiplication"
  | "byte-pair-encoding"
  | "transformer-attention"
  | "linear-quantization-int4"
  | "mnist-mlp-inference-debugger"
  | "autograd-graphs"
  | "backpropagation-inspector"
  | "zero-knowledge-proofs"
  | "batch-normalization"
  | "layer-normalization";

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
  whyItMatters: string;
  openingMessage?: string;
  requireTypedPredictionToStart?: boolean;
  masteryCriteria?: string[];
  steps: TutorStep[];
};

export function isTypedPredictionTutorPlan(plan: TutorPlan) {
  return plan.requireTypedPredictionToStart ?? true;
}

export function getTutorOpeningMessage(plan: TutorPlan) {
  const motivation = ["Why this exists:", plan.whyItMatters].join("\n\n");

  if (plan.openingMessage) {
    return [motivation, plan.openingMessage].join("\n\n");
  }

  const firstStep = plan.steps[0];

  return [
    motivation,
    plan.intro,
    firstStep
      ? `First prediction: ${firstStep.predictionQuestion} Reply with your prediction first. Then I will tell you exactly what to try.`
      : "Reply with what you want to understand first, and I will guide one small experiment at a time.",
  ].join("\n\n");
}

export const playgroundTutorPlans: Record<TutorPlanSlug, TutorPlan> = {
  "mean-median-mode": {
    intro:
      "Work through three small experiments. Predict first, change the data, observe the summaries, then explain which measure of typical stayed useful.",
    whyItMatters:
      "Typical values exist because raw lists are hard to compare at a glance. Mean, median, and mode give compact center summaries, and choosing the right one helps avoid being fooled by repeats or outliers.",
    openingMessage:
      "No prior statistics knowledge needed. We will build three ideas by predicting, trying one small experiment, and explaining what changed.\n\n- Mean is the average: add all values, then divide by how many values there are.\n- Median is the middle value after sorting the data.\n- Mode is the most common value. A dataset can have no mode, one mode, or more than one mode.\n- Outliers are far-away values that can pull some summaries more than others.\n\nFirst prediction: when the values are fairly even, which typical value do you expect to best describe the middle: mean, median, or mode? Reply with your prediction first. Then I will tell you exactly what to try.",
    requireTypedPredictionToStart: true,
    masteryCriteria: [
      "Defines mean as the average that uses every value.",
      "Defines median as the middle after sorting the values.",
      "Defines mode as the most common value and recognizes when repeats matter.",
      "Explains why mean and median often agree in a balanced dataset.",
      "Explains why an outlier pulls the mean more than the median.",
      "Chooses an appropriate typical-value summary for balanced, repeated, and outlier-heavy datasets.",
    ],
    steps: [
      {
        title: "Compare one calm center",
        experiment:
          "Choose Balanced if it is not already selected. Watch the number line, sorted values, and the Mean, Median, and Mode panels.",
        predictionQuestion:
          "When the values are fairly even, which typical value do you expect to best describe the middle?",
        observationPrompt:
          "What did you notice about the mean and median in the balanced data?",
        observationOptions: [
          "Mean and median nearly matched",
          "No single repeated value mattered",
          "I am not sure",
        ],
        takeaway:
          "When data is fairly symmetric, the mean and median tell a similar center story.",
      },
      {
        title: "Create a mode",
        experiment:
          "Choose Repeated Peak. Compare the repeated value pill with the Mode panel.",
        predictionQuestion:
          "What do you expect the mode to do when one value appears several times?",
        observationPrompt:
          "Which summary changed because a value repeated?",
        observationOptions: [
          "Mode locked onto the repeat",
          "Mean still balanced all values",
          "I am not sure",
        ],
        takeaway:
          "Mode is about frequency, not balance or position, so repeats can make it the clearest typical value.",
      },
      {
        title: "Pull with an outlier",
        experiment:
          "Choose Add Outlier, then nudge the far-right point. Watch the mean marker and median marker.",
        predictionQuestion:
          "Which should move more when one extreme value moves: mean or median?",
        observationPrompt:
          "What happened to the center summaries when the outlier was far away?",
        observationOptions: [
          "Mean moved toward the outlier",
          "Median stayed closer to the middle",
          "I am not sure",
        ],
        takeaway:
          "The mean uses every value and gets pulled by extremes; the median uses sorted position and is more resistant.",
      },
    ],
  },
  "range-quartiles-iqr": {
    intro:
      "Work through three spread experiments. Predict what will stretch, change one view, then connect the box plot to the five-number summary.",
    whyItMatters:
      "Spread summaries exist because a center value alone can hide whether data is tightly packed or scattered. Range, quartiles, and IQR make variability visible, which helps compare groups and spot outlier-resistant patterns.",
    openingMessage:
      "No prior statistics knowledge needed. We will build the ideas by predicting, trying one small experiment, and explaining what changed.\n\n- Range is the full span: maximum minus minimum.\n- Quartiles come from sorted data. Q1 is around the lower quarter, the median is the middle, and Q3 is around the upper quarter.\n- IQR is Q3 minus Q1, so it measures the width of the middle 50%.\n- A box plot draws the five-number summary: min, Q1, median, Q3, and max.\n\nFirst prediction: if the smallest and largest values are close together, what should happen to the range? Reply with your prediction first. Then I will tell you exactly what to try.",
    requireTypedPredictionToStart: true,
    masteryCriteria: [
      "Defines range as maximum minus minimum and connects it to the whisker-to-whisker span.",
      "Explains quartiles as positions in sorted data that split lower, middle, and upper portions.",
      "Defines IQR as Q3 minus Q1 and connects it to the width of the middle 50%.",
      "Explains why a single far outlier changes range more than IQR.",
      "Can use the box plot and five-number summary together to justify a claim about spread.",
    ],
    steps: [
      {
        title: "Read the full span",
        experiment:
          "Use the starting Compact dataset. Compare the minimum, maximum, range bar, and box plot whiskers.",
        predictionQuestion:
          "If the smallest and largest values are close together, what should happen to the range?",
        observationPrompt:
          "How did the whiskers and range read in the compact dataset?",
        observationOptions: [
          "Range stayed short",
          "Whiskers covered the full span",
          "I am not sure",
        ],
        takeaway:
          "Range is only maximum minus minimum, so it describes the full span from the two edge values.",
      },
      {
        title: "Open the middle box",
        experiment:
          "Choose Wide Middle. Watch Q1, Q3, IQR, and the box width.",
        predictionQuestion:
          "What should happen to IQR when the middle half of the values spreads out?",
        observationPrompt:
          "What changed in the five-number summary and box plot?",
        observationOptions: [
          "The box got wider",
          "IQR increased",
          "I am not sure",
        ],
        takeaway:
          "IQR measures Q3 minus Q1, so it grows when the middle 50% spreads apart.",
      },
      {
        title: "Stretch one edge",
        experiment:
          "Choose Outlier, then move the far point farther right. Compare Range with IQR.",
        predictionQuestion:
          "Which spread summary should react more to one far edge value: range or IQR?",
        observationPrompt:
          "What did the outlier do to the whisker and the middle box?",
        observationOptions: [
          "Range stretched a lot",
          "IQR stayed steadier",
          "I am not sure",
        ],
        takeaway:
          "Range follows the extremes, while IQR focuses on the middle half and resists a single outlier better.",
      },
    ],
  },
  "variance-standard-deviation": {
    intro:
      "Work through three spread experiments. Predict how distances from the mean behave, then connect deviations, variance, and standard deviation.",
    whyItMatters:
      "Variance and standard deviation exist because we often need one number for how far values usually sit from the mean. They are useful for judging consistency, comparing noise, and seeing when two datasets with the same average behave very differently.",
    openingMessage:
      "No prior statistics knowledge needed. We will build the ideas by predicting, trying one small experiment, and explaining what changed.\n\n- The mean is the average and marks the center of this lab.\n- A deviation is a value's distance from the mean. Negative means left of the mean; positive means right of it.\n- Squared deviation turns each distance positive and makes far-away values count much more.\n- Variance averages the squared deviations. Standard deviation takes the square root, so it is back in the original units.\n\nFirst prediction: if most points sit near the mean, what should happen to variance and standard deviation? Reply with your prediction first. Then I will tell you exactly what to try.",
    requireTypedPredictionToStart: true,
    masteryCriteria: [
      "Defines deviation as distance from the mean, including direction before squaring.",
      "Explains that small deviations make small squared deviations.",
      "Explains that squaring makes far-away values count much more.",
      "Connects variance to the average of squared deviations.",
      "Connects standard deviation to a typical distance from the mean in original units.",
      "Recognizes that standard deviation can change while the mean stays fixed.",
    ],
    steps: [
      {
        title: "Start with short deviations",
        experiment:
          "Choose Tight. Look at the deviation bars, the Watch Each Deviation cards, and the formula totals.",
        predictionQuestion:
          "If most points sit near the mean, what should happen to variance and standard deviation?",
        observationPrompt:
          "What did the short deviation bars do to the squared terms?",
        observationOptions: [
          "Squared distances stayed small",
          "Standard deviation was low",
          "I am not sure",
        ],
        takeaway:
          "Small distances from the mean produce small squared deviations, so both variance and standard deviation stay low.",
      },
      {
        title: "Spread the same mean",
        experiment:
          "Choose Balanced, then Wide. Notice that the mean stays at 50 while the points spread.",
        predictionQuestion:
          "Can standard deviation change even when the mean stays the same?",
        observationPrompt:
          "What changed when the center stayed fixed but points moved away?",
        observationOptions: [
          "Spread increased",
          "Standard deviation increased",
          "I am not sure",
        ],
        takeaway:
          "Standard deviation measures typical distance from the mean, so it can change even when the mean does not.",
      },
      {
        title: "Watch squaring amplify edges",
        experiment:
          "Choose Wide, then nudge point A left or point G right. Compare that point's deviation with its squared deviation in the Watch Each Deviation cards.",
        predictionQuestion:
          "What should squaring do to a point that is very far from the mean?",
        observationPrompt:
          "Which point or card dominated the variance calculation?",
        observationOptions: [
          "Far points dominated",
          "Squared terms grew fast",
          "I am not sure",
        ],
        takeaway:
          "Squaring makes large deviations count much more, which is why far-away values can dominate variance.",
      },
    ],
  },
  "transformer-attention": {
    intro:
      "Work through three attention experiments. Pick the ambiguous token, predict which context word should matter, then change sharpness and inspect the value mix.",
    whyItMatters:
      "Attention exists because a token often needs surrounding context before its meaning is clear. It is useful because the model can choose which earlier tokens to read from, making words, facts, and relationships available where they are needed.",
    steps: [
      {
        title: "Disambiguate bank",
        experiment:
          "Choose River Bank, select bank as the query token, and compare the attention weights for river and bank.",
        predictionQuestion:
          "Which token should bank attend to if the sentence is about a river?",
        observationPrompt:
          "What happened to the strongest key and output meaning?",
        observationOptions: [
          "River received the largest context weight",
          "The output leaned toward shore meaning",
          "I am not sure",
        ],
        takeaway:
          "The same token can lean toward different meanings when its query finds different context keys.",
      },
      {
        title: "Switch context",
        experiment:
          "Choose Money Bank and keep bank selected. Watch cash compete against the other keys.",
        predictionQuestion:
          "Which token should pull bank toward a finance meaning?",
        observationPrompt:
          "What changed when the sentence switched from river to cash?",
        observationOptions: [
          "Cash became the strongest context key",
          "Finance meaning increased in the value vector",
          "I am not sure",
        ],
        takeaway:
          "Attention uses the sentence around a token, so context can steer an ambiguous word before the next layer.",
      },
      {
        title: "Sharpen the lookup",
        experiment:
          "Click Low, then click High in Focus Sharpness. Compare entropy, top weight, and the connection diagram.",
        predictionQuestion:
          "What should happen when softmax focus changes from low to high?",
        observationPrompt:
          "How did the weights change as sharpness increased?",
        observationOptions: [
          "The top key took more weight",
          "Entropy decreased",
          "I am not sure",
        ],
        takeaway:
          "Sharper attention concentrates the weighted lookup, while softer attention blends more tokens together.",
      },
    ],
  },
  "byte-pair-encoding": {
    intro:
      "Work through three tokenization experiments. Predict which pair will merge, spend merge budget, then compare how learned chunks transfer to new text.",
    whyItMatters:
      "BPE exists because models need a practical way to turn messy text into reusable pieces without storing every possible word. It is useful because common chunks compress text, handle new words, and keep vocabulary size manageable.",
    openingMessage:
      "No tokenizer background needed. We will build the idea by predicting, trying one small merge budget, and explaining what changed.\n\n- BPE starts with small symbols, shown here as characters plus a word-end marker.\n- Each merge creates one new token from a frequent adjacent pair.\n- More merges usually reduce token count, but they also grow the vocabulary.\n- Learned tokens help most when new text repeats patterns from the training text.\n\nFirst prediction: after the corpus has learned l + o and lo + w, which examples should compress more: words related to low/new, or an unrelated string like xyz? Reply with your prediction first. Then I will tell you exactly what to try.",
    requireTypedPredictionToStart: true,
    masteryCriteria: [
      "Explains BPE as repeated adjacent-pair merging.",
      "Connects merge budget to lower token count and larger vocabulary.",
      "Uses the pair-frequency table to predict likely next merges.",
      "Recognizes that learned subword tokens transfer best to repeated patterns.",
      "Explains why rare or unseen strings may remain character-like.",
    ],
    steps: [
      {
        title: "Predict reusable chunks",
        experiment:
          "Use the Repetition corpus with 4 merge steps. Compare lowest newer, glow tower, and xyz in the Compare Texts panel.",
        predictionQuestion:
          "Which examples should compress more: words related to low/new, or an unrelated string like xyz?",
        observationPrompt:
          "What happened to the token counts for related and unrelated text?",
        observationOptions: [
          "Repeated patterns compressed more",
          "The unrelated string stayed split",
          "I am not sure",
        ],
        takeaway:
          "BPE helps when new text reuses pieces that were frequent in the training corpus.",
      },
      {
        title: "Spend more merges",
        experiment:
          "Move Merge steps from 0 to 8. Watch the token chips, vocabulary size, and tradeoff chart update together.",
        predictionQuestion:
          "What should happen to token count and vocabulary size as merge steps increase?",
        observationPrompt:
          "How did the two tradeoff lines move as you spent more merges?",
        observationOptions: [
          "Token count went down",
          "Vocabulary size went up",
          "I am not sure",
        ],
        takeaway:
          "Each merge can make text shorter, but every new merged piece also adds to the vocabulary.",
      },
      {
        title: "Read the next pair",
        experiment:
          "Set Merge steps to 4 and inspect Next pair candidates. Then step forward once and see which token appears.",
        predictionQuestion:
          "What should the next merge come from: a frequent candidate pair or a rare pair?",
        observationPrompt:
          "How did the highlighted candidate table explain the next token?",
        observationOptions: [
          "A high-frequency adjacent pair merged",
          "The timeline added one token",
          "I am not sure",
        ],
        takeaway:
          "BPE training repeatedly asks which adjacent pair is most worth turning into a reusable token.",
      },
    ],
  },
  "shape-skew-outliers": {
    intro:
      "Work through three distribution-shape experiments. Predict the shape first, move the outlier, then decide which summary is trustworthy.",
    whyItMatters:
      "Distribution shape exists as a concept because summary numbers can hide piles, tails, gaps, and unusual values. It is useful because shape tells you whether a center or spread statistic is trustworthy for the story in the data.",
    openingMessage:
      "No prior statistics knowledge needed. We will build the ideas by predicting, trying one small experiment, and explaining what changed.\n\n- Shape is the visible pattern of a dataset: piles, gaps, clusters, and tails.\n- Skew means one tail stretches farther than the main pile. Right skew stretches toward larger values.\n- An outlier is a far-away value that can pull summaries like mean and range.\n- Robust summaries, such as median and IQR, are designed to move less when one value is extreme.\n\nFirst prediction: where do you expect most values to sit when a distribution is right-skewed? Reply with your prediction first. Then I will tell you exactly what to try.",
    requireTypedPredictionToStart: true,
    masteryCriteria: [
      "Identifies skew by the direction of the long tail.",
      "Explains why a histogram can reveal piles, gaps, and clusters that one center hides.",
      "Explains why outliers pull mean and range more than median and IQR.",
      "Chooses median or IQR when one extreme value would make mean or range misleading.",
    ],
    steps: [
      {
        title: "Read a skewed tail",
        experiment:
          "Choose Right Skew. Compare the histogram pile-up zone with the long tail direction.",
        predictionQuestion:
          "Where do you expect most values to sit when a distribution is right-skewed?",
        observationPrompt:
          "What did the histogram show about pile-up and tail direction?",
        observationOptions: [
          "Most values were lower",
          "The tail stretched high",
          "I am not sure",
        ],
        takeaway:
          "Skew describes tail direction: right skew means most values are lower with a long tail toward high values.",
      },
      {
        title: "Move the outlier",
        experiment:
          "Click Center under Outlier position, then move the outlier slider toward High tail. Watch mean, median, range, and IQR.",
        predictionQuestion:
          "Which summaries should react most when one value moves far into the tail?",
        observationPrompt:
          "What changed most when the outlier moved away from the pile-up?",
        observationOptions: [
          "Mean and range moved most",
          "Median and IQR stayed steadier",
          "I am not sure",
        ],
        takeaway:
          "Outliers pull summaries that use extremes or every value, while median and IQR stay more robust.",
      },
      {
        title: "Spot hidden clusters",
        experiment:
          "Choose Two Clusters. Compare the histogram with the mean and median markers.",
        predictionQuestion:
          "Can one center value describe a dataset split into two piles?",
        observationPrompt:
          "What did the histogram reveal that the center summaries hid?",
        observationOptions: [
          "There were two piles",
          "One center hid the split",
          "I am not sure",
        ],
        takeaway:
          "Shape matters because one summary number can hide clusters, gaps, skew, and outliers.",
      },
    ],
  },
  "categorical-cross-entropy": {
    intro:
      "Work through three loss experiments. Predict which probability matters, change the target or prediction, then connect surprise to loss.",
    whyItMatters:
      "Cross entropy exists because classifiers need a training signal that rewards probability on the true answer and punishes confident mistakes. It is useful because it turns prediction quality into a smooth number that models can optimize.",
    steps: [
      {
        title: "Reward the true outcome",
        experiment:
          "Use Binary Cross Entropy. Select the true outcome, then raise its predicted probability.",
        predictionQuestion:
          "What should happen to loss when the model assigns more probability to what actually happened?",
        observationPrompt:
          "How did the loss respond as the true outcome probability increased?",
        observationOptions: [
          "Loss went down",
          "The model was less surprised",
          "I am not sure",
        ],
        takeaway:
          "Cross entropy is low when the prediction puts high probability on the true outcome.",
      },
      {
        title: "Punish confident wrong guesses",
        experiment:
          "Switch to Categorical Cross Entropy. Put low probability on the selected true class and watch the loss.",
        predictionQuestion:
          "What should happen when the true class gets almost no probability?",
        observationPrompt:
          "What did the loss do when the model was confident in the wrong direction?",
        observationOptions: [
          "Loss became large",
          "The true class probability drove it",
          "I am not sure",
        ],
        takeaway:
          "Categorical cross entropy mostly cares about the probability assigned to the one true class.",
      },
      {
        title: "Treat labels independently",
        experiment:
          "Switch to Multi-label Cross Entropy. Select multiple true labels, then raise true labels and lower false labels.",
        predictionQuestion:
          "Should multi-label probabilities need to add up to 1?",
        observationPrompt:
          "What happened when each label was treated as its own yes/no question?",
        observationOptions: [
          "Probabilities did not need to sum to 1",
          "Each label contributed loss",
          "I am not sure",
        ],
        takeaway:
          "Multi-label cross entropy applies a binary loss to each label, so several labels can be true at once.",
      },
    ],
  },
  "kl-divergence": {
    intro:
      "Work through three mismatch experiments. Predict which buckets will matter, reshape Q, then flip direction to see why KL is not a symmetric distance.",
    whyItMatters:
      "KL divergence appears whenever one distribution approximates another: language model targets, variational inference, distillation, retrieval scores, and calibration checks. It is useful because it turns distribution mismatch into a training signal while preserving which distribution is treated as the reference.",
    masteryCriteria: [
      "Defines KL divergence as a directional comparison between a reference distribution and an approximation.",
      "Explains that each term is weighted by the source distribution in the selected direction.",
      "Connects a large positive contribution to missing probability mass where the source distribution is high.",
      "Recognizes that some bucket contributions can be negative while the total KL remains nonnegative.",
      "Explains why DKL(P || Q) and DKL(Q || P) can differ for the same two distributions.",
    ],
    steps: [
      {
        title: "Miss the high-probability bucket",
        experiment:
          "Use the Peaked reference with DKL(P || Q) selected. Move Q_A lower, then higher, and compare the contribution table, contribution bars, and total score.",
        predictionQuestion:
          "What should happen to KL when Q gives too little probability to a bucket where P is high?",
        observationPrompt:
          "Which visible term explained most of the total mismatch?",
        observationOptions: [
          "Bucket A created the largest positive contribution",
          "The total score changed with the Q_A slider",
          "I am not sure",
        ],
        takeaway:
          "In DKL(P || Q), mistakes where P is large dominate because P supplies the weight in every term.",
      },
      {
        title: "Change what the reference cares about",
        experiment:
          "Switch from Peaked to Rare event. Keep the same Q shape for a moment, then compare which bucket dominates the contribution chart.",
        predictionQuestion:
          "If P puts even more mass on A, which mismatch should become more expensive?",
        observationPrompt:
          "What changed when the reference shape became more concentrated?",
        observationOptions: [
          "A became even more important",
          "Low-P buckets mattered less",
          "I am not sure",
        ],
        takeaway:
          "KL is not just comparing bar heights; it asks where the reference distribution expects probability mass to be.",
      },
      {
        title: "Flip the weighting",
        experiment:
          "Use the same P and Q bars, then switch between DKL(P || Q) and DKL(Q || P). Watch the formula labels, contribution chart, and score.",
        predictionQuestion:
          "Should flipping the direction keep the same KL number?",
        observationPrompt:
          "What changed when the bars stayed the same but the direction flipped?",
        observationOptions: [
          "The score changed",
          "The contribution weights changed",
          "I am not sure",
        ],
        takeaway:
          "KL divergence is directional because the left-hand distribution weights the log-ratio terms.",
      },
    ],
  },
  "probability-rules": {
    intro:
      "Work through three sample-space experiments. Predict which grid cells count, switch the rule view, then connect the colored region to the formula.",
    whyItMatters:
      "Probability rules exist because real questions combine events with and, or, and not. They are useful because they keep counts honest, especially when outcomes overlap and naive adding would double-count.",
    masteryCriteria: [
      "Explains probability as counted outcomes divided by the 36-outcome sample space.",
      "Recognizes that an intersection counts only cells that satisfy both A and B.",
      "Explains that a union subtracts the overlap because A plus B counts those cells twice.",
    ],
    steps: [
      {
        title: "Count a single event",
        experiment:
          "Set A to Sum is 7 and choose the Event A view. Look at the ringed cells in the sample-space grid and the Current Count panel.",
        predictionQuestion:
          "Out of 36 dice outcomes, how many cells do you expect Sum is 7 to count?",
        observationPrompt:
          "What did the ringed grid cells make visible about probability as counting?",
        observationOptions: [
          "Only matching cells counted",
          "The denominator stayed 36",
          "I am not sure",
        ],
        takeaway:
          "Probability starts as counted outcomes divided by the whole sample space.",
      },
      {
        title: "Find overlap",
        experiment:
          "Choose the A and B intersection view. Compare the colored A cells, B cells, and ringed overlap cells on the grid.",
        predictionQuestion:
          "What must be true for an outcome to land in the overlap?",
        observationPrompt:
          "Which cells counted in the intersection?",
        observationOptions: [
          "Cells had to satisfy both events",
          "Overlap was smaller than either event",
          "I am not sure",
        ],
        takeaway:
          "An intersection counts only outcomes where both event rules are true.",
      },
      {
        title: "Subtract double-counting",
        experiment:
          "Switch to the A or B union view. Watch the formula include A plus B minus the overlap.",
        predictionQuestion:
          "Why should the union formula subtract the overlap once?",
        observationPrompt:
          "What did the union formula do with cells that belonged to both A and B?",
        observationOptions: [
          "Overlap was counted once",
          "A plus B double-counted it first",
          "I am not sure",
        ],
        takeaway:
          "A union counts A or B, so overlapping cells must be subtracted once after adding both regions.",
      },
    ],
  },
  "conditional-probability": {
    intro:
      "Work through three filtering experiments. Predict how the denominator changes, switch scenarios, then decide whether the events are independent.",
    whyItMatters:
      "Conditional probability exists because new information changes the group you are reasoning about. It is useful for updating rates after a filter, comparing groups fairly, and deciding whether one event actually changes another.",
    steps: [
      {
        title: "Filter the denominator",
        experiment:
          "Start on Dependent, then select B given A. Compare P(B), P(B given A), and the highlighted A group in the 100-person grid.",
        predictionQuestion:
          "When you select B given A, which people should be in the denominator?",
        observationPrompt:
          "What changed when the grid filtered down to A first?",
        observationOptions: [
          "The denominator became A",
          "The B rate changed inside A",
          "I am not sure",
        ],
        takeaway:
          "Conditional probability changes the denominator first: P(B given A) counts B only inside the A group.",
      },
      {
        title: "Check independence",
        experiment:
          "Choose Independent while B given A is selected. Compare P(B given A) with P(B).",
        predictionQuestion:
          "If A and B are independent, should filtering by A change the chance of B?",
        observationPrompt:
          "What did the independent scenario show about the two rates?",
        observationOptions: [
          "The rates matched",
          "Filtering did not change B",
          "I am not sure",
        ],
        takeaway:
          "Events are independent when knowing A does not change the probability of B.",
      },
      {
        title: "Watch base rates",
        experiment:
          "Choose Base-rate shift while B given A is selected. Compare the conditional rate with the joint count in the grid.",
        predictionQuestion:
          "Can a conditional probability jump even when the total number of true cases is small?",
        observationPrompt:
          "What did the base-rate scenario reveal about rate versus count?",
        observationOptions: [
          "The conditional rate jumped",
          "The joint count stayed small",
          "I am not sure",
        ],
        takeaway:
          "A strong signal can raise a conditional rate while the rare event still occupies a small slice of the full population.",
      },
    ],
  },
  "bayes-rule": {
    intro:
      "Work through three evidence experiments. Predict the posterior, move the rates, then connect the positive-result denominator to true and false positives.",
    whyItMatters:
      "Bayes' rule exists because evidence only makes sense relative to the base rate and possible false alarms. It is useful for turning signals into updated beliefs without ignoring rare-event traps.",
    steps: [
      {
        title: "Start from the prior",
        experiment:
          "Choose Medical Test. Look at People, Real cases, Prior, and the 1000-person grid before changing any sliders.",
        predictionQuestion:
          "When the condition is rare, do you expect many real cases before any test result arrives?",
        observationPrompt:
          "What did the prior population show before the positive signal was applied?",
        observationOptions: [
          "Real cases were rare",
          "Most people did not have the condition",
          "I am not sure",
        ],
        takeaway:
          "The prior is the base pool of real cases available before evidence. Rare priors limit how many true positives a signal can find.",
      },
      {
        title: "Build the positive denominator",
        experiment:
          "Lower Sensitivity, then raise it again. Compare True positives with False positives in the Bayes denominator.",
        predictionQuestion:
          "What else besides true positives appears in the denominator after a positive result?",
        observationPrompt:
          "Which groups made up all positive results?",
        observationOptions: [
          "True positives were included",
          "False positives were included",
          "I am not sure",
        ],
        takeaway:
          "After a positive result, Bayes compares true positives against every positive result, including false positives.",
      },
      {
        title: "Let false alarms compete",
        experiment:
          "Switch to Fraud Alert, then increase the False-positive rate and compare the false alarm share.",
        predictionQuestion:
          "What should happen to certainty after a positive signal when false alarms become more common?",
        observationPrompt:
          "How did false positives change the posterior probability?",
        observationOptions: [
          "False alarms took more of the positives",
          "Posterior certainty dropped",
          "I am not sure",
        ],
        takeaway:
          "A positive signal is less convincing when the false-positive pool is large, especially for rare events.",
      },
    ],
  },
  "softmax-temperature": {
    intro:
      "Work through three softmax experiments. Predict the ranking and confidence, change logits or temperature, then explain what temperature actually controls.",
    whyItMatters:
      "Softmax temperature exists because raw model scores need to become probabilities with controllable confidence. It is useful for making predictions sharper or more exploratory without changing the underlying score ranking.",
    steps: [
      {
        title: "Convert logits to probabilities",
        experiment:
          "Choose Clear Winner. Compare raw logits, scaled logits, and probability bars.",
        predictionQuestion:
          "Which class should receive the highest probability before temperature changes anything?",
        observationPrompt:
          "What stayed connected between the largest logit and the probability chart?",
        observationOptions: [
          "The largest logit won",
          "Softmax normalized scores",
          "I am not sure",
        ],
        takeaway:
          "Softmax preserves the ranking from logits while converting the scores into probabilities that sum to 1.",
      },
      {
        title: "Sharpen the winner",
        experiment:
          "Lower Temperature toward the left. Watch confidence, entropy, and the winner probability.",
        predictionQuestion:
          "What should low temperature do to the probability mass around the top class?",
        observationPrompt:
          "How did confidence and entropy change at low temperature?",
        observationOptions: [
          "Winner confidence rose",
          "Entropy went down",
          "I am not sure",
        ],
        takeaway:
          "Low temperature sharpens the distribution by pushing more probability onto the leading class.",
      },
      {
        title: "Soften without changing the winner",
        experiment:
          "Raise Temperature toward the right. Watch whether the top class changes while probabilities spread out.",
        predictionQuestion:
          "Should high temperature usually change the winner, or mostly change confidence?",
        observationPrompt:
          "What happened to the ranking and the probability spread?",
        observationOptions: [
          "The winner stayed the same",
          "Probabilities spread out",
          "I am not sure",
        ],
        takeaway:
          "Temperature changes confidence and entropy, but it does not usually change class ranking because all logits are scaled together.",
      },
    ],
  },
  "gradient-descent": {
    intro:
      "Work through four tiny experiments. Predict first, change the controls, observe the graph, then explain what you learned.",
    whyItMatters:
      "Gradient descent exists because many models have too many parameters to tune by hand. It is useful because it uses local slope information to repeatedly lower loss and learn from data.",
    steps: [
      {
        title: "Make descent crawl",
        experiment:
          "Choose Creep, press Reset, then press Step three times. Watch the point and the loss value.",
        predictionQuestion:
          "Before stepping, do you expect theta to move a little or a lot each step?",
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
          "What changed faster this time: theta, loss, or both?",
        observationOptions: [
          "Theta moved near the valley",
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
          "Choose Converge, press Reset, raise Momentum beta toward heavy, then press Step several times. Compare it with low momentum.",
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
  "expected-value-risk": {
    intro:
      "Work through three payoff experiments. Predict which bet should win on average, move the sliders, then compare expected value with the outcome swings.",
    whyItMatters:
      "Expected value exists because uncertain choices need an average long-run yardstick. It is useful for comparing options, but pairing it with risk shows when a good average still comes with painful swings.",
    steps: [
      {
        title: "Weight the outcomes",
        experiment:
          "Choose Steady vs Swingy. Compare each bet's win probability, win amount, loss amount, and EV formula.",
        predictionQuestion:
          "Which part should matter more for expected value: the biggest payoff or the probability-weighted payoff?",
        observationPrompt:
          "What happened to EV when probability and payoff were multiplied together?",
        observationOptions: [
          "Probability changed the weight",
          "The biggest prize did not decide alone",
          "I am not sure",
        ],
        takeaway:
          "Expected value is a weighted average, so each outcome only counts as much as its probability allows.",
      },
      {
        title: "Separate average from risk",
        experiment:
          "Choose Higher EV, Wider Swings. Compare the EV markers with the red-to-green spread bars.",
        predictionQuestion:
          "Can the bet with the higher expected value still have rougher short-run outcomes?",
        observationPrompt:
          "What did the spread bar show that EV alone did not show?",
        observationOptions: [
          "The higher EV bet swung wider",
          "Risk and average were different",
          "I am not sure",
        ],
        takeaway:
          "EV describes the center of the long run; risk describes how far individual outcomes can land from that center.",
      },
      {
        title: "Watch the long run",
        experiment:
          "Switch between 24, 60, and 120 rounds. Compare simulated average with expected average for both bets.",
        predictionQuestion:
          "Should a short simulation match expected value exactly, or only drift toward it over many repeats?",
        observationPrompt:
          "How did the simulated average behave as the number of rounds changed?",
        observationOptions: [
          "Short runs bounced around",
          "More rounds moved toward EV",
          "I am not sure",
        ],
        takeaway:
          "Expected value is a long-run target, not a promise about the next few outcomes.",
      },
    ],
  },
  "bernoulli-categorical-binomial": {
    intro:
      "Work through three probability-mass experiments. Predict which outcome gets mass, change p or n, then connect the visible shape to the question being asked.",
    whyItMatters:
      "These distributions exist because different random processes ask different questions: one yes/no outcome, one class choice, or a count of repeated successes. They are useful because matching the distribution to the question keeps probability calculations meaningful.",
    steps: [
      {
        title: "Start with one yes/no trial",
        experiment:
          "Choose Bernoulli Trial. Move Success probability p and compare the 0 and 1 bars.",
        predictionQuestion:
          "When p rises, where should probability mass move in a one-trial yes/no model?",
        observationPrompt:
          "What happened to the failure and success bars as p changed?",
        observationOptions: [
          "Success mass increased",
          "Failure mass decreased",
          "I am not sure",
        ],
        takeaway:
          "A Bernoulli trial has only two outcomes, so adding mass to success removes the same amount from failure.",
      },
      {
        title: "Spread one choice across classes",
        experiment:
          "Choose Categorical Choice. Move p and watch class A trade mass with the other class buckets.",
        predictionQuestion:
          "If class A receives more probability, what must happen to the other classes?",
        observationPrompt:
          "How did the class probabilities keep the total mass at 1?",
        observationOptions: [
          "Class A gained mass",
          "Other classes shared the remainder",
          "I am not sure",
        ],
        takeaway:
          "Categorical probabilities describe one draw from many buckets, and all buckets must still sum to 1.",
      },
      {
        title: "Repeat and count successes",
        experiment:
          "Choose Binomial Count. Change Trials n, then move p and compare where the tallest count bars land.",
        predictionQuestion:
          "When p rises across repeated trials, should the likely success count move left or right?",
        observationPrompt:
          "What happened to the count shape and expected value?",
        observationOptions: [
          "The likely count moved right",
          "Expected successes increased",
          "I am not sure",
        ],
        takeaway:
          "A binomial model repeats the same Bernoulli trial and summarizes the run by how many successes occurred.",
      },
    ],
  },
  "waiting-arrival-distributions": {
    intro:
      "Work through three arrival experiments. Predict how one event chance changes waits and counts, then connect the tick model to the Poisson rate view.",
    whyItMatters:
      "Waiting and arrival distributions exist because many systems are about when events happen and how many arrive. They are useful for planning capacity, estimating rare-event risk, and translating a rate into wait-time or count predictions.",
    steps: [
      {
        title: "Split one rate into two questions",
        experiment:
          "Start with Website Visits. Compare the geometric wait formula, Poisson count formula, and the bridge from p to lambda T.",
        predictionQuestion:
          "If the per-second event chance increases, what should happen to both the typical wait and expected count?",
        observationPrompt:
          "What changed together when the same rate fed both views?",
        observationOptions: [
          "Expected count increased",
          "Typical wait got shorter",
          "I am not sure",
        ],
        takeaway:
          "The same arrival rate can answer a wait question and a count question, as long as the model assumptions stay clear.",
      },
      {
        title: "Read the waiting tail",
        experiment:
          "Move p lower and watch the waiting-time histogram. Compare P(wait <= 20s) with P(wait > 60s).",
        predictionQuestion:
          "When events become rarer, should the long-wait bucket shrink or grow?",
        observationPrompt:
          "How did the waiting histogram change when arrivals became less likely?",
        observationOptions: [
          "The 60s+ bucket grew",
          "Short waits became less likely",
          "I am not sure",
        ],
        takeaway:
          "In a geometric waiting model, rare per-tick events put more probability into long waits.",
      },
      {
        title: "Compare exact and rare-event shortcuts",
        experiment:
          "Use the Rare Defects scenario, then compare the exact at-least-one formula with the rare-event approximation.",
        predictionQuestion:
          "When lambda T is tiny, should P(at least one event) be close to lambda T?",
        observationPrompt:
          "What did the rare-event panel show about the approximation?",
        observationOptions: [
          "The shortcut was close when lambda T was tiny",
          "The exact formula is safer as lambda T grows",
          "I am not sure",
        ],
        takeaway:
          "For very rare arrivals, lambda T is a useful quick estimate; otherwise use 1 - e^-lambda T.",
      },
    ],
  },
  "monte-carlo-tree-search": {
    intro:
      "Work through three search experiments. Predict which move gets the next rollout, change the exploration pressure, then connect the result to the counters that flow back up the tree.",
    whyItMatters:
      "MCTS exists because some decision spaces are too large to search completely. It is useful because it spends simulations where they matter, balancing promising moves with uncertain moves that still need evidence.",
    steps: [
      {
        title: "Choose by UCB",
        experiment:
          "Keep c near 1.4 and compare the UCB table with the highlighted tree branch.",
        predictionQuestion:
          "Should the next rollout always choose the move with the highest win rate?",
        observationPrompt:
          "Why did the selected move win the UCB comparison?",
        observationOptions: [
          "Exploration bonus helped a less-visited move",
          "Win rate was not the only score",
          "I am not sure",
        ],
        takeaway:
          "MCTS selects by confidence plus curiosity, so a less-proven move can earn the next rollout.",
      },
      {
        title: "Turn exploration down",
        experiment:
          "Move c toward exploit. Watch the UCB table and selected branch update.",
        predictionQuestion:
          "What should happen when the exploration bonus becomes small?",
        observationPrompt:
          "Which part of the UCB score mattered more after lowering c?",
        observationOptions: [
          "Win rate dominated",
          "The best-proven move became more attractive",
          "I am not sure",
        ],
        takeaway:
          "Low exploration pressure makes MCTS behave more like it is exploiting the strongest current evidence.",
      },
      {
        title: "Backpropagate one rollout",
        experiment:
          "Press Step once. Compare the tree, rollout result, and Backpropagate table.",
        predictionQuestion:
          "After one simulated win, which counters should change?",
        observationPrompt:
          "Where did the rollout result travel after the simulation ended?",
        observationOptions: [
          "The selected move updated",
          "The root counters updated too",
          "I am not sure",
        ],
        takeaway:
          "Backpropagation pushes the rollout result through every node on the selected path, changing later UCB choices.",
      },
    ],
  },
  "confusion-matrix-thresholds": {
    intro:
      "Work through three threshold experiments. Predict which mistakes change, move the cutoff, then connect the confusion matrix to precision and recall.",
    whyItMatters:
      "Thresholds and confusion matrices exist because model scores become real decisions with different mistake costs. They are useful for choosing a cutoff that matches the job, such as catching more positives or avoiding false alarms.",
    steps: [
      {
        title: "Lower the cutoff",
        experiment:
          "Choose Medical Screen. Lower the threshold and watch the score strip, false positives, and false negatives.",
        predictionQuestion:
          "When the threshold drops, do you expect more or fewer examples to be predicted positive?",
        observationPrompt:
          "What happened to missed positives and extra positives after lowering the threshold?",
        observationOptions: [
          "Recall went up",
          "False positives increased",
          "I am not sure",
        ],
        takeaway:
          "Lower thresholds catch more actual positives, but they often create more false positives.",
      },
      {
        title: "Raise the cutoff",
        experiment:
          "Raise the threshold and compare precision, recall, and the confusion matrix.",
        predictionQuestion:
          "What mistake becomes more likely when the model only accepts very high scores?",
        observationPrompt:
          "How did the positive queue and false negatives change?",
        observationOptions: [
          "Fewer items were predicted positive",
          "False negatives increased",
          "I am not sure",
        ],
        takeaway:
          "Higher thresholds are stricter, which can improve precision but can miss positives and reduce recall.",
      },
      {
        title: "Pick the cost that matters",
        experiment:
          "Switch between Medical Screen, Spam Filter, and Fraud Review. Compare the default thresholds and mistake stories.",
        predictionQuestion:
          "Why might two tasks choose different thresholds for the same kind of score?",
        observationPrompt:
          "What changed when the cost of false positives and false negatives changed?",
        observationOptions: [
          "The best threshold depended on the task",
          "Mistake costs changed the tradeoff",
          "I am not sure",
        ],
        takeaway:
          "A threshold is a decision policy, so the best cutoff depends on which mistake costs more in the real task.",
      },
    ],
  },
  overfitting: {
    intro:
      "Work through three generalization experiments. Predict how complexity affects train and test loss, then find the useful middle.",
    whyItMatters:
      "Overfitting exists as a warning because a model can memorize training data while failing on new examples. It is useful to study because real models only matter if they generalize beyond what they already saw.",
    steps: [
      {
        title: "Underfit with too little shape",
        experiment:
          "Choose Balanced Split and set Model complexity to a low degree. Compare the curve with the training and test dots.",
        predictionQuestion:
          "What should happen when a model is too simple to follow the real pattern?",
        observationPrompt:
          "How did the curve miss both training and test structure?",
        observationOptions: [
          "The curve was too simple",
          "Both losses stayed high",
          "I am not sure",
        ],
        takeaway:
          "Underfitting happens when the model is too simple to capture the signal, so it performs poorly on both training and test data.",
      },
      {
        title: "Find the useful middle",
        experiment:
          "Raise complexity to a moderate degree. Watch training loss and test loss together.",
        predictionQuestion:
          "What should happen when complexity is enough to learn the pattern but not enough to chase every wiggle?",
        observationPrompt:
          "What changed for training and test loss in the middle range?",
        observationOptions: [
          "Both losses improved",
          "The curve followed the trend",
          "I am not sure",
        ],
        takeaway:
          "A moderate model often generalizes best because it captures signal without memorizing noise.",
      },
      {
        title: "Overfit the noise",
        experiment:
          "Push Model complexity high. Compare the wiggly curve, training loss, and test loss.",
        predictionQuestion:
          "Can training loss keep improving while test loss gets worse?",
        observationPrompt:
          "What did the high-complexity curve do around individual training dots?",
        observationOptions: [
          "Training loss dropped",
          "Test loss got worse",
          "I am not sure",
        ],
        takeaway:
          "Overfitting lowers training error by memorizing noise, but that extra wiggle can hurt future examples.",
      },
    ],
  },
  "matrix-multiplication": {
    intro:
      "Work through three matrix multiplication experiments. Predict which shapes work, pick one output cell, then connect every product cell to a row-column dot product.",
    whyItMatters:
      "Matrix multiplication exists because many linear transformations can be expressed as rows meeting columns. It is useful because neural networks, graphics, statistics, and data pipelines all rely on this compact way to combine many numbers at once.",
    openingMessage:
      "No prior linear algebra knowledge needed. We will build matrix multiplication by predicting, trying one small output cell, and explaining the pattern.\n\n- Matrix shape is rows x columns.\n- A product A x B works only when A's columns match B's rows.\n- Each output cell C[i,j] comes from row i of A dotted with column j of B.\n- The shared inner dimension tells how many multiply-add terms each output cell uses.\n- What is Matmul? is optional help if the word matmul is new.\n- The other shape presets are optional practice after the guide.\n\nFirst prediction: for a 2 x 2 matrix times a 2 x 3 matrix, what shape should the output have? Reply with your prediction first. Then I will tell you exactly what to try.",
    requireTypedPredictionToStart: true,
    masteryCriteria: [
      "Reads matrix shape as rows x columns.",
      "Explains why A columns must match B rows before multiplication is possible.",
      "Computes one output cell as a row-column dot product.",
      "Connects the shared inner dimension to the number of multiply-add terms.",
      "Predicts the output shape (m x p) from (m x n) times (n x p).",
    ],
    steps: [
      {
        title: "Check the shapes",
        experiment:
          "Open What is Matmul? once if the word matmul is new. Then choose 2x2 x 2x3 in 1. Set The Shapes. Compare the A shape, B shape, shared inner dimension, output C shape, and the locked incompatible example.",
        predictionQuestion:
          "For a 2 x 2 matrix times a 2 x 3 matrix, what shape should the output have?",
        observationPrompt:
          "What matched, what did the output shape keep from A and B, and why is the locked red example blocked?",
        observationOptions: [
          "The inner dimensions matched",
          "The output kept A rows and B columns",
          "I am not sure",
        ],
        takeaway:
          "In (m x n) times (n x p), the two n values must match and the output shape is m x p.",
      },
      {
        title: "Compute one cell",
        experiment:
          "In 2. Pick One Output Cell, select C[1,2]. Step through k = 1 and k = 2 in 3. Watch The Dot Product. Watch each product reveal and the running sum grow.",
        predictionQuestion:
          "Which values should multiply together for C[1,2]: a row with a column, two rows, or two columns?",
        observationPrompt:
          "How did k move through the highlighted row and column?",
        observationOptions: [
          "k moved across A's row",
          "k moved down B's column",
          "I am not sure",
        ],
        takeaway:
          "One output cell pairs values from a row of A and a column of B, multiplies each pair, then adds the products.",
      },
      {
        title: "Repeat across C",
        experiment:
          "In 4. See The Full Product, click the formula chip for C[1,2], then click the formula chip for C[2,1]. Compare the formula chips and the repeated A/B highlights inside that same panel.",
        predictionQuestion:
          "What should change when you move from C[1,2] to C[2,1]?",
        observationPrompt:
          "Which part of the dot product changed for each output cell?",
        observationOptions: [
          "The selected row changed",
          "The selected column changed",
          "I am not sure",
        ],
        takeaway:
          "Every C cell repeats the same rule with a different row i and column j.",
      },
    ],
  },
  "linear-quantization-int4": {
    intro:
      "Work through five quantization experiments. Predict how a real value snaps to an INT4 code, derive scale and zero point, compare blocks, tune the range, and inspect the memory tradeoff.",
    whyItMatters:
      "Quantization exists because full-precision numbers are expensive to store and move. INT4 quantization is useful because it can shrink models dramatically, making inference cheaper and faster while tracking the accuracy cost.",
    openingMessage:
      "No prior model-compression knowledge needed. We will build INT4 linear quantization by predicting, trying one small value, and explaining what changed.\n\n- INT4 has 4 bits, so it can store only 16 integer codes: 0 through 15.\n- Linear quantization shares one scale and zero point across a block of values.\n- Scale is the real-value step between adjacent INT4 codes: (max - min) / 15.\n- Zero point is the code that represents real zero: round(-min / scale).\n- Dequantization maps the code back to an approximate real value.\n- The range controls two costs: rounding error inside the range and clipping outside it.\n\nFirst prediction: if x = +0.053 gets stored with a scale of 0.0200 and zero point 8, which code should it land on? Reply with your prediction first. Then I will tell you exactly what to try.",
    requireTypedPredictionToStart: true,
    masteryCriteria: [
      "Explains why 4 bits create 16 possible codes.",
      "Derives scale from the block range and zero point from the real zero position.",
      "Uses scale and zero point to connect a real value to an integer code.",
      "Distinguishes rounding error from clipping error.",
      "Explains why a tighter range can reduce step size while increasing clipping.",
      "Compares why LLM weights, activation values, and tiny sensor weights use different ranges and scales.",
      "Connects two INT4 codes per byte to the 8x memory saving versus FP32.",
    ],
    steps: [
      {
        title: "Snap one value",
        experiment:
          "Use the LLM weights block. Inspect x = +0.053 in Map Real Value To Code and compare the green x marker with the blue dequantized marker.",
        predictionQuestion:
          "If x = +0.053 uses scale 0.0200 and zero point 8, which INT4 code should it land on?",
        observationPrompt:
          "What happened to the original value after it snapped to a code?",
        observationOptions: [
          "It landed on q = 11",
          "It came back as an approximate value",
          "I am not sure",
        ],
        takeaway:
          "Quantization stores the code, not the original decimal. Dequantization reconstructs the shelf center, so a small rounding error remains.",
      },
      {
        title: "Derive the shared map",
        experiment:
          "Stay on LLM weights. In Map Real Value To Code, read the endpoints -0.16 and +0.14, then compare them with the status strip scale 0.0200 and zero point 8. Compute scale = (max - min) / 15 and zero point = round(-min / scale).",
        predictionQuestion:
          "For LLM weights, min = -0.16 and max = +0.14 are spread across 16 codes. What do you think scale measures: the whole range, one code step, or the stored code?",
        observationPrompt:
          "Using scale = (max - min) / 15 and zero point = round(-min / scale), what scale and zero point do you get?",
        observationOptions: [
          "scale = 0.0200 and zero point = 8",
          "scale is the whole range",
          "I am not sure",
        ],
        takeaway:
          "The 16 INT4 codes create 15 gaps from code 0 to code 15, so scale is the range width divided by 15. The zero point chooses which code stands for real zero.",
      },
      {
        title: "Change the range",
        experiment:
          "Switch between Auto, Tighter, and Wider in Tune The Range. Watch the scale, clipped percent, and shelf spacing.",
        predictionQuestion:
          "What should happen when the range gets tighter around the same block?",
        observationPrompt:
          "Which changed more clearly: step size, clipping, or both?",
        observationOptions: [
          "The step size changed",
          "The clipped share changed",
          "I am not sure",
        ],
        takeaway:
          "The range decides how far 16 codes must stretch. A narrower span can make smaller steps, but values outside the span clip to the ends.",
      },
      {
        title: "Compare three blocks",
        experiment:
          "Click Activation values, then Tiny sensor model, then compare them with LLM weights. Watch the selected x value, min/max range, scale, zero point, selected code, and clipped percent.",
        predictionQuestion:
          "What should change when you quantize a different block: the 16-code budget, the block range and scale, or both?",
        observationPrompt:
          "After clicking Activation values and Tiny sensor model, what changed across the blocks and what stayed fixed?",
        observationOptions: [
          "The range and scale changed",
          "The 16-code budget stayed fixed",
          "I am not sure",
        ],
        takeaway:
          "Each block gets its own shared range, scale, and zero point because its values live in a different numeric span. The INT4 budget stays fixed at 16 codes.",
      },
      {
        title: "Pack the code",
        experiment:
          "Move the Inspect And Pack slider. Compare the code, 4-bit nibble, and packed byte.",
        predictionQuestion:
          "Why can INT4 fit two stored values into one byte?",
        observationPrompt:
          "What did the nibble and packed-byte view show?",
        observationOptions: [
          "Each value used 4 bits",
          "Two 4-bit codes made one byte",
          "I am not sure",
        ],
        takeaway:
          "FP32 uses 32 bits per value, while INT4 uses 4 bits per value. That is the source of the 8x storage reduction before scale metadata overhead.",
      },
    ],
  },
  "zero-knowledge-proofs": {
    intro:
      "Work through three proof experiments. Predict what the verifier learns, open one edge, then connect repeated checks to cheating risk and secrecy.",
    whyItMatters:
      "Zero-knowledge proofs exist because sometimes you need to prove a claim without revealing the secret behind it. They are useful for privacy-preserving verification, where trust comes from checks rather than exposing private data.",
    openingMessage:
      "No prior cryptography knowledge needed. We will build the idea by predicting, trying one small proof round, and explaining what changed.\n\n- The prover claims to know a valid coloring of the graph.\n- A commitment hides each node color until the verifier asks to open one edge.\n- The verifier learns only whether the two opened endpoint colors differ.\n- A fresh hidden shuffle each round keeps many local openings from revealing the full coloring.\n\nFirst prediction: after opening just one edge, what should the verifier learn: the whole coloring, or only whether that edge is valid? Reply with your prediction first. Then I will tell you exactly what to try.",
    requireTypedPredictionToStart: true,
    masteryCriteria: [
      "Describes the commit, challenge, open, verify round structure.",
      "Explains why one opened edge proves only a local color-difference check.",
      "Connects repeated random challenges to a shrinking cheating escape probability.",
      "Explains why a fresh hidden color shuffle protects the original secret coloring.",
    ],
    steps: [
      {
        title: "Open one edge",
        experiment:
          "Use Honest prover. Press Next challenge once and watch the graph, opened endpoints, and transcript row.",
        predictionQuestion:
          "After opening one challenged edge, what should the verifier learn?",
        observationPrompt:
          "What became visible, and what stayed hidden after the edge opened?",
        observationOptions: [
          "Only one edge opened",
          "The full coloring stayed hidden",
          "I am not sure",
        ],
        takeaway:
          "A single round reveals a local check: the two endpoint colors differ, while the rest of the coloring remains committed and hidden.",
      },
      {
        title: "Try the cheating prover",
        experiment:
          "Switch to Cheating prover and press Next challenge until a caught edge appears. Compare the verdict with the transcript.",
        predictionQuestion:
          "What should happen when the verifier randomly asks for a bad same-color edge?",
        observationPrompt:
          "How did the verdict change when the challenged edge was one of the bad edges?",
        observationOptions: [
          "The prover was caught",
          "Same-color endpoints failed",
          "I am not sure",
        ],
        takeaway:
          "A cheating prover can pass some edge challenges, but any bad same-color edge exposes the lie immediately.",
      },
      {
        title: "Raise the round count",
        experiment:
          "Move the rounds slider from a low value to a high value. Watch the formula and cheater escape chart.",
        predictionQuestion:
          "What should happen to the cheater's escape chance as random rounds increase?",
        observationPrompt:
          "What changed in the formula and chart as k increased?",
        observationOptions: [
          "Escape probability dropped",
          "Each round multiplied the risk",
          "I am not sure",
        ],
        takeaway:
          "Repeated independent challenges make cheating risk shrink quickly, while fresh shuffles keep the original coloring private.",
      },
    ],
  },
  "batch-normalization": {
    intro:
      "Work through four BatchNorm experiments. Predict how batch statistics reshape activations, switch from a centered batch to a shifted batch, inspect one value, tune scale and shift, then compare training with inference.",
    whyItMatters:
      "BatchNorm exists because neural-network activations can drift and change scale during training, making optimization harder. It is useful because it stabilizes layer inputs while still letting the model learn the scale and shift it needs.",
    openingMessage:
      "No prior neural-network normalization knowledge needed. We will build BatchNorm by predicting, trying one small batch, and explaining what changed.\n\n- A mini-batch is a small set of activations processed together during training.\n- BatchNorm computes the mini-batch mean and standard deviation.\n- It normalizes each activation with normalized = (x - mean) / sqrt(variance + epsilon), so the batch is centered and scaled.\n- The playground shows variance used = std used squared so the formula number is not a mystery.\n- Learned scale and shift then stretch and move the normalized values, keeping the layer expressive.\n- Vocabulary: papers often write mean as mu, std as sigma, scale as gamma, and shift as beta. This lab uses the plain names first.\n- During inference, BatchNorm uses saved running statistics instead of the current mini-batch.\n\nFirst prediction: the page starts on a Centered batch. When you switch to the Shifted scenario, what should happen to the activations after normalization: stay shifted right, center near zero, or all become equal? Reply with your prediction first. Then I will tell you exactly what to try.",
    requireTypedPredictionToStart: true,
    masteryCriteria: [
      "Explains that BatchNorm computes mean and standard deviation from a mini-batch during training.",
      "Connects normalized = (x - mean) / sqrt(variance + epsilon) to recentering and rescaling activations.",
      "Uses one displayed x value to explain how a normalized value is produced.",
      "Explains how scale changes output spread and shift changes output center.",
      "Distinguishes training-time batch statistics from inference-time running statistics.",
    ],
    steps: [
      {
        title: "Center a shifted batch",
        experiment:
          "Notice the page starts on the Centered scenario with batch size 6. Switch to the Shifted scenario and set batch size to 8. Compare the raw x strip, batch mean and batch std pills, and the normalized value strip. Wide and Outlier are optional stress-test scenarios after the guide.",
        predictionQuestion:
          "In the Shifted scenario, what should happen after normalization: stay shifted right, center near zero, or all become equal?",
        observationPrompt:
          "What happened to the center and spread after the raw activations became normalized values?",
        observationOptions: [
          "The normalized values centered near zero",
          "The spread became about one standard deviation",
          "I am not sure",
        ],
        takeaway:
          "BatchNorm uses the batch mean and spread to turn a shifted activation cloud into a centered, scaled signal.",
      },
      {
        title: "Inspect one activation",
        experiment:
          "Click one raw dot or normalized-value chip. Read the formula line that substitutes x, mean, and variance used into normalized = (x - mean) / sqrt(variance + epsilon). Also read the variance used pill; it is std used squared.",
        predictionQuestion:
          "If an activation is above the batch mean, should its normalized value be negative, near zero, or positive?",
        observationPrompt:
          "How did the selected x value become its displayed normalized value?",
        observationOptions: [
          "Subtracting the mean made the direction visible",
          "Dividing by std scaled the distance",
          "I am not sure",
        ],
        takeaway:
          "A normalized value is the activation's signed distance from the batch mean, measured in batch-standard-deviation units.",
      },
      {
        title: "Give expressiveness back",
        experiment:
          "Move scale below and above 1.00, then move shift left and right. Watch the output y strip plus mean(y) and std(y).",
        predictionQuestion:
          "Which parameter should stretch the output spread, and which should move the output center?",
        observationPrompt:
          "What changed when scale moved, and what changed when shift moved?",
        observationOptions: [
          "Scale changed the spread",
          "Shift moved the center",
          "I am not sure",
        ],
        takeaway:
          "Normalization stabilizes the signal, then scale and shift let the layer learn the output size and offset it needs.",
      },
      {
        title: "Switch to inference",
        experiment:
          "Toggle from Training to Inference. Compare the using mean/std pills with the Training path and Inference path table. The momentum pill is fixed context for how running stats update during training; this step focuses on which stats are used.",
        predictionQuestion:
          "At inference time, should BatchNorm use the current example batch or saved running statistics?",
        observationPrompt:
          "Which statistics did the playground use after you switched to Inference?",
        observationOptions: [
          "It used saved running statistics",
          "The output changed because mean and std changed",
          "I am not sure",
        ],
        takeaway:
          "Training uses the current mini-batch. Inference uses saved running estimates so predictions stay stable when examples arrive one at a time.",
      },
    ],
  },
  "layer-normalization": {
    intro:
      "Work through four LayerNorm experiments. Predict which values contribute to one token's statistics, change hidden features, inspect the z-score calculation, then tune gamma and beta.",
    whyItMatters:
      "LayerNorm exists because sequence models need stable hidden activations without depending on other examples in the batch. It is useful because each token can normalize its own features, which works well for transformers and variable batch sizes.",
    openingMessage:
      "No prior normalization knowledge needed. We will build LayerNorm with one token row at a time.\n\n- A token has several hidden feature activations.\n- LayerNorm computes the mean and variance across the features inside that one token.\n- It turns those features into z-scores with x_hat = (x - mean) / sqrt(variance + epsilon).\n- Learned gamma and beta then scale and shift each feature so the layer stays expressive.\n- Unlike BatchNorm, the current token's stats do not depend on other examples or tokens in the batch.\n\nFirst prediction: for the selected cat token, which values should decide the mean and variance: cat's four features, the same feature across all tokens, or the whole table? Reply with your prediction first. Then I will tell you exactly what to try.",
    requireTypedPredictionToStart: true,
    masteryCriteria: [
      "Explains that LayerNorm computes mean and variance across features within one token.",
      "Connects the displayed mean, variance, and standard deviation to the selected token's hidden vector.",
      "Uses the formula to explain how a raw feature becomes a normalized z-score.",
      "Explains that gamma scales and beta shifts each normalized feature after stabilization.",
      "Distinguishes LayerNorm's row-wise statistics from BatchNorm's column-wise batch statistics.",
    ],
    steps: [
      {
        title: "Find the contributing row",
        experiment:
          "Keep cat selected. Compare the highlighted cat row with the Current selection panel and the formula values.",
        predictionQuestion:
          "For the selected cat token, which values should decide the mean and variance: cat's four features, the same feature across all tokens, or the whole table?",
        observationPrompt:
          "Which values did the formula use to compute cat's mean and variance?",
        observationOptions: [
          "Only cat's four feature values",
          "The other token rows stayed out of the stats",
          "I am not sure",
        ],
        takeaway:
          "LayerNorm normalizes one token at a time, so the selected row's hidden features provide that token's statistics.",
      },
      {
        title: "Move one hidden feature",
        experiment:
          "Drag x1 for the selected token toward -2, then toward +2. Watch the feature grid, mean, variance, raw bars, and normalized bars.",
        predictionQuestion:
          "If one feature moves far from the other three, what should happen to the variance?",
        observationPrompt:
          "What changed in the formula and charts when x1 moved?",
        observationOptions: [
          "The mean and variance updated",
          "The normalized bars recentered around zero",
          "I am not sure",
        ],
        takeaway:
          "Changing one hidden feature changes the selected token's row statistics, and the z-score chart recenters the row around zero.",
      },
      {
        title: "Read one z-score",
        experiment:
          "Use the formula panel to explain x_hat_i = (x_i - mean) / sqrt(variance + epsilon) for one displayed feature.",
        predictionQuestion:
          "If a feature is below the selected token's mean, should its normalized value be negative, near zero, or positive?",
        observationPrompt:
          "How did subtracting the mean and dividing by the standard deviation create the z-score?",
        observationOptions: [
          "Below-mean features became negative",
          "Dividing by standard deviation scaled the distance",
          "I am not sure",
        ],
        takeaway:
          "A LayerNorm z-score is the feature's signed distance from that token's mean in that token's own standard-deviation units.",
      },
      {
        title: "Restore useful feature sizes",
        experiment:
          "Move one gamma slider and one beta slider. Watch the output y bars and the y vector while the normalized checks stay focused on x_hat.",
        predictionQuestion:
          "Which learned parameter should stretch a normalized feature, and which should shift it?",
        observationPrompt:
          "What did gamma change, and what did beta change?",
        observationOptions: [
          "Gamma stretched the feature",
          "Beta shifted the feature",
          "I am not sure",
        ],
        takeaway:
          "LayerNorm stabilizes hidden activations first; gamma and beta then let the model recover useful scale and offset feature by feature.",
      },
      {
        title: "Compare the axis",
        experiment:
          "Look at the Compare the Axis panel. Compare the LayerNorm highlighted row with the BatchNorm highlighted column.",
        predictionQuestion:
          "Which normalization depends on the other examples or tokens in a batch?",
        observationPrompt:
          "How did the highlighted row and column explain the difference?",
        observationOptions: [
          "LayerNorm used one token row",
          "BatchNorm used one feature column across the batch",
          "I am not sure",
        ],
        takeaway:
          "LayerNorm's statistics come from features inside the current token, while BatchNorm's statistics come from matching features across the batch.",
      },
    ],
  },
  "mnist-mlp-inference-debugger": {
    intro:
      "Work through one uploaded MNIST classifier. Predict what the drawn digit should produce, run the forward pass on WebGPU, then inspect the strongest probabilities, neuron contributions, and saliency pixels.",
    whyItMatters:
      "A neural network inference is more useful when you can inspect the computation instead of only seeing the final class. This lab connects an uploaded model file, GPU execution, hidden activations, softmax confidence, and input saliency in one browser-side pass.",
    openingMessage:
      "Upload a supported ONNX MNIST MLP first. The lab expects a 28x28 input and dense Gemm or MatMul layers ending in 10 digit logits.\n\nFirst prediction: draw a digit and predict which class should get the largest softmax probability. Reply with your prediction first. Then run inference and compare it with the output bars.",
    requireTypedPredictionToStart: true,
    masteryCriteria: [
      "Explains that a 28x28 drawing becomes 784 input values.",
      "Recognizes that each dense layer computes weighted sums before an activation.",
      "Connects softmax probabilities to the final 10 digit logits.",
      "Uses contribution colors to distinguish positive and negative evidence.",
      "Uses the saliency map to identify pixels that support or oppose the predicted class.",
    ],
    steps: [
      {
        title: "Load and run the model",
        experiment:
          "Upload an ONNX MLP classifier, draw a digit, then press Run if inference has not already started.",
        predictionQuestion:
          "Which digit do you expect the classifier to predict from the current drawing?",
        observationPrompt:
          "What changed in the output panel after the WebGPU run?",
        observationOptions: [
          "One softmax bar dominated",
          "The predicted class matched my drawing",
          "I am not sure",
        ],
        takeaway:
          "The uploaded graph turns 784 pixel values into 10 logits, and softmax converts those logits into comparable class probabilities.",
      },
      {
        title: "Inspect a hidden neuron",
        experiment:
          "Click a hidden neuron in the network view and compare its activation with the top upstream contributors.",
        predictionQuestion:
          "Do you expect positive or negative weighted inputs to dominate this neuron?",
        observationPrompt:
          "Which upstream values most changed the selected neuron's activation?",
        observationOptions: [
          "Large positive contributors pushed it up",
          "Large negative contributors pushed it down",
          "I am not sure",
        ],
        takeaway:
          "A hidden activation is a weighted sum passed through an activation function, so both the incoming activation and the weight sign matter.",
      },
      {
        title: "Read saliency as evidence",
        experiment:
          "Compare the input drawing with the saliency map after inference. Look for blue and pink regions over the digit strokes.",
        predictionQuestion:
          "Which pixels should most support the predicted class?",
        observationPrompt:
          "Where did the model find positive and negative evidence in the drawing?",
        observationOptions: [
          "Blue pixels lined up with useful strokes",
          "Pink pixels opposed the chosen digit",
          "I am not sure",
        ],
        takeaway:
          "Saliency estimates how changing each input pixel would move the predicted class score, so it helps debug what the classifier used as evidence.",
      },
    ],
  },
  "backpropagation-inspector": {
    intro:
      "Work through four backprop experiments. Predict the error direction, compare cached activations, follow hidden-unit credit, inspect the gradient table, then change the learning rate to see how credit becomes an update.",
    whyItMatters:
      "Backpropagation is the mechanism that lets one loss value train many weights. It matters because each weight needs a local blame signal, not just a final wrong-or-right score.",
    openingMessage:
      "No prior backprop details needed. We will inspect one output layer with cached hidden activations.\n\n- The forward pass stores activations such as h1 and h2.\n- Binary cross entropy with a sigmoid output gives output delta = p - y.\n- Each output weight gradient is cached activation times downstream error.\n- A weight update moves opposite the gradient: w = w - eta * dL/dw.\n\nFirst prediction: in Case A, h1 is larger than h2. Which output weight do you expect to receive the bigger absolute update? Reply with your prediction first. Then I will tell you exactly what to try.",
    requireTypedPredictionToStart: true,
    masteryCriteria: [
      "Explains output delta as p - y for sigmoid binary cross entropy.",
      "Connects dL/dw_out to cached activation times downstream error.",
      "Recognizes dL/dh as hidden-unit credit that would keep flowing backward.",
      "Uses the gradient sign to explain why an output weight moves up or down.",
      "Explains why larger cached activations create larger output-weight gradients when downstream error matches.",
      "Shows how the learning rate scales gradient into an update without changing the gradient itself.",
    ],
    steps: [
      {
        title: "Trace one error backward",
        experiment:
          "Use Case A. Select Forward once to see the cached activations and prediction, then select Backward. Compare p, target y, dL/dz = p - y, and the two output-weight gradient rows.",
        predictionQuestion:
          "In Case A, h1 is larger than h2. Which output weight should receive the bigger absolute update?",
        observationPrompt:
          "How did cached activation size show up in the output-weight gradients?",
        observationOptions: [
          "w_out1 had the larger absolute gradient",
          "Both gradients shared the same downstream error",
          "I am not sure",
        ],
        takeaway:
          "The same output error flows through both output weights, so the larger cached activation gets more credit.",
      },
      {
        title: "Follow hidden-unit credit",
        experiment:
          "Stay on Case A with Backward selected. Compare the dL/dh1 and dL/dh2 rows. These are hidden-unit credit signals, not output-weight updates: each one is output weight times dL/dz.",
        predictionQuestion:
          "In Case A, dL/dz is negative and w_out2 is also negative. Should dL/dh2 be positive or negative?",
        observationPrompt:
          "Why did dL/dh1 and dL/dh2 end up with different signs?",
        observationOptions: [
          "w_out2 flipped the sign because it is negative",
          "dL/dh rows are the signal that keeps flowing backward",
          "I am not sure",
        ],
        takeaway:
          "Backprop keeps moving one local step at a time: output-weight gradients use cached activation times error, while hidden-unit credit uses output weight times the same downstream error.",
      },
      {
        title: "Flip the target",
        experiment:
          "Choose Case B. Compare the graph, p - y value, gradient signs, and weight update table with Case A. Case C is an optional extra comparison after this step.",
        predictionQuestion:
          "If the target is 0 and the prediction is above 0, should p - y become positive or negative?",
        observationPrompt:
          "What changed in the signs of the gradients and updates after switching to Case B?",
        observationOptions: [
          "The output delta became positive",
          "The update moved weights opposite the gradient",
          "I am not sure",
        ],
        takeaway:
          "Changing the target changes the error sign, and the gradient sign decides whether each weight should move up or down.",
      },
      {
        title: "Scale credit into an update",
        experiment:
          "Select Update. Use eta 0.10, then eta 0.50, or move the learning-rate slider between those values. Watch the gradient column, change column, and after column.",
        predictionQuestion:
          "When learning rate increases, should the gradients themselves change or only the update size?",
        observationPrompt:
          "Which table columns changed as learning rate moved?",
        observationOptions: [
          "The change and after columns moved",
          "The gradient column stayed the same",
          "I am not sure",
        ],
        takeaway:
          "Backprop computes the gradient first. The learning rate only scales how much the optimizer moves the weight.",
      },
    ],
  },
  "autograd-graphs": {
    intro:
      "Work through three autograd experiments. Predict the forward value, inspect how local derivatives send gradients backward, then change the formula and explain why shared paths add.",
    whyItMatters:
      "Autograd is how modern neural-network libraries turn ordinary formulas into trainable parameters. It matters because each parameter needs its own gradient, and those gradients come from the computation graph, not from a separate hand-written rule.",
    openingMessage:
      "No prior autograd details needed. We will trace tiny formulas as graphs.\n\n- The forward pass computes and caches values at each node.\n- The backward pass starts with output gradient 1 and moves opposite the arrows.\n- Each edge multiplies the incoming gradient by a local derivative.\n- If one parameter affects the output through multiple paths, the path gradients add.\n\nFirst prediction: for f(a,b)=a*b+b^2 at a=2 and b=3, which parameter should have the larger gradient: a or b? Reply with your prediction first. Then I will tell you exactly what to try.",
    requireTypedPredictionToStart: true,
    masteryCriteria: [
      "Explains that autograd records a computation graph during the forward pass.",
      "Connects node activations to cached values used during the backward pass.",
      "Uses local derivatives to explain how a gradient message moves one edge backward.",
      "Explains why b in a*b+b^2 receives two gradient contributions that add.",
      "Interprets derivative charts as gradients for one parameter while the other values are held fixed.",
      "Uses a one-step update preview to explain why parameters move opposite the gradient.",
    ],
    steps: [
      {
        title: "Follow the forward cache",
        experiment:
          "Use f(a,b)=a*b+b^2 with a=2 and b=3. Read the graph from left to right and compare the mul, square, add, and out node values.",
        predictionQuestion:
          "Before looking closely, what output do you expect from a*b+b^2 when a=2 and b=3?",
        observationPrompt:
          "Which cached forward values did the output combine?",
        observationOptions: [
          "mul was 6 and square was 9",
          "add combined both paths into 15",
          "I am not sure",
        ],
        takeaway:
          "Autograd first records the exact operations and cached values, so backward gradients have a graph to follow.",
      },
      {
        title: "Add shared-path gradients",
        experiment:
          "Stay on f(a,b)=a*b+b^2. Compare the badges near a and b, then read the chain-rule panel for b's two paths.",
        predictionQuestion:
          "Which parameter should get the larger gradient, a or b, and why?",
        observationPrompt:
          "How did b's two backward paths combine?",
        observationOptions: [
          "b received 2 from multiply",
          "b received 6 from square",
          "I am not sure",
        ],
        takeaway:
          "A shared input can affect the output through multiple paths. Autograd sums those incoming contributions, so df/db becomes 2 + 6 = 8.",
      },
      {
        title: "Compare another graph",
        experiment:
          "Choose the sigmoid formula, then the squared-error formula. Move one slider in each and compare the graph, derivative charts, and update preview.",
        predictionQuestion:
          "When the formula changes, should the graph structure and derivative curves stay the same or change?",
        observationPrompt:
          "What changed when the formula changed?",
        observationOptions: [
          "The operation nodes changed",
          "The derivative curves changed",
          "I am not sure",
        ],
        takeaway:
          "Autograd follows the actual operations in the selected formula, so changing the formula changes both the graph and the gradients.",
      },
      {
        title: "Use a gradient as an update",
        experiment:
          "Return to f(a,b)=a*b+b^2. Move b high and low, then compare df/db with the one-step gradient descent preview.",
        predictionQuestion:
          "If df/db gets larger, should the one-step update move b by a larger or smaller amount?",
        observationPrompt:
          "How did the preview use the gradient value?",
        observationOptions: [
          "The update moved opposite the gradient",
          "A larger gradient made a larger step",
          "I am not sure",
        ],
        takeaway:
          "Autograd computes gradients; an optimizer turns them into parameter moves, usually by stepping opposite the gradient.",
      },
    ],
  },
} satisfies Record<TutorPlanSlug, TutorPlan>;
