export type ClassificationScenario="rare"|"balanced"|"none";
export type ClassificationState={scenario:ClassificationScenario;mask:number;selected:number};
export type ClassificationBucket="tp"|"fp"|"fn"|"tn";
export const classificationNames={tp:"True positive",fp:"False positive",fn:"False negative",tn:"True negative"};
export const classificationScenarios=[{id:"rare",label:"Rare positives",shortLabel:"2 of 12 actual positive"},{id:"balanced",label:"Balanced",shortLabel:"6 of 12 actual positive"},{id:"none",label:"No positives",shortLabel:"0 of 12 actual positive"}];
const positiveCounts={rare:2,balanced:6,none:0};
function validateMask(mask:number){if(!Number.isInteger(mask)||mask<0||mask>4095)throw new Error("Invalid twelve-case predictions");}
export function classificationPredictionMask(mask:number,id:number,positive:boolean){validateMask(mask);if(!Number.isInteger(id)||id<1||id>12||typeof positive!=="boolean")throw new Error("Invalid case/prediction");return positive?mask|(1<<(id-1)):mask&~(1<<(id-1));}
export function analyzeClassification(s:ClassificationState){
 validateMask(s.mask);if(!Object.hasOwn(positiveCounts,s.scenario)||!Number.isInteger(s.selected)||s.selected<1||s.selected>12)throw new Error("Invalid scenario or selected case");
 const actualPositive=positiveCounts[s.scenario],rows=Array.from({length:12},(_,i)=>{const actual=i<actualPositive,predicted=!!(s.mask&(1<<i)),bucket:ClassificationBucket=actual?(predicted?"tp":"fn"):(predicted?"fp":"tn");return{id:i+1,actual,predicted,bucket};}),counts=rows.reduce((c,r)=>({...c,[r.bucket]:c[r.bucket]+1}),{tp:0,fp:0,fn:0,tn:0}),{tp,fp,fn,tn}=counts,metric=(numerator:number,denominator:number)=>({numerator,denominator,value:denominator?numerator/denominator:null});
 return{...s,rows,counts,selectedRow:rows[s.selected-1],actualPositive,predictedPositive:tp+fp,metrics:{accuracy:metric(tp+tn,12),precision:metric(tp,tp+fp),recall:metric(tp,tp+fn),f1:metric(2*tp,2*tp+fp+fn)}};
}
export type ClassificationAnalysis=ReturnType<typeof analyzeClassification>;
export function classificationPercent(value:number|null){return value===null?"—":`${(value*100).toFixed(1)}%`;}
