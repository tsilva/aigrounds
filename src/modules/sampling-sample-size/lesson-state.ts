import type { SamplingState } from "./sampling-engine";
export function samplingBaseline(index=0):SamplingState{return{model:index===4?"rare":"bounded",size:index===2||index===4?20:4,sample:index===3?3:1,revealed:index!==0};}
export function reachedSampling(index:number,s:SamplingState){
  if(!s.revealed)return false;
  if(index===0)return s.model==="bounded"&&s.size===4&&s.sample===1;
  if(index===1)return s.model==="bounded"&&s.size===400&&s.sample===1;
  if(index===2)return s.model==="bounded"&&s.size===20&&s.sample===2;
  if(index===3)return s.model==="bounded"&&s.size===40&&s.sample===3;
  if(index===4)return s.model==="rare"&&s.size===400&&s.sample===1;
  return s.model==="levels"&&s.size===400&&s.sample===7;
}
