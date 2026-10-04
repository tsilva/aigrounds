import type { DiagnosticState } from "./diagnostics-engine";
export function diagnosticsBaseline(index=0):DiagnosticState { return {scenario:index===2?"curve":"even",scale:1,model:"fit",view:index===0?"observed":"residual"}; }
export function reachedDiagnostics(index:number,s:DiagnosticState) {
  if(index===0)return s.scenario==="even"&&s.scale===1&&s.model==="fit"&&s.view==="residual";
  if(index===1)return s.scenario==="curve"&&s.scale===1&&s.model==="fit"&&s.view==="residual";
  if(index===2)return s.scenario==="curve"&&s.scale===1&&s.model==="shift"&&s.view==="residual";
  return s.scenario==="fan"&&s.scale===1.5&&s.model==="fit"&&s.view==="residual";
}
