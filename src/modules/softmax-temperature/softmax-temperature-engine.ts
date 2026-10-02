import { type SoftmaxClass, type SoftmaxClassId, type SoftmaxLogits } from "./scenario";

export type TemperatureAnalysis = {
  temperature: number;
  scaledLogits: SoftmaxLogits;
  expValues: SoftmaxLogits;
  expTotal: number;
  probabilities: SoftmaxLogits;
  topClasses: SoftmaxClass[];
  maxProbability: number;
  entropy: number;
  entropyRatio: number;
};

export function analyzeTemperature(classes: SoftmaxClass[], logits: SoftmaxLogits, temperature: number): TemperatureAnalysis {
  if (classes.length < 2) throw new Error("Softmax temperature needs at least two classes.");
  if (classes.some(c => !Number.isFinite(logits[c.id]))) throw new Error("Softmax logits must be finite.");
  const safeTemperature = Number.isFinite(temperature) ? Math.min(3, Math.max(.25, temperature)) : .7;
  const values = (get: (c: SoftmaxClass) => number) => classes.reduce<SoftmaxLogits>((all,c) => ({...all,[c.id]:get(c)}), {rover:0,comet:0,harbor:0,signal:0});
  const scaledLogits = values(c => logits[c.id] / safeTemperature);
  const maxScaled = Math.max(...classes.map(c => scaledLogits[c.id]));
  const expValues = values(c => Math.exp(scaledLogits[c.id] - maxScaled));
  const expTotal = classes.reduce((sum,c) => sum + expValues[c.id],0);
  const probabilities = values(c => expValues[c.id] / expTotal);
  const maxLogit = Math.max(...classes.map(c => logits[c.id]));
  const topClasses = classes.filter(c => logits[c.id] === maxLogit);
  const maxProbability = probabilities[topClasses[0].id];
  const entropy = -classes.reduce((sum,c) => {
    const p = probabilities[c.id];
    return sum + (p > 0 ? p * Math.log(p) : 0);
  },0);
  return {temperature:safeTemperature,scaledLogits,expValues,expTotal,probabilities,topClasses,maxProbability,entropy,entropyRatio:entropy / Math.log(classes.length)};
}

export function setLogit(logits: SoftmaxLogits, classId: SoftmaxClassId, value: number): SoftmaxLogits {
  return {...logits,[classId]:Number.isFinite(value) ? Math.round(Math.min(3,Math.max(-3,value))*20)/20 : logits[classId]};
}

export function formatNumber(value: number, digits = 2) { return value.toFixed(digits); }
export function formatPercent(value: number) {
  if (value > 0 && value < .0001) return "<0.01%";
  if (value < 1 && value > .9999) return ">99.99%";
  return `${Number((value * 100).toFixed(2))}%`;
}
