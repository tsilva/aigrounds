"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ExperimentButton, ExperimentChoices, ExperimentRail, ExperimentResult, LearningPage, LessonRangeControl, LessonSelect, LessonSummaries, LessonToggleGroup, LessonToolbar } from "@/components/learning-page/learning-page";
import { GuidedExperiment } from "@/components/learning-page/guided-experiment";
import shared from "@/components/learning-page/learning-page.module.css";
import { analyzeCalibration, binInterval, calibrationNumber as number, calibrationPresetId, calibrationScenarios, confidencePresets, groupIds, reliabilityChart, setGroupConfidence, type BinCount, type CalibrationState, type GroupId } from "./calibration-engine";
import { calibrationBaseline, calibrationBaselineGroup, reachedCalibration, sameCalibration } from "./lesson-state";
import { calibrationExperiments } from "./learning-experiments";
import styles from "./playground.module.css";

type BinRow = ReturnType<typeof analyzeCalibration>["bins"][number];
function BinTable({ rows, denominator, retained = false }: { rows: BinRow[]; denominator: number; retained?: boolean }) {
  const label = retained ? "Retained confidence bins and accepted-denominator contributions" : "All confidence bins, observed frequencies and weighted contributions";
  return <div className={`${shared.tableScroll} ${styles.table}`} tabIndex={0} role="region" aria-label={label}><table><caption>Equal-width bins use lower-open, upper-closed intervals; the first includes zero. Mean confidence uses actual member values. Empty-bin means, accuracy and gaps are undefined, with zero contribution because count is zero. Weights use N/{denominator}.</caption><thead><tr>{["Bin", "Interval (%)", "N", "Mean confidence (%)", "Observed accuracy (%)", "Gap (pp)", "Contribution (pp)"].map(h => <th scope="col" key={h}>{h}</th>)}</tr></thead><tbody>{rows.map(b => <tr data-calibration-bin={retained ? undefined : b.bin} data-retained-bin={retained ? b.bin : undefined} key={b.bin}><th scope="row">{b.bin}</th><td>{binInterval(b.lower, b.upper)}</td><td>{b.count}</td><td>{number(b.confidence)}</td><td>{number(b.accuracy)}</td><td>{number(b.gap)}</td><td>{number(b.contribution)}</td></tr>)}</tbody></table></div>;
}

