import { samePerplexity, type PerplexityState } from "./perplexity-engine";
export const perplexityTargets = [[25, 50, 50, 50], [50, 50, 50, 1], [50, 50, 50, 0], [100, 25, 100, 100]];
export function reachedPerplexity(index: number, s: PerplexityState) { return !!perplexityTargets[index] && samePerplexity(s, { units: perplexityTargets[index]! }); }
