"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { ExperimentButton, ExperimentChoices, ExperimentRail, ExperimentResult, LearningPage, LessonRangeControl, LessonSummaries, LessonToggleGroup, LessonToolbar } from "@/components/learning-page/learning-page";
import { GuidedExperiment } from "@/components/learning-page/guided-experiment";
import shared from "@/components/learning-page/learning-page.module.css";
import { analyzeRetrieval, boundQuery, retrievalChart, retrievalNumber as number, retrievalScenarios, type RetrievalState } from "./retrieval-engine";
import { retrievalBaseline, reachedRetrieval } from "./lesson-state";
import { retrievalExperiments } from "./learning-experiments";
import styles from "./playground.module.css";

export function RetrievalPlayground() {
  const [state,setState]=useState(retrievalBaseline),[width,setWidth]=useState(640);
  const [index,setIndex]=useState(0),[prediction,setPrediction]=useState<string|null>(null),[explanation,setExplanation]=useState<string|null>(null),[transferAnswer,setTransferAnswer]=useState<string|null>(null);
  const chartRef=useRef<HTMLDivElement>(null),editorRef=useRef<HTMLDivElement>(null),drag=useRef({active:false,moved:false,startX:0,startY:0});
  useEffect(()=>{const el=chartRef.current;if(!el)return;const update=()=>setWidth(Math.max(200,el.getBoundingClientRect().width));update();const observer=new ResizeObserver(update);observer.observe(el);return()=>observer.disconnect();},[]);
  const a=useMemo(()=>analyzeRetrieval(state),[state]),chart=retrievalChart(state,width),experiment=retrievalExperiments[index],transfer=index===3;
  const reached=!!prediction&&!!experiment&&reachedRetrieval(index,state),complete=reached&&explanation==="0";
  function clear(){setExplanation(null);setTransferAnswer(null);}
  function start(next=index){setIndex(next);setState(retrievalBaseline(next));setPrediction(null);clear();}
  function edit(next:RetrievalState){if(Object.keys(state).every(key=>state[key as keyof RetrievalState]===next[key as keyof RetrievalState]))return;setState(next);clear();}
  function movePointer(event:PointerEvent<SVGGElement>){const svg=event.currentTarget.ownerSVGElement;if(!svg)return;const r=svg.getBoundingClientRect(),px=(event.clientX-r.left)*chart.width/r.width,py=(event.clientY-r.top)*chart.height/r.height;edit({...state,x:boundQuery((px-chart.left)*10/chart.span-5),y:boundQuery((chart.bottom-py)*10/chart.span-5)});}
  const rail=experiment?<GuidedExperiment label={`Experiment ${index+1} of 3`} experiment={experiment}
    reached={reached} complete={complete} prediction={prediction} explanation={explanation}
    predictionName="retrieval-prediction" explanationName="retrieval-explanation"
    onPredict={id=>{start();setPrediction(id);}} onExplain={setExplanation}
    predictionHelp={<>Changing prediction restores this experiment’s starting settings. Reset restarts it.</>} observation={prediction==="0"?"The evidence matches your prediction.":"The evidence challenges your prediction."}
    onNext={()=>start(index+1)} nextLabel={index===2?"Try the transfer check":"Next experiment"} />:<ExperimentRail label={transfer?"Transfer check":"Free exploration"} title={transfer?"Keep identities; handle zero":"Explore ranked geometry"}>
    {transfer?<><p>Without Guide help, choose Duplicate &amp; zero. Set Query X to 3, Query Y to 0, Top k to 6, and choose Cosine. Reconstruct the rank of A/B, the cosine of C/E, and the eligibility of F. Do equal coordinates merge items, and must six results be returned?</p>
      {reachedRetrieval(3,state)&&<><ExperimentChoices legend="Transfer explanation" name="retrieval-transfer" choices={[
        {id:"distinct",label:"A and B keep distinct IDs despite identical coordinates. Both have cosine 1; fixed ID breaks the tie A before B, without a relevance claim. C/E have defined cosine 0 because they are perpendicular nonzero vectors; D has −1. F has zero length, so geometric cosine is Undefined and F is excluded. The result order is A,B,C,E,D: five eligible items for requested k=6, without padding or probabilities."},
        {id:"merge",label:"A and B merge into one item because their coordinates match; a tie proves that only A is relevant."},
        {id:"zero",label:"F has a defined cosine of 0 and must be returned to fill all six slots; C and E have undefined cosine because they are perpendicular."},
      ]} value={transferAnswer} onChange={setTransferAnswer}/>{transferAnswer&&(transferAnswer!=="distinct"?<p role="status" className={shared.feedback}>Try again. Inspect each ID’s own table row. Equal vectors need not be the same item. Cosine divides by both lengths: a zero length is different from a nonzero perpendicular vector, whose dot is zero.</p>:<><ExperimentResult title="Transfer explained">Identity, score ties and score eligibility are different questions. A deterministic tie-break preserves both IDs; undefined geometric cosine is excluded. Requested k can exceed the eligible count.</ExperimentResult><ExperimentButton onClick={()=>{setIndex(4);clear();}}>Explore freely</ExperimentButton></>)}</>}
    </>:<><p>Move only the query, compare scoring rules, and change the returned count. Try the zero query with Cosine, then Euclidean. Use every ID’s table row before interpreting overlap or rounded ties. These handcrafted vectors have no semantic relevance labels.</p><ExperimentButton onClick={()=>start(0)}>Restart experiments</ExperimentButton></>}
  </ExperimentRail>;
  return <LearningPage title="Embedding Retrieval Lab" subtitle="Move a query; track the ranked results." rail={rail}>
    <LessonToolbar scenarios={retrievalScenarios} selectedId={state.scenario} onSelect={scenario=>edit({...state,scenario:scenario as RetrievalState["scenario"]})} onReset={()=>start(experiment||transfer?index:0)}/>
    <section className={shared.evidence} aria-label="Fixed item vectors and movable query">
      <h2>Your dataset</h2><p>An embedding is a numeric representation of an item. These six handcrafted 2D vectors illustrate exact brute-force retrieval: every item is scored. Move only the query; stored item vectors stay fixed. No learned semantic relevance is claimed. Axes show the actual toy coordinates at equal scales.</p>
      <div className={styles.chart} ref={chartRef}><svg data-retrieval-chart viewBox={`0 0 ${chart.width} ${chart.height}`} role="group" aria-label="Equal-scale embedding coordinates with six fixed item IDs and one movable query Q; every item has its own ranked table row.">
        {chart.ticks.map(t=><g key={t.value}><line x1={t.x} x2={t.x} y1={chart.top} y2={chart.bottom}/><line x1={chart.left} x2={chart.left+chart.span} y1={t.y} y2={t.y}/><text x={t.x} y={chart.bottom+22} textAnchor="middle">{t.value}</text><text x={chart.left-12} y={t.y+4} textAnchor="end">{t.value}</text></g>)}
        <line className={styles.axis} x1={chart.left} x2={chart.left+chart.span} y1={chart.origin.y} y2={chart.origin.y}/><line className={styles.axis} x1={chart.origin.x} x2={chart.origin.x} y1={chart.top} y2={chart.bottom}/>
        <text x={chart.left+chart.span/2} y={chart.bottom+49} textAnchor="middle">X coordinate</text><text x={chart.left+chart.span/2} y="16" textAnchor="middle">Vertical: Y coordinate</text>
        {chart.groups.map(g=><g data-retrieval-group={g.ids.join("/")} key={g.ids.join("/")} transform={`translate(${g.x},${g.y})`}>
          {g.labelMoved&&<line data-retrieval-leader x1="0" y1="0" x2={g.labelX} y2={g.labelY-8} className={styles.leader}/>}
          {g.ids.some(id=>id!=="Q")&&<circle data-retrieval-source={g.ids.filter(id=>id!=="Q").join("/")} r="6" className={g.returned?styles.included:styles.outside}/>}
          <text data-retrieval-label x={g.labelX} y={g.labelY} textAnchor={g.anchor}>{g.ids.join("/")}</text>
        </g>)}
        <g data-retrieval-query transform={`translate(${chart.query.x},${chart.query.y})`} role="button" tabIndex={0} aria-label={`Query Q (${state.x}, ${state.y}); arrow keys move; Enter edits Query X`} aria-describedby="retrieval-query-help" className={styles.handle}
          onClick={()=>{if(!drag.current.moved)editorRef.current?.querySelector("input")?.focus();}}
          onKeyDown={event=>{const step=event.shiftKey?1:.5,moves:Record<string,[number,number]>={ArrowRight:[boundQuery(state.x+step),state.y],ArrowLeft:[boundQuery(state.x-step),state.y],ArrowUp:[state.x,boundQuery(state.y+step)],ArrowDown:[state.x,boundQuery(state.y-step)],Home:[0,0],End:[4,4]};if(moves[event.key]){event.preventDefault();edit({...state,x:moves[event.key][0],y:moves[event.key][1]});}if(event.key==="Enter"||event.key===" "){event.preventDefault();editorRef.current?.querySelector("input")?.focus();}}}
          onPointerDown={event=>{event.preventDefault();event.currentTarget.focus();event.currentTarget.setPointerCapture(event.pointerId);drag.current={active:true,moved:false,startX:event.clientX,startY:event.clientY};}}
          onPointerMove={event=>{if(!drag.current.active)return;if(Math.abs(event.clientX-drag.current.startX)+Math.abs(event.clientY-drag.current.startY)>3)drag.current.moved=true;if(drag.current.moved)movePointer(event);}}
          onPointerUp={event=>{if(!drag.current.active)return;if(drag.current.moved)movePointer(event);drag.current.active=false;if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);}}
          onPointerCancel={()=>{drag.current.active=false;drag.current.moved=true;}}>
          <circle r="20" className={styles.handleFocus}/><circle r="17" fill="transparent"/><path d="M0,-10 L10,0 L0,10 L-10,0 Z" className={styles.diamond}/>
        </g>
      </svg></div>
      <p>● Filled source glyph: at least one represented ID is returned. ○ Hollow: none returned. ◆ Query Q: movable. Exactly coincident IDs share a labeled source glyph; each ID retains its own table row and inclusion. Leader lines move labels only.</p>
      <p id="retrieval-query-help">Drag Q, or focus it and use arrows (0.5 units; Shift: 1). Right increases X; Up increases Y. Home sets (0,0); End sets (4,4). Enter, Space or click focuses Query X. The exact editors and sliders below provide the same query changes.</p>
      <div className={shared.controlGrid} data-columns="3"><div ref={editorRef}><LessonRangeControl label="Query X" value={state.x} min={-4} max={4} step={.5} help="Signed horizontal component, −4..4 in half units." onChange={x=>edit({...state,x})}/></div><LessonRangeControl label="Query Y" value={state.y} min={-4} max={4} step={.5} help="Signed vertical component, −4..4 in half units." onChange={y=>edit({...state,y})}/><LessonRangeControl label="Top k" value={state.k} min={1} max={6} step={1} help="Requested count; return the first k eligible IDs without changing scores." onChange={k=>edit({...state,k})}/></div>
      <h3>Similarity rule</h3><LessonToggleGroup label="Similarity rule" choices={[{id:"euclidean",label:"Euclidean"},{id:"cosine",label:"Cosine"}]} value={state.metric} onChange={metric=>edit({...state,metric:metric as RetrievalState["metric"]})}/>
      <p role="status" data-retrieval-status className={shared.math}>{retrievalScenarios.find(s=>s.id===state.scenario)!.label} · Query ({state.x}, {state.y}) · {state.metric==="euclidean"?"Euclidean":"Cosine"} · Top k {state.k} · Order {a.order.join(",")||"None"} · Returned {a.returned.join(",")||"None"} · Query length {number(a.queryNorm)}</p>
      {a.excluded.length>0&&<p role="status" data-retrieval-zero>Geometric cosine requires two nonzero lengths. Undefined cosine excludes {a.excluded.join(", ")} from ranking. {a.returned.length} eligible results returned for requested k={state.k}; no padding. Nonzero perpendicular vectors have defined cosine 0.</p>}
    </section>
    <section className={shared.evidence} aria-label="Exact ranked retrieval evidence"><h2>Retrieval results</h2>
      <div className={`${shared.tableScroll} ${styles.table}`} role="region" tabIndex={0} aria-label="All six item identities, coordinates, scores, ranks and inclusion"><table><caption>All IDs remain, including exact duplicates and excluded zero vectors. {state.metric==="euclidean"?"Lower Euclidean distance":"Higher defined cosine"} ranks first; fixed ID breaks comparison ties. Six-decimal display is not the comparison key.</caption><thead><tr>{["Rank","Item","Coordinates","Euclidean distance","Cosine","Returned"].map(h=><th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{a.rows.map(p=><tr data-retrieval-row={p.id} key={p.id}><td>{p.rank??"Excluded"}</td><th scope="row">{p.id}</th><td>({p.x}, {p.y})</td><td>{number(p.distance)}</td><td>{number(p.cosine)}</td><td>{p.key===null?"Ineligible":p.returned?"Included":"Outside"}</td></tr>)}</tbody></table></div>
    </section>
    <LessonSummaries label="Ranked result and selected count" summaries={[
      {label:"Top result",color:"#5031dc",value:a.top?.id??"None",definition:"First eligible item under the selected rule.",formula:"Score, then fixed ID for ties",comparison:"Proximity in these vectors is not proved relevance."},
      {label:state.metric==="euclidean"?"Best distance":"Best cosine",color:"#087c78",value:number(a.best),definition:state.metric==="euclidean"?"Lowest coordinate distance.":"Highest nonzero directional alignment.",formula:state.metric==="euclidean"?"sqrt((qx−ix)²+(qy−iy)²)":"dot(query,item) / (length query × length item)",comparison:state.metric==="euclidean"?"Lower first; raw vector lengths matter.":"Higher first; −1..1, not a probability."},
      {label:"Returned",color:"#ad4508",value:`${a.returned.length} of ${state.k}`,definition:"Actual count versus requested Top k.",formula:"First min(k, eligible count) ranked IDs",comparison:"More results do not guarantee quality."},
    ]}/>
    <section className={shared.evidence} aria-label="Retrieval scoring conventions and limits"><details><summary>Construction and limits</summary>
      <p>Six handcrafted 2D vectors use equal coordinate weights. Query components are bounded to −4..4 and snapped to half units; Top k is 1..6. The fixed −5..5 square plot shows actual toy coordinates with equal unit scales, not a projection. Exact coincidence groups glyphs and labels only; table identities remain separate. Scenarios preserve query, scoring rule and k while changing stored vectors.</p>
      <p>Exact brute-force scoring evaluates all six items. Euclidean sorts by squared distance (exact on this half-unit grid), then fixed ID A..F; the table displays its square root. Cosine is dot divided by both nonzero lengths, sorted highest first. Its comparison key is rounded to 12 decimals for deterministic numerical ties; fixed ID resolves equal keys. Display rounding to six decimals is separate. Tie order is reproducible, not semantic superiority.</p>
      <p>A zero query or zero item has no direction, so geometric cosine is Undefined and this demo excludes it. A zero query yields no eligible cosine results. Some libraries assign numerical zero to these cases; that convention does not create a direction. Euclidean works at zero. Nonzero cosine 0 means perpendicular, 1 means same direction rather than identical length, and −1 means opposite. No score is a relevance probability.</p>
      <p>The demo does not normalize coordinates when you choose Cosine. If both vectors were normalized, squared Euclidean distance would equal 2−2×cosine and rankings would agree; raw vectors need not agree. Query/scenario/metric/k edits clear stale explanations. Prediction or Reset restores the current baseline; free-exploration Reset starts Experiment 1. There is no training, semantic query text, approximate index, model inference, task ground truth or retrieval-quality metric here.</p>
      <a href="https://scikit-learn.org/stable/modules/neighbors.html" target="_blank" rel="noreferrer">scikit-learn · Exact nearest-neighbor retrieval</a><br/><a href="https://scikit-learn.org/stable/modules/generated/sklearn.metrics.pairwise.cosine_similarity.html" target="_blank" rel="noreferrer">scikit-learn · Cosine scoring</a><br/><a href="https://github.com/facebookresearch/faiss/wiki/MetricType-and-distances" target="_blank" rel="noreferrer">Faiss · Raw and normalized metric conventions</a>
    </details></section>
  </LearningPage>;
}
