export type DecodingState = { prompt: string; generated: readonly string[]; mode: string; temperature: number; filter: string; k: number; p: number; draw: number; limit: number };
export const decodingScenarios = [
  { id: "cat", label: "The cat", shortLabel: "Three possible next tokens" },
  { id: "dog", label: "The dog", shortLabel: "A different transfer prefix" },
] as const;
export function createDecoding(id = "cat"): DecodingState {
  return { prompt: id === "dog" ? "The dog" : "The cat", generated: [], mode: "sample", temperature: 1, filter: "all", k: 1, p: .8, draw: .65, limit: 6 };
}
export function authoredTransitions(prefix: string): readonly { token: string; weight: number }[] {
  if (prefix === "The cat") return [{ token: "sat", weight: .5 }, { token: "slept", weight: .3 }, { token: "ran", weight: .2 }];
  if (prefix === "The dog") return [{ token: "barked", weight: .6 }, { token: "slept", weight: .4 }];
  if (prefix.endsWith(" sat")) return [{ token: "on", weight: .6 }, { token: "near", weight: .3 }, { token: "EOS", weight: .1 }];
  if (prefix.endsWith(" slept")) return [{ token: "EOS", weight: .7 }, { token: "soundly", weight: .3 }];
  if (prefix.endsWith(" ran")) return [{ token: "away", weight: .8 }, { token: "EOS", weight: .2 }];
  if (prefix.endsWith(" barked")) return [{ token: "loudly", weight: .5 }, { token: "EOS", weight: .5 }];
  if (prefix.endsWith(" on") || prefix.endsWith(" near")) return [{ token: "the", weight: 1 }];
  if (prefix.endsWith(" the")) return [{ token: "mat", weight: 1 }];
  return [{ token: "EOS", weight: 1 }];
}
export function decodingPrefix(s: DecodingState) { return [s.prompt, ...s.generated.filter(t => t !== "EOS")].join(" "); }
export function decodingCandidates(s: DecodingState) {
  const authored = authoredTransitions(decodingPrefix(s));
  const logits = authored.map(row => Math.log(row.weight) / s.temperature);
  const max = Math.max(...logits), exp = logits.map(v => Math.exp(v - max)), total = exp.reduce((a, b) => a + b, 0);
  const sorted = authored.map((row, i) => ({ ...row, base: exp[i]! / total, index: i })).sort((a, b) => b.base - a.base || a.index - b.index);
  let cumulative = 0;
  const rows = sorted.map((row, i) => {
    // A mathematical tie (e.g. .5 + .3 = .8) must stop the prefix even
    // when softmax rounding places its cumulative mass one ulp below p.
    const keep = s.filter === "top-k" ? i < s.k : s.filter === "top-p" ? i === 0 || cumulative < s.p - 1e-12 : true;
    cumulative += row.base;
    return { ...row, keep };
  });
  const keptTotal = rows.reduce((sum, row) => sum + (row.keep ? row.base : 0), 0);
  let lower = 0;
  return rows.map(row => {
    const probability = row.keep ? row.base / keptTotal : 0;
    const result = { ...row, probability, lower, upper: lower + probability };
    lower += probability;
    return result;
  });
}
export function decodingStop(s: DecodingState) {
  return s.generated.at(-1) === "EOS" ? "EOS" : s.generated.length >= s.limit ? "Token limit" : null;
}
export function selectedToken(s: DecodingState) {
  const kept = decodingCandidates(s).filter(row => row.keep);
  return s.mode === "greedy" ? kept[0]!.token : (kept.find(row => s.draw < row.upper) ?? kept.at(-1)!).token;
}
export function appendToken(s: DecodingState): DecodingState {
  if (decodingStop(s)) return s;
  const seed = Math.floor(s.draw * 4294967296) >>> 0;
  const rawDraw = ((seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  const draw = Math.min(.999999, Number(rawDraw.toFixed(6)));
  return { ...s, generated: [...s.generated, selectedToken(s)], draw };
}
