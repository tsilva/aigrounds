export type SamplingModelId = "bounded" | "levels" | "rare";
export type SamplingState = {model:SamplingModelId;size:number;sample:number;revealed:boolean};
export const samplingModels = [
  {id:"bounded",label:"Bounded values",shortLabel:"4 records",values:[2,4,6,8]},
  {id:"levels",label:"Two levels",shortLabel:"8 records",values:[0,0,0,0,10,10,10,10]},
  {id:"rare",label:"Rare high values",shortLabel:"12 records",values:[1,1,1,1,1,1,1,1,5,9,17,41]},
] as const;
export function analyzeSampling(s:SamplingState) {
  const model=samplingModels.find(m=>m.id===s.model);
  if(!model||!Number.isInteger(s.size)||s.size<1||s.size>1000||!Number.isInteger(s.sample)||s.sample<1||s.sample>20)throw new Error("Choose a known model, size 1–1000 and sample 1–20");
  const target=model.values.reduce<number>((t,v)=>t+v,0)/model.values.length;
  let randomState=1309;
  const samples=Array.from({length:20},(_,k)=>{const values:number[]=[];let total=0;for(let i=0;i<1000;i++){randomState=(Math.imul(randomState,1664525)+1013904223)>>>0;if(i<s.size){const value=model.values[Math.floor(randomState/2**32*model.values.length)];values.push(value);total+=value;}}return{number:k+1,values,total,mean:total/s.size};});
  const current=samples[s.sample-1],minimum=Math.min(...model.values),maximum=Math.max(...model.values),meanMinimum=Math.min(...samples.map(r=>r.mean)),meanMaximum=Math.max(...samples.map(r=>r.mean));
  return {...s,model,target,samples,current,minimum,maximum,meanMinimum,meanMaximum,error:Math.abs(current.mean-target),observedMinimum:Math.min(...current.values),observedMaximum:Math.max(...current.values)};
}
export type SamplingAnalysis = ReturnType<typeof analyzeSampling>;
export function samplingChart(a:SamplingAnalysis,width:number,height=420) {
  if(!Number.isFinite(width)||width<200||!Number.isFinite(height)||height<400)throw new Error("Invalid chart dimensions");
  const left=44,right=72,top=30,bottom=44;
  const x=(v:number)=>left+(v-a.minimum)/(a.maximum-a.minimum)*(width-left-right);
  return {width,height,left,right,top,bottom,baseline:height-bottom,targetX:x(a.target),rows:a.samples.map((s,i)=>({...s,x:x(s.mean),y:top+i*(height-bottom-top-14)/19,selected:s.number===a.sample})),ticks:[a.minimum,(a.minimum+a.maximum)/2,a.maximum].map(value=>({value,x:x(value)}))};
}
