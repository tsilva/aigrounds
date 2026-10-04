"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ExperimentButton, ExperimentChoices, ExperimentRail, ExperimentResult, LearningPage, LessonRangeControl, LessonSelect, LessonSummaries, LessonToolbar } from "@/components/learning-page/learning-page";
import shared from "@/components/learning-page/learning-page.module.css";
import { analyzeLoss, exampleIds, lossChart, lossNumber as number, probabilityPresetId, probabilityPresets, probabilityScenarios, setTrueProbability, type ExampleId, type ProbabilityState } from "./log-loss-engine";
import { lossBaseline, lossBaselineExample, reachedLoss, sameProbabilities } from "./lesson-state";
import { penaltyExperiments } from "./learning-experiments";
import styles from "./playground.module.css";

export function LogLossPlayground() {
  const [values, setValues] = useState<ProbabilityState>(lossBaseline);
  const [selected, setSelected] = useState<ExampleId>("A");
  const [width, setWidth] = useState(640);
  const [index, setIndex] = useState(0);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [transferAnswer, setTransferAnswer] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;
    const update = () => setWidth(Math.max(200, el.getBoundingClientRect().width));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const a = useMemo(() => analyzeLoss(values), [values]);
  const chart = lossChart(a, width), experiment = penaltyExperiments[index], transfer = index === 3;
  const preset = probabilityPresetId(values);
  const reached = !!prediction && !!experiment && reachedLoss(index, values), complete = reached && explanation === "0";
  function clear() { setExplanation(null); setTransferAnswer(null); }
  function start(next = index) {
    setIndex(next); setValues(lossBaseline(next)); setSelected(lossBaselineExample(next)); setPrediction(null); clear();
  }
  function edit(next: ProbabilityState) {
    if (sameProbabilities(values, next)) return;
    setValues(next); clear();
  }
  const rail = experiment ? <ExperimentRail label={`Experiment ${index + 1} of 3`} title={experiment.title} phase={!prediction ? 0 : reached ? 2 : 1}>
    {!reached && <><h3>Make a prediction</h3><p>{experiment.question}</p><ExperimentChoices legend="Your prediction" name="penalty-prediction" choices={experiment.predictions} value={prediction} onChange={id => { start(); setPrediction(id); }} /><p className={shared.small}>Changing prediction restores this experiment’s probabilities and selected example. Reset restarts it.</p></>}
    {prediction && !reached && <p className={shared.actionPrompt}><strong>Now try it.</strong> {experiment.action}</p>}
    {reached && <><p role="status" className={shared.observation}>{prediction === "0" ? "The evidence matches your prediction." : "The evidence challenges your prediction."}</p><h3>{experiment.explanation}</h3><ExperimentChoices legend="Your explanation" name="penalty-explanation" choices={experiment.explanations} value={explanation} onChange={setExplanation} />{explanation && !complete && <p role="status" className={shared.feedback}>Try again. {experiment.retry}</p>}</>}
    {complete && <><ExperimentResult>{experiment.takeaway}</ExperimentResult><ExperimentButton arrow onClick={() => start(index + 1)}>{index === 2 ? "Try the transfer check" : "Next experiment"}</ExperimentButton></>}
  </ExperimentRail> : <ExperimentRail label={transfer ? "Transfer check" : "Free exploration"} title={transfer ? "Can perfect examples cancel a mistake?" : "Compare probability penalties and label counts"}>
    {transfer ? <><p>Without Guide help, start with true-class percentages A=80, B=20, C=80. Set A and C to 100, and B to 5, in any order. Keep the fixed known labels. Reconstruct all three losses, the mean and accuracy. Decide whether perfect correct examples cancel the increasingly certain mistake.</p>
      {reachedLoss(3, values) && <><ExperimentChoices legend="Transfer explanation" name="penalty-transfer" choices={[
        { id: "mean", label: "A and C each have zero loss; B’s true label is 0 but it predicts 1 with 95%. B’s penalty is −ln(0.05) ≈ 2.995732 nats. The mean includes all three terms: (0+2.995732+0)/3 ≈ 0.998577, up from about 0.685242. Accuracy remains 2/3. Zero penalties cannot cancel a positive penalty; neither result establishes calibration." },
        { id: "cancel", label: "The two 100% correct examples earn negative rewards that cancel B, so mean loss is zero." },
        { id: "omit", label: "Only B contributes a nonzero term, so mean loss divides by one and equals 2.995732." },
      ]} value={transferAnswer} onChange={setTransferAnswer} />{transferAnswer && (transferAnswer !== "mean" ? <p role="status" className={shared.feedback}>Try again. Zero loss is not a negative reward. Average over all three examples, even those with zero terms. The true label chooses B’s probability.</p> : <><ExperimentResult title="Transfer explained">Averages retain every example in the denominator. Improving two correct probabilities may still leave a higher mean when another mistake becomes much more certain.</ExperimentResult><ExperimentButton onClick={() => { setIndex(4); clear(); }}>Explore freely</ExperimentButton></>)}</>}
    </> : <><p>Edit true-class probabilities independently, including 0, 50 and 100. Compare the full distributions, deterministic tie rule, individual penalties and mean with the count of correct labels. These three toy examples do not establish population calibration or generalized accuracy.</p><ExperimentButton onClick={() => start(0)}>Restart experiments</ExperimentButton></>}
  </ExperimentRail>;
  return <LearningPage title="Log Loss Confidence Penalties" subtitle="Same labels; different penalties." rail={rail}>
    <LessonToolbar scenarios={probabilityScenarios} selectedId={preset} onSelect={id => { edit(probabilityPresets[id as keyof typeof probabilityPresets]); setSelected(id === "correct" ? "A" : "B"); }} onReset={() => start(experiment || transfer ? index : 0)} />
    <section className={styles.evidence} aria-label="Three labeled examples and true-class probability editor"><h2>Your dataset</h2>
      <p>Three toy binary examples have fixed known labels: A=1, B=0, C=1. Edit the probability assigned to the true class; the other class receives its complement. Log loss is −ln(pTrue), in nats. ln is the natural logarithm: more probability on what happened gives a smaller penalty. These authored predictions are not trained model outputs.</p>
      <div className={styles.chart} ref={chartRef}><svg data-penalty-chart viewBox={`0 0 ${chart.width} ${chart.height}`} role="img" aria-label="Individual log losses on a fixed zero to three nats axis; infinite losses use dashed unbounded markers, not finite bars. The table gives every exact distribution and penalty.">
        {chart.ticks.map(t => <g key={t.value}><line x1={t.x} x2={t.x} y1="20" y2="146" /><text x={t.x} y="170" textAnchor="middle">{t.value}</text></g>)}
        {chart.rows.map(r => <g data-penalty-bar={r.id} key={r.id}><text x={chart.left - 12} y={r.y + 14} textAnchor="end">{r.id}</text>{r.infinite ? <line data-unbounded x1={chart.left} x2={chart.left + chart.span} y1={r.y + 9} y2={r.y + 9} className={styles.unbounded} /> : <rect data-finite-penalty x={r.x} y={r.y} width={r.width} height="18" className={styles.penalty} />}<text data-penalty-label x={r.labelX} y={r.y + 14} textAnchor={r.anchor} className={r.inside ? styles.inside : undefined}>{number(r.loss)}</text></g>)}
        <text x={chart.left + chart.span / 2} y="196" textAnchor="middle">Individual log loss (nats)</text>
      </svg></div>
      <p className={styles.infinite}>Finite bars use a fixed 0..3 nats scale. Dashed ∞ markers mean unbounded loss at exact zero true-outcome probability; they are not finite bars of length 3.</p>
      <div className={styles.controls}><LessonSelect label="Selected example" value={selected} choices={exampleIds.map(id => ({ id, label: id }))} onChange={id => setSelected(id as ExampleId)} /><LessonRangeControl label="Probability of true class (%)" value={values[exampleIds.indexOf(selected)]} min={0} max={100} step={5} help={`Edit only example ${selected}; the other class receives 100 minus this value. Fixed known labels stay unchanged.`} onChange={value => edit(setTrueProbability(values, selected, value))} /></div>
      <p role="status" data-penalty-status className={styles.formula}>{preset === "custom" ? "Custom probabilities" : probabilityScenarios.find(s => s.id === preset)!.label} · True-class percentages ({values.join(", ")}) · Selected editor {selected} · Mean loss {number(a.mean)} nats · Accuracy {a.accuracyCount}/3</p><p>Selected example only inspects and preserves answers. Actual probability changes clear stale explanations. Each probability distribution sums to 1; the three true-class probabilities across different examples need not sum to 1.</p>
    </section>
    <section className={styles.evidence} aria-label="All example distributions, decisions and loss terms"><h2>All examples</h2>
      <div className={styles.table} tabIndex={0} role="region" aria-label="Every example’s known label, two probabilities, decision and loss"><table><caption>Predictions choose the larger probability. At 50/50 both labels tie; this demo selects fixed label 0 regardless of the known label. “Correct” compares the selected label with the known label. Every example contributes to mean loss.</caption><thead><tr>{["Example", "True label", "P(0)", "P(1)", "P(true)", "Prediction", "Correct?", "Loss (nats)"].map(h => <th scope="col" key={h}>{h}</th>)}</tr></thead><tbody>{a.rows.map(r => <tr data-penalty-row={r.id} key={r.id}><th scope="row">{r.id}</th><td>{r.truth}</td><td>{number(r.p0)}</td><td>{number(r.p1)}</td><td>{number(r.pTrue)}</td><td>{r.predicted}{r.tied ? " (tie)" : ""}</td><td>{r.correct ? "Yes" : "No"}</td><td>{number(r.loss)}</td></tr>)}</tbody></table></div>
      <p data-penalty-mean className={styles.formula}>Mean log loss = ({a.rows.map(r => number(r.loss)).join(" + ")}) / 3 = {number(a.mean)} nats. The denominator includes zero-loss, correct and incorrect examples.</p>
      <p>Exact true-class probability 0 gives an infinite penalty; 1 gives zero. No clipping is applied. A zero probability on the other, wrong class is compatible with zero loss. Displayed decimals are rounded; the mean uses unrounded loss terms.</p>
    </section>
    <LessonSummaries label="Average loss, correct label count and largest individual penalty" summaries={[
      { label: "Mean log loss", color: "#5031dc", value: `${number(a.mean)} nats`, definition: "Average negative log probability of what happened.", formula: `(${a.rows.map(r => number(r.loss)).join(" + ")}) / 3`, comparison: "Lower on these examples means less penalty; it does not prove population calibration." },
      { label: "Accuracy", color: "#087c78", value: `${a.accuracyCount}/3`, definition: "Fraction of selected labels matching the known labels.", formula: `${a.accuracyCount} correct out of 3`, comparison: "The same label count can hide very different probability penalties." },
      { label: "Largest penalty", color: "#ad4508", value: `${number(a.maxLoss)} nats`, definition: "Highest individual example loss.", formula: `Example${a.worst.length > 1 ? "s" : ""}: ${a.worst.join(", ")}${a.worst.length > 1 ? " (tied)" : ""}`, comparison: "All penalties are nonnegative; zero terms cannot cancel a positive or infinite term." },
    ]} />
    <section className={styles.evidence} aria-label="Log-loss construction and limits"><details><summary>Construction and limits</summary><p>Three independent true-class percentages range 0..100 in steps of 5. Each binary distribution is (p0,p1), sums to 1, and uses fixed labels A=1, B=0, C=1. For B the editor controls p0, not p1. The predicted label is 1 if p1 exceeds 0.5; otherwise it is 0. Both maxima are exposed at an exact tie.</p><p>Each penalty is −ln(pTrue), using natural logarithms and units called nats. For 0&lt;pTrue&lt;1 the value is positive; at 1 it is zero. As pTrue approaches 0 the penalty grows without bound; at exact 0 its extended value is ∞. Mean loss sums all three penalties and divides by 3. Finite supported probabilities are at least 0.05, giving a largest finite loss about 2.995732; the fixed chart axis 0..3 is not a cap on infinite loss.</p><p>This lesson shows the mathematical endpoints without epsilon clipping. Numerical libraries may clip exact endpoints for finite computations. These toy predictions illustrate scoring after known outcomes, not a procedure for choosing predictions after observing held-out labels. No training, calibration frequencies, population risk estimate or universal good-loss threshold is supplied. Higher confidence alone is not always better: a more certain wrong prediction is penalized more.</p><p>Prediction and Reset restore the current experiment baseline and selected example. Actual probability edits clear stale answers; inspection and unchanged edits preserve them. Free-exploration Reset begins Experiment 1. The nearby <Link href="/playgrounds/categorical-cross-entropy">Cross Entropy Loss Explorer</Link> covers binary, categorical and multi-label target shapes; this lesson focuses on heterogeneous penalties and averages at the same accuracy.</p><a href="https://scikit-learn.org/stable/modules/model_evaluation.html#log-loss" target="_blank" rel="noreferrer">scikit-learn · Log-loss formula and averaging</a><br /><a href="https://scikit-learn.org/stable/modules/generated/sklearn.metrics.log_loss.html" target="_blank" rel="noreferrer">scikit-learn · Natural logarithm and numerical endpoint clipping</a></details></section>
  </LearningPage>;
}
