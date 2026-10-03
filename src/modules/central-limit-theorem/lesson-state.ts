import type {CltState} from "./clt-engine";
export function cltBaseline(index=0):CltState{return{model:index===1?"bimodal":index===2||index===3?"rare":"skew",size:index===3?20:1,radius:1};}
export function reachedClt(index:number,s:CltState){
  if(index===0)return s.model==="skew"&&s.size===50&&s.radius===1;
  if(index===1)return s.model==="bimodal"&&s.size===50&&s.radius===1;
  if(index===2)return s.model==="rare"&&s.size===20&&s.radius===1;
  if(index===3)return s.model==="rare"&&s.size===400&&s.radius===1;
  return s.model==="bimodal"&&s.size===80&&s.radius===2;
}
