"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { ExperimentButton, ExperimentChoices, ExperimentRail, ExperimentResult, LearningPage, LessonRangeControl, LessonSummaries, LessonToggleGroup, LessonToolbar } from "@/components/learning-page/learning-page";
import shared from "@/components/learning-page/learning-page.module.css";
import { analyzeVectors, boundVectorCoordinate, vectorChart, vectorNumber as number, vectorPresetId, vectorPresets, vectorScenarios, type VectorId } from "./vector-engine";
import { vectorBaseline, reachedVectors } from "./lesson-state";
import { vectorExperiments } from "./learning-experiments";
import styles from "./playground.module.css";

export function VectorPlayground() {
  const [state, setState] = useState(() => vectorBaseline());
  const [selected, setSelected] = useState<VectorId>("B");
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
  const a = useMemo(() => analyzeVectors(state), [state]);
  const chart = vectorChart(a, width), experiment = vectorExperiments[index], transfer = index === 3;
  const preset = vectorPresetId(state), tip = chart.vectors.find(v => v.id === selected)!;
  const x = selected === "A" ? state.ax : state.bx, y = selected === "A" ? state.ay : state.by;
  const reached = !!prediction && !!experiment && reachedVectors(index, state), complete = reached && explanation === "0";
  function clear() { setExplanation(null); setTransferAnswer(null); }
  function start(next = index) { setIndex(next); setState(vectorBaseline(next)); setSelected("B"); setPrediction(null); clear(); }
  function edit(nextX: number, nextY: number) {
    if (nextX === x && nextY === y) return;
    setState(s => ({ ...s, ...(selected === "A" ? { ax: nextX, ay: nextY } : { bx: nextX, by: nextY }) })); clear();
  }
  function movePointer(event: PointerEvent<SVGGElement>) {
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const px = (event.clientX - rect.left) * chart.width / rect.width;
    const py = (event.clientY - rect.top) * chart.height / rect.height;
    edit(boundVectorCoordinate((px - chart.left) * 10 / chart.span - 5), boundVectorCoordinate((chart.bottom - py) * 10 / chart.span - 5));
  }
  const rail = experiment ? <ExperimentRail label={`Experiment ${index + 1} of 3`} title={experiment.title} phase={!prediction ? 0 : reached ? 2 : 1}>
    {!reached && <><h3>Make a prediction</h3><p>{experiment.question}</p>
      <ExperimentChoices legend="Your prediction" name="vector-prediction" choices={experiment.predictions} value={prediction} onChange={id => { start(); setPrediction(id); }} />
      <p className={shared.small}>Changing prediction restores this experiment’s starting pair and selects B. Reset restarts it.</p>
    </>}
    {prediction && !reached && <p className={shared.actionPrompt}><strong>Now try it.</strong> {experiment.action}</p>}
    {reached && <><p role="status" className={shared.observation}>{prediction === "0" ? "The evidence matches your prediction." : "The evidence challenges your prediction."}</p>
      <h3>{experiment.explanation}</h3>
      <ExperimentChoices legend="Your explanation" name="vector-explanation" choices={experiment.explanations} value={explanation} onChange={setExplanation} />
      {explanation && !complete && <p role="status" className={shared.feedback}>Try again. {experiment.retry}</p>}
    </>}
    {complete && <><ExperimentResult>{experiment.takeaway}</ExperimentResult><ExperimentButton arrow onClick={() => start(index + 1)}>{index === 2 ? "Try the transfer check" : "Next experiment"}</ExperimentButton></>}
  </ExperimentRail> : <ExperimentRail label={transfer ? "Transfer check" : "Free exploration"} title={transfer ? "Reverse a nonzero direction" : "Separate length from alignment"}>
    {transfer ? <>
      <p>Without Guide help, choose Right angle, then choose B under Vector to edit. Set Selected vector X to −3 and Selected vector Y to −4 while A stays (3,4). Reconstruct both lengths, dot, cosine and angle. What does the sign tell you, and what does it not establish?</p>
      {reachedVectors(3, state) && <>
        <ExperimentChoices legend="Transfer explanation" name="vector-transfer" choices={[
          { id: "opposite", label: "A and B each have length 5, but B is the negative of A. Dot = −9−16 = −25, length product 25, cosine −1, angle 180°. Their nonzero directions are opposite. Negative alignment is not a negative probability or proof about semantic meaning; the values are illustrative vectors." },
          { id: "magnitude", label: "Equal lengths force cosine 1 regardless of direction." },
          { id: "zero", label: "A negative dot makes cosine and angle undefined, just like a zero vector." },
        ]} value={transferAnswer} onChange={setTransferAnswer} />
        {transferAnswer && (transferAnswer !== "opposite" ? <p role="status" className={shared.feedback}>Try again. Both lengths are nonzero, so the denominator is defined. Signed products reveal a reversed direction; equal magnitude alone does not determine alignment.</p> : <>
          <ExperimentResult title="Transfer explained">Lengths and directions carry different information. Opposite nonzero vectors have cosine −1, while zero length makes geometric cosine undefined. Neither is a probability or a guarantee of task meaning.</ExperimentResult>
          <ExperimentButton onClick={() => { setIndex(4); clear(); }}>Explore freely</ExperimentButton>
        </>)}
      </>}
    </> : <><p>Edit either signed vector. Trace both products and lengths before interpreting cosine, and check the zero-vector boundary. The same algebra extends to larger embeddings; task meaning requires a suitable representation and evaluation.</p><ExperimentButton onClick={() => start(0)}>Restart experiments</ExperimentButton></>}
  </ExperimentRail>;
  return <LearningPage title="Vector Geometry & Similarity Lab" subtitle="Move vectors; separate length from alignment." rail={rail}>
    <LessonToolbar scenarios={vectorScenarios} selectedId={preset} onSelect={scenario => { setState({ ...vectorPresets[scenario] }); setSelected("B"); clear(); }} onReset={() => start(experiment || transfer ? index : 0)} />
    <section className={styles.evidence} aria-label="Two signed vectors and selected tip editor">
      <h2>Your dataset</h2>
      <p>Two signed 2D vectors from the same origin. Magnitude is length; direction is where a nonzero arrow points. Equal axis scales preserve geometry. Select A or B to move its one active handle; coincident tips retain both identities.</p>
      <div className={styles.chart} ref={chartRef}>
        <svg data-vector-chart viewBox={`0 0 ${chart.width} ${chart.height}`} role="group" aria-label="Equal-scale signed coordinate grid with vectors A and B. Exact components and magnitudes are in the table below.">
          {chart.ticks.map(t => <g key={t.value}><line x1={t.x} x2={t.x} y1={chart.top} y2={chart.bottom} /><line x1={chart.left} x2={chart.left + chart.span} y1={t.y} y2={t.y} /><text x={t.x} y={chart.bottom + 22} textAnchor="middle">{t.value}</text><text x={chart.left - 12} y={t.y + 4} textAnchor="end">{t.value}</text></g>)}
          <line className={styles.axis} x1={chart.left} x2={chart.left + chart.span} y1={chart.origin.y} y2={chart.origin.y} /><line className={styles.axis} x1={chart.origin.x} x2={chart.origin.x} y1={chart.top} y2={chart.bottom} />
          <text x={chart.left + chart.span / 2} y={chart.bottom + 49} textAnchor="middle">X component</text><text transform={`translate(${chart.left - 30},${chart.top + chart.span / 2}) rotate(-90)`} textAnchor="middle">Y component</text>
          {chart.vectors.map(v => <g key={v.id} className={v.id === "A" ? styles.vectorA : styles.vectorB}><path data-vector-shaft={v.id} d={v.d} />{v.head && <polygon data-vector-head={v.id} points={v.head} />}</g>)}
          {chart.groups.map(g => <g data-vector-group={g.ids.join("/")} key={g.ids.join("/")} transform={`translate(${g.x},${g.y})`}>
            {g.labelMoved && <line data-vector-label-guide x1="0" y1="0" x2={g.labelX} y2={g.labelY - 8} className={styles.labelGuide} />}
            {g.ids.includes("B") && <rect x="-6" y="-6" width="12" height="12" className={styles.square} />}{g.ids.includes("A") && <circle r={g.ids.length > 1 ? 3 : 6} className={styles.circle} />}
            <text x={g.labelX} y={g.labelY} textAnchor={g.anchor}>{g.ids.join("/")}</text>
          </g>)}
          <g data-vector-handle={selected} transform={`translate(${tip.tip.x},${tip.tip.y})`} role="button" tabIndex={0}
            aria-label={`Vector ${selected} tip (${x}, ${y}); arrow keys move; Enter edits Selected vector X`} aria-describedby="vector-tip-help" className={styles.handle}
            onClick={() => { if (!drag.current.moved) editorRef.current?.querySelector("input")?.focus(); }}
            onKeyDown={event => {
              const step = event.shiftKey ? 2 : 1;
              const moves: Record<string, [number, number]> = { ArrowRight: [boundVectorCoordinate(x + step), y], ArrowLeft: [boundVectorCoordinate(x - step), y], ArrowUp: [x, boundVectorCoordinate(y + step)], ArrowDown: [x, boundVectorCoordinate(y - step)], Home: [0, 0], End: [5, 5] };
              if (moves[event.key]) { event.preventDefault(); edit(...moves[event.key]); }
              if (event.key === "Enter" || event.key === " ") { event.preventDefault(); editorRef.current?.querySelector("input")?.focus(); }
            }} onPointerDown={event => { event.preventDefault(); event.currentTarget.focus(); event.currentTarget.setPointerCapture(event.pointerId); drag.current = { active: true, moved: false, startX: event.clientX, startY: event.clientY }; }}
            onPointerMove={event => { if (!drag.current.active) return; if (Math.abs(event.clientX - drag.current.startX) + Math.abs(event.clientY - drag.current.startY) > 3) drag.current.moved = true; if (drag.current.moved) movePointer(event); }}
            onPointerUp={event => { if (!drag.current.active) return; if (drag.current.moved) movePointer(event); drag.current.active = false; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
            onPointerCancel={() => { drag.current.active = false; drag.current.moved = true; }}>
            <circle r="20" className={styles.handleFocus} /><circle r="17" fill="transparent" /><path d="M0,-12 L12,0 L0,12 L-12,0 Z" className={styles.diamond} />
          </g>
        </svg>
      </div>
      <p className={styles.legend}><span>● A: solid arrow</span><span>■ B: dashed arrow</span><span>◇ Selected tip</span></p>
      <h3>Vector to edit</h3><LessonToggleGroup label="Vector to edit" choices={[{ id: "A", label: "A" }, { id: "B", label: "B" }]} value={selected} onChange={id => setSelected(id as VectorId)} />
      <p id="vector-tip-help">Select A or B; drag its active handle, or focus it and use arrows (Shift: two units). Up increases Y; Right increases X. Home sets the selected vector to (0,0); End sets (5,5). Enter or click focuses Selected vector X. Selecting a vector alone changes no values.</p>
      <div className={styles.controls}><div ref={editorRef}><LessonRangeControl label="Selected vector X" value={x} min={-5} max={5} step={1} help={`Signed horizontal component of ${selected}, −5..5 in whole units.`} onChange={next => edit(next, y)} /></div>
        <LessonRangeControl label="Selected vector Y" value={y} min={-5} max={5} step={1} help={`Signed vertical component of ${selected}, −5..5 in whole units.`} onChange={next => edit(x, next)} /></div>
      <p role="status" data-vector-status className={styles.formula}>{preset === "custom" ? "Custom pair" : vectorScenarios.find(s => s.id === preset)!.label} · A ({state.ax}, {state.ay}), B ({state.bx}, {state.by}) · Dot {number(a.dot)} · Cosine {number(a.cosine)} · Angle {number(a.angle)}{a.angle !== null && "°"}</p>
      {a.cosine === null && <p role="status" data-vector-zero>At least one vector has magnitude zero and no direction. Dot is still computable, but cosine would divide by zero; geometric cosine and angle are undefined.</p>}
    </section>
    <section className={styles.evidence} aria-label="Vector components, magnitudes and signed products">
      <div className={styles.table} role="region" tabIndex={0} aria-label="Both vector identities and exact numeric construction"><table><caption>Magnitude = sqrt(X² + Y²). Both identities remain separate at coincident tips. Values are computed at full precision and displayed rounded.</caption>
        <thead><tr>{["Vector", "X", "Y", "Squared length", "Magnitude"].map(h => <th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{["A", "B"].map((id, i) => <tr data-vector-row={id} key={id}><th scope="row">{id}</th><td>{i === 0 ? state.ax : state.bx}</td><td>{i === 0 ? state.ay : state.by}</td><td>{a.squared[i]}</td><td>{number(a.norms[i])}</td></tr>)}</tbody>
      </table></div>
      <p data-vector-products className={styles.formula}>Dot = ({state.ax})×({state.bx}) + ({state.ay})×({state.by}) = {number(a.terms[0])} + {number(a.terms[1])} = {number(a.dot)}</p>
      <p data-vector-denominator className={styles.formula}>Length product = sqrt({a.squared[0]} × {a.squared[1]}) = {number(a.denominator)}. {a.cosine === null ? "Zero denominator: cosine and angle undefined." : `Cosine = dot / length product = ${number(a.cosine)}; angle = acos(cosine) = ${number(a.angle)}°.`}</p>
    </section>
    <LessonSummaries label="Dot, nonzero-direction cosine and angle" summaries={[
      { label: "Dot product", color: "#5031dc", value: a.dot.toFixed(0), definition: "Sum of signed coordinate products.", formula: "AxBx + AyBy", comparison: "Combines length and alignment; remains defined at zero." },
      { label: "Cosine similarity", color: "#087c78", value: a.cosine === null ? "Undefined" : a.cosine.toFixed(3), definition: "Alignment ratio for two nonzero vectors.", formula: "dot / (magnitude A × magnitude B)", comparison: "−1 opposite; 0 perpendicular; +1 same direction." },
      { label: "Angle", color: "#ad4508", value: a.angle === null ? "Undefined" : `${a.angle.toFixed(3)}°`, definition: "Angle between two nonzero directions.", formula: "acos(cosine), in degrees", comparison: "Zero vector has no direction or geometric angle." },
    ]} />
    <section className={styles.evidence} aria-label="Embedding connection and geometric limits">
      <h2>From two dimensions to embeddings</h2><p>An embedding is a numeric vector representation of an item. In more dimensions, dot sums all matching component products; magnitude uses all squared components. Cosine uses the same nonzero-length ratio. These editable coordinates illustrate the algebra; they are not learned word embeddings. Whether geometric similarity tracks task meaning depends on the representation and evaluation.</p>
      <details><summary>Construction and limits</summary>
        <p>Each component is an integer from −5 to 5. Both axes have equal numerical weight and equal visual scale. Vector to edit selects one active handle and two native component editors; the other vector stays fixed. Coincident endpoints retain both arrow styles, tip glyphs, an A/B label and separate exact table rows. Zero vectors have no direction arrowhead. Scenario changes restore the named pair and select B. Prediction changes/Reset restore the current step; numeric/preset edits clear stale explanations.</p>
        <p>Dot = AxBx+AyBy, magnitudes sqrt(Ax²+Ay²) and sqrt(Bx²+By²). Cosine is dot/sqrt(aa×bb), where aa/bb are squared magnitudes. A zero squared magnitude makes the geometric ratio and angle undefined. For nonzero vectors, cosine stays in −1..1; only floating error in the ratio is clamped before acos. A positive nonzero scalar changes magnitude and dot by the same factor, preserving cosine. Negative scaling reverses direction and can reverse cosine; zero makes it undefined.</p>
        <p>Cosine zero means perpendicular only when both vectors are nonzero. Cosine one means same direction, not necessarily equal coordinates or lengths; minus one means opposite directions. None is a class probability, semantic truth or accuracy guarantee. SciPy’s linked cosine function computes distance 1−similarity; this lesson displays similarity itself. Library-specific zero conventions do not give a zero vector a geometric direction.</p>
        <p>The toy excludes learned embeddings, model training/inference, arbitrary dimensions, projections, reduction, retrieval evaluation, automatic policy choice and learned feature weights. The same algebra generalizes to larger vectors, while task meaning requires additional evidence.</p>
        <a href="https://numpy.org/doc/stable/reference/generated/numpy.dot.html" target="_blank" rel="noreferrer">NumPy · Dot products</a><br /><a href="https://mathworld.wolfram.com/DotProduct.html" target="_blank" rel="noreferrer">MathWorld · Nonzero vector angle and zero dot</a><br /><a href="https://docs.scipy.org/doc/scipy/reference/generated/scipy.spatial.distance.cosine.html" target="_blank" rel="noreferrer">SciPy · Cosine distance as 1 minus similarity</a>
      </details>
    </section>
  </LearningPage>;
}
