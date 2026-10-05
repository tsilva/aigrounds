"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ExperimentButton, ExperimentChoices, ExperimentRail, ExperimentResult, LearningPage, LessonRangeControl, LessonSummaries, LessonToggleGroup, LessonToolbar } from "@/components/learning-page/learning-page";
import { GuidedExperiment } from "@/components/learning-page/guided-experiment";
import shared from "@/components/learning-page/learning-page.module.css";
import { analyzeScaling, scalingChart, scalingModes, scalingNumber as number, scalingScenarios, type ScalingState } from "./scaling-engine";
import { scalingBaseline, reachedScaling } from "./lesson-state";
import { scalingExperiments } from "./learning-experiments";
import styles from "./playground.module.css";

export function ScalingPlayground() {
  const [state, setState] = useState(() => scalingBaseline());
  const [index, setIndex] = useState(0);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [transferAnswer, setTransferAnswer] = useState<string | null>(null);
  const [width, setWidth] = useState(640);
  const chartRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;
    const update = () => setWidth(Math.max(200, el.getBoundingClientRect().width));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const a = useMemo(() => analyzeScaling(state), [state]);
  const chart = scalingChart(a, width), experiment = scalingExperiments[index], transfer = index === 3;
  const modeLabel = scalingModes.find(m => m.id === state.mode)!.label;
  const reached = !!prediction && !!experiment && reachedScaling(index, state);
  const complete = reached && explanation === "0";
  function clear() { setExplanation(null); setTransferAnswer(null); }
  function start(next = index) { setIndex(next); setState(scalingBaseline(next)); setPrediction(null); clear(); }
  function edit(patch: Partial<ScalingState>) { setState(s => ({ ...s, ...patch })); clear(); }

  const rail = experiment ? <GuidedExperiment label={`Experiment ${index + 1} of 3`} experiment={experiment}
    reached={reached} complete={complete} prediction={prediction} explanation={explanation}
    predictionName="scaling-prediction" explanationName="scaling-explanation"
    onPredict={id => { start(); setPrediction(id); }} onExplain={setExplanation}
    predictionHelp={<>Changing prediction restores this experiment’s starting state. Reset restarts it.</>} observation={prediction === "0" ? "The evidence matches your prediction." : "The evidence challenges your prediction."}
    onNext={() => start(index + 1)} nextLabel={index === 2 ? "Try the transfer check" : "Next experiment"} /> : <ExperimentRail label={transfer ? "Transfer check" : "Free exploration"} title={transfer ? "A constant feature in new units" : "Choose a reference recipe"}>
    {transfer ? <>
      <p>Without Guide help, choose Constant feature, choose Z-score under Scaling method, and set Feature B unit multiplier to 7. Explain A’s zero-scale convention, reconstruct B’s outputs, and account for the P1/P4 squared distance.</p>
      {reachedScaling(3, state) && <>
        <ExperimentChoices legend="Transfer explanation" name="scaling-transfer" choices={[
          { id: "constant", label: "A has mean 2 and SD 0; using denominator 1 after centering maps all four observed A values to 0, with output SD still 0. B’s mean and SD both scale by 7, so its z-scores stay approximately [−1.176697, −0.784465, 0.784465, 1.176697]. A’s endpoint term is 0; B’s is 72/13 ≈ 5.538462. No variation, normality or accuracy guarantee was created." },
          { id: "variance", label: "Every standardized column must have SD 1, including the constant A column." },
          { id: "units", label: "B’s standardized endpoint term must become 49 times larger when its units are multiplied by 7." },
        ]} value={transferAnswer} onChange={setTransferAnswer} />
        {transferAnswer && (transferAnswer !== "constant" ? <p role="status" className={shared.feedback}>Try again. A’s raw SD is zero, so its constant observed values cannot acquire variation. For B, the same positive multiplier appears in both the centered difference and its reference SD, and cancels.</p> : <>
          <ExperimentResult title="Transfer explained">The constant reference feature contributes zero after centering, while B’s standardized outputs are independent of this positive unit factor. The zero-scale exception and the chosen recipe matter; numerical scaling alone does not establish task quality.</ExperimentResult>
          <ExperimentButton onClick={() => { setIndex(4); clear(); }}>Explore freely</ExperimentButton>
        </>)}
      </>}
    </> : <><p>Compare Raw, Min–max and Z-score across units, outliers and a constant column. Inspect each reference center and denominator. A scaling choice changes the numerical representation; it does not add information, erase outliers or automatically improve a model.</p><ExperimentButton onClick={() => start(0)}>Restart experiments</ExperimentButton></>}
  </ExperimentRail>;

  return <LearningPage title="Feature Scaling Lab" subtitle="Change units; compare column transformations." rail={rail}>
    <LessonToolbar scenarios={scalingScenarios} selectedId={state.scenario} onSelect={scenario => edit({ scenario: scenario as ScalingState["scenario"] })} onReset={() => start(experiment || transfer ? index : 0)} />
    <section className={shared.evidence} aria-label="Reference cases and column transformations">
      <h2>Your dataset</h2>
      <p>Four reference cases, two feature columns. Scaling uses these four rows’ statistics. A positive unit multiplier changes only feature B’s numerical units, not case identity, ordering or information. Min–max is per-feature normalization here; it is not per-row unit-length normalization.</p>
      <h3>Scaling method</h3>
      <LessonToggleGroup label="Scaling method" choices={scalingModes} value={state.mode} onChange={mode => edit({ mode: mode as ScalingState["mode"] })} />
      <div className={`${shared.tableScroll} ${styles.table}`} role="region" tabIndex={0} aria-label="Raw and transformed reference case identities">
        <table><caption>Each feature uses one column recipe across all four cases. Output = (raw value − reference center)/used denominator; Raw uses center 0 and denominator 1.</caption>
          <thead><tr>{["Case", "Raw A", "Raw B", "Output A", "Output B"].map(h => <th key={h} scope="col">{h}</th>)}</tr></thead>
          <tbody>{a.raw.map((row, i) => <tr key={i}><th scope="row">P{i + 1}</th><td>{row[0]}</td><td>{row[1]}</td><td>{number(a.values[i][0])}</td><td>{number(a.values[i][1])}</td></tr>)}</tbody>
        </table>
      </div>
      <p role="status" data-scaling-status className={shared.math}>{modeLabel} · B multiplier {state.multiplier} · P1/P4 squared distance {number(a.distanceSquared)}</p>
      {state.scenario === "constant" && state.mode !== "raw" && <p role="status" data-scaling-constant className={shared.math}>A has zero reference {state.mode === "minmax" ? "range" : "SD"}. Used denominator = 1 after subtracting its center. All four observed A outputs = 0; output SD = 0, not 1.</p>}
      <LessonRangeControl label="Feature B unit multiplier" value={state.multiplier} min={1} max={10} step={1} help="Multiply every raw B value equally. The reference minimum, maximum, mean and SD change into those units. Min–max and z-score recompute their column recipes; a positive unit factor cancels." onChange={multiplier => edit({ multiplier })} />
    </section>
    <section className={shared.evidence} aria-label="Squared differences and numerical contribution shares">
      <h2>Squared differences between P1 and P4</h2>
      <p>Distance² = (Output A4 − Output A1)² + (Output B4 − Output B1)². This treats feature numbers with equal numerical weight; it is not a physical mixed-unit distance or learned feature importance.</p>
      {a.terms.map((term, i) => <p className={shared.math} data-scaling-term={i} key={i}>Feature {i === 0 ? "A" : "B"} term = ({number(a.values[3][i])} − {number(a.values[0][i])})² = {number(term)} · share {number(100 * a.shares[i])}%</p>)}
      <div className={styles.chart} ref={chartRef}>
        <svg data-scaling-chart viewBox={`0 0 ${chart.width} ${chart.height}`} role="img" aria-label={`Feature A contributes ${number(a.terms[0])}, ${number(100 * a.shares[0])}% of current squared distance. Feature B contributes ${number(a.terms[1])}, ${number(100 * a.shares[1])}%. Both bar widths use one 0 to 100% share axis. Exact values and identities are given in text and tables.`}>
          {chart.ticks.map(t => <g key={t.value}><line x1={t.x} x2={t.x} y1="24" y2="158" /><text x={t.x} y="190" textAnchor="middle">{t.value * 100}%</text></g>)}
          {chart.bars.map(b => <g key={b.id}><text x="12" y={b.y + 19}>{b.id === 0 ? "A" : "B"}</text><rect data-scaling-track={b.id} x={chart.left} y={b.y} width={chart.span} height={b.height} /><rect data-scaling-bar={b.id} x={b.x} y={b.y} width={b.width} height={b.height} /></g>)}
          <text x={(chart.left + chart.width - chart.right) / 2} y="221" textAnchor="middle">Share of current squared distance</text>
        </svg>
      </div>
      <p>Bars use a common share scale. Tiny and zero terms are not inflated. A different pair or scaling recipe can give different shares; these bars do not identify generally important features.</p>
    </section>
    <LessonSummaries label="Output column statistics and endpoint distance" summaries={[
      { label: "Output A mean", color: "#5031dc", value: Number(a.outputs[0].mean.toFixed(3)).toFixed(3), definition: "Average across the four transformed A values.", formula: `Population SD = ${number(a.outputs[0].std)}`, comparison: state.scenario === "constant" ? "A stays constant; scaling cannot create variation." : "Mean/SD depend on the chosen column recipe." },
      { label: "Output B mean", color: "#087c78", value: Number(a.outputs[1].mean.toFixed(3)).toFixed(3), definition: "Average across the four transformed B values.", formula: `Population SD = ${number(a.outputs[1].std)}`, comparison: "SD uses divisor 4, the reference case count." },
      { label: "P1/P4 distance²", color: "#ad4508", value: a.distanceSquared.toFixed(3), definition: "Sum of the two squared transformed feature differences.", formula: `${number(a.terms[0])} + ${number(a.terms[1])}`, comparison: "Numerical distance, not an accuracy or importance score." },
    ]} />
    <section className={shared.evidence} aria-label="Reference recipes and scaling limits">
      <details><summary>Reference statistics and recipes</summary>
        <div className={`${shared.tableScroll} ${styles.table}`} role="region" tabIndex={0} aria-label="Reference feature statistics and used recipes">
          <table><caption>Statistics use all four reference rows in the displayed units. Population SD = sqrt(sum((value − mean)²)/4). Zero range/SD uses denominator 1 after centering; it is not a unit-variance claim.</caption>
            <thead><tr>{["Feature", "Minimum", "Maximum", "Range", "Mean", "Population SD", "Used center", "Used denominator"].map(h => <th key={h} scope="col">{h}</th>)}</tr></thead>
            <tbody>{a.stats.map((s, i) => <tr key={i}><th scope="row">{i === 0 ? "A" : "B"}</th>{[s.min, s.max, s.range, s.mean, s.std, a.recipes[i].center, a.recipes[i].denominator].map((value, j) => <td key={j}>{number(value)}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </details>
      <details><summary>Construction and limits</summary>
        <p>Different units uses A [1,2,3,4]; Outlier uses A [1,2,3,20]; Constant feature uses A [2,2,2,2]. Base B is [100,150,350,400], multiplied uniformly by Feature B unit multiplier 1..10. Case identities stay P1..P4. Scenarios preserve method and multiplier; prediction changes and Reset restore the current experiment’s baseline. Parameter, scenario and method edits clear stale explanations.</p>
        <p>Raw uses output = x. Min–max uses (x − reference minimum)/(reference maximum − minimum). Z-score uses (x − reference mean)/reference population SD, with variance divisor 4. The reference rows are the fitting set here; a future preprocessing pipeline must fit on appropriate training data and reuse its recipe for held-out inputs. No editable unseen inputs or train/test evaluation is implemented.</p>
        <p>For zero range/SD, the used denominator is 1 after subtracting the center. Observed constant values map to zero, retaining zero output SD. Otherwise min–max bounds apply to these reference rows; values outside a fitted range need not stay in 0..1. Z-scores can be negative or exceed 1. Neither recipe removes outliers, makes data normal, equalizes distribution shapes or every pairwise contribution, adds information, or guarantees better model performance. “Normalization” here refers only to column min–max, not row unit norms.</p>
        <p>All numeric evidence is computed at full precision; displayed values are rounded. Only P1/P4 is compared in the contribution bars, on a common percentage scale. Summing differently measured raw feature numbers is a demonstration of numerical weighting, not a physical units statement. No model training, learned feature importance, robust/quantile transforms, arbitrary point/probe editing or automatic scaling-policy selection is implemented.</p>
        <a href="https://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.StandardScaler.html" target="_blank" rel="noreferrer">scikit-learn · Standardization and constant features</a><br />
        <a href="https://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.MinMaxScaler.html" target="_blank" rel="noreferrer">scikit-learn · Min–max reference ranges</a><br />
        <a href="https://scikit-learn.org/stable/auto_examples/preprocessing/plot_all_scaling.html" target="_blank" rel="noreferrer">scikit-learn · Scaling and outliers</a>
      </details>
    </section>
  </LearningPage>;
}
