"use client";

import { useId, useState } from "react";
import { ExperimentButton, ExperimentChoices, ExperimentRail, ExperimentResult, LearningPage, LessonSummaries, LessonToolbar } from "@/components/learning-page/learning-page";
import shared from "@/components/learning-page/learning-page.module.css";
import { analyzeBackprop, formatFixed, formatProbability, formatSigned, type BackpropAnalysis } from "./backpropagation-inspector-engine";
import { backpropCases, defaultCaseId, defaultLearningRate, getBackpropCase, outputWeights, type BackpropCase } from "./scenario";
import { backpropExperiments } from "./learning-experiments";
import styles from "./playground.module.css";
import { MatrixComputation, MatrixHiddenGradient, MatrixUpdate, MatrixWeightGradients } from "./MatrixEvidence";

type Phase = "forward" | "backward" | "update";
const scenarios = backpropCases.map((item) => ({ id: item.id, label: item.name, shortLabel: item.id === "case-c" ? "h1 = h2 · target 1" : `Same activations · target ${item.target}` }));

function ComputationGraph({ analysis, phase }: { analysis: BackpropAnalysis; phase: Phase }) {
  const arrowId = useId().replace(/:/g, "");
  const backward = phase === "backward";
  const updated = phase === "update";
  const values = updated ? analysis.afterUpdate : analysis;
  const weight1 = updated ? analysis.updates.wOut1.after : outputWeights.wOut1;
  const weight2 = updated ? analysis.updates.wOut2.after : outputWeights.wOut2;
  return <figure className={styles.graph}>
    <div className={styles.compactGraph} aria-label="Compact computation flow">
      <p>h1 {formatFixed(analysis.h1)} × w1 {formatSigned(weight1)}</p>
      <p>+ h2 {formatFixed(analysis.h2)} × w2 {formatSigned(weight2)}</p>
      <p>+ bias −0.25 → z {formatFixed(values.z, 3)}</p>
      <p>sigmoid(z) → p {formatProbability(values.probability)}</p>
      <p>Compare with target {analysis.target} → loss {formatFixed(values.loss, 3)}</p>
      {backward && <p className={styles.gradient}>← Return dL/dz = p − y = {formatSigned(analysis.outputDelta)} through each local multiplier below.</p>}
    </div>
    <svg viewBox="0 0 720 260" role="img" aria-labelledby={`${arrowId}-title ${arrowId}-description`}>
      <title id={`${arrowId}-title`}>{backward ? "Backward: loss sensitivity returns through local derivatives" : updated ? "Forward prediction using the two updated weights" : "Forward: cached activations become a probability"}</title>
      <desc id={`${arrowId}-description`}>{backward ? `Output gradient ${formatSigned(analysis.outputDelta)} is multiplied by h1 and h2 for weight gradients, or by w1 and w2 for hidden-activation signals.` : `h1 ${analysis.h1} times weight 1 ${weight1}, plus h2 ${analysis.h2} times weight 2 ${weight2}, plus fixed bias -0.25 gives z ${formatFixed(values.z, 3)}. Sigmoid gives probability ${formatProbability(values.probability)}.`}</desc>
      <defs><marker id={arrowId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill={backward ? "#ad4508" : "#536487"} /></marker></defs>
      <g fill="none" stroke={backward ? "#ad4508" : "#536487"} strokeWidth="2" markerEnd={`url(#${arrowId})`}>
        {backward ? <><path d="M 355 94 L 116 65" /><path d="M 355 155 L 116 195" /><path d="M 517 124 L 421 124" /></> : <><path d="M 116 65 L 355 94" /><path d="M 116 195 L 355 155" /><path d="M 421 124 L 517 124" /></>}
      </g>
      <g className={styles.node}>
        <circle cx="78" cy="65" r="36" /><circle cx="78" cy="195" r="36" /><circle cx="388" cy="124" r="36" /><circle cx="562" cy="124" r="43" />
      </g>
      <g textAnchor="middle" className={styles.graphText}>
        <text x="78" y="57">h1</text><text x="78" y="80">{formatFixed(analysis.h1)}</text>
        <text x="78" y="187">h2</text><text x="78" y="210">{formatFixed(analysis.h2)}</text>
        <text x="388" y="116">z</text><text x="388" y="139">{formatFixed(values.z, 3)}</text>
        <text x="562" y="116">p</text><text x="562" y="140">{formatProbability(values.probability)}</text>
        <text x="230" y="44">w1 = {formatSigned(weight1)}</text><text x="230" y="219">w2 = {formatSigned(weight2)}</text>
        <text x="469" y="99">{backward ? "p − y" : "sigmoid"}</text>
        {backward && <text x="469" y="158" className={styles.gradient}>{formatSigned(analysis.outputDelta)}</text>}
        <text x="388" y="207">bias = −0.25</text><text x="654" y="94">Target y</text><text x="654" y="119">{analysis.target}</text>
        <text x="654" y="161">Loss</text><text x="654" y="185">{formatFixed(values.loss, 3)}</text>
      </g>
    </svg>
    <figcaption className={shared.small}>{backward ? "← Backward computes sensitivities. The values and weights have not changed." : updated ? "→ A fresh forward pass with the previewed weights. This is one step from the starting state." : "→ Forward computes a prediction. The target is used to measure loss, not to compute p."}</figcaption>
  </figure>;
}

function GradientEvidence({ analysis }: { analysis: BackpropAnalysis }) {
  return <section className={styles.evidence} aria-label="Output weight gradients">
    <h2>One output gradient, two local multipliers</h2>
    <p className={shared.small}>A gradient is the loss’s sensitivity to a tiny increase. For this sigmoid output with binary cross entropy, dL/dz = p − y = {formatSigned(analysis.outputDelta)}.</p>
    <div className={styles.gradientColumns}>{[analysis.h1, analysis.h2].map((h, index) => {
      const gradient = index === 0 ? analysis.outputGradients.wOut1 : analysis.outputGradients.wOut2;
      return <div key={index}><h3>Weight {index + 1} gradient</h3><p className={shared.formula}>dL/dw{index + 1} = h{index + 1} × (p − y)<br />{formatFixed(h)} × {formatSigned(analysis.outputDelta)} = {formatSigned(gradient)}</p>
        <p className={shared.small}>{gradient === 0 ? "Zero activation: changing this weight has no effect on this example’s prediction." : gradient < 0 ? "Negative gradient: a small increase in this weight reduces loss." : "Positive gradient: a small increase in this weight raises loss."}</p></div>;
    })}</div>
  </section>;
}

function UpdateEvidence({ analysis, learningRate, matrixMode, onRateChange }: { analysis: BackpropAnalysis; learningRate: number; matrixMode: boolean; onRateChange: (value: number) => void }) {
  return <section className={styles.evidence} aria-label="One gradient descent step">
    <h2>Turn the gradient into a step</h2>
    <p className={shared.small}>Gradient descent subtracts the gradient: new weight = old weight − η × gradient. η (eta) is the learning rate, which controls step size.</p>
    <div className={styles.rateEditor}><label htmlFor="backprop-rate">Learning rate η</label><input id="backprop-rate" type="range" min="0" max="1" step="0.01" value={learningRate} aria-valuetext={formatFixed(learningRate)} onChange={(event) => onRateChange(Number(event.currentTarget.value))} /><label className={shared.srOnly} htmlFor="backprop-rate-value">Exact learning rate</label><input id="backprop-rate-value" type="number" min="0" max="1" step="0.01" value={learningRate} onChange={(event) => { if (Number.isFinite(event.currentTarget.valueAsNumber)) onRateChange(event.currentTarget.valueAsNumber); }} /></div>
    {matrixMode ? <MatrixUpdate analysis={analysis} learningRate={learningRate} /> : <div className={styles.tableWrap}><table><caption>Both output weights change together; bias stays fixed.</caption><thead><tr><th scope="col">Weight</th><th scope="col">Before</th><th scope="col">Gradient</th><th scope="col">Change at η = 0.10</th><th scope="col">Change at η = {formatFixed(learningRate)}</th><th scope="col">After</th></tr></thead><tbody>{Object.values(analysis.updates).map((update, index) => <tr key={index}><th scope="row">w{index + 1}</th><td>{formatSigned(update.before)}</td><td>{formatSigned(update.gradient)}</td><td>{formatSigned(-0.1 * update.gradient)}</td><td>{formatSigned(update.change)}</td><td>{formatSigned(update.after)}</td></tr>)}</tbody></table></div>}
    <p className={shared.observation} role="status">One step: p {formatProbability(analysis.probability)} → {formatProbability(analysis.afterUpdate.probability)}; loss {formatFixed(analysis.loss, 3)} → {formatFixed(analysis.afterUpdate.loss, 3)}.</p>
    <p className={shared.small}>Changing η previews the same starting state each time; it does not take repeated training steps. At η = 0, neither weight changes. A bigger step is not a general guarantee of better training.</p>
  </section>;
}

export function BackpropagationInspectorPlayground() {
  const [matrixMode, setMatrixMode] = useState(false);
  const [example, setExample] = useState<BackpropCase>(() => getBackpropCase(defaultCaseId));
  const [experimentIndex, setExperimentIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("forward");
  const [learningRate, setLearningRate] = useState(defaultLearningRate);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [tried, setTried] = useState(false);
  const [hiddenOpen, setHiddenOpen] = useState(false);
  const [exploring, setExploring] = useState(false);
  const experiment = backpropExperiments[experimentIndex];
  const analysis = analyzeBackprop(example, learningRate);
  const complete = tried && explanation === "correct";
  const selectedScenario = backpropCases.find((item) => item.target === example.target && item.hiddenActivations.every((value, index) => value === example.hiddenActivations[index]))?.id ?? "custom";

  function startExperiment(index: number) {
    setExperimentIndex(index); setExample(getBackpropCase(backpropExperiments[index].caseId));
    setPhase(index === 2 ? "update" : "forward"); setLearningRate(index === 2 ? 0.1 : defaultLearningRate);
    setPrediction(null); setExplanation(null); setTried(false); setHiddenOpen(false); setExploring(false);
  }
  function selectScenario(id: string) { startExperiment(id === "case-a" ? 0 : id === "case-b" ? 1 : 3); }
  function editExample(next: BackpropCase) { setExample(next); setExploring(true); setPrediction(null); setExplanation(null); setTried(false); }
  function choosePhase(next: Phase) {
    setPhase(next);
    if (!prediction && !exploring) { setExploring(true); return; }
    if (!exploring && ((experimentIndex === 0 && next === "backward") || (experimentIndex === 1 && next === "update"))) setTried(true);
  }
  function changeRate(value: number) {
    const next = Math.max(0, Math.min(1, value)); setLearningRate(next);
    if (!exploring && experimentIndex === 2) { setTried(prediction !== null && Math.abs(next - 0.5) < 1e-9); setExplanation(null); }
    else if (!exploring) { setExploring(true); setPrediction(null); setExplanation(null); setTried(false); }
  }
  function tryExperiment() {
    if (!prediction) return;
    if (experimentIndex === 2) changeRate(0.5);
    else { setPhase(experimentIndex === 1 ? "update" : "backward"); setHiddenOpen(experimentIndex === 3); setTried(true); }
  }
  const observation = experimentIndex === 0 ? `Weight gradients: w1 ${formatSigned(analysis.outputGradients.wOut1)}, w2 ${formatSigned(analysis.outputGradients.wOut2)}.` : experimentIndex === 1 ? `Weight changes: w1 ${formatSigned(analysis.updates.wOut1.change)}, w2 ${formatSigned(analysis.updates.wOut2.change)}. Loss ${formatFixed(analysis.loss, 3)} → ${formatFixed(analysis.afterUpdate.loss, 3)}.` : experimentIndex === 2 ? `Gradients remain ${formatSigned(analysis.outputGradients.wOut1)} and ${formatSigned(analysis.outputGradients.wOut2)}. The changes at η = 0.50 are five times those at η = 0.10.` : `Weight gradients are both ${formatSigned(analysis.outputGradients.wOut1)}; hidden-activation signals are ${formatSigned(analysis.hiddenCredit.h1)} and ${formatSigned(analysis.hiddenCredit.h2)}.`;

  return <LearningPage title="Backpropagation Inspector" subtitle="Follow one prediction backward, then test a weight update." rail={
    <ExperimentRail label={exploring ? "Free exploration" : `Experiment ${experimentIndex + 1} of 4`} title={exploring ? "Try your own case" : experiment.title} phase={exploring ? undefined : !prediction ? 0 : !tried ? 1 : 2}>
      {exploring ? <><p>Change the activations or target, switch stages, and compare the live evidence. Try h1 = 0: what happens to the weight 1 gradient?</p><ExperimentButton onClick={() => startExperiment(experimentIndex)}>Resume experiment {experimentIndex + 1}</ExperimentButton></> : <>
        {!tried && <><h3>Make a prediction</h3><p className={shared.question}>{experiment.question}</p><ExperimentChoices legend="Your prediction" name="backprop-prediction" choices={experiment.predictions} value={prediction} onChange={setPrediction} /><p className={shared.actionPrompt}>{matrixMode ? experiment.matrixInstruction ?? experiment.instruction : experiment.instruction}</p><ExperimentButton disabled={!prediction} onClick={tryExperiment}>{experiment.action}</ExperimentButton></>}
        {tried && <><p className={shared.recorded}>Your prediction: {experiment.predictions.find((item) => item.id === prediction)?.label}</p><p className={shared.observation}>{observation}</p><h3>Explain what changed</h3><ExperimentChoices legend="Your explanation" name="backprop-explanation" choices={experiment.explanations} value={explanation} onChange={setExplanation} />
          {explanation && !complete && <p className={shared.feedback} role="status">{experiment.recovery}</p>}
          {complete && <><ExperimentResult>{experiment.takeaway}</ExperimentResult><ExperimentButton arrow onClick={() => experimentIndex < 3 ? startExperiment(experimentIndex + 1) : setExploring(true)}>{experimentIndex < 3 ? "Next experiment" : "Explore freely"}</ExperimentButton></>}
        </>}
      </>}
    </ExperimentRail>
  }>
    <LessonToolbar scenarios={scenarios} selectedId={selectedScenario} onSelect={selectScenario} onReset={() => startExperiment(0)} />
    <section className={styles.caseEditor} aria-label="Training case">
      <h2>Your training case</h2><p className={shared.small}>h1 and h2 are hidden activations: outputs cached from an earlier layer. We inspect one sigmoid output unit. Probability p means P(target = 1); binary cross entropy measures its prediction error.</p>
      <div className={styles.editors}>{example.hiddenActivations.map((value, index) => <label key={index}>Hidden activation h{index + 1}<input type="number" min="0" max="1" step="0.01" value={value} aria-describedby="backprop-editor-help" onChange={(event) => {
        const next = event.currentTarget.valueAsNumber; if (!Number.isFinite(next)) return;
        const activations: [number, number] = [...example.hiddenActivations]; activations[index] = Math.max(0, Math.min(1, next)); editExample({ ...example, hiddenActivations: activations });
      }} /></label>)}<label>Target y<select value={example.target} onChange={(event) => editExample({ ...example, target: Number(event.currentTarget.value) as 0 | 1 })}><option value="0">0</option><option value="1">1</option></select></label></div>
      <p id="backprop-editor-help" className={shared.small}>Type exact values from 0 to 1, or use ↑ / ↓ in an activation field. Editing starts free exploration; Resume experiment restores its starting case.</p>
    </section>
    <div className={styles.representation} role="group" aria-label="Calculation view"><span>Calculation view</span>{[{ label: "Scalars", value: false }, { label: "Matrices", value: true }].map((view) => <button key={view.label} type="button" aria-pressed={matrixMode === view.value} onClick={() => setMatrixMode(view.value)} className={shared.reset}>{view.label}</button>)}</div>
    <div className={styles.phases} role="group" aria-label="Computation stage">{(["forward", "backward", "update"] as const).map((item) => <button key={item} type="button" aria-pressed={phase === item} onClick={() => choosePhase(item)} className={shared.reset}>{item[0].toUpperCase() + item.slice(1)}</button>)}</div>
    {matrixMode ? <MatrixComputation analysis={analysis} phase={phase} /> : <ComputationGraph analysis={analysis} phase={phase} />}
    {phase === "forward" && !matrixMode && <section className={styles.evidence} aria-label="Forward computation"><h2>Build the prediction</h2><p className={shared.formula}>z = {formatFixed(outputWeights.wOut1)} × {formatFixed(analysis.h1)} + ({formatFixed(outputWeights.wOut2)}) × {formatFixed(analysis.h2)} − 0.25 = {formatFixed(analysis.z, 3)}<br />p = sigmoid(z) = 1 / (1 + exp(−z)) = {formatProbability(analysis.probability)}<br />L = {analysis.target === 1 ? "−ln(p)" : "−ln(1 − p)"} = {formatFixed(analysis.loss, 3)}</p><p className={shared.small}>The sigmoid maps the weighted sum z to a probability. ln is the natural logarithm. Switch to Backward to ask how a small change would affect loss.</p></section>}
    {phase !== "forward" && (matrixMode ? <MatrixWeightGradients analysis={analysis} /> : <GradientEvidence analysis={analysis} />)}
    {phase === "update" && <UpdateEvidence analysis={analysis} learningRate={learningRate} matrixMode={matrixMode} onRateChange={changeRate} />}
    {phase !== "forward" && <details className={styles.hiddenSignals} open={hiddenOpen} onToggle={(event) => { setHiddenOpen(event.currentTarget.open); if (event.currentTarget.open && !exploring && experimentIndex === 3 && prediction) setTried(true); }}><summary>How gradients reach the hidden layer</summary>{matrixMode ? <MatrixHiddenGradient analysis={analysis} /> : <><p className={shared.small}>The chain rule multiplies the incoming loss sensitivity by each operation’s local derivative. A weight gradient uses h; the signal sent to a hidden activation uses w.</p><p className={shared.formula}>dL/dh1 = w1 × (p − y) = {formatFixed(outputWeights.wOut1)} × {formatSigned(analysis.outputDelta)} = {formatSigned(analysis.hiddenCredit.h1)}<br />dL/dh2 = w2 × (p − y) = {formatFixed(outputWeights.wOut2)} × {formatSigned(analysis.outputDelta)} = {formatSigned(analysis.hiddenCredit.h2)}</p></>}<p className={shared.small}>These are gradients with respect to activations, not earlier weights or their updates. To reach an earlier weight, continue multiplying by that layer’s local derivatives; combine contributions when multiple paths meet. This playground stops at the cached activations.</p></details>}
    <LessonSummaries label={phase === "update" ? "Starting state and preview loss" : "Starting state summaries"} summaries={[
      { label: "Probability", color: "#5031dc", value: formatProbability(analysis.probability), definition: "Starting prediction for target 1.", formula: matrixMode ? "p = sigmoid(W × h + b)" : "p = sigmoid(z)", comparison: phase === "update" ? `After one step: ${formatProbability(analysis.afterUpdate.probability)}` : `Observed target: ${analysis.target}` },
      { label: "Loss", color: "#ad4508", value: formatFixed(analysis.loss, 3), definition: "Starting binary cross entropy.", formula: "L = −y ln(p) − (1 − y) ln(1 − p)", comparison: phase === "update" ? `After one step: ${formatFixed(analysis.afterUpdate.loss, 3)}` : "Lower is better for this example." },
      { label: "Output gradient", color: "#0c1230", value: phase === "forward" ? "—" : formatSigned(analysis.outputDelta), definition: "Starting loss sensitivity to z.", formula: matrixMode ? "δ = dL/dz = p − y" : "dL/dz = p − y", comparison: phase === "forward" ? "Reveal with Backward." : "Specific to sigmoid + binary cross entropy." },
    ]} />
    <p className={shared.small}>Bias and cached activations stay fixed during each previewed update. A full network normally also learns bias and earlier-layer parameters. Displayed values are rounded; calculations use full precision.</p>
    <p className={shared.liveUpdate} role="status">{phase} stage. h1 {analysis.h1}, h2 {analysis.h2}, target {analysis.target}. Probability {formatProbability(analysis.probability)}; loss {formatFixed(analysis.loss, 3)}.</p>
  </LearningPage>;
}
