"use client";
import { useState } from "react";
import { BridgeExperiments } from "@/components/learning-page/bridge-experiments";
import { LearningPage, LessonRangeControl, LessonSelect, LessonToolbar } from "@/components/learning-page/learning-page";
import shared from "@/components/learning-page/learning-page.module.css";
import { boundaryPoints, boundaryPrediction, boundaryPreset, boundaryScenarios, decisionBoundary, type BoundaryState } from "./boundary-engine";
import { boundaryExperiments, boundaryTransfer } from "./learning-experiments";
import styles from "./playground.module.css";
const x = (value: number) => 55 + (value + 3) / 6 * 540;
const y = (value: number) => 575 - (value + 3) / 6 * 540;
export function BoundaryPlayground() {
  const [state,setState]=useState(boundaryPreset),[scenario,setScenario]=useState("diagonal"),[selected,setSelected]=useState("A4"),[index,setIndex]=useState(0);
  const [prediction,setPrediction]=useState<string|null>(null),[explanation,setExplanation]=useState<string|null>(null),[answer,setAnswer]=useState<string|null>(null);
  const point=boundaryPoints.find(p=>p.id===selected)!, result=boundaryPrediction(state,point.x,point.y), boundary=decisionBoundary(state);
  const reached=index===0?state.bias===1&&state.w1===1&&state.w2===1:index===1?state.w1===2&&state.w2===1&&state.bias===0:state.cutoff===.75&&state.w1===1&&state.w2===1&&state.bias===0;
  function clear(){setExplanation(null);setAnswer(null);}
  function start(next=index){setIndex(next);const id=next===3?"vertical":"diagonal";setScenario(id);setState(boundaryPreset(id));setSelected("A4");setPrediction(null);clear();}
  function edit(patch:Partial<BoundaryState>){setState(s=>({...s,...patch}));clear();}
  const boundaryText=boundary.kind==="endpoint"?`Cutoff ${state.cutoff}: ${state.cutoff===0?"all":"no"} finite-score points choose Class A. No finite boundary.`
    :boundary.kind==="everywhere"?"Every point ties the cutoff; p ≥ cutoff chooses Class A everywhere."
    :boundary.kind==="constant"?"Constant scores: no separating line; all decisions are the same."
    :boundary.kind==="outside"?"The policy boundary is outside the visible square (or touches only a corner)."
    :`${state.w1}x1 + ${state.w2}x2 + ${state.bias} = ${Math.log(state.cutoff/(1-state.cutoff)).toFixed(6)}.`;
  return <LearningPage title="Linear Classification & Decision Boundaries" subtitle="Move a weight. Trace the decision boundary." rail={<BridgeExperiments experiments={boundaryExperiments} index={index}
    prediction={prediction} explanation={explanation} reached={reached} onPredict={id=>{start();setPrediction(id);}} onExplain={setExplanation}
    onNext={()=>start(index+1)} onRestart={()=>start(0)} transfer={boundaryTransfer} transferReached={state.w1===0&&state.w2===0&&state.bias===-.5&&state.cutoff===.5}
    transferAnswer={answer} onTransfer={setAnswer}/> }>
    <LessonToolbar scenarios={boundaryScenarios} selectedId={scenario} onSelect={id=>{setScenario(id);setState(boundaryPreset(id));clear();}} onReset={()=>start(index>3?0:index)}/>
    <section className={shared.evidence} aria-label="Data and decision boundary"><h2>Your dataset · Fixed actual labels</h2>
      <p>Teal circles = actual Class A; orange squares = actual Class B. Indigo line = the decision cutoff. Each ring shows a prediction: solid for Class A, dashed for Class B. Editing parameters never moves these observations.</p>
      <svg className={styles.chart} viewBox="0 0 650 625" role="img" aria-label={`Equal-scale x1/x2 axes −3 to 3. ${boundaryText} Selected ${point.id} at (${point.x},${point.y}), score ${result.score.toFixed(3)}, probability ${result.probability.toFixed(6)}, decision Class ${result.decision?"A":"B"}. Exact all-point values are available below.`}>
        {[-3,-2,-1,0,1,2,3].map(v=><g key={v}><line x1={x(v)} x2={x(v)} y1={y(3)} y2={y(-3)} stroke={v===0?"#536487":"#dfe4f4"}/><line x1={x(-3)} x2={x(3)} y1={y(v)} y2={y(v)} stroke={v===0?"#536487":"#dfe4f4"}/><text x={x(v)} y="597" textAnchor="middle">{v}</text><text x="28" y={y(v)+4}>{v}</text></g>)}
        {boundary.kind==="line"&&<line data-decision-line x1={x(boundary.points[0]!.x)} y1={y(boundary.points[0]!.y)} x2={x(boundary.points[1]!.x)} y2={y(boundary.points[1]!.y)} stroke="#5031dc" strokeWidth="3"/>}
        {boundaryPoints.map(p=>{const r=boundaryPrediction(state,p.x,p.y);return <g key={p.id}>
          <circle cx={x(p.x)} cy={y(p.y)} r={p.id===selected?15:12} fill="white" stroke="#33486d" strokeWidth={p.id===selected?3:1} strokeDasharray={r.decision?undefined:"3 3"}/>
          {p.label?<circle cx={x(p.x)} cy={y(p.y)} r="7" fill="#087c78"/>:<rect x={x(p.x)-7} y={y(p.y)-7} width="14" height="14" fill="#ad4508"/>}<text x={x(p.x)+17} y={y(p.y)-13}>{p.id}</text>
        </g>})}<text x="318" y="621">x1</text><text x="8" y="26">x2</text>
      </svg>
      <p role="status" data-boundary-status>{boundaryText}</p>
      <div className={shared.controlGrid}>
        <LessonRangeControl label="Weight 1" value={state.w1} min={-3} max={3} step={.1} help="Contribution of x1 to the raw score." onChange={w1=>edit({w1})}/>
        <LessonRangeControl label="Weight 2" value={state.w2} min={-3} max={3} step={.1} help="Contribution of x2. Zero is allowed; it can produce a vertical boundary." onChange={w2=>edit({w2})}/>
        <LessonRangeControl label="Bias" value={state.bias} min={-3} max={3} step={.1} help="Constant added to every score." onChange={bias=>edit({bias})}/>
        <LessonRangeControl label="Decision cutoff" value={state.cutoff} min={0} max={1} step={.01} help="Policy: choose Class A when sigmoid(score) ≥ cutoff. Changing it keeps scores fixed." onChange={cutoff=>edit({cutoff})}/>
      </div>
      <LessonSelect label="Selected point" choices={boundaryPoints.map(p=>({id:p.id,label:`${p.id} (${p.x}, ${p.y})`}))} value={selected} onChange={setSelected}/>
      <table className={shared.dataTable}><caption>Selected point · z=w1x1+w2x2+Bias; sigmoid(z)=1/(1+exp(−z)). Actual label and decision are separate.</caption><thead><tr>{["Point","Score","Probability","Decision","Actual"].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody><tr><th scope="row">{point.id}</th><td data-selected-score>{result.score.toFixed(6)}</td><td data-selected-probability>{result.probability.toFixed(6)}</td><td data-selected-decision>Class {result.decision?"A":"B"}</td><td>Class {point.label?"A":"B"}</td></tr></tbody></table>
    </section>
    <section className={shared.evidence} aria-label="Boundary evidence and scope"><details><summary>All-point score table</summary><table className={shared.dataTable}><thead><tr>{["Point","x1","x2","Actual","Score","Probability","Decision"].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{boundaryPoints.map(p=>{const r=boundaryPrediction(state,p.x,p.y);return <tr key={p.id}><th scope="row">{p.id}</th><td>{p.x}</td><td>{p.y}</td><td>{p.label?"A":"B"}</td><td>{r.score.toFixed(6)}</td><td>{r.probability.toFixed(6)}</td><td>{r.decision?"A":"B"}</td></tr>})}</tbody></table></details>
      <details><summary>Geometry, limits and source</summary><p>Both feature axes have equal scales. The line is clipped only to the visible −3..3 square. With nonzero weights and 0&lt;cutoff&lt;1, it solves w1x1+w2x2+Bias=ln(cutoff/(1−cutoff)). Cutoff endpoints have no finite logit. Finite scores here produce probabilities strictly between zero and one. Zero weights give a constant scorer; a tie everywhere is different from a separating line. This workbench directly edits parameters; it does not optimize them or estimate calibration from data.</p><a href="https://www.deeplearningbook.org/contents/ml.html" target="_blank" rel="noreferrer">Deep Learning · Logistic regression and decision rules</a></details>
    </section>
  </LearningPage>;
}
