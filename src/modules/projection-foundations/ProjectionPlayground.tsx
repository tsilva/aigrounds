"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ExperimentButton, ExperimentChoices, ExperimentRail, ExperimentResult, LearningPage, LessonRangeControl, LessonSummaries, LessonToolbar } from "@/components/learning-page/learning-page";
import { GuidedExperiment } from "@/components/learning-page/guided-experiment";
import shared from "@/components/learning-page/learning-page.module.css";
import { analyzeProjection, projectionChart, projectionNumber as number, projectionScenarios, type ProjectionState } from "./projection-engine";
import { projectionBaseline, reachedProjection } from "./lesson-state";
import { projectionExperiments } from "./learning-experiments";
import styles from "./playground.module.css";

export function ProjectionPlayground() {
  const [state, setState] = useState(projectionBaseline);
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
    update();
    const observer = new ResizeObserver(update); observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const a = useMemo(() => analyzeProjection(state), [state]);
  const chart = projectionChart(a, width), experiment = projectionExperiments[index], transfer = index === 3;
  const reached = !!prediction && !!experiment && reachedProjection(index, state), complete = reached && explanation === "0";
  function clear() { setExplanation(null); setTransferAnswer(null); }
  function start(next = index) { setIndex(next); setState(projectionBaseline(next)); setPrediction(null); clear(); }
  function edit(next: ProjectionState) {
    if (next.angle === state.angle && next.scenario === state.scenario) return;
    setState(next); clear();
  }
  const rail = experiment ? <GuidedExperiment label={`Experiment ${index + 1} of 3`} experiment={experiment}
    reached={reached} complete={complete} prediction={prediction} explanation={explanation}
    predictionName="projection-prediction" explanationName="projection-explanation"
    onPredict={id => { start(); setPrediction(id); }} onExplain={setExplanation}
    predictionHelp={<>Changing prediction restores this experiment’s starting dataset and angle. Reset restarts it.</>} observation={prediction === "0" ? "The evidence matches your prediction." : "The evidence challenges your prediction."}
    onNext={() => start(index + 1)} nextLabel={index === 2 ? "Try the transfer check" : "Next experiment"} /> : <ExperimentRail label={transfer ? "Transfer check" : "Free exploration"} title={transfer ? "Project across the diagonal" : "Choose what one component keeps"}>
    {transfer ? <><p>Without Guide help, choose Diagonal line and set Projection axis angle to 135°. Reconstruct the four signed components, projected coordinates and mean Error². Do coincident reconstructions preserve all original distinctions?</p>
      {reachedProjection(3, state) && <><ExperimentChoices legend="Transfer explanation" name="projection-transfer" choices={[
        { id: "collapsed", label: "This direction is perpendicular to the diagonal originals: all four components are 0 and all reconstructed points are (0,0). Mean Error² is 20, retained squared length is 0, original squared length is 20. Four distinct originals retain their IDs, but this component loses their distinctions. No task-quality claim follows." },
        { id: "merged", label: "Four coincident reconstructions mean there was only one original point." },
        { id: "lossless", label: "A zero component means all original points were reconstructed exactly." },
      ]} value={transferAnswer} onChange={setTransferAnswer} />
        {transferAnswer && (transferAnswer !== "collapsed" ? <p role="status" className={shared.feedback}>Try again. Compare originals, one-number components and reconstructions. Perpendicular dot products vanish even for distinct nonzero originals; their residuals still contribute squared error.</p> : <>
          <ExperimentResult title="Transfer explained">A scalar can collapse distinct points. Identity in the table and information in the representation are different: these IDs remain, while their projected coordinates no longer distinguish them.</ExperimentResult>
          <ExperimentButton onClick={() => { setIndex(4); clear(); }}>Explore freely</ExperimentButton>
        </>)}
      </>}
    </> : <><p>Rotate the unit direction for each fixed cloud. Separate one signed component from its reconstructed vector, trace the perpendicular residual and compare squared lengths. A manually chosen axis carries no automatic task-quality guarantee.</p><ExperimentButton onClick={() => start(0)}>Restart experiments</ExperimentButton></>}
  </ExperimentRail>;
  return <LearningPage title="Projection Foundations Lab" subtitle="Rotate an axis; see what one component keeps." rail={rail}>
    <LessonToolbar scenarios={projectionScenarios} selectedId={state.scenario} onSelect={scenario => edit({ ...state, scenario: scenario as ProjectionState["scenario"] })} onReset={() => start(experiment || transfer ? index : 0)} />
    <section className={shared.evidence} aria-label="Fixed originals and orthogonal reconstruction">
      <h2>Your dataset</h2><p>Four fixed 2D points. Rotate a unit direction to keep one signed component per point; reconstructing from it drops perpendicular information. Original points stay fixed. Equal scales preserve the geometry.</p>
      <div className={styles.chart} ref={chartRef}><svg data-projection-chart viewBox={`0 0 ${chart.width} ${chart.height}`} role="img" aria-label="Equal-scale coordinate grid with four original points, reconstructed points on the origin line and perpendicular residuals. Exact values and every ID are in the table below.">
        {chart.ticks.map(t => <g key={t.value}><line x1={t.x} x2={t.x} y1={chart.top} y2={chart.bottom} /><line x1={chart.left} x2={chart.left + chart.span} y1={t.y} y2={t.y} /><text x={t.x} y={chart.bottom + 22} textAnchor="middle">{t.value}</text><text x={chart.left - 12} y={t.y + 4} textAnchor="end">{t.value}</text></g>)}
        <line className={styles.axis} x1={chart.left} x2={chart.left + chart.span} y1={chart.origin.y} y2={chart.origin.y} /><line className={styles.axis} x1={chart.origin.x} x2={chart.origin.x} y1={chart.top} y2={chart.bottom} />
        <text x={chart.left + chart.span / 2} y={chart.bottom + 49} textAnchor="middle">X coordinate</text><text transform={`translate(${chart.left - 30},${chart.top + chart.span / 2}) rotate(-90)`} textAnchor="middle">Y coordinate</text>
        <line data-projection-axis className={styles.projectionAxis} x1={chart.start.x} y1={chart.start.y} x2={chart.end.x} y2={chart.end.y} /><polygon className={styles.arrowhead} points={chart.head} />
        {chart.rows.map(row => <line data-projection-residual={row.id} className={styles.residual} key={row.id} x1={row.source.x} y1={row.source.y} x2={row.target.x} y2={row.target.y} />)}
        {chart.groups.map(g => <rect data-projection-group={g.ids.join("/")} key={g.ids.join("/")} x={g.x - 6} y={g.y - 6} width="12" height="12" className={styles.square} />)}
        {chart.rows.map(row => <g key={row.id}><circle data-projection-original={row.id} cx={row.source.x} cy={row.source.y} r="4" className={styles.circle} /><text x={row.source.x + (row.original[0] > 3 ? -12 : 12)} y={row.source.y + (row.original[1] > 3 ? 24 : -12)} textAnchor={row.original[0] > 3 ? "end" : "start"}>{row.id}</text></g>)}
      </svg></div>
      <p className={styles.legend}><span>● Original p</span><span>□ Reconstructed q</span><span>┄ Perpendicular residual p−q</span><span>→ Unit direction u</span></p>
      <LessonRangeControl label="Projection axis angle" value={state.angle} min={0} max={180} step={5} unit="°" help="Rotate the unit direction 0..180° in five-degree steps. Use the slider or exact number editor; arrows move one step, Home/End reach the bounds." onChange={angle => edit({ ...state, angle })} />
      <p role="status" data-projection-status className={shared.math}>{projectionScenarios.find(s => s.id === state.scenario)!.label} · Angle {state.angle}° · u = ({number(a.direction[0])}, {number(a.direction[1])}) · Mean Error² {number(a.meanError)}</p>
    </section>
    <section className={shared.evidence} aria-label="Components, reconstruction and squared error">
      <p className={shared.math}>Component t = Xux + Yuy (one number). Reconstruction q = tu (two coordinates on the line). Error² = (X−qx)² + (Y−qy)².</p>
      <div className={`${shared.tableScroll} ${styles.table}`} role="region" tabIndex={0} aria-label="All four originals, components, reconstructions and squared residuals"><table><caption>Every original ID remains, even at coincident reconstructions. Full-precision calculations are displayed rounded.</caption>
        <thead><tr>{["Case", "Original (X,Y)", "Component t", "Reconstructed (X,Y)", "Error²"].map(h => <th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{a.rows.map(row => <tr data-projection-row={row.id} key={row.id}><th scope="row">{row.id}</th><td>({row.original.join(", ")})</td><td>{number(row.component)}</td><td>({row.projected.map(number).join(", ")})</td><td>{number(row.errorSquared)}</td></tr>)}</tbody>
      </table></div>
      <p data-projection-decomposition className={shared.math}>Per-point means: Error² {number(a.meanError)} + retained squared length {number(a.meanRetained)} = original squared length {number(a.meanOriginal)} (up to floating arithmetic). Divisor: 4 points.</p>
    </section>
    <LessonSummaries label="Per-point mean squared lengths" summaries={[
      { label: "Mean Error²", color: "#ad4508", value: a.meanError.toFixed(3), definition: "Squared perpendicular reconstruction loss, averaged per point.", formula: "Σ ||p−q||² / 4", comparison: "Geometric loss; not prediction error or task accuracy." },
      { label: "Retained squared length", color: "#5031dc", value: a.meanRetained.toFixed(3), definition: "Squared reconstructed length, averaged per point.", formula: "Σ ||q||² / 4", comparison: "Depends on the chosen line; not a learned best axis." },
      { label: "Original squared length", color: "#087c78", value: a.meanOriginal.toFixed(3), definition: "Squared original length, averaged per point.", formula: "Σ ||p||² / 4", comparison: "Fixed when rotating the axis for the same dataset." },
    ]} />
    <section className={shared.evidence} aria-label="Projection construction and limits"><details><summary>Construction and limits</summary>
      <p>The axis is an infinite line through the origin with nonzero unit direction u=(cosθ,sinθ). Its drawn arrow segment indicates orientation, not a finite-segment constraint. Projection uses t=p·u and q=tu; p−q is perpendicular to u. Scalar t and 2D reconstructed q are different objects. Reversing u reverses t and preserves q.</p>
      <p>All four originals stay fixed within each named cloud. Per-point mean Error² divides the sum of squared Euclidean residuals by 4, not by 8 coordinates. The orthogonal decomposition gives original squared length = retained squared length + squared residual. Special angles use algebraically equivalent exact outer-product matrix entries; other angles use floating trigonometry. Rounded displays do not define coincidences or zero errors.</p>
      <p>One component exactly reconstructs points lying on its origin line; off-line points lose perpendicular information. Coincident reconstructions keep all original IDs in separate table rows. Choosing a line manually is not PCA fitting, centering, eigenvector computation, learned compression or a task-accuracy guarantee. This lesson has no translated line, original-point editor or multiple-component representation. Scenario changes preserve angle; numeric/scenario edits clear stale answers. Prediction changes and Reset restore the current step.</p>
      <a href="https://textbooks.math.gatech.edu/ila/projections.html" target="_blank" rel="noreferrer">Georgia Tech · Orthogonal projections and residuals</a><br /><a href="https://reference.wolfram.com/language/ref/Projection.html" target="_blank" rel="noreferrer">Wolfram · Projection onto a vector</a>
    </details></section>
  </LearningPage>;
}
