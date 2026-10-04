export type DiagnosticScenario = "even" | "curve" | "fan";
export type DiagnosticModel = "fit" | "mean" | "shift";
export type DiagnosticView = "observed" | "residual";
export type DiagnosticState = { scenario: DiagnosticScenario; scale: number; model: DiagnosticModel; view: DiagnosticView };
export const diagnosticScenarios = [
  { id: "even", label: "Even spread", shortLabel: "8 toy observations" },
  { id: "curve", label: "Curved", shortLabel: "8 toy observations" },
  { id: "fan", label: "Widening", shortLabel: "8 toy observations" },
] as const;
export const diagnosticPatterns = { even: [3,-3,-3,3,3,-3,-3,3], curve: [3,3,-3,-3,-3,-3,3,3], fan: [1,-1,-1,1,3,-3,-5,5] };
export const diagnosticX = [-3,-3,-1,-1,1,1,3,3];
export function diagnosticScore(observed: number[], predicted: number[]) {
  if (observed.length < 2 || observed.length !== predicted.length || ![...observed,...predicted].every(Number.isFinite)) throw new Error("Need at least two paired finite observations and predictions");
  const mean = observed.reduce((sum,y)=>sum+y,0)/observed.length, sst=observed.reduce((sum,y)=>sum+(y-mean)**2,0), sse=observed.reduce((sum,y,i)=>sum+(y-predicted[i])**2,0);
  return { mean, sst, sse, r2: sst === 0 ? null : 1-sse/sst };
}
export function analyzeDiagnostics(s: DiagnosticState) {
  if (!Object.hasOwn(diagnosticPatterns,s.scenario) || !["fit","mean","shift"].includes(s.model) || !["observed","residual"].includes(s.view) || !Number.isFinite(s.scale) || s.scale < 0 || s.scale > 2 || Math.abs(s.scale*10-Math.round(s.scale*10))>1e-9) throw new Error("Invalid diagnostic controls");
  const observed=diagnosticX.map((x,i)=>10+2*x+s.scale*diagnosticPatterns[s.scenario][i]);
  const n=observed.length,sx=diagnosticX.reduce((sum,x)=>sum+x,0),sy=observed.reduce((sum,y)=>sum+y,0),sxx=diagnosticX.reduce((sum,x)=>sum+x*x,0),sxy=diagnosticX.reduce((sum,x,i)=>sum+x*observed[i],0),denominator=n*sxx-sx*sx;
  const fittedSlope=(n*sxy-sx*sy)/denominator, fittedIntercept=(sy-fittedSlope*sx)/n, mean=sy/n;
  const slope=s.model === "mean" ? 0 : fittedSlope, intercept=s.model === "mean" ? mean : fittedIntercept+(s.model === "shift" ? 10 : 0);
  const predicted=diagnosticX.map(x=>slope*x+intercept), score=diagnosticScore(observed,predicted);
  const points=diagnosticX.map((x,i)=>({id:i+1,x,y:observed[i],predicted:predicted[i],residual:observed[i]-predicted[i],squared:(observed[i]-predicted[i])**2,baselineSquared:(observed[i]-mean)**2}));
  return {...s,...score,slope,intercept,fittedSlope,fittedIntercept,points,signed:points.reduce((sum,p)=>sum+p.residual,0)};
}
export type DiagnosticAnalysis = ReturnType<typeof analyzeDiagnostics>;
export function diagnosticNumber(n: number, digits=2) { return (Math.abs(n)<1e-10?0:n).toFixed(digits).replace("-","−"); }
export function diagnosticSigned(n:number) { return `${n>1e-10?"+":""}${diagnosticNumber(n)}`; }
export function diagnosticsChart(a:DiagnosticAnalysis,width:number) {
  if (!Number.isFinite(width)||width<200) throw new Error("Chart width must be at least 200");
  const left=52,right=26,top=26,baseline=326,height=374,low=a.view === "observed" ? -2 : -20,high=a.view === "observed" ? 26 : 20;
  const x=(v:number)=>left+(v+4)/8*(width-left-right),y=(v:number)=>baseline-(v-low)/(high-low)*(baseline-top);
  const mapped=a.points.map(p=>({...p,cx:x(p.x),cy:y(a.view === "observed" ? p.y : p.residual),py:y(p.predicted)}));
  const groups=mapped.reduce<{cx:number;cy:number;ids:number[]}[]>((groups,p)=>{const existing=groups.find(g=>Math.abs(g.cx-p.cx)<1e-9&&Math.abs(g.cy-p.cy)<1e-9);return existing?groups.map(g=>g===existing?{...g,ids:[...g.ids,p.id]}:g):[...groups,{cx:p.cx,cy:p.cy,ids:[p.id]}];},[]);
  return {width,height,left,right,top,baseline,low,high,zero:y(0),mean:y(a.mean),mapped,groups,line:{x1:x(-3),y1:y(a.slope*-3+a.intercept),x2:x(3),y2:y(a.slope*3+a.intercept)},xTicks:[-3,-1,1,3].map(value=>({value,x:x(value)})),yTicks:(a.view === "observed"?[-2,4,10,16,22,26]:[-20,-10,0,10,20]).map(value=>({value,y:y(value)}))};
}
