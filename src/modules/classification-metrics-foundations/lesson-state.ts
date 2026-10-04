import type { ClassificationState } from "./classification-engine";
export function classificationBaseline(index=0):ClassificationState{return{scenario:"rare",mask:index===1?1:index===2?13:0,selected:1};}
export function reachedClassification(index:number,s:ClassificationState){return s.scenario===(index===3?"balanced":"rare")&&s.mask===[1,13,15,67][index];}
