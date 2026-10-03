export type MoveId = "a1" | "b2" | "c3" | "d4";

export type MoveStats = {
  id: MoveId;
  label: string;
  visits: number;
  wins: number;
  rolloutPattern: boolean[];
};

export type SearchState = {
  rootVisits: number;
  rootWins: number;
  moves: MoveStats[];
  lastMoveId: MoveId | null;
  lastResult: boolean | null;
  stepIndex: number;
};

export type MoveAnalysis = MoveStats & {
  q: number;
  bonus: number;
  ucb: number;
  isSelected: boolean;
  isBestObserved: boolean;
};

export type SearchAnalysis = {
  rootQ: number;
  moves: MoveAnalysis[];
  selectedMove: MoveAnalysis;
  bestObservedMove: MoveAnalysis;
};

export const initialSearchState: SearchState = {
  rootVisits: 64,
  rootWins: 39,
  lastMoveId: null,
  lastResult: null,
  stepIndex: 0,
  moves: [
    {
      id: "a1",
      label: "A",
      visits: 38,
      wins: 27,
      rolloutPattern: [true, true, false, true, true, false, true, true],
    },
    {
      id: "b2",
      label: "B",
      visits: 14,
      wins: 8,
      rolloutPattern: [true, false, true, false, true, true],
    },
    {
      id: "c3",
      label: "C",
      visits: 9,
      wins: 3,
      rolloutPattern: [false, true, false, false, true],
    },
    {
      id: "d4",
      label: "D",
      visits: 3,
      wins: 1,
      rolloutPattern: [true, false, true, true, false, true],
    },
  ],
};

export function winRate(wins: number, visits: number) {
  if (visits === 0) {
    return 0;
  }

  return wins / visits;
}

export function explorationBonus(
  parentVisits: number,
  childVisits: number,
  explorationConstant: number,
) {
  if (childVisits === 0) {
    return Number.POSITIVE_INFINITY;
  }

  return (
    explorationConstant * Math.sqrt(Math.log(Math.max(parentVisits, 1)) / childVisits)
  );
}

export function analyzeSearch(
  state: SearchState,
  explorationConstant: number,
): SearchAnalysis {
  if (!Number.isFinite(explorationConstant) || explorationConstant < 0) {
    throw new Error("Exploration constant must be finite and nonnegative");
  }
  validateSearch(state);
  const bestQ = Math.max(
    ...state.moves.map((move) => winRate(move.wins, move.visits)),
  );
  const scoredMoves = state.moves.map((move) => {
    const q = winRate(move.wins, move.visits);
    const bonus = explorationBonus(
      state.rootVisits,
      move.visits,
      explorationConstant,
    );

    return {
      ...move,
      q,
      bonus,
      ucb: q + bonus,
      isSelected: false,
      isBestObserved: q === bestQ,
    };
  });
  const selectedMove = scoredMoves.reduce((best, move) =>
    move.ucb > best.ucb ? move : best,
  );
  const bestObservedMove = scoredMoves.reduce((best, move) =>
    move.q > best.q ? move : best,
  );
  const moves = scoredMoves.map((move) => ({
    ...move,
    isSelected: move.id === selectedMove.id,
  }));
  const selected = moves.find((move) => move.id === selectedMove.id) ?? moves[0];
  const bestObserved =
    moves.find((move) => move.id === bestObservedMove.id) ?? moves[0];

  return {
    rootQ: winRate(state.rootWins, state.rootVisits),
    moves,
    selectedMove: selected,
    bestObservedMove: bestObserved,
  };
}

export function stepSearch(
  state: SearchState,
  explorationConstant: number,
): SearchState {
  const analysis = analyzeSearch(state, explorationConstant);
  const selected = analysis.selectedMove;
  const patternIndex = selected.visits % selected.rolloutPattern.length;
  const result = selected.rolloutPattern[patternIndex];
  const nextMoves = state.moves.map((move) => {
    if (move.id !== selected.id) {
      return move;
    }

    return {
      ...move,
      visits: move.visits + 1,
      wins: move.wins + (result ? 1 : 0),
    };
  });

  return {
    rootVisits: state.rootVisits + 1,
    rootWins: state.rootWins + (result ? 1 : 0),
    moves: nextMoves,
    lastMoveId: selected.id,
    lastResult: result,
    stepIndex: state.stepIndex + 1,
  };
}

export function runSearchSteps(
  state: SearchState,
  explorationConstant: number,
  steps: number,
) {
  if (!Number.isSafeInteger(steps) || steps < 0) throw new Error("Step count must be a nonnegative integer");
  return Array.from({ length: steps }).reduce<SearchState>(
    (current) => stepSearch(current, explorationConstant),
    state,
  );
}

export function formatRate(value: number) {
  if (value === Infinity) return "∞";
  return value.toFixed(2);
}

export function validateSearch(state: SearchState) {
  const validCount = (n: number) => Number.isSafeInteger(n) && n >= 0;
  if (!state.moves.length || new Set(state.moves.map(m => m.id)).size !== state.moves.length ||
      !validCount(state.stepIndex) || state.moves.some(m => !validCount(m.visits) || !validCount(m.wins) || m.wins > m.visits || !m.rolloutPattern.length || m.rolloutPattern.some(x => typeof x !== "boolean")) ||
      state.rootVisits !== state.moves.reduce((sum, m) => sum + m.visits, 0) ||
      state.rootWins !== state.moves.reduce((sum, m) => sum + m.wins, 0)) {
    throw new Error("Invalid search counts or outcome script");
  }
}

export type SearchTransition = { before: SearchState; after: SearchState; c: number; branch: MoveId; patternIndex: number; result: boolean };
export function searchTransition(before: SearchState, c: number): SearchTransition {
  const selected = analyzeSearch(before, c).selectedMove;
  const patternIndex = selected.visits % selected.rolloutPattern.length;
  return { before, after: stepSearch(before, c), c, branch: selected.id, patternIndex, result: selected.rolloutPattern[patternIndex] };
}

export function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}
