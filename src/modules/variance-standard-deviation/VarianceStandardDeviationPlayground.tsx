"use client";

import { ArrowPathIcon, ArrowRightIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { ExperimentProgress, GuideInvitation, LearningPage, LessonSummaries } from "@/components/learning-page/learning-page";
import sharedStyles from "@/components/learning-page/learning-page.module.css";
import { clientXToPercentValue } from "@/lib/number-line";
import { analyzeSpread, clampValue, movePoint, type DataPoint, type SpreadAnalysis } from "./variance-standard-deviation-engine";
import { initialSpreadPreset, pointsForPreset, spreadPresets, type SpreadPreset } from "./scenario";
import { isEdgeExperiment, matchesPreset, pointLanes, spreadExperiments } from "./learning-experiments";
import localStyles from "./playground.module.css";

const styles = { ...sharedStyles, ...localStyles };
const position = (value: number) => ({ left: `${value}%` });
const signed = (value: number) => `${value > 0 ? "+" : ""}${Math.abs(value) < 0.05 ? "0.0" : value.toFixed(1)}`;

function DatasetChart({ points, analysis, selectedId, onSelect, onMove }: {
  points: DataPoint[]; analysis: SpreadAnalysis; selectedId: string;
  onSelect: (id: string) => void; onMove: (id: string, value: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<string | null>(null);
  const [width, setWidth] = useState(600);
  useEffect(() => {
    if (!trackRef.current) return;
    const observer = new ResizeObserver(([entry]) => { if (entry) setWidth(entry.contentRect.width); });
    observer.observe(trackRef.current);
    return () => observer.disconnect();
  }, []);
  const lanes = useMemo(() => pointLanes(points, width), [points, width]);
  return <section className={styles.chart} aria-label="Interactive dataset">
    <div className={styles.chartHeading}><h2>Your dataset</h2><span>Drag a dot to change its value</span></div>
    <div className={styles.plotFrame}>
      <div className={styles.meanCaption}>Mean (average) <strong>{analysis.mean.toFixed(1)}</strong> · {analysis.count} points · values {analysis.min}–{analysis.max}</div>
      <div ref={trackRef} className={styles.plot} style={{ height: Math.max(96, lanes.count * 40 + 16) }}>
        <div className={styles.axis} />
        {[0, 25, 50, 75, 100].map((tick) => <span key={tick} className={styles.tick} style={position(tick)}><span>{tick}</span></span>)}
        <div className={styles.meanMarker} style={position(analysis.mean)} aria-hidden="true" />
        {points.map((point) => <button key={point.id} type="button" role="slider" aria-label={`Point ${point.label}`}
          aria-valuemin={0} aria-valuemax={100} aria-valuenow={point.value} aria-valuetext={`${point.label}: ${point.value}; deviation ${signed(point.value - analysis.mean)}`}
          aria-describedby="spread-keyboard-help" className={styles.point} data-selected={selectedId === point.id}
          style={{ ...position(point.value), bottom: 12 + (lanes.positions.get(point.id) ?? 0) * 40, "--point-color": point.color } as CSSProperties}
          onFocus={() => onSelect(point.id)} onPointerDown={(event) => {
            event.preventDefault(); event.currentTarget.focus(); event.currentTarget.setPointerCapture(event.pointerId);
            dragging.current = point.id; onSelect(point.id);
          }} onPointerMove={(event) => {
            if (dragging.current === point.id && trackRef.current) onMove(point.id, clientXToPercentValue(event.clientX, trackRef.current.getBoundingClientRect()));
          }} onPointerUp={() => { dragging.current = null; }} onPointerCancel={() => { dragging.current = null; }}
          onLostPointerCapture={() => { dragging.current = null; }} onKeyDown={(event) => {
            const step = event.shiftKey ? 10 : 1;
            const changes: Record<string, number> = { ArrowLeft: -step, ArrowDown: -step, ArrowRight: step, ArrowUp: step };
            if (event.key in changes || event.key === "Home" || event.key === "End") {
              event.preventDefault(); onMove(point.id, event.key === "Home" ? 0 : event.key === "End" ? 100 : point.value + changes[event.key]!);
            }
          }}><span>{point.value}</span><small>{point.label}</small></button>)}
      </div>
    </div>
  </section>;
}

function DeviationEvidence({ analysis, selectedId }: { analysis: SpreadAnalysis; selectedId: string }) {
  return <section className={styles.evidence} aria-labelledby="spread-evidence-title">
    <h2 id="spread-evidence-title">Distances from the mean</h2>
    <p>Subtract the mean, then square each deviation. Longer bars show larger distances.</p>
    <table className={styles.deviations}>
      <caption className={styles.srOnly}>Each point’s value, signed distance from the mean, and squared contribution to variance.</caption>
      <thead><tr><th scope="col">Point</th><th scope="col">Value</th><th scope="col">Deviation</th><th scope="col" className={styles.barColumn}>Distance</th><th scope="col">Squared</th></tr></thead>
      <tbody>{analysis.rows.map((row) => <tr key={row.point.id} data-selected={row.point.id === selectedId}>
        <th scope="row">{row.point.label}</th><td>{row.point.value}</td><td>{signed(row.deviation)}</td>
        <td className={styles.barColumn}><div className={styles.deviationTrack} aria-hidden="true"><span style={{ left: `${50 + Math.min(0, row.deviation) / 2}%`, width: `${Math.abs(row.deviation) / 2}%`, background: row.point.color }} /></div></td>
        <td>{row.squaredDeviation.toFixed(1)}</td>
      </tr>)}</tbody>
      <tfoot><tr><th colSpan={4} scope="row">Sum of squared deviations</th><td>{analysis.squaredDeviationSum.toFixed(1)}</td></tr></tfoot>
    </table>
    <p className={styles.small}>Deviation = value − mean. Negative means left of the mean; positive means right. The bars share a −100 to +100 scale with zero in the center.</p>
  </section>;
}

function SpreadComparison({ analysis }: { analysis: SpreadAnalysis }) {
  const comparisons = [{ label: "Current", analysis }, ...spreadPresets.map((preset) => ({ label: preset.label, analysis: analyzeSpread(pointsForPreset(preset)) }))];
  return <section className={styles.comparison} aria-labelledby="spread-comparison-title">
    <h2 id="spread-comparison-title">Same mean, different spread</h2><p>Standard deviation · preset means are 50; your edits may move the mean.</p>
    <dl>{comparisons.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.analysis.standardDeviation.toFixed(1)}</dd><dd className={styles.small}>mean {item.analysis.mean.toFixed(1)}</dd></div>)}</dl>
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
  const rail = <aside className={styles.rail} aria-label="Guided experiment">
    <p className={styles.eyebrow}>Experiment {step + 1} of 3</p><h2 className={styles.experimentTitle}>{experiment.title}</h2>
    <ExperimentProgress phase={!prediction ? 0 : !reachedTarget ? 1 : 2} />
    <div className={styles.exercise}>
      {!reachedTarget && <><h3>Make a prediction</h3><p>{experiment.question}</p>
        <fieldset className={styles.choices}><legend className={styles.srOnly}>Your prediction</legend>
          {experiment.predictions.map((choice) => <label key={choice.id}><input type="radio" name="spread-prediction" checked={prediction === choice.id} onChange={() => predict(choice.id)} />{choice.label}</label>)}
        </fieldset><p className={styles.small}>Choosing a prediction restores this experiment’s starting data.</p></>}
      {prediction && !reachedTarget && <div className={styles.actionPrompt}><strong>Now try it.</strong> {experiment.action}
        {step === 1 && comparisonStage === 1 && <p role="status">Balanced observed. Now choose Wide.</p>}
        <p className={styles.small}>Use the value field or arrow keys for an exact edit. Reset clears this attempt.</p>
      </div>}
      {reachedTarget && <><p className={styles.observation} role="status">{prediction === experiment.correctPrediction ? "Your prediction matches the result." : "The result differed from your prediction. Use the live evidence to investigate."}</p>
        <h3>{experiment.explanationQuestion}</h3>
        <fieldset className={styles.choices}><legend className={styles.srOnly}>Your explanation</legend>
          {experiment.explanations.map((choice) => <label key={choice.id}><input type="radio" name="spread-explanation" checked={explanation === choice.id} onChange={() => setExplanation(choice.id)} />{choice.label}</label>)}
        </fieldset>{explanation && !complete && <p className={styles.feedback} role="status">Try again. {experiment.retryHint}</p>}
      </>}
      {complete && <div className={styles.takeaway} role="status"><CheckCircleIcon aria-hidden="true" /><div><h3>{finished ? "All three experiments explained" : "Experiment explained"}</h3><p>{experiment.takeaway}</p></div></div>}
      {complete && !finished && <button type="button" className={styles.nextButton} onClick={() => step < 2 ? next() : setFinished(true)}>{step < 2 ? "Next experiment" : "Finish experiments"}<ArrowRightIcon aria-hidden="true" /></button>}
      {finished && complete && <button type="button" className={styles.nextButton} onClick={() => { setStep(0); restore(initialSpreadPreset); clearProgress(); }}>Start again<ArrowRightIcon aria-hidden="true" /></button>}
    </div><GuideInvitation />
  </aside>;
  return <LearningPage title="Variance & Standard Deviation" subtitle="Move values. See distances become a measure of spread." rail={rail}>
    <div className={styles.toolbar}><div className={styles.presets} aria-label="Dataset scenarios">
      {spreadPresets.map((item) => <button key={item.id} type="button" aria-pressed={preset.id === item.id} onClick={() => selectPreset(item)}><strong>{item.label}</strong><span>{item.shortLabel}</span></button>)}
    </div><button type="button" className={styles.reset} onClick={reset}><ArrowPathIcon aria-hidden="true" />Reset</button></div>
    <DatasetChart points={points} analysis={analysis} selectedId={selectedId} onSelect={setSelectedId} onMove={move} />
    <div className={styles.pointEditor}><label>Point {selected.label} value<input type="number" min={0} max={100} step={1} value={selected.value} onChange={(event) => move(selectedId, event.currentTarget.valueAsNumber)} /></label>
      <p id="spread-keyboard-help">Focus a dot and use arrow keys. Shift moves by 10; Home / End moves to 0 / 100.</p>
    </div>
    <DeviationEvidence analysis={analysis} selectedId={selectedId} />
    <LessonSummaries label="Live spread summaries" summaries={[
      { label: "Variance", color: "#ad4508", value: analysis.variance.toFixed(1), definition: "Average squared distance.", formula: `${analysis.squaredDeviationSum.toFixed(1)} ÷ ${analysis.count} = ${analysis.variance.toFixed(1)}`, comparison: "Measured in squared units." },
      { label: "Standard deviation", color: "#5031dc", value: analysis.standardDeviation.toFixed(1), definition: "Spread in the original units.", formula: `√${analysis.variance.toFixed(1)} ≈ ${analysis.standardDeviation.toFixed(1)}`, comparison: "A typical distance based on squared distances." },
    ]} />
    <p className={styles.populationNote}>These {analysis.count} values are the whole population here, so divide by {analysis.count}. This lesson describes the dataset; it does not estimate spread from a sample.</p>
    <SpreadComparison analysis={analysis} />
    <p className={styles.liveUpdate} role="status" aria-live="polite" aria-atomic="true">Mean {analysis.mean.toFixed(1)}; variance {analysis.variance.toFixed(1)} squared units; standard deviation {analysis.standardDeviation.toFixed(1)} original units.</p>
  </LearningPage>;
}
