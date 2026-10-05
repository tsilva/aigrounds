"use client";
import { useState } from "react";
import { BridgeExperiments } from "@/components/learning-page/bridge-experiments";
import { LearningPage, LessonAction, LessonRangeControl, LessonSummaries, LessonToggleGroup, LessonToolbar } from "@/components/learning-page/learning-page";
import shared from "@/components/learning-page/learning-page.module.css";
import { createTraining, initialParameters, parameterNames, runTrainingEpoch, stepTraining, trainingData, trainingLosses, trainingScenarios, type TrainingState } from "./training-engine";
import { trainingExperiments, trainingTransfer } from "./learning-experiments";
import styles from "./playground.module.css";
const fmt = (n: number) => n.toFixed(6);
const stages = ["Forward", "Loss", "Backward", "Update"];

export function TrainingPlayground() {
  const [state, setState] = useState(createTraining), [index, setIndex] = useState(0);
  const [prediction, setPrediction] = useState<string | null>(null), [explanation, setExplanation] = useState<string | null>(null), [answer, setAnswer] = useState<string | null>(null);
  const data = trainingData(state.scenario), losses = trainingLosses(state);
  const reached = index === 0 ? state.stage === 1 && state.updates === 0 : index === 1 ? state.epoch === 1 && state.updates === 2 : state.batchSize === 4 && state.epoch === 1 && state.updates === 1;
  function clear() { setExplanation(null); setAnswer(null); }
  function start(next = index) { setIndex(next); setState(createTraining(next === 3 ? "shifted" : "standard")); setPrediction(null); clear(); }
  function edit(next: TrainingState) { setState(next); clear(); }
  const maxLoss = Math.max(1, ...state.history.flatMap(row => [row.train, row.validation]));
  const px = (update: number) => 55 + update / Math.max(1, state.updates) * 560;
  const py = (loss: number) => 205 - loss / maxLoss * 160;
  return <LearningPage title="The Training Loop" subtitle="Step a batch. Watch weights change." rail={<BridgeExperiments experiments={trainingExperiments} index={index}
    prediction={prediction} explanation={explanation} reached={reached} onPredict={id => { start(); setPrediction(id); }} onExplain={setExplanation}
    onNext={() => start(index + 1)} onRestart={() => start(0)} transfer={trainingTransfer}
    transferReached={state.scenario === "shifted" && state.rate === 0 && state.epoch === 1 && state.updates === 2}
    transferAnswer={answer} onTransfer={setAnswer} />}>
    <LessonToolbar scenarios={trainingScenarios} selectedId={state.scenario} onSelect={id => edit(createTraining(id, state.batchSize, state.rate))} onReset={() => start(index > 3 ? 0 : index)} />
    <section className={shared.evidence} aria-label="Training network and stages">
      <h2>Your network · 2 inputs → 2 ReLU units → 1 sigmoid output</h2>
      <p>Four training rows and two different held-out rows. Only training rows supply gradients. This is a deterministic teaching network, not a trained production model.</p>
      <svg className={styles.network} viewBox="0 0 640 170" role="img" aria-label="Two input nodes connect to both ReLU hidden nodes, which connect to one sigmoid output. Each hidden unit and the output also has a bias.">
        {[[90,45,310,45],[90,45,310,125],[90,125,310,45],[90,125,310,125],[310,45,550,85],[310,125,550,85]].map((p,i)=><line key={i} x1={p[0]} y1={p[1]} x2={p[2]} y2={p[3]} />)}
        {[[90,45,"x1"],[90,125,"x2"],[310,45,"h1"],[310,125,"h2"],[550,85,"p"]].map(([x,y,label])=><g key={label}><circle cx={x} cy={y} r="26"/><text x={x} y={Number(y)+5} textAnchor="middle">{label}</text></g>)}
      </svg>
      <ol className={styles.stages} aria-label="Training operation order">{stages.map((stage,i)=><li key={stage} aria-current={i === state.stage ? "step" : undefined}>{i+1}. {stage}</li>)}</ol>
      <p role="status" data-training-status>Next: {stages[state.stage]} · Epoch {state.epoch} · Updates {state.updates} · Changed parameters: {state.parameters.filter((value,i)=>value!==initialParameters[i]).length} of 9 · Next training rows: {data.train.slice(state.cursor,state.cursor+state.batchSize).map(e=>e.id).join(", ")}.</p>
      <p>{["Forward computes this batch's predictions; weights stay fixed.", "Loss averages this batch's binary cross entropy; weights stay fixed.", "Backward averages parameter gradients at the batch's starting weights.", "Update subtracts learning rate × mean gradient, then advances to the next batch."][state.stage]}</p>
      <div className={styles.actions}><LessonAction onClick={()=>edit(stepTraining(state))} disabled={state.updates>=100}>Step stage</LessonAction><LessonAction onClick={()=>edit(runTrainingEpoch(state))} disabled={state.updates>=100}>Run one epoch</LessonAction></div>
      <div className={shared.controlGrid}><div><h3>Batch size</h3><LessonToggleGroup label="Batch size" choices={[{id:"2",label:"2"},{id:"4",label:"All"}]} value={String(state.batchSize)} onChange={id=>edit(createTraining(state.scenario,Number(id),state.rate))}/><p className={shared.small}>Changing batch size restarts this run. All means four rows averaged before one update.</p></div>
        <LessonRangeControl label="Learning rate" value={state.rate} min={0} max={1} step={.05} help="Step multiplier. An edit discards pending batch arithmetic and keeps the parameters." onChange={rate=>edit({...state,rate,stage:0,cache:null})}/></div>
      {state.updates>=100 && <p>Teaching limit reached: 100 update applications. Reset to try another run.</p>}
      {state.cache && <p className={shared.math}>Batch {state.cache.rows.map(r=>r.example.id).join(", ")} · First prediction p={fmt(state.cache.rows[0]!.probability)}{state.stage>=2 || state.stage===0 ? ` · Batch mean loss=${fmt(state.cache.loss)}` : " · Loss stage not executed yet"}. {state.stage===0 ? "This trace is from before the last update." : "All batch rows use the same current weights."}</p>}
    </section>
    <LessonSummaries label="Current whole-dataset losses" summaries={[
      {label:"Training loss",color:"#5031dc",value:fmt(losses.train),definition:"Mean over all four training rows at current parameters.",formula:"mean BCE(training)",comparison:"The update itself uses only its current batch."},
      {label:"Validation loss",color:"#ad4508",value:fmt(losses.validation),definition:"Mean over two held-out rows; not fitted.",formula:"mean BCE(held-out)",comparison:"A decrease is not guaranteed or evidence about all future data."},
    ]}/>
    <section className={shared.evidence} aria-label="Parameters and learning history"><h2>Model parameters · Initial → Current</h2>
      <table className={shared.dataTable}><caption>Hidden rows: h1=ReLU(w11x1+w12x2+b1), h2=ReLU(w21x1+w22x2+b2); score=v1h1+v2h2+bOutput.</caption><thead><tr><th>Parameter</th><th>Initial</th><th>Current</th></tr></thead><tbody>{parameterNames.map((name,i)=><tr key={name}><th scope="row">{name}</th><td>{fmt(initialParameters[i]!)}</td><td data-training-parameter={name}>{fmt(state.parameters[i]!)}</td></tr>)}</tbody></table>
      <h2>Loss history after each update</h2><p>Solid indigo: full Training loss. Dashed orange: Validation loss. No fabricated history at update zero; exact current losses are above.</p>
      <svg className={styles.history} viewBox="0 0 640 245" role="img" aria-label={`Loss versus update. ${state.history.length ? `${state.history.length} actual update observations; exact values in the history table.` : "No update history yet."}`}>
        {[0,maxLoss/2,maxLoss].map(v=><g key={v}><line x1="55" x2="615" y1={py(v)} y2={py(v)}/><text x="5" y={py(v)+4}>{v.toFixed(2)}</text></g>)}
        {state.history.length===0 && <text x="240" y="125">No update history yet</text>}
        {(["train","validation"] as const).map(key=><g key={key}><polyline points={state.history.map(r=>`${px(r.update)},${py(r[key])}`).join(" ")} fill="none" stroke={key==="train"?"#5031dc":"#ad4508"} strokeWidth="2" strokeDasharray={key==="validation"?"6 4":undefined}/>{state.history.map(r=><circle key={r.update} cx={px(r.update)} cy={py(r[key])} r="3" fill={key==="train"?"#5031dc":"#ad4508"}/>)}</g>)}<text x="55" y="230">0</text><text x="590" y="230">{state.updates}</text><text x="300" y="240">Update</text>
      </svg>
      <details><summary>Exact examples</summary><table className={shared.dataTable}><thead><tr>{["Row","x1","x2","Label","Split"].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{[...data.train,...data.validation].map(e=><tr key={e.id}><th scope="row">{e.id}</th><td>{e.x[0]}</td><td>{e.x[1]}</td><td>{e.y}</td><td>{e.id.startsWith("H")?"Held-out":"Training"}</td></tr>)}</tbody></table></details>
      <details><summary>Exact batch arithmetic</summary><p>BCE=max(z,0)−label×z+ln(1+exp(−|z|)). Its score derivative is p−label. ReLU&apos;s derivative is zero at zero. Row gradients are averaged before Update; no batch accumulation across updates.</p>
        {state.cache ? <><table className={shared.dataTable}><thead><tr><th>Row</th><th>Score</th><th>Probability</th><th>Loss</th></tr></thead><tbody>{state.cache.rows.map(r=><tr key={r.example.id}><th scope="row">{r.example.id}</th><td>{fmt(r.score)}</td><td>{fmt(r.probability)}</td><td>{state.stage>=2||state.stage===0?fmt(r.loss):"Pending Loss"}</td></tr>)}</tbody></table>{(state.stage===3||state.stage===0)&&<table className={shared.dataTable}><caption>Mean batch gradient · next parameter step = −rate × gradient. At stage Forward after an update, this is the previous batch&apos;s gradient.</caption><thead><tr><th>Parameter</th><th>Mean gradient</th><th>−rate × gradient</th></tr></thead><tbody>{parameterNames.map((name,i)=><tr key={name}><th scope="row">{name}</th><td>{fmt(state.cache!.gradient[i]!)}</td><td>{fmt(-state.rate*state.cache!.gradient[i]!)}</td></tr>)}</tbody></table>}</> : <p>Execute Forward to populate a batch trace.</p>}
      </details>
      <details><summary>Exact loss history</summary><table className={shared.dataTable}><thead><tr><th>Update</th><th>Training</th><th>Validation</th></tr></thead><tbody>{state.history.map(r=><tr key={r.update}><th scope="row">{r.update}</th><td>{fmt(r.train)}</td><td>{fmt(r.validation)}</td></tr>)}</tbody></table></details>
      <details><summary>Scope and sources</summary><p>Fixed row order, no shuffling, momentum, regularization or early stopping. Batch size edits restart parameters. Run one epoch finishes the remaining batches if already partway through an epoch. The tiny held-out set is validation evidence, not a final-test score or a guarantee. Display rounds to six decimals; all computations use full precision.</p><a href="https://www.deeplearningbook.org/contents/optimization.html" target="_blank" rel="noreferrer">Deep Learning · Batch and minibatch optimization</a><br/><a href="https://docs.pytorch.org/docs/2.14/generated/torch.nn.BCEWithLogitsLoss.html" target="_blank" rel="noreferrer">PyTorch · Stable binary cross entropy</a></details>
    </section>
  </LearningPage>;
}
