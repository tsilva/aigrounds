export type SearchProblemId = "tic-tac-toe" | "nim" | "grid-route";

export type SearchProblem = {
  id: SearchProblemId;
  label: string;
  shortLabel: string;
  goal: string;
  board: string[][];
};

export const searchProblems: SearchProblem[] = [
  {
    id: "tic-tac-toe",
    label: "Tic Tac Toe",
    shortLabel: "Corner trap",
    goal: "Choose a move that can still force three in a row.",
    board: [
      ["X", "O", "X"],
      ["O", "X", ""],
      ["", "", ""],
    ],
  },
  {
    id: "nim",
    label: "Nim Heap",
    shortLabel: "Take stones",
    goal: "Probe take moves until the winning heap pattern appears.",
    board: [
      ["", "●", ""],
      ["●", "●", "●"],
      ["●", "●", "●"],
    ],
  },
  {
    id: "grid-route",
    label: "Grid Route",
    shortLabel: "Find reward",
    goal: "Sample paths until the high-value route is backed by evidence.",
    board: [
      ["S", "", ""],
      ["", "■", ""],
      ["", "", "R"],
    ],
  },
];
