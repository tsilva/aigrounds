import { entropyPresets, type EntropyState, type EntropyPair } from "./entropy-engine";
export const entropyBaseline=(index=0):EntropyState=>({masses:index===1?entropyPresets.likely:index===2?entropyPresets.groups:entropyPresets.equal,grouping:"ab-cd"});
export const entropyBaselinePair=(index=0):EntropyPair=>index===1?"AC":"AB";
export function reachedEntropy(index:number,state:EntropyState){const targets:EntropyState[]=[{masses:[50,0,25,25],grouping:"ab-cd"},{masses:[49,1,49,1],grouping:"ab-cd"},{masses:entropyPresets.groups,grouping:"ac-bd"},{masses:[100,0,0,0],grouping:"ab-cd"}];const target=targets[index];return !!target&&state.grouping===target.grouping&&state.masses.every((m,i)=>m===target.masses[i]);}
