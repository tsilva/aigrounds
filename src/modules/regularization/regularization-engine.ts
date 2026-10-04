export const penaltyModes = ["none", "l1", "l2"] as const;
export type PenaltyMode = typeof penaltyModes[number];
export type RegularizationState = { weightUnits: [number, number]; strengthUnits: number; mode: PenaltyMode };
export const regularizationCases = [
  { id: 1, x1: 1, x2: 0, target: 1 }, { id: 2, x1: -1, x2: 0, target: -1 },
  { id: 3, x1: 1, x2: 0, target: 1 }, { id: 4, x1: -1, x2: 0, target: -1 },
  { id: 5, x1: 0, x2: 1, target: 1 }, { id: 6, x1: 0, x2: -1, target: -1 },
  { id: 7, x1: 0, x2: 1, target: 1 }, { id: 8, x1: 0, x2: -1, target: 1 },
] as const;
export const regularizationSites = [
  { x1: 1, x2: 0, label: "1,3: +1,+1", kind: "positive" },
  { x1: -1, x2: 0, label: "2,4: −1,−1", kind: "negative" },
  { x1: 0, x2: 1, label: "5,7: +1,+1", kind: "positive" },
  { x1: 0, x2: -1, label: "6,8: −1,+1", kind: "mixed" },
] as const;
export const regularizationPresets: Record<string, RegularizationState> = {
  unregularized: { weightUnits: [20, 10], strengthUnits: 5, mode: "none" },
  signed: { weightUnits: [-20, 10], strengthUnits: 5, mode: "none" },
  zero: { weightUnits: [0, 0], strengthUnits: 5, mode: "none" },
};
export const regularizationScenarios = [
  { id: "unregularized", label: "Unregularized", shortLabel: "w1=1 · w2=0.5" },
  { id: "signed", label: "Signed weights", shortLabel: "Reverse one coefficient" },
  { id: "zero", label: "Zero weights", shortLabel: "All scores tie" },
];
export const regularizationNumber = (v: number) => String(Number(v.toFixed(7)));
function guard(s: RegularizationState) {
  if (s.weightUnits.length !== 2 || !s.weightUnits.every(v => Number.isInteger(v) && v >= -40 && v <= 40) || !Number.isInteger(s.strengthUnits) || s.strengthUnits < 0 || s.strengthUnits > 20 || !penaltyModes.includes(s.mode)) throw new Error("Weights must use integer units −40..40; strength units 0..20; valid penalty mode.");
}
function costNumerators(s: RegularizationState) {
  const [i,j] = s.weightUnits, k = s.strengthUnits;
  // Exact integer arithmetic on the declared 0.05 grid, denominator 16000.
  const data = 10 * (i*i + j*j - 40*i - 20*j + 800);
  const penalty = s.mode === "none" ? 0 : s.mode === "l1" ? 40*k*(Math.abs(i)+Math.abs(j)) : k*(i*i+j*j);
  return { data, penalty, objective: data + penalty };
}
export function analyzeRegularization(s: RegularizationState) {
  guard(s);
  const costs = costNumerators(s), [i,j] = s.weightUnits;
  const cases = regularizationCases.map(c => {
    const score = (i*c.x1 + j*c.x2) / 20, predicted = score >= 0 ? 1 : -1;
    return { ...c, score, predicted, tied: score === 0, correct: predicted === c.target, residual: score - c.target, loss: (score-c.target)**2 / 2 };
  });
  const correct = cases.filter(c => c.correct).length;
  return { weights: s.weightUnits.map(v => v/20), strength: s.strengthUnits/20, cases, correct, accuracy: correct*12.5,
    dataLoss: costs.data/16000, penalty: costs.penalty/16000, objective: costs.objective/16000,
    penaltyFormula: s.mode === "none" ? "0 (no penalty)" : s.mode === "l1" ? `${s.strengthUnits/20} × (|${i/20}| + |${j/20}|)` : `${s.strengthUnits/20} × ((${i/20})² + (${j/20})²) / 2`,
  };
}
export function fitRegularization(s: RegularizationState) {
  guard(s);
  let best = Infinity;
  let minima: [number,number][] = [];
  for (let i=-40;i<=40;i++) for (let j=-40;j<=40;j++) {
    const cost = costNumerators({ ...s, weightUnits: [i,j] }).objective;
    if (cost < best) { best = cost; minima = [[i,j]]; }
    else if (cost === best) minima.push([i,j]);
  }
  return { minima, selected: minima[0]!, objective: best/16000, candidates: 6561,
    currentIsBest: minima.some(([i,j]) => s.weightUnits[0]===i && s.weightUnits[1]===j) };
}
function units(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) throw new Error("A finite parameter is required.");
  return Math.max(min, Math.min(max, Math.round(value*20)));
}
export function changeRegularizationWeight(s: RegularizationState, index: 0|1, value: number): RegularizationState {
  const weightUnits: [number,number] = [...s.weightUnits];
  weightUnits[index] = units(value, -40, 40);
  return { ...s, weightUnits };
}
export function changeRegularizationStrength(s: RegularizationState, value: number): RegularizationState {
  return { ...s, strengthUnits: units(value, 0, 20) };
}
export function sameRegularization(a: RegularizationState, b: RegularizationState) { return a.mode===b.mode && a.strengthUnits===b.strengthUnits && a.weightUnits.every((v,i)=>v===b.weightUnits[i]); }
export function regularizationPresetId(s: RegularizationState) { return Object.entries(regularizationPresets).find(([,p])=>sameRegularization(s,p))?.[0] ?? "custom"; }
type Vertex = [number,number];
export function regularizationPlane(weightUnits: [number,number]) {
  const [i,j] = weightUnits;
  const square: Vertex[] = [[-1.5,-1.5],[1.5,-1.5],[1.5,1.5],[-1.5,1.5]];
  const score = ([x,y]: Vertex) => i*x+j*y;
  function clip(positive: boolean) {
    const polygon: Vertex[] = [];
    for (let n=0;n<square.length;n++) {
      const a=square[n]!,b=square[(n+1)%square.length]!,sa=score(a),sb=score(b);
      const insideA=positive ? sa>=0 : sa<0, insideB=positive ? sb>=0 : sb<0;
      if (insideA) polygon.push([...a]);
      if (insideA!==insideB) { const t=sa/(sa-sb); polygon.push([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])]); }
    }
    return polygon;
  }
  const scale = i || j ? 1.5/Math.max(Math.abs(i),Math.abs(j)) : 0;
  const boundary: [Vertex,Vertex] | null = scale ? [[j*scale,-i*scale],[-j*scale,i*scale]] : null;
  return { positive: clip(true), negative: clip(false), boundary };
}
export function regularizationChart(s: RegularizationState, availableWidth: number) {
  const width=Math.max(260,availableWidth), span=width-96, left=44, top=20, height=span+74;
  const x=(v:number)=>left+(v+1.5)*span/3, y=(v:number)=>top+(1.5-v)*span/3;
  const plane=regularizationPlane(s.weightUnits);
  return { width,height,span,left,top,positive:plane.positive.map(([a,b])=>[x(a),y(b)]),negative:plane.negative.map(([a,b])=>[x(a),y(b)]),boundary:plane.boundary?.map(([a,b])=>[x(a),y(b)]) ?? null,
    sites:regularizationSites.map(site=>({ ...site,x:x(site.x1),y:y(site.x2) })),ticks:[-1.5,0,1.5].map(value=>({value,x:x(value),y:y(value)})) };
}
