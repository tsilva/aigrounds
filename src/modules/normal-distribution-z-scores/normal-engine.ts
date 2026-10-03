export type NormalTail = "left" | "right";
export type NormalState = {mean:number;sd:number;value:number;tail:NormalTail};
export const normalModels = [
  {id:"standard",label:"Standard normal",shortLabel:"Mean 0 · SD 1",mean:0,sd:1},
  {id:"wide",label:"Wider normal",shortLabel:"Mean 0 · SD 2",mean:0,sd:2},
  {id:"measurement",label:"Measurement model",shortLabel:"Mean 20 · SD 2",mean:20,sd:2},
];
export function normalTails(z:number) {
  if(!Number.isFinite(z))throw new Error("Z-score must be finite");
  if(z===0)return {left:.5,right:.5};
  const t=1/(1+.2316419*Math.abs(z));
  // Abramowitz & Stegun 26.2.17. Compute the smaller tail directly to avoid
  // subtracting nearly equal values; results are numerical approximations.
  const q=Math.exp(-z*z/2)/Math.sqrt(2*Math.PI)*t*(.319381530+t*(-.356563782+t*(1.781477937+t*(-1.821255978+t*1.330274429))));
  return z<0?{left:q,right:1-q}:{left:1-q,right:q};
}
export function normalDensity(mean:number,sd:number,x:number) {
  if(!Number.isFinite(mean)||!Number.isFinite(sd)||sd<=0||!Number.isFinite(x))throw new Error("Finite values and positive standard deviation required");
  const z=(x-mean)/sd;return Math.exp(-z*z/2)/(sd*Math.sqrt(2*Math.PI));
}
export function analyzeNormal(s:NormalState) {
  if(!Number.isFinite(s.mean)||s.mean< -10||s.mean>30||!Number.isFinite(s.sd)||s.sd<.5||s.sd>5||!Number.isFinite(s.value)||s.value< -30||s.value>50||!["left","right"].includes(s.tail))throw new Error("Choose valid bounded parameters and a tail");
  const distance=s.value-s.mean,z=distance/s.sd,tails=normalTails(z);
  return {...s,distance,z,...tails,probability:tails[s.tail],density:normalDensity(s.mean,s.sd,s.value)};
}
export type NormalAnalysis = ReturnType<typeof analyzeNormal>;
export function normalChart(a:NormalAnalysis,width:number,height=280) {
  if(!Number.isFinite(width)||width<200||!Number.isFinite(height)||height<150)throw new Error("Invalid chart dimensions");
  const left=44,right=16,top=22,bottom=44,half=Math.max(8,4*a.sd),min=a.mean-half,max=a.mean+half;
  const x=(v:number)=>left+(v-min)/(max-min)*(width-left-right),y=(v:number)=>top+(.85-v)/.85*(height-top-bottom);
  const points=Array.from({length:321},(_,i)=>{const v=min+i/320*(max-min);return `${x(v).toFixed(3)},${y(normalDensity(a.mean,a.sd,v)).toFixed(3)}`;}).join(" ");
  const clipped=Math.max(min,Math.min(max,a.value)),lo=a.tail==="left"?min:clipped,hi=a.tail==="left"?clipped:max;
  const polygon=[`${x(lo).toFixed(3)},${y(0).toFixed(3)}`,...Array.from({length:161},(_,i)=>{const v=lo+i/160*(hi-lo);return `${x(v).toFixed(3)},${y(normalDensity(a.mean,a.sd,v)).toFixed(3)}`;}),`${x(hi).toFixed(3)},${y(0).toFixed(3)}`].join(" ");
  return {width,height,left,right,top,bottom,min,max,points,polygon,baseline:y(0),centerX:x(a.mean),valueX:x(clipped),offWindow:a.value<min?"left":a.value>max?"right":null,xTicks:[min,a.mean-half/2,a.mean,a.mean+half/2,max].map(value=>({value,x:x(value)})),yTicks:[0,.2,.4,.6,.85].map(value=>({value,y:y(value)}))};
}
