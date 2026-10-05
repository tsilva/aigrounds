"use client";
import { useState } from "react";
import { BridgeExperiments } from "@/components/learning-page/bridge-experiments";
import { LearningPage, LessonAction, LessonRangeControl, LessonSelect, LessonToggleGroup, LessonToolbar } from "@/components/learning-page/learning-page";
import shared from "@/components/learning-page/learning-page.module.css";
import { appendToken, createDecoding, decodingCandidates, decodingPrefix, decodingScenarios, decodingStop, type DecodingState } from "./decoding-engine";
import { decodingExperiments, decodingTransfer } from "./learning-experiments";
import styles from "./playground.module.css";
export function DecodingPlayground(){
  const [state,setState]=useState(createDecoding),[index,setIndex]=useState(0),[prediction,setPrediction]=useState<string|null>(null),[explanation,setExplanation]=useState<string|null>(null),[answer,setAnswer]=useState<string|null>(null);
  const rows=decodingCandidates(state),stop=decodingStop(state),prefix=decodingPrefix(state);
  const reached=index===0?state.prompt==="The cat"&&state.generated[0]==="slept"&&state.mode==="sample":index===1?state.generated[0]==="sat"&&state.mode==="greedy":state.generated[0]==="sat"&&state.filter==="top-k"&&state.k===1&&state.mode==="sample";
  function clear(){setExplanation(null);setAnswer(null);}
  function start(next=index){setIndex(next);setState(createDecoding(next===3?"dog":"cat"));setPrediction(null);clear();}
  function edit(patch:Partial<DecodingState>){setState(s=>({...s,...patch}));clear();}
  return <LearningPage title="How Tokens Become an Answer" subtitle="Choose one token. Extend the prefix." rail={<BridgeExperiments experiments={decodingExperiments} index={index} prediction={prediction} explanation={explanation} reached={reached}
    onPredict={id=>{start();setPrediction(id);}} onExplain={setExplanation} onNext={()=>start(index+1)} onRestart={()=>start(0)} transfer={decodingTransfer}
    transferReached={state.prompt==="The dog"&&state.mode==="sample"&&state.filter==="all"&&state.generated[0]==="slept"&&state.limit===1&&state.generated.length===1}
    transferAnswer={answer} onTransfer={setAnswer}/> }>
    <LessonToolbar scenarios={decodingScenarios} selectedId={state.prompt==="The dog"?"dog":"cat"} onSelect={id=>{setState(createDecoding(id));clear();}} onReset={()=>start(index>3?0:index)}/>
    <section className={shared.evidence} aria-label="Generated prefix and next-token distribution">
      <p>Authored transitions · reproducible draws · no live LLM. Each displayed word is one toy token; EOS stops the sequence.</p>
      <h2>Current prefix</h2><p className={styles.prefix} data-decoding-prefix>{prefix}</p><p>Original prompt: {state.prompt} · Generated tokens: {state.generated.length} / {state.limit}{state.generated.includes("EOS")?" (including EOS)":""}.</p>
      <h2>Next-token probabilities{stop?" · stopped preview":""}</h2><p>Bars show the filtered distribution. Removed candidates have probability zero. The exact table also shows the distribution before filtering.</p>
      <div className={styles.distribution}>{rows.map(row=><div className={styles.row} key={row.token}><strong>{row.token}{!row.keep?" (removed)":""}</strong><div className={styles.track}><span style={{width:`${row.probability*100}%`}}/></div><span>{(row.probability*100).toFixed(2)}%</span></div>)}</div>
      <p role="status" data-decoding-status>{stop?`Stopped: ${stop}. No token will be appended.`:state.mode==="greedy"?"Greedy chooses the highest-probability retained token. Append to observe the choice.":`Draw ${state.draw.toFixed(6)} selects from cumulative intervals. Predict, then append to observe the choice.`}</p>
      <LessonAction disabled={stop!==null} onClick={()=>{setState(appendToken(state));clear();}}>Append selected token</LessonAction>
      <div className={shared.controlGrid}>
        <div><h3>Decoding mode</h3><LessonToggleGroup label="Decoding mode" choices={[{id:"greedy",label:"Greedy"},{id:"sample",label:"Sample"}]} value={state.mode} onChange={mode=>edit({mode})}/></div>
        <LessonRangeControl label="Temperature" value={state.temperature} min={.1} max={2} step={.1} help="Positive scale applied to ln(authored weight) before softmax. This does not judge sentence quality." onChange={temperature=>edit({temperature})}/>
        <LessonSelect label="Candidate filter" choices={[{id:"all",label:"All"},{id:"top-k",label:"Top-k"},{id:"top-p",label:"Top-p"}]} value={state.filter} onChange={filter=>edit({filter})}/>
        <LessonRangeControl label="Next draw" value={state.draw} min={0} max={.999999} step="any" help="Used only by Sample. You may set an exact draw; appending advances the reproducible sequence." onChange={draw=>edit({draw})}/>
        {state.filter==="top-k"&&<LessonRangeControl label="k" value={state.k} min={1} max={3} step={1} help="Keep up to k highest-probability tokens; ties follow authored order." onChange={k=>edit({k})}/>}
        {state.filter==="top-p"&&<LessonRangeControl label="Top-p mass" value={state.p} min={.1} max={1} step={.1} help="Keep the smallest ranked prefix reaching this base probability mass, then renormalize." onChange={p=>edit({p})}/>}
        <LessonRangeControl label="Maximum tokens" value={state.limit} min={1} max={8} step={1} help="This length limit and EOS stopping work together. A limit can truncate an unfinished sequence." onChange={limit=>edit({limit})}/>
      </div><p>Setting edits affect the next token and preserve the generated prefix. Reset restores the experiment&apos;s prompt and settings. After EOS, Reset is required to start another sequence.</p>
    </section>
    <section className={shared.evidence} aria-label="Exact decoding evidence"><details><summary>Exact probabilities and cumulative intervals</summary><table className={shared.dataTable}><caption>Sorted by base probability; intervals are lower-inclusive, upper-exclusive. Greedy chooses the first retained row.</caption><thead><tr>{["Token","Base","Kept?","Filtered","Draw interval"].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map(row=><tr key={row.token}><th scope="row">{row.token}</th><td>{row.base.toFixed(6)}</td><td>{row.keep?"Yes":"No"}</td><td>{row.probability.toFixed(6)}</td><td>{row.keep?`[${row.lower.toFixed(6)}, ${row.upper.toFixed(6)})`:"None"}</td></tr>)}</tbody></table></details>
      <details><summary>Authored transition bank and limits</summary><p>The cat → sat 0.5 / slept 0.3 / ran 0.2. The dog → barked 0.6 / slept 0.4. Any prefix ending sat → on0.6 / near 0.3 / EOS 0.1; slept → EOS 0.7 / soundly 0.3; ran → away 0.8 / EOS 0.2; barked → loudly 0.5 / EOS 0.5. Endings on or near → the 1; the → mat 1; all other endings → EOS 1. These are fixed teaching weights, not learned probabilities. No factual or language-quality guarantee follows.</p><p>For reproducible draws: seed=floor(draw×2³²); next=((1664525×seed+1013904223) mod2³²)/2³², rounded to six decimals and capped at0.999999. This teaching PRNG is not a cryptographic generator. Greedy also advances it, but ignores the draw when choosing. Changing Next draw seeds the next advance. EOS counts as a generated token and is omitted from the displayed text.</p><a href="https://arxiv.org/abs/1904.09751" target="_blank" rel="noreferrer">The Curious Case of Neural Text Degeneration · Nucleus sampling</a></details>
    </section>
  </LearningPage>;
}
