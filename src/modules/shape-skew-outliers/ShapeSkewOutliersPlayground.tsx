"use client";

import { useMemo, useState } from "react";
import { ExperimentButton, ExperimentChoices, ExperimentRail, ExperimentResult, LearningPage, LessonSummaries, LessonToolbar, PointValueEditor } from "@/components/learning-page/learning-page";
import { NumberLinePoint, useNumberLineLayout } from "@/components/learning-page/number-line-controls";
import sharedStyles from "@/components/learning-page/learning-page.module.css";
import { analyzeShape, clampShapeValue, type ShapeAnalysis } from "./shape-skew-outliers-engine";
import { initialShapePreset, shapePresets } from "./scenario";
import { shapeExperiments } from "./learning-experiments";
import styles from "./playground.module.css";

const ticks = [0, 25, 50, 75, 100];
const format = (value: number) => String(value);
const signed = (value: number) => `${value > 0 ? "+" : ""}${Number.isInteger(value) ? value : value.toFixed(1)}`;

function ShapeEvidence({ analysis, onMove }: { analysis: ShapeAnalysis; onMove: (value: number) => void }) {
  const { trackRef, lanes } = useNumberLineLayout(analysis.points);
  const maxCount = Math.max(5, ...analysis.histogram.map((bin) => bin.count));
  const movable = analysis.points.find((point) => point.role === "movable")!;
  return <>
    <section className={styles.histogram} aria-label="Histogram of all 13 values">
      <h2>Your dataset</h2>
      <p>12 fixed points + movable M. Each bar counts values in a 10-unit interval.</p>
      <svg viewBox="0 0 700 230" role="img" aria-label="Histogram. Exact bin counts are listed below.">
        {Array.from({ length: maxCount + 1 }, (_, count) => <g key={count}>
          <line x1="35" x2="685" y1={190 - count / maxCount * 150} y2={190 - count / maxCount * 150} className={styles.gridLine} />
          <text x="25" y={194 - count / maxCount * 150} textAnchor="end">{count}</text>
        </g>)}
        {analysis.histogram.map((bin, index) => {
          const height = bin.count / maxCount * 150;
          return <g key={bin.start}>
            <rect x={35 + index * 65 + 1} y={190 - height} width="63" height={height} className={styles.bar} />
            {bin.movableCount > 0 && <rect x={35 + index * 65 + 1} y={190 - 150 / maxCount} width="63" height={150 / maxCount} className={styles.movableBar} />}
            <text x={67.5 + index * 65} y={182 - height} textAnchor="middle">{bin.count}</text>
            {bin.movableCount > 0 && <text x={67.5 + index * 65} y={190 - 75 / maxCount + 4} textAnchor="middle" className={styles.movableLabel}>M</text>}
            <text x={67.5 + index * 65} y="212" textAnchor="middle">{bin.start}–{bin.end}</text>
          </g>;
        })}
        <text x="9" y="20">Count</text>
      </svg>
      <p className={sharedStyles.small}>Intervals include their left endpoint; only 90–100 also includes 100.</p>
      <details><summary>Read exact bin counts</summary><table><caption>Histogram data</caption><thead><tr><th>Interval</th><th>Count</th><th>Contains M</th></tr></thead><tbody>{analysis.histogram.map((bin) => <tr key={bin.start}><th>{bin.start} ≤ value {bin.end === 100 ? "≤" : "<"} {bin.end}</th><td>{bin.count}</td><td>{bin.movableCount ? "Yes" : "No"}</td></tr>)}</tbody></table></details>
    </section>
    <section className={styles.numberLine} aria-label="Exact data values">
      <h2>Each dot is one point</h2><p>Drag M to change its value. The other 12 points stay fixed.</p>
      <div className={styles.trackFrame}><div ref={trackRef} className={styles.track} style={{ height: Math.max(96, lanes.count * 36 + 24) }}>
        <div className={styles.axis} />
        {ticks.map((tick) => <span className={styles.tick} style={{ left: `${tick}%` }} key={tick}>{tick}</span>)}
        {analysis.points.filter((point) => point.role === "fixed").map((point) => <span key={point.id} className={styles.fixedPoint} style={{ left: `${point.value}%`, bottom: 12 + (lanes.positions.get(point.id) ?? 0) * 36 }} title={`${point.label}: ${point.value}`}><span>{point.value}</span><small>{point.label}</small></span>)}
        <NumberLinePoint point={movable} selected helpId="shape-keyboard-help" trackRef={trackRef} onSelect={() => {}} onMove={(_, value) => onMove(value)} style={{ bottom: 12 + (lanes.positions.get(movable.id) ?? 0) * 36 }} />
      </div></div>
      <PointValueEditor label="M" value={movable.value} helpId="shape-keyboard-help" onChange={onMove} />
      <p className={styles.values}>Sorted values: {analysis.sortedValues.map(format).join(", ")}</p>
    </section>
    <section className={styles.boxSection} aria-label="Min-to-max box plot">
      <h2>The middle and the edges</h2><p>The line spans the full range. The box spans Q1 to Q3; its inner line marks the median.</p>
      <svg viewBox="0 0 700 100" role="img" aria-label={`Minimum ${analysis.min}, Q1 ${format(analysis.q1)}, median ${format(analysis.median)}, Q3 ${format(analysis.q3)}, maximum ${analysis.max}`}>
        <line x1={25 + analysis.min * 6.5} x2={25 + analysis.max * 6.5} y1="35" y2="35" className={styles.rangeLine} />
        <rect x={25 + analysis.q1 * 6.5} y="20" width={analysis.iqr * 6.5} height="30" className={styles.box} />
        {[analysis.min, analysis.median, analysis.max].map((value, index) => <line key={index} x1={25 + value * 6.5} x2={25 + value * 6.5} y1="17" y2="53" className={styles.rangeLine} />)}
        <line x1="25" x2="675" y1="74" y2="74" className={styles.gridLine} />
        {ticks.map((tick) => <text x={25 + tick * 6.5} y="94" textAnchor="middle" key={tick}>{tick}</text>)}
      </svg>
      <dl>{[["Min", analysis.min], ["Q1", analysis.q1], ["Median", analysis.median], ["Q3", analysis.q3], ["Max", analysis.max]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{format(Number(value))}</dd></div>)}</dl>
      <p className={sharedStyles.small}>Quartiles use medians of the lower and upper halves, excluding the overall median. This min-to-max plot is not a Tukey outlier-whisker plot.</p>
      <details><summary>When is a point flagged as unusual?</summary><p>A common screening rule flags values below Q1 − 1.5 × IQR or above Q3 + 1.5 × IQR. It is a reason to investigate, not proof of an error.</p><p>Current fences: {format(analysis.lowerFence)} to {format(analysis.upperFence)}. Flagged values: {analysis.flaggedValues.length ? analysis.flaggedValues.map(format).join(", ") : "none"}. M is a movable point; it is not always flagged.</p></details>
    </section>
  </>;
}

