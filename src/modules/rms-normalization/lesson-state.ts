import { rmsBaseline, sameRms, type RmsState } from "./rms-engine";
export const rmsTargets: RmsState[] = [{...rmsBaseline(),values:[3,4,5]}, {...rmsBaseline(),values:[2,4,6],epsilon:0}, {...rmsBaseline(),gain:2,epsilon:1}, {...rmsBaseline("centered"),gain:0.5,epsilon:1}];
export function reachedRms(index: number,s: RmsState) { return !!rmsTargets[index] && sameRms(s,rmsTargets[index]!); }
