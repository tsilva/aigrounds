import type { TsneState } from "./tsne-engine";
export const tsneBaseline = (index = 0): TsneState => ({ scenario: "clouds", perplexity: 2, init: "A", iterations: index === 2 ? 200 : 0 });
export function reachedTsne(index: number, state: TsneState) {
  const targets: TsneState[] = [
    { scenario: "clouds", perplexity: 6, init: "A", iterations: 0 },
    { scenario: "clouds", perplexity: 2, init: "A", iterations: 200 },
    { scenario: "clouds", perplexity: 2, init: "B", iterations: 200 },
    { scenario: "duplicate", perplexity: 4, init: "A", iterations: 200 },
  ];
  const t = targets[index];
  return !!t && t.scenario === state.scenario && t.perplexity === state.perplexity && t.init === state.init && t.iterations === state.iterations;
}
