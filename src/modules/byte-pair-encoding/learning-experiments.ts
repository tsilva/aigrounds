import { bpeScenarios, type BpeScenarioId } from "./scenario";

export type BpeState = { scenario: BpeScenarioId; merges: number };
export const bpeDefaults: BpeState = { scenario: "repetition", merges: 0 };
export const bpeTransferStart: BpeState = { scenario: "names", merges: 0 };
export const bpeTransferTarget: BpeState = { scenario: "names", merges: 2 };
export const bpeExperiments = [
  {
    title: "Merge frequent neighbors", baseline: bpeDefaults,
    target: { scenario: "repetition", merges: 1 } as BpeState,
    question: "At 0 merges, l + o and o + w each occur four times in training. Apply one merge. What can it change?",
    predictions: [{ id: "pair", label: "A most-frequent adjacent pair becomes one symbol" }, { id: "one", label: "Only one occurrence is changed" }, { id: "cross", label: "Pairs across separate words are joined" }],
    correctPrediction: "pair", action: "Choose Next merge once, from 0 to 1. Keep Repetition selected.",
    explanation: "What did the first training merge actually do?",
    explanations: [{ id: "all", label: "l + o became lo at all four matching training positions. The inspection loses one token; vocabulary grows from 28 to 29 symbols." }, { id: "one", label: "Only the first low in training changed, and the other three positions were skipped." }, { id: "meaning", label: "The model learned the meaning of low and joined complete words." }],
    correctExplanation: "all", retry: "Count the four training occurrences, including both copies of low. The learned rule also applies to lowest, but not to newer. Pairs stay within each word.",
    takeaway: "Training counts adjacent symbol pairs, including repeated words. A highest-frequency pair is replaced consistently. A tie needs a policy; frequency alone does not identify a unique next merge.",
  },
  {
    title: "A merge can leave text unchanged", baseline: { scenario: "repetition", merges: 5 } as BpeState,
    target: { scenario: "repetition", merges: 6 } as BpeState,
    question: "At 5 merges, lowest newer uses 8 tokens. The next training merge is low + </w>. Apply it. Must this inspection lose a token?",
    predictions: [{ id: "same", label: "No: the inspection can stay at 8 tokens" }, { id: "less", label: "Every merge must shorten every text" }, { id: "grow", label: "The inspection must gain a token because vocabulary grows" }],
    correctPrediction: "same", action: "Choose Next merge once, from 5 to 6. Keep Repetition selected.",
    explanation: "Why did training change while this inspection did not?",
    explanations: [{ id: "absent", label: "Training has low next to </w> twice. In lowest, low is followed by e, not </w>; neither inspection word has this pair. Vocabulary still grows from 33 to 34." }, { id: "bug", label: "The unchanged count means the merge did not run." }, { id: "longest", label: "BPE always chooses the longest available token, so training frequency is irrelevant." }],
    correctExplanation: "absent", retry: "Compare the exact adjacent symbols before the last training replacement, then inspect lowest newer. A learned rule has no effect where its exact pair is absent.",
    takeaway: "Vocabulary growth and token-count change measure different things. A merge can reduce training tokens while leaving a particular inspection unchanged. Fewer tokens do not prove better semantics or lower total memory use.",
  },
  {
    title: "Read a tie without inventing certainty", baseline: { scenario: "repetition", merges: 4 } as BpeState,
    target: { scenario: "repetition", merges: 5 } as BpeState,
    question: "At 4 merges, er + </w>, low + </w> and ne + w each have count 2. Does frequency alone tell you a unique winner?",
    predictions: [{ id: "tie", label: "No: all three are tied maxima" }, { id: "first", label: "Yes: the first displayed row must be the winner" }, { id: "rare", label: "Yes: a count-1 pair wins because it is rare" }],
    correctPrediction: "tie", action: "Choose Next merge once, from 4 to 5. Keep Repetition selected.",
    explanation: "Why was ne + w selected in this lab?",
    explanations: [{ id: "policy", label: "Its count 2 is tied for highest; the preset’s fixed tie preference chooses it. new then appears in newer, reducing the inspection from 9 to 8 tokens." }, { id: "unique", label: "Its count was uniquely larger than every other pair." }, { id: "word", label: "It was chosen because new is a meaningful word, regardless of frequency." }],
    correctExplanation: "policy", retry: "All three candidates had the same count. The learned-step record shows ne + w; ties use a declared fixed preference rather than a semantic judgment or display order.",
    takeaway: "The frequency maximum can contain several pairs. Different valid tie policies can learn different rules; this lab uses a fixed preset preference, then code-unit order as a fallback.",
  },
];
export const bpeToolbarScenarios = bpeScenarios.map(s => ({ id: s.id, label: s.label, shortLabel: s.shortLabel }));
export const bpeTutorPlan = {
  intro: "Three predict–try–explain experiments connect training pair counts, a no-change inspection and tied candidates, then transfer to Names.",
  whyItMatters: "BPE builds reusable text pieces from adjacent symbol frequencies. Comparing training replacements with another text shows why vocabulary size and token count can change differently.",
  openingMessage: `You need characters, adjacent pairs and counting. A token is one symbol or learned piece, and a corpus is training text. This is character-based, within-word BPE: a fixed alphabet a–z, = and </w> has 28 symbols covering every listed example. </w> is one word-end symbol, not four separate characters. Whitespace separates words and is not encoded; merges never cross words. This demonstration is not a byte-level or production tokenizer.

Three experiments compare training replacements, the effect on another text and tied frequencies, followed by a Names transfer. Use the Your prediction group first; a different prediction restores the baseline. Reset restarts the current experiment, including when your preferred answer was already checked. Next merge and Previous merge move by one; Merge steps offers a native slider and exact number field for prefixes 0 through 8. Scenario buttons select Repetition, Code-ish or Names and reset to 4 merges. Inspection examples use the learned rules without retraining.

Highest-frequency next pairs lists all tied maxima. Counts include duplicate training words. Ties use a fixed preset preference among maximum-frequency candidates, then code-unit order. Last training replacement shows before/after words; Current inspection and the two summaries show the effect elsewhere. Optional tables expose all original examples, current pair frequencies, applied rules and all merge-prefix counts. Vocabulary retains base symbols and unique learned pieces. Fewer tokens do not by themselves prove byte compression, memory savings or semantic understanding.

Experiment 1 starts Repetition at 0 merges. l + o and o + w each occur four times in training. Before choosing Next merge, predict: does a rule replace a frequent adjacent pair consistently, only one occurrence, or pairs across words? Share your prediction here or in the rail.`,
  masteryCriteria: ["Counts within-word adjacent pairs across repeated training occurrences and recognizes ties.", "Separates training replacements from the effect of applying ordered rules to other text.", "Compares actual vocabulary growth with an inspection-token plateau.", "Explains transfer using learned pieces and an explicit base alphabet."],
  steps: [...bpeExperiments.map((e, i) => ({ title: e.title, experiment: `Use Reset, choose a Your prediction answer. ${e.action} Explain, then ${i === 2 ? "Try the transfer check" : "Next experiment"}.`, predictionQuestion: e.question, observationPrompt: e.explanation, takeaway: `${e.takeaway} Worked evidence: ${e.explanations[0].label}` })), { title: "Apply rules to a new whole word", experiment: "The transfer restores Names at 0. Set Merge steps to 2, open Compare original examples, then answer Transfer explanation. Reset restores Names at 0. Explain before Explore freely.", predictionQuestion: "Which text reuses the learned rules: annabel or max? Does inspecting it retrain BPE?", observationPrompt: "Read both token sequences and compare their counts with 0 merges.", takeaway: "The learned rules a + n and an + n form ann. annabel is ann a b e l </w>, 6 tokens instead of 8; max stays m a x </w>, 4 tokens. The known alphabet covers both. Vocabulary is 30; the inspection does not retrain, and pieces do not imply semantic understanding." }],
};
