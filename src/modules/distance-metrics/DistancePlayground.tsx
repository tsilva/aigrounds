"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { ExperimentButton, ExperimentChoices, ExperimentRail, ExperimentResult, LearningPage, LessonRangeControl, LessonSummaries, LessonToggleGroup, LessonToolbar } from "@/components/learning-page/learning-page";
import shared from "@/components/learning-page/learning-page.module.css";
import { analyzeDistance, boundCoordinate, distanceChart, distanceMetrics, distanceNumber as number, distanceScenarios, type DistanceState } from "./distance-engine";
import { distanceBaseline, reachedDistance } from "./lesson-state";
import { distanceExperiments } from "./learning-experiments";
import styles from "./playground.module.css";

export function DistancePlayground() {
  const [state, setState] = useState(() => distanceBaseline());
  const [index, setIndex] = useState(0);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [transferAnswer, setTransferAnswer] = useState<string | null>(null);
  const [width, setWidth] = useState(640);
  const chartRef = useRef<HTMLDivElement>(null), editorRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, moved: false, startX: 0, startY: 0 });
  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;
    const update = () => setWidth(Math.max(200, el.getBoundingClientRect().width));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const a = useMemo(() => analyzeDistance(state), [state]);
  const chart = distanceChart(a, width), experiment = distanceExperiments[index], transfer = index === 3;
  const metricLabel = state.metric === "euclidean" ? "Euclidean" : "Manhattan";
  const reached = !!prediction && !!experiment && reachedDistance(index, state), complete = reached && explanation === "0";
  function clear() { setExplanation(null); setTransferAnswer(null); }
  function start(next = index) { setIndex(next); setState(distanceBaseline(next)); setPrediction(null); clear(); }
  function edit(patch: Partial<DistanceState>) {
    if (Object.entries(patch).every(([key, value]) => state[key as keyof DistanceState] === value)) return;
    setState(s => ({ ...s, ...patch })); clear();
  }
  function movePointer(event: PointerEvent<SVGGElement>) {
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const px = (event.clientX - rect.left) * chart.width / rect.width;
    const py = (event.clientY - rect.top) * chart.height / rect.height;
    edit({ x: boundCoordinate((px - chart.left) * 10 / chart.span), y: boundCoordinate((chart.bottom - py) * 10 / chart.span) });
  }
  const rail = experiment ? <ExperimentRail label={`Experiment ${index + 1} of 3`} title={experiment.title} phase={!prediction ? 0 : reached ? 2 : 1}>
    {!reached && <><h3>Make a prediction</h3><p>{experiment.question}</p>
      <ExperimentChoices legend="Your prediction" name="distance-prediction" choices={experiment.predictions} value={prediction} onChange={id => { start(); setPrediction(id); }} />
      <p className={shared.small}>Changing prediction restores this experiment’s starting state. Reset restarts it.</p>
    </>}
    {prediction && !reached && <p className={shared.actionPrompt}><strong>Now try it.</strong> {experiment.action}</p>}
    {reached && <><p role="status" className={shared.observation}>{prediction === "0" ? "The evidence matches your prediction." : "The evidence challenges your prediction."}</p>
      <h3>{experiment.explanation}</h3>
      <ExperimentChoices legend="Your explanation" name="distance-explanation" choices={experiment.explanations} value={explanation} onChange={setExplanation} />
      {explanation && !complete && <p role="status" className={shared.feedback}>Try again. {experiment.retry}</p>}
    </>}
    {complete && <><ExperimentResult>{experiment.takeaway}</ExperimentResult><ExperimentButton arrow onClick={() => start(index + 1)}>{index === 2 ? "Try the transfer check" : "Next experiment"}</ExperimentButton></>}
  </ExperimentRail> : <ExperimentRail label={transfer ? "Transfer check" : "Free exploration"} title={transfer ? "Zero distance, distinct cases" : "Choose what closest means"}>
    {transfer ? <>
      <p>Without Guide help, choose Coincident cases, choose Manhattan under Distance metric, and set Query X and Query Y to 2. Identify every nearest case and explain the decision. Would switching to Euclidean resolve coincident references with different labels?</p>
      {reachedDistance(3, state) && <>
        <ExperimentChoices legend="Transfer explanation" name="distance-transfer" choices={[
          { id: "coincident", label: "A and B are separate cases at (2,2), both zero distance from the query, with Circle and Square labels. The nearest neighbor is nonunique, so this lesson withholds a decision. Euclidean also gives both distance zero; changing metric cannot separate identical coordinates or establish a true query label." },
          { id: "identity", label: "Zero distance merges A and B into one case whose label must be Circle." },
          { id: "probability", label: "The two zero distances prove exactly 50% true-class probability for each label." },
        ]} value={transferAnswer} onChange={setTransferAnswer} />
        {transferAnswer && (transferAnswer !== "coincident" ? <p role="status" className={shared.feedback}>Try again. Coordinate differences can be zero for distinct IDs. Neither distance uses the stored label; both retain the zero-distance tie, and this policy withholds a decision.</p> : <>
          <ExperimentResult title="Transfer explained">Equal coordinates do not erase case identity or conflicting labels. Both metrics retain the tie. A different tie policy would be an additional declared choice, not an accuracy or probability guarantee.</ExperimentResult>
          <ExperimentButton onClick={() => { setIndex(4); clear(); }}>Explore freely</ExperimentButton>
        </>)}
      </>}
    </> : <><p>Move the query across each fixed grid under both metrics. Reconstruct distances, inspect all nearest ties and compare the declared decision policy. Metric choice alone does not establish true labels or predictive accuracy.</p><ExperimentButton onClick={() => start(0)}>Restart experiments</ExperimentButton></>}
  </ExperimentRail>;
  return <LearningPage title="Distance Metrics Lab" subtitle="Move a query; compare what closest means." rail={rail}>
    <LessonToolbar scenarios={distanceScenarios} selectedId={state.scenario} onSelect={scenario => edit({ scenario: scenario as DistanceState["scenario"] })} onReset={() => start(experiment || transfer ? index : 0)} />
    <section className={styles.evidence} aria-label="Fixed references and movable query">
      <h2>Your dataset</h2>
      <p>Four fixed labeled reference cases A..D and one query with no known true label. One-nearest-neighbor (1-NN) uses the unique closest reference’s label. This lesson withholds a decision for every nonunique nearest neighbor.</p>
      <h3>Distance metric</h3>
      <LessonToggleGroup label="Distance metric" choices={distanceMetrics} value={state.metric} onChange={metric => edit({ metric: metric as DistanceState["metric"] })} />
      <div className={styles.chart} ref={chartRef}>
        <svg data-distance-chart viewBox={`0 0 ${chart.width} ${chart.height}`} role="group" aria-label="Equal-scale coordinate grid with fixed cases and movable query. Exact coordinates and distances are in Case distances and decisions.">
          {chart.ticks.map(t => <g key={t.value}><line x1={t.x} x2={t.x} y1={chart.top} y2={chart.bottom} /><line x1={chart.left} x2={chart.left + chart.span} y1={t.y} y2={t.y} /><text x={t.x} y={chart.bottom + 22} textAnchor="middle">{t.value}</text><text x={chart.left - 12} y={t.y + 4} textAnchor="end">{t.value}</text></g>)}
          <text x={chart.left + chart.span / 2} y={chart.bottom + 49} textAnchor="middle">X coordinate</text>
          <text transform={`translate(${chart.left - 30},${chart.top + chart.span / 2}) rotate(-90)`} textAnchor="middle">Y coordinate</text>
          {chart.paths.map(p => <path data-distance-path={p.id} key={p.id} d={p.d} className={styles.path} />)}
          {chart.groups.map(g => <g data-distance-group={g.ids.join("/")} key={g.ids.join("/")} transform={`translate(${g.x},${g.y})`}>
            {g.ids.filter(id => a.nearestIds.includes(id)).map(id => <circle data-distance-nearest={id} key={id} r="16" className={styles.nearest} />)}
            {g.classes.includes("Square") && <rect x="-7" y="-7" width="14" height="14" className={styles.square} />}
            {g.classes.includes("Circle") && <circle r={g.classes.length > 1 ? 4 : 7} className={styles.circle} />}
            <text x="12" y="-14">{g.ids.join("/")}</text>
          </g>)}
          <g data-distance-query transform={`translate(${chart.query.x},${chart.query.y})`} role="button" tabIndex={0}
            aria-label={`Query point (${state.x}, ${state.y}); arrow keys move; Enter edits Query X`} aria-describedby="distance-query-help"
            className={styles.query} onClick={() => { if (!drag.current.moved) editorRef.current?.querySelector("input")?.focus(); }}
            onKeyDown={event => {
              const step = event.shiftKey ? 2 : 1;
              const moves: Record<string, Partial<DistanceState>> = { ArrowRight: { x: boundCoordinate(state.x + step) }, ArrowLeft: { x: boundCoordinate(state.x - step) }, ArrowUp: { y: boundCoordinate(state.y + step) }, ArrowDown: { y: boundCoordinate(state.y - step) }, Home: { x: 0, y: 0 }, End: { x: 10, y: 10 } };
              if (moves[event.key]) { event.preventDefault(); edit(moves[event.key]); }
              if (event.key === "Enter" || event.key === " ") { event.preventDefault(); editorRef.current?.querySelector("input")?.focus(); }
            }} onPointerDown={event => {
              event.preventDefault(); event.currentTarget.focus(); event.currentTarget.setPointerCapture(event.pointerId);
              drag.current = { active: true, moved: false, startX: event.clientX, startY: event.clientY };
            }} onPointerMove={event => {
              if (!drag.current.active) return;
              if (Math.abs(event.clientX - drag.current.startX) + Math.abs(event.clientY - drag.current.startY) > 3) drag.current.moved = true;
              if (drag.current.moved) movePointer(event);
            }} onPointerUp={event => {
              if (!drag.current.active) return;
              if (drag.current.moved) movePointer(event);
              drag.current.active = false;
              if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
            }} onPointerCancel={() => { drag.current.active = false; drag.current.moved = true; }}>
            <circle r="20" className={styles.queryFocus} /><circle r="17" fill="transparent" />
            <path d="M0,-10 L10,0 L0,10 L-10,0 Z" className={styles.diamond} />
          </g>
        </svg>
      </div>
      <p className={styles.legend}><span>● Circle class</span><span>■ Square class</span><span>◇ Query (movable)</span><span>Ring = nearest</span></p>
      <p id="distance-query-help">Drag the query diamond to an integer grid point, or focus it and use arrows (Shift: two units). Up increases Y; Right increases X. Home sets (0,0); End sets (10,10). Enter or click focuses Query X. Reference cases stay fixed.</p>
      <div className={styles.controls}>
        <div ref={editorRef}><LessonRangeControl label="Query X" value={state.x} min={0} max={10} step={1} help="Horizontal query coordinate, 0..10 in whole units." onChange={x => edit({ x })} /></div>
        <LessonRangeControl label="Query Y" value={state.y} min={0} max={10} step={1} help="Vertical query coordinate, 0..10 in whole units." onChange={y => edit({ y })} />
      </div>
      <p role="status" data-distance-status className={styles.formula}>{metricLabel} · Query ({state.x}, {state.y}) · Nearest {a.nearestIds.join(", ")} · Minimum {number(a.minimum)} · {a.decision ? `${a.decision} class decision` : "Tie: decision withheld"}</p>
      <p>{state.metric === "euclidean" ? "Euclidean = sqrt(dx² + dy²): the straight-line length." : "Manhattan = |dx| + |dy|: one shown horizontal-then-vertical route. Other equally short grid routes can exist; no obstacles are modeled."} Both axes have equal numerical weight. Distance is not a class probability.</p>
    </section>
    <LessonSummaries label="Nearest cases and declared one-neighbor decision" summaries={[
      { label: "Nearest case(s)", color: "#5031dc", value: a.nearestIds.join("/"), definition: "All cases at the minimum chosen distance.", formula: "Compare exact values before rounding.", comparison: "IDs remain distinct even at equal coordinates." },
      { label: "Minimum distance", color: "#087c78", value: a.minimum.toFixed(3), definition: `Smallest ${metricLabel} distance to the query.`, formula: state.metric === "euclidean" ? "sqrt(dx² + dy²)" : "|dx| + |dy|", comparison: "Equal numerical weights; no true query label." },
      { label: "1-NN decision", color: "#ad4508", value: a.decision ?? "Tie", definition: a.decision ? "Stored label of the unique nearest reference." : "Nonunique nearest neighbor: decision withheld.", formula: "This lesson’s declared tie policy.", comparison: "A label decision does not establish accuracy." },
    ]} />
    <section className={styles.evidence} aria-label="Distance construction and decision limits">
      <details><summary>Case distances and decisions</summary>
        <div className={styles.table} role="region" tabIndex={0} aria-label="All reference identities, distances and nearest status">
          <table><caption>All four fixed references, separate even when coincident. dx/dy are absolute differences from query ({state.x},{state.y}). Euclidean = sqrt(dx²+dy²); Manhattan = dx+dy. Distances are rounded to six decimals; exact values decide nearest ties.</caption>
            <thead><tr>{["Case", "Coordinates", "Class", "|ΔX|", "|ΔY|", "Euclidean", "Manhattan", "Nearest"].map(h => <th key={h} scope="col">{h}</th>)}</tr></thead>
            <tbody>{a.cases.map(c => <tr data-distance-case={c.id} key={c.id}><th scope="row">{c.id}</th><td>({c.x}, {c.y})</td><td>{c.className}</td><td>{c.dx}</td><td>{c.dy}</td><td>{number(c.euclidean)}</td><td>{number(c.manhattan)}</td><td>{a.nearestIds.includes(c.id) ? "Yes" : "No"}</td></tr>)}</tbody>
          </table>
        </div>
      </details>
      <details><summary>Construction and limits</summary>
        <p>Metric disagreement: A (0,5), B (3,3), C (8,9), D (9,1). Tie boundary: A (2,5), B (8,5), C (5,9), D (5,1). Coincident cases: A (2,2), B (2,2), C (8,8), D (8,2). A/C are Circle, B/D Square. Changing scenario preserves query and metric; changing prediction or Reset restores the current experiment baseline. Query, metric and scenario changes clear stale explanations.</p>
        <p>The two coordinates count equally as numbers. Euclidean compares exact integer squared distances before taking square roots; Manhattan compares integer absolute sums. Equal plotting scales preserve numerical geometry. The straight Euclidean segment or one Manhattan grid route is shown to every nearest case. Zero-distance paths legitimately have zero length. A combined A/B circle/square mark and separate table rows retain coincident identities; the query can overlap them at the same true position.</p>
        <p>1-NN assigns the unique nearest reference’s stored class. This lesson withholds a decision for any nonunique minimum, even if the tied labels agree. That explicit policy is not universal: other implementations may choose by order or another declared rule. Identical coordinates with different labels remain tied under both metrics. No known query label or performance evaluation establishes which metric is appropriate for a real task.</p>
        <p>The finite 0..10 integer toy excludes k&gt;1 voting, reference editing, learned weights, feature scaling, obstacles, training optimization, class probabilities and automatic metric choice. Different numeric units could change the meaning of equal weights; no physical mixed-unit distance or universal accuracy guarantee is implied.</p>
        <a href="https://docs.scipy.org/doc/scipy/reference/generated/scipy.spatial.distance.euclidean.html" target="_blank" rel="noreferrer">SciPy · Euclidean distance</a><br />
        <a href="https://docs.scipy.org/doc/scipy/reference/generated/scipy.spatial.distance.cityblock.html" target="_blank" rel="noreferrer">SciPy · Manhattan distance</a><br />
        <a href="https://scikit-learn.org/stable/modules/neighbors.html" target="_blank" rel="noreferrer">scikit-learn · Nearest neighbors and tie behavior</a>
      </details>
    </section>
  </LearningPage>;
}
