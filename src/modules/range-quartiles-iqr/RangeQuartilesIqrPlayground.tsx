"use client";

import { DatasetHeading, ExperimentButton, ExperimentChoices, ExperimentRail, ExperimentResult, LearningPage, LessonSummaries, LessonToolbar, PointValueEditor } from "@/components/learning-page/learning-page";
import sharedStyles from "@/components/learning-page/learning-page.module.css";
import { useMemo, useRef, useState } from "react";
import { NumberLinePoint, useNumberLineLayout } from "@/components/learning-page/number-line-controls";
import { fiveNumberSummary, makeRangePoints, movePoint, sortPoints, type FiveNumberSummary, type RangePoint } from "./range-quartiles-iqr-engine";
import { learningExperiments, predictions, rangePresets } from "./scenario";
import styles from "./playground.module.css";

const format = (value: number) => Number.isInteger(value) ? String(value) : value.toFixed(1);
const position = (value: number) => ({ left: `${value}%` });
const ticks = [0, 25, 50, 75, 100];

function SpreadChart({ points, summary, selectedId, onSelect, onMove }: {
  points: RangePoint[]; summary: FiveNumberSummary; selectedId: string;
  onSelect: (id: string) => void; onMove: (id: string, value: number) => void;
}) {
  const { trackRef, lanes } = useNumberLineLayout(points, 38);
  return <section className={styles.chart} aria-label="Values, range, and box plot on the same 0 to 100 scale">
    <DatasetHeading />
    <div className={styles.chartRow}>
      <span className={styles.laneLabel}>Values</span>
      <div className={styles.track} ref={trackRef} style={{ height: Math.max(76, lanes.count * 36 + 12) }}>
        <span className={styles.valueAxis} aria-hidden="true" />
        {points.map((point) => <NumberLinePoint key={point.id} point={point} selected={selectedId === point.id}
          helpId="range-keyboard-help" trackRef={trackRef} onSelect={onSelect} onMove={onMove}
          style={{ bottom: 8 + (lanes.positions.get(point.id) ?? 0) * 36 }} />)}
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
    <p className={sharedStyles.srOnly}>Box plot: minimum {format(summary.min)}, Q1 {format(summary.q1)}, median {format(summary.median)}, Q3 {format(summary.q3)}, maximum {format(summary.max)}.</p>
    <p className={sharedStyles.caption}>IQR (interquartile range) is the box width, from Q1 to Q3. The line inside marks the median; whiskers show min and max.</p>
  </section>;
}

function QuartileConstruction({ points, summary }: { points: RangePoint[]; summary: FiveNumberSummary }) {
  const sorted = sortPoints(points);
  const groups = [sorted.slice(0, 4), sorted.slice(4, 5), sorted.slice(5)];
  return <section className={styles.quartiles} aria-labelledby="quartile-heading">
    <h2 id="quartile-heading">Sorted values</h2>
    <div className={styles.halves}>
      {groups.map((group, groupIndex) => <div key={groupIndex} className={styles.half}>
        <h3>{["Lower half", "Median", "Upper half"][groupIndex]}</h3>
        <ol>{group.map((point, index) => <li key={point.id} data-middle={groupIndex !== 1 && (index === 1 || index === 2)}
          aria-label={`${point.label}: ${point.value}${groupIndex !== 1 && (index === 1 || index === 2) ? ", used for the quartile" : ""}`}>
          <span>{point.value}</span><small>{point.label}</small>
        </li>)}</ol>
        <p className={styles.quartileFormula}>{groupIndex === 1 ? `Median = ${format(summary.median)}` :
          `${groupIndex === 0 ? "Q1" : "Q3"} = (${group[1]!.value} + ${group[2]!.value}) / 2 = ${format(groupIndex === 0 ? summary.q1 : summary.q3)}`}</p>
      </div>)}
    </div>
    <p className={styles.convention}>Median-of-halves rule: exclude the fifth value, then average each half’s middle pair. Other conventions can differ.</p>
  </section>;
}

