export type SeState={model:"bounded"|"levels";size:number;sample:number};
export const seModels=[{id:"bounded",label:"Bounded values",shortLabel:"2, 4, 6, 8",values:[2,4,6,8]},{id:"levels",label:"Two levels",shortLabel:"0 or 10",values:[0,10]}] as const;
export function analyzeSe(s:SeState){
  const model=seModels.find(m=>m.id===s.model);
  if(!model||!Number.isInteger(s.size)||s.size<1||s.size>400||!Number.isInteger(s.sample)||s.sample<1||s.sample>200)throw new Error("Choose a source, size 1–400 and sample 1–200");
  const target=model.values.reduce<number>((t,v)=>t+v,0)/model.values.length,variance=model.values.reduce<number>((t,v)=>t+(v-target)**2,0)/model.values.length,sigma=Math.sqrt(variance),se=sigma/Math.sqrt(s.size);
  let randomState=1309;
  const samples=Array.from({length:200},(_,k)=>{const values:number[]=[];let total=0;for(let i=0;i<400;i++){randomState=(Math.imul(randomState,1664525)+1013904223)>>>0;if(i<s.size){const value=model.values[Math.floor(randomState/2**32*model.values.length)];values.push(value);total+=value;}}return{number:k+1,values,total,mean:total/s.size};});
  const current=samples[s.sample-1],batchMean=samples.reduce((t,r)=>t+r.mean,0)/200,batchSd=Math.sqrt(samples.reduce((t,r)=>t+(r.mean-batchMean)**2,0)/200);
  const bins=Array.from({length:40},(_,i)=>({lower:i/4,upper:(i+1)/4,count:samples.filter(r=>Math.min(39,Math.floor(r.mean*4))===i).length}));
  return{...s,model,target,variance,sigma,se,samples,current,batchMean,batchSd,bins,gap:current.mean-target,meanMinimum:Math.min(...samples.map(r=>r.mean)),meanMaximum:Math.max(...samples.map(r=>r.mean))};
}
export type SeAnalysis=ReturnType<typeof analyzeSe>;
export function seChart(a:SeAnalysis,width:number,height=300){
  if(!Number.isFinite(width)||width<200||!Number.isFinite(height)||height<250)throw new Error("Invalid chart dimensions");
  const left=44,right=24,top=32,bottom=50,baseline=height-bottom,x=(value:number)=>left+value/10*(width-left-right),y=(count:number)=>baseline-count/200*(baseline-top);
  return{width,height,left,right,top,bottom,baseline,targetX:x(a.target),selectedX:x(a.current.mean),bars:a.bins.map(b=>({...b,x:x(b.lower)+1,width:(width-left-right)/40-2,y:y(b.count),height:baseline-y(b.count)})),ticks:[0,2.5,5,7.5,10].map(value=>({value,x:x(value)})),counts:[0,100,200].map(value=>({value,y:y(value)}))};
}
