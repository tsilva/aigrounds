export type AreaModelId = "uniform" | "triangle" | "narrow";
export type AreaView = "pdf" | "cdf";
export const areaModels = [
  { id:"uniform", label:"Uniform 0–4", shortLabel:"Density 0.25", end:4, formula:"f(x) = 0.25 on [0, 4]" },
  { id:"triangle", label:"Rising triangle", shortLabel:"Values 0–2", end:2, formula:"f(x) = x / 2 on [0, 2]" },
  { id:"narrow", label:"Narrow uniform", shortLabel:"Values 0–0.5", end:.5, formula:"f(x) = 2 on [0, 0.5]" },
] as const;
function modelFor(id: AreaModelId) { const m=areaModels.find(m=>m.id===id); if(!m) throw new Error("Choose a known density model"); return m; }
export function density(id: AreaModelId, x: number) { const m=modelFor(id); if(!Number.isFinite(x)) throw new Error("A value must be finite"); return x<0||x>m.end?0:id==="triangle"?x/2:1/m.end; }
export function cumulative(id: AreaModelId, x: number) { const m=modelFor(id); if(!Number.isFinite(x)) throw new Error("A value must be finite"); const t=Math.max(0,Math.min(m.end,x)); return id==="triangle"?t*t/4:t/m.end; }
export function analyzeArea(id: AreaModelId, lower: number, upper: number) {
  const model=modelFor(id);
  if(!Number.isFinite(lower)||!Number.isFinite(upper)||lower< -1||upper>5||lower>upper) throw new Error("Choose ordered finite bounds from −1 to 5");
  const cdfLower=cumulative(id,lower),cdfUpper=cumulative(id,upper),a=Math.max(0,Math.min(model.end,lower)),b=Math.max(0,Math.min(model.end,upper)),width=b-a;
  const heightLower=density(id,a),heightUpper=density(id,b),area=width*(heightLower+heightUpper)/2;
  return { model,lower,upper,cdfLower,cdfUpper,pdfLower:density(id,lower),pdfUpper:density(id,upper),mass:cdfUpper-cdfLower,clippedLower:a,clippedUpper:b,width,heightLower,heightUpper,area };
}
export type AreaAnalysis = ReturnType<typeof analyzeArea>;
export function areaChart(a: AreaAnalysis, view: AreaView, width: number, height=280) {
  if(!["pdf","cdf"].includes(view)||!Number.isFinite(width)||width<200||!Number.isFinite(height)||height<150) throw new Error("Invalid chart view or dimensions");
  const left=44,right=16,top=22,bottom=44,maxY=view==="pdf"?2.25:1;
  const x=(v:number)=>left+(v+1)/6*(width-left-right),y=(v:number)=>top+(maxY-v)/maxY*(height-top-bottom);
  const vertices=view==="pdf"?[[-1,0],[0,0],[0,density(a.model.id,0)],[a.model.end,density(a.model.id,a.model.end)],[a.model.end,0],[5,0]]:Array.from({length:241},(_,i)=>{const value=-1+i/40;return [value,cumulative(a.model.id,value)];});
  const points=vertices.map(([vx,vy])=>`${x(vx).toFixed(3)},${y(vy).toFixed(3)}`).join(" ");
  const polygon=[[a.clippedLower,0],[a.clippedLower,a.heightLower],[a.clippedUpper,a.heightUpper],[a.clippedUpper,0]].map(([vx,vy])=>`${x(vx).toFixed(3)},${y(vy).toFixed(3)}`).join(" ");
  return {width,height,left,right,top,bottom,maxY,points,polygon,baseline:y(0),lower:{x:x(a.lower),y:y(view==="pdf"?a.pdfLower:a.cdfLower)},upper:{x:x(a.upper),y:y(view==="pdf"?a.pdfUpper:a.cdfUpper)},difference:{x:x(a.upper),low:y(a.cdfLower),high:y(a.cdfUpper)},xTicks:[-1,0,1,2,3,4,5].map(value=>({value,x:x(value)})),yTicks:(view==="pdf"?[0,.25,1,2,2.25]:[0,.25,.5,.75,1]).map(value=>({value,y:y(value)}))};
}
