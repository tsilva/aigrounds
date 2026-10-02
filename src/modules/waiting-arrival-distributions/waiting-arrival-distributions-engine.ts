export type ArrivalScenarioId = "website" | "support" | "defects";
export type ProbabilityBucket = { label: string; probability: number };
export type ArrivalAnalysis = {
  pPerSecond: number; lambdaPerMinute: number; windowMinutes: number; ticks: number;
  expectedCount: number; meanWaitSeconds: number; medianWaitSeconds: number;
  waitWithin20Seconds: number; waitAfter60Seconds: number;
  waitingBuckets: ProbabilityBucket[]; countMass: ProbabilityBucket[];
  tickZeroProbability: number; tickAtLeastOneProbability: number;
  poissonZeroProbability: number; poissonAtLeastOneProbability: number;
  eventSeconds: number[];
};
export function clampEventChance(value: number) {
  return Number.isFinite(value) ? Math.min(.1, Math.max(.001, value)) : .02;
}
export function clampWindowMinutes(value: number) {
  return Number.isFinite(value) ? Math.min(10, Math.max(1, Math.round(value))) : 5;
}
// One uniform pseudorandom draw per second. Fixed seed keeps window prefixes
// and couples chance edits without forcing any particular event count.
export function sampleArrivalSeconds(p: number, ticks: number, seed = 3209): number[] {
  let state = seed >>> 0;
  const events: number[] = [];
  for (let second = 1; second <= ticks; second += 1) {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    if (state / 4294967296 < p) events.push(second);
  }
  return events;
}
export function analyzeArrivals(pPerSecond: number, windowMinutes: number): ArrivalAnalysis {
  const p = clampEventChance(pPerSecond);
  const window = clampWindowMinutes(windowMinutes);
  const ticks = 60 * window;
  const lambda = 60 * p;
  const mean = ticks * p;
  const logFailure = Math.log1p(-p);
  const survival = (seconds: number) => Math.exp(seconds * logFailure);
  const waitingBuckets = Array.from({ length: 6 }, (_, index) => ({
    label: `${index * 10 + 1}–${index * 10 + 10} s`,
    probability: survival(index * 10) * -Math.expm1(10 * logFailure),
  }));
  waitingBuckets.push({ label: "> 60 s", probability: survival(60) });
  const probabilities = [Math.exp(-mean)];
  for (let k = 1; k <= 8; k += 1) probabilities.push(probabilities[k - 1] * mean / k);
  const countMass = probabilities.map((probability, k) => ({ label: String(k), probability }));
  // Directly sum a small tail rather than subtracting a CDF rounded to one.
  // For larger means the tail is large, so complement subtraction is stable.
  let tail = 1 - probabilities.reduce((sum, probability) => sum + probability, 0);
  if (mean < 9) {
    let term = probabilities[8] * mean / 9;
    tail = term;
    for (let k = 10; k < 1000; k += 1) {
      term *= mean / k;
      const next = tail + term;
      if (next === tail) break;
      tail = next;
    }
  }
  countMass.push({ label: "9+", probability: tail });
  return {
    pPerSecond: p, lambdaPerMinute: lambda, windowMinutes: window, ticks,
    expectedCount: mean, meanWaitSeconds: 1 / p,
    medianWaitSeconds: Math.ceil(Math.log(.5) / logFailure),
    waitWithin20Seconds: -Math.expm1(20 * logFailure), waitAfter60Seconds: survival(60),
    waitingBuckets, countMass,
    tickZeroProbability: survival(ticks), tickAtLeastOneProbability: -Math.expm1(ticks * logFailure),
    poissonZeroProbability: Math.exp(-mean), poissonAtLeastOneProbability: -Math.expm1(-mean),
    eventSeconds: sampleArrivalSeconds(p, ticks),
  };
}
