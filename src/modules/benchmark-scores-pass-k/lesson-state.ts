import { sameBenchmark,type BenchmarkState } from "./benchmark-engine";
export const benchmarkTargets:BenchmarkState[]=[{batch:"A",n:6,k:3,exposure:"include"},{batch:"B",n:6,k:3,exposure:"include"},{batch:"A",n:6,k:6,exposure:"include"},{batch:"A",n:6,k:3,exposure:"exclude"},{batch:"C",n:4,k:2,exposure:"exclude"}];
export function reachedBenchmark(i:number,s:BenchmarkState){return!!benchmarkTargets[i]&&sameBenchmark(s,benchmarkTargets[i]!);}
