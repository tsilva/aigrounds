import type { RocState } from "./roc-engine";
export function rocBaseline(index=0):RocState{return{scenario:"ordered",tick:index===0?17:11};}
export function reachedRoc(index:number,s:RocState){return s.scenario===(index===2?"tied":index===3?"reversed":"ordered")&&s.tick===[11,8,10,9][index];}