function SummaryTiles({ summary, before }: { summary: FiveNumberSummary; before: FiveNumberSummary }) {
  return <LessonSummaries label="Live spread calculations" summaries={[
    { label: "Range", color: "#ad4508", definition: "The full span.", value: format(summary.range),
      formula: `${format(summary.max)} − ${format(summary.min)} = ${format(summary.range)}`,
      comparison: `Before ${format(before.range)} → now ${format(summary.range)}` },
    { label: "IQR", color: "#5031dc", definition: "The middle 50%.", value: format(summary.iqr),
      formula: `${format(summary.q3)} − ${format(summary.q1)} = ${format(summary.iqr)}`,
      comparison: `Before ${format(before.iqr)} → now ${format(summary.iqr)}` },
  ]} />;
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
  const phase = !prediction ? 0 : !reachedTarget ? 1 : 2;

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
  const rail = (
        <ExperimentRail label={isExperiment ? `Experiment ${experimentIndex + 1} of 3` : "Free exploration"} title={isExperiment ? experiment.title : "Change one value"} phase={isExperiment ? phase : undefined}>
          {isExperiment && !prediction && <>
            <h3>Make a prediction</h3>
            <p className={sharedStyles.question}>{experiment.question}</p>
            <ExperimentChoices legend="Your prediction" name="prediction" choices={predictions} value={null} onChange={predict} />
            <p className={sharedStyles.caption}>Choose a prediction first. This restores the starting values.</p>
          </>}
          {isExperiment && prediction && <>
            <p className={sharedStyles.recorded}>Your prediction: <strong>{predictions.find((choice) => choice.id === prediction)!.label.replace(/^[A-Z]/, (first) => first.toLowerCase())}</strong></p>
            <p className={sharedStyles.question}>Move {experiment.pointLabel} from {experiment.from} to {experiment.target}. Change only this point.</p>
          </>}
          {!isExperiment && <p className={sharedStyles.question}>Select any dot, then change its value. Compare range, IQR, and the outlined quartile pairs.</p>}
          {reachedTarget && <p className={styles.target} role="status">✓ Target reached</p>}
          {isExperiment && prediction && !reachedTarget && <p className={sharedStyles.caption}>Use the dot or value field for the target. Reset starts this experiment again.</p>}
          {reachedTarget && <div className={sharedStyles.explanation}>
            <h3>{experiment.explanationQuestion}</h3>
            <ExperimentChoices legend="Your explanation" name="explanation" choices={experiment.explanations} value={explanation} onChange={(id) => { setExplanation(id); setChecked(false); }} />
            <ExperimentButton disabled={!explanation || complete} onClick={() => setChecked(true)}>Check explanation</ExperimentButton>
            {checked && !complete && <p className={sharedStyles.feedback} role="status">Try again. {experiment.retryHint}</p>}
            {complete && <ExperimentResult compact title={experimentIndex === 2 ? "All three experiments explained" : "Experiment explained"}>{experiment.takeaway}</ExperimentResult>}
            {complete && <ExperimentButton onClick={() => reset("experiment", (experimentIndex + 1) % learningExperiments.length)}>{experimentIndex === 2 ? "Start again" : `Next: ${learningExperiments[experimentIndex + 1]!.title}`} →</ExperimentButton>}
          </div>}
          {!isExperiment && <ExperimentButton onClick={() => reset("experiment")}>Return to experiment →</ExperimentButton>}
          </ExperimentRail>
  );
  return <LearningPage title="Range, Quartiles & IQR" subtitle="Move one point. Watch two measures of spread." rail={rail}>
    <LessonToolbar scenarios={rangePresets.map((preset) => ({ ...preset, shortLabel: preset.id === "experiment" ? experiment.title : preset.shortLabel }))} selectedId={presetId}
      onSelect={(id) => reset(id)} onReset={() => reset()} />
    <SpreadChart points={points} summary={summary} selectedId={selectedId} onSelect={setSelectedId} onMove={move} />
    <PointValueEditor label={selected.label} value={selected.value} helpId="range-keyboard-help" inputRef={editorRef} inputId="range-point-value" onChange={(value) => move(selectedId, value)} />
    <QuartileConstruction points={points} summary={summary} />
    <SummaryTiles summary={summary} before={before} />
    <p className={sharedStyles.srOnly} role="status" aria-live="polite" aria-atomic="true">Point {selected.label}: {selected.value}. Range {format(summary.range)}; Q1 {format(summary.q1)}; median {format(summary.median)}; Q3 {format(summary.q3)}; IQR {format(summary.iqr)}.</p>
  </LearningPage>;
}
