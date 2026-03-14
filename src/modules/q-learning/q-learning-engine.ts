import {
  actionIds,
  arcadeCells,
  arcadeStateIds,
  bumpPenalty,
  gridHeight,
  gridWidth,
  isTerminalState,
  isWallState,
  nonTerminalStateIds,
  startStateId,
  stepPenalty,
  type ActionId,
} from "./arcade";

export type QTable = Record<string, Record<ActionId, number>>;
export type VisitTable = Record<string, Record<ActionId, number>>;

export type ScheduleId = "steady" | "cooling" | "greedy";

export type SchedulePreset = {
  id: ScheduleId;
  label: string;
  description: string;
};

export type EpisodeStep = {
  step: number;
  stateId: string;
  action: ActionId;
  nextStateId: string;
  reward: number;
  epsilon: number;
  mode: "explore" | "exploit";
  previousQ: number;
  nextBestQ: number;
  tdTarget: number;
  updatedQ: number;
};

export type EpisodeTrace = {
  steps: EpisodeStep[];
  totalReturn: number;
  reachedTerminal: boolean;
  terminalStateId: string | null;
};

export type LearningState = {
  episode: number;
  qValues: QTable;
  visitCounts: VisitTable;
  totalExploreSteps: number;
  totalExploitSteps: number;
  lastEpisode: EpisodeTrace | null;
};

export type LearningConfig = {
  alpha: number;
  gamma: number;
  scheduleId: ScheduleId;
  maxStepsPerEpisode?: number;
};

type Transition = {
  nextStateId: string;
  reward: number;
  isTerminal: boolean;
};

type GreedyPathStep = {
  stateId: string;
  action: ActionId;
  nextStateId: string;
  qValue: number;
};

export type GreedyPathSummary = {
  stateIds: string[];
  actions: GreedyPathStep[];
  reachedTerminal: boolean;
  terminalStateId: string | null;
};

export const epsilonSchedulePresets: SchedulePreset[] = [
  {
    id: "steady",
    label: "Steady explorer",
    description:
      "Keeps a constant amount of randomness, so the agent continues checking alternatives even after it has a decent route.",
  },
  {
    id: "cooling",
    label: "Cooling off",
    description:
      "Starts very curious, then decays toward a small floor. This is the usual compromise when you want discovery first and exploitation later.",
  },
  {
    id: "greedy",
    label: "Mostly greedy",
    description:
      "Barely explores at all. It often locks onto the safe cashout before it has enough evidence that the jackpot path is better.",
  },
];

const actionOffsets: Record<ActionId, { row: number; column: number }> = {
  up: { row: -1, column: 0 },
  right: { row: 0, column: 1 },
  down: { row: 1, column: 0 },
  left: { row: 0, column: -1 },
};

const statePositions = Object.fromEntries(
  arcadeStateIds.map((stateId) => [
    stateId,
    {
      row: arcadeCells[stateId].row,
      column: arcadeCells[stateId].column,
    },
  ]),
) as Record<string, { row: number; column: number }>;

function createZeroRow<T extends number>(value: T) {
  return Object.fromEntries(actionIds.map((action) => [action, value])) as Record<
    ActionId,
    T
  >;
}

function createEmptyQTable() {
  return Object.fromEntries(
    nonTerminalStateIds.map((stateId) => [stateId, createZeroRow(0)]),
  ) as QTable;
}

function createEmptyVisitTable() {
  return Object.fromEntries(
    nonTerminalStateIds.map((stateId) => [stateId, createZeroRow(0)]),
  ) as VisitTable;
}

function cloneQTable(qValues: QTable) {
  return Object.fromEntries(
    Object.entries(qValues).map(([stateId, values]) => [stateId, { ...values }]),
  ) as QTable;
}

function cloneVisitTable(visitCounts: VisitTable) {
  return Object.fromEntries(
    Object.entries(visitCounts).map(([stateId, values]) => [stateId, { ...values }]),
  ) as VisitTable;
}

function randomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function bestActionsForState(qValues: QTable, stateId: string) {
  const stateQValues = qValues[stateId];

  if (!stateQValues) {
    return [];
  }

  const entries = actionIds.map((action) => ({
    action,
    value: stateQValues[action],
  }));
  const bestValue = Math.max(...entries.map((entry) => entry.value));

  return entries
    .filter((entry) => Math.abs(entry.value - bestValue) < 0.000001)
    .map((entry) => entry.action);
}

function maxQValue(qValues: QTable, stateId: string) {
  const stateQValues = qValues[stateId];

  if (!stateQValues) {
    return 0;
  }

  return Math.max(...actionIds.map((action) => stateQValues[action]));
}

function totalVisitsForState(visitCounts: VisitTable | undefined, stateId: string) {
  if (!visitCounts?.[stateId]) {
    return 0;
  }

  return actionIds.reduce(
    (total, action) => total + visitCounts[stateId][action],
    0,
  );
}

function move(stateId: string, action: ActionId): Transition {
  const position = statePositions[stateId];
  const offset = actionOffsets[action];
  const nextRow = position.row + offset.row;
  const nextColumn = position.column + offset.column;

  if (
    nextRow < 0 ||
    nextRow >= gridHeight ||
    nextColumn < 0 ||
    nextColumn >= gridWidth
  ) {
    return {
      nextStateId: stateId,
      reward: bumpPenalty,
      isTerminal: false,
    };
  }

  const nextCell = Object.values(arcadeCells).find(
    (cell) => cell.row === nextRow && cell.column === nextColumn,
  );

  if (!nextCell || isWallState(nextCell.id)) {
    return {
      nextStateId: stateId,
      reward: bumpPenalty,
      isTerminal: false,
    };
  }

  return {
    nextStateId: nextCell.id,
    reward: stepPenalty + (nextCell.reward ?? 0),
    isTerminal: isTerminalState(nextCell.id),
  };
}

