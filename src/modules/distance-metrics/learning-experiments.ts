const choices = (...labels: string[]) => labels.map((label, i) => ({ id: String(i), label }));
export const distanceExperiments = [
  {
    title: "Change the rule, keep the points",
    question: "At query (0,0), Euclidean chooses B. Will Manhattan choose the same nearest case?",
    predictions: choices("No. The distance rule can change which case is closest.", "Yes. Nearest must be independent of the metric.", "Changing metric gives the query a true label."),
    action: "Keep Metric disagreement and query (0,0). Choose Manhattan under Distance metric. Compare the nearest case and Case distances and decisions.",
    explanation: "What changed the decision?",
    explanations: choices(
      "Euclidean gives B sqrt(3²+3²) ≈ 4.242641, smaller than A’s 5. Manhattan gives B 3+3 = 6, larger than A’s 0+5 = 5. The same query and references yield B/Square under Euclidean and A/Circle under Manhattan. The numerical rule changed; no accuracy comparison or true query label follows.",
      "Manhattan moved A closer by changing its stored coordinates.",
      "A smaller minimum distance proves that metric predicts the true class more accurately.",
    ),
    retry: "Compare A and B using the same coordinate differences. Euclidean takes the square root of the sum of squares; Manhattan sums absolute differences. These are different rules, not changed examples or evidence of accuracy.",
    takeaway: "Closest is relative to a chosen distance rule. A metric-only change can change a one-neighbor decision while every point stays fixed.",
  },
  {
    title: "Move the query, keep the references",
    question: "Under Manhattan, move query (0,0) to (4,1). Must A remain the nearest case?",
    predictions: choices("No. Moving the query changes its differences from each fixed reference.", "Yes. A’s label fixes the query’s decision everywhere.", "Moving the query retrains all reference labels."),
    action: "Keep Metric disagreement and Manhattan. Set Query X to 4, then Query Y to 1. You can also drag the query diamond to (4,1). Inspect every case’s distance.",
    explanation: "Why is B now nearest?",
    explanations: choices(
      "At (4,1), Manhattan distances to A, B, C and D are 8, 3, 12 and 5. B’s |4−3|+|1−3| = 1+2 = 3 is uniquely smallest, giving the toy Square decision. Only query coordinates changed; the four reference identities, coordinates and labels remain fixed.",
      "B became nearest because its label was retrained from Circle to Square.",
      "B’s distance 3 is a 30% probability that the query’s true class is Square.",
    ),
    retry: "Subtract the new query coordinates from each fixed case, take absolute differences, then add. Distance is not a probability. The query has no known true label in this toy.",
    takeaway: "A one-neighbor rule assigns the unique nearest reference’s label. Moving a query changes distances, without changing the references or establishing prediction quality.",
  },
  {
    title: "Keep an exact tie visible",
    question: "Tie boundary starts at query (4,5) with Euclidean. Move Query X to 5. Must there still be one unique nearest case?",
    predictions: choices("No. A and B can be equally close.", "Yes. The first case in the list must win.", "Equal distance means A and B are the same case."),
    action: "Keep Tie boundary, Euclidean and Query Y 5. Set Query X to 5, or focus the query diamond and press Right once. Inspect both nearest cases and the decision policy.",
    explanation: "How does this lesson handle the tie?",
    explanations: choices(
      "At (5,5), A (2,5) and B (8,5) are both distance 3; C and D are distance 4. A/Circle and B/Square remain distinct identities. This lesson shows both nearest cases and withholds a class decision whenever the nearest neighbor is nonunique. Another system could declare a different tie policy; list order is not used here.",
      "A must win because its ID comes first, so the tie has no effect.",
      "The two nearest cases each have exactly 50% true-class probability.",
    ),
    retry: "Compare exact squared distances before square roots: A and B both have 9. Their coordinates and labels remain distinct. An explicit tie policy is needed; this toy withholds a decision rather than picking by order or claiming probabilities.",
    takeaway: "Exact ties are a decision boundary, not permission to silently choose a winner. The metric and the tie policy are separate parts of a nearest-neighbor rule.",
  },
];
export const distanceTutorPlan = {
  intro: "Three experiments compare two distance rules, move a query and expose an exact nearest-neighbor tie. A coincident-case transfer checks identity and zero distance.",
  whyItMatters: "Nearest-neighbor decisions depend on representation, distance and tie policy. Geometry makes those dependencies observable without claiming a universally best metric.",
  openingMessage: "Prerequisites: Cartesian x/y coordinates, absolute differences, squares, square roots and choosing the smallest number. This finite toy has one query with integer Query X and Query Y from 0 to 10 and four fixed labeled reference cases A..D. Circle class uses teal circles, Square class uses orange squares; the movable query is a hollow indigo diamond with no true class label. Both axes have the same numerical weight and the plot uses equal x/y scale. Euclidean = sqrt(dx²+dy²); Manhattan = |dx|+|dy|. Here dx and dy in the table are absolute coordinate differences. Euclidean can be drawn as a straight segment. Manhattan paths show one horizontal-then-vertical route of length |dx|+|dy|; other shortest grid routes may exist, and no obstacles are modeled.\n\nDistance metric has Euclidean and Manhattan buttons. Drag the query diamond, use Query X/Query Y native number editors and sliders, or focus the diamond and use arrow keys. Right/Left change x; Up/Down increase/decrease y. Shift moves two grid units; Home sets (0,0), End sets (10,10). Enter or a click without dragging focuses Query X. Edits are clamped and rounded to integer 0..10. Reference points are fixed and not draggable. Scenario changes preserve metric and query. Prediction changes and Reset restore the current experiment baseline; free exploration Reset starts Experiment 1. Edits clear stale explanations and transfer completion.\n\nOne-nearest-neighbor (1-NN) means find the reference case with minimum chosen distance and use its stored label when the minimum is unique. Every exact nearest tie is retained. This lesson’s declared policy withholds a class decision for any nonunique nearest neighbor, even if tied labels happen to agree. This is a pedagogical policy, not a universal library rule: implementations may depend on ordering or use another declared tie-break. Euclidean ties are compared with integer squared distances before rounding/square roots, Manhattan with integer absolute sums. Rounded displayed distances do not determine ties. Distances are not class probabilities; no true query label, accuracy measurement, training optimization or best-metric selection is available.\n\nMetric disagreement has A (0,5) Circle, B (3,3) Square, C (8,9) Circle, D (9,1) Square. Experiment 1 starts Euclidean query (0,0): B sqrt(18)=4.242641 is nearer than A 5. Change only Distance metric to Manhattan: A 5 is nearer than B 6. C and D do not win. Case IDs, labels, coordinates and query stay fixed. The class decision changes Square to Circle, without accuracy evidence.\n\nExperiment 2 starts Metric disagreement, Manhattan query (0,0). Set Query X 4 then Query Y 1 (or drag to (4,1)): distances A 8, B 3, C 12, D 5. B is uniquely nearest; the toy decision is Square. References stay fixed; moving the query changes its differences. No class probability follows from 3.\n\nTie boundary has A (2,5) Circle, B (8,5) Square, C (5,9) Circle, D (5,1) Square. Experiment 3 starts Euclidean query (4,5), where A alone is nearest at 2. Set Query X 5 with Query Y 5: A/B both distance 3, C/D both 4. Both nearest rings/paths stay visible and the class decision is withheld. Query Right also performs this one-unit move.\n\nThe plot groups coincident reference markers without merging identities: a combined circle/square glyph is labeled A/B, and both cases remain separate rows and nearest IDs. Case distances and decisions is an optional keyboard-scrollable exact table with IDs, coordinates, stored class, absolute x/y differences, both distances and nearest status. Summaries show nearest IDs, minimum chosen distance and the declared 1-NN decision. All marks derive from full-precision engine values; six-decimal table displays and three-decimal summaries are rounded.\n\nTransfer uses Coincident cases and a requested query/metric; do not reveal transfer distances or winner before the learner tries it. The general fact that zero distance does not erase identity is within scope. This lesson does not implement k>1 votes, arbitrary reference editing, learned weights, rescaling, obstacle routes, probabilities, model training/evaluation or decision-region heatmaps. Metric choice is task dependent; neither Euclidean nor Manhattan is universally more correct.",
  masteryCriteria: ["Reconstructs both distances from the same coordinate differences.", "Explains metric-only and query-only changes without changing reference identity.", "Separates nearest label decisions from probabilities and accuracy.", "Handles exact ties and coincident cases with an explicit policy."],
  steps: distanceExperiments.map(e => ({ title: e.title, experiment: e.action, predictionQuestion: e.question, observationPrompt: e.explanation, takeaway: e.takeaway })),
};
