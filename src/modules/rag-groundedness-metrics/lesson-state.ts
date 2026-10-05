import {sameRag,type RagState} from "./rag-engine";
export const ragTargets:RagState[]=[
 {context:"noisy",answer:"complete",citations:"matched"},
 {context:"full",answer:"short",citations:"matched"},
 {context:"full",answer:"complete",citations:"misplaced"},
 {context:"outdated",answer:"stale",citations:"matched"},
 {context:"partial",answer:"hallucinated",citations:"mixed"},
];
export function reachedRag(i:number,s:RagState){return !!ragTargets[i]&&sameRag(s,ragTargets[i]!);}
