export type Coordinate = [number, number];
export type Cluster = 0 | 1;
export type KMeansState = { points: Coordinate[]; centroids: Coordinate[]; assignments: Cluster[] | null; phase: "ready" | "assigned" | "updated"; updates: number };
export const originalPoints: Coordinate[] = [[20,20],[20,40],[40,30],[70,60],[80,80],[90,70]];
export const kmeansScenarios = [
 {id:"separated",label:"Separated seeds",shortLabel:"Different starting points"},
 {id:"coincident",label:"Coincident seeds",shortLabel:"Same starting point"},
 {id:"swapped",label:"Swapped seeds",shortLabel:"Reverse the seeds"},
];
export function kmeansBaseline(id="separated"): KMeansState {
 const centroids: Coordinate[] = id==="coincident"?[[50,50],[50,50]]:id==="swapped"?[[90,80],[10,20]]:[[10,20],[90,80]];
 return {points:originalPoints.map(p=>[...p]),centroids,assignments:null,phase:"ready",updates:0};
}
export function sameKMeans(a:KMeansState,b:KMeansState) { return JSON.stringify(a)===JSON.stringify(b); }
export function kmeansPresetId(s:KMeansState) { return kmeansScenarios.find(p=>sameKMeans(s,kmeansBaseline(p.id)))?.id??"custom"; }
export function squaredDistance(a:Coordinate,b:Coordinate) { return (a[0]-b[0])**2+(a[1]-b[1])**2; }
export function analyzeKMeans(s:KMeansState) {
 const distances=s.points.map(p=>s.centroids.map(c=>squaredDistance(p,c)));
 const nearest:Cluster[]=distances.map(d=>d[0]!<=d[1]!?0:1);
 const groups=s.centroids.map((center,k)=>{
  const members=s.assignments===null?[]:s.assignments.flatMap((c,i)=>c===k?[i]:[]);
  const sum:Coordinate=[0,1].map(axis=>members.reduce((v,i)=>v+s.points[i]![axis]!,0)) as Coordinate;
  const mean:Coordinate|null=members.length?[sum[0]/members.length,sum[1]/members.length]:null;
  return {members,count:members.length,sum,mean,center,sse:s.assignments===null?null:members.reduce((v,i)=>v+distances[i]![k]!,0)};
 });
 return {distances,nearest,ties:distances.map(d=>d[0]===d[1]),groups,sse:s.assignments===null?null:groups.reduce((v,g)=>v+g.sse!,0)};
}
export function assignKMeans(s:KMeansState):KMeansState { return {...s,assignments:analyzeKMeans(s).nearest,phase:"assigned"}; }
export function updateKMeans(s:KMeansState):KMeansState {
 if(s.phase!=="assigned"||!s.assignments)return s;
 const a=analyzeKMeans(s);
 return {...s,centroids:a.groups.map(g=>g.mean?[...g.mean]:[...g.center]),phase:"updated",updates:s.updates+1};
}
export function editKMeans(s:KMeansState,object:string,axis:0|1,value:number):KMeansState {
 if(!Number.isFinite(value))return s;
 const key=object[0]==="P"?"points":"centroids",i=Number(object.slice(1))-1,old=s[key][i];
 if(!old)return s;
 const bounded=Math.min(100,Math.max(0,value));if(old[axis]===bounded)return s;
 return {...s,[key]:s[key].map((p,j)=>j===i?[axis===0?bounded:p[0],axis===1?bounded:p[1]]:p),assignments:null,phase:"ready",updates:0};
}
export const kmeansNumber=(v:number|null)=>v===null?"Not assigned":Number(v.toFixed(6)).toLocaleString("en-US",{useGrouping:false,maximumFractionDigits:6});
export function kmeansChart(s:KMeansState,width:number) {
 const left=42,top=22,span=Math.max(180,width-78),height=span+70;
 const map=(p:Coordinate)=>({x:left+span*p[0]/100,y:top+span*(1-p[1]/100)});
 const points=s.points.map((p,i)=>({id:`P${i+1}`,...map(p),cluster:s.assignments?.[i]??null}));
 const centroids=s.centroids.map((p,i)=>({id:`C${i+1}`,...map(p)}));
 const occupied:{x:number;y:number}[]=[];
 const labels=[...points,...centroids].map(p=>{
  const x=Math.min(left+span-14,Math.max(left+14,p.x));
  const candidates=Array.from({length:Math.floor((span-16)/20)+1},(_,i)=>top+12+i*20).sort((a,b)=>Math.abs(a-(p.y-13))-Math.abs(b-(p.y-13)));
  const y=candidates.find(y=>occupied.every(r=>Math.abs(r.x-x)>=32||Math.abs(r.y-y)>=20))??top+12;
  occupied.push({x,y});return {labelX:x,labelY:y};
 });
 return {width,height,left,top,span,ticks:[0,25,50,75,100].map(value=>({value,...map([value,value])})),points:points.map((p,i)=>({...p,...labels[i]!})),centroids:centroids.map((p,i)=>({...p,...labels[i+points.length]!}))};
}
