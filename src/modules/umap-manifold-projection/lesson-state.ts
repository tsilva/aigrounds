import type { UmapState } from "./umap-engine";
export const umapBaseline=(index=0):UmapState=>index===2 ? {scenario:"bridge",neighbors:4,minDist:.2,iterations:0} : {scenario:"groups",neighbors:3,minDist:index===1?0:.2,iterations:index===1?200:0};
export function reachedUmap(index:number,state:UmapState) {
  const targets:UmapState[]=[{scenario:"groups",neighbors:6,minDist:.2,iterations:0},{scenario:"groups",neighbors:3,minDist:.8,iterations:200},{scenario:"bridge",neighbors:4,minDist:.2,iterations:200},{scenario:"scaled",neighbors:3,minDist:.2,iterations:200}];
  const t=targets[index];return !!t&&state.scenario===t.scenario&&state.neighbors===t.neighbors&&state.minDist===t.minDist&&state.iterations===t.iterations;
}
