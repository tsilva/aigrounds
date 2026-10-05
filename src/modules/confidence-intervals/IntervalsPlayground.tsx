"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { ExperimentButton, ExperimentChoices, ExperimentRail, ExperimentResult, LearningPage, LessonAction, LessonRangeControl, LessonSummaries, LessonToolbar } from "@/components/learning-page/learning-page";
import { GuidedExperiment } from "@/components/learning-page/guided-experiment";
import shared from "@/components/learning-page/learning-page.module.css";
import { analyzeIntervals, intervalChart, intervalSources, type IntervalState } from "./interval-engine";
import { intervalBaseline, reachedIntervals } from "./lesson-state";
import { intervalExperiments } from "./learning-experiments";
import styles from "./playground.module.css";

export function IntervalsPlayground() {
  const [state, setState] = useState<IntervalState>(() => intervalBaseline()), [index, setIndex] = useState(0);
  const [prediction, setPrediction] = useState<string | null>(null), [explanation, setExplanation] = useState<string | null>(null), [transferAnswer, setTransferAnswer] = useState<string | null>(null);
  const [width, setWidth] = useState(640), chartRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = chartRef.current;
    if (!element) return;
    const update = () => setWidth(Math.max(200, element.clientWidth));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const a = useMemo(() => analyzeIntervals(state), [state]), chart = intervalChart(a, width);
  const experiment = intervalExperiments[index], transfer = index === 3;
  const reached = !!prediction && !!experiment && reachedIntervals(index, state), complete = reached && explanation === "0";
  function clear() { setExplanation(null); setTransferAnswer(null); }
  function start(next = index) { setIndex(next); setState(intervalBaseline(next)); setPrediction(null); clear(); }
  function edit(patch: Partial<IntervalState>) { setState(s => ({ ...s, ...patch })); clear(); }
  const rail = experiment ? <GuidedExperiment label={`Experiment ${index + 1} of 3`} experiment={experiment}
    reached={reached} complete={complete} prediction={prediction} explanation={explanation}
    predictionName="interval-prediction" explanationName="interval-explanation"
    onPredict={id => { start(); setPrediction(id); }} onExplain={setExplanation}
    predictionHelp={<>Changing prediction restores this experiment’s starting settings. Reset restarts it.</>} observation={prediction === "0" ? "The observed evidence matches your prediction." : "The evidence challenges your prediction."}
    onNext={() => start(index + 1)} nextLabel={index === 2 ? "Try the transfer check" : "Next experiment"} /> : <ExperimentRail label={transfer ? "Transfer check" : "Free exploration"} title={transfer ? "Another batch and procedure" : "Explore interval coverage"}>
    {transfer ? <><p>Without Guide help, choose Higher spread, set Sample size 64, Confidence level 90% and Batch number 7. Explain capture count, width and the fixed true mean.</p><ExperimentChoices legend="Transfer explanation" name="interval-transfer" choices={[
      { id: "procedure", label: "92 of 100 intervals capture the fixed true mean 20. Selected confidence remains 90%; width is about 3.2897, with different sample means as centers. Each realized interval either contains the fixed mean or misses it; finite 92% does not replace the 90% procedure level." },
      { id: "moving", label: "The true mean changes for each interval, creating a 92% chance that every interval is correct." },
      { id: "certain", label: "Exactly 90 intervals must capture; bigger size forces the remaining intervals to be correct too." },
    ]} value={transferAnswer} onChange={setTransferAnswer} />{transferAnswer && (!reachedIntervals(3, state) ? <p role="status" className={shared.feedback}>First choose Higher spread, Sample size 64, Confidence level 90% and Batch number 7. Read the capture count and width.</p> : transferAnswer !== "procedure" ? <p role="status" className={shared.feedback}>Try again. The population mean stays 20. Different finite batches can have different observed capture fractions at the same selected confidence; confidence belongs to the procedure.</p> : <><ExperimentResult title="Transfer explained">This batch has 92 captures and 8 misses. SE = 8 / √64 = 1; margin ≈ 1.6449 and width ≈ 3.2897. True mean 20 stays fixed while interval centers differ. The 90% confidence level does not require this finite batch to have exactly 90 captures.</ExperimentResult><ExperimentButton onClick={() => { setIndex(4); clear(); }}>Explore freely</ExperimentButton></>)}</> : <><p>Compare different batches, sizes, confidence levels and known spreads. Next batch uses new standardized means; size and spread edits rescale the same draws. Reset returns to Experiment 1.</p><ExperimentButton onClick={() => start(0)}>Restart experiments</ExperimentButton></>}
  </ExperimentRail>;

  return <LearningPage title="Confidence Intervals Explorer" subtitle="See which repeated intervals capture the fixed true mean." rail={rail}>
    <LessonToolbar label="Known population spread" scenarios={intervalSources} selectedId={state.source} onSelect={source => edit({ source: source as IntervalState["source"] })} onReset={() => start(experiment || transfer ? index : 0)} />
    <section className={shared.evidence} aria-label="Repeated interval controls"><p>Independent normal observations; known population SD {a.source.sd}. Simulator truth μ = 20 stays fixed. Each of 100 sample means is generated directly from its normal sampling law; individual observations are not shown.</p><div className={shared.controlGrid} data-columns="3">
      <LessonRangeControl label="Sample size" value={state.size} min={1} max={400} step={1} help="Observations represented by each mean. Rescales the same standardized draws and margins." onChange={size => edit({ size })} />
      <LessonRangeControl label="Confidence level" unit="%" value={state.confidence} min={90} max={99} step={1} help="Changes margins around the same sample means, not the true mean or centers." onChange={confidence => edit({ confidence })} />
      <LessonRangeControl label="Batch number" value={state.batch} min={1} max={20} step={1} help="Select one reproducible set of 100 independent simulated sample means." onChange={batch => edit({ batch })} />
    </div><div className={styles.batchAction}><LessonAction onClick={() => edit({ batch: Math.min(20, state.batch + 1) })} disabled={state.batch === 20}>Next batch</LessonAction></div><p role="status" data-interval-status>Batch {state.batch} of 20; 100 means, each representing size {state.size}. Known SD {a.source.sd}; selected confidence {state.confidence}%; fixed true mean 20.</p><p>Confidence edits reuse the means. Size or spread edits rescale the same standardized draws for a paired comparison; Next batch uses new draws.</p></section>
    <section className={shared.evidence} aria-label="Repeated confidence interval evidence"><h2>100 intervals, one true mean</h2><p>✓ Indigo solid interval and dot: captures μ = 20. × Rust dashed interval and cross: misses. The vertical dashed line is the fixed true mean. All intervals in a batch have the same width; sample means move their centers. Scroll for all 100 labeled rows; focus the plot and use PageDown or arrow keys.</p>
      <div className={styles.chart}><div className={styles.plotScroll} ref={chartRef} tabIndex={0} role="region" aria-label="Scrollable confidence interval plot"><svg data-interval-chart viewBox={`0 0 ${chart.width} ${chart.height}`} role="img" aria-label={`100 confidence intervals in batch ${state.batch}; ${a.captures} include fixed true mean 20, ${a.misses} miss. Each width ${a.width.toFixed(4)} at size ${state.size}, known SD ${a.source.sd} and confidence ${state.confidence}%. Fixed value axis −40 to 80. Exact endpoints in the optional table.`}>
        <line x1={chart.truthX.toFixed(3)} x2={chart.truthX.toFixed(3)} y1="4" y2="2016" data-truth />
        {chart.rows.map(row => <g key={row.id} data-interval-id={row.id} data-captures={row.captures} data-mean={row.mean.toFixed(6)} data-lower={row.lower.toFixed(6)} data-upper={row.upper.toFixed(6)}>
          <text x="4" y={row.y + 4}>{row.id} {row.captures ? "✓" : "×"}</text><line x1={row.lowerX.toFixed(3)} x2={row.upperX.toFixed(3)} y1={row.y} y2={row.y} data-interval-line />
          {[row.lowerX, row.upperX].map((x, i) => <line key={i} x1={x.toFixed(3)} x2={x.toFixed(3)} y1={row.y - 4} y2={row.y + 4} data-endpoint />)}
          {row.captures ? <circle cx={row.meanX.toFixed(3)} cy={row.y} r="2.5" /> : <><line x1={(row.meanX - 3).toFixed(3)} x2={(row.meanX + 3).toFixed(3)} y1={row.y - 3} y2={row.y + 3} /><line x1={(row.meanX - 3).toFixed(3)} x2={(row.meanX + 3).toFixed(3)} y1={row.y + 3} y2={row.y - 3} /></>}
        </g>)}
      </svg></div><div className={styles.axis}><svg data-interval-axis style={{ width: `${chart.width}px`, maxWidth: "100%" }} viewBox={`0 0 ${chart.width} 54`} role="img" aria-label="Fixed interval value axis from −40 to 80; true mean 20"><line x1={chart.left} x2={chart.width - chart.right} y1="3" y2="3" />{chart.ticks.map((tick, i) => <g key={tick.value}><line x1={tick.x.toFixed(3)} x2={tick.x.toFixed(3)} y1="3" y2="9" /><text x={tick.x.toFixed(3)} y="26" textAnchor={i === 0 ? "start" : i === 6 ? "end" : "middle"}>{tick.value}</text></g>)}<text x={(chart.width / 2).toFixed(3)} y="49" textAnchor="middle">Value · one fixed population mean</text></svg></div></div>
      <p className={shared.math} data-interval-coverage>Batch {state.batch}: {a.captures} of 100 intervals include μ = 20; {a.misses} miss. Selected confidence is {state.confidence}%, rather than a promise of exactly {state.confidence} captures.</p>
    </section>
    <LessonSummaries label="Coverage, confidence and width" summaries={[
      { label: "Observed coverage", color: "#5031dc", value: `${a.captures.toFixed(1)}%`, definition: "Capture fraction of this finite batch.", formula: `${a.captures} / 100 intervals` },
      { label: "Selected confidence", color: "#33486d", value: `${state.confidence}%`, definition: "Repeated-procedure level under the model.", formula: `z* ≈ ${a.critical.toFixed(4)}` },
      { label: "Interval width", color: "#ad4508", value: a.width.toFixed(4), definition: "Same full width for all current intervals.", formula: `2E = 2 × ${a.critical.toFixed(4)} × ${a.source.sd} / √${state.size}` },
    ]} />
    <section className={shared.evidence} aria-label="Optional interval and model evidence"><details><summary>Exact interval endpoints</summary><div className={styles.tableScroll} tabIndex={0} role="region" aria-label="Scrollable exact confidence intervals"><table className={`${shared.dataTable} ${styles.table}`}><caption>All 100 intervals in Batch {state.batch}; inclusive endpoints. Rounded values displayed; full precision decides whether lower ≤ 20 ≤ upper.</caption><thead><tr><th scope="col">Interval</th><th scope="col">Sample mean</th><th scope="col">Lower</th><th scope="col">Upper</th><th scope="col">Captures μ?</th></tr></thead><tbody>{a.intervals.map(row => <tr key={row.id}><th scope="row">{row.id}</th><td>{row.mean.toFixed(4)}</td><td>{row.lower.toFixed(4)}</td><td>{row.upper.toFixed(4)}</td><td>{row.captures ? "Yes" : "No"}</td></tr>)}</tbody></table></div></details>
      <details><summary>Sampling model and interpretation</summary><p>With independent normal observations and known population SD, the sample mean has normal law with center μ and SE σ / √n at every n. The simulator generates sample means directly as 20 + (σ / √n) × Z, rather than generating n individual observations. Each interval uses its own mean ± z* × SE; the estimator’s interval formula does not use the simulator’s true mean to position its bounds.</p><p>A seed-1309 32-bit LCG gives open-unit positions to a Box-Muller normal transform, preparing 2000 standardized draws in 20 batches of 100. Selecting size or spread rescales the same draws; confidence changes margins around unchanged centers. Under this common-draw normal comparison, both mean error and margin scale together, so inclusion stays fixed at the same confidence. Next batch uses another set of standardized draws and may change capture counts. Finite pseudorandom examples do not prove independence or exact coverage.</p><p>Confidence {state.confidence}% describes coverage of this procedure across repeated independent samples under its assumptions, up to numerical normal-critical approximation. Each computed interval either contains the fixed mean or misses it. This is not a posterior probability for that particular interval or a percentage of individual observations within it. Finite batches need not equal confidence exactly, and an all-capture batch does not establish guaranteed coverage. The true mean never moves; sample means move.</p><p>All shown intervals and their center markers fit the fixed −40 to 80 window for the prepared batches and allowed parameters; the simulation does not clamp endpoints. Unknown-SD t intervals, non-normal approximations, dependence, biased samples, testing and power are outside scope. Source spread and size affect width, while selected confidence is a separate control. Numeric critical distances invert the Abramowitz–Stegun 26.2.17 normal-tail approximation.</p><a href="https://www.itl.nist.gov/div898/handbook/prc/section1/prc14.htm" target="_blank" rel="noreferrer">NIST · Confidence intervals, fixed parameters and repeated coverage</a></details>
    </section>
  </LearningPage>;
}
