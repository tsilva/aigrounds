"use client";

import { useMemo, useState } from "react";
import { ExperimentButton, ExperimentChoices, ExperimentRail, ExperimentResult, LearningPage, LessonRangeControl, LessonSummaries, LessonToolbar } from "@/components/learning-page/learning-page";
import sharedStyles from "@/components/learning-page/learning-page.module.css";
import { analyzeDistribution, type DistributionMode } from "./bernoulli-categorical-binomial-engine";
import { modeFacts, modeOrder } from "./scenario";
import { distributionDefaults, distributionExperiments, type DistributionState } from "./learning-experiments";
import styles from "./playground.module.css";

function probability(value: number) {
  if (value > 0 && value * 100 < .01) return "< 0.01%";
  const rounded = Number((value * 100).toFixed(2));
  return `${Math.abs(value * 100 - rounded) > 1e-9 ? "≈ " : ""}${rounded}%`;
}
const metric = (value: number) => Number(value.toFixed(4)).toString();
const same = (a: DistributionState, b: DistributionState) => a.mode === b.mode && Math.abs(a.p - b.p) < 1e-9 && (a.mode !== "binomial" || a.n === b.n);
const shortLabels = { bernoulli: "One yes/no outcome", categorical: "One class label", binomial: "Number of successes" };

