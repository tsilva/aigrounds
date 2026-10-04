"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ExperimentButton, ExperimentChoices, ExperimentRail, ExperimentResult, LearningPage, LessonAction, LessonRangeControl, LessonSummaries, LessonToggleGroup, LessonToolbar } from "@/components/learning-page/learning-page";
import shared from "@/components/learning-page/learning-page.module.css";
import { analyzePca, pcaChart, pcaNumber as number, pcaScenarios, type PcaState } from "./pca-engine";
import { pcaBaseline, reachedPca } from "./lesson-state";
import { pcaExperiments } from "./learning-experiments";
import styles from "./playground.module.css";

const percent = (value: number | null) => value === null ? "Undefined" : `${(value * 100).toFixed(3)}%`;
export function PcaPlayground() {
  const [state, setState] = useState(pcaBaseline);
  const [index, setIndex] = useState(0);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [transferAnswer, setTransferAnswer] = useState<string | null>(null);
  const [width, setWidth] = useState(640);
  const chartRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;
    const update = () => setWidth(Math.max(200, el.getBoundingClientRect().width));
    update(); const observer = new ResizeObserver(update); observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const a = useMemo(() => analyzePca(state), [state]);
  const chart = pcaChart(a, width), experiment = pcaExperiments[index], transfer = index === 3;
  const reached = !!prediction && !!experiment && reachedPca(index, state), complete = reached && explanation === "0";
  const axisStatus = a.totalVariance === 0 ? "Zero total variance: ratios undefined; no unique PC1" : a.principalAngle === null ? "Equal principal variances: no unique PC1; every first-axis direction ties" : state.angle % 180 === a.principalAngle ? "First axis aligned with computed PC1" : "Manual orthogonal axes; first axis is not PC1";
  function clear() { setExplanation(null); setTransferAnswer(null); }
  function start(next = index) { setIndex(next); setState(pcaBaseline(next)); setPrediction(null); clear(); }
  function edit(next: PcaState) { if (next.angle === state.angle && next.scenario === state.scenario && next.kept === state.kept) return; setState(next); clear(); }
  const rail = experiment ? <ExperimentRail label={`Experiment ${index + 1} of 3`} title={experiment.title} phase={!prediction ? 0 : reached ? 2 : 1}>
    {!reached && <><h3>Make a prediction</h3><p>{experiment.question}</p><ExperimentChoices legend="Your prediction" name="pca-prediction" choices={experiment.predictions} value={prediction} onChange={id => { start(); setPrediction(id); }} /><p className={shared.small}>Changing prediction restores the starting cloud, angle and retained count. Reset restarts this experiment.</p></>}
    {prediction && !reached && <p className={shared.actionPrompt}><strong>Now try it.</strong> {experiment.action}</p>}
    {reached && <><p role="status" className={shared.observation}>{prediction === "0" ? "The evidence matches your prediction." : "The evidence challenges your prediction."}</p><h3>{experiment.explanation}</h3><ExperimentChoices legend="Your explanation" name="pca-explanation" choices={experiment.explanations} value={explanation} onChange={setExplanation} />{explanation && !complete && <p role="status" className={shared.feedback}>Try again. {experiment.retry}</p>}</>}
    {complete && <><ExperimentResult>{experiment.takeaway}</ExperimentResult><ExperimentButton arrow onClick={() => start(index + 1)}>{index === 2 ? "Try the transfer check" : "Next experiment"}</ExperimentButton></>}
  </ExperimentRail> : <ExperimentRail label={transfer ? "Transfer check" : "Free exploration"} title={transfer ? "Reconstruct a constant cloud" : "Choose variance and dimension"}>
    {transfer ? <><p>Without Guide help, choose Constant cloud. Set First axis angle to 90° and Retained components to 1. Inspect original points, mean, centered coordinates, scores and reconstruction. Is zero error enough to make a variance percentage defined?</p>
      {reachedPca(3, state) && <><ExperimentChoices legend="Transfer explanation" name="pca-transfer" choices={[
        { id: "undefined", label: "All four originals equal mean (2,1). Centered values and scores are zero; adding the mean reconstructs each original with Error² 0. Total variance is 0, so retained and PC1 maximum ratios divide 0 by 0 and are Undefined. Zero error does not supply a nonzero variance denominator or a unique first direction." },
        { id: "perfect", label: "Zero error always means a defined 100% explained-variance ratio." },
        { id: "merge", label: "Coincident points erase three original IDs and make reconstruction impossible." },
      ]} value={transferAnswer} onChange={setTransferAnswer} />{transferAnswer && (transferAnswer !== "undefined" ? <p role="status" className={shared.feedback}>Try again. Reconstruction adds the mean even when centered scores vanish. Check total variance before forming its ratio; coincident coordinates do not erase identities.</p> : <><ExperimentResult title="Transfer explained">A constant cloud can reconstruct exactly from its mean while variance ratios remain undefined. Zero residual, positive retained fraction and a unique principal direction are different conditions.</ExperimentResult><ExperimentButton onClick={() => { setIndex(4); clear(); }}>Explore freely</ExperimentButton></>)}</>}
    </> : <><p>Rotate an orthonormal basis, compare its variance with the PC1 maximum, then retain one or two scores. Check centering, add the mean back, and distinguish reconstruction quality from any downstream task.</p><ExperimentButton onClick={() => start(0)}>Restart experiments</ExperimentButton></>}
  </ExperimentRail>;
  return <LearningPage title="PCA & Principal Components Lab" subtitle="Rotate centered axes; decide what to keep." rail={rail}>
    <LessonToolbar scenarios={pcaScenarios} selectedId={state.scenario} onSelect={scenario => edit({ ...state, scenario: scenario as PcaState["scenario"] })} onReset={() => start(experiment || transfer ? index : 0)} />
    <section className={styles.evidence} aria-label="Centered cloud and reconstruction">
      <h2>Your dataset</h2><p>The plot subtracts the mean from every original point: centered coordinates show spread around zero. Original coordinates remain in the table. Rotate the first axis; the second stays perpendicular. Keeping only one score drops the other direction’s information.</p>
      <div className={styles.chart} ref={chartRef}><svg data-pca-chart viewBox={`0 0 ${chart.width} ${chart.height}`} role="img" aria-label="Equal-scale centered coordinate grid with original points, reconstructed centered points, two orthogonal axes and residuals. Raw originals, all IDs and exact values are in the table below.">
        {chart.ticks.map(t => <g key={t.value}><line x1={t.x} x2={t.x} y1={chart.top} y2={chart.bottom} /><line x1={chart.left} x2={chart.left + chart.span} y1={t.y} y2={t.y} /><text x={t.x} y={chart.bottom + 22} textAnchor="middle">{t.value}</text><text x={chart.left - 12} y={t.y + 4} textAnchor="end">{t.value}</text></g>)}
        <line className={styles.axis} x1={chart.left} x2={chart.left + chart.span} y1={chart.origin.y} y2={chart.origin.y} /><line className={styles.axis} x1={chart.origin.x} x2={chart.origin.x} y1={chart.top} y2={chart.bottom} />
        <text x={chart.left + chart.span / 2} y={chart.bottom + 49} textAnchor="middle">Centered X</text><text transform={`translate(${chart.left - 30},${chart.top + chart.span / 2}) rotate(-90)`} textAnchor="middle">Centered Y</text>
        {chart.axes.map((axis, i) => <g key={i} className={i ? styles.secondAxis : styles.firstAxis}><line data-pca-axis={i + 1} x1={axis.start.x} y1={axis.start.y} x2={axis.end.x} y2={axis.end.y} /><polygon points={axis.head} /></g>)}
        {chart.rows.map(row => <line data-pca-residual={row.id} className={styles.residual} key={row.id} x1={row.source.x} y1={row.source.y} x2={row.target.x} y2={row.target.y} />)}
        {chart.groups.map(g => <rect data-pca-group={g.ids.join("/")} key={g.ids.join("/")} x={g.x - 6} y={g.y - 6} width="12" height="12" className={styles.square} />)}
        {chart.originalGroups.map(g => <g key={g.ids.join("/")}><circle data-pca-original={g.ids.join("/")} cx={g.x} cy={g.y} r="4" className={styles.circle} /><text x={g.x + g.labelX} y={g.y + g.labelY} textAnchor={g.anchor}>{g.ids.join("/")}</text></g>)}
      </svg></div>
      <p className={styles.legend}><span>● Original centered</span><span>□ Reconstructed centered</span><span>┄ Residual</span><span>→ First axis / dashed second axis</span></p>
      <LessonRangeControl label="First axis angle" value={state.angle} min={0} max={180} step={5} unit="°" help="Rotate the manual orthonormal basis in five-degree steps. Align with PC1 uses the computed covariance direction when it is unique." onChange={angle => edit({ ...state, angle })} />
      <div className={styles.fit}><LessonAction disabled={a.principalAngle === null} onClick={() => { if (a.principalAngle !== null) edit({ ...state, angle: a.principalAngle }); }}>Align with PC1</LessonAction><p>{a.principalAngle === null ? "Alignment unavailable: no unique first principal line." : `Computed PC1 line: ${a.principalAngle}°. Its variance maximum is ${percent(a.principalRatio)}.`}</p></div>
      <h3>Retained components</h3><LessonToggleGroup label="Retained components" choices={[{ id: "1", label: "1" }, { id: "2", label: "2" }]} value={String(state.kept)} onChange={kept => edit({ ...state, kept: Number(kept) as 1 | 2 })} />
      <p>One retains only t1; two retain t1 and t2. Both scores remain visible for inspection. Two retained dimensions in this 2D toy give no dimensional compression.</p>
      <p role="status" data-pca-status className={styles.formula}>{pcaScenarios.find(s => s.id === state.scenario)!.label} · Angle {state.angle}° · Keep {state.kept} · Mean ({a.mean.map(number).join(", ")}) · {axisStatus} · Retained {percent(a.retainedRatio)} · Mean Error² {number(a.meanError)}</p>
    </section>
    <section className={styles.evidence} aria-label="Centering, scores and reconstruction evidence">
      <p data-pca-directions className={styles.formula}>u = ({a.direction.map(number).join(", ")}); v = ({a.perpendicular.map(number).join(", ")}). c = p−mean; t1 = c·u; t2 = c·v. Reconstruct original q = mean+t1u{state.kept === 2 && "+t2v"}.</p>
      <div className={styles.table} role="region" tabIndex={0} aria-label="All four originals, centered coordinates, both scores, raw reconstruction and squared error"><table><caption>Scores are inspected in both directions; reconstruction retains only the selected count. All original IDs remain at coincident marks. Full-precision calculations are displayed rounded.</caption><thead><tr>{["Case", "Original (X,Y)", "Centered (X,Y)", "t1 (kept)", state.kept === 1 ? "t2 (discarded)" : "t2 (kept)", "Reconstructed (X,Y)", "Error²"].map(h => <th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{a.rows.map(row => <tr data-pca-row={row.id} key={row.id}><th scope="row">{row.id}</th><td>({row.original.join(", ")})</td><td>({row.centered.join(", ")})</td><td>{number(row.scores[0])}</td><td>{number(row.scores[1])}</td><td>({row.reconstructed.map(number).join(", ")})</td><td>{number(row.errorSquared)}</td></tr>)}</tbody></table></div>
      <p data-pca-covariance className={styles.formula}>Sample covariance = [[{number(a.covariance[0])}, {number(a.covariance[1])}], [{number(a.covariance[1])}, {number(a.covariance[2])}]]. Principal variances = {a.eigenvalues.map(number).join(", ")}.</p>
      <p data-pca-variances className={styles.formula}>Current score variances: t1 {number(a.variances[0])}, t2 {number(a.variances[1])}; total {number(a.totalVariance)}. Sample divisor: 3. Mean Error² divisor: 4 points. Discarded sample variance = (4/3) × Mean Error².</p>
    </section>
    <LessonSummaries label="Variance retention and per-point reconstruction loss" summaries={[
      { label: "Retained variance", color: "#5031dc", value: percent(a.retainedRatio), definition: "Variance fraction retained by the current axes and count.", formula: "Σ retained score variances / total variance", comparison: "Undefined at zero total; not task accuracy." },
      { label: "Mean Error²", color: "#ad4508", value: a.meanError.toFixed(3), definition: "Squared Euclidean reconstruction loss, averaged per point.", formula: "Σ ||p−q||² / 4", comparison: "Add the mean back; two orthogonal scores reconstruct fully." },
      { label: "PC1 maximum", color: "#087c78", value: percent(a.principalRatio), definition: "Largest possible one-axis centered variance fraction.", formula: "largest covariance eigenvalue / total variance", comparison: "Equal eigenvalues tie; zero total makes this undefined." },
    ]} />
    <section className={styles.evidence} aria-label="PCA construction and limits"><details><summary>Construction and limits</summary>
      <p>Each named scenario fixes four original points. Centering subtracts each coordinate’s mean and does not scale feature units. The plot uses centered originals and centered reconstructions; the exact table reconstructs raw coordinates by adding the mean. The sample covariance divides centered product sums by 3. Its principal eigenvalues are the variances along principal directions, sorted largest first.</p>
      <p>For symmetric covariance [[a,b],[b,d]], principal variances are (a+d ± sqrt((a−d)²+4b²))/2. When they differ, the leading line angle is half atan2(2b,a−d), modulo 180°. Reversing its sign changes score signs while preserving reconstruction. Equal positive eigenvalues make every first direction a maximum, so there is no unique PC1 line. A zero covariance cloud also has no unique direction and makes variance ratios undefined.</p>
      <p>Manual axes u and v are orthonormal; their score variances sum to total variance. Keeping one score drops the other variance; keeping both spans the full 2D space. Mean Error² divides squared Euclidean residuals by 4 points; discarded sample variance uses divisor 3 and equals (4/3)Mean Error². Exact equivalent special-angle matrices and a complete-basis identity avoid artificial floating residuals. Other angles use trigonometry; rounded values do not determine zero denominators or identity.</p>
      <p>Retained variance is geometry, not a probability, accuracy or assurance of downstream value. Scope excludes general-dimensional solvers, SVD derivation, standardization, whitening, probabilistic PCA, nonlinear embeddings, train/test pipelines, labels and automatic component-count selection. Actual numeric/scenario/count edits clear stale answers; prediction changes and Reset restore the current step.</p>
      <a href="https://scikit-learn.org/stable/modules/decomposition.html#pca" target="_blank" rel="noreferrer">scikit-learn · Centered principal component analysis</a><br /><a href="https://scikit-learn.org/stable/modules/generated/sklearn.decomposition.PCA.html" target="_blank" rel="noreferrer">scikit-learn · Principal directions, sample variance and reconstruction</a>
    </details></section>
  </LearningPage>;
}
