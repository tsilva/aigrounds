import { LessonRangeControl } from "@/components/learning-page/learning-page";
import type { ForwardDebug, MlpModel } from "./mnist-mlp-engine";
import sharedStyles from "@/components/learning-page/learning-page.module.css";
import styles from "./playground.module.css";
export const number = (v:number) => Math.abs(v)>0 && Math.abs(v)<.000001 ? v.toExponential(4) : v.toFixed(6);
const top=(values:Float32Array,count:number,pinned:number)=>Array.from(new Set([pinned,...Array.from(values,(_,i)=>i).sort((a,b)=>Math.abs(values[b])-Math.abs(values[a])).slice(0,count)])).slice(0,count).sort((a,b)=>a-b);
const sample=(size:number,count:number,pinned:number)=>Array.from(new Set([pinned,...Array.from({length:Math.min(size,count)},(_,i)=>Math.floor(i*size/Math.min(size,count)))])).slice(0,count).sort((a,b)=>a-b);
export function NetworkPreview({model,debug,input,layer,neuron,pixel,threshold,topK,onNeuron,onPixel}:{model:MlpModel;debug:ForwardDebug;input:Float32Array;layer:number;neuron:number;pixel:number;threshold:number;topK:number;onNeuron:(layer:number,index:number)=>void;onPixel:(index:number)=>void}) {
  const values=[input,...debug.activations];
  const nodes=values.map((v,i)=>i===values.length-1?Array.from(v,(_,j)=>j):top(v,6,i===0?pixel:i-1===layer?neuron:0));
  const width=Math.max(640,values.length*160),height=370;
  const x=(i:number)=>40+i*(width-80)/(values.length-1),y=(i:number,j:number)=>55+j*(height-100)/Math.max(1,nodes[i].length-1);
  const edges:{x1:number;y1:number;x2:number;y2:number;c:number}[]=[];
  model.layers.forEach((l,i)=>nodes[i+1].forEach((target,j)=>{
    const terms=Array.from(values[i],(a,source)=>({source,c:a*l.weights[source*l.outputSize+target]})).sort((a,b)=>Math.abs(b.c)-Math.abs(a.c));
    const max=Math.abs(terms[0]?.c??0);
    terms.slice(0,topK).filter(t=>max>0&&Math.abs(t.c)/max>=threshold).forEach(t=>{const k=nodes[i].indexOf(t.source);if(k>=0)edges.push({x1:x(i),y1:y(i,k),x2:x(i+1),y2:y(i+1,j),c:t.c});});
  }));
  return <><p>Each hidden layer shows six inspected nodes, including your selection. Inputs use absolute preprocessed values; all ten output nodes are shown. Edge ranking is by absolute activation×weight per target, then Top-K and a fraction of its largest contribution. Only edges between displayed nodes can appear. Blue means positive, pink negative; this is a sampled view.</p><div className={styles.scroll}><svg className={styles.network} width={width} height={height} aria-label="Sampled network, with keyboard-selectable neurons">
    {edges.map((e,i)=><line key={i} {...{x1:e.x1,y1:e.y1,x2:e.x2,y2:e.y2}} stroke={e.c>=0?"#1470ba":"#c23969"} strokeWidth="1" opacity=".45" />)}
    {nodes.map((list,i)=><g key={i}><text x={x(i)} y="20" textAnchor="middle">{i===0?"Input":`Layer ${i}`}</text>{list.map((id,j)=><g key={id} role="button" tabIndex={0} aria-label={i===0?`Inspect input pixel ${id}`:`Inspect layer ${i} neuron ${id}`} onClick={()=>i===0?onPixel(id):onNeuron(i-1,id)} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();if(i===0)onPixel(id);else onNeuron(i-1,id);}}}><circle cx={x(i)} cy={y(i,j)} r="12" fill={i===0?id===pixel?"#5031dc":"white":i-1===layer&&id===neuron?"#5031dc":"white"} stroke="#5031dc" strokeWidth="2" /><text x={x(i)+17} y={y(i,j)+4}>{id}</text><title>{`Index ${id}, value ${number(values[i][id])}`}</title></g>)}</g>)}
  </svg></div><p data-network-count>{edges.length} displayed edges. All {model.layers.length} actual dense layers still run.</p></>;
}
export function ContributionMatrix({model,debug,input,layer,neuron,source,onSource,onNeuron}:{model:MlpModel;debug:ForwardDebug;input:Float32Array;layer:number;neuron:number;source:number;onSource:(i:number)=>void;onNeuron:(i:number)=>void}) {
  const l=model.layers[layer],previous=layer===0?input:debug.activations[layer-1],sources=sample(l.inputSize,64,source),targets=sample(l.outputSize,32,neuron);
  const products=sources.flatMap(s=>targets.map(t=>previous[s]*l.weights[s*l.outputSize+t])),max=Math.max(...products.map(Math.abs),1e-12);
  const value=previous[source],weight=l.weights[source*l.outputSize+neuron];
  return <><p>Sampled matrix: {sources.length} upstream rows × {targets.length} destination columns, with inspected indices included. Each cell is activation×effective weight. Blue is positive, pink negative; darker means greater absolute magnitude relative to this sampled matrix. The model uses every connection.</p><svg className={styles.matrix} viewBox={`0 0 ${targets.length*10} ${sources.length*5}`} role="img" aria-label="Sampled signed contributions; exact inspected cell follows">{sources.flatMap((s,r)=>targets.map((t,c)=>{const p=previous[s]*l.weights[s*l.outputSize+t];return <rect key={`${s}-${t}`} aria-hidden="true" x={c*10} y={r*5} width="9" height="4" fill={p>=0?"#1470ba":"#c23969"} opacity={Math.abs(p)/max} onClick={()=>{onSource(s);onNeuron(t);}}><title>{`Source ${s}, target ${t}, contribution ${number(p)}`}</title></rect>;}))}</svg><LessonRangeControl label="Matrix source index" value={source} min={0} max={l.inputSize-1} step={1} help="Inspect any actual source, including rows omitted from the sample. Destination uses Neuron index." onChange={onSource} /><p className={`${sharedStyles.math} ${styles.formula}`} data-matrix-cell>{`Source ${source} → neuron ${neuron}: ${number(value)} × ${number(weight)} = ${number(value*weight)}`}</p></>;
}
