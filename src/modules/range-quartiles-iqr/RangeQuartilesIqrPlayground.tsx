"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { clientXToPercentValue } from "@/lib/number-line";
import { fiveNumberSummary, makeRangePoints, movePoint, pointLanes, sortPoints, type FiveNumberSummary, type RangePoint } from "./range-quartiles-iqr-engine";
import { learningExperiments, predictions, rangePresets } from "./scenario";
import styles from "./playground.module.css";

const format = (value: number) => Number.isInteger(value) ? String(value) : value.toFixed(1);
const position = (value: number) => ({ left: `${value}%` });
const ticks = [0, 25, 50, 75, 100];

function SpreadChart({ points, summary, selectedId, onSelect, onMove }: {
  points: RangePoint[]; summary: FiveNumberSummary; selectedId: string;
  onSelect: (id: string) => void; onMove: (id: string, value: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<string | null>(null);
  const [width, setWidth] = useState(600);
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new ResizeObserver(([entry]) => { if (entry) setWidth(entry.contentRect.width); });
    observer.observe(track);
    return () => observer.disconnect();
  }, []);
  const lanes = useMemo(() => pointLanes(points, width), [points, width]);
  return <section className={styles.chart} aria-label="Values, range, and box plot on the same 0 to 100 scale">
    <p id="range-keyboard-help" className={styles.help}>Drag a dot, or focus it and use ← / →. Shift moves by 10; Home / End moves to 0 / 100.</p>
    <div className={styles.chartRow}>
      <span className={styles.laneLabel}>Values</span>
      <div className={styles.track} ref={trackRef} style={{ height: Math.max(92, lanes.count * 42 + 12) }}>
        <span className={styles.valueAxis} aria-hidden="true" />
        {points.map((point) => <button key={point.id} type="button" role="slider" aria-label={`Point ${point.label}`}
          aria-valuemin={0} aria-valuemax={100} aria-valuenow={point.value} aria-valuetext={`${point.label}: ${point.value}`}
          aria-describedby="range-keyboard-help" className={styles.point} data-selected={selectedId === point.id}
          style={{ ...position(point.value), bottom: 8 + (lanes.positions.get(point.id) ?? 0) * 42 }}
          onFocus={() => onSelect(point.id)}
          onPointerDown={(event) => {
            event.preventDefault(); event.currentTarget.focus(); onSelect(point.id);
            event.currentTarget.setPointerCapture(event.pointerId); dragging.current = point.id;
          }}
          onPointerMove={(event) => {
            if (dragging.current !== point.id || !trackRef.current) return;
            onMove(point.id, clientXToPercentValue(event.clientX, trackRef.current.getBoundingClientRect()));
          }}
          onPointerUp={() => { dragging.current = null; }} onPointerCancel={() => { dragging.current = null; }}
          onLostPointerCapture={() => { dragging.current = null; }}
          onKeyDown={(event) => {
            const step = event.shiftKey ? 10 : 1;
            const deltas: Record<string, number> = { ArrowLeft: -step, ArrowDown: -step, ArrowRight: step, ArrowUp: step };
            if (event.key in deltas || event.key === "Home" || event.key === "End") {
              event.preventDefault();
              onMove(point.id, event.key === "Home" ? 0 : event.key === "End" ? 100 : point.value + deltas[event.key]!);
            }
          }}><span>{point.value}</span><small>{point.label}</small></button>)}
      </div>
    </div>
    <div className={styles.chartRow} aria-hidden="true">
      <span className={styles.laneLabel}>Range</span>
      <div className={styles.intervalTrack}>
        <span className={styles.rangeLine} style={{ ...position(summary.min), width: `${summary.range}%` }} />
        {[summary.min, summary.max].map((value, index) => <span key={index} className={styles.rangeCap} style={position(value)} />)}
      </div>
    </div>
    <div className={styles.chartRow} aria-hidden="true">
      <span className={styles.laneLabel}>Box plot</span>
      <div className={styles.intervalTrack}>
        <svg className={styles.boxSvg} viewBox="0 0 100 12" preserveAspectRatio="none">
          <line x1={summary.min} x2={summary.q1} y1="6" y2="6" />
          <line x1={summary.q3} x2={summary.max} y1="6" y2="6" />
          <rect x={summary.q1} y="2" width={summary.iqr} height="8" />
          <line className={styles.medianLine} x1={summary.median} x2={summary.median} y1="1" y2="11" />
          {[summary.min, summary.max].map((value, index) => <line key={index} x1={value} x2={value} y1="3" y2="9" />)}
        </svg>
      </div>
    </div>
    <div className={styles.chartRow} aria-hidden="true"><span /><div className={styles.axis}>
      {ticks.map((tick) => <span className={styles.tick} key={tick} style={position(tick)}><span>{tick}</span></span>)}
    </div></div>
    <dl className={styles.fiveNumbers} aria-label="Box plot five-number summary">
      {[["Min", summary.min], ["Q1", summary.q1], ["Median", summary.median], ["Q3", summary.q3], ["Max", summary.max]].map(([label, value]) =>
        <div key={label}><dt>{label}</dt><dd>{format(Number(value))}</dd></div>)}
    </dl>
    <p className={styles.caption}>IQR (interquartile range) is the box width, from Q1 to Q3. The line inside marks the median; whiskers show min and max.</p>
  </section>;
}

