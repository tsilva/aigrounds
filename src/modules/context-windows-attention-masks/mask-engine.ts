export type MaskState = { start: number; length: number; query: number; direction: "causal" | "bidirectional"; padding: "exclude" | "allow" };
export const maskTokens = ["The", "cat", "sat", "on", "the", "mat", "<PAD>", "<PAD>"] as const;
export const maskQueries = maskTokens.slice(0, 6).map((token, i) => ({ id: String(i + 1), label: `${i + 1} · ${token}` }));
export const maskScenarios = [
  { id: "early", label: "Early slice", shortLabel: "Positions 1–4" },
  { id: "later", label: "Later slice", shortLabel: "Positions 3–6" },
  { id: "padding", label: "Padding contrast", shortLabel: "Positions 3–8" },
] as const;
export function maskBaseline(id = "early"): MaskState { return id === "padding" ? { start: 3, length: 6, query: 6, direction: "bidirectional", padding: "exclude" } : id === "later" ? { start: 3, length: 4, query: 6, direction: "causal", padding: "exclude" } : { start: 1, length: 4, query: 4, direction: "causal", padding: "exclude" }; }
export function sameMask(a: MaskState, b: MaskState) { return a.start === b.start && a.length === b.length && a.query === b.query && a.direction === b.direction && a.padding === b.padding; }
export function maskPresetId(s: MaskState) { return maskScenarios.find(p => sameMask(s, maskBaseline(p.id)))?.id ?? "custom"; }
export function editMask(s: MaskState, key: "start" | "length" | "query", value: number): MaskState {
  if (!Number.isFinite(value)) return s;
  const v = Math.max(1, Math.min(key === "query" ? 6 : key === "start" ? 9 - s.length : 8, Math.round(value)));
  const next = { ...s, [key]: v, ...(key === "length" ? { start: Math.min(s.start, 9 - v) } : {}) };
  return sameMask(s, next) ? s : next;
}
export function maskReason(s: MaskState, query: number, key: number) {
  const last = s.start + s.length - 1;
  if (query > 6) return "Padding query excluded by demo";
  if (query < s.start || query > last) return "Query outside window";
  if (key < s.start || key > last) return "Key outside window";
  if (s.padding === "exclude" && key > 6) return "Padding key excluded";
  if (s.direction === "causal" && key > query) return "Future key blocked";
  return "Allowed";
}
export function analyzeMask(s: MaskState) {
  const matrix = maskTokens.map((_, q) => maskTokens.map((_, k) => maskReason(s, q + 1, k + 1)));
  const keys = maskTokens.map((_, k) => k + 1).filter(k => matrix[s.query - 1]![k - 1] === "Allowed");
  return { last: s.start + s.length - 1, matrix, keys, count: keys.length, past: keys.filter(k => k < s.query).length, self: keys.includes(s.query) ? 1 : 0, future: keys.filter(k => k > s.query).length, active: s.query >= s.start && s.query < s.start + s.length };
}