function chooseAction(
  qValues: QTable,
  stateId: string,
  epsilon: number,
): {
  action: ActionId;
  mode: "explore" | "exploit";
} {
  if (Math.random() < epsilon) {
    return {
      action: randomItem([...actionIds]),
      mode: "explore",
    };
  }

  return {
    action: randomItem(bestActionsForState(qValues, stateId)),
    mode: "exploit",
  };
}

export function getEpsilonForEpisode(scheduleId: ScheduleId, episode: number) {
  switch (scheduleId) {
    case "steady":
      return 0.22;
    case "cooling":
      return Math.max(0.05, 0.95 * Math.pow(0.88, Math.max(0, episode - 1)));
    case "greedy":
      return 0.06;
    default:
      return 0.22;
  }
}

export function createInitialLearningState(): LearningState {
  return {
    episode: 0,
    qValues: createEmptyQTable(),
    visitCounts: createEmptyVisitTable(),
    totalExploreSteps: 0,
    totalExploitSteps: 0,
    lastEpisode: null,
  };
}

export function getBestActionForState(
  qValues: QTable,
  stateId: string,
  visitCounts?: VisitTable,
) {
  if (visitCounts && totalVisitsForState(visitCounts, stateId) === 0) {
    return null;
  }

  const bestActions = bestActionsForState(qValues, stateId);

  return bestActions[0] ?? null;
}

export function summarizeGreedyPath(
  qValues: QTable,
  visitCounts?: VisitTable,
  maxSteps = 12,
): GreedyPathSummary {
  const stateIds = [startStateId];
  const actions: GreedyPathStep[] = [];
  const seen = new Set<string>([startStateId]);
  let currentStateId = startStateId;

  for (let step = 0; step < maxSteps; step += 1) {
    if (
      isTerminalState(currentStateId) ||
      !qValues[currentStateId] ||
      totalVisitsForState(visitCounts, currentStateId) === 0
    ) {
      break;
    }

    const action = getBestActionForState(qValues, currentStateId, visitCounts);

    if (!action) {
      break;
    }

    const transition = move(currentStateId, action);

    actions.push({
      stateId: currentStateId,
      action,
      nextStateId: transition.nextStateId,
      qValue: qValues[currentStateId][action],
    });
    stateIds.push(transition.nextStateId);

    if (transition.isTerminal) {
      return {
        stateIds,
        actions,
        reachedTerminal: true,
        terminalStateId: transition.nextStateId,
      };
    }

    if (seen.has(transition.nextStateId)) {
      return {
        stateIds,
        actions,
        reachedTerminal: false,
        terminalStateId: null,
      };
    }

    seen.add(transition.nextStateId);
    currentStateId = transition.nextStateId;
  }

  return {
    stateIds,
    actions,
    reachedTerminal: false,
    terminalStateId: null,
  };
}

export function runQlearningEpisode(
  currentState: LearningState,
  config: LearningConfig,
): LearningState {
  const qValues = cloneQTable(currentState.qValues);
  const visitCounts = cloneVisitTable(currentState.visitCounts);
  const steps: EpisodeStep[] = [];
  const epsilon = getEpsilonForEpisode(
    config.scheduleId,
    currentState.episode + 1,
  );
  const maxStepsPerEpisode = config.maxStepsPerEpisode ?? 18;

  let currentStateId = startStateId;
  let totalReturn = 0;
  let exploreSteps = 0;
  let exploitSteps = 0;

  for (let step = 0; step < maxStepsPerEpisode; step += 1) {
    const selection = chooseAction(qValues, currentStateId, epsilon);
    const transition = move(currentStateId, selection.action);
    const previousQ = qValues[currentStateId][selection.action];
    const nextBestQ = transition.isTerminal
      ? 0
      : maxQValue(qValues, transition.nextStateId);
    const tdTarget = transition.reward + config.gamma * nextBestQ;
    const updatedQ = previousQ + config.alpha * (tdTarget - previousQ);

    qValues[currentStateId] = {
      ...qValues[currentStateId],
      [selection.action]: updatedQ,
    };
    visitCounts[currentStateId] = {
      ...visitCounts[currentStateId],
      [selection.action]: visitCounts[currentStateId][selection.action] + 1,
    };

    if (selection.mode === "explore") {
      exploreSteps += 1;
    } else {
      exploitSteps += 1;
    }

    totalReturn += transition.reward;
    steps.push({
      step: step + 1,
      stateId: currentStateId,
      action: selection.action,
      nextStateId: transition.nextStateId,
      reward: transition.reward,
      epsilon,
      mode: selection.mode,
      previousQ,
      nextBestQ,
      tdTarget,
      updatedQ,
    });

    currentStateId = transition.nextStateId;

    if (transition.isTerminal) {
      break;
    }
  }

  return {
    episode: currentState.episode + 1,
    qValues,
    visitCounts,
    totalExploreSteps: currentState.totalExploreSteps + exploreSteps,
    totalExploitSteps: currentState.totalExploitSteps + exploitSteps,
    lastEpisode: {
      steps,
      totalReturn,
      reachedTerminal: isTerminalState(currentStateId),
      terminalStateId: isTerminalState(currentStateId) ? currentStateId : null,
    },
  };
}
