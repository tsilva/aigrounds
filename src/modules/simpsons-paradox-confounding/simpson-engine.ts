export type SimpsonState = { easyA: number; easyB: number; view: "combined" | "grouped" };
export const simpsonPresets = [
  { id: "unequal", label: "Unequal mix", shortLabel: "A 20% · B 80% easy", easyA: 20, easyB: 80 },
  { id: "equal", label: "Equal mix", shortLabel: "Both 50% easy", easyA: 50, easyB: 50 },
  { id: "favor", label: "Favor A", shortLabel: "A 80% · B 20% easy", easyA: 80, easyB: 20 },
];
export function simpsonPreset(id: string, view: SimpsonState["view"] = "combined"): SimpsonState {
  const p = simpsonPresets.find(p => p.id === id);
  if (!p) throw new Error("Unknown task mix");
  return { easyA: p.easyA, easyB: p.easyB, view };
}
export function simpsonPresetId(s: SimpsonState) { return simpsonPresets.find(p => p.easyA === s.easyA && p.easyB === s.easyB)?.id ?? "custom"; }
export function analyzeSimpson(s: SimpsonState) {
  if (![s.easyA, s.easyB].every(n => Number.isInteger(n) && n >= 0 && n <= 100 && n % 10 === 0) || !["combined", "grouped"].includes(s.view)) throw new Error("Choose task shares 0 to 100 in steps of 10 and a known view");
  const group = (total: number, tenths: number) => { const success = total * tenths / 10; return { total, success, rate: total ? success / total : null }; };
  const groups = (["A", "B"] as const).map((id, i) => {
    const easy = group(i ? s.easyB : s.easyA, i ? 8 : 9), hard = group(100 - (i ? s.easyB : s.easyA), i ? 2 : 3);
    const success = easy.success + hard.success;
    return { id, easy, hard, success, rate: success / 100 };
  });
  const gap = (groups[0].success - groups[1].success) / 100;
  const shared = ["easy", "hard"].filter(k => groups.every(g => g[k as "easy" | "hard"].total > 0)).length;
  return { ...s, groups, gap, shared, reversal: shared === 2 && gap < 0 };
}
export type SimpsonAnalysis = ReturnType<typeof analyzeSimpson>;
export function simpsonRate(r: number | null) { return r === null ? "Undefined · no trials" : `${Math.round(r * 100)}%`; }
export function simpsonGap(g: number) { const n = Math.round(g * 100); return `${n < 0 ? "−" : n > 0 ? "+" : ""}${Math.abs(n)} pp`; }
export function simpsonChart(a: SimpsonAnalysis, width: number) {
  if (!Number.isFinite(width) || width < 200) throw new Error("Chart width must be at least 200");
  const left = 34, right = 110, height = a.view === "combined" ? 176 : 272, baseline = height - 28;
  const x = (rate: number) => left + rate * (width - left - right);
  const rows = a.view === "combined" ? a.groups.map((g, i) => ({ id: `${g.id}-overall`, algorithm: g.id, y: 48 + i * 44, total: 100, success: g.success, rate: g.rate })) : (["easy", "hard"] as const).flatMap((key, j) => a.groups.map((g, i) => ({ id: `${g.id}-${key}`, algorithm: g.id, y: 48 + j * 112 + i * 44, ...g[key] })));
  return { width, height, left, right, baseline, headings: a.view === "combined" ? [{ text: "Overall success", y: 20 }] : [{ text: "Easy tasks", y: 20 }, { text: "Hard tasks", y: 132 }], rows: rows.map(r => ({ ...r, x: left, barWidth: r.rate === null ? 0 : x(r.rate) - left, labelX: r.rate === null ? left + 8 : x(r.rate) + 8 })), ticks: [0, .5, 1].map(rate => ({ x: x(rate), text: simpsonRate(rate) })) };
}
