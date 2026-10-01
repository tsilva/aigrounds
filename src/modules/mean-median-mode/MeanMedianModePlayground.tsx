"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { NumberLinePoint, useNumberLineLayout } from "@/components/learning-page/number-line-controls";
import { pointLanes } from "@/lib/number-line";
import { DatasetHeading, ExperimentButton, ExperimentChoices, ExperimentRail, ExperimentResult, LearningPage, LessonSummaries, LessonToolbar, PointValueEditor } from "@/components/learning-page/learning-page";
import sharedStyles from "@/components/learning-page/learning-page.module.css";
import { analyzeTypicalValues, clampValue, movePoint, type DataPoint, type TypicalValuesAnalysis } from "./mean-median-mode-engine";
import { initialTypicalPreset, pointsForPreset, typicalPresets, type TypicalPreset } from "./scenario";
import { isExperimentDataset, learningExperiments, type LearningExperiment } from "./learning-experiments";
import styles from "./playground.module.css";

const ticks = [0, 25, 50, 75, 100];
const colors = { mean: "#1760db", median: "#5031dc", mode: "#976000" };
const formatValue = (value: number) => Number.isInteger(value) ? String(value) : value.toFixed(1);
const position = (value: number) => ({ left: `${value}%` });

function DatasetChart({ points, analysis, selectedId, onSelect, onMove }: {
  points: DataPoint[]; analysis: TypicalValuesAnalysis; selectedId: string;
  onSelect: (id: string) => void; onMove: (id: string, value: number) => void;
}) {
  const { trackRef, width, lanes } = useNumberLineLayout(points, 36, 800);
  const chartHeight = Math.max(132, lanes.count * 36 + 16);
  const markers = [
    { label: "Mean", values: [analysis.mean], color: colors.mean },
    { label: "Median", values: [analysis.median], color: colors.median },
    { label: "Mode", values: analysis.modeValues, color: colors.mode },
  ];
  return (
    <section className={styles.chart} aria-label="Interactive dataset and summary number lines">
      <DatasetHeading />
      <div className={styles.plotFrame}>
        <div ref={trackRef} className={styles.plot} style={{ height: chartHeight }}>
          <div className={styles.axis} />
          {ticks.map((tick) => <span key={tick} className={styles.tick} style={position(tick)}><span>{tick}</span></span>)}
          {points.map((point) => <NumberLinePoint key={point.id} point={point} selected={selectedId === point.id} mode={analysis.modeValues.includes(point.value)}
          helpId="dataset-keyboard-help" trackRef={trackRef} onSelect={onSelect} onMove={onMove}
          style={{ bottom: 12 + (lanes.positions.get(point.id) ?? 0) * 36 }} />)}
        </div>
        <div className={styles.markerTracks} aria-hidden="true">
          {markers.map((marker) => {
            const layout = pointLanes(marker.values.map((value) => ({ id: String(value), value })), width, 18);
            return <div key={marker.label} className={styles.markerLane} style={{ "--marker-color": marker.color, height: 16 + Math.max(0, layout.count - 1) * 18 } as CSSProperties}>
            <span className={styles.markerLabel}>{marker.label}</span><div className={styles.markerAxis} />
            {marker.values.map((value) => <span key={value} className={styles.marker} style={{ ...position(value), top: 7 + (layout.positions.get(String(value)) ?? 0) * 18 }} />)}
            {!marker.values.length && <span className={styles.noMarker}>No repeated value</span>}
          </div>; })}
        </div>
      </div>
    </section>
  );
}

function Summaries({ analysis }: { analysis: TypicalValuesAnalysis }) {
  return <LessonSummaries label="Live summaries" summaries={[
      { label: "Mean", color: colors.mean, value: analysis.mean.toFixed(1), definition: "The average of all values.", formula: `${analysis.sum} ÷ ${analysis.count} = ${analysis.mean.toFixed(1)}` },
      { label: "Median", color: colors.median, value: formatValue(analysis.median), definition: "The middle value when sorted.", formula: `${Math.floor(analysis.count / 2) + 1}th sorted value = ${formatValue(analysis.median)}` },
      { label: "Mode", color: colors.mode, value: analysis.modeValues.length ? analysis.modeValues.join(", ") : "None", definition: "The most frequent value.", formula: analysis.modeValues.length ? `Each appears ${analysis.modeFrequency} times` : "No values repeat" },
    ]} />;
}

