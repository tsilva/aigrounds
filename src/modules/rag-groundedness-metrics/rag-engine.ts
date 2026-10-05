export type RagState={context:string;answer:string;citations:string};
export const contextChoices=[{id:"full",label:"Full · D1 + D2"},{id:"partial",label:"Partial · D1 only"},{id:"noisy",label:"Noisy · D1 + D2 + D3"},{id:"outdated",label:"Outdated · D4 + D2"},{id:"none",label:"No retrieved documents"}];
export const answerChoices=[{id:"complete",label:"Complete · Current three facts"},{id:"short",label:"Faithful fragment · Tuesday only"},{id:"hallucinated",label:"Unsupported fee · Tuesday, 10:00, free"},{id:"off-topic",label:"Off-topic · Garden benches"},{id:"stale",label:"Stale · Monday, 09:00, 4 credits"},{id:"empty",label:"Empty · No claims"}];
export const citationChoices=[{id:"matched",label:"Matched authored sources"},{id:"misplaced",label:"Misplaced · Cite D3 for every claim"},{id:"mixed",label:"Mixed · Matched first two, then D3"},{id:"none",label:"No citations"}];
export const ragScenarios=[{id:"full",label:"Fully supported",shortLabel:"All three facts"},{id:"fragment",label:"Faithful fragment",shortLabel:"One required fact"},{id:"stale",label:"Stale sources",shortLabel:"Outdated schedule"}];
export const ragFacts:Record<string,string>={
  "day": "The Harbor Museum opens on Tuesday.",
  "time": "The Harbor Museum opens at 10:00.",
  "fee": "Admission costs 4 fictional credits.",
  "free": "Admission is free.",
  "oldDay": "The Harbor Museum opens on Monday.",
  "oldTime": "The Harbor Museum opens at 09:00.",
  "benches": "The garden has blue benches."
};
export const ragDocuments=[
  {
    "id": "D1",
    "text": "Current schedule: the Harbor Museum opens Tuesday at 10:00.",
    "facts": [
      "day",
      "time"
    ],
    "relevant": true
  },
  {
    "id": "D2",
    "text": "Current admission: the Harbor Museum charges 4 fictional credits.",
    "facts": [
      "fee"
    ],
    "relevant": true
  },
  {
    "id": "D3",
    "text": "Garden note: the garden has blue benches.",
    "facts": [
      "benches"
    ],
    "relevant": false
  },
  {
    "id": "D4",
    "text": "Outdated schedule: the Harbor Museum opens Monday at 09:00.",
    "facts": [
      "oldDay",
      "oldTime"
    ],
    "relevant": true
  }
];
const contexts:Record<string,readonly string[]>={"full": ["D1", "D2"], "partial": ["D1"], "noisy": ["D1", "D2", "D3"], "outdated": ["D4", "D2"], "none": []};
const answers:Record<string,readonly string[]>={"complete": ["day", "time", "fee"], "short": ["day"], "hallucinated": ["day", "time", "free"], "off-topic": ["benches"], "stale": ["oldDay", "oldTime", "fee"], "empty": []};
const matched:Record<string,string>={"day": "D1", "time": "D1", "fee": "D2", "free": "D2", "oldDay": "D4", "oldTime": "D4", "benches": "D3"};
const required=["day","time","fee"];
export function ragBaseline(id="full"):RagState{return{context:id==="stale"?"outdated":"full",answer:id==="stale"?"stale":id==="fragment"?"short":"complete",citations:"matched"};}
export function sameRag(a:RagState,b:RagState){return a.context===b.context&&a.answer===b.answer&&a.citations===b.citations;}
export function ragPresetId(s:RagState){return ragScenarios.find(p=>sameRag(s,ragBaseline(p.id)))?.id??"custom";}
const ratio=(a:number,b:number)=>b?a/b:null;
export function analyzeRag(s:RagState){
 const retrieved=contexts[s.context]!,claimed=answers[s.answer]!;
 const documents=ragDocuments.map(d=>({...d,retrieved:retrieved.includes(d.id)}));
 const claims=claimed.map((id,i)=>{
  const supportDocs=documents.filter(d=>d.retrieved&&d.facts.includes(id)).map(d=>d.id);
  const citation=s.citations==="none"?null:s.citations==="misplaced"||s.citations==="mixed"&&i>=2?"D3":matched[id]!;
  const citedDocument=documents.find(d=>d.id===citation),citationRetrieved=!!citedDocument?.retrieved,citationEntails=!!citedDocument?.facts.includes(id);
  return{id,text:ragFacts[id]!,supportDocs,faithful:supportDocs.length>0,citation,citationRetrieved,citationEntails,citationSupported:citationRetrieved&&citationEntails,required:required.includes(id)};
 });
 const retrievedCount=retrieved.length,relevantCount=documents.filter(d=>d.retrieved&&d.relevant).length,claimCount=claims.length,supportedCount=claims.filter(c=>c.faithful).length,citedCount=claims.filter(c=>c.citation!==null).length,citationSupportedCount=claims.filter(c=>c.citationSupported).length;
 const requiredRows=required.map(id=>({id,text:ragFacts[id]!,covered:claimed.includes(id)})),coveredCount=requiredRows.filter(r=>r.covered).length;
 return{documents,claims,required:requiredRows,retrievedCount,relevantCount,claimCount,supportedCount,citedCount,citationSupportedCount,coveredCount,contextRelevance:ratio(relevantCount,retrievedCount),faithfulness:ratio(supportedCount,claimCount),citationCoverage:ratio(citationSupportedCount,claimCount),citationPrecision:ratio(citationSupportedCount,citedCount),completeness:coveredCount/3};
}
export const ragNumber=(n:number|null)=>n===null?"Undefined":Number(n.toFixed(6)).toLocaleString("en-US",{useGrouping:false,maximumFractionDigits:6});