function QuartileConstruction({ points, summary }: { points: RangePoint[]; summary: FiveNumberSummary }) {
  const sorted = sortPoints(points);
  const groups = [sorted.slice(0, 4), sorted.slice(4, 5), sorted.slice(5)];
  return <section className={styles.panel} aria-labelledby="quartile-heading">
    <h2 id="quartile-heading">Sorted values</h2>
    <div className={styles.halves}>
      {groups.map((group, groupIndex) => <div key={groupIndex} className={styles.half}>
        <h3>{["Lower half", "Median", "Upper half"][groupIndex]}</h3>
        <ol>{group.map((point, index) => <li key={point.id} data-middle={groupIndex !== 1 && (index === 1 || index === 2)}
          aria-label={`${point.label}: ${point.value}${groupIndex !== 1 && (index === 1 || index === 2) ? ", used for the quartile" : ""}`}>
          <span>{point.value}</span><small>{point.label}</small>
        </li>)}</ol>
        <p className={styles.formula}>{groupIndex === 1 ? `Median = ${format(summary.median)}` :
          `${groupIndex === 0 ? "Q1" : "Q3"} = (${group[1]!.value} + ${group[2]!.value}) / 2 = ${format(groupIndex === 0 ? summary.q1 : summary.q3)}`}</p>
      </div>)}
    </div>
    <p className={styles.caption}>Sort first. The median is the fifth value. Exclude it, then average the middle two of each half to find Q1 and Q3.</p>
    <p className={styles.convention}>Median-of-halves rule. Other quartile conventions can give different results.</p>
  </section>;
}

function SummaryTiles({ summary, before }: { summary: FiveNumberSummary; before: FiveNumberSummary }) {
  return <section className={styles.metrics} aria-label="Live spread calculations">
    <div className={styles.rangeMetric}><h3>Range <span>full span</span></h3><p className={styles.metricValue}>{format(summary.range)}</p>
      <p className={styles.formula}>{format(summary.max)} − {format(summary.min)} = {format(summary.range)}</p>
      <p className={styles.before}>Before {format(before.range)} → now {format(summary.range)}</p></div>
    <div className={styles.iqrMetric}><h3>IQR <span>middle 50%</span></h3><p className={styles.metricValue}>{format(summary.iqr)}</p>
      <p className={styles.formula}>{format(summary.q3)} − {format(summary.q1)} = {format(summary.iqr)}</p>
      <p className={styles.before}>Before {format(before.iqr)} → now {format(summary.iqr)}</p></div>
  </section>;
}

