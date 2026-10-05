"use client";

import {useMemo,useState} from "react";
import { ExperimentButton, ExperimentChoices, ExperimentRail, ExperimentResult, LearningPage, LessonRangeControl, LessonSummaries, LessonToolbar } from "@/components/learning-page/learning-page";
import { GuidedExperiment } from "@/components/learning-page/guided-experiment";
import sharedStyles from "@/components/learning-page/learning-page.module.css";
import {analyzeTemperature,formatPercent,setLogit} from "./softmax-temperature-engine";
import {softmaxClasses,softmaxPresets} from "./scenario";
import {softmaxDefaults,softmaxExperiments,type SoftmaxState} from "./learning-experiments";
import styles from "./playground.module.css";

const same=(a:SoftmaxState,b:SoftmaxState)=>Math.abs(a.temperature-b.temperature)<1e-9&&softmaxClasses.every(c=>Math.abs(a.logits[c.id]-b.logits[c.id])<1e-9);
const number=(value:number)=>value!==0&&Math.abs(value)<.0001?value.toExponential(4):Number(value.toFixed(6)).toString();

export function SoftmaxTemperaturePlayground(){
  const [state,setState]=useState<SoftmaxState>(softmaxDefaults);
  const [index,setIndex]=useState(0);
  const [prediction,setPrediction]=useState<string|null>(null);
  const [explanation,setExplanation]=useState<string|null>(null);
  const [transferAnswer,setTransferAnswer]=useState<string|null>(null);
  const a=useMemo(()=>analyzeTemperature(softmaxClasses,state.logits,state.temperature),[state]);
  const experiment=softmaxExperiments[index],transfer=index===3;
  const reached=!!prediction&&!!experiment&&same(state,experiment.target);
  const complete=reached&&explanation===experiment?.correctExplanation;
  const transferTarget:SoftmaxState={preset:"close-call",logits:softmaxPresets[2].logits,temperature:.25};
  const transferReached=same(state,transferTarget);
  const selectedPreset=softmaxPresets.find(p=>softmaxClasses.every(c=>p.logits[c.id]===state.logits[c.id]));
  function clear(){setExplanation(null);setTransferAnswer(null)}
  function start(next=index){setIndex(next);setState(softmaxExperiments[next]?.baseline??softmaxDefaults);setPrediction(null);clear()}
  function edit(next:SoftmaxState){setState(next);clear()}
  const rail=experiment?<GuidedExperiment label={`Experiment ${index+1} of 3`} experiment={experiment}
    reached={reached} complete={complete} prediction={prediction} explanation={explanation}
    predictionName="softmax-prediction" explanationName="softmax-explanation"
    onPredict={id=>{start();setPrediction(id)}} onExplain={setExplanation}
    predictionHelp={<>Choosing a prediction restores the experiment’s starting scores and Temperature.</>} observation={prediction===experiment.correctPrediction?"Your prediction matches the evidence.":"The probabilities challenge your prediction. Compare the score ranking and the largest share."}
    onNext={()=>start(index+1)} nextLabel={index===2?"Try the transfer check":"Next experiment"} />:<ExperimentRail label={transfer?"Transfer check":"Free exploration"} title={transfer?"A close call stays uncertain":"Explore relative scores"}>
    {transfer?<><p>Choose Close Call and set Temperature to 0.25. Is the largest class certain, even at this lowest allowed temperature?</p><ExperimentChoices legend="Transfer explanation" name="softmax-transfer" choices={[{id:"finite",label:"No. Rover remains largest at about 48.73%; the other finite weights still get positive probability."},{id:"certain",label:"Yes. The lowest temperature guarantees 100% for Rover."},{id:"accuracy",label:"Yes. Softmax proves that Rover is the correct class."}]} value={transferAnswer} onChange={setTransferAnswer}/>{transferAnswer&&(!transferReached?<p role="status" className={sharedStyles.feedback}>First choose Close Call and set Temperature to 0.25.</p>:transferAnswer!=="finite"?<p role="status" className={sharedStyles.feedback}>Try again. The displayed largest share is below 100%, and no actual class label is supplied.</p>:<><ExperimentResult title="Transfer explained">Rover leads with about 48.73%, while Comet, Harbor and Signal retain positive probability. Lower temperature concentrates relative scores; it guarantees neither certainty nor correctness.</ExperimentResult><ExperimentButton onClick={()=>setIndex(4)}>Explore freely</ExperimentButton></>)}</>:<><p>Compare presets, score edits and Temperature separately. Equal logits stay uniform; a shared offset to every logit leaves probabilities unchanged because its exponential factor cancels from numerator and denominator.</p><ExperimentButton onClick={()=>start(0)}>Restart experiments</ExperimentButton></>}
  </ExperimentRail>;

  return <LearningPage title="Softmax Temperature Lab" subtitle="Change concentration. Keep the ranking." rail={rail}>
    <LessonToolbar label="Logit patterns" scenarios={softmaxPresets} selectedId={selectedPreset?.id??"edited"} onSelect={id=>{const preset=softmaxPresets.find(p=>p.id===id)!;edit({preset:id,logits:preset.logits,temperature:.7})}} onReset={()=>start(experiment||transfer?index:0)}/>
    <p className={styles.context}>Logits are raw scores, which can be negative. Softmax turns their relative sizes into positive probabilities that sum to one. {selectedPreset?selectedPreset.description:"Edited scores: compare their relative sizes."} Each preset loads its scores and Temperature 0.70.</p>
    <LessonRangeControl label="Temperature" min={.25} max={3} step={.05} value={state.temperature} onChange={temperature=>edit({...state,temperature})} help="With scores fixed, positive Temperature preserves their ranking and ties. Higher values move the distribution toward uniformity."/>
    <div className={styles.logits} aria-label="Four raw scores">{softmaxClasses.map(c=><LessonRangeControl key={c.id} label={`${c.label} logit`} min={-3} max={3} step={.05} value={state.logits[c.id]} onChange={value=>edit({...state,logits:setLogit(state.logits,c.id,value)})} help="Raw score; it need not be a probability."/>)}</div>
    <section className={styles.probabilities} aria-label="Class probabilities"><h2>Class probabilities</h2><p>One shared 0–100% scale. Every class shares the same normalizing total.</p><div className={styles.axis}><span/><div><span>0%</span><span>50%</span><span>100%</span></div><span/></div>{softmaxClasses.map(c=><div key={c.id} className={styles.barRow}><strong>{c.label}</strong><div className={styles.track} role="img" aria-label={`${c.label}: probability ${formatPercent(a.probabilities[c.id])}`}><span style={{width:`${Number((100*a.probabilities[c.id]).toPrecision(6))}%`}}/></div><output>{formatPercent(a.probabilities[c.id])}</output></div>)}</section>
    <LessonSummaries label="Probability summary" summaries={[{label:a.topClasses.length>1?"Tied largest classes":"Largest class",value:a.topClasses.map(c=>c.label).join(", "),color:"#1760db",definition:"Every class with the largest raw score.",formula:a.topClasses.length>1?"Equal largest logits → equal largest probabilities":"Positive Temperature preserves the score ranking.",comparison:"Changing a logit can change the leader."},{label:"Largest probability",value:formatPercent(a.maxProbability),color:"#5031dc",definition:"The largest share of the normalized distribution.",formula:"Positive weights / total weight",comparison:"Concentration is not measured accuracy."}]}/>
    <section className={styles.optional} aria-label="Supporting softmax evidence"><details><summary>Worked normalization</summary><p>For each class, p = exp(logit / T) / sum of all four exp(logit / T). exp(x) is e raised to x and is always positive. Subtracting the largest scaled logit from every scaled logit gives the same probabilities while avoiding large exponentials.</p><p>Shifted weight = exp(scaled logit − largest scaled logit). Weight total ≈ {number(a.expTotal)}. Probability = shifted weight / total.</p><div className={styles.scroller} role="region" aria-label="Scrollable normalization table" tabIndex={0}><table><caption>Computed values rounded for display. Probabilities and bar lengths use unrounded calculations; displayed shares may not total exactly 100%.</caption><thead><tr><th scope="col">Class</th><th scope="col">Logit</th><th scope="col">Scaled logit</th><th scope="col">Shifted weight</th><th scope="col">Probability (%)</th></tr></thead><tbody>{softmaxClasses.map(c=><tr key={c.id}><th scope="row">{c.label}</th><td>{state.logits[c.id]}</td><td>{number(a.scaledLogits[c.id])}</td><td>{number(a.expValues[c.id])}</td><td>{formatPercent(a.probabilities[c.id])}</td></tr>)}</tbody></table></div></details><details><summary>Entropy and spread</summary><p>Entropy measures distribution spread: H = −sum(p × ln p). ln is the natural logarithm; this choice measures H in units called nats. Here H ≈ <strong>{number(a.entropy)} nats</strong>.</p><p>Four equal probabilities give the maximum H = ln(4) ≈ 1.386294 nats. Relative spread H / ln(4) ≈ <strong>{formatPercent(a.entropyRatio)}</strong>. Higher Temperature cannot decrease entropy for fixed scores. Equal scores already have maximum entropy, so changing Temperature leaves them uniform.</p><p>Entropy measures spread, not correctness. It does not reveal whether a class is actually true.</p></details></section>
    <p className={styles.context}>Percentages are rounded to two decimal places; positive tiny values use &lt;0.01% and values just below one use &gt;99.99%. These class probabilities do not establish accuracy or calibration. No actual class labels are provided.</p>
    <p role="status" aria-live="polite" aria-atomic="true" className={sharedStyles.liveUpdate}>Temperature {state.temperature}. {softmaxClasses.map(c=>`${c.label} logit ${state.logits[c.id]}, probability ${formatPercent(a.probabilities[c.id])}`).join("; ")}. Largest {a.topClasses.map(c=>c.label).join(", ")}; largest probability {formatPercent(a.maxProbability)}.</p>
  </LearningPage>;
}
