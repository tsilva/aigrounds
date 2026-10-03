export type BiasScenario = "frame" | "response" | "survival";
export type BiasState = {scenario:BiasScenario;rule:"ideal"|"biased";size:number;sample:number};
export const biasScenarios = [
  {id:"frame",label:"Selection frame",shortLabel:"Before selection",mechanism:"Selection bias: the sampling frame (the list eligible for selection) contains only values 6–10. Records 1–5 cannot enter."},
  {id:"response",label:"Nonresponse",shortLabel:"After invitation",mechanism:"Nonresponse bias: all records can be invited uniformly, but values 1–5 respond with probability 0.2 and values 6–10 with probability 0.8. Only responses are observed."},
  {id:"survival",label:"Survivorship",shortLabel:"After exit",mechanism:"Survivorship bias: toy records 1–3 have exited; only surviving records 4–10 remain observable. The target still includes all original records."},
] as const;
export function keepProbability(scenario:BiasScenario,value:number){
  if(!biasScenarios.some(s=>s.id===scenario)||!Number.isInteger(value)||value<1||value>10)throw new Error("Unknown scenario or population record");
  return scenario==="frame"?Number(value>=6):scenario==="response"?(value<=5?0.2:0.8):Number(value>=4);
}
export function analyzeBias(s:BiasState){
  const scenario=biasScenarios.find(r=>r.id===s.scenario);
  if(!scenario||!["ideal","biased"].includes(s.rule)||!Number.isInteger(s.size)||s.size<1||s.size>1000||!Number.isInteger(s.sample)||s.sample<1||s.sample>20)throw new Error("Choose a known scenario/method, size 1–1000 and sample 1–20");
  const population=Array.from({length:10},(_,i)=>i+1),weights=population.map(v=>s.rule==="ideal"?1:keepProbability(s.scenario,v)),weightTotal=weights.reduce((t,v)=>t+v,0),expectation=population.reduce((t,v,i)=>t+v*weights[i],0)/weightTotal,target=5.5;
  let randomState=1309;
  const samples=Array.from({length:20},(_,k)=>{const values:number[]=[];let total=0,attempts=0;for(let i=0;i<10000;i++){
    randomState=(Math.imul(randomState,1664525)+1013904223)>>>0;const value=Math.floor(randomState/2**32*10)+1;
    randomState=(Math.imul(randomState,1664525)+1013904223)>>>0;const response=randomState/2**32;
    if(values.length<s.size&&(s.rule==="ideal"||response<keepProbability(s.scenario,value))){values.push(value);total+=value;attempts=i+1;}
  }if(values.length!==s.size)throw new Error("Prepared block exhausted");return{number:k+1,values,total,attempts,mean:total/s.size};});
  const current=samples[s.sample-1];
  return{...s,scenario,population,weights,weightTotal,target,expectation,bias:expectation-target,current,samples,gap:current.mean-target,meanMinimum:Math.min(...samples.map(r=>r.mean)),meanMaximum:Math.max(...samples.map(r=>r.mean))};
}
export type BiasAnalysis=ReturnType<typeof analyzeBias>;
export function biasChart(a:BiasAnalysis,width:number,height=420){
  if(!Number.isFinite(width)||width<200||!Number.isFinite(height)||height<400)throw new Error("Invalid chart dimensions");
  const left=44,right=72,top=30,bottom=44,x=(v:number)=>left+(v-1)/9*(width-left-right);
  return{width,height,left,right,top,bottom,baseline:height-bottom,targetX:x(a.target),expectationX:x(a.expectation),rows:a.samples.map((s,i)=>({...s,x:x(s.mean),y:top+i*(height-bottom-top-14)/19,selected:s.number===a.sample})),ticks:[1,5.5,10].map(value=>({value,x:x(value)}))};
}
