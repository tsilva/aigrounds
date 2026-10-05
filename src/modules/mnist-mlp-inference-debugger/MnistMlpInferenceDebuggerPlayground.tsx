"use client";
import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { ExperimentButton, ExperimentChoices, ExperimentRail, ExperimentResult, LearningPage, LessonAction, LessonRangeControl, LessonSelect, LessonSummaries, LessonToggleGroup, LessonToolbar } from "@/components/learning-page/learning-page";
import { GuidedExperiment } from "@/components/learning-page/guided-experiment";
import shared from "@/components/learning-page/learning-page.module.css";
import { computeInputSaliency, parseOnnxMlpModel, preprocessMnistInput, runMlpWebGpuDebug, topContributors, type ForwardDebug, type MlpModel, type MnistPreprocessingMode } from "./mnist-mlp-engine";
import { blankInput, defaultModelUrl, paintStroke, referenceSeven } from "./scenario";
import { mnistExperiments } from "./learning-experiments";
import { ContributionMatrix, NetworkPreview, number as f } from "./TraceViews";
import styles from "./playground.module.css";
const sameInput=(a:Float32Array,b:Float32Array)=>a.every((x,i)=>x===b[i]);
const errorText=(e:unknown)=>e instanceof Error?e.message:"Unable to run this model.";
export function MnistMlpInferenceDebuggerPlayground() {
  const [input,setInput]=useState<Float32Array>(()=>referenceSeven.slice()),[kind,setKind]=useState("seven"),[mode,setMode]=useState<MnistPreprocessingMode>("mnist-standard");
  const [model,setModel]=useState<MlpModel|null>(null),[loading,setLoading]=useState(true),[loadError,setLoadError]=useState("");
  const [revision,setRevision]=useState(0),[result,setResult]=useState<{revision:number;debug:ForwardDebug}|null>(null),[running,setRunning]=useState(false),[runError,setRunError]=useState("");
  const epoch=useRef(0),loadRequest=useRef(0),defaultModel=useRef<MlpModel|null>(null);
  const [pixel,setPixel]=useState(0),[layer,setLayer]=useState(0),[neuron,setNeuron]=useState(0),[source,setSource]=useState(0),[tool,setTool]=useState("draw");
  const [threshold,setThreshold]=useState(.02),[topK,setTopK]=useState(20),[networkOpen,setNetworkOpen]=useState(false),[matrixOpen,setMatrixOpen]=useState(false),[saliencyOpen,setSaliencyOpen]=useState(false),[saliencyAction,setSaliencyAction]=useState(false);
  const [index,setIndex]=useState(0),[prediction,setPrediction]=useState<string|null>(null),[explanation,setExplanation]=useState<string|null>(null),[transferAnswer,setTransferAnswer]=useState<string|null>(null);
  const stroke=useRef<{x:number;y:number}|null>(null);
  const debug=result?.revision===revision&&!loading?result.debug:null;
  const transformed=useMemo(()=>preprocessMnistInput(input,mode),[input,mode]);
  const saliency=useMemo(()=>model&&debug?computeInputSaliency(model,debug,mode):null,[model,debug,mode]);
  const sensitive=saliency?Array.from(saliency,(_,i)=>i).reduce((best,i)=>Math.abs(saliency[i])>Math.abs(saliency[best])?i:best,0):0;
  const experiment=mnistExperiments[index],transfer=index===5;
  const standardSeven=mode==="mnist-standard"&&sameInput(input,referenceSeven);
  const defaultReady=!!debug&&model===defaultModel.current;
  const reached=!!prediction&&defaultReady&&(
    index===0?mode==="mnist-standard"&&sameInput(input,blankInput):
    index===1?standardSeven:
    index===2?standardSeven&&layer===0&&neuron===1:
    index===3?standardSeven&&networkOpen&&threshold===1&&topK===1:
    index===4?standardSeven&&saliencyOpen&&saliencyAction&&pixel===sensitive:false);
  const complete=reached&&explanation==="0";
  const transferReached=defaultReady&&mode==="raw"&&pixel===0&&input.every((v,i)=>v===(i===0?Math.fround(.1):0));
  function clearAnswers(){setExplanation(null);setTransferAnswer(null);}
  function invalidate(){epoch.current++;setRevision(epoch.current);setResult(null);setRunning(false);setRunError("");clearAnswers();}
  function replaceInput(next:Float32Array,nextKind="custom"){invalidate();setInput(next);setKind(nextKind);setSaliencyAction(false);}
  function selectPixel(i:number){setPixel(i);clearAnswers();setSaliencyAction(false);}
  function selectNeuron(l:number,n:number){setLayer(l);setNeuron(n);setSource(0);clearAnswers();}
  function restore(next=index) {
    invalidate();setInput(next===5?blankInput.slice():referenceSeven.slice());setKind(next===5?"blank":"seven");
    setMode(next===1||next===5?"raw":"mnist-standard");setPixel(0);setLayer(0);setNeuron(0);setSource(0);setTool("draw");
    setThreshold(.02);setTopK(20);setNetworkOpen(false);setMatrixOpen(false);setSaliencyOpen(false);setSaliencyAction(false);setPrediction(null);
  }
  function start(next=0){setIndex(next);restore(next);if(defaultModel.current){loadRequest.current++;setLoading(false);setLoadError("");setModel(defaultModel.current);}else void loadDefault();}
  async function loadDefault(){
    const request=++loadRequest.current;invalidate();setLoading(true);setLoadError("");
    try {const response=await fetch(defaultModelUrl);if(!response.ok)throw new Error(`Default model download failed (${response.status}).`);const parsed=parseOnnxMlpModel(await response.arrayBuffer(),"Default MNIST MLP");defaultModel.current=parsed;if(request===loadRequest.current)setModel(parsed);}
    catch(e){if(request===loadRequest.current)setLoadError(errorText(e));}
    finally{if(request===loadRequest.current)setLoading(false);}
  }
  useEffect(()=>{
    let active=true;const request=++loadRequest.current;
    (async()=>{try{const response=await fetch(defaultModelUrl);if(!response.ok)throw new Error(`Default model download failed (${response.status}).`);const parsed=parseOnnxMlpModel(await response.arrayBuffer(),"Default MNIST MLP");if(active){defaultModel.current=parsed;if(request===loadRequest.current)setModel(parsed);}}catch(e){if(active&&request===loadRequest.current)setLoadError(errorText(e));}finally{if(active&&request===loadRequest.current)setLoading(false);}})();
    return()=>{active=false;};
  },[]);
  useEffect(()=>{
    if(!model||loading)return;
    let active=true;const runRevision=revision;
    const timer=setTimeout(async()=>{
      if(!active)return;setRunning(true);
      try{const next=await runMlpWebGpuDebug(model,transformed);if(active&&epoch.current===runRevision){setResult({revision:runRevision,debug:next});setRunError("");}}
      catch(e){if(active&&epoch.current===runRevision){setResult(null);setRunError(errorText(e));}}
      finally{if(active&&epoch.current===runRevision)setRunning(false);}
    },350);
    return()=>{active=false;clearTimeout(timer);};
  },[model,transformed,revision,loading]);
  async function upload(file:File){
    const request=++loadRequest.current;invalidate();setLoading(true);setLoadError("");
    try{const parsed=parseOnnxMlpModel(await file.arrayBuffer(),file.name);if(request===loadRequest.current){setModel(parsed);setIndex(6);setPrediction(null);setLayer(0);setNeuron(0);setSource(0);}}
    catch(e){if(request===loadRequest.current)setLoadError(`Upload rejected: ${errorText(e)} The previous model is retained.`);}
    finally{if(request===loadRequest.current)setLoading(false);}
  }
  function brightness(value:number){if(Math.fround(value)===input[pixel])return;const next=input.slice();next[pixel]=value;replaceInput(next);}
  function position(event:PointerEvent<SVGSVGElement>){const r=event.currentTarget.getBoundingClientRect();return{x:Math.max(0,Math.min(27.999,(event.clientX-r.left)*28/r.width)),y:Math.max(0,Math.min(27.999,(event.clientY-r.top)*28/r.height))};}
  const selectedLayer=model?.layers[layer],previous=layer===0?transformed:debug?.activations[layer-1];
  const terms=selectedLayer&&previous&&debug?topContributors(selectedLayer,previous,neuron,5):[];
  const sum=selectedLayer&&previous&&debug?Array.from(previous,(v,i)=>v*selectedLayer.weights[i*selectedLayer.outputSize+neuron]).reduce((a,b)=>a+b,0):0;
  const rest=sum-terms.reduce((a,t)=>a+t.contribution,0);
  const z=debug?.preActivations[layer][neuron],activation=debug?.activations[layer][neuron];
  const rail=experiment?<GuidedExperiment label={`Experiment ${index+1} of 5`} experiment={experiment}
    reached={reached} complete={complete} prediction={prediction} explanation={explanation}
    predictionName="mnist-prediction" explanationName="mnist-explanation"
    onPredict={id=>{restore();setPrediction(id);}} onExplain={setExplanation}
    predictionHelp={<>A different prediction restores starting settings. Reset restarts this experiment.</>} observation={prediction==="0"?"Your prediction matches the evidence.":"The computed evidence challenges your prediction."}
    onNext={()=>start(index+1)} nextLabel={index===4?"Try the transfer check":"Next experiment"} />:<ExperimentRail label={transfer?"Transfer check":"Free exploration"} title={transfer?"Intervene without training":"Inspect your model"}>
    {transfer?<><p>Blank starts in Raw 0..1. Predict what editing pixel 0 does. Set Brightness to 0.1, wait for the new WebGPU run, then explain without Guide help.</p><ExperimentChoices legend="Transfer explanation" name="mnist-transfer" choices={[{id:"fixed",label:"The input changes and the fixed weights compute new scores. Nothing is learned; a large probability on this unusual image still does not certify a digit or correctness."},{id:"trained",label:"The new run trains the weights on pixel 0."},{id:"proof",label:"The largest probability proves the edited blank is that digit."}]} value={transferAnswer} onChange={setTransferAnswer}/>{transferAnswer&&(!transferReached?<p role="status" className={shared.feedback}>First set pixel 0’s Brightness to 0.1 in Raw 0..1, keep all other pixels zero and wait for WebGPU. Reset restores the transfer start.</p>:transferAnswer!=="fixed"?<p role="status" className={shared.feedback}>Try again. The model file and weights stay fixed. Only the input is edited; softmax is still a relative ten-class distribution.</p>:<><ExperimentResult title="Transfer explained">An intervention changes the input and reruns fixed inference. It neither trains the classifier nor calibrates its probabilities. Local saliency and the observed finite intervention answer different questions.</ExperimentResult><ExperimentButton onClick={()=>{setIndex(6);clearAnswers();}}>Explore freely</ExperimentButton></>)}</>:<><p>Draw, erase, edit any pixel, or inspect every neuron. Uploading a supported model enters free exploration. Reset restores the reference input and retains your uploaded model. Restart experiments explicitly restores the default model.</p><ExperimentButton onClick={()=>start(0)}>Restart experiments</ExperimentButton></>}
  </ExperimentRail>;
  return <LearningPage title="MNIST MLP Inference Debugger" subtitle="Draw an input. Trace fixed weights. Question the prediction." rail={rail}>
    <LessonToolbar scenarios={[{id:"seven",label:"Reference seven",shortLabel:"Hand-drawn fixture"},{id:"blank",label:"Blank",shortLabel:"Zero brightness"}]} selectedId={kind} onSelect={id=>replaceInput(id==="blank"?blankInput.slice():referenceSeven.slice(),id)} onReset={()=>experiment||transfer?start(index):restore(6)}/>
    <section className={shared.evidence} aria-label="Input and class probabilities"><h2>Your dataset · 28×28 brightness values</h2><p>784 pixels feed a fixed dense neural network. Draw a digit or inspect the blank input. Automatic WebGPU inference runs after edits stop.</p>
    <div className={styles.primary}><div><svg className={styles.input} viewBox="0 0 28 28" role="img" tabIndex={0} aria-label="Editable 28 by 28 input" aria-describedby="mnist-pixel-help"
      onPointerDown={e=>{e.preventDefault();e.currentTarget.focus({preventScroll:true});e.currentTarget.setPointerCapture(e.pointerId);const p=position(e);stroke.current=p;setPixel(Math.floor(p.y)*28+Math.floor(p.x));replaceInput(paintStroke(input,p,p,tool==="erase"));}}
      onPointerMove={e=>{if(!stroke.current)return;const p=position(e);const next=paintStroke(input,stroke.current,p,tool==="erase");stroke.current=p;setPixel(Math.floor(p.y)*28+Math.floor(p.x));replaceInput(next);}}
      onPointerUp={()=>{stroke.current=null;}} onPointerCancel={()=>{stroke.current=null;}}
      onKeyDown={e=>{const offset={ArrowLeft:-1,ArrowRight:1,ArrowUp:-28,ArrowDown:28}[e.key];if(offset!==undefined){e.preventDefault();selectPixel(Math.max(0,Math.min(783,pixel+offset)));}else if(e.key==="Home"||e.key==="End"){e.preventDefault();selectPixel(e.key==="Home"?0:783);}else if(e.key===" "||e.key==="Enter"){e.preventDefault();brightness(tool==="erase"?0:1);}}}>
      <rect width="28" height="28" fill="#090d20"/>{Array.from(input,(v,i)=><rect key={i} x={i%28} y={Math.floor(i/28)} width="1" height="1" fill={`rgb(${Math.round(v*255)} ${Math.round(v*255)} ${Math.round(v*255)})`}/>)}<rect className={styles.pixelSelection} x={pixel%28} y={Math.floor(pixel/28)} width="1" height="1"/>
    </svg><div className={styles.actions}><LessonToggleGroup label="Paint tool" choices={[{id:"draw",label:"Draw"},{id:"erase",label:"Erase"}]} value={tool} onChange={setTool}/><LessonAction onClick={()=>replaceInput(blankInput.slice(),"blank")}>Clear</LessonAction></div></div>
    <div><h2>Class probabilities</h2>{debug?<><div className={styles.bars} aria-label="Softmax probability for each digit">{Array.from(debug.probabilities,(p,i)=><div key={i} className={styles.barRow} data-probability={p} data-logit={debug.logits[i]}><span>{i}</span><div className={styles.barTrack} aria-hidden="true"><div className={styles.bar} style={{width:`${(p*100).toPrecision(6)}%`}}/></div><span>{p>0&&p<.00001?(p*100).toExponential(3): (p*100).toFixed(4)}%</span></div>)}</div><p data-output-summary>Largest: digit {debug.predictedClass}, {(debug.confidence*100).toFixed(4)}%. This compares ten supplied classes; it does not verify correctness or digit presence.</p></>:<p>No current output. Waiting for a successful model load and WebGPU run.</p>}</div></div>
    <p id="mnist-pixel-help">Keyboard: arrow keys move the outlined pixel, Home/End select the first/last pixel, Space or Enter paints with the selected tool. The exact editors below reach every pixel. Row and column indices start at zero.</p>
    <div className={shared.controlGrid}><LessonRangeControl label="Pixel index" value={pixel} min={0} max={783} step={1} help="Row-major: index = row×28 + column. Selection does not edit the image." onChange={selectPixel}/><LessonRangeControl label="Brightness" value={Number(input[pixel].toFixed(4))} min={0} max={1} step={.0001} help={`Edit pixel ${pixel}: row ${Math.floor(pixel/28)}, column ${pixel%28}. Zero is black, one is white.`} onChange={brightness}/></div>
    <LessonToggleGroup label="Input preprocessing" choices={[{id:"mnist-standard",label:"MNIST norm"},{id:"raw",label:"Raw 0..1"}]} value={mode} onChange={id=>{if(id!==mode){invalidate();setMode(id as MnistPreprocessingMode);setSaliencyAction(false);}}}/>
    <p className={`${shared.math} ${styles.formula}`} data-preprocessed>{mode==="raw"?`Pixel ${pixel}: raw ${f(input[pixel])} → input ${f(transformed[pixel])}`:`Pixel ${pixel}: (${f(input[pixel])} − 0.1307) / 0.3081 = ${f(transformed[pixel])}`}</p><p>MNIST norm follows the default model’s input contract. An uploaded model may require a different convention; changing this setting changes inputs, never weights.</p>
    <p role="status" className={styles.status} data-run-status>{loading?"Loading model…":running?"Running WebGPU…":debug?`Current WebGPU run · revision ${revision} · all hidden and output values from this run`:runError?"WebGPU run failed.":"Waiting for WebGPU…"}</p>{runError&&<p role="alert" className={styles.error}>{runError}</p>}<LessonAction disabled={loading||!model} onClick={invalidate}>Run now</LessonAction>
    </section>
    <section className={shared.evidence} aria-label="Model and upload"><h2>Model · fixed inference parameters</h2>{model?<p data-model-description>{model.fileName}: {model.inputSize} → {model.layers.map(l=>l.outputSize).join(" → ")}. {model.foldedBatchNorm?"Frozen BatchNorm is folded into effective weights and biases.":"No folded BatchNorm."} {model.outputTransform!=="logits"?`The model ends with ${model.outputTransform}; this debugger traces pre-transform class scores and computes softmax once.`:"Final outputs are class scores (logits), followed here by softmax."}</p>:<p>No model is loaded.</p>}
    <div className={styles.drop} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const file=e.dataTransfer.files[0];if(file)void upload(file);}}><label>Upload ONNX model <input type="file" accept=".onnx" onChange={e=>{const file=e.currentTarget.files?.[0];if(file)void upload(file);e.currentTarget.value="";}}/></label><p>Choose a file or drop it here. A successful upload enters free exploration.</p></div>{loadError&&<p role="alert" className={styles.error}>{loadError}</p>}{!model&&!loading&&<LessonAction onClick={()=>void loadDefault()}>Retry default model</LessonAction>}
    </section>
    {model&&debug&&selectedLayer&&<><section className={shared.evidence} aria-label="Neuron inspection"><h2>Follow one neuron</h2><div className={shared.controlGrid}><LessonSelect label="Layer" value={String(layer)} choices={model.layers.map((l,i)=>({id:String(i),label:`Layer ${i+1} · ${l.inputSize}→${l.outputSize} · ${l.activation}`}))} onChange={id=>selectNeuron(Number(id),0)}/><LessonRangeControl label="Neuron index" value={neuron} min={0} max={selectedLayer.outputSize-1} step={1} help="Inspect every actual neuron. Zero-based indices; selection does not change inference." onChange={n=>selectNeuron(layer,n)}/></div>
    <div className={`${shared.tableScroll} ${styles.table}`}><table><caption>Five largest absolute contributions to layer {layer+1}, neuron {neuron}. All signs are retained.</caption><thead><tr><th scope="col">Source</th><th scope="col">Activation</th><th scope="col">Effective weight</th><th scope="col">Product</th></tr></thead><tbody>{terms.map(t=><tr key={t.neuron} data-term={t.neuron}><th scope="row">{t.neuron}</th><td>{f(t.activation)}</td><td>{f(t.weight)}</td><td>{f(t.contribution)}</td></tr>)}</tbody></table></div>
    <p className={`${shared.math} ${styles.formula}`} data-rest>Rest of sum ({selectedLayer.inputSize-terms.length} other terms): {f(rest)}</p><p className={`${shared.math} ${styles.formula}`} data-sum>Weighted sum (all {selectedLayer.inputSize} terms): {f(sum)}</p><p className={`${shared.math} ${styles.formula}`} data-neuron-z>Bias {f(selectedLayer.bias[neuron])}; GPU z = {f(z!)}; {selectedLayer.activation}(z) = {f(activation!)}</p><p>z = sum of all activation×effective-weight terms + bias. The table is a view; no terms are discarded. The displayed full sum is recomputed from this run’s GPU inputs and effective parameters; float32 accumulation on GPU and six-decimal substitutions can differ in the last decimals.</p></section>
    <LessonSummaries label="Current computation" summaries={[{label:"Input values",color:"#1470ba",value:"784",definition:"28 rows × 28 columns of brightness, then the selected preprocessing.",formula:"index = row×28 + column"},{label:"Inspected activation",color:"#5031dc",value:f(activation!),definition:`Layer ${layer+1}, neuron ${neuron}: ${selectedLayer.activation} applied to z.`,formula:"z = Σ activation×weight + bias"},{label:"Largest probability",color:"#167d59",value:`${(debug.confidence*100).toFixed(2)}%`,definition:`Digit ${debug.predictedClass}, relative to the ten supplied classes.`,formula:"pᵢ = exp(scoreᵢ) / Σexp(score)",comparison:"This is neither verified accuracy nor a calibrated chance of correctness."}]}/>
    <section className={shared.evidence}><details open={networkOpen} onToggle={e=>{if(e.currentTarget.open!==networkOpen){setNetworkOpen(e.currentTarget.open);clearAnswers();}}}><summary>Network preview</summary><div className={shared.controlGrid}><LessonRangeControl label="Contribution threshold" value={threshold} min={0} max={1} step={.01} help="View only: retain contributions at or above this fraction of the target’s largest absolute term." onChange={v=>{setThreshold(v);clearAnswers();}}/><LessonRangeControl label="Top-K" value={topK} min={1} max={20} step={1} help="View only: rank at most this many incoming contributions per target before restricting to displayed nodes." onChange={v=>{setTopK(v);clearAnswers();}}/></div><NetworkPreview model={model} debug={debug} input={transformed} layer={layer} neuron={neuron} pixel={pixel} threshold={threshold} topK={topK} onNeuron={selectNeuron} onPixel={selectPixel}/></details>
    <details open={matrixOpen} onToggle={e=>{if(e.currentTarget.open!==matrixOpen){setMatrixOpen(e.currentTarget.open);clearAnswers();}}}><summary>Sampled contribution matrix</summary><ContributionMatrix model={model} debug={debug} input={transformed} layer={layer} neuron={neuron} source={source} onSource={v=>{setSource(v);clearAnswers();}} onNeuron={n=>{setNeuron(n);clearAnswers();}}/></details>
    <details open={saliencyOpen} onToggle={e=>{if(e.currentTarget.open!==saliencyOpen){setSaliencyOpen(e.currentTarget.open);clearAnswers();}}}><summary>Local score saliency</summary><p>A gradient is a local rate of change. Here it targets digit {debug.predictedClass}’s pre-softmax score with raw pixel brightness, including preprocessing. Blue is positive, pink negative; darker means greater absolute sensitivity. It is not a probability gradient, correctness test, or proof of global pixel importance. Larger finite edits can cross activation boundaries; ReLU’s derivative at zero is taken as zero.</p>{saliency&&<svg className={styles.saliency} viewBox="0 0 28 28" role="img" aria-label="Local predicted-score gradient by pixel; exact selected gradient follows">{Array.from(saliency,(g,i)=><rect key={i} aria-hidden="true" x={i%28} y={Math.floor(i/28)} width="1" height="1" fill={g>=0?"#1470ba":"#c23969"} opacity={Math.abs(g)/Math.max(...saliency.map(Math.abs),1e-12)} onClick={()=>selectPixel(i)}><title>{`Pixel ${i}, signed score gradient ${f(g)}`}</title></rect>)}<rect className={styles.pixelSelection} x={pixel%28} y={Math.floor(pixel/28)} width="1" height="1"/></svg>}<div className={styles.actions}><LessonAction onClick={()=>{setPixel(sensitive);setSaliencyAction(true);clearAnswers();}}>Most sensitive pixel</LessonAction></div><p className={`${shared.math} ${styles.formula}`} data-saliency>{`Pixel ${pixel}: brightness ${f(input[pixel])}; signed score gradient ${f(saliency![pixel])}`}</p><p>Inspect any pixel with Pixel index above. Selection leaves the input and probabilities unchanged; changing Brightness triggers a fresh inference.</p></details></section></>}
    <section className={shared.evidence}><details><summary>Supported models and interpretation</summary><p>The importer supports a single sequential float32 ONNX path (opsets 13–21): singleton-batch 784-value input, dense Gemm/MatMul, broadcast bias/Add, frozen inference BatchNorm, one ReLU/Sigmoid/Tanh per dense layer, and ten final linear scores with optional terminal Softmax/LogSoftmax. Compatible flatten, constant reshape, identity, float32 cast and inference-only dropout are validated. Branches, unknown operators, training behavior, unsupported shapes and nonfinite parameters are rejected explicitly.</p><p>Ten outputs alone do not establish digit labels or input preprocessing. Uploads must use class order 0–9 and the chosen input convention. Model download/network access and WebGPU hardware are required; no CPU fallback or optimizer runs. Hidden traces and logits come from one GPU run; saliency differentiates that fixed model locally. Frozen BatchNorm folding is equivalent in real arithmetic, with possible float32 differences.</p><p><a href="https://huggingface.co/tsilva/mnist-mlp-classifier" target="_blank" rel="noreferrer">Default model card</a> · <a href="https://onnx.ai/onnx/operators/onnx__Gemm.html" target="_blank" rel="noreferrer">ONNX Gemm definition</a></p></details></section>
  </LearningPage>;
}
