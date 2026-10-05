"use client";
import { useState } from "react";
import { BridgeExperiments } from "@/components/learning-page/bridge-experiments";
import { LearningPage, LessonRangeControl, LessonSelect, LessonToolbar } from "@/components/learning-page/learning-page";
import shared from "@/components/learning-page/learning-page.module.css";
import { analyzePipeline, pipelinePreset, pipelineQueries, pipelineScenarios, type PipelineState } from "./pipeline-engine";
import { pipelineExperiments, pipelineTransfer } from "./learning-experiments";
import styles from "./playground.module.css";
export function PipelinePlayground(){
  const [state,setState]=useState(pipelinePreset),[scenario,setScenario]=useState("current"),[index,setIndex]=useState(0),[prediction,setPrediction]=useState<string|null>(null),[explanation,setExplanation]=useState<string|null>(null),[answer,setAnswer]=useState<string|null>(null);
  const a=analyzePipeline(state);
  const reached=index===0?state.retrieval===2&&state.context===0:index===1?state.query==="hours"&&state.answer==="wrong"&&a.context.some(d=>d.id==="D1"):state.query==="hours"&&a.fact==="hours:9"&&a.supported;
  function clear(){setExplanation(null);setAnswer(null);}
  function start(next=index){setIndex(next);setScenario("current");setState(pipelinePreset());setPrediction(null);clear();}
  function edit(patch:Partial<PipelineState>){setState(s=>({...s,...patch}));setScenario("");clear();}
  return <LearningPage title="From Retrieval to a Grounded Answer" subtitle="Change the context. Trace the answer evidence." rail={<BridgeExperiments experiments={pipelineExperiments} index={index} prediction={prediction} explanation={explanation} reached={reached}
    onPredict={id=>{start();setPrediction(id);}} onExplain={setExplanation} onNext={()=>start(index+1)} onRestart={()=>start(0)} transfer={pipelineTransfer}
    transferReached={state.query==="admission"&&state.retrieval===1&&state.context===1&&state.answer==="incomplete"&&a.supported} transferAnswer={answer} onTransfer={setAnswer}/> }>
    <LessonToolbar scenarios={pipelineScenarios} selectedId={scenario} onSelect={id=>{setScenario(id);setState(pipelinePreset(id));clear();}} onReset={()=>start(index>3?0:index)}/>
    <section className={shared.evidence} aria-label="Query, retrieval and context settings"><h2>Your fictional corpus · Harbor Museum</h2><p>Authored rankings and answer bank · no live retrieval, embeddings or LLM. Four fixed documents and three queries make each failure stage inspectable.</p>
      <div className={shared.controlGrid}>
        <LessonSelect label="Query" choices={pipelineQueries} value={state.query} onChange={query=>edit({query})}/>
        <LessonSelect label="Answer behavior" choices={[{id:"evidence",label:"Use evidence"},{id:"wrong",label:"Wrong claim"},{id:"incomplete",label:"Incomplete"}]} value={state.answer} onChange={answer=>edit({answer})}/>
        <LessonRangeControl label="Retrieval budget" value={state.retrieval} min={0} max={4} step={1} help="Retrieve the first N ranked candidates; the full candidate list remains visible." onChange={retrieval=>edit({retrieval})}/>
        <LessonRangeControl label="Context budget" value={state.context} min={0} max={4} step={1} help="Supply up to this many retrieved chunks to the answer bank. It cannot add unretrieved documents." onChange={context=>edit({context})}/>
      </div>
      <div className={styles.pipeline}>
        <div><h2>1. Ranked candidates</h2><p>{a.retrieved.length} retrieved of four candidates.</p>{a.ranked.map((d,i)=><article key={d.id} className={styles.document}><h3>{i+1}. {d.id} · {d.title}</h3><p>{d.text}</p><p className={shared.small}>{d.date} · {a.retrieved.some(r=>r.id===d.id)?"Retrieved":"Outside retrieval budget"}{!d.current?" · Outdated":""}</p></article>)}</div>
        <div><h2>2. Supplied context</h2><p>{a.context.length} supplied · {a.relevant.length} relevant to this query.</p>{a.context.length?a.context.map(d=><article key={d.id} className={styles.document}><h3>{d.id} · {d.title}</h3><p>{d.text}</p></article>):<p>No chunks supplied.</p>}</div>
        <div><h2>3. Authored answer</h2><p className={styles.answer} data-pipeline-answer>{a.text}{a.citation?` [${a.citation}]`:""}</p>
          <dl className={styles.audit}><dt>Source support</dt><dd data-pipeline-support>{a.abstained?"No claim to assess":a.supported?"Supported":"Unsupported"}</dd><dt>Requested field filled</dt><dd data-pipeline-complete>{a.complete?"Yes":"No"}</dd><dt>Matches full current reference</dt><dd data-pipeline-reference>{a.correct?"Yes":"No"}</dd></dl>
        </div>
      </div>
      <p role="status" data-pipeline-status>{a.retrieved.length} retrieved → {a.context.length} supplied → {a.abstained?"answer abstains":`${a.supported?"source-supported":"unsupported"} claim; requested field ${a.complete?"filled":"missing"}; full reference ${a.correct?"matches":"not matched"}`}.</p>
    </section>
    <section className={shared.evidence} aria-label="Authored evidence ledger and limits"><details><summary>Current reference and exact support ledger</summary><p>Current reference: {({hours:"Tuesday at10:00",admission:"4 credits",closure:"Sunday"})[a.query.id]}. Source support is checked against a cited supplied document&apos;s authored facts. Requested-field coverage means supplying an amount/time/day, even if wrong. Full-reference match checks the requested fact; an incomplete answer can contain a true partial claim while failing that match.</p>
      <table className={shared.dataTable}><thead><tr><th>Document</th><th>Relevant?</th><th>Supplied?</th><th>Contains answer fact?</th></tr></thead><tbody>{a.ranked.map(d=><tr key={d.id}><th scope="row">{d.id}</th><td>{(a.query.relevant as readonly string[]).includes(d.id)?"Yes":"No"}</td><td>{a.context.some(c=>c.id===d.id)?"Yes":"No"}</td><td>{a.fact===null?"No claim":(d.facts as readonly string[]).includes(a.fact)?"Yes":"No"}</td></tr>)}</tbody></table></details>
      <details><summary>Authored ordering and answer rules</summary><LessonSelect label="Candidate ordering" choices={[{id:"relevant",label:"Relevant first"},{id:"outdated",label:"Outdated first"}]} value={state.order} onChange={order=>edit({order})}/>
        <p>Relevant first: Hours D1,D2,D3,D4; Admission D3,D1,D2,D4; Closure D4,D1,D2,D3. Outdated first always uses D2,D3,D4,D1. These rankings are a lookup table, not computed embeddings. The candidate list includes rows outside the retrieval budget; only Retrieved rows can enter supplied context.</p>
        <p>Use evidence prefers a relevant current document, otherwise a supplied relevant old one; with none, it abstains. Wrong claim produces11:00,7 credits or Monday while citing the available relevant source. Incomplete says Tuesday, that a charge exists, or that a weekly closure exists; it omits the requested time/amount/day. This is a disclosed answer bank, not a model guaranteed to behave this way. Context budget is a chunk count, not a token limit. Current reference is an authored independent ledger. Real RAG must assess retrieval and generated claims with real data and evaluation.</p><a href="https://arxiv.org/abs/2005.11401" target="_blank" rel="noreferrer">Retrieval-Augmented Generation · Original paper</a></details>
    </section>
  </LearningPage>;
}