export function ShapeSkewOutliersPlayground() {
  const [preset, setPreset] = useState(initialShapePreset);
  const [value, setValue] = useState(initialShapePreset.defaultMovable);
  const [experimentIndex, setExperimentIndex] = useState(0);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [transferAnswer, setTransferAnswer] = useState<string | null>(null);
  const experiment = shapeExperiments[experimentIndex];
  const transfer = experimentIndex === shapeExperiments.length;
  const start = experiment?.start ?? 50;
  const analysis = useMemo(() => analyzeShape(preset.values, value), [preset, value]);
  const before = useMemo(() => analyzeShape(preset.values, start), [preset, start]);
  const reached = !!prediction && value === experiment?.target;
  const complete = reached && explanation === experiment?.correctExplanation;
  function reset(index = experimentIndex) {
    const next = shapeExperiments[index];
    setExperimentIndex(index); setPreset(shapePresets.find((item) => item.id === (next?.scenario ?? "two-clusters"))!);
    setValue(next?.start ?? 50); setPrediction(null); setExplanation(null); setTransferAnswer(null);
  }
  function move(next: number) {
    const clamped = clampShapeValue(next);
    if (clamped !== value) { setValue(clamped); setExplanation(null); setTransferAnswer(null); }
  }
  const rail = experiment ? <ExperimentRail label={`Experiment ${experimentIndex + 1} of ${shapeExperiments.length}`} title={experiment.title} phase={!prediction ? 0 : reached ? 2 : 1}>
    {!reached && <><h3>Make a prediction</h3><p>{experiment.question}</p><ExperimentChoices name="shape-prediction" legend="Your prediction" choices={experiment.predictions} value={prediction} onChange={(id) => { setPrediction(id); setExplanation(null); setValue(experiment.start); }} /><p className={sharedStyles.small}>Choosing a prediction restores M to {experiment.start}.</p></>}
    {prediction && !reached && <p className={sharedStyles.actionPrompt}><strong>Now try it.</strong> Set Point M value to {experiment.target}, or drag M there. Compare the histogram, number line, box and summaries.</p>}
    {reached && <><p role="status" className={sharedStyles.observation}>{prediction === experiment.correctPrediction ? "Your prediction matches the result." : "The result differed from your prediction. Check the exact evidence."}</p><h3>{experiment.explanationQuestion}</h3><ExperimentChoices name="shape-explanation" legend="Your explanation" choices={experiment.explanations} value={explanation} onChange={setExplanation} />{explanation && !complete && <p role="status" className={sharedStyles.feedback}>Try again. {experiment.retry}</p>}</>}
    {complete && <><ExperimentResult>{experiment.takeaway}</ExperimentResult><ExperimentButton arrow onClick={() => reset(experimentIndex + 1)}>{experimentIndex === 3 ? "Try the transfer check" : "Next experiment"}</ExperimentButton></>}
  </ExperimentRail> : <ExperimentRail label={transfer ? "Transfer check" : "Free exploration"} title={transfer ? "Choose evidence for a new point" : "Explore another shape"}>
    {transfer ? <><p>Without a prediction prompt, set M to 60. Which evidence would you use to explain whether the two groups still exist?</p><ExperimentChoices name="shape-transfer" legend="Transfer explanation" choices={[{ id: "values", label: "Histogram plus sorted values: most points are still below 40 or above 60." }, { id: "mean", label: "Mean alone: its value tells us how many groups there are." }, { id: "box", label: "Box alone: the middle half reveals every gap." }]} value={transferAnswer} onChange={setTransferAnswer} />{transferAnswer && (value !== 60 ? <p className={sharedStyles.feedback}>First set M to 60 and inspect the new dataset.</p> : transferAnswer !== "values" ? <p className={sharedStyles.feedback}>Try again. One center or box cannot reveal every group or gap.</p> : <><ExperimentResult title="Transfer explained">The two groups remain. Report center and spread alongside shape; the right summary depends on the question.</ExperimentResult><ExperimentButton onClick={() => reset(5)}>Explore freely</ExperimentButton></>)}</> : <><p>Use any scenario and move M. Describe the pile, tail and gaps before choosing a center or spread summary.</p><ExperimentButton onClick={() => reset(0)}>Restart experiments</ExperimentButton></>}
  </ExperimentRail>;
  return <LearningPage title="Shape, Skew & Outliers" subtitle="Move one point. Read the shape before choosing a summary." rail={rail}>
    <LessonToolbar scenarios={shapePresets} selectedId={preset.id} onSelect={(id) => reset(shapeExperiments.findIndex((item) => item.scenario === id))} onReset={() => reset()} />
    <ShapeEvidence analysis={analysis} onMove={move} />
    <LessonSummaries label="Live shape summaries" summaries={[
      { label: "Mean", color: "#1760db", definition: "The average uses every value.", value: analysis.mean.toFixed(1), formula: `${analysis.sum} ÷ ${analysis.count}`, comparison: `Start ${before.mean.toFixed(1)}; change ${signed(analysis.mean - before.mean)}` },
      { label: "Median", color: "#5031dc", definition: "The middle sorted value.", value: format(analysis.median), formula: "7th of 13 sorted values", comparison: `Start ${format(before.median)}; change ${signed(analysis.median - before.median)}` },
      { label: "Range", color: "#b24b13", definition: "Distance between the extremes.", value: format(analysis.range), formula: `${analysis.max} − ${analysis.min}`, comparison: `Start ${format(before.range)}; change ${signed(analysis.range - before.range)}` },
      { label: "IQR", color: "#22715d", definition: "Spread of the middle half.", value: format(analysis.iqr), formula: `${format(analysis.q3)} − ${format(analysis.q1)}`, comparison: `Start ${format(before.iqr)}; change ${signed(analysis.iqr - before.iqr)}` },
    ]} />
    <p className={sharedStyles.small}>Start uses the same 13 points with M = {start}. Read tails and clusters from the histogram and values; a mean–median gap alone cannot prove skew. Robust summaries can still change.</p>
    <p className={sharedStyles.liveUpdate} role="status" aria-live="polite" aria-atomic="true">M {value}; mean {analysis.mean.toFixed(1)}, median {format(analysis.median)}, range {analysis.range}, IQR {format(analysis.iqr)}.</p>
  </LearningPage>;
}
