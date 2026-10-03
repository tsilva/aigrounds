export type ProverMode = "honest" | "cheating";
export type ColorName = "red" | "blue" | "green";
export type NodeId = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";
export type GraphNode = { id: NodeId; x: number; y: number };
export type GraphEdge = { id: string; from: NodeId; to: NodeId };
export const graphNodes: GraphNode[] = [
  { id:"A",x:24,y:20 },{ id:"B",x:76,y:20 },{ id:"C",x:90,y:45 },
  { id:"D",x:82,y:70 },{ id:"E",x:62,y:84 },{ id:"F",x:38,y:84 },
  { id:"G",x:18,y:70 },{ id:"H",x:10,y:45 },
];
export const graphEdges: GraphEdge[] = [
  {id:"A-B",from:"A",to:"B"},{id:"B-C",from:"B",to:"C"},
  {id:"C-D",from:"C",to:"D"},{id:"D-E",from:"D",to:"E"},
  {id:"E-F",from:"E",to:"F"},{id:"F-G",from:"F",to:"G"},
  {id:"G-H",from:"G",to:"H"},{id:"H-A",from:"H",to:"A"},
  {id:"A-E",from:"A",to:"E"},
];
const colorings: Record<ProverMode,Record<NodeId,ColorName>> = {
  honest:{A:"red",B:"blue",C:"green",D:"red",E:"blue",F:"green",G:"red",H:"blue"},
  cheating:{A:"red",B:"blue",C:"green",D:"green",E:"red",F:"blue",G:"red",H:"blue"},
};
const permutations: readonly (readonly ColorName[])[] = [
  ["red","blue","green"],["blue","green","red"],["green","red","blue"],
  ["red","green","blue"],["green","blue","red"],["blue","red","green"],
];
const colors: ColorName[] = ["red","blue","green"];
export type TranscriptRow = {
  round: number; edge: GraphEdge; openedColors: [ColorName,ColorName];
  verdict:"pass"|"caught"; challenge:"selected"|"random"; origin:"learner"|"starting example";
};
export type ProofRound = { number:number; mode:ProverMode; shuffle:number; opened:TranscriptRow|null };
export type ProofState = { mode:ProverMode; rounds:number; edge:string; current:ProofRound|null; history:TranscriptRow[] };
export function initialProofState(mode:ProverMode="honest",rounds=6):ProofState {
  if ((mode!=="honest"&&mode!=="cheating") || !Number.isInteger(rounds) || rounds<1 || rounds>20) throw new Error("Invalid proof settings");
  return { mode,rounds,edge:"A-B",current:null,history:[] };
}
export function edgeById(id:string):GraphEdge {
  const edge=graphEdges.find(e=>e.id===id);if(!edge)throw new Error(`Unknown graph edge: ${id}`);return edge;
}
export function commitProofRound(state:ProofState,shuffle:number):ProofState {
  if (!Number.isInteger(shuffle)||shuffle<0||shuffle>=6)throw new Error("Invalid permutation");
  if (state.current&&!state.current.opened) throw new Error("Open the committed round before starting another");
  return {...state,current:{number:(state.current?.number??0)+1,mode:state.mode,shuffle,opened:null}};
}
export function openProofEdge(state:ProofState,edgeId:string,challenge:TranscriptRow["challenge"]="selected",origin:TranscriptRow["origin"]="learner"):ProofState {
  const current=state.current;
  if (!current||current.opened)throw new Error("Commit a fresh round before opening one edge");
  if(current.mode!==state.mode)throw new Error("Prover changed after commitment");
  const edge=edgeById(edgeId),base=colorings[current.mode],permutation=permutations[current.shuffle];
  const openedColors:[ColorName,ColorName]=[permutation[colors.indexOf(base[edge.from])],permutation[colors.indexOf(base[edge.to])]];
  const row:TranscriptRow={round:current.number,edge,openedColors,verdict:openedColors[0]===openedColors[1]?"caught":"pass",challenge,origin};
  return {...state,edge:edgeId,current:{...current,opened:row},history:[...state.history,row].slice(-20)};
}
export function proofTheory(rounds:number) {
  if(!Number.isInteger(rounds)||rounds<1||rounds>20)throw new Error("Theoretical rounds must be an integer from 1 to 20");
  const badEdges=graphEdges.filter(e=>colorings.cheating[e.from]===colorings.cheating[e.to]).map(e=>e.id);
  const passingEdges=graphEdges.length-badEdges.length;
  return {badEdges,passingEdges,totalEdges:graphEdges.length,escapeProbability:(passingEdges/graphEdges.length)**rounds,
    chartPoints:Array.from({length:21},(_,k)=>({rounds:k,probability:(passingEdges/graphEdges.length)**k}))};
}
// Pure rejection sampling: the browser supplies fresh uint32 draws in event handlers.
export function uniformIndex(size:number,draw:()=>number):number {
  if(!Number.isInteger(size)||size<1||size>4294967296)throw new Error("Invalid sample size");
  const limit=Math.floor(4294967296/size)*size;
  for(;;){const n=draw();if(!Number.isInteger(n)||n<0||n>=4294967296)throw new Error("Invalid random draw");if(n<limit)return n%size;}
}
export function formatProbability(value:number):string {return Number(value.toPrecision(8)).toString();}
