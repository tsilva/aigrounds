export type EntropyState={masses:readonly [number,number,number,number];grouping:"ab-cd"|"ac-bd"};
export const entropyIds=["A","B","C","D"] as const;
export const entropyPresets={equal:[25,25,25,25],likely:[97,1,1,1],groups:[40,40,10,10]} as const;
export const entropyScenarios=[{id:"equal",label:"Equal buckets",shortLabel:"Four equal outcomes"},{id:"likely",label:"One likely bucket",shortLabel:"Three rare outcomes"},{id:"groups",label:"Uneven groups",shortLabel:"Two observation choices"}] as const;
export const entropyPairs={AB:[0,1],AC:[0,2],AD:[0,3],BC:[1,2],BD:[1,3],CD:[2,3]} as const;
export type EntropyPair=keyof typeof entropyPairs;
export const entropyNumber=(v:number)=>Math.abs(v)<.0000005?"0.000000":v.toFixed(6);
const validMass=(m:readonly number[])=>m.length===4&&m.every(v=>Number.isInteger(v)&&v>=0&&v<=100)&&m.reduce((a,b)=>a+b,0)===100;
export function moveEntropyMass(masses:EntropyState["masses"],pair:EntropyPair,first:number):EntropyState["masses"]{if(!validMass(masses)||!Object.hasOwn(entropyPairs,pair))throw Error("Unsupported probability mass");const [i,j]=entropyPairs[pair],total=masses[i]+masses[j];if(!Number.isInteger(first)||first<0||first>total)throw Error("Unsupported mass transfer");const next:[number,number,number,number]=[...masses];next[i]=first;next[j]=total-first;return next;}
const h=(probabilities:readonly number[])=>probabilities.reduce((sum,p)=>sum+(p===0?0:-p*Math.log2(p)),0);
export function analyzeEntropy(state:EntropyState){if(!validMass(state.masses)||!["ab-cd","ac-bd"].includes(state.grouping))throw Error("Unsupported entropy state");const p=state.masses.map(m=>m/100),buckets=p.map((probability,i)=>({id:entropyIds[i],mass:state.masses[i],p:probability,surprise:probability===0?null:-Math.log2(probability),contribution:probability===0?0:-probability*Math.log2(probability)}));
  const partition=state.grouping==="ab-cd"?[[0,1],[2,3]]:[[0,2],[1,3]],groups=partition.map(indices=>{const mass=indices.reduce((s,i)=>s+state.masses[i],0),probability=mass/100,posterior=mass===0?null:indices.map(i=>state.masses[i]/mass),entropy=posterior===null?null:h(posterior);return{ids:indices.map(i=>entropyIds[i]),mass,probability,posterior,entropy,weighted:entropy===null?0:probability*entropy};});
  const entropy=buckets.reduce((s,b)=>s+b.contribution,0),conditional=groups.reduce((s,g)=>s+g.weighted,0),gain=Math.max(0,entropy-conditional),groupEntropy=h(groups.map(g=>g.probability));
  return{buckets,groups,entropy,conditional,gain,groupEntropy};
}
export function entropyChart(result:ReturnType<typeof analyzeEntropy>,width:number){const left=40,span=Math.max(80,width-90);return{width,height:204,left,span,rows:result.buckets.map((b,i)=>({...b,x:left,y:24+i*32,width:span*b.p})),ticks:[0,50,100].map(value=>({value,x:left+span*value/100}))};}
export const entropyPresetId=(masses:EntropyState["masses"])=>Object.entries(entropyPresets).find(([,m])=>m.every((v,i)=>v===masses[i]))?.[0]??"custom";
