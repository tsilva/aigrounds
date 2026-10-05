export const pipelineDocuments = [
  { id: "D1", title: "Current hours", text: "Tuesday opening: 10:00.", date: "2026-01-01", facts: ["hours:10", "day:Tuesday"], current: true },
  { id: "D2", title: "Old hours", text: "Tuesday opening: 09:00. Outdated.", date: "2022-08-15", facts: ["hours:9", "day:Tuesday"], current: false },
  { id: "D3", title: "Admission", text: "Admission: 4 credits.", date: "2026-01-01", facts: ["admission:4", "admission:charge"], current: true },
  { id: "D4", title: "Weekly closure", text: "The museum is closed on Sunday.", date: "2026-01-01", facts: ["closure:Sunday", "closure:weekly"], current: true },
] as const;
export const pipelineQueries = [
  { id: "hours", label: "When does the museum open on Tuesday?", order: ["D1", "D2", "D3", "D4"], relevant: ["D1", "D2"], reference: "hours:10" },
  { id: "admission", label: "How much does admission cost?", order: ["D3", "D1", "D2", "D4"], relevant: ["D3"], reference: "admission:4" },
  { id: "closure", label: "Which day is the museum closed?", order: ["D4", "D1", "D2", "D3"], relevant: ["D4"], reference: "closure:Sunday" },
] as const;
export const pipelineScenarios = [
  { id: "current", label: "Current evidence", shortLabel: "Rank, supply, then answer" },
  { id: "wrong", label: "Right evidence, wrong answer", shortLabel: "Separate two failure stages" },
  { id: "outdated", label: "Outdated only", shortLabel: "Supported can still be wrong" },
] as const;
export type PipelineState = { query: string; retrieval: number; context: number; order: string; answer: string };
export function pipelinePreset(id = "current"): PipelineState {
  return { query: "hours", retrieval: id === "outdated" ? 1 : 2, context: id === "outdated" ? 1 : 2,
    order: id === "outdated" ? "outdated" : "relevant", answer: id === "wrong" ? "wrong" : "evidence" };
}
export function analyzePipeline(s: PipelineState) {
  const query = pipelineQueries.find(q => q.id === s.query) ?? pipelineQueries[0];
  const ids: readonly string[] = s.order === "outdated" ? ["D2", "D3", "D4", "D1"] : query.order;
  const ranked = ids.map(id => pipelineDocuments.find(d => d.id === id)!);
  const retrieved = ranked.slice(0, s.retrieval), context = retrieved.slice(0, s.context);
  const relevant = context.filter(d => (query.relevant as readonly string[]).includes(d.id));
  const source = relevant.find(d => d.current) ?? relevant[0];
  let fact: string | null = null, text = "Not enough supplied evidence.", citation: string | null = null;
  if (source) {
    citation = source.id;
    if (s.answer === "incomplete") {
      fact = s.query === "admission" ? "admission:charge" : s.query === "closure" ? "closure:weekly" : "day:Tuesday";
      text = s.query === "admission" ? "There is an admission charge." : s.query === "closure" ? "The museum has a weekly closure." : "The opening is on Tuesday.";
    } else if (s.answer === "wrong") {
      fact = s.query === "admission" ? "admission:7" : s.query === "closure" ? "closure:Monday" : "hours:11";
      text = s.query === "admission" ? "Admission is 7 credits." : s.query === "closure" ? "The museum is closed on Monday." : "Tuesday at 11:00.";
    } else {
      fact = s.query === "admission" ? "admission:4" : s.query === "closure" ? "closure:Sunday" : source.id === "D2" ? "hours:9" : "hours:10";
      text = s.query === "admission" ? "Admission is 4 credits." : s.query === "closure" ? "The museum is closed on Sunday." : fact === "hours:9" ? "Tuesday at 09:00." : "Tuesday at 10:00.";
    }
  }
  const supported = fact !== null && context.some(d => d.id === citation && (d.facts as readonly string[]).includes(fact!));
  const correct = fact === query.reference;
  // Completeness here means supplying the requested field, even if its value is wrong.
  return { query, ranked, retrieved, context, relevant, fact, text, citation, supported, correct, complete: fact !== null && s.answer !== "incomplete",
    abstained: fact === null };
}
