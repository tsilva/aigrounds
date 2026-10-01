import type { ReactNode } from "react";
import shared from "@/components/learning-page/learning-page.module.css";
import { formatFixed, formatProbability, formatSigned, type BackpropAnalysis } from "./backpropagation-inspector-engine";
import { outputWeights } from "./scenario";
import styles from "./playground.module.css";

function Matrix({ label, values }: { label: string; values: number[][] }) {
  const shape = `${values.length} × ${values[0].length}`;
  return <span className={styles.matrixTerm}>
    <span className={styles.matrixLabel}>{label} · {shape}</span>
    <span className={styles.matrix} style={{ gridTemplateColumns: `repeat(${values[0].length}, minmax(0, 1fr))` }} role="img" aria-label={`${label}, ${shape} matrix; ${values.map((row) => row.map((value) => formatSigned(value)).join(", ")).join("; ")}`}>
      {values.flat().map((value, index) => <span key={index} aria-hidden="true">{formatSigned(value)}</span>)}
    </span>
  </span>;
}

function Equation({ label, children }: { label: string; children: ReactNode }) {
  return <div className={styles.matrixEquation} role="group" aria-label={label}>{children}</div>;
}

export function MatrixComputation({ analysis, phase }: { analysis: BackpropAnalysis; phase: "forward" | "backward" | "update" }) {
  const updated = phase === "update";
  const values = updated ? analysis.afterUpdate : analysis;
  const weights = updated ? [[analysis.updates.wOut1.after, analysis.updates.wOut2.after]] : [[outputWeights.wOut1, outputWeights.wOut2]];
  return <section className={styles.matrixFlow} aria-label="Matrix computation">
    <h2>{phase === "backward" ? "← Backward through the same output layer" : updated ? "Forward with the previewed weight matrix" : "Forward as a matrix product"}</h2>
    <p className={shared.small}>One example: h is a 2 × 1 column of cached activations; W is a 1 × 2 row of weights. W × h gives one value, z. Bias b, probability p, and target y are scalars. These are the same calculations as Scalars.</p>
    <p className={shared.formula}>{updated ? "z′ = W′ × h + b" : "z = W × h + b"}</p>
    <Equation label="Weighted sum matrix product"><Matrix label={updated ? "W′" : "W"} values={weights} /><span>×</span><Matrix label="h" values={[[analysis.h1], [analysis.h2]]} /><span>+ b ({formatSigned(outputWeights.bias)}) = {updated ? "z′" : "z"} {formatFixed(values.z, 3)}</span></Equation>
    <p className={shared.formula}>{updated ? "p′ = sigmoid(z′)" : "p = sigmoid(z)"} = {formatProbability(values.probability)}<br />{updated ? "L′" : "L"} = {analysis.target === 1 ? updated ? "−ln(p′)" : "−ln(p)" : updated ? "−ln(1 − p′)" : "−ln(1 − p)"} = {formatFixed(values.loss, 3)} · y = {analysis.target}</p>
    {phase === "backward" ? <p className={shared.observation}>← δ = dL/dz = p − y = {formatSigned(analysis.outputDelta)}. δ (delta) is the scalar sensitivity returned through the product below. No weights change during Backward.</p> : <p className={shared.small}>{updated ? "This is one fresh forward pass after changing both entries of W; h and b stay fixed." : "The target enters the loss calculation, not W × h or the prediction."}</p>}
  </section>;
}

export function MatrixWeightGradients({ analysis }: { analysis: BackpropAnalysis }) {
  return <section className={styles.evidence} aria-label="Output weight gradients">
    <h2>One output gradient, two local multipliers</h2>
    <p className={shared.small}>δ = p − y = {formatSigned(analysis.outputDelta)} uses the starting prediction for sigmoid with binary cross entropy. ∇W L means the matrix of loss gradients for W. The superscript T transposes a column into a row.</p>
    <p className={shared.formula}>∇W L = δ × hᵀ · (1 × 1) × (1 × 2) → (1 × 2)</p>
    <Equation label="Output weight gradient matrix"><span>δ {formatSigned(analysis.outputDelta)} ×</span><Matrix label="hᵀ" values={[[analysis.h1, analysis.h2]]} /><span>=</span><Matrix label="∇W L" values={[[analysis.outputGradients.wOut1, analysis.outputGradients.wOut2]]} /></Equation>
    <p className={shared.small}>The first entry is dL/dw1; the second is dL/dw2. Each activation multiplies the same δ. A negative gradient means a small increase in that weight reduces loss; a positive gradient means it raises loss.</p>
  </section>;
}

export function MatrixHiddenGradient({ analysis }: { analysis: BackpropAnalysis }) {
  return <>
    <p className={shared.small}>∇h L is the column of loss sensitivities for the cached activations. Transposing W gives a 2 × 1 column, which multiplies the same scalar δ.</p>
    <p className={shared.formula}>∇h L = Wᵀ × δ · (2 × 1) × (1 × 1) → (2 × 1)</p>
    <Equation label="Hidden activation gradient matrix"><Matrix label="Wᵀ" values={[[outputWeights.wOut1], [outputWeights.wOut2]]} /><span>× δ {formatSigned(analysis.outputDelta)} =</span><Matrix label="∇h L" values={[[analysis.hiddenCredit.h1], [analysis.hiddenCredit.h2]]} /></Equation>
    <p className={shared.small}>The entries are dL/dh1 and dL/dh2. They use the starting weights, just like ∇W L uses the starting prediction.</p>
  </>;
}

export function MatrixUpdate({ analysis, learningRate }: { analysis: BackpropAnalysis; learningRate: number }) {
  return <>
    <p className={shared.formula}>W′ = W − η × ∇W L</p>
    <Equation label="One matrix gradient descent step"><Matrix label="W" values={[[outputWeights.wOut1, outputWeights.wOut2]]} /><span>− {formatFixed(learningRate)} ×</span><Matrix label="∇W L" values={[[analysis.outputGradients.wOut1, analysis.outputGradients.wOut2]]} /><span>=</span><Matrix label="W′" values={[[analysis.updates.wOut1.after, analysis.updates.wOut2.after]]} /></Equation>
    <Equation label="Compare matrix changes at two learning rates"><Matrix label="ΔW at η = 0.10" values={[[-0.1 * analysis.outputGradients.wOut1, -0.1 * analysis.outputGradients.wOut2]]} /><span>→</span><Matrix label={`ΔW at η = ${formatFixed(learningRate)}`} values={[[analysis.updates.wOut1.change, analysis.updates.wOut2.change]]} /></Equation>
    <p className={shared.small}>ΔW = −η × ∇W L is the change in W. ∇W L stays fixed for this starting state. Both entries change together; bias b stays fixed.</p>
  </>;
}
