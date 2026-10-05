"use client";

import { useMemo, useState } from "react";
import { DatasetHeading, ExperimentButton, ExperimentChoices, ExperimentRail, ExperimentResult, LearningPage, LessonSummaries, LessonToolbar, PointValueEditor } from "@/components/learning-page/learning-page";
import sharedStyles from "@/components/learning-page/learning-page.module.css";
import { NumberLinePoint, useNumberLineLayout } from "@/components/learning-page/number-line-controls";
import { analyzeSpread, clampValue, movePoint, type DataPoint, type SpreadAnalysis } from "./variance-standard-deviation-engine";
import { initialSpreadPreset, pointsForPreset, spreadPresets, type SpreadPreset } from "./scenario";
import { isEdgeExperiment, matchesPreset, spreadExperiments } from "./learning-experiments";
import styles from "./playground.module.css";

const position = (value: number) => ({ left: `${value}%` });
const signed = (value: number) => `${value > 0 ? "+" : ""}${Math.abs(value) < 0.05 ? "0.0" : value.toFixed(1)}`;

function DatasetChart({ points, analysis, selectedId, onSelect, onMove }: {
  points: DataPoint[]; analysis: SpreadAnalysis; selectedId: string;
  onSelect: (id: string) => void; onMove: (id: string, value: number) => void;
}) {
  const { trackRef, lanes } = useNumberLineLayout(points, 40);
  return <section className={styles.chart} aria-label="Interactive dataset">
    <DatasetHeading />
    <div className={styles.plotFrame}>
      <div className={styles.meanCaption}>Mean (average) <strong>{analysis.mean.toFixed(1)}</strong> · {analysis.count} points · values {analysis.min}–{analysis.max}</div>
      <div ref={trackRef} className={styles.plot} style={{ height: Math.max(96, lanes.count * 40 + 16) }}>
        <div className={styles.axis} />
        {[0, 25, 50, 75, 100].map((tick) => <span key={tick} className={styles.tick} style={position(tick)}><span>{tick}</span></span>)}
        <div className={styles.meanMarker} style={position(analysis.mean)} aria-hidden="true" />
        {points.map((point) => <NumberLinePoint key={point.id} point={point} selected={selectedId === point.id} valueText={`${point.label}: ${point.value}; deviation ${signed(point.value - analysis.mean)}`}
          helpId="spread-keyboard-help" trackRef={trackRef} onSelect={onSelect} onMove={onMove}
          style={{ bottom: 12 + (lanes.positions.get(point.id) ?? 0) * 40 }} />)}
      </div>
    </div>
  </section>;
}

function DeviationEvidence({ analysis, selectedId }: { analysis: SpreadAnalysis; selectedId: string }) {
  return <section className={sharedStyles.evidence} aria-labelledby="spread-evidence-title">
    <h2 id="spread-evidence-title">Distances from the mean</h2>
    <p>Subtract the mean, then square each deviation. Longer bars show larger distances.</p>
    <table className={styles.deviations}>
      <caption className={sharedStyles.srOnly}>Each point’s value, signed distance from the mean, and squared contribution to variance.</caption>
      <thead><tr><th scope="col">Point</th><th scope="col">Value</th><th scope="col">Deviation</th><th scope="col" className={styles.barColumn}>Distance</th><th scope="col">Squared</th></tr></thead>
      <tbody>{analysis.rows.map((row) => <tr key={row.point.id} data-selected={row.point.id === selectedId}>
        <th scope="row">{row.point.label}</th><td>{row.point.value}</td><td>{signed(row.deviation)}</td>
        <td className={styles.barColumn}><div className={styles.deviationTrack} aria-hidden="true"><span style={{ left: `${50 + Math.min(0, row.deviation) / 2}%`, width: `${Math.abs(row.deviation) / 2}%`, background: row.point.color }} /></div></td>
        <td>{row.squaredDeviation.toFixed(1)}</td>
      </tr>)}</tbody>
      <tfoot><tr><th colSpan={4} scope="row">Sum of squared deviations</th><td>{analysis.squaredDeviationSum.toFixed(1)}</td></tr></tfoot>
    </table>
    <p className={sharedStyles.small}>Deviation = value − mean. Negative means left of the mean; positive means right. The bars share a −100 to +100 scale with zero in the center.</p>
  </section>;
}

function SpreadComparison({ analysis }: { analysis: SpreadAnalysis }) {
  const comparisons = [{ label: "Current", analysis }, ...spreadPresets.map((preset) => ({ label: preset.label, analysis: analyzeSpread(pointsForPreset(preset)) }))];
  return <section className={styles.comparison} aria-labelledby="spread-comparison-title">
    <h2 id="spread-comparison-title">Same mean, different spread</h2><p>Standard deviation · preset means are 50; your edits may move the mean.</p>
    <dl>{comparisons.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.analysis.standardDeviation.toFixed(1)}</dd><dd className={sharedStyles.small}>mean {item.analysis.mean.toFixed(1)}</dd></div>)}</dl>
  </section>;
}

