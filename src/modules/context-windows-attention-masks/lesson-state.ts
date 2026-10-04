import { maskBaseline, sameMask, type MaskState } from "./mask-engine";
export const maskTargets: MaskState[] = [
  { ...maskBaseline(), query: 2 },
  { ...maskBaseline(), start: 3 },
  { ...maskBaseline("padding"), padding: "allow" },
  { ...maskBaseline("padding"), direction: "causal", padding: "allow" },
];
export function reachedMask(index: number, s: MaskState) { return !!maskTargets[index] && sameMask(s, maskTargets[index]!); }
