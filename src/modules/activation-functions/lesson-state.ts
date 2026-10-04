import { sameActivation, type ActivationState } from "./activation-engine";
const targets:ActivationState[]=[{inputUnits:-20,activation:"relu"},{inputUnits:0,activation:"sigmoid"},{inputUnits:60,activation:"relu"},{inputUnits:-40,activation:"tanh"}];
export function reachedActivation(index:number,s:ActivationState) { return !!targets[index]&&sameActivation(s,targets[index]!); }
