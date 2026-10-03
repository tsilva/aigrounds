import type { NormalState } from "./normal-engine";
export function normalBaseline(index=0):NormalState{return{mean:0,sd:1,value:index===1||index===2?1:index===4?2:0,tail:index===1||index===2||index===4?"right":"left"};}
export function reachedNormal(index:number,s:NormalState){
  if(index===0)return s.mean===0&&s.sd===1&&s.value===1&&s.tail==="right";
  if(index===1)return s.mean===2&&s.sd===1&&s.value===3&&s.tail==="right";
  if(index===2)return s.mean===0&&s.sd===2&&s.value===1&&s.tail==="right";
  if(index===3)return s.mean===0&&s.sd===1&&s.value===-2&&s.tail==="left";
  if(index===4)return s.mean===20&&s.sd===2&&s.value===24&&s.tail==="right";
  return s.mean===10&&s.sd===4&&s.value===6&&s.tail==="left";
}
