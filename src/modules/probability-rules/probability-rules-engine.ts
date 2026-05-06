export type DiceOutcome = {
  id: string;
  first: number;
  second: number;
  sum: number;
};

export type EventRuleId =
  | "sum-seven"
  | "sum-nine-plus"
  | "doubles"
  | "first-even"
  | "second-four-plus"
  | "at-least-one-six";

export type RuleView =
  | "a"
  | "not-a"
  | "intersection"
  | "union"
  | "a-only"
  | "b-only";

export type OutcomeMembership = {
  outcome: DiceOutcome;
  inA: boolean;
  inB: boolean;
  inView: boolean;
};

type RuleAnalysis = {
  sampleSpace: DiceOutcome[];
  memberships: OutcomeMembership[];
  counts: {
    sampleSpace: number;
    a: number;
    b: number;
    intersection: number;
    union: number;
    notA: number;
    aOnly: number;
    bOnly: number;
    view: number;
  };
  probability: number;
  fraction: string;
  decimal: string;
  formula: string;
  expandedFormula: string;
  takeaway: string;
};

export type SimulationState = {
  seed: number;
  rolls: number;
  hits: number;
};

export type SimulationResult = SimulationState & {
  observed: number;
  expected: number;
};

export const ruleLabels: Record<RuleView, string> = {
  a: "A",
  "not-a": "not A",
  intersection: "A and B",
  union: "A or B",
  "a-only": "A only",
  "b-only": "B only",
};

const sampleSpace = Array.from({ length: 36 }, (_, index) => {
  const first = Math.floor(index / 6) + 1;
  const second = (index % 6) + 1;

  return {
    id: `${first}-${second}`,
    first,
    second,
    sum: first + second,
  };
});

function outcomeMatchesRule(
  outcome: DiceOutcome,
  ruleId: EventRuleId,
) {
  if (ruleId === "sum-seven") {
    return outcome.sum === 7;
  }

  if (ruleId === "sum-nine-plus") {
    return outcome.sum >= 9;
  }

  if (ruleId === "doubles") {
    return outcome.first === outcome.second;
  }

  if (ruleId === "first-even") {
    return outcome.first % 2 === 0;
  }

  if (ruleId === "second-four-plus") {
    return outcome.second >= 4;
  }

  return outcome.first === 6 || outcome.second === 6;
}

export function outcomeMatchesView(
  inA: boolean,
  inB: boolean,
  view: RuleView,
) {
  if (view === "a") {
    return inA;
  }

  if (view === "not-a") {
    return !inA;
  }

  if (view === "intersection") {
    return inA && inB;
  }

  if (view === "union") {
    return inA || inB;
  }

  if (view === "a-only") {
    return inA && !inB;
  }

  return inB && !inA;
}

export function analyzeProbabilityRule(
  eventA: EventRuleId,
  eventB: EventRuleId,
  view: RuleView,
): RuleAnalysis {
  const memberships = sampleSpace.map((outcome) => {
    const inA = outcomeMatchesRule(outcome, eventA);
    const inB = outcomeMatchesRule(outcome, eventB);

    return {
      outcome,
      inA,
      inB,
      inView: outcomeMatchesView(inA, inB, view),
    };
  });
  const count = (predicate: (membership: OutcomeMembership) => boolean) =>
    memberships.filter(predicate).length;
  const counts = {
    sampleSpace: sampleSpace.length,
    a: count((membership) => membership.inA),
    b: count((membership) => membership.inB),
    intersection: count((membership) => membership.inA && membership.inB),
    union: count((membership) => membership.inA || membership.inB),
    notA: count((membership) => !membership.inA),
    aOnly: count((membership) => membership.inA && !membership.inB),
    bOnly: count((membership) => membership.inB && !membership.inA),
    view: count((membership) => membership.inView),
  };
  const probability = counts.view / counts.sampleSpace;

  return {
    sampleSpace,
    memberships,
    counts,
    probability,
    fraction: `${counts.view} / ${counts.sampleSpace}`,
    decimal: probability.toFixed(3),
    ...ruleCopy(view, counts),
  };
}

