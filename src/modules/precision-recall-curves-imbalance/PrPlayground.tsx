"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ExperimentButton, ExperimentChoices, ExperimentRail, ExperimentResult, LearningPage, LessonRangeControl, LessonSummaries, LessonToolbar } from "@/components/learning-page/learning-page";
import { GuidedExperiment } from "@/components/learning-page/guided-experiment";
import shared from "@/components/learning-page/learning-page.module.css";
import { analyzePr, prChart, prPercent as percent, prScenarios, prThreshold as threshold, type PrState } from "./pr-engine";
import { prBaseline, reachedPr } from "./lesson-state";
import { prExperiments } from "./learning-experiments";
import styles from "./playground.module.css";

export function PrPlayground() {
  const [state, setState] = useState(() => prBaseline());
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
  const a = useMemo(() => analyzePr(state), [state]);
  const chart = prChart(a, width), experiment = prExperiments[index], transfer = index === 3;
  const reached = !!prediction && !!experiment && reachedPr(index, state);
  const complete = reached && explanation === "0";
  function clear() { setExplanation(null); setTransferAnswer(null); }
  function start(next = index) { setIndex(next); setState(prBaseline(next)); setPrediction(null); clear(); }
  function edit(patch: Partial<PrState>) { setState(s => ({ ...s, ...patch })); clear(); }

  const rail = experiment ? <GuidedExperiment label={`Experiment ${index + 1} of 3`} experiment={experiment}
    reached={reached} complete={complete} prediction={prediction} explanation={explanation}
    predictionName="pr-prediction" explanationName="pr-explanation"
    onPredict={id => { start(); setPrediction(id); }} onExplain={setExplanation}
    predictionHelp={<>Changing prediction restores this experiment’s starting state. Reset restarts it.</>} observation={prediction === "0" ? "The evidence matches your prediction." : "The evidence challenges your prediction."}
    onNext={() => start(index + 1)} nextLabel={index === 2 ? "Try the transfer check" : "Next experiment"} /> : <ExperimentRail label={transfer ? "Transfer check" : "Free exploration"} title={transfer ? "Tied scores, new class balance" : "Read the whole score sweep"}>
    {transfer ? <>
      <p>Without Guide help, choose All tied, set Negative copies per score to 3, and set Decision threshold to 0.50. Reconstruct precision, recall and AP. Then reason about a cutoff above 0.50 without assigning perfect precision to no accepted cases.</p>
      {reachedPr(3, state) && <>
        <ExperimentChoices legend="Transfer explanation" name="pr-transfer" choices={[
          { id: "counts", label: "All 24 cases meet the inclusive cutoff: TP 6 and FP 18 give precision 6/24 = 25%, recall 6/6 = 100% and prevalence 25%. One tied group contributes AP 1 × 0.25 = 0.25. Above 0.50, none is accepted: recall is 0 and precision is undefined. The drawing endpoint (0,1) is not that threshold’s precision, and no cutoff separates equal scores." },
          { id: "empty", label: "Above 0.50, no prediction is positive, so precision is 100% and that is the selected point at (0,1)." },
          { id: "half", label: "A hard cutoff at the tied score picks half of each class, and AP must stay 0.50 regardless of prevalence." },
        ]} value={transferAnswer} onChange={setTransferAnswer} />
        {transferAnswer && (transferAnswer !== "counts" ? <p role="status" className={shared.feedback}>Try again. Count every tied case together; precision uses accepted cases and recall uses six actual positives. With none accepted, TP + FP = 0 and precision is undefined. AP’s one recall jump uses this class balance.</p> : <>
          <ExperimentResult title="Transfer explained">The tied-score AP equals this dataset’s prevalence, while precision at an empty prediction set is undefined. These finite results do not prove random score generation, calibration, task usefulness or future performance.</ExperimentResult>
          <ExperimentButton onClick={() => { setIndex(4); clear(); }}>Explore freely</ExperimentButton>
        </>)}
      </>}
    </> : <><p>Compare score rankings and class balances. Lowering a threshold cannot reduce recall here, but precision can rise, fall or stay fixed. AP changes with the dataset or ranking; one cutoff edit leaves it fixed.</p><ExperimentButton onClick={() => start(0)}>Restart experiments</ExperimentButton></>}
  </ExperimentRail>;

  return <LearningPage title="Precision-Recall Curves & Imbalance" subtitle="Make positives rare; inspect accepted predictions." rail={rail}>
    <LessonToolbar scenarios={prScenarios} selectedId={state.scenario} onSelect={scenario => edit({ scenario: scenario as PrState["scenario"] })} onReset={() => start(experiment || transfer ? index : 0)} />
    <section className={shared.evidence} aria-label="Class balance and precision-recall evidence">
      <h2>Your dataset</h2>
      <p>Six positive cases and six negative score types. Copy every negative score equally to change prevalence (the actual-positive fraction) while preserving each class’s score frequencies. Copies are illustrative accounting, not new independent observations. Scores are fixed ranking signals; score ≥ threshold predicts Positive, including equality.</p>
      <p role="status" data-pr-status className={shared.math}>6 positives · {a.negatives} negatives · prevalence {percent(a.prevalence)} · threshold {threshold(state.tick)} · TP {a.tp} · FP {a.fp} · FN {a.fn} · TN {a.tn} · precision {a.precision === null ? "undefined" : a.precision.toFixed(6)} · recall {a.recall.toFixed(6)} · AP {a.ap.toFixed(6)}</p>
      <div className={styles.chart} ref={chartRef}>
        <svg data-pr-chart viewBox={`0 0 ${chart.width} ${chart.height}`} role="img" aria-label={`Recall horizontally, precision vertically, both 0 to 1. ${chart.points.length} grouped score outcomes. Current threshold ${threshold(state.tick)}: recall ${a.recall.toFixed(6)}, precision ${a.precision === null ? "undefined; no operating diamond" : a.precision.toFixed(6)}. Average precision ${a.ap.toFixed(6)} from recall-weighted rectangles. Open square (0,1) is a drawing endpoint without a threshold. Exact tables follow.`}>
          {chart.ticks.map(t => <g key={t.value}>
            <line x1={chart.left} x2={chart.width - chart.right} y1={t.y} y2={t.y} />
            <line x1={t.x} x2={t.x} y1={chart.top} y2={chart.baseline} />
            <text x={chart.left - 12} y={t.y + 4} textAnchor="end">{t.value.toFixed(1)}</text>
            <text x={t.x} y={chart.baseline + 24} textAnchor="middle">{t.value.toFixed(1)}</text>
          </g>)}
          <text x="14" y={(chart.top + chart.baseline) / 2} transform={`rotate(-90 14 ${(chart.top + chart.baseline) / 2})`} textAnchor="middle">Precision</text>
          <text x={chart.width / 2} y={chart.height - 7} textAnchor="middle">Recall</text>
          {chart.rectangles.map(r => <rect key={r.id} data-pr-area={r.id} x={r.x} y={r.y} width={r.width} height={r.height} />)}
          <line data-pr-reference {...chart.reference} />
          <path data-pr-curve d={chart.path} />
          {chart.points.map(p => <circle key={p.id} data-pr-group={p.id} cx={p.cx} cy={p.cy} r="4" />)}
          <rect data-pr-endpoint {...chart.endpoint} />
          {chart.selected && <polygon data-pr-selected points={chart.selected.diamond} />}
        </svg>
      </div>
      <p>Circles = grouped threshold outcomes. Hollow diamond = current operating point. Pale rectangles = average precision (AP) weights. Dashed line = prevalence, the precision when all cases are predicted positive. Open square at (recall 0, precision 1) = drawing convention with no threshold. Steps summarize AP; intermediate points need not be attainable hard cutoffs.</p>
      {a.precision === null && <p role="status" data-pr-empty className={shared.math}>No predicted positives: precision = 0/0 is undefined, recall = 0/6 = 0. No operating diamond is drawn; the open square is not this threshold’s precision.</p>}
      <LessonRangeControl label="Negative copies per score" value={state.copies} min={1} max={4} step={1} help="Copy all six negative score types equally. Six positives remain fixed; negatives = 6 × copies. This changes prevalence and precision, not the positive scores or recall at a fixed threshold." onChange={copies => edit({ copies })} />
      <LessonRangeControl label="Decision threshold" value={state.tick / 20} min={0} max={1} step={.05} help="Score ≥ threshold predicts Positive. Equal scores enter together. Lowering the cutoff can raise, lower or preserve precision. A cutoff edit selects one point without changing AP." onChange={value => edit({ tick: Math.round(value * 20) })} />
      <p className={shared.math} data-pr-ap>AP = sum(recall increase × score-group precision) = {a.ap.toFixed(6)}. Non-interpolated recall weights; not trapezoidal PR area, ROC AUC or one cutoff’s precision.</p>
    </section>
    <LessonSummaries label="Current rates and whole-curve average precision" summaries={[
      { label: "Precision", color: "#ad4508", value: percent(a.precision), definition: "True positives among accepted predictions.", formula: `TP/(TP + FP) = ${a.tp}/${a.tp + a.fp}`, comparison: a.precision === null ? "Undefined: no prediction is positive." : "Uses predicted positives, not all cases." },
      { label: "Recall", color: "#087c78", value: percent(a.recall), definition: "Found actual positives among all six actual positives.", formula: `TP/(TP + FN) = ${a.tp}/6`, comparison: "Changing uniform negative copies preserves this rate." },
      { label: "Average precision", color: "#5031dc", value: a.ap.toFixed(3), definition: "Whole-curve summary from each score group’s precision weighted by its increase in recall.", formula: "AP = sum(Δrecall × precision)", comparison: "Depends on class balance; unchanged by one cutoff edit." },
    ]} />
    <section className={shared.evidence} aria-label="Case identities, AP construction and limits">
      <details><summary>Cases and decisions</summary>
        <div className={`${shared.tableScroll} ${styles.table}`} role="region" tabIndex={0} aria-label="Positive cases and negative copy identities">
          <table><caption>P1..P6 are fixed positives. N-type.copy identifies each illustrative negative copy. Score ≥ {threshold(state.tick)} predicts Positive.</caption>
            <thead><tr>{["Case", "Score", "Actual", "Predicted", "Confusion cell"].map(h => <th key={h} scope="col">{h}</th>)}</tr></thead>
            <tbody>{a.rows.map(r => <tr key={r.id}><th scope="row">{r.id}</th><td>{threshold(r.scoreTick)}</td><td>{r.actual ? "Positive" : "Negative"}</td><td>{r.predicted ? "Positive" : "Negative"}</td><td>{r.bucket}</td></tr>)}</tbody>
          </table>
        </div>
      </details>
      <details><summary>Score groups and AP</summary>
        <div className={`${shared.tableScroll} ${styles.table}`} role="region" tabIndex={0} aria-label="Grouped thresholds and average precision contributions">
          <table><caption>Distinct scores enter together in descending order. AP term = increase in recall × this group’s precision; zero recall-width contributes zero. The drawing endpoint has no threshold and no AP term.</caption>
            <thead><tr>{["Threshold", "TP", "FP", "Recall", "Precision", "Δrecall", "AP term"].map(h => <th key={h} scope="col">{h}</th>)}</tr></thead>
            <tbody>{a.groups.map(g => <tr key={g.tick}><th scope="row">{threshold(g.tick)}</th><td>{g.tp}</td><td>{g.fp}</td><td>{g.recall.toFixed(6)}</td><td>{g.precision.toFixed(6)}</td><td>{g.deltaRecall.toFixed(6)}</td><td>{g.apTerm.toFixed(6)}</td></tr>)}</tbody>
          </table>
          <p className={shared.math}>Sum of full-precision AP terms = {a.ap.toFixed(6)}. Displayed terms are rounded.</p>
        </div>
      </details>
      <details><summary>Construction and limits</summary>
        <p>Mostly ordered positive scores: 0.90, 0.80, 0.70, 0.70, 0.60, 0.40. Negative score types: 0.80, 0.50, 0.40, 0.30, 0.20, 0.10. Reversed uses 1 − score; All tied uses 0.50. Negative copies per score repeats each negative type equally, preserving both classes’ score distributions. Prevalence = 6/(6 + 6 × copies), from 50% at one copy to 20% at four. Scores and threshold compare on integer 0.05 ticks.</p>
        <p>Precision = TP/(TP + FP); recall = TP/6. With no accepted cases, precision is undefined. The open drawing square (0,1) has no threshold; it is not an observed precision of 1. If all cases are accepted, precision equals prevalence. Constant tied scores give one grouped recall jump and AP exactly equal to prevalence here, without proving random score generation.</p>
        <p>Descending score groups define non-interpolated AP = sum(Δrecall × current-group precision). Each rectangle uses the precision after that entire tied group enters. This differs from trapezoidal PR area, ROC AUC and an unweighted average of precision values. Recall cannot fall as a cutoff lowers, but precision can move either way. Step interiors and the drawing endpoint are not additional hard-threshold outcomes.</p>
        <p>No model training, calibration, error-cost policy, automatic optimal threshold, ROC plot, uncertainty or real independent sampling is implemented. Both actual classes are always present. Replication isolates class balance without enlarging the independent evidence. Representative evaluation data and task costs are needed beyond these finite values.</p>
        <a href="https://scikit-learn.org/stable/modules/generated/sklearn.metrics.precision_recall_curve.html" target="_blank" rel="noreferrer">scikit-learn · PR thresholds and drawing endpoint</a><br />
        <a href="https://scikit-learn.org/stable/modules/generated/sklearn.metrics.average_precision_score.html" target="_blank" rel="noreferrer">scikit-learn · Non-interpolated average precision</a><br />
        <a href="https://scikit-learn.org/stable/auto_examples/model_selection/plot_precision_recall.html" target="_blank" rel="noreferrer">scikit-learn · Precision-recall interpretation</a>
      </details>
    </section>
  </LearningPage>;
}
