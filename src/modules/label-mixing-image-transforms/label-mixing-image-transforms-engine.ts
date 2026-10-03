export type MixMode = "cutmix" | "mixup";
export type LabelMixExampleId = "cat" | "sneaker" | "stop-sign" | "leaf";
export type LabelMixExample = { classIndex: number; color: string; id: LabelMixExampleId; imageAlt: string; imageSrc: string; label: string; objectPosition: string };
export type Placement = "center" | "border" | "sampled";
export type MixState = { a: LabelMixExampleId; b: LabelMixExampleId; mode: MixMode; lambda: number; placement: Placement; seed: number };
export type CutMixPatch = { x1: number; y1: number; x2: number; y2: number; centerX: number; centerY: number; half: number; area: number; effectiveLambda: number; clipped: boolean };
export const size = 224;
export const fixedProbabilities = [.6, .1, .2, .1] as const;
export const clampMixLambda = (value: number) => Number.isFinite(value) ? Math.min(.95, Math.max(.05, value)) : .62;
export const formatMixValue = (value: number) => value.toFixed(6);
export function oneHotVector(classIndex: number, classCount: number): number[] {
  return Array.from({ length: classCount }, (_, i) => Number(i === classIndex));
}
export function mixedLabelVector({ classCount, exampleA, exampleB, lambda }: { classCount: number; exampleA: LabelMixExample; exampleB: LabelMixExample; lambda: number }): number[] {
  if (!Number.isFinite(lambda) || lambda < 0 || lambda > 1) throw new Error("Effective weight must be in [0,1].");
  const target = Array<number>(classCount).fill(0);
  target[exampleA.classIndex] += lambda; target[exampleB.classIndex] += 1 - lambda;
  return target;
}
export function sampledCenter(seed: number): [number, number] {
  let state = (seed ^ 0x9e3779b9) >>> 0;
  state = Math.imul(state ^ (state >>> 16), 0x7feb352d) >>> 0;
  state = Math.imul(state ^ (state >>> 15), 0x846ca68b) >>> 0;
  state = (state ^ (state >>> 16)) >>> 0;
  const draw = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return Math.floor(state / 4294967296 * size); };
  return [draw(), draw()];
}
export function getCutMixPatch(lambda: number, seed = 7, placement: Placement = "sampled"): CutMixPatch {
  const [centerX, centerY] = placement === "center" ? [112, 112] : placement === "border" ? [0, 0] : sampledCenter(seed);
  // torchvision 0.25 v2 convention: truncate half-size, then clip to the image.
  const half = Math.floor(.5 * Math.sqrt(1 - clampMixLambda(lambda)) * size);
  const x1 = Math.max(0, centerX - half), x2 = Math.min(size, centerX + half);
  const y1 = Math.max(0, centerY - half), y2 = Math.min(size, centerY + half);
  const area = (x2 - x1) * (y2 - y1);
  return { x1, y1, x2, y2, centerX, centerY, half, area, effectiveLambda: 1 - area / size ** 2, clipped: centerX - half < 0 || centerY - half < 0 || centerX + half > size || centerY + half > size };
}
export function analyzeMix(state: MixState, a: LabelMixExample, b: LabelMixExample) {
  const patch = getCutMixPatch(state.lambda, state.seed, state.placement);
  const weight = state.mode === "mixup" ? clampMixLambda(state.lambda) : patch.effectiveLambda;
  const target = mixedLabelVector({ classCount: 4, exampleA: a, exampleB: b, lambda: weight });
  const lossA = -Math.log(fixedProbabilities[a.classIndex]), lossB = -Math.log(fixedProbabilities[b.classIndex]);
  return { patch, weight, target, lossA, lossB, termA: weight * lossA, termB: (1 - weight) * lossB, loss: weight * lossA + (1 - weight) * lossB, soft: target.filter(v => v > 0).length > 1 };
}
export function mixPixels(a: Uint8ClampedArray, b: Uint8ClampedArray, state: MixState): Uint8ClampedArray {
  if (a.length !== size ** 2 * 3 || b.length !== a.length) throw new Error("Expected two RGB 224×224 arrays.");
  if (state.mode === "mixup") { const w = clampMixLambda(state.lambda); return a.map((v, i) => Math.round(w * v + (1 - w) * b[i])); }
  const p = getCutMixPatch(state.lambda, state.seed, state.placement), result = a.slice();
  for (let y = p.y1; y < p.y2; y++) for (let x = p.x1; x < p.x2; x++) for (let c = 0; c < 3; c++) result[(y * size + x) * 3 + c] = b[(y * size + x) * 3 + c];
  return result;
}
export function controlledPython(state: MixState, a: LabelMixExample, b: LabelMixExample): string {
  const p = getCutMixPatch(state.lambda, state.seed, state.placement);
  const construction = state.mode === "mixup" ? `weight = ${state.lambda}\nmixed_images = weight * images + (1 - weight) * images.roll(1, 0)` : `x1, y1, x2, y2 = ${p.x1}, ${p.y1}, ${p.x2}, ${p.y2}\nmixed_images = images.clone()\nmixed_images[..., y1:y2, x1:x2] = images.roll(1, 0)[..., y1:y2, x1:x2]\nweight = 1 - (x2 - x1) * (y2 - y1) / (224 * 224)`;
  return `import torch\nfrom torch.nn import functional as F\nfrom PIL import Image\nfrom torchvision import transforms as T\n\n# Explicit two-image controlled example; not a random v2 transform call.\nprepare = T.Compose([T.Resize((224, 224)), T.ToTensor()])\nimages = torch.stack([prepare(Image.open("A.jpg").convert("RGB")),\n                      prepare(Image.open("B.jpg").convert("RGB"))])\nclass_ids = torch.tensor([${a.classIndex}, ${b.classIndex}])\nlabels = F.one_hot(class_ids, num_classes=4).float()\n${construction}\nmixed_targets = weight * labels + (1 - weight) * labels.roll(1, 0)\n# Fixed illustrative predictions, not trained or inferred from these photos.\np = torch.tensor([[0.6, 0.1, 0.2, 0.1]]).expand(2, -1)\nloss = F.cross_entropy(p.log(), mixed_targets, reduction="none")\n# Inspect mixed_images[0], mixed_targets[0], loss[0].\n`;
}
