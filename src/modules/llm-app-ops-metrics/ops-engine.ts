export type OpsState={pattern:string;tokens:string;delivery:string;cache:string};
export const patternChoices=[{id:"spread",label:"Spaced unique prefixes"},{id:"burst",label:"Burst unique prefixes"},{id:"repeated",label:"Spaced repeated prefix"}];
export const tokenChoices=[{id:"1",label:"1 token"},{id:"4",label:"4 tokens"},{id:"8",label:"8 tokens"}];
export const deliveryChoices=[{id:"stream",label:"Stream tokens"},{id:"buffer",label:"Buffer until complete"}];
export const cacheChoices=[{id:"off",label:"Off"},{id:"on",label:"On · Cold at start"}];
export const opsScenarios=[{id:"spread",label:"Spaced requests",shortLabel:"Cold unique prefixes"},{id:"burst",label:"Burst requests",shortLabel:"Queue builds up"},{id:"repeated",label:"Repeated prefix",shortLabel:"Cache enabled"}];
export function opsBaseline(id="spread"):OpsState{return{pattern:id,tokens:"4",delivery:"stream",cache:id==="repeated"?"on":"off"};}
export function sameOps(a:OpsState,b:OpsState){return a.pattern===b.pattern&&a.tokens===b.tokens&&a.delivery===b.delivery&&a.cache===b.cache;}
export function opsPresetId(s:OpsState){return opsScenarios.find(p=>sameOps(s,opsBaseline(p.id)))?.id??"custom";}
export function analyzeOps(s:OpsState){
 const n=Number(s.tokens),prefixes=s.pattern==="repeated"?["A","A","A","A"]:["A","B","C","D"],arrivals=s.pattern==="burst"?[0,0,0,0]:[0,1000,2000,3000];let available=0;const seen=new Set<string>();
 const rows=arrivals.map((arrival,i)=>{const prefix=prefixes[i]!,hit=s.cache==="on"&&seen.has(prefix),start=Math.max(arrival,available),queue=start-arrival,prefill=hit?100:400,first=start+prefill+50,finish=start+prefill+n*50,clientFirst=s.delivery==="stream"?first:finish,cachedTokens=hit?100:0,uncachedTokens=120-cachedTokens,inputCost=(uncachedTokens*4+cachedTokens)/4000,outputCost=n/500,cost=(uncachedTokens*4+cachedTokens+n*8)/4000;available=finish;seen.add(prefix);return{id:`R${i+1}`,prefix,arrival,start,queue,prefill,first,finish,clientFirst,ttft:first-arrival,clientDelay:clientFirst-arrival,latency:finish-arrival,decode:n*50,gap:n>1?50:null,hit,cachedTokens,uncachedTokens,outputTokens:n,inputCost,outputCost,cost};});
 const span=rows[3]!.finish-rows[0]!.arrival,mean=(k:"latency"|"ttft"|"clientDelay"|"queue"|"prefill")=>rows.reduce((sum,r)=>sum+r[k],0)/4,hits=rows.filter(r=>r.hit).length,totalUnits=rows.reduce((sum,r)=>sum+r.uncachedTokens*4+r.cachedTokens+n*8,0),totalCost=totalUnits/4000;
 return{rows,span,totalTokens:4*n,hits,hitRate:hits/4,meanLatency:mean("latency"),meanTtft:mean("ttft"),meanClientDelay:mean("clientDelay"),meanQueue:mean("queue"),meanPrefill:mean("prefill"),meanCost:totalUnits/16000,totalCost,requestThroughput:4000/span,outputThroughput:4*n*1000/span,gap:n>1?50:null};
}
export const opsNumber=(n:number|null)=>n===null?"Undefined":Number(n.toFixed(6)).toLocaleString("en-US",{useGrouping:false,maximumFractionDigits:6});
export function opsTimeX(time:number,span:number){return 48+time/span*700;}
