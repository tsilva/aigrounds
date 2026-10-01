"use client";

import { useMemo, useState, type CSSProperties } from "react";
import {
  ExperimentButton, ExperimentChoices, ExperimentRail, ExperimentResult,
  LearningPage, LessonSummaries, LessonToolbar,
} from "@/components/learning-page/learning-page";
import shared from "@/components/learning-page/learning-page.module.css";
import { analyzeProduct, formatShape, formatTerm, getDotProductTerms, type CellPosition, type Matrix } from "./matrix-multiplication-engine";
import { incompatibleExample, matrixShapePresets } from "./scenario";
import { guidedPresetId, matrixExperiments } from "./learning-experiments";
import styles from "./playground.module.css";

const cellName = ({ row, col }: CellPosition) => `C[${row + 1},${col + 1}]`;
const cellKey = ({ row, col }: CellPosition) => `${row},${col}`;
const guidedPreset = matrixShapePresets.find((preset) => preset.id === guidedPresetId)!;
const scenarios = matrixShapePresets.map((preset, index) => ({
  id: preset.id, label: preset.label,
  shortLabel: ["Three terms", "Two terms", "One output column"][index],
}));

function MatrixGrid({ name, matrix, kind, selected, onSelect }: {
  name: string; matrix: Matrix; kind: "left" | "right" | "product";
  selected: CellPosition; onSelect?: (cell: CellPosition) => void;
}) {
  const shape = [matrix.length, matrix[0].length] as [number, number];
  return <div className={styles.matrix}>
    <h3>{name} ({formatShape(shape)})</h3>
    <table aria-label={`Matrix ${name}`}>
      <thead><tr><th aria-label="Row and column indices" />{matrix[0].map((_, col) =>
        <th scope="col" key={col}>{kind === "left" ? "k" : "j"} = {col + 1}</th>)}</tr></thead>
      <tbody>{matrix.map((row, rowIndex) => <tr key={rowIndex}>
        <th scope="row">{kind === "right" ? "k" : "i"} = {rowIndex + 1}</th>
        {row.map((value, col) => {
          const cell = { row: rowIndex, col };
          const isSelected = cellKey(cell) === cellKey(selected);
          return <td key={col} data-highlight={kind === "left" && selected.row === rowIndex ? "row" : kind === "right" && selected.col === col ? "column" : undefined}>
            {onSelect ? <button type="button" className={styles.outputCell}
              aria-label={`Select ${cellName(cell)}, value ${value}`} aria-pressed={isSelected}
              aria-describedby="matrix-keyboard-help" onClick={() => onSelect(cell)}>{value}</button> : value}
          </td>;
        })}
      </tr>)}</tbody>
    </table>
    <p className={styles.matrixCaption}>{kind === "left" ? `Row ${selected.row + 1} of A` : kind === "right" ? `Column ${selected.col + 1} of B` : `Selected: ${cellName(selected)}`}</p>
  </div>;
}

