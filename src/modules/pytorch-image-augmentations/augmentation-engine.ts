// A browser teaching model, not a torchvision runtime. Pixel stages use uint8 RGB.
export const imageSize = 224;
export const transformIds = ["random-resized-crop", "horizontal-flip", "vertical-flip", "rotation", "color-jitter", "gaussian-blur", "trivial-augment", "rand-augment", "to-tensor", "random-erasing"] as const;
export type TransformId = typeof transformIds[number];
export const transformNames: Record<TransformId, string> = {
  "random-resized-crop": "RandomResizedCrop", "horizontal-flip": "HorizontalFlip", "vertical-flip": "VerticalFlip", rotation: "Rotation", "color-jitter": "ColorJitter", "gaussian-blur": "GaussianBlur", "trivial-augment": "TrivialAugmentWide", "rand-augment": "RandAugment", "to-tensor": "ToTensor", "random-erasing": "RandomErasing",
};
export type Settings = { enabled: Record<TransformId, boolean>; order: TransformId[]; seed: number; cropMinArea: number; horizontalFlipProbability: number; verticalFlipProbability: number; rotationDegrees: number; brightness: number; contrast: number; blurSigma: number; eraseMaxArea: number; randAugmentOps: number; randAugmentMagnitude: number };
export function defaultSettings(): Settings {
  return { enabled: Object.fromEntries(transformIds.map(id => [id, ["random-resized-crop", "horizontal-flip", "trivial-augment", "to-tensor"].includes(id)])) as Settings["enabled"], order: [...transformIds], seed: 1, cropMinArea: .08, horizontalFlipProbability: .5, verticalFlipProbability: .5, rotationDegrees: 12, brightness: .3, contrast: .3, blurSigma: .8, eraseMaxArea: .12, randAugmentOps: 2, randAugmentMagnitude: 9 };
}
export function isolatedSettings(ids: TransformId[], seed = 1): Settings {
  const s = defaultSettings();
  return { ...s, seed, enabled: Object.fromEntries(transformIds.map(id => [id, ids.includes(id)])) as Settings["enabled"] };
}
export function pipelineError(s: Settings): string | null {
  return s.enabled["random-erasing"] && !s.enabled["to-tensor"] ? "RandomErasing needs a tensor. Enable ToTensor before running or copying this pipeline." : null;
}
export function moveTransform(s: Settings, id: TransformId, direction: -1 | 1): Settings {
  const order = [...s.order], index = order.indexOf(id), next = index + direction;
  if (index >= 8 || next < 0 || next >= 8) return s;
  [order[index], order[next]] = [order[next], order[index]];
  return { ...s, order };
}
export function randomStream(seed: number, id: TransformId): () => number {
  let salt = 2166136261;
  for (const c of id) salt = Math.imul(salt ^ c.charCodeAt(0), 16777619) >>> 0;
  let state = (seed ^ salt) >>> 0;
  state = Math.imul(state ^ (state >>> 16), 0x7feb352d) >>> 0;
  state = Math.imul(state ^ (state >>> 15), 0x846ca68b) >>> 0;
  state = (state ^ (state >>> 16)) >>> 0;
  return () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
}
const evenRound = (v: number) => { const f = Math.floor(v), d = v - f; return d === .5 ? f + f % 2 : Math.round(v); };
export type Box = { x: number; y: number; width: number; height: number; fallback: boolean };
export const policyNames = ["Identity", "ShearX", "ShearY", "TranslateX", "TranslateY", "Rotate", "Brightness", "Color", "Contrast", "Sharpness", "Posterize", "Solarize", "AutoContrast", "Equalize"] as const;
export type PolicyName = typeof policyNames[number];
export type PolicyOperation = { name: PolicyName; bin: number; magnitude: number };
export function policyMagnitude(name: PolicyName, bin: number, wide: boolean): number {
  const fraction = bin / 30;
  switch (name) {
    case "ShearX": case "ShearY": return (wide ? .99 : .3) * fraction;
    case "TranslateX": case "TranslateY": return (wide ? 32 : 150 / 331 * imageSize) * fraction;
    case "Rotate": return (wide ? 135 : 30) * fraction;
    case "Brightness": case "Color": case "Contrast": case "Sharpness": return (wide ? .99 : .9) * fraction;
    case "Posterize": return 8 - evenRound(bin / (30 / (wide ? 6 : 4)));
    case "Solarize": return 255 * (1 - fraction);
    default: return 0;
  }
}
export type Stage = { id: TransformId; applied: boolean; detail: string; box?: Box; angle?: number; sigma?: number; factors?: { name: "Brightness" | "Contrast"; factor: number }[]; operations?: PolicyOperation[] };
function sampleBox(random: () => number, minimum: number, maximum: number, erase: boolean): Box {
  const low = erase ? .3 : .75, high = erase ? 3.3 : 4 / 3;
  for (let attempt = 0; attempt < 10; attempt++) {
    const area = imageSize ** 2 * (minimum + random() * (maximum - minimum));
    const ratio = Math.exp(Math.log(low) + random() * (Math.log(high) - Math.log(low)));
    const width = evenRound(Math.sqrt(area * (erase ? 1 / ratio : ratio)));
    const height = evenRound(Math.sqrt(area * (erase ? ratio : 1 / ratio)));
    if (width > 0 && height > 0 && width <= imageSize - Number(erase) && height <= imageSize - Number(erase)) {
      const y = Math.floor(random() * (imageSize - height + 1)), x = Math.floor(random() * (imageSize - width + 1));
      return { x, y, width, height, fallback: false };
    }
  }
  return { x: 0, y: 0, width: imageSize, height: imageSize, fallback: true };
}
const f = (v: number) => v.toFixed(4);
export function samplePipeline(s: Settings): Stage[] {
  if (pipelineError(s)) throw new Error(pipelineError(s)!);
  return s.order.filter(id => s.enabled[id]).map(id => {
    const random = randomStream(s.seed, id), stage: Stage = { id, applied: true, detail: "" };
    switch (id) {
      case "random-resized-crop": {
        stage.box = sampleBox(random, s.cropMinArea, 1, false);
        const b = stage.box;
        stage.detail = `x=${b.x}, y=${b.y}, width=${b.width}, height=${b.height}; area ${(100 * b.width * b.height / imageSize ** 2).toFixed(2)}%; resize to 224×224${b.fallback ? "; central fallback after 10 rejected draws" : ""}`; break;
      }
      case "horizontal-flip": case "vertical-flip": {
        const draw = random(), p = id === "horizontal-flip" ? s.horizontalFlipProbability : s.verticalFlipProbability;
        stage.applied = draw < p; stage.detail = `draw ${f(draw)} < p ${f(p)}: ${stage.applied ? "applied" : "not applied"}`; break;
      }
      case "rotation": stage.angle = (random() * 2 - 1) * s.rotationDegrees; stage.detail = `sampled ${f(stage.angle)}° within ±${s.rotationDegrees}°; black fill`; break;
      case "color-jitter": {
        const factors: NonNullable<Stage["factors"]> = [{ name: "Brightness", factor: 1 - s.brightness + random() * 2 * s.brightness }, { name: "Contrast", factor: 1 - s.contrast + random() * 2 * s.contrast }];
        if (random() < .5) factors.reverse();
        stage.factors = factors; stage.detail = factors.map(o => `${o.name} ×${f(o.factor)}`).join(" → "); break;
      }
      case "gaussian-blur": stage.sigma = .1 + random() * (s.blurSigma - .1); stage.detail = `kernel 5×5; sampled sigma ${f(stage.sigma)} within [0.1, ${s.blurSigma}]`; break;
      case "random-erasing": {
        const draw = random(); stage.applied = draw < .35;
        stage.detail = `draw ${f(draw)} < p 0.3500: ${stage.applied ? "applied" : "not applied"}`;
        if (stage.applied) { stage.box = sampleBox(random, .02, s.eraseMaxArea, true); const b = stage.box; stage.applied = !b.fallback;
          stage.detail += b.fallback ? "; 10 rejected boxes, keep original" : `; x=${b.x}, y=${b.y}, width=${b.width}, height=${b.height}; actual area ${(100 * b.width * b.height / imageSize ** 2).toFixed(2)}%; value 0`; }
        break;
      }
      case "trivial-augment": case "rand-augment": {
        const wide = id === "trivial-augment";
        stage.operations = Array.from({ length: wide ? 1 : s.randAugmentOps }, () => {
          const name = policyNames[Math.floor(random() * policyNames.length)], bin = wide ? Math.floor(random() * 31) : s.randAugmentMagnitude;
          let magnitude = policyMagnitude(name, bin, wide);
          if (["ShearX", "ShearY", "TranslateX", "TranslateY", "Rotate", "Brightness", "Color", "Contrast", "Sharpness"].includes(name) && random() < .5) magnitude *= -1;
          return { name, bin, magnitude };
        });
        stage.detail = stage.operations.map(o => `${o.name} (bin ${o.bin}, magnitude ${f(o.magnitude)})`).join(" → "); break;
      }
      case "to-tensor": stage.detail = "RGB uint8 H×W×C → float32 C×H×W [3,224,224]; each channel byte / 255";
    }
    return stage;
  });
}
export function generatePython(s: Settings): string {
  const config: Record<TransformId, string> = {
    "random-resized-crop": `T.RandomResizedCrop((224, 224), scale=(${s.cropMinArea}, 1.0), ratio=(0.75, 4/3))`,
    "horizontal-flip": `T.RandomHorizontalFlip(p=${s.horizontalFlipProbability})`, "vertical-flip": `T.RandomVerticalFlip(p=${s.verticalFlipProbability})`, rotation: `T.RandomRotation(degrees=${s.rotationDegrees}, fill=0)`,
    "color-jitter": `T.ColorJitter(brightness=${s.brightness}, contrast=${s.contrast})`, "gaussian-blur": `T.GaussianBlur(kernel_size=5, sigma=(0.1, ${s.blurSigma}))`,
    "trivial-augment": "T.TrivialAugmentWide()", "rand-augment": `T.RandAugment(num_ops=${s.randAugmentOps}, magnitude=${s.randAugmentMagnitude})`, "to-tensor": "T.ToTensor()", "random-erasing": `T.RandomErasing(p=0.35, scale=(0.02, ${s.eraseMaxArea}), ratio=(0.3, 3.3), value=0)`,
  };
  return `from PIL import Image\nfrom torchvision import transforms as T\n\n# torchvision v1 API. Python uses its own random draws.\n# Square preparation resizes the full photo, including its aspect ratio.\nprepare = T.Resize((224, 224))\npipeline = T.Compose([\n${s.order.filter(id => s.enabled[id]).map(id => `    ${config[id]},`).join("\n")}\n])\nimage = prepare(Image.open("example.jpg").convert("RGB"))\nresult = pipeline(image)\n# The caller retains the class target only when these changes suit the task.\n`;
}
export type Pixels = Uint8ClampedArray;
const byte = (n: number) => Math.max(0, Math.min(255, Math.floor(n)));
function mapPixels(input: Pixels, operation: (x: number, y: number) => [number, number]): Pixels {
  const out = new Uint8ClampedArray(input.length);
  for (let y = 0; y < imageSize; y++) for (let x = 0; x < imageSize; x++) {
    const [sx, sy] = operation(x, y), xx = Math.floor(sx), yy = Math.floor(sy), at = (y * imageSize + x) * 3;
    if (xx >= 0 && yy >= 0 && xx < imageSize && yy < imageSize) for (let c = 0; c < 3; c++) out[at + c] = input[(yy * imageSize + xx) * 3 + c];
  }
  return out;
}
function enhance(input: Pixels, name: "Brightness" | "Contrast" | "Color" | "Sharpness", factor: number): Pixels {
  const gray = (i: number) => Math.round(.299 * input[i] + .587 * input[i + 1] + .114 * input[i + 2]);
  let mean = 0;
  if (name === "Contrast") { for (let i = 0; i < input.length; i += 3) mean += gray(i); mean = Math.round(mean / imageSize ** 2); }
  return input.map((v, i) => {
    let base = name === "Brightness" ? 0 : name === "Contrast" ? mean : gray(i - i % 3);
    if (name === "Sharpness") {
      const p = Math.floor(i / 3), x = p % imageSize, y = Math.floor(p / imageSize), c = i % 3;
      if (!x || !y || x === imageSize - 1 || y === imageSize - 1) base = v;
      else { base = 5 * v; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (dx || dy) base += input[((y + dy) * imageSize + x + dx) * 3 + c]; base = Math.round(base / 13); }
    }
    return byte(base + factor * (v - base));
  });
}
function policyPixels(input: Pixels, o: PolicyOperation): Pixels {
  const m = o.magnitude, center = imageSize / 2;
  switch (o.name) {
    case "Identity": return input.slice();
    case "ShearX": return mapPixels(input, (x, y) => [x + .5 + m * (y + .5), y + .5]);
    case "ShearY": return mapPixels(input, (x, y) => [x + .5, y + .5 + m * (x + .5)]);
    case "TranslateX": return mapPixels(input, (x, y) => [x + .5 - Math.trunc(m), y + .5]);
    case "TranslateY": return mapPixels(input, (x, y) => [x + .5, y + .5 - Math.trunc(m)]);
    case "Rotate": { const theta = m * Math.PI / 180, co = Math.cos(theta), si = Math.sin(theta);
      return mapPixels(input, (x, y) => { const xx = x + .5 - center, yy = y + .5 - center; return [co * xx - si * yy + center, si * xx + co * yy + center]; }); }
    case "Brightness": case "Color": case "Contrast": case "Sharpness": return enhance(input, o.name, 1 + m);
    case "Posterize": return input.map(v => v & (255 << (8 - m)));
    case "Solarize": return input.map(v => v >= m ? 255 - v : v);
    case "AutoContrast": case "Equalize": {
      const maps: number[][] = [];
      for (let c = 0; c < 3; c++) {
        const counts = Array<number>(256).fill(0); for (let i = c; i < input.length; i += 3) counts[input[i]]++;
        const occupied = counts.map((n, i) => n ? i : -1).filter(i => i >= 0), min = occupied[0], max = occupied[occupied.length - 1];
        if (o.name === "AutoContrast") maps.push(Array.from({ length: 256 }, (_, v) => min === max ? v : byte((v - min) * 255 / (max - min))));
        else { const step = Math.floor((imageSize ** 2 - counts[max]) / 255); let total = Math.floor(step / 2);
          maps.push(counts.map((n, v) => { const result = step ? Math.min(255, Math.floor(total / step)) : v; total += n; return result; })); }
      }
      return input.map((v, i) => maps[i % 3][v]);
    }
  }
}
function blur(input: Pixels, sigma: number): Pixels {
  const weights = [-2, -1, 0, 1, 2].map(i => Math.exp(-i * i / (2 * sigma * sigma))), sum = weights.reduce((a, b) => a + b);
  const reflect = (v: number) => v < 0 ? -v : v >= imageSize ? 2 * imageSize - v - 2 : v;
  const horizontal = new Float64Array(input.length), output = new Uint8ClampedArray(input.length);
  for (let y = 0; y < imageSize; y++) for (let x = 0; x < imageSize; x++) for (let c = 0; c < 3; c++) {
    let v = 0; for (let k = -2; k <= 2; k++) v += input[(y * imageSize + reflect(x + k)) * 3 + c] * weights[k + 2] / sum;
    horizontal[(y * imageSize + x) * 3 + c] = v;
  }
  for (let y = 0; y < imageSize; y++) for (let x = 0; x < imageSize; x++) for (let c = 0; c < 3; c++) {
    let v = 0; for (let k = -2; k <= 2; k++) v += horizontal[(reflect(y + k) * imageSize + x) * 3 + c] * weights[k + 2] / sum;
    output[(y * imageSize + x) * 3 + c] = Math.round(v);
  }
  return output;
}
export function applyStage(input: Pixels, stage: Stage): Pixels {
  if (!stage.applied) return input.slice();
  switch (stage.id) {
    case "horizontal-flip": return mapPixels(input, (x, y) => [imageSize - x - .5, y + .5]);
    case "vertical-flip": return mapPixels(input, (x, y) => [x + .5, imageSize - y - .5]);
    case "random-resized-crop": { const b = stage.box!; return mapPixels(input, (x, y) => [b.x + (x + .5) * b.width / imageSize, b.y + (y + .5) * b.height / imageSize]); }
    case "rotation": return policyPixels(input, { name: "Rotate", bin: 0, magnitude: stage.angle! });
    case "color-jitter": return stage.factors!.reduce((pixels, o) => enhance(pixels, o.name, o.factor), input);
    case "gaussian-blur": return blur(input, stage.sigma!);
    case "trivial-augment": case "rand-augment": return stage.operations!.reduce(policyPixels, input);
    case "random-erasing": { const b = stage.box!, out = input.slice(); for (let y = b.y; y < b.y + b.height; y++) for (let x = b.x; x < b.x + b.width; x++) for (let c = 0; c < 3; c++) out[(y * imageSize + x) * 3 + c] = 0; return out; }
    case "to-tensor": return input.slice(); // Display remains RGB; numerical tensor evidence is byte/255 in CHW.
  }
}
export function pixelSignature(pixels: Pixels): string {
  let hash = 2166136261; for (const v of pixels) hash = Math.imul(hash ^ v, 16777619) >>> 0;
  return hash.toString(16).padStart(8, "0");
}
export type RenderedStage = Stage & { signature: string; changedPixels: number };
export function runPipeline(input: Pixels, settings: Settings): { pixels: Pixels; stages: RenderedStage[] } {
  let pixels: Pixels = input.slice();
  const stages = samplePipeline(settings).map(stage => {
    const next = applyStage(pixels, stage); let changedPixels = 0;
    for (let i = 0; i < pixels.length; i += 3) if (next[i] !== pixels[i] || next[i + 1] !== pixels[i + 1] || next[i + 2] !== pixels[i + 2]) changedPixels++;
    pixels = next;
    return { ...stage, signature: pixelSignature(pixels), changedPixels };
  });
  return { pixels, stages };
}