export function advanceSimulation(
  state: SimulationState,
  eventA: EventRuleId,
  eventB: EventRuleId,
  view: RuleView,
  batchSize: number,
): SimulationResult {
  const analysis = analyzeProbabilityRule(eventA, eventB, view);
  let nextSeed = state.seed;
  let hits = state.hits;

  for (let index = 0; index < batchSize; index += 1) {
    const firstRoll = nextRandom(nextSeed);
    nextSeed = firstRoll.seed;
    const secondRoll = nextRandom(nextSeed);
    nextSeed = secondRoll.seed;

    const outcome = {
      id: `${Math.floor(firstRoll.value * 6) + 1}-${Math.floor(secondRoll.value * 6) + 1}`,
      first: Math.floor(firstRoll.value * 6) + 1,
      second: Math.floor(secondRoll.value * 6) + 1,
      sum: Math.floor(firstRoll.value * 6) + Math.floor(secondRoll.value * 6) + 2,
    };
    const inA = outcomeMatchesRule(outcome, eventA);
    const inB = outcomeMatchesRule(outcome, eventB);

    if (outcomeMatchesView(inA, inB, view)) {
      hits += 1;
    }
  }

  const rolls = state.rolls + batchSize;

  return {
    seed: nextSeed,
    rolls,
    hits,
    observed: rolls === 0 ? 0 : hits / rolls,
    expected: analysis.probability,
  };
}

function ruleCopy(
  view: RuleView,
  counts: RuleAnalysis["counts"],
): Pick<RuleAnalysis, "formula" | "expandedFormula" | "takeaway"> {
  if (view === "a") {
    return {
      formula: "P(A) = |A| / |S|",
      expandedFormula: `${counts.a} / ${counts.sampleSpace} = ${(counts.a / counts.sampleSpace).toFixed(3)}`,
      takeaway: "One event probability is its region size divided by all possible outcomes.",
    };
  }

  if (view === "not-a") {
    return {
      formula: "P(not A) = 1 - P(A)",
      expandedFormula: `${counts.notA} / ${counts.sampleSpace} = 1 - ${counts.a} / ${counts.sampleSpace}`,
      takeaway: "The complement is everything in the sample space outside A.",
    };
  }

  if (view === "intersection") {
    return {
      formula: "P(A and B) = |A and B| / |S|",
      expandedFormula: `${counts.intersection} / ${counts.sampleSpace} = ${(counts.intersection / counts.sampleSpace).toFixed(3)}`,
      takeaway: "The intersection keeps only outcomes that satisfy both events.",
    };
  }

  if (view === "union") {
    return {
      formula: "P(A or B) = P(A) + P(B) - P(A and B)",
      expandedFormula: `${counts.a} / ${counts.sampleSpace} + ${counts.b} / ${counts.sampleSpace} - ${counts.intersection} / ${counts.sampleSpace} = ${counts.union} / ${counts.sampleSpace}`,
      takeaway: "Overlap is counted twice unless you subtract it once.",
    };
  }

  if (view === "a-only") {
    return {
      formula: "P(A only) = P(A) - P(A and B)",
      expandedFormula: `${counts.a} / ${counts.sampleSpace} - ${counts.intersection} / ${counts.sampleSpace} = ${counts.aOnly} / ${counts.sampleSpace}`,
      takeaway: "A only removes the part of A that also belongs to B.",
    };
  }

  return {
    formula: "P(B only) = P(B) - P(A and B)",
    expandedFormula: `${counts.b} / ${counts.sampleSpace} - ${counts.intersection} / ${counts.sampleSpace} = ${counts.bOnly} / ${counts.sampleSpace}`,
    takeaway: "B only removes the part of B that also belongs to A.",
  };
}

function nextRandom(seed: number) {
  const nextSeed = (seed * 1664525 + 1013904223) % 4294967296;

  return {
    seed: nextSeed,
    value: nextSeed / 4294967296,
  };
}
