export type BetId = "safe" | "risky";

export type BetInput = {
  id: BetId;
  label: string;
  shortLabel: string;
  probability: number;
  winAmount: number;
  lossAmount: number;
  color: string;
  mutedColor: string;
};

export type BetAnalysis = BetInput & {
  expectedValue: number;
  variance: number;
  standardDeviation: number;
  swing: number;
  breakEvenProbability: number | null;
  outcomes: OutcomeTick[];
  simulatedAverage: number;
  simulatedTotal: number;
  wins: number;
  losses: number;
};

export type OutcomeTick = {
  id: string;
  round: number;
  isWin: boolean;
  value: number;
  runningAverage: number;
};

export type ComparisonAnalysis = {
  bets: BetAnalysis[];
  domain: {
    min: number;
    max: number;
  };
};

export function analyzeBets(
  bets: BetInput[],
  rounds: number,
): ComparisonAnalysis {
  const analyzedBets = bets.map((bet) => analyzeBet(bet, rounds));
  const min = Math.min(...analyzedBets.map((bet) => bet.lossAmount), -100);
  const max = Math.max(...analyzedBets.map((bet) => bet.winAmount), 100);

  return {
    bets: analyzedBets,
    domain: {
      min,
      max,
    },
  };
}

export function updateBet(
  bets: BetInput[],
  betId: BetId,
  patch: Partial<Pick<BetInput, "probability" | "winAmount" | "lossAmount">>,
) {
  return bets.map((bet) =>
    bet.id === betId
      ? {
          ...bet,
          ...patch,
        }
      : bet,
  );
}

export function analyzeBet(bet: BetInput, rounds: number): BetAnalysis {
  bet = {
    ...bet,
    probability: Number.isFinite(bet.probability) ? Math.min(1, Math.max(0, bet.probability)) : 0.5,
    winAmount: Number.isFinite(bet.winAmount) ? bet.winAmount : 1,
    lossAmount: Number.isFinite(bet.lossAmount) ? bet.lossAmount : -1,
  };
  rounds = Number.isFinite(rounds) ? Math.min(10000, Math.max(1, Math.floor(rounds))) : 60;
  const expectedValue =
    bet.probability * bet.winAmount + (1 - bet.probability) * bet.lossAmount;
  const variance =
    bet.probability * (bet.winAmount - expectedValue) ** 2 +
    (1 - bet.probability) * (bet.lossAmount - expectedValue) ** 2;
  const standardDeviation = Math.sqrt(variance);
  const outcomes = simulateOutcomes(bet, rounds);
  const simulatedTotal = outcomes.reduce((sum, outcome) => sum + outcome.value, 0);
  const wins = outcomes.filter((outcome) => outcome.isWin).length;

  return {
    ...bet,
    expectedValue,
    variance,
    standardDeviation,
    swing: bet.winAmount - bet.lossAmount,
    breakEvenProbability: bet.winAmount === bet.lossAmount ? null : -bet.lossAmount / (bet.winAmount - bet.lossAmount),
    outcomes,
    simulatedAverage: simulatedTotal / rounds,
    simulatedTotal,
    wins,
    losses: rounds - wins,
  };
}

function simulateOutcomes(bet: BetInput, rounds: number): OutcomeTick[] {
  let runningTotal = 0;
  // One fixed stream per bet: payoff edits preserve outcomes; longer runs
  // extend the same prefix. These seeded samples illustrate the model.
  let seed = bet.id === "safe" ? 1309 : 1907;

  return Array.from({ length: rounds }, (_, index) => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const roll = seed / 2 ** 32;
    const isWin = roll < bet.probability;
    const value = isWin ? bet.winAmount : bet.lossAmount;

    runningTotal += value;

    return {
      id: `${bet.id}-${index}`,
      round: index + 1,
      isWin,
      value,
      runningAverage: runningTotal / (index + 1),
    };
  });
}
