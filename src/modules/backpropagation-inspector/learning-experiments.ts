import type { BackpropCaseId } from "./scenario";

export type BackpropExperiment = {
  title: string;
  caseId: BackpropCaseId;
  question: string;
  predictions: { id: string; label: string }[];
  action: string;
  instruction: string;
  explanations: { id: string; label: string }[];
  recovery: string;
  takeaway: string;
};

export const backpropExperiments: BackpropExperiment[] = [
  {
    title: "Which gradient is larger?", caseId: "case-a",
    question: "h1 is 0.80 and h2 is 0.35. Which output weight will have the larger absolute gradient?",
    predictions: [{ id: "first", label: "Weight 1" }, { id: "second", label: "Weight 2" }, { id: "equal", label: "Equal sizes" }],
    action: "Reveal gradients", instruction: "Compare the two weight gradients in Backward. Absolute means size, ignoring the sign.",
    explanations: [{ id: "correct", label: "Each activation multiplies the same output gradient." }, { id: "weight", label: "The weight with the larger value always gets the larger gradient." }, { id: "equal", label: "One shared loss means all weights get equal gradients." }],
    recovery: "Compare the multipliers in dL/dw1 and dL/dw2. Is each multiplier an activation or a weight?",
    takeaway: "dL/dw = h × (p − y). A larger nonnegative activation gives a larger absolute weight gradient when the output gradient is shared.",
  },
  {
    title: "Flip only the target", caseId: "case-b",
    question: "The activations and weights are unchanged, but the target is now 0. Should a gradient-descent step raise or lower both weights?",
    predictions: [{ id: "up", label: "Raise both weights" }, { id: "down", label: "Lower both weights" }, { id: "opposite", label: "Move them in opposite directions" }],
    action: "Preview update", instruction: "Compare Gradient and Change in the table with ∇W L and ΔW below, then the loss before and after one step.",
    explanations: [{ id: "sign", label: "A negative weight must always become more positive." }, { id: "correct", label: "p − y is positive, so subtracting each positive gradient lowers its weight." }, { id: "loss", label: "Backprop changes the target to match the prediction." }],
    recovery: "The sign of the existing weight is not the sign of its gradient. Use change = −η × gradient, and check both Change values.",
    takeaway: "For target 0, p − y is positive. With positive activations, both weight gradients are positive and gradient descent lowers both weights, reducing p and this example’s loss.",
  },
  {
    title: "Gradient or step size?", caseId: "case-b",
    question: "Increase the learning rate η from 0.10 to 0.50 for the same starting weights. What should change?",
    predictions: [{ id: "gradient", label: "The gradients get five times larger" }, { id: "step", label: "The changes get five times larger; gradients stay the same" }, { id: "nothing", label: "Neither changes" }],
    action: "Set learning rate to 0.50", instruction: "Compare the unchanged gradients with the changes at η = 0.10 and η = 0.50 in the table and matrix rows.",
    explanations: [{ id: "correct", label: "Backprop computes gradients; the learning rate scales the optimizer’s step." }, { id: "gradient", label: "The learning rate is part of the gradient formula." }, { id: "always", label: "A larger learning rate always guarantees better training." }],
    recovery: "Find η in the formulas. It appears in change = −η × gradient, not in h × (p − y). This is one fixed example, not a guarantee about all training.",
    takeaway: "For the same starting state, η scales the update, not the gradients. A new forward/backward pass after actually changing weights would generally produce new gradients.",
  },
  {
    title: "Two kinds of gradients", caseId: "case-c",
    question: "Both activations are 0.90, but w1 is positive and w2 is negative. Will the signals passed back to h1 and h2 have the same or opposite signs?",
    predictions: [{ id: "same", label: "Same signs" }, { id: "opposite", label: "Opposite signs" }, { id: "zero", label: "Both zero" }],
    action: "Reveal hidden signals", instruction: "Compare equal weight gradients with dL/dh1 and dL/dh2 in How gradients reach the hidden layer. Their matrix forms sit directly below.",
    explanations: [{ id: "equal", label: "Equal activations make every kind of gradient equal." }, { id: "update", label: "These signals are the updates to the hidden weights." }, { id: "correct", label: "Weight gradients multiply by h; hidden-activation signals multiply by w." }],
    recovery: "Compare dL/dw = h × (p − y) with dL/dh = w × (p − y). To reach an earlier weight, you would still need that layer’s local derivative.",
    takeaway: "Equal activations give equal output-weight gradients here. Opposite signed output weights give opposite hidden-activation signals. Those signals are inputs to the next backward calculation, not hidden-weight updates.",
  },
];
