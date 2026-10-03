import {
  attentionDimensions,
  type AttentionDimensionId,
  type AttentionScenario,
  type AttentionToken,
  type AttentionVector,
} from "./scenario";

export type AttentionWeight = {
  token: AttentionToken;
  rawScore: number;
  focusedScore: number;
  weight: number;
  contribution: AttentionVector;
};

export type AttentionAnalysis = {
  scenario: AttentionScenario;
  queryToken: AttentionToken;
  weights: AttentionWeight[];
  topToken: AttentionToken;
  topTokens: AttentionToken[];
  topWeight: number;
  entropy: number;
  normalizedEntropy: number;
  outputVector: AttentionVector;
  dominantDimension: AttentionDimensionId;
  dominantLabel: string;
  summary: string;
};

export function analyzeTransformerAttention(
  scenario: AttentionScenario,
  queryTokenId: string,
  sharpness: number,
): AttentionAnalysis {
  const queryToken =
    scenario.tokens.find((token) => token.id === queryTokenId) ??
    scenario.tokens.find((token) => token.id === scenario.defaultQueryId) ??
    scenario.tokens[0];

  if (!queryToken) {
    throw new Error("At least one attention token is required.");
  }

  const vectorSize = queryToken.query.length;
  if (!Number.isFinite(sharpness) || vectorSize === 0 || scenario.tokens.some(token =>
    token.query.length !== vectorSize || token.key.length !== vectorSize ||
    [...token.query, ...token.key, ...Object.values(token.value)].some(value => !Number.isFinite(value)))) {
    throw new Error("Attention requires finite, equally sized nonempty queries/keys and finite values/sharpness.");
  }
  const rawScores = scenario.tokens.map((token) =>
    dot(queryToken.query, token.key) / Math.sqrt(vectorSize),
  );
  const clampedSharpness = clamp(sharpness, 0.6, 3.2);
  const focusedScores = rawScores.map((score) => score * clampedSharpness);
  const weights = softmax(focusedScores);

  const attentionWeights = scenario.tokens.map((token, index) => {
    const weight = weights[index] ?? 0;

    return {
      token,
      rawScore: rawScores[index] ?? 0,
      focusedScore: focusedScores[index] ?? 0,
      weight,
      contribution: scaleVector(token.value, weight),
    };
  });
  const outputVector = sumContributions(
    attentionWeights.map((entry) => entry.contribution),
  );
  const topEntry = attentionWeights.reduce((best, entry) =>
    entry.weight > best.weight ? entry : best,
  );
  const entropy = attentionWeights.reduce((sum, entry) => {
    if (entry.weight <= 0) {
      return sum;
    }

    return sum - entry.weight * Math.log(entry.weight);
  }, 0);
  const normalizedEntropy =
    attentionWeights.length > 1
      ? entropy / Math.log(attentionWeights.length)
      : 0;
  const dominantDimension = attentionDimensions.reduce((best, dimension) =>
    outputVector[dimension.id] > outputVector[best.id] ? dimension : best,
  ).id;
  const dominantLabel =
    attentionDimensions.find((dimension) => dimension.id === dominantDimension)
      ?.label ?? dominantDimension;

  return {
    scenario,
    queryToken,
    weights: attentionWeights,
    topToken: topEntry.token,
    topTokens: attentionWeights.filter(entry => entry.weight === topEntry.weight).map(entry => entry.token),
    topWeight: topEntry.weight,
    entropy,
    normalizedEntropy,
    outputVector,
    dominantDimension,
    dominantLabel,
    summary: `${queryToken.label} compares with every key. All ${attentionWeights.length} values contribute to the weighted output.`,
  };
}

export function formatWeight(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

export function formatScore(value: number) {
  return value.toFixed(5);
}

export function formatVectorValue(value: number) {
  return value.toFixed(5);
}

function dot(left: number[], right: number[]) {
  const length = left.length;
  let total = 0;

  for (let index = 0; index < length; index += 1) {
    total += left[index] * right[index];
  }

  return total;
}

function softmax(scores: number[]) {
  const maxScore = Math.max(...scores);
  const expScores = scores.map((score) => Math.exp(score - maxScore));
  const total = expScores.reduce((sum, score) => sum + score, 0);

  return expScores.map((score) => score / total);
}

function scaleVector(vector: AttentionVector, scalar: number): AttentionVector {
  return {
    water: vector.water * scalar,
    money: vector.money * scalar,
    syntax: vector.syntax * scalar,
  };
}

function sumContributions(contributions: AttentionVector[]): AttentionVector {
  return contributions.reduce(
    (total, contribution) => ({
      water: total.water + contribution.water,
      money: total.money + contribution.money,
      syntax: total.syntax + contribution.syntax,
    }),
    { water: 0, money: 0, syntax: 0 },
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
