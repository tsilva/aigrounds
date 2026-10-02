import {allocatePercentages} from "@/lib/probability-allocation";
import {type KlCategory} from "./scenario";
export type KlDirection="p-to-q"|"q-to-p";
export type KlContribution={category:KlCategory;sourceValue:number;targetValue:number;referenceValue:number;approximationValue:number;ratio:number|null;contribution:number};
export type KlAnalysis={direction:KlDirection;sourceLabel:"P"|"Q";targetLabel:"P"|"Q";score:number;reverseScore:number;contributions:KlContribution[];formulaTerms:string[]};
export function analyzeKlDivergence(categories:KlCategory[],reference:number[],approximation:number[],direction:KlDirection):KlAnalysis {
  for(const values of [reference,approximation]) if(!categories.length||values.length!==categories.length||values.some(v=>!Number.isFinite(v)||v<0||v>1)||Math.abs(distributionTotal(values)-1)>1e-10) throw new Error("KL requires normalized distributions on the same categories.");
  const build=(d:KlDirection)=>categories.map((category,i)=>{
    const referenceValue=reference[i],approximationValue=approximation[i],sourceValue=d==="p-to-q"?referenceValue:approximationValue,targetValue=d==="p-to-q"?approximationValue:referenceValue;
    const ratio=sourceValue===0&&targetValue===0?null:sourceValue/targetValue;
    return {category,referenceValue,approximationValue,sourceValue,targetValue,ratio,contribution:sourceValue===0?0:targetValue===0?Infinity:sourceValue*Math.log(sourceValue/targetValue)};
  });
  const contributions=build(direction),opposite=build(direction==="p-to-q"?"q-to-p":"p-to-q");
  // Only remove negative roundoff at equality; probabilities and terms are never clipped.
  const sum=(rows:KlContribution[])=>{const total=rows.reduce((s,r)=>s+r.contribution,0);return total<0&&total>-1e-12?0:total;};
  return {direction,sourceLabel:direction==="p-to-q"?"P":"Q",targetLabel:direction==="p-to-q"?"Q":"P",score:sum(contributions),reverseScore:sum(opposite),contributions,formulaTerms:contributions.map(r=>`${r.sourceValue} ln(${r.sourceValue}/${r.targetValue})`)};
}
export function adjustApproximation(values:number[],index:number,next:number){if(!Number.isFinite(next)) return [...values];return allocatePercentages(values.map(v=>Math.round(v*100)),index,next*100).map(v=>v/100);}
export function distributionTotal(values:number[]){return values.reduce((s,v)=>s+v,0);}
export function formatProbability(v:number){return v.toFixed(2);}
export function formatRatio(v:number|null){return v===null?"undefined":v===Infinity?"∞":v.toFixed(4);}
export function formatKl(v:number){return v===Infinity?"∞":v===0?"0":Math.abs(v)<.00005?v.toExponential(2):v.toFixed(4);}
