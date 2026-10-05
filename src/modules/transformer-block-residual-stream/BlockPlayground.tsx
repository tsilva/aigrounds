"use client";
import { useId, useState } from "react";
import { BridgeExperiments } from "@/components/learning-page/bridge-experiments";
import { LearningPage, LessonAction, LessonRangeControl, LessonSelect, LessonToolbar } from "@/components/learning-page/learning-page";
import shared from "@/components/learning-page/learning-page.module.css";
import { blockInputs, blockOperations, blockPreset, blockScenarios, blockWeights, traceBlock, type BlockState, type Vec } from "./block-engine";
import { blockExperiments, blockTransfer } from "./learning-experiments";
import styles from "./playground.module.css";
const pair=(v:Vec)=>`(${v[0].toFixed(6)}, ${v[1].toFixed(6)})`;
export function BlockPlayground(){
  const [state,setState]=useState(blockPreset),[index,setIndex]=useState(0),[prediction,setPrediction]=useState<string|null>(null),[explanation,setExplanation]=useState<string|null>(null),[answer,setAnswer]=useState<string|null>(null);
  const arrow=useId(), trace=traceBlock(state),row=trace[state.token]!,inputs=blockInputs(state.scenario);
  const stages=[row.input,row.norm1,row.attention,row.h,row.norm2,row.mlp,row.output], vector=stages[state.operation]!;
  const reached=index===0?state.attentionScale===0&&state.token===0&&state.scenario==="base":index===1?state.mlpScale===0&&state.attentionScale===1&&state.operation===6:state.scenario==="future"&&state.token===0&&state.attentionScale===1&&state.mlpScale===1;
  function clear(){setExplanation(null);setAnswer(null);}
  function start(next=index){setIndex(next);setState({...blockPreset(next===3?"shifted":"base"),operation:next===3?6:3});setPrediction(null);clear();}
  function edit(patch:Partial<BlockState>){setState(s=>({...s,...patch}));clear();}
  return <LearningPage title="Inside a Transformer Block" subtitle="Follow one residual stream through a decoder block." rail={<BridgeExperiments experiments={blockExperiments} index={index} prediction={prediction} explanation={explanation} reached={reached}
    onPredict={id=>{start();setPrediction(id);}} onExplain={setExplanation} onNext={()=>start(index+1)} onRestart={()=>start(0)} transfer={blockTransfer}
    transferReached={state.scenario==="shifted"&&state.token===1&&state.attentionScale===0&&state.mlpScale===1} transferAnswer={answer} onTransfer={setAnswer}/> }>
    <LessonToolbar scenarios={blockScenarios} selectedId={state.scenario} onSelect={scenario=>{setState(blockPreset(scenario));clear();}} onReset={()=>start(index>3?0:index)}/>
    <section className={shared.evidence} aria-label="Residual stream and branch contributions"><h2>First residual addition · Selected token {state.token+1}</h2>
      <p>The input splits before RMSNorm. One path carries raw x unchanged; the other normalizes it, mixes allowed tokens through attention, then is scaled and added.</p>
      <svg className={styles.flow} viewBox="0 0 760 240" role="img" aria-label={`First residual addition: raw input ${pair(row.input)} bypasses RMSNorm and attention, then adds scaled attention ${pair(row.branch)} to produce h ${pair(row.h)}.`}>
        <defs><marker id={arrow} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10z" fill="#536487"/></marker></defs>
        <text x="10" y="40">Input x</text><text x="10" y="62">({row.input[0]}, {row.input[1]})</text>
        <path d="M85 75 H575 V105" fill="none" stroke="#536487" strokeWidth="2" markerEnd={`url(#${arrow})`}/><text x="190" y="61">Input x, unchanged</text>
        <path d="M100 75 V165 H155" fill="none" stroke="#536487" strokeWidth="2" markerEnd={`url(#${arrow})`}/>
        <rect x="158" y="140" width="108" height="50" rx="5"/><text x="168" y="170">RMSNorm</text>
        <path d="M266 165 H305" fill="none" stroke="#536487" strokeWidth="2" markerEnd={`url(#${arrow})`}/>
        <rect x="307" y="140" width="125" height="50" rx="5"/><text x="318" y="158">Causal</text><text x="318" y="177">attention</text>
        <path d="M432 165 H575 V140" fill="none" stroke="#536487" strokeWidth="2" markerEnd={`url(#${arrow})`}/>
        <text x="446" y="193">Scaled branch</text><text x="446" y="215">({row.branch[0].toFixed(3)}, {row.branch[1].toFixed(3)})</text>
        <circle cx="575" cy="123" r="18"/><text x="568" y="129">+</text><path d="M593 123 H660" fill="none" stroke="#536487" strokeWidth="2" markerEnd={`url(#${arrow})`}/>
        <text x="637" y="78">First sum h</text><text x="637" y="102">({row.h[0].toFixed(3)},</text><text x="637" y="150"> {row.h[1].toFixed(3)})</text>
      </svg>
      <p className={shared.math} data-block-first-sum>h = x + attention branch = {pair(row.input)} + {pair(row.branch)} = {pair(row.h)}</p>
      <p>Then: RMSNorm(h) → MLP → scale → add unchanged h → Output. This disclosed pre-norm block is not a full trained transformer.</p>
      <div className={shared.controlGrid}>
        <LessonRangeControl label="Attention branch scale" value={state.attentionScale} min={0} max={2} step={.1} help="Multiply the attention contribution before the first residual addition; input x bypasses it." onChange={attentionScale=>edit({attentionScale})}/>
        <LessonRangeControl label="MLP branch scale" value={state.mlpScale} min={0} max={2} step={.1} help="Multiply the MLP contribution before the second addition; h bypasses it." onChange={mlpScale=>edit({mlpScale})}/>
        <LessonSelect label="Selected token" choices={[{id:"0",label:"1"},{id:"1",label:"2"}]} value={String(state.token)} onChange={token=>edit({token:Number(token)})}/>
        <LessonSelect label="Operation" choices={blockOperations.map((label,i)=>({id:String(i),label}))} value={String(state.operation)} onChange={operation=>edit({operation:Number(operation)})}/>
      </div><LessonAction onClick={()=>edit({operation:(state.operation+1)%blockOperations.length})}>Step operation</LessonAction>
      <h2>Selected operation: {blockOperations[state.operation]}</h2><p role="status" className={shared.math} data-block-vector>Token {state.token+1} · {pair(vector)}.</p>
      <svg className={styles.bars} viewBox="0 0 650 130" role="img" aria-label={`Two signed coordinates on a fixed −6..6 scale: ${pair(vector)}. Exact complete trace follows.`}>{vector.map((v,i)=>{const zero=330,end=330+v/6*260;return <g key={i}><text x="5" y={35+i*50}>Feature {i+1}</text><line x1="70" x2="590" y1={30+i*50} y2={30+i*50}/>{Math.abs(v)>1e-12?<rect x={Math.min(zero,end)} y={20+i*50} width={Math.abs(end-zero)} height="20"/>:<circle cx={zero} cy={30+i*50} r="4"/>}<text x="600" y={35+i*50}>{v.toFixed(2)}</text></g>})}<line x1="330" x2="330" y1="5" y2="105"/><text x="70" y="125">−6</text><text x="325" y="125">0</text><text x="580" y="125">6</text></svg>
      <p>Attention weights for this token: {row.weights.map(v=>v.toFixed(6)).join(", ")}. {state.token===0?"Future token 2 is masked (weight0).":"Token2 may mix tokens 1 and 2."}</p>
    </section>
    <section className={shared.evidence} aria-label="Complete decoder block trace"><details><summary>Exact vectors through the complete block</summary><p>Inputs: token 1 {pair(inputs[0]!)}; token 2 {pair(inputs[1]!)}. Every operation preserves two features. Values use full precision; display rounds to six decimals.</p>
      <div className={shared.tableScroll} tabIndex={0} role="region" aria-label="Two-token complete numeric trace"><table className={styles.traceTable}><thead><tr><th>Stage</th><th>Token1</th><th>Token2</th></tr></thead><tbody>{(["input","norm1","values","branch","h","norm2","hidden","mlpBranch","output"] as const).map(key=><tr key={key}><th scope="row">{({input:"Input x",norm1:"RMSNorm1 (also Q,K)",values:"Projected V",branch:"Scaled attention",h:"First residual sum h",norm2:"RMSNorm2",hidden:"MLP ReLU hidden",mlpBranch:"Scaled MLP",output:"Output = h + MLP branch"})[key]}</th><td>{pair(trace[0]![key])}</td><td>{pair(trace[1]![key])}</td></tr>)}</tbody></table></div>
      <table className={shared.dataTable}><caption>q·k/sqrt(2); causal mask is applied before softmax.</caption><thead><tr><th>Query token</th><th>Key1 score/weight</th><th>Key2 score/weight</th></tr></thead><tbody>{trace.map((r,i)=><tr key={i}><th scope="row">{i+1}</th><td>{r.scores[0]!.toFixed(6)} / {r.weights[0]!.toFixed(6)}</td><td>{i===0?"Masked / 0":`${r.scores[1]!.toFixed(6)} / ${r.weights[1]!.toFixed(6)}`}</td></tr>)}</tbody></table></details>
      <details><summary>Exact matrices, normalization and sources</summary><p className={shared.math}>RMSNorm(x)=x/sqrt(mean(x²)+0.000001), gain 1.<br/>Wq=Wk=Wo=Wup=identity2×2.<br/>Wv=diag({blockWeights.valueDiagonal.map(v=>v.toFixed(9)).join(", ")}).<br/>Wdown rows: {blockWeights.mlpRows.map(pair).join("; ")}.</p><p>One causal head, two tokens, two features. RMSNorm and the two-layer ReLU MLP operate independently per token. Branch scales are teaching interventions after attention and after the MLP; they are not training. No dropout, learned positional encoding, final normalization, language head or token generation is included. Input hidden states are treated as already positioned. The fixed Wv was chosen so token 1&apos;s initial attention branch is(0.2,−0.1), not estimated from training. This pre-norm RMS variant differs from the original post-norm transformer.</p><a href="https://arxiv.org/abs/1706.03762" target="_blank" rel="noreferrer">Attention Is All You Need · Attention and feed-forward operations</a><br/><a href="https://arxiv.org/abs/2002.04745" target="_blank" rel="noreferrer">On Layer Normalization · Pre-norm placement</a><br/><a href="https://arxiv.org/abs/1910.07467" target="_blank" rel="noreferrer">Root Mean Square Layer Normalization</a></details>
    </section>
  </LearningPage>;
}
