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
  | "transformer-attention";

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
          "Choose Compact. Compare the minimum, maximum, range bar, and box plot whiskers.",
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
    steps: [
      {
        title: "Start with short deviations",
        experiment:
          "Choose Tight. Look at the deviation bars and the variance formula rows.",
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
          "Choose Wide, then nudge an edge point farther from 50. Compare deviation with squared deviation.",
        predictionQuestion:
          "What should squaring do to a point that is very far from the mean?",
        observationPrompt:
          "Which row dominated the variance calculation?",
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
          "Choose River Bank and keep bank selected. Compare the attention weights for river and bank.",
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
          "Move Focus Sharpness from spread to sharp. Compare entropy, top weight, and the connection diagram.",
        predictionQuestion:
          "What should happen when softmax focus becomes sharper?",
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
  "shape-skew-outliers": {
    intro:
      "Work through three distribution-shape experiments. Predict the shape first, move the outlier, then decide which summary is trustworthy.",
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
          "Drag the outlier slider from Center to High tail. Watch mean, median, range, and IQR.",
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
    steps: [
      {
        title: "Count a single event",
        experiment:
          "Set A to Sum is 7. Look at the highlighted cells and the A count in the sample-space grid.",
        predictionQuestion:
          "Out of 36 dice outcomes, how many cells do you expect Sum is 7 to count?",
        observationPrompt:
          "What did the grid make visible about probability as counting?",
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
          "Choose an intersection view for A and B. Compare A, B, and A and B on the grid.",
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
          "Switch to the union view. Watch the formula include A plus B minus the overlap.",
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
          "Choose Dependent. Compare P(B), P(B given A), and the highlighted A group in the 100-person grid.",
        predictionQuestion:
          "When we ask for P(B given A), which people should be in the denominator?",
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
          "Choose Independent. Compare P(B given A) with P(B).",
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
          "Choose Base-rate shift. Compare the conditional rate with the joint count in the grid.",
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
          "Raise Sensitivity and compare True positives with False positives in the Bayes denominator.",
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
          "Increase the False-positive rate, then switch to Fraud Alert and compare the false alarm share.",
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
} satisfies Record<TutorPlanSlug, TutorPlan>;
