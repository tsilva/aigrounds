import type { GeneralizationState } from "./generalization-engine";
export function generalizationBaseline(index=0):GeneralizationState{return{split:"interleaved",model:index===1?"line":"nearest",source:"train",testVisible:index===2};}
export function reachedGeneralization(index:number,s:GeneralizationState){
  if(index===0)return s.split==="interleaved"&&s.model==="line"&&s.source==="train"&&!s.testVisible;
  if(index===1)return s.split==="interleaved"&&s.model==="line"&&s.source==="train"&&s.testVisible;
  if(index===2)return s.split==="interleaved"&&s.model==="nearest"&&s.source==="all"&&s.testVisible;
  return s.split==="shifted"&&s.model==="line"&&s.source==="train"&&s.testVisible;
}
