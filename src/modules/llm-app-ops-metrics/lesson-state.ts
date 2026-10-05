import {sameOps,type OpsState} from "./ops-engine";
export const opsTargets:OpsState[]=[{"pattern": "spread", "tokens": "4", "delivery": "buffer", "cache": "off"}, {"pattern": "spread", "tokens": "8", "delivery": "stream", "cache": "off"}, {"pattern": "burst", "tokens": "4", "delivery": "stream", "cache": "off"}, {"pattern": "repeated", "tokens": "4", "delivery": "stream", "cache": "on"}, {"pattern": "repeated", "tokens": "8", "delivery": "buffer", "cache": "on"}];
export function reachedOps(i:number,s:OpsState){return !!opsTargets[i]&&sameOps(s,opsTargets[i]!);}
