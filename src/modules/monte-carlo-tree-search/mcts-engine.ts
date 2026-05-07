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
  lastMoveId: MoveId;
  lastResult: boolean;
  stepIndex: number;
};

export type MoveAnalysis = MoveStats & {
  q: number;
  bonus: number;
  ucb: number;
  isSelected: boolean;
  isBestProven: boolean;
};

export type SearchAnalysis = {
  rootQ: number;
  moves: MoveAnalysis[];
  selectedMove: MoveAnalysis;
  bestProvenMove: MoveAnalysis;
  recommendedMove: MoveAnalysis;
};

export const initialSearchState: SearchState = {
  rootVisits: 64,
  rootWins: 39,
  lastMoveId: "d4",
  lastResult: true,
  stepIndex: 0,
  moves: [
    {
      id: "a1",
      label: "A1",
      visits: 38,
      wins: 27,
      rolloutPattern: [true, true, false, true, true, false, true, true],
    },
    {
      id: "b2",
      label: "B2",
      visits: 14,
      wins: 8,
      rolloutPattern: [true, false, true, false, true, true],
    },
    {
      id: "c3",
      label: "C3",
      visits: 9,
      wins: 3,
      rolloutPattern: [false, true, false, false, true],
    },
    {
      id: "d4",
      label: "D4",
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
      isBestProven: q === bestQ,
    };
  });
  const selectedMove = scoredMoves.reduce((best, move) =>
    move.ucb > best.ucb ? move : best,
  );
  const bestProvenMove = scoredMoves.reduce((best, move) =>
    move.q > best.q ? move : best,
  );
  const moves = scoredMoves.map((move) => ({
    ...move,
    isSelected: move.id === selectedMove.id,
  }));
  const selected = moves.find((move) => move.id === selectedMove.id) ?? moves[0];
  const bestProven =
    moves.find((move) => move.id === bestProvenMove.id) ?? moves[0];

  return {
    rootQ: winRate(state.rootWins, state.rootVisits),
    moves,
    selectedMove: selected,
    bestProvenMove: bestProven,
    recommendedMove:
      state.rootVisits >= 96 ? bestProven : selected,
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
  return Array.from({ length: steps }).reduce<SearchState>(
    (current) => stepSearch(current, explorationConstant),
    state,
  );
}

export function formatRate(value: number) {
  return value.toFixed(2);
}

export function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}
