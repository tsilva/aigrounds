import { sameReference, type ReferenceState } from "./reference-engine";
export const referenceTargets:ReferenceState[]=[{reference:"cat",candidate:"surface",normalization:"normalized",order:2},{reference:"cat",candidate:"reordered",normalization:"normalized",order:2},{reference:"cat",candidate:"negated",normalization:"normalized",order:2},{reference:"paraphrase",candidate:"exact",normalization:"normalized",order:1}];
export function reachedReference(i:number,s:ReferenceState){return!!referenceTargets[i]&&sameReference(s,referenceTargets[i]!);}
