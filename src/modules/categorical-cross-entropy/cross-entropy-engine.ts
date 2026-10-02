import {allocatePercentages} from "@/lib/probability-allocation";
import {type CrossEntropyClass,type CrossEntropyMode} from "./scenario";

export type LossTerm={classItem:CrossEntropyClass;target:0|1;probability:number;eventProbability:number;loss:number};
export type LossAnalysis={loss:number;total:number;terms:LossTerm[];trueClasses:CrossEntropyClass[];isValidDistribution:boolean};

export function analyzeLoss(classes:CrossEntropyClass[],probabilities:Record<string,number>,trueClassIds:string[],mode:CrossEntropyMode):LossAnalysis {
  if (!classes.length) throw new Error("At least one class is required.");
  const targets=new Set(trueClassIds);
  if ([...targets].some(id=>!classes.some(c=>c.id===id))) throw new Error("Targets must name existing classes.");
  if (mode!=="multilabel"&&targets.size!==1) throw new Error("An exclusive outcome needs exactly one true class.");
  if (classes.some(c=>!Number.isFinite(probabilities[c.id])||probabilities[c.id]<0||probabilities[c.id]>1)) throw new Error("Probabilities must be finite and between zero and one.");
  const total=classes.reduce((sum,c)=>sum+probabilities[c.id],0);
  if (mode!=="multilabel"&&Math.abs(total-1)>1e-10) throw new Error("Exclusive probabilities must sum to one.");
  const terms:LossTerm[]=classes.map(classItem=>{
    const probability=probabilities[classItem.id],target:0|1=targets.has(classItem.id)?1:0;
    const eventProbability=mode==="multilabel"&&target===0?1-probability:probability;
    const loss=mode!=="multilabel"&&target===0?0:eventProbability===0?Infinity:-Math.log(eventProbability);
    return {classItem,probability,target,eventProbability,loss:loss===0?0:loss};
  });
  const sum=terms.reduce((s,t)=>s+t.loss,0);
  return {loss:mode==="multilabel"?sum/classes.length:sum,total,terms,trueClasses:classes.filter(c=>targets.has(c.id)),isValidDistribution:true};
}

export function categoricalCrossEntropyLoss(classes:CrossEntropyClass[],probabilities:Record<string,number>,trueClassIds:string[],mode:CrossEntropyMode="categorical") {
  return analyzeLoss(classes,probabilities,trueClassIds,mode).loss;
}

// Whole-percent allocation keeps every displayed control on its step grid and the edited value exact.
export function adjustProbability(classes:CrossEntropyClass[],probabilities:Record<string,number>,changedClassId:string,nextValue:number,mode:CrossEntropyMode="categorical"):Record<string,number> {
  if (!Number.isFinite(nextValue)||!classes.some(c=>c.id===changedClassId)) return {...probabilities};
  const upper=mode==="categorical"?97:99;
  const changed=Math.min(upper,Math.max(1,Math.round(nextValue*100)));
  if (Math.abs(changed/100-probabilities[changedClassId])<1e-12) return {...probabilities};
  if (mode==="multilabel") return {...probabilities,[changedClassId]:changed/100};
  const values=allocatePercentages(classes.map(c=>Math.round(probabilities[c.id]*100)),classes.findIndex(c=>c.id===changedClassId),changed);
  return Object.fromEntries(classes.map((c,i)=>[c.id,values[i]/100]));
}
