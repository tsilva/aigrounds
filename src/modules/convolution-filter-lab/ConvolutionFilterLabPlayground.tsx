"use client";

import { useMemo, useRef, useState } from "react";
import { ExperimentButton, ExperimentChoices, ExperimentRail, ExperimentResult, LearningPage, LessonSummaries, LessonToolbar } from "@/components/learning-page/learning-page";
import sharedStyles from "@/components/learning-page/learning-page.module.css";
import { analyzeConvolution, clampIndex, type Matrix } from "./convolution-filter-engine";
import { learningExperiments, matchesState, type LessonState } from "./learning-experiments";
import { imageScenarios, kernelOptions, type ImageId } from "./scenario";
import styles from "./playground.module.css";

function formatValue(value: number) {
  return Number.isInteger(value) || Math.abs(value - Math.round(value)) < 1e-10
    ? String(Math.round(value)) : `≈${value.toFixed(2)}`;
}

// All fractional products in this lesson come from the fixed 1/9 Blur weights.
function exactValue(value: number) {
  const numerator = Math.round(value * 9);
  if (Math.abs(value * 9 - numerator) > 1e-10) return formatValue(value);
  let a = Math.abs(numerator), b = 9;
  while (b) { const remainder = a % b; a = b; b = remainder; }
  const divisor = a || 9;
  return 9 / divisor === 1 ? String(numerator / divisor) : `${numerator / divisor}/${9 / divisor}`;
}

function MatrixTable({ matrix, label, exact = false, padding = 0, patch, selected, onSelect }: {
  matrix: Matrix;
  label: string;
  exact?: boolean;
  padding?: number;
  patch?: { row: number; col: number; size: number };
  selected?: { row: number; col: number };
  onSelect?: (row: number, col: number) => void;
}) {
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  return <div className={styles.matrixGroup}>
    <h3>{label}</h3>
    <div className={styles.matrixWrap}>
      <table className={styles.matrix} aria-label={label}>
        <tbody>{matrix.map((row, r) => <tr key={r}>{row.map((value, c) => {
          const isPadding = padding > 0 && (r < padding || c < padding || r >= matrix.length - padding || c >= row.length - padding);
          const inPatch = patch && r >= patch.row && r < patch.row + patch.size && c >= patch.col && c < patch.col + patch.size;
          const isSelected = selected?.row === r && selected?.col === c;
          const display = exact ? exactValue(value) : formatValue(value);
          return <td key={c} data-padding={isPadding} data-patch={Boolean(inPatch)} data-sign={onSelect || exact ? Math.sign(value) : 0}>
            {onSelect ? <button type="button" ref={(button) => {
              const key = `${r},${c}`;
              if (button) buttons.current.set(key, button); else buttons.current.delete(key);
            }} aria-label={`Output row ${r}, column ${c}: ${display}`} aria-pressed={isSelected}
              tabIndex={isSelected ? 0 : -1} aria-describedby="window-keyboard-help" onClick={() => onSelect(r, c)}
              onKeyDown={(event) => {
                const moves: Record<string, [number, number]> = {
                  ArrowLeft: [r, c - 1], ArrowRight: [r, c + 1], ArrowUp: [r - 1, c], ArrowDown: [r + 1, c],
                  Home: [r, 0], End: [r, row.length - 1],
                };
                const move = moves[event.key];
                if (!move) return;
                event.preventDefault();
                const nextRow = clampIndex(move[0], matrix.length), nextCol = clampIndex(move[1], row.length);
                onSelect(nextRow, nextCol);
                buttons.current.get(`${nextRow},${nextCol}`)?.focus();
              }}>{display}</button> : <span aria-label={`Row ${r}, column ${c}: ${display}${isPadding ? ", padded zero" : ""}`}>{display}</span>}
          </td>;
        })}</tr>)}</tbody>
      </table>
      {patch && <div className={styles.patchOutline} aria-hidden="true" style={{
        left: `${100 * patch.col / matrix[0].length}%`, top: `${100 * patch.row / matrix.length}%`,
        width: `${100 * patch.size / matrix[0].length}%`, height: `${100 * patch.size / matrix.length}%`,
      }} />}
    </div>
  </div>;
}

