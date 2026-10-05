import {sameSafety,type SafetyState} from "./safety-engine";
export const safetyTargets:SafetyState[]=[{"policy": "strict", "variant": "original", "subset": "all"}, {"policy": "balanced", "variant": "wrapper", "subset": "all"}, {"policy": "permissive", "variant": "wrapper", "subset": "unsafe"}, {"policy": "balanced", "variant": "wrapper", "subset": "benign"}, {"policy": "strict", "variant": "reworded", "subset": "benign"}];
export function reachedSafety(i:number,s:SafetyState){return !!safetyTargets[i]&&sameSafety(s,safetyTargets[i]!);}
