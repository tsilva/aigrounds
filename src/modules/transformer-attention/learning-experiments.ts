import { attentionScenarios, type AttentionScenarioId } from "./scenario";
export type AttentionState = { scenario: AttentionScenarioId; query: string; sharpness: number };
export const attentionDefaults: AttentionState = { scenario: "river-bank", query: "bank", sharpness: 1.9 };
export const attentionTransferStart: AttentionState = { scenario: "money-bank", query: "cash", sharpness: 0.6 };
export const attentionTransferTarget: AttentionState = { ...attentionTransferStart, sharpness: 3.2 };
export const attentionExperiments = [
  {
    title: "Change the query", baseline: attentionDefaults,
    target: { ...attentionDefaults, query: "the" },
    question: "Keep River Bank and sharpness 1.9. Change Query token from bank to The. What can change?",
    predictions: [{ id: "routing", label: "Scores and weights change; keys and values stay fixed" }, { id: "replace", label: "Every key and value is replaced" }, { id: "self", label: "Only the selected token can receive weight" }],
    correctPrediction: "routing", action: "Set Query token to The. Keep River Bank and Attention sharpness at 1.9. Open Q, K and V arithmetic to inspect the stored vectors and scores; compare with Weighted value contributions.",
    explanation: "What changed in this lookup?",
    explanations: [{ id: "q", label: "The selected query changed the dot products and weights. The now has the largest weight, about 22.92%, but every fixed value still contributes." }, { id: "self", label: "The receives 100%, so the output copies only its own value." }, { id: "learn", label: "Selecting The trained new keys and values for every token." }],
    correctExplanation: "q", retry: "Read all six positive weights and the Q/K/V arithmetic. Query selection chooses an existing Q; K and V do not change within this fixture.",
    takeaway: "Queries route a lookup by comparing with keys. Changing Q changes scores and weights, without changing the stored keys or values. Largest weight does not mean most of the total weight.",
  },
  {
    title: "Sharpen without changing rank", baseline: { ...attentionDefaults, sharpness: 0.6 },
    target: { ...attentionDefaults, sharpness: 3.2 },
    question: "For River Bank, query bank, raise sharpness from 0.6 to 3.2. Can this positive multiplier make a lower score overtake the highest?",
    predictions: [{ id: "rank", label: "No: ranking stays the same while weights become less uniform" }, { id: "swap", label: "Yes: the highest-score token must change" }, { id: "one", label: "The highest-score token must receive 100%" }],
    correctPrediction: "rank", action: "Choose High, or set Attention sharpness to 3.2. Keep River Bank and query bank.",
    explanation: "How did sharpness change the distribution?",
    explanations: [{ id: "spread", label: "river stays highest. Its weight rises from 19.42% to 34.21%; entropy falls from 1.78778 to 1.67078 nats. All weights stay positive." }, { id: "keys", label: "Sharpness changes the key vectors, so score order reverses." }, { id: "copy", label: "High discards all other values and copies river alone." }],
    correctExplanation: "spread", retry: "A positive common multiplier preserves score order. Compare the same river lane and raw entropy at Low and High; no token has a zero weight.",
    takeaway: "Sharpness multiplies scaled scores before softmax, equivalent to temperature 1/sharpness. It changes concentration, not ranking. High in this lab is still a mixture.",
  },
  {
    title: "Mix values, not a winning key", baseline: attentionDefaults,
    target: { ...attentionDefaults, query: "river" },
    question: "Change Query token to river at sharpness 1.9. river has the largest weight. Must the output equal its key or its value?",
    predictions: [{ id: "mix", label: "Neither: the output is the weighted sum of all values" }, { id: "key", label: "The highest-weight key becomes the output" }, { id: "value", label: "The highest-weight value becomes the output unchanged" }],
    correctPrediction: "mix", action: "Set Query token to river. Keep River Bank and Attention sharpness at 1.9. Read the Weighted value contributions table.",
    explanation: "Where does the mixed output come from?",
    explanations: [{ id: "sum", label: "Sum every weight × V row. The Shore feature is 0.48363, not river’s V of 1. Keys choose weights; values supply the mixed content." }, { id: "key", label: "The output averages the keys and ignores the values." }, { id: "prob", label: "The three output features are class probabilities that must sum to 1." }],
    correctExplanation: "sum", retry: "The contribution table multiplies each value by its weight, then adds rows. The feature axes use arbitrary toy units; only the six attention weights must sum to 1.",
    takeaway: "Attention computes Σ weight × V, not a winning key or an unchanged winning value. Each output feature lies between the input values for that feature; these features are not probabilities.",
  },
  {
    title: "Compare fixtures honestly", baseline: attentionDefaults,
    target: { scenario: "money-bank", query: "bank", sharpness: 1.9 } as AttentionState,
    question: "Switch River Bank to Money Bank with query bank and sharpness 1.9. These presets change Q, K and V. Can the output change prove that context alone caused it?",
    predictions: [{ id: "fixture", label: "No: several hand-authored inputs changed together" }, { id: "context", label: "Yes: only the surrounding words changed" }, { id: "learn", label: "Yes: the model trained itself during the switch" }],
    correctPrediction: "fixture", action: "Choose Money Bank. Keep Query token bank and Attention sharpness 1.9. Open Compare the two fixtures.",
    explanation: "What does this comparison establish?",
    explanations: [{ id: "inputs", label: "Money Bank gives cash the largest weight (27.16%) and Finance feature 0.45400. Different Q/K/V produce a different weighted mix; this is not a controlled test of context alone." }, { id: "causal", label: "The bank query and all keys/values stayed identical, proving a context-only effect." }, { id: "understands", label: "The output proves the model understands both meanings of bank." }],
    correctExplanation: "inputs", retry: "Compare the bank query vectors: [0.95, 0.08, 0.18] versus [0.08, 0.95, 0.20]. Keys and values also differ. No learning occurs in this toy.",
    takeaway: "Fixture switches illustrate the same attention calculation on different inputs. They do not isolate context, show learned word meanings or prove causal importance.",
  },
];
export const attentionToolbarScenarios = attentionScenarios.map(s => ({ id: s.id, label: s.label, shortLabel: s.shortLabel }));
export const attentionTutorPlan = {
  intro: "Four experiments separate query routing, softmax concentration, value mixing and fixture comparison, followed by a new-query transfer.",
  whyItMatters: "Attention lets a query build a weighted lookup over stored values. Seeing scores, normalized weights and exact contributions separates where content is read from what is read.",
  openingMessage: `You need multiplication, addition and weighted averages. Q is a query, K is a key to compare with it, and V is the content to mix. A dot product multiplies matching coordinates and adds them. This toy uses score = Q·K/√3, then sharpness × score. Softmax turns these into positive weights that sum to 1. The output adds weight × V from every modeled token.

These are hand-authored three-dimensional vectors, not learned word meanings. One unmasked head sees every modeled token, including itself and later positions. The River Bank sentence is illustrative: its six-token toy omits the second the. This is not a full tokenizer or Transformer block. Shore, Finance and Glue features use arbitrary toy units, not class probabilities.

Use a Your prediction answer, then manipulate the workbench and explain. A different prediction restores the current baseline; Reset restarts the current experiment, including if your preferred answer was already checked. Query token selects an existing Q. Attention sharpness has a slider and exact number field, with Low/Mid/High at 0.6/1.9/3.2. A scenario button changes the whole fixture, selects bank and preserves sharpness.

Weights share a 0–100% scale. Largest weight is not necessarily a majority. Entropy measures spread in nats: lower means less uniform. Weighted value contributions exposes all six source values, products and their sum. Optional Q/K/V arithmetic explains the scores; Compare the two fixtures keeps the multiplier fixed while showing different inputs.

Experiment 1 starts at River Bank, query bank, sharpness 1.9. Predict what can change when Query token becomes The: routing weights, all stored keys/values, or only self weight? Share your prediction here or in the rail.`,
  masteryCriteria: ["Separates Q/K routing from V content and uses exact contributions.", "Explains positive sharpness preserving ranking while changing concentration.", "Distinguishes a largest weight from majority and toy features from probabilities.", "Recognizes hand-authored fixture comparisons as changing multiple inputs."],
  steps: [...attentionExperiments.map((e, i) => ({ title: e.title, experiment: `Use Reset and choose a Your prediction answer. ${e.action} Explain before ${i === 3 ? "Try the transfer check" : "Next experiment"}.`, predictionQuestion: e.question, observationPrompt: e.explanation, takeaway: `${e.takeaway} Worked evidence: ${e.explanations[0].label}` })), { title: "Transfer to query cash", experiment: "The transfer starts Money Bank, Query token cash, Attention sharpness 0.6. Predict the effect of increasing it, then set it to 3.2 and answer Transfer explanation. Reset restores the transfer starting state.", predictionQuestion: "Must a higher sharpness change the highest-score token or select its value alone?", observationPrompt: "Compare cash’s weight, entropy and Finance feature at Low and High.", takeaway: "cash stays highest; its weight rises from 20.07% to 38.83%, still below half. Finance feature rises from 0.37811 to 0.56743, not the cash value 1. All values remain in the mixture; only sharpness changed." }],
};
