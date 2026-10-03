import type { AreaModelId, AreaView } from "./probability-area-engine";
export type AreaState = {model:AreaModelId;lower:number;upper:number;view:AreaView};
export function areaBaseline(index=0): AreaState { return {model:index===4?"triangle":"uniform",lower:index===2||index===4?0:1,upper:index===2?.25:index===4?.5:index===3?3:2,view:"pdf"}; }
export function reachedArea(index: number,s: AreaState) {
  if(index===0)return s.model==="uniform"&&s.lower===1&&s.upper===3;
  if(index===1)return s.model==="uniform"&&s.lower===1&&s.upper===1;
  if(index===2)return s.model==="narrow"&&s.lower===0&&s.upper===.25;
  if(index===3)return s.model==="uniform"&&s.lower===1&&s.upper===3&&s.view==="cdf";
  if(index===4)return s.model==="triangle"&&s.lower===1.5&&s.upper===2;
  return s.model==="narrow"&&s.lower===.1&&s.upper===.4&&s.view==="cdf";
}
