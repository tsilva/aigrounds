export type Activation = "relu" | "sigmoid" | "tanh";
export type ActivationState = { inputUnits: number; activation: Activation };
export const activationDefinitions = [
 {id:"relu" as const,label:"ReLU",name:"Rectified linear unit",formula:"max(0,x)",color:"#087c78",range:"Zero for nonpositive inputs, unchanged positive inputs; no global upper bound."},
 {id:"sigmoid" as const,label:"Sigmoid",name:"Sigmoid",formula:"1 / (1 + exp(−x))",color:"#5031dc",range:"Strictly between 0 and 1 for finite real inputs; at zero it is 0.5."},
 {id:"tanh" as const,label:"Tanh",name:"Hyperbolic tangent",formula:"(exp(x) − exp(−x)) / (exp(x) + exp(−x))",color:"#ad4508",range:"Strictly between −1 and 1 for finite real inputs; negative inputs give negative outputs."},
];
export const activationScenarios=[{id:"positive",label:"Positive input",shortLabel:"Input 2"},{id:"negative",label:"Negative input",shortLabel:"Input −2"},{id:"zero",label:"Zero input",shortLabel:"Input 0"}];
export function activationBaseline(id="positive"):ActivationState { return id==="negative"?{inputUnits:-20,activation:"relu"}:id==="zero"?{inputUnits:0,activation:"sigmoid"}:{inputUnits:20,activation:"relu"}; }
export function sameActivation(a:ActivationState,b:ActivationState) { return a.inputUnits===b.inputUnits&&a.activation===b.activation; }
export function activationPresetId(s:ActivationState) { return activationScenarios.find(p=>sameActivation(s,activationBaseline(p.id)))?.id??"custom"; }
export function activate(id:Activation,x:number) { return id==="relu"?Math.max(0,x):id==="sigmoid"?1/(1+Math.exp(-x)):Math.tanh(x); }
export function analyzeActivation(s:ActivationState) {
 const input=s.inputUnits/10;
 const rows=activationDefinitions.map(d=>({...d,output:activate(d.id,input),baseline:activate(d.id,2),delta:activate(d.id,input)-activate(d.id,2)}));
 return {input,rows,selected:rows.find(r=>r.id===s.activation)!};
}
export function editActivation(s:ActivationState,value:number):ActivationState { return !Number.isFinite(value)?s:{...s,inputUnits:Math.max(-60,Math.min(60,Math.round(value*10)))}; }
export const activationNumber=(v:number)=>Number(v.toFixed(6)).toLocaleString("en-US",{useGrouping:false,maximumFractionDigits:6});
export function activationChart(s:ActivationState,width:number) {
 const a=analyzeActivation(s),left=42,top=22,spanX=width-66,spanY=280;
 const map=(x:number,y:number)=>({x:left+spanX*(x+6)/12,y:top+spanY*(6-y)/7});
 return {width,height:350,left,top,spanX,spanY,xTicks:[-6,-4,-2,0,2,4,6].map(value=>({value,x:map(value,0).x})),yTicks:[-1,0,1,2,3,4,5,6].map(value=>({value,y:map(0,value).y})),zeroY:map(0,0).y,zeroX:map(0,0).x,inputX:map(a.input,0).x,curves:a.rows.map(r=>({...r,selected:r.id===s.activation,marker:map(a.input,r.output),vertices:Array.from({length:121},(_,i)=>{const x=(i-60)/10;return map(x,activate(r.id,x));})}))};
}
