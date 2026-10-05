"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ExperimentButton, ExperimentChoices, ExperimentRail, ExperimentResult, LearningPage, LessonRangeControl, LessonSelect, LessonSummaries, LessonToolbar } from "@/components/learning-page/learning-page";
import { GuidedExperiment } from "@/components/learning-page/guided-experiment";
import shared from "@/components/learning-page/learning-page.module.css";
import { analyzeScores, classIds, scoreChart, scoreNumber as number, scorePresetId, scorePresets, scoreScenarios, setBaseScore, type ClassId, type ScoreState } from "./class-score-engine";
import { reachedScore, sameScores, scoreBaseline, scoreBaselineClass } from "./lesson-state";
import { scoreExperiments } from "./learning-experiments";
import styles from "./playground.module.css";

export function ClassScorePlayground() {
  const [state, setState] = useState(scoreBaseline);
  const [selected, setSelected] = useState<ClassId>("C");
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
  const a = useMemo(() => analyzeScores(state), [state]);
  const chart = scoreChart(a, width), experiment = scoreExperiments[index], transfer = index === 3;
  const preset = state.scale === 1 && state.shift === 0 ? scorePresetId(state.base) : "custom";
  const reached = !!prediction && !!experiment && reachedScore(index, state), complete = reached && explanation === "0";
  function clear() { setExplanation(null); setTransferAnswer(null); }
  function start(next = index) {
    setIndex(next); setState(scoreBaseline(next)); setSelected(scoreBaselineClass(next)); setPrediction(null); clear();
  }
  function edit(next: ScoreState) {
    if (sameScores(state, next)) return;
    setState(next); clear();
  }
  const rail = experiment ? <GuidedExperiment label={`Experiment ${index + 1} of 3`} experiment={experiment}
    reached={reached} complete={complete} prediction={prediction} explanation={explanation}
    predictionName="score-prediction" explanationName="score-explanation"
    onPredict={id => { start(); setPrediction(id); }} onExplain={setExplanation}
    predictionHelp={<>Changing prediction restores this experiment’s scores, shift, scale and selected class. Reset restarts it.</>} observation={prediction === "0" ? "The evidence matches your prediction." : "The evidence challenges your prediction."}
    onNext={() => start(index + 1)} nextLabel={index === 2 ? "Try the transfer check" : "Next experiment"} /> : <ExperimentRail label={transfer ? "Transfer check" : "Free exploration"} title={transfer ? "Shift and scale a tied maximum" : "Separate order from score magnitude"}>
    {transfer ? <><p>Without Guide help, start with base scores A=−1, B=−1, C=−3. Keep them fixed; set Positive scale to 2 and Common shift to 2, in either order. Reconstruct all three effective scores, the tied maxima, selected class, top-two margin and what a zero raw score means.</p>
      {reachedScore(3, state) && <><ExperimentChoices legend="Transfer explanation" name="score-transfer" choices={[
        { id: "ties", label: "Effective scores are A=0, B=0, C=−4. A and B share the maximum; the demo selects A by fixed A/B/C identity order. The top-two gap is 0, while C’s gap to the top is 4. Positive scaling preserves the A/B tie and the common shift cancels from differences. A zero raw score is not a declared zero probability, and selecting A does not prove a unique leader or correctness." },
        { id: "unique", label: "A is uniquely best because it is selected; the top-two margin is 4, using the lowest score." },
        { id: "probability", label: "A and B both have zero probability, so C must be the only valid class." },
      ]} value={transferAnswer} onChange={setTransferAnswer} />{transferAnswer && (transferAnswer !== "ties" ? <p role="status" className={shared.feedback}>Try again. Compare both largest scores before applying the identity rule. Use the second-largest for the margin. Raw scores, including zero, are not probabilities.</p> : <><ExperimentResult title="Transfer explained">A deterministic tie rule selects one of equal maxima; it does not create separation. Raw score sign and scale are distinct from a probability interpretation.</ExperimentResult><ExperimentButton onClick={() => { setIndex(4); clear(); }}>Explore freely</ExperimentButton></>)}</>}
    </> : <><p>Edit one base score, shift all scores equally, or multiply every base by the same positive scale. Read the full order and ties before interpreting a margin. No correct label, probability conversion or measured accuracy is supplied.</p><ExperimentButton onClick={() => start(0)}>Restart experiments</ExperimentButton></>}
  </ExperimentRail>;
  return <LearningPage title="Class Scores & Logits Lab" subtitle="Move scores; separate the winner from its gap." rail={rail}>
    <LessonToolbar scenarios={scoreScenarios} selectedId={preset} onSelect={id => { edit({ base: scorePresets[id as keyof typeof scorePresets], scale: 1, shift: 0 }); setSelected(id === "close" ? "C" : "A"); }} onReset={() => start(experiment || transfer ? index : 0)} />
    <section className={shared.evidence} aria-label="Three raw class scores and controlled transformations">
      <h2>Your dataset</h2><p>Three authored scores describe one toy example. A logit here is a raw class score, not a probability: scores can be negative and need not sum to 1. Effective score z = Positive scale × base + Common shift. The highest score selects a class; equal maxima tie. No true class is given.</p>
      <div className={styles.chart} ref={chartRef}><svg data-score-chart viewBox={`0 0 ${chart.width} ${chart.height}`} role="img" aria-label="Three signed effective class score bars on a fixed minus ten to ten scale. All exact scores, ranks, ties and gaps are in the table.">
        {chart.ticks.map(t => <g key={t.value}><line x1={t.x} x2={t.x} y1="20" y2="146" className={t.value === 0 ? styles.zero : undefined} /><text x={t.x} y="170" textAnchor="middle">{t.value}</text></g>)}
        {chart.rows.map(r => <g data-score-bar={r.id} key={r.id}><text x={chart.left - 12} y={r.y + 15} textAnchor="end">{r.id}</text><rect data-score-value x={r.x} y={r.y} width={r.width} height="20" className={styles.score} /><text data-score-label x={r.labelX} y={r.y + 15} textAnchor={r.anchor} className={r.inside ? styles.inside : undefined}>{number(r.z)}</text></g>)}
        <text x={chart.zero} y="196" textAnchor="middle">Effective raw score (fixed −10..10)</text>
      </svg></div>
      <div className={shared.controlGrid}>
        <LessonSelect label="Selected class" value={selected} choices={classIds.map(id => ({ id, label: id }))} onChange={id => setSelected(id as ClassId)} />
        <LessonRangeControl label="Selected base score" value={state.base[classIds.indexOf(selected)]} min={-4} max={4} step={0.5} help={`Edit only class ${selected}; the other two base scores stay fixed.`} onChange={value => edit(setBaseScore(state, selected, value))} />
        <LessonRangeControl label="Common shift" value={state.shift} min={-2} max={2} step={0.5} help="Add the same offset after scaling every base score. Differences cancel the shift." onChange={shift => edit({ ...state, shift })} />
        <LessonRangeControl label="Positive scale" value={state.scale} min={0.5} max={2} step={0.5} help="Multiply every base before adding the common shift. This supported scale stays strictly positive." onChange={scale => edit({ ...state, scale })} />
      </div>
      <p role="status" data-score-status className={shared.math}>{preset === "custom" ? "Custom settings" : scoreScenarios.find(s => s.id === preset)!.label} · Base ({state.base.map(number).join(", ")}) · Scale {number(state.scale)} · Shift {number(state.shift)} · Effective ({a.rows.map(r => number(r.z)).join(", ")}) · Selected editor {selected}</p>
      <p>Selected class only chooses an editor and preserves answers. Actual score, shift or scale edits clear stale explanations. Scenarios restore their base scores with scale 1 and shift 0.</p>
    </section>
    <section className={shared.evidence} aria-label="All class scores, deterministic ranks and top gaps"><h2>All class scores</h2>
      <div className={`${shared.tableScroll} ${styles.table}`} tabIndex={0} role="region" aria-label="All three class identities, transformed scores, ranks and gaps"><table><caption>Ranks are ordinal positions sorted by effective score descending, then fixed A/B/C identity for ties. Every tied maximum is marked Yes. Gap to top is the highest score minus this row’s score.</caption><thead><tr>{["Class", "Base", "Scaled base", "Effective z", "Rank", "Gap to top", "At maximum?"].map(h => <th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{a.rows.map(r => <tr data-score-row={r.id} key={r.id}><th scope="row">{r.id}</th><td>{number(r.base)}</td><td>{number(r.scaled)}</td><td>{number(r.z)}</td><td>{r.rank}</td><td>{number(r.gap)}</td><td>{r.leader ? "Yes" : "No"}</td></tr>)}</tbody></table></div>
      <p data-score-order className={shared.math}>Order: {a.order.map(r => `${r.id} (${number(r.z)})`).join(" → ")}. Maximum set: {a.ties.join(", ")}. Demo selects {a.winner}{a.ties.length > 1 ? " by fixed identity tie rule; there is no unique leader." : ", the unique highest score."}</p>
      <p data-score-margin className={shared.math}>Top-two margin = {number(a.top)} − ({number(a.second)}) = {number(a.margin)} score units. Gap to the lowest score is a different quantity.</p>
    </section>
    <LessonSummaries label="Selected class, top-two score margin and unnormalized total" summaries={[
      { label: "Winning class", color: "#5031dc", value: a.winner, definition: "Highest effective score, with an explicit tie rule.", formula: `Maximum set: ${a.ties.join(", ")}`, comparison: a.ties.length > 1 ? "Tied maxima; choose the first A/B/C identity, not a unique leader." : "Unique maximum; no true label is given to assess correctness." },
      { label: "Top-two margin", color: "#087c78", value: number(a.margin), definition: "Highest minus second-highest score, in score units.", formula: `${number(a.top)} − (${number(a.second)})`, comparison: "Zero at a top tie; scale-dependent, not a confidence percentage." },
      { label: "Score total", color: "#ad4508", value: number(a.total), definition: "Sum of the three raw effective scores.", formula: a.rows.map(r => `(${number(r.z)})`).join(" + "), comparison: "No normalization; need not be 1. A sum of 1 alone gives no probability interpretation." },
    ]} />
    <section className={shared.evidence} aria-label="Class-score construction and limits"><details><summary>Construction and limits</summary>
      <p>Three base scores range −4..4 in half-unit steps. Common shift ranges −2..2 in half units; Positive scale ranges 0.5..2 in half units. Effective scores are zᵢ=s bᵢ+c, computed exactly for this finite grid, and stay within −10..10. Signed bar positions use this fixed scale; zeros remain in the table. No training or learned data is simulated.</p>
      <p>The mathematical argmax can contain multiple classes. This demo exposes every tied maximum and chooses the first identity in A/B/C order. Ordinal ranks use the same deterministic identity ordering. The top-two margin is the largest score minus the second largest, including a second equal maximum. It is zero at a tie. Per-row gap to top compares that row with the leader; it is not generally the top-two margin.</p>
      <p>A common shift cancels from differences: (s bᵢ+c)−(s bⱼ+c)=s(bᵢ−bⱼ). It preserves order, ties and margin at a fixed scale, while changing the sum by three times the shift. Positive multiplication preserves inequalities and ties but scales all differences. Zero and negative multipliers are outside this lesson’s supported model.</p>
      <p>These multiclass logits are arbitrary raw scores, not declared probabilities or binary log-odds. Scores may be negative, zero, above 1, or sum to any supported value. Even nonnegative scores summing to 1 do not automatically establish a probability interpretation here. There is no ground-truth class or measured accuracy. The top-two score gap is not a calibrated confidence estimate, a physical distance to a decision boundary, or an SVM hinge-loss margin.</p>
      <p>Prediction and Reset restore the current experiment’s baseline and selected class. Actual base/shift/scale changes clear stale answers; editor inspection preserves them. Free-exploration Reset starts Experiment 1. Probability conversion belongs to the next <Link href="/playgrounds/softmax-temperature">Softmax Temperature Lab</Link>; no softmax, sigmoid, temperature, loss or calibration is computed here.</p>
      <a href="https://cs231n.github.io/linear-classify/" target="_blank" rel="noreferrer">Stanford CS231n · Class scores before probability conversion</a><br /><a href="https://docs.pytorch.org/docs/stable/generated/torch.nn.CrossEntropyLoss.html" target="_blank" rel="noreferrer">PyTorch · Unnormalized multiclass logits</a><br /><a href="https://www.tensorflow.org/api_docs/python/tf/math/argmax" target="_blank" rel="noreferrer">TensorFlow · Explicit smallest-index tie convention</a>
    </details></section>
  </LearningPage>;
}