function TypicalExperiment({ experiment, points, preset, prediction, explanation, onPredict, onExplain, onNext }: {
  experiment: LearningExperiment; points: DataPoint[]; preset: TypicalPreset; prediction: string | null; explanation: string | null;
  onPredict: (id: string) => void; onExplain: (id: string) => void; onNext: () => void;
}) {
  const reachedTarget = prediction !== null && isExperimentDataset(points, preset, experiment);
  const complete = reachedTarget && explanation === experiment.correctExplanation;
  const phase = !prediction ? 0 : !reachedTarget ? 1 : 2;
  return <ExperimentRail label={`Experiment ${typicalPresets.findIndex((item) => item.id === preset.id) + 1} of ${typicalPresets.length}`} title={experiment.title} phase={phase}>
      <h3>{reachedTarget ? "What did you notice?" : "Make a prediction"}</h3>
      {!reachedTarget && <>
        <p>{experiment.question}</p>
        <ExperimentChoices legend="Your prediction" name="prediction" choices={experiment.predictions} value={prediction} onChange={onPredict} />
        <p className={sharedStyles.small}>Choosing a prediction restores the starting dataset.</p>
      </>}
      {prediction && !reachedTarget && <div className={sharedStyles.actionPrompt}>
        <p><strong>Now try it.</strong> Move point {experiment.pointLabel} to {experiment.target}. Watch the three summaries.</p>
        <p className={sharedStyles.small}>Change only this point. Use its value field for an exact position, or Reset to start again.</p>
      </div>}
      {reachedTarget && <>
        <p className={sharedStyles.observation} role="status">{prediction === experiment.correctPrediction ? "Your prediction matches the result." : "The result differed from your prediction. Use the live values to investigate."}</p>
        <h3>{experiment.explanationQuestion}</h3>
        <ExperimentChoices legend="Your explanation" name="explanation" choices={experiment.explanations} value={explanation} onChange={onExplain} />
        {explanation && !complete && <p className={sharedStyles.feedback} role="status">Try again. {experiment.retryHint}</p>}
      </>}
      {complete && <ExperimentResult>{experiment.takeaway}</ExperimentResult>}
      {complete && <ExperimentButton arrow onClick={onNext}>Try another dataset</ExperimentButton>}
    </ExperimentRail>;
}

export function MeanMedianModePlayground() {
  const [preset, setPreset] = useState(initialTypicalPreset);
  const [points, setPoints] = useState(() => pointsForPreset(initialTypicalPreset));
  const [selectedId, setSelectedId] = useState("point-9");
  const [prediction, setPrediction] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const analysis = useMemo(() => analyzeTypicalValues(points), [points]);
  const experiment = learningExperiments[preset.id]!;
  const selected = points.find((point) => point.id === selectedId)!;
  const sorted = [...points].sort((a, b) => a.value - b.value);
  function reset(nextPreset = preset) {
    setPreset(nextPreset); setPoints(pointsForPreset(nextPreset));
    setSelectedId(nextPreset.id === "repeated-peak" ? "point-1" : "point-9"); setPrediction(null); setExplanation(null);
  }
  function move(id: string, value: number) {
    if (points.find((point) => point.id === id)?.value === clampValue(value)) return;
    setPoints((current) => movePoint(current, id, value)); setExplanation(null);
  }
  return <LearningPage title="Mean, Median & Mode" subtitle="Move one point. Watch three ideas of typical change."
    rail={<TypicalExperiment experiment={experiment} points={points} preset={preset} prediction={prediction} explanation={explanation} onPredict={(id) => {
      setPrediction(id); setExplanation(null); setPoints(pointsForPreset(preset)); setSelectedId(preset.id === "repeated-peak" ? "point-1" : "point-9");
    }} onExplain={setExplanation} onNext={() => reset(typicalPresets[(typicalPresets.findIndex((item) => item.id === preset.id) + 1) % typicalPresets.length]!)} />}>
        <LessonToolbar scenarios={typicalPresets} selectedId={preset.id}
      onSelect={(id) => reset(typicalPresets.find((item) => item.id === id)!)} onReset={() => reset()} />
        <DatasetChart points={points} analysis={analysis} selectedId={selectedId} onSelect={setSelectedId} onMove={move} />
        <PointValueEditor label={selected.label} value={selected.value} helpId="dataset-keyboard-help" onChange={(value) => move(selectedId, value)} />
        <section className={styles.sorted} aria-label="Sorted values">
          <div><h2>Sorted values <span>({analysis.count} points)</span></h2><p>The outlined value is the middle.</p></div>
          <ol>{sorted.map((point, index) => <li key={point.id} data-middle={index === Math.floor(points.length / 2)} data-mode={analysis.modeValues.includes(point.value)} aria-label={`${point.label}: ${point.value}${index === Math.floor(points.length / 2) ? ", middle value" : ""}`}><span>{point.value}</span><small>{point.label}</small></li>)}</ol>
        </section>
        <Summaries analysis={analysis} />
        <p className={sharedStyles.liveUpdate} role="status" aria-live="polite" aria-atomic="true">Mean {analysis.mean.toFixed(1)}; median {formatValue(analysis.median)}; {analysis.modeValues.length ? `mode ${analysis.modeValues.join(", ")}, each appearing ${analysis.modeFrequency} times` : "no mode: no values repeat"}.</p>
  </LearningPage>;
}
