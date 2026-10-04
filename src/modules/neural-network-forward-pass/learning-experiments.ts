const choices = (...labels: string[]) => labels.map((label, i) => ({ id: String(i), label }));
export const forwardExperiments = [
  {
    title: "Follow an upstream weight",
    question: "Start Baseline. If the x2 → H1 weight rises from 0.5 to 1, do both class scores change? Does the input itself change?",
    predictions: choices("Both scores change, but Class A stays highest. Inputs remain fixed.", "Only Class A changes because one weight changed.", "The input x2 changes from 2 to 1."),
    action: "Choose x2 → H1 under Weight edge. Set Weight value to 1. Trace its contribution, H1's sum and ReLU output, then both class scores.",
    explanation: "How did one upstream weight reach both scores?",
    explanations: choices("x2 stays 2. Its contribution rises 1→2; H1's sum and ReLU output rise 1→2. H1 feeds both scores: Class A rises 1→2, while Class B falls −1→−2. Class A stays highest. This forward recomputation does not train the weights.", "Only the directly connected hidden node can change, so both class scores stay unchanged.", "The input was replaced by the weight, so x2 became 1."),
    retry: "Multiply the unchanged source by the edited weight. Apply H1's fixed bias and ReLU, then use that hidden output in both output rows.",
    takeaway: "One upstream weight can affect several downstream scores. A changed score need not change which class has the highest score.",
  },
  {
    title: "Change a sum that stays clipped",
    question: "Start Baseline again. Lower x2 → H2 from 1 to 0.5. H2's sum moves below zero. Must its output and the class scores change?",
    predictions: choices("The hidden sum changes, but ReLU output stays 0 and both scores stay unchanged.", "Every changed weight necessarily changes every output score.", "H2 sends its negative sum directly to both scores."),
    action: "Choose x2 → H2 under Weight edge. Set Weight value to 0.5. Compare H2's sum with its ReLU output, then check the scores.",
    explanation: "Which changed value was clipped?",
    explanations: choices("The x2 contribution falls 2→1. H2's sum changes 0→−1 after its fixed −1 bias, but ReLU gives max(0,−1)=0. The output layer still receives H2=0, so the scores remain 1 and −1. A hidden sum is different from the activation sent onward.", "ReLU sends −1 onward, so Class B must win.", "The weight did not actually change because the highest class stayed the same."),
    retry: "Read the Sum and Output columns separately. The next layer consumes max(0,sum), not a negative hidden sum.",
    takeaway: "A parameter can change a hidden sum while leaving the forward output unchanged because ReLU clips that sum to zero.",
  },
  {
    title: "Change one final score",
    question: "Start Baseline again. Raise H1 → Class B from −1 to 1.5. Does this output-layer edit change the hidden activations or Class A's score?",
    predictions: choices("Only Class B's score changes; it becomes highest while hidden activations and Class A stay fixed.", "All inputs and hidden activations must change.", "Negative class scores are impossible, so the starting network is invalid."),
    action: "Choose H1 → Class B under Weight edge. Set Weight value to 1.5. Compare both hidden activations and both raw scores.",
    explanation: "Why did the highest score switch?",
    explanations: choices("Hidden outputs stay H1=1, H2=0. Class A stays 1. Class B becomes 1×1.5+0×1=1.5, so it is highest. Output scores are raw weighted sums and may be negative or exceed 1; 1.5 is not a probability or accuracy measure.", "Class B has a 150% probability, proving the model is accurate.", "H1 became 1.5 before the output layer, so both scores must change."),
    retry: "The edited edge follows H1. Keep its source value separate from its new weight. Compare raw scores without interpreting them as probabilities.",
    takeaway: "An output-edge weight affects its destination score directly. Forward scores alone do not establish probabilities, training or accuracy.",
  },
];
const reference = `Tiny authored 2→2→2 network, fixed inputs x1=1,x2=2; hidden biases -1,-1; output biases0. Eight editable weights -2..2 step.25 stored units/4. Baseline order x1→H1=1,x2→H1=.5,x1→H2=-1,x2→H2=1,H1→ClassA=1,H2→ClassA=-1,H1→ClassB=-1,H2→ClassB=1. Hidden z1=x1*w0+x2*w1-1,z2=x1*w2+x2*w3-1; h=max(0,z). Output A=h1*w4+h2*w5, B=h1*w6+h2*w7, no output ReLU/softmax. Baseline z[1,0],h[1,0],scores[1,-1],ClassA highest. Alloff preset w0=-1,w1=0 -> z[-2,0],h[0,0],scores[0,0],Tie no unique highest. Bothactive preset w2=1 -> z[1,2],h[1,2],scores[-1,1],ClassB highest. Weight edge selection changes highlight only, never numeric state/stale checks. Actual weight edit clears explanations/transfer, no-op and selection preserve. Reset or prediction restores Baseline current experiment, selected target edge; free Reset begins step1. Graph arrows fixed geometry show connections not weight magnitude; dashed thicker purple selected edge with exact current weight label; one named select+range/exact field, no graph drag. Exactfourrow terms/sum/activation table; ClassA/B raw scores may negative or>1. No training, gradients, accuracy, learned representation or calibratedprobability claimed. Fixedbias separates sum from activation. Targets1edge1value1 ->z[2,0],h[2,0],scores[2,-2];2edge3value.5->z[1,-1],h[1,0],scores[1,-1];3edge6value1.5->h[1,0],scores[1,1.5]. Do not leak transfer exact answer before attempt; give general multiply/add/bias/ReLU/downstream principles. Reply briefly with readable bullets.`;
export const forwardTutorPlan = {
  intro: "Trace weighted contributions through a hidden activation layer to raw class scores.",
  whyItMatters: "A forward pass computes what a network outputs from its current inputs and parameters. Following each contribution separates a weight, hidden sum, activation and final score.",
  openingMessage: "This tiny network has fixed inputs x1=1 and x2=2. Each hidden node multiplies inputs by its incoming weights, adds a fixed bias of −1, then applies ReLU=max(0,sum). The next layer multiplies those hidden outputs by its weights and adds them into Class A and Class B scores. Those scores are raw numbers, not probabilities.\n\nChoose an edge with Weight edge, then edit Weight value. The dashed purple edge is selected; changing selection alone does not change the network. The exact table shows every multiply/add calculation.\n\nStart Baseline. Predict what happens when x2 → H1 rises from 0.5 to 1, then trace its contribution through both scores. No training is performed.",
  masteryCriteria: ["Traces source times weight, bias, ReLU and output sum in order.", "Separates an upstream change from a direct output-edge change.", "Explains a changed hidden sum with unchanged clipped output.", "Reconstructs a new forward path without probability or accuracy claims."],
  steps: forwardExperiments.map((e, i) => ({ title: e.title, experiment: e.action, predictionQuestion: e.question, observationPrompt: e.explanation, takeaway: e.takeaway + (i === 0 ? "\n\nReference only; do not recite or leak transfer:\n" + reference : "") })),
};