export function MatrixMultiplicationPlayground() {
  const [presetId, setPresetId] = useState(matrixShapePresets[0].id);
  const [selected, setSelected] = useState<CellPosition>(matrixShapePresets[0].defaultCell);
  const [activeStep, setActiveStep] = useState(0);
  const [experimentIndex, setExperimentIndex] = useState(0);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [shapeTried, setShapeTried] = useState(false);
  const [visitedTerms, setVisitedTerms] = useState<number[]>([]);
  const [visitedFormulas, setVisitedFormulas] = useState<string[]>([]);
  const [cellTried, setCellTried] = useState(false);
  const [freeExplore, setFreeExplore] = useState(false);
  const preset = matrixShapePresets.find((item) => item.id === presetId)!;
  const analysis = useMemo(() => analyzeProduct(preset.left, preset.right), [preset]);
  const product = analysis.product!;
  const terms = useMemo(() => getDotProductTerms({ left: preset.left, right: preset.right, cell: selected }), [preset, selected]);
  const experiment = matrixExperiments[experimentIndex];
  const guidedShape = presetId === guidedPresetId;
  const reachedTarget = prediction !== null && guidedShape && (experimentIndex === 0 ? shapeTried : experimentIndex === 1
    ? cellTried && cellKey(selected) === "0,1" && visitedTerms.includes(0) && visitedTerms.includes(1) && activeStep === 1
    : visitedFormulas.includes("0,1") && visitedFormulas.includes("1,0") && cellKey(selected) === "1,0");
  const complete = reachedTarget && checked && explanation === "correct";
  const phase = prediction === null ? 0 : reachedTarget ? 2 : 1;
  const revealedTerms = terms.slice(0, activeStep + 1);
  const runningTotal = revealedTerms.at(-1)!.runningTotal;
  const total = terms.at(-1)!.runningTotal;
  const equation = `${cellName(selected)} = ${revealedTerms.map((term) => formatTerm(term.left, term.right)).join(" + ")}${activeStep < terms.length - 1 ? " + …" : ""} = ${runningTotal}${activeStep < terms.length - 1 ? " so far" : ""}`;

  function clearEvidence() {
    setShapeTried(false); setVisitedTerms([]); setVisitedFormulas([]); setCellTried(false);
    setExplanation(null); setChecked(false);
  }
  function restoreStartingState(index = experimentIndex, exploring = freeExplore) {
    const start = exploring ? preset : index === 0 ? matrixShapePresets[0] : guidedPreset;
    setPresetId(start.id); setSelected(index === 2 && !exploring ? { row: 0, col: 1 } : start.defaultCell);
    setActiveStep(0); clearEvidence();
  }
  function reset() { restoreStartingState(); setPrediction(null); }
  function predict(value: string) { restoreStartingState(); setPrediction(value); }
  function selectPreset(id: string) {
    const next = matrixShapePresets.find((item) => item.id === id)!;
    setPresetId(id); setSelected(next.defaultCell); setActiveStep(0); clearEvidence();
    if (prediction !== null && experimentIndex === 0 && id === guidedPresetId) setShapeTried(true);
  }
  function selectCell(cell: CellPosition, formula = false) {
    setSelected(cell); setActiveStep(0); setVisitedTerms([]); setExplanation(null); setChecked(false);
    if (prediction !== null && guidedShape) {
      if (experimentIndex === 1 && cellKey(cell) === "0,1") setCellTried(true);
      if (experimentIndex === 2 && formula) {
        setVisitedFormulas((previous) => [...new Set([...previous, cellKey(cell)])]);
      }
    }
  }
  function selectStep(step: number) {
    setActiveStep(step); setExplanation(null); setChecked(false);
    if (prediction !== null && guidedShape && experimentIndex === 1 && cellKey(selected) === "0,1" && cellTried) {
      setVisitedTerms((previous) => [...new Set([...previous, step])]);
    }
  }
  function changeExperiment(index: number) {
    setExperimentIndex(index); setFreeExplore(false); setPrediction(null); restoreStartingState(index, false);
  }

  return <LearningPage title="Matrix Multiplication Lab"
    subtitle="Select a cell. Follow its row and column. Add the products."
    rail={<ExperimentRail label={freeExplore ? "Optional practice" : `Experiment ${experimentIndex + 1} of 3`}
      title={freeExplore ? "Try another shape" : experiment.title} phase={freeExplore ? undefined : phase}>
      {freeExplore ? <>
        <h3>Transfer the rule</h3>
        <p>Before choosing 3x2 x 2x1, predict the output shape and how many products each cell uses. Then select C[3,1] and reveal both terms. Explain why its result is 30 even though one factor is zero.</p>
        <p className={shared.small}>The fixed matrices let you focus on shapes and row-column pairing. Use the other presets for more practice.</p>
        <ExperimentButton onClick={() => changeExperiment(0)}>Restart the experiments</ExperimentButton>
      </> : <>
        {!reachedTarget && <>
          <h3>Make a prediction</h3><p>{experiment.question}</p>
          <ExperimentChoices legend="Your prediction" name="matrix-prediction" choices={experiment.predictions}
            value={prediction} onChange={predict} />
          <p className={shared.small}>Choosing a prediction restores the starting matrices.</p>
        </>}
        {prediction !== null && !reachedTarget && <div className={shared.actionPrompt}>
          <p><strong>Now try it.</strong> {experiment.action}</p>
          {experimentIndex === 1 && <p className={shared.small}>Select each k button after selecting C[1,2], including k = 1.</p>}
        </div>}
        {reachedTarget && <>
          <h3>What did you notice?</h3>
          <p role="status" className={shared.observation}>{prediction === "correct" ? "Your prediction matches the evidence." : "The evidence differed from your prediction. Use it to revise your explanation."}</p>
          <h3>{experiment.explanationQuestion}</h3>
          <ExperimentChoices legend="Your explanation" name="matrix-explanation" choices={experiment.explanations}
            value={explanation} onChange={(value) => { setExplanation(value); setChecked(false); }} />
          {!complete && <ExperimentButton disabled={explanation === null} onClick={() => setChecked(true)}>Check explanation</ExperimentButton>}
          {checked && !complete && <p className={shared.feedback} role="status">Try again. {experiment.recovery}</p>}
        </>}
        {complete && <>
          <ExperimentResult title={experimentIndex === 2 ? "Lesson explained" : "Experiment explained"}>{experiment.takeaway}</ExperimentResult>
          <ExperimentButton arrow onClick={() => {
            if (experimentIndex < 2) changeExperiment(experimentIndex + 1);
            else { setFreeExplore(true); setPrediction(null); clearEvidence(); }
          }}>{experimentIndex < 2 ? `Next: ${matrixExperiments[experimentIndex + 1].title}` : "Try another shape"}</ExperimentButton>
        </>}
        <div className={styles.experimentNavigation}>
          <button type="button" disabled={experimentIndex === 0} onClick={() => changeExperiment(experimentIndex - 1)}>← Previous experiment</button>
          <button type="button" onClick={() => { setFreeExplore(true); setPrediction(null); clearEvidence(); }}>Explore freely</button>
        </div>
      </>}
    </ExperimentRail>}>
    <LessonToolbar scenarios={scenarios} selectedId={presetId} onSelect={selectPreset} onReset={reset} />
    <section className={styles.matricesSection} aria-label="Matrix multiplication workbench">
      <div className={styles.heading}><h2>Your matrices</h2><span>Select a cell in C to trace how it is built</span></div>
      <p className={styles.shape}>({analysis.leftShape[0]} × <strong>{analysis.leftShape[1]}</strong>) × (<strong>{analysis.rightShape[0]}</strong> × {analysis.rightShape[1]}) → ({formatShape(analysis.outputShape!)})</p>
      <p className={shared.small}>Inner sizes match: {analysis.leftShape[1]} terms per output cell. Shape means rows × columns.</p>
      <div className={styles.matrices}>
        <MatrixGrid name="A" matrix={preset.left} kind="left" selected={selected} />
        <span className={styles.operator} aria-hidden="true">×</span>
        <MatrixGrid name="B" matrix={preset.right} kind="right" selected={selected} />
        <span className={styles.operator} aria-hidden="true">=</span>
        <MatrixGrid name="C = A × B" matrix={product} kind="product" selected={selected} onSelect={selectCell} />
      </div>
      <p id="matrix-keyboard-help" className={styles.keyboardHelp}>Tab to an output cell; Enter or Space to select.</p>
    </section>
    <section className={styles.construction} aria-label="Selected cell calculation">
      <h2>Build {cellName(selected)}</h2><p>A dot product multiplies matching pairs, then adds their products.</p>
      <div className={styles.terms} style={{ "--term-count": terms.length } as CSSProperties}>
        {terms.map((term) => <div className={styles.term} key={term.index}>
          <button type="button" aria-pressed={activeStep === term.index} onClick={() => selectStep(term.index)}>k = {term.index + 1}</button>
          <p>{term.index <= activeStep ? `${formatTerm(term.left, term.right)} = ${term.product}` : `Reveal pair ${term.index + 1}`}</p>
          <small>Pair {term.index + 1}</small>
        </div>)}
      </div>
      <p>Running sum: {revealedTerms.map((term) => term.runningTotal).join(" → ")}{activeStep < terms.length - 1 ? " → …" : ""}</p>
      <div className={styles.equation}>{equation}</div>
      <p className={shared.small}>k pairs each position in the row with the same position in the column.</p>
      <p className={shared.liveUpdate} role="status" aria-live="polite">{cellName(selected)} uses row {selected.row + 1} and column {selected.col + 1}. Step {activeStep + 1} of {terms.length}; running sum {runningTotal}.</p>
    </section>
    <LessonSummaries label="Live matrix summaries" summaries={[
      { label: "Output shape", color: "#5031dc", value: formatShape(analysis.outputShape!), definition: "A’s rows × B’s columns.", formula: `(${formatShape(analysis.leftShape)}) × (${formatShape(analysis.rightShape)}) → (${formatShape(analysis.outputShape!)})` },
      { label: "Terms per cell", color: "#5031dc", value: String(terms.length), definition: "The shared inner size.", formula: `${analysis.leftShape[1]} A columns = ${analysis.rightShape[0]} B rows` },
      { label: "Selected result", color: "#5031dc", value: String(total), definition: `Row ${selected.row + 1} · Column ${selected.col + 1}.`, formula: `${cellName(selected)} = ${total}` },
    ]} />
    <section className={styles.fullProduct} aria-label="All output formulas and multiplication rules">
      <h2>Every output cell follows the same rule</h2>
      <div className={styles.formulas}>{product.flatMap((row, rowIndex) => row.map((value, col) => {
        const cell = { row: rowIndex, col };
        const formula = `${cellName(cell)}: ${getDotProductTerms({ left: preset.left, right: preset.right, cell }).map((term) => formatTerm(term.left, term.right)).join(" + ")} = ${value}`;
        return <button type="button" key={cellKey(cell)} aria-pressed={cellKey(selected) === cellKey(cell)} onClick={() => selectCell(cell, true)}>{formula}</button>;
      }))}</div>
      <p className={shared.small}>{product.length * product[0].length} output cells means {product.length * product[0].length} row-column dot products.</p>
      <div className={styles.rules}>
        <p><strong>Incompatible example:</strong> ({formatShape(incompatibleExample.leftShape)}) × ({formatShape(incompatibleExample.rightShape)})<br />Blocked: inner sizes {incompatibleExample.leftShape[1]} and {incompatibleExample.rightShape[0]} differ.</p>
        <p><strong>Dimension rule</strong><br />(m × n) × (n × p) → (m × p)</p>
      </div>
      <p className={styles.ruleNote}>C[i,j] = Σ A[i,k] × B[k,j], for k = 1 to n. Σ means add all the products. i chooses a row, j a column, and n is the shared size.</p>
    </section>
  </LearningPage>;
}
