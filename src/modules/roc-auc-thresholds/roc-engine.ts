export type RocScenario="ordered"|"reversed"|"tied";
export type RocState={scenario:RocScenario;tick:number};
export const rocScenarios=[{id:"ordered",label:"Mostly ordered",shortLabel:"6 positive · 6 negative"},{id:"reversed",label:"Reversed",shortLabel:"Same labels, reversed scores"},{id:"tied",label:"All tied",shortLabel:"All scores 0.50"}];
const orderedScores=[18,16,14,14,12,8,16,10,8,6,4,2];
export function analyzeRoc(s:RocState){
 if(!["ordered","reversed","tied"].includes(s.scenario)||!Number.isInteger(s.tick)||s.tick<0||s.tick>20)throw new Error("Invalid ranking or threshold");
 const scores=orderedScores.map(v=>s.scenario==="ordered"?v:s.scenario==="reversed"?20-v:10),countsAt=(tick:number)=>{const tp=scores.slice(0,6).filter(v=>v>=tick).length,fp=scores.slice(6).filter(v=>v>=tick).length;return{tp,fp,fn:6-tp,tn:6-fp,tpr:tp/6,fpr:fp/6};},baseVertices=[20,...[...new Set(scores)].sort((a,b)=>b-a)].map(tick=>({tick,...countsAt(tick)})),vertices=baseVertices.map((p,i)=>({...p,segmentArea:i?(p.fpr-baseVertices[i-1].fpr)*(p.tpr+baseVertices[i-1].tpr)/2:0})),auc=vertices.reduce((sum,p)=>sum+p.segmentArea,0);
 let wins=0,ties=0;for(const p of scores.slice(0,6))for(const n of scores.slice(6)){if(p>n)wins++;else if(p===n)ties++;}
 const rows=scores.map((score,i)=>{const actual=i<6,predicted=score>=s.tick,bucket=actual?(predicted?"TP":"FN"):(predicted?"FP":"TN");return{id:i+1,scoreTick:score,actual,predicted,bucket};});
 return{...s,scores,rows,vertices,auc,wins,ties,pairAuc:(wins+ties/2)/36,...countsAt(s.tick)};
}
export type RocAnalysis=ReturnType<typeof analyzeRoc>;
export const rocThreshold=(tick:number)=>(tick/20).toFixed(2);
export const rocPercent=(value:number)=>`${(100*value).toFixed(1)}%`;
export function rocChart(a:RocAnalysis,width:number){
 if(!Number.isFinite(width)||width<200)throw new Error("Chart width must be at least 200");
 const left=62,right=26,top=26,baseline=326,height=386,x=(v:number)=>left+v*(width-left-right),y=(v:number)=>baseline-v*(baseline-top),points=a.vertices.map((p,i)=>({...p,id:i,cx:x(p.fpr),cy:y(p.tpr)})),path=points.map((p,i)=>`${i?"L":"M"}${p.cx},${p.cy}`).join(" "),cx=x(a.fpr),cy=y(a.tpr);
 return{width,height,left,right,top,baseline,points,path,area:`${path} L${width-right},${baseline} Z`,selected:{cx,cy,diamond:`${cx},${cy-8} ${cx+8},${cy} ${cx},${cy+8} ${cx-8},${cy}`},ticks:[0,.5,1].map(value=>({value,x:x(value),y:y(value)})),diagonal:{x1:x(0),y1:y(0),x2:x(1),y2:y(1)}};
}
