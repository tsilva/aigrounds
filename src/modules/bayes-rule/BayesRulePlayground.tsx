"use client";

import { useMemo, useState } from "react";
import { ExperimentButton, ExperimentChoices, ExperimentRail, ExperimentResult, LearningPage, LessonRangeControl, LessonSummaries, LessonToggleGroup, LessonToolbar } from "@/components/learning-page/learning-page";
import sharedStyles from "@/components/learning-page/learning-page.module.css";
import { analyzeBayesRule, type BayesInputs, type BayesScenarioId } from "./bayes-rule-engine";
import { bayesScenarios } from "./scenario";
import { bayesExperiments, medicalDefaults } from "./learning-experiments";
import styles from "./playground.module.css";

const presets = [
  { id: "rare", label: "Rare", values: { total: 1000, prevalence: 0.001, sensitivity: 0.5, falsePositiveRate: 0.2 } },
  { id: "balanced", label: "Balanced", values: { total: 1000, prevalence: 0.05, sensitivity: 0.8, falsePositiveRate: 0.05 } },
  { id: "clean", label: "Clean", values: { total: 1000, prevalence: 0.2, sensitivity: 0.99, falsePositiveRate: 0 } },
];
const sameInputs = (a: BayesInputs, b: BayesInputs) => (Object.keys(a) as (keyof BayesInputs)[]).every((key) => Math.abs(a[key] - b[key]) < 1e-10);
const count = (value: number) => Number(value.toFixed(3)).toString();
function percent(value: number | null) {
  if (value === null) return "Undefined";
  const scaled = value * 100, rounded = Math.round(scaled * 10) / 10;
  return `${Math.abs(scaled - rounded) > 1e-9 ? "≈ " : ""}${rounded}%`;
}

