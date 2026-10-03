export type IntervalState = { source: "lower" | "reference" | "higher"; size: number; confidence: number; batch: number };
export const intervalSources = [
  { id: "lower", label: "Lower spread", shortLabel: "Known SD 2", sd: 2 },
  { id: "reference", label: "Reference spread", shortLabel: "Known SD 4", sd: 4 },
  { id: "higher", label: "Higher spread", shortLabel: "Known SD 8", sd: 8 },
] as const;

export function intervalCritical(confidence: number) {
  if (!Number.isInteger(confidence) || confidence < 90 || confidence > 99) throw new Error("Confidence must be an integer from 90 to 99 percent");
  const target = (1 - confidence / 100) / 2;
  let low = 0, high = 4;
  for (let i = 0; i < 60; i++) {
    const z = (low + high) / 2, t = 1 / (1 + .2316419 * z);
    // Abramowitz–Stegun 26.2.17, with bisection on the smaller normal tail.
    const q = Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI) * t *
      (.319381530 + t * (-.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
    if (q > target) low = z; else high = z;
  }
  return (low + high) / 2;
}

export function preparedNormalMeans() {
  let state = 1309;
  const draws: number[] = [];
  for (let i = 0; i < 1000; i++) {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    const u = (state + .5) / 4294967296;
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    const v = (state + .5) / 4294967296, radius = Math.sqrt(-2 * Math.log(u));
    draws.push(radius * Math.cos(2 * Math.PI * v), radius * Math.sin(2 * Math.PI * v));
  }
  return Object.freeze(draws);
}
const standardizedMeans = preparedNormalMeans();

export function analyzeIntervals(state: IntervalState) {
  const source = intervalSources.find(s => s.id === state.source);
  if (!source || !Number.isInteger(state.size) || state.size < 1 || state.size > 400 ||
    !Number.isInteger(state.batch) || state.batch < 1 || state.batch > 20) throw new Error("Choose a known source, size 1–400 and batch 1–20");
  const truth = 20, se = source.sd / Math.sqrt(state.size), critical = intervalCritical(state.confidence), margin = critical * se;
  const intervals = standardizedMeans.slice((state.batch - 1) * 100, state.batch * 100).map((z, i) => {
    const mean = truth + se * z, lower = mean - margin, upper = mean + margin;
    return { id: i + 1, z, mean, lower, upper, captures: lower <= truth && truth <= upper };
  });
  const captures = intervals.filter(row => row.captures).length;
  return { ...state, source, truth, se, critical, margin, width: 2 * margin, intervals, captures, misses: 100 - captures };
}
export type IntervalAnalysis = ReturnType<typeof analyzeIntervals>;
export function intervalChart(a: IntervalAnalysis, width: number) {
  if (!Number.isFinite(width) || width < 200) throw new Error("Chart width must be at least 200");
  const left = 52, right = 20, min = -40, max = 80;
  const x = (value: number) => left + (value - min) / (max - min) * (width - left - right);
  return { width, height: 2024, left, right, min, max, truthX: x(a.truth),
    rows: a.intervals.map(row => ({ ...row, lowerX: x(row.lower), upperX: x(row.upper), meanX: x(row.mean), y: 16 + (row.id - 1) * 20 })),
    ticks: [-40, -20, 0, 20, 40, 60, 80].map(value => ({ value, x: x(value) })) };
}
