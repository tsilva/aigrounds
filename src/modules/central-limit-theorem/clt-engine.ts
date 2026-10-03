export type CltState={model:"skew"|"bimodal"|"rare";size:number;radius:number};
export const cltModels=[
  {id:"skew",label:"Skewed source",shortLabel:"10 U⁴",mean:2,variance:64/9,sd:8/3,description:"Draw U uniformly from 0 to 1; value = 10 U⁴. Many values are low and fewer are high. This bounded source stays right-skewed.",rule:"X = 10 U⁴; E(X) = 10 / 5 = 2; Var(X) = 100 / 9 − 4 = 64 / 9."},
  {id:"bimodal",label:"Two peaks",shortLabel:"0 or 10",mean:5,variance:25,sd:5,description:"Value 0 or 10 with equal probability. The original source has two discrete outcomes, rather than a normal shape.",rule:"P(X = 0) = P(X = 10) = 0.5; mean = 5; variance = 25."},
  {id:"rare",label:"Rare event",shortLabel:"0 or 20 · 5%",mean:1,variance:19,sd:Math.sqrt(19),description:"Value 0 with probability 0.95 or value 20 with probability 0.05. A small sample often contains very few high outcomes.",rule:"P(X = 20) = 0.05; mean = 20 × 0.05 = 1; variance = 400 × 0.05 × 0.95 = 19."},
] as const;
export function cltNormalCdf(z:number){
  if(!Number.isFinite(z))throw new Error("Finite Z required");if(z===0)return 0.5;
  const t=1/(1+0.2316419*Math.abs(z));
  // Abramowitz & Stegun 26.2.17, numerical normal-tail approximation.
  const q=Math.exp(-z*z/2)/Math.sqrt(2*Math.PI)*t*(0.319381530+t*(-0.356563782+t*(1.781477937+t*(-1.821255978+t*1.330274429))));
  return z<0?q:1-q;
}
export function analyzeClt(s:CltState){
  const model=cltModels.find(m=>m.id===s.model);
  if(!model||!Number.isInteger(s.size)||s.size<1||s.size>400||!Number.isFinite(s.radius)||s.radius<0.5||s.radius>3||!Number.isInteger(s.radius*2))throw new Error("Choose a source, size 1–400 and radius 0.5–3 in half-unit steps");
  let randomState=1309;const se=model.sd/Math.sqrt(s.size),denominator=Math.sqrt(model.variance*s.size);
  const samples=Array.from({length:1000},(_,k)=>{let total=0;const first:number[]=[];for(let i=0;i<400;i++){randomState=(Math.imul(randomState,1664525)+1013904223)>>>0;if(i<s.size){const u=randomState/2**32,value=s.model==="skew"?10*u**4:s.model==="bimodal"?(u<0.5?0:10):(u<0.05?20:0);total+=value;if(k===0&&i<8)first.push(value);}}return{number:k+1,total,mean:total/s.size,z:(total-s.size*model.mean)/denominator,first};});
  const bins=Array.from({length:24},(_,i)=>{const lower=-6+i/2,upper=lower+0.5;return{lower,upper,count:samples.filter(r=>r.z>=lower&&(i===23?r.z<=upper:r.z<upper)).length,expected:1000*(cltNormalCdf(upper)-cltNormalCdf(lower))};});
  const below=samples.filter(r=>r.z< -6).length,above=samples.filter(r=>r.z>6).length,within=samples.filter(r=>r.z>=-s.radius&&r.z<s.radius).length,normalShare=cltNormalCdf(s.radius)-cltNormalCdf(-s.radius);
  return{...s,model,se,samples,bins,below,above,within,share:within/1000,normalShare,current:samples[0]};
}
export type CltAnalysis=ReturnType<typeof analyzeClt>;
export function cltChart(a:CltAnalysis,width:number,height=360){
  if(!Number.isFinite(width)||width<200||!Number.isFinite(height)||height<250)throw new Error("Invalid chart dimensions");
  const left=44,right=24,top=32,bottom=50,baseline=height-bottom,x=(v:number)=>left+(v+6)/12*(width-left-right),y=(c:number)=>baseline-c/1000*(baseline-top);
  const bars=a.bins.map(b=>({...b,x:x(b.lower)+1,width:(width-left-right)/24-2,y:y(b.count),height:baseline-y(b.count),referenceX:x((b.lower+b.upper)/2),referenceY:y(b.expected)}));
  return{width,height,left,right,top,bottom,baseline,bars,reference:bars.map(b=>`${b.referenceX.toFixed(3)},${b.referenceY.toFixed(3)}`).join(" "),intervalLeft:x(-a.radius),intervalRight:x(a.radius),ticks:[-6,-3,0,3,6].map(value=>({value,x:x(value)})),counts:[0,500,1000].map(value=>({value,y:y(value)}))};
}
