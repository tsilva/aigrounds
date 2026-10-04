export type RmsState = { values: readonly number[]; gain: number; epsilon: number };
export const rmsScenarios = [{ id: "positive", label: "Positive", shortLabel: "1, 2, 3" }, { id: "centered", label: "Centered", shortLabel: "−2, 0, 2" }, { id: "zero", label: "Zero", shortLabel: "0, 0, 0" }] as const;
export const rmsEpsilons = [{ id: "0", label: "0 (boundary)" }, { id: "0.000001", label: "0.000001" }, { id: "1", label: "1 (contrast)" }];
export function rmsBaseline(id = "positive"): RmsState { return { values: id === "centered" ? [-2, 0, 2] : id === "zero" ? [0, 0, 0] : [1, 2, 3], gain: 1, epsilon: 0.000001 }; }
export function sameRms(a: RmsState, b: RmsState) { return a.gain === b.gain && a.epsilon === b.epsilon && a.values.length === b.values.length && a.values.every((v,i) => v === b.values[i]); }
export function rmsPresetId(s: RmsState) { return rmsScenarios.find(p => sameRms(s,rmsBaseline(p.id)))?.id ?? "custom"; }
export function editRmsValue(s: RmsState, index: number, value: number): RmsState { if (!Number.isInteger(index) || index < 0 || index > 2 || !Number.isFinite(value)) return s; const v = Math.max(-6,Math.min(6,Math.round(value))); return s.values[index] === v ? s : { ...s, values: s.values.map((n,i) => i === index ? v : n) }; }
export function editRmsGain(s: RmsState, value: number): RmsState { if (!Number.isFinite(value)) return s; const gain = Math.max(0,Math.min(2,Math.round(value*2)/2)); return s.gain === gain ? s : { ...s, gain }; }
const average = (v: readonly number[]) => v.reduce((s,x) => s+x,0)/3;
function calculate(values: readonly number[], gain: number, epsilon: number) {
  const mean = average(values), meanSquare = average(values.map(x => x*x)), centered = values.map(x => x-mean), variance = average(centered.map(x => x*x));
  const inputRMS = Math.sqrt(meanSquare), rmsDenominator = Math.sqrt(meanSquare+epsilon), layerDenominator = Math.sqrt(variance+epsilon);
  const rmsNormalized = rmsDenominator === 0 ? null : values.map(x => x/rmsDenominator), layerNormalized = layerDenominator === 0 ? null : centered.map(x => x/layerDenominator);
  const rmsOutput = rmsNormalized?.map(x => gain*x) ?? null, layerOutput = layerNormalized?.map(x => gain*x) ?? null;
  return { values, mean, meanSquare, centered, variance, inputRMS, rmsDenominator, layerDenominator, rmsNormalized, layerNormalized, rmsOutput, layerOutput, rmsMean: rmsOutput ? average(rmsOutput) : null, layerMean: layerOutput ? average(layerOutput) : null, rmsOutputRMS: rmsOutput ? Math.sqrt(average(rmsOutput.map(x => x*x))) : null, layerOutputRMS: layerOutput ? Math.sqrt(average(layerOutput.map(x => x*x))) : null };
}
export function analyzeRms(s: RmsState) { return { ...calculate(s.values,s.gain,s.epsilon), reference: calculate([1,2,3],s.gain,s.epsilon) }; }
export const rmsNumber = (value: number | null) => value === null ? "Undefined" : Number((Math.abs(value)<1e-12?0:value).toFixed(6)).toLocaleString("en-US",{useGrouping:false,maximumFractionDigits:6});
export const rmsX = (value: number) => 90+50*(value+4);
