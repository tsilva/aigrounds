import type {SeState} from "./se-engine";
export function seBaseline(index=0):SeState{return{model:index===3?"levels":"bounded",size:index===0?1:index===1?20:80,sample:1};}
export function reachedSe(index:number,s:SeState){
  if(index===0)return s.model==="bounded"&&s.size===20&&s.sample===1;
  if(index===1)return s.model==="bounded"&&s.size===80&&s.sample===1;
  if(index===2)return s.model==="levels"&&s.size===80&&s.sample===1;
  if(index===3)return s.model==="levels"&&s.size===80&&s.sample===2;
  return s.model==="levels"&&s.size===320&&s.sample===46;
}
