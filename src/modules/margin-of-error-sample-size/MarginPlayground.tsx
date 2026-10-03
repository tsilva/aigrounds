"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ExperimentButton, ExperimentChoices, ExperimentRail, ExperimentResult, LearningPage, LessonRangeControl, LessonSummaries, LessonToolbar } from "@/components/learning-page/learning-page";
import shared from "@/components/learning-page/learning-page.module.css";
import { analyzeMargin, marginChart, marginSources, type MarginState } from "./margin-engine";
import { marginBaseline, reachedMargin } from "./lesson-state";
import { marginExperiments } from "./learning-experiments";
import styles from "./playground.module.css";

export function MarginPlayground() {
  const [state, setState] = useState<MarginState>(() => marginBaseline());
  const [index, setIndex] = useState(0), [prediction, setPrediction] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null), [transferAnswer, setTransferAnswer] = useState<string | null>(null);
  const [width, setWidth] = useState(640), chartRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = chartRef.current;
    if (!element) return;
    const update = () => setWidth(Math.max(200, element.getBoundingClientRect().width));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const a = useMemo(() => analyzeMargin(state), [state]), chart = marginChart(a, width);
  const experiment = marginExperiments[index], transfer = index === 3;
  const reached = !!prediction && !!experiment && reachedMargin(index, state), complete = reached && explanation === "0";
  function clear() { setExplanation(null); setTransferAnswer(null); }
  function start(next = index) { setIndex(next); setState(marginBaseline(next)); setPrediction(null); clear(); }
  function edit(patch: Partial<MarginState>) { setState(s => ({ ...s, ...patch })); clear(); }

  const rail = experiment ? <ExperimentRail label={`Experiment ${index + 1} of 3`} title={experiment.title} phase={!prediction ? 0 : reached ? 2 : 1}>
    {!reached && <><h3>Make a prediction</h3><p>{experiment.question}</p><ExperimentChoices legend="Your prediction" name="margin-prediction" choices={experiment.predictions} value={prediction} onChange={id => { start(); setPrediction(id); }} /><p className={shared.small}>Changing prediction restores this experiment’s starting settings. Reset restarts it.</p></>}
    {prediction && !reached && <p className={shared.actionPrompt}><strong>Now try it.</strong> {experiment.action}</p>}
    {reached && <><p role="status" className={shared.observation}>{prediction === "0" ? "The observed evidence matches your prediction." : "The evidence challenges your prediction."}</p><h3>{experiment.explanation}</h3><ExperimentChoices legend="Your explanation" name="margin-explanation" choices={experiment.explanations} value={explanation} onChange={setExplanation} />{explanation && !complete && <p role="status" className={shared.feedback}>Try again. {experiment.retry}</p>}</>}
    {complete && <><ExperimentResult>{experiment.takeaway}</ExperimentResult><ExperimentButton arrow onClick={() => start(index + 1)}>{index === 2 ? "Try the transfer check" : "Next experiment"}</ExperimentButton></>}
  </ExperimentRail> : <ExperimentRail label={transfer ? "Transfer check" : "Free exploration"} title={transfer ? "Another spread, size and confidence" : "Explore precision tradeoffs"}>
    {transfer ? <><p>Without Guide help, choose Lower spread, set Sample size to 64 and Confidence level to 90%. Explain the margin, full width and center.</p><ExperimentChoices legend="Transfer explanation" name="margin-transfer" choices={[
      { id: "width", label: "SE is 0.2500; margin is about 0.4112 and full width 0.8224. The interval is [19.5888, 20.4112] around illustrative mean 20. Selected confidence is 90% for the repeated procedure, and margin is not a guaranteed actual-error bound." },
      { id: "error", label: "Actual error is exactly 0.4112, and every estimate must be within that distance of the true mean." },
      { id: "data", label: "90% of individual observations lie in this interval, whose margin is the full width 0.8224." },
    ]} value={transferAnswer} onChange={setTransferAnswer} />{transferAnswer && (!reachedMargin(3, state) ? <p role="status" className={shared.feedback}>First choose Lower spread, Sample size 64 and Confidence level 90%. Read the interval endpoints and three summaries.</p> : transferAnswer !== "width" ? <p role="status" className={shared.feedback}>Try again. E is half-width and 2E is full width. Confidence describes the interval procedure for the population mean, rather than individual observations or guaranteed realized error.</p> : <><ExperimentResult title="Transfer explained">Margin = 1.6449 × 2 / √64 ≈ 0.4112; width ≈ 0.8224. The endpoints are approximately 19.5888 and 20.4112, and the illustrative center stays 20. Changing these planning settings does not collect data or reveal the unknown true mean.</ExperimentResult><ExperimentButton onClick={() => { setIndex(4); clear(); }}>Explore freely</ExperimentButton></>)}</> : <><p>Compare size, confidence and known spread. Both rows share a fixed center and scale. The reference always uses size 25, confidence 95% and the current source SD. Reset returns to Experiment 1.</p><ExperimentButton onClick={() => start(0)}>Restart experiments</ExperimentButton></>}
  </ExperimentRail>;

  return <LearningPage title="Margin of Error & Sample Size Lab" subtitle="Trade sample size against confidence and interval width." rail={rail}>
    <LessonToolbar label="Known population spread" scenarios={marginSources} selectedId={state.source} onSelect={source => edit({ source: source as MarginState["source"] })} onReset={() => start(experiment || transfer ? index : 0)} />
    <section className={styles.evidence} aria-label="Interval planning controls">
      <p>Assume independent normal observations and known population SD {a.source.sd}. The population mean is unknown. This planning view holds an illustrative sample mean at 20; changing settings does not generate new samples.</p>
      <div className={styles.controls}><LessonRangeControl label="Sample size" value={state.size} min={1} max={400} step={1} help="Hypothetical observation count used in the standard-error formula." onChange={size => edit({ size })} /><LessonRangeControl label="Confidence level" unit="%" value={state.confidence} min={90} max={99} step={1} help="Selected repeated-procedure coverage under the declared model." onChange={confidence => edit({ confidence })} /></div>
      <p role="status" data-margin-status>Known SD {a.source.sd}; sample size {state.size}; confidence {state.confidence}%; illustrative sample mean 20.</p>
    </section>
    <section className={styles.evidence} aria-label="Paired interval comparison">
      <h2>Same center, different margins</h2><p>The fixed value axis and shared center expose width changes. Reference uses n = 25 and 95% confidence with the currently selected SD {a.source.sd}; it is a comparison rule, rather than a previous sample.</p>
      <div className={styles.chart} ref={chartRef}><svg data-margin-chart viewBox={`0 0 ${chart.width} ${chart.height}`} role="img" aria-label={`Intervals on a fixed value axis −5 to 45, both centered at illustrative mean 20. Reference size 25, confidence 95%, known SD ${a.source.sd}: ${a.referenceLower.toFixed(4)} to ${a.referenceUpper.toFixed(4)}. Current size ${state.size}, confidence ${state.confidence}%: ${a.lower.toFixed(4)} to ${a.upper.toFixed(4)}. Exact rounded evidence below.`}>
        <line x1={chart.center.toFixed(3)} x2={chart.center.toFixed(3)} y1="30" y2="174" data-center />
        {[{ row: chart.reference, label: "Reference · n 25 · 95%", current: false }, { row: chart.current, label: `Current · n ${state.size} · ${state.confidence}%`, current: true }].map(({ row, label, current }) => <g key={label} data-current={current || undefined} data-reference={!current || undefined}>
          <text x={chart.left} y={row.y - 20}>{label}</text><line x1={row.lower.toFixed(3)} x2={row.upper.toFixed(3)} y1={row.y} y2={row.y} data-interval-line />
          {[row.lower, row.upper].map((x, i) => <line key={i} x1={x.toFixed(3)} x2={x.toFixed(3)} y1={row.y - 9} y2={row.y + 9} data-endpoint />)}<circle cx={chart.center.toFixed(3)} cy={row.y} r="4" />
        </g>)}
        <line x1={chart.left} x2={chart.width - chart.right} y1="174" y2="174" />{chart.ticks.map((tick, i) => <g key={tick.value}><line x1={tick.x.toFixed(3)} x2={tick.x.toFixed(3)} y1="174" y2="180" /><text x={tick.x.toFixed(3)} y="197" textAnchor={i === 0 ? "start" : i === 5 ? "end" : "middle"}>{tick.value}</text></g>)}<text x={(chart.width / 2).toFixed(3)} y="223" textAnchor="middle">Value · interval for the population mean</text>
      </svg></div>
      <p className={styles.formula} data-margin-reference>Reference: [{a.referenceLower.toFixed(4)}, {a.referenceUpper.toFixed(4)}]; margin {a.referenceMargin.toFixed(4)}; full width {(2 * a.referenceMargin).toFixed(4)}.</p>
      <p className={styles.formula} data-margin-current>Current: [{a.lower.toFixed(4)}, {a.upper.toFixed(4)}]; margin {a.margin.toFixed(4)}; full width {a.width.toFixed(4)}.</p>
    </section>
    <section className={styles.evidence} aria-label="Margin construction"><p className={styles.formula} data-margin-formula>E = z* × σ / √n = {a.critical.toFixed(4)} × {a.source.sd} / √{state.size} = {a.margin.toFixed(4)}. Full width = 2E = {a.width.toFixed(4)}.</p><p>Margin is half-width, not a guaranteed bound on realized estimation error. Confidence describes the repeated interval procedure under the model.</p></section>
    <LessonSummaries label="Spread, margin and width" summaries={[
      { label: "Sample SE", color: "#33486d", value: a.se.toFixed(4), definition: "Theoretical spread of sample means.", formula: `σ / √n = ${a.source.sd} / √${state.size}` },
      { label: "Margin of error", color: "#5031dc", value: a.margin.toFixed(4), definition: "Half-width; actual error is unknown.", formula: `E = ${a.critical.toFixed(4)} × ${a.se.toFixed(4)}` },
      { label: "Full interval width", color: "#ad4508", value: a.width.toFixed(4), definition: "Twice the margin, in the same units.", formula: `2E = 2 × ${a.margin.toFixed(4)}` },
    ]} />
    <section className={styles.evidence} aria-label="Optional model and planning evidence">
      <details><summary>Model assumptions and interpretation</summary><p>Independent normal observations, a fixed unknown population mean and a known positive population SD give a normally distributed sample mean with SE σ / √n at every n. The two-sided interval uses the positive standard-normal critical distance z* for central probability {state.confidence}%, leaving {((100 - state.confidence) / 2).toFixed(1)}% in each tail. Numerical critical values invert the Abramowitz–Stegun 26.2.17 normal-tail approximation.</p><p>Before collecting data, this rule captures the fixed true mean in {state.confidence}% of repeated samples under the model, up to numerical approximation. After one interval is computed, the fixed true mean either lies inside it or does not; this frequentist confidence level is not a posterior probability for that realized interval. It does not describe the fraction of individual observations within the interval. E is a procedure’s half-width, not the observed error or a guaranteed bound on every error.</p><p>The sample mean here stays at 20 to isolate planning tradeoffs. Real new samples may move the center; this lesson generates none. The normal known-SD formula cannot simply be substituted for unknown-SD t intervals or applied universally to dependent, biased or non-normal small samples. Repeated simulated coverage is reserved for the following Confidence Intervals Explorer.</p><a href="https://www.itl.nist.gov/div898/handbook/prc/section1/prc14.htm" target="_blank" rel="noreferrer">NIST · Known-SD normal intervals and confidence interpretation</a></details>
      <details><summary>Sample-size planning example</summary><p className={styles.formula} data-margin-planning>For desired margin at most {a.planningTarget} with confidence {state.confidence}% and known SD {a.source.sd}: n ≥ (z* × σ / E)². Round up: n = ceil(({a.critical.toFixed(4)} × {a.source.sd} / {a.planningTarget})²) = {a.planningSize}.</p><p>{a.planningSize > 400 ? "This requirement exceeds the displayed size limit of 400." : "This required size is inside the displayed range."} This plans interval half-width under the model; it does not guarantee every realized error is at most 0.5. Halving the target margin multiplies the unrounded required size by four; integer rounding can alter the exact count ratio.</p><a href="https://www.itl.nist.gov/div898/handbook/prc/section2/prc222.htm" target="_blank" rel="noreferrer">NIST · Sample-size planning with known spread</a></details>
    </section>
  </LearningPage>;
}
