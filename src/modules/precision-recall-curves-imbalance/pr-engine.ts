export type PrScenario = "ordered" | "reversed" | "tied";
export type PrState = { scenario: PrScenario; copies: number; tick: number };

export const prScenarios = [
  { id: "ordered", label: "Mostly ordered", shortLabel: "Fixed class scores" },
  { id: "reversed", label: "Reversed", shortLabel: "Same labels, reversed scores" },
  { id: "tied", label: "All tied", shortLabel: "Every score 0.50" },
];

const baseScores = [18, 16, 14, 14, 12, 8, 16, 10, 8, 6, 4, 2];

export function analyzePr(state: PrState) {
  if (!["ordered", "reversed", "tied"].includes(state.scenario)
    || !Number.isInteger(state.copies) || state.copies < 1 || state.copies > 4
    || !Number.isInteger(state.tick) || state.tick < 0 || state.tick > 20) {
    throw new Error("Invalid score scenario, copy count or threshold");
  }
  const scores = baseScores.map(score => state.scenario === "ordered" ? score
    : state.scenario === "reversed" ? 20 - score : 10);
  const cases = [
    ...scores.slice(0, 6).map((scoreTick, i) => ({ id: `P${i + 1}`, scoreTick, actual: true })),
    ...scores.slice(6).flatMap((scoreTick, i) => Array.from({ length: state.copies }, (_, j) => ({
      id: `N${i + 1}.${j + 1}`, scoreTick, actual: false,
    }))),
  ];
  const negatives = 6 * state.copies;
  const countsAt = (tick: number) => {
    const tp = cases.filter(c => c.actual && c.scoreTick >= tick).length;
    const fp = cases.filter(c => !c.actual && c.scoreTick >= tick).length;
    return {
      tp, fp, fn: 6 - tp, tn: negatives - fp, recall: tp / 6,
      precision: tp + fp ? tp / (tp + fp) : null,
    };
  };
  const sweep = [...new Set(scores)].sort((a, b) => b - a)
    .map(tick => ({ tick, ...countsAt(tick) }));
  // Every distinct-score group accepts at least one case, so group precision is defined.
  const groups = sweep.map((g, i) => {
    const precision = g.precision!;
    const deltaRecall = g.recall - (i ? sweep[i - 1].recall : 0);
    return { ...g, precision, deltaRecall, apTerm: deltaRecall * precision };
  });
  const rows = cases.map(c => {
    const predicted = c.scoreTick >= state.tick;
    return { ...c, predicted, bucket: c.actual ? (predicted ? "TP" : "FN") : (predicted ? "FP" : "TN") };
  });
  return {
    ...state, negatives, total: cases.length, rows, groups,
    prevalence: 6 / cases.length, ap: groups.reduce((sum, g) => sum + g.apTerm, 0),
    ...countsAt(state.tick),
  };
}

export type PrAnalysis = ReturnType<typeof analyzePr>;
export const prThreshold = (tick: number) => (tick / 20).toFixed(2);
export const prPercent = (value: number | null) => value === null ? "—" : `${(100 * value).toFixed(1)}%`;

export function prChart(a: PrAnalysis, width: number) {
  if (!Number.isFinite(width) || width < 200) throw new Error("Chart width must be at least 200");
  const left = 62, right = 26, top = 26, baseline = 326, height = 386;
  const x = (v: number) => left + v * (width - left - right);
  const y = (v: number) => baseline - v * (baseline - top);
  const points = a.groups.map((g, i) => ({ ...g, id: i, cx: x(g.recall), cy: y(g.precision) }));
  const path = `M${left},${top} ` + points.map((p, i) => {
    const previousRecall = i ? a.groups[i - 1].recall : 0;
    return `L${x(previousRecall)},${p.cy} L${p.cx},${p.cy}`;
  }).join(" ");
  const rectangles = points.filter(p => p.deltaRecall > 0).map(p => ({
    id: p.id, x: x(p.recall - p.deltaRecall), y: p.cy,
    width: p.deltaRecall * (width - left - right), height: baseline - p.cy,
  }));
  const cx = x(a.recall), cy = a.precision === null ? null : y(a.precision);
  return {
    width, height, left, right, top, baseline, path, points, rectangles,
    selected: cy === null ? null : { cx, cy, diamond: `${cx},${cy - 8} ${cx + 8},${cy} ${cx},${cy + 8} ${cx - 8},${cy}` },
    endpoint: { x: left - 4, y: top - 4, width: 8, height: 8 },
    reference: { x1: left, x2: width - right, y1: y(a.prevalence), y2: y(a.prevalence) },
    ticks: [0, .5, 1].map(value => ({ value, x: x(value), y: y(value) })),
  };
}
