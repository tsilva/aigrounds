import { conditionalTutorPlan } from "@/modules/conditional-probability/learning-experiments";
import { probabilityTutorPlan } from "@/modules/probability-rules/learning-experiments";

export type TutorStep = {
  title: string;
  experiment: string;
  predictionQuestion: string;
  observationPrompt: string;
  takeaway: string;
};

export type TutorPlan = {
  intro: string;
  whyItMatters: string;
  openingMessage?: string;
  masteryCriteria?: string[];
  steps: TutorStep[];
};

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

export const playgroundTutorPlans = {
  "mean-median-mode": {
    intro:
      "Work through three small experiments. Predict first, change the data, observe the summaries, then explain which measure of typical stayed useful.",
    whyItMatters:
      "Typical values exist because raw lists are hard to compare at a glance. Mean, median, and mode give compact center summaries, and choosing the right one helps avoid being fooled by repeats or outliers.",
    openingMessage:
      "No prior statistics knowledge needed. The Guided experiment walks you through predict, try, and explain. You can use it independently or talk through your reasoning here.\n\n- Mean is the average: add all values, then divide by how many values there are.\n- Median is the middle value after sorting the data.\n- Mode is the most common value. A dataset can have no mode, one mode, or more than one mode.\n- Outliers are far-away values that can pull some summaries more than others.\n\nStart with Balanced. First prediction: if you move I from 66 to 90, which summary values will change? Reply with your prediction first, or share the prediction you already chose in the Guided experiment.",
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
          "Choose Balanced if it is not already selected. Compare the mean and median in Live summaries. In Guided experiment, choose a prediction, then move point I from 66 to 90 using its dot or Point I value field. Watch the summary marker lanes and the outlined middle in Sorted values.",
        predictionQuestion:
          "In Balanced, if you move I from 66 to 90, which summary values will change?",
        observationPrompt:
          "How did the mean and median compare before and after point I moved to 90?",
        takeaway:
          "The original Balanced dataset has equal mean and median. Moving I changes the sum and mean, while the fifth sorted value and median stay at 42.",
      },
      {
        title: "Create a mode",
        experiment:
          "Choose Repeated Peak. Predict what happens if A joins 24, then move point A to 24 using its dot or Point A value field. Compare Sorted values with the Mode summary and its occurrence count.",
        predictionQuestion:
          "In Repeated Peak, if A joins the group at 24, what happens to the mode?",
        observationPrompt:
          "Did the mode's value change, or did its occurrence count change when A joined 24?",
        takeaway:
          "Mode is about frequency, not balance or position, so repeats can make it the clearest typical value.",
      },
      {
        title: "Pull with an outlier",
        experiment:
          "Choose Add Outlier. In Guided experiment, choose a prediction, then move point I from 92 to 28 using its dot or Point I value field. Watch the Mean, Median, and Mode marker lanes and Live summaries. Explain the result before trying another dataset.",
        predictionQuestion:
          "In Add Outlier, if you move I from 92 to 28, which summary values will change?",
        observationPrompt:
          "Which summary changed when I moved from 92 to 28, and why did the other two stay at 24?",
        takeaway:
          "The mean uses every value and gets pulled by extremes; the median uses sorted position and is more resistant.",
      },
    ],
  },
  "range-quartiles-iqr": {
    intro:
      "Predict, move one value, and explain the change in range and IQR. Follow the three on-page experiments or discuss them here.",
    whyItMatters:
      "A center value does not tell you how scattered the data is. Range measures the full span; IQR measures the span between the two quartiles, so the two can react differently to the same change.",
    openingMessage:
      "You need only number order, subtraction, and averaging two numbers. The on-page experiments work independently of this chat.\n\nRange is maximum minus minimum. The median is the fifth sorted value in this nine-value lesson. To find quartiles, exclude the median: Q1 averages the middle two values of the lower half; Q3 averages the middle two of the upper half. IQR means interquartile range: Q3 minus Q1. The box spans Q1 to Q3, with the median marked inside. This lesson's whiskers show min and max. Other quartile and whisker conventions exist.\n\nChoose Experiment, then Reset to begin Move an edge. Before moving I from 58 to 92, predict which measure changes: only range, only IQR, both, or neither. Choose your prediction on the page, or tell me your reasoning here.",
    masteryCriteria: [
      "Computes range as maximum minus minimum and connects it to the full span.",
      "Finds Q1 and Q3 from the middle pairs of the sorted halves, excluding the overall median.",
      "Computes IQR as Q3 minus Q1 and connects it to the box width.",
      "Explains why moving the largest value farther outward can change range while preserving IQR.",
      "Predicts and explains IQR changes when a quartile contributor moves or sorted positions change.",
    ],
    steps: [
      {
        title: "Move an edge",
        experiment:
          "Choose Experiment and Reset if starting over. In Move an edge, choose a prediction; this restores the starting values. Move only I from 58 to 92 using its dot, arrow keys, or Point I value. Compare the Range and IQR before/now calculations and the outlined pairs in Sorted values. Choose an explanation, then press Check explanation.",
        predictionQuestion:
          "If I moves from 58 to 92, which spread measure will change?",
        observationPrompt:
          "What changed in range? Did either outlined quartile pair change? Explain before proceeding.",
        takeaway:
          "Range grows from 40 to 74. IQR stays at 20 because Q1 remains 26 and Q3 remains 46. This outward move leaves their contributing pairs unchanged.",
      },
      {
        title: "Move a quartile",
        experiment:
          "After explaining the first experiment, press Next: Move a quartile. Choose a prediction, then move only H from 48 to 68 using its dot or Point H value. Read Q3's calculation in Sorted values and compare Range with IQR. Choose an explanation and press Check explanation.",
        predictionQuestion:
          "If H moves from 48 to 68 while I stays at 92, which spread measure will change?",
        observationPrompt:
          "How did H change Q3? Why did the range stay at 74?",
        takeaway:
          "Q3 changes from (44 + 48) / 2 = 46 to (44 + 68) / 2 = 56. IQR grows from 20 to 30; range stays at 74 because the extremes are unchanged.",
      },
      {
        title: "Try new data",
        experiment:
          "After explaining Move a quartile, press Next: Try new data. Inspect the new values. Choose a prediction, then move only I from 88 to 30 using its dot or Point I value. Find its new position in Sorted values, identify the new maximum and the new upper-half pair, choose an explanation, and press Check explanation. Wide Middle and Outlier are optional free-exploration presets; Return to experiment restores the current exercise.",
        predictionQuestion:
          "In this new dataset, I moves from 88 to 30, into the middle. Which spread measure will change?",
        observationPrompt:
          "Which point became the maximum? Which two values now determine Q3? Why did IQR change this time?",
        takeaway:
          "H at 44 becomes the maximum. Q3 changes from (40 + 44) / 2 = 42 to (36 + 40) / 2 = 38. Range falls from 78 to 34 and IQR from 20 to 16. Resistance to extremes does not mean IQR never changes.",
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
          "Choose Tight. Look at the Distances from the mean table, its Deviation and Squared columns, and the Variance and Standard deviation summaries.",
        predictionQuestion:
          "If most points sit near the mean, what should happen to variance and standard deviation?",
        observationPrompt:
          "What did the short deviation bars do to the squared terms?",
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
        takeaway:
          "Standard deviation measures typical distance from the mean, so it can change even when the mean does not.",
      },
      {
        title: "Watch squaring amplify edges",
        experiment:
          "Choose Wide, then move A below 10 or G above 90. Change only that point. Use the Point A value or Point G value field, or focus a dot and use arrow keys. Compare its Deviation and Squared entries in Distances from the mean.",
        predictionQuestion:
          "What should squaring do to a point that is very far from the mean?",
        observationPrompt:
          "Which point or card dominated the variance calculation?",
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
        takeaway:
          "BPE training repeatedly asks which adjacent pair is most worth turning into a reusable token.",
      },
    ],
  },
  "shape-skew-outliers": {
    intro: "Four experiments and a transfer check compare shape and summaries while moving only point M.",
    whyItMatters: "A center or spread number can hide tails, gaps and groups. Seeing the distribution helps choose evidence for the question instead of treating one statistic as the whole story.",
    openingMessage: "You need averages, sorted middles and subtraction. A histogram groups values into intervals; skew names the direction of a sparse tail. IQR is Q3 minus Q1, the spread of the middle half. Robust means less sensitive to extreme points, not unchanging.\n\nThere are 12 fixed points and one movable point M. Choose a rail prediction to restore the experiment’s start, move M with its dot or Point M value, then explain. Reset restarts the current experiment. Start comparisons always use the same 13 points.\n\nExperiment 1 starts at Right Skew with M = 94. Predict what changes when M moves to 100 before trying it. Share your prediction here or in the rail.",
    masteryCriteria: [
      "Reads skew direction from the tail rather than the main pile or a mean cutoff.",
      "Explains why moving within one histogram bin can leave counts unchanged.",
      "Compares mean/range sensitivity with median/IQR without claiming invariance.",
      "Uses histogram and exact values to identify groups and gaps hidden by a center or box.",
      "Distinguishes a movable point from an outlier flag and chooses evidence for a new point.",
    ],
    steps: [
      {
        title: "Follow a tail",
        experiment: "In Right Skew, choose a prediction and move Point M value from 94 to 100. Compare the last histogram bin and M on the number line.",
        predictionQuestion: "What changes when M moves from 94 to 100?",
        observationPrompt: "Did the bin count change? Which exact endpoint moved?",
        takeaway: "The high-value endpoint extends but the 90–100 bin still contains one point. Skew refers to the tail direction; bins hide movement within their interval.",
      },
      {
        title: "Stretch one edge",
        experiment: "Choose Balanced or Next experiment. Predict, then move M from 50 to 100. Compare all four Start values and changes in Live shape summaries.",
        predictionQuestion: "Which pair changes more here: mean/range or median/IQR?",
        observationPrompt: "What changed in the extremes, sum and middle sorted positions?",
        takeaway: "Mean uses every value and range uses extremes. Median and IQR follow middle positions and can change less without being fixed.",
      },
      {
        title: "Read the other direction",
        experiment: "In Left Skew, predict then move M from 6 to 0. Locate the main high-value pile and the sparse low-value tail.",
        predictionQuestion: "Which direction does the tail extend?",
        observationPrompt: "Where are most values and where does the sparse tail reach?",
        takeaway: "The left tail reaches toward small values. The mean–median gap alone cannot prove shape.",
      },
      {
        title: "Find what a center hides",
        experiment: "In Two Clusters, predict then move M from 96 to 50. Compare the histogram and sorted values with the center and box. Then use Try the transfer check and set M to 60.",
        predictionQuestion: "Does placing one point in the gap merge the two groups?",
        observationPrompt: "How many points remain below 40 and above 60? What evidence would you report for M = 60?",
        takeaway: "The two groups remain. A center or box cannot reveal every gap. Report shape alongside appropriate center and spread. The optional screening rule flags values beyond 1.5 IQR fences for investigation; the displayed whiskers span min to max, not Tukey fences.",
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
        takeaway:
          "KL divergence is directional because the left-hand distribution weights the log-ratio terms.",
      },
    ],
  },
  "probability-rules": probabilityTutorPlan,
  "conditional-probability": conditionalTutorPlan,
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
      "No prior linear algebra knowledge needed. We will build matrix multiplication by predicting, trying one small output cell, and explaining the pattern.\n\n- Matrix shape is rows x columns.\n- A product A x B works only when A's columns match B's rows.\n- Each output cell C[i,j] comes from row i of A dotted with column j of B.\n- The shared inner dimension tells how many multiply-add terms each output cell uses.\n- The other shape presets are optional practice after the guide.\n\nFirst prediction: for a 2 x 2 matrix times a 2 x 3 matrix, what shape should the output have? Choose a prediction in the experiment rail, or discuss it here. The rail checks your actions and explanation before offering the next experiment.",
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
          "In Check the shapes, choose a prediction in the rail. Then choose 2x2 x 2x3 in the scenario toolbar. Compare Your matrices, Output shape, Terms per cell, and the Incompatible example below the formulas. Choose an explanation and use Check explanation.",
        predictionQuestion:
          "For a 2 x 2 matrix times a 2 x 3 matrix, what shape should the output have?",
        observationPrompt:
          "What matched, what did the output shape keep from A and B, and why is the Incompatible example blocked?",
        takeaway:
          "In (m x n) times (n x p), the two n values must match and the output shape is m x p.",
      },
      {
        title: "Build one cell",
        experiment:
          "In Build one cell, choose a prediction in the rail. Use 2x2 x 2x3. Select C[1,2] in C, then select k = 1 and k = 2 in Build C[1,2]. Watch each product and the running sum. Choose an explanation and use Check explanation.",
        predictionQuestion:
          "Which values should multiply together for C[1,2]: a row with a column, two rows, or two columns?",
        observationPrompt:
          "How did k move through the highlighted row and column?",
        takeaway:
          "One output cell pairs values from a row of A and a column of B, multiplies each pair, then adds the products.",
      },
      {
        title: "Repeat across C",
        experiment:
          "In Repeat across C, choose a prediction in the rail. Use 2x2 x 2x3. Under Every output cell follows the same rule, select the C[1,2] formula and then C[2,1]. Compare the formulas and the A row/B column labels above. Choose an explanation and use Check explanation. After Lesson explained, use Try another shape: predict the output shape and term count for 3x2 x 2x1, then select C[3,1] and reveal both terms.",
        predictionQuestion:
          "What should change when you move from C[1,2] to C[2,1]?",
        observationPrompt:
          "Which part of the dot product changed for each output cell?",
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
        takeaway:
          "Saliency estimates how changing each input pixel would move the predicted class score, so it helps debug what the classifier used as evidence.",
      },
    ],
  },
  "backpropagation-inspector": {
    intro:
      "Inspect one sigmoid output layer through four Predict → Try → Explain experiments. Compare local gradients, flip only the target, scale a previewed step, and follow signals to cached hidden activations. The visual computation sits above its equivalent matrix form so learners can compare the same values.",
    whyItMatters:
      "Backprop computes how sensitive loss is to each parameter. Gradient descent separately turns those sensitivities into weight changes. Keeping these jobs distinct makes neural-network training easier to reason about.",
    openingMessage:
      "We need weighted sums, probabilities, and loss; no calculus derivation is required. A gradient tells us how loss responds to a tiny increase. h1 and h2 are outputs cached from an earlier layer. This lesson uses a sigmoid probability and unweighted binary cross entropy, so the output gradient is p − y. Bias and cached activations stay fixed during each update preview. The visual view and matrix view are stacked for the same single example. Matrix shapes and notation are explained beside the calculations; compare matching entries as you go.\n\nUse Underprediction, or Reset if you have edited the case. Before selecting Backward, predict: h1 is 0.80 and h2 is 0.35. Which output weight should have the larger absolute gradient? Give your prediction and reason first.",
    masteryCriteria: [
      "Uses dL/dw = h × (p − y) to compare the two weight gradients for the same example.",
      "Explains that p − y is specific to this sigmoid and binary-cross-entropy combination, not every loss.",
      "Connects target 0, positive gradients, negative weight changes, and lower probability/loss in the fixed example.",
      "Distinguishes unchanged starting gradients from learning-rate-scaled weight changes; a new pass after updating weights generally has new gradients.",
      "Distinguishes dL/dh = w × (p − y) from output-weight gradients and earlier-weight updates.",
      "Connects individual gradient values to their matching entries in the matrix form.",
    ],
    steps: [
      {
        title: "Which gradient is larger?",
        experiment:
          "Choose Underprediction. Record a prediction in the rail and select Reveal gradients, or select Backward after predicting. Compare the weight-gradient entries and their absolute sizes. The scalar formulas show h1 × (p − y) and h2 × (p − y); the matrix form directly below shows ∇W L = δ × hᵀ with the same two entries. Do not reveal the explanation before the learner tries.",
        predictionQuestion:
          "h1 is 0.80 and h2 is 0.35. Which weight will have the larger absolute gradient?",
        observationPrompt:
          "Report both gradients and identify the local multiplier in each formula.",
        takeaway:
          "Each activation multiplies the same output gradient p − y. With the same error, the larger nonnegative activation produces a larger absolute weight gradient.",
      },
      {
        title: "Flip only the target",
        experiment:
          "Use Next experiment or choose False alarm. The activations and starting weights are unchanged, but y is now 0. Record a prediction and select Preview update. Compare Gradient and Change in the table with ∇W L and ΔW directly below, then probability/loss before and after one step.",
        predictionQuestion:
          "Should a gradient-descent step raise or lower both weights when y changes to 0?",
        observationPrompt:
          "Explain the gradient and change signs, including why the negative weight also moves down.",
        takeaway:
          "p − y is positive and the activations are positive, so both weight gradients are positive. Subtracting them lowers both weights and lowers probability and loss for this example.",
      },
      {
        title: "Gradient or step size?",
        experiment:
          "Use Next experiment from Flip only the target; the starting learning rate is 0.10. Predict, then select Set learning rate to 0.50, or use Exact learning rate. Compare the Gradient column and Change at η = 0.10 / 0.50; the matrix form directly below shows the same comparison as ∇W L and the two ΔW rows. Each preview starts from the same original weights, not the preceding preview.",
        predictionQuestion:
          "When η goes from 0.10 to 0.50, do the starting gradients or the weight changes become five times larger?",
        observationPrompt:
          "Which values stayed fixed? Which values scaled, and why?",
        takeaway:
          "Backprop computes gradients at the starting state; η scales the optimizer step. Recomputing after a real update generally gives new gradients. This example does not prove larger rates always improve training.",
      },
      {
        title: "Two kinds of gradients",
        experiment:
          "Use Next experiment or choose Equal activations. Predict the hidden-signal signs, then select Reveal hidden signals. Compare the equal output-weight gradients with dL/dh1 and dL/dh2 in How gradients reach the hidden layer; the matrix form directly below shows those as ∇W L = δ × hᵀ and ∇h L = Wᵀ × δ. For near transfer, Explore freely and set Hidden activation h1 to 0; inspect its weight gradient and explain it.",
        predictionQuestion:
          "With equal activations but opposite signed output weights, do the two hidden-activation signals have the same or opposite signs?",
        observationPrompt:
          "Explain why weight gradients are equal while hidden-activation signals differ, and why dL/dh is not an earlier-weight update.",
        takeaway:
          "Output-weight gradients use h × (p − y); hidden-activation signals use w × (p − y). Reaching an earlier weight requires its layer’s local derivatives. With h1 = 0, the output weight 1 gradient is zero for this example.",
      },
    ],
  },
  "pytorch-image-augmentations": {
    intro:
      "Work through one image-transform stack. Choose an image, tune the transforms, compare the original with the composed result, and connect the controls to torchvision code.",
    whyItMatters:
      "Image augmentation makes training data more varied, but each transform is an assumption about what should not matter. Seeing the composed image next to the exact code makes those assumptions concrete.",
    openingMessage:
      "No prior PyTorch transform details needed. We will build one torchvision transform stack.\n\n- Each block receives the image from the block above it.\n- Each slider maps to a parameter in the generated v2.Compose code.\n- Single-image transforms change pixels while the class label stays one-hot.\n\nFirst prediction: if we crop, rotate, and color-jitter a cat image but it is still clearly a cat, should the target label stay one-hot or change? Reply with your prediction first. Then I will tell you exactly what to try.",
    masteryCriteria: [
      "Explains that transforms compound top to bottom.",
      "Connects at least two sliders to their matching torchvision parameters.",
      "Uses the original/result panes to describe the visible pixel changes.",
      "Explains why the selected image keeps a one-hot class label.",
    ],
    steps: [
      {
        title: "Read the stack top to bottom",
        experiment:
          "Start with the cat image selected. Read the enabled blocks from top to bottom: RandomResizedCrop, Rotation, and ColorJitter. Compare that order with the generated v2.Compose code beneath the stack.",
        predictionQuestion:
          "Which transform should touch the image first: the top block or the bottom block?",
        observationPrompt:
          "How did the transform stack match the code order?",
        takeaway:
          "A v2.Compose pipeline applies transforms in order: each block receives the image produced by the block above it.",
      },
      {
        title: "Resample the crop",
        experiment:
          "Use the Resample crop button in the RandomResizedCrop block. Watch the crop rectangle on the original image and the composed result on the right.",
        predictionQuestion:
          "When the crop sample changes but the object is still recognizable, should the class label change?",
        observationPrompt:
          "What changed when the crop was resampled?",
        takeaway:
          "RandomResizedCrop samples a crop box, then resizes that crop back to the model input size.",
      },
      {
        title: "Tune rotation and color",
        experiment:
          "Move the Rotation max degrees slider and the ColorJitter brightness or contrast sliders. Watch both the composed result and the generated code update.",
        predictionQuestion:
          "Which code values should change when you move those sliders?",
        observationPrompt:
          "Which visible changes came from rotation and which came from color jitter?",
        takeaway:
          "The sliders are not generic strength controls; they map directly to torchvision transform parameters.",
      },
      {
        title: "Toggle extra transforms",
        experiment:
          "Enable GaussianBlur or RandomErasing. Compare the active transform count, the composed result, and the generated code.",
        predictionQuestion:
          "What should happen to the generated code when a transform is disabled?",
        observationPrompt:
          "What changed when the extra transform was enabled or disabled?",
        takeaway:
          "Only enabled blocks are part of the composed transform pipeline.",
      },
      {
        title: "Switch the image",
        experiment:
          "Choose another image such as the stop sign or sneaker. Keep the same transform stack and compare how the same parameters affect a different image.",
        predictionQuestion:
          "Should switching from cat to stop sign change the code, or only the image being transformed?",
        observationPrompt:
          "What stayed the same after selecting a different image?",
        takeaway:
          "The transform stack describes image operations. The selected image determines which one-hot class label is preserved.",
      },
    ],
  },
  "convolution-filter-lab": {
    intro:
      "Use five prediction → try → explanation experiments, then a border-response transfer check. The image window, exact products, and selected output are linked.",
    whyItMatters:
      "Image models reuse a small grid of weights across local neighborhoods. Tracing one weighted sum reveals what a filter detects and why stride and boundary assumptions matter.",
    openingMessage:
      "You only need addition, signed multiplication, and averages; no computer-vision background. A kernel is a small grid of weights. An output map contains one weighted sum per image window. Rows and columns count from 0.\n\nThe rail has five experiments and a transfer check. Choose a prediction there to restore its starting settings, try the named control, then explain the result. Reset restarts the current experiment. You can explore any image or filter at any time.\n\nStart with Experiment 1, Ramp, Edge, Stride 1, Zero padding 1, y[1,1]. First prediction: switching to Blur, what will y[1,1] become: 2, 6, or 18? Share your prediction before trying it.",
    masteryCriteria: [
      "Calculates one output by multiplying matching patch and kernel positions and adding all nine products.",
      "Maps a selected output cell to its image window and explains that moving reuses fixed weights.",
      "Compares Edge column differences, Blur averaging, and Sharpen local contrast without assuming outputs stay in the image range.",
      "Explains stride as window step and uses floor((5 + 2p - 3) / s) + 1 to predict output dimensions.",
      "Explains zero padding as an outside-image assumption and identifies a border-created negative Edge response.",
    ],
    steps: [
      {
        title: "One patch, one number",
        experiment:
          "In Experiment 1 choose a prediction, which restores Ramp, Edge, Stride 1, Zero padding 1, Output row 1 and Output column 1. Select Blur. Inspect Image patch, Kernel weights, Products, Row sums, and Selected sum. Answer the rail explanation before Next experiment.",
        predictionQuestion:
          "Switching to Blur on the three rows of 1, 2, 3, what will y[1,1] become: 2, 6, or 18?",
        observationPrompt:
          "How do the nine exact Products and Row sums produce the selected output?",
        takeaway:
          "Blur weights each value by 1/9; the patch total is 18 and the output is 2. The center happens to equal this average, but all nine values contribute. Products are elementwise, not matrix multiplication.",
      },
      {
        title: "Same weights, new patch",
        experiment:
          "Use Next experiment and choose a prediction in Experiment 2. Use Move window right once or set Output column to 2. Keep Ramp, Blur, Stride 1, Zero padding 1 and Output row 1. Compare the patch and weights.",
        predictionQuestion:
          "Moving one output cell right, does the patch change, do the weights change, or do both change?",
        observationPrompt:
          "What changed in Image patch and Kernel weights as the selected output moved from y[1,1] to y[1,2]?",
        takeaway:
          "The patch rows change from 1,2,3 to 2,3,4 and the Blur output becomes 3. The same weights are reused. The complete output map is computed immediately; selection inspects a calculation, not a visit/completion state.",
      },
      {
        title: "Choose the local question",
        experiment:
          "Use Next experiment and choose a prediction in Experiment 3. This restores Single spot, Blur, Stride 1, Zero padding 1, Output row 2 and Output column 2. Select Sharpen, leaving the position unchanged. Compare the center product and Selected sum.",
        predictionQuestion:
          "For a center pixel of 9 with zero neighbors, will Sharpen output 45, 9, or 1?",
        observationPrompt:
          "What is the center product, and which neighbor products contribute?",
        takeaway:
          "Sharpen gives 9×5=45 while Blur gives 9/9=1 on this patch. Edge compares the right and left columns. Outputs can exceed the input range or be negative. These are fixed demonstration filters; changing filters does not train or replace the image.",
      },
      {
        title: "Skip window positions",
        experiment:
          "Use Next experiment and choose a prediction in Experiment 4. Set Stride to 2; keep Ramp, Edge and Zero padding 1. Read Output size and inspect the highlighted window. Use Output row and Output column or arrow keys on an output cell to inspect other sampled positions.",
        predictionQuestion:
          "Keeping zero padding at 1, does Stride 2 produce a 3×3, 5×5, or 2×2 output?",
        observationPrompt:
          "What start positions can a 3×3 window use on the 7×7 padded image when stepping by two?",
        takeaway:
          "Positions 0,2,4 fit, producing 3×3. Stride samples fewer windows without resizing the image or averaging output cells. The dimension formula assumes this 5×5 image, fixed 3×3 kernel and no dilation.",
      },
      {
        title: "Give borders a neighborhood",
        experiment:
          "Use Next experiment and choose a prediction in Experiment 5. This restores Ramp, Blur, Stride 1, Zero padding 0 and y[0,0]. Set Zero padding to 1. Compare padded-image and output sizes and trace the new top-left patch.",
        predictionQuestion:
          "With Stride 1, does adding one ring of zero padding make the output 5×5, 3×3, or 7×7?",
        observationPrompt:
          "Which zeros are padding, and what do their products contribute to the new y[0,0]?",
        takeaway:
          "The input becomes 7×7 and output becomes 5×5. The new top-left patch has six padded zeros and Blur output 2/3. The same output index now covers a different image window. Padding enables border-centered windows, assumes zero outside the image, and can affect responses; it does not recover true missing pixels.",
      },
      {
        title: "A border can look like an edge",
        experiment:
          "Use Try the transfer check and choose a prediction. The start is Step edge, Edge, Stride 1, Zero padding 1, Output row 2 and Output column 3. Use Move window right once. Trace Products at y[2,4], then explain in the rail. Restart experiments is available after the explanation succeeds.",
        predictionQuestion:
          "Moving right from a flat patch of fives into the padded border, will Edge output a negative value, zero, or a positive value?",
        observationPrompt:
          "Why did a flat part of the original image give a negative response?",
        takeaway:
          "The patch has rows of 5, 5, 0. The right-column sum of 0 minus the left-column sum of 15 gives −15. Padding created the apparent drop; negative responses are valid. The layer uses displayed weights without flipping, the cross-correlation convention used in CNNs; one input channel, no bias or activation.",
      },
    ],
  },
  "label-mixing-image-transforms": {
    intro:
      "Work through three label-mixing experiments. Choose two examples, compare CutMix with MixUp, move lambda, and connect the mixed image to the soft target vector.",
    whyItMatters:
      "CutMix and MixUp are different from ordinary image transforms because the class target is no longer one-hot. Training with them only makes sense when the label vector changes in the same proportion as the mixed pixels.",
    openingMessage:
      "No prior CutMix or MixUp details needed. We will build the label contract visually.\n\n- Ordinary single-image transforms keep the original one-hot target.\n- CutMix pastes a region from one image into another.\n- MixUp blends two full images.\n- Both require a soft target vector such as 0.62 cat and 0.38 stop sign.\n\nFirst prediction: if 38% of a stop sign is pasted into a cat image, should the target stay 100% cat or become a mixture? Reply with your prediction first. Then I will tell you exactly what to try.",
    masteryCriteria: [
      "Explains why CutMix and MixUp change both pixels and labels.",
      "Connects lambda to the visible image mixture and soft-label vector.",
      "Compares CutMix patch mixing with MixUp full-image blending.",
      "Explains why the loss has weighted terms for both selected classes.",
    ],
    steps: [
      {
        title: "Choose the two source labels",
        experiment:
          "Keep cat as source A and stop sign as source B. Read the one-hot target rows for y_A and y_B before changing the mixed image.",
        predictionQuestion:
          "If the training example contains evidence from both images, should the label stay one-hot?",
        observationPrompt:
          "What did the two source target rows show before mixing?",
        takeaway:
          "CutMix and MixUp start from ordinary one-hot labels, then combine those labels in the same proportions as the image mixture.",
      },
      {
        title: "Move lambda",
        experiment:
          "Use CutMix. Move lambda from about 0.20 to about 0.80. Watch the mixed image, the A/B percentage pill, and the soft-label bars.",
        predictionQuestion:
          "When lambda gets larger, should the source A label weight go up or down?",
        observationPrompt:
          "Which surfaces changed when lambda moved?",
        takeaway:
          "Lambda is the target weight for source A. The complement, 1 - lambda, is the target weight for source B.",
      },
      {
        title: "Compare CutMix and MixUp",
        experiment:
          "Switch between CutMix and MixUp while keeping the same lambda. Compare the image preview with the soft-label vector.",
        predictionQuestion:
          "Should switching between CutMix and MixUp change the label formula if lambda stays the same?",
        observationPrompt:
          "What changed and what stayed the same after switching modes?",
        takeaway:
          "CutMix and MixUp mix pixels differently, but both produce soft labels from the same weighted-label idea.",
      },
      {
        title: "Read the loss",
        experiment:
          "Look at the weighted cross-entropy panel. Compare the two weights with the soft-label bars above it.",
        predictionQuestion:
          "Why should the loss include terms for both selected classes?",
        observationPrompt:
          "How did the loss terms match the mixed target vector?",
        takeaway:
          "A soft label asks the model to put probability mass on both classes, weighted by how much each source contributed.",
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
        takeaway:
          "Autograd computes gradients; an optimizer turns them into parameter moves, usually by stepping opposite the gradient.",
      },
    ],
  },
  "tensor-shape-broadcasting": {
    intro:
      "Work through four broadcasting experiments. Predict the output shape, edit one axis, compare a failure, then inspect how one output value maps back to reused input indices.",
    whyItMatters:
      "Broadcasting is why tensor libraries can combine batches, vectors, masks, and scalars without writing loops. It is powerful, but shape mistakes are common unless you can read the right-aligned axis rule.",
    openingMessage:
      "No tensor-library experience needed. We will treat shapes as rows of axis sizes.\n\n- Broadcasting aligns shapes from the right.\n- Each aligned axis is compatible if the sizes match or one side is 1.\n- A size-1 axis reuses the same value across the larger output axis.\n- Different non-1 sizes block the operation.\n\nFirst prediction: for A shape [2,3,1] and B shape [1,3,4], do you expect the operation to broadcast or fail? Reply with your prediction first. Then I will tell you exactly what to try.",
    masteryCriteria: [
      "Explains that broadcasting aligns shapes from the trailing axes.",
      "Uses same-size and size-1 rules to decide whether each axis is compatible.",
      "Derives the output shape from the maximum compatible size on each axis.",
      "Identifies that different non-1 sizes cause failure.",
      "Explains why a reused index becomes 0 along a size-1 axis.",
    ],
    steps: [
      {
        title: "Read the broadcast result",
        experiment:
          "Use the Stretches preset. Compare the A shape, B shape, verdict card, and output shape.",
        predictionQuestion:
          "For A=[2,3,1] and B=[1,3,4], should the operation broadcast or fail?",
        observationPrompt:
          "What output shape did the verdict show?",
        takeaway:
          "The output shape is built one aligned axis at a time after every axis passes the compatibility rule.",
      },
      {
        title: "Zip the axes",
        experiment:
          "Look at Zip Axes From The Right. Compare axis -3, axis -2, and axis -1 with the rule badges.",
        predictionQuestion:
          "Which axes should stretch, and which axis should stay the same?",
        observationPrompt:
          "How did the zipper explain [2,3,1] with [1,3,4]?",
        takeaway:
          "Broadcasting is a right-aligned axis check: same sizes pass, and size-1 axes stretch to the larger size.",
      },
      {
        title: "Find the failing axis",
        experiment:
          "Choose the Fails preset, then compare the verdict with Axis -3 Outcomes.",
        predictionQuestion:
          "When A axis -3 is 2, what should happen if B axis -3 becomes 3 or 4?",
        observationPrompt:
          "Which axis blocked the operation?",
        takeaway:
          "A mismatch only fails when both sizes are different and neither size is 1.",
      },
      {
        title: "Inspect one reused index",
        experiment:
          "Return to Stretches. In Inspect One Value, compare C[1,2,3] with A[1,2,0] and B[0,2,3].",
        predictionQuestion:
          "Why should one of the input indices become 0 when an axis has size 1?",
        observationPrompt:
          "Where did the blue 0 indices appear?",
        takeaway:
          "Broadcasting reuses values along size-1 axes, so the input index on that axis stays 0 while the output index changes.",
      },
    ],
  },
  "ai-concept-atlas": {
    intro:
      "Use the atlas for three short navigation experiments. Read one center-out branch, control how much detail is visible, and jump directly between distant concepts.",
    whyItMatters:
      "AI vocabulary is difficult because the field is not a flat list. A branching mind map gives every concept a clear learning home without turning the taxonomy into a web of crossing lines.",
    openingMessage:
      "No prior AI knowledge is required. Read the mind map from the blue Artificial Intelligence core outward. Each color-coded category owns subcategories, and those subcategories own increasingly specific concepts. A branch means ‘belongs under,’ not ‘must be learned first.’ Search automatically opens the ancestors of a result.\n\nFirst prediction: Transformer is selected. Which category and subcategory do you expect to contain it? Reply with your prediction first. Then I will tell you exactly what to try.",
    masteryCriteria: [
      "Reads a concept's path from Artificial Intelligence through its category and subcategory.",
      "Uses branch controls to reveal or hide local detail.",
      "Uses search to locate a concept and reveal its ancestor branch.",
      "Explains that a taxonomy branch shows category membership rather than prerequisite order.",
    ],
    steps: [
      {
        title: "Read one taxonomy branch",
        experiment:
          "Keep Transformer selected. Read the highlighted branch from the Artificial Intelligence core through Deep Learning and Attention & Transformers.",
        predictionQuestion:
          "Which category and subcategory do you expect to contain Transformer?",
        observationPrompt:
          "What parent-to-child sequence places Transformer in the taxonomy?",
        takeaway:
          "A taxonomy branch answers where an idea belongs: Artificial Intelligence → Deep Learning → Attention & Transformers → Transformer.",
      },
      {
        title: "Open one local branch",
        experiment:
          "Expand Value Learning, then collapse it. Finally use Search to find Q-learning and select the exact result.",
        predictionQuestion:
          "What detail do you expect the Value Learning branch to reveal?",
        observationPrompt:
          "What changed when you opened and closed the branch, and which ancestor path did Search reveal for Q-learning?",
        takeaway:
          "Progressive disclosure keeps a very large taxonomy navigable: local branch controls reveal detail where you need it, while Search opens the path to a result.",
      },
      {
        title: "Compare distant branches",
        experiment:
          "Search for Calibration and read its highlighted path. Then search for Sparse autoencoders and compare the two locations.",
        predictionQuestion:
          "Will Calibration and Sparse autoencoders share a category, a subcategory, or only the Artificial Intelligence core?",
        observationPrompt:
          "Which category and subcategory contained each concept?",
        takeaway:
          "Distant concepts can share the AI core while belonging to different category branches; the branch describes classification, not prerequisite order.",
      },
    ],
  },
} satisfies Record<string, TutorPlan>;