export function RangeQuartilesIqrPlayground() {
  const [experimentIndex, setExperimentIndex] = useState(0);
  const [presetId, setPresetId] = useState<string>("experiment");
  const [points, setPoints] = useState(() => makeRangePoints(learningExperiments[0].values));
  const [selectedId, setSelectedId] = useState("point-9");
  const [prediction, setPrediction] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const editorRef = useRef<HTMLInputElement>(null);
  const experiment = learningExperiments[experimentIndex]!;
  const isExperiment = presetId === "experiment";
  const baseValues = isExperiment ? experiment.values : rangePresets.find((preset) => preset.id === presetId)!.values;
  const before = useMemo(() => fiveNumberSummary(baseValues), [baseValues]);
  const summary = useMemo(() => fiveNumberSummary(points.map((point) => point.value)), [points]);
  const selected = points.find((point) => point.id === selectedId)!;
  const reachedTarget = isExperiment && prediction !== null && points.every((point, index) =>
    point.value === (point.id === experiment.pointId ? experiment.target : experiment.values[index]));
  const complete = reachedTarget && checked && explanation === experiment.correctExplanation;
  const phase = !prediction ? "Predict" : !reachedTarget ? "Move" : "Explain";

  function clearAnswers() { setPrediction(null); setExplanation(null); setChecked(false); }
  function reset(nextPresetId = presetId, nextIndex = experimentIndex) {
    setPresetId(nextPresetId); setExperimentIndex(nextIndex); clearAnswers();
    const next = learningExperiments[nextIndex]!;
    setPoints(makeRangePoints(nextPresetId === "experiment" ? next.values : rangePresets.find((preset) => preset.id === nextPresetId)!.values));
    setSelectedId(nextPresetId === "experiment" ? next.pointId : "point-9");
  }
  function move(id: string, value: number) {
    if (!Number.isFinite(value)) return;
    const next = Math.min(100, Math.max(0, Math.round(value)));
    if (points.find((point) => point.id === id)?.value === next) return;
    setPoints((current) => movePoint(current, id, next)); setExplanation(null); setChecked(false);
  }
  function predict(id: string) {
    setPrediction(id); setExplanation(null); setChecked(false);
    setPoints(makeRangePoints(experiment.values)); setSelectedId(experiment.pointId);
    editorRef.current?.focus();
  }
  return <main className={styles.page}>
    <nav className={styles.nav} aria-label="Playground navigation"><Link href="/">AI Grounds</Link><Link href="/" className={styles.allLessons}>← All lessons</Link></nav>
    <div className={styles.content}>
      <header className={styles.header}><h1>Range, quartiles &amp; IQR</h1><p>What changes when you move one value?</p></header>
      <div className={styles.layout}>
        <div className={styles.workbench}>
          <section className={styles.panel} aria-labelledby="spread-heading">
            <div className={styles.toolbar}><h2 id="spread-heading">Explore the spread</h2>
              <div className={styles.presets} aria-label="Dataset scenarios">{rangePresets.map((preset) => <button key={preset.id} type="button" aria-pressed={presetId === preset.id} onClick={() => reset(preset.id)}>{preset.label}</button>)}</div>
              <button type="button" className={styles.secondary} onClick={() => reset()}>Reset</button>
            </div>
            <SpreadChart points={points} summary={summary} selectedId={selectedId} onSelect={setSelectedId} onMove={move} />
            <SummaryTiles summary={summary} before={before} />
          </section>
          <QuartileConstruction points={points} summary={summary} />
          <p className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">Point {selected.label}: {selected.value}. Range {format(summary.range)}; Q1 {format(summary.q1)}; median {format(summary.median)}; Q3 {format(summary.q3)}; IQR {format(summary.iqr)}.</p>
        </div>
        <aside className={`${styles.panel} ${styles.rail}`} aria-label={isExperiment ? "Guided experiment" : "Free exploration"}>
          <p className={styles.eyebrow}>{isExperiment ? `Experiment ${experimentIndex + 1} of 3` : "Free exploration"}</p>
          <h2 className={styles.experimentTitle}>{isExperiment ? experiment.title : "Change one value"}</h2>
          {isExperiment && <ol className={styles.steps} aria-label="Experiment progress">{["Predict", "Move", "Explain"].map((step) => <li key={step} aria-current={phase === step ? "step" : undefined}>{step}</li>)}</ol>}
          {isExperiment && !prediction && <>
            <p className={styles.question}>{experiment.question}</p>
            <fieldset className={styles.choices}><legend className={styles.srOnly}>Your prediction</legend>
              {predictions.map((choice) => <label key={choice.id}><input type="radio" name="prediction" value={choice.id} checked={false} onChange={() => predict(choice.id)} />{choice.label}</label>)}
            </fieldset>
            <p className={styles.caption}>Choose a prediction first. This restores the starting values.</p>
          </>}
          {isExperiment && prediction && <>
            <p className={styles.recorded}>Your prediction: <strong>{predictions.find((choice) => choice.id === prediction)!.label.replace(/^[A-Z]/, (first) => first.toLowerCase())}</strong></p>
            <p className={styles.question}>Move {experiment.pointLabel} from {experiment.from} to {experiment.target}. Change only this point.</p>
          </>}
          {!isExperiment && <p className={styles.question}>Select any dot, then change its value. Compare range, IQR, and the underlined quartile pairs.</p>}
          <div className={styles.editor}><label htmlFor="range-point-value">Point {selected.label} value</label>
            <input ref={editorRef} id="range-point-value" type="number" min={0} max={100} step={1} value={selected.value} onChange={(event) => move(selectedId, event.currentTarget.valueAsNumber)} />
            {reachedTarget && <span className={styles.target} role="status">✓ Target reached</span>}
          </div>
          {isExperiment && prediction && !reachedTarget && <p className={styles.caption}>Use the dot or value field for the target. Reset starts this experiment again.</p>}
          {reachedTarget && <div className={styles.explanation}>
            <h3>{experiment.explanationQuestion}</h3>
            <fieldset className={styles.choices}><legend className={styles.srOnly}>Your explanation</legend>{experiment.explanations.map((choice) =>
              <label key={choice.id} data-checked={explanation === choice.id}><input type="radio" name="explanation" value={choice.id} checked={explanation === choice.id} onChange={() => { setExplanation(choice.id); setChecked(false); }} />{choice.label}</label>)}
            </fieldset>
            <button type="button" className={styles.primary} disabled={!explanation || complete} onClick={() => setChecked(true)}>Check explanation</button>
            {checked && !complete && <p className={styles.feedback} role="status">Try again. {experiment.retryHint}</p>}
            {complete && <div className={styles.success} role="status"><strong>{experimentIndex === 2 ? "All three experiments explained" : "Experiment explained"}</strong><p>{experiment.takeaway}</p></div>}
            {complete && <button type="button" className={styles.primary} onClick={() => reset("experiment", (experimentIndex + 1) % learningExperiments.length)}>{experimentIndex === 2 ? "Start again" : `Next: ${learningExperiments[experimentIndex + 1]!.title}`} →</button>}
          </div>}
          {!isExperiment && <button type="button" className={styles.primary} onClick={() => reset("experiment")}>Return to experiment →</button>}
        </aside>
      </div>
    </div>
  </main>;
}
