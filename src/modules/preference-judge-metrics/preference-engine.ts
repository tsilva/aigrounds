export type PreferenceState = { rubric: string; judge: string; display: string; sequence: string };
export const rubricChoices = [
  {id:"accuracy",label:"Accuracy first · 3 accuracy + 1 style"},
  {id:"balanced",label:"Balanced · 1 accuracy + 1 style"},
  {id:"style",label:"Style first · 1 accuracy + 3 style"},
];
export const judgeChoices = [{id:"rubric",label:"Rubric only"},{id:"position",label:"First-position bonus +4"},{id:"length",label:"Longer-answer bonus +2"}];
export const displayChoices = [{id:"A-first",label:"A first"},{id:"B-first",label:"B first"}];
export const sequenceChoices = [{id:"forward",label:"P1 → P6"},{id:"reverse",label:"P6 → P1"}];
export const preferenceScenarios = [{id:"accuracy",label:"Accuracy first",shortLabel:"Rubric only"},{id:"position",label:"Position bias",shortLabel:"First answer +4"},{id:"length",label:"Length bias",shortLabel:"Longer answer +2"}];
export const preferenceItems = [
  {
    "id": "P1",
    "prompt": "What is 2 + 2?",
    "answerA": "4.",
    "answerB": "5, definitely.",
    "featuresA": [
      2,
      1
    ],
    "featuresB": [
      0,
      2
    ]
  },
  {
    "id": "P2",
    "prompt": "Which country contains Berlin?",
    "answerA": "Berlin is in Germany.",
    "answerB": "Berlin is in Germany. Germany is the country that contains Berlin.",
    "featuresA": [
      2,
      2
    ],
    "featuresB": [
      2,
      1
    ]
  },
  {
    "id": "P3",
    "prompt": "Name both listed colors: red and blue.",
    "answerA": "Red and blue are the two listed colors.",
    "answerB": "Red.",
    "featuresA": [
      2,
      1
    ],
    "featuresB": [
      1,
      2
    ]
  },
  {
    "id": "P4",
    "prompt": "Explain overfitting in one sentence.",
    "answerA": "Fitting training quirks can hurt unseen performance.",
    "answerB": "Overfitting guarantees perfect performance on new data.",
    "featuresA": [
      2,
      1
    ],
    "featuresB": [
      0,
      2
    ]
  },
  {
    "id": "P5",
    "prompt": "What is 3 times 3?",
    "answerA": "9.",
    "answerB": "9.",
    "featuresA": [
      2,
      2
    ],
    "featuresB": [
      2,
      2
    ]
  },
  {
    "id": "P6",
    "prompt": "Briefly explain a cache.",
    "answerA": "Reuse a stored result for the same request.",
    "answerB": "Cache means storing a reusable result; it is a reusable stored result, used again as a result.",
    "featuresA": [
      2,
      2
    ],
    "featuresB": [
      2,
      1
    ]
  }
];
const weights: Record<string, readonly number[]> = {accuracy:[3,1],balanced:[1,1],style:[1,3]};
export function preferenceBaseline(id="accuracy"): PreferenceState {
  return {rubric:"accuracy",judge:id==="accuracy"?"rubric":id,display:"A-first",sequence:"forward"};
}
export function samePreference(a:PreferenceState,b:PreferenceState) {
  return a.rubric===b.rubric&&a.judge===b.judge&&a.display===b.display&&a.sequence===b.sequence;
}
export function preferencePresetId(s:PreferenceState) {
  return preferenceScenarios.find(p=>samePreference(s,preferenceBaseline(p.id)))?.id??"custom";
}
function verdict(a:number,b:number) { return a>b?"A":b>a?"B":"Tie"; }
export function analyzePreference(s:PreferenceState) {
  const w=weights[s.rubric]!;
  const rows=preferenceItems.map(item=>{
    const baseA=item.featuresA[0]!*w[0]!+item.featuresA[1]!*w[1]!;
    const baseB=item.featuresB[0]!*w[0]!+item.featuresB[1]!*w[1]!;
    const wordsA=item.answerA.split(/\s+/).length,wordsB=item.answerB.split(/\s+/).length;
    const bonusA=s.judge==="position"&&s.display==="A-first"?4:s.judge==="length"&&wordsA>wordsB?2:0;
    const bonusB=s.judge==="position"&&s.display==="B-first"?4:s.judge==="length"&&wordsB>wordsA?2:0;
    const reference=verdict(3*item.featuresA[0]!+item.featuresA[1]!,3*item.featuresB[0]!+item.featuresB[1]!);
    const scoreA=baseA+bonusA,scoreB=baseB+bonusB,v=verdict(scoreA,scoreB);
    return {...item,wordsA,wordsB,baseA,baseB,bonusA,bonusB,scoreA,scoreB,verdict:v,reference,agrees:v===reference};
  });
  function rate(reverse:boolean) {
    let ra=1000,rb=1000;
    const history=(reverse?[...rows].reverse():rows).map(row=>{
      const beforeA=ra,beforeB=rb,expected=1/(1+10**((rb-ra)/400));
      const outcome=row.verdict==="A"?1:row.verdict==="B"?0:0.5,delta=32*(outcome-expected);
      ra+=delta;rb-=delta;
      return {id:row.id,beforeA,beforeB,expected,outcome,delta,afterA:ra,afterB:rb};
    });
    return {finalA:ra,finalB:rb,history};
  }
  const winsA=rows.filter(r=>r.verdict==="A").length,winsB=rows.filter(r=>r.verdict==="B").length,ties=6-winsA-winsB;
  const agrees=rows.filter(r=>r.agrees).length,forward=rate(false),reverse=rate(true);
  return {rows,winsA,winsB,ties,rawA:winsA/6,adjustedA:(winsA+0.5*ties)/6,adjustedB:(winsB+0.5*ties)/6,agrees,agreement:agrees/6,forward,reverse,current:s.sequence==="reverse"?reverse:forward};
}
export const preferenceNumber=(n:number)=>Number(n.toFixed(6)).toLocaleString("en-US",{useGrouping:false,maximumFractionDigits:6});
