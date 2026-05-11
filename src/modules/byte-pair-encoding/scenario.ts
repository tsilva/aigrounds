export type BpeScenarioId = "repetition" | "code" | "names";

export type Pair = readonly [string, string];

export type BpeCompareExample = {
  text: string;
  note: string;
};

export type BpeScenario = {
  id: BpeScenarioId;
  label: string;
  shortLabel: string;
  description: string;
  trainingText: string;
  inspectionText: string;
  preferredMerges: Pair[];
  compareExamples: BpeCompareExample[];
};

export const endToken = "</w>";

export const maxMergeSteps = 8;

export const initialMergeSteps = 4;

export const bpeScenarios: BpeScenario[] = [
  {
    id: "repetition",
    label: "Repetition",
    shortLabel: "Word families",
    description:
      "Repeated stems and suffixes make the merge choices easy to see.",
    trainingText: "low lower lowest\nnew newer low",
    inspectionText: "lowest newer",
    preferredMerges: [
      ["l", "o"],
      ["lo", "w"],
      ["e", "r"],
      ["n", "e"],
      ["ne", "w"],
      ["low", endToken],
      ["low", "e"],
      ["new", endToken],
    ],
    compareExamples: [
      {
        text: "lowest newer",
        note: "Both words reuse chunks learned from the tiny corpus.",
      },
      {
        text: "glow tower",
        note: "Partial reuse still helps when pieces appear inside new words.",
      },
      {
        text: "xyz",
        note: "Rare strings stay mostly split into characters.",
      },
    ],
  },
  {
    id: "code",
    label: "Code-ish",
    shortLabel: "Repeated syntax",
    description:
      "Common punctuation and small keywords become compact tokens first.",
    trainingText: "if x == y\nif y == z\nreturn x",
    inspectionText: "if x == z",
    preferredMerges: [
      ["i", "f"],
      ["=", "="],
      ["r", "e"],
      ["re", "t"],
      ["ret", "u"],
      ["retu", "r"],
      ["retur", "n"],
      ["if", endToken],
    ],
    compareExamples: [
      {
        text: "if x == z",
        note: "Repeated syntax compresses even when the variable changes.",
      },
      {
        text: "return y",
        note: "A whole keyword emerges after enough merge budget.",
      },
      {
        text: "while q",
        note: "Unseen structure keeps many character pieces.",
      },
    ],
  },
  {
    id: "names",
    label: "Names",
    shortLabel: "Shared prefixes",
    description:
      "Names with common starts and endings show why subword tokens transfer.",
    trainingText: "anna anne annie\njoanna ann",
    inspectionText: "annie joanna",
    preferredMerges: [
      ["a", "n"],
      ["an", "n"],
      ["ann", "a"],
      ["ann", "e"],
      ["ann", "i"],
      ["anni", "e"],
      ["j", "o"],
      ["jo", "anna"],
    ],
    compareExamples: [
      {
        text: "annie joanna",
        note: "Shared name pieces can be reused across examples.",
      },
      {
        text: "annabel",
        note: "The common prefix compresses before the novel ending.",
      },
      {
        text: "max",
        note: "Unseen names stay close to character-level tokens.",
      },
    ],
  },
];