export function ConvolutionFilterLabPlayground() {
  const [experimentIndex, setExperimentIndex] = useState(0);
  const [state, setState] = useState<LessonState>(learningExperiments[0].start);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const experiment = learningExperiments[experimentIndex];
  const scenario = imageScenarios.find((item) => item.id === state.imageId)!;
  const filter = kernelOptions.find((item) => item.id === state.filterId)!;
  const analysis = useMemo(() => analyzeConvolution(scenario.image, filter.kernel, state), [scenario.image, filter.kernel, state]);
  const reachedTarget = prediction !== null && matchesState(state, experiment.target);
  const complete = reachedTarget && explanation === experiment.correctExplanation;
  const phase = prediction === null ? 0 : reachedTarget ? 2 : 1;
  const finalExperiment = experimentIndex === learningExperiments.length - 1;

  function reset(index = experimentIndex) {
    setExperimentIndex(index); setState(learningExperiments[index].start);
    setPrediction(null); setExplanation(null);
  }
  function update(next: Partial<LessonState>) {
    setState((current) => {
      const merged = { ...current, ...next };
      const image = imageScenarios.find((item) => item.id === merged.imageId)!.image;
      const kernel = kernelOptions.find((item) => item.id === merged.filterId)!.kernel;
      const size = analyzeConvolution(image, kernel, merged).outputSize;
      return { ...merged, rowIndex: clampIndex(merged.rowIndex, size), colIndex: clampIndex(merged.colIndex, size) };
    });
    setExplanation(null);
  }
  function selectImage(id: string) {
    update({ imageId: id as ImageId }); setPrediction(null);
  }
  const startScenario = imageScenarios.find((item) => item.id === experiment.start.imageId)!;
  const rowSums = analysis.elementProducts.map((row) => row.reduce((sum, value) => sum + value, 0));
  const formulaTerm = (value: number) => value < 0 ? `(${exactValue(value)})` : exactValue(value);

  return <LearningPage title="Convolution Filter Lab" subtitle="Slide a small grid of weights. Trace how one patch becomes one output."
    rail={<ExperimentRail label={finalExperiment ? "Transfer check" : `Experiment ${experimentIndex + 1} of 5`} title={experiment.title} phase={phase}>
      <h3>{reachedTarget ? "What did you notice?" : "Make a prediction"}</h3>
      {!reachedTarget && <>
        <p>{experiment.question}</p>
        <p className={sharedStyles.small}>Start: {startScenario.label} · {kernelOptions.find((item) => item.id === experiment.start.filterId)!.shortLabel} · Stride {experiment.start.stride} · Zero padding {experiment.start.padding} · y[{experiment.start.rowIndex},{experiment.start.colIndex}]</p>
        <ExperimentChoices legend="Your prediction" name="prediction" choices={experiment.predictions} value={prediction} onChange={(id) => {
          setState(experiment.start); setPrediction(id); setExplanation(null);
        }} />
        <p className={sharedStyles.small}>Choosing a prediction restores this experiment’s starting settings.</p>
      </>}
      {prediction !== null && !reachedTarget && <div className={sharedStyles.actionPrompt}><strong>Now try it.</strong> {experiment.action}</div>}
      {reachedTarget && <>
        <p className={sharedStyles.observation} role="status">{prediction === experiment.correctPrediction ? "Your prediction matches the result. " : "The result differed from your prediction. "}{experiment.observation}</p>
        <h3>{experiment.explanationQuestion}</h3>
        <ExperimentChoices legend="Your explanation" name="explanation" choices={experiment.explanations} value={explanation} onChange={setExplanation} />
        {explanation && !complete && <p className={sharedStyles.feedback} role="status">Try again. {experiment.retryHint}</p>}
      </>}
      {complete && <ExperimentResult title={finalExperiment ? "Lesson explained" : "Experiment explained"}>{experiment.takeaway}</ExperimentResult>}
      {complete && <ExperimentButton arrow onClick={() => reset(finalExperiment ? 0 : experimentIndex + 1)}>
        {finalExperiment ? "Restart experiments" : experimentIndex === 4 ? "Try the transfer check" : "Next experiment"}
      </ExperimentButton>}
    </ExperimentRail>}>
    <LessonToolbar scenarios={imageScenarios} selectedId={state.imageId} onSelect={selectImage} onReset={() => reset()} />
    <div className={styles.settings}>
      <fieldset className={styles.filters}><legend>Filter</legend>{kernelOptions.map((item) => <button key={item.id} type="button"
        aria-pressed={state.filterId === item.id} onClick={() => update({ filterId: item.id })}>{item.shortLabel}</button>)}</fieldset>
      <label>Stride<select value={state.stride} onChange={(event) => update({ stride: Number(event.currentTarget.value) })}>
        {[1, 2, 3].map((value) => <option key={value} value={value}>{value}</option>)}
      </select></label>
      <label>Zero padding<select value={state.padding} onChange={(event) => update({ padding: Number(event.currentTarget.value) })}>
        {[0, 1, 2].map((value) => <option key={value} value={value}>{value}</option>)}
      </select></label>
    </div>
    <p className={sharedStyles.small}>Stride is the pixel step. Padding adds zero-valued border cells.</p>
    <section className={styles.images} aria-labelledby="image-output-heading">
      <h2 id="image-output-heading">Your image → output</h2>
      <p className={sharedStyles.caption}>Choose an output cell to inspect its 3 × 3 image window. Rows and columns count from 0.</p>
      <div className={styles.imageFlow}>
        <div><MatrixTable label={`Image + zero padding · ${analysis.paddedImage.length} × ${analysis.paddedImage.length}`} matrix={analysis.paddedImage}
          padding={state.padding} patch={{ row: analysis.topLeftRow, col: analysis.topLeftCol, size: 3 }} />
          <p className={sharedStyles.small}>Gray cells are padding; original zeros stay white.</p></div>
        <span className={styles.flowArrow} aria-hidden="true">→</span>
        <div><MatrixTable label={`Output · ${analysis.outputSize} × ${analysis.outputSize}`} matrix={analysis.output}
          selected={{ row: state.rowIndex, col: state.colIndex }} onSelect={(rowIndex, colIndex) => update({ rowIndex, colIndex })} />
          <p className={sharedStyles.small}>Full map; selected cell y[{state.rowIndex},{state.colIndex}]. ≈ marks rounded values.</p></div>
      </div>
      <div className={styles.position}>
        <strong>Selected output</strong>
        <label>Row<input aria-label="Output row" type="number" min={0} max={analysis.outputSize - 1} step={1} value={state.rowIndex}
          onChange={(event) => { if (Number.isFinite(event.currentTarget.valueAsNumber)) update({ rowIndex: Math.round(event.currentTarget.valueAsNumber) }); }} /></label>
        <label>Column<input aria-label="Output column" type="number" min={0} max={analysis.outputSize - 1} step={1} value={state.colIndex}
          onChange={(event) => { if (Number.isFinite(event.currentTarget.valueAsNumber)) update({ colIndex: Math.round(event.currentTarget.valueAsNumber) }); }} /></label>
        <div className={styles.arrows}>{([
          ["left", "←", 0, -1], ["up", "↑", -1, 0], ["down", "↓", 1, 0], ["right", "→", 0, 1],
        ] as const).map(([label, symbol, dr, dc]) => <button key={label} type="button" aria-label={`Move window ${label}`}
          disabled={state.rowIndex + dr < 0 || state.rowIndex + dr >= analysis.outputSize || state.colIndex + dc < 0 || state.colIndex + dc >= analysis.outputSize}
          onClick={() => update({ rowIndex: state.rowIndex + dr, colIndex: state.colIndex + dc })}>{symbol}</button>)}</div>
      </div>
      <p id="window-keyboard-help" className={sharedStyles.small}>Click an output cell, or focus it and use arrow keys. Home / End moves to the first / last column. Row and Column fields set an exact position.</p>
    </section>
    <section className={styles.construction} aria-labelledby="construction-heading">
      <h2 id="construction-heading">Build one output cell</h2>
      <p className={sharedStyles.caption}>Multiply matching positions, then add all nine products. {filter.description}</p>
      <div className={styles.products}>
        <MatrixTable label="Image patch" matrix={analysis.currentPatch} padding={0} exact />
        <span aria-hidden="true">×</span>
        <MatrixTable label="Kernel weights" matrix={filter.kernel} exact />
        <span aria-hidden="true">=</span>
        <MatrixTable label="Products" matrix={analysis.elementProducts} exact />
      </div>
      <p className={styles.rowSums}>Row sums: {rowSums.map(exactValue).join("; ")}. Fractions are exact.</p>
      <p className={styles.formula}>y[{state.rowIndex},{state.colIndex}] = {rowSums.map(formulaTerm).join(" + ")} = {exactValue(analysis.sum)}</p>
    </section>
    <LessonSummaries label="Live convolution summaries" summaries={[
      { label: "Selected sum", color: "#5031dc", value: formatValue(analysis.sum), definition: "Nine products added.", formula: "Σ patch value × weight" },
      { label: "Output size", color: "#0c1230", value: `${analysis.outputSize} × ${analysis.outputSize}`, definition: "One cell per sampled window.", formula: `floor((5 + 2 × ${state.padding} − 3) / ${state.stride}) + 1 = ${analysis.outputSize}` },
      { label: "Window step", color: "#0c1230", value: `${state.stride} px`, definition: "Weights stay fixed as the patch moves.", formula: "p = padding; s = stride" },
    ]} />
    <p className={sharedStyles.small}>CNN convention: weights are used as shown, without flipping (cross-correlation). One input channel, no bias. These are fixed teaching filters, not learned weights.</p>
    <p className={sharedStyles.liveUpdate} role="status" aria-live="polite" aria-atomic="true">{scenario.label}, {filter.shortLabel}, stride {state.stride}, zero padding {state.padding}; output {analysis.outputSize} by {analysis.outputSize}; selected row {state.rowIndex}, column {state.colIndex}, sum {exactValue(analysis.sum)}.</p>
  </LearningPage>;
}
