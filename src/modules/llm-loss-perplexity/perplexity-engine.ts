export type PerplexityState = { units: readonly number[] };
export const perplexityTokens = ["The", "cat", "sat", "."] as const;
export const perplexityPositions = perplexityTokens.map((token, i) => ({ id: String(i), label: `${i + 1} · ${token}` }));
export const perplexityScenarios = [
  { id: "balanced", label: "Balanced targets", shortLabel: "Each target 50%" },
  { id: "surprise", label: "One surprise", shortLabel: "Last target 1%" },
  { id: "certain", label: "Certain targets", shortLabel: "Each target 100%" },
] as const;
export function perplexityBaseline(id = "balanced"): PerplexityState { return { units: id === "certain" ? [100, 100, 100, 100] : id === "surprise" ? [50, 50, 50, 1] : [50, 50, 50, 50] }; }
export function samePerplexity(a: PerplexityState, b: PerplexityState) { return a.units.length === b.units.length && a.units.every((v, i) => v === b.units[i]); }
export function perplexityPresetId(s: PerplexityState) { return perplexityScenarios.find(p => samePerplexity(s, perplexityBaseline(p.id)))?.id ?? "custom"; }
export function editPerplexity(s: PerplexityState, position: number, percent: number): PerplexityState {
  if (!Number.isInteger(position) || position < 0 || position > 3 || !Number.isFinite(percent)) return s;
  const unit = Math.max(0, Math.min(100, Math.round(percent)));
  return s.units[position] === unit ? s : { units: s.units.map((v, i) => i === position ? unit : v) };
}
export function analyzePerplexity(s: PerplexityState) {
  const rows = perplexityTokens.map((token, i) => {
    const percent = s.units[i]!, p = percent / 100, nll = p === 0 ? Infinity : -Math.log(p);
    return { position: i, token, context: ["<BOS>", ...perplexityTokens.slice(0, i)].join(" "), percent, p, otherPercent: 100 - percent, nll, bits: nll / Math.LN2 };
  });
  const total = rows.reduce((sum, r) => sum + r.nll, 0), mean = total / 4, ppl = Math.exp(mean), bpt = mean / Math.LN2;
  return { rows, total, mean, ppl, bpt, count: 4, zeroCount: rows.filter(r => r.p === 0).length };
}
export const perplexityNumber = (value: number) => value === Infinity ? "∞" : Number(value.toFixed(6)).toLocaleString("en-US", { useGrouping: false, maximumFractionDigits: 6 });
