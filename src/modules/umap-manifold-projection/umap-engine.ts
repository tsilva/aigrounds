export type UmapPoint = readonly [number, number, number];
export type MapPoint = readonly [number, number];
export type UmapState = { scenario: "groups" | "bridge" | "scaled"; neighbors: number; minDist: number; iterations: number };
const groups: readonly UmapPoint[] = [[-3,-2,0],[-2.2,-3.1,.7],[-3.4,-3.6,1.9],[-1.5,-1.8,3.1],[2,2,0],[3.3,2.4,.8],[1.7,3.5,1.8],[3.1,3.2,3.3]];
export const umapPoints: Record<UmapState["scenario"], readonly UmapPoint[]> = {
  groups,
  bridge: groups.map((p,i) => i===3 ? [-.6,.1,1.4] : i===4 ? [.6,-.2,1.6] : p),
  scaled: groups.map(p => p.map(v => v*5) as [number,number,number]),
};
export const umapScenarios = [
  { id: "groups", label: "Two groups", shortLabel: "Eight fixed 3D points" },
  { id: "bridge", label: "Bridge", shortLabel: "Two points span the gap" },
  { id: "scaled", label: "Scaled source", shortLabel: "All features ×5" },
] as const;
export const umapInitial: readonly MapPoint[] = [[-.8,-.2],[.1,.7],[.6,-.5],[-.4,.6],[.8,.2],[-.1,-.7],[-.6,.5],[.4,-.6]];
// Official curve-fit convention: 300 points on [0,3], spread=1, SciPy nonlinear least squares.
export const umapCurves: Readonly<Record<string, { a: number; b: number }>> = {
  "0": { a: 1.932808397545408, b: .7904949735905139 },
  "0.2": { a: 1.2620581225407888, b: 1.0030054002697062 },
  "0.4": { a: .7668736388112121, b: 1.2225638158004497 },
  "0.6": { a: .43607109467748795, b: 1.4474621183361343 },
  "0.8": { a: .23206272686049875, b: 1.681231603408827 },
};
export function umapGraph(points: readonly UmapPoint[], neighbors: number) {
  const n = points.length;
  if (!Number.isInteger(neighbors) || neighbors < 3 || neighbors >= n) throw Error("Unsupported neighborhood");
  const distances = points.map(a => points.map(b => Math.hypot(...a.map((v,k) => v-b[k]))));
  const rows = distances.map((d,i) => {
    const ids = d.map((_,j) => j).filter(j => j!==i).sort((a,b) => d[a]-d[b] || a-b).slice(0,neighbors);
    const rho = d[ids.find(j => d[j]>0)!], target = Math.log2(neighbors);
    if (!Number.isFinite(rho) || ids.filter(j => d[j]<=rho).length >= target) throw Error("Unattainable local membership target");
    let sigma = 1, lo = 0, hi: number | null = null, weights: number[] = [];
    for (let step=0;step<100;step++) {
      weights=ids.map(j => Math.exp(-Math.max(0,d[j]-rho)/sigma));
      const sum=weights.reduce((s,v)=>s+v,0);
      if (Math.abs(sum-target)<1e-10) break;
      if (sum>target) { hi=sigma; sigma=(lo+hi)/2; }
      else { lo=sigma; sigma=hi===null ? sigma*2 : (lo+hi)/2; }
    }
    return { ids, rho, sigma, sum: weights.reduce((s,v)=>s+v,0), weights };
  });
  const directed = rows.map(r => points.map((_,j) => { const k=r.ids.indexOf(j); return k<0 ? 0 : r.weights[k]; }));
  const union = directed.map((row,i) => row.map((u,j) => u+directed[j][i]-u*directed[j][i]));
  const visited = new Set<number>(); let components=0, edges=0;
  for (let i=0;i<n;i++) {
    for(let j=i+1;j<n;j++) if(union[i][j]>0) edges++;
    if(visited.has(i)) continue;
    components++; const queue=[i]; visited.add(i);
    while(queue.length) { const v=queue.pop()!; for(let j=0;j<n;j++) if(union[v][j]>0&&!visited.has(j)) { visited.add(j); queue.push(j); } }
  }
  return { distances, rows, directed, union, components, edges };
}
export type UmapGraph = ReturnType<typeof umapGraph>;
export function umapEvidence(positions: readonly MapPoint[], graph: UmapGraph, curve: { a:number;b:number }) {
  const n=positions.length, {a,b}=curve, q=positions.map(()=>Array<number>(n).fill(0)), gradient=positions.map(()=>[0,0]);
  let loss=0, weighted=0, total=0, minimumDistance=Infinity;
  for(let i=0;i<n;i++) for(let j=i+1;j<n;j++) {
    const dx=positions[i][0]-positions[j][0],dy=positions[i][1]-positions[j][1],r2=dx*dx+dy*dy,s=r2+1e-12,t=a*Math.pow(s,b),v=1/(1+t),w=graph.union[i][j];
    q[i][j]=q[j][i]=v;
    loss+=(w>0?w*Math.log(w):0)+(w<1?(1-w)*Math.log1p(-w):0)+w*Math.log1p(t)+(1-w)*(Math.log1p(t)-Math.log(t));
    const c=2*b*(w-v)/s;
    gradient[i][0]+=c*dx;gradient[i][1]+=c*dy;gradient[j][0]-=c*dx;gradient[j][1]-=c*dy;
    const distance=Math.sqrt(r2);weighted+=w*distance;total+=w;minimumDistance=Math.min(minimumDistance,distance);
  }
  return { q, loss:Math.max(0,loss), weightedDistance:weighted/total, minimumDistance, gradient };
}
export function umapTrajectory(scenario: UmapState["scenario"], neighbors: number, minDist: number) {
  if (!Object.hasOwn(umapPoints,scenario) || !Number.isInteger(neighbors) || neighbors<3 || neighbors>6 || !Object.hasOwn(umapCurves,String(minDist))) throw Error("Unsupported run");
  const graph=umapGraph(umapPoints[scenario],neighbors),curve=umapCurves[String(minDist)];let positions:readonly MapPoint[]=umapInitial;
  const frames: { iterations:number;positions:readonly MapPoint[];loss:number;weightedDistance:number;minimumDistance:number;q:number[][] }[]=[];
  for(let iterations=0;iterations<=200;iterations++) {
    const evidence=umapEvidence(positions,graph,curve);const {gradient,...metrics}=evidence;frames.push({iterations,positions,...metrics});
    if(iterations===200) break;
    let rate=1;
    for(let trial=0;trial<24;trial++) {
      const candidate=positions.map((p,i)=>[p[0]-rate*gradient[i][0],p[1]-rate*gradient[i][1]] as const),mean=[0,1].map(k=>candidate.reduce((s,p)=>s+p[k],0)/candidate.length);
      const centered=candidate.map(p=>[p[0]-mean[0],p[1]-mean[1]] as const);
      if(umapEvidence(centered,graph,curve).loss<=evidence.loss) { positions=centered;break; }
      rate/=2;
    }
  }
  return {graph,curve,frames};
}
export function umapFrame(run: ReturnType<typeof umapTrajectory>, iterations: number) {
  if(!Number.isInteger(iterations)||iterations<0||iterations>200||iterations%50!==0) throw Error("Unsupported checkpoint");
  return run.frames[iterations];
}
export const umapNumber=(v:number)=>Math.abs(v)<.0000005 ? "0.000000" : v.toFixed(6);
export function umapChart(positions: readonly MapPoint[],selected:number,width:number) {
  const span=Math.min(width-80,360),left=(width-span)/2+8,top=24,bottom=top+span,extent=Math.max(1,...positions.flat().map(Math.abs))*1.15;
  const coord=(x:number,y:number)=>({x:left+span*(x+extent)/(2*extent),y:bottom-span*(y+extent)/(2*extent)});
  const points=positions.map((p,i)=>({id:`P${i+1}`,...coord(...p)}));
  return {width,height:span+82,span,left,top,bottom,extent,points,origin:coord(0,0),ticks:[-extent,0,extent].map(value=>({value,...coord(value,value)})),selected:{...points[selected],labelX:positions[selected][0]>extent*.6 ? -12 : 12,labelY:positions[selected][1]>extent*.6 ? 22 : -12,anchor:positions[selected][0]>extent*.6 ? "end" as const : "start" as const}};
}