export function CalibrationPlayground() {
  const [state, setState] = useState<CalibrationState>(calibrationBaseline);
  const [selected, setSelected] = useState<GroupId>("D");
  const [width, setWidth] = useState(640);
  const [index, setIndex] = useState(0);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [transferAnswer, setTransferAnswer] = useState<string | null>(null);
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
  const a = useMemo(() => analyzeCalibration(state), [state]);
  const chart = reliabilityChart(a, width), experiment = calibrationExperiments[index], transfer = index === 3;
  const preset = calibrationPresetId(state);
  const reached = !!prediction && !!experiment && reachedCalibration(index, state), complete = reached && explanation === "0";
  function clear() { setExplanation(null); setTransferAnswer(null); }
  function start(next = index) {
    setIndex(next); setState(calibrationBaseline()); setSelected(calibrationBaselineGroup()); setPrediction(null); clear();
  }
  function edit(next: CalibrationState) {
    if (sameCalibration(state, next)) return;
    setState(next); clear();
  }
  const rail = experiment ? <GuidedExperiment label={`Experiment ${index + 1} of 3`} experiment={experiment}
    reached={reached} complete={complete} prediction={prediction} explanation={explanation}
    predictionName="calibration-prediction" explanationName="calibration-explanation"
    onPredict={id => { start(); setPrediction(id); }} onExplain={setExplanation}
    predictionHelp={<>Changing prediction restores original Mixed confidence, Bin count 10, threshold 50 and selected D. Reset restarts the current experiment.</>} observation={prediction === "0" ? "The evidence matches your prediction." : "The evidence challenges your prediction."}
    onNext={() => start(index + 1)} nextLabel={index === 2 ? "Try the transfer check" : "Next experiment"} /> : <ExperimentRail label={transfer ? "Transfer check" : "Free exploration"} title={transfer ? "Read an empty retained set" : "Separate grouping, confidence and selection"}>
    {transfer ? <><p>Without Guide help, keep original Mixed confidence values 65, 75, 85, 95. Set Bin count to 5 and Abstention threshold (%) to 100, in either order. Reconstruct all-example ECE, full accuracy, coverage and the meaning of retained accuracy and retained ECE.</p>
      {reachedCalibration(3, state) && <><ExperimentChoices legend="Transfer explanation" name="calibration-transfer" choices={[
        { id: "empty", label: "Coarser bins give all-example ECE 10 pp while the original full accuracy stays 14/20=70%. No confidence reaches the inclusive 100% threshold: 0/20 are kept, so coverage is 0%. Retained accuracy and retained ECE are undefined because their denominator is zero; abstaining on everything does not prove perfect accuracy or calibration. The all-example diagram still uses all 20 predictions." },
        { id: "perfect", label: "No accepted mistakes means retained accuracy is 100% and retained ECE is zero." },
        { id: "changed", label: "The threshold removes all points from the all-example diagram and changes full accuracy to zero." },
      ]} value={transferAnswer} onChange={setTransferAnswer} />{transferAnswer && (transferAnswer !== "empty" ? <p role="status" className={shared.feedback}>Try again. An empty denominator gives no retained accuracy or calibration estimate. Keep the all-example quantities separate from the retained subset.</p> : <><ExperimentResult title="Transfer explained">Report coverage beside retained metrics. Empty selection produces undefined retained rates, while coarser grouping changes the all-example ECE estimate without changing any label.</ExperimentResult><ExperimentButton onClick={() => { setIndex(4); clear(); }}>Explore freely</ExperimentButton></>)}</>}
    </> : <><p>Compare One confidence and Certain predictions, inspect empty bins, or change one group. Try a threshold equal to a confidence and a threshold above every confidence. Watch accepted counts and their denominators. Zero binned ECE in these toy cases is not proof of population or subgroup calibration.</p><ExperimentButton onClick={() => start(0)}>Restart experiments</ExperimentButton></>}
  </ExperimentRail>;
  return <LearningPage title="Calibration & Reliability Diagrams" subtitle="Compare confidence with observed correctness." rail={rail}>
    <LessonToolbar scenarios={calibrationScenarios} selectedId={preset} onSelect={id => { edit({ confidence: confidencePresets[id as keyof typeof confidencePresets], bins: 10, threshold: 50 }); setSelected("D"); }} onReset={() => start(experiment || transfer ? index : 0)} />
    <section className={shared.evidence} aria-label="Grouped confidence editor and all-example reliability diagram"><h2>Your dataset</h2>
      <p>Twenty authored binary predictions form four groups of five. Every selected label is 1; known correct counts A/B/C/D are 3, 4, 5, 2. Confidence is P(1), with P(0) as its complement. Editing a group changes five probabilities while keeping selected labels and known outcomes fixed. Full accuracy stays 14/20=70%.</p>
      <div className={styles.chart} ref={chartRef}><svg data-calibration-chart viewBox={`0 0 ${chart.width} ${chart.height}`} role="img" aria-label="All-20 reliability diagram: actual mean confidence against observed accuracy, both zero to one hundred percent. Each populated bin is one point; empty bins have no point. Exact counts and gaps are in the bin table.">
        {chart.ticks.map(t => <g key={t.value}><line x1={t.x} x2={t.x} y1={chart.top} y2={chart.top + chart.plotHeight} /><text x={t.x} y="241" textAnchor="middle">{t.value}</text><text x={chart.left - 10} y={t.y + 4} textAnchor="end">{t.value}</text></g>)}
        <line data-calibration-diagonal {...chart.diagonal} className={styles.diagonal} />
        {chart.points.map(p => <g key={p.bin} data-calibration-point={p.bin}><title>{`Bin ${p.bin} ${binInterval(p.lower, p.upper)}: N=${p.count}, mean confidence ${number(p.confidence)}%, observed accuracy ${number(p.accuracy)}%, gap ${number(p.gap)} pp`}</title><line data-calibration-gap x1={p.x} x2={p.x} y1={p.y} y2={p.diagonalY} className={styles.gap} /><circle cx={p.x} cy={p.y} r="5" className={styles.point} /></g>)}
        <text x={chart.left + chart.span / 2} y="266" textAnchor="middle">Mean confidence (%)</text><text x="12" y="120" transform="rotate(-90 12 120)" textAnchor="middle">Observed accuracy (%)</text>
      </svg></div>
      <p>The diagonal means equal mean confidence and observed accuracy. Vertical gaps compare those values; points use actual means, not bin midpoints. The diagram and all-example ECE always use all 20 predictions, including rejected ones.</p>
      <div className={shared.controlGrid}><LessonSelect label="Selected group" value={selected} choices={groupIds.map(id => ({ id, label: id }))} onChange={id => setSelected(id as GroupId)} /><LessonRangeControl label="Group confidence (%)" value={state.confidence[groupIds.indexOf(selected)]} min={50} max={100} step={5} help={`Edit only group ${selected}’s five confidence values. Selected labels and known outcomes stay fixed.`} onChange={value => edit(setGroupConfidence(state, selected, value))} /><div><LessonToggleGroup label="Bin count" choices={[{ id: "5", label: "5" }, { id: "10", label: "10" }]} value={String(state.bins)} onChange={v => edit({ ...state, bins: Number(v) as BinCount })} /><p>Equal-width bins over 0..100. Exact upper boundaries belong to the bin on their left.</p></div><LessonRangeControl label="Abstention threshold (%)" value={state.threshold} min={50} max={100} step={5} help="Keep confidence greater than or equal to the cutoff. This selects existing predictions; it does not reclassify them." onChange={threshold => edit({ ...state, threshold })} /></div>
      <p role="status" data-calibration-status className={shared.math}>{preset === "custom" ? "Custom settings" : calibrationScenarios.find(s => s.id === preset)!.label} · Confidences ({state.confidence.join(", ")}) · {state.bins} bins · Threshold {state.threshold}% · Selected editor {selected} · Full accuracy 14/20=70% · Kept {a.keptCount}/20</p><p>Selected group only inspects and preserves answers. Actual confidence, bin-count or threshold changes clear stale explanations. At exact 50/50 this demo consistently selects label 1; both probabilities tie.</p>
    </section>
    <section className={shared.evidence} aria-label="Fixed group outcomes and confidence selection"><h2>Group evidence</h2><div className={`${shared.tableScroll} ${styles.table}`} tabIndex={0} role="region" aria-label="All four confidence groups, fixed correctness counts and accepted flags"><table><caption>All five predictions in each group select label 1. Correct count equals the number of known label-1 outcomes; the remaining outcomes have known label 0. Counts never change when confidence, bins or thresholds change.</caption><thead><tr>{["Group", "N", "P(0) (%)", "P(1) / confidence (%)", "Correct", "Accuracy (%)", "Bin", "Kept?"].map(h => <th scope="col" key={h}>{h}</th>)}</tr></thead><tbody>{a.groups.map(g => <tr data-calibration-group={g.id} key={g.id}><th scope="row">{g.id}</th><td>{g.count}</td><td>{g.p0}</td><td>{g.confidence}</td><td>{g.correct}</td><td>{g.accuracy}</td><td>{g.bin}</td><td>{g.kept ? "Yes" : "No"}</td></tr>)}</tbody></table></div></section>
    <section className={shared.evidence} aria-label="All-example confidence bins and expected calibration error"><h2>All confidence bins</h2><BinTable rows={a.bins} denominator={20} /><p data-calibration-ece className={shared.math}>All-example ECE = Σ (N / 20) × |mean confidence − observed accuracy| = {number(a.ece)} pp. Contributions: {a.bins.map(b => number(b.contribution)).join(" + ")}.</p><p>pp means percentage points, not relative percent change. This is an empirical binned estimate; fewer or merged bins can hide opposing gaps without changing predictions. Zero ECE here does not establish population, subgroup or individual calibration.</p></section>
    <LessonSummaries label="All-example calibration error, coverage and retained accuracy" summaries={[
      { label: "All-example ECE", color: "#5031dc", value: `${number(a.ece)} pp`, definition: "Count-weighted absolute bin gaps on all 20 examples.", formula: "Σ (N / 20) × |confidence − accuracy|", comparison: "Binning affects the estimate; unchanged labels can give different ECE." },
      { label: "Coverage", color: "#087c78", value: `${number(a.coverage)}%`, definition: "Fraction of examples kept at the confidence cutoff.", formula: `${a.keptCount} / 20 kept`, comparison: "The cutoff selects a subset; it does not change the all-example diagram or correctness." },
      { label: "Retained accuracy", color: "#ad4508", value: a.retainedAccuracy === null ? "Undefined" : `${number(a.retainedAccuracy)}%`, definition: "Correct label fraction among the accepted examples.", formula: a.keptCount ? `${a.keptCorrect} / ${a.keptCount} correct` : "No accepted examples; denominator 0", comparison: "A higher confidence threshold does not guarantee higher retained accuracy." },
    ]} />
    <section className={shared.evidence} aria-label="Retained-subset calibration calculation"><p data-retained-ece className={shared.math}>Retained ECE: {a.retainedECE === null ? "Undefined (no accepted examples)" : `${number(a.retainedECE)} pp, with accepted denominator ${a.keptCount}`}. Full accuracy remains 70% on all 20.</p><details><summary>Retained bin calculation</summary>{a.keptCount ? <BinTable rows={a.retainedBins} denominator={a.keptCount} retained /> : <p>No predictions are kept. Retained accuracy and retained ECE are undefined; an empty set is not evidence of perfect calibration or accuracy.</p>}</details></section>
    <section className={shared.evidence} aria-label="Calibration construction and limits"><details><summary>Construction and limits</summary><p>Four groups each contain five toy predictions. Known correct counts are 3, 4, 5, 2, totaling 14/20. Confidence ranges 50..100 in steps of 5, representing P(1); P(0)=100−P(1). Predicted label 1 stays fixed, including the explicit 50/50 tie convention. For this special all-label-1 dataset, positive frequency equals selected-label correctness. General top-label calibration compares selected-label confidence with selected-label correctness.</p><p>Bin count is 5 or 10 over the full 0..100 range. Intervals are (lower,upper], except [0,upper] for the first. Every case belongs to exactly one bin, including 100%. Each nonempty bin uses its actual sample mean confidence and correct-count fraction. ECE weights its absolute gap by N/20 and reports percentage points. Empty-bin confidence, accuracy and gap are undefined; zero count gives zero contribution and no plotted point.</p><p>Abstention keeps confidence≥threshold, including equality. Coverage divides accepted count by all 20. Retained accuracy divides correct accepted count by accepted count; retained ECE uses the same bin edges with accepted-count weights. With no accepted examples both retained metrics are undefined. The all-20 diagram, full accuracy and all-example ECE remain independent of the threshold.</p><p>These finite, hand-authored examples illustrate reporting and aggregation. Manually changing confidence after seeing outcomes is not a fitting or evaluation procedure. Small bins and grouping can hide errors; no confidence intervals, fitted calibrator, representative held-out evidence or population guarantee are supplied. An LLM’s stated confidence is not automatically an empirically calibrated probability; this lesson does not query an LLM or grade generated answers.</p><p>Prediction and Reset restore Mixed confidence, 10 bins, threshold 50 and editor D for the current experiment. Actual confidence/bin/threshold edits clear stale answers; inspection and unchanged edits preserve them. Free-exploration Reset begins Experiment 1.</p><a href="https://proceedings.mlr.press/v70/guo17a.html" target="_blank" rel="noreferrer">Guo et al. · Top-label reliability bins and count-weighted ECE</a><br /><a href="https://scikit-learn.org/stable/modules/calibration.html" target="_blank" rel="noreferrer">scikit-learn · Empirical reliability curves and independent calibration data</a></details></section>
  </LearningPage>;
}
