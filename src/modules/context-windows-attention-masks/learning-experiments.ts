import { experimentChoices as choices } from "@/lib/experiment-choices";
export const maskExperiments = [
  {
    title: "Read the causal row",
    question: "From Early slice, change Query token from 4 · on to 2 · cat. Which keys remain eligible?",
    predictions: choices("Keys 1 and 2, including the query itself.", "All four keys in the window.", "Only key 1; a query can never use itself."),
    action: "Choose 2 · cat under Query token. Read its highlighted row: query tokens are rows, key tokens are columns.",
    explanation: "Why do only these two keys pass?",
    explanations: choices("The window contains positions 1–4, but causal requires key position ≤ query position. Query 2 permits key 1 and itself at 2; keys 3 and 4 are future keys. Allowed means eligible, not a measured attention weight.", "A check means the model gives that key attention weight 1.", "Query 2 can use every in-window key because window inclusion overrides causal direction."),
    retry: "Read across row 2. Window inclusion and causal direction must both hold; causal includes self. This demo computes no attention weights.",
    takeaway: "Causal eligibility includes past and self. A window sets availability; direction can further remove keys.",
  },
  {
    title: "Slide away past context",
    question: "Start Early slice again, with query 4 · on. Move Window start from 1 to 3, keeping Window length 4. Do old past keys stay available?",
    predictions: choices("Only keys 3 and 4 remain eligible; keys 1 and 2 leave the window.", "All keys 1–4 remain because they are not future keys.", "All keys 3–6 become eligible because they enter the new window."),
    action: "Set Window start to 3. Keep Window length 4 and Query token 4 · on. Compare keys 1–2 with 5–6 in the highlighted row and its reason table.",
    explanation: "Which rule removed each pair?",
    explanations: choices("Window 3–6 removes keys 1–2, even though they are past. Keys 5–6 are in the window but future to query 4, so causal blocks them. Keys 3–4 pass both conditions. The query stays at global position 4.", "Sliding a window renumbers query 4 as position 2 and restores all old past keys.", "Being in the past is enough to override window exclusion."),
    retry: "Global positions never change. A key must be available in the slice and satisfy direction. Sliding does not move the selected query.",
    takeaway: "Past context outside the chosen slice is unavailable. Entering a window does not bypass a causal mask.",
  },
  {
    title: "Separate padding from direction",
    question: "Choose Padding contrast: window 3–8, query 6 · mat, Bidirectional and Exclude padding keys. Change Padding keys to Allow. Which keys become eligible?",
    predictions: choices("Padding keys 7 and 8 join real keys 3–6.", "Nothing changes: direction blocks future keys in every mode.", "Allow padding automatically enables padding query rows too."),
    action: "Choose Padding contrast, then choose Allow under Padding keys. Read row 6 and the selected-query reasons. Bidirectional permits future keys in this deliberate comparison.",
    explanation: "What changed, and what did not?",
    explanations: choices("All six keys 3–8 pass: Bidirectional allows both directions, and Allow removes padding-key exclusion. The demo still excludes padding query rows by a separate explicit policy. This shows permission only; it computes no model outputs or attention weights.", "A padding-key mask alone always excludes padding query rows in every attention implementation.", "Padding keys get attention weight 1 because their cells show checks."),
    retry: "Key exclusion and query policy are different. This demo separately excludes padding queries. A permission mask does not determine attention weights.",
    takeaway: "Padding-key exclusion is independent of directional exclusion. Removing one condition does not automatically remove another.",
  },
];
const reference = `Illustrative global sequence 1The,2cat,3sat,4on,5the,6mat,7PAD,8PAD. Window is ONE shared global slice start1..9-length,length1..8. Query selector real1..6 only; queries do not move or renumber after window edits; length clamps start only. Selected query outside slice inactive: no eligible keys and no invented attention result. Padding query rows7/8 always excluded by separate demo policy, not key-padding mask alone. An active real query permits key iff key inwindow AND (paddingAllow OR key<=6) AND (Bidirectional OR key<=query). Causal selfinclusive, squares lowertriangular; Bidirectional future allowed deliberatecontrast. First failing reason priority: paddingquery,queryoutside,keyoutside,paddingkey,futurekey,Allowed; multipleconditions canblock. Check meanseligible permission, NEVER attentionweight1/guaranteednonzero/use/output. No weights/softmax/vectors/predictions/training/tokenizer/contextcapacity/KVcache. No rolling localband claim. Semantic labels notlibrarybooleanvalues: PyTorchMHAbooleanTrueblocks,SDPATrueallows. Early slice start1length4query4causalexclude: keys1,2,3,4 count4past3self1future0. Later slice start3length4query6causalexclude keys3,4,5,6. Padding contrast start3length6query6bidirectionalexclude keys3,4,5,6. Step1Earlyquery2 keys1,2past1self1future0. Step2Earlystart3query4 keys3,4past1self1future0; keys1/2outside,5/6future. Step3PaddingcontrastAllow keys3..8count6past3self1future2. Reset/predictionsEarlycurrentexperiment; actual state change includingquery clears staleexplanation/transfer;noops preserve. Transfer has learner choosePaddingcontrastthenAllowandCausal; do not leak exact transferkeyset/count beforeattempt, explain general intersection instead. Every row/column global1..8 fixed. Real context windows vary acrossarchitectures; this is an eligibility demo only. Replies readable prose, no tools/code/toolmarkup, no dense tables.`;
export const maskTutorPlan = {
  intro: "Intersect context availability, attention direction and padding-key exclusion.",
  whyItMatters: "A token can use only eligible keys. Separating the reasons for exclusion prevents confusing context availability with attention weight.",
  openingMessage: "This lab has eight illustrative sequence slots: six real tokens and two <PAD> fillers. A query is the token seeking context; a key is a candidate token it may use. Read queries down the rows and keys across the columns. A check means allowed, not an attention weight.\n\nWindow start and Window length choose one shared slice of the fixed global positions. Causal permits past and self; Bidirectional also permits future keys in this comparison. Padding keys controls only padding-key eligibility. Padding query rows are separately excluded by demo policy. A query outside the slice is inactive and has no eligible keys. No real model, weights or predictions run here.\n\nStart Early slice. Predict which keys remain if Query token changes from 4 · on to 2 · cat, then choose that query and read its highlighted row.",
  masteryCriteria: ["Reads query rows and key columns with self-inclusive causal direction.", "Intersects window, direction and padding conditions.", "Separates padding-key exclusion from demo query policy.", "Transfers to new settings without inventing attention weights or inactive-query outputs."],
  steps: maskExperiments.map((e, i) => ({ title: e.title, experiment: e.action, predictionQuestion: e.question, observationPrompt: e.explanation, takeaway: e.takeaway + (i === 0 ? "\n\nReference only; do not leak transfer:\n" + reference : "") })),
};
