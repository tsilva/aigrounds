type TutorPlanSlug =
  | "mean-median-mode"
  | "range-quartiles-iqr"
  | "variance-standard-deviation"
  | "shape-skew-outliers"
  | "categorical-cross-entropy"
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
  | "zero-knowledge-proofs";

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
  openingMessage?: string;
  requireTypedPredictionToStart?: boolean;
  masteryCriteria?: string[];
  steps: TutorStep[];
};

export function isTypedPredictionTutorPlan(plan: TutorPlan) {
  return plan.requireTypedPredictionToStart ?? true;
}

export function getTutorOpeningMessage(plan: TutorPlan) {
  if (plan.openingMessage) {
    return plan.openingMessage;
  }

  const firstStep = plan.steps[0];

  return [
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
  "probability-rules": {
    intro:
      "Work through three sample-space experiments. Predict which grid cells count, switch the rule view, then connect the colored region to the formula.",
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
    openingMessage:
      "No prior linear algebra knowledge needed. We will build matrix multiplication by predicting, trying one small output cell, and explaining the pattern.\n\n- Matrix shape is rows x columns.\n- A product A x B works only when A's columns match B's rows.\n- Each output cell C[i,j] comes from row i of A dotted with column j of B.\n- The shared inner dimension tells how many multiply-add terms each output cell uses.\n\nFirst prediction: for a 2 x 3 matrix times a 3 x 2 matrix, what shape should the output have? Reply with your prediction first. Then I will tell you exactly what to try.",
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
          "Choose 2x3 x 3x2. Compare the A shape, B shape, shared inner dimension, and output C shape in the Set The Shapes panel.",
        predictionQuestion:
          "For a 2 x 3 matrix times a 3 x 2 matrix, what shape should the output have?",
        observationPrompt:
          "What matched, and what did the output shape keep from A and B?",
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
          "Select C[1,2]. Step through k = 1, k = 2, and k = 3 in Watch The Dot Product.",
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
          "Click several cells in the Full Product panel and compare their formula chips.",
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
} satisfies Record<TutorPlanSlug, TutorPlan>;
