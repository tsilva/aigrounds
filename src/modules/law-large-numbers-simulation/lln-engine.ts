export type LlnModelId = "fair" | "biased" | "die";
export type LlnModel = { id: LlnModelId; label: string; shortLabel: string; values: number[]; probabilities: number[]; minimum: number; maximum: number; formula: string };
export const llnModels: LlnModel[] = [
  { id: "fair", label: "Fair coin", shortLabel: "Heads 1, tails 0", values: [0,1], probabilities: [.5,.5], minimum: 0, maximum: 1, formula: "0 × 0.5 + 1 × 0.5" },
  { id: "biased", label: "Biased coin", shortLabel: "80% heads", values: [0,1], probabilities: [.2,.8], minimum: 0, maximum: 1, formula: "0 × 0.2 + 1 × 0.8" },
  { id: "die", label: "Fair die", shortLabel: "Faces 1–6", values: [1,2,3,4,5,6], probabilities: [1/6,1/6,1/6,1/6,1/6,1/6], minimum: 1, maximum: 6, formula: "(1 + 2 + 3 + 4 + 5 + 6) / 6" },
];
export type LlnDraw = { n: number; value: number; total: number; mean: number };
export type LlnAnalysis = { model: LlnModel; expectation: number; draws: LlnDraw[]; last: LlnDraw; averageGap: number; totalGap: number; checkpoints: LlnDraw[] };
export function analyzeLln(id: LlnModelId, count: number, seed: number): LlnAnalysis {
  const model = llnModels.find(m => m.id === id);
  if (!model || !Number.isInteger(count) || count < 1 || count > 10000 || !Number.isInteger(seed) || seed < 1 || seed > 9999) throw new Error("Choose a known model, 1–10000 draws and a seed from 1–9999");
  const expectation = id === "die" ? 3.5 : id === "fair" ? .5 : .8;
  let randomState = seed, total = 0;
  const draws: LlnDraw[] = [];
  // Reproducible 32-bit LCG, matching the site's existing simulated payoff
  // streams. It illustrates an independent fixed-distribution model; it is
  // deterministic, is not cryptographic, and is not a theorem proof.
  for (let i=0; i<count; i++) {
    randomState = (Math.imul(randomState,1664525)+1013904223) >>> 0;
    const u = randomState / 2 ** 32;
    const value = id === "die" ? Math.floor(u*6)+1 : Number(u < expectation);
    total += value;
    draws.push({ n:i+1, value, total, mean:total/(i+1) });
  }
  const last = draws.at(-1)!;
  const counts = [...new Set([1,2,3,5,10,20,100,1000,2000,10000,count])].filter(n=>n<=count).sort((a,b)=>a-b);
  return { model, expectation, draws, last, averageGap:Math.abs(last.mean-expectation), totalGap:Math.abs(last.total-count*expectation), checkpoints:counts.map(n=>draws[n-1]) };
}
export function llnChart(a: LlnAnalysis, width: number, height = 280) {
  if (!Number.isFinite(width) || width < 200 || !Number.isFinite(height) || height < 150) throw new Error("Chart dimensions too small");
  const left=44,right=16,top=20,bottom=44;
  const x=(n:number)=>left+(n-1)/Math.max(1,a.last.n-1)*(width-left-right);
  const y=(value:number)=>top+(a.model.maximum-value)/(a.model.maximum-a.model.minimum)*(height-top-bottom);
  return { width,height,left,right,top,bottom,expectedY:y(a.expectation),points:a.draws.map(d=>`${x(d.n).toFixed(2)},${y(d.mean).toFixed(2)}`).join(" "),last:{x:x(a.last.n),y:y(a.last.mean)},xTicks:[...new Set([1,Math.max(1,Math.round(a.last.n/2)),a.last.n])].map(n=>({n,x:x(n)})),yTicks:[a.model.minimum,(a.model.minimum+a.model.maximum)/2,a.model.maximum].map(value=>({value,y:y(value)})) };
}
