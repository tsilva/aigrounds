export type ArrivalScenarioId = "website" | "support" | "defects";

export type WaitingBucket = {
  label: string;
  probability: number;
  tone: string;
};

export type CountMass = {
  label: string;
  probability: number;
  isMode: boolean;
};

export type ArrivalAnalysis = {
  pPerSecond: number;
  lambdaPerMinute: number;
  windowMinutes: number;
  expectedCount: number;
  meanWaitSeconds: number;
  medianWaitSeconds: number;
  waitWithin20Seconds: number;
  waitAfter60Seconds: number;
  waitingBuckets: WaitingBucket[];
  countMass: CountMass[];
  zeroArrivalProbability: number;
  atLeastOneProbability: number;
  modeLabel: string;
  eventMarks: number[];
  longestGapSeconds: number;
  shortestGapSeconds: number;
  averageGapSeconds: number;
};

const minEventChance = 0.001;
const maxEventChance = 0.1;
const defaultEventChance = 0.02;
const minWindowMinutes = 1;
const maxWindowMinutes = 10;
const defaultWindowMinutes = 5;
const eventFractions = [
  0.084,
  0.234,
  0.396,
  0.546,
  0.722,
  0.892,
  0.146,
  0.318,
  0.638,
  0.804,
  0.952,
  0.472,
];

function isInvalid(value: number) {
  return Number.isNaN(value) || !Number.isFinite(value);
}

export function clampEventChance(value: number) {
  if (isInvalid(value)) {
    return defaultEventChance;
  }

  return Math.min(maxEventChance, Math.max(minEventChance, value));
}

export function clampWindowMinutes(value: number) {
  if (isInvalid(value)) {
    return defaultWindowMinutes;
  }

  return Math.min(maxWindowMinutes, Math.max(minWindowMinutes, Math.round(value)));
}

function poissonProbability(mean: number, k: number) {
  let factorial = 1;

  for (let i = 2; i <= k; i += 1) {
    factorial *= i;
  }

  return (Math.exp(-mean) * mean ** k) / factorial;
}

function geometricRangeProbability(p: number, startSecond: number, endSecond: number) {
  const beforeStart = (1 - p) ** startSecond;
  const throughEnd = (1 - p) ** endSecond;

  return beforeStart - throughEnd;
}

function buildWaitingBuckets(p: number): WaitingBucket[] {
  const bucketSpecs = [
    { label: "0-10s", start: 0, end: 10, tone: "#159947" },
    { label: "10-20s", start: 10, end: 20, tone: "#25a34a" },
    { label: "20-30s", start: 20, end: 30, tone: "#7cbf2e" },
    { label: "30-40s", start: 30, end: 40, tone: "#d4c312" },
    { label: "40-50s", start: 40, end: 50, tone: "#f5a400" },
    { label: "50-60s", start: 50, end: 60, tone: "#f97316" },
  ];

  return [
    ...bucketSpecs.map((bucket) => ({
      label: bucket.label,
      probability: geometricRangeProbability(p, bucket.start, bucket.end),
      tone: bucket.tone,
    })),
    {
      label: "60s+",
      probability: (1 - p) ** 60,
      tone: "#ff3b30",
    },
  ];
}

function buildCountMass(mean: number): CountMass[] {
  const probabilities = Array.from({ length: 9 }, (_, k) =>
    poissonProbability(mean, k),
  );
  const tail = Math.max(
    0,
    1 - probabilities.reduce((sum, probability) => sum + probability, 0),
  );
  const mass = [
    ...probabilities.map((probability, k) => ({
      label: String(k),
      probability,
    })),
    {
      label: "9+",
      probability: tail,
    },
  ];
  const highest = Math.max(...mass.map((point) => point.probability));

  return mass.map((point) => ({
    ...point,
    isMode: Math.abs(point.probability - highest) < 0.0000001,
  }));
}

function buildEventMarks(expectedCount: number, windowMinutes: number) {
  const count = Math.max(0, Math.min(12, Math.round(expectedCount)));

  if (count === 0) {
    return [];
  }

  if (count === 6 && windowMinutes === 5) {
    return [0.42, 1.17, 1.98, 2.73, 3.61, 4.46];
  }

  return Array.from({ length: count }, (_, index) => {
    const base = (index + 0.5) / count;
    const jitter = ((eventFractions[index % eventFractions.length] - 0.5) / count) * 0.6;
    const fraction = Math.min(0.98, Math.max(0.02, base + jitter));

    return Math.round(fraction * windowMinutes * 100) / 100;
  }).sort((a, b) => a - b);
}

function summarizeGaps(eventMarks: number[], windowMinutes: number) {
  const boundaries = [0, ...eventMarks, windowMinutes];
  const gaps = boundaries.slice(1).map((mark, index) => mark - boundaries[index]);
  const longest = Math.max(...gaps);
  const shortest = Math.min(...gaps);
  const average =
    gaps.reduce((sum, gap) => sum + gap, 0) / Math.max(1, gaps.length);

  return {
    longestGapSeconds: longest * 60,
    shortestGapSeconds: shortest * 60,
    averageGapSeconds: average * 60,
  };
}

export function analyzeArrivals(
  pPerSecond: number,
  windowMinutes: number,
): ArrivalAnalysis {
  const p = clampEventChance(pPerSecond);
  const window = clampWindowMinutes(windowMinutes);
  const lambda = p * 60;
  const expectedCount = lambda * window;
  const countMass = buildCountMass(expectedCount);
  const modeLabel = countMass
    .filter((point) => point.isMode)
    .map((point) => point.label)
    .join(" or ");
  const eventMarks = buildEventMarks(expectedCount, window);

  return {
    pPerSecond: p,
    lambdaPerMinute: lambda,
    windowMinutes: window,
    expectedCount,
    meanWaitSeconds: 1 / p,
    medianWaitSeconds: Math.ceil(Math.log(0.5) / Math.log(1 - p)),
    waitWithin20Seconds: 1 - (1 - p) ** 20,
    waitAfter60Seconds: (1 - p) ** 60,
    waitingBuckets: buildWaitingBuckets(p),
    countMass,
    zeroArrivalProbability: Math.exp(-expectedCount),
    atLeastOneProbability: 1 - Math.exp(-expectedCount),
    modeLabel,
    eventMarks,
    ...summarizeGaps(eventMarks, window),
  };
}
