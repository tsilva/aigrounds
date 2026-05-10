export type ProverMode = "honest" | "cheating";

export type ColorName = "red" | "blue" | "green";

export type NodeId = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";

export type GraphNode = {
  id: NodeId;
  x: number;
  y: number;
};

export type GraphEdge = {
  id: string;
  from: NodeId;
  to: NodeId;
};

export type TranscriptRow = {
  round: number;
  edge: GraphEdge;
  openedColors: [ColorName, ColorName];
  shuffleToken: string;
  verdict: "pass" | "caught";
};

export type ZeroKnowledgeAnalysis = {
  currentEdge: GraphEdge;
  currentOpenedColors: [ColorName, ColorName];
  currentVerdict: "pass" | "caught";
  transcript: TranscriptRow[];
  passingEdges: number;
  caughtEdges: number;
  totalEdges: number;
  escapeProbability: number;
  chartPoints: {
    rounds: number;
    probability: number;
  }[];
};

export const graphNodes: GraphNode[] = [
  { id: "A", x: 24, y: 20 },
  { id: "B", x: 76, y: 20 },
  { id: "C", x: 90, y: 45 },
  { id: "D", x: 82, y: 70 },
  { id: "E", x: 62, y: 84 },
  { id: "F", x: 38, y: 84 },
  { id: "G", x: 18, y: 70 },
  { id: "H", x: 10, y: 45 },
];

export const graphEdges: GraphEdge[] = [
  { id: "A-B", from: "A", to: "B" },
  { id: "B-C", from: "B", to: "C" },
  { id: "C-D", from: "C", to: "D" },
  { id: "D-E", from: "D", to: "E" },
  { id: "E-F", from: "E", to: "F" },
  { id: "F-G", from: "F", to: "G" },
  { id: "G-H", from: "G", to: "H" },
  { id: "H-A", from: "H", to: "A" },
  { id: "A-E", from: "A", to: "E" },
];

const challengeOrder = [
  "A-B",
  "D-E",
  "C-D",
  "B-C",
  "A-E",
  "E-F",
  "F-G",
  "G-H",
  "H-A",
];

const honestColoring: Record<NodeId, ColorName> = {
  A: "red",
  B: "blue",
  C: "green",
  D: "red",
  E: "blue",
  F: "green",
  G: "red",
  H: "blue",
};

const cheatingColoring: Record<NodeId, ColorName> = {
  A: "red",
  B: "blue",
  C: "green",
  D: "green",
  E: "red",
  F: "blue",
  G: "red",
  H: "blue",
};

const shufflePermutations: Record<ColorName, ColorName>[] = [
  { red: "red", blue: "blue", green: "green" },
  { red: "blue", blue: "green", green: "red" },
  { red: "green", blue: "red", green: "blue" },
  { red: "red", blue: "green", green: "blue" },
  { red: "green", blue: "blue", green: "red" },
  { red: "blue", blue: "red", green: "green" },
];

function edgeById(edgeId: string) {
  const edge = graphEdges.find((candidate) => candidate.id === edgeId);

  if (!edge) {
    throw new Error(`Unknown graph edge: ${edgeId}`);
  }

  return edge;
}

function getBaseColoring(mode: ProverMode) {
  return mode === "honest" ? honestColoring : cheatingColoring;
}

function getOpenedColors(
  edge: GraphEdge,
  mode: ProverMode,
  round: number,
): [ColorName, ColorName] {
  const coloring = getBaseColoring(mode);
  const shuffle = shufflePermutations[(round - 1) % shufflePermutations.length];

  return [shuffle[coloring[edge.from]], shuffle[coloring[edge.to]]];
}

function getVerdict(edge: GraphEdge, mode: ProverMode) {
  const coloring = getBaseColoring(mode);

  return coloring[edge.from] === coloring[edge.to] ? "caught" : "pass";
}

function getChallengeEdge(roundIndex: number) {
  return edgeById(challengeOrder[roundIndex % challengeOrder.length]);
}

export function analyzeZeroKnowledgeProof({
  challengeIndex,
  mode,
  rounds,
}: {
  challengeIndex: number;
  mode: ProverMode;
  rounds: number;
}): ZeroKnowledgeAnalysis {
  const boundedRounds = Math.min(20, Math.max(1, Math.round(rounds)));
  const currentEdge = getChallengeEdge(challengeIndex);
  const currentOpenedColors = getOpenedColors(
    currentEdge,
    mode,
    challengeIndex + 1,
  );
  const currentVerdict = getVerdict(currentEdge, mode);
  const cheatingVerdicts = graphEdges.map((edge) => getVerdict(edge, "cheating"));
  const passingEdges = cheatingVerdicts.filter((verdict) => verdict === "pass")
    .length;
  const totalEdges = graphEdges.length;
  const caughtEdges = totalEdges - passingEdges;
  const escapeProbability = (passingEdges / totalEdges) ** boundedRounds;

  return {
    currentEdge,
    currentOpenedColors,
    currentVerdict,
    transcript: Array.from({ length: Math.min(3, boundedRounds) }, (_, index) => {
      const roundIndex = challengeIndex + index;
      const edge = getChallengeEdge(roundIndex);

      return {
        round: roundIndex + 1,
        edge,
        openedColors: getOpenedColors(edge, mode, roundIndex + 1),
        shuffleToken: `s${roundIndex + 1}`,
        verdict: getVerdict(edge, mode),
      };
    }),
    passingEdges,
    caughtEdges,
    totalEdges,
    escapeProbability,
    chartPoints: [0, 4, 8, 12, 16, 20].map((chartRound) => ({
      rounds: chartRound,
      probability: (passingEdges / totalEdges) ** chartRound,
    })),
  };
}
