import type { BiasState } from "./bias-engine";
export function biasBaseline(index=0):BiasState{return{scenario:index===2?"response":index===3?"survival":"frame",rule:index===1||index===4?"biased":"ideal",size:index===1?4:index===0?40:400,sample:1};}
export function reachedBias(index:number,s:BiasState){
  if(index===0)return s.scenario==="frame"&&s.rule==="biased"&&s.size===40&&s.sample===1;
  if(index===1)return s.scenario==="frame"&&s.rule==="biased"&&s.size===400&&s.sample===1;
  if(index===2)return s.scenario==="response"&&s.rule==="biased"&&s.size===400&&s.sample===1;
  if(index===3)return s.scenario==="survival"&&s.rule==="biased"&&s.size===400&&s.sample===1;
  if(index===4)return s.scenario==="frame"&&s.rule==="ideal"&&s.size===400&&s.sample===1;
  return s.scenario==="response"&&s.rule==="biased"&&s.size===1000&&s.sample===7;
}
