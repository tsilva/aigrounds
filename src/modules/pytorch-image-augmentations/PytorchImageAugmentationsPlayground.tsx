"use client";
import { useEffect, useRef, useState } from "react";
import { ExperimentButton, ExperimentChoices, ExperimentRail, ExperimentResult, LearningPage, LessonAction, LessonRangeControl, LessonSelect, LessonSummaries, LessonToggleGroup, LessonToolbar } from "@/components/learning-page/learning-page";
import { GuidedExperiment } from "@/components/learning-page/guided-experiment";
import sharedStyles from "@/components/learning-page/learning-page.module.css";
import { generatePython, imageSize, moveTransform, pipelineError, pixelSignature, runPipeline, transformIds, transformNames, type Pixels, type RenderedStage, type Settings, type TransformId } from "./augmentation-engine";
import { augmentationExperiments, transferStart, transferTarget, type LessonState } from "./learning-experiments";
import { classExamples } from "./scenario";
import styles from "./playground.module.css";
const same = (a: Settings, b: Settings) => JSON.stringify(a) === JSON.stringify(b);
const keyFor = (s: LessonState) => JSON.stringify(s);
type Run = { key: string; pixels: Pixels; stages: RenderedStage[] };
function PixelImage({ pixels, label }: { pixels: Pixels | null; label: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx || !pixels) return;
    const frame = ctx.createImageData(imageSize, imageSize);
    for (let i = 0; i < pixels.length / 3; i++) { for (let c = 0; c < 3; c++) frame.data[i * 4 + c] = pixels[i * 3 + c]; frame.data[i * 4 + 3] = 255; }
    ctx.putImageData(frame, 0, 0);
  }, [pixels]);
  return pixels ? <canvas ref={ref} width={imageSize} height={imageSize} role="img" aria-label={label} /> : <div className={styles.placeholder}>Settings changed or photo loading. Press Run pipeline when ready.</div>;
}
export function PytorchImageAugmentationsPlayground() {
  const [state, setState] = useState<LessonState>(augmentationExperiments[0].baseline);
  const [selected, setSelected] = useState<TransformId>("horizontal-flip");
  const [index, setIndex] = useState(0), [prediction, setPrediction] = useState<string | null>(null), [explanation, setExplanation] = useState<string | null>(null), [transferAnswer, setTransferAnswer] = useState<string | null>(null);
  const [input, setInput] = useState<{ image: string; pixels: Pixels } | null>(null), [stored, setStored] = useState<Run | null>(null), [baseline, setBaseline] = useState<Run | null>(null);
  const [compare, setCompare] = useState("prepared"), [loadError, setLoadError] = useState(""), [copyStatus, setCopyStatus] = useState("");
  const s = state.settings, experiment = augmentationExperiments[index], transfer = index === 5;
  const example = classExamples.find(e => e.id === state.image)!;
  const currentInput = input?.image === state.image ? input.pixels : null;
  const run = stored?.key === keyFor(state) ? stored : null;
  const reached = !!experiment && !!prediction && !!run && state.image === experiment.baseline.image && same(s, experiment.target);
  const complete = reached && explanation === "0";
  const transferReached = !!run && state.image === "leaf" && same(s, transferTarget);
  const error = pipelineError(s), code = generatePython(s);
  // Load only the selected public photo. Normalize the entire RGB photo to a square.
  useEffect(() => {
    let cancelled = false;
    const image = new window.Image();
    image.onload = () => {
      if (cancelled) return;
      const canvas = document.createElement("canvas"); canvas.width = canvas.height = imageSize;
      const ctx = canvas.getContext("2d");
      if (!ctx) { setLoadError("Canvas is unavailable in this browser."); return; }
      ctx.drawImage(image, 0, 0, imageSize, imageSize);
      const rgba = ctx.getImageData(0, 0, imageSize, imageSize).data, pixels = new Uint8ClampedArray(imageSize ** 2 * 3);
      for (let i = 0; i < imageSize ** 2; i++) for (let c = 0; c < 3; c++) pixels[i * 3 + c] = rgba[i * 4 + c];
      setInput({ image: example.id, pixels }); setLoadError("");
    };
    image.onerror = () => { if (!cancelled) setLoadError("The selected photo could not load. Choose another photo or reload this page."); };
    image.src = example.imageSrc;
    return () => { cancelled = true; };
  }, [example.id, example.imageSrc]);
  function makeRun(next: LessonState): Run | null {
    if (!input || input.image !== next.image || pipelineError(next.settings)) return null;
    return { key: keyFor(next), ...runPipeline(input.pixels, next.settings) };
  }
  function clear() { setExplanation(null); setTransferAnswer(null); setCopyStatus(""); }
  function edit(settings: Settings) { setState({ ...state, settings }); setStored(null); clear(); }
  function start(next = index) {
    const initial = augmentationExperiments[next]?.baseline ?? transferStart;
    setIndex(next); setState(initial); setSelected(augmentationExperiments[next]?.selected ?? "vertical-flip"); setPrediction(null); clear();
    const initialRun = makeRun(initial); setStored(initialRun); setBaseline(initialRun); setCompare(next === 1 ? "baseline" : "prepared");
  }
  function choosePrediction(id: string) { start(); setPrediction(id); }
  function performRun() { const result = makeRun(state); setStored(result); clear(); if (!prediction || (!baseline && experiment && state.image === experiment.baseline.image && same(s, experiment.baseline.settings))) setBaseline(result); }
  const rail = experiment ? <GuidedExperiment label={`Experiment ${index + 1} of 5`} experiment={experiment}
    reached={reached} complete={complete} prediction={prediction} explanation={explanation}
    predictionName="augment-prediction" explanationName="augment-explanation"
    onPredict={choosePrediction} onExplain={setExplanation}
    predictionHelp={<>Choosing a different prediction restores the starting settings. Reset restarts this experiment. Run the baseline first for the order comparison if its photo is still loading.</>} observation={prediction === experiment.correctPrediction ? "Your prediction matches the evidence." : "The ordered trace and result challenge your prediction."}
    onNext={() => start(index + 1)} nextLabel={index === 4 ? "Try the transfer check" : "Next experiment"} /> : <ExperimentRail label={transfer ? "Transfer check" : "Free exploration"} title={transfer ? "Same assumption, a different photo" : "Build another pipeline"}>
    {transfer ? <><p>The leaf starts with VerticalFlip probability 0 and ToTensor. Predict whether forcing an upside-down view must change its class target. Set Flip probability to 1, then Run pipeline and explain without Guide help.</p><ExperimentChoices legend="Transfer explanation" name="augment-transfer" choices={[{ id: "retained", label: "The retained target stays [0,0,0,1]. Whether this helps recognize leaf species depends on the task; the transform cannot certify that assumption." }, { id: "valid", label: "The unchanged vector proves the transform is valid for every leaf task." }, { id: "new", label: "A vertical flip must create a new class." }]} value={transferAnswer} onChange={setTransferAnswer} />{transferAnswer && (!transferReached ? <p role="status" className={sharedStyles.feedback}>First keep Leaf, set Flip probability to 1, and Run pipeline. Reset restores this transfer start.</p> : transferAnswer !== "retained" ? <p role="status" className={sharedStyles.feedback}>Try again. Retaining a target and preserving the intended meaning are separate decisions.</p> : <><ExperimentResult title="Transfer explained">Targets are retained by this demo; the training task determines which changes should preserve meaning.</ExperimentResult><ExperimentButton onClick={() => { setIndex(6); clear(); }}>Explore freely</ExperimentButton></>)}</> : <><p>Try all photos, settings and policies. New draw advances the browser replay seed; Run pipeline repeats the current one. Read the code and sampled stage trace to separate configured ranges from actual draws.</p><ExperimentButton onClick={() => start(0)}>Restart experiments</ExperimentButton></>}
  </ExperimentRail>;
  const parameter = (label: string, field: keyof Omit<Settings, "enabled" | "order">, min: number, max: number, step: number, help: string, unit = "") => <LessonRangeControl label={label} value={s[field]} min={min} max={max} step={step} help={help} unit={unit} onChange={value => edit({ ...s, [field]: value })} />;
  let editor;
  switch (selected) {
    case "random-resized-crop": editor = parameter("Minimum crop area", "cropMinArea", .08, 1, .01, "Configured area fraction of the prepared image: [minimum,1]. Integer boxes can slightly differ; 10 rejected samples fall back to a central crop. Aspect ratio is sampled in [0.75,4/3]."); break;
    case "horizontal-flip": case "vertical-flip": editor = parameter("Flip probability", selected === "horizontal-flip" ? "horizontalFlipProbability" : "verticalFlipProbability", 0, 1, .05, "Probability of applying the whole mirror, not a fraction of pixels."); break;
    case "rotation": editor = parameter("Maximum rotation", "rotationDegrees", 0, 18, 1, "Sample an angle uniformly between −maximum and +maximum. Black fills newly exposed pixels.", "degrees"); break;
    case "color-jitter": editor = <>{parameter("Brightness jitter", "brightness", 0, .3, .01, "Sample a multiplicative factor in [1−jitter,1+jitter]. No saturation or hue jitter is added.")}{parameter("Contrast jitter", "contrast", 0, .3, .01, "Sample a factor in [1−jitter,1+jitter]. Brightness and contrast order is also sampled.")}</>; break;
    case "gaussian-blur": editor = parameter("Maximum blur sigma", "blurSigma", .1, 2, .1, "Sample sigma in [0.1,maximum]. The Gaussian kernel is always 5×5; reflected borders."); break;
    case "random-erasing": editor = parameter("Maximum erase area", "eraseMaxArea", .02, .3, .01, "Apply with probability 0.35. Sample an area fraction in [0.02,maximum] and aspect ratio [0.3,3.3], up to 10 attempts. Erase to zero after ToTensor."); break;
    case "rand-augment": editor = <>{parameter("Number of operations", "randAugmentOps", 1, 4, 1, "Sample with replacement: operation names can repeat. This predefined policy is not learned from the photo.")}{parameter("Magnitude index", "randAugmentMagnitude", 0, 30, 1, "A fixed index into 31 operation-specific strengths, not a pixel fraction or a count. Identity, AutoContrast and Equalize do not vary with this index.")}</>; break;
    case "trivial-augment": editor = <p>Sample one operation from the predefined 14-operation set and one random magnitude index 0–30 from wider ranges. No slider or learned policy. This can strongly distort the image.</p>; break;
    case "to-tensor": editor = <p>Convert prepared RGB bytes H×W×C to float32 C×H×W by dividing each channel by 255. This format conversion leaves displayed colors unchanged. It supplies the tensor required by RandomErasing.</p>;
  }
  const vector = classExamples.map(e => Number(e.id === state.image));
  const leftPixels = compare === "baseline" ? baseline?.pixels ?? null : currentInput;
  const sampled = run?.stages.find(stage => stage.id === selected);
  const pixel = run?.pixels.slice(0, 3);
  return <LearningPage title="PyTorch Image Transforms" subtitle="Sample a transform. Trace the order. Check the target." rail={rail}>
    <LessonToolbar label="Class examples" scenarios={classExamples.map(e => ({ id: e.id, label: e.label[0].toUpperCase() + e.label.slice(1), shortLabel: `Class ${e.classIndex}` }))} selectedId={state.image} onSelect={id => { setState({ ...state, image: id as LessonState["image"] }); setStored(null); setBaseline(null); setCompare("prepared"); clear(); }} onReset={() => start(experiment || transfer ? index : 0)} />
    <section className={sharedStyles.evidence} aria-label="Selected transform controls"><h2>Your transform</h2>
      <LessonSelect label="Selected transform" choices={transformIds.map(id => ({ id, label: transformNames[id] }))} value={selected} onChange={id => setSelected(id as TransformId)} /><p><strong>{s.enabled[selected] ? "Enabled" : "Disabled"}.</strong> Settings apply on the next run. Changing a disabled block’s settings only changes its future configuration.</p>{editor}<p className={styles.sample}>Selected sampled stage: <output aria-label="Selected sampled stage">{sampled?.detail ?? (run ? "Not enabled in this run." : "Run needed.")}</output></p>
      <div className={styles.actions}><LessonAction onClick={performRun} disabled={!currentInput || !!error}>Run pipeline</LessonAction><LessonAction onClick={() => { const next = { ...state, settings: { ...s, seed: s.seed === 9999 ? 1 : s.seed + 1 } }; setState(next); setStored(makeRun(next)); clear(); }} disabled={!currentInput || !!error}>New draw</LessonAction></div>
      <p role="status" aria-live="polite">{error ? "Pipeline blocked by input type." : run ? `Run ready. Replay seed ${s.seed}; ${run.stages.length} enabled stages.` : "Run needed for current settings. Setting changes invalidate the previous result."}</p>
    </section>
    <section className={sharedStyles.evidence} aria-label="Image comparison"><h2>Your image pipeline</h2><p>Prepare the entire photo as RGB 224×224, which can change its aspect ratio. Then apply enabled stages in order. This browser simulation does not execute PyTorch: its RNG, nearest-neighbor geometry and byte rounding differ from Python/PIL.</p>
      <LessonToggleGroup label="Left image comparison" choices={[{ id: "prepared", label: "Prepared photo" }, { id: "baseline", label: "Starting result" }]} value={compare} onChange={setCompare} />
      <div className={styles.images}><figure><figcaption>{compare === "prepared" ? "Prepared RGB 224×224" : "Starting result before action"}</figcaption><PixelImage pixels={leftPixels} label={`${example.label}, ${compare === "prepared" ? "prepared full photo" : "starting pipeline result"}`} /><p>Pixel signature <output aria-label="Left pixel signature">{leftPixels ? pixelSignature(leftPixels) : "not sampled"}</output></p></figure><figure><figcaption>Current composed result</figcaption><PixelImage pixels={run?.pixels ?? null} label={`${example.label}, current composed result. Consult sampled stages for operations and exact geometry.`} /><p>Pixel signature <output aria-label="Result pixel signature">{run ? pixelSignature(run.pixels) : "not sampled"}</output></p></figure></div>
      <p>Signatures summarize display bytes for comparison; equal signatures are not mathematical proof of equal images. ToTensor changes representation, so it keeps the display signature.</p>
      {loadError && <p role="alert">{loadError}</p>}{error && <p role="alert" className={styles.error}>{error}</p>}
      {parameter("Replay seed", "seed", 1, 9999, 1, "A reproducible browser draw, not a torch seed. Each operation has its own keyed stream so moving it keeps its sampled parameters fixed. It does not guarantee Python will draw the same values.")}

    </section>
    <section className={sharedStyles.evidence} aria-label="Transform composition"><h2>Transform pipeline, in order</h2><p>Enable a block to include it in the code. Move up/down works with mouse or keyboard. ToTensor and RandomErasing occupy the final type-safe positions.</p><ol className={styles.pipeline}>{s.order.map((id, i) => <li key={id} data-transform={id}><label><input type="checkbox" checked={s.enabled[id]} onChange={event => edit({ ...s, enabled: { ...s.enabled, [id]: event.currentTarget.checked } })} />{transformNames[id]}</label>{i < 8 ? <span><button type="button" aria-label={`Move ${transformNames[id]} up`} disabled={i === 0} onClick={() => edit(moveTransform(s, id, -1))}>↑ Up</button><button type="button" aria-label={`Move ${transformNames[id]} down`} disabled={i === 7} onClick={() => edit(moveTransform(s, id, 1))}>↓ Down</button></span> : <span className={styles.pinned}>Final position</span>}</li>)}</ol>

    </section>
    <LessonSummaries label="Pipeline and target evidence" summaries={[{ label: "Output representation", value: s.enabled["to-tensor"] ? "CHW" : "RGB", color: "#5031dc", definition: "Configured output type; requires a successful run to observe it.", formula: s.enabled["to-tensor"] ? "float32 [3,224,224] · byte/255" : "PIL-style uint8 [224,224,3]", comparison: "The browser displays byte pixels; Python creates the real tensor." }, { label: "Retained target", value: `[${vector.join(",")}]`, color: "#0c1230", definition: `One-hot target: a 1 only at class ${example.classIndex}, ${example.label}.`, formula: "The caller retains the selected target.", comparison: "An unchanged target does not guarantee a transform suits the task." }]} />
    <section className={sharedStyles.evidence} aria-label="Sampled transform evidence"><h2>Sampled stages</h2><p>Every row receives the previous row’s pixels. Changed-pixel counts compare a stage to its own input, not to the original photo. A sampled operation may leave pixels unchanged (for example Identity); enabled and visibly changed are different.</p>{run ? <ol className={styles.trace}>{run.stages.map(stage => <li key={stage.id} data-stage={stage.id}><strong>{transformNames[stage.id]}</strong><p>{stage.detail}</p><p className={`${sharedStyles.math} ${styles.mono}`}>Display signature {stage.signature} · changed pixels {stage.changedPixels} / {imageSize ** 2}</p></li>)}</ol> : <p>No current sampled trace. Run the valid pipeline.</p>}{run?.stages.length === 0 && <p>No enabled stages: prepared image passes through unchanged.</p>}
      {pixel && <details><summary>One pixel and tensor indexing</summary><p>Current output pixel at y=0, x=0: R={pixel[0]}, G={pixel[1]}, B={pixel[2]}. {s.enabled["to-tensor"] ? `CHW float values: [${Array.from(pixel, v => (v / 255).toFixed(6)).join(", ")}]. Flattened channel-first indices for this pixel: 0, 50176, 100352. Each of the three channels contains 50176 pixels; total values 150528.` : "Enable ToTensor to convert each byte to a float and change the layout."}</p></details>}
    </section>
    <section className={sharedStyles.evidence} aria-label="Torchvision code"><details><summary>Python configuration and simulation limits</summary><p>{error ? "Invalid configuration: enable ToTensor before using RandomErasing. Copy is blocked until repaired." : "Runnable torchvision v1 reference configuration for an RGB PIL input after explicit square preparation."} Replace example.jpg with your image. It uses Python’s RNG and torchvision/PIL kernels; the browser seed, samples and pixel signatures are not reproduced by this code. {!error && "Enabled stages have the required types and order."}</p><pre className={styles.code}><code>{code}</code></pre><LessonAction disabled={!!error} onClick={async () => { try { await navigator.clipboard.writeText(code); setCopyStatus("Python configuration copied."); } catch { setCopyStatus("Copy unavailable. Select and copy the visible Python code."); } }}>Copy Python code</LessonAction><p role="status">{copyStatus}</p><p>Browser geometries use nearest-neighbor sampling with black fill, crop rejection/fallback and reflected 5×5 Gaussian blur. Color operations use per-stage display-byte arithmetic. Python/PIL interpolation, float precision and RNG differ. All fourteen predefined policy operations are available: Identity, ShearX/Y, TranslateX/Y, Rotate, Brightness, Color, Contrast, Sharpness, Posterize, Solarize, AutoContrast, Equalize. RandAugment names may repeat; no learning is performed.</p></details></section>
  </LearningPage>;
}
