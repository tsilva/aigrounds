import { quantizationScenarios, type QuantizationScenarioId } from "./scenario";
import { type QuantizationRangePreset } from "./linear-quantization-int4-engine";
export type QuantizationState = { scenario: QuantizationScenarioId; preset: QuantizationRangePreset; value: number };
export const quantizationDefaults: QuantizationState = { scenario: "llm", preset: "auto", value: 0.053 };
export const quantizationTransferStart: QuantizationState = { scenario: "sensor", preset: "auto", value: 0.037 };
export const quantizationTransferTarget: QuantizationState = { ...quantizationTransferStart, preset: "tighter" };
export const quantizationExperiments = [
  {
    title: "Move within one level", baseline: quantizationDefaults, target: { ...quantizationDefaults, value: 0.059 },
    question: "With LLM weights and Auto range, move Inspect one value from 0.053 to 0.059. Must the stored code change?",
    predictions: [{ id: "same", label: "No: different inputs can share one code" }, { id: "change", label: "Yes: every 0.001 change gets a new code" }, { id: "train", label: "Changing the probe retrains the block" }],
    correctPrediction: "same", action: "Set Inspect one value to 0.059. Keep LLM weights and Range preset Auto. Read the arithmetic trace and reconstructed marker.",
    explanation: "What stayed fixed while the source moved?",
    explanations: [{ id: "level", label: "Both inputs round to offset 3 and code 11, reconstructed at 0.06000. The error changes from +0.00700 to +0.00100. The 102 block samples are unchanged." }, { id: "exact", label: "The stored code contains the original decimal, so reconstruction is exact." }, { id: "dataset", label: "The probe changes all 102 block samples and their mean error." }],
    correctExplanation: "level", retry: "A shared scale of 0.02000 maps many real values to one level. Compare raw code, stored code and reconstructed value; the probe is separate from the fixed block.",
    takeaway: "Quantization stores a code, not the original decimal. Nearby inputs can reconstruct to the same level while their errors differ. Four bits provide 16 codes and 15 adjacent gaps.",
  },
  {
    title: "Separate rounding from clamping", baseline: quantizationDefaults, target: { ...quantizationDefaults, value: 0.2 },
    question: "At Auto scale 0.02000 and zero point 8, x = 0.200 would give raw code 18. Can four bits store code 18?",
    predictions: [{ id: "clamp", label: "No: clamp the raw code to 15" }, { id: "keep", label: "Yes: the code range expands to 18" }, { id: "wrap", label: "It wraps to code 2" }],
    correctPrediction: "clamp", action: "Set Inspect one value to 0.200. Keep LLM weights and Range preset Auto. Compare rounded offset, raw code and clamped code.",
    explanation: "Where did the larger error come from?",
    explanations: [{ id: "stages", label: "0.200 / 0.020 = 10; rounded offset 10 plus zero point 8 gives raw code 18. It clamps to 15, reconstructs 0.14000 and has error −0.06000, beyond the unclamped half-step bound 0.01000." }, { id: "round", label: "Rounding produced offset 7; no clamping happened." }, { id: "bound", label: "Every error, including clamping, is bounded by half a scale step." }],
    correctExplanation: "stages", retry: "Read the separate stages. The rounded offset is 10, not clamped code minus zero point. The half-step error bound applies only when the raw code is not clamped.",
    takeaway: "Clamping limits the rounded raw code to 0–15; it does not wrap. A clamped value can have error much larger than scale/2. A boundary code is not always clamped: its ordinary rounding cell also maps there.",
  },
  {
    title: "Trade step size for tails", baseline: quantizationDefaults, target: { ...quantizationDefaults, preset: "tighter" } as QuantizationState,
    question: "Keep the 102 LLM samples fixed and switch Auto to Tighter. Will a smaller step guarantee smaller whole-block mean absolute error?",
    predictions: [{ id: "trade", label: "No: more clamping can outweigh finer steps" }, { id: "always", label: "Yes: a smaller step always lowers every error" }, { id: "more", label: "Tighter creates more than 16 codes" }],
    correctPrediction: "trade", action: "Choose Tighter in Range preset. Keep LLM weights and Inspect one value 0.053. Compare both block summaries and the scale.",
    explanation: "What happened to precision and the tails?",
    explanations: [{ id: "metrics", label: "Scale falls 0.02000 → 0.01360, but clamped samples rise 3 → 8 of 102 and mean absolute error rises 0.00560 → 0.00633. The probe’s own error falls to +0.00140; it is not the whole block." }, { id: "best", label: "The probe improved, so every sample and the whole block must improve." }, { id: "rounding", label: "The block summary measures only rounding and excludes clamped samples." }],
    correctExplanation: "metrics", retry: "Separate one probe from the 102 fixed samples. Mean absolute error includes clamped tail errors as well as ordinary rounding errors; compare both summaries.",
    takeaway: "A tighter calibration range gives smaller scale steps but can clamp more tail samples. The best range depends on the values and metric; neither Tighter nor Wider is universally better.",
  },
  {
    title: "A shared map changes by block", baseline: quantizationDefaults,
    target: { scenario: "activation", preset: "auto", value: 0.126 } as QuantizationState,
    question: "Choose Activation values. The block and its preset range change. What happens to the code budget and reconstructed endpoints?",
    predictions: [{ id: "map", label: "There are still 16 codes, but scale, zero point and levels can change" }, { id: "codes", label: "The larger range creates more than 16 codes" }, { id: "end", label: "Reconstructed endpoints must exactly equal calibration endpoints" }],
    correctPrediction: "map", action: "Choose Activation values. This selects its Auto range and probe 0.126. Compare calibration endpoints with the Reconstructed levels row and scale/zero point.",
    explanation: "Why are the endpoints different here?",
    explanations: [{ id: "zero", label: "Scale is 0.02400 and zero point rounds to 3. Calibration −0.08000..+0.28000 reconstructs code 0 at −0.07200 and code 15 at +0.28800. Integer zero-point rounding shifts levels; code 3 still represents zero exactly." }, { id: "exact", label: "Code 0 is exactly −0.08000 and code 15 exactly +0.28000; zero has no code." }, { id: "learn", label: "The synthetic samples train a model that learns new code meanings." }],
    correctExplanation: "zero", retry: "Compute reconstructed value = scale × (code − zero point). A rounded integer zero point pins one code to zero while the endpoints can shift from calibration min/max.",
    takeaway: "One scale and zero point are shared by a block. Different blocks use different maps, while the 4-bit budget stays 16 codes. These synthetic fixtures do not measure model accuracy or inference speed.",
  },
  {
    title: "Pack codes and count overhead", baseline: quantizationDefaults, target: { ...quantizationDefaults, value: 0.073 },
    question: "Move the LLM Auto probe from 0.053 to 0.073. It changes code 11 to 12; the second code stays 6. Must the packed pair need more than one byte?",
    predictions: [{ id: "byte", label: "No: two 4-bit codes still use one 8-bit byte" }, { id: "decimal", label: "Yes: the new decimal needs 32 bits inside the byte" }, { id: "total", label: "Packing guarantees every model file shrinks exactly 8×" }],
    correctPrediction: "byte", action: "Set Inspect one value to 0.073. Keep LLM weights and Range preset Auto. Read Pack two codes and the illustrative block storage calculation.",
    explanation: "What changed in storage?",
    explanations: [{ id: "bits", label: "The first code changes 1011 → 1100; fixed code 6 stays 0110, so the byte changes 0xB6 → 0xC6. Codes alone use 4 instead of 32 bits per value (8×); scale/zero metadata and padding reduce total savings." }, { id: "signed", label: "All codes 0–15 are signed int4 numbers, so negative reals cannot be represented." }, { id: "speed", label: "The packed byte proves inference is 8× faster and predictions stay identical." }],
    correctExplanation: "bits", retry: "A nibble is 4 bits, and a byte is 8. Negative reconstructed reals are possible through the zero-point offset. Payload bits do not by themselves measure total model size, speed or accuracy.",
    takeaway: "Two unsigned 4-bit codes pack into one byte. The fixed second code is a packing demonstration, not another inferred sample. For 102 samples this illustrative format is 51 payload bytes + 5 metadata bytes = 56, versus 408 FP32 bytes (7.29×). Actual formats can add alignment or other metadata.",
  },
];
export const quantizationToolbarScenarios = quantizationScenarios.map(s => ({ id: s.id, label: s.title, shortLabel: s.subtitle }));
export const quantizationTutorPlan = {
  intro: "Five experiments separate code plateaus, clamping, range tradeoffs, block maps and packing, then transfer to a sensor block.",
  whyItMatters: "A shared low-precision map reduces payload storage by approximating real values with a small code set. The range determines spacing and saturation, so error and storage must be measured separately.",
  openingMessage: `You need subtraction, division and nearest integers. Four bits make 16 code combinations (0–15), with 15 gaps between reconstructed levels. This toy uses unsigned 4-bit codes, often called uint4; signed int4 instead uses −8..7. Reconstructed real values can be negative because the map subtracts a zero point.

Clamping limits an out-of-bounds code to the closest boundary, 0 or 15. Scale s = (calibration max − min)/15; z = clamp(round(−min/s),0,15). Store q = clamp(round(x/s)+z,0,15), then reconstruct x̂ = s(q−z). This lab rounds nearest with half ties toward +infinity, including negative ties, treating authored decimal inputs exactly. ONNX QuantizeLinear uses ties-to-even instead; this is not its bit-exact implementation. The calibration presets are rounded to 0.001 and Auto is a fixed demonstration preset, not an automatic min/max estimator.

These are three synthetic 102-sample blocks, not measurements from a trained model. Inspect one value is a separate probe; it does not edit the block samples. Range preset preserves the probe and changes the shared map. Scenario buttons restore that fixture’s Auto range and default probe. Exact inputs and a native slider use 0.001 steps. A different rail prediction restores the experiment baseline; Reset restarts the current experiment, including when an answer was already checked.

Follow the source and reconstructed markers, exact arithmetic stages and two block summaries. Mean absolute error includes both ordinary rounding and clamping. Clamped samples means raw codes outside 0–15, not merely values outside calibration endpoints. Rounded zero points can shift reconstructed endpoints away from min/max. Optional tables give every source sample, code count and honest original distribution including overflow. Packing uses the selected code and a fixed second code 6; a nibble is 4 bits and a byte 8. Payload savings exclude metadata, and the displayed block storage model assumes a 4-byte scale plus 1-byte zero point.

Experiment 1 starts LLM weights, Auto, probe 0.053. Before setting Inspect one value to 0.059, predict whether every small input change must change its stored code. Share your prediction here or in the rail.`,
  masteryCriteria: ["Uses shared scale/zero to explain many-to-one code mapping.", "Separates rounded offset, raw code and clamped code, with correct error limits.", "Compares probe error with whole-block error and clamped count.", "Explains zero-point endpoint shifts and the fixed 16-code budget.", "Connects nibbles/bytes to payload savings while accounting for overhead."],
  steps: [...quantizationExperiments.map((e,i) => ({ title: e.title, experiment: `Use Reset and choose a Your prediction answer. ${e.action} Explain before ${i === 4 ? "Try the transfer check" : "Next experiment"}.`, predictionQuestion: e.question, observationPrompt: e.explanation, takeaway: `${e.takeaway} Worked evidence: ${e.explanations[0].label}` })), { title: "Same code, another map", experiment: "Transfer starts Tiny sensor model, Auto, probe 0.037. Choose Tighter, keeping the probe fixed, then answer Transfer explanation. Reset restores Auto at 0.037.", predictionQuestion: "If the code stays at 9, must the reconstructed value and total error stay the same?", observationPrompt: "Compare reconstructed value, scale, mean absolute error and clamped count.", takeaway: "Code9 stays the same, but scale 0.01000→0.00680 changes reconstruction 0.04000→0.03400. Probe error +0.00300→−0.00300 has equal absolute magnitude. Block MAE rises 0.00301→0.00354 and clamped count3→8. Codes have meaning only together with their map." }],
};
