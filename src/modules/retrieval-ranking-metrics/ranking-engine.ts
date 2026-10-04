export type RankingScenario="binary"|"graded"|"empty";
export type RankingState={scenario:RankingScenario;orders:[readonly string[],readonly string[]];k:number};
export const rankingIds=["A","B","C","D","E","F"] as const;
export const rankingGrades:Record<RankingScenario,readonly [readonly number[],readonly number[]]>={binary:[[1,0,1,0,1,0],[0,1,0,1,0,0]],graded:[[1,0,3,0,2,0],[0,2,0,1,0,0]],empty:[[1,0,3,0,2,0],[0,0,0,0,0,0]]};
export const rankingScenarios=[{id:"binary",label:"Binary relevance",shortLabel:"Two judged queries"},{id:"graded",label:"Graded relevance",shortLabel:"Grades zero to three"},{id:"empty",label:"No relevant Q2",shortLabel:"Explicit empty denominator"}] as const;
export const rankingNumber=(v:number|null)=>v===null?"Undefined":Math.abs(v)<.0000005?"0.000000":v.toFixed(6);
const validOrder=(order:readonly string[])=>order.length===6&&[...order].sort().join("")==="ABCDEF";
export function moveRankingItem(order:readonly string[],id:string,rank:number){if(!validOrder(order)||!order.includes(id)||!Number.isInteger(rank)||rank<1||rank>6)throw Error("Unsupported rank move");const next=order.filter(item=>item!==id);next.splice(rank-1,0,id);return next;}
export function queryRanking(grades:readonly number[],order:readonly string[],k:number){if(grades.length!==6||grades.some(g=>!Number.isInteger(g)||g<0||g>3)||!validOrder(order)||!Number.isInteger(k)||k<1||k>6)throw Error("Unsupported ranking query");
  const rows=order.map((id,i)=>{const grade=grades[rankingIds.indexOf(id as typeof rankingIds[number])],gain=2**grade-1,discount=1/Math.log2(i+2);return{id,rank:i+1,grade,gain,discount,relevant:grade>0,returned:i<k,contribution:i<k?gain*discount:0};});
  const total=grades.filter(g=>g>0).length,found=rows.filter(r=>r.returned&&r.relevant).length,first=rows.find(r=>r.relevant)?.rank??null,rr=first===null?0:1/first;
  const dcg=rows.reduce((s,r)=>s+r.contribution,0),ideal=[...grades].sort((a,b)=>b-a),idcg=ideal.slice(0,k).reduce((sum,g,i)=>sum+(2**g-1)/Math.log2(i+2),0);
  return{rows,total,found,first,rr,precision:found/k,recall:total===0?null:found/total,dcg,idcg,ndcg:idcg===0?null:dcg/idcg};
}
export function analyzeRanking(state:RankingState){if(!Object.hasOwn(rankingGrades,state.scenario)||state.orders.length!==2)throw Error("Unsupported ranking state");const queries=rankingGrades[state.scenario].map((grades,q)=>queryRanking(grades,state.orders[q],state.k));return{queries,mrr:(queries[0].rr+queries[1].rr)/2};}
export function rankingChart(result:ReturnType<typeof queryRanking>,width:number){const left=52,span=Math.max(80,width-100),top=26;return{width,height:244,left,span,rows:result.rows.map((r,i)=>({...r,x:left,y:top+i*30,width:span*r.contribution/7})),ticks:[0,3.5,7].map(value=>({value,x:left+span*value/7}))};}
