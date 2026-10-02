import type { ConvolutionState } from "./convolution-filter-engine";
import type { ImageId } from "./scenario";

export type LessonState = ConvolutionState & { imageId: ImageId };
type Choice = { id: string; label: string };
type Experiment = {
  title: string;
  start: LessonState;
  target: LessonState;
  question: string;
  predictions: Choice[];
  correctPrediction: string;
  action: string;
  observation: string;
  explanationQuestion: string;
  explanations: Choice[];
  correctExplanation: string;
  retryHint: string;
  takeaway: string;
};

const ramp: LessonState = {
  imageId: "ramp", filterId: "edge", padding: 1, stride: 1, rowIndex: 1, colIndex: 1,
};
const spot: LessonState = {
  ...ramp, imageId: "spot", filterId: "blur", rowIndex: 2, colIndex: 2,
};

export const learningExperiments: readonly Experiment[] = [
  {
    title: "One patch, one number",
    start: ramp,
    target: { ...ramp, filterId: "blur" },
    question: "Switch to Blur. What will y[1,1] become?",
    predictions: [{ id: "2", label: "2" }, { id: "6", label: "6" }, { id: "18", label: "18" }],
    correctPrediction: "2",
    action: "Select Blur. Compare the nine products with Selected sum.",
    observation: "The nine patch values sum to 18. Each Blur weight is 1/9, so the output is 2.",
    explanationQuestion: "How did those nine values become one output?",
    explanations: [
      { id: "average", label: "Multiply each value by 1/9, then add all nine products." },
      { id: "center", label: "Copy the center pixel; the other values do not contribute." },
      { id: "sum", label: "Add the patch values without using the weights." },
    ],
    correctExplanation: "average",
    retryHint: "Trace a non-center value into Products. It contributes too; the center happens to equal the average on this ramp.",
    takeaway: "A kernel is a small grid of weights. One output is the sum of matching patch values × weights.",
  },
  {
    title: "Same weights, new patch",
    start: { ...ramp, filterId: "blur" },
    target: { ...ramp, filterId: "blur", colIndex: 2 },
    question: "Move one output cell right. What changes in the calculation?",
    predictions: [
      { id: "patch", label: "The image patch" },
      { id: "weights", label: "The kernel weights" },
      { id: "both", label: "Both the patch and weights" },
    ],
    correctPrediction: "patch",
    action: "Use Move window right once, or set Output column to 2. Keep the other settings.",
    observation: "The patch rows change from 1, 2, 3 to 2, 3, 4. Blur weights stay at 1/9; y[1,2] is 3.",
    explanationQuestion: "Why does the new output become 3?",
    explanations: [
      { id: "shared", label: "The same weights average a different neighborhood." },
      { id: "learned", label: "The kernel learns new weights whenever it moves." },
      { id: "copy", label: "Moving copies the previous output into a new cell." },
    ],
    correctExplanation: "shared",
    retryHint: "Compare Kernel weights before and after moving. The image changes underneath a fixed filter.",
    takeaway: "The output map collects one weighted sum per window. Selecting a cell inspects its calculation; the whole map is already computed.",
  },
  {
    title: "Choose the local question",
    start: spot,
    target: { ...spot, filterId: "sharpen" },
    question: "Single spot has a center value of 9 and zero neighbors. Switch to Sharpen. What will the center output be?",
    predictions: [{ id: "45", label: "45" }, { id: "9", label: "9" }, { id: "1", label: "1" }],
    correctPrediction: "45",
    action: "Select Sharpen. Keep Output row and Output column at 2.",
    observation: "The center product is 9 × 5 = 45. Neighbor products are zero. Blur gave 1 for the same patch.",
    explanationQuestion: "What made the two filters respond differently?",
    explanations: [
      { id: "contrast", label: "Blur averages; Sharpen weights the center by 5 and subtracts its four direct neighbors." },
      { id: "image", label: "Changing filters replaces the original image." },
      { id: "range", label: "Every filter must keep its output between 0 and 9." },
    ],
    correctExplanation: "contrast",
    retryHint: "The original spot stays 9. The weights change, and responses can exceed the image values or be negative.",
    takeaway: "Weights define the local question. Edge compares columns, Blur averages, and Sharpen emphasizes local contrast.",
  },
  {
    title: "Skip window positions",
    start: ramp,
    target: { ...ramp, stride: 2 },
    question: "Keep zero padding at 1. Change Stride from 1 to 2. What will the output size be?",
    predictions: [{ id: "3", label: "3 × 3" }, { id: "5", label: "5 × 5" }, { id: "2", label: "2 × 2" }],
    correctPrediction: "3",
    action: "Set Stride to 2. Compare Output size and the selected image window.",
    observation: "A 7 × 7 padded image fits three 3 × 3 windows per axis at positions 0, 2, 4.",
    explanationQuestion: "Why did the output shrink?",
    explanations: [
      { id: "skip", label: "The window advances by two pixels, sampling fewer positions with the same weights." },
      { id: "shrink", label: "Stride shrinks the input image and the kernel." },
      { id: "average", label: "Stride averages adjacent output cells." },
    ],
    correctExplanation: "skip",
    retryHint: "Count window start positions, not pixels deleted. The 3 × 3 kernel is unchanged.",
    takeaway: "Stride is the step between windows. For this fixed 3 × 3 kernel, size = floor((5 + 2p − 3) / s) + 1 per axis.",
  },
  {
    title: "Give borders a neighborhood",
    start: { ...ramp, filterId: "blur", padding: 0, rowIndex: 0, colIndex: 0 },
    target: { ...ramp, filterId: "blur", rowIndex: 0, colIndex: 0 },
    question: "Keep Stride at 1. Add one ring of zero padding. What will the output size become?",
    predictions: [{ id: "5", label: "5 × 5" }, { id: "3", label: "3 × 3" }, { id: "7", label: "7 × 7" }],
    correctPrediction: "5",
    action: "Set Zero padding to 1. Inspect the zero border and the patch for y[0,0].",
    observation: "The padded image becomes 7 × 7, but the output is 5 × 5. The new top-left patch has six padded zeros; its Blur sum is 2/3.",
    explanationQuestion: "What did padding add to this calculation?",
    explanations: [
      { id: "zeros", label: "Extra zero values let the window be centered on border pixels and affect its weighted sum." },
      { id: "recover", label: "Padding reconstructs missing pixels with their true values." },
      { id: "same", label: "Padding never changes the output values or their locations." },
    ],
    correctExplanation: "zeros",
    retryHint: "With padding, y[0,0] covers a different window. Its zeros are assumptions about outside the image, not recovered data.",
    takeaway: "Zero padding adds a border to the input, not the output. It enables border-centered windows and can change filter responses.",
  },
  {
    title: "A border can look like an edge",
    start: { ...ramp, imageId: "step", rowIndex: 2, colIndex: 3 },
    target: { ...ramp, imageId: "step", rowIndex: 2, colIndex: 4 },
    question: "The Step edge image stays at 5 near the right border. Move right into the padded border. What will Edge output?",
    predictions: [{ id: "negative", label: "A negative value" }, { id: "zero", label: "Zero" }, { id: "positive", label: "A positive value" }],
    correctPrediction: "negative",
    action: "Use Move window right once. Keep Edge, Stride 1, and Zero padding 1.",
    observation: "The patch has three rows of 5, 5, 0. Edge subtracts the left column from the right: 0 − 15 = −15.",
    explanationQuestion: "Why is there a response on this flat part of the image?",
    explanations: [
      { id: "border", label: "The padded zeros create a drop from 5 to 0 inside the window." },
      { id: "wrong", label: "Negative responses mean the filter calculation failed." },
      { id: "learn", label: "The kernel learned a new edge from this image." },
    ],
    correctExplanation: "border",
    retryHint: "Compare the actual image with the gray padded column. The outside zeros create the contrast.",
    takeaway: "Filter responses depend on both weights and boundary assumptions. A negative Edge response means a left-to-right fall, even when padding caused it.",
  },
];

export function matchesState(state: LessonState, target: LessonState) {
  return state.imageId === target.imageId && state.filterId === target.filterId &&
    state.padding === target.padding && state.stride === target.stride &&
    state.rowIndex === target.rowIndex && state.colIndex === target.colIndex;
}
