// Edit one whole percentage exactly; distribute the remainder proportionally with a 1% floor.
export function allocatePercentages(values:number[],changedIndex:number,nextValue:number):number[] {
  if (!Number.isFinite(nextValue)||changedIndex<0||changedIndex>=values.length||values.length<2||values.length>100) return [...values];
  const changed=Math.min(101-values.length,Math.max(1,Math.round(nextValue)));
  if (values[changedIndex]===changed) return [...values];
  const allocated=values.map(()=>0);allocated[changedIndex]=changed;
  let active=values.map((_,i)=>i).filter(i=>i!==changedIndex),remaining=100-changed;
  let shares:{id:number;share:number;order:number}[]=[];
  while(active.length){
    const weight=active.reduce((sum,i)=>sum+Math.max(0,Math.round(values[i])),0);
    shares=active.map((i,order)=>({id:i,order,share:weight>0?remaining*Math.max(0,Math.round(values[i]))/weight:remaining/active.length}));
    const below=shares.filter(s=>s.share<1-1e-12);
    if(!below.length) break;
    for(const s of below){allocated[s.id]=1;remaining--;}
    active=active.filter(i=>!below.some(s=>s.id===i));
  }
  for(const s of shares) allocated[s.id]=Math.floor(s.share+1e-12);
  const left=remaining-shares.reduce((sum,s)=>sum+allocated[s.id],0);
  const order=[...shares].sort((a,b)=>{const difference=(b.share-Math.floor(b.share+1e-12))-(a.share-Math.floor(a.share+1e-12));return Math.abs(difference)<1e-10?a.order-b.order:difference;});
  for(let i=0;i<left;i++) allocated[order[i].id]++;
  return allocated;
}
