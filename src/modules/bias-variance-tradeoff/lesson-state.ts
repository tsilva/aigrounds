import type { BiasState } from "./bias-variance-engine";
export function biasBaseline(index=0):BiasState{return{scenario:"low",degree:index===0?0:index===1?2:4,draw:index===2?22:11,probe:0.5};}
export function reachedBias(index:number,s:BiasState){if(index===0)return s.scenario==="low"&&s.degree===2&&s.draw===11&&s.probe===0.5;if(index===1)return s.scenario==="low"&&s.degree===4&&s.draw===22&&s.probe===0.5;if(index===2)return s.scenario==="zero"&&s.degree===4&&s.draw===22&&s.probe===0.5;return s.scenario==="high"&&s.degree===2&&s.draw===11&&s.probe===1.5;}
