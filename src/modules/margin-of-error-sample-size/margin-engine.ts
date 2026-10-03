export type MarginState = { source: "lower" | "reference" | "higher"; size: number; confidence: number };
export const marginSources = [
  { id: "lower", label: "Lower spread", shortLabel: "Known SD 2", sd: 2 },
  { id: "reference", label: "Reference spread", shortLabel: "Known SD 4", sd: 4 },
  { id: "higher", label: "Higher spread", shortLabel: "Known SD 8", sd: 8 },
] as const;

function upperNormalTail(z: number) {
  const t = 1 / (1 + .2316419 * z);
  // Abramowitz–Stegun 26.2.17; invert the small tail without cancellation.
  return Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI) * t *
    (.319381530 + t * (-.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
}

export function marginCritical(confidence: number) {
  if (!Number.isInteger(confidence) || confidence < 90 || confidence > 99) throw new Error("Choose integer confidence from 90 to 99 percent");
  const target = (1 - confidence / 100) / 2;
  let low = 0, high = 4;
  for (let i = 0; i < 60; i++) {
    const mid = (low + high) / 2;
    if (upperNormalTail(mid) > target) low = mid; else high = mid;
  }
  return (low + high) / 2;
}

export function analyzeMargin(state: MarginState) {
  const source = marginSources.find(s => s.id === state.source);
  if (!source || !Number.isInteger(state.size) || state.size < 1 || state.size > 400) throw new Error("Choose a known source and size from 1 to 400");
  const critical = marginCritical(state.confidence), se = source.sd / Math.sqrt(state.size);
  const margin = critical * se, center = 20, referenceMargin = marginCritical(95) * source.sd / 5;
  const planningTarget = .5, planningSize = Math.ceil((critical * source.sd / planningTarget) ** 2);
  return { ...state, source, critical, se, margin, width: 2 * margin, center, lower: center - margin,
    upper: center + margin, referenceMargin, referenceLower: center - referenceMargin,
    referenceUpper: center + referenceMargin, ratio: margin / referenceMargin, planningTarget, planningSize };
}

export type MarginAnalysis = ReturnType<typeof analyzeMargin>;
export function marginChart(a: MarginAnalysis, width: number) {
  if (!Number.isFinite(width) || width < 200) throw new Error("Chart width must be at least 200");
  const left = 24, right = 24, min = -5, max = 45;
  const x = (value: number) => left + (value - min) / (max - min) * (width - left - right);
  return { width, height: 230, left, right, min, max, center: x(a.center),
    reference: { lower: x(a.referenceLower), upper: x(a.referenceUpper), y: 55 },
    current: { lower: x(a.lower), upper: x(a.upper), y: 125 },
    ticks: [-5, 5, 15, 25, 35, 45].map(value => ({ value, x: x(value) })) };
}
