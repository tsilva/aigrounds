export const actionIds = ["up", "right", "down", "left"] as const;

export type ActionId = (typeof actionIds)[number];

export type ArcadeCellType =
  | "start"
  | "floor"
  | "goal"
  | "trap"
  | "wall";

export type ArcadeCell = {
  id: string;
  row: number;
  column: number;
  label: string;
  title: string;
  description: string;
  type: ArcadeCellType;
  reward?: number;
};

export const gridWidth = 4;
export const gridHeight = 4;
export const startStateId = "start-gate";
export const stepPenalty = -0.4;
export const bumpPenalty = -0.9;

export const arcadeGrid: ArcadeCell[][] = [
  [
    {
      id: "prize-lift",
      row: 0,
      column: 0,
      label: "Prize Lift",
      title: "Prize Lift",
      description:
        "A quiet lane with no jackpot by itself, but it opens safer routes into the upper floor.",
      type: "floor",
    },
    {
      id: "neon-stairs",
      row: 0,
      column: 1,
      label: "Neon Stairs",
      title: "Neon Stairs",
      description:
        "A narrow staircase near the trap. A greedy policy can get nervous here before it has enough experience.",
      type: "floor",
    },
    {
      id: "security-sweep",
      row: 0,
      column: 2,
      label: "Security",
      title: "Security Sweep",
      description:
        "A bad terminal state. Stepping here ends the episode with a harsh penalty.",
      type: "trap",
      reward: -12,
    },
    {
      id: "jackpot-vault",
      row: 0,
      column: 3,
      label: "Jackpot",
      title: "Jackpot Vault",
      description:
        "The high-value ending. It takes extra moves and sits near the trap, so exploration has to keep it in play long enough to learn it.",
      type: "goal",
      reward: 16,
    },
  ],
  [
    {
      id: "token-tunnel",
      row: 1,
      column: 0,
      label: "Tunnel",
      title: "Token Tunnel",
      description:
        "A steady connector state. Repeated visits here usually reveal whether the agent is climbing toward the jackpot or settling early.",
      type: "floor",
    },
    {
      id: "blocked-booth-a",
      row: 1,
      column: 1,
      label: "Wall",
      title: "Closed Booth",
      description:
        "An inactive cabinet blocks this square, forcing the agent around it.",
      type: "wall",
    },
    {
      id: "risk-loop",
      row: 1,
      column: 2,
      label: "Risk Loop",
      title: "Risk Loop",
      description:
        "One move away from disaster and one move away from the jackpot corridor.",
      type: "floor",
    },
    {
      id: "east-ramp",
      row: 1,
      column: 3,
      label: "East Ramp",
      title: "East Ramp",
      description:
        "The last non-terminal square before the jackpot vault.",
      type: "floor",
    },
  ],
  [
    {
      id: "combo-corner",
      row: 2,
      column: 0,
      label: "Combo",
      title: "Combo Corner",
      description:
        "A central lane where the agent decides whether to head for the nearby cashout or keep searching upward.",
      type: "floor",
    },
    {
      id: "center-pad",
      row: 2,
      column: 1,
      label: "Center",
      title: "Center Pad",
      description:
        "This is the hinge state for the whole map. Good policies keep moving right or up from here.",
      type: "floor",
    },
    {
      id: "bonus-lane",
      row: 2,
      column: 2,
      label: "Bonus",
      title: "Bonus Lane",
      description:
        "The fork between the safe cashout and the longer jackpot route.",
      type: "floor",
    },
    {
      id: "safe-cashout",
      row: 2,
      column: 3,
      label: "Cashout",
      title: "Safe Cashout",
      description:
        "A decent terminal reward close to the start. Low-exploration schedules often stop here and never improve further.",
      type: "goal",
      reward: 8,
    },
  ],
  [
    {
      id: "start-gate",
      row: 3,
      column: 0,
      label: "Start",
      title: "Start Gate",
      description:
        "Every episode starts here. Watch its best action change as the Q-table fills in.",
      type: "start",
    },
    {
      id: "south-hall",
      row: 3,
      column: 1,
      label: "South",
      title: "South Hall",
      description:
        "A routine opening move that leads into the middle of the floor.",
      type: "floor",
    },
    {
      id: "blocked-booth-b",
      row: 3,
      column: 2,
      label: "Wall",
      title: "Prize Counter Shutter",
      description:
        "A closed prize counter blocks the direct route east.",
      type: "wall",
    },
    {
      id: "repair-bay",
      row: 3,
      column: 3,
      label: "Repair",
      title: "Repair Bay",
      description:
        "A harmless dead-end that wastes time unless the agent has already learned to avoid it.",
      type: "floor",
    },
  ],
];

export const arcadeCells = Object.fromEntries(
  arcadeGrid.flat().map((cell) => [cell.id, cell]),
) as Record<string, ArcadeCell>;

export const arcadeStateIds = arcadeGrid
  .flat()
  .filter((cell) => cell.type !== "wall")
  .map((cell) => cell.id);

export const nonTerminalStateIds = arcadeGrid
  .flat()
  .filter((cell) => cell.type !== "wall" && cell.type !== "goal" && cell.type !== "trap")
  .map((cell) => cell.id);

export function isWallState(stateId: string) {
  return arcadeCells[stateId]?.type === "wall";
}

export function isTerminalState(stateId: string) {
  const cellType = arcadeCells[stateId]?.type;

  return cellType === "goal" || cellType === "trap";
}
