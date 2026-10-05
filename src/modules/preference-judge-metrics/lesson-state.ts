import { samePreference,type PreferenceState } from "./preference-engine";
export const preferenceTargets: PreferenceState[] = [
 {rubric:"style",judge:"rubric",display:"A-first",sequence:"forward"},
 {rubric:"accuracy",judge:"position",display:"B-first",sequence:"forward"},
 {rubric:"accuracy",judge:"length",display:"A-first",sequence:"forward"},
 {rubric:"accuracy",judge:"rubric",display:"A-first",sequence:"reverse"},
 {rubric:"balanced",judge:"length",display:"B-first",sequence:"reverse"},
];
export function reachedPreference(i:number,s:PreferenceState) {return !!preferenceTargets[i]&&samePreference(s,preferenceTargets[i]!);}
