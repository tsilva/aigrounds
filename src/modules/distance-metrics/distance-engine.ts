export type DistanceScenario = "disagreement" | "tie" | "coincident";
export type DistanceMetric = "euclidean" | "manhattan";
export type DistanceState = { scenario: DistanceScenario; metric: DistanceMetric; x: number; y: number };
export const distanceScenarios = [
  { id: "disagreement", label: "Metric disagreement", shortLabel: "Four fixed reference cases" },
  { id: "tie", label: "Tie boundary", shortLabel: "Two equally close cases" },
  { id: "coincident", label: "Coincident cases", shortLabel: "Same coordinates, distinct IDs" },
];
export const distanceMetrics = [{ id: "euclidean", label: "Euclidean" }, { id: "manhattan", label: "Manhattan" }];
const coordinates = {
  disagreement: [[0, 5], [3, 3], [8, 9], [9, 1]],
  tie: [[2, 5], [8, 5], [5, 9], [5, 1]],
  coincident: [[2, 2], [2, 2], [8, 8], [8, 2]],
};
export function analyzeDistance(state: DistanceState) {
  if (!Object.hasOwn(coordinates, state.scenario) || !["euclidean", "manhattan"].includes(state.metric)
    || ![state.x, state.y].every(v => Number.isInteger(v) && v >= 0 && v <= 10)) throw new Error("Invalid distance scenario, metric or integer query coordinate");
  const cases = coordinates[state.scenario].map(([x, y], i) => {
    const dx = Math.abs(state.x - x), dy = Math.abs(state.y - y), squared = dx ** 2 + dy ** 2;
    return { id: "ABCD"[i], x, y, className: i % 2 ? "Square" : "Circle", dx, dy, squared,
      euclidean: Math.sqrt(squared), manhattan: dx + dy };
  });
  const ranks = cases.map(c => state.metric === "euclidean" ? c.squared : c.manhattan);
  const minRank = Math.min(...ranks);
  const nearest = cases.filter((_, i) => ranks[i] === minRank);
  return { ...state, cases, nearestIds: nearest.map(c => c.id),
    minimum: state.metric === "euclidean" ? Math.sqrt(minRank) : minRank,
    decision: nearest.length === 1 ? nearest[0].className : null };
}
export type DistanceAnalysis = ReturnType<typeof analyzeDistance>;
export const distanceNumber = (value: number) => value.toFixed(6);
export const boundCoordinate = (value: number) => Math.min(10, Math.max(0, Math.round(value)));
export function distanceChart(a: DistanceAnalysis, width: number) {
  if (!Number.isFinite(width) || width < 200) throw new Error("Chart width must be at least 200");
  const span = Math.min(width - 80, 360), left = (width - span) / 2 + 8, top = 24, bottom = top + span;
  const point = (x: number, y: number) => ({ x: left + span * x / 10, y: bottom - span * y / 10 });
  const query = point(a.x, a.y);
  const groups = a.cases.filter((c, i, all) => all.findIndex(p => p.x === c.x && p.y === c.y) === i).map(c => {
    const same = a.cases.filter(p => p.x === c.x && p.y === c.y);
    return { ...point(c.x, c.y), ids: same.map(p => p.id), classes: same.map(p => p.className) };
  });
  const paths = a.nearestIds.map(id => {
    const c = a.cases.find(c => c.id === id)!, p = point(c.x, c.y);
    return { id, d: a.metric === "euclidean" ? `M${query.x},${query.y} L${p.x},${p.y}` : `M${query.x},${query.y} L${p.x},${query.y} L${p.x},${p.y}` };
  });
  return { width, height: span + 82, left, top, bottom, span, query, groups, paths,
    ticks: [0, 2, 4, 6, 8, 10].map(value => ({ value, ...point(value, value) })) };
}
