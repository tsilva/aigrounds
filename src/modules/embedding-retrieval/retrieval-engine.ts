export type RetrievalState={scenario:"directions"|"long"|"boundary";metric:"euclidean"|"cosine";x:number;y:number;k:number};
export const retrievalPoints:Record<RetrievalState["scenario"],readonly (readonly [number,number])[]>={directions:[[3,0],[1,1],[0,3],[-3,0],[0,-3],[-1,-1]],long:[[3,0],[4,4],[0,3],[-3,0],[0,-3],[-1,-1]],boundary:[[3,0],[3,0],[0,3],[-3,0],[0,-3],[0,0]]};
export const retrievalScenarios=[{id:"directions",label:"Directions",shortLabel:"Six fixed item vectors"},{id:"long",label:"Long vector",shortLabel:"B grows along one direction"},{id:"boundary",label:"Duplicate & zero",shortLabel:"Shared coordinates; zero item"}] as const;
export const boundQuery=(v:number)=>Number.isFinite(v)?Math.max(-4,Math.min(4,Math.round(v*2)/2)):0;
export const retrievalNumber=(v:number|null)=>v===null?"Undefined":Math.abs(v)<.0000005?"0.000000":v.toFixed(6);
export function analyzeRetrieval(state:RetrievalState){
  if(!Object.hasOwn(retrievalPoints,state.scenario)||!["euclidean","cosine"].includes(state.metric)||!Number.isInteger(state.k)||state.k<1||state.k>6||![state.x,state.y].every(v=>Number.isFinite(v)&&v>=-4&&v<=4&&Number.isInteger(v*2)))throw Error("Unsupported retrieval state");
  const aa=state.x**2+state.y**2,queryNorm=Math.sqrt(aa);
  const items=retrievalPoints[state.scenario].map(([x,y],i)=>{const bb=x*x+y*y,norm=Math.sqrt(bb),dot=state.x*x+state.y*y,distanceSquared=(state.x-x)**2+(state.y-y)**2;
    const cosine=aa===0||bb===0?null:Math.max(-1,Math.min(1,dot/Math.sqrt(aa*bb)));
    const key=state.metric==="euclidean"?distanceSquared:cosine===null?null:-Number(cosine.toFixed(12));
    return{id:String.fromCharCode(65+i),x,y,norm,dot,distanceSquared,distance:Math.sqrt(distanceSquared),cosine,key};});
  const eligible=items.filter(p=>p.key!==null).sort((a,b)=>a.key!-b.key!||a.id.localeCompare(b.id));
  const excluded=items.filter(p=>p.key===null),order=eligible.map(p=>p.id),returned=order.slice(0,state.k);
  const rows=[...eligible,...excluded].map(p=>({...p,rank:p.key===null?null:order.indexOf(p.id)+1,returned:returned.includes(p.id)}));
  const top=eligible[0]??null;
  return{items,rows,order,returned,excluded:excluded.map(p=>p.id),queryNorm,top,best:top?(state.metric==="euclidean"?top.distance:top.cosine):null};
}
export function retrievalChart(state:RetrievalState,width:number){
  const analysis=analyzeRetrieval(state),span=Math.min(width-80,360),left=(width-span)/2+8,top=24,bottom=top+span;
  const coord=(x:number,y:number)=>({x:left+span*(x+5)/10,y:bottom-span*(y+5)/10});
  const query=coord(state.x,state.y),items=analysis.items.map(p=>({...p,...{plot:coord(p.x,p.y)},returned:analysis.returned.includes(p.id)}));
  const groups:{ids:string[];x:number;y:number;labelX:number;labelY:number;anchor:"start"|"end";query:boolean;returned:boolean;labelMoved:boolean}[]=[];
  for(const p of items){const group=groups.find(g=>g.x===p.plot.x&&g.y===p.plot.y);if(group){group.ids.push(p.id);group.returned||=p.returned;}else groups.push({ids:[p.id],...p.plot,labelX:10,labelY:-10,anchor:"start",query:false,returned:p.returned,labelMoved:false});}
  const shared=groups.find(g=>g.x===query.x&&g.y===query.y);
  if(shared){shared.ids.push("Q");shared.query=true;shared.labelX=shared.x>left+span/2?-24:24;shared.anchor=shared.x>left+span/2?"end":"start";shared.labelY=-18;}
  else{const crowded=groups.some(g=>Math.hypot(g.x-query.x,g.y-query.y)<42);groups.push({ids:["Q"],...query,labelX:crowded?-14:12,labelY:crowded?28:-16,anchor:crowded?"end":"start",query:true,returned:false,labelMoved:crowded});}
  const qGroup=groups.find(g=>g.query)!, labelWidth=qGroup.ids.join("/").length*7.2;
  const occupied=groups.filter(g=>!g.query).map(g=>({x:g.x+g.labelX,y:g.y+g.labelY-16,w:g.ids.join("/").length*7.2,h:16}));
  const candidates:[[number,number],...(readonly [number,number])[]]=[[24,-18],[-24,-18],[24,28],[-24,28],[12,-32],[-12,-32],[12,38],[-12,38],[40,0],[-40,0],[40,32],[-40,32]];
  for(const [dx,dy] of candidates){const anchor=dx<0?"end":"start",x=qGroup.x+dx-(anchor==="end"?labelWidth:0),y=qGroup.y+dy-16;
    const overlap=occupied.some(r=>x<r.x+r.w+4&&x+labelWidth+4>r.x&&y<r.y+r.h+4&&y+16+4>r.y);
    const glyphHit=groups.some(g=>g!==qGroup&&g.x>x-7&&g.x<x+labelWidth+7&&g.y>y-7&&g.y<y+23);
    if(x>=2&&x+labelWidth<=width-2&&y>=2&&y+16<=span+80&&!overlap&&!glyphHit){qGroup.labelX=dx;qGroup.labelY=dy;qGroup.anchor=anchor;qGroup.labelMoved=true;break;}
  }
  return{width,height:span+82,span,left,top,bottom,query,items,groups,origin:coord(0,0),ticks:[-5,0,5].map(value=>({value,...coord(value,value)}))};
}
