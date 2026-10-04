export type GeneralizationSplit = "interleaved" | "shifted" | "left";
export type GeneralizationModel = "line" | "nearest";
export type GeneralizationSource = "train" | "all";
export type GeneralizationState = { split: GeneralizationSplit; model: GeneralizationModel; source: GeneralizationSource; testVisible: boolean };
export type GeneralizationRole = "train" | "validation" | "test";
export const generalizationValues = [1,5,4,8,7,11,15,14,18,17,21,24];
export const generalizationSplits = {
  interleaved: { train:[0,3,6,9],validation:[1,4,7,10],test:[2,5,8,11] },
  shifted: { train:[2,5,8,11],validation:[0,3,6,9],test:[1,4,7,10] },
  left: { train:[0,1,2,3],validation:[4,5,6,7],test:[8,9,10,11] },
};
export const generalizationScenarios = [
  {id:"interleaved",label:"Interleaved",shortLabel:"4 Train · 4 Validation · 4 Test"},
  {id:"shifted",label:"Shifted rows",shortLabel:"4 Train · 4 Validation · 4 Test"},
  {id:"left",label:"Left training",shortLabel:"4 Train · 4 Validation · 4 Test"},
];
export function analyzeGeneralization(s:GeneralizationState) {
  if(!Object.hasOwn(generalizationSplits,s.split)||!["line","nearest"].includes(s.model)||!["train","all"].includes(s.source)||typeof s.testVisible!=="boolean")throw new Error("Invalid split/model/fitting source");
  const groups=generalizationSplits[s.split],fittingIds=s.source==="train"?[...groups.train]:generalizationValues.map((_,i)=>i),n=fittingIds.length,sx=fittingIds.reduce((sum,i)=>sum+i,0),sy=fittingIds.reduce((sum,i)=>sum+generalizationValues[i],0),sxx=fittingIds.reduce((sum,i)=>sum+i*i,0),sxy=fittingIds.reduce((sum,i)=>sum+i*generalizationValues[i],0),denominator=n*sxx-sx*sx;
  if(denominator<=0)throw new Error("Fitting X values must vary");
  const slope=(n*sxy-sx*sy)/denominator,intercept=(sy-slope*sx)/n;
  const points=generalizationValues.map((y,x)=>{const nearest=fittingIds.reduce((best,id)=>Math.abs(id-x)<Math.abs(best-x)||(Math.abs(id-x)===Math.abs(best-x)&&id<best)?id:best,fittingIds[0]),predicted=s.model==="line"?slope*x+intercept:generalizationValues[nearest],residual=y-predicted,role:GeneralizationRole=groups.train.includes(x)?"train":groups.validation.includes(x)?"validation":"test";return{id:x+1,x,y,predicted,residual,squared:residual*residual,role,nearestId:nearest+1,usedForFit:fittingIds.includes(x)};});
  const mse=Object.fromEntries((Object.keys(groups) as GeneralizationRole[]).map(role=>[role,groups[role].reduce((sum,i)=>sum+points[i].squared,0)/groups[role].length])) as Record<GeneralizationRole,number>;
  return{...s,slope,intercept,points,mse,groups,fittingIds,fittingCount:n,leaked:s.source==="all"};
}
export type GeneralizationAnalysis=ReturnType<typeof analyzeGeneralization>;
export function generalizationNumber(n:number,digits=3){return(Math.abs(n)<1e-10?0:n).toFixed(digits).replace("-","−");}
export function generalizationSigned(n:number){return`${n>1e-10?"+":""}${generalizationNumber(n)}`;}
export function generalizationChart(a:GeneralizationAnalysis,width:number){
  if(!Number.isFinite(width)||width<200)throw new Error("Chart width must be at least 200");
  const left=52,right=26,top=26,baseline=326,height=374,x=(v:number)=>left+v/11*(width-left-right),y=(v:number)=>baseline-(v+2)/30*(baseline-top);
  const points=a.points.map(p=>{const cx=x(p.x),cy=y(p.y),py=y(p.predicted);return{...p,cx,cy,py,visible:p.role!=="test"||a.testVisible,square:`${cx-8},${py-8} ${cx+8},${py-8} ${cx+8},${py+8} ${cx-8},${py+8}`,diamond:`${cx},${cy-6} ${cx+6},${cy} ${cx},${cy+6} ${cx-6},${cy}`,triangle:`${cx},${cy-7} ${cx+7},${cy+6} ${cx-7},${cy+6}`};});
  return{width,height,left,right,top,baseline,points,line:{x1:x(0),y1:y(a.intercept),x2:x(11),y2:y(11*a.slope+a.intercept)},xTicks:[0,3,6,9,11].map(value=>({value,x:x(value)})),yTicks:[-2,4,10,16,22,28].map(value=>({value,y:y(value)}))};
}
