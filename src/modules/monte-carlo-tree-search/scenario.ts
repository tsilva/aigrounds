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
    shortLabel: "Illustration only",
    goal: "A board sketch only: A–D are generic branches, not legal Tic Tac Toe moves.",
    board: [
      ["X", "O", "X"],
      ["O", "X", ""],
      ["", "", ""],
    ],
  },
  {
    id: "nim",
    label: "Nim Heap",
    shortLabel: "Illustration only",
    goal: "A heap sketch only: no take-stone rules, opponent, or winning tactic are simulated.",
    board: [
      ["", "●", ""],
      ["●", "●", "●"],
      ["●", "●", "●"],
    ],
  },
  {
    id: "grid-route",
    label: "Grid Route",
    shortLabel: "Illustration only",
    goal: "A route sketch only: no grid actions, legal paths, or terminal rewards are simulated.",
    board: [
      ["S", "", ""],
      ["", "■", ""],
      ["", "", "R"],
    ],
  },
];
