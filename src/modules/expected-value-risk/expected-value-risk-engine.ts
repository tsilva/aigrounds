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
  breakEvenProbability: number;
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
  bestExpectedValue: BetId;
  lowestRisk: BetId;
  widestSwing: BetId;
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
  const bestExpectedValue = analyzedBets.reduce((best, bet) =>
    bet.expectedValue > best.expectedValue ? bet : best,
  ).id;
  const lowestRisk = analyzedBets.reduce((lowest, bet) =>
    bet.standardDeviation < lowest.standardDeviation ? bet : lowest,
  ).id;
  const widestSwing = analyzedBets.reduce((widest, bet) =>
    bet.swing > widest.swing ? bet : widest,
  ).id;
  const min = Math.min(...analyzedBets.map((bet) => bet.lossAmount), -100);
  const max = Math.max(...analyzedBets.map((bet) => bet.winAmount), 100);

  return {
    bets: analyzedBets,
    bestExpectedValue,
    lowestRisk,
    widestSwing,
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
    breakEvenProbability: Math.abs(bet.lossAmount) / (bet.winAmount - bet.lossAmount),
    outcomes,
    simulatedAverage: simulatedTotal / rounds,
    simulatedTotal,
    wins,
    losses: rounds - wins,
  };
}

function simulateOutcomes(bet: BetInput, rounds: number): OutcomeTick[] {
  let runningTotal = 0;

  return Array.from({ length: rounds }, (_, index) => {
    const roll = deterministicUnitValue(bet, index + 1);
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

function deterministicUnitValue(bet: BetInput, round: number) {
  const seed =
    round * 1103515245 +
    bet.probability * 1009 +
    bet.winAmount * 917 +
    Math.abs(bet.lossAmount) * 619 +
    (bet.id === "safe" ? 17 : 71);
  const mixed = Math.sin(seed) * 10000;

  return mixed - Math.floor(mixed);
}
