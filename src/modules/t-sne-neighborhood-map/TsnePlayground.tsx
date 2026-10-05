"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ExperimentButton, ExperimentChoices, ExperimentRail, ExperimentResult, LearningPage, LessonRangeControl, LessonSelect, LessonSummaries, LessonToggleGroup, LessonToolbar } from "@/components/learning-page/learning-page";
import { GuidedExperiment } from "@/components/learning-page/guided-experiment";
import shared from "@/components/learning-page/learning-page.module.css";
import { tsneChart, tsneFrame, tsneNumber as number, tsnePoints, tsneScenarios, tsneTrajectory, type TsneState } from "./tsne-engine";
import { tsneBaseline, reachedTsne } from "./lesson-state";
import { tsneExperiments } from "./learning-experiments";
import styles from "./playground.module.css";

export function TsnePlayground() {
  const [state, setState] = useState(tsneBaseline), [selected, setSelected] = useState(0);
  const [index, setIndex] = useState(0), [prediction, setPrediction] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null), [transferAnswer, setTransferAnswer] = useState<string | null>(null);
  const [width, setWidth] = useState(640), chartRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = chartRef.current; if (!el) return;
    const update = () => setWidth(Math.max(200, el.getBoundingClientRect().width));
    update(); const observer = new ResizeObserver(update); observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const run = useMemo(() => tsneTrajectory(state.scenario, state.perplexity, state.init), [state.scenario, state.perplexity, state.init]);
  const frame = useMemo(() => tsneFrame(run, state.iterations), [run, state.iterations]);
  const chart = tsneChart(frame.positions, selected, width), source = run.source, inspected = `P${selected + 1}`;
  const experiment = tsneExperiments[index], transfer = index === 3;
  const reached = !!prediction && !!experiment && reachedTsne(index, state), complete = reached && explanation === "0";
  function clear() { setExplanation(null); setTransferAnswer(null); }
  function start(next = index) { setIndex(next); setState(tsneBaseline(next)); setSelected(0); setPrediction(null); clear(); }
  function edit(next: TsneState) { if (next.scenario === state.scenario && next.perplexity === state.perplexity && next.init === state.init && next.iterations === state.iterations) return; setState(next); clear(); }
  const rail = experiment ? <GuidedExperiment label={`Experiment ${index + 1} of 3`} experiment={experiment}
    reached={reached} complete={complete} prediction={prediction} explanation={explanation}
    predictionName="tsne-prediction" explanationName="tsne-explanation"
    onPredict={id => { start(); setPrediction(id); }} onExplain={setExplanation}
    predictionHelp={<>Changing prediction restores this experiment’s starting settings and P1 inspection. Reset restarts it.</>} observation={prediction === "0" ? "The evidence matches your prediction." : "The evidence challenges your prediction."}
    onNext={() => start(index + 1)} nextLabel={index === 2 ? "Try the transfer check" : "Next experiment"} /> : <ExperimentRail label={transfer ? "Transfer check" : "Free exploration"} title={transfer ? "Inspect duplicate source identities" : "Read local affinity evidence"}>
    {transfer ? <><p>Without Guide help, choose Duplicate pair, Perplexity 4 and Initialization A, then set Optimization iterations to 200. Inspect P1 and P2 in the table. Compare their original coordinates, source distance, conditional affinity and finite map positions. Must identical source coordinates merge IDs or force an exact map coincidence?</p>
      {reachedTsne(3, state) && <><ExperimentChoices legend="Transfer explanation" name="tsne-transfer" choices={[
        { id: "distinct", label: "P1 and P2 have the same original (−3,−2,0), source distance² 0 and positive conditional affinity, but retain separate IDs. At this finite checkpoint their map coordinates differ. t-SNE fits soft neighborhood probabilities rather than forcing every original distance to be copied exactly. Excluded self affinity is a different zero; neither global gaps nor task quality are guaranteed." },
        { id: "merge", label: "A zero source distance deletes one ID and always forces identical map coordinates at every finite step." },
        { id: "self", label: "P2 must get zero conditional affinity from P1 because the source distance is zero, just like excluded self." },
      ]} value={transferAnswer} onChange={setTransferAnswer} />{transferAnswer && (transferAnswer !== "distinct" ? <p role="status" className={shared.feedback}>Try again. Self means the same ID. A distinct point at distance zero has positive Gaussian affinity; an optimized probability map is not an exact copy of all source distances.</p> : <><ExperimentResult title="Transfer explained">Coordinate coincidence does not erase identity. A finite affinity-fitting map may separate duplicate source points; inspect local probability evidence rather than asserting exact global-distance preservation.</ExperimentResult><ExperimentButton onClick={() => { setIndex(4); clear(); }}>Explore freely</ExperimentButton></>)}</>}
    </> : <><p>Compare perplexities and reproducible starting maps, then inspect checkpoints of each fixed objective. Use conditional rows and joint P/Q to interpret local fit. Revisit source coordinates before interpreting visual gaps, axis orientation or apparent clusters.</p><ExperimentButton onClick={() => start(0)}>Restart experiments</ExperimentButton></>}
  </ExperimentRail>;
  return <LearningPage title="t-SNE Neighborhood Map" subtitle="Tune neighborhoods; inspect the map’s limits." rail={rail}>
    <LessonToolbar scenarios={tsneScenarios} selectedId={state.scenario} onSelect={scenario => { if (scenario !== state.scenario) { edit({ ...state, scenario: scenario as TsneState["scenario"], iterations: 0 }); setSelected(0); } }} onReset={() => start(experiment || transfer ? index : 0)} />
    <section className={shared.evidence} aria-label="Fixed source points and finite t-SNE map">
      <h2>Your dataset</h2><p>Eight fixed numeric 3D points become a 2D probability map. Map axes are arbitrary and carry no original feature units. This plot auto-fits the current map with equal scales. {state.iterations === 0 ? "At iteration 0 these are initial coordinates, before optimization." : `This is the actual ${state.iterations}-step checkpoint of the selected run.`}</p>
      <div className={styles.chart} ref={chartRef}><svg data-tsne-chart viewBox={`0 0 ${chart.width} ${chart.height}`} role="img" aria-label={`Equal-scale auto-fitted t-SNE map; inspected ${inspected} has an indigo ring and label. Every original and map coordinate is in the table below; map axes are arbitrary.`}>
        {chart.ticks.map(t => <g key={t.value}><line x1={t.x} x2={t.x} y1={chart.top} y2={chart.bottom} /><line x1={chart.left} x2={chart.left + chart.span} y1={t.y} y2={t.y} /><text x={t.x} y={chart.bottom + 22} textAnchor="middle">{t.value.toFixed(2)}</text><text x={chart.left - 12} y={t.y + 4} textAnchor="end">{t.value.toFixed(2)}</text></g>)}
        <line className={styles.axis} x1={chart.left} x2={chart.left + chart.span} y1={chart.origin.y} y2={chart.origin.y} /><line className={styles.axis} x1={chart.origin.x} x2={chart.origin.x} y1={chart.top} y2={chart.bottom} />
        <text x={chart.left + chart.span / 2} y={chart.bottom + 49} textAnchor="middle">Map coordinate 1</text><text x={chart.left + chart.span / 2} y="16" textAnchor="middle">Vertical: map coordinate 2</text>
        {chart.points.map(p => <circle data-tsne-point={p.id} key={p.id} cx={p.x} cy={p.y} r="4" className={styles.circle} />)}
        <circle data-tsne-selected={inspected} cx={chart.selected.x} cy={chart.selected.y} r="10" className={styles.selected} /><text data-tsne-label x={chart.selected.x + chart.selected.labelX} y={chart.selected.y + chart.selected.labelY} textAnchor={chart.selected.anchor}>{inspected}</text>
      </svg></div>
      <p>Choose Inspect point to locate any ID and inspect its neighborhood. Overlapping dots keep separate rows. No point is moved to avoid an overlap.</p>
      <div className={shared.controlGrid}><LessonRangeControl label="Perplexity" value={state.perplexity} min={2} max={6} step={1} help="A smooth effective neighborhood size based on probability entropy; changing it restarts at iteration 0." onChange={perplexity => edit({ ...state, perplexity, iterations: 0 })} />
        <LessonRangeControl label="Optimization iterations" value={state.iterations} min={0} max={400} step={50} help="Inspect fifty-step checkpoints of this actual fixed-input run; a finite checkpoint is not a certified global optimum." onChange={iterations => edit({ ...state, iterations })} /></div>
      <h3>Initialization</h3><LessonToggleGroup label="Initialization" choices={[{ id: "A", label: "A" }, { id: "B", label: "B" }]} value={state.init} onChange={init => { if (init !== state.init) edit({ ...state, init: init as "A" | "B", iterations: 0 }); }} /><p>A and B are fixed, reproducible starting coordinate arrays. Changing initialization restarts at 0; source data and probabilities stay fixed.</p>
      <LessonSelect label="Inspect point" value={String(selected)} choices={frame.positions.map((_, i) => ({ id: String(i), label: `P${i + 1}` }))} onChange={id => setSelected(Number(id))} />
      <p role="status" data-tsne-status className={shared.math}>{tsneScenarios.find(s => s.id === state.scenario)!.label} · Perplexity {state.perplexity} · Initialization {state.init} · Iterations {state.iterations} · Inspect {inspected} · Achieved {number(source.rows[selected].achieved)} · KL {number(frame.kl)}</p>
    </section>
    <section className={shared.evidence} aria-label="Source and map probability construction">
      <p data-tsne-probabilities className={shared.math}>Inspect {inspected}: Gaussian bandwidth σ = {number(source.rows[selected].bandwidth)}. Conditional p(j|{inspected}) sums to 1 excluding self. Pij = [p(j|i)+p(i|j)]/16. Qij ∝ 1/(1+map distance²).</p>
      <p>Entropy measures how spread probability mass is: H = −Σ p ln p; achieved perplexity = exp(H). It is an effective count, not a hard neighbor cutoff. Joint P and Q each sum to 1 over all ordered nonself pairs; their individual rows are not conditional distributions.</p>
      <div className={`${shared.tableScroll} ${styles.table}`} role="region" tabIndex={0} aria-label="All eight identities, source and map coordinates, and inspected probability row"><table><caption>Self affinity is exactly zero. A displayed 0.000000 may be a small positive nonself weight. Values are calculated at full precision and displayed rounded; every ID remains at overlaps.</caption><thead><tr>{["Case", "Original (F1,F2,F3)", "Map (X,Y)", "Source distance²", `p(j|${inspected})`, `P${selected + 1}j`, `Q${selected + 1}j`].map(h => <th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{tsnePoints[state.scenario].map((p, i) => <tr data-tsne-row={`P${i + 1}`} key={i}><th scope="row">P{i + 1}{i === selected && " (self)"}</th><td>({p.join(", ")})</td><td>({frame.positions[i].map(number).join(", ")})</td><td>{number(source.distances[selected][i])}</td><td>{number(source.conditional[selected][i])}</td><td>{number(source.joint[selected][i])}</td><td>{number(frame.map.joint[selected][i])}</td></tr>)}</tbody></table></div>
      <p data-tsne-normalization className={shared.math}>Conditional row sum {number(source.conditional[selected].reduce((s, v) => s + v, 0))}; global ordered-pair P sum {number(source.joint.flat().reduce((s, v) => s + v, 0))}; global Q sum {number(frame.map.joint.flat().reduce((s, v) => s + v, 0))}. KL(P||Q) = Σ Pij ln(Pij/Qij), in nats.</p>
    </section>
    <LessonSummaries label="Effective neighborhood and fixed-objective fit" summaries={[
      { label: "Achieved perplexity", color: "#5031dc", value: source.rows[selected].achieved.toFixed(3), definition: "Effective size of the inspected source neighborhood.", formula: "exp(−Σ p(j|i) ln p(j|i))", comparison: "Soft weights; not an exact k-neighbor selection." },
      { label: "KL(P||Q)", color: "#087c78", value: frame.kl.toFixed(6), definition: "Current global affinity-fit loss, in nats.", formula: "Σ Pij ln(Pij / Qij)", comparison: "Compare fit for fixed P; not task accuracy or original distance loss." },
      { label: "Iterations", color: "#ad4508", value: String(state.iterations), definition: "Finite checkpoint of this deterministic run.", formula: "0..400 in fifty-step checkpoints", comparison: "Initialization matters; no global-optimum certificate." },
    ]} />
    <section className={shared.evidence} aria-label="Exact t-SNE construction and limits"><details><summary>Construction and limits</summary>
      <p>The source has eight fixed three-feature points with equal Euclidean weights. Stable Gaussian entropy search chooses each row’s bandwidth to match perplexity. Self is excluded; mathematical nonself Gaussian weights are soft. Symmetrizing conditionals and dividing by 16 gives globally normalized ordered-pair P. Heavy-tailed Student-t map affinities give globally normalized Q. This is exact full-pair t-SNE on a small toy.</p>
      <p>The gradient is 4Σj(Pij−Qij)(yi−yj)/(1+||yi−yj||²). Each step tries learning rate 20 and halves it up to 20 times until KL does not increase, then recenters the map. If no trial is accepted the map stays fixed for that step. Two fixed A/B initializations and actual 400-step trajectories make checkpoints reproducible. No early exaggeration, momentum or Barnes-Hut approximation is included; no production-speed or global-optimum claim is made.</p>
      <p>Changing perplexity changes source P and restarts optimization, so loss comparisons across perplexities involve different objectives. Changing initialization changes the trajectory for the same source P. Map axes, orientation, global gaps and apparent cluster sizes do not reproduce original feature units, true classes or task accuracy. The plot auto-fits with equal scales; exact current map coordinates remain in the table.</p>
      <p>Duplicate source coordinates retain separate IDs and positive mutual affinity; excluded self is a different case. A finite map does not enforce every source distance exactly, including a duplicate pair’s zero distance. Scope excludes learned semantic labels, arbitrary input data, scalable solvers, automatic best settings, new-point transforms, inverse reconstruction and downstream evaluation. Numerical/source/initialization/checkpoint edits clear stale answers; inspection alone preserves them.</p>
      <a href="https://jmlr.org/papers/v9/vandermaaten08a.html" target="_blank" rel="noreferrer">van der Maaten & Hinton · Original t-SNE paper</a><br /><a href="https://scikit-learn.org/stable/modules/generated/sklearn.manifold.TSNE.html" target="_blank" rel="noreferrer">scikit-learn · t-SNE objective and parameters</a><br /><a href="https://scikit-learn.org/stable/modules/manifold.html#t-distributed-stochastic-neighbor-embedding-t-sne" target="_blank" rel="noreferrer">scikit-learn · Local structure and global limits</a>
    </details></section>
  </LearningPage>;
}
