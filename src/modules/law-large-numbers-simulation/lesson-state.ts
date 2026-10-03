import type { LlnModelId } from "./lln-engine";
export type LlnState = { model: LlnModelId; count: number; seed: number };
export function llnBaseline(index = 0): LlnState { return { model:index===4?"die":"fair",count:index===1?2:index===2?1000:20,seed:1309 }; }
export function reachedLln(index: number, s: LlnState) {
  if (index===0) return s.model==="fair"&&s.seed===1309&&s.count===2000;
  if (index===1) return s.model==="fair"&&s.seed===1309&&s.count===3;
  if (index===2) return s.model==="fair"&&s.seed===1907&&s.count===1000;
  if (index===3) return s.model==="biased"&&s.seed===1309&&s.count===2000;
  if (index===4) return s.model==="die"&&s.seed===1309&&s.count===2000;
  return s.model==="fair"&&s.seed===3209&&s.count===1000;
}
