"use client";

import { useMemo, useState } from "react";
import { ExperimentButton, ExperimentChoices, ExperimentRail, ExperimentResult, LearningPage, LessonRangeControl, LessonSummaries, LessonToolbar } from "@/components/learning-page/learning-page";
import { GuidedExperiment } from "@/components/learning-page/guided-experiment";
import sharedStyles from "@/components/learning-page/learning-page.module.css";
import { analyzeArrivals, type ProbabilityBucket } from "./waiting-arrival-distributions-engine";
import { arrivalScenarios } from "./scenario";
import { arrivalDefaults, arrivalExperiments, stateForScenario, type ArrivalState } from "./learning-experiments";
import styles from "./playground.module.css";

function percent(value: number) {
  if (value > 0 && value < .0001) return "< 0.01%";
  if (value > .9999) return "> 99.99%";
  return `≈ ${Number((value * 100).toFixed(2))}%`;
}
const number = (value: number) => Number(value.toFixed(4)).toLocaleString("en-US", { maximumFractionDigits: 4 });
// Match the browser's CSS number serialization so SSR and hydration agree.
// The engine retains full precision; six significant digits exceed pixel resolution.
const geometryPercent = (fraction: number) => `${Number((fraction * 100).toPrecision(6))}%`;
const same = (a: ArrivalState, b: ArrivalState) => a.scenario === b.scenario && Math.abs(a.p - b.p) < 1e-9 && a.window === b.window;
function ProbabilityBars({ title, description, points }: { title: string; description: string; points: ProbabilityBucket[] }) {
  return <section className={styles.distribution} aria-label={title}><h2>{title}</h2><p>{description}</p><p className={styles.scale}>Fixed scale: 0–100% probability</p>
    <ul className={styles.bars}>{points.map((point) => <li key={point.label}><span className={styles.bucket}>{point.label}</span><span className={styles.barTrack} aria-hidden="true"><span className={styles.bar} style={{ width: geometryPercent(point.probability) }} /></span><span className={styles.probability}>{percent(point.probability)}</span></li>)}</ul>
  </section>;
}
export function WaitingArrivalDistributionsPlayground() {
  const [state, setState] = useState<ArrivalState>(arrivalDefaults);
  const [index, setIndex] = useState(0);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [transferAnswer, setTransferAnswer] = useState<string | null>(null);
  const analysis = useMemo(() => analyzeArrivals(state.p, state.window), [state]);
  const experiment = arrivalExperiments[index];
  const transfer = index === arrivalExperiments.length;
  const reached = !!prediction && !!experiment && same(state, experiment.target);
  const complete = reached && explanation === experiment?.correctExplanation;
  const transferReached = same(state, { scenario: "support", p: .008, window: 1 });
  function clearAnswers() { setExplanation(null); setTransferAnswer(null); }
  function start(next = index) { setIndex(next); setState(arrivalExperiments[next]?.baseline ?? arrivalDefaults); setPrediction(null); clearAnswers(); }
  function edit(patch: Partial<ArrivalState>) { setState((current) => ({ ...current, ...patch })); clearAnswers(); }
  const rail = experiment ? <GuidedExperiment label={`Experiment ${index + 1} of 3`} experiment={experiment}
    reached={reached} complete={complete} prediction={prediction} explanation={explanation}
    predictionName="arrival-prediction" explanationName="arrival-explanation"
    onPredict={(id) => { start(); setPrediction(id); }} onExplain={setExplanation}
    predictionHelp={<>Choosing a prediction restores this experiment’s starting parameters.</>} observation={prediction === experiment.correctPrediction ? "Your prediction matches the model." : "The evidence challenges your prediction. Compare mean wait, expected count and the probability bars."}
    action={<div className={sharedStyles.actionPrompt}><p><strong>Now try it.</strong> {experiment.action}</p><p className={sharedStyles.small}>Reset starts this experiment again.</p></div>}
    onNext={() => start(index + 1)} nextLabel={index === 2 ? "Try the transfer check" : "Next experiment"} /> : <ExperimentRail label={transfer ? "Transfer check" : "Free exploration"} title={transfer ? "Change the observation window" : "Explore waits and counts"}>
    {transfer ? <><p>Choose Support Tickets, then set Window (minutes) to 1. Keep Event chance per second (%) at 0.8. Can the expected count 0.48 be treated as the exact probability of at least one event?</p><ExperimentChoices legend="Transfer explanation" name="arrival-transfer" choices={[{ id: "approx", label: "No. The exact tick probability is about 38.24%; Poisson gives about 38.12%. The 48% linear shortcut overestimates both. Mean wait stays 125 seconds." }, { id: "exact", label: "Yes. Expected count is exactly the probability whenever it is below one." }, { id: "wait", label: "The shorter window lowers mean wait to 12.5 seconds." }]} value={transferAnswer} onChange={setTransferAnswer} />{transferAnswer && (!transferReached ? <p role="status" className={sharedStyles.feedback}>First choose Support Tickets and set Window (minutes) to 1, with Event chance per second (%) at 0.8.</p> : transferAnswer !== "approx" ? <p role="status" className={sharedStyles.feedback}>Try again. Read the two probabilities and the separate expected count. Window changes count, while p determines mean wait.</p> : <><ExperimentResult title="Transfer explained">Expected count 0.48 is an average count, not an exact probability. The linear shortcut 48% is less close here than for Rare Defects. Mean wait remains 125 seconds when Window changes.</ExperimentResult><ExperimentButton onClick={() => setIndex(4)}>Explore freely</ExperimentButton></>)}</> : <><p>Try other event chances and windows. Lower p grows the long-wait tail; longer windows change counts without changing the waiting distribution. Compare the exact tick probability and both approximations before using a shortcut.</p><ExperimentButton onClick={() => start(0)}>Restart experiments</ExperimentButton></>}
  </ExperimentRail>;
  return <LearningPage title="Waiting & Arrival Distributions" subtitle="Change the event chance. Separate waiting time from arrival count." rail={rail}>
    <LessonToolbar label="Arrival scenarios" scenarios={arrivalScenarios.map((scenario) => ({ id: scenario.id, label: scenario.title, shortLabel: scenario.subtitle }))} selectedId={state.scenario} onSelect={(id) => edit(stateForScenario(id))} onReset={() => start(experiment || transfer ? index : 0)} />
    <p className={styles.assumption}>One-second model: independent ticks, the same event chance p each second, at most one event per tick. Scenarios are illustrative parameter choices.</p>
    <div className={styles.parameters}><LessonRangeControl label="Event chance per second" unit="%" min={.1} max={10} step={.1} value={Number((state.p * 100).toFixed(10))} onChange={(value) => edit({ p: value / 100 })} help="Chance on each independent tick, not events per second." /><LessonRangeControl label="Window" unit="minutes" min={1} max={10} step={1} value={state.window} onChange={(window) => edit({ window })} help="How long to count events. The waiting law keeps the same p." /></div>
    <div className={styles.distributions}><ProbabilityBars title="Waiting for first event" description="Geometric: exact tick probabilities. Wait counts the successful second; it can be longer than this window." points={analysis.waitingBuckets} /><ProbabilityBars title={`Counts in ${state.window} ${state.window === 1 ? "minute" : "minutes"}`} description="Poisson count approximation: most useful for small per-second p. 9+ pools all counts nine and above, not one outcome." points={analysis.countMass} /></div>
    <p className={styles.waitEvidence}>P(wait ≤ 20 s): <strong>{percent(analysis.waitWithin20Seconds)}</strong> · P(wait &gt; 60 s): <strong>{percent(analysis.waitAfter60Seconds)}</strong> · Median wait: <strong>{analysis.medianWaitSeconds} s</strong>. Median is the earliest tick with at least 50% chance of an event by then.</p>
    <LessonSummaries label="Waiting and count summaries" summaries={[
      { label: "Mean wait", value: `${Math.abs(analysis.meanWaitSeconds - Math.round(analysis.meanWaitSeconds)) > 1e-9 ? "≈ " : ""}${number(analysis.meanWaitSeconds)} s`, color: "#5031dc", definition: "Average first-event wait over many independent runs.", formula: `1 / p = 1 / ${number(state.p)}`, comparison: "An average, not a scheduled arrival." },
      { label: "Expected count", value: number(analysis.expectedCount), color: "#1760db", definition: `Average events in ${state.window} ${state.window === 1 ? "minute" : "minutes"}; both models share this mean.`, formula: `μ = 60 × ${state.window} × ${number(state.p)}`, comparison: "A count can exceed one or be fractional." },
      { label: "Rate", value: `${number(analysis.lambdaPerMinute)}/min`, color: "#5031dc", definition: "Expected events per minute at the current chance.", formula: "λ = 60p events/minute", comparison: "Changing Window keeps this rate fixed." },
    ]} />
    <section className={styles.comparison} aria-label="At-least-one probability comparison"><h2>Chance of at least one event in this window</h2><p>Two different approximations: small p supports Poisson counts; small μ (rate × time) supports the linear probability shortcut.</p><dl className={styles.estimates}><div><dt>Exact tick model</dt><dd>{percent(analysis.tickAtLeastOneProbability)}</dd><p>1 − (1 − p)<sup>{analysis.ticks}</sup></p></div><div><dt>Poisson approximation</dt><dd>{percent(analysis.poissonAtLeastOneProbability)}</dd><p>1 − e<sup>−μ</sup> · exact for Poisson, approximate for ticks</p></div><div><dt>Linear shortcut: μ</dt><dd>{number(analysis.expectedCount * 100)}%</dd><p>{analysis.expectedCount > 1 ? "Outside the probability range. An expected count is not a probability; this value is not clipped." : "An approximation only when μ is much smaller than one; not the exact probability."}</p></div></dl></section>
    <section className={styles.optional} aria-label="Optional model evidence"><details><summary>Sample tick timeline</summary><p>One illustrative pseudorandom run: one draw per second with fixed seed 3209. Actual count: <strong>{analysis.eventSeconds.length}</strong>; expected count: <strong>{number(analysis.expectedCount)}</strong>. Changing p reuses draws; extending Window preserves earlier events. A sample is not a probability distribution.</p><div className={styles.timeline} role="img" aria-label={`${analysis.eventSeconds.length} sampled events in ${analysis.ticks} seconds. Exact event seconds are listed below.`}>{analysis.eventSeconds.map((second) => <span key={second} style={{ left: geometryPercent(second / analysis.ticks) }} />)}</div><div className={styles.timelineEnds}><span>0 s</span><span>{analysis.ticks} s</span></div><p>Event seconds: {analysis.eventSeconds.length ? analysis.eventSeconds.join(", ") : "none in this run"}. The window endpoint can cut off a wait; it is not treated as a completed inter-event gap.</p></details><details><summary>Formula details</summary><p>W is the integer tick of the first event; K is the number of events in the window. N = 60 × Window seconds; μ = Np. All numbers shown above are rounded for display.</p><ul><li>Geometric: P(W = k) = (1 − p)<sup>k−1</sup> p, k = 1, 2, …; P(W &gt; k) = (1 − p)<sup>k</sup>.</li><li>Exact tick count is binomial: N independent trials with the same p. P(K = 0) = (1 − p)<sup>N</sup>; P(K ≥ 1) = 1 − P(K = 0).</li><li>Poisson approximation: P(K = k) ≈ e<sup>−μ</sup> μ<sup>k</sup>/k!, k = 0, 1, … . k! multiplies integers 1 through k; 0! = 1. The 9+ bar is one minus the sum of counts 0 through 8.</li><li>The linear shortcut 1 − e<sup>−μ</sup> ≈ μ needs μ much smaller than one. It can fail even with rare per-second events if the window is long.</li></ul></details></section>
    <p role="status" aria-live="polite" aria-atomic="true" className={sharedStyles.liveUpdate}>Chance {number(state.p * 100)}% per second; window {state.window} minutes; mean wait {number(analysis.meanWaitSeconds)} seconds; expected count {number(analysis.expectedCount)}. At least one event: exact tick {percent(analysis.tickAtLeastOneProbability)}, Poisson approximation {percent(analysis.poissonAtLeastOneProbability)}, linear shortcut {number(analysis.expectedCount * 100)}%{analysis.expectedCount > 1 ? ", outside probability range" : ""}.</p>
  </LearningPage>;
}
