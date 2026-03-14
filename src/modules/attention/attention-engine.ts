import { type AttentionScenario } from "./scenarios";

export type AttentionControls = {
  contextStrength: number;
  sharpness: number;
  recencyBias: number;
};

export type AttentionTokenSummary = {
  id: string;
  label: string;
  detail: string;
  role: string;
  position: number;
  normalizedPosition: number;
  queryAlignment: number;
  recencyBonus: number;
  contextShift: number;
  attentionLogit: number;
  attentionWeight: number;
  leaderSupport: number;
};

export type AttentionCandidateSummary = {
  label: string;
  detail: string;
  rawScore: number;
  probability: number;
};

export type AttentionAnalysis = {
  tokens: AttentionTokenSummary[];
  candidates: AttentionCandidateSummary[];
  topToken: AttentionTokenSummary | null;
  runnerUpToken: AttentionTokenSummary | null;
  topCandidate: AttentionCandidateSummary | null;
  runnerUpCandidate: AttentionCandidateSummary | null;
  attentionEntropy: number;
  normalizedEntropy: number;
  dominanceGap: number;
};

function dotProduct(left: number[], right: number[]) {
  return left.reduce((total, value, index) => total + value * right[index], 0);
}

function blendVectors(base: number[], context: number[], amount: number) {
  return base.map(
    (value, index) => value * (1 - amount) + context[index] * amount,
  );
}

function softmax(values: number[]) {
  if (values.length === 0) {
    return [];
  }

  const maximumValue = Math.max(...values);
  const exponentials = values.map((value) => Math.exp(value - maximumValue));
  const total = exponentials.reduce((sum, value) => sum + value, 0);

  return exponentials.map((value) => value / total);
}

function weightedSum(vectors: number[][], weights: number[]) {
  if (vectors.length === 0) {
    return [];
  }

  return vectors[0].map((_, dimensionIndex) =>
    vectors.reduce(
      (total, vector, vectorIndex) =>
        total + vector[dimensionIndex] * weights[vectorIndex],
      0,
    ),
  );
}

export function analyzeAttentionScenario(
  scenario: AttentionScenario,
  controls: AttentionControls,
): AttentionAnalysis {
  const blendedQuery = blendVectors(
    scenario.baseQuery,
    scenario.contextQuery,
    controls.contextStrength,
  );
  const lastIndex = Math.max(1, scenario.tokens.length - 1);

  const tokenSummaries = scenario.tokens.map((token, index) => {
    const normalizedPosition = index / lastIndex;
    const queryAlignment = dotProduct(blendedQuery, token.key);
    const recencyBonus = controls.recencyBias * normalizedPosition;
    const attentionLogit =
      queryAlignment * controls.sharpness + recencyBonus;
    const contextShift =
      dotProduct(scenario.contextQuery, token.key) -
      dotProduct(scenario.baseQuery, token.key);

    return {
      id: token.id,
      label: token.label,
      detail: token.detail,
      role: token.role,
      position: index,
      normalizedPosition,
      queryAlignment,
      recencyBonus,
      contextShift,
      attentionLogit,
      attentionWeight: 0,
      leaderSupport: 0,
    };
  });

  const attentionWeights = softmax(
    tokenSummaries.map((token) => token.attentionLogit),
  );
  const contextVector = weightedSum(
    scenario.tokens.map((token) => token.value),
    attentionWeights,
  );

  const rawCandidates = scenario.candidates.map((candidate) => ({
    label: candidate.label,
    detail: candidate.detail,
    rawScore: dotProduct(contextVector, candidate.vector) + (candidate.bias ?? 0),
  }));
  const candidateProbabilities = softmax(
    rawCandidates.map((candidate) => candidate.rawScore),
  );
  const candidates = rawCandidates
    .map((candidate, index) => ({
      ...candidate,
      probability: candidateProbabilities[index] ?? 0,
    }))
    .sort((left, right) => right.rawScore - left.rawScore);

  const topCandidate = candidates[0] ?? null;
  const runnerUpCandidate = candidates[1] ?? null;
  const topCandidateVector =
    scenario.candidates.find((candidate) => candidate.label === topCandidate?.label)
      ?.vector ?? null;

  const tokens = tokenSummaries
    .map((token, index) => {
      const leaderSupport = topCandidateVector
        ? attentionWeights[index] *
          dotProduct(scenario.tokens[index].value, topCandidateVector)
        : 0;

      return {
        ...token,
        attentionWeight: attentionWeights[index] ?? 0,
        leaderSupport,
      };
    })
    .sort((left, right) => right.attentionWeight - left.attentionWeight);

  const topToken = tokens[0] ?? null;
  const runnerUpToken = tokens[1] ?? null;
  const dominanceGap =
    (topToken?.attentionWeight ?? 0) - (runnerUpToken?.attentionWeight ?? 0);
  const attentionEntropy = attentionWeights.reduce((total, weight) => {
    if (weight <= 0) {
      return total;
    }

    return total - weight * Math.log(weight);
  }, 0);
  const normalizedEntropy =
    attentionEntropy / Math.log(Math.max(2, attentionWeights.length));

  return {
    tokens,
    candidates,
    topToken,
    runnerUpToken,
    topCandidate,
    runnerUpCandidate,
    attentionEntropy,
    normalizedEntropy,
    dominanceGap,
  };
}