export function BernoulliCategoricalBinomialPlayground() {
  const [state, setState] = useState<DistributionState>(distributionDefaults);
  const [index, setIndex] = useState(0);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [transferAnswer, setTransferAnswer] = useState<string | null>(null);
  const analysis = useMemo(() => analyzeDistribution(state.mode, state.p, state.n), [state]);
  const experiment = distributionExperiments[index];
  const transfer = index === distributionExperiments.length;
  const reached = !!prediction && !!experiment && same(state, experiment.target);
  const complete = reached && explanation === experiment?.correctExplanation;
  const transferReached = same(state, { mode: "binomial", p: .8, n: 1 });
  const fact = modeFacts[state.mode];
  function clearAnswers() { setExplanation(null); setTransferAnswer(null); }
  function start(next = index) { setIndex(next); setState(distributionExperiments[next]?.baseline ?? distributionDefaults); setPrediction(null); clearAnswers(); }
  function edit(patch: Partial<DistributionState>) { setState((current) => ({ ...current, ...patch })); clearAnswers(); }
  const rail = experiment ? <ExperimentRail label={`Experiment ${index + 1} of 3`} title={experiment.title} phase={!prediction ? 0 : reached ? 2 : 1}>
    {!reached && <><h3>Make a prediction</h3><p>{experiment.question}</p><ExperimentChoices legend="Your prediction" name="distribution-prediction" choices={experiment.predictions} value={prediction} onChange={(id) => { start(); setPrediction(id); }} /><p className={sharedStyles.small}>Choosing a prediction restores this experiment’s starting model and values.</p></>}
    {prediction && !reached && <div className={sharedStyles.actionPrompt}><p><strong>Now try it.</strong> {experiment.action}</p><p className={sharedStyles.small}>Reset starts this experiment again.</p></div>}
    {reached && <><p role="status" className={sharedStyles.observation}>{prediction === experiment.correctPrediction ? "Your prediction matches the model." : "The model challenges your prediction. Compare the bars and their outcome labels."}</p><h3>{experiment.explanation}</h3><ExperimentChoices legend="Your explanation" name="distribution-explanation" choices={experiment.explanations} value={explanation} onChange={setExplanation} />{explanation && !complete && <p role="status" className={sharedStyles.feedback}>Try again. {experiment.retry}</p>}</>}
    {complete && <><ExperimentResult>{experiment.takeaway}</ExperimentResult><ExperimentButton arrow onClick={() => start(index + 1)}>{index === 2 ? "Try the transfer check" : "Next experiment"}</ExperimentButton></>}
  </ExperimentRail> : <ExperimentRail label={transfer ? "Transfer check" : "Free exploration"} title={transfer ? "Reduce the count to one trial" : "Ask a different probability question"}>
    {transfer ? <><p>Choose Binomial Count. Set Trials to 1 and Success probability (%) to 80. Which distribution does this match?</p><ExperimentChoices legend="Transfer explanation" name="distribution-transfer" choices={[{ id: "bernoulli", label: "Bernoulli with p = 0.8: zero successes has 20% probability and one has 80%." }, { id: "same", label: "A count model always has nine possible outcomes, whatever n is." }, { id: "fraction", label: "One trial has a possible outcome of 0.8 successes." }]} value={transferAnswer} onChange={setTransferAnswer} />{transferAnswer && (!transferReached ? <p role="status" className={sharedStyles.feedback}>First choose Binomial Count, set Trials to 1 and Success probability to 80.</p> : transferAnswer !== "bernoulli" ? <p role="status" className={sharedStyles.feedback}>Try again. One trial has only zero or one success. Compare those probabilities with a Bernoulli trial.</p> : <><ExperimentResult title="Transfer explained">With n = 1, the binomial count is exactly a Bernoulli 0/1 outcome. Its mean is 0.8; a single outcome is 0 or 1.</ExperimentResult><ExperimentButton onClick={() => setIndex(4)}>Explore freely</ExperimentButton></>)}</> : <><p>Switch models, move probability from 5% to 95%, and try 1–16 binomial trials. Look for tied modes and fractional means. Each distribution assigns total mass one; the question determines its possible outcomes.</p><ExperimentButton onClick={() => start(0)}>Restart experiments</ExperimentButton></>}
  </ExperimentRail>;
  const numerical = analysis.expectedValue !== null;
  const summaries = numerical ? [
    { label: "Mean", value: metric(analysis.expectedValue!), color: "#5031dc", definition: "Probability-weighted average of numerical outcomes.", formula: state.mode === "binomial" ? `n × p = ${state.n} × ${state.p}` : `0 × (1 − p) + 1 × p = ${state.p}`, comparison: "The mean need not be a possible single outcome." },
    { label: "Variance", value: metric(analysis.variance!), color: "#1760db", definition: state.mode === "binomial" ? "Spread of success counts, in squared-count units." : "Spread of the coded 0/1 outcome.", formula: `${state.mode === "binomial" ? "n × " : ""}p × (1 − p)` },
    { label: "Most likely", value: analysis.mostLikelyLabel, color: "#5031dc", definition: "Outcome(s) with the largest probability.", formula: "Mode: a tie outlines every equal maximum." },
  ] : [
    { label: "P(A)", value: probability(state.p), color: "#5031dc", definition: "Chance of one draw landing in class A.", formula: `p = ${state.p}` },
    { label: "Total mass", value: probability(analysis.totalMass), color: "#1760db", definition: "All four mutually exclusive classes exhaust one draw.", formula: "P(A) + P(B) + P(C) + P(D) = 1" },
    { label: "Most likely class", value: analysis.mostLikelyLabel, color: "#5031dc", definition: "Class label with the largest probability.", formula: "Names have no intrinsic numerical mean or variance." },
  ];
  return <LearningPage title="Bernoulli, Categorical & Binomial" subtitle="Match the probability model to the question." rail={rail}>
    <LessonToolbar label="Probability models" scenarios={modeOrder.map((mode) => ({ id: mode, label: modeFacts[mode].title, shortLabel: shortLabels[mode] }))} selectedId={state.mode} onSelect={(mode) => edit({ mode: mode as DistributionMode })} onReset={() => start(experiment || transfer ? index : 0)} />
    <section className={styles.question} aria-label="Model question"><h2>{fact.question}</h2><p>{state.mode === "bernoulli" ? "One trial: 0 means failure, 1 means success." : state.mode === "categorical" ? "One draw selects A, B, C or D. These are names without a numerical order. This example assigns A probability p; B/C/D split the remaining 1 − p in a fixed 52:30:18 ratio." : `A run contains ${state.n} independent trials with the same success probability p. Its outcome is the total success count, from 0 to ${state.n}; each bar combines every trial order giving that count.`}</p></section>
    <div className={styles.parameters}>
      <LessonRangeControl label={state.mode === "categorical" ? "Class A probability" : "Success probability"} unit="%" min={5} max={95} step={1} value={Number((state.p * 100).toFixed(10))} onChange={(value) => edit({ p: value / 100 })} help={state.mode === "categorical" ? "Other classes share the remaining probability." : "Chance of success on each trial."} />
      {state.mode === "binomial" && <LessonRangeControl label="Trials" min={1} max={16} step={1} value={state.n} onChange={(n) => edit({ n })} help="Independent repeats with unchanged p." />}
    </div>
    <section className={styles.mass} aria-label="Probability mass"><h2>Probability mass</h2><p>Mass means the chance assigned to a possible outcome. The vertical scale stays at 0–100%; outlined bars are most likely, including ties. Tiny probabilities have tiny bars; they are not boosted to a minimum height.</p>
      <div className={styles.chartScroller} tabIndex={0} role="region" aria-label="Scrollable probability bars"><div className={styles.plot} style={{ minWidth: analysis.massPoints.length * 64 + 48 }}><div className={styles.axis}><span>100%</span><span>50%</span><span>0%</span></div><div className={styles.bars} style={{ gridTemplateColumns: `repeat(${analysis.massPoints.length}, minmax(0, 1fr))` }}>{analysis.massPoints.map((point) => <div key={point.id} className={styles.barCell}><span className={styles.probability}>{probability(point.probability)}</span><div className={styles.barWell}><div className={styles.bar} data-mode={point.isTarget} style={{ height: `${point.probability * 100}%` }} role="img" aria-label={`${point.detail}: ${probability(point.probability)}${point.isTarget ? ", most likely" : ""}`} /></div><span className={styles.outcome}>{point.label}</span></div>)}</div></div></div>
      <p className={styles.scrollHelp}>Scroll the bars horizontally if needed. The complete probability table below provides the same data.</p>
    </section>
    <LessonSummaries label="Distribution summaries" summaries={summaries} />
    <section className={styles.evidence} aria-label="Supporting probability evidence"><details><summary>Formula</summary><p className={styles.formula}>{fact.formula}</p><p>{state.mode === "binomial" ? "C(n,k) is the number of ways to place k successes among n trials. Each arrangement has probability p^k × (1 − p)^(n − k); adding their probabilities gives the count’s mass. Independent equal-p trials are required." : fact.simplified}</p></details><details><summary>Complete probability table</summary><div className={styles.tableScroller} tabIndex={0} role="region" aria-label="Scrollable outcome probabilities"><table><caption>Probability percentages may be rounded; full-precision masses sum to one. Small positive probabilities below 0.01% are explicitly marked.</caption><thead><tr><th scope="col">Outcome</th><th scope="col">Probability</th><th scope="col">Most likely?</th></tr></thead><tbody>{analysis.massPoints.map((point) => <tr key={point.id}><th scope="row">{point.detail}</th><td>{probability(point.probability)}</td><td>{point.isTarget ? "Yes" : "No"}</td></tr>)}</tbody><tfoot><tr><th scope="row">Total</th><td>{probability(analysis.totalMass)}</td><td /></tr></tfoot></table></div></details><p>Bernoulli asks about one yes/no outcome. Categorical asks which class label occurs. Binomial asks how many successes occur in independent equal-p trials. These are theoretical probabilities, not sampled frequencies.</p></section>
    <p className={sharedStyles.liveUpdate} role="status" aria-live="polite" aria-atomic="true">{fact.title}, p {probability(state.p)}{state.mode === "binomial" ? `, ${state.n} trials` : ""}. Most likely: {analysis.mostLikelyLabel}. {numerical ? `Mean ${metric(analysis.expectedValue!)}; variance ${metric(analysis.variance!)}.` : "Class labels have no intrinsic numerical mean or variance."} Total mass {probability(analysis.totalMass)}.</p>
  </LearningPage>;
}