export function BayesRulePlayground() {
  const [scenarioId, setScenarioId] = useState<BayesScenarioId>("medical");
  const [inputs, setInputs] = useState<BayesInputs>(medicalDefaults);
  const [index, setIndex] = useState(0);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [transferAnswer, setTransferAnswer] = useState<string | null>(null);
  const analysis = useMemo(() => analyzeBayesRule(inputs), [inputs]);
  const scenario = bayesScenarios.find((entry) => entry.id === scenarioId)!;
  const experiment = bayesExperiments[index];
  const transfer = index === bayesExperiments.length;
  const reached = !!prediction && scenarioId === "medical" && !!experiment && sameInputs(inputs, experiment.target);
  const complete = reached && explanation === experiment?.correctExplanation;
  const transferTarget = { ...bayesScenarios[1].defaultInputs, falsePositiveRate: 0.16 };
  const transferReached = scenarioId === "fraud" && sameInputs(inputs, transferTarget);
  function clearAnswers() { setExplanation(null); setTransferAnswer(null); }
  function start(next = index) {
    setIndex(next); setScenarioId("medical"); setInputs(medicalDefaults); setPrediction(null); clearAnswers();
  }
  function chooseScenario(id: string) {
    const next = bayesScenarios.find((entry) => entry.id === id)!;
    setScenarioId(next.id); setInputs(next.defaultInputs); clearAnswers();
  }
  function edit(key: "prevalence" | "sensitivity" | "falsePositiveRate", value: number) {
    setInputs((current) => ({ ...current, [key]: value / 100 })); clearAnswers();
  }
  const rail = experiment ? <ExperimentRail label={`Experiment ${index + 1} of 3`} title={experiment.title} phase={!prediction ? 0 : reached ? 2 : 1}>
    {!reached && <><h3>Make a prediction</h3><p>{experiment.question}</p><ExperimentChoices legend="Your prediction" name="bayes-prediction" choices={experiment.predictions} value={prediction} onChange={(id) => { start(); setPrediction(id); }} /><p className={sharedStyles.small}>Choosing a prediction restores Medical Test with 1% prevalence, 95% sensitivity and a 5% false-positive rate.</p></>}
    {prediction && !reached && <div className={sharedStyles.actionPrompt}><p><strong>Now try it.</strong> {experiment.action}</p><p className={sharedStyles.small}>Use Medical Test. Reset starts this experiment again.</p></div>}
    {reached && <><p role="status" className={sharedStyles.observation}>{prediction === experiment.correctPrediction ? "Your prediction matches the model." : "The evidence challenges your prediction. Compare the positive-result pools."}</p><h3>{experiment.explanation}</h3><ExperimentChoices legend="Your explanation" name="bayes-explanation" choices={experiment.explanations} value={explanation} onChange={setExplanation} />{explanation && !complete && <p role="status" className={sharedStyles.feedback}>Try again. {experiment.retry}</p>}</>}
    {complete && <><ExperimentResult>{experiment.takeaway}</ExperimentResult><ExperimentButton arrow onClick={() => start(index + 1)}>{index === 2 ? "Try the transfer check" : "Next experiment"}</ExperimentButton></>}
  </ExperimentRail> : <ExperimentRail label={transfer ? "Transfer check" : "Free exploration"} title={transfer ? "Test the same reasoning on fraud" : "Explore the evidence model"}>
    {transfer ? <><p>Choose Fraud Alert. Raise False-positive rate (%) from 8 to 16, leaving Prevalence at 2 and Sensitivity at 90. What happens to the probability of real fraud among flagged cases?</p><ExperimentChoices legend="Transfer explanation" name="bayes-transfer" choices={[{ id: "falls", label: "It falls: true positives stay at 18 while expected false positives rise to 156.8." }, { id: "rises", label: "It rises: a larger flagged pool must contain a higher share of real fraud." }, { id: "sensitivity", label: "It stays at 90% because sensitivity determines the posterior." }]} value={transferAnswer} onChange={setTransferAnswer} />{transferAnswer && (!transferReached ? <p role="status" className={sharedStyles.feedback}>First choose Fraud Alert and set its False-positive rate to 16, with the other rates at their defaults.</p> : transferAnswer !== "falls" ? <p role="status" className={sharedStyles.feedback}>Try again. Only false positives increased. Which group occupies more of the positive-result denominator?</p> : <><ExperimentResult title="Transfer explained">The posterior falls from 18/96.4 ≈ 18.7% to 18/174.8 ≈ 10.3%. A larger pool of false alarms makes the same positive signal less convincing.</ExperimentResult><ExperimentButton onClick={() => setIndex(4)}>Explore freely</ExperimentButton></>)}</> : <><p>Try both scenarios and all presets. Change one parameter at a time; explain which expected pool changes and which stays fixed.</p><ExperimentButton onClick={() => start(0)}>Restart experiments</ExperimentButton></>}
  </ExperimentRail>;
  const c = analysis.counts;
  const posterior = analysis.rates.posterior;
  const selectedPreset = presets.find((preset) => sameInputs(inputs, preset.values))?.id ?? "";
  return <LearningPage title="Bayes’ Rule" subtitle="Count every positive signal before judging it." rail={rail}>
    <LessonToolbar scenarios={bayesScenarios.map((entry) => ({ ...entry, label: entry.title }))} selectedId={scenarioId} onSelect={chooseScenario} onReset={() => start(experiment || transfer ? index : 0)} />
    <section className={styles.controls} aria-label="Evidence model parameters">
      <LessonRangeControl label="Prevalence" unit="%" min={0.1} max={20} step={0.1} value={Number((inputs.prevalence * 100).toFixed(10))} onChange={(value) => edit("prevalence", value)} help="Prior: real cases out of everyone before a signal." />
      <LessonRangeControl label="Sensitivity" unit="%" min={50} max={99} step={1} value={Number((inputs.sensitivity * 100).toFixed(10))} onChange={(value) => edit("sensitivity", value)} help="Positive signals out of real cases." />
      <LessonRangeControl label="False-positive rate" unit="%" min={0} max={20} step={0.1} value={Number((inputs.falsePositiveRate * 100).toFixed(10))} onChange={(value) => edit("falsePositiveRate", value)} help="Positive signals out of non-cases." />
    </section>
    <LessonToggleGroup label="Rate presets" choices={presets} value={selectedPreset} onChange={(id) => { setInputs(presets.find((preset) => preset.id === id)!.values); clearAnswers(); }} />
    <section className={styles.population} aria-label="Expected frequency table"><h2>Expected counts per {c.total}</h2><p>In this fictional scenario, a real case means {scenario.conditionLabel}; a positive signal means {scenario.signalLabel}. Expectations are model averages and can be fractional. This is not a simulated sample; actual counts vary.</p>
      <table className={styles.counts}><caption>The prior splits the population; sensitivity and false-positive rate split each row.</caption><thead><tr><th scope="col">Group</th><th scope="col">Positive</th><th scope="col">Negative</th><th scope="col">Total</th></tr></thead><tbody><tr><th scope="row">Real case</th><td data-positive="true" data-true="true"><strong>{count(c.truePositive)}</strong><span>True positives</span></td><td><strong>{count(c.falseNegative)}</strong><span>False negatives</span></td><td>{count(c.condition)}</td></tr><tr><th scope="row">No real case</th><td data-positive="true"><strong>{count(c.falsePositive)}</strong><span>False positives</span></td><td><strong>{count(c.trueNegative)}</strong><span>True negatives</span></td><td>{count(c.noCondition)}</td></tr></tbody><tfoot><tr><th scope="row">Total</th><td data-positive="true">{count(c.positiveTests)}</td><td>{count(c.negativeTests)}</td><td>{c.total}</td></tr></tfoot></table>
      <p className={styles.construction}>True positives = {count(c.condition)} × {percent(inputs.sensitivity)} = {count(c.truePositive)}.<br />False positives = {count(c.noCondition)} × {percent(inputs.falsePositiveRate)} = {count(c.falsePositive)}.</p>
    </section>
    <section className={styles.positives} aria-label="Positive results only"><h2>Positive results only</h2><p>The outlined table cells form this new reference group. Its total is {count(c.positiveTests)} expected positives.</p><div className={styles.bar} role="img" aria-label={`True positives ${count(c.truePositive)}; false positives ${count(c.falsePositive)}; posterior ${percent(posterior)}`}>{posterior !== null && <><span className={styles.truePositive} style={{ width: `${posterior * 100}%` }} /><span className={styles.falsePositive} style={{ width: `${(1 - posterior) * 100}%` }} /></>}</div><p>Real positives: {count(c.truePositive)} ({percent(posterior)}). False positives: {count(c.falsePositive)} ({percent(posterior === null ? null : 1 - posterior)}).</p><p className={styles.posterior}>Posterior = {count(c.truePositive)} / ({count(c.truePositive)} + {count(c.falsePositive)}) {posterior === null ? "is undefined: no positive results." : `= ${count(c.truePositive)}/${count(c.positiveTests)}; ${percent(posterior)}`}</p>
      <details><summary>Connect the counts to Bayes’ formula</summary><p>P(real | positive) = sensitivity × prior / [sensitivity × prior + false-positive rate × (1 − prior)]. The vertical bar means “given”. Both terms in the denominator are ways to get a positive result. Population size cancels, so the posterior depends on the rates.</p></details>
    </section>
    <LessonSummaries label="Prior, evidence and posterior" summaries={[
      { label: "Prior", color: "#1760db", value: percent(inputs.prevalence), definition: "Real cases before the signal.", formula: `${count(c.condition)} / ${c.total}` },
      { label: "All positives", color: "#976000", value: count(c.positiveTests), definition: "True plus false positives.", formula: `${count(c.truePositive)} + ${count(c.falsePositive)}` },
      { label: "Posterior", color: "#5031dc", value: percent(posterior), definition: "Real cases among positive results.", formula: `${count(c.truePositive)} / ${count(c.positiveTests)}` },
    ]} />
    <p role="status" aria-live="polite" aria-atomic="true" className={sharedStyles.liveUpdate}>{scenario.title}; prior {percent(inputs.prevalence)}, sensitivity {percent(inputs.sensitivity)}, false-positive rate {percent(inputs.falsePositiveRate)}. {count(c.truePositive)} expected true positives and {count(c.falsePositive)} false positives; posterior {percent(posterior)}.</p>
  </LearningPage>;
}
