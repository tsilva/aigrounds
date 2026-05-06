export type ScenarioId = "independent" | "dependent" | "base-rate";

export type FilterView = "all" | "a" | "b" | "intersection" | "b-given-a";

export type PopulationMember = {
  id: string;
  index: number;
  row: number;
  column: number;
  inA: boolean;
  inB: boolean;
};

export type PopulationMemberView = PopulationMember & {
  isInDenominator: boolean;
  isInNumerator: boolean;
  isDimmed: boolean;
};

export type ProbabilityAnalysis = {
  members: PopulationMemberView[];
  counts: {
    total: number;
    a: number;
    b: number;
    intersection: number;
    denominator: number;
    numerator: number;
  };
  probabilities: {
    pA: number;
    pB: number;
    pAAndB: number;
    pBGivenA: number;
  };
  filterFraction: string;
  filterProbability: number;
  independenceDelta: number;
  isIndependent: boolean;
};

export const filterLabels: Record<FilterView, string> = {
  all: "All",
  a: "A",
  b: "B",
  intersection: "A and B",
  "b-given-a": "B | A",
};

export function buildPopulation(scenario: ScenarioId): PopulationMember[] {
  return Array.from({ length: 100 }, (_, index) => {
    const row = Math.floor(index / 10);
    const column = index % 10;
    const inA = matchesA(row, column, scenario);

    return {
      id: `${row}-${column}`,
      index,
      row,
      column,
      inA,
      inB: matchesB(row, column, scenario, inA),
    };
  });
}

export function analyzeConditionalProbability(
  scenario: ScenarioId,
  filter: FilterView,
): ProbabilityAnalysis {
  const population = buildPopulation(scenario);
  const total = population.length;
  const count = (predicate: (member: PopulationMember) => boolean) =>
    population.filter(predicate).length;
  const a = count((member) => member.inA);
  const b = count((member) => member.inB);
  const intersection = count((member) => member.inA && member.inB);
  const probabilities = {
    pA: a / total,
    pB: b / total,
    pAAndB: intersection / total,
    pBGivenA: a === 0 ? 0 : intersection / a,
  };
  const selection = getFilterCounts(filter, {
    total,
    a,
    b,
    intersection,
  });

  return {
    members: population.map((member) => {
      const isInDenominator = memberMatchesDenominator(member, filter);
      const isInNumerator = memberMatchesNumerator(member, filter);

      return {
        ...member,
        isInDenominator,
        isInNumerator,
        isDimmed: filter === "all" ? false : !isInDenominator,
      };
    }),
    counts: {
      total,
      a,
      b,
      intersection,
      denominator: selection.denominator,
      numerator: selection.numerator,
    },
    probabilities,
    filterFraction: `${selection.numerator} / ${selection.denominator}`,
    filterProbability:
      selection.denominator === 0
        ? 0
        : selection.numerator / selection.denominator,
    independenceDelta: probabilities.pBGivenA - probabilities.pB,
    isIndependent: Math.abs(probabilities.pBGivenA - probabilities.pB) < 0.015,
  };
}

function matchesA(row: number, column: number, scenario: ScenarioId) {
  if (scenario === "base-rate") {
    return row < 2 && column < 9;
  }

  return column < 4;
}

function matchesB(
  row: number,
  column: number,
  scenario: ScenarioId,
  inA: boolean,
) {
  if (scenario === "independent") {
    return row < 2 || (row === 2 && column % 2 === 0);
  }

  if (scenario === "dependent") {
    if (inA) {
      return row < 5 || (row === 5 && column < 2);
    }

    return row >= 8 && column >= 4 && column < 8;
  }

  if (inA) {
    return row === 0 && column < 6;
  }

  return (row === 8 && column === 8) || (row === 9 && column === 9);
}

function getFilterCounts(
  filter: FilterView,
  counts: {
    total: number;
    a: number;
    b: number;
    intersection: number;
  },
) {
  if (filter === "a") {
    return {
      numerator: counts.a,
      denominator: counts.total,
    };
  }

  if (filter === "b") {
    return {
      numerator: counts.b,
      denominator: counts.total,
    };
  }

  if (filter === "intersection") {
    return {
      numerator: counts.intersection,
      denominator: counts.total,
    };
  }

  if (filter === "b-given-a") {
    return {
      numerator: counts.intersection,
      denominator: counts.a,
    };
  }

  return {
    numerator: counts.total,
    denominator: counts.total,
  };
}

function memberMatchesDenominator(
  member: PopulationMember,
  filter: FilterView,
) {
  if (filter === "a" || filter === "b-given-a") {
    return member.inA;
  }

  if (filter === "b") {
    return member.inB;
  }

  if (filter === "intersection") {
    return member.inA && member.inB;
  }

  return true;
}

function memberMatchesNumerator(member: PopulationMember, filter: FilterView) {
  if (filter === "a") {
    return member.inA;
  }

  if (filter === "b") {
    return member.inB;
  }

  if (filter === "intersection" || filter === "b-given-a") {
    return member.inA && member.inB;
  }

  return true;
}

