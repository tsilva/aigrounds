import { kmeansBaseline, type KMeansState } from "./kmeans-engine";
const near=(a:number,b:number)=>Math.abs(a-b)<1e-9;
export function reachedKMeans(index:number,s:KMeansState) {
 const baseline=kmeansBaseline(index===2?"coincident":"separated");
 if(index===3)baseline.points[2]=[50,50];
 if(!s.points.every((p,i)=>p.every((v,j)=>near(v,baseline.points[i]![j]!))))return false;
 const centers=index===0?[[10,20],[90,80]]:index===1?[[80/3,30],[80,70]]:index===2?[[160/3,50],[50,50]]:[[30,110/3],[80,70]];
 return s.phase===(index===0?"assigned":"updated")&&s.updates===(index===0?0:1)&&s.centroids.every((p,i)=>p.every((v,j)=>near(v,centers[i]![j]!)))&&s.assignments?.every((c,i)=>c===(index===2?0:i<3?0:1));
}
