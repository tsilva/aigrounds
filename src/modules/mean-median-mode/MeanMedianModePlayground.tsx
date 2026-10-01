"use client";

import Link from "next/link";
import { ArrowPathIcon, ArrowRightIcon, ChatBubbleLeftRightIcon, CheckCircleIcon, LightBulbIcon } from "@heroicons/react/24/outline";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { clientXToPercentValue } from "@/lib/number-line";
import { useOpenPlaygroundAssistant } from "@/lib/playground-assistant-context";
import { analyzeTypicalValues, clampValue, movePoint, type DataPoint, type TypicalValuesAnalysis } from "./mean-median-mode-engine";
import { initialTypicalPreset, pointsForPreset, typicalPresets, type TypicalPreset } from "./scenario";
import { isExperimentDataset, learningExperiments, pointLanes, type LearningExperiment } from "./learning-experiments";
import styles from "./playground.module.css";

const ticks = [0, 25, 50, 75, 100];
const colors = { mean: "#1760db", median: "#5031dc", mode: "#976000" };
const formatValue = (value: number) => Number.isInteger(value) ? String(value) : value.toFixed(1);
const position = (value: number) => ({ left: `${value}%` });

function DatasetChart({ points, analysis, selectedId, onSelect, onMove }: {
  points: DataPoint[]; analysis: TypicalValuesAnalysis; selectedId: string;
  onSelect: (id: string) => void; onMove: (id: string, value: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<string | null>(null);
  const [width, setWidth] = useState(800);
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new ResizeObserver(([entry]) => { if (entry) setWidth(entry.contentRect.width); });
    observer.observe(track);
    return () => observer.disconnect();
  }, []);
  const lanes = useMemo(() => pointLanes(points, width), [points, width]);
  const chartHeight = Math.max(132, lanes.count * 36 + 16);
  const markers = [
    { label: "Mean", values: [analysis.mean], color: colors.mean },
    { label: "Median", values: [analysis.median], color: colors.median },
    { label: "Mode", values: analysis.modeValues, color: colors.mode },
  ];
  return (
    <section className={styles.chart} aria-label="Interactive dataset and summary number lines">
      <div className={styles.chartHeading}><h2>Your dataset</h2><span>Drag a dot to change its value</span></div>
      <div className={styles.plotFrame}>
        <div ref={trackRef} className={styles.plot} style={{ height: chartHeight }}>
          <div className={styles.axis} />
          {ticks.map((tick) => <span key={tick} className={styles.tick} style={position(tick)}><span>{tick}</span></span>)}
          {points.map((point) => (
            <button key={point.id} type="button" role="slider" aria-label={`Point ${point.label}`}
              aria-valuemin={0} aria-valuemax={100} aria-valuenow={point.value} aria-valuetext={`${point.label}: ${point.value}`}
              aria-describedby="dataset-keyboard-help" className={styles.point}
              data-selected={selectedId === point.id} data-mode={analysis.modeValues.includes(point.value)}
              style={{ ...position(point.value), bottom: 12 + (lanes.positions.get(point.id) ?? 0) * 36, "--point-color": point.color } as CSSProperties}
              onFocus={() => onSelect(point.id)}
              onPointerDown={(event) => {
                event.preventDefault(); event.currentTarget.focus(); event.currentTarget.setPointerCapture(event.pointerId);
                dragging.current = point.id; onSelect(point.id);
              }}
              onPointerMove={(event) => {
                if (dragging.current !== point.id || !trackRef.current) return;
                onMove(point.id, clampValue(clientXToPercentValue(event.clientX, trackRef.current.getBoundingClientRect())));
              }}
              onPointerUp={() => { dragging.current = null; }} onPointerCancel={() => { dragging.current = null; }}
              onLostPointerCapture={() => { dragging.current = null; }}
              onKeyDown={(event) => {
                const step = event.shiftKey ? 10 : 1;
                const changes: Record<string, number> = { ArrowLeft: -step, ArrowDown: -step, ArrowRight: step, ArrowUp: step };
                if (event.key in changes || event.key === "Home" || event.key === "End") {
                  event.preventDefault();
                  onMove(point.id, event.key === "Home" ? 0 : event.key === "End" ? 100 : point.value + changes[event.key]!);
                }
              }}><span>{point.value}</span><small>{point.label}</small></button>
          ))}
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
  return <section className={styles.summaries} aria-label="Live summaries">
    {[
      { label: "Mean", color: colors.mean, value: analysis.mean.toFixed(1), definition: "The average of all values.", formula: `${analysis.sum} ÷ ${analysis.count} = ${analysis.mean.toFixed(1)}` },
      { label: "Median", color: colors.median, value: formatValue(analysis.median), definition: "The middle value when sorted.", formula: `${Math.floor(analysis.count / 2) + 1}th sorted value = ${formatValue(analysis.median)}` },
      { label: "Mode", color: colors.mode, value: analysis.modeValues.length ? analysis.modeValues.join(", ") : "None", definition: "The most frequent value.", formula: analysis.modeValues.length ? `Each appears ${analysis.modeFrequency} times` : "No values repeat" },
    ].map((summary) => <div key={summary.label} className={styles.summary} style={{ "--summary-color": summary.color } as CSSProperties}>
      <h2>{summary.label}</h2><p className={styles.definition}>{summary.definition}</p>
      <p className={styles.summaryValue}>{summary.value}</p><p className={styles.formula}>{summary.formula}</p>
    </div>)}
  </section>;
}

function ExperimentRail({ experiment, points, preset, prediction, explanation, onPredict, onExplain, onNext, onGuide }: {
  experiment: LearningExperiment; points: DataPoint[]; preset: TypicalPreset; prediction: string | null; explanation: string | null;
  onPredict: (id: string) => void; onExplain: (id: string) => void; onNext: () => void; onGuide: () => void;
}) {
  const reachedTarget = prediction !== null && isExperimentDataset(points, preset, experiment);
  const complete = reachedTarget && explanation === experiment.correctExplanation;
  const phase = !prediction ? 0 : !reachedTarget ? 1 : 2;
  return <aside className={styles.rail} aria-label="Guided experiment">
    <p className={styles.eyebrow}>Try this</p><h2 className={styles.experimentTitle}>{experiment.title}</h2>
    <ol className={styles.steps} aria-label="Experiment progress">{["Predict", "Try", "Explain"].map((step, index) =>
      <li key={step} aria-current={phase === index ? "step" : undefined} data-active={phase >= index}><span>{index + 1}</span>{step}</li>)}</ol>
    <div className={styles.exercise}>
      <h3>{reachedTarget ? "What did you notice?" : "Make a prediction"}</h3>
      {!reachedTarget && <>
        <p>{experiment.question}</p>
        <fieldset className={styles.choices}><legend className="sr-only">Your prediction</legend>
          {experiment.predictions.map((choice) => <label key={choice.id} data-checked={prediction === choice.id}>
            <input type="radio" name="prediction" value={choice.id} checked={prediction === choice.id} onChange={() => onPredict(choice.id)} />{choice.label}
          </label>)}
        </fieldset>
        <p className={styles.small}>Choosing a prediction restores the starting dataset.</p>
      </>}
      {prediction && !reachedTarget && <div className={styles.actionPrompt}>
        <p><strong>Now try it.</strong> Move point {experiment.pointLabel} to {experiment.target}. Watch the three summaries.</p>
        <p className={styles.small}>Change only this point. Use its value field for an exact position, or Reset to start again.</p>
      </div>}
      {reachedTarget && <>
        <p className={styles.observation} role="status">{prediction === experiment.correctPrediction ? "Your prediction matches the result." : "The result differed from your prediction. Use the live values to investigate."}</p>
        <h3>{experiment.explanationQuestion}</h3>
        <fieldset className={styles.choices}><legend className="sr-only">Your explanation</legend>
          {experiment.explanations.map((choice) => <label key={choice.id} data-checked={explanation === choice.id}>
            <input type="radio" name="explanation" value={choice.id} checked={explanation === choice.id} onChange={() => onExplain(choice.id)} />{choice.label}
          </label>)}
        </fieldset>
        {explanation && !complete && <p className={styles.feedback} role="status">Try again. {experiment.retryHint}</p>}
      </>}
      {complete && <div className={styles.takeaway} role="status"><CheckCircleIcon aria-hidden="true" /><div><h3>Experiment explained</h3><p>{experiment.takeaway}</p></div></div>}
      {complete && <button type="button" className={styles.nextButton} onClick={onNext}>Try another dataset<ArrowRightIcon aria-hidden="true" /></button>}
    </div>
    <div className={styles.guideInvitation}><ChatBubbleLeftRightIcon aria-hidden="true" /><h3>Talk it through</h3>
      <p>Ask the AI Guide about your prediction or what changed.</p>
      <button type="button" onClick={onGuide}>Ask the AI Guide<ArrowRightIcon aria-hidden="true" /></button>
    </div>
  </aside>;
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
  const openGuide = useOpenPlaygroundAssistant();
  function reset(nextPreset = preset) {
    setPreset(nextPreset); setPoints(pointsForPreset(nextPreset));
    setSelectedId(nextPreset.id === "repeated-peak" ? "point-1" : "point-9"); setPrediction(null); setExplanation(null);
  }
  function move(id: string, value: number) {
    if (points.find((point) => point.id === id)?.value === clampValue(value)) return;
    setPoints((current) => movePoint(current, id, value)); setExplanation(null);
  }
  return <main className={styles.page}>
    <nav className={styles.nav} aria-label="Playground navigation"><Link href="/" aria-label="AI Grounds home">AI Grounds</Link><span>Statistics</span></nav>
    <div className={styles.layout}>
      <div className={styles.workbench}>
        <header className={styles.header}><p className={styles.eyebrow}>Guided discovery</p><h1>Mean, Median &amp; Mode</h1><p>Move one point. Watch three ideas of typical change.</p></header>
        <div className={styles.toolbar}>
          <div className={styles.presets} aria-label="Dataset scenarios">{typicalPresets.map((item) => <button key={item.id} type="button" aria-pressed={item.id === preset.id} onClick={() => reset(item)}><strong>{item.label}</strong><span>{item.shortLabel}</span></button>)}</div>
          <button type="button" className={styles.reset} onClick={() => reset()}><ArrowPathIcon aria-hidden="true" />Reset</button>
        </div>
        <DatasetChart points={points} analysis={analysis} selectedId={selectedId} onSelect={setSelectedId} onMove={move} />
        <div className={styles.pointEditor}>
          <label>Point {selected.label} value<input type="number" min={0} max={100} step={1} value={selected.value} onChange={(event) => {
            if (Number.isFinite(event.currentTarget.valueAsNumber)) move(selectedId, event.currentTarget.valueAsNumber);
          }} /></label>
          <p id="dataset-keyboard-help">Focus a dot and use arrow keys. Shift moves by 10; Home / End moves to 0 / 100.</p>
        </div>
        <section className={styles.sorted} aria-label="Sorted values">
          <div><h2>Sorted values <span>({analysis.count} points)</span></h2><p>The outlined value is the middle.</p></div>
          <ol>{sorted.map((point, index) => <li key={point.id} data-middle={index === Math.floor(points.length / 2)} data-mode={analysis.modeValues.includes(point.value)} aria-label={`${point.label}: ${point.value}${index === Math.floor(points.length / 2) ? ", middle value" : ""}`}><span>{point.value}</span><small>{point.label}</small></li>)}</ol>
        </section>
        <Summaries analysis={analysis} />
        <p className={styles.liveUpdate} role="status" aria-live="polite" aria-atomic="true">Mean {analysis.mean.toFixed(1)}; median {formatValue(analysis.median)}; {analysis.modeValues.length ? `mode ${analysis.modeValues.join(", ")}, each appearing ${analysis.modeFrequency} times` : "no mode: no values repeat"}.</p>
        <div className={styles.insight}><LightBulbIcon aria-hidden="true" /><p><strong>Three questions, three summaries.</strong> Average, middle, or most common? Choose the one that fits what you want to know.</p></div>
      </div>
      <ExperimentRail experiment={experiment} points={points} preset={preset} prediction={prediction} explanation={explanation} onPredict={(id) => {
        setPrediction(id); setExplanation(null); setPoints(pointsForPreset(preset)); setSelectedId(preset.id === "repeated-peak" ? "point-1" : "point-9");
      }} onExplain={setExplanation} onNext={() => reset(typicalPresets[(typicalPresets.findIndex((item) => item.id === preset.id) + 1) % typicalPresets.length]!)} onGuide={openGuide} />
    </div>
  </main>;
}
