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
  const others=classes.filter(c=>c.id!==changedClassId);
  const allocated:Record<string,number>={[changedClassId]:changed};
  let active=[...others],remaining=100-changed;
  let shares:{id:string;share:number;order:number}[]=[];
  while (active.length){
    const weight=active.reduce((sum,c)=>sum+Math.max(0,Math.round((probabilities[c.id]??0)*100)),0);
    shares=active.map((c,order)=>({id:c.id,order,share:weight>0?remaining*Math.max(0,Math.round((probabilities[c.id]??0)*100))/weight:remaining/active.length}));
    const below=shares.filter(s=>s.share<1-1e-12);
    if (!below.length) break;
    for (const s of below){allocated[s.id]=1;remaining--;}
    active=active.filter(c=>!below.some(s=>s.id===c.id));
  }
  for (const s of shares) allocated[s.id]=Math.floor(s.share+1e-12);
  const left=remaining-shares.reduce((sum,s)=>sum+allocated[s.id],0);
  const order=[...shares].sort((a,b)=>{
    const difference=(b.share-Math.floor(b.share+1e-12))-(a.share-Math.floor(a.share+1e-12));
    return Math.abs(difference)<1e-10?a.order-b.order:difference;
  });
  for (let i=0;i<left;i++) allocated[order[i].id]++;
  return Object.fromEntries(classes.map(c=>[c.id,allocated[c.id]/100]));
}