export function VarianceStandardDeviationPlayground() {
  const [preset, setPreset] = useState(initialSpreadPreset);
  const [points, setPoints] = useState(() => pointsForPreset(initialSpreadPreset));
  const [selectedId, setSelectedId] = useState("point-1");
  const [step, setStep] = useState(0);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [triedTight, setTriedTight] = useState(false);
  const [comparisonStage, setComparisonStage] = useState(0);
  const [finished, setFinished] = useState(false);
  const analysis = useMemo(() => analyzeSpread(points), [points]);
  const selected = points.find((point) => point.id === selectedId)!;
  const experiment = spreadExperiments[step]!;
  const reachedTarget = prediction !== null && (step === 0 ? triedTight && matchesPreset(points, "tight") : step === 1 ? comparisonStage === 2 && matchesPreset(points, "wide") : preset.id === "wide" && isEdgeExperiment(points));
  const complete = reachedTarget && explanation === experiment.correctExplanation;

  function clearProgress() {
    setPrediction(null); setExplanation(null); setTriedTight(false); setComparisonStage(0); setFinished(false);
  }
  function restore(nextPreset: SpreadPreset) {
    setPreset(nextPreset); setPoints(pointsForPreset(nextPreset)); setSelectedId("point-1"); setExplanation(null); setFinished(false);
  }
  function selectPreset(nextPreset: SpreadPreset) {
    restore(nextPreset);
    if (prediction) {
      setTriedTight(step === 0 && nextPreset.id === "tight");
      if (step === 1) setComparisonStage(nextPreset.id === "balanced" ? 1 : nextPreset.id === "wide" && comparisonStage >= 1 ? 2 : 0);
    }
  }
  function predict(id: string) {
    restore(spreadPresets[step === 2 ? 2 : 0]!); setPrediction(id); setTriedTight(false); setComparisonStage(0);
  }
  function move(id: string, value: number) {
    if (!Number.isFinite(value) || points.find((point) => point.id === id)?.value === clampValue(value)) return;
    setPoints((current) => movePoint(current, id, value)); setExplanation(null); setFinished(false);
    setTriedTight(false); setComparisonStage(0);
  }
  function reset() { restore(preset); clearProgress(); }
  function next() {
    const nextStep = step + 1; setStep(nextStep); restore(spreadPresets[nextStep === 2 ? 2 : 0]!); clearProgress();
  }
  const rail = <ExperimentRail label={`Experiment ${step + 1} of 3`} title={experiment.title} phase={!prediction ? 0 : !reachedTarget ? 1 : 2}>
      {!reachedTarget && <><h3>Make a prediction</h3><p>{experiment.question}</p>
        <ExperimentChoices legend="Your prediction" name="spread-prediction" choices={experiment.predictions} value={prediction} onChange={predict} /><p className={sharedStyles.small}>Choosing a prediction restores this experiment’s starting data.</p></>}
      {prediction && !reachedTarget && <div className={sharedStyles.actionPrompt}><strong>Now try it.</strong> {experiment.action}
        {step === 1 && comparisonStage === 1 && <p role="status">Balanced observed. Now choose Wide.</p>}
        <p className={sharedStyles.small}>Use the value field or arrow keys for an exact edit. Reset clears this attempt.</p>
      </div>}
      {reachedTarget && <><p className={sharedStyles.observation} role="status">{prediction === experiment.correctPrediction ? "Your prediction matches the result." : "The result differed from your prediction. Use the live evidence to investigate."}</p>
        <h3>{experiment.explanationQuestion}</h3>
        <ExperimentChoices legend="Your explanation" name="spread-explanation" choices={experiment.explanations} value={explanation} onChange={setExplanation} />{explanation && !complete && <p className={sharedStyles.feedback} role="status">Try again. {experiment.retryHint}</p>}
      </>}
      {complete && <ExperimentResult title={finished ? "All three experiments explained" : "Experiment explained"}>{experiment.takeaway}</ExperimentResult>}
      {complete && !finished && <ExperimentButton arrow onClick={() => step < 2 ? next() : setFinished(true)}>{step < 2 ? "Next experiment" : "Finish experiments"}</ExperimentButton>}
      {finished && complete && <ExperimentButton arrow onClick={() => { setStep(0); restore(initialSpreadPreset); clearProgress(); }}>Start again</ExperimentButton>}
    </ExperimentRail>;
  return <LearningPage title="Variance & Standard Deviation" subtitle="Move values. See distances become a measure of spread." rail={rail}>
    <LessonToolbar scenarios={spreadPresets} selectedId={preset.id}
      onSelect={(id) => selectPreset(spreadPresets.find((item) => item.id === id)!)} onReset={() => reset()} />
    <DatasetChart points={points} analysis={analysis} selectedId={selectedId} onSelect={setSelectedId} onMove={move} />
    <PointValueEditor label={selected.label} value={selected.value} helpId="spread-keyboard-help" onChange={(value) => move(selectedId, value)} />
    <DeviationEvidence analysis={analysis} selectedId={selectedId} />
    <LessonSummaries label="Live spread summaries" summaries={[
      { label: "Variance", color: "#ad4508", value: analysis.variance.toFixed(1), definition: "Average squared distance.", formula: `${analysis.squaredDeviationSum.toFixed(1)} ÷ ${analysis.count} = ${analysis.variance.toFixed(1)}`, comparison: "Measured in squared units." },
      { label: "Standard deviation", color: "#5031dc", value: analysis.standardDeviation.toFixed(1), definition: "Spread in the original units.", formula: `√${analysis.variance.toFixed(1)} ≈ ${analysis.standardDeviation.toFixed(1)}`, comparison: "A typical distance based on squared distances." },
    ]} />
    <p className={styles.populationNote}>These {analysis.count} values are the whole population here, so divide by {analysis.count}. This lesson describes the dataset; it does not estimate spread from a sample.</p>
    <SpreadComparison analysis={analysis} />
    <p className={sharedStyles.liveUpdate} role="status" aria-live="polite" aria-atomic="true">Mean {analysis.mean.toFixed(1)}; variance {analysis.variance.toFixed(1)} squared units; standard deviation {analysis.standardDeviation.toFixed(1)} original units.</p>
  </LearningPage>;
}
