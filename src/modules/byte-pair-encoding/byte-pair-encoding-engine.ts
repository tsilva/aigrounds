import {
  endToken,
  maxMergeSteps,
  type BpeCompareExample,
  type BpeScenario,
  type Pair,
} from "./scenario";

export type PairCount = {
  pair: Pair;
  count: number;
  isTop: boolean;
};

export type MergeStep = {
  index: number;
  pair: Pair;
  token: string;
  count: number;
};

export type TokenizedWord = {
  source: string;
  tokens: string[];
};

export type TokenizationSummary = {
  text: string;
  words: TokenizedWord[];
  tokens: string[];
  count: number;
};

export type CompareAnalysis = {
  example: BpeCompareExample;
  before: TokenizationSummary;
  after: TokenizationSummary;
  reduction: number;
};

export type BpeAnalysis = {
  initialVocabularySize: number;
  vocabularySize: number;
  mergeSteps: MergeStep[];
  activeMerges: MergeStep[];
  nextCandidates: PairCount[];
  beforeInspection: TokenizationSummary;
  afterInspection: TokenizationSummary;
  compareAnalyses: CompareAnalysis[];
  tokenReduction: number;
  tradeoff: Array<{
    mergeCount: number;
    tokenCount: number;
    vocabularySize: number;
  }>;
};

type PairCounter = Map<string, { pair: Pair; count: number }>;

export function analyzeBpe(
  scenario: BpeScenario,
  requestedMergeCount: number,
): BpeAnalysis {
  const safeMergeCount = clamp(
    Math.round(requestedMergeCount),
    0,
    maxMergeSteps,
  );
  const trainingWords = parseWords(scenario.trainingText);
  const initialWords = trainingWords.map(tokenizeWordCharacters);
  const initialVocabulary = getVocabulary(initialWords);
  const mergeSteps = trainMerges(scenario, initialWords, maxMergeSteps);
  const activeMerges = mergeSteps.slice(0, safeMergeCount);
  const afterTrainingWords = applyMergesToWords(initialWords, activeMerges);
  const vocabulary = getVocabulary(initialWords, activeMerges);
  const beforeInspection = tokenizeText(scenario.inspectionText, []);
  const afterInspection = tokenizeText(scenario.inspectionText, activeMerges);
  const compareAnalyses = scenario.compareExamples.map((example) => {
    const before = tokenizeText(example.text, []);
    const after = tokenizeText(example.text, activeMerges);

    return {
      example,
      before,
      after,
      reduction: getReduction(before.count, after.count),
    };
  });

  return {
    initialVocabularySize: initialVocabulary.size,
    vocabularySize: vocabulary.size,
    mergeSteps,
    activeMerges,
    nextCandidates: getPairCounts(afterTrainingWords).slice(0, 4),
    beforeInspection,
    afterInspection,
    compareAnalyses,
    tokenReduction: getReduction(beforeInspection.count, afterInspection.count),
    tradeoff: [0, 2, 4, 6, 8].map((mergeCount) => {
      const merges = mergeSteps.slice(0, mergeCount);
      const tokenized = tokenizeText(scenario.inspectionText, merges);

      return {
        mergeCount,
        tokenCount: tokenized.count,
        vocabularySize: getVocabulary(initialWords, merges).size,
      };
    }),
  };
}

export function formatPair(pair: Pair) {
  return `${pair[0]} + ${pair[1]}`;
}

export function formatMerge(step: MergeStep) {
  return `${formatPair(step.pair)} -> ${step.token}`;
}

export function formatReduction(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function formatTokens(tokens: string[]) {
  return tokens.join(" ");
}

function trainMerges(
  scenario: BpeScenario,
  initialWords: string[][],
  mergeLimit: number,
) {
  const steps: MergeStep[] = [];
  let currentWords = initialWords;

  for (let index = 0; index < mergeLimit; index += 1) {
    const candidates = getPairCounts(currentWords);
    const topCount = candidates[0]?.count ?? 0;
    const preferredPair = scenario.preferredMerges[index];
    const preferredCandidate = preferredPair
      ? candidates.find(
          (candidate) =>
            isSamePair(candidate.pair, preferredPair) &&
            candidate.count === topCount,
        )
      : undefined;
    const selected = preferredCandidate ?? candidates[0];

    if (!selected) {
      break;
    }

    const step = {
      index: index + 1,
      pair: selected.pair,
      token: selected.pair.join(""),
      count: selected.count,
    };

    steps.push(step);
    currentWords = applyMergeToWords(currentWords, step);
  }

  return steps;
}

function tokenizeText(text: string, merges: MergeStep[]): TokenizationSummary {
  const words = parseWords(text).map((word) => {
    const tokens = applyMerges(tokenizeWordCharacters(word), merges);

    return {
      source: word,
      tokens,
    };
  });
  const tokens = words.flatMap((word) => word.tokens);

  return {
    text,
    words,
    tokens,
    count: tokens.length,
  };
}

function parseWords(text: string) {
  return text
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean);
}

function tokenizeWordCharacters(word: string) {
  return [...word, endToken];
}

function applyMergesToWords(words: string[][], merges: MergeStep[]) {
  return words.map((word) => applyMerges(word, merges));
}

function applyMerges(tokens: string[], merges: MergeStep[]) {
  return merges.reduce(
    (currentTokens, merge) => applyMerge(currentTokens, merge),
    tokens,
  );
}

function applyMergeToWords(words: string[][], merge: MergeStep) {
  return words.map((word) => applyMerge(word, merge));
}

function applyMerge(tokens: string[], merge: MergeStep) {
  const mergedTokens: string[] = [];
  let index = 0;

  while (index < tokens.length) {
    const left = tokens[index];
    const right = tokens[index + 1];

    if (left === merge.pair[0] && right === merge.pair[1]) {
      mergedTokens.push(merge.token);
      index += 2;
    } else {
      mergedTokens.push(left);
      index += 1;
    }
  }

  return mergedTokens;
}

function getPairCounts(words: string[][]): PairCount[] {
  const counter: PairCounter = new Map();

  words.forEach((tokens) => {
    for (let index = 0; index < tokens.length - 1; index += 1) {
      const pair: Pair = [tokens[index], tokens[index + 1]];
      const key = pairKey(pair);
      const existing = counter.get(key);

      counter.set(key, {
        pair,
        count: (existing?.count ?? 0) + 1,
      });
    }
  });

  const sorted = [...counter.values()].sort((left, right) => {
    if (right.count !== left.count) {
      return right.count - left.count;
    }

    return pairKey(left.pair).localeCompare(pairKey(right.pair));
  });
  const topCount = sorted[0]?.count ?? 0;

  return sorted.map((candidate) => ({
    ...candidate,
    isTop: candidate.count === topCount,
  }));
}

function getVocabulary(words: string[][], merges: MergeStep[] = []) {
  return new Set([...words.flat(), ...merges.map((merge) => merge.token)]);
}

function getReduction(before: number, after: number) {
  if (before === 0) {
    return 0;
  }

  return Math.max(0, (before - after) / before);
}

function pairKey(pair: Pair) {
  return pair.join("\u0000");
}

function isSamePair(left: Pair, right: Pair) {
  return left[0] === right[0] && left[1] === right[1];
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
